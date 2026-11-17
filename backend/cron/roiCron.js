const cron = require('node-cron');
const User = require('../models/User');
const PackageActivation = require('../models/PackageActivation');
const Transaction = require('../models/Transaction');

// Only primary PM2 instance runs this cron
if (
    process.env.NODE_APP_INSTANCE === '0' ||
    process.env.NODE_APP_INSTANCE === undefined
) {

    // Runs daily at 12:30 AM IST
    cron.schedule('10 21 * * *', async () => {

        console.log('Running Daily ROI Cron Job for Global Wealth...');

        try {

            // 1. FIND ACTIVE PACKAGES WITH LESS THAN 45 PAYOUTS
            const activePackages = await PackageActivation.find({
                status: 'active',
                daysCompleted: { $lt: 45 }
            }).lean();

            // 2. INDIA TIME - START OF TODAY
            const istDateString = new Date().toLocaleString(
                "en-US",
                { timeZone: "Asia/Kolkata" }
            );

            const startOfToday = new Date(istDateString);
            startOfToday.setHours(0, 0, 0, 0);

            const chunkSize = 50;

            // 3. PROCESS PACKAGES IN CHUNKS
            for (
                let i = 0;
                i < activePackages.length;
                i += chunkSize
            ) {

                const chunk = activePackages.slice(
                    i,
                    i + chunkSize
                );

                await Promise.all(
                    chunk.map(async (pkg) => {

                        try {

                            // 4. PACKAGE DURATION
                            const totalDays = Number(pkg.totalDays) || 45;
                            const newDays = Number(pkg.daysCompleted || 0) + 1;

                            // 5. STOP IF PACKAGE HAS COMPLETED 45 DAYS
                            if (newDays > 45 || newDays > totalDays) {
                                await PackageActivation.updateOne(
                                    { _id: pkg._id },
                                    { $set: { status: 'completed' } }
                                );
                                return;
                            }

                            // 6. DOUBLE PAYOUT PREVENTION
                            const payoutDescription =
                                `Daily ROI (${newDays}/45) for $${pkg.packageAmount} Package`;

                            const alreadyPaid = await Transaction.findOne({
                                userId: pkg.userId,
                                type: 'daily_roi',
                                description: payoutDescription,
                                date: { $gte: startOfToday }
                            }).lean();

                            if (alreadyPaid) {
                                return;
                            }

                            // 7. FIND PACKAGE OWNER
                            const user = await User.findOne({
                                userId: pkg.userId
                            }).lean();

                            if (!user) {
                                console.log(
                                    `User not found for package ${pkg._id}`
                                );
                                return;
                            }

                            // 8. DAILY ROI - VALUE SAVED DURING ACTIVATION
                            const roiAmount = Number(pkg.dailyRoi);

                            if (
                                !Number.isFinite(roiAmount) ||
                                roiAmount <= 0
                            ) {
                                console.log(
                                    `Invalid daily ROI for package ${pkg._id}`
                                );
                                return;
                            }

                            // 9. CREDIT ROI TO USER
                            await User.updateOne(
                                { _id: user._id },
                                {
                                    $inc: {
                                        roiIncome: roiAmount,
                                        totalRoiIncome: roiAmount
                                    }
                                }
                            );

                            // 10. UPDATE PACKAGE DAYS
                            const pkgUpdate = {
                                $inc: { daysCompleted: 1 }
                            };

                            if (newDays >= totalDays || newDays >= 45) {
                                pkgUpdate.$set = {
                                    status: 'completed'
                                };
                            }

                            await PackageActivation.updateOne(
                                {
                                    _id: pkg._id,
                                    status: 'active',
                                    daysCompleted: pkg.daysCompleted
                                },
                                pkgUpdate
                            );

                            // 11. ROI TRANSACTION HISTORY
                            await Transaction.create({
                                userId: user.userId,
                                type: "daily_roi",
                                source: "roi",
                                amount: roiAmount,
                                description: payoutDescription,
                                status: "success",
                                date: new Date()
                            });

                            // ==========================================
                            // 12. DAILY LEVEL INCOME ENGINE
                            // ==========================================

                            const LEVEL_PERCENTAGES = [
                                1,
                                1,
                                1,
                                1,
                                1,
                                1,
                                1,
                                1,
                                1,
                                1,
                                1,
                                1
                            ];

                            let currentUplineId = user.sponsorId;
                            let currentLevel = 1;

                            while (
                                currentUplineId &&
                                currentLevel <= 12
                            ) {

                                // FIND UPLINE
                                const upline = await User.findOne({
                                    userId: currentUplineId
                                }).lean();

                                if (!upline) {
                                    break;
                                }

                                const directsCount =
                                    Number(upline.directCount) || 0;

                                // 13. UPLINE ACTIVE PACKAGE CHECK
                                const isActiveUpline =
                                    await PackageActivation.exists({
                                        userId: upline.userId,
                                        status: 'active',
                                        endDate: { $gt: new Date() },
                                        daysCompleted: { $lt: 45 },
                                        packageAmount: { $gte: 2 }
                                    });

                                // 14. DIRECT COUNT CONDITION
                                if (
                                    !isActiveUpline ||
                                    directsCount < currentLevel
                                ) {

                                    console.log(
                                        `[FLUSHED] Level ${currentLevel} income stopped for ${upline.userId}.`
                                    );

                                } else {

                                    // 15. CALCULATE LEVEL ROI BONUS
                                    const percentage =
                                        LEVEL_PERCENTAGES[currentLevel - 1];

                                    const dailyLevelBonus =
                                        (roiAmount * percentage) / 100;

                                    if (dailyLevelBonus > 0) {

                                        // 16. CREDIT LEVEL ROI INCOME
                                        await User.updateOne(
                                            { _id: upline._id },
                                            {
                                                $inc: {
                                                    levelRoiIncome: dailyLevelBonus,
                                                    totalLevelRoiIncome: dailyLevelBonus
                                                }
                                            }
                                        );

                                        // 17. LEVEL TRANSACTION
                                        await Transaction.create({
                                            userId: upline.userId,
                                            type: "daily_level_income",
                                            source: "level",
                                            amount: dailyLevelBonus,
                                            fromUserId: user.userId,
                                            description:
                                                `Daily Level Income (${percentage}%) from ${user.userId}'s ROI (Level ${currentLevel})`,
                                            status: "success",
                                            date: new Date()
                                        });
                                    }
                                }

                                // 18. MOVE TO NEXT UPLINE
                                currentUplineId = upline.sponsorId;
                                currentLevel++;
                            }

                        } catch (pkgError) {

                            console.error(
                                `Error processing ROI/Level for package ${pkg._id}:`,
                                pkgError
                            );
                        }
                    })
                );
            }

            console.log(
                'Daily ROI & Level Income Cron Job Finished!'
            );

        } catch (error) {

            console.error(
                'Cron Job Fatal Error:',
                error
            );
        }

    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}