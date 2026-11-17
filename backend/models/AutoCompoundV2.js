const mongoose = require('mongoose');

const autoCompoundV2Schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },

    packageAmount: {
        type: Number,
        required: true,
        min: 1
    },

    selectedDays: {
        type: Number,
        required: true,
        enum: [25, 50, 100]
    },

    demoDailyRate: {
        type: Number,
        default: 0.05
    },

    currentBalance: {
        type: Number,
        required: true
    },

    daysCompleted: {
        type: Number,
        default: 0
    },

    originalAmountSeparated: {
        type: Number,
        default: 0
    },

    remainingAmount: {
        type: Number,
        default: 0
    },

    dailyInstallment: {
        type: Number,
        default: 0
    },

    distributionDays: {
        type: Number,
        default: 25
    },

    distributionDaysCompleted: {
        type: Number,
        default: 0
    },

    lastProcessedDate: {
        type: String,
        default: null
    },

    status: {
        type: String,
        enum: [
            'active',
            'distribution',
            'completed'
        ],
        default: 'active'
    },

    startDate: {
        type: Date,
        default: Date.now
    },

    endDate: {
        type: Date,
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model(
    'AutoCompoundV2',
    autoCompoundV2Schema
);