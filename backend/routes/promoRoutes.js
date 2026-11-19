
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  activatePromo
} = require("../controllers/promoController");

// Promo user package activation
// Supports Normal and Auto Compound V2
router.post(
  "/activate",
  authMiddleware,
  activatePromo
);

module.exports = router;
