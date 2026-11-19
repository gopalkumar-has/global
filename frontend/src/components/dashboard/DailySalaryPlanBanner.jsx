
// import React, { useCallback, useEffect, useState } from "react";
// import {
//   Clock,
//   Users,
//   Trophy,
//   Target,
//   RefreshCw,
//   Wallet,
// } from "lucide-react";
// import api from "../../api/axios";

// const SLABS = [
//   { business: 500, daily: 3, total: 270 },
//   { business: 1000, daily: 6, total: 540 },
//   { business: 3000, daily: 20, total: 1800 },
//   { business: 5000, daily: 40, total: 3600 },
// ];

// const money = (value) =>
//   (Number(value) || 0).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// const countdown = (milliseconds) => {
//   const seconds = Math.max(0, Math.floor(milliseconds / 1000));
//   const days = Math.floor(seconds / 86400);
//   const hours = Math.floor((seconds % 86400) / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;

//   return `${days}d ${hours}h ${minutes}m ${secs}s`;
// };

// const DailySalaryPlanBanner = () => {
//   const [salary, setSalary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [now, setNow] = useState(Date.now());

//   const fetchSalary = useCallback(async () => {
//     try {
//       setError("");

//       const response = await api.get("/user/daily-salary");

//       if (response?.data?.success) {
//         setSalary(response.data.salary || null);
//       } else {
//         setError(
//           response?.data?.message || "Unable to load salary."
//         );
//       }
//     } catch (err) {
//       setError(
//         err?.response?.data?.message || "Unable to load salary."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchSalary();
//   }, [fetchSalary]);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setNow(Date.now());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const card =
//     "w-full min-w-0 rounded-lg border border-amber-500/20 bg-[#090d12] text-white";

//   if (loading) {
//     return (
//       <div className={`${card} col-span-2 mb-3 p-3 text-center text-xs text-slate-400`}>
//         <RefreshCw size={15} className="mr-2 inline animate-spin" />
//         Loading salary...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={`${card} col-span-2 mb-3 p-3 text-xs text-red-400`}>
//         {error}
//         <button
//           type="button"
//           onClick={fetchSalary}
//           className="ml-2 text-amber-400 underline"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   const direct =
//     Number(salary?.qualificationDirectBusiness) || 0;

//   const status = salary?.timerStatus;

//   const end = salary?.qualificationEndAt
//     ? new Date(salary.qualificationEndAt).getTime()
//     : null;

//   const running =
//     status === "qualification_running" &&
//     end &&
//     end > now;

//   // Current slab based on qualification direct business
//   const currentSlab = [...SLABS]
//     .reverse()
//     .find((slab) => direct >= slab.business);

//   // Prefer the locked slab returned by backend
//   const achieved = salary?.achievedSlab || currentSlab || null;

//   const lockedDailySalary =
//     Number(salary?.lockedDailySalary) || 0;

//   const daily =
//     lockedDailySalary ||
//     Number(achieved?.dailySalary) ||
//     Number(achieved?.daily) ||
//     0;

//   // Actual received salary from backend only
//   const totalReceived = Math.max(
//     0,
//     Number(
//       salary?.totalSalaryReceived ??
//       salary?.salaryTotalPaid ??
//       0
//     ) || 0
//   );

//   const qualified =
//     status === "qualified" ||
//     status === "completed";

//   const notQualified = status === "not_qualified";

//   const active = running || qualified;

//   const timerText = running
//     ? countdown(end - now)
//     : status === "qualification_running"
//     ? "15-Day Period Completed"
//     : qualified
//     ? "Qualified"
//     : notQualified
//     ? "Not Qualified"
//     : "Waiting for Package";

//   const statusLabel = active
//     ? "ACTIVE"
//     : notQualified
//     ? "NOT QUALIFIED"
//     : "PENDING";

//   return (
//     <div className={`${card} col-span-2 mb-3 overflow-hidden`}>

//       {/* HEADER */}
//       <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
//         <div className="flex items-center gap-2">
//           <Trophy size={16} className="text-amber-400" />

//           <span className="text-xs font-black tracking-[1.5px] text-amber-400">
//             DAILY SALARY
//           </span>
//         </div>

//         <span
//           className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black ${
//             active
//               ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
//               : notQualified
//               ? "border-red-500/30 bg-red-500/10 text-red-400"
//               : "border-amber-500/20 text-amber-400"
//           }`}
//         >
//           <span
//             className={`h-1.5 w-1.5 rounded-full ${
//               active
//                 ? "bg-emerald-400"
//                 : notQualified
//                 ? "bg-red-400"
//                 : "bg-amber-400"
//             }`}
//           />

//           {statusLabel}
//         </span>
//       </div>

//       {/* DIRECT BUSINESS + DAILY SALARY */}
//       <div className="grid grid-cols-2 divide-x divide-white/10">

//         <div className="px-3 py-2.5">
//           <div className="flex items-center gap-1.5 text-slate-400">
//             <Users size={14} className="text-emerald-400" />

//             <span className="text-[9px] font-bold tracking-wider">
//               DIRECT BUSINESS
//             </span>
//           </div>

//           <p className="mt-1 text-xl font-black text-emerald-400">
//             ${money(direct)}
//           </p>
//         </div>

//         <div className="px-3 py-2.5">
//           <div className="flex items-center gap-1.5 text-slate-400">
//             <Target size={14} className="text-amber-400" />

//             <span className="text-[9px] font-bold tracking-wider">
//               DAILY SALARY
//             </span>
//           </div>

//           <p className="mt-1 text-xl font-black text-amber-400">
//             ${money(daily)}
//             <span className="ml-1 text-[10px] text-slate-500">
//               /day
//             </span>
//           </p>

//           {achieved && (
//             <p className="mt-0.5 text-[9px] font-bold text-amber-300">
//               ${money(achieved.business)} SLAB
//             </p>
//           )}
//         </div>
//       </div>

//       {/* 15-DAY TIMER */}
//       <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
//         <div className="flex shrink-0 items-center gap-1.5">
//           <Clock size={14} className="text-amber-400" />

//           <span className="text-[9px] font-bold tracking-wider text-slate-300">
//             15-DAY TIMER
//           </span>
//         </div>

//         <span className="text-right text-xs font-black text-amber-400">
//           {timerText}
//         </span>
//       </div>

//       {/* COMPACT SALARY SLABS - ALL FOUR IN ONE LINE */}
//       <div className="border-t border-white/10 px-2 py-2">

//         <div className="mb-1.5 flex items-center justify-between">
//           <p className="text-[9px] font-black tracking-wider text-amber-400">
//             SALARY SLABS
//           </p>

//           <span className="text-[8px] text-slate-500">
//             90 DAYS PAYOUT
//           </span>
//         </div>

//         <div className="grid grid-cols-4 gap-1.5">
//           {SLABS.map((slab) => {
//             const isAchieved =
//               achieved &&
//               Number(achieved.business) === slab.business;

//             return (
//               <div
//                 key={slab.business}
//                 className={`min-w-0 rounded-md border px-1 py-1.5 text-center ${
//                   isAchieved
//                     ? "border-emerald-500/50 bg-emerald-500/10"
//                     : "border-white/10 bg-white/[0.02]"
//                 }`}
//               >
//                 <p className="truncate text-[8px] font-bold text-slate-400">
//                   ${slab.business}
//                 </p>

//                 <p className="mt-0.5 text-xs font-black text-amber-400">
//                   ${slab.daily}
//                   <span className="text-[7px] text-slate-400">
//                     /day
//                   </span>
//                 </p>

//                 <p className="mt-0.5 whitespace-nowrap text-[7px] font-semibold text-slate-500">
//                   ${slab.total} total
//                 </p>

//                 {isAchieved && (
//                   <p className="mt-0.5 text-[7px] font-black text-emerald-400">
//                     ACHIEVED
//                   </p>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ACHIEVED SLAB + TOTAL RECEIVED */}
//       {(achieved || totalReceived > 0) && (
//         <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-white/[0.02]">

//           {achieved && (
//             <div className="px-3 py-2">
//               <p className="text-[9px] font-bold tracking-wider text-slate-500">
//                 ACHIEVED SLAB
//               </p>

//               <p className="mt-1 text-sm font-black text-amber-400">
//                 ${money(achieved.business)} SLAB
//               </p>

//               <p className="text-[9px] text-slate-400">
//                 ${money(
//                   achieved.dailySalary ??
//                   achieved.daily ??
//                   daily
//                 )} / day
//               </p>
//             </div>
//           )}

//           {totalReceived > 0 && (
//             <div className="px-3 py-2">
//               <div className="flex items-center gap-1 text-slate-500">
//                 <Wallet size={12} />

//                 <p className="text-[9px] font-bold tracking-wider">
//                   TOTAL SALARY RECEIVED
//                 </p>
//               </div>

//               <p className="mt-1 text-sm font-black text-emerald-400">
//                 ${money(totalReceived)}
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DailySalaryPlanBanner;



import React, { useCallback, useEffect, useState } from "react";
import {
  Clock,
  Users,
  Trophy,
  Target,
  RefreshCw,
  Wallet,
} from "lucide-react";
import api from "../../api/axios";

const SLABS = [
  {
    business: 500, daily: 3, total: 270,
    border: "border-cyan-500/35",
    background: "bg-cyan-500/[0.07]",
    accent: "text-cyan-300",
    soft: "text-cyan-400"
  },
  {
    business: 1000, daily: 6, total: 540,
    border: "border-blue-500/35",
    background: "bg-blue-500/[0.07]",
    accent: "text-blue-300",
    soft: "text-blue-400"
  },
  {
    business: 3000, daily: 20, total: 1800,
    border: "border-violet-500/35",
    background: "bg-violet-500/[0.07]",
    accent: "text-violet-300",
    soft: "text-violet-400"
  },
  {
    business: 5000, daily: 40, total: 3600,
    border: "border-emerald-500/35",
    background: "bg-emerald-500/[0.07]",
    accent: "text-emerald-300",
    soft: "text-emerald-400"
  },
];

const money = (value) =>
  (Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const countdown = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
};

const DailySalaryPlanBanner = () => {
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  const fetchSalary = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/user/daily-salary");

      if (response?.data?.success) {
        setSalary(response.data.salary || null);
      } else {
        setError(
          response?.data?.message || "Unable to load salary."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to load salary."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalary();
  }, [fetchSalary]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const card =
    "w-full min-w-0 rounded-lg border border-[#c9a45c]/25 bg-[#090a0b] text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)]";

  if (loading) {
    return (
      <div className={`${card} col-span-2 mb-3 p-3 text-center text-xs text-slate-400`}>
        <RefreshCw size={15} className="mr-2 inline animate-spin" />
        Loading salary...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${card} col-span-2 mb-3 p-3 text-xs text-red-400`}>
        {error}
        <button
          type="button"
          onClick={fetchSalary}
          className="ml-2 text-amber-400 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const direct =
    Number(salary?.qualificationDirectBusiness) || 0;

  const status = salary?.timerStatus;

  const end = salary?.qualificationEndAt
    ? new Date(salary.qualificationEndAt).getTime()
    : null;

  const running =
    status === "qualification_running" &&
    end &&
    end > now;

  // Current slab based on qualification direct business
  const currentSlab = [...SLABS]
    .reverse()
    .find((slab) => direct >= slab.business);

  // Prefer the locked slab returned by backend
  const achieved = salary?.achievedSlab || currentSlab || null;

  const lockedDailySalary =
    Number(salary?.lockedDailySalary) || 0;

  const daily =
    lockedDailySalary ||
    Number(achieved?.dailySalary) ||
    Number(achieved?.daily) ||
    0;

  // Actual received salary from backend only
  const totalReceived = Math.max(
    0,
    Number(
      salary?.totalSalaryReceived ??
      salary?.salaryTotalPaid ??
      0
    ) || 0
  );

  const qualified =
    status === "qualified" ||
    status === "completed";

  const notQualified = status === "not_qualified";

  const active = running || qualified;

  const timerText = running
    ? countdown(end - now)
    : status === "qualification_running"
    ? "15-Day Period Completed"
    : qualified
    ? "Qualified"
    : notQualified
    ? "Not Qualified"
    : "Waiting for Package";

  const statusLabel = active
    ? "ACTIVE"
    : notQualified
    ? "NOT QUALIFIED"
    : "PENDING";

  return (
    <div className={`${card} col-span-2 mb-3 overflow-hidden`}>

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#101214] px-3 py-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-amber-400" />

          <span className="text-xs font-black tracking-[1.5px] text-amber-400">
            DAILY SALARY
          </span>
        </div>

        <span
          className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black ${
            active
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : notQualified
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-amber-500/20 text-amber-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active
                ? "bg-emerald-400"
                : notQualified
                ? "bg-red-400"
                : "bg-amber-400"
            }`}
          />

          {statusLabel}
        </span>
      </div>

      {/* DIRECT BUSINESS + DAILY SALARY */}
      <div className="grid grid-cols-2 divide-x divide-white/10 bg-[#0d1012]">

        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users size={14} className="text-emerald-400" />

            <span className="text-[9px] font-bold tracking-wider">
              DIRECT BUSINESS
            </span>
          </div>

          <p className="mt-1 text-xl font-black text-emerald-400">
            ${money(direct)}
          </p>
        </div>

        <div className="px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Target size={14} className="text-amber-400" />

            <span className="text-[9px] font-bold tracking-wider">
              DAILY SALARY
            </span>
          </div>

          <p className="mt-1 text-xl font-black text-amber-400">
            ${money(daily)}
            <span className="ml-1 text-[10px] text-slate-500">
              /day
            </span>
          </p>

          {achieved && (
            <p className="mt-0.5 text-[9px] font-bold text-amber-300">
              ${money(achieved.business)} SLAB
            </p>
          )}
        </div>
      </div>

      {/* COMPACT, HIGHLIGHTED 15-DAY TIMER */}
      <div className="border-t border-white/10 bg-[#0b0e10] px-3 py-2.5">
  <div className="rounded-xl border border-[#e0b84f]/65 bg-gradient-to-r from-[#33270f] via-[#211a0d] to-[#17130b] px-2.5 py-2.5 shadow-[0_0_26px_rgba(245,185,55,0.18)] ring-1 ring-[#f5c65b]/10">
    <div className="flex items-center justify-between gap-2.5">
      <div className="min-w-0">
        <p className="text-[9px] font-black leading-4 tracking-[0.13em] text-[#ffda79] sm:text-[10px]">
          15-DAY QUALIFICATION TIMER
        </p>
        <p className="text-[8px] leading-3 text-[#c2ad7e]">
         DAILY SALARY QUALIFICATION PERIOD
        </p>
      </div>
{/* 
      <div className="shrink-0 rounded-lg border border-[#f2c65d]/80 bg-[#080909] px-3 py-2.5 text-center shadow-[0_0_20px_rgba(255,190,55,0.25)] sm:px-4">
        <p className="text-[8px] font-extrabold tracking-[0.18em] text-[#d5ad50]">
          TIME LEFT
        </p>
        <p className="mt-1 whitespace-nowrap text-sm font-black leading-tight tabular-nums text-[#ffe08a] drop-shadow-[0_0_9px_rgba(255,205,91,0.75)] sm:text-base">
          {timerText}
        </p>
      </div> */}

      <div className="shrink-0 animate-pulse rounded-lg border border-[#f2c65d]/80 bg-[#080909] px-3 py-2.5 text-center shadow-[0_0_20px_rgba(255,190,55,0.25)] sm:px-4">
  <p className="text-[8px] font-extrabold tracking-[0.18em] text-[#d5ad50]">
    TIME LEFT
  </p>
  <p className="mt-1 whitespace-nowrap text-sm font-black leading-tight tabular-nums text-[#ffe08a] drop-shadow-[0_0_9px_rgba(255,205,91,0.75)] sm:text-base">
    {timerText}
  </p>
</div>
    </div>
  </div>
</div>

      {/* COMPACT SALARY SLABS - ALL FOUR IN ONE LINE */}
      <div className="border-t border-white/10 bg-[#0d1012] px-2 py-3">

        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[9px] font-black tracking-wider text-amber-400">
            SALARY SLABS
          </p>

          <span className="text-[8px] text-slate-500">
            90 DAYS PAYOUT
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {SLABS.map((slab) => {
            const isAchieved =
              achieved &&
              Number(achieved.business) === slab.business;

            return (
              <div
                key={slab.business}
                className={`min-w-0 rounded-lg border px-1 py-2 text-center transition ${
                  isAchieved
                    ? `${slab.border} ${slab.background} ring-1 ring-white/10`
                    : `${slab.border} ${slab.background} opacity-90`
                }`}
              >
                <p className={`truncate text-[9px] font-extrabold ${slab.accent} sm:text-[10px]`}>
                  ${slab.business}
                </p>

                <p className={`mt-1 whitespace-nowrap text-sm font-black leading-none ${slab.soft} sm:text-base`}>
                  ${slab.daily}
                  <span className="ml-0.5 text-[8px] font-bold text-slate-400">
                    /day
                  </span>
                </p>

                <p className={`mt-1 whitespace-nowrap text-[8px] font-bold ${slab.accent} opacity-90 sm:text-[9px]`}>
                  ${slab.total} total
                </p>

                {isAchieved && (
                  <p className={`mt-0.5 text-[7px] font-black ${slab.soft}`}>
                    ACHIEVED
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ACHIEVED SLAB + TOTAL RECEIVED */}
      {(achieved || totalReceived > 0) && (
        <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-[#101214]">

          {achieved && (
            <div className="px-3 py-2">
              <p className="text-[9px] font-bold tracking-wider text-slate-500">
                ACHIEVED SLAB
              </p>

              <p className="mt-1 text-base font-black tabular-nums text-amber-300">
                ${money(achieved.business)}
                <span className="ml-1 text-[9px] font-bold tracking-wider text-amber-500">SLAB</span>
              </p>

              <p className="text-[10px] font-semibold text-slate-300">
                ${money(
                  achieved.dailySalary ??
                  achieved.daily ??
                  daily
                )} / day
              </p>
            </div>
          )}

          {totalReceived > 0 && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-1 text-slate-500">
                <Wallet size={12} />

                <p className="text-[9px] font-bold tracking-wider">
                  TOTAL SALARY RECEIVED
                </p>
              </div>

              <p className="mt-1 text-base font-black tabular-nums text-emerald-300">
                ${money(totalReceived)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailySalaryPlanBanner;
