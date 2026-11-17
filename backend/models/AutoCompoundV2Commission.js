
const mongoose = require('mongoose');

const autoCompoundV2CommissionSchema = new mongoose.Schema({
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutoCompoundV2',
        required: true,
        index: true
    },

    userId: {
        type: String,
        required: true,
        index: true
    },

    fromUserId: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['direct_income', 'level_income'],
        required: true
    },

    level: {
        type: Number,
        default: 1
    },

    percentage: {
        type: Number,
        required: true
    },

    packageAmount: {
        type: Number,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }

}, { timestamps: true });

autoCompoundV2CommissionSchema.index(
    {
        packageId: 1,
        userId: 1,
        type: 1,
        level: 1
    },
    { unique: true }
);

module.exports = mongoose.model(
    'AutoCompoundV2Commission',
    autoCompoundV2CommissionSchema
);
