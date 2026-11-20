const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // 🔥 Naya OTP ke liye

// Models
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Setting = require('../models/Setting');
const TopUp = require('../models/TopUp'); 
const DummyTransaction = require('../models/DummyTransaction');
const DummyUser = require('../models/DummyUser.js'); 
 const FakeUser = require('../models/FakeUser');
const PackageActivation = require('../models/PackageActivation'); // 🔥 YE IMPORT ZAROORI HAI
const AutoCompoundV2 = require("../models/AutoCompoundV2");
// Middleware & Utils
const authMiddleware = require('../middleware/authMiddleware');
const checkFeature = require("../middleware/checkFeatureEnabled");
const { bot } = require('../utils/telegramBot');

// ==========================================
// 🔥 SMTP Transporter Setup (OTP ke liye)
// ==========================================
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.privateemail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 👇 ISKE NICHE AAPKE SAARE ROUTES (API) AAYENGE 👇
// Controllers
// Controllers ko import kiya
const {
  getUserById,
  blockUser,
  unblockUser,
  getAllUsers,
  getSponsorName // 👈 Ye add kiya hai naye logic ke liye
} = require('../controllers/userController');

// ==========================================
// 🚀 ROUTES DEFINITION
// ==========================================


// =========================================================================
// 🔥 NEW SMART CAPPING ENGINE FOR REAL TOPUPS (SYNCED WITH CRON)
// =========================================================================
const processGlobalTeamGrowth = async (excludeUserId) => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Sirf Active Users ko uthayenge aur jisne ID lagayi hai (excludeUserId) usko chhod denge
    const activeUsers = await User.find({ isToppedUp: true, userId: { $ne: excludeUserId } })
        .select('_id globalTeamCount directCount todayGlobalTeamAdded lastGlobalTeamAddDate');

    const bulkOps = [];

    for (const user of activeUsers) {
        const team = user.globalTeamCount || 0;
        const directs = user.directCount || 0;

        // Daily limit reset check (Sirf Admin panel me dikhane ke liye chahiye)
        let todayAdded = user.todayGlobalTeamAdded || 0;
        if (user.lastGlobalTeamAddDate !== todayStr) {
            todayAdded = 0;
        }

        // --- STEP 1: STRICT MILESTONE LOCKS (Level 6 Tak Free Growth) ---
        let isLocked = false;
        
        // 🔥 Level 5 (760) ka lock hata diya. Ab seedha Level 6 (2360) par lock lagega
        if (team === 2360 && directs < 6) isLocked = true;       // Level 6 to 7
        else if (team === 4360 && directs < 8) isLocked = true;  // Level 7 to 8
        else if (team === 7360 && directs < 10) isLocked = true; // Level 8 to 9
        else if (team === 11360 && directs < 12) isLocked = true; // Level 9 to 10
        else if (team === 16360 && directs < 14) isLocked = true; // Level 10 to 11
        else if (team === 23860 && directs < 16) isLocked = true; // Level 11 to 12
        else if (team === 33860 && directs < 18) isLocked = true; // Full Plan Complete

        if (isLocked) continue; // Agar exact milestone par direct kam hain, toh yahin Jam/Freeze kardo.

        // --- STEP 2: DAILY CAPPING LOGIC (REMOVED COMPLETELY) ---
        // Ab koi daily limit nahi hai, natural badhega.

        // --- STEP 3: BULK UPDATE PREPARATION ---
        if (user.lastGlobalTeamAddDate !== todayStr) {
            // 🔄 NAYA DIN AAYA HAI: Aaj ka count DB me 1 se restart karo
            bulkOps.push({
                updateOne: {
                    filter: { _id: user._id },
                    update: {
                        $inc: { globalTeamCount: 1 },
                        $set: { todayGlobalTeamAdded: 1, lastGlobalTeamAddDate: todayStr }
                    }
                }
            });
        } else {
            // ⏩ SAME DIN HAI: Normal increment karte raho
            bulkOps.push({
                updateOne: {
                    filter: { _id: user._id },
                    update: {
                        $inc: { globalTeamCount: 1, todayGlobalTeamAdded: 1 },
                        $set: { lastGlobalTeamAddDate: todayStr }
                    }
                }
            });
        }
    }

    // Ek sath sabhi users ko DB mein update karo
    if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
    }
};

router.get('/check-sponsor/:id', async (req, res) => {
    try {
        const searchId = new RegExp('^' + req.params.id + '$', 'i'); // Case insensitive search taaki wf aur WF dono chal jaye

        // 1. Pehle REAL User database me check karo
        let sponsor = await User.findOne({ userId: searchId });

        // 2. Agar Real User nahi mila, toh DUMMY User database me check karo
        if (!sponsor) {
            sponsor = await DummyUser.findOne({ userId: searchId });
        }

        // 3. Agar dono me nahi mila, tabhi Invalid error do
        if (!sponsor) {
            return res.status(404).json({ message: "❌ Invalid Sponsor ID" });
        }

        // 4. Agar mil gaya (Real ya Dummy koi bhi), toh uska naam wapas bhej do
        res.json({ name: sponsor.name });
    } catch (err) {
        console.error("Check Sponsor Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});






// =======================================================
// SHARED HELPERS
// =======================================================

const getLoggedInUserId = (req) => {
  return String(
    req.user?.userId || req.user?.id || req.user || ""
  ).trim();
};

const getIndiaDateKey = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

// Find downline up to 12 levels
const getDownlineData = async (userId) => {
  const downlineMap = {};
  const visited = new Set([userId]);

  let currentLevelIds = [userId];

  for (let level = 1; level <= 12; level++) {
    if (!currentLevelIds.length) break;

    const users = await User.find({
      sponsorId: { $in: currentLevelIds },
    })
      .select("userId name")
      .lean();

    const nextLevelIds = [];

    for (const user of users) {
      const childId = String(user.userId || "").trim();

      if (!childId || visited.has(childId)) continue;

      visited.add(childId);

      downlineMap[childId] = {
        level,
        name: user.name || "User",
      };

      nextLevelIds.push(childId);
    }

    currentLevelIds = nextLevelIds;
  }

  return {
    downlineMap,
    downlineUserIds: Object.keys(downlineMap),
    directUserIds: Object.keys(downlineMap).filter(
      (id) => downlineMap[id].level === 1
    ),
  };
};

// Fetch Normal Package + Auto Compound V2 purchases
const getPackagesForUsers = async (userIds) => {
  if (!userIds.length) return [];

  const [normalPackages, autoPackages] = await Promise.all([
    PackageActivation.find({
      userId: { $in: userIds },
    })
      .select("userId packageAmount startDate")
      .lean(),

    AutoCompoundV2.find({
      userId: { $in: userIds },
    })
      .select("userId packageAmount startDate")
      .lean(),
  ]);

  return [...normalPackages, ...autoPackages];
};

// =======================================================
// 1. DOWNLINE BUSINESS
// Only Direct Business + Team Business
// No Daily Salary calculation in this API
// =======================================================

router.get("/downline-business", authMiddleware, async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const todayStr = getIndiaDateKey(new Date());

    const {
      downlineMap,
      downlineUserIds,
    } = await getDownlineData(userId);

    const allPackages = await getPackagesForUsers(downlineUserIds);

    let totalDirect = 0;
    let todayDirect = 0;
    let totalLevel = 0;
    let todayLevel = 0;

    const groupedByDate = {};

    for (const pkg of allPackages) {
      const pkgUserId = String(pkg.userId || "");
      const downlineInfo = downlineMap[pkgUserId];

      if (!downlineInfo || !pkg.startDate) continue;

      const amount = Number(pkg.packageAmount) || 0;

      if (amount <= 0) continue;

      const packageDate = new Date(pkg.startDate);

      if (Number.isNaN(packageDate.getTime())) continue;

      const dateKey = getIndiaDateKey(packageDate);
      const level = downlineInfo.level;
      const isToday = dateKey === todayStr;

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          rawDate: packageDate,
          direct: 0,
          team: 0,
        };
      }

      if (packageDate > groupedByDate[dateKey].rawDate) {
        groupedByDate[dateKey].rawDate = packageDate;
      }

      if (level === 1) {
        totalDirect += amount;

        if (isToday) todayDirect += amount;

        groupedByDate[dateKey].direct += amount;
      } else {
        totalLevel += amount;

        if (isToday) todayLevel += amount;

        groupedByDate[dateKey].team += amount;
      }
    }

    // Prepare history for frontend
    const finalData = [];
    let idCounter = 1;

    Object.values(groupedByDate)
      .sort((a, b) => b.rawDate - a.rawDate)
      .forEach((day) => {
        if (day.direct > 0) {
          finalData.push({
            _id: idCounter++,
            date: day.rawDate,
            type: "Direct Business",
            amount: Number(day.direct.toFixed(2)),
          });
        }

        if (day.team > 0) {
          finalData.push({
            _id: idCounter++,
            date: day.rawDate,
            type: "Team Business",
            amount: Number(day.team.toFixed(2)),
          });
        }
      });

    return res.status(200).json({
      success: true,
      stats: {
        totalDirect: Number(totalDirect.toFixed(2)),
        todayDirect: Number(todayDirect.toFixed(2)),
        totalLevel: Number(totalLevel.toFixed(2)),
        todayLevel: Number(todayLevel.toFixed(2)),
      },
      data: finalData,
    });
  } catch (error) {
    console.error("Downline business error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching business data",
    });
  }
});

// =======================================================
// 2. DAILY SALARY INFORMATION
// Only Direct Business counts for salary qualification
// Timer starts from user's earliest own package date
// =======================================================

router.get("/daily-salary", authMiddleware, async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const now = new Date();

    const salarySlabs = [
      { business: 500, dailySalary: 3 },
      { business: 1000, dailySalary: 6 },
      { business: 3000, dailySalary: 20 },
      { business: 5000, dailySalary: 40 },
    ];

    // Get user's own earliest package from BOTH collections
    const [ownNormalPackage, ownAutoPackage, currentUser] =
      await Promise.all([
        PackageActivation.findOne({ userId })
          .sort({ startDate: 1 })
          .select("startDate")
          .lean(),

        AutoCompoundV2.findOne({ userId })
          .sort({ startDate: 1 })
          .select("startDate")
          .lean(),

        User.findOne({ userId })
          .select(
            "salaryStatus salaryQualifiedBusiness salaryDailyAmount salaryDaysPaid salaryPayoutStartAt salaryLastPaidDate"
          )
          .lean(),
      ]);

    const ownPackageDates = [
      ownNormalPackage?.startDate,
      ownAutoPackage?.startDate,
    ]
      .filter(Boolean)
      .map((date) => new Date(date))
      .filter((date) => !Number.isNaN(date.getTime()));

    ownPackageDates.sort((a, b) => a.getTime() - b.getTime());

    const firstPackageDate = ownPackageDates[0] || null;

    // No package yet: timer has not started
    if (!firstPackageDate) {
      return res.status(200).json({
        success: true,
        salary: {
          firstPackageDate: null,
          qualificationEndAt: null,
          payoutStartAt: null,
          qualificationDays: 15,
          qualificationDirectBusiness: 0,
          timerStatus: "not_started",
          remainingQualificationMs: 0,
          achievedSlab: null,
          nextSlab: {
            business: 500,
            dailySalary: 3,
          },
          businessNeededForNextSlab: 500,
          lockedDailySalary: 0,
          daysPaid: 0,
          remainingPayoutDays: 0,
        },
      });
    }

    // Qualification period: first package date + 15 days
    const qualificationEndAt = new Date(firstPackageDate);
    qualificationEndAt.setDate(qualificationEndAt.getDate() + 15);

    // Find only user's direct referrals (level 1)
    const directUsers = await User.find({
      sponsorId: userId,
    })
      .select("userId")
      .lean();

    const directUserIds = directUsers
      .map((user) => String(user.userId || "").trim())
      .filter(Boolean);

    // Fetch direct referral purchases from both package collections
    const directPackages = await getPackagesForUsers(directUserIds);

    // Count package purchases only within user's 15-day window
    const qualificationPackages = directPackages.filter((pkg) => {
      if (!pkg.startDate) return false;

      const packageDate = new Date(pkg.startDate);

      return (
        !Number.isNaN(packageDate.getTime()) &&
        packageDate >= firstPackageDate &&
        packageDate < qualificationEndAt
      );
    });

    const calculatedDirectBusiness = qualificationPackages.reduce(
      (sum, pkg) => sum + (Number(pkg.packageAmount) || 0),
      0
    );

    // Check whether salary slab has already been locked by cron
    const lockedStatuses = [
      "qualified",
      "not_qualified",
      "completed",
    ];

    const isLocked = lockedStatuses.includes(
      currentUser?.salaryStatus
    );

    const qualificationDirectBusiness = isLocked
      ? Number(currentUser?.salaryQualifiedBusiness) || 0
      : calculatedDirectBusiness;

    // Find achieved slab
    const getAchievedSlab = (business) => {
      let achieved = null;

      for (const slab of salarySlabs) {
        if (business >= slab.business) {
          achieved = slab;
        }
      }

      return achieved;
    };

    let achievedSlab = null;

    if (isLocked) {
      const lockedAmount =
        Number(currentUser?.salaryDailyAmount) || 0;

      achievedSlab =
        salarySlabs.find(
          (slab) => slab.dailySalary === lockedAmount
        ) || null;
    } else {
      achievedSlab = getAchievedSlab(
        qualificationDirectBusiness
      );
    }

    // Next target is shown only while qualification is running
    const nextSlab = isLocked
      ? null
      : salarySlabs.find(
          (slab) =>
            slab.business > qualificationDirectBusiness
        ) || null;

    const businessNeededForNextSlab = nextSlab
      ? Math.max(
          0,
          nextSlab.business - qualificationDirectBusiness
        )
      : 0;

    let payoutStartAt = new Date(qualificationEndAt);
    payoutStartAt.setDate(payoutStartAt.getDate() + 1);

    if (currentUser?.salaryPayoutStartAt) {
      payoutStartAt = new Date(currentUser.salaryPayoutStartAt);
    }

    let timerStatus = "qualification_running";
    let remainingQualificationMs = 0;

    if (isLocked) {
      timerStatus = currentUser.salaryStatus;
    } else if (now < qualificationEndAt) {
      timerStatus = "qualification_running";

      remainingQualificationMs =
        qualificationEndAt.getTime() - now.getTime();
    } else {
      // Period ended; cron still needs to lock the slab
      timerStatus =
        qualificationDirectBusiness >= 500
          ? "qualification_completed"
          : "not_qualified";
    }

    const daysPaid = Number(currentUser?.salaryDaysPaid) || 0;

    const remainingPayoutDays =
      currentUser?.salaryStatus === "qualified"
        ? Math.max(0, 90 - daysPaid)
        : 0;

    const lockedDailySalary =
      Number(currentUser?.salaryDailyAmount) || 0;

    const salary = {
      firstPackageDate,
      qualificationEndAt,
      payoutStartAt,

      qualificationDays: 15,

      qualificationDirectBusiness: Number(
        qualificationDirectBusiness.toFixed(2)
      ),

      timerStatus,
      remainingQualificationMs,

      achievedSlab: achievedSlab
        ? {
            business: achievedSlab.business,
            dailySalary: achievedSlab.dailySalary,
            total90DaySalary:
              achievedSlab.dailySalary * 90,
          }
        : null,

      nextSlab: nextSlab
        ? {
            business: nextSlab.business,
            dailySalary: nextSlab.dailySalary,
          }
        : null,

      businessNeededForNextSlab: Number(
        businessNeededForNextSlab.toFixed(2)
      ),

      lockedDailySalary,
      daysPaid,
      remainingPayoutDays,
    };

    return res.status(200).json({
      success: true,
      salary,
    });
  } catch (error) {
    console.error("Daily salary API error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching Daily Salary information",
    });
  }
});




 

router.get("/downline-business", authMiddleware, async (req, res) => {
  try {
    const userId = String(
      req.user?.userId || req.user?.id || req.user?._id || req.user || ""
    ).trim();

    if (!userId || userId === "[object Object]") {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const todayKey = getIndiaDateKey(new Date());

    // Build downline tree up to Level 12
    const downlineMap = Object.create(null);
    const visited = new Set([userId]);
    let currentLevelIds = [userId];

    for (let level = 1; level <= 12; level += 1) {
      if (currentLevelIds.length === 0) break;

      const users = await User.find({
        sponsorId: { $in: currentLevelIds },
      })
        .select("userId name")
        .lean();

      const nextLevelIds = [];

      for (const member of users) {
        const memberId = String(member.userId || "").trim();

        if (!memberId || visited.has(memberId)) continue;

        visited.add(memberId);

        downlineMap[memberId] = {
          level,
          name: member.name || "User",
        };

        nextLevelIds.push(memberId);
      }

      currentLevelIds = nextLevelIds;
    }

    const downlineIds = Object.keys(downlineMap);

    // Fetch Normal Package + Auto Compound V2 purchases
    const [normalPackages, autoPackages] = await Promise.all([
      downlineIds.length
        ? PackageActivation.find({
            userId: { $in: downlineIds },
          })
            .select("userId packageAmount startDate")
            .lean()
        : [],

      downlineIds.length
        ? AutoCompoundV2.find({
            userId: { $in: downlineIds },
          })
            .select("userId packageAmount startDate")
            .lean()
        : [],
    ]);

    const allPackages = [...normalPackages, ...autoPackages];

    let totalDirect = 0;
    let todayDirect = 0;
    let totalLevel = 0;
    let todayLevel = 0;

    const byDate = Object.create(null);

    for (const pkg of allPackages) {
      const memberId = String(pkg.userId || "");
      const memberInfo = downlineMap[memberId];

      if (!memberInfo || !pkg.startDate) continue;

      const amount = Number(pkg.packageAmount) || 0;
      const date = new Date(pkg.startDate);

      if (amount <= 0 || Number.isNaN(date.getTime())) continue;

      const dateKey = getIndiaDateKey(date);
      const isDirect = memberInfo.level === 1;

      if (!byDate[dateKey]) {
        byDate[dateKey] = {
          date,
          direct: 0,
          team: 0,
        };
      }

      if (isDirect) {
        totalDirect += amount;

        if (dateKey === todayKey) {
          todayDirect += amount;
        }

        byDate[dateKey].direct += amount;
      } else {
        totalLevel += amount;

        if (dateKey === todayKey) {
          todayLevel += amount;
        }

        byDate[dateKey].team += amount;
      }

      if (date > byDate[dateKey].date) {
        byDate[dateKey].date = date;
      }
    }

    // Prepare date-wise business history
    const data = [];
    let rowId = 1;

    Object.values(byDate)
      .sort((a, b) => b.date - a.date)
      .forEach((day) => {
        if (day.direct > 0) {
          data.push({
            _id: rowId++,
            date: day.date,
            type: "Direct Business",
            amount: Number(day.direct.toFixed(2)),
          });
        }

        if (day.team > 0) {
          data.push({
            _id: rowId++,
            date: day.date,
            type: "Team Business",
            amount: Number(day.team.toFixed(2)),
          });
        }
      });

    return res.status(200).json({
      success: true,
      stats: {
        totalDirect: Number(totalDirect.toFixed(2)),
        todayDirect: Number(todayDirect.toFixed(2)),
        totalLevel: Number(totalLevel.toFixed(2)),
        todayLevel: Number(todayLevel.toFixed(2)),
      },
      data,
    });
  } catch (error) {
    console.error("Error fetching downline business:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching business data",
    });
  }
});

// =======================================================
// DOWNLINE BUSINESS + DAILY SALARY QUALIFICATION
// =======================================================
 
// =======================================================
// 🚀 FIXED ROUTE: GET DOWNLINE BUSINESS (Using PackageActivation)
// =======================================================
// router.get('/downline-business', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.userId || req.user.id || req.user;

//         let currentLevelIds = [userId];
//         let downlineMap = {}; 
//         let currentLevel = 1;

//         // 1. Downline Structure nikalo
//         while (currentLevelIds.length > 0 && currentLevel <= 12) {
//             const users = await User.find({ sponsorId: { $in: currentLevelIds } }).select("userId name");
//             let nextLevelIds = [];

//             users.forEach(u => {
//                 downlineMap[u.userId] = { level: currentLevel, name: u.name || "User" };
//                 nextLevelIds.push(u.userId);
//             });

//             currentLevelIds = nextLevelIds;
//             currentLevel++;
//         }

//         const downlineUserIds = Object.keys(downlineMap);

//         // 2. Fetch Active Packages
//         const topups = await PackageActivation.find({
//             userId: { $in: downlineUserIds },
//             status: 'active'
//         });

//         let totalDirect = 0, todayDirect = 0;
//         let totalLevel = 0, todayLevel = 0;
        
//         const todayStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }).split(',')[0];

//         // 🔥 GROUP BY DATE LOGIC
//         let groupedByDate = {};

//         topups.forEach(pkg => {
//             const amt = Number(pkg.packageAmount) || 0;
//             const userLvl = downlineMap[pkg.userId].level;
            
//             const txDate = new Date(pkg.startDate);
//             const txDateStr = txDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }).split(',')[0];
//             const isToday = (txDateStr === todayStr);

//             // 4 Box Stats
//             if (userLvl === 1) {
//                 totalDirect += amt;
//                 if (isToday) todayDirect += amt;
//             } else if (userLvl >= 2 && userLvl <= 12) {
//                 totalLevel += amt;
//                 if (isToday) todayLevel += amt;
//             }

//             // Grouping Daily Business
//             if (userLvl <= 12) {
//                 if (!groupedByDate[txDateStr]) {
//                     groupedByDate[txDateStr] = { dateStr: txDateStr, rawDate: txDate, direct: 0, team: 0 };
//                 }
//                 if (userLvl === 1) {
//                     groupedByDate[txDateStr].direct += amt;
//                 } else {
//                     groupedByDate[txDateStr].team += amt;
//                 }
//             }
//         });

//         // 🔥 Format Data for Frontend Table
//         let finalData = [];
//         let idCounter = 1;

//         Object.values(groupedByDate)
//             .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)) // Latest first
//             .forEach(day => {
//                 if (day.direct > 0) {
//                     finalData.push({
//                         _id: idCounter++,
//                         date: day.rawDate,
//                         type: "Direct Business",
//                         amount: day.direct
//                     });
//                 }
//                 if (day.team > 0) {
//                     finalData.push({
//                         _id: idCounter++,
//                         date: day.rawDate,
//                         type: "Team Business",
//                         amount: day.team
//                     });
//                 }
//             });

//         res.status(200).json({
//             success: true,
//             stats: { 
//                 totalDirect, todayDirect, 
//                 totalLevel, todayLevel 
//             },
//             data: finalData
//         });

//     } catch (error) {
//         console.error("Error fetching downline business:", error);
//         res.status(500).json({ success: false, message: "Server Error while fetching business data" });
//     }
// });



// ==============================================================
// 🏆 1. YE ROUTE SABSE UPAR HONA CHAHIYE (ID wale routes se pehle)
// ==============================================================
// router.get('/salary-achievers-list', authMiddleware, async (req, res) => {
//     try {
//         const realUsers = await User.find({ isSalaryQualified: true })
//             .select('userId name topUpAmount createdAt').lean();

//         let achievers = realUsers.map(u => ({
//             userId: u.userId,
//             name: u.name || "User",
//             amount: u.topUpAmount || 50,
//             type: 'Real Achiever'
//         }));

//         const fakeUsers = await DummyUser.find({ package: { $gte: 50 } })
//             .sort({ _id: 1 }).limit(201).lean();

//         const formattedFake = fakeUsers.map(u => ({
//             userId: u.userId,
//             name: u.name || "User",
//             amount: u.package || 50,
//             type: 'System Achiever'
//         }));

//         achievers = [...achievers, ...formattedFake];
//         achievers.sort((a, b) => b.amount - a.amount);

//         res.json({ success: true, totalAchievers: achievers.length, data: achievers });
//     } catch (error) {
//         console.error("Salary Achievers Error:", error);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// });

// ==========================================
// 🏆 SALARY ACHIEVERS LIST (REAL + 201 FAKE)
// ==========================================
// router.get('/salary-achievers-list', authMiddleware, async (req, res) => {
//     try {
//         // 1. GET REAL ACHIEVERS (Jinhone sach me target pura kiya hai)
//         const realUsers = await User.find({ isSalaryQualified: true })
//             .select('userId name topUpAmount createdAt')
//             .lean();

//         let achievers = realUsers.map(u => ({
//             userId: u.userId,
//             name: u.name || "User",
//             amount: u.topUpAmount || 50,
//             type: 'Real Achiever'
//         }));

//         // 2. GET FAKE ACHIEVERS (Pehle DB se uthao)
//         const fakeUsers = await DummyUser.find()
//             .sort({ _id: 1 }) 
//             .limit(201)
//             .lean();

//         let formattedFake = fakeUsers.map(u => {
//             // Har dummy user ko consistent amount dena
//             const charCode = u.userId ? u.userId.charCodeAt(u.userId.length - 1) : 0;
//             let fallbackAmt = 50;
//             if (charCode % 5 === 0) fallbackAmt = 500;
//             else if (charCode % 3 === 0) fallbackAmt = 100;
//             else if (charCode % 2 === 0) fallbackAmt = 200;

//             return {
//                 userId: u.userId,
//                 name: u.name || "User",
//                 amount: (u.package && u.package >= 50) ? u.package : fallbackAmt,
//                 type: 'System Achiever'
//             };
//         });

//         // 🔥 3. AUTO-GENERATE LOGIC: Agar 201 log nahi mile, toh khud bana lo!
//         if (formattedFake.length < 201) {
//             const needed = 201 - formattedFake.length;
//             const amounts = [50, 100, 50, 200, 50, 100, 500, 50]; // Random realistic amounts
//             const firstNames = ["Aarav", "Vikram", "Rohan", "Sneha", "Rahul", "Pooja", "Amit", "Karan", "Priya", "Suresh", "Neha", "Vikas"];
            
//             for (let i = 0; i < needed; i++) {
//                 const rAmt = amounts[i % amounts.length];
//                 const rName = firstNames[i % firstNames.length] + " " + String.fromCharCode(65 + (i % 26)); // Example: Rahul M
                
//                 formattedFake.push({
//                     userId: `WF${800000 + i}`, // Fixed sequence IDs taaki real lagein
//                     name: rName,
//                     amount: rAmt,
//                     type: 'System Achiever'
//                 });
//             }
//         }

//         // 4. COMBINE DONO LIST (Real + Fake)
//         achievers = [...achievers, ...formattedFake];

//         // 5. SORTING (Jiska bada package wo upar)
//         achievers.sort((a, b) => b.amount - a.amount);

//         res.json({ 
//             success: true, 
//             totalAchievers: achievers.length,
//             data: achievers 
//         });

//     } catch (error) {
//         console.error("Salary Achievers Error:", error);
//         res.status(500).json({ success: false, message: "Server error while fetching achievers" });
//     }
// });
router.get('/salary-achievers-list', authMiddleware, async (req, res) => {
    try {
        // 1. GET REAL ACHIEVERS (Jinhone sach me target pura kiya hai)
        const realUsers = await User.find({ isSalaryQualified: true })
            .select('userId name topUpAmount createdAt')
            .lean();

        let achievers = realUsers.map(u => ({
            userId: u.userId,
            name: u.name || "User",
            amount: u.topUpAmount || 50,
            type: 'Real Achiever'
        }));

        // 🔥 Pehle ke 201 + naye 628 = Total 837 fake users
        const TARGET_FAKE_COUNT = 836; 

        // 2. GET FAKE ACHIEVERS (Pehle DB se uthao)
        const fakeUsers = await DummyUser.find()
            .sort({ _id: 1 }) 
            .limit(TARGET_FAKE_COUNT)
            .lean();

        let formattedFake = fakeUsers.map(u => {
            // Har dummy user ko consistent amount dena
            const charCode = u.userId ? u.userId.charCodeAt(u.userId.length - 1) : 0;
            let fallbackAmt = 50;
            if (charCode % 5 === 0) fallbackAmt = 500;
            else if (charCode % 3 === 0) fallbackAmt = 100;
            else if (charCode % 2 === 0) fallbackAmt = 200;

            return {
                userId: u.userId,
                name: u.name || "User",
                amount: (u.package && u.package >= 50) ? u.package : fallbackAmt,
                type: 'System Achiever'
            };
        });

        // 3. AUTO-GENERATE LOGIC: Agar 829 log nahi mile, toh khud bana lo!
        if (formattedFake.length < TARGET_FAKE_COUNT) {
            const needed = TARGET_FAKE_COUNT - formattedFake.length;
            const amounts = [50, 100, 50, 200, 50, 100, 500, 50, 100, 200]; 
            // Naam ki list thodi badi kar di taaki real lage
            const firstNames = [
                "Aarav", "Vikram", "Rohan", "Sneha", "Rahul", "Pooja", "Amit", "Karan", 
                "Priya", "Suresh", "Neha", "Vikas", "Ravi", "Anjali", "Sanjay", "Kavita", 
                "Manish", "Sunita", "Rajesh", "Anita", "Deepak", "Ritu", "Mohit", "Geeta"
            ];
            
            const currentCount = formattedFake.length;

            for (let i = 0; i < needed; i++) {
                // 🔥 globalIndex se pehle wale users hamesha same rahenge!
                const globalIndex = currentCount + i; 
                
                const rAmt = amounts[globalIndex % amounts.length];
                const rName = firstNames[globalIndex % firstNames.length] + " " + String.fromCharCode(65 + (globalIndex % 26)); 
                
                formattedFake.push({
                    userId: `WF${800000 + globalIndex}`, // WF800000 se shuru hoke aage badhega
                    name: rName,
                    amount: rAmt,
                    type: 'System Achiever'
                });
            }
        }

        // 4. COMBINE DONO LIST (Real + Fake)
        achievers = [...achievers, ...formattedFake];

        // 5. SORTING (Jiska bada package wo upar)
        achievers.sort((a, b) => b.amount - a.amount);

        res.json({ 
            success: true, 
            totalAchievers: achievers.length,
            data: achievers 
        });

    } catch (error) {
        console.error("Salary Achievers Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching achievers" });
    }
});


const LuckyWinner = require('../models/LuckyWinner');
// =================================================================
 
// router.get('/shared/lucky-winners-list', async (req, res) => {
//     try {
//         // Agar frontend se month na aaye, toh current month le lo (YYYY-MM)
//         const month = req.query.month || new Date().toISOString().slice(0, 7); 

//         // 🔥 SEEDED RANDOM GENERATOR SETUP 🔥
//         // 'month' string se ek unique number (seed) banayenge
//         let seed = 0;
//         for (let i = 0; i < month.length; i++) {
//             seed += month.charCodeAt(i) * (i + 1);
//         }

//         // Yeh function ek unique seed par humesha ek hi jaisa random number deta hai
//         function seededRandom(a) {
//             return function() {
//               var t = a += 0x6D2B79F5;
//               t = Math.imul(t ^ t >>> 15, t | 1);
//               t ^= t + Math.imul(t ^ t >>> 7, t | 61);
//               return ((t ^ t >>> 14) >>> 0) / 4294967296;
//             }
//         }
//         const randomFunc = seededRandom(seed); // Initialize randomizer

//         // Ek array shuffler function banaya jo hamare 'randomFunc' ko use karega
//         function shuffleArray(array) {
//             for (let i = array.length - 1; i > 0; i--) {
//                 const j = Math.floor(randomFunc() * (i + 1));
//                 [array[i], array[j]] = [array[j], array[i]];
//             }
//             return array;
//         }

//         // 1. DB se is mahine ke "Real Winners" nikal lo
//         const realWinners = await LuckyWinner.find({ month }).lean();
//         const real50 = realWinners.filter(w => w.amount === 50).map(w => ({ ...w, type: 'Real Winner' }));
//         const real100 = realWinners.filter(w => w.amount === 100).map(w => ({ ...w, type: 'Real Winner' }));

//         // 2. Dummy Users nikal lo (Zyada nikal rahe hain taaki random pool bada ho)
//         let dummyUsers = await DummyUser.find().limit(500).lean();
        
//         // 🔥 MAGIC 1: Dummy users ko shuffle kar diya
//         // Isse har mahine alag-alag dummy users select honge, par ek mahine tak list same rahegi
//         dummyUsers = shuffleArray(dummyUsers);

//         let fake50 = [];
//         let fake100 = [];

//         // 3. Calculation: Kitne fake users chahiye?
//         const needed50 = 50 - real50.length;
//         const needed100 = 50 - real100.length;

//         // Shuru ke random dummy users ko $50 me dalo
//         for(let i = 0; i < needed50; i++) {
//             if(dummyUsers[i]) {
//                 fake50.push({ userId: dummyUsers[i].userId, name: dummyUsers[i].name || "User", amount: 50, type: 'System Winner' });
//             }
//         }

//         // Uske aage ke random dummy users ko $100 me dalo
//         for(let i = needed50; i < needed50 + needed100; i++) {
//             if(dummyUsers[i]) {
//                 fake100.push({ userId: dummyUsers[i].userId, name: dummyUsers[i].name || "User", amount: 100, type: 'System Winner' });
//             }
//         }

//         // 4. Sabko ek Array mein jod do
//         let allWinners = [...real100, ...fake100, ...real50, ...fake50];

//         // 🔥 MAGIC 2: Final List ko Jumble/Shuffle kar diya
//         // Isse Real aur Fake, $50 aur $100 wale sab mix ho jayenge ekdum naturally
//         allWinners = shuffleArray(allWinners);
        
//         res.json({ success: true, total: allWinners.length, data: allWinners });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// });


router.get('/shared/lucky-winners-list', async (req, res) => {
    try {
        // Mahina le lo (YYYY-MM)
        const month = req.query.month || new Date().toISOString().slice(0, 7); 

        // 🔥 1. ADVANCED SEED GENERATOR (cyrb128) 🔥
        // Yeh string ko ekdum strong unique number me convert karega.
        // Isse har mahine ki list pichle mahine se 100% alag dikhegi!
        function cyrb128(str) {
            let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
            for (let i = 0, k; i < str.length; i++) {
                k = str.charCodeAt(i);
                h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
                h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
                h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
                h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
            }
            h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
            h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
            h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
            h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
            return (h1^h2^h3^h4) >>> 0;
        }

        const seed = cyrb128(month);

        // Mulberry32 RNG - Ekdum perfect aur stable random numbers ke liye
        function seededRandom(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }
        const randomFunc = seededRandom(seed); // Randomizer Initialize kiya

        // Array Shuffler
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(randomFunc() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // 2. DB se is mahine ke "Real Winners" nikal lo
        const realWinners = await LuckyWinner.find({ month }).lean();
        const real50 = realWinners.filter(w => w.amount === 50).map(w => ({ ...w, type: 'Real Winner' }));
        const real100 = realWinners.filter(w => w.amount === 100).map(w => ({ ...w, type: 'Real Winner' }));

        // 🔥 3. FIX: .sort({ _id: 1 }) LAGAYA 🔥
        // Isse list MongoDB se hamesha same order me aayegi. Ye lagane se aapki list din bhar me kabhi nahi hilegi!
        let dummyUsers = await DummyUser.find().sort({ _id: 1 }).limit(500).lean();
        
        // Dummy users ko us mahine ke unique seed se shuffle kar diya
        dummyUsers = shuffleArray(dummyUsers);

        let fake50 = [];
        let fake100 = [];

        // 4. Kitne fake users chahiye? (Total 50 karna hai dono categories me)
        const needed50 = 50 - real50.length;
        const needed100 = 50 - real100.length;

        // $50 wale fake users daale
        for(let i = 0; i < needed50; i++) {
            if(dummyUsers[i]) {
                fake50.push({ userId: dummyUsers[i].userId, name: dummyUsers[i].name || "User", amount: 50, type: 'System Winner' });
            }
        }

        // $100 wale fake users daale (Pichle 50 ke aage se uthaye taaki duplicate na ho)
        for(let i = needed50; i < needed50 + needed100; i++) {
            if(dummyUsers[i]) {
                fake100.push({ userId: dummyUsers[i].userId, name: dummyUsers[i].name || "User", amount: 100, type: 'System Winner' });
            }
        }

        // 5. Sabko ek Array mein jod do (Total exact 100 log honge)
        let allWinners = [...real100, ...fake100, ...real50, ...fake50];

        // 6. Final List ko ek last baar shuffe kar diya taaki $50 aur $100 wale mix ho jayein
        allWinners = shuffleArray(allWinners);
        
        res.json({ success: true, total: allWinners.length, data: allWinners });

    } catch (error) {
        console.error("Lucky Winner Route Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// router.get('/roi-income', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.userId || req.user.id || req.user; 

//         // 🔥 DONO TYPES FETCH KAR RAHE HAIN
//         const transactions = await Transaction.find({
//             userId: userId,
//             type: { $in: ["daily_roi", "daily_level_income"] }
//         }).sort({ createdAt: -1, date: -1 }); 

//         // Backend pe hi dono ka total calculate kar lenge
//         let totalRoi = 0;
//         let totalLevel = 0;

//         transactions.forEach(txn => {
//             if (txn.type === "daily_roi") totalRoi += (txn.amount || 0);
//             if (txn.type === "daily_level_income") totalLevel += (txn.amount || 0);
//         });

//         res.status(200).json({ 
//             success: true, 
//             totalRoi: totalRoi,
//             totalLevel: totalLevel,
//             data: transactions 
//         });

//     } catch (error) {
//         console.error("Error fetching combined income:", error);
//         res.status(500).json({ success: false, message: "Server error while fetching income." });
//     }
// });


// router.get('/roi-income', authMiddleware, async (req, res) => {
//     try {
//         const userId = req.user.userId || req.user.id || req.user; 

//         // 🔥 .lean() lagaya jisse query ekdum fast ho jayegi
//         const transactions = await Transaction.find({
//             userId: userId,
//             type: { $in: ["daily_roi", "daily_level_income"] }
//         }).sort({ createdAt: -1, date: -1 }).lean(); 

//         let totalRoi = 0;
//         let totalLevel = 0;
//         let todaySelf = 0;
//         let todayLevel = 0;

//         // Aaj ki date set kar rahe hain (IST)
//         const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//         const todayStr = new Date(istTimeStr).toISOString().split('T')[0];

//         const levelIncomeGroups = {};
//         const selfIncomeList = [];

//         // Backend pe hi dono ka total aur Date grouping calculate kar lenge
//         transactions.forEach(txn => {
//             const amt = Number(txn.amount) || 0;
//             const txnDateObj = new Date(txn.createdAt || txn.date);
//             const txnDateStr = txnDateObj.toISOString().split('T')[0];

//             if (txn.type === "daily_roi") {
//                 totalRoi += amt;
//                 if (txnDateStr === todayStr) todaySelf += amt;
//                 selfIncomeList.push(txn);
//             } 
            
//             if (txn.type === "daily_level_income") {
//                 totalLevel += amt;
//                 if (txnDateStr === todayStr) todayLevel += amt;

//                 // 🔥 MAGIC: Level Income ko Date ke hisaab se group kar rahe hain
//                 if (!levelIncomeGroups[txnDateStr]) {
//                     levelIncomeGroups[txnDateStr] = {
//                         _id: `level_combined_${txnDateStr}`,
//                         userId: userId,
//                         type: "daily_level_income",
//                         description: "Total Team Level ROI for the Day",
//                         amount: 0,
//                         date: txnDateStr,
//                         createdAt: txnDateObj
//                     };
//                 }
//                 levelIncomeGroups[txnDateStr].amount += amt;
//             }
//         });

//         // Combined Level Array aur Self Array ko mix karke sort kiya
//         const combinedLevelArray = Object.values(levelIncomeGroups);
//         const finalData = [...selfIncomeList, ...combinedLevelArray].sort(
//             (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
//         );

//         res.status(200).json({ 
//             success: true, 
//             totalSelfRoi: totalRoi,
//             totalLevelRoi: totalLevel,
//             todaySelfRoi: todaySelf,
//             todayLevelRoi: todayLevel,
//             totalCombined: totalRoi + totalLevel,
//             data: finalData 
//         });

//     } catch (error) {
//         console.error("Error fetching combined income:", error);
//         res.status(500).json({ success: false, message: "Server error while fetching income." });
//     }
// });




router.get('/roi-income', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id || req.user;

        // 1. Get Self ROI (Direct DB se uthao, lean use karke fast)
        const selfRoi = await Transaction.find({
            userId: String(userId),
            type: "daily_roi"
        }).sort({ createdAt: -1 }).lean();

        // 2. 🚀 FAST AGGREGATION: Level ROI ko Backend pe hi Date ke hisaab se combine kar do
        const levelRoiGrouped = await Transaction.aggregate([
            { $match: { userId: String(userId), type: "daily_level_income" } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
                    totalAmount: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
                    createdAt: { $first: "$createdAt" }
                }
            },
            {
                $project: {
                    _id: { $concat: ["level_combined_", "$_id"] },
                    type: "daily_level_income",
                    description: "Total Team Level ROI for the Day",
                    amount: "$totalAmount",
                    date: "$_id",
                    createdAt: 1
                }
            }
        ]);

        // 3. Combine both and sort by newest first
        const combinedData = [...selfRoi, ...levelRoiGrouped].sort(
            (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );

        // 4. Calculate 5 Stats Fast
        let totalSelf = 0, todaySelf = 0, totalLevel = 0, todayLevel = 0;
        const todayStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const todayDateString = new Date(todayStr).toISOString().split('T')[0];

        combinedData.forEach(txn => {
            const amt = Number(txn.amount?.$numberDecimal || txn.amount) || 0;
            const txnDateObj = new Date(txn.createdAt || txn.date);
            const txnStr = txnDateObj.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            const txnDateString = new Date(txnStr).toISOString().split('T')[0];

            if (txn.type === "daily_roi") {
                totalSelf += amt;
                if (txnDateString === todayDateString) todaySelf += amt;
            } else if (txn.type === "daily_level_income") {
                totalLevel += amt;
                if (txnDateString === todayDateString) todayLevel += amt;
            }
        });

        // 5. Send Response (Ekdum Frontend ke format ke hisaab se)
        res.status(200).json({ 
            success: true,
            totalCombined: totalSelf + totalLevel,
            totalSelfRoi: totalSelf,
            todaySelfRoi: todaySelf,
            totalLevelRoi: totalLevel,
            todayLevelRoi: todayLevel,
            data: combinedData 
        });

    } catch (error) {
        console.error("Fast ROI API Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching income." });
    }
});



// 📋 Get all users (Admin ke liye)


router.get('/all', getAllUsers);

// 👤 Get Sponsor Name (Register page par verification ke liye)
router.get('/sponsor/:id', getSponsorName);




const GwTokenReward = require('../models/GwTokenReward');

// ==========================================
// GW TOKEN TOTAL - USER REWARD LEDGER
// ==========================================
router.get('/gw-token-total', authMiddleware, async (req, res) => {
    try {
        const buyerId = getLoggedInUserId(req);

        if (!buyerId || buyerId === '[object Object]') {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const result = await GwTokenReward.aggregate([
            {
                $match: {
  receiverId: buyerId
                }
            },
            {
                $group: {
                    _id: '$buyerId',
                    totalTokens: { $sum: '$tokenAmount' },
                    totalPackages: { $sum: 1 }
                }
            }
        ]);


 
const sampleRecords = await GwTokenReward.find({})
    .limit(5)
    .lean();

 
        const totalTokens = Number(
            result[0]?.totalTokens || 0
        );

      

        return res.status(200).json({
            success: true,
            buyerId,
            totalTokens,
            totalPackages: Number(
                result[0]?.totalPackages || 0
            )
        });

    } catch (error) {
        console.error('[GW TOKEN TOTAL ERROR]', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to fetch GW Token total'
        });
    }
});

 
// 🔍 Get User By ID (Dashboard data, real + fake count yahan se jayega)
// ⚠️ ISE SABSE NEECHE HI RAKHNA HAI
router.get('/:userId', authMiddleware, getUserById); // Ye to sabse pehle hona chahiye
// 
// // ---------------------------
// Helper: Check if target is in downline
const isUserInDownline = async (rootUserId, targetUserId) => {
  const visited = new Set();
  const queue = [rootUserId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const downlines = await User.find({ sponsorId: current }).select('userId');
    for (const user of downlines) {
      if (user.userId === targetUserId) return true;
      queue.push(user.userId);
    }
  }

  return false;
};

// ---------------------------
// Referral Tree
router.get('/tree/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referrals = await User.find({ sponsorId: userId });

    const tree = {
      userId: user.userId,
      name: user.name,
      children: referrals.map(r => ({ userId: r.userId, name: r.name, children: [] }))
    };

    res.json(tree);
  } catch (err) {
    console.error('Error generating tree:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/// Helper Function: Pure Team Count nikalne ke liye (Recursive)
// Isko route ke bahar ya andar define kar sakte hain
const getDownlineCount = async (sponsorId) => {
  const referrals = await User.find({ sponsorId: Number(sponsorId) });
  let count = referrals.length;
  for (const r of referrals) {
    count += await getDownlineCount(r.userId);
  }
  return count;
};







// Apni backend user routes wali file mein (e.g., routes/user.js)
const SystemSettings = require('../models/SystemSettings'); // Path check kar lena

// routes/user.js

// 1. Static route ko upar rakhein (Isko pehle check karega)
router.get('/system-settings', async (req, res) => {
    try {
        const SystemSettings = require('../models/SystemSettings');
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({
                depositEnabled: true, topupEnabled: true, 
                transferEnabled: true, withdrawEnabled: true, toWalletEnabled: true
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings" });
    }
});

// 2. Dynamic route ko neeche rakhein
// Express yahan tabhi aayega agar path 'system-settings' nahi hoga
router.get('/:userId', getUserById); 








 

// 3. Update Profile & Wallet (SECURED)
// Bina auth token ke ab update nahi hoga
router.put('/update-profile-secure', authMiddleware, async (req, res) => {
    try {
        const { name, mobile, email, newWalletAddress } = req.body; // userId removed from here
        const user = await User.findOne({ userId: req.user.userId }); // 🔥 Secure

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if user has verified OTP recently (within 15 mins)
        if (!user.profileEditAccessExpiry || user.profileEditAccessExpiry < Date.now()) {
            // Security measure: agar try kiya aur fail hua, access deny.
            return res.status(403).json({ success: false, message: "Session expired or unauthorized. Please verify OTP first." });
        }

        // 🔥 Email Change Logic
        if (email && email.trim() !== '' && email !== user.email) {
            const emailExists = await User.findOne({ email: email.trim() });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "This email is already used by another account." });
            }
            user.email = email.trim(); 
        }

        // Basic Profile Update
        user.name = name || user.name;
        user.mobile = mobile || user.mobile;

        // 🔥 Safe checks ke saath Wallet Logic
        const currentWallet = user.walletAddress || ""; 
        const newWallet = newWalletAddress ? newWalletAddress.trim() : "";

        if (newWallet !== "" && newWallet !== currentWallet) {
            const currentCount = user.walletAddressChangeCount || 0;
            if (currentCount >= 3) {
                return res.status(400).json({ success: false, message: "Wallet address change limit (3 times) exceeded." });
            }

           if (currentWallet !== '') {
                if (!user.walletAddressHistory) {
                    user.walletAddressHistory = [];
                }
                user.walletAddressHistory.push({ 
                    address: currentWallet, 
                    changedAt: new Date(),
                    updatedBy: "User" // 🔥 NAYI LINE
                });
            }

            user.walletAddress = newWallet;
            user.walletAddressChangeCount = currentCount + 1; 
            
            if (user.walletAddressChangeCount === 1) {
                user.walletAddressChangeWindowStart = new Date();
            }
        }

        // 🔒 SEVERE SECURITY: Lock profile instantly after ONE successful update to prevent multi-updates
        user.profileEditAccessExpiry = undefined;
        
        await user.save();

        res.json({ success: true, message: "Profile updated successfully!", user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Profile update failed. Check backend console." });
    }
});
  // ---------------------------
// 1. UPDATED: Direct Team Route
// ---------------------------
// ---------------------------
// 1. UPDATED (SUPER FAST): Direct Team Route
// ---------------------------
// router.get('/direct-team/:userId', async (req, res) => {
//   try {
//     const currentUserId = Number(req.params.userId);

//     // 🔥 1. Ek hi baar me saare users RAM mein load karenge (Superfast Breakaway ke liye)
//     const allUsers = await User.find({}, 'userId sponsorId name mobile country topUpAmount createdAt role').lean();

//     // 👑 🔥 NAYA FIX: CURRENT USER KA ROLE CHECK KARO (Super Leader Bypass ke liye)
//     const currentUserData = allUsers.find(u => u.userId === currentUserId);
//     const isSuperLeader = currentUserData && currentUserData.role === 'superleader';

//     // 2. RAM mein Network Tree (Map) banayenge
//     const directMap = new Map();
//     const userDetailsMap = new Map();

//     for (let u of allUsers) {
//         userDetailsMap.set(u.userId, u);
//         if (u.sponsorId) {
//             if (!directMap.has(u.sponsorId)) {
//                 directMap.set(u.sponsorId, []);
//             }
//             directMap.get(u.sponsorId).push(u);
//         }
//     }

//     // 🔥 3. MAIN USER KI TOTAL TEAM NIKALNA (With Breakaway Rule) 🔥
//     let mainUserTotalTeam = 0;
//     let mainQueue = [...(directMap.get(currentUserId) || [])];

//     while (mainQueue.length > 0) {
//         const currentNode = mainQueue.shift();
//         mainUserTotalTeam++; // Ek user count ho gaya

//         // 🛑 ABSOLUTE BREAKAWAY WALL (WITH SUPER LEADER BYPASS) 🛑
//         // Agar banda 'leader' hai aur check karne wala 'superleader' NAHI hai, tabhi roko.
//         if (currentNode.role === 'leader' && !isSuperLeader) {
//             continue; 
//         }

//         // Agar leader nahi hai ya Super Leader bypass hai, toh iski team aage queue mein add karo
//         const children = directMap.get(currentNode.userId) || [];
//         for (let child of children) {
//             mainQueue.push(child);
//         }
//     }

//     // 🔥 4. TABLE KE LIYE DIRECTS KA DATA BANANA 🔥
//     const myDirects = directMap.get(currentUserId) || [];
    
//     const teamWithStats = myDirects.map((direct, index) => {
//         const membersDirects = directMap.get(direct.userId) || [];
//         const directCount = membersDirects.length;

//         let teamSize = 0;

//         // 🛑 Agar Direct member Leader hai aur user normal hai, toh uski team 0 bhejenge
//         if (direct.role === 'leader' && !isSuperLeader) {
//             teamSize = 0; 
//         } else {
//             // Agar bypass allowed hai, toh uski team size calculate karenge
//             let subQueue = [...membersDirects];
//             while (subQueue.length > 0) {
//                 const subNode = subQueue.shift();
//                 teamSize++;

//                 // 🛑 Is sub-team ke andar bhi Breakaway check karenge (WITH BYPASS)
//                 if (subNode.role === 'leader' && !isSuperLeader) {
//                     continue; 
//                 }
//                 const subChildren = directMap.get(subNode.userId) || [];
//                 for (let child of subChildren) {
//                     subQueue.push(child);
//                 }
//             }
//         }

//         return {
//             srNo: index + 1,
//             userId: direct.userId,
//             name: direct.name,
//             mobile: direct.mobile,
//             country: direct.country,
//             role: direct.role, 
//             topUpAmount: direct.topUpAmount,
//             createdAt: direct.createdAt,
//             totalDirects: directCount,
//             totalTeam: teamSize,
//             // 🔥 NAYA FIX: Frontend ko same naam se data bhejo jo database mein hai
//             globalTeamCount: teamSize, 
//             directCount: directCount
//         };
//     });

//     // Naye directs sabse upar dikhane ke liye sort (Descending order of date)
//     teamWithStats.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     // Response Bhejenge
//     res.json({
//       team: teamWithStats,      
//       totalTeam: mainUserTotalTeam 
//     });

//   } catch (err) {
//     console.error("Error in direct-team API:", err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


router.get('/direct-team/:userId', async (req, res) => {
  try {
    const currentUserId = String(req.params.userId);

    const allUsers = await User.find(
      {},
      'userId sponsorId name mobile country topUpAmount createdAt role pointBV'
    ).lean();

    const currentUserData = allUsers.find(
      u => String(u.userId) === currentUserId
    );

    const isSuperLeader =
      currentUserData && currentUserData.role === 'superleader';

    const directMap = new Map();
    const userDetailsMap = new Map();

    for (const u of allUsers) {
      const uId = String(u.userId);
      userDetailsMap.set(uId, u);

      if (u.sponsorId) {
        const spId = String(u.sponsorId);

        if (!directMap.has(spId)) {
          directMap.set(spId, []);
        }

        directMap.get(spId).push(u);
      }
    }

    // ==========================================
    // MAIN USER TOTAL TEAM
    // ==========================================

    let mainUserTotalTeam = 0;
    let mainQueue = [...(directMap.get(currentUserId) || [])];

    while (mainQueue.length > 0) {
      const currentNode = mainQueue.shift();
      mainUserTotalTeam++;

      if (currentNode.role === 'leader' && !isSuperLeader) {
        continue;
      }

      const children =
        directMap.get(String(currentNode.userId)) || [];

      for (const child of children) {
        mainQueue.push(child);
      }
    }

    // ==========================================
    // DIRECT MEMBERS
    // ==========================================

    const myDirects = directMap.get(currentUserId) || [];

    const directUserIds = myDirects.map(
      member => String(member.userId)
    );

    // ==========================================
    // AUTO COMPOUND V2 RECORDS
    // ==========================================

    const autoCompoundRecords = directUserIds.length
      ? await AutoCompoundV2.find({
          $or: [
            { memberId: { $in: directUserIds } },
            { userId: { $in: directUserIds } }
          ]
        })
          .select('userId memberId packageAmount status')
          .lean()
      : [];

    // Map auto compound package data by actual member ID
    const autoCompoundMap = new Map();

    for (const record of autoCompoundRecords) {
      const memberId = String(
        record.memberId || record.userId || ''
      );

      if (!memberId) continue;

      const existing = autoCompoundMap.get(memberId) || {
        amount: 0,
        count: 0
      };

      existing.amount += Number(record.packageAmount || 0);
      existing.count += 1;

      autoCompoundMap.set(memberId, existing);
    }

    // ==========================================
    // DIRECT TEAM TABLE DATA
    // ==========================================

    const teamWithStats = myDirects.map((direct, index) => {
      const directIdStr = String(direct.userId);

      const membersDirects =
        directMap.get(directIdStr) || [];

      const directCount = membersDirects.length;

      let teamSize = 0;

      if (direct.role === 'leader' && !isSuperLeader) {
        teamSize = 0;
      } else {
        let subQueue = [...membersDirects];

        while (subQueue.length > 0) {
          const subNode = subQueue.shift();
          teamSize++;

          if (subNode.role === 'leader' && !isSuperLeader) {
            continue;
          }

          const subChildren =
            directMap.get(String(subNode.userId)) || [];

          for (const child of subChildren) {
            subQueue.push(child);
          }
        }
      }

      const autoCompound =
        autoCompoundMap.get(directIdStr) || {
          amount: 0,
          count: 0
        };

      const normalAmount = Number(direct.topUpAmount || 0);
      const autoCompoundAmount = Number(autoCompound.amount || 0);

      const isActive =
        normalAmount > 0 || autoCompound.count > 0;

      return {
        srNo: index + 1,
        userId: direct.userId,
        sponsorId: direct.sponsorId,
        name: direct.name,
        mobile: direct.mobile,
        country: direct.country,
        role: direct.role,

        topUpAmount: normalAmount,
        autoCompoundAmount,
        autoCompoundCount: autoCompound.count,

        activationStatus: isActive ? 'Active' : 'Inactive',

        pointBV: direct.pointBV || 0,
        createdAt: direct.createdAt,

        totalDirects: directCount,
        totalTeam: teamSize,
        globalTeamCount: teamSize,
        directCount
      };
    });

    // Newest members first
    teamWithStats.sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

    res.json({
      team: teamWithStats,
      totalTeam: mainUserTotalTeam
    });

  } catch (err) {
    console.error("Error in direct-team API:", err);

    res.status(500).json({
      message: 'Server error'
    });
  }
});





// router.get('/all-team/:userId', async (req, res) => {
//   try {
//     const currentUserId = Number(req.params.userId);

//     // 🔥 1. Ek hi baar me saare users RAM mein load karenge (Superfast + Role Checking)
//     const allUsers = await User.find({}, '_id userId sponsorId name country topUpAmount createdAt role').lean();

//     // 🔥 CURRENT USER KA ROLE CHECK KARO (Check if he is a Super Leader)
//     const currentUserData = allUsers.find(u => u.userId === currentUserId);
//     const isSuperLeader = currentUserData && currentUserData.role === 'superleader';

//     // 2. RAM mein Network Tree banayenge
//     const directMap = new Map();
//     for (let u of allUsers) {
//         if (u.sponsorId) {
//             if (!directMap.has(u.sponsorId)) {
//                 directMap.set(u.sponsorId, []);
//             }
//             directMap.get(u.sponsorId).push(u);
//         }
//     }

//     // 3. Traversal with SECRET BREAKAWAY
//     let allTeam = [];
//     let queue = [];
    
//     // Stats maintain karne ke variables (Aapke purane code ke hisaab se)
//     let directCount = 0;
//     const levelWiseCount = {};

//     // Pehle apne direct (Level 1) walo ko queue mein daalo
//     const directs = directMap.get(currentUserId) || [];
//     for (let d of directs) {
//         queue.push({ user: d, level: 1 });
//     }

//     // Ab poora network traverse karenge
//     while (queue.length > 0) {
//         const { user, level } = queue.shift();

//         // Stats update karo
//         if (level === 1) directCount++;
//         levelWiseCount[level] = (levelWiseCount[level] || 0) + 1;

//         // User ko All Team list mein add kar do
//         allTeam.push({
//             srNo: allTeam.length + 1,
//             _id: user._id,
//             userId: user.userId,
//             name: user.name,
//             country: user.country,
//             topUpAmount: user.topUpAmount || 0,
//             createdAt: user.createdAt,
//             level: level
//             // Role ko hum response mein bhej hi nahi rahe, taaki frontend par kisi ko doubt na ho!
//         });

//         // 🛑 SECRET BREAKAWAY WALL (WITH SUPER LEADER BYPASS) 🛑
//         // Agar ye current banda 'leader' hai, aur jo dekh raha hai wo 'superleader' NAHI hai, toh aage mat badho.
//         if (user.role === 'leader' && !isSuperLeader) {
//             continue; 
//         }

//         // Agar leader nahi hai (ya phir dekhne wala superleader hai), toh uske direct logo ko queue mein dalo
//         const children = directMap.get(user.userId) || [];
//         for (let child of children) {
//             queue.push({ user: child, level: level + 1 });
//         }
//     }

//     // 4. Response exactly aapke purane format me bhej rahe hain
//     res.json({
//       team: allTeam,
//       totalTeamCount: allTeam.length,
//       directCount: directCount,
//       indirectCount: allTeam.length - directCount,
//       levelWiseCount: levelWiseCount
//     });

//   } catch (err) {
//     console.error('Error fetching team:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });




// ---------------------------
// Wallet History



// router.get('/all-team/:userId', async (req, res) => {
//   try {
//     // 🔥 FIX 1: Map mismatch rokne ke liye userId ko String bana diya
//     const currentUserId = String(req.params.userId);

//     // 🔥 FIX 2: pointBV bhi select kar liya in case UI me aage zaroorat pade
//     const allUsers = await User.find({}, '_id userId sponsorId name country topUpAmount pointBV createdAt role').lean();

//     // 🔥 CURRENT USER KA ROLE CHECK KARO (String match)
//     const currentUserData = allUsers.find(u => String(u.userId) === currentUserId);
//     const isSuperLeader = currentUserData && currentUserData.role === 'superleader';

//     // 2. RAM mein Network Tree banayenge
//     const directMap = new Map();
//     for (let u of allUsers) {
//         if (u.sponsorId) {
//             // 🔥 FIX 3: Map me daalte time sponsorId strictly String honi chahiye
//             const spId = String(u.sponsorId);
//             if (!directMap.has(spId)) {
//                 directMap.set(spId, []);
//             }
//             directMap.get(spId).push(u);
//         }
//     }

//     // 3. Traversal with SECRET BREAKAWAY
//     let allTeam = [];
//     let queue = [];
    
//     // Stats maintain karne ke variables (Aapke purane code ke hisaab se)
//     let directCount = 0;
//     const levelWiseCount = {};

//     // Pehle apne direct (Level 1) walo ko queue mein daalo
//     const directs = directMap.get(currentUserId) || [];
//     for (let d of directs) {
//         queue.push({ user: d, level: 1 });
//     }

//     // Ab poora network traverse karenge
//     while (queue.length > 0) {
//         const { user, level } = queue.shift();

//         // Stats update karo
//         if (level === 1) directCount++;
//         levelWiseCount[level] = (levelWiseCount[level] || 0) + 1;

//         // User ko All Team list mein add kar do
//         allTeam.push({
//             srNo: allTeam.length + 1,
//             _id: user._id,
//             userId: user.userId,
//             sponsorId: user.sponsorId, // 🔥 Table display ke liye add kiya
//             name: user.name,
//             country: user.country,
//             topUpAmount: user.topUpAmount || 0,
//             pointBV: user.pointBV || 0, // 🔥 Table display ke liye add kiya
//             createdAt: user.createdAt,
//             level: level
//             // Role ko hum response mein bhej hi nahi rahe, taaki frontend par kisi ko doubt na ho!
//         });

//         // 🛑 SECRET BREAKAWAY WALL (WITH SUPER LEADER BYPASS) 🛑
//         // Agar ye current banda 'leader' hai, aur jo dekh raha hai wo 'superleader' NAHI hai, toh aage mat badho.
//         if (user.role === 'leader' && !isSuperLeader) {
//             continue; 
//         }

//         // 🔥 FIX 4: Get karte time userId ko strictly String banao
//         const children = directMap.get(String(user.userId)) || [];
//         for (let child of children) {
//             queue.push({ user: child, level: level + 1 });
//         }
//     }

//     // 4. Response exactly aapke purane format me bhej rahe hain
//     res.json({
//       team: allTeam,
//       totalTeamCount: allTeam.length,
//       directCount: directCount,
//       indirectCount: allTeam.length - directCount,
//       levelWiseCount: levelWiseCount
//     });

//   } catch (err) {
//     console.error('Error fetching team:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



router.get("/all-team/:userId", async (req, res) => {
  try {
    const currentUserId = String(req.params.userId || "").trim();

    if (!currentUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required."
      });
    }

    // Find the requested user
    const currentUser = await User.findOne(
      { userId: currentUserId },
      { _id: 1, userId: 1 }
    ).lean();

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Fetch the complete sponsor hierarchy.
    // Direct sponsors are Level 1.
    // Their sponsors are Level 2, and so on.
    const result = await User.aggregate([
      {
        $match: {
          _id: currentUser._id
        }
      },
      {
        $graphLookup: {
          from: User.collection.name,
          startWith: "$userId",
          connectFromField: "userId",
          connectToField: "sponsorId",
          as: "teamMembers",
          depthField: "teamDepth"
        }
      },
      {
        $project: {
          _id: 0,
          teamMembers: 1
        }
      }
    ]).allowDiskUse(true);

    const members = result[0]?.teamMembers || [];

    // Convert database results to frontend response format
    const allTeam = members.map((member) => ({
      _id: member._id,
      userId: member.userId,
      sponsorId: member.sponsorId,
      name: member.name,
      country: member.country,
      topUpAmount: Number(member.topUpAmount) || 0,
      pointBV: Number(member.pointBV) || 0,
      createdAt: member.createdAt,
      level: Number(member.teamDepth) + 1
    }));

    // Sort by level and then joining date
    allTeam.sort((a, b) => {
      if (a.level !== b.level) {
        return a.level - b.level;
      }

      return (
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
      );
    });

    // Calculate team statistics
    const directCount = allTeam.filter(
      (member) => member.level === 1
    ).length;

    const levelWiseCount = {};

    for (const member of allTeam) {
      levelWiseCount[member.level] =
        (levelWiseCount[member.level] || 0) + 1;
    }

    // Add serial numbers
    allTeam.forEach((member, index) => {
      member.srNo = index + 1;
    });

    return res.json({
      success: true,
      team: allTeam,
      totalTeamCount: allTeam.length,
      directCount,
      indirectCount: allTeam.length - directCount,
      levelWiseCount
    });

  } catch (err) {
    console.error("Error fetching complete team:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch complete team.",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : undefined
    });
  }
});


// router.get('/wallet-history/:userId', async (req, res) => {
//   try {
//     const txs = await Transaction.find({
//       userId: Number(req.params.userId),
//       type: { $in: ['topup', 'deposit', 'transfer'] }
//     }).sort({ date: -1 });

//     res.json({ history: txs });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

 // Block/Unblock Users
 
 
 router.get('/history/:userId', async (req, res) => {
  try {
    const rawUserId = req.params.userId; // Example: "WF8489157"
    
    // 🔥 FIX 1: 'WF' ya koi bhi alphabets ko hata kar sirf number nikalo
    const numericIdString = String(rawUserId).replace(/\D/g, ''); 
    const userIdNum = Number(numericIdString);

    // Agar ID bilkul galat hai toh 400 bhejo, warna aage badho
    if (!numericIdString || isNaN(userIdNum)) {
      return res.status(400).json({ success: false, history: [], balances: null });
    }

    // 🌟 NAYA LOGIC: Bulletproof Database Query (String aur Number dono match karega)
    const userData = await User.findOne({ 
        $or: [{ userId: userIdNum }, { userId: rawUserId }] 
    }).select('walletBalance usdtBep20Balance').lean();

    const allowedTypes = [
      "deposit",
      "credit_to_wallet",
      "credit",        
      "transfer",
      "usdt_bep20_transfer", 
      "topup",         
      "debit_topup",
      "withdrawal",
      "manual_credit",
      "manual_debit",
      "fast_track",
      "convert_to_cct", 
      "cct_stake_send",  
      "cct_transfer"        
    ];

    // ✨ 2. FAST DATABASE QUERY (Ab "WF" aur number dono format ke transactions catch karega)
    let txs = await Transaction.find({
      $and: [
        {
          $or: [
            { userId: userIdNum },       
            { userId: rawUserId },
            { fromUserId: userIdNum },   
            { fromUserId: rawUserId },
            { toUserId: userIdNum },      
            { toUserId: rawUserId }
          ]
        },
        { type: { $in: allowedTypes } },
        { description: { $not: /PROMOTION/i } },
        { description: { $not: /auto-pool/i } } 
      ]
    }).sort({ date: -1, createdAt: -1 }).lean();

    // 🛡️ 3. CLEANUP & DECIMAL128 FIX 
    const cleanHistory = txs
      .filter(t => {
        if (t.type === 'fast_track') {
            return String(t.userId) === String(rawUserId) || String(t.userId) === String(userIdNum);
        }
        return true;
      })
      .map(t => {
        let safeAmount = 0;
        let safeGross = 0;

        if (t.amount && t.amount.$numberDecimal) {
            safeAmount = parseFloat(t.amount.$numberDecimal);
        } else {
            safeAmount = parseFloat(t.amount) || 0;
        }

        if (t.grossAmount && t.grossAmount.$numberDecimal) {
            safeGross = parseFloat(t.grossAmount.$numberDecimal);
        } else {
            safeGross = parseFloat(t.grossAmount) || 0;
        }

        return {
          ...t,
          amount: safeAmount,
          grossAmount: safeGross
        };
      });

    // 🌟 4. FINAL RESPONSE
    res.json({ 
        success: true, 
        history: cleanHistory,
        balances: {
            walletBalance: userData?.walletBalance || 0,
            usdtBep20Balance: userData?.usdtBep20Balance || 0
        }
    });

  } catch (err) {
    console.error("Wallet history error:", err);
    res.status(500).json({ success: false, history: [], balances: null });
  }
});



// GET: Fetch Daily ROI Income for Logged-in User
// =======================================================
// 🔹 DAILY ROI INCOME ROUTE (User Dashboard ke liye)
// =======================================================
// =======================================================
// 🔹 COMBINED DAILY ROI & LEVEL INCOME ROUTE 
// =======================================================



 
// ==========================================
// 🏆 SALARY ACHIEVERS LIST (REAL + 201 FAKE)
// ==========================================
 
 


// Backend Route: promo-dummy-topup
// ✅ PROMO DUMMY TOPUP - FIXED & ROBUST
// ✅ UPDATED BACKEND ROUTE (Using DummyTransaction Model)
// 🚀 PROMO USER TOPUP ROUTE (Strictly for Showcase/Screenshot Popup)
// 🚀 PROMO USER TOPUP ROUTE (Strictly for Today's Fake IDs)
// router.post('/promo-dummy-topup', authMiddleware, async (req, res) => {
//   try {
//     const { amount, transactionPassword } = req.body;
//     const currentUser = await User.findOne({ userId: req.user.userId });

//     // 1. Password Check
//     if (!transactionPassword || transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
//       return res.status(403).json({ message: "Invalid transaction password" });
//     }

//     // 2. Indian Names List
//   const dummyNames = [
//     "Yashraj Trivedi", "Zoravar Bhatt", "Aarav Sharma", "Vivaan Verma", "Faizan Ansari",
//     "Aditya Singh", "Imran Shaikh", "Arjun Patel", "Krishna Gupta", "Rohan Yadav",
//     "Aftab Sayyed", "Rahul Mishra", "Amit Tiwari", "Nadeem Siddiqui", "Vikas Pandey",
//     "Sandeep Dubey", "Mohit Choudhary", "Arman Pathan", "Nitin Jha", "Manish Joshi",
//     "Deepak Mehta", "Ankit Shah", "Rakesh Agarwal", "Suresh Jain", "Sajid Baig",
//     "Prakash Saxena", "Mukesh Srivastava", "Abhishek Chauhan", "Ravindra Thakur", "Pankaj Rathore",
//     "Sameer Qureshi", "Dinesh Solanki", "Ashok Parmar", "Rajesh Soni", "Salman Mirza",
//     "Sanjay Bansal", "Vivek Goyal", "Harsh Mahajan", "Tarun Arora", "Irfan Momin",
//     "Varun Malhotra", "Rajat Khanna", "Gaurav Kapoor", "Naveen Anand", "Yash Bhatia",
//     "Sohail Shaikh", "Sahil Ahuja", "Akash Nagpal", "Rituraj Sachdeva", "Shubham Oberoi",
//     "Rishi Puri", "Ayaan Khan", "Dev Sehgal", "Ishaan Grover", "Kabir Talwar",
//     "Laksh Kalra", "Dhruv Bedi", "Aryan Wadhwa", "Junaid Pathan", "Rudra Gulati",
//     "Parth Batra", "Keshav Sethi", "Ujjwal Narang", "Pranav Chaturvedi", "Noman Qureshi",
//     "Tushar Bhandari", "Nikhil Upadhyay", "Ayush Tripathi", "Bilal Khan", "Shivam Mishra",
//     "Madhav Joshi", "Kartik Shukla", "Danish Khan", "Anurag Pandey", "Rohit Tiwari",
//     "Hemant Sharma", "Aamir Shaikh", "Kunal Mehta", "Satyam Dwivedi", "Nawaz Pathan",
//     "Alok Srivastava", "Neeraj Dixit", "Faisal Qureshi", "Ajay Kashyap", "Vijay Tyagi",
//     "Shadab Ansari", "Uday Rawat", "Piyush Bisht", "Anmol Negi", "Rizwan Siddiqui",
//     "Nakul Panwar", "Ritik Bhandari", "Chetan Bora", "Farhan Ansari", "Pradeep Kandpal",
//     "Saurabh Karki", "Anand Reddy", "Kiran Rao", "Mahendra Naidu", "Hamza Pathan",
//     "Raghav Kulkarni", "Zeeshan Khan", "Atharv Deshmukh", "Mohammad Arif", "Tejas Patil",
//     "Furqan Ansari", "Niranjan Hegde", "Shariq Siddiqui", "Omkar Jadhav", "Noman Shaikh",
//     "Shreyas Gokhale", "Aadil Pathan", "Prathamesh Sawant", "Sufiyan Qureshi", "Milind Deshpande",
//     "Rauf Mirza", "Amol Chavan", "Taufeeq Momin", "Ajinkya Mane", "Yasin Sayyed",
//     "Nilesh More", "Shahbaz Baig", "Swapnil Pawar", "Javed Khan", "Datta Salunkhe",
//     "Arbaz Ansari", "Sagar Kadam", "Muzammil Shaikh", "Ruturaj Shinde", "Ayan Siddiqui",
//     "Ninad Apte", "Rashid Pathan", "Aniruddha Ranade", "Junaid Qureshi", "Atharva Tambe",
//     "Asad Mirza", "Shankar Bhat", "Faheem Momin", "Ravi Kulkarni", "Aqeel Sayyed",
//     "Sachin Patil", "Nisar Baig", "Pravin Jadhav", "Aamir Khan", "Ganesh Hegde",
//     "Shakib Ansari", "Satish Kamath", "Parvaiz Shaikh", "Venkatesh Iyer", "Arsalan Siddiqui",
//     "Srinivas Rao", "Sohail Pathan", "Harikrishna Menon", "Mudassir Qureshi", "Arvind Nair",
//     "Zubair Mirza", "Madhavan Pillai", "Azeem Momin", "Raghavan Acharya", "Shanawaz Sayyed",
//     "Shankar Shenoy", "Fardeen Baig", "Karthik Raman", "Naved Khan", "Saravanan Krishnan",
//     "Shariq Ansari", "Vignesh Subramanian", "Tanzeel Shaikh", "Prabhu Rajan", "Yameen Siddiqui",
//     "Muthu Sundaram", "Adil Pathan", "Hari Narayanan", "Asif Qureshi", "Bala Subramanian",
//     "Riyaz Mirza", "Joseph Dsouza", "Sajjad Momin", "Brian Fernandes", "Anees Sayyed",
//     "Kevin Rodrigues", "Naeem Baig", "Melvin Pereira", "Fais Khan", "Joel Gonsalves",
//     "Ahtesham Ansari", "Ryan Lobo", "Noman Shaikh", "Bikram Majumdar", "Rauf Siddiqui",
//     "Anirban Banerjee", "Faizan Pathan", "Subhajit Chatterjee", "Talha Qureshi", "Souvik Mukherjee",
//     "Shahid Mirza", "Arindam Bose", "Ruhan Momin", "Kaushik Dutta", "Aqib Sayyed",
//     "Tanmoy Sen", "Salim Baig", "Lakhan Bhadoria", "Bhupendra Tomar", "Jagdish Prajapati",
//     "Moinuddin Khan", "Narendra Lodhi", "Mahavir Gurjar", "Kailash Khatik", "Gajendra Dangi",
//     "Rameez Akhtar", "Govind Kushwaha", "Mukund Purohit", "Ramlal Meena", "Vishal Rajput",
//     "Brijesh Pathak", "Rakesh Khandelwal", "Yogesh Suryavanshi", "Shahrukh Qureshi", "Manoj Vaishnav",
//     "Dheeraj Tanwar", "Lokesh Parihar", "Bharat Sisodiya", "Kamal Baghel", "Vinay Raghuvanshi",
//     "Prem Chouhan", "Naresh Solanki", "Hemraj Jat", "Mukul Goswami", "Raghunath Mali",
//     "Devesh Vyas", "Kishan Bairwa", "Mahesh Dadhich", "Rajendra Sharma", "Ghanshyam Teli",
//     "Pawan Kachhwaha", "Dilip Barot", "Hariram Suthar", "Bhanwar Lal Jat", "Chandrakant Mahajan",
//     "Pratap Rathod", "Shivraj Chandel", "Damodar Acharya", "Narottam Nayak", "Mahendra Behera",
//     "Pradeep Mahapatra", "Ranjit Pradhan", "Subrat Mishra", "Bikash Sahu", "Tapan Nayak",
//     "Jayanta Rout", "Basudev Panda", "Arif Hussain", "Shakil Ahmad", "Fahad Ansari",
//     "Taufiq Shaikh", "Sarfaraz Khan", "Azeem Qadri", "Nadeem Akhtar", "Aamir Siddiqui",
//     "Suhail Khan", "Firoz Alam", "Armaan Farooqui", "Junaid Alam", "Nawab Hussain",
//     "Zaki Ansari", "Adnan Farooqui", "Shayan Khan", "Shadab Alam", "Ayaan Farooqui",
//     "Rehan Akhtar", "Tanzeem Khan", "Furkan Qureshi", "Aatif Siddiqui", "Rizwan Alam",
//     "Sufyan Khan", "Shariq Hussain", "Faheem Akhtar", "Aqdas Ansari", "Noman Farooqui",
//     "Shavez Khan", "Sameer Alam", "Mubeen Qureshi", "Aslam Hussain", "Yasir Siddiqui",
//     "Shadan Khan", "Zeeshan Alam", "Aariz Ansari", "Ahsan Farooqui", "Saif Khan",
//     "Muzammil Alam", "Aadil Siddiqui", "Shan Qureshi", "Arham Khan", "Aatif Alam",
//     "Furqan Siddiqui", "Rayan Ansari", "Imteyaz Khan", "Shahnawaz Qureshi", "Parvez Alam",
//     "Naseem Akhtar", "Tariq Hussain", "Ritesh Choube", "Karan Rathi", "Shahid Usmani",
//     "Mangesh Shirole", "Vikrant Nikam", "Aqeel Ahmed", "Sambhaji Gaikwad", "Nitin Borse",
//     "Haroon Rashid", "Prakash Borse", "Aniket Dhumal", "Amanullah Khan", "Sudarshan Kale",
//     "Rohit Ingle", "Sajid Usmani", "Dattatray Shirsat", "Madhukar Bhosale", "Nafees Ahmad",
//     "Abhay Wankhede", "Shivendra Bundela", "Fahim Akram", "Ganesh Mhatre", "Vilas Thorat",
//     "Shoaib Akhtar", "Nandkishor Chikte", "Umesh Dongre", "Rauf Ahmed", "Balkrishna Chitale",
//     "Shubham Khairnar", "Naved Parveen", "Ravikant Sonkar", "Chandrashekhar Karande", "Zubair Ahmad",
//     "Mohan Tembhurne", "Prashant Meshram", "Ahtesham Ali", "Girish Rane", "Tukaram Koli",
//     "Riyazuddin Khan", "Babulal Sen", "Rupesh Netam", "Sakib Usmani", "Jagannath Mahato",
//     "Tarachand Bhoi", "Waseem Akram", "Mithilesh Mandal", "Suresh Hazarika", "Junaid Ashraf",
//     "Pritam Basumatary", "Keshab Kalita", "Arsalan Ahmed", "Bhaben Gogoi", "Manab Deka",
//     "Noman Ashraf", "Dipankar Saikia", "Rituraj Borthakur", "Suhail Parveen", "Tirthankar Debnath",
//     "Sanjib Kar", "Faiz Alam", "Prasenjit Debbarma", "Kaushik Tripura", "Shariq Ahmed",
//     "Nilotpal Neog", "Utpal Bora", "Yameen Ashraf", "Debojit Nath", "Himadri Talukdar",
//     "Arman Usmani", "Rakesh Karmakar", "Subhash Biswas", "Tanzeel Alam", "Bikramjit Deori",
//     "Parag Medhi", "Ayaan Rashid", "Goutam Barman", "Sudip Sutradhar", "Mubeen Ahmed",
//     "Kunal Lahiri", "Tapan Naskar", "Firoz Parveen", "Arup Bhowmik", "Jaydeep Rakshit",
//     "Sufiyan Akram", "Nirmal Deb", "Rajat Malakar", "Asif Usmani", "Debashis Paul",
//     "Prabir Shil", "Naseem Alam", "Anupam Saha", "Tapas Adhikary", "Rizwan Ahmed",
//     "Biplab Dhar", "Santanu Koley", "Faizan Rashid", "Ujjwal Karfa", "Pranab Maiti",
//     "Azeem Ashraf", "Soumen Jana", "Biswaroop De", "Mahipal Shekhawat", "Iqbal Nizami",
//     "Devendra Poonia", "Samiullah Faridi", "Jagmohan Beniwal", "Shamim Raza", "Surendra Godara",
//     "Aaquib Nadvi", "Hanuman Charan", "Nafees Rizvi", "Balveer Jakhar", "Shariq Warsi",
//     "Ratan Bhakar", "Ayan Rizvi", "Khemraj Mirdha", "Furkan Nadvi", "Girdhari Mahla",
//     "Rashid Warsi", "Bhanwar Puniya", "Talib Rizvi", "Lalit Saran", "Aasim Faridi",
//     "Rohtash Dhaka", "Moin Warsi", "Vijendra Peelwa", "Suhail Rizvi", "Narpat Khichar",
//     "Arbaz Nadvi", "Shyoji Ram Sihag", "Azeem Faridi", "Rajveer Dudi", "Faheem Warsi",
//     "Mukesh Pachar", "Noman Rizvi", "Omveer Jakasaniya", "Aatif Nadvi", "Kuldeep Legha",
//     "Tahir Faridi", "Himmatram Bhamu", "Aqib Warsi", "Dharmpal Burdak", "Javed Rizvi",
//     "Brijlal Karwasra", "Aadil Nadvi", "Sumer Poonia", "Shahid Faridi", "Madan Makkasar",
//     "Anas Warsi", "Ravindra Takhar", "Yusuf Rizvi", "Bhagirath Matoria", "Saad Nadvi",
//     "Gopal Siyag", "Zayan Faridi", "Ramkumar Bhadu", "Naeem Warsi", "Shankar Joon",
//     "Huzaifa Rizvi", "Bhanwarlal Bajiya", "Ayaan Nadvi", "Mahendra Saran", "Zubair Faridi",
//     "Jagdish Gathala", "Fais Warsi", "Ramlal Kookna", "Sameer Rizvi", "Pukhraj Dular",
//     "Arham Nadvi", "Kailash Tetarwal", "Muzammil Faridi", "Gajsingh Bhakar", "Rehan Warsi",
//     "Tejpal Dhaka", "Aariz Rizvi", "Vikram Mirdha", "Shadab Nadvi", "Bhupsingh Poonia",
//     "Rizwan Faridi", "Narendra Legha", "Danish Warsi", "Harphool Sihag", "Asif Rizvi",
//     "Jitendra Godara", "Shan Nadvi", "Moolchand Jakhar", "Ahsan Faridi", "Suresh Beniwal",
//     "Faizan Warsi", "Manphool Dudi", "Imran Rizvi", "Rajendra Burdak", "Sufyan Nadvi",
//     "Hanuman Mahla", "Arsalan Faridi", "Mukhtyar Pachar", "Shahrukh Warsi", "Girdharilal Bajiya",
//     "Fardeen Rizvi", "Omprakash Kookna", "Tanzeel Nadvi", "Bhoopendra Gathala", "Raghunandan Kharol",
//     "Vardhan Bisen", "Yatendra Baghel", "Tribhuvan Markam", "Mustafa Hashmi", "Bhairav Kanwar",
//     "Kuber Netam", "Dushyant Uikey", "Jeevan Tekam", "Arif Chishti", "Harendra Porte",
//     "Bhupat Maravi", "Ramlakhan Dhurve", "Nakul Salam", "Gokul Mandavi", "Vishram Korram",
//     "Aamir Noori", "Devcharan Kawasi", "Mithlesh Potai", "Narayan Atram", "Pratap Kumeti",
//     "Kailash Nagvanshi", "Mahesh Uke", "Qasim Chishti", "Rajkumar Gedam", "Puran Meshram",
//     "Tikaram Markole", "Satyendra Baghmare", "Dinesh Kawde", "Chhotelal Pusam", "Shivprasad Naitam",
//     "Sajjad Hashmi", "Gajraj Sidar", "Bhanu Pratap Sonwani", "Ramesh Neti", "Devvrat Kunjam",
//     "Harinarayan Dhurwe", "Laxmikant Uikey", "Nandlal Atram", "Bhimsen Kawasi", "Damodar Kumre",
//     "Zain Noori", "Shivkumar Potavi", "Premsingh Markam", "Ganesh Poyam", "Ramlal Kunjam",
//     "Chandrakant Salam", "Bhaskar Marai", "Dharamlal Uike", "Kishore Pusam", "Ayaan Hashmi",
//     "Rafi Chishti", "Shayan Noori", "Faiz Hashmi", "Asrar Chishti", "Talha Noori",
//     "Noman Hashmi", "Reyan Chishti", "Sufyan Noori", "Zeeshan Hashmi", "Yameen Chishti",
//     "Aqeel Noori", "Junaid Hashmi", "Ruhan Chishti", "Ahsan Noori", "Arham Hashmi",
//     "Saif Chishti", "Aatif Noori", "Mubeen Hashmi", "Shadman Chishti", "Naeem Noori",
//     "Arsalan Hashmi", "Adil Chishti", "Faizan Noori", "Tanzeel Hashmi", "Furqan Chishti",
//     "Shariq Noori", "Aariz Hashmi", "Rizwan Chishti", "Hamza Noori", "Parvez Hashmi",
//     "Yusuf Chishti", "Naved Noori", "Azeem Hashmi", "Shahid Chishti", "Sohail Noori",
//     "Imteyaz Hashmi", "Aman Chishti", "Waseem Noori", "Fahad Chishti", "Shahrukh Noori",
//     "Asif Hashmi", "Rituraj Kapse", "Manvendra Jhala", "Dharamveer Kataria", "Nikhilesh Dongardive",
//     "Pradyumn Chandel", "Lokendra Hada", "Yograj Devda", "Shivraj Kachhi", "Bhavesh Dholakia",
//     "Anurag Kapse", "Hemraj Baria", "Tushar Vasava", "Chetan Gamit", "Jignesh Rabari",
//     "Mahipal Charan", "Devashish Munda", "Rakesh Tanti", "Prabhat Oraon", "Niraj Hansda",
//     "Kamal Hojam", "Mubashir Kazmi", "Aadil Naqvi", "Rameez Bukhari", "Arbaz Kazmi",
//     "Sarmad Naqvi", "Huzefa Bukhari", "Faheem Kazmi", "Taha Naqvi", "Aarish Bukhari",
//     "Moin Kazmi", "Rudransh Katoch", "Nakul Jamwal", "Yashwant Dogra", "Praveen Thapa",
//     "Dheerendra Rawal", "Mahesh Paneru", "Rajat Bisht", "Sudarshan Lohani", "Pankaj Fartyal",
//     "Vinod Karki", "Shahnawaz Kazmi", "Rehmat Naqvi", "Nabeel Bukhari", "Ayaan Kazmi",
//     "Sufiyan Naqvi", "Zayan Bukhari", "Mudassir Kazmi", "Rayyan Naqvi", "Arham Bukhari",
//     "Talib Kazmi", "Harshad Zala", "Mukund Vekariya", "Nitin Korat", "Bharat Makwana",
//     "Vipul Kathiriya", "Jaydev Savaliya", "Ketan Mangukiya", "Mitesh Donga", "Paresh Sorathiya",
//     "Ravindra Vachhani", "Arshed Naqvi", "Ahtesham Bukhari", "Sajjad Kazmi", "Tanzeem Naqvi",
//     "Noman Bukhari", "Fardeen Kazmi", "Yameer Naqvi", "Huzaifa Bukhari", "Shayaan Kazmi",
//     "Ruhan Naqvi", "Aniket Bhalerao", "Sachindra Gawande", "Rohidas Khobragade", "Mangesh Atram",
//     "Prakash Madavi", "Nandkishor Gedam", "Sopan Meshram", "Ganpat Uikey", "Ravikant Pusam",
//     "Shivkumar Korram", "Aqdas Bukhari", "Jibran Kazmi", "Sameeh Naqvi", "Ayan Bukhari",
//     "Faiyaz Kazmi", "Ariz Naqvi", "Naeem Bukhari", "Rafe Kazmi", "Tameem Naqvi",
//     "Zubyan Bukhari", "Dattatray Ingole", "Balkrishna Waghmare", "Gajanan Lande", "Sanjay Kakde",
//     "Vilas Nagrale", "Madhukar Kharat", "Pandurang Shingade", "Eknath Dhengre", "Ashok Bopche",
//     "Namdeo Wankhade", "Satyajeet Mohite", "Raviraj Nalawade", "Pruthviraj Shirke", "Shailendra Chavan",
//     "Abhijit Barge", "Tanmay Jagtap", "Vaibhav Khade", "Nilesh Ghorpade", "Ruturaj Mohol",
//     "Sanket Dabhade", "Mujtaba Rizwan", "Shayan Qadri", "Hammad Firdausi", "Armaan Nizari",
//     "Zarar Husaini", "Areeb Madani", "Daniyal Faruqi", "Uzair Abbasi", "Sahil Rizvi",
//     "Basit Kashmiri", "Pranay Kshirsagar", "Anand Bawane", "Tejendra Bhoyar", "Rameshwar Dhote",
//     "Yuvraj Khandekar", "Rohidas Futane", "Sharad Bisenkar", "Mahadev Tidke", "Vikasrao Wagh",
//     "Ganeshrao Katre", "Ibrahim Nizami", "Ammar Firdausi", "Mahir Qadri", "Zayan Husaini",
//     "Rayan Abbasi", "Shaheer Faruqi", "Afnan Madani", "Taha Rizwan", "Eesa Kashmiri",
//     "Zubair Nizari", "Siddhesh Surve", "Akshay Dalvi", "Omraj Palav", "Shubhransh Naik",
//     "Nikhil Rautela", "Parag Bhagat", "Mohan Kene", "Vivek Mestri", "Suhas Tandel",
//     "Prasad Parab", "Sarmad Abbasi", "Ramees Husaini", "Aariz Faruqi", "Junaid Nizami",
//     "Haseeb Qadri", "Arsham Rizwan", "Tameem Firdausi", "Aahil Madani", "Zavian Kashmiri",
//     "Jaspreet Dhillon", "Ashutosh Mishra", "Ravi Teja Reddy", "Bhavesh Desai", "Sunil Hembrom",
//     "Pradeep Narayanan", "Sukhdeep Grewal", "Rohit Pandey", "Nagarjuna Chowdary", "Kalpesh Trivedi",
//     "Ajay Tudu", "Senthil Kumar", "Amritpal Sidhu", "Shivam Tripathi", "Harsha Varma",
//     "Mitesh Joshi", "Mahesh Murmu", "Balasubramanian Pillai", "Navjot Randhawa", "Aditya Awasthi",
//     "Sai Charan Goud", "Paresh Bhatt", "Dilip Baskey", "Arunachalam Nair", "Parminder Pannu",
//     "Satyam Chaubey", "Kiran Kumar Reddy", "Nirav Vyas", "Ramesh Hansda", "Sivakumar Swaminathan",
//     "Gagandeep Cheema", "Umesh Pathak", "Raghavendra Yadav", "Jayesh Amin", "Birsa Toppo",
//     "Thangaraj Srinivasan", "Kulwinder Sekhon", "Prashant Dixit", "Lokesh Babu", "Chirag Panchal",
//     "Anil Kisku", "Ravichandran Mahadevan", "Hardeep Virk", "Abhinav Bajpai", "Madhusudhan Rao",
//     "Hemal Modi", "Sanjay Lakra", "Suresh Balan", "Amandeep Toor", "Deepak Tiwari",
//     "Krishna Murthy", "Ketan Gandhi", "Vinod Kerketta", "Murugan Rajan", "Rajwinder Mann",
//     "Nitesh Shukla", "Manoj Reddy", "Vipul Dave", "Arvind Minz", "Selvaraj Ganesan",
//     "Jatinder Chahal", "Akhilesh Upadhyay", "Praveen Naidu", "Hitesh Parekh", "Raju Oraon",
//     "Periyasamy Kannan", "Gurpreet Bajwa", "Rajat Srivastava", "Anand Raju", "Nakul Patel",
//     "Shankar Tirkey", "Elango Venkataraman", "Sandeep Dhaliwal", "Vikas Pande", "Tarun Chowdhury",
//     "Rutvik Solanki", "Mukesh Barla", "Kumaravel Arumugam", "Harjit Bains", "Piyush Tandon",
//     "Chandra Sekhar Reddy", "Yash Bhavsar", "Ajit Kujur", "Arulmozhi Natarajan", "Dineshvel Muthukrishnan",
//     "Jegadeesh Perumal", "Kumaran Thirumalai", "Madhan Velmurugan", "Prabhakaran Annamalai", "Yuvaraj Chockalingam",
//     "Boopathi Palanisamy", "Manikandan Alagappan", "Sathishkumar Dhanapal", "Tejas Bhogayata", "Maulik Kansara",
//     "Viral Chokshi", "Ruturaj Vaghasiya", "Krunal Zaveri", "Devang Majmudar", "Nisarg Jani",
//     "Parthiv Kothari", "Harit Bhayani", "Meet Sanghvi", "Pavan Kalyan Guntur", "Sandeep Penmetsa",
//     "Charan Veeramachaneni", "Lokesh Muppala", "Nikhil Velagapudi", "Tarak Kancherla", "Vamshi Katragadda",
//     "Bhargav Pasupuleti", "Rakesh Adusumilli", "Phanindra Yarlagadda", "Jaskaran Chhina", "Lovepreet Deol",
//     "Ranjodh Boparai", "Satnam Aulakh", "Gurkirat Samra", "Mandeep Basra", "Dilraj Heer",
//     "Harjot Sohal", "Balraj Tiwana", "Inderpal Atwal", "Shubhendu Rastogi", "Naman Saxena",
//     "Pratyush Nigam", "Anshul Agarwal", "Devendra Bhadouria", "Raghvendra Gautam", "Pushpendra Tomar",
//     "Shailendra Chaubey", "Mayank Katiyar", "Vivekanand Purohit", "Sukhram Kandulna", "Babulal Purty",
//     "Prakash Bodra", "Ramesh Pingua", "Nirmal Gagrai", "Ajay Surin", "Mangal Kandir",
//     "Lukas Xalxo", "Mahadev Puran", "Doman Soy", "Aravindhan Chelladurai", "Muthuvel Pandiarajan",
//     "Sarvesh Vora", "Dhruvin Rabari", "Jagadeesh Bommireddy", "Mahesh Kurella", "Amanpreet Bhullar",
//     "Jatinder Sangha", "Pranjal Srivastava", "Ritesh Chitransh", "Karthirajan Somasundaram", "Senthooran Rajasekar",
//     "Bhavin Lad", "Yatin Virani", "Sai Prudhvi Nalluri", "Chaitanya Mandava", "Sai Krishna Darsi",
//     "Raghvendra Tandon", "Ajit Kujur", "Hemal Borad", "Faheem Ansari", "Subrat Pattnaik",
//     "Ankan Ghosh", "Selvarasu Murugan", "Harmeet Sandha", "Rayan Qureshi", "Naveen Velagapudi",
//     "Mayur Chaubey", "Roshan Kisku", "Kalpesh Kanani", "Asif Usmani", "Prasanta Lenka",
//     "Sourav Mitra", "Velraj Chidambaram", "Rajwinder Johal", "Aadil Khan", "Phani Kalluri",
//     "Vivek Srivastava", "Sanjay Baskey", "Yash Virani", "Sameer Akhtar", "Debajyoti Swain",
//     "Agnivo Pal", "Karunanidhi Selvaraj", "Gurman Brar", "Fardeen Qureshi", "Praneel Veeramachaneni",
//     "Anmol Pandey", "Kailash Xalxo", "Bhavin Makwana", "Rizwan Farooqui", "Prabhat Moharana",
//     "Arka Nandi", "Muthuselvan Rajan", "Harjit Pannu", "Aamir Siddiqui", "Sai Karthik Kurella",
//     "Rohit Awasthi", "Prakash Soy", "Nirav Ladani", "Shahid Ansari", "Rabin Pradhan", "Sapta"
// ];

//     const randomNameIndex = Math.floor(Math.random() * dummyNames.length);
//     const generatedName = dummyNames[randomNameIndex];
//     const generatedId = Math.floor(1000000 + Math.random() * 9000000); 

//     // 3. FakeUser Table mein add karo (Taaki Global List me dikhe)
//     const FakeUser = require('../models/FakeUser');
//     await FakeUser.create({
//         userId: generatedId,
//         name: generatedName,
//         package: 30,
//         country: "India",
//         date: new Date() 
//     });

//     // =========================================================================
//     // 🚀 NEW: GLOBAL TEAM GROWTH LOGIC (Jaise normal topup aur cron me hota hai)
//     // =========================================================================
//     const activeUsers = await User.find({ isToppedUp: true }).select('_id globalTeamCount directCount');
//     const bulkOps = [];

//     for (const user of activeUsers) {
//         const team = user.globalTeamCount || 0;
//         const directs = user.directCount || 0;
        
//         let isLocked = false;
        
//         // Locking conditions (Same as your cron logic)
//         if (team === 2360 && directs < 6) isLocked = true;
//         else if (team === 4360 && directs < 8) isLocked = true;
//         else if (team === 7360 && directs < 10) isLocked = true;
//         else if (team === 11360 && directs < 12) isLocked = true;
//         else if (team === 16360 && directs < 14) isLocked = true;
//         else if (team === 23860 && directs < 16) isLocked = true;
//         else if (team === 33860 && directs < 18) isLocked = true;

//         if (!isLocked) {
//             bulkOps.push({
//                 updateOne: {
//                     filter: { _id: user._id },
//                     update: { $inc: { globalTeamCount: 1 } } // ✅ Sab eligible users ki team 1 se badha di
//                 }
//             });
//         }
//     }

//     if (bulkOps.length > 0) {
//         await User.bulkWrite(bulkOps);
//     }
//     // =========================================================================

//     // =========================================================================
//     // 🚀 NEW: TOTAL COMMUNITY COUNT UPDATE (SystemStat)
//     // Ye dashboard par total users ka count badhayega
//     // =========================================================================
//     const SystemStat = require('../models/SystemStat');
//     await SystemStat.findOneAndUpdate(
//         {}, 
//         { $inc: { globalFakeCount: 1 } }, // Total community / Fake count ko +1 kar dega
//         { upsert: true, returnDocument: 'after' }
//     );
//     // 4. Record Dummy Transaction (For Admin History)
//     const Transaction = require('../models/Transaction'); 
//     await Transaction.create({
//       userId: generatedId,
//       amount: Number(amount),
//       type: "promo", 
//       fromUserId: currentUser.userId,
//       toUserId: generatedId,
//       status: "success",
//       description: `Promo showcase generated for Fake ID ${generatedId}`,
//       date: new Date()
//     });

//     // 5. Success Response
//     res.json({ 
//         success: true, 
//         generatedId: generatedId, 
//         name: generatedName 
//     });

//   } catch (err) {
//     console.error("Promo Showcase Error:", err);
//     res.status(500).json({ message: "Server error during promo topup: " + err.message });
//   }
// });




// ====================================================
// 🟢 HELPER: WF + 7 Digit Unique ID Generator
// ====================================================
const generateUserId = async () => {
  let id;
  let exists = true;
  while (exists) {
    const random7Digit = Math.floor(1000000 + Math.random() * 9000000);
    id = `GW${random7Digit}`; // Example: WF1234567
    
    // Check in both real & fake tables to ensure uniqueness
    const FakeUser = require('../models/FakeUser');
    const existsInReal = await User.exists({ userId: id });
    const existsInFake = await FakeUser.exists({ userId: id });
    
    if (!existsInReal && !existsInFake) {
      exists = false;
    }
  }
  return id;
};

// ====================================================
// 🚀 PROMO DUMMY TOPUP ROUTE (WF Prefix + No Team Update)
// ====================================================
// router.post('/promo-dummy-topup', authMiddleware, async (req, res) => {
//   try {
//     const { amount, transactionPassword } = req.body;
//     const currentUser = await User.findOne({ userId: req.user.userId });

//     // 1. Password Check
//     if (!transactionPassword || transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
//       return res.status(403).json({ success: false, message: "Invalid transaction password" });
//     }

//     // 2. Indian Names List
//     const dummyNames = [
//       "Yashraj Trivedi", "Zoravar Bhatt", "Aarav Sharma", "Vivaan Verma", "Faizan Ansari",
//       "Aditya Singh", "Imran Shaikh", "Arjun Patel", "Krishna Gupta", "Rohan Yadav",
//       "Aftab Sayyed", "Rahul Mishra", "Amit Tiwari", "Nadeem Siddiqui", "Vikas Pandey",
//       "Sandeep Dubey", "Mohit Choudhary", "Arman Pathan", "Nitin Jha", "Manish Joshi",
//       "Deepak Mehta", "Ankit Shah", "Rakesh Agarwal", "Suresh Jain", "Sajid Baig",
//       "Prakash Saxena", "Mukesh Srivastava", "Abhishek Chauhan", "Ravindra Thakur", "Pankaj Rathore",
//       "Sameer Qureshi", "Dinesh Solanki", "Ashok Parmar", "Rajesh Soni", "Salman Mirza",
//       "Sanjay Bansal", "Vivek Goyal", "Harsh Mahajan", "Tarun Arora", "Irfan Momin",
//       "Varun Malhotra", "Rajat Khanna", "Gaurav Kapoor", "Naveen Anand", "Yash Bhatia",
//       "Sohail Shaikh", "Sahil Ahuja", "Akash Nagpal", "Rituraj Sachdeva", "Shubham Oberoi",
//       "Rishi Puri", "Ayaan Khan", "Dev Sehgal", "Ishaan Grover", "Kabir Talwar",
//       "Laksh Kalra", "Dhruv Bedi", "Aryan Wadhwa", "Junaid Pathan", "Rudra Gulati",
//       "Parth Batra", "Keshav Sethi", "Ujjwal Narang", "Pranav Chaturvedi", "Noman Qureshi",
//       "Tushar Bhandari", "Nikhil Upadhyay", "Ayush Tripathi", "Bilal Khan", "Shivam Mishra",
//       "Madhav Joshi", "Kartik Shukla", "Danish Khan", "Anurag Pandey", "Rohit Tiwari",
//       "Hemant Sharma", "Aamir Shaikh", "Kunal Mehta", "Satyam Dwivedi", "Nawaz Pathan",
//       "Alok Srivastava", "Neeraj Dixit", "Faisal Qureshi", "Ajay Kashyap", "Vijay Tyagi",
//       "Shadab Ansari", "Uday Rawat", "Piyush Bisht", "Anmol Negi", "Rizwan Siddiqui",
//       "Nakul Panwar", "Ritik Bhandari", "Chetan Bora", "Farhan Ansari", "Pradeep Kandpal",
//       "Saurabh Karki", "Anand Reddy", "Kiran Rao", "Mahendra Naidu", "Hamza Pathan",
//       "Raghav Kulkarni", "Zeeshan Khan", "Atharv Deshmukh", "Mohammad Arif", "Tejas Patil",
//       "Furqan Ansari", "Niranjan Hegde", "Shariq Siddiqui", "Omkar Jadhav", "Noman Shaikh",
//       "Shreyas Gokhale", "Aadil Pathan", "Prathamesh Sawant", "Sufiyan Qureshi", "Milind Deshpande",
//       "Rauf Mirza", "Amol Chavan", "Taufeeq Momin", "Ajinkya Mane", "Yasin Sayyed"
//     ];

//     const randomNameIndex = Math.floor(Math.random() * dummyNames.length);
//     const generatedName = dummyNames[randomNameIndex];
    
//     // 🔥 GENERATE WF PREFIXED ID (e.g. WF1234567)
//     const generatedId = await generateUserId(); 

//     // 3. FakeUser Table mein add karo
//     const FakeUser = require('../models/FakeUser');
//     await FakeUser.create({
//         userId: generatedId,
//         name: generatedName,
//         package: Number(amount) || 30,
//         country: "India",
//         date: new Date() 
//     });

//     // 4. Record Dummy Transaction (For Admin History)
    

//     // 5. Success Response
//     res.json({ 
//         success: true, 
//         message: `Package activated successfully for ${generatedId}!`,
//         generatedId: generatedId, 
//         name: generatedName 
//     });

//   } catch (err) {
//     console.error("Promo Showcase Error:", err);
//     res.status(500).json({ success: false, message: "Server error during promo topup: " + err.message });
//   }
// });


// ====================================================
// 🚀 PROMO DUMMY TOPUP ROUTE (WF Prefix + Stat Update + Live Feed Push)
// // ====================================================
// router.post('/promo-dummy-topup', authMiddleware, async (req, res) => {
//   try {
//     const { amount, transactionPassword } = req.body;
//     const packageAmount = Number(amount) || 30; // Amount calculate kar lenge
    
//     // User import kar lenge current user dhundhne ke liye
//     const User = require('../models/User'); 
//     const currentUser = await User.findOne({ userId: req.user.userId });

//     // 1. Password Check
//     if (!transactionPassword || transactionPassword.toLowerCase() !== currentUser.transactionPassword.toLowerCase()) {
//       return res.status(403).json({ success: false, message: "Invalid transaction password" });
//     }

//     // 2. Indian Names List
//     const dummyNames = [
//       "Yashraj Trivedi", "Zoravar Bhatt", "Aarav Sharma", "Vivaan Verma", "Faizan Ansari",
//       "Aditya Singh", "Imran Shaikh", "Arjun Patel", "Krishna Gupta", "Rohan Yadav",
//       "Aftab Sayyed", "Rahul Mishra", "Amit Tiwari", "Nadeem Siddiqui", "Vikas Pandey",
//       "Sandeep Dubey", "Mohit Choudhary", "Arman Pathan", "Nitin Jha", "Manish Joshi",
//       "Deepak Mehta", "Ankit Shah", "Rakesh Agarwal", "Suresh Jain", "Sajid Baig",
//       "Prakash Saxena", "Mukesh Srivastava", "Abhishek Chauhan", "Ravindra Thakur", "Pankaj Rathore",
//       "Sameer Qureshi", "Dinesh Solanki", "Ashok Parmar", "Rajesh Soni", "Salman Mirza",
//       "Sanjay Bansal", "Vivek Goyal", "Harsh Mahajan", "Tarun Arora", "Irfan Momin",
//       "Varun Malhotra", "Rajat Khanna", "Gaurav Kapoor", "Naveen Anand", "Yash Bhatia",
//       "Sohail Shaikh", "Sahil Ahuja", "Akash Nagpal", "Rituraj Sachdeva", "Shubham Oberoi",
//       "Rishi Puri", "Ayaan Khan", "Dev Sehgal", "Ishaan Grover", "Kabir Talwar",
//       "Laksh Kalra", "Dhruv Bedi", "Aryan Wadhwa", "Junaid Pathan", "Rudra Gulati",
//       "Parth Batra", "Keshav Sethi", "Ujjwal Narang", "Pranav Chaturvedi", "Noman Qureshi",
//       "Tushar Bhandari", "Nikhil Upadhyay", "Ayush Tripathi", "Bilal Khan", "Shivam Mishra",
//       "Madhav Joshi", "Kartik Shukla", "Danish Khan", "Anurag Pandey", "Rohit Tiwari",
//       "Hemant Sharma", "Aamir Shaikh", "Kunal Mehta", "Satyam Dwivedi", "Nawaz Pathan",
//       "Alok Srivastava", "Neeraj Dixit", "Faisal Qureshi", "Ajay Kashyap", "Vijay Tyagi",
//       "Shadab Ansari", "Uday Rawat", "Piyush Bisht", "Anmol Negi", "Rizwan Siddiqui",
//       "Nakul Panwar", "Ritik Bhandari", "Chetan Bora", "Farhan Ansari", "Pradeep Kandpal",
//       "Saurabh Karki", "Anand Reddy", "Kiran Rao", "Mahendra Naidu", "Hamza Pathan",
//       "Raghav Kulkarni", "Zeeshan Khan", "Atharv Deshmukh", "Mohammad Arif", "Tejas Patil",
//       "Furqan Ansari", "Niranjan Hegde", "Shariq Siddiqui", "Omkar Jadhav", "Noman Shaikh",
//       "Shreyas Gokhale", "Aadil Pathan", "Prathamesh Sawant", "Sufiyan Qureshi", "Milind Deshpande",
//       "Rauf Mirza", "Amol Chavan", "Taufeeq Momin", "Ajinkya Mane", "Yasin Sayyed"
//     ];

//     const randomNameIndex = Math.floor(Math.random() * dummyNames.length);
//     const generatedName = dummyNames[randomNameIndex];
    
//     // 🔥 GENERATE WF PREFIXED ID (e.g. WF1234567) using your existing function
//     const generatedId = await generateUniqueDummyId(); 

//     // Generate Fake Hash for the live feed clickability
//     const fakeHash = "0x" + Math.random().toString(16).substr(2, 40) + Date.now().toString(16).substr(0, 24);

//     // 3. FakeUser Table mein add karo
//     const FakeUser = require('../models/FakeUser');
//     await FakeUser.create({
//         userId: generatedId,
//         name: generatedName,
//         package: packageAmount,
//         country: "India",
//         date: new Date() 
//     });

//     // 4. Record Dummy Transaction
//     await DummyTransaction.create({
//       userId: generatedId,
//       name: generatedName,
//       amount: packageAmount,
//       type: "promo_activation",
//       hash: fakeHash,
//       status: "Success",
//       createdAt: new Date()
//     });

//     // 5. Transaction History me bhi add kar dete hain Admin record ke liye
//     const Transaction = require('../models/Transaction'); 
//     await Transaction.create({
//       userId: generatedId,
//       amount: packageAmount,
//       type: "promo", 
//       fromUserId: currentUser.userId,
//       toUserId: generatedId,
//       status: "success",
//       description: `Promo showcase generated for Fake ID ${generatedId}`,
//       date: new Date()
//     });

//     // =========================================================================
//     // 🔥 6. NAYA: UPDATE TOTAL STATS (Isse Dashboard pe direct amount badhega)
//     // =========================================================================
//     const todayStr = getFormattedDate(); 
//     try {
//         await SystemStat.updateOne(
//             { date: todayStr }, 
//             { $inc: { todayFakeUsdtAmount: packageAmount } }, 
//             { upsert: true }
//         );
//         // Total global fake count bhi badha dete hain
//         await SystemStat.findOneAndUpdate(
//             {}, 
//             { $inc: { globalFakeCount: 1 } }, 
//             { upsert: true }
//         );
//     } catch (dbErr) {
//         console.log("⚠️ Stats DB Update Error:", dbErr.message);
//     }

//     // =========================================================================
//     // 🔥 7. NAYA: ADD TO LIVE DEPOSITS FEED (Turant website pe popup aayega)
//     // =========================================================================
//     const instantTx = {
//         userId: generatedId,
//         name: generatedName,
//         fromAddress: "PromoTopUp",
//         toAddress: TARGET_WALLET || "PromoTopUp",
//         amount: packageAmount,
//         hash: fakeHash,
//         status: "Success",
//         type: "fake", // Ensures it looks exactly like the bot feed
//         createdAt: new Date()
//     };

//     liveDepositsFeed.unshift(instantTx);
//     if (liveDepositsFeed.length > 500) liveDepositsFeed.pop();
//     saveCache();

//     // 8. Success Response
//     res.json({ 
//         success: true, 
//         message: `Package activated successfully for ${generatedId}!`,
//         generatedId: generatedId, 
//         name: generatedName 
//     });

//   } catch (err) {
//     console.error("Promo Showcase Error:", err);
//     res.status(500).json({ success: false, message: "Server error during promo topup: " + err.message });
//   }
// });

// ====================================================
// 🚀 PROMO DUMMY TOPUP (NO GLOBAL TEAM UPDATE)
// ====================================================
 

// backend/routes/userRoutes.js (ya equivalent file)

// 1. Pehle controller ko import karo
const { getSalaryProgress } = require('../controllers/salaryController'); 

// 2. Phir ye route add kar do
router.get('/salary-progress/:userId', getSalaryProgress);


 



router.get('/global-team-count/:userId', async (req, res) => {
  try {
    // System me total users
    const users = await User.find({}, { userId: 1, _id: 0 }).lean();
    const count = users.length;

    res.json({ count });
  } catch (err) {
    console.error('Error fetching global team count:', err);
    res.status(500).json({ message: 'Failed to a fetch global team count' });
  }
});


 
 

 


// 🔥 ADMIN ROUTE: Purane Missed Rewards Dilane Ke Liye (Bas Ek Baar Chalana Hai)
 


// routes/user.js
// ✅ UPDATED: Sponsor Name Fetch (Dono tables check karega)
router.get('/sponsor-name/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. Pehle 'User' (Real) collection mein dhoondo
    // Sirf 'name' select kar rahe hain taaki query fast ho
    let sponsor = await User.findOne({ userId: id }).select('name');

    // 2. 🔥 Agar Real mein nahi mila, toh 'FakeUser' table mein check karo
    if (!sponsor) {
      // Ensure karna ki FakeUser model upar require/import kiya hua hai
      if (typeof FakeUser !== 'undefined') {
        sponsor = await FakeUser.findOne({ userId: id }).select('name');
      } else if (typeof DummyUser !== 'undefined') {
        // Fallback agar galti se purana model use ho raha ho
        sponsor = await DummyUser.findOne({ userId: id }).select('name');
      }
    }

    // 3. Agar dono jagah nahi mila toh 404
    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found' });
    }

    // 4. Sirf naam bhej do (Frontend isi ka intezaar kar raha hai)
    res.json({ name: sponsor.name });

  } catch (err) {
    console.error("Sponsor Name Fetch Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ==========================================
// ✅ GET REWARD PROGRESS STATS API
// ==========================================
// ==========================================
// ✅ FAST: GET REWARD PROGRESS STATS API
// ==========================================
router.get('/reward-stats/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const user = await User.findOne({ userId });
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 FASTER WAY: Ek single database call se saari team nikal lo
    const result = await User.aggregate([
      { $match: { userId: userId } },
      {
        $graphLookup: {
          from: "users",
          startWith: "$userId",
          connectFromField: "userId",
          connectToField: "sponsorId",
          as: "fullTeam",
          maxDepth: 15,
          depthField: "level" // direct = level 0, indirect = level 1+
        }
      }
    ]);

    let teamSize30 = 0;
    let teamSize60 = 0;
    let teamSize120 = 0;
    let directs = [];

    // Memory (RAM) mein fast counting
    if (result.length > 0 && result[0].fullTeam) {
       const fullTeam = result[0].fullTeam;
       
       for (const member of fullTeam) {
           // Level 0 ka matlab Direct Member hai
           if (member.level === 0) {
               directs.push(member);
           } 
           // Level > 0 ka matlab Downline Team (indirects) hai
           else {
               const amt = member.topUpAmount || 0;
               if (amt >= 30) teamSize30++;
               if (amt >= 60) teamSize60++;
               if (amt >= 120) teamSize120++;
           }
       }
    }

    res.json({
      success: true,
      ownTopUpAmount: user.topUpAmount || 0,
      currentRanks: {
        managerRank: user.managerRank || 0,
        seniorManagerRank: user.seniorManagerRank || 0,
        executiveManagerRank: user.executiveManagerRank || 0
      },
      teamSizes: {
        30: teamSize30,
        60: teamSize60,
        120: teamSize120
      },
      directs: directs.map(d => ({
        topUpAmount: d.topUpAmount || 0,
        managerRank: d.managerRank || 0,
        seniorManagerRank: d.seniorManagerRank || 0,
        executiveManagerRank: d.executiveManagerRank || 0
      }))
    });

  } catch (err) {
    console.error("Reward Stats Error:", err);
    res.status(500).json({ message: "Server error fetching reward stats" });
  }
});
 
// ---------------------------
 

 


// ✅ UPDATED GET ROUTE: Supports both Real and Dummy Users
// Is file ke top par 'bot' import hona chahiye (jahan aapne bot setup kiya hai)
// const { bot } = require('../utils/telegramBot'); 

const mongoose = require('mongoose');
const sanitizeUser = require('../utils/sanitizeUser');

// router.get('/:userId', authMiddleware, async (req, res) => {
//   try {
//     const rawUserId = req.params.userId;
//     const loggedInUserId = Number(req.user.userId);

//     // 🛡️ 1. Validation
//     if (!rawUserId || rawUserId === "undefined") {
//       return res.status(400).json({ success: false, message: 'User ID is missing' });
//     }

//     let query = {};
//     let targetUserId = null;
    
//     // 💡 2. Smart Detection
//     if (mongoose.Types.ObjectId.isValid(rawUserId) && rawUserId.length === 24) {
//       query = { _id: rawUserId };
//     } else if (!isNaN(Number(rawUserId))) {
//       targetUserId = Number(rawUserId);
//       query = { userId: targetUserId };
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid ID format' });
//     }

//     // 🔥 SECURITY LOCK: Sirf Admin ya wahi user apna data dekh sake
//     if (req.user.role !== 'admin' && targetUserId && targetUserId !== loggedInUserId) {
//         return res.status(403).json({ success: false, message: "Unauthorized: You can only view your own profile." });
//     }

//     // 3. Search Real User
//     let user = await User.findOne(query).select('-password -transactionPassword -resetToken -__v');
//     let isFake = false;
    
//     // 🔥 4. Search Fake User if Real not found
//     if (!user) {
//         const FakeUser = require('../models/FakeUser');
//         user = await FakeUser.findOne(query).select('-__v');
        
//         if (!user && typeof DummyUser !== 'undefined') {
//             user = await DummyUser.findOne(query).select('-__v');
//         }

//         if (user) {
//             isFake = true;
//             user = user.toObject ? user.toObject() : user;
//             if (user.isToppedUp && (!user.packages || user.packages.length === 0)) {
//                 user.packages = [{ amount: user.topUpAmount || 30 }];
//             }
//         }
//     }

//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     // 🏆 5. Sync Logic
//     if (!isFake && user.totalRewardIncome === 0 && user.rewardIncome > 0) {
//         user.totalRewardIncome = user.rewardIncome;
//         await user.save();
//     }

//     // 💰 6. Response
//     // res.json({ 
//     //     success: true,
//     //     user: user, 
//     //     income: {
//     //         totalDirectIncome: user.totalDirectIncome || user.directIncome || 0,
//     //         totalLevelIncome: user.levelIncome || 0,
//     //         totalRewardIncome: user.totalRewardIncome || user.rewardIncome || 0,
//     //         totalIncome: (user.totalDirectIncome || 0) + (user.levelIncome || 0) + (user.totalRewardIncome || 0)
//     //     }
//     // });
//     // 💰 6. Response
//     res.json({ 
//         success: true,
//         user: user, 
//         income: {
//             totalDirectIncome: user.totalDirectIncome || user.directIncome || 0,
            
//             // 🔥 FIX: Yahan user.totalLevelIncome add kar diya hai
//             totalLevelIncome: user.totalLevelIncome || user.levelIncome || 0, 
            
//             totalRewardIncome: user.totalRewardIncome || user.rewardIncome || 0,
            
//             // 🔥 FIX: Total income mein bhi totalLevelIncome add kar diya
//             totalIncome: (user.totalDirectIncome || 0) + (user.totalLevelIncome || user.levelIncome || 0) + (user.totalRewardIncome || 0)
//         }
//     });

//   } catch (err) {
//     console.error("Error fetching user profile:", err.message);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });


// ---------------------------
// 2. UPDATE PROFILE ROUTE - 🔥 SECURED
// ---------------------------

// ---------------------------
// WALLET & ACCOUNT DETAILS UPDATE
// ---------------------------
router.put('/update-wallet/:userId', authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.params.userId;
    // Logged in user id ko string mein le rahe hain taaki 'WF...' format safely match ho
    const loggedInUserId = req.user.userId;

    // 🔥 SECURITY LOCK: Sirf Admin ya wahi user update kar sake (Case insensitive)
    if (req.user.role !== 'admin' && String(rawUserId).toLowerCase() !== String(loggedInUserId).toLowerCase()) {
        return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own profile." });
    }

    const { walletAddress, upiId } = req.body;

    // 🔥 Alphanumeric (WF...) ID ke liye RegExp use kiya taaki match fail na ho
    const user = await User.findOne({ userId: new RegExp(`^${rawUserId}$`, 'i') });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 🔒 PERMANENT WALLET LOCK & HISTORY LOGIC
    if (walletAddress && walletAddress.trim() !== '') {
      
      // Agar pehle se address hai aur wo change karne ki koshish kar raha hai, toh block karo
      if (user.walletAddress && user.walletAddress.trim() !== '' && walletAddress.trim() !== user.walletAddress) {
        return res.status(403).json({ message: 'Wallet Locked: Wallet address cannot be changed once it is set.' });
      }
      
      // Agar address khali tha, toh usko update karne do aur History mein daal do
      if (walletAddress.trim() !== user.walletAddress) {
        
        // 🔥 NAYA LOGIC: History array banaiye aur First-time entry daaliye
        if (!user.walletAddressHistory) {
            user.walletAddressHistory = [];
        }
        
        user.walletAddressHistory.push({
            address: walletAddress.trim(), 
            changedAt: new Date(),
            updatedBy: "User" 
        });

        // Final address database mein save ho raha hai
        user.walletAddress = walletAddress.trim();
        user.walletAddressChangeCount = (user.walletAddressChangeCount || 0) + 1;
        user.walletAddressChangeWindowStart = new Date();
      }
    }

    // 🔥 UPI ID Update (Kyunki naye design me UPI ID bhi hai)
    if (upiId !== undefined) {
        user.upiId = upiId.trim();
    }

    await user.save();
    res.json({ success: true, message: 'Account Details updated successfully', user: user });
  } catch (err) {
    console.error('Profile Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const rawUserId = req.params.userId;
    // 🔥 FIX 1: Yahan se Number() hata diya taaki 'WF...' string format mein hi rahe
    const loggedInUserId = req.user.userId; 

    // 🛡️ 1. Validation
    if (!rawUserId || rawUserId === "undefined") {
      return res.status(400).json({ success: false, message: 'User ID is missing' });
    }

    let query = {};
    
    // 💡 2. Smart Detection (Alphanumeric IDs ke liye fix kiya)
    if (mongoose.Types.ObjectId.isValid(rawUserId) && rawUserId.length === 24) {
      query = { _id: rawUserId };
    } else if (typeof rawUserId === 'string' && rawUserId.trim() !== '') {
      // 🔥 FIX 2: isNaN() check hata diya, seedha string as userId pass kiya (case-insensitive search ke sath)
      query = { userId: new RegExp(`^${rawUserId}$`, 'i') }; 
    } else {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // 🔥 SECURITY LOCK: Sirf Admin ya wahi user apna data dekh sake
    if (req.user.role !== 'admin' && rawUserId.toLowerCase() !== loggedInUserId.toLowerCase()) {
        return res.status(403).json({ success: false, message: "Unauthorized: You can only view your own profile." });
    }

    // 3. Search Real User
    let user = await User.findOne(query).select('-password -transactionPassword -resetToken -__v');
    let isFake = false;
    
    // 🔥 4. Search Fake User if Real not found
    if (!user) {
        const FakeUser = require('../models/FakeUser');
        user = await FakeUser.findOne(query).select('-__v');
        
        if (!user && typeof DummyUser !== 'undefined') {
            user = await DummyUser.findOne(query).select('-__v');
        }

        if (user) {
            isFake = true;
            user = user.toObject ? user.toObject() : user;
            if (user.isToppedUp && (!user.packages || user.packages.length === 0)) {
                user.packages = [{ amount: user.topUpAmount || 30 }];
            }
        }
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // 🏆 5. Sync Logic
    if (!isFake && user.totalRewardIncome === 0 && user.rewardIncome > 0) {
        user.totalRewardIncome = user.rewardIncome;
        await user.save();
    }

    // 💰 6. Response
    res.json({ 
        success: true,
        user: user, 
        income: {
            totalDirectIncome: user.totalDirectIncome || user.directIncome || 0,
            totalLevelIncome: user.totalLevelIncome || user.levelIncome || 0, 
            totalRewardIncome: user.totalRewardIncome || user.rewardIncome || 0,
            totalIncome: (user.totalDirectIncome || 0) + (user.totalLevelIncome || user.levelIncome || 0) + (user.totalRewardIncome || 0)
        }
    });

  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    const targetUserId = Number(req.params.userId);
    const loggedInUserId = Number(req.user.userId);

    // 🔥 SECURITY LOCK: Sirf Admin ya wahi user update kar sake
    if (req.user.role !== 'admin' && targetUserId !== loggedInUserId) {
        return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own profile." });
    }

    const { walletAddress, oldTxnPassword, name, email, mobile } = req.body;

    const user = await User.findOne({ userId: targetUserId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Transaction Password Verify
    if (!oldTxnPassword || oldTxnPassword !== user.transactionPassword) {
      return res.status(403).json({ message: 'Invalid Transaction Password.' });
    }

    // 🔒 PERMANENT WALLET LOCK & HISTORY LOGIC
    if (walletAddress && walletAddress.trim() !== '') {
      
      // Agar pehle se address hai aur wo change karne ki koshish kar raha hai, toh block karo
      if (user.walletAddress && user.walletAddress.trim() !== '' && walletAddress !== user.walletAddress) {
        return res.status(403).json({ message: 'Wallet Locked: Wallet address cannot be changed once it is set.' });
      }
      
      // Agar address khali tha, toh usko update karne do aur History mein daal do
      if (walletAddress !== user.walletAddress) {
        
        // 🔥 NAYA LOGIC: History array banaiye aur First-time entry daaliye
        if (!user.walletAddressHistory) {
            user.walletAddressHistory = [];
        }
        
        user.walletAddressHistory.push({
            address: walletAddress.trim(), // Jo naya address dala gaya hai
            changedAt: new Date(),
            updatedBy: "User" // 👈 User ne khud set kiya hai, ye track ho gaya
        });

        // Final address database mein save ho raha hai
        user.walletAddress = walletAddress.trim();
        user.walletAddressChangeCount = (user.walletAddressChangeCount || 0) + 1;
        user.walletAddressChangeWindowStart = new Date();
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully', user: user });
  } catch (err) {
    console.error('Profile Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ---------------------------
// 3. CHECK WALLET
// ---------------------------
router.post('/check-wallet', async (req, res) => {
  const { walletAddress } = req.body;
  const exists = await User.findOne({ walletAddress });
  res.json({ exists: !!exists });
});


// ---------------------------
// 4. PASSWORD CHANGE - 🔥 SECURED WITH authMiddleware
// ---------------------------
router.put('/change-password/:userId', authMiddleware, async (req, res) => {
  const targetUserId = Number(req.params.userId);
  const loggedInUserId = Number(req.user.userId);

  // 🔥 SECURITY LOCK: Sirf apna password badal sakta hai
  if (req.user.role !== 'admin' && targetUserId !== loggedInUserId) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
  }

  const { oldPassword, newPassword, oldTxnPassword, newTxnPassword } = req.body;
  
  try {
    const user = await User.findOne({ userId: targetUserId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (oldPassword && newPassword) {
      if (oldPassword !== user.password) {
        return res.status(403).json({ message: 'Incorrect old login password' });
      }
      user.password = newPassword; 
    }

    if (oldTxnPassword && newTxnPassword) {
      if (oldTxnPassword !== user.transactionPassword) {
        return res.status(403).json({ message: 'Incorrect old transaction password' });
      }
      user.transactionPassword = newTxnPassword; 
    }

    await user.save();
    res.json({ message: 'Password(s) updated successfully' });

  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
 

// Ye aapki file ki sabse aakhiri line honi chahiye 👇
module.exports = router;