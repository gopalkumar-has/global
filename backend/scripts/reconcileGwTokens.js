
/**
 * GW TOKEN RECONCILIATION SCRIPT
 *
 * Run:
 * node scripts/reconcileGwTokens.js
 *
 * Mongo URI automatically backend/.env se read hoga.
 */

const path = require('path');
const readline = require('readline');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const mongoose = require('mongoose');

const User = require('../models/User');
const PackageActivation = require('../models/PackageActivation');
const AutoCompoundV2 = require('../models/AutoCompoundV2');
const GwTokenReward = require('../models/GwTokenReward');

const TOKEN_MULTIPLIER = 10;

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer || '').trim());
    });
  });
}

function getMongoUri() {
  return (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    ''
  );
}

// ==========================================
// LOAD ALL NORMAL + AUTO COMPOUND PACKAGES
// ==========================================

async function loadPackages() {
  const [normalPackages, autoPackages] = await Promise.all([
    PackageActivation.find({})
      .select('_id userId purchasedBy packageAmount')
      .lean(),

    AutoCompoundV2.find({})
      .select('_id userId purchasedBy packageAmount')
      .lean()
  ]);

  return [
    ...normalPackages.map((pkg) => ({
      ...pkg,
      packageType: 'normal',
      source: 'Normal'
    })),

    ...autoPackages.map((pkg) => ({
      ...pkg,
      packageType: 'auto_compound',
      source: 'Auto Compound'
    }))
  ];
}

// ==========================================
// BUILD MISSING TOKEN CREDIT PLAN
// ==========================================

function buildPlan(packages, existingLedger, users) {
  const creditedIds = new Set(
    existingLedger.map((item) => String(item.packageId))
  );

  const existingUserIds = new Set(
    users.map((user) => String(user.userId))
  );

  const plan = [];

  const skipped = {
    alreadyCredited: 0,
    invalidPackage: 0,
    missingUser: 0
  };

  for (const pkg of packages) {
    const packageId = String(pkg._id);
    const receiverId = String(pkg.userId || '').trim();
    const packageAmount = Number(pkg.packageAmount);

    // Already rewarded package
    if (creditedIds.has(packageId)) {
      skipped.alreadyCredited++;
      continue;
    }

    // Invalid package
    if (
      !receiverId ||
      !Number.isFinite(packageAmount) ||
      packageAmount <= 0
    ) {
      skipped.invalidPackage++;
      continue;
    }

    // User does not exist
    if (!existingUserIds.has(receiverId)) {
      skipped.missingUser++;
      continue;
    }

    const tokenAmount = roundMoney(
      packageAmount * TOKEN_MULTIPLIER
    );

    plan.push({
      packageId: pkg._id,
      packageIdText: packageId,
      buyerId: String(
        pkg.purchasedBy || pkg.buyerId || receiverId
      ),
      receiverId,
      packageType: pkg.packageType,
      source: pkg.source,
      packageAmount: roundMoney(packageAmount),
      tokenAmount
    });
  }

  return { plan, skipped };
}

// ==========================================
// USER-WISE PREVIEW
// ==========================================

function printPreview(plan, skipped) {
  const usersMap = new Map();

  for (const item of plan) {
    if (!usersMap.has(item.receiverId)) {
      usersMap.set(item.receiverId, {
        receiverId: item.receiverId,
        packageCount: 0,
        totalTokens: 0,
        packages: []
      });
    }

    const user = usersMap.get(item.receiverId);

    user.packageCount++;
    user.totalTokens = roundMoney(
      user.totalTokens + item.tokenAmount
    );

    user.packages.push(item);
  }

  const users = [...usersMap.values()];

  const totalTokens = roundMoney(
    plan.reduce(
      (sum, item) => sum + item.tokenAmount,
      0
    )
  );

  console.log('\n==============================================');
  console.log('       GW TOKEN RECONCILIATION PREVIEW');
  console.log('==============================================');

  console.log('Users needing tokens :', users.length);
  console.log('Packages missing     :', plan.length);
  console.log('Total tokens to add  :', totalTokens);

  console.log(
    'Already credited     :',
    skipped.alreadyCredited
  );

  console.log(
    'Invalid packages     :',
    skipped.invalidPackage
  );

  console.log(
    'Missing user records :',
    skipped.missingUser
  );

  if (!plan.length) {
    console.log('\nNo missing rewards found.');
    return;
  }

  console.log('\n========== USER-WISE TOKEN DETAILS ==========');

  for (const user of users.sort((a, b) =>
    a.receiverId.localeCompare(b.receiverId)
  )) {
    console.log('\n----------------------------------------------');

    console.log('USER ID:', user.receiverId);
    console.log('Missing Packages:', user.packageCount);
    console.log('Tokens to Add:', user.totalTokens);

    for (const pkg of user.packages) {
      console.log(
        `  ${pkg.source} | Package $${pkg.packageAmount} | Tokens ${pkg.tokenAmount}`
      );
    }
  }

  console.log('\n==============================================');
}

// ==========================================
// CREDIT MISSING GW TOKENS
// ==========================================

async function creditMissingRewards(plan) {
  let creditedPackages = 0;
  let creditedTokens = 0;
  let failedPackages = 0;

  for (const item of plan) {
    let ledgerCreated = false;

    try {
      // Unique packageId prevents duplicate ledger entries.
      await GwTokenReward.create({
        packageId: item.packageId,
        buyerId: item.buyerId,
        receiverId: item.receiverId,
        packageType: item.packageType,
        packageAmount: item.packageAmount,
        tokenAmount: item.tokenAmount
      });

      ledgerCreated = true;

      const result = await User.updateOne(
        { userId: item.receiverId },
        {
          $inc: {
            gwTokenBalance: item.tokenAmount
          }
        }
      );

      if (result.matchedCount !== 1) {
        throw new Error(
          `User not found: ${item.receiverId}`
        );
      }

      creditedPackages++;

      creditedTokens = roundMoney(
        creditedTokens + item.tokenAmount
      );

      console.log(
        `[CREDITED] ${item.receiverId} | ${item.source} $${item.packageAmount} | +${item.tokenAmount} GW Tokens`
      );

    } catch (error) {
      // Rollback ledger if wallet update failed.
      if (ledgerCreated) {
        try {
          await GwTokenReward.deleteOne({
            packageId: item.packageId
          });
        } catch (rollbackError) {
          console.error(
            '[CRITICAL] Ledger rollback failed:',
            rollbackError.message
          );
        }
      }

      if (error.code === 11000) {
        console.log(
          `[SKIPPED] Already credited: ${item.packageIdText}`
        );
      } else {
        failedPackages++;

        console.error(
          `[FAILED] ${item.receiverId} | ${item.packageIdText}:`,
          error.message
        );
      }
    }
  }

  console.log('\n========== FINAL CREDIT RESULT ==========');
  console.log('Credited Packages:', creditedPackages);
  console.log('Credited Tokens:', creditedTokens);
  console.log('Failed Packages:', failedPackages);
  console.log('=========================================');
}

// ==========================================
// MAIN
// ==========================================

async function main() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error(
      'Mongo URI not found in backend/.env. Use MONGO_URI or MONGODB_URI.'
    );
  }

  console.log('\nConnecting to MongoDB...');

  await mongoose.connect(mongoUri);

  console.log('MongoDB connected successfully.');

  console.log('Loading package records...');

  const [
    packages,
    existingLedger,
    users
  ] = await Promise.all([
    loadPackages(),

    GwTokenReward.find({})
      .select('packageId')
      .lean(),

    User.find({})
      .select('userId')
      .lean()
  ]);

  console.log('Normal + Auto Compound packages:', packages.length);

  const { plan, skipped } = buildPlan(
    packages,
    existingLedger,
    users
  );

  // First show preview only
  printPreview(plan, skipped);

  if (!plan.length) {
    console.log('\nNothing to credit.');
    return;
  }

  // Explicit confirmation required
  const confirmation = await ask(
    '\nType YES to credit these missing GW Tokens. Type NO to cancel: '
  );

  if (confirmation !== 'YES') {
    console.log(
      '\nCANCELLED. No tokens were credited.'
    );
    return;
  }

  console.log('\nStarting GW Token credit...');

  await creditMissingRewards(plan);
}

// ==========================================
// START + CLOSE DATABASE
// ==========================================

main()
  .catch((error) => {
    console.error(
      '\nGW TOKEN SCRIPT ERROR:',
      error.message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
