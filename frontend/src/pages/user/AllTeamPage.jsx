// import React, { useEffect, useMemo, useState } from "react";
// import api from "../../api/axios";
// import useAuth from "../../hooks/useAuth";
// import {
//   Users, UserRoundCheck, Search, CalendarDays, Globe2, Hash,
//   ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
//   Sparkles, RefreshCw, Layers3, ShieldCheck, CircleUserRound
// } from "lucide-react";

// const formatDate = (value) => {
//   if (!value) return "—";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "—";
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit", month: "short", year: "numeric"
//   });
// };

// const GlassStat = ({ icon: Icon, label, value, detail, accent = "gold" }) => {
//   const accentClass = accent === "green"
//     ? "text-emerald-300 bg-emerald-300/10 border-emerald-200/15"
//     : "text-[#e5c783] bg-[#d9b96e]/10 border-[#d9b96e]/20";

//   return (
//     <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-[linear-gradient(135deg,rgba(255,255,255,0.085),rgba(255,255,255,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[#d9bb78]/25">
//       <div className="pointer-events-none absolute -right-9 -top-10 h-32 w-32 rounded-full border border-white/[0.045] transition-transform duration-500 group-hover:scale-125" />
//       <div className="relative flex items-start justify-between gap-3">
//         <div>
//           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#958b78]">{label}</p>
//           <p className="mt-3 text-3xl font-semibold tracking-tight text-[#f4ead7] tabular-nums">{value}</p>
//           <p className="mt-1.5 text-[11px] text-[#81796c]">{detail}</p>
//         </div>
//         <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${accentClass}`}>
//           <Icon size={20} strokeWidth={1.7} />
//         </span>
//       </div>
//     </div>
//   );
// };

// const AllTeamPage = () => {
//   const { user } = useAuth();
//   const [team, setTeam] = useState([]);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");

//   const fetchAllTeam = async () => {
//     if (!user?.userId) {
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     setError("");
//     try {
//       const res = await api.get(
//         `/user/all-team/${user.userId}?t=${new Date().getTime()}`
//       );
//       const teamData = (Array.isArray(res.data.team) ? res.data.team : [])
//         .filter((member) => Number(member.level) > 0);
//       setTeam(teamData);
//     } catch (err) {
//       console.error("Error fetching all team:", err);
//       setError("We couldn't load your team right now. Please try again.");
//       setTeam([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllTeam();
//   }, [user?.userId]);

//   const stats = useMemo(() => ({
//     totalTeam: team.length,
//     activeTeam: team.filter((member) => Number(member.topUpAmount) > 0).length,
//   }), [team]);

//   const sortedAndFilteredTeam = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     const filtered = team.filter((member) =>
//       String(member.userId || "").toLowerCase().includes(term) ||
//       String(member.name || "").toLowerCase().includes(term) ||
//       String(member.country || "").toLowerCase().includes(term) ||
//       String(member.level ?? "").toLowerCase().includes(term)
//     );

//     return [...filtered].sort((a, b) => {
//       const key = sortConfig.key;
//       if (!key) return 0;

//       let aValue = a[key] ?? "";
//       let bValue = b[key] ?? "";

//       if (key === "createdAt") {
//         aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
//         bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
//       } else if (key === "level") {
//         aValue = Number(aValue) || 0;
//         bValue = Number(bValue) || 0;
//       } else {
//         aValue = String(aValue).toLowerCase();
//         bValue = String(bValue).toLowerCase();
//       }

//       if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//       return 0;
//     });
//   }, [team, search, sortConfig]);

//   const totalPages = Math.max(1, Math.ceil(sortedAndFilteredTeam.length / entriesPerPage));
//   const safePage = Math.min(currentPage, totalPages);
//   const indexOfFirst = (safePage - 1) * entriesPerPage;
//   const indexOfLast = indexOfFirst + entriesPerPage;
//   const currentItems = sortedAndFilteredTeam.slice(indexOfFirst, indexOfLast);

//   useEffect(() => {
//     if (currentPage !== safePage) setCurrentPage(safePage);
//   }, [currentPage, safePage]);

//   const handleSort = (key) => {
//     if (!key) return;
//     setSortConfig((current) => ({
//       key,
//       direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const SortIcon = ({ column }) => {
//     if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-35" />;
//     return sortConfig.direction === "asc"
//       ? <ArrowUp size={12} className="text-[#f0d99e]" />
//       : <ArrowDown size={12} className="text-[#f0d99e]" />;
//   };

//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
//     .filter((page) => page === 1 || page === totalPages || Math.abs(page - safePage) <= 1);

//   return (
//     <main className="relative min-h-screen overflow-hidden bg-[#090a0a] px-3 pb-12 pt-6 font-sans text-[#e9e1d2] sm:px-5 md:px-8 md:pt-9">
//       {/* Ambient glass lighting */}
//       <div className="pointer-events-none fixed inset-0 overflow-hidden">
//         <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#b28b45]/[0.07] blur-[110px]" />
//         <div className="absolute -right-40 top-[38%] h-[30rem] w-[30rem] rounded-full bg-[#7f6a42]/[0.055] blur-[120px]" />
//         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8bb7c]/25 to-transparent" />
//       </div>

//       <div className="relative mx-auto max-w-[1450px]">
//         {/* Intro */}
//         <section className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
//           <div>
//             <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9bb78]/20 bg-[#d9bb78]/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d8bd80]">
//               <Sparkles size={12} />
//               Member network
//             </div>
//             <h1 className="text-[27px] font-semibold tracking-[-0.04em] text-[#f4ead7] sm:text-4xl">
//               All Team <span className="font-light text-[#c5a96b]">Overview</span>
//             </h1>
//             <p className="mt-2 max-w-xl text-xs leading-6 text-[#918a7c] sm:text-sm">
//               Explore your complete team structure, membership levels and joining details.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={fetchAllTeam}
//             disabled={isLoading}
//             className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.045] px-4 text-[11px] font-semibold text-[#cfc4ad] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#d9bb78]/30 hover:bg-[#d9bb78]/[0.08] hover:text-[#f2dfb5] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
//           >
//             <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
//             Refresh report
//           </button>
//         </section>

//         {/* Summary cards */}
//         <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
//           <GlassStat
//             icon={Users}
//             label="Total team members"
//             value={stats.totalTeam.toLocaleString("en-IN")}
//             detail="Members across all levels"
//           />
//           <GlassStat
//             icon={UserRoundCheck}
//             label="Active members"
//             value={stats.activeTeam.toLocaleString("en-IN")}
//             detail="Members with a top-up amount"
//             accent="green"
//           />
//           <div className="relative hidden overflow-hidden rounded-[24px] border border-[#d9bb78]/15 bg-[linear-gradient(125deg,rgba(183,146,77,0.13),rgba(255,255,255,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] xl:block">
//             <div className="absolute -right-7 -top-12 h-36 w-36 rounded-full border border-[#d9bb78]/10" />
//             <div className="relative flex h-full items-center gap-4">
//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d9bb78]/20 bg-[#d9bb78]/10 text-[#dfc486]">
//                 <ShieldCheck size={22} />
//               </div>
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b99c62]">Your network</p>
//                 <p className="mt-1 text-sm font-medium text-[#e9dfca]">One connected community</p>
//                 <p className="mt-1 text-[10px] text-[#8b8272]">Team information at a glance</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Main glass panel */}
//         <section className="overflow-hidden rounded-[26px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_45%,rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
//           <div className="flex flex-col gap-4 border-b border-white/[0.075] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#d9bb78]/20 bg-[#d9bb78]/[0.09] text-[#dfc486]">
//                 <Layers3 size={18} />
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold text-[#f0e6d4]">Team directory</h2>
//                 <p className="mt-0.5 text-[10px] text-[#857d70]">Browse, search and sort your members</p>
//               </div>
//             </div>

//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//               <label className="flex items-center gap-2 text-[10px] text-[#918979]">
//                 <span className="whitespace-nowrap">Rows per page</span>
//                 <select
//                   value={entriesPerPage}
//                   onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
//                   className="h-10 rounded-xl border border-white/10 bg-[#111312] px-3 text-xs font-semibold text-[#e1c987] outline-none transition focus:border-[#d9bb78]/50"
//                 >
//                   {[10, 25, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
//                 </select>
//               </label>

//               <div className="relative min-w-0 sm:w-[270px]">
//                 <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c826e]" />
//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
//                   placeholder="Search ID, name, country, level..."
//                   className="h-10 w-full rounded-xl border border-white/10 bg-[#101211]/85 pl-10 pr-3 text-xs text-[#eee5d5] outline-none transition placeholder:text-[#686357] focus:border-[#d9bb78]/45 focus:bg-[#141613]"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Result strip */}
//           <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.055] bg-black/[0.12] px-4 py-3 sm:px-5">
//             <p className="text-[10px] text-[#898172]">
//               Showing <span className="font-semibold text-[#e5d5b3]">{sortedAndFilteredTeam.length ? indexOfFirst + 1 : 0}–{Math.min(indexOfLast, sortedAndFilteredTeam.length)}</span> of <span className="font-semibold text-[#e5d5b3]">{sortedAndFilteredTeam.length}</span> members
//             </p>
//             <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9e8a5f]">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.55)]" />
//               Live account data
//             </span>
//           </div>

//           {error && (
//             <div className="m-4 rounded-2xl border border-rose-300/15 bg-rose-400/[0.07] p-4 text-xs text-rose-200 sm:m-5">
//               {error}
//             </div>
//           )}

//           {/* Desktop table */}
//           <div className="hidden overflow-x-auto lg:block">
//             <table className="w-full min-w-[780px] border-collapse text-left">
//               <thead>
//                 <tr className="border-b border-white/[0.07] bg-white/[0.025]">
//                   {[
//                     { label: "No.", key: null, width: "w-20" },
//                     { label: "Joining date", key: "createdAt" },
//                     { label: "Level", key: "level" },
//                     { label: "Member ID", key: "userId" },
//                     { label: "Member name", key: "name" },
//                     { label: "Country", key: "country" },
//                   ].map((column) => (
//                     <th key={column.label} className={`px-5 py-4 text-[9px] font-bold uppercase tracking-[0.17em] text-[#a89465] ${column.width || ""}`}>
//                       <button
//                         type="button"
//                         onClick={() => handleSort(column.key)}
//                         disabled={!column.key}
//                         className={`inline-flex items-center gap-2 ${column.key ? "transition hover:text-[#f0d99e]" : "cursor-default"}`}
//                       >
//                         {column.label}
//                         {column.key && <SortIcon column={column.key} />}
//                       </button>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {isLoading ? (
//                   <tr><td colSpan="6" className="px-5 py-16 text-center text-xs text-[#c9ad70]">
//                     <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-[#d9bb78]/20 border-t-[#e5c783]" />
//                     Loading your team...
//                   </td></tr>
//                 ) : currentItems.length === 0 ? (
//                   <tr><td colSpan="6" className="px-5 py-16 text-center">
//                     <Users size={27} className="mx-auto mb-3 text-[#75694f]" />
//                     <p className="text-sm font-medium text-[#c8bda8]">No team members found</p>
//                     <p className="mt-1 text-[10px] text-[#766f62]">Try another search term.</p>
//                   </td></tr>
//                 ) : currentItems.map((member, index) => (
//                   <tr key={member._id || member.userId || index} className="border-b border-white/[0.045] transition hover:bg-[#d9bb78]/[0.045]">
//                     <td className="px-5 py-4 text-xs tabular-nums text-[#7e786d]">{indexOfFirst + index + 1}</td>
//                     <td className="px-5 py-4 text-xs text-[#b7ae9d]">
//                       <span className="inline-flex items-center gap-2"><CalendarDays size={13} className="text-[#a18a5a]" />{formatDate(member.createdAt)}</span>
//                     </td>
//                     <td className="px-5 py-4">
//                       <span className="inline-flex rounded-lg border border-[#d9bb78]/20 bg-[#d9bb78]/[0.08] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#e4c985]">
//                         LEVEL {member.level}
//                       </span>
//                     </td>
//                     <td className="px-5 py-4 font-mono text-xs font-semibold text-[#f0e5d1]">{member.userId || "—"}</td>
//                     <td className="px-5 py-4 text-xs text-[#c6bdad]">{member.name || "—"}</td>
//                     <td className="px-5 py-4 text-xs text-[#a69d8d]">
//                       <span className="inline-flex items-center gap-2"><Globe2 size={13} className="text-[#82765d]" />{member.country || "—"}</span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile / tablet member cards */}
//           <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:hidden">
//             {isLoading ? (
//               <div className="col-span-full py-14 text-center text-xs text-[#c9ad70]">
//                 <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-[#d9bb78]/20 border-t-[#e5c783]" />
//                 Loading your team...
//               </div>
//             ) : currentItems.length === 0 ? (
//               <div className="col-span-full rounded-2xl border border-white/[0.07] bg-black/[0.12] px-4 py-12 text-center">
//                 <Users size={27} className="mx-auto mb-3 text-[#75694f]" />
//                 <p className="text-sm font-medium text-[#c8bda8]">No team members found</p>
//                 <p className="mt-1 text-[10px] text-[#766f62]">Try another search term.</p>
//               </div>
//             ) : currentItems.map((member, index) => (
//               <article key={member._id || member.userId || index} className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.065),rgba(255,255,255,0.018))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
//                 <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border border-[#d9bb78]/[0.08]" />
//                 <div className="relative flex items-start justify-between gap-3">
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#d9bb78]/20 bg-[#d9bb78]/[0.09] text-[#d9bb78]">
//                       <CircleUserRound size={19} />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-semibold text-[#eee4d2]">{member.name || "Unnamed member"}</p>
//                       <p className="mt-1 truncate font-mono text-[10px] text-[#a18f68]">{member.userId || "—"}</p>
//                     </div>
//                   </div>
//                   <span className="shrink-0 rounded-lg border border-[#d9bb78]/20 bg-[#d9bb78]/[0.08] px-2 py-1 text-[9px] font-bold text-[#e4c985]">
//                     L-{member.level}
//                   </span>
//                 </div>
//                 <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-3">
//                   <div>
//                     <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#766e60]">Joining date</p>
//                     <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#c4b9a5]"><CalendarDays size={12} className="text-[#a18a5a]" />{formatDate(member.createdAt)}</p>
//                   </div>
//                   <div>
//                     <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#766e60]">Country</p>
//                     <p className="mt-1.5 flex items-center gap-1.5 truncate text-[10px] text-[#c4b9a5]"><Globe2 size={12} className="text-[#a18a5a]" />{member.country || "—"}</p>
//                   </div>
//                 </div>
//                 <p className="absolute bottom-3 right-4 text-[8px] tabular-nums text-[#686154]">#{indexOfFirst + index + 1}</p>
//               </article>
//             ))}
//           </div>

//           {/* Pagination */}
//           {!isLoading && sortedAndFilteredTeam.length > 0 && (
//             <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
//               <p className="text-[10px] text-[#8c8374]">
//                 Page <span className="font-semibold text-[#e5d5b3]">{safePage}</span> of <span className="font-semibold text-[#e5d5b3]">{totalPages}</span>
//               </p>
//               <div className="flex items-center justify-between gap-2 sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
//                   disabled={safePage === 1}
//                   className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-[10px] font-semibold text-[#c8bda8] transition hover:border-[#d9bb78]/30 hover:text-[#ecd59e] disabled:cursor-not-allowed disabled:opacity-35"
//                 >
//                   <ChevronLeft size={14} /> Previous
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {pageNumbers.map((page, index) => (
//                     <React.Fragment key={page}>
//                       {index > 0 && page - pageNumbers[index - 1] > 1 && <span className="px-1 text-[10px] text-[#6f685c]">…</span>}
//                       <button
//                         type="button"
//                         onClick={() => setCurrentPage(page)}
//                         className={`h-9 min-w-9 rounded-xl border px-2 text-[10px] font-bold transition ${
//                           safePage === page
//                             ? "border-[#e1c47e]/45 bg-[#d9bb78]/15 text-[#f0d99e] shadow-[0_4px_15px_rgba(190,155,83,0.10)]"
//                             : "border-white/[0.07] bg-white/[0.025] text-[#8f8779] hover:border-[#d9bb78]/25 hover:text-[#e5d5b3]"
//                         }`}
//                       >
//                         {page}
//                       </button>
//                     </React.Fragment>
//                   ))}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
//                   disabled={safePage === totalPages}
//                   className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-[10px] font-semibold text-[#c8bda8] transition hover:border-[#d9bb78]/30 hover:text-[#ecd59e] disabled:cursor-not-allowed disabled:opacity-35"
//                 >
//                   Next <ChevronRight size={14} />
//                 </button>
//               </div>
//             </div>
//           )}
//         </section>

//         <p className="mt-4 text-center text-[8px] font-medium uppercase tracking-[0.2em] text-[#5f594e]">
//           Global Wealth · Team directory
//         </p>
//       </div>
//     </main>
//   );
// };

// export default AllTeamPage;


import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import {
  Users, UserRoundCheck, Search, CalendarDays, Globe2, Hash,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
  Sparkles, RefreshCw, Layers3, ShieldCheck, CircleUserRound
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

const GlassStat = ({ icon: Icon, label, value, detail, accent = "gold" }) => {
  const accentClass = accent === "green"
    ? "text-emerald-300 bg-emerald-300/10 border-emerald-200/15"
    : "text-[#e5c783] bg-[#d9b96e]/10 border-[#d9b96e]/20";

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-[linear-gradient(135deg,rgba(255,255,255,0.085),rgba(255,255,255,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_38px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[#d9bb78]/25">
      <div className="pointer-events-none absolute -right-9 -top-10 h-32 w-32 rounded-full border border-white/[0.045] transition-transform duration-500 group-hover:scale-125" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#958b78]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#f4ead7] tabular-nums">{value}</p>
          <p className="mt-1.5 text-[11px] text-[#81796c]">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${accentClass}`}>
          <Icon size={20} strokeWidth={1.7} />
        </span>
      </div>
    </div>
  );
};

const AllTeamPage = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllTeam = async () => {
    if (!user?.userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(
        `/user/all-team/${user.userId}?t=${new Date().getTime()}`
      );
      // Keep every member returned by the backend; do not hide records by level.
      const teamData = Array.isArray(res.data.team) ? res.data.team : [];
      setTeam(teamData);
    } catch (err) {
      console.error("Error fetching all team:", err);
      setError("We couldn't load your team right now. Please try again.");
      setTeam([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeam();
  }, [user?.userId]);

  const stats = useMemo(() => ({
    totalTeam: team.length,
    activeTeam: team.filter((member) => Number(member.topUpAmount) > 0).length,
  }), [team]);

  const sortedAndFilteredTeam = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = team.filter((member) =>
      String(member.userId || "").toLowerCase().includes(term) ||
      String(member.name || "").toLowerCase().includes(term) ||
      String(member.country || "").toLowerCase().includes(term) ||
      String(member.level ?? "").toLowerCase().includes(term)
    );

    return [...filtered].sort((a, b) => {
      const key = sortConfig.key;
      if (!key) return 0;

      let aValue = a[key] ?? "";
      let bValue = b[key] ?? "";

      if (key === "createdAt") {
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (key === "level") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [team, search, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedAndFilteredTeam.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirst = (safePage - 1) * entriesPerPage;
  const indexOfLast = indexOfFirst + entriesPerPage;
  const currentItems = sortedAndFilteredTeam.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={12} className="opacity-35" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp size={12} className="text-[#f0d99e]" />
      : <ArrowDown size={12} className="text-[#f0d99e]" />;
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((page) => page === 1 || page === totalPages || Math.abs(page - safePage) <= 1);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090a0a] px-3 pb-12 pt-6 font-sans text-[#e9e1d2] sm:px-5 md:px-8 md:pt-9">
      {/* Ambient glass lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#b28b45]/[0.07] blur-[110px]" />
        <div className="absolute -right-40 top-[38%] h-[30rem] w-[30rem] rounded-full bg-[#7f6a42]/[0.055] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8bb7c]/25 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1450px]">
        {/* Intro */}
        <section className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9bb78]/20 bg-[#d9bb78]/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#d8bd80]">
              <Sparkles size={12} />
              Member network
            </div>
            <h1 className="text-[27px] font-semibold tracking-[-0.04em] text-[#f4ead7] sm:text-4xl">
              All Team <span className="font-light text-[#c5a96b]">Overview</span>
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[#918a7c] sm:text-sm">
              Explore your complete team structure, membership levels and joining details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAllTeam}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.045] px-4 text-[11px] font-semibold text-[#cfc4ad] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#d9bb78]/30 hover:bg-[#d9bb78]/[0.08] hover:text-[#f2dfb5] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh report
          </button>
        </section>

        {/* Summary cards */}
        <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <GlassStat
            icon={Users}
            label="Total team members"
            value={stats.totalTeam.toLocaleString("en-IN")}
            detail="Members across all levels"
          />
          <GlassStat
            icon={UserRoundCheck}
            label="Active members"
            value={stats.activeTeam.toLocaleString("en-IN")}
            detail="Members with a top-up amount"
            accent="green"
          />
          <div className="relative hidden overflow-hidden rounded-[24px] border border-[#d9bb78]/15 bg-[linear-gradient(125deg,rgba(183,146,77,0.13),rgba(255,255,255,0.025))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] xl:block">
            <div className="absolute -right-7 -top-12 h-36 w-36 rounded-full border border-[#d9bb78]/10" />
            <div className="relative flex h-full items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d9bb78]/20 bg-[#d9bb78]/10 text-[#dfc486]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b99c62]">Your network</p>
                <p className="mt-1 text-sm font-medium text-[#e9dfca]">One connected community</p>
                <p className="mt-1 text-[10px] text-[#8b8272]">Team information at a glance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main glass panel */}
        <section className="overflow-hidden rounded-[26px] border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.018)_45%,rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 border-b border-white/[0.075] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#d9bb78]/20 bg-[#d9bb78]/[0.09] text-[#dfc486]">
                <Layers3 size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#f0e6d4]">Team directory</h2>
                <p className="mt-0.5 text-[10px] text-[#857d70]">Browse, search and sort your members</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-[10px] text-[#918979]">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-10 rounded-xl border border-white/10 bg-[#111312] px-3 text-xs font-semibold text-[#e1c987] outline-none transition focus:border-[#d9bb78]/50"
                >
                  {[10, 25, 50, 100, 250, 500].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>

              <div className="relative min-w-0 sm:w-[270px]">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c826e]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search ID, name, country, level..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#101211]/85 pl-10 pr-3 text-xs text-[#eee5d5] outline-none transition placeholder:text-[#686357] focus:border-[#d9bb78]/45 focus:bg-[#141613]"
                />
              </div>
            </div>
          </div>

          {/* Result strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.055] bg-black/[0.12] px-4 py-3 sm:px-5">
            <p className="text-[10px] text-[#898172]">
              Showing <span className="font-semibold text-[#e5d5b3]">{sortedAndFilteredTeam.length ? indexOfFirst + 1 : 0}–{Math.min(indexOfLast, sortedAndFilteredTeam.length)}</span> of <span className="font-semibold text-[#e5d5b3]">{sortedAndFilteredTeam.length}</span> members
            </p>
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#9e8a5f]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.55)]" />
              Live account data
            </span>
          </div>

          {error && (
            <div className="m-4 rounded-2xl border border-rose-300/15 bg-rose-400/[0.07] p-4 text-xs text-rose-200 sm:m-5">
              {error}
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.025]">
                  {[
                    { label: "No.", key: null, width: "w-20" },
                    { label: "Joining date", key: "createdAt" },
                    { label: "Level", key: "level" },
                    { label: "Member ID", key: "userId" },
                    { label: "Member name", key: "name" },
                    { label: "Country", key: "country" },
                  ].map((column) => (
                    <th key={column.label} className={`px-5 py-4 text-[9px] font-bold uppercase tracking-[0.17em] text-[#a89465] ${column.width || ""}`}>
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        disabled={!column.key}
                        className={`inline-flex items-center gap-2 ${column.key ? "transition hover:text-[#f0d99e]" : "cursor-default"}`}
                      >
                        {column.label}
                        {column.key && <SortIcon column={column.key} />}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" className="px-5 py-16 text-center text-xs text-[#c9ad70]">
                    <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-[#d9bb78]/20 border-t-[#e5c783]" />
                    Loading your team...
                  </td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan="6" className="px-5 py-16 text-center">
                    <Users size={27} className="mx-auto mb-3 text-[#75694f]" />
                    <p className="text-sm font-medium text-[#c8bda8]">No team members found</p>
                    <p className="mt-1 text-[10px] text-[#766f62]">Try another search term.</p>
                  </td></tr>
                ) : currentItems.map((member, index) => (
                  <tr key={member._id || member.userId || index} className="border-b border-white/[0.045] transition hover:bg-[#d9bb78]/[0.045]">
                    <td className="px-5 py-4 text-xs tabular-nums text-[#7e786d]">{indexOfFirst + index + 1}</td>
                    <td className="px-5 py-4 text-xs text-[#b7ae9d]">
                      <span className="inline-flex items-center gap-2"><CalendarDays size={13} className="text-[#a18a5a]" />{formatDate(member.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-[#d9bb78]/20 bg-[#d9bb78]/[0.08] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#e4c985]">
                        LEVEL {member.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-[#f0e5d1]">{member.userId || "—"}</td>
                    <td className="px-5 py-4 text-xs text-[#c6bdad]">{member.name || "—"}</td>
                    <td className="px-5 py-4 text-xs text-[#a69d8d]">
                      <span className="inline-flex items-center gap-2"><Globe2 size={13} className="text-[#82765d]" />{member.country || "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet member cards */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:hidden">
            {isLoading ? (
              <div className="col-span-full py-14 text-center text-xs text-[#c9ad70]">
                <span className="mx-auto mb-3 block h-7 w-7 animate-spin rounded-full border-2 border-[#d9bb78]/20 border-t-[#e5c783]" />
                Loading your team...
              </div>
            ) : currentItems.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-white/[0.07] bg-black/[0.12] px-4 py-12 text-center">
                <Users size={27} className="mx-auto mb-3 text-[#75694f]" />
                <p className="text-sm font-medium text-[#c8bda8]">No team members found</p>
                <p className="mt-1 text-[10px] text-[#766f62]">Try another search term.</p>
              </div>
            ) : currentItems.map((member, index) => (
              <article key={member._id || member.userId || index} className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.065),rgba(255,255,255,0.018))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
                <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full border border-[#d9bb78]/[0.08]" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#d9bb78]/20 bg-[#d9bb78]/[0.09] text-[#d9bb78]">
                      <CircleUserRound size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#eee4d2]">{member.name || "Unnamed member"}</p>
                      <p className="mt-1 truncate font-mono text-[10px] text-[#a18f68]">{member.userId || "—"}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-[#d9bb78]/20 bg-[#d9bb78]/[0.08] px-2 py-1 text-[9px] font-bold text-[#e4c985]">
                    L-{member.level}
                  </span>
                </div>
                <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-3">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#766e60]">Joining date</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#c4b9a5]"><CalendarDays size={12} className="text-[#a18a5a]" />{formatDate(member.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#766e60]">Country</p>
                    <p className="mt-1.5 flex items-center gap-1.5 truncate text-[10px] text-[#c4b9a5]"><Globe2 size={12} className="text-[#a18a5a]" />{member.country || "—"}</p>
                  </div>
                </div>
                <p className="absolute bottom-3 right-4 text-[8px] tabular-nums text-[#686154]">#{indexOfFirst + index + 1}</p>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {!isLoading && sortedAndFilteredTeam.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[10px] text-[#8c8374]">
                Page <span className="font-semibold text-[#e5d5b3]">{safePage}</span> of <span className="font-semibold text-[#e5d5b3]">{totalPages}</span>
              </p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-[10px] font-semibold text-[#c8bda8] transition hover:border-[#d9bb78]/30 hover:text-[#ecd59e] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, index) => (
                    <React.Fragment key={page}>
                      {index > 0 && page - pageNumbers[index - 1] > 1 && <span className="px-1 text-[10px] text-[#6f685c]">…</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 min-w-9 rounded-xl border px-2 text-[10px] font-bold transition ${
                          safePage === page
                            ? "border-[#e1c47e]/45 bg-[#d9bb78]/15 text-[#f0d99e] shadow-[0_4px_15px_rgba(190,155,83,0.10)]"
                            : "border-white/[0.07] bg-white/[0.025] text-[#8f8779] hover:border-[#d9bb78]/25 hover:text-[#e5d5b3]"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-[10px] font-semibold text-[#c8bda8] transition hover:border-[#d9bb78]/30 hover:text-[#ecd59e] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="mt-4 text-center text-[8px] font-medium uppercase tracking-[0.2em] text-[#5f594e]">
          Global Wealth · Team directory
        </p>
      </div>
    </main>
  );
};

export default AllTeamPage;
