const AutoCompoundV2 = require('../models/AutoCompoundV2');
const AutoCompoundV2Ledger = require('../models/AutoCompoundV2Ledger');
const AutoCompoundV2Commission = require('../models/AutoCompoundV2Commission');
const User = require('../models/User');
const PackageActivation = require('../models/PackageActivation');

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const VALID_PACKAGES = [2, 5, 10, 20, 50, 100, 200, 500, 1000];

const LEVEL_PERCENTAGES = {
  2: 0.25,
  3: 0.25,
  4: 0.25,
  5: 0.25,
  6: 0.25,
  7: 0.25,
  8: 0.25,
  9: 0.25,
  10: 0.25,
  11: 0.25,
  12: 0.25
};

// ======================================
// CHECK ACTIVE PACKAGE
// ======================================
const checkIsActive = async (userId) => {
  const now = new Date();

  const normalPackage = await PackageActivation.exists({
    userId,
    endDate: { $gt: now },
    packageAmount: { $gte: 2 },
    status: 'active'
  });

  const compoundPackage = await AutoCompoundV2.exists({
    userId,
    endDate: { $gt: now },
    packageAmount: { $gte: 2 },
    status: 'active'
  });

  return Boolean(normalPackage || compoundPackage);
};

// ======================================
// CREATE COMMISSION RECORD
// ======================================
const createCommission = async ({
  packageId,
  userId,
  fromUserId,
  type,
  level,
  percentage,
  packageAmount
}) => {
  const amount = roundMoney(
    (packageAmount * percentage) / 100
  );

  if (amount <= 0) return null;

  try {
    return await AutoCompoundV2Commission.create({
      packageId,
      userId,
      fromUserId,
      type,
      level,
      percentage,
      packageAmount,
      amount,
      status: 'pending'
    });
  } catch (error) {
    if (error.code === 11000) {
      return null;
    }
    throw error;
  }
};

// ======================================
// DIRECT + LEVEL COMMISSION CALCULATION
// ======================================
const calculateReferralCommissions = async (packageData, targetUser) => {
  const amount = Number(packageData.packageAmount);

  // DIRECT INCOME - 10%
  if (targetUser.sponsorId) {
    const sponsor = await User.findOne({
      userId: targetUser.sponsorId
    });

    if (sponsor) {
      const sponsorActive = await checkIsActive(
        sponsor.userId
      );

      if (sponsorActive) {
        await createCommission({
          packageId: packageData._id,
          userId: sponsor.userId,
          fromUserId: targetUser.userId,
          type: 'direct_income',
          level: 1,
          percentage: 10,
          packageAmount: amount
        });
      }
    }
  }

  // LEVEL 2 TO 12
  let currentUplineId = targetUser.sponsorId;
  let currentLevel = 1;

  while (currentUplineId && currentLevel <= 12) {
    const upline = await User.findOne({
      userId: currentUplineId
    }).select('userId sponsorId');

    if (!upline) break;

    const active = await checkIsActive(upline.userId);

    if (active && currentLevel >= 2) {
      const percentage = LEVEL_PERCENTAGES[currentLevel];

      if (percentage) {
        await createCommission({
          packageId: packageData._id,
          userId: upline.userId,
          fromUserId: targetUser.userId,
          type: 'level_income',
          level: currentLevel,
          percentage,
          packageAmount: amount
        });
      }
    }

    currentUplineId = upline.sponsorId;
    currentLevel++;
  }
};

// ======================================
// ACTIVATE AUTO COMPOUND V2
// ======================================
exports.activateAutoCompoundV2 = async (req, res) => {
  let debitedUserId = null;
  let debitedAmount = 0;
  let packageCreated = false;

  try {
    const {
      memberId,
      packageAmount,
      selectedDays,
      txnPassword
    } = req.body;

    const buyerId = String(
      req.user?.userId || ''
    ).trim();

    const targetId = String(
      memberId || ''
    ).trim().toUpperCase();

    const amount = Number(packageAmount);
    const days = Number(selectedDays);

    // AUTH CHECK
    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // MEMBER CHECK
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required'
      });
    }

    // PACKAGE CHECK
    if (!VALID_PACKAGES.includes(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package amount'
      });
    }

    // DURATION CHECK
    if (![25, 50, 100].includes(days)) {
      return res.status(400).json({
        success: false,
        message: 'Select 25, 50 or 100 days'
      });
    }

    // PASSWORD REQUIRED
    if (
      typeof txnPassword !== 'string' ||
      !txnPassword.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Transaction password is required'
      });
    }

    // BUYER USER
    const buyer = await User.findOne({
      userId: buyerId
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Logged-in user not found'
      });
    }

    // TRANSACTION PASSWORD VERIFY
    // Same comparison style as existing normal package controller.
    if (
      !buyer.transactionPassword ||
      txnPassword.toLowerCase() !==
        String(buyer.transactionPassword).toLowerCase()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction password'
      });
    }

    // RECEIVER USER
    const targetUser = await User.findOne({
      userId: targetId
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Member ID not found'
      });
    }

    // ======================================
    // ATOMIC WALLET DEDUCTION
    // ======================================
    // Balance condition and deduction happen in one DB operation.
    const debitedUser = await User.findOneAndUpdate(
      {
        userId: buyerId,
        walletBalance: { $gte: amount }
      },
      {
        $inc: {
          walletBalance: -amount
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!debitedUser) {
      const latestUser = await User.findOne({
        userId: buyerId
      }).select('walletBalance');

      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
        walletBalance: Number(
          latestUser?.walletBalance || 0
        )
      });
    }

    debitedUserId = buyerId;
    debitedAmount = amount;

    // ======================================
    // CREATE PACKAGE
    // ======================================
    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + days);

    const packageData = await AutoCompoundV2.create({
      userId: targetUser.userId,
      packageAmount: amount,
      selectedDays: days,

      // Demo/test calculation rate only.
      demoDailyRate: 0.05,

      currentBalance: amount,
      daysCompleted: 0,
      originalAmountSeparated: 0,
      remainingAmount: 0,
      dailyInstallment: 0,
      distributionDays: 25,
      distributionDaysCompleted: 0,

      startDate,
      endDate,
      status: 'active'
    });

    packageCreated = true;

    // ======================================
    // REFERRAL COMMISSION RECORDS
    // ======================================
    // These are pending records, not automatic wallet credits.
    try {
      await calculateReferralCommissions(
        packageData,
        targetUser
      );
    } catch (commissionError) {
      console.error(
        'V2 commission calculation error:',
        commissionError
      );
    }

    return res.status(201).json({
      success: true,
      message:
        `Auto Compound V2 package activated for ${targetUser.userId}. ${amount} deducted from wallet.`,
      data: packageData,
      walletBalance: Number(
        debitedUser.walletBalance || 0
      )
    });

  } catch (error) {
    console.error(
      'AutoCompoundV2 activation error:',
      error
    );

    // ======================================
    // REFUND IF PACKAGE CREATION FAILED
    // ======================================
    if (
      debitedUserId &&
      debitedAmount > 0 &&
      !packageCreated
    ) {
      try {
        await User.updateOne(
          { userId: debitedUserId },
          {
            $inc: {
              walletBalance: debitedAmount
            }
          }
        );
      } catch (refundError) {
        console.error(
          'CRITICAL: V2 wallet refund failed:',
          refundError
        );
      }
    }

    return res.status(500).json({
      success: false,
      message:
        'Unable to activate package. If your wallet was debited, contact support with your user ID.'
    });
  }
};

// ======================================
// GET USER PACKAGES
// ======================================
exports.getAutoCompoundV2 = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const packages = await AutoCompoundV2.find({
      userId: String(userId)
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: packages
    });

  } catch (error) {
    console.error('V2 package fetch error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch packages'
    });
  }
};

// ======================================
// GET DAILY LEDGER
// ======================================
exports.getAutoCompoundV2Ledger = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const packageData = await AutoCompoundV2.findOne({
      _id: req.params.packageId,
      userId: String(userId)
    }).lean();

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const ledger = await AutoCompoundV2Ledger.find({
      packageId: packageData._id,
      userId: String(userId)
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      package: packageData,
      ledger
    });

  } catch (error) {
    console.error('V2 ledger fetch error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch ledger'
    });
  }
};

// ======================================
// GET DIRECT + LEVEL COMMISSIONS
// ======================================
exports.getAutoCompoundV2Commissions = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const commissions = await AutoCompoundV2Commission.find({
      userId: String(userId)
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: commissions
    });

  } catch (error) {
    console.error('V2 commission fetch error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch commission records'
    });
  }
};