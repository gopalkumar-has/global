
const mongoose = require('mongoose');

const gwTokenRewardSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    index: true
  },

  buyerId: {
    type: String,
    required: true,
    index: true
  },

  receiverId: {
    type: String,
    required: true
  },

  packageType: {
    type: String,
    enum: ['normal', 'auto_compound'],
    required: true
  },

  packageAmount: {
    type: Number,
    required: true
  },

  tokenAmount: {
    type: Number,
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model(
  'GwTokenReward',
  gwTokenRewardSchema
);
