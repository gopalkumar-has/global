// import React, { useEffect, useMemo, useState } from "react";
// import {
//   CalendarDays,
//   DollarSign,
//   CheckCircle2,
//   Activity,
//   Loader2,
//   RefreshCw,
//   Package,
//   TrendingUp,
//   Wallet,
// } from "lucide-react";
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";

// const CircularProgress = ({ days, totalDays, status }) => {
//   const safeTotal = Number(totalDays) > 0 ? Number(totalDays) : 1;
//   const safeDays = Math.max(0, Number(days) || 0);
//   const percentage = Math.min((safeDays / safeTotal) * 100, 100);
//   const radius = 24;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDashoffset = circumference - (percentage / 100) * circumference;
//   const isCompleted = String(status || "").toLowerCase() === "completed";

//   return (
//     <div
//       className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center"
//       role="img"
//       aria-label={`${safeDays} of ${safeTotal} days completed`}
//     >
//       <svg viewBox="0 0 64 64" className="-rotate-90">
//         <circle
//           cx="32"
//           cy="32"
//           r={radius}
//           stroke="currentColor"
//           strokeWidth="5"
//           fill="transparent"
//           className="text-white/10"
//         />
//         <circle
//           cx="32"
//           cy="32"
//           r={radius}
//           stroke="currentColor"
//           strokeWidth="5"
//           fill="transparent"
//           strokeDasharray={circumference}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           className={`${isCompleted ? "text-emerald-300" : "text-amber-300"} transition-all duration-700`}
//         />
//       </svg>
//       <div className="absolute flex flex-col items-center text-center">
//         <span className="text-base font-bold leading-none text-white">{safeDays}</span>
//         <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-white/40">
//           Days
//         </span>
//       </div>
//     </div>
//   );
// };

// const UserPackages = () => {
//   const { user, token } = useAuth();
//   const [packages, setPackages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchRealPackages = async () => {
//     if (!user?.userId || !token) {
//       setPackages([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");
//       const res = await api.get(`/package/user/${user.userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const packageData =
//         res.data?.data || res.data?.packages || res.data || [];
//       setPackages(Array.isArray(packageData) ? packageData : []);
//     } catch (err) {
//       console.error("Failed to fetch packages:", err);
//       setPackages([]);
//       setError("Unable to load your packages. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRealPackages();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.userId, token]);

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     if (Number.isNaN(date.getTime())) return "N/A";
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const summary = useMemo(() => {
//     const active = packages.filter(
//       (pkg) => String(pkg.status || "").toLowerCase() === "active"
//     ).length;
//     const completed = packages.filter(
//       (pkg) => String(pkg.status || "").toLowerCase() === "completed"
//     ).length;
//     const invested = packages.reduce((sum, pkg) => {
//       const amount = Number(pkg.packageAmount);
//       return sum + (Number.isFinite(amount) ? amount : 0);
//     }, 0);
//     return { active, completed, invested };
//   }, [packages]);

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 py-5 font-sans text-white sm:px-5 md:px-8 md:py-8">
//       {/* Ambient glass lighting */}
//       <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[115px]" />
//       <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-yellow-300/[0.07] blur-[130px]" />
//       <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/[0.06] blur-[110px]" />

//       <main className="relative mx-auto max-w-6xl">
//         {/* Hero header */}
//         <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
//           <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-amber-300/10" />
//           <div className="pointer-events-none absolute -right-1 -top-9 h-40 w-40 rounded-full border border-amber-300/10" />
//           <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
//                 <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
//                 Portfolio Overview
//               </div>
//               <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
//                 My <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-300 bg-clip-text text-transparent">Packages</span>
//               </h1>
//               <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
//                 View package status, progress, ROI received and activation details.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={fetchRealPackages}
//               disabled={loading}
//               className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-amber-200/25 bg-amber-300/[0.09] px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/[0.15] disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
//             >
//               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//               Refresh
//             </button>
//           </div>
//         </section>

//         {/* Summary cards */}
//         <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
//           <div className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-5 backdrop-blur-xl">
//             <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-300/[0.09] blur-2xl" />
//             <div className="relative flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Total Packages</p>
//                 <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-200">{packages.length}</p>
//                 <p className="mt-1 text-xs text-white/35">All purchased packages</p>
//               </div>
//               <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.08] text-amber-200">
//                 <Package size={23} />
//               </div>
//             </div>
//           </div>

//           <div className="relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5 backdrop-blur-xl">
//             <div className="relative flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Active Packages</p>
//                 <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-300">{summary.active}</p>
//                 <p className="mt-1 text-xs text-white/35">Currently active</p>
//               </div>
//               <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-300">
//                 <Activity size={23} />
//               </div>
//             </div>
//           </div>

//           <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
//             <div className="relative flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Package Amount</p>
//                 <p className="mt-2 text-3xl font-semibold tabular-nums text-white">${summary.invested.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
//                 <p className="mt-1 text-xs text-white/35">{summary.completed} completed packages</p>
//               </div>
//               <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-amber-200">
//                 <Wallet size={23} />
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Package list */}
//         <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
//           <div className="flex flex-col gap-2 border-b border-white/[0.08] p-4 sm:p-6">
//             <h2 className="text-lg font-semibold text-white">Package Activity</h2>
//             <p className="text-xs text-white/40">Progress and earning details for each package</p>
//           </div>

//           {error && (
//             <div className="mx-4 mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200 sm:mx-6">
//               {error}
//             </div>
//           )}

//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <Loader2 className="mb-3 animate-spin text-amber-200" size={30} />
//               <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
//                 Loading Packages...
//               </span>
//             </div>
//           ) : packages.length > 0 ? (
//             <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-5">
//               {packages.map((pkg, index) => {
//                 const amount = Number(pkg.packageAmount) || 0;
//                 const daysDone = Number(pkg.daysCompleted) || 0;
//                 const totalDays = Number(pkg.totalDays) || 25;

//                 // Preserve the original page's displayed ROI calculations.
//                 const dailyRoi = (amount * 5) / 100;
//                 const earnedRoi = dailyRoi * daysDone;
//                 const totalExpected = dailyRoi * totalDays;
//                 const isCompleted =
//                   String(pkg.status || "").toLowerCase() === "completed";
//                 const statusLabel = pkg.status || "unknown";

//                 return (
//                   <article
//                     key={pkg._id || `${pkg.startDate || "package"}-${index}`}
//                     className="group relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-300 hover:border-amber-200/25 hover:bg-white/[0.055] sm:p-5"
//                   >
//                     <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-amber-300/[0.055] blur-3xl transition group-hover:bg-amber-300/[0.10]" />

//                     <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
//                       <div className="flex items-center gap-4 sm:w-[245px] sm:shrink-0">
//                         <CircularProgress
//                           days={daysDone}
//                           totalDays={totalDays}
//                           status={pkg.status}
//                         />
//                         <div className="min-w-0">
//                           <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
//                             Package {index + 1}
//                           </p>
//                           <h3 className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white">
//                             <DollarSign size={17} className="text-amber-200" />
//                             {amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
//                           </h3>
//                           <span
//                             className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
//                               isCompleted
//                                 ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300"
//                                 : "border-amber-200/20 bg-amber-200/[0.08] text-amber-100"
//                             }`}
//                           >
//                             {isCompleted ? <CheckCircle2 size={11} /> : <Activity size={11} />}
//                             {statusLabel}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
//                         <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
//                           <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
//                             ROI Received
//                           </p>
//                           <p className="mt-1 text-sm font-bold text-emerald-300">
//                             ${earnedRoi.toFixed(2)}
//                           </p>
//                         </div>
//                         <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
//                           <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
//                             Total Expected
//                           </p>
//                           <p className="mt-1 text-sm font-bold text-white">
//                             ${totalExpected.toFixed(2)}
//                           </p>
//                         </div>
//                         <div className="col-span-2 rounded-xl border border-white/[0.07] bg-black/20 p-3 sm:col-span-1">
//                           <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
//                             <CalendarDays size={11} />
//                             Activated On
//                           </p>
//                           <p className="mt-1 text-sm font-semibold text-white/70">
//                             {formatDate(pkg.startDate)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="relative mt-4 border-t border-white/[0.07] pt-3">
//                       <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em]">
//                         <span className="text-white/35">Package progress</span>
//                         <span className={isCompleted ? "text-emerald-300" : "text-amber-200"}>
//                           {Math.min((Math.max(0, daysDone) / totalDays) * 100, 100).toFixed(0)}%
//                         </span>
//                       </div>
//                       <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
//                         <div
//                           className={`h-full rounded-full transition-all duration-700 ${
//                             isCompleted
//                               ? "bg-emerald-300"
//                               : "bg-gradient-to-r from-amber-300 to-orange-300"
//                           }`}
//                           style={{
//                             width: `${Math.min((Math.max(0, daysDone) / totalDays) * 100, 100)}%`,
//                           }}
//                         />
//                       </div>
//                       <div className="mt-2 flex items-center justify-between text-[10px] text-white/30">
//                         <span>{daysDone} days completed</span>
//                         <span>{totalDays} total days</span>
//                       </div>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="mx-4 my-6 flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-black/15 px-4 py-12 text-center sm:mx-6">
//               <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.07] text-amber-200">
//                 <Package size={25} />
//               </div>
//               <p className="text-sm font-semibold text-white/70">No Packages Found</p>
//               <p className="mt-1 text-xs text-white/35">
//                 Your package details will appear here when available.
//               </p>
//             </div>
//           )}
//         </section>

//         <p className="mt-5 text-center text-[10px] tracking-wide text-white/20">
//           MY PACKAGES • PACKAGE ACTIVITY
//         </p>
//       </main>
//     </div>
//   );
// };

// export default UserPackages;


import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Activity,
  Loader2,
  RefreshCw,
  Package,
  Wallet,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const CircularProgress = ({ days, totalDays, status }) => {
  const safeTotal = Number(totalDays) > 0 ? Number(totalDays) : 1;
  const safeDays = Math.max(0, Number(days) || 0);
  const percentage = Math.min((safeDays / safeTotal) * 100, 100);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isCompleted = String(status || "").toLowerCase() === "completed";

  return (
    <div
      className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center"
      role="img"
      aria-label={`${safeDays} of ${safeTotal} days completed`}
    >
      <svg viewBox="0 0 64 64" className="-rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          className="text-white/10"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${isCompleted ? "text-emerald-300" : "text-amber-300"} transition-all duration-700`}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-base font-bold leading-none text-white">{safeDays}</span>
        <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-white/40">
          Days
        </span>
      </div>
    </div>
  );
};

const UserPackages = () => {
  const { user, token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRealPackages = async () => {
    if (!user?.userId || !token) {
      setPackages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/package/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const packageData =
        res.data?.data || res.data?.packages || res.data || [];
      setPackages(Array.isArray(packageData) ? packageData : []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
      setPackages([]);
      setError("Unable to load your packages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const summary = useMemo(() => {
    const active = packages.filter(
      (pkg) => String(pkg.status || "").toLowerCase() === "active"
    ).length;
    const completed = packages.filter(
      (pkg) => String(pkg.status || "").toLowerCase() === "completed"
    ).length;
    const invested = packages.reduce((sum, pkg) => {
      const amount = Number(pkg.packageAmount);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    return { active, completed, invested };
  }, [packages]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 py-5 font-sans text-white sm:px-5 md:px-8 md:py-8">
      {/* Ambient glass lighting */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[115px]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-yellow-300/[0.07] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/[0.06] blur-[110px]" />

      <main className="relative mx-auto max-w-6xl">
        {/* Hero header */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-amber-300/10" />
          <div className="pointer-events-none absolute -right-1 -top-9 h-40 w-40 rounded-full border border-amber-300/10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
                Portfolio Overview
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                My <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-300 bg-clip-text text-transparent">Packages</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                View package status, progress, ROI received and activation details.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRealPackages}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-amber-200/25 bg-amber-300/[0.09] px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/[0.15] disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-5 backdrop-blur-xl">
            <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-300/[0.09] blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Total Packages</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-200">{packages.length}</p>
                <p className="mt-1 text-xs text-white/35">All purchased packages</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.08] text-amber-200">
                <Package size={23} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5 backdrop-blur-xl">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Active Packages</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-300">{summary.active}</p>
                <p className="mt-1 text-xs text-white/35">Currently active</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-300">
                <Activity size={23} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Package Amount</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-white">${summary.invested.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
                <p className="mt-1 text-xs text-white/35">{summary.completed} completed packages</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-amber-200">
                <Wallet size={23} />
              </div>
            </div>
          </div>
        </section>

        {/* Package list */}
        <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <div className="flex flex-col gap-2 border-b border-white/[0.08] p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Package Activity</h2>
            <p className="text-xs text-white/40">Progress and earning details for each package</p>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200 sm:mx-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="mb-3 animate-spin text-amber-200" size={30} />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                Loading Packages...
              </span>
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-5">
              {packages.map((pkg, index) => {
                const amount = Number(pkg.packageAmount) || 0;
                const daysDone = Number(pkg.daysCompleted) || 0;
                const totalDays = Number(pkg.totalDays) || 45;

                // Preserve the original page's displayed ROI calculations.
                const dailyRoi = (amount * 3) / 100;
                const earnedRoi = dailyRoi * daysDone;
                const totalExpected = dailyRoi * totalDays;
                const isCompleted =
                  String(pkg.status || "").toLowerCase() === "completed";
                const statusLabel = pkg.status || "unknown";

                return (
                  <article
                    key={pkg._id || `${pkg.startDate || "package"}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-300 hover:border-amber-200/25 hover:bg-white/[0.055] sm:p-5"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-amber-300/[0.055] blur-3xl transition group-hover:bg-amber-300/[0.10]" />

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div className="flex items-center gap-4 sm:w-[245px] sm:shrink-0">
                        <CircularProgress
                          days={daysDone}
                          totalDays={totalDays}
                          status={pkg.status}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                            Package {index + 1}
                          </p>
                          <h3 className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white">
                            <DollarSign size={17} className="text-amber-200" />
                            {amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                          </h3>
                          <span
                            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300"
                                : "border-amber-200/20 bg-amber-200/[0.08] text-amber-100"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 size={11} /> : <Activity size={11} />}
                            {statusLabel}
                          </span>
                        </div>
                      </div>

                      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                            ROI Received
                          </p>
                          <p className="mt-1 text-sm font-bold text-emerald-300">
                            ${earnedRoi.toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                            Total Expected
                          </p>
                          <p className="mt-1 text-sm font-bold text-white">
                            ${totalExpected.toFixed(2)}
                          </p>
                        </div>
                        <div className="col-span-2 rounded-xl border border-white/[0.07] bg-black/20 p-3 sm:col-span-1">
                          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                            <CalendarDays size={11} />
                            Activated On
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white/70">
                            {formatDate(pkg.startDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="relative mt-4 border-t border-white/[0.07] pt-3">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em]">
                        <span className="text-white/35">Package progress</span>
                        <span className={isCompleted ? "text-emerald-300" : "text-amber-200"}>
                          {Math.min((Math.max(0, daysDone) / totalDays) * 100, 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isCompleted
                              ? "bg-emerald-300"
                              : "bg-gradient-to-r from-amber-300 to-orange-300"
                          }`}
                          style={{
                            width: `${Math.min((Math.max(0, daysDone) / totalDays) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-white/30">
                        <span>{daysDone} days completed</span>
                        <span>{totalDays} total days</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mx-4 my-6 flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-black/15 px-4 py-12 text-center sm:mx-6">
              <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.07] text-amber-200">
                <Package size={25} />
              </div>
              <p className="text-sm font-semibold text-white/70">No Packages Found</p>
              <p className="mt-1 text-xs text-white/35">
                Your package details will appear here when available.
              </p>
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-[10px] tracking-wide text-white/20">
          MY PACKAGES • PACKAGE ACTIVITY
        </p>
      </main>
    </div>
  );
};

export default UserPackages;
