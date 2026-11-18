
const User = require('../models/User');
const PackageActivation = require('../models/PackageActivation');
const Transaction = require('../models/Transaction');
const AutoCompoundV2 = require('../models/AutoCompoundV2');

exports.activatePackage = async (req, res) => {
    try {
        const { userId, memberId, packageAmount, txnPassword } = req.body;
        const amount = Number(packageAmount);

        // STRICT PACKAGE ARRAY VALIDATION
        const VALID_PACKAGES = [2, 5, 10, 20, 50, 100, 200, 500, 1000];

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Package Amount.'
            });
        }

        // BLOCK CUSTOM OR FAKE PACKAGE AMOUNTS
        if (!VALID_PACKAGES.includes(amount)) {
            console.warn(
                `SECURITY ALERT: User ${userId} tried to activate fake package of $${amount}`
            );

            return res.status(403).json({
                success: false,
                message: 'Security System: Custom or Fake Package Amounts are blocked!'
            });
        }

        // 1. CURRENT USER (PACKAGE BUYER)
        const currentUser = await User.findOne({
            userId: String(userId)
        });

        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "Current user not found"
            });
        }

        // 2. TARGET MEMBER
        const targetUser = await User.findOne({
            userId: String(memberId)
        });

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Member ID not found"
            });
        }

        // 3. TRANSACTION PASSWORD VERIFY
        if (!txnPassword) {
            return res.status(400).json({
                success: false,
                message: "Transaction password is required"
            });
        }

        if (
            !currentUser.transactionPassword ||
            String(txnPassword).toLowerCase() !==
            String(currentUser.transactionPassword).toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid Transaction Password!"
            });
        }

        // 4. FUND WALLET CHECK
        if ((currentUser.walletBalance || 0) < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient Fund Amount ($)!"
            });
        }

        // 5. BALANCE DEDUCTION
        currentUser.walletBalance -= amount;
        await currentUser.save();

        // 6. PACKAGE: 3% DAILY ROI FOR 45 DAYS
        const activeDays = 45;

        const startDate = new Date();
        const endDate = new Date();

        endDate.setDate(startDate.getDate() + activeDays);

        const dailyRoi = amount * 0.03;

        const newPackage = await PackageActivation.create({
            userId: targetUser.userId,
            memberId: targetUser.userId,
            purchasedBy: currentUser.userId,
            packageAmount: amount,
            dailyRoi: dailyRoi,
            totalDays: activeDays,
            daysCompleted: 0,
            startDate: startDate,
            endDate: endDate,
            status: 'active'
        });

        // 7. TARGET USER UPDATE
        const isFirstTopup = !targetUser.isToppedUp;

        if (!targetUser.packages) {
            targetUser.packages = [];
        }

        targetUser.packages.push({
            plan: "Investment Package",
            amount: amount,
            startDate: new Date(),
            withdrawn: 0
        });

        targetUser.topUpAmount = Math.max(
            targetUser.topUpAmount || 0,
            amount
        );

        targetUser.updatedAt = new Date();

        if (isFirstTopup) {
            targetUser.isToppedUp = true;
            targetUser.topUpDate = new Date();
        }

        await targetUser.save();

        // TRANSACTION HELPER
        const createTransaction = async (data) => {
            return Transaction.create({
                ...data,
                date: new Date()
            });
        };

        // PACKAGE ACTIVATION TRANSACTION
        await createTransaction({
            userId: currentUser.userId,
            type: "package_activation",
            amount: amount,
            fromUserId: currentUser.userId,
            toUserId: targetUser.userId,
            description: `Activated $${amount} Package for ${targetUser.userId}`,
            status: 'success'
        });

        // SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            message: `Package of $${amount} activated successfully for ${targetUser.userId}!`,
            data: newPackage
        });

        // ==========================================
        // BACKGROUND MLM ENGINE - 45 DAYS
        // ==========================================

        (async () => {
            try {

                // ==========================================
                // CHECK ACTIVE PACKAGE
                // NORMAL PACKAGE + AUTO COMPOUND V2
                // ==========================================

                const checkIsActive = async (checkUserId) => {

                    const userIdToCheck = String(checkUserId);

                    // NORMAL PACKAGE CHECK
                    const hasNormalActive = await PackageActivation.exists({
                        userId: userIdToCheck,
                        endDate: { $gt: new Date() },
                        packageAmount: { $gte: 2 },
                        status: 'active'
                    });

                    // NEW AUTO COMPOUND V2 PACKAGE CHECK
                    // Active and distribution stages are eligible.
                    const hasCompoundV2Active = await AutoCompoundV2.exists({
                        userId: userIdToCheck,
                        packageAmount: { $gte: 2 },
                        status: { $in: ['active', 'distribution'] }
                    });

                    return Boolean(hasNormalActive || hasCompoundV2Active);
                };

                // ==========================================
                // DIRECT INCOME - 10%
                // ==========================================

                if (targetUser.sponsorId) {

                    const sponsor = await User.findOne({
                        userId: targetUser.sponsorId
                    });

                    if (sponsor) {

                        const isActiveSponsor = await checkIsActive(
                            sponsor.userId
                        );

                        if (isActiveSponsor) {

                            // CHECK WHETHER THIS MEMBER WAS
                            // ALREADY COUNTED FOR THIS SPONSOR

                            const alreadyCountedDirect =
                                await Transaction.exists({
                                    userId: sponsor.userId,
                                    type: "direct_income",
                                    fromUserId: targetUser.userId
                                });

                            // INCREASE DIRECT COUNT ONLY ONCE
                            if (!alreadyCountedDirect) {
                                sponsor.directCount =
                                    (sponsor.directCount || 0) + 1;
                            }

                            // DIRECT BONUS ON EVERY ELIGIBLE PACKAGE
                            const DIRECT_PERCENT = 10;

                            const directBonusAmount =
                                (amount * DIRECT_PERCENT) / 100;

                            sponsor.directIncome =
                                (sponsor.directIncome || 0) +
                                directBonusAmount;

                            sponsor.totalDirectIncome =
                                (sponsor.totalDirectIncome || 0) +
                                directBonusAmount;

                            await createTransaction({
                                userId: sponsor.userId,
                                type: "direct_income",
                                source: "direct",
                                amount: directBonusAmount,
                                package: amount,
                                fromUserId: targetUser.userId,
                                description: `Direct Bonus (10%) from ${targetUser.userId}'s Package`,
                                status: 'success'
                            });

                            await sponsor.save();

                        } else {

                            console.log(
                                `[FLUSHED] Direct Income stopped for Sponsor ${sponsor.userId}. Reason: No active package.`
                            );
                        }
                    }
                }

                // ==========================================
                // LEVEL INCOME - LEVEL 2 TO 12
                // ==========================================

                const LEVEL_PERCENTAGES = [
                    0,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25,
                    0.25
                ];

                let currentUplineId = targetUser.sponsorId;
                let currentLevel = 1;

                while (currentUplineId && currentLevel <= 12) {

                    const upline = await User.findOne({
                        userId: currentUplineId
                    }).select(
                        'userId isToppedUp topUpAmount sponsorId _id'
                    );

                    if (!upline) break;

                    const isActiveUpline = await checkIsActive(
                        upline.userId
                    );

                    // INACTIVE UPLINE BLOCKER
                    if (!isActiveUpline) {

                        console.log(
                            `[FLUSHED] Level Income stopped for Upline ${upline.userId} at Level ${currentLevel}. Reason: No active package.`
                        );

                        currentUplineId = upline.sponsorId;
                        currentLevel++;

                        continue;
                    }

                    // LEVEL 2 TO 12 INCOME
                    if (currentLevel >= 2 && currentLevel <= 12) {

                        const percentage =
                            LEVEL_PERCENTAGES[currentLevel - 1];

                        const levelAmount =
                            (amount * percentage) / 100;

                        if (levelAmount > 0) {

                            await User.updateOne(
                                { _id: upline._id },
                                {
                                    $inc: {
                                        levelIncome: levelAmount,
                                        totalLevelIncome: levelAmount
                                    }
                                }
                            );

                            await createTransaction({
                                userId: upline.userId,
                                type: "level_income",
                                source: "level",
                                amount: levelAmount,
                                package: amount,
                                fromUserId: targetUser.userId,
                                description: `Level ${currentLevel} Income (${percentage}%) from Package`,
                                status: 'success'
                            });
                        }
                    }

                    currentUplineId = upline.sponsorId;
                    currentLevel++;
                }


                // ==========================================
// LEADER INCOME - 5%
// NEAREST ACTIVE-PACKAGE LEADER
// ==========================================

let leaderUplineId = targetUser.sponsorId;

while (leaderUplineId) {

    const leader = await User.findOne({
        userId: String(leaderUplineId)
    }).select('userId sponsorId role');

    if (!leader) break;

    // Check only users having Leader role
    if (leader.role === 'leader') {

        // Leader must have an active package
        const isActiveLeader = await checkIsActive(
            leader.userId
        );

        if (isActiveLeader) {

            const LEADER_PERCENT = 5;

            const leaderIncome = Number(
                ((amount * LEADER_PERCENT) / 100).toFixed(2)
            );

            if (leaderIncome > 0) {

                // Credit directly to Leader wallet
                await User.updateOne(
                    { userId: leader.userId },
                    {
                        $inc: {
                            walletBalance: leaderIncome
                        }
                    }
                );

                // Create income transaction
                await createTransaction({
                    userId: leader.userId,
                    type: 'leader_income',
                    source: 'leader',
                    amount: leaderIncome,
                    package: amount,
                    fromUserId: targetUser.userId,
                    description:
                        `Leader Income (5%) from ${targetUser.userId}'s Normal Package`,
                    status: 'success'
                });

                console.log(
                    `[LEADER INCOME] $${leaderIncome} credited to ${leader.userId}`
                );
            }

            // Stop after first eligible Leader
            break;
        }
    }

    // If not Leader or inactive Leader, check next upline
    leaderUplineId = leader.sponsorId;
}


            } catch (bgError) {

                console.error(
                    "Background MLM Engine Error (Package Activation):",
                    bgError
                );
            }
        })();

    } catch (error) {

        console.error("Package Activation Error:", error);

        res.status(500).json({
            success: false,
            message: "Server Error during activation"
        });
    }
};


// ==========================================
// GET USER PACKAGES
// ==========================================

exports.getUserPackages = async (req, res) => {
    try {
        const { userId } = req.params;

        const packages = await PackageActivation.find({
            userId: String(userId)
        }).sort({ startDate: -1 });

        res.status(200).json({
            success: true,
            data: packages
        });

    } catch (error) {
        console.error("Error fetching user packages:", error);

        res.status(500).json({
            success: false,
            message: "Server Error while fetching packages"
        });
    }
};
