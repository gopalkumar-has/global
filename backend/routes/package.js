
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

// Normal package controller
const {
    activatePackage,
    getUserPackages
} = require('../controllers/packageController');

// Auto Compound V2 model
const AutoCompoundV2 = require('../models/AutoCompoundV2');

// Normal package activation
router.post('/activate', authMiddleware, activatePackage);

// User ke normal packages
router.get('/user/:userId', authMiddleware, getUserPackages);

// Auto Compound V2 packages
router.get('/auto-compound/:userId', authMiddleware, async (req, res) => {
    try {
        const packages = await AutoCompoundV2.find({
            userId: req.params.userId
        }).sort({ createdAt: -1 }).lean();

        return res.json({
            success: true,
            packages
        });

    } catch (error) {
        console.error('AutoCompoundV2 fetch error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Auto Compound V2 packages'
        });
    }
});

module.exports = router;
