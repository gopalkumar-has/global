// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import api from "../../api/axios";
// import { getUserId } from "../../utils/authUtils";
// import {
//   Activity,
//   ArrowDownRight,
//   ArrowUpRight,
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   CircleDollarSign,
//   Coins,
//   Layers3,
//   RefreshCw,
//   Search,
//   Sparkles,
//   Wallet,
//   X,
// } from "lucide-react";

// const toAmount = (value) => {
//   const raw = value?.$numberDecimal ?? value ?? 0;
//   const number = Number(raw);
//   return Number.isFinite(number) ? number : 0;
// };

// const money = (value) =>
//   toAmount(value).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// const validDate = (value) => {
//   const date = new Date(value);
//   return Number.isNaN(date.getTime()) ? null : date;
// };

// const dateLabel = (value) => {
//   const date = validDate(value);
//   if (!date) return "Date unavailable";
//   return date.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const timeLabel = (value) => {
//   const date = validDate(value);
//   return date
//     ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
//     : "";
// };

// const RoiIncome = () => {
//   const userId = getUserId();
//   const [transactions, setTransactions] = useState([]);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [stats, setStats] = useState({
//     totalCombined: 0,
//     totalSelfRoi: 0,
//     todaySelfRoi: 0,
//     totalLevelRoi: 0,
//     todayLevelRoi: 0,
//   });

//   const fetchRoiIncome = useCallback(async () => {
//     if (!userId) {
//       setLoading(false);
//       setError("Login session not found. Please sign in again.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     try {
//       const response = await api.get(`/user/roi-income?t=${Date.now()}`);
//       if (response?.data?.success) {
//         setTransactions(Array.isArray(response.data.data) ? response.data.data : []);
//         setStats({
//           totalCombined: toAmount(response.data.totalCombined),
//           totalSelfRoi: toAmount(response.data.totalSelfRoi),
//           todaySelfRoi: toAmount(response.data.todaySelfRoi),
//           totalLevelRoi: toAmount(response.data.totalLevelRoi),
//           todayLevelRoi: toAmount(response.data.todayLevelRoi),
//         });
//       } else {
//         setTransactions([]);
//         setStats({
//           totalCombined: 0,
//           totalSelfRoi: 0,
//           todaySelfRoi: 0,
//           totalLevelRoi: 0,
//           todayLevelRoi: 0,
//         });
//         setError(response?.data?.message || "ROI income data could not be loaded.");
//       }
//     } catch (err) {
//       console.error("Failed to fetch ROI income", err);
//       setError(err?.response?.data?.message || "Unable to load ROI income right now. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchRoiIncome();
//   }, [fetchRoiIncome]);

//   const filtered = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return transactions.filter((txn) => {
//       const rawDate = txn.createdAt || txn.date;
//       const date = validDate(rawDate);

//       if ((startDate || endDate) && !date) return false;
//       if (startDate && date < new Date(`${startDate}T00:00:00`)) return false;
//       if (endDate && date > new Date(`${endDate}T23:59:59.999`)) return false;

//       if (query) {
//         const description = String(txn.description || "").toLowerCase();
//         const type = String(txn.type || "").toLowerCase();
//         const amount = String(toAmount(txn.amount));
//         if (!description.includes(query) && !type.includes(query) && !amount.includes(query)) return false;
//       }
//       return true;
//     });
//   }, [transactions, search, startDate, endDate]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [search, startDate, endDate, entriesPerPage]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
//   const page = Math.min(currentPage, totalPages);
//   const firstIndex = (page - 1) * entriesPerPage;
//   const pageRows = filtered.slice(firstIndex, firstIndex + entriesPerPage);

//   const selfShare =
//     toAmount(stats.totalCombined) > 0
//       ? (toAmount(stats.totalSelfRoi) / toAmount(stats.totalCombined)) * 100
//       : 0;
//   const levelShare =
//     toAmount(stats.totalCombined) > 0
//       ? (toAmount(stats.totalLevelRoi) / toAmount(stats.totalCombined)) * 100
//       : 0;

//   const clearFilters = () => {
//     setSearch("");
//     setStartDate("");
//     setEndDate("");
//   };

//   const hasFilters = Boolean(search || startDate || endDate);

//   return (
//     <div className="min-h-screen overflow-hidden bg-[#090a0d] text-white">
//       <div className="pointer-events-none fixed inset-0" aria-hidden="true">
//         <div className="absolute -left-48 top-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.07] blur-[140px]" />
//         <div className="absolute -right-40 top-[35rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/[0.06] blur-[140px]" />
//       </div>

//       <main className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
//         {/* Distinct hero: editorial heading + large income figure */}
//         <header className="relative overflow-hidden border-b border-white/10 pb-8 sm:pb-10">
//           <div className="absolute right-0 top-0 hidden select-none text-[11rem] font-black leading-none tracking-[-0.1em] text-white/[0.025] lg:block">ROI</div>
//           <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
//             <div>
//               <div className="mb-5 flex items-center gap-3">
//                 <span className="h-px w-8 bg-amber-300" />
//                 <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200">Earnings / Return on investment</span>
//               </div>
//               <h1 className="text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">
//                 ROI <span className="font-light text-slate-500">income</span><span className="text-amber-300">.</span>
//               </h1>
//               <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
//                 Your personal daily returns and team-level ROI, brought together in one earnings view.
//               </p>
//             </div>
//             <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
//               <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
//                 <Sparkles size={13} className="text-amber-300" /> Combined ROI income
//               </span>
//               <div className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
//                 <span className="mr-1 text-2xl font-normal text-amber-300">$</span>{money(stats.totalCombined)}
//               </div>
//               <button
//                 type="button"
//                 onClick={fetchRoiIncome}
//                 disabled={loading}
//                 className="inline-flex items-center gap-2 border-b border-amber-300/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-200 hover:text-white disabled:opacity-40"
//               >
//                 <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh earnings
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* ROI mix - horizontal analytical panel, not repeated cards */}
//         <section className="grid gap-8 border-b border-white/10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-10">
//           <div>
//             <div className="mb-6 flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-slate-500">Income breakdown</p>
//                 <h2 className="mt-2 text-xl font-medium text-white">Personal vs. team ROI</h2>
//               </div>
//               <Activity size={20} className="text-amber-300" strokeWidth={1.5} />
//             </div>

//             <div className="space-y-7">
//               <div>
//                 <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
//                   <div className="flex items-center gap-3">
//                     <span className="flex h-9 w-9 items-center justify-center border border-sky-300/25 text-sky-200"><Wallet size={17} /></span>
//                     <div>
//                       <p className="text-sm font-medium text-slate-200">Self ROI</p>
//                       <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Returns from your own activity</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-lg font-semibold tabular-nums text-sky-200">${money(stats.totalSelfRoi)}</p>
//                     <p className="text-[10px] text-slate-500">{selfShare.toFixed(1)}% of combined</p>
//                   </div>
//                 </div>
//                 <div className="h-1.5 w-full overflow-hidden bg-white/[0.07]">
//                   <div className="h-full bg-gradient-to-r from-sky-700 to-sky-300 transition-all duration-700" style={{ width: `${Math.min(100, selfShare)}%` }} />
//                 </div>
//               </div>

//               <div>
//                 <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
//                   <div className="flex items-center gap-3">
//                     <span className="flex h-9 w-9 items-center justify-center border border-violet-300/25 text-violet-200"><Layers3 size={17} /></span>
//                     <div>
//                       <p className="text-sm font-medium text-slate-200">Level ROI</p>
//                       <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Returns from your team levels</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-lg font-semibold tabular-nums text-violet-200">${money(stats.totalLevelRoi)}</p>
//                     <p className="text-[10px] text-slate-500">{levelShare.toFixed(1)}% of combined</p>
//                   </div>
//                 </div>
//                 <div className="h-1.5 w-full overflow-hidden bg-white/[0.07]">
//                   <div className="h-full bg-gradient-to-r from-violet-800 to-violet-300 transition-all duration-700" style={{ width: `${Math.min(100, levelShare)}%` }} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
//             <div>
//               <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Self ROI today</p>
//               <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${money(stats.todaySelfRoi)}</p>
//               <p className="mt-2 flex items-center gap-1 text-[10px] text-sky-300"><ArrowUpRight size={12} /> Today's return</p>
//             </div>
//             <div>
//               <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Level ROI today</p>
//               <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${money(stats.todayLevelRoi)}</p>
//               <p className="mt-2 flex items-center gap-1 text-[10px] text-violet-300"><ArrowUpRight size={12} /> Today's return</p>
//             </div>
//             <div className="col-span-2 flex items-center justify-between border-t border-white/10 pt-5">
//               <div>
//                 <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Income transactions</p>
//                 <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{transactions.length.toLocaleString("en-IN")}</p>
//               </div>
//               <div className="flex h-11 w-11 items-center justify-center border border-white/10 text-amber-300"><Coins size={19} /></div>
//             </div>
//           </div>
//         </section>

//         {/* Ledger */}
//         <section className="pt-8 lg:pt-10">
//           <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
//             <div>
//               <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
//                 <span className="h-px w-6 bg-amber-300" /> Transaction history
//               </div>
//               <h2 className="text-2xl font-semibold tracking-tight">ROI activity ledger</h2>
//               <p className="mt-1 text-xs text-slate-500">Search and review each recorded ROI transaction.</p>
//             </div>
//             <div className="relative w-full sm:w-72">
//               <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500" />
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search description, type or amount"
//                 className="w-full border-b border-white/15 bg-transparent py-2 pl-6 pr-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300"
//               />
//             </div>
//           </div>

//           <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-white/10 py-3">
//             <CalendarDays size={15} className="text-amber-300" />
//             <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date range</span>
//             <input
//               aria-label="Start date"
//               type="date"
//               value={startDate}
//               max={endDate || undefined}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-amber-300"
//             />
//             <span className="text-xs text-slate-600">—</span>
//             <input
//               aria-label="End date"
//               type="date"
//               value={endDate}
//               min={startDate || undefined}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-amber-300"
//             />
//             {hasFilters && (
//               <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200 hover:text-white">
//                 <X size={12} /> Clear filters
//               </button>
//             )}
//           </div>

//           {error && (
//             <div className="mb-5 flex flex-col gap-3 border-l-2 border-rose-400 bg-rose-400/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
//               <p className="text-sm text-rose-200">{error}</p>
//               <button type="button" onClick={fetchRoiIncome} className="text-left text-xs font-semibold text-rose-100 underline underline-offset-4">Try again</button>
//             </div>
//           )}

//           <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-white/10 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:grid-cols-[55px_minmax(0,1fr)_150px_180px] sm:gap-5">
//             <span className="text-center">No.</span>
//             <span>Income details</span>
//             <span className="hidden sm:block">Date / Time</span>
//             <span className="text-right">Credit amount</span>
//           </div>

//           {loading ? (
//             <div className="flex min-h-64 flex-col items-center justify-center gap-4">
//               <div className="h-8 w-8 animate-spin rounded-full border border-amber-300/20 border-t-amber-300" />
//               <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Loading ROI records</p>
//             </div>
//           ) : pageRows.length === 0 ? (
//             <div className="flex min-h-64 flex-col items-center justify-center text-center">
//               <div className="mb-4 flex h-14 w-14 items-center justify-center border border-white/10 text-slate-500"><Search size={21} /></div>
//               <p className="text-sm font-medium text-slate-300">No ROI transactions found</p>
//               <p className="mt-1 text-xs text-slate-600">Try another search term or date range.</p>
//               {hasFilters && <button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold text-amber-200 underline underline-offset-4">Reset filters</button>}
//             </div>
//           ) : (
//             <div>
//               {pageRows.map((txn, index) => {
//                 const isLevel = txn.type === "daily_level_income";
//                 const rawDate = txn.createdAt || txn.date;
//                 return (
//                   <article
//                     key={txn._id || `${rawDate}-${firstIndex + index}`}
//                     className="group grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.07] py-4 transition hover:bg-white/[0.018] sm:grid-cols-[55px_minmax(0,1fr)_150px_180px] sm:gap-5 sm:py-5"
//                   >
//                     <span className="text-center font-mono text-[11px] text-slate-600">{String(firstIndex + index + 1).padStart(2, "0")}</span>
//                     <div className="flex min-w-0 items-center gap-3">
//                       <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${isLevel ? "border-violet-300/25 bg-violet-300/[0.05] text-violet-200" : "border-sky-300/25 bg-sky-300/[0.05] text-sky-200"}`}>
//                         {isLevel ? <Layers3 size={16} /> : <Wallet size={16} />}
//                       </span>
//                       <div className="min-w-0">
//                         <div className="flex flex-wrap items-center gap-2">
//                           <p className="truncate text-sm font-medium text-slate-200">{txn.description || (isLevel ? "Level ROI income" : "Self ROI income")}</p>
//                           <span className={`border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.13em] ${isLevel ? "border-violet-300/20 text-violet-200" : "border-sky-300/20 text-sky-200"}`}>
//                             {isLevel ? "Level ROI" : "Self ROI"}
//                           </span>
//                         </div>
//                         <p className="mt-1 text-[10px] text-slate-600 sm:hidden">{dateLabel(rawDate)}{timeLabel(rawDate) ? ` · ${timeLabel(rawDate)}` : ""}</p>
//                         <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">ROI credit recorded to account</p>
//                       </div>
//                     </div>
//                     <div className="hidden sm:block">
//                       <p className="text-xs text-slate-300">{dateLabel(rawDate)}</p>
//                       <p className="mt-1 text-[10px] text-slate-600">{timeLabel(rawDate)}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold tabular-nums text-emerald-300 sm:text-base">
//                         <span className="mr-1 text-xs font-normal text-amber-300">+$</span>{money(txn.amount)}
//                       </p>
//                       <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-emerald-400/70"><ArrowDownRight size={11} /> Credited</p>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           )}

//           {!loading && filtered.length > 0 && (
//             <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-center gap-3 text-xs text-slate-500">
//                 <span>Rows</span>
//                 <select
//                   value={entriesPerPage}
//                   onChange={(e) => setEntriesPerPage(Number(e.target.value))}
//                   className="border border-white/10 bg-[#101319] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-300"
//                 >
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span>{firstIndex + 1}–{Math.min(firstIndex + pageRows.length, filtered.length)} of {filtered.length}</span>
//               </div>
//               <div className="flex items-center justify-between gap-4 sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
//                 >
//                   <ChevronLeft size={15} /> Previous
//                 </button>
//                 <span className="min-w-16 text-center font-mono text-xs text-amber-200">{page} / {totalPages}</span>
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
//                 >
//                   Next <ChevronRight size={15} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </section>

//         <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.07] pt-4 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
//           <span>Global Wealth · ROI report</span>
//           <span>Figures are supplied by your account ROI endpoint</span>
//         </footer>
//       </main>
//     </div>
//   );
// };

// export default RoiIncome;


import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Coins,
  Layers3,
  RefreshCw,
  Search,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";

const toAmount = (value) => {
  const raw = value?.$numberDecimal ?? value ?? 0;
  const number = Number(raw);
  return Number.isFinite(number) ? number : 0;
};

const money = (value) =>
  toAmount(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const validDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dateLabel = (value) => {
  const date = validDate(value);
  if (!date) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const timeLabel = (value) => {
  const date = validDate(value);
  return date
    ? date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "";
};

const RoiIncome = () => {
  const userId = getUserId();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState({
    totalCombined: 0,
    totalSelfRoi: 0,
    todaySelfRoi: 0,
    totalLevelRoi: 0,
    todayLevelRoi: 0,
  });

  const fetchRoiIncome = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("Login session not found. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/user/roi-income?t=${Date.now()}`);
      if (response?.data?.success) {
        setTransactions(Array.isArray(response.data.data) ? response.data.data : []);
        setStats({
          totalCombined: toAmount(response.data.totalCombined),
          totalSelfRoi: toAmount(response.data.totalSelfRoi),
          todaySelfRoi: toAmount(response.data.todaySelfRoi),
          totalLevelRoi: toAmount(response.data.totalLevelRoi),
          todayLevelRoi: toAmount(response.data.todayLevelRoi),
        });
      } else {
        setTransactions([]);
        setStats({
          totalCombined: 0,
          totalSelfRoi: 0,
          todaySelfRoi: 0,
          totalLevelRoi: 0,
          todayLevelRoi: 0,
        });
        setError(response?.data?.message || "ROI income data could not be loaded.");
      }
    } catch (err) {
      console.error("Failed to fetch ROI income", err);
      setError(err?.response?.data?.message || "Unable to load ROI income right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoiIncome();
  }, [fetchRoiIncome]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((txn) => {
      const rawDate = txn.createdAt || txn.date;
      const date = validDate(rawDate);

      if ((startDate || endDate) && !date) return false;
      if (startDate && date < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && date > new Date(`${endDate}T23:59:59.999`)) return false;

      if (query) {
        const description = String(txn.description || "").toLowerCase();
        const type = String(txn.type || "").toLowerCase();
        const amount = String(toAmount(txn.amount));
        if (!description.includes(query) && !type.includes(query) && !amount.includes(query)) return false;
      }
      return true;
    });
  }, [transactions, search, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const page = Math.min(currentPage, totalPages);
  const firstIndex = (page - 1) * entriesPerPage;
  const pageRows = filtered.slice(firstIndex, firstIndex + entriesPerPage);

  const selfShare =
    toAmount(stats.totalCombined) > 0
      ? (toAmount(stats.totalSelfRoi) / toAmount(stats.totalCombined)) * 100
      : 0;
  const levelShare =
    toAmount(stats.totalCombined) > 0
      ? (toAmount(stats.totalLevelRoi) / toAmount(stats.totalCombined)) * 100
      : 0;

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  const hasFilters = Boolean(search || startDate || endDate);

  return (
    <div className="min-h-screen overflow-hidden bg-[#090a0d] text-white">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -left-48 top-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/[0.07] blur-[140px]" />
        <div className="absolute -right-40 top-[35rem] h-[28rem] w-[28rem] rounded-full bg-indigo-500/[0.06] blur-[140px]" />
      </div>

      <main className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
        {/* Distinct hero: editorial heading + large income figure */}
        <header className="relative overflow-hidden border-b border-white/10 pb-8 sm:pb-10">
          <div className="absolute right-0 top-0 hidden select-none text-[11rem] font-black leading-none tracking-[-0.1em] text-white/[0.025] lg:block">ROI</div>
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-amber-300" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200">Earnings / Return on investment</span>
              </div>
              <h1 className="text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                ROI <span className="font-light text-slate-500">income</span><span className="text-amber-300">.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                Your personal daily returns and team-level ROI, brought together in one earnings view.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                <Sparkles size={13} className="text-amber-300" /> Combined ROI income
              </span>
              <div className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                <span className="mr-1 text-2xl font-normal text-amber-300">$</span>{money(stats.totalCombined)}
              </div>
              <button
                type="button"
                onClick={fetchRoiIncome}
                disabled={loading}
                className="inline-flex items-center gap-2 border-b border-amber-300/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-200 hover:text-white disabled:opacity-40"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh earnings
              </button>
            </div>
          </div>
        </header>

        {/* ROI mix - horizontal analytical panel, not repeated cards */}
        <section className="grid gap-8 border-b border-white/10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:py-10">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-slate-500">Income breakdown</p>
                <h2 className="mt-2 text-xl font-medium text-white">Package vs. team ROI</h2>
              </div>
              <Activity size={20} className="text-amber-300" strokeWidth={1.5} />
            </div>

            <div className="space-y-7">
              <div>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-sky-300/25 text-sky-200"><Wallet size={17} /></span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Package ROI</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Returns generated by your own packages</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-sky-200">${money(stats.totalSelfRoi)}</p>
                    <p className="text-[10px] text-slate-500">{selfShare.toFixed(1)}% of combined</p>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-white/[0.07]">
                  <div className="h-full bg-gradient-to-r from-sky-700 to-sky-300 transition-all duration-700" style={{ width: `${Math.min(100, selfShare)}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-violet-300/25 text-violet-200"><Layers3 size={17} /></span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Level ROI</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Returns from your team levels</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-violet-200">${money(stats.totalLevelRoi)}</p>
                    <p className="text-[10px] text-slate-500">{levelShare.toFixed(1)}% of combined</p>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-white/[0.07]">
                  <div className="h-full bg-gradient-to-r from-violet-800 to-violet-300 transition-all duration-700" style={{ width: `${Math.min(100, levelShare)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Package ROI today</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${money(stats.todaySelfRoi)}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-sky-300"><ArrowUpRight size={12} /> Today's package return</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Level ROI today</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${money(stats.todayLevelRoi)}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-violet-300"><ArrowUpRight size={12} /> Today's package return</p>
            </div>
            <div className="col-span-2 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Income transactions</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{transactions.length.toLocaleString("en-IN")}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center border border-white/10 text-amber-300"><Coins size={19} /></div>
            </div>
          </div>
        </section>

        {/* Ledger */}
        <section className="pt-8 lg:pt-10">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                <span className="h-px w-6 bg-amber-300" /> Transaction history
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">ROI activity ledger</h2>
              <p className="mt-1 text-xs text-slate-500">Search and review each recorded ROI transaction.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, type or amount"
                className="w-full border-b border-white/15 bg-transparent py-2 pl-6 pr-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300"
              />
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-white/10 py-3">
            <CalendarDays size={15} className="text-amber-300" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Date range</span>
            <input
              aria-label="Start date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-amber-300"
            />
            <span className="text-xs text-slate-600">—</span>
            <input
              aria-label="End date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-amber-300"
            />
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200 hover:text-white">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>

          {error && (
            <div className="mb-5 flex flex-col gap-3 border-l-2 border-rose-400 bg-rose-400/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-rose-200">{error}</p>
              <button type="button" onClick={fetchRoiIncome} className="text-left text-xs font-semibold text-rose-100 underline underline-offset-4">Try again</button>
            </div>
          )}

          <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-white/10 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:grid-cols-[55px_minmax(0,1fr)_150px_180px] sm:gap-5">
            <span className="text-center">No.</span>
            <span>Income details</span>
            <span className="hidden sm:block">Date / Time</span>
            <span className="text-right">Credit amount</span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border border-amber-300/20 border-t-amber-300" />
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Loading ROI records</p>
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border border-white/10 text-slate-500"><Search size={21} /></div>
              <p className="text-sm font-medium text-slate-300">No ROI transactions found</p>
              <p className="mt-1 text-xs text-slate-600">Try another search term or date range.</p>
              {hasFilters && <button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold text-amber-200 underline underline-offset-4">Reset filters</button>}
            </div>
          ) : (
            <div>
              {pageRows.map((txn, index) => {
                const isLevel = txn.type === "daily_level_income";
                const rawDate = txn.createdAt || txn.date;
                return (
                  <article
                    key={txn._id || `${rawDate}-${firstIndex + index}`}
                    className="group grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.07] py-4 transition hover:bg-white/[0.018] sm:grid-cols-[55px_minmax(0,1fr)_150px_180px] sm:gap-5 sm:py-5"
                  >
                    <span className="text-center font-mono text-[11px] text-slate-600">{String(firstIndex + index + 1).padStart(2, "0")}</span>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${isLevel ? "border-violet-300/25 bg-violet-300/[0.05] text-violet-200" : "border-sky-300/25 bg-sky-300/[0.05] text-sky-200"}`}>
                        {isLevel ? <Layers3 size={16} /> : <Wallet size={16} />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-200">{txn.description || (isLevel ? "Level ROI income" : "Package ROI income")}</p>
                          <span className={`border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.13em] ${isLevel ? "border-violet-300/20 text-violet-200" : "border-sky-300/20 text-sky-200"}`}>
                            {isLevel ? "Level ROI" : "Package ROI"}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-600 sm:hidden">{dateLabel(rawDate)}{timeLabel(rawDate) ? ` · ${timeLabel(rawDate)}` : ""}</p>
                        <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">ROI credit recorded to account</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-slate-300">{dateLabel(rawDate)}</p>
                      <p className="mt-1 text-[10px] text-slate-600">{timeLabel(rawDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-emerald-300 sm:text-base">
                        <span className="mr-1 text-xs font-normal text-amber-300">+$</span>{money(txn.amount)}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-emerald-400/70"><ArrowDownRight size={11} /> Credited</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Rows</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="border border-white/10 bg-[#101319] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-300"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>{firstIndex + 1}–{Math.min(firstIndex + pageRows.length, filtered.length)} of {filtered.length}</span>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="min-w-16 text-center font-mono text-xs text-amber-200">{page} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.07] pt-4 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Global Wealth · ROI report</span>
          <span>Figures are supplied by your account ROI endpoint</span>
        </footer>
      </main>
    </div>
  );
};

export default RoiIncome;
