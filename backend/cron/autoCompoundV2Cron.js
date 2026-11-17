
const cron = require('node-cron');

const AutoCompoundV2 = require('../models/AutoCompoundV2');
const AutoCompoundV2Ledger = require('../models/AutoCompoundV2Ledger');

const roundMoney = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getISTDate = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const values = {};

    parts.forEach(part => {
        values[part.type] = part.value;
    });

    return `${values.year}-${values.month}-${values.day}`;
};

// Ledger entry create karo.
// null ka matlab entry nayi insert hui.
// Existing document ka matlab aaj ka day pehle process ho chuka.
const createDailyLedger = async (ledgerData) => {
    try {
        const existing = await AutoCompoundV2Ledger.findOneAndUpdate(
            {
                packageId: ledgerData.packageId,
                stage: ledgerData.stage,
                dayNumber: ledgerData.dayNumber
            },
            {
                $setOnInsert: ledgerData
            },
            {
                upsert: true,
                returnDocument: 'before'
            }
        );

        return existing === null;
    } catch (error) {
        // Duplicate key means another execution already inserted this day.
        if (error.code === 11000) {
            return false;
        }

        throw error;
    }
};

const processAutoCompoundV2 = async () => {
    console.log('AutoCompound V2 simulation cron started');

    try {
        const today = getISTDate();

        const packages = await AutoCompoundV2.find({
            status: { $in: ['active', 'distribution'] }
        }).lean();

        console.log(`AutoCompound V2 eligible packages: ${packages.length}`);

        for (const pkg of packages) {
            try {
                // ==================================
                // STAGE 1: COMPOUNDING
                // ==================================
                if (pkg.status === 'active') {
                    const nextDay = Number(pkg.daysCompleted || 0) + 1;
                    const selectedDays = Number(pkg.selectedDays);

                    if (nextDay > selectedDays) {
                        continue;
                    }

                    const openingBalance = Number(pkg.currentBalance);
                    const dailyRate = Number(pkg.demoDailyRate);

                    if (
                        !Number.isFinite(openingBalance) ||
                        openingBalance <= 0 ||
                        !Number.isFinite(dailyRate) ||
                        dailyRate < 0
                    ) {
                        console.error('Invalid compound values:', pkg._id);
                        continue;
                    }

                    const dailyGrowth = roundMoney(
                        openingBalance * dailyRate
                    );

                    const closingBalance = roundMoney(
                        openingBalance + dailyGrowth
                    );

                    const isNewLedger = await createDailyLedger({
                        packageId: pkg._id,
                        userId: pkg.userId,
                        stage: 'compounding',
                        dayNumber: nextDay,
                        openingBalance,
                        calculatedAmount: dailyGrowth,
                        closingBalance,
                        processingDate: today
                    });

                    if (!isNewLedger) {
                        console.log(
                            `Compounding already processed: ${pkg.userId}, Day ${nextDay}`
                        );
                        continue;
                    }

                    const updateFields = {
                        currentBalance: closingBalance,
                        daysCompleted: nextDay,
                        lastProcessedDate: today
                    };

                    if (nextDay >= selectedDays) {
                        const originalAmount = Number(pkg.packageAmount);

                        const remaining = roundMoney(
                            closingBalance - originalAmount
                        );

                        const distributionDays =
                            Number(pkg.distributionDays) || 25;

                        if (remaining < 0 || distributionDays <= 0) {
                            console.error(
                                'Invalid distribution calculation:',
                                pkg._id
                            );
                            continue;
                        }

                        updateFields.originalAmountSeparated = originalAmount;
                        updateFields.remainingAmount = remaining;
                        updateFields.dailyInstallment = roundMoney(
                            remaining / distributionDays
                        );
                        updateFields.status = 'distribution';
                    }

                    const result = await AutoCompoundV2.updateOne(
                        {
                            _id: pkg._id,
                            status: 'active',
                            daysCompleted: Number(pkg.daysCompleted || 0)
                        },
                        {
                            $set: updateFields
                        }
                    );

                    if (result.modifiedCount !== 1) {
                        console.error(
                            'Compounding package update failed:',
                            pkg._id
                        );
                        continue;
                    }

                    console.log(
                        `COMPOUND SUCCESS | User: ${pkg.userId} | Day: ${nextDay} | Growth: ${dailyGrowth} | Balance: ${closingBalance}`
                    );

                    continue;
                }

                // ==================================
                // STAGE 2: DISTRIBUTION
                // ==================================
                if (pkg.status === 'distribution') {
                    const nextDay =
                        Number(pkg.distributionDaysCompleted || 0) + 1;

                    const distributionDays =
                        Number(pkg.distributionDays) || 25;

                    if (nextDay > distributionDays) {
                        continue;
                    }

                    const remaining = Number(pkg.remainingAmount);
                    const dailyInstallment = Number(pkg.dailyInstallment);

                    if (
                        !Number.isFinite(remaining) ||
                        remaining < 0 ||
                        !Number.isFinite(dailyInstallment) ||
                        dailyInstallment < 0
                    ) {
                        console.error('Invalid distribution values:', pkg._id);
                        continue;
                    }

                    const installment =
                        nextDay === distributionDays
                            ? roundMoney(
                                remaining -
                                (dailyInstallment * (distributionDays - 1))
                            )
                            : dailyInstallment;

                    const openingBalance = roundMoney(
                        remaining - (dailyInstallment * (nextDay - 1))
                    );

                    const closingBalance = roundMoney(
                        openingBalance - installment
                    );

                    if (installment < 0 || closingBalance < -0.01) {
                        console.error(
                            'Invalid distribution installment:',
                            pkg._id
                        );
                        continue;
                    }

                    const isNewLedger = await createDailyLedger({
                        packageId: pkg._id,
                        userId: pkg.userId,
                        stage: 'distribution',
                        dayNumber: nextDay,
                        openingBalance,
                        calculatedAmount: installment,
                        closingBalance: Math.max(0, closingBalance),
                        processingDate: today
                    });

                    if (!isNewLedger) {
                        console.log(
                            `Distribution already processed: ${pkg.userId}, Day ${nextDay}`
                        );
                        continue;
                    }

                    const updateFields = {
                        distributionDaysCompleted: nextDay,
                        lastProcessedDate: today
                    };

                    if (nextDay >= distributionDays) {
                        updateFields.status = 'completed';
                        updateFields.remainingAmount = 0;
                    } else {
                        updateFields.remainingAmount = closingBalance;
                    }

                    const result = await AutoCompoundV2.updateOne(
                        {
                            _id: pkg._id,
                            status: 'distribution',
                            distributionDaysCompleted:
                                Number(pkg.distributionDaysCompleted || 0)
                        },
                        {
                            $set: updateFields
                        }
                    );

                    if (result.modifiedCount !== 1) {
                        console.error(
                            'Distribution package update failed:',
                            pkg._id
                        );
                        continue;
                    }

                    console.log(
                        `DISTRIBUTION SUCCESS | User: ${pkg.userId} | Day: ${nextDay} | Amount: ${installment}`
                    );
                }

            } catch (packageError) {
                console.error(
                    'AutoCompound V2 package error:',
                    pkg._id,
                    packageError
                );
            }
        }

        console.log('AutoCompound V2 simulation cron finished');

    } catch (error) {
        console.error('AutoCompound V2 cron fatal error:', error);
    }
};

// ==========================================
// CRON SCHEDULE
// ==========================================
if (
    process.env.NODE_APP_INSTANCE === '0' ||
    process.env.NODE_APP_INSTANCE === undefined
) {
    console.log('AutoCompound V2 cron registered: Daily at 11:23 AM IST');

    cron.schedule('11 21 * * *', processAutoCompoundV2, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
    });
}

module.exports = { processAutoCompoundV2 };
