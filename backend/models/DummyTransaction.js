
// const mongoose = require("mongoose");

// const DummyTransactionSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     amount: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     type: {
//       type: String,
//       enum: ["demo_package", "demo_topup"],
//       required: true
//     },
//     packageType: {
//       type: String,
//       enum: ["Normal", "Auto Compound V2"],
//       default: "Normal"
//     },
//     isDemo: {
//       type: Boolean,
//       default: true,
//       required: true,
//       index: true
//     },
//     status: {
//       type: String,
//       default: "DEMO"
//     },
//     description: {
//       type: String,
//       default: "DEMO TOPUP - Not a real transaction"
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   },
//   { timestamps: false }
// );

// module.exports =
//   mongoose.models.DummyTransaction ||
//   mongoose.model("DummyTransaction", DummyTransactionSchema);



const mongoose = require("mongoose");

const DummyTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    type: {
      type: String,
      enum: [
        "demo_package",
        "demo_topup",
        "promo_package",
        "promo_auto_compound"
      ],
      required: true,
      index: true
    },

    packageType: {
      type: String,
      enum: ["Normal", "Auto Compound V2"],
      default: "Normal",
      index: true
    },

    promoUserId: {
      type: String,
      trim: true,
      default: null,
      index: true
    },

    isPromo: {
      type: Boolean,
      default: false,
      index: true
    },

    isDemo: {
      type: Boolean,
      default: true,
      required: true,
      index: true
    },

    durationDays: {
      type: Number,
      default: null
    },

    country: {
      type: String,
      default: "India"
    },

    countryCode: {
      type: String,
      default: "IN"
    },

    status: {
      type: String,
      default: "DEMO"
    },

    description: {
      type: String,
      default: "DEMO TOPUP - Not a real transaction"
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

module.exports =
  mongoose.models.DummyTransaction ||
  mongoose.model("DummyTransaction", DummyTransactionSchema);
