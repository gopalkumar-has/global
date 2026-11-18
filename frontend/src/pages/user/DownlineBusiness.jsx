// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import api from "../../api/axios";
// import { getUserId } from "../../utils/authUtils";
// import {
//   ArrowDownRight,
//   ArrowUpRight,
//   CalendarRange,
//   ChevronLeft,
//   ChevronRight,
//   CircleDot,
//   Filter,
//   Layers,
//   RefreshCw,
//   Search,
//   Users,
//   X,
// } from "lucide-react";

// const formatMoney = (value) => {
//   const n = Number(value);
//   return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });
// };

// const formatDate = (value) => {
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "Date unavailable";
//   return date.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const formatTime = (value) => {
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "";
//   return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
// };

// const DownlineBusiness = () => {
//   const userId = getUserId();
//   const [transactions, setTransactions] = useState([]);
//   const [typeFilter, setTypeFilter] = useState("All");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [stats, setStats] = useState({
//     totalDirect: 0,
//     todayDirect: 0,
//     totalLevel: 0,
//     todayLevel: 0,
//   });

//   const fetchBusiness = useCallback(async () => {
//     if (!userId) {
//       setLoading(false);
//       setError("Your login session was not found. Please sign in again.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     try {
//       const response = await api.get("/user/downline-business");
//       if (response?.data?.success) {
//         setTransactions(Array.isArray(response.data.data) ? response.data.data : []);
//         setStats({
//           totalDirect: Number(response.data.stats?.totalDirect) || 0,
//           todayDirect: Number(response.data.stats?.todayDirect) || 0,
//           totalLevel: Number(response.data.stats?.totalLevel) || 0,
//           todayLevel: Number(response.data.stats?.todayLevel) || 0,
//         });
//       } else {
//         setTransactions([]);
//         setStats({ totalDirect: 0, todayDirect: 0, totalLevel: 0, todayLevel: 0 });
//         setError(response?.data?.message || "The business report could not be loaded.");
//       }
//     } catch (err) {
//       console.error("Failed to fetch Downline Business", err);
//       setError(err?.response?.data?.message || "Something went wrong while loading business data.");
//     } finally {
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchBusiness();
//   }, [fetchBusiness]);

//   const filteredTransactions = useMemo(() => {
//     const needle = searchTerm.trim().toLowerCase();

//     return transactions.filter((txn) => {
//       const date = new Date(txn.date);
//       if (startDate && (!Number.isNaN(date.getTime())) && date < new Date(`${startDate}T00:00:00`)) return false;
//       if (endDate && (!Number.isNaN(date.getTime())) && date > new Date(`${endDate}T23:59:59.999`)) return false;
//       if ((startDate || endDate) && Number.isNaN(date.getTime())) return false;
//       if (typeFilter !== "All" && txn.type !== typeFilter) return false;

//       if (needle) {
//         const searchable = `${txn.type || ""} ${txn.amount ?? ""} ${txn.date || ""}`.toLowerCase();
//         if (!searchable.includes(needle)) return false;
//       }
//       return true;
//     });
//   }, [transactions, startDate, endDate, typeFilter, searchTerm]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [startDate, endDate, typeFilter, searchTerm, entriesPerPage]);

//   const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / entriesPerPage));
//   const page = Math.min(currentPage, totalPages);
//   const firstIndex = (page - 1) * entriesPerPage;
//   const visibleTransactions = filteredTransactions.slice(firstIndex, firstIndex + entriesPerPage);

//   const directTotal = Number(stats.totalDirect) || 0;
//   const teamTotal = Number(stats.totalLevel) || 0;
//   const combinedTotal = directTotal + teamTotal;
//   const directShare = combinedTotal > 0 ? (directTotal / combinedTotal) * 100 : 0;
//   const teamShare = combinedTotal > 0 ? (teamTotal / combinedTotal) * 100 : 0;

//   const clearFilters = () => {
//     setTypeFilter("All");
//     setStartDate("");
//     setEndDate("");
//     setSearchTerm("");
//   };

//   const activeFilters = Boolean(typeFilter !== "All" || startDate || endDate || searchTerm);

//   return (
//     <div className="min-h-screen overflow-hidden bg-[#080a0e] text-white">
//       <div className="pointer-events-none fixed inset-0 opacity-40" aria-hidden="true">
//         <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#a87924]/10 blur-[130px]" />
//         <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#59418a]/10 blur-[150px]" />
//       </div>

//       <main className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
//         {/* New editorial header / total business feature */}
//         <header className="relative grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-10">
//           <div>
//             <div className="mb-5 flex items-center gap-3">
//               <span className="h-px w-9 bg-[#d7ad60]" />
//               <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d7ad60]">Global Wealth / Network Analytics</span>
//             </div>
//             <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
//               Team business<span className="text-[#d7ad60]">.</span>
//             </h1>
//             <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
//               A clear view of the business generated across your direct network and extended team.
//             </p>
//           </div>

//           <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
//             <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" />
//               Lifetime business volume
//             </div>
//             <div className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
//               <span className="mr-1 text-2xl font-normal text-[#d7ad60]">$</span>{formatMoney(combinedTotal)}
//             </div>
//             <button
//               type="button"
//               onClick={fetchBusiness}
//               disabled={loading}
//               className="mt-1 inline-flex items-center gap-2 border-b border-[#d7ad60]/50 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#e6c47f] transition hover:border-[#e6c47f] hover:text-white disabled:opacity-50"
//             >
//               <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
//               Refresh figures
//             </button>
//           </div>
//         </header>

//         {/* Business split: deliberately not card-based */}
//         <section className="grid gap-8 border-b border-white/10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:gap-14 lg:py-10">
//           <div>
//             <div className="mb-6 flex items-center justify-between">
//               <div>
//                 <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Business composition</p>
//                 <h2 className="mt-2 text-xl font-medium text-white">Where your volume comes from</h2>
//               </div>
//               <Layers className="text-[#d7ad60]" size={21} strokeWidth={1.5} />
//             </div>

//             <div className="space-y-7">
//               <div>
//                 <div className="mb-3 flex items-end justify-between gap-4">
//                   <div className="flex items-center gap-3">
//                     <span className="flex h-9 w-9 items-center justify-center border border-[#d7ad60]/25 text-[#e5c47f]"><Users size={17} /></span>
//                     <div>
//                       <p className="text-sm font-medium text-slate-200">Direct business</p>
//                       <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Your personally referred network</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-lg font-semibold tabular-nums text-[#e5c47f]">${formatMoney(directTotal)}</p>
//                     <p className="text-[10px] text-slate-500">{directShare.toFixed(1)}% of total</p>
//                   </div>
//                 </div>
//                 <div className="h-[5px] w-full overflow-hidden bg-white/[0.07]">
//                   <div className="h-full bg-gradient-to-r from-[#9d712b] to-[#f1d18c] transition-all duration-700" style={{ width: `${directShare}%` }} />
//                 </div>
//               </div>

//               <div>
//                 <div className="mb-3 flex items-end justify-between gap-4">
//                   <div className="flex items-center gap-3">
//                     <span className="flex h-9 w-9 items-center justify-center border border-violet-300/25 text-violet-300"><Layers size={17} /></span>
//                     <div>
//                       <p className="text-sm font-medium text-slate-200">Team business</p>
//                       <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Business across your wider team</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-lg font-semibold tabular-nums text-violet-200">${formatMoney(teamTotal)}</p>
//                     <p className="text-[10px] text-slate-500">{teamShare.toFixed(1)}% of total</p>
//                   </div>
//                 </div>
//                 <div className="h-[5px] w-full overflow-hidden bg-white/[0.07]">
//                   <div className="h-full bg-gradient-to-r from-violet-700 to-violet-300 transition-all duration-700" style={{ width: `${teamShare}%` }} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
//             <div>
//               <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Direct today</p>
//               <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${formatMoney(stats.todayDirect)}</p>
//               <p className="mt-2 flex items-center gap-1 text-[10px] text-emerald-300"><ArrowUpRight size={12} /> Today's volume</p>
//             </div>
//             <div>
//               <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Team today</p>
//               <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${formatMoney(stats.todayLevel)}</p>
//               <p className="mt-2 flex items-center gap-1 text-[10px] text-violet-300"><ArrowUpRight size={12} /> Today's volume</p>
//             </div>
//             <div className="col-span-2 flex items-center justify-between border-t border-white/10 pt-5">
//               <div>
//                 <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Total records received</p>
//                 <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{transactions.length.toLocaleString("en-US")}</p>
//               </div>
//               <div className="flex h-11 w-11 items-center justify-center border border-white/10 text-[#d7ad60]"><CircleDot size={19} /></div>
//             </div>
//           </div>
//         </section>

//         {/* Ledger workspace */}
//         <section className="pt-8 lg:pt-10">
//           <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
//             <div>
//               <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d7ad60]">
//                 <span className="h-px w-6 bg-[#d7ad60]" /> Activity ledger
//               </div>
//               <h2 className="text-2xl font-semibold tracking-tight text-white">Business records</h2>
//               <p className="mt-1 text-xs text-slate-500">Review each direct and team business entry.</p>
//             </div>

//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//               <div className="relative min-w-0 sm:w-56">
//                 <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500" />
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   placeholder="Search records..."
//                   className="w-full border-b border-white/15 bg-transparent py-2 pl-6 pr-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#d7ad60]"
//                 />
//               </div>
//               <label className="flex items-center gap-2 text-xs text-slate-400">
//                 <Filter size={14} className="text-[#d7ad60]" />
//                 <select
//                   value={typeFilter}
//                   onChange={(e) => setTypeFilter(e.target.value)}
//                   className="border-b border-white/15 bg-[#10131a] px-2 py-2 text-xs text-slate-200 outline-none focus:border-[#d7ad60]"
//                 >
//                   <option value="All">All business</option>
//                   <option value="Direct Business">Direct only</option>
//                   <option value="Team Business">Team only</option>
//                 </select>
//               </label>
//             </div>
//           </div>

//           <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-white/10 py-3">
//             <CalendarRange size={15} className="text-[#d7ad60]" />
//             <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Period</span>
//             <input
//               aria-label="Start date"
//               type="date"
//               value={startDate}
//               max={endDate || undefined}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-[#d7ad60]"
//             />
//             <span className="text-xs text-slate-600">—</span>
//             <input
//               aria-label="End date"
//               type="date"
//               value={endDate}
//               min={startDate || undefined}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-[#d7ad60]"
//             />
//             {activeFilters && (
//               <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e5c47f] hover:text-white">
//                 <X size={12} /> Reset filters
//               </button>
//             )}
//           </div>

//           {error && (
//             <div className="mb-5 flex flex-col gap-3 border-l-2 border-rose-400 bg-rose-400/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
//               <p className="text-sm text-rose-200">{error}</p>
//               <button type="button" onClick={fetchBusiness} className="text-left text-xs font-semibold text-rose-100 underline underline-offset-4">Retry loading</button>
//             </div>
//           )}

//           <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-white/10 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:grid-cols-[55px_minmax(0,1fr)_150px_190px] sm:gap-5">
//             <span className="text-center">No.</span>
//             <span>Business entry</span>
//             <span className="hidden sm:block">Date / Time</span>
//             <span className="text-right">Amount</span>
//           </div>

//           {loading ? (
//             <div className="flex min-h-64 flex-col items-center justify-center gap-4">
//               <div className="h-8 w-8 animate-spin rounded-full border border-[#d7ad60]/20 border-t-[#e5c47f]" />
//               <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Loading activity</p>
//             </div>
//           ) : visibleTransactions.length === 0 ? (
//             <div className="flex min-h-64 flex-col items-center justify-center text-center">
//               <div className="mb-4 flex h-14 w-14 items-center justify-center border border-white/10 text-slate-500"><Search size={21} /></div>
//               <p className="text-sm font-medium text-slate-300">No matching business entries</p>
//               <p className="mt-1 text-xs text-slate-600">Change your search or date filters and try again.</p>
//               {activeFilters && <button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold text-[#e5c47f] underline underline-offset-4">Clear all filters</button>}
//             </div>
//           ) : (
//             <div>
//               {visibleTransactions.map((txn, index) => {
//                 const isDirect = txn.type === "Direct Business";
//                 const dateLabel = formatDate(txn.date);
//                 return (
//                   <article
//                     key={txn._id || `${txn.date}-${firstIndex + index}`}
//                     className="group grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.07] py-4 transition hover:bg-white/[0.018] sm:grid-cols-[55px_minmax(0,1fr)_150px_190px] sm:gap-5 sm:py-5"
//                   >
//                     <span className="text-center font-mono text-[11px] text-slate-600">{String(firstIndex + index + 1).padStart(2, "0")}</span>
//                     <div className="flex min-w-0 items-center gap-3">
//                       <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${isDirect ? "border-[#d7ad60]/25 bg-[#d7ad60]/[0.06] text-[#e5c47f]" : "border-violet-300/20 bg-violet-300/[0.05] text-violet-200"}`}>
//                         {isDirect ? <Users size={16} /> : <Layers size={16} />}
//                       </span>
//                       <div className="min-w-0">
//                         <p className="truncate text-sm font-medium text-slate-200">{isDirect ? "Direct Business" : "Team Business"}</p>
//                         <p className="mt-1 text-[10px] text-slate-600 sm:hidden">{dateLabel}{formatTime(txn.date) ? ` · ${formatTime(txn.date)}` : ""}</p>
//                         <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">{isDirect ? "Personal network volume" : "Extended team volume"}</p>
//                       </div>
//                     </div>
//                     <div className="hidden sm:block">
//                       <p className="text-xs text-slate-300">{dateLabel}</p>
//                       <p className="mt-1 text-[10px] text-slate-600">{formatTime(txn.date)}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-semibold tabular-nums text-white sm:text-base">
//                         <span className="mr-1 text-xs font-normal text-[#d7ad60]">$</span>{formatMoney(txn.amount)}
//                       </p>
//                       <p className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] ${isDirect ? "text-[#c6a15c]" : "text-violet-300/80"}`}>
//                         {isDirect ? "Direct volume" : "Team volume"}
//                       </p>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           )}

//           {!loading && filteredTransactions.length > 0 && (
//             <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-center gap-3 text-xs text-slate-500">
//                 <span>Rows per page</span>
//                 <select
//                   value={entriesPerPage}
//                   onChange={(e) => setEntriesPerPage(Number(e.target.value))}
//                   className="border border-white/10 bg-[#10131a] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-[#d7ad60]"
//                 >
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>
//                 <span className="hidden sm:inline">·</span>
//                 <span>{firstIndex + 1}–{Math.min(firstIndex + visibleTransactions.length, filteredTransactions.length)} of {filteredTransactions.length}</span>
//               </div>

//               <div className="flex items-center justify-between gap-4 sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-[#e5c47f] disabled:cursor-not-allowed disabled:opacity-30"
//                 >
//                   <ChevronLeft size={15} /> Previous
//                 </button>
//                 <span className="min-w-16 text-center font-mono text-xs text-[#e5c47f]">{page} / {totalPages}</span>
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                   className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-[#e5c47f] disabled:cursor-not-allowed disabled:opacity-30"
//                 >
//                   Next <ChevronRight size={15} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </section>

//         <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.07] pt-4 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
//           <span>Global Wealth · Network report</span>
//           <span>Figures are supplied by your account business report</span>
//         </footer>
//       </main>
//     </div>
//   );
// };

// export default DownlineBusiness;


import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Filter,
  Layers,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

const formatMoney = (value) => {
  const n = Number(value);
  return (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const DownlineBusiness = () => {
  const userId = getUserId();
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalDirect: 0,
    todayDirect: 0,
    totalLevel: 0,
    todayLevel: 0,
  });

  const fetchBusiness = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("Your login session was not found. Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await api.get("/user/downline-business");
      if (response?.data?.success) {
        setTransactions(Array.isArray(response.data.data) ? response.data.data : []);
        setStats({
          totalDirect: Number(response.data.stats?.totalDirect) || 0,
          todayDirect: Number(response.data.stats?.todayDirect) || 0,
          totalLevel: Number(response.data.stats?.totalLevel) || 0,
          todayLevel: Number(response.data.stats?.todayLevel) || 0,
        });
      } else {
        setTransactions([]);
        setStats({ totalDirect: 0, todayDirect: 0, totalLevel: 0, todayLevel: 0 });
        setError(response?.data?.message || "The business report could not be loaded.");
      }
    } catch (err) {
      console.error("Failed to fetch Downline Business", err);
      setError(err?.response?.data?.message || "Something went wrong while loading business data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const filteredTransactions = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    return transactions.filter((txn) => {
      const date = new Date(txn.date);
      if (startDate && (!Number.isNaN(date.getTime())) && date < new Date(`${startDate}T00:00:00`)) return false;
      if (endDate && (!Number.isNaN(date.getTime())) && date > new Date(`${endDate}T23:59:59.999`)) return false;
      if ((startDate || endDate) && Number.isNaN(date.getTime())) return false;
      if (typeFilter !== "All" && txn.type !== typeFilter) return false;

      if (needle) {
        const searchable = `${txn.type || ""} ${txn.amount ?? ""} ${txn.date || ""}`.toLowerCase();
        if (!searchable.includes(needle)) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate, typeFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, typeFilter, searchTerm, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / entriesPerPage));
  const page = Math.min(currentPage, totalPages);
  const firstIndex = (page - 1) * entriesPerPage;
  const visibleTransactions = filteredTransactions.slice(firstIndex, firstIndex + entriesPerPage);

  const directTotal = Number(stats.totalDirect) || 0;
  const teamTotal = Number(stats.totalLevel) || 0;
  const combinedTotal = directTotal + teamTotal;
  const directShare = combinedTotal > 0 ? (directTotal / combinedTotal) * 100 : 0;
  const teamShare = combinedTotal > 0 ? (teamTotal / combinedTotal) * 100 : 0;

  const clearFilters = () => {
    setTypeFilter("All");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const activeFilters = Boolean(typeFilter !== "All" || startDate || endDate || searchTerm);

  return (
    <div className="min-h-screen overflow-hidden bg-[#080a0e] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-40" aria-hidden="true">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#a87924]/10 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#59418a]/10 blur-[150px]" />
      </div>

      <main className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
        {/* New editorial header / total business feature */}
        <header className="relative grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-10">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-9 bg-[#d7ad60]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d7ad60]">Global Wealth / Network Analytics</span>
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Team business<span className="text-[#d7ad60]">.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
              A clear view of the business generated across your direct network and extended team.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" />
              Lifetime business volume
            </div>
            <div className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              <span className="mr-1 text-2xl font-normal text-[#d7ad60]">$</span>{formatMoney(combinedTotal)}
            </div>
            <button
              type="button"
              onClick={fetchBusiness}
              disabled={loading}
              className="mt-1 inline-flex items-center gap-2 border-b border-[#d7ad60]/50 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#e6c47f] transition hover:border-[#e6c47f] hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh figures
            </button>
          </div>
        </header>

        {/* Business split: deliberately not card-based */}
        <section className="grid gap-8 border-b border-white/10 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] lg:gap-14 lg:py-10">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Business composition</p>
                <h2 className="mt-2 text-xl font-medium text-white">Where your volume comes from</h2>
              </div>
              <Layers className="text-[#d7ad60]" size={21} strokeWidth={1.5} />
            </div>

            <div className="space-y-7">
              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-[#d7ad60]/25 text-[#e5c47f]"><Users size={17} /></span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Direct business</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Your personally referred network</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-[#e5c47f]">${formatMoney(directTotal)}</p>
                    <p className="text-[10px] text-slate-500">{directShare.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="h-[5px] w-full overflow-hidden bg-white/[0.07]">
                  <div className="h-full bg-gradient-to-r from-[#9d712b] to-[#f1d18c] transition-all duration-700" style={{ width: `${directShare}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-violet-300/25 text-violet-300"><Layers size={17} /></span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">Team business</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-500">Business across your wider team</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums text-violet-200">${formatMoney(teamTotal)}</p>
                    <p className="text-[10px] text-slate-500">{teamShare.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="h-[5px] w-full overflow-hidden bg-white/[0.07]">
                  <div className="h-full bg-gradient-to-r from-violet-700 to-violet-300 transition-all duration-700" style={{ width: `${teamShare}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Direct today</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${formatMoney(stats.todayDirect)}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-emerald-300"><ArrowUpRight size={12} /> Today's volume</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Team today</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">${formatMoney(stats.todayLevel)}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-violet-300"><ArrowUpRight size={12} /> Today's volume</p>
            </div>
            <div className="col-span-2 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Total records received</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{transactions.length.toLocaleString("en-US")}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center border border-white/10 text-[#d7ad60]"><CircleDot size={19} /></div>
            </div>
          </div>
        </section>

        {/* Ledger workspace */}
        <section className="pt-8 lg:pt-10">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d7ad60]">
                <span className="h-px w-6 bg-[#d7ad60]" /> Activity ledger
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Business records</h2>
              <p className="mt-1 text-xs text-slate-500">Review each direct and team business entry.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-56">
                <Search size={15} className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search records..."
                  className="w-full border-b border-white/15 bg-transparent py-2 pl-6 pr-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#d7ad60]"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <Filter size={14} className="text-[#d7ad60]" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border-b border-white/15 bg-[#10131a] px-2 py-2 text-xs text-slate-200 outline-none focus:border-[#d7ad60]"
                >
                  <option value="All">All business</option>
                  <option value="Direct Business">Direct only</option>
                  <option value="Team Business">Team only</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-white/10 py-3">
            <CalendarRange size={15} className="text-[#d7ad60]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Period</span>
            <input
              aria-label="Start date"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-[#d7ad60]"
            />
            <span className="text-xs text-slate-600">—</span>
            <input
              aria-label="End date"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="min-w-0 border-b border-white/10 bg-transparent px-1 py-1.5 text-xs text-slate-300 outline-none [color-scheme:dark] focus:border-[#d7ad60]"
            />
            {activeFilters && (
              <button type="button" onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e5c47f] hover:text-white">
                <X size={12} /> Reset filters
              </button>
            )}
          </div>

          {error && (
            <div className="mb-5 flex flex-col gap-3 border-l-2 border-rose-400 bg-rose-400/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-rose-200">{error}</p>
              <button type="button" onClick={fetchBusiness} className="text-left text-xs font-semibold text-rose-100 underline underline-offset-4">Retry loading</button>
            </div>
          )}

          <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-white/10 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:grid-cols-[55px_minmax(0,1fr)_150px_190px] sm:gap-5">
            <span className="text-center">No.</span>
            <span>Business entry</span>
            <span className="hidden sm:block">Date / Time</span>
            <span className="text-right">Amount</span>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border border-[#d7ad60]/20 border-t-[#e5c47f]" />
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Loading activity</p>
            </div>
          ) : visibleTransactions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center border border-white/10 text-slate-500"><Search size={21} /></div>
              <p className="text-sm font-medium text-slate-300">No matching business entries</p>
              <p className="mt-1 text-xs text-slate-600">Change your search or date filters and try again.</p>
              {activeFilters && <button type="button" onClick={clearFilters} className="mt-4 text-xs font-semibold text-[#e5c47f] underline underline-offset-4">Clear all filters</button>}
            </div>
          ) : (
            <div>
              {visibleTransactions.map((txn, index) => {
                const isDirect = txn.type === "Direct Business";
                const dateLabel = formatDate(txn.date);
                return (
                  <article
                    key={txn._id || `${txn.date}-${firstIndex + index}`}
                    className="group grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 border-b border-white/[0.07] py-4 transition hover:bg-white/[0.018] sm:grid-cols-[55px_minmax(0,1fr)_150px_190px] sm:gap-5 sm:py-5"
                  >
                    <span className="text-center font-mono text-[11px] text-slate-600">{String(firstIndex + index + 1).padStart(2, "0")}</span>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center border ${isDirect ? "border-[#d7ad60]/25 bg-[#d7ad60]/[0.06] text-[#e5c47f]" : "border-violet-300/20 bg-violet-300/[0.05] text-violet-200"}`}>
                        {isDirect ? <Users size={16} /> : <Layers size={16} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">{isDirect ? "Direct Business" : "Team Business"}</p>
                        <p className="mt-1 text-[10px] text-slate-600 sm:hidden">{dateLabel}{formatTime(txn.date) ? ` · ${formatTime(txn.date)}` : ""}</p>
                        <p className="mt-1 hidden text-[10px] text-slate-500 sm:block">{isDirect ? "Personal network volume" : "Extended team volume"}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs text-slate-300">{dateLabel}</p>
                      <p className="mt-1 text-[10px] text-slate-600">{formatTime(txn.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-white sm:text-base">
                        <span className="mr-1 text-xs font-normal text-[#d7ad60]">$</span>{formatMoney(txn.amount)}
                      </p>
                      <p className={`mt-1 text-[9px] font-semibold uppercase tracking-[0.13em] ${isDirect ? "text-[#c6a15c]" : "text-violet-300/80"}`}>
                        {isDirect ? "Direct volume" : "Team volume"}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && filteredTransactions.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Rows per page</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="border border-white/10 bg-[#10131a] px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-[#d7ad60]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="hidden sm:inline">·</span>
                <span>{firstIndex + 1}–{Math.min(firstIndex + visibleTransactions.length, filteredTransactions.length)} of {filteredTransactions.length}</span>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-[#e5c47f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <span className="min-w-16 text-center font-mono text-xs text-[#e5c47f]">{page} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-[#e5c47f] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-10 flex flex-col gap-2 border-t border-white/[0.07] pt-4 text-[9px] uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Global Wealth · Network report</span>
          <span>Figures are supplied by your account business report</span>
        </footer>
      </main>
    </div>
  );
};

export default DownlineBusiness;
