
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const User = require("../models/User");
const DummyUser = require("../models/DummyUser");
const DummyTransaction = require("../models/DummyTransaction");

const {
  generateUniqueDummyId,
  generateName
} = require("../utils/dummyGenerator");

const ALLOWED_PACKAGES = [
  "Normal",
  "Auto Compound V2"
];

// ==========================================
// DEMO PACKAGE ID GENERATOR
// ==========================================

router.post(
  "/generate-demo-package",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        packageType,
        amount,
        transactionPassword
      } = req.body;

      // 1. Validate package type
      if (!ALLOWED_PACKAGES.includes(packageType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid package type"
        });
      }

      // 2. Validate amount
      const packageAmount = Number(amount);

      if (
        !Number.isFinite(packageAmount) ||
        packageAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid package amount is required"
        });
      }

      // 3. Verify logged-in user
      const currentUser = await User.findOne({
        userId: req.user.userId
      }).select("userId transactionPassword");

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // 4. Verify transaction password
      if (
        !transactionPassword ||
        !currentUser.transactionPassword ||
        String(transactionPassword) !==
          String(currentUser.transactionPassword)
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid transaction password"
        });
      }

      // 5. Generate unique ID and random name
      const generatedId = await generateUniqueDummyId();
      const generatedName = generateName();

      const createdAt = new Date();

      // 6. Save demo user
      await DummyUser.create({
        userId: generatedId,
        name: generatedName,
        package: packageAmount,
        packageType: packageType,
        country: "India",
        isDummy: true,
        createdAt
      });

      // 7. Save demo package record
      await DummyTransaction.create({
        userId: generatedId,
        name: generatedName,
        amount: packageAmount,
        type: "demo_package",
        packageType: packageType,
        isDemo: true,
        status: "DEMO",
        description:
          "Demo package entry - not a real transaction",
        createdAt
      });

      // 8. Success response
      return res.status(201).json({
        success: true,
        message: "Demo package ID generated successfully",
        data: {
          userId: generatedId,
          name: generatedName,
          packageType,
          amount: packageAmount,
          status: "DEMO",
          isDemo: true,
          createdAt
        }
      });

    } catch (error) {
      console.error(
        "Demo Package Generator Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to generate demo package"
      });
    }
  }
);

module.exports = router;
