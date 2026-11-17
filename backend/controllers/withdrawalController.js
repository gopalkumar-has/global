const mongoose = require('mongoose');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const PackageActivation = require('../models/PackageActivation');
const AutoCompoundV2 = require('../models/AutoCompoundV2');

// ==========================================
// CONFIGURATION
// ==========================================
const MIN_WITHDRAWAL = 2;
const WITHDRAWAL_FEE_PERCENT = 10;

const WITHDRAWAL_START_HOUR = 9;
const WITHDRAWAL_END_HOUR = 12;

const roundMoney = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 10000) / 10000;

const getISTParts = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(new Date());

    const result = {};

    for (const part of parts) {
        result[part.type] = part.value;
    }

    return result;
};

const getISTStartOfToday = () => {
    const parts = getISTParts();

    return new Date(
        `${parts.year}-${parts.month}-${parts.day}T00:00:00+05:30`
    );
};

const isWithdrawalTimeAllowed = () => {
    const parts = getISTParts();
    const hour = Number(parts.hour);

    return (
        hour >= WITHDRAWAL_START_HOUR &&
        hour < WITHDRAWAL_END_HOUR
    );
};

// ==========================================
// ACTIVE PACKAGE CHECK
// NORMAL PACKAGE + AUTO COMPOUND V2
// ==========================================
const getActivePackageInfo = async (userId) => {
    const now = new Date();
    const normalizedUserId = String(userId);

    const [normalPackages, compoundPackages] = await Promise.all([
        PackageActivation.find({
            userId: normalizedUserId,
            endDate: { $gt: now },
            packageAmount: { $gte: 2 },
            status: 'active'
        })
            .select('packageAmount status endDate')
            .lean(),

        AutoCompoundV2.find({
            userId: normalizedUserId,
            packageAmount: { $gte: 2 },
            status: { $in: ['active', 'distribution'] }
        })
            .select('packageAmount status endDate')
            .lean()
    ]);

    const allPackages = [
        ...normalPackages,
        ...compoundPackages
    ];

    const validAmounts = allPackages
        .map((pkg) => Number(pkg.packageAmount))
        .filter((amount) => Number.isFinite(amount) && amount >= 2);

    return {
        hasActivePackage: validAmounts.length > 0,
        highestActivePackageAmount:
            validAmounts.length > 0
                ? Math.max(...validAmounts)
                : 0,
        totalActivePackages: validAmounts.length
    };
};

// ==========================================
// VALIDATE INCOME DETAILS
// ==========================================
const getIncomeDetails = (details) => {
    const direct = Number(details?.direct ?? 0);
    const level = Number(details?.level ?? 0);
    const levelRoi = Number(details?.levelRoi ?? 0);
    const roi = Number(details?.roi ?? 0);

    if (
        !Number.isFinite(direct) ||
        !Number.isFinite(level) ||
        !Number.isFinite(levelRoi) ||
        !Number.isFinite(roi)
    ) {
        return {
            valid: false,
            message: 'Invalid income amount.'
        };
    }

    if (direct < 0 || level < 0 || levelRoi < 0 || roi < 0) {
        return {
            valid: false,
            message: 'Negative amounts are not allowed.'
        };
    }

    return {
        valid: true,
        direct: roundMoney(direct),
        level: roundMoney(level),
        levelRoi: roundMoney(levelRoi),
        roi: roundMoney(roi),
        total: roundMoney(direct + level + levelRoi + roi)
    };
};

// ==========================================
// ATOMIC INCOME DEDUCTION
// ==========================================
const deductIncomeBalances = async (userId, income) => {
    return User.findOneAndUpdate(
        {
            userId: String(userId),
            directIncome: { $gte: income.direct },
            levelIncome: { $gte: income.level },
            levelRoiIncome: { $gte: income.levelRoi },
            roiIncome: { $gte: income.roi }
        },
        {
            $inc: {
                directIncome: -income.direct,
                levelIncome: -income.level,
                levelRoiIncome: -income.levelRoi,
                roiIncome: -income.roi
            }
        },
        {
            new: true,
            runValidators: true
        }
    );
};

// ==========================================
// REFUND INCOME IF RECORD CREATION FAILS
// ==========================================
const refundIncomeBalances = async (userId, income) => {
    await User.updateOne(
        { userId: String(userId) },
        {
            $inc: {
                directIncome: income.direct,
                levelIncome: income.level,
                levelRoiIncome: income.levelRoi,
                roiIncome: income.roi
            }
        }
    );
};

// ==========================================
// WITHDRAW FUNDS
// ==========================================
exports.withdrawFunds = async (req, res) => {
    let userId = null;
    let deductedIncome = null;
    let withdrawalRecordsCreated = false;

    try {
        userId = String(req.user?.userId || '').trim();

        const {
            amount,
            transactionPassword,
            details
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const reqAmount = Number(amount);

        if (
            !Number.isFinite(reqAmount) ||
            reqAmount < MIN_WITHDRAWAL
        ) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal is $2.'
            });
        }

        if (!isWithdrawalTimeAllowed()) {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal time is only between 09:00 AM and 12:00 PM IST.'
            });
        }

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const packageInfo = await getActivePackageInfo(userId);

        if (!packageInfo.hasActivePackage) {
            return res.status(400).json({
                success: false,
                message: 'You do not have any active package. Please activate a package to withdraw.'
            });
        }

        if (reqAmount > packageInfo.highestActivePackageAmount) {
            return res.status(400).json({
                success: false,
                message:
                    `Withdrawal limit exceeded! Your highest active package is $${packageInfo.highestActivePackageAmount}.`
            });
        }

        if (
            !user.walletAddress ||
            !String(user.walletAddress).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please update your USDT BEP20 wallet address in your profile.'
            });
        }

        if (
            typeof transactionPassword !== 'string' ||
            !transactionPassword.trim() ||
            !user.transactionPassword ||
            transactionPassword.toLowerCase() !==
                String(user.transactionPassword).toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Transaction Password.'
            });
        }

        const income = getIncomeDetails(details);

        if (!income.valid) {
            return res.status(400).json({
                success: false,
                message: income.message
            });
        }

        if (Math.abs(income.total - reqAmount) > 0.00005) {
            return res.status(400).json({
                success: false,
                message: 'Amount distribution mismatch.'
            });
        }

        if (
            income.direct > Number(user.directIncome || 0) ||
            income.level > Number(user.levelIncome || 0) ||
            income.levelRoi > Number(user.levelRoiIncome || 0) ||
            income.roi > Number(user.roiIncome || 0)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance in one or more income wallets.'
            });
        }

        const startOfToday = getISTStartOfToday();

        const alreadyWithdrawn = await Transaction.exists({
            userId,
            type: 'withdrawal',
            date: { $gte: startOfToday }
        });

        if (alreadyWithdrawn) {
            return res.status(400).json({
                success: false,
                message: 'You can apply for withdrawal only once a day.'
            });
        }

        const updatedUser = await deductIncomeBalances(
            userId,
            income
        );

        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                message: 'Income balance changed or is insufficient. Please refresh and try again.'
            });
        }

        deductedIncome = income;

        const feeAmount = roundMoney(
    (reqAmount * WITHDRAWAL_FEE_PERCENT) / 100
);
const netAmount = roundMoney(reqAmount - feeAmount);

        const expectedCreditDate = new Date();
        expectedCreditDate.setDate(
            expectedCreditDate.getDate()
        );

        const formattedCreditDate =
            expectedCreditDate.toLocaleDateString('en-GB', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

        await Transaction.create({
            userId,
            type: 'withdrawal',
            amount: reqAmount,
            status: 'pending',
            description:
                `Withdrawal Req: Direct $${income.direct}, Level $${income.level}, Level ROI $${income.levelRoi}, ROI $${income.roi}. Expected Credit: ${formattedCreditDate}`,
            date: new Date()
        });

        const sources = [];

        if (income.direct > 0) sources.push('Direct');
        if (income.level > 0) sources.push('Level');
        if (income.levelRoi > 0) sources.push('Level ROI');
        if (income.roi > 0) sources.push('ROI');

        await Withdrawal.create({
            userId,
            name: user.name || user.username || '-',
            source: sources.join(', '),
            grossAmount: reqAmount,
            fee: feeAmount,
            netAmount: reqAmount,
            incomeUsed: reqAmount,
            walletAddress: user.walletAddress,
            status: 'pending'
        });

        withdrawalRecordsCreated = true;

        return res.status(200).json({
            success: true,
            message:
                `Withdrawal of $${reqAmount} successful.`,
            data: {
                amount: reqAmount,
                feePercent: WITHDRAWAL_FEE_PERCENT,
                fee: feeAmount,
                netAmount: netAmount,
                direct: income.direct,
                level: income.level,
                levelRoi: income.levelRoi,
                roi: income.roi,
                expectedCreditDate: formattedCreditDate
            }
        });

    } catch (error) {
        console.error('Withdrawal Error:', error);

        if (userId && deductedIncome && !withdrawalRecordsCreated) {
            try {
                await refundIncomeBalances(userId, deductedIncome);
            } catch (refundError) {
                console.error(
                    'CRITICAL: Withdrawal balance refund failed:',
                    refundError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Server error during withdrawal.'
        });
    }
};

// ==========================================
// CREDIT TO FUND WALLET
// Direct + Level + Level ROI + ROI -> walletBalance
// ==========================================
exports.creditToWallet = async (req, res) => {
    let userId = null;
    let deductedIncome = null;
    let walletCredited = false;

    try {
        userId = String(req.user?.userId || '').trim();

        const {
            amount,
            transactionPassword,
            details
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const reqAmount = Number(amount);

        if (
            !Number.isFinite(reqAmount) ||
            reqAmount < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'Minimum credit amount is $1.'
            });
        }

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const packageInfo = await getActivePackageInfo(userId);

        if (!packageInfo.hasActivePackage) {
            return res.status(400).json({
                success: false,
                message: 'An active package is required to use this feature.'
            });
        }

        if (
            typeof transactionPassword !== 'string' ||
            !transactionPassword.trim() ||
            !user.transactionPassword ||
            transactionPassword.toLowerCase() !==
                String(user.transactionPassword).toLowerCase()
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Transaction Password.'
            });
        }

        const income = getIncomeDetails(details);

        if (!income.valid) {
            return res.status(400).json({
                success: false,
                message: income.message
            });
        }

        if (Math.abs(income.total - reqAmount) > 0.00005) {
            return res.status(400).json({
                success: false,
                message: 'Amount distribution mismatch.'
            });
        }

        if (
            income.direct > Number(user.directIncome || 0) ||
            income.level > Number(user.levelIncome || 0) ||
            income.levelRoi > Number(user.levelRoiIncome || 0) ||
            income.roi > Number(user.roiIncome || 0)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance in one or more income wallets.'
            });
        }

        const updatedUser = await deductIncomeBalances(
            userId,
            income
        );

        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                message: 'Income balance changed or is insufficient. Please refresh and try again.'
            });
        }

        deductedIncome = income;

        const creditedUser = await User.findOneAndUpdate(
            {
                userId,
                _id: updatedUser._id
            },
            {
                $inc: {
                    walletBalance: reqAmount
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!creditedUser) {
            throw new Error('Unable to credit fund wallet.');
        }

        walletCredited = true;

        await Transaction.create({
            userId,
            type: 'credit_to_wallet',
            amount: reqAmount,
            status: 'approved',
            description:
                `Fund Transfer: Direct $${income.direct}, Level $${income.level}, Level ROI $${income.levelRoi}, ROI $${income.roi}`,
            date: new Date()
        });

        return res.status(200).json({
            success: true,
            message: `$${reqAmount} credited to your fund wallet successfully.`,
            data: {
                amount: reqAmount,
                direct: income.direct,
                level: income.level,
                levelRoi: income.levelRoi,
                roi: income.roi,
                walletBalance: Number(creditedUser.walletBalance || 0),
                directIncome: Number(creditedUser.directIncome || 0),
                levelIncome: Number(creditedUser.levelIncome || 0),
                levelRoiIncome: Number(creditedUser.levelRoiIncome || 0),
                roiIncome: Number(creditedUser.roiIncome || 0)
            }
        });

    } catch (error) {
        console.error('Credit To Wallet Error:', error);

        if (userId && deductedIncome) {
            try {
                if (walletCredited) {
                    await User.updateOne(
                        { userId },
                        {
                            $inc: {
                                walletBalance: -deductedIncome.total
                            }
                        }
                    );
                }

                await refundIncomeBalances(userId, deductedIncome);

            } catch (refundError) {
                console.error(
                    'CRITICAL: Credit-to-wallet rollback failed:',
                    refundError
                );
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Server error during fund transfer.'
        });
    }
};

 

// ==========================================
// GET WALLET INFO
// ==========================================
exports.getWalletInfo = async (req, res) => {
    try {
        const userId = String(req.user?.userId || '');

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const user = await User.findOne({ userId }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const directIncome = Number(user.directIncome || 0);
        const levelIncome = Number(user.levelIncome || 0);
        const roiIncome = Number(user.roiIncome || 0);
        const levelRoiIncome = Number(user.levelRoiIncome || 0);

        const availableBalance = roundMoney(
            directIncome + levelIncome + levelRoiIncome + roiIncome
        );

        const totalIncome = roundMoney(
            directIncome + levelIncome + roiIncome + levelRoiIncome
        );

        return res.status(200).json({
            success: true,
            directIncome,
            levelIncome,
            roiIncome,
            levelRoiIncome,
            totalIncome,
            availableBalance,
            totalWithdrawn: Number(
                user.totalWithdrawn ?? user.totalWithdrawal ?? 0
            ),
            walletBalance: Number(user.walletBalance || 0),
            walletAddress: user.walletAddress || null
        });

    } catch (error) {
        console.error('Wallet Info Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching wallet info.'
        });
    }
};

// ==========================================
// GET WALLET HISTORY
// ==========================================
exports.getWalletHistory = async (req, res) => {
    try {
        const authenticatedUserId = String(
            req.user?.userId || ''
        );

        const requestedUserId = String(
            req.params.userId || authenticatedUserId
        );

        if (!authenticatedUserId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (
            requestedUserId !== authenticatedUserId &&
            req.user?.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to view this wallet history.'
            });
        }

        const transactions = await Transaction.find({
            userId: requestedUserId
        }).sort({ date: -1 });

        return res.status(200).json({
            success: true,
            data: transactions
        });

    } catch (error) {
        console.error('Wallet History Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch wallet history.'
        });
    }
};