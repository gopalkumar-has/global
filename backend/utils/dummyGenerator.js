
const User = require("../models/User");
const DummyUser = require("../models/DummyUser");

const {
  countryNames,
  countriesProbability
} = require("./fakeData");

// Actual website package amounts
const VALID_PACKAGES = [2, 5, 10, 20, 50, 100, 200, 500, 1000];

// ==========================================
// UNIQUE DEMO ID: GW + 7 DIGITS
// ==========================================

const generateUniqueDummyId = async () => {
  const MAX_ATTEMPTS = 50;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const random7Digit = Math.floor(
      1000000 + Math.random() * 9000000
    );

    const newUserId = `GW${random7Digit}`;

    // Check real users and demo users
    const [realUser, demoUser] = await Promise.all([
      User.exists({ userId: newUserId }),
      DummyUser.exists({ userId: newUserId })
    ]);

    if (!realUser && !demoUser) {
      return newUserId;
    }
  }

  throw new Error("Unable to generate unique GW demo ID");
};

// ==========================================
// RANDOM DEMO NAME
// ==========================================

const generateName = () => {
  if (
    !countryNames ||
    !countriesProbability ||
    !Array.isArray(countriesProbability) ||
    countriesProbability.length === 0
  ) {
    return `DemoUser${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const selectedCountry =
    countriesProbability[
      Math.floor(Math.random() * countriesProbability.length)
    ];

  const names = countryNames[selectedCountry];

  if (!Array.isArray(names) || names.length === 0) {
    return `DemoUser${Math.floor(1000 + Math.random() * 9000)}`;
  }

  return names[
    Math.floor(Math.random() * names.length)
  ];
};

// ==========================================
// RANDOM AMOUNT FROM REAL PACKAGE OPTIONS
// ==========================================

const generateDemoAmount = () => {
  const randomIndex = Math.floor(
    Math.random() * VALID_PACKAGES.length
  );

  return VALID_PACKAGES[randomIndex];
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  generateUniqueDummyId,
  generateName,
  generateDemoAmount,
  VALID_PACKAGES
};
