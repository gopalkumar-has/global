const mongoose = require('mongoose');

const autoCompoundV2LedgerSchema = new mongoose.Schema({

    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutoCompoundV2',
        required: true
    },

    userId: {
        type: String,
        required: true,
        index: true
    },

    dayNumber: {
        type: Number,
        required: true
    },

    stage: {
        type: String,
        enum: ['compounding', 'distribution'],
        required: true
    },

    openingBalance: {
        type: Number,
        required: true
    },

    calculatedAmount: {
        type: Number,
        required: true
    },

    closingBalance: {
        type: Number,
        required: true
    },

    processingDate: {
        type: String,
        required: true
    }

}, { timestamps: true });

// Prevent duplicate daily ledger entries
autoCompoundV2LedgerSchema.index(
    {
        packageId: 1,
        stage: 1,
        dayNumber: 1
    },
    { unique: true }
);

module.exports = mongoose.model(
    'AutoCompoundV2Ledger',
    autoCompoundV2LedgerSchema
);