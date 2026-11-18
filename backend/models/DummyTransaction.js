
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
      enum: ["demo_package", "demo_topup"],
      required: true
    },
    packageType: {
      type: String,
      enum: ["Normal", "Auto Compound V2"],
      default: "Normal"
    },
    isDemo: {
      type: Boolean,
      default: true,
      required: true,
      index: true
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
      default: Date.now
    }
  },
  { timestamps: false }
);

module.exports =
  mongoose.models.DummyTransaction ||
  mongoose.model("DummyTransaction", DummyTransactionSchema);
