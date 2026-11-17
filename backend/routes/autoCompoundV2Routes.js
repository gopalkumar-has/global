const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
    activateAutoCompoundV2,
    getAutoCompoundV2,
    getAutoCompoundV2Ledger,
    getAutoCompoundV2Commissions
} = require('../controllers/autoCompoundV2Controller');

router.post('/activate', authMiddleware, activateAutoCompoundV2);

router.get('/my-packages', authMiddleware, getAutoCompoundV2);

router.get('/ledger/:packageId', authMiddleware, getAutoCompoundV2Ledger);

router.get('/my-commissions', authMiddleware, getAutoCompoundV2Commissions);

module.exports = router;