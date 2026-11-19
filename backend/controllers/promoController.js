
const crypto = require("crypto");

const DummyUser = require("../models/DummyUser");
const DummyTransaction = require("../models/DummyTransaction");

const { countryNames, countriesProbability } = require("../utils/fakeData");

const VALID_PACKAGES = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
const VALID_COMPOUND_DAYS = [25, 50, 100];

const COUNTRY_LABELS = {
  IN: "India",
  ZA: "South Africa",
  NG: "Nigeria",
  PK: "Pakistan",
  BD: "Bangladesh",
  LK: "Sri Lanka",
  MY: "Malaysia",
  VN: "Vietnam",
  GH: "Ghana",
  KE: "Kenya"
};

// ==========================================
// AVAILABLE COUNTRIES
// Only countries having valid name arrays
// ==========================================

const AVAILABLE_COUNTRIES = [
  ...new Set(countriesProbability || [])
].filter((code) =>
  Array.isArray(countryNames[code]) &&
  countryNames[code].some((name) => String(name || "").trim())
);

const COUNTRY_POOL = (countriesProbability || []).filter((code) =>
  AVAILABLE_COUNTRIES.includes(code)
);

// ==========================================
// RANDOM COUNTRY
// ==========================================

const generateRandomCountry = () => {
  if (!COUNTRY_POOL.length) {
    throw new Error("No country has valid names in fakeData.js");
  }

  return COUNTRY_POOL[crypto.randomInt(0, COUNTRY_POOL.length)];
};

// ==========================================
// UNIQUE DUMMY USER ID
// ==========================================

const generateUniqueUserId = async () => {
  for (let i = 0; i < 50; i++) {
    const id = `GW${crypto.randomInt(1000000, 10000000)}`;

    const exists = await DummyUser.exists({ userId: id });

    if (!exists) {
      return id;
    }
  }

  throw new Error("Unable to generate unique dummy user ID");
};

// ==========================================
// CASE-INSENSITIVE UNIQUE NAME CHECK
// ==========================================

const generateUniqueName = async () => {
  const usedNames = new Set();

  // Load all existing dummy names
  const existingUsers = await DummyUser.find(
    {},
    { name: 1, _id: 0 }
  ).lean();

  for (const user of existingUsers) {
    const normalizedName = String(user.name || "")
      .trim()
      .toLowerCase();

    if (normalizedName) {
      usedNames.add(normalizedName);
    }
  }

  // Collect country-wise available names
  const availableNames = [];

  for (const countryCode of AVAILABLE_COUNTRIES) {
    const names = countryNames[countryCode] || [];

    for (const rawName of names) {
      const name = String(rawName || "").trim();
      const normalizedName = name.toLowerCase();

      if (!name || usedNames.has(normalizedName)) {
        continue;
      }

      availableNames.push({
        name,
        normalizedName,
        countryCode,
        country: COUNTRY_LABELS[countryCode] || countryCode
      });
    }
  }

  // Remove duplicate names inside fakeData.js
  const uniqueCandidates = [];
  const seenNames = new Set();

  for (const item of availableNames) {
    if (seenNames.has(item.normalizedName)) {
      continue;
    }

    seenNames.add(item.normalizedName);
    uniqueCandidates.push(item);
  }

  if (!uniqueCandidates.length) {
    throw new Error(
      "All names from fakeData.js are already used. Add more unique names."
    );
  }

  // Select random unused name
  const selected = uniqueCandidates[
    crypto.randomInt(0, uniqueCandidates.length)
  ];

  return {
    name: selected.name,
    countryCode: selected.countryCode,
    country: selected.country
  };
};

// ==========================================
// PROMO PACKAGE ACTIVATION
// Dummy records only
// No real wallet deduction
// No real package activation
// No ROI or commission
// ==========================================

exports.activatePromo = async (req, res) => {
  let createdDummyUserId = null;

  try {
    // 1. PROMO ROLE CHECK
    if (String(req.user?.role || "").toLowerCase() !== "promo") {
      return res.status(403).json({
        success: false,
        message: "Only Promo users can activate promo packages"
      });
    }

    const promoUserId = String(req.user?.userId || "").trim();

    if (!promoUserId) {
      return res.status(401).json({
        success: false,
        message: "Promo user authentication required"
      });
    }

    // 2. REQUEST DATA
    const {
      packageType,
      packageAmount,
      selectedDays
    } = req.body || {};

    const amount = Number(packageAmount);
    const normalizedType = String(packageType || "").trim();

    // 3. PACKAGE TYPE VALIDATION
    if (!["Normal", "Auto Compound V2"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Select Normal or Auto Compound V2"
      });
    }

    // 4. PACKAGE AMOUNT VALIDATION
    if (!VALID_PACKAGES.includes(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package amount",
        validPackages: VALID_PACKAGES
      });
    }

    // 5. DURATION VALIDATION
    let durationDays = 45;

    if (normalizedType === "Auto Compound V2") {
      const days = Number(selectedDays);

      if (!VALID_COMPOUND_DAYS.includes(days)) {
        return res.status(400).json({
          success: false,
          message: "Select 25, 50 or 100 days",
          validDays: VALID_COMPOUND_DAYS
        });
      }

      durationDays = days;
    }

    // 6. GENERATE UNIQUE ID AND NAME
    const generatedId = await generateUniqueUserId();
    const generatedPerson = await generateUniqueName();

    const generatedName = generatedPerson.name;
    const generatedCountry = generatedPerson.country;
    const generatedCountryCode = generatedPerson.countryCode;

    // 7. CREATE DUMMY USER
    const dummyUser = await DummyUser.create({
      userId: generatedId,
      name: generatedName,
      packageType: normalizedType,
      package: amount,
      durationDays,
      promoUserId,
      country: generatedCountry,
      countryCode: generatedCountryCode,
      isDummy: true,
      createdAt: new Date()
    });

    createdDummyUserId = dummyUser._id;

    // 8. CREATE PROMO TRANSACTION
    const transactionType =
      normalizedType === "Normal"
        ? "promo_package"
        : "promo_auto_compound";

    const dummyTransaction = await DummyTransaction.create({
      userId: generatedId,
      name: generatedName,
      amount,
      type: transactionType,
      packageType: normalizedType,
      durationDays,
      promoUserId,
      country: generatedCountry,
      countryCode: generatedCountryCode,
      isPromo: true,
      isDemo: false,
      status: "PROMO",
      description:
        `PROMO RECORD - ${normalizedType} - $${amount} - ${durationDays} Days - ${generatedCountry}. Not a real transaction.`,
      createdAt: new Date()
    });

    // 9. SUCCESS RESPONSE WITH GENERATED DETAILS
    return res.status(201).json({
      success: true,
      message: "Promo package created successfully",

      data: {
        userId: dummyUser.userId,
        name: dummyUser.name,

        packageType: normalizedType,
        packageAmount: amount,
        amount: amount,

        durationDays: durationDays,

        country: generatedCountry,
        countryCode: generatedCountryCode,

        promoUserId: promoUserId,

        status: "PROMO",
        isPromo: true,
        isDemo: false,

        createdAt: dummyUser.createdAt
      }
    });

  } catch (error) {
    console.error("Promo Activation Error:", error);

    // 10. CLEANUP IF TRANSACTION CREATION FAILS
    if (createdDummyUserId) {
      try {
        await DummyUser.deleteOne({
          _id: createdDummyUserId
        });
      } catch (cleanupError) {
        console.error(
          "Promo DummyUser cleanup error:",
          cleanupError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create promo record",
      error: error.message
    });
  }
};
