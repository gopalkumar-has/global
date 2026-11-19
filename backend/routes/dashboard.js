
// const express = require("express");
// const router = express.Router();

// const calculateBalances = require("../services/balanceService");

// const User = require("../models/User");
// const PackageActivation = require("../models/PackageActivation");
// const AutoCompoundV2 = require("../models/AutoCompoundV2");
// const DummyUser = require("../models/DummyUser");

// const MAX_ENTRIES = 500;

// // ==========================================
// // INDIA DATE RANGE
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
// // DAILY HISTORY
// // ==========================================

// const getDailyHistory = async (Model, dateField, amountField, match = {}) => {
//   return Model.aggregate([
//     {
//       $match: {
//         ...match,
//         [dateField]: { $exists: true, $ne: null }
//       }
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: {
//             format: "%Y-%m-%d",
//             date: `$${dateField}`,
//             timezone: "Asia/Kolkata"
//           }
//         },
//         total: { $sum: `$${amountField}` },
//         count: { $sum: 1 }
//       }
//     },
//     { $sort: { _id: -1 } }
//   ]);
// };

// // ==========================================
// // EXISTING USER DASHBOARD
// // ==========================================

// router.get("/:userId", async (req, res, next) => {
//   if (req.params.userId === "global-investment") {
//     return next();
//   }

//   try {
//     const balances = await calculateBalances(req.params.userId);
//     return res.json(balances);
//   } catch (error) {
//     console.error("[USER DASHBOARD ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });

// // ==========================================
// // GLOBAL INVESTMENT DASHBOARD
// // ==========================================

// router.get("/global-investment", async (req, res) => {
//   try {
//     const { start, end, date } = getIndiaDayRange();

//     // All package statuses are included.
//     const normalMatch = {};
//     const autoMatch = {};

//     const normalTodayMatch = {
//       startDate: { $gte: start, $lt: end }
//     };

//     const autoTodayMatch = {
//       startDate: { $gte: start, $lt: end }
//     };

//     const demoMatch = {
//       isDummy: true
//     };

//     const demoTodayMatch = {
//       ...demoMatch,
//       createdAt: { $gte: start, $lt: end }
//     };

//     // ==========================================
//     // FETCH TOTALS, ACTIVITIES AND DAILY HISTORY
//     // ==========================================

//     const [
//       normalTotal,
//       autoTotal,
//       normalToday,
//       autoToday,
//       demoTotal,
//       demoToday,

//       normalPackages,
//       autoPackages,
//       demoUsers,

//       normalHistory,
//       autoHistory,
//       demoHistory
//     ] = await Promise.all([

//       // Real Normal - all packages
//       PackageActivation.aggregate([
//         { $match: normalMatch },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$packageAmount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]),

//       // Real Auto Compound - all packages
//       AutoCompoundV2.aggregate([
//         { $match: autoMatch },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$packageAmount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]),

//       // Real Normal - today
//       PackageActivation.aggregate([
//         { $match: normalTodayMatch },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$packageAmount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]),

//       // Real Auto Compound - today
//       AutoCompoundV2.aggregate([
//         { $match: autoTodayMatch },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$packageAmount" },
//             count: { $sum: 1 }
//           }
//         }
//       ]),

//       // Demo - all time
//       DummyUser.aggregate([
//         { $match: demoMatch },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$package" },
//             count: { $sum: 1 }
//           }
//         }
//       ]),

//       // Demo - today
//       DummyUser.aggregate([
//         { $match: demoTodayMatch },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: "$package" },
//             count: { $sum: 1 }
//           }
//         }
//       ]),

//       // Latest Real Normal entries
//       PackageActivation.find(normalMatch)
//         .sort({ startDate: -1 })
//         .limit(MAX_ENTRIES)
//         .select(
//           "userId memberId purchasedBy packageAmount startDate status"
//         )
//         .lean(),

//       // Latest Real Auto Compound entries
//       AutoCompoundV2.find(autoMatch)
//         .sort({ startDate: -1 })
//         .limit(MAX_ENTRIES)
//         .select(
//           "userId memberId purchasedBy packageAmount startDate status"
//         )
//         .lean(),

//       // Latest Demo entries
//       DummyUser.find(demoMatch)
//         .sort({ createdAt: -1 })
//         .limit(MAX_ENTRIES)
//         .select(
//           "userId name mobile package packageType country isDummy createdAt"
//         )
//         .lean(),

//       // Daily Real Normal history
//       getDailyHistory(
//         PackageActivation,
//         "startDate",
//         "packageAmount"
//       ),

//       // Daily Real Auto Compound history
//       getDailyHistory(
//         AutoCompoundV2,
//         "startDate",
//         "packageAmount"
//       ),

//       // Daily Demo history
//       getDailyHistory(
//         DummyUser,
//         "createdAt",
//         "package",
//         demoMatch
//       )
//     ]);

//     // ==========================================
//     // NORMALIZE TOTALS
//     // ==========================================

//     const normal = normalTotal[0] || { total: 0, count: 0 };
//     const auto = autoTotal[0] || { total: 0, count: 0 };

//     const normalDay = normalToday[0] || { total: 0, count: 0 };
//     const autoDay = autoToday[0] || { total: 0, count: 0 };

//     const demo = demoTotal[0] || { total: 0, count: 0 };
//     const demoDay = demoToday[0] || { total: 0, count: 0 };

//     // ==========================================
//     // REAL + DEMO SUMMARY
//     // ==========================================

//     const realGlobalInvestment =
//       Number(normal.total || 0) + Number(auto.total || 0);

//     const realTodayInvestment =
//       Number(normalDay.total || 0) + Number(autoDay.total || 0);

//     const demoGlobalInvestment = Number(demo.total || 0);
//     const demoTodayInvestment = Number(demoDay.total || 0);

//     const summary = {
//       globalInvestment:
//         realGlobalInvestment + demoGlobalInvestment,

//       todayInvestment:
//         realTodayInvestment + demoTodayInvestment,

//       activePackageCount:
//         Number(normal.count || 0) +
//         Number(auto.count || 0) +
//         Number(demo.count || 0),

//       todayPackageCount:
//         Number(normalDay.count || 0) +
//         Number(autoDay.count || 0) +
//         Number(demoDay.count || 0),

//       realGlobalInvestment,
//       realTodayInvestment,

//       demoGlobalInvestment,
//       demoTodayInvestment,

//       normalInvestment: Number(normal.total || 0),
//       normalTodayInvestment: Number(normalDay.total || 0),

//       autoCompoundInvestment: Number(auto.total || 0),
//       autoCompoundTodayInvestment: Number(autoDay.total || 0),

//       normalActiveCount: Number(normal.count || 0),
//       autoCompoundActiveCount: Number(auto.count || 0),

//       normalPackageCount: Number(normal.count || 0),
//       autoCompoundPackageCount: Number(auto.count || 0),

//       demoPackageCount: Number(demo.count || 0),
//       demoTodayCount: Number(demoDay.count || 0)
//     };

//     // ==========================================
//     // FETCH REAL MEMBER DETAILS
//     // ==========================================

//     const realMemberIds = [
//       ...new Set(
//         [...normalPackages, ...autoPackages]
//           .map(item =>
//             String(item.userId || item.memberId || "").trim()
//           )
//           .filter(Boolean)
//       )
//     ];

//     const realUsers = realMemberIds.length
//       ? await User.find({
//           userId: { $in: realMemberIds }
//         })
//           .select("userId name mobile")
//           .lean()
//       : [];

//     const realUserMap = new Map(
//       realUsers.map(user => [
//         String(user.userId),
//         {
//           name: user.name || "Member",
//           mobile: user.mobile || ""
//         }
//       ])
//     );

//     // ==========================================
//     // REAL NORMAL ACTIVITY
//     // ==========================================

//     const normalActivities = normalPackages.map(item => {
//       const memberId = String(
//         item.userId || item.memberId || ""
//       );

//       const member = realUserMap.get(memberId) || {};

//       return {
//         _id: item._id,
//         userId: memberId,
//         memberId,

//         name: member.name || "Member",
//         mobile: member.mobile || "",

//         amount: Number(item.packageAmount || 0),
//         packageAmount: Number(item.packageAmount || 0),

//         packageType: "Normal",
//         type: "normal_package",

//         isDemo: false,
//         activityLabel: "REAL",

//         status: item.status || "UNKNOWN",

//         createdAt: item.startDate,
//         startDate: item.startDate
//       };
//     });

//     // ==========================================
//     // REAL AUTO COMPOUND ACTIVITY
//     // ==========================================

//     const autoActivities = autoPackages.map(item => {
//       const memberId = String(
//         item.userId || item.memberId || ""
//       );

//       const member = realUserMap.get(memberId) || {};

//       return {
//         _id: item._id,
//         userId: memberId,
//         memberId,

//         name: member.name || "Member",
//         mobile: member.mobile || "",

//         amount: Number(item.packageAmount || 0),
//         packageAmount: Number(item.packageAmount || 0),

//         packageType: "Auto Compound V2",
//         type: "auto_compound_v2",

//         isDemo: false,
//         activityLabel: "REAL",

//         status: item.status || "UNKNOWN",

//         createdAt: item.startDate,
//         startDate: item.startDate
//       };
//     });

//     // ==========================================
//     // DEMO ACTIVITY
//     // ==========================================

//     const demoActivities = demoUsers.map(item => ({
//       _id: item._id,

//       userId: item.userId,
//       memberId: item.userId,

//       name: item.name || "Demo User",
//       mobile: item.mobile || "",

//       amount: Number(item.package || 0),
//       packageAmount: Number(item.package || 0),

//       packageType: item.packageType || "Normal",
//       type: "demo_topup",

//       isDemo: true,
//       activityLabel: "DEMO",
//       status: "DEMO",

//       country: item.country || "India",

//       createdAt: item.createdAt,
//       startDate: item.createdAt
//     }));

//     // ==========================================
//     // COMBINE AND LIMIT TO LATEST 500
//     // ==========================================

//     const combinedActivities = [
//       ...normalActivities,
//       ...autoActivities,
//       ...demoActivities
//     ]
//       .sort(
//         (a, b) =>
//           new Date(b.createdAt || 0).getTime() -
//           new Date(a.createdAt || 0).getTime()
//       )
//       .slice(0, MAX_ENTRIES);

//     // ==========================================
//     // COMBINE DAILY HISTORY
//     // ==========================================

//     const dailyMap = new Map();

//     const ensureDay = day => {
//       if (!dailyMap.has(day)) {
//         dailyMap.set(day, {
//           date: day,
//           realNormal: 0,
//           realAutoCompound: 0,
//           realTotal: 0,
//           demoTotal: 0,
//           combinedTotal: 0,
//           normalCount: 0,
//           autoCompoundCount: 0,
//           realCount: 0,
//           demoCount: 0,
//           combinedCount: 0
//         });
//       }

//       return dailyMap.get(day);
//     };

//     normalHistory.forEach(item => {
//       const row = ensureDay(item._id);
//       row.realNormal = Number(item.total || 0);
//       row.normalCount = Number(item.count || 0);
//     });

//     autoHistory.forEach(item => {
//       const row = ensureDay(item._id);
//       row.realAutoCompound = Number(item.total || 0);
//       row.autoCompoundCount = Number(item.count || 0);
//     });

//     demoHistory.forEach(item => {
//       const row = ensureDay(item._id);
//       row.demoTotal = Number(item.total || 0);
//       row.demoCount = Number(item.count || 0);
//     });

//     const dailyHistory = Array.from(dailyMap.values())
//       .map(row => {
//         row.realTotal =
//           row.realNormal + row.realAutoCompound;

//         row.realCount =
//           row.normalCount + row.autoCompoundCount;

//         row.combinedTotal =
//           row.realTotal + row.demoTotal;

//         row.combinedCount =
//           row.realCount + row.demoCount;

//         return row;
//       })
//       .sort((a, b) => b.date.localeCompare(a.date));

//     // ==========================================
//     // RESPONSE
//     // ==========================================

//     return res.json({
//       success: true,
//       currency: "USD",
//       date,
//       summary,
//       dailyHistory,
//       packages: combinedActivities,
//       demoTransactions: demoActivities
//     });

//   } catch (error) {
//     console.error("[GLOBAL INVESTMENT API ERROR]", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to load global investment"
//     });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();

const calculateBalances = require("../services/balanceService");

const User = require("../models/User");
const PackageActivation = require("../models/PackageActivation");
const AutoCompoundV2 = require("../models/AutoCompoundV2");
const DummyUser = require("../models/DummyUser");

const MAX_ENTRIES = 500;

// ==========================================
// INDIA DATE RANGE
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
// DAILY HISTORY
// ==========================================

const getDailyHistory = async (Model, dateField, amountField, match = {}) => {
  return Model.aggregate([
    {
      $match: {
        ...match,
        [dateField]: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: `$${dateField}`,
            timezone: "Asia/Kolkata"
          }
        },
        total: { $sum: `$${amountField}` },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};

// ==========================================
// EXISTING USER DASHBOARD
// ==========================================

router.get("/:userId", async (req, res, next) => {
  if (req.params.userId === "global-investment") {
    return next();
  }

  try {
    const balances = await calculateBalances(req.params.userId);
    return res.json(balances);
  } catch (error) {
    console.error("[USER DASHBOARD ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ==========================================
// GLOBAL INVESTMENT DASHBOARD
// ==========================================

router.get("/global-investment", async (req, res) => {
  try {
    const { start, end, date } = getIndiaDayRange();

    // All package statuses are included.
    const normalMatch = {};
    const autoMatch = {};

    const normalTodayMatch = {
      startDate: { $gte: start, $lt: end }
    };

    const autoTodayMatch = {
      startDate: { $gte: start, $lt: end }
    };

    // Demo + Promo records are stored in DummyUser.
    const demoMatch = {
      isDummy: true
    };

    const demoTodayMatch = {
      ...demoMatch,
      createdAt: { $gte: start, $lt: end }
    };

    // ==========================================
    // FETCH TOTALS, ACTIVITIES AND DAILY HISTORY
    // ==========================================

    const [
      normalTotal,
      autoTotal,
      normalToday,
      autoToday,
      demoTotal,
      demoToday,

      normalPackages,
      autoPackages,
      demoUsers,

      normalHistory,
      autoHistory,
      demoHistory
    ] = await Promise.all([

      // Real Normal - all packages
      PackageActivation.aggregate([
        { $match: normalMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$packageAmount" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Real Auto Compound - all packages
      AutoCompoundV2.aggregate([
        { $match: autoMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$packageAmount" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Real Normal - today
      PackageActivation.aggregate([
        { $match: normalTodayMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$packageAmount" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Real Auto Compound - today
      AutoCompoundV2.aggregate([
        { $match: autoTodayMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$packageAmount" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Demo + Promo - all time
      DummyUser.aggregate([
        { $match: demoMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$package" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Demo + Promo - today
      DummyUser.aggregate([
        { $match: demoTodayMatch },
        {
          $group: {
            _id: null,
            total: { $sum: "$package" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Latest Real Normal entries
      PackageActivation.find(normalMatch)
        .sort({ startDate: -1 })
        .limit(MAX_ENTRIES)
        .select(
          "userId memberId purchasedBy packageAmount startDate status"
        )
        .lean(),

      // Latest Real Auto Compound entries
      AutoCompoundV2.find(autoMatch)
        .sort({ startDate: -1 })
        .limit(MAX_ENTRIES)
        .select(
          "userId memberId purchasedBy packageAmount startDate status"
        )
        .lean(),

      // Latest Demo + Promo entries
      DummyUser.find(demoMatch)
        .sort({ createdAt: -1 })
        .limit(MAX_ENTRIES)
        .select(
          "userId name mobile package packageType country countryCode isDummy isPromo promoUserId createdAt"
        )
        .lean(),

      // Daily Real Normal history
      getDailyHistory(
        PackageActivation,
        "startDate",
        "packageAmount"
      ),

      // Daily Real Auto Compound history
      getDailyHistory(
        AutoCompoundV2,
        "startDate",
        "packageAmount"
      ),

      // Daily Demo + Promo history
      getDailyHistory(
        DummyUser,
        "createdAt",
        "package",
        demoMatch
      )
    ]);

    // ==========================================
    // NORMALIZE TOTALS
    // ==========================================

    const normal = normalTotal[0] || { total: 0, count: 0 };
    const auto = autoTotal[0] || { total: 0, count: 0 };

    const normalDay = normalToday[0] || { total: 0, count: 0 };
    const autoDay = autoToday[0] || { total: 0, count: 0 };

    const demo = demoTotal[0] || { total: 0, count: 0 };
    const demoDay = demoToday[0] || { total: 0, count: 0 };

    // ==========================================
    // REAL + DEMO + PROMO SUMMARY
    // ==========================================

    const realGlobalInvestment =
      Number(normal.total || 0) + Number(auto.total || 0);

    const realTodayInvestment =
      Number(normalDay.total || 0) + Number(autoDay.total || 0);

    const demoGlobalInvestment = Number(demo.total || 0);
    const demoTodayInvestment = Number(demoDay.total || 0);

    const summary = {
      globalInvestment:
        realGlobalInvestment + demoGlobalInvestment,

      todayInvestment:
        realTodayInvestment + demoTodayInvestment,

      activePackageCount:
        Number(normal.count || 0) +
        Number(auto.count || 0) +
        Number(demo.count || 0),

      todayPackageCount:
        Number(normalDay.count || 0) +
        Number(autoDay.count || 0) +
        Number(demoDay.count || 0),

      realGlobalInvestment,
      realTodayInvestment,

      demoGlobalInvestment,
      demoTodayInvestment,

      normalInvestment: Number(normal.total || 0),
      normalTodayInvestment: Number(normalDay.total || 0),

      autoCompoundInvestment: Number(auto.total || 0),
      autoCompoundTodayInvestment: Number(autoDay.total || 0),

      normalActiveCount: Number(normal.count || 0),
      autoCompoundActiveCount: Number(auto.count || 0),

      normalPackageCount: Number(normal.count || 0),
      autoCompoundPackageCount: Number(auto.count || 0),

      demoPackageCount: Number(demo.count || 0),
      demoTodayCount: Number(demoDay.count || 0)
    };

    // ==========================================
    // FETCH REAL MEMBER DETAILS
    // ==========================================

    const realMemberIds = [
      ...new Set(
        [...normalPackages, ...autoPackages]
          .map(item =>
            String(item.userId || item.memberId || "").trim()
          )
          .filter(Boolean)
      )
    ];

    const realUsers = realMemberIds.length
      ? await User.find({
          userId: { $in: realMemberIds }
        })
          .select("userId name mobile")
          .lean()
      : [];

    const realUserMap = new Map(
      realUsers.map(user => [
        String(user.userId),
        {
          name: user.name || "Member",
          mobile: user.mobile || ""
        }
      ])
    );

    // ==========================================
    // REAL NORMAL ACTIVITY
    // ==========================================

    const normalActivities = normalPackages.map(item => {
      const memberId = String(
        item.userId || item.memberId || ""
      );

      const member = realUserMap.get(memberId) || {};

      return {
        _id: item._id,
        userId: memberId,
        memberId,

        name: member.name || "Member",
        mobile: member.mobile || "",

        amount: Number(item.packageAmount || 0),
        packageAmount: Number(item.packageAmount || 0),

        packageType: "Normal",
        type: "normal_package",

        isDemo: false,
        activityLabel: "REAL",

        status: item.status || "UNKNOWN",

        createdAt: item.startDate,
        startDate: item.startDate
      };
    });

    // ==========================================
    // REAL AUTO COMPOUND ACTIVITY
    // ==========================================

    const autoActivities = autoPackages.map(item => {
      const memberId = String(
        item.userId || item.memberId || ""
      );

      const member = realUserMap.get(memberId) || {};

      return {
        _id: item._id,
        userId: memberId,
        memberId,

        name: member.name || "Member",
        mobile: member.mobile || "",

        amount: Number(item.packageAmount || 0),
        packageAmount: Number(item.packageAmount || 0),

        packageType: "Auto Compound V2",
        type: "auto_compound_v2",

        isDemo: false,
        activityLabel: "REAL",

        status: item.status || "UNKNOWN",

        createdAt: item.startDate,
        startDate: item.startDate
      };
    });

    // ==========================================
    // DEMO + PROMO ACTIVITY
    // ==========================================

    const demoActivities = demoUsers.map(item => {
      // Promo TopUp records are also stored in DummyUser.
      const isPromo = Boolean(item.isPromo || item.promoUserId);

      return {
        _id: item._id,

        userId: item.userId,
        memberId: item.userId,

        name: item.name || (isPromo ? "Promo User" : "Demo User"),
        mobile: item.mobile || "",

        amount: Number(item.package || 0),
        packageAmount: Number(item.package || 0),

        packageType: item.packageType || "Normal",

        type: isPromo
          ? (item.packageType === "Auto Compound V2"
              ? "promo_auto_compound"
              : "promo_package")
          : "demo_topup",

        isDemo: !isPromo,
        isPromo,

        activityLabel: isPromo ? "PROMO" : "DEMO",
        status: isPromo ? "PROMO" : "DEMO",

        country: item.country || "India",
        countryCode: item.countryCode || "",

        createdAt: item.createdAt,
        startDate: item.createdAt
      };
    });

    // ==========================================
    // COMBINE AND LIMIT TO LATEST 500
    // ==========================================

    const combinedActivities = [
      ...normalActivities,
      ...autoActivities,
      ...demoActivities
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, MAX_ENTRIES);

    // ==========================================
    // COMBINE DAILY HISTORY
    // ==========================================

    const dailyMap = new Map();

    const ensureDay = day => {
      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          date: day,
          realNormal: 0,
          realAutoCompound: 0,
          realTotal: 0,
          demoTotal: 0,
          combinedTotal: 0,
          normalCount: 0,
          autoCompoundCount: 0,
          realCount: 0,
          demoCount: 0,
          combinedCount: 0
        });
      }

      return dailyMap.get(day);
    };

    normalHistory.forEach(item => {
      const row = ensureDay(item._id);
      row.realNormal = Number(item.total || 0);
      row.normalCount = Number(item.count || 0);
    });

    autoHistory.forEach(item => {
      const row = ensureDay(item._id);
      row.realAutoCompound = Number(item.total || 0);
      row.autoCompoundCount = Number(item.count || 0);
    });

    demoHistory.forEach(item => {
      const row = ensureDay(item._id);
      row.demoTotal = Number(item.total || 0);
      row.demoCount = Number(item.count || 0);
    });

    const dailyHistory = Array.from(dailyMap.values())
      .map(row => {
        row.realTotal =
          row.realNormal + row.realAutoCompound;

        row.realCount =
          row.normalCount + row.autoCompoundCount;

        row.combinedTotal =
          row.realTotal + row.demoTotal;

        row.combinedCount =
          row.realCount + row.demoCount;

        return row;
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({
      success: true,
      currency: "USD",
      date,
      summary,
      dailyHistory,
      packages: combinedActivities,
      demoTransactions: demoActivities,
      promoTransactions: demoActivities.filter(item => item.isPromo)
    });

  } catch (error) {
    console.error("[GLOBAL INVESTMENT API ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load global investment"
    });
  }
});

module.exports = router;