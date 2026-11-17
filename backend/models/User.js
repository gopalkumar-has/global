 



const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ==========================================
  // IDENTITY
  // ==========================================
  userId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  country: {
    type: String
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  password: {
    type: String,
    required: true
  },
  transactionPassword: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  passwordResetCount: {
    type: Number,
    default: 0
  },
  lastPasswordResetDate: {
    type: Date
  },

  // ==========================================
  // REFERRAL & GLOBAL TEAM
  // ==========================================
  sponsorId: {
    type: String,
    default: null
  },
  isSponsorDeactivated: {
    type: Boolean,
    default: false
  },
  directCount: {
    type: Number,
    default: 0
  },
  globalTeamCount: {
    type: Number,
    default: 0
  },
  todayGlobalTeamAdded: {
    type: Number,
    default: 0
  },
  lastGlobalTeamAddDate: {
    type: String,
    default: ""
  },

  // ==========================================
  // SECURITY & TRACKING
  // ==========================================
  // deviceId: { type: String, default: null },
  // telegramId: { type: String, default: null },
  // isTelegramJoined: { type: Boolean, default: false },

  ipAddress: {
    type: String
  },

  // ==========================================
  // WALLETS
  // ==========================================
  walletBalance: {
    type: Number,
    default: 0
  },
  usdtWallet: {
    type: Number,
    default: 0
  },
  depositAddress: {
    type: String,
    default: null
  },

  isToppedUp: {
    type: Boolean,
    default: false
  },
  topUpAmount: {
    type: Number,
    default: 0
  },
  topUpDate: {
    type: Date
  },

  topUps: [
    {
      plan: {
        type: String,
        default: "Basic Package"
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // ==========================================
  // AUTO COMPOUND V2 INCOME
  // ==========================================
  autoCompoundIncome: {
    type: Number,
    default: 0
  },
  totalAutoCompoundIncome: {
    type: Number,
    default: 0
  },

  // ==========================================
  // INCOME WALLETS
  // ==========================================
  directIncome: {
    type: Number,
    default: 0
  },
  totalDirectIncome: {
    type: Number,
    default: 0
  },

  levelIncome: {
    type: Number,
    default: 0
  },
  totalLevelIncome: {
    type: Number,
    default: 0
  },

  levelRoiIncome: {
    type: Number,
    default: 0
  },
  totalLevelRoiIncome: {
    type: Number,
    default: 0
  },

  roiIncome: {
    type: Number,
    default: 0
  },
  totalRoiIncome: {
    type: Number,
    default: 0
  },

  rewardIncome: {
    type: Number,
    default: 0
  },
  totalRewardIncome: {
    type: Number,
    default: 0
  },

  claimedRewards: {
    type: [Number],
    default: []
  },

  // ==========================================
  // WITHDRAWAL TRACKING
  // ==========================================
  pendingWithdrawals: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },

  // ==========================================
  // MONTHLY SALARY PLAN
  // ==========================================
  isSalaryQualified: {
    type: Boolean,
    default: false
  },
  salaryMonthsPaid: {
    type: Number,
    default: 0
  },
  salaryTotalIncome: {
    type: Number,
    default: 0
  },
  unclaimedSalary: {
    type: Number,
    default: 0
  },

  // ==========================================
  // WALLET ADDRESS SECURITY
  // ==========================================
  walletAddress: {
    type: String,
    default: ''
  },
  walletAddressChangeCount: {
    type: Number,
    default: 0
  },
  walletAddressChangeWindowStart: {
    type: Date,
    default: null
  },
  walletAddressUpdatedAt: {
    type: Date
  },

  walletAddressHistory: [
    {
      address: {
        type: String
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: String,
        default: "User"
      }
    }
  ],

  // ==========================================
  // PROFILE EDIT SECURITY
  // ==========================================
  editProfileOtp: {
    type: String
  },
  editProfileOtpExpiry: {
    type: Date
  },
  profileEditAccessExpiry: {
    type: Date
  },

  // ==========================================
  // ROLE & STATUS
  // ==========================================
  role: {
    type: String,
    enum: ['user', 'admin', 'promo', 'leader', 'superleader'],
    default: 'user'
  },
  isBlocked: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

// ==========================================
// INDEXES
// ==========================================
userSchema.index({ sponsorId: 1 });
userSchema.index({ ipAddress: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ sponsorId: 1, userId: 1 });

module.exports = mongoose.model('User', userSchema);
