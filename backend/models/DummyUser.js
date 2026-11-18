
const mongoose = require("mongoose");

const DummyUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    packageType: {
      type: String,
      enum: ["Normal", "Auto Compound V2"],
      required: true
    },

    package: {
      type: Number,
      required: true,
      min: 0
    },

    country: {
      type: String,
      default: "India"
    },

    isDummy: {
      type: Boolean,
      default: true,
      immutable: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

module.exports =
  mongoose.models.DummyUser ||
  mongoose.model("DummyUser", DummyUserSchema);
