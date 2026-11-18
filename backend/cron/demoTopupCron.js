
// const cron = require("node-cron");

// const DummyUser = require("../models/DummyUser");
// const DummyTransaction = require("../models/DummyTransaction");

// const {
//   generateUniqueDummyId,
//   generateName
// } = require("../utils/dummyGenerator");

// // ==========================================
// // DEMO SETTINGS
// // ==========================================

// const DAILY_DEMO_LIMIT = 1000;

// // One demo entry every 10 minutes
// const CRON_SCHEDULE = "*/10 * * * *";

// // Only valid package denominations
// const DEMO_PACKAGE_OPTIONS = [2, 5, 10, 20];

// // ==========================================
// // INDIA DAY RANGE (IST)
// // ==========================================

// const getIndiaDayRange = () => {
//   const date = new Intl.DateTimeFormat("en-CA", {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit"
//   }).format(new Date());

//   const start = new Date(`${date}T00:00:00+05:30`);
//   const end = new Date(start.getTime() + 86400000);

//   return { start, end, date };
// };

// // ==========================================
// // GENERATE VALID PACKAGE AMOUNT
// // ==========================================

// const generateAllowedDemoAmount = (remaining) => {
//   const available = DEMO_PACKAGE_OPTIONS.filter(
//     amount => amount <= remaining
//   );

//   if (!available.length) {
//     return null;
//   }

//   return available[
//     Math.floor(Math.random() * available.length)
//   ];
// };

// // ==========================================
// // GET TODAY'S SUCCESSFUL DEMO TOTAL
// // ==========================================

// const getTodayDemoTotal = async (start, end) => {
//   const result = await DummyTransaction.aggregate([
//     {
//       $match: {
//         isDemo: true,
//         type: "demo_topup",
//         createdAt: {
//           $gte: start,
//           $lt: end
//         }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$amount" },
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   return result[0] || {
//     total: 0,
//     count: 0
//   };
// };

// // ==========================================
// // CREATE DEMO TOPUP
// // ==========================================

// const createDemoTopup = async (amount) => {
//   const userId = await generateUniqueDummyId();
//   const name = generateName();

//   let demoUser = null;

//   try {
//     // Create demo user
//     demoUser = await DummyUser.create({
//       userId,
//       name,
//       packageType: "Normal",
//       package: amount,
//       country: "India",
//       isDummy: true
//     });

//     // Create successful demo transaction
//     const transaction = await DummyTransaction.create({
//       userId,
//       name,
//       amount,
//       type: "demo_topup",
//       packageType: "Normal",
//       isDemo: true,
//       status: "DEMO",
//       description: "DEMO TOPUP - Not a real transaction"
//     });

//     console.log(
//       `[DEMO TOPUP SUCCESS] ${userId} | ${name} | $${amount}`
//     );

//     return transaction;

//   } catch (error) {
//     // Roll back demo user if transaction creation fails
//     if (demoUser?._id) {
//       await DummyUser.deleteOne({
//         _id: demoUser._id
//       }).catch(cleanupError => {
//         console.error(
//           "[DEMO USER CLEANUP ERROR]",
//           cleanupError
//         );
//       });
//     }

//     throw error;
//   }
// };

// // ==========================================
// // SCHEDULER WORK
// // ==========================================

// let isRunning = false;

// const runDemoTopupScheduler = async () => {
//   // Prevent overlapping executions in this process
//   if (isRunning) {
//     console.log("[DEMO TOPUP] Previous execution still running");
//     return;
//   }

//   isRunning = true;

//   try {
//     const { start, end, date } = getIndiaDayRange();

//     // Read today's successful demo transactions
//     const today = await getTodayDemoTotal(start, end);

//     const currentTotal = Number(today.total || 0);
//     const currentCount = Number(today.count || 0);

//     const remaining = Number(
//       (DAILY_DEMO_LIMIT - currentTotal).toFixed(2)
//     );

//     // Stop when daily limit is reached
//     if (remaining < Math.min(...DEMO_PACKAGE_OPTIONS)) {
//       console.log(
//         `[DEMO TOPUP] Daily limit reached | Date: ${date} | Total: $${currentTotal} | Entries: ${currentCount}`
//       );

//       return;
//     }

//     // Pick a valid amount that fits the remaining budget
//     const amount = generateAllowedDemoAmount(remaining);

//     if (amount === null) {
//       console.log(
//         `[DEMO TOPUP] No valid package fits remaining amount: $${remaining}`
//       );

//       return;
//     }

//     // Create demo entry
//     await createDemoTopup(amount);

//     const updatedTotal = Number(
//       (currentTotal + amount).toFixed(2)
//     );

//     console.log(
//       `[DEMO TOPUP DAILY STATS] Date: ${date} | Today: $${updatedTotal} / $${DAILY_DEMO_LIMIT} | Entries: ${currentCount + 1}`
//     );

//   } finally {
//     isRunning = false;
//   }
// };

// // ==========================================
// // START CRON
// // ==========================================

// let schedulerStarted = false;

// const startDemoTopupCron = () => {
//   if (schedulerStarted) {
//     return;
//   }

//   schedulerStarted = true;

//   cron.schedule(
//     CRON_SCHEDULE,
//     async () => {
//       try {
//         await runDemoTopupScheduler();
//       } catch (error) {
//         console.error(
//           "[DEMO TOPUP CRON ERROR]",
//           error
//         );
//       }
//     },
//     {
//       timezone: "Asia/Kolkata"
//     }
//   );

//   console.log(
//     "[DEMO TOPUP] Started | Every 10 minutes | Daily maximum: $1000"
//   );
// };

// module.exports = startDemoTopupCron;



const cron = require("node-cron");
const mongoose = require("mongoose");
const crypto = require("crypto");

const DummyUser = require("../models/DummyUser");
const DummyTransaction = require("../models/DummyTransaction");

const {
  generateUniqueDummyId,
  generateName
} = require("../utils/dummyGenerator");

// ==========================================
// DEMO SETTINGS
// ==========================================

const DAILY_DEMO_LIMIT = 1000;

// One demo entry every 10 minutes
const CRON_SCHEDULE = "*/10 * * * *";

// Only valid package denominations
const DEMO_PACKAGE_OPTIONS = [2, 5, 10, 20];

// ==========================================
// DISTRIBUTED LOCK SETTINGS
// ==========================================

const CRON_LOCK_ID = "demo_topup_scheduler";
const CRON_LOCK_COLLECTION = "cron_locks";

// Lock expires after 12 minutes if process crashes
const LOCK_TTL_MS = 12 * 60 * 1000;

// Unique owner for every Node.js process
const LOCK_OWNER = `${process.env.NODE_APP_INSTANCE ?? "single"}-${process.pid}-${crypto.randomUUID()}`;

// ==========================================
// INDIA DAY RANGE (IST)
// ==========================================

const getIndiaDayRange = () => {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const start = new Date(`${date}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 86400000);

  return { start, end, date };
};

// ==========================================
// DISTRIBUTED LOCK
// ==========================================

const acquireCronLock = async () => {
  const collection = mongoose.connection.collection(
    CRON_LOCK_COLLECTION
  );

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + LOCK_TTL_MS
  );

  try {
    const result = await collection.updateOne(
      {
        _id: CRON_LOCK_ID,
        $or: [
          { expiresAt: { $lte: now } },
          { owner: LOCK_OWNER }
        ]
      },
      {
        $set: {
          owner: LOCK_OWNER,
          expiresAt,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    );

    return (
      result.matchedCount === 1 ||
      result.upsertedCount === 1
    );

  } catch (error) {
    // Another instance already owns the lock
    if (error && error.code === 11000) {
      return false;
    }

    throw error;
  }
};

// ==========================================
// RELEASE LOCK
// ==========================================

const releaseCronLock = async () => {
  const collection = mongoose.connection.collection(
    CRON_LOCK_COLLECTION
  );

  await collection.deleteOne({
    _id: CRON_LOCK_ID,
    owner: LOCK_OWNER
  });
};

// ==========================================
// GENERATE VALID PACKAGE AMOUNT
// ==========================================

const generateAllowedDemoAmount = (remaining) => {
  const available = DEMO_PACKAGE_OPTIONS.filter(
    amount => amount <= remaining
  );

  if (!available.length) {
    return null;
  }

  return available[
    Math.floor(Math.random() * available.length)
  ];
};

// ==========================================
// GET TODAY'S SUCCESSFUL DEMO TOTAL
// ==========================================

const getTodayDemoTotal = async (start, end) => {
  const result = await DummyTransaction.aggregate([
    {
      $match: {
        isDemo: true,
        type: "demo_topup",
        createdAt: {
          $gte: start,
          $lt: end
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    total: 0,
    count: 0
  };
};

// ==========================================
// CREATE DEMO TOPUP
// ==========================================

const createDemoTopup = async (amount) => {
  const userId = await generateUniqueDummyId();
  const name = generateName();

  let demoUser = null;

  try {
    // Create demo user
    demoUser = await DummyUser.create({
      userId,
      name,
      packageType: "Normal",
      package: amount,
      country: "India",
      isDummy: true
    });

    // Create successful demo transaction
    const transaction = await DummyTransaction.create({
      userId,
      name,
      amount,
      type: "demo_topup",
      packageType: "Normal",
      isDemo: true,
      status: "DEMO",
      description: "DEMO TOPUP - Not a real transaction"
    });

    console.log(
      `[DEMO TOPUP SUCCESS] ${userId} | ${name} | $${amount}`
    );

    return transaction;

  } catch (error) {
    // Roll back demo user if transaction fails
    if (demoUser?._id) {
      await DummyUser.deleteOne({
        _id: demoUser._id
      }).catch(cleanupError => {
        console.error(
          "[DEMO USER CLEANUP ERROR]",
          cleanupError
        );
      });
    }

    throw error;
  }
};

// ==========================================
// SCHEDULER WORK
// ==========================================

let isRunning = false;

const runDemoTopupScheduler = async () => {

  // Prevent overlapping executions in same process
  if (isRunning) {
    console.log(
      "[DEMO TOPUP] Previous execution still running"
    );

    return;
  }

  isRunning = true;

  let lockAcquired = false;

  try {

    // Only ONE PM2 instance can acquire this lock
    lockAcquired = await acquireCronLock();

    if (!lockAcquired) {
      console.log(
        `[DEMO TOPUP] Skipped on instance ${process.env.NODE_APP_INSTANCE ?? "single"}; another instance owns the lock.`
      );

      return;
    }

    console.log(
      `[DEMO TOPUP] Lock acquired | Instance: ${process.env.NODE_APP_INSTANCE ?? "single"} | PID: ${process.pid}`
    );

    const { start, end, date } = getIndiaDayRange();

    // Read today's successful demo transactions
    const today = await getTodayDemoTotal(start, end);

    const currentTotal = Number(today.total || 0);
    const currentCount = Number(today.count || 0);

    const remaining = Number(
      (DAILY_DEMO_LIMIT - currentTotal).toFixed(2)
    );

    // Stop when daily limit is reached
    if (remaining < Math.min(...DEMO_PACKAGE_OPTIONS)) {
      console.log(
        `[DEMO TOPUP] Daily limit reached | Date: ${date} | Total: $${currentTotal} | Entries: ${currentCount}`
      );

      return;
    }

    // Pick a valid amount within remaining budget
    const amount = generateAllowedDemoAmount(remaining);

    if (amount === null) {
      console.log(
        `[DEMO TOPUP] No valid package fits remaining amount: $${remaining}`
      );

      return;
    }

    // Create one demo entry
    await createDemoTopup(amount);

    const updatedTotal = Number(
      (currentTotal + amount).toFixed(2)
    );

    console.log(
      `[DEMO TOPUP DAILY STATS] Date: ${date} | Today: $${updatedTotal} / $${DAILY_DEMO_LIMIT} | Entries: ${currentCount + 1}`
    );

  } finally {

    // Release only the lock owned by this process
    if (lockAcquired) {
      await releaseCronLock().catch(error => {
        console.error(
          "[DEMO TOPUP LOCK RELEASE ERROR]",
          error
        );
      });
    }

    isRunning = false;
  }
};

// ==========================================
// START CRON
// ==========================================

let schedulerStarted = false;

const startDemoTopupCron = () => {

  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  cron.schedule(
    CRON_SCHEDULE,
    async () => {
      try {
        await runDemoTopupScheduler();

      } catch (error) {
        console.error(
          "[DEMO TOPUP CRON ERROR]",
          error
        );
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );

  console.log(
    `[DEMO TOPUP] Started | Instance: ${process.env.NODE_APP_INSTANCE ?? "single"} | Every 10 minutes | Daily maximum: $${DAILY_DEMO_LIMIT} | MongoDB distributed lock enabled`
  );
};

module.exports = startDemoTopupCron;
