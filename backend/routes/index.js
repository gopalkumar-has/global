
const express = require('express');
const router = express.Router();

// Settings
router.use('/setting', require('./setting'));

// Auth
router.use('/auth', require('./auth'));

// User
router.use('/user', require('./user'));

// Admin Auth
router.use('/admin', require('./adminAuth'));

// Admin Manual Transaction
router.use('/admin', require('./adminManualTransaction'));

// Admin Promo Video
router.use('/admin/video', require('./adminPromoVideo'));

// Admin Reports
router.use('/admin', require('./adminReports'));

// Admin Notifications
router.use('/admin/notifications', require('./adminNotification'));

// Other Modules
router.use('/referral', require('./referral'));
router.use('/transaction', require('./transaction'));
router.use('/wallet', require('./wallet'));
router.use('/income', require('./incomeRoutes'));
router.use('/deposit', require('./depositRoutes'));
router.use('/package', require('./package'));
router.use('/support', require('./support'));
router.use('/dashboard', require('./dashboard'));
router.use('/community', require('./community'));

  
// Auto Compound V2
router.use('/auto-compound-v2', require('./autoCompoundV2Routes'));

router.use('/promo', require('./promoRoutes'));


// Generic Admin Routes - LAST
router.use('/admin', require('./admin'));

// Root Test
router.get('/', (req, res) => {
    res.send('API is running');
});

module.exports = router;
