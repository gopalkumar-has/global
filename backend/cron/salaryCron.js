
const cron = require('node-cron');
const User = require('../models/User');
const PackageActivation = require('../models/PackageActivation');
const AutoCompoundV2 = require('../models/AutoCompoundV2');
const Transaction = require('../models/Transaction');

const roundMoney = (n) =>
  Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const getISTDate = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const p = {};
  parts.forEach(x => p[x.type] = x.value);
  return `${p.year}-${p.month}-${p.day}`;
};

// User ka earliest own package startDate.
// No new timer fields are required.
const getUserFirstPackageDate = async (userId) => {
  const [normal, compound] = await Promise.all([
    PackageActivation.findOne({ userId: String(userId) })
      .sort({ startDate: 1 })
      .select('startDate')
      .lean(),

    AutoCompoundV2.findOne({ userId: String(userId) })
      .sort({ startDate: 1 })
      .select('startDate')
      .lean()
  ]);

  const dates = [normal?.startDate, compound?.startDate]
    .filter(Boolean)
    .map(d => new Date(d))
    .filter(d => !Number.isNaN(d.getTime()));

  if (!dates.length) return null;

  return new Date(Math.min(...dates.map(d => d.getTime())));
};

// Highest Direct Business slab.
const getSalarySlab = (business) => {
  if (business >= 5000) return 40;
  if (business >= 3000) return 20;
  if (business >= 1000) return 6;
  if (business >= 500) return 3;
  return 0;
};

// Direct Business = only personally sponsored users' package purchases.
// Both Normal and Auto Compound V2 are counted.
const getDirectBusiness = async (userId, startDate, endDate) => {
  const directs = await User.find({
    sponsorId: String(userId)
  }).select('userId').lean();

  const directIds = directs.map(u => String(u.userId));
  if (!directIds.length) return 0;

  const dateRange = {
    $gte: startDate,
    $lt: endDate
  };

  const [normal, compound] = await Promise.all([
    PackageActivation.aggregate([
      {
        $match: {
          userId: { $in: directIds },
          startDate: dateRange
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$packageAmount' }
        }
      }
    ]),
    AutoCompoundV2.aggregate([
      {
        $match: {
          userId: { $in: directIds },
          startDate: dateRange
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$packageAmount' }
        }
      }
    ])
  ]);

  return roundMoney(
    Number(normal[0]?.total || 0) +
    Number(compound[0]?.total || 0)
  );
};

// Qualification and daily payout engine.
const processDailySalary = async () => {
  const now = new Date();
  const today = getISTDate();

  console.log('[DAILY SALARY] Started:', today);

  try {
    // A. Users who have a package but salary has not been decided.
  const users = await User.find({
  $or: [
    { salaryStatus: 'not_started' },
    { salaryStatus: { $exists: false } }
  ]
}).select('userId').lean();

    for (const item of users) {
      try {
        const user = await User.findOne({ userId: item.userId });
        if (!user) continue;

        const firstPackageDate = await getUserFirstPackageDate(user.userId);
        if (!firstPackageDate) continue;

        const qualificationEnd = new Date(firstPackageDate);
        qualificationEnd.setDate(qualificationEnd.getDate() + 15);

        // Wait until the complete 15-day window is over.
        if (now < qualificationEnd) continue;

        const directBusiness = await getDirectBusiness(
          user.userId,
          firstPackageDate,
          qualificationEnd
        );

        const dailyAmount = getSalarySlab(directBusiness);

        const payoutStart = new Date(qualificationEnd);
        payoutStart.setDate(payoutStart.getDate() + 1);

        // Lock the highest achieved slab exactly once.
        const locked = await User.findOneAndUpdate(
          {
            _id: user._id,
$or: [
  { salaryStatus: 'not_started' },
  { salaryStatus: { $exists: false } }
]          },
          {
            $set: {
              salaryQualifiedBusiness: directBusiness,
              salaryDailyAmount: dailyAmount,
              salaryStatus: dailyAmount > 0 ? 'qualified' : 'not_qualified',
              salaryPayoutStartAt: dailyAmount > 0 ? payoutStart : null
            }
          },
          { returnDocument: 'after' }
        );

        if (locked) {
          console.log(
            `[SALARY LOCKED] ${user.userId} | Direct: $${directBusiness} | Daily: $${dailyAmount}`
          );
        }
      } catch (err) {
        console.error('[SALARY QUALIFICATION ERROR]', item.userId, err);
      }
    }

    // B. Pay qualified users once per IST date, maximum 90 days.
    const qualifiedUsers = await User.find({
      salaryStatus: 'qualified',
      salaryDailyAmount: { $gt: 0 },
      salaryDaysPaid: { $lt: 90 },
      salaryPayoutStartAt: { $lte: now },
      salaryLastPaidDate: { $ne: today }
    }).lean();

    for (const user of qualifiedUsers) {
      try {
        const amount = roundMoney(user.salaryDailyAmount);

        if (amount <= 0) continue;

        // Atomic wallet update prevents duplicate daily payment.
        const updated = await User.findOneAndUpdate(
          {
            _id: user._id,
            salaryStatus: 'qualified',
            salaryDaysPaid: { $lt: 90 },
            salaryLastPaidDate: { $ne: today }
          },
          {
            $inc: {
              walletBalance: amount,
              salaryDaysPaid: 1,
              salaryTotalIncome: amount,
              rewardIncome: amount,
              totalRewardIncome: amount
            },
            $set: {
              salaryLastPaidDate: today
            }
          },
          { returnDocument: 'after' }
        );

        if (!updated) continue;

        const day = updated.salaryDaysPaid;

        await Transaction.create({
          userId: updated.userId,
          type: 'daily_salary',
          source: 'salary',
          amount,
          description: `Daily Salary Day ${day}/90 | Direct Business $${updated.salaryQualifiedBusiness}`,
          status: 'success',
          date: new Date()
        });

        if (day >= 90) {
          await User.updateOne(
            { _id: updated._id, salaryDaysPaid: { $gte: 90 } },
            { $set: { salaryStatus: 'completed' } }
          );
        }

        console.log(
          `[DAILY SALARY PAID] ${updated.userId} | $${amount} | Day ${day}/90`
        );
      } catch (err) {
        console.error('[SALARY PAYMENT ERROR]', user.userId, err);
      }
    }

    console.log('[DAILY SALARY] Finished');
  } catch (error) {
    console.error('[DAILY SALARY FATAL ERROR]', error);
  }
};

// Only primary PM2 instance.
if (
  process.env.NODE_APP_INSTANCE === '0' ||
  process.env.NODE_APP_INSTANCE === undefined
) {
  console.log('[DAILY SALARY] Cron registered: 12:10 AM IST');

  cron.schedule('10 0 * * *', processDailySalary, {
    scheduled: true,
    timezone: 'Asia/Kolkata'
  });
}

module.exports = { processDailySalary };
