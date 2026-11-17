// import React, { useEffect, useMemo, useState } from "react";
// import api from "../../api/axios";

// const CREDIT_TYPES = ["success", "approved"];

// const money = (value) =>
//   `$${Number(value || 0).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`;

// const dateLabel = (value, withTime = false) => {
//   if (!value) return "Date unavailable";
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return "Date unavailable";
//   return date.toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
//   });
// };

// function UserWithdrawalHistory() {
//   const [withdrawals, setWithdrawals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const storedUser = useMemo(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user") || "null");
//     } catch {
//       return null;
//     }
//   }, []);
//   const userId = Number(storedUser?.userId);
//   const isLeader = String(storedUser?.role || "").toLowerCase() === "leader";

//   useEffect(() => {
//     const fetchWithdrawals = async () => {
//       if (!userId) {
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const res = await api.get(
//           `/wallet/withdrawals/${userId}?t=${new Date().getTime()}`
//         );
//         setWithdrawals(Array.isArray(res.data.withdrawals) ? res.data.withdrawals : []);
//       } catch (error) {
//         console.error("Error fetching withdrawal history:", error);
//         setWithdrawals([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchWithdrawals();
//   }, [userId]);

//   // Preserve the existing 5-second grouping and historical Leader calculation.
//   const grouped = useMemo(() => {
//     const sorted = [...withdrawals].sort(
//       (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//     );
//     const groups = [];
//     const thresholdMs = 5000;
//     const cutoffTime = new Date("2026-07-13T16:00:00+05:30").getTime();

//     for (const item of sorted) {
//       const itemTime = new Date(item.createdAt).getTime();
//       const isNewLogic = itemTime >= cutoffTime;
//       const itemGross = isNewLogic
//         ? Number(item.grossAmount || 0)
//         : Number(item.grossAmount || 0) * 2;
//       const itemCrypto = Number(item.netAmount || 0);
//       const itemTopup = isNewLogic
//         ? itemGross - itemCrypto
//         : Number(item.netAmount || 0);
//       const lastGroup = groups[groups.length - 1];
//       const lastEntryTime = lastGroup
//         ? new Date(lastGroup.entries[lastGroup.entries.length - 1].createdAt).getTime()
//         : 0;

//       if (lastGroup && itemTime - lastEntryTime <= thresholdMs) {
//         lastGroup.entries.push(item);
//         lastGroup.rawGross += itemGross;
//         lastGroup.rawCryptoNet += itemCrypto;
//         lastGroup.rawTopupNet += itemTopup;
//         const status = String(item.status || "").toLowerCase();
//         if (status === "pending") lastGroup.status = "pending";
//         else if (status === "rejected" && lastGroup.status !== "pending") {
//           lastGroup.status = "rejected";
//         }
//       } else {
//         groups.push({
//           _id: item._id,
//           createdAt: item.createdAt,
//           entries: [item],
//           rawGross: itemGross,
//           rawCryptoNet: itemCrypto,
//           rawTopupNet: itemTopup,
//           walletAddress: item.walletAddress,
//           status: item.status || "pending",
//           isNewLogic,
//         });
//       }
//     }

//     groups.forEach((group) => {
//       if (isLeader && !group.isNewLogic) {
//         const roundedGross = Math.floor(group.rawGross / 10) * 10;
//         group.totalGross = roundedGross;
//         group.totalCryptoNet = roundedGross * 0.5;
//         group.totalTopupNet = roundedGross * 0.5;
//       } else {
//         group.totalGross = group.rawGross;
//         group.totalCryptoNet = group.rawCryptoNet;
//         group.totalTopupNet = group.rawTopupNet;
//       }
//     });

//     return groups.sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//   }, [withdrawals, isLeader]);

//   const totalAmount = useMemo(
//     () =>
//       grouped.reduce((sum, group) => {
//         const status = String(group.status || "").toLowerCase();
//         return CREDIT_TYPES.includes(status) ? sum + group.totalGross : sum;
//       }, 0),
//     [grouped]
//   );

//   const filtered = useMemo(() => {
//     const term = search.trim().toLowerCase();
//     return grouped.filter((group) => {
//       const status = String(group.status || "").toLowerCase();
//       const matchesStatus = statusFilter === "all" || status === statusFilter;
//       const searchable = [
//         status,
//         group.totalGross,
//         group.totalCryptoNet,
//         group.totalTopupNet,
//         group.walletAddress,
//         dateLabel(group.createdAt),
//       ]
//         .join(" ")
//         .toLowerCase();
//       return matchesStatus && (!term || searchable.includes(term));
//     });
//   }, [grouped, search, statusFilter]);

//   useEffect(() => setCurrentPage(1), [search, statusFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
//   const page = Math.min(currentPage, totalPages);
//   const startIdx = (page - 1) * itemsPerPage;
//   const pageItems = filtered.slice(startIdx, startIdx + itemsPerPage);

//   const statusAppearance = (status) => {
//     const value = String(status || "unknown").toLowerCase();
//     if (["success", "approved"].includes(value)) {
//       return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
//     }
//     if (value === "pending") {
//       return "border-amber-300/25 bg-amber-300/10 text-amber-200";
//     }
//     if (["rejected", "failed"].includes(value)) {
//       return "border-rose-400/25 bg-rose-400/10 text-rose-300";
//     }
//     return "border-slate-400/20 bg-slate-400/10 text-slate-300";
//   };

//   return (
//     <main className="min-h-screen w-full bg-[#080c13] px-4 pb-12 pt-24 font-sans text-white sm:px-6 lg:px-10">
//       <div className="mx-auto max-w-7xl">
//         {/* Distinct editorial / finance-report layout */}
//         <header className="relative mb-8 overflow-hidden border-b border-white/10 pb-8">
//           <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-300/[0.08] blur-3xl" />
//           <div className="relative grid gap-7 lg:grid-cols-[1fr_310px] lg:items-end">
//             <div>
//               <p className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.34em] text-amber-300">
//                 <span className="h-px w-9 bg-amber-300" />
//                 Global Wealth · Treasury
//               </p>
//               <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
//                 Withdrawal
//                 <span className="block font-light text-slate-400">statement.</span>
//               </h1>
//               <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
//                 Review payout requests, settlement splits and wallet destinations in one chronological statement.
//               </p>
//             </div>
//             <div className="relative border-l-2 border-amber-300 pl-5 lg:pb-1">
//               <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
//                 Successfully withdrawn
//               </p>
//               <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-300">
//                 {money(totalAmount)}
//               </p>
//               <p className="mt-2 text-xs text-slate-500">
//                 Approved and successful requests only
//               </p>
//             </div>
//           </div>
//         </header>

//         {/* Summary strip */}
//         <section className="mb-9 grid grid-cols-2 gap-x-5 gap-y-6 border-b border-white/10 pb-7 md:grid-cols-4">
//           <div>
//             <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Requests</p>
//             <p className="mt-2 text-2xl font-semibold">{grouped.length}</p>
//             <p className="mt-1 text-[11px] text-slate-600">Grouped payout records</p>
//           </div>
//           <div>
//             <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Pending</p>
//             <p className="mt-2 text-2xl font-semibold text-amber-200">
//               {grouped.filter((g) => String(g.status).toLowerCase() === "pending").length}
//             </p>
//             <p className="mt-1 text-[11px] text-slate-600">Awaiting processing</p>
//           </div>
//           <div>
//             <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Rejected</p>
//             <p className="mt-2 text-2xl font-semibold text-rose-300">
//               {grouped.filter((g) => ["rejected", "failed"].includes(String(g.status).toLowerCase())).length}
//             </p>
//             <p className="mt-1 text-[11px] text-slate-600">Unsuccessful requests</p>
//           </div>
//           <div>
//             <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Approved</p>
//             <p className="mt-2 text-2xl font-semibold text-emerald-300">
//               {grouped.filter((g) => ["approved", "success"].includes(String(g.status).toLowerCase())).length}
//             </p>
//             <p className="mt-1 text-[11px] text-slate-600">Completed requests</p>
//           </div>
//         </section>

//         {/* Filter bar */}
//         <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">Payout archive</p>
//             <h2 className="mt-1 text-xl font-semibold">Your withdrawal activity</h2>
//             <p className="mt-1 text-xs text-slate-500">All dates and times are shown in IST.</p>
//           </div>
//           <div className="flex flex-col gap-3 sm:flex-row">
//             <label className="relative block sm:min-w-[270px]">
//               <span className="sr-only">Search withdrawals</span>
//               <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
//               <input
//                 type="search"
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//                 placeholder="Search amount, date, wallet..."
//                 className="w-full rounded-lg border border-white/10 bg-[#101722] py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300/60"
//               />
//             </label>
//             <select
//               value={statusFilter}
//               onChange={(event) => setStatusFilter(event.target.value)}
//               className="rounded-lg border border-white/10 bg-[#101722] px-4 py-3 text-sm font-medium text-amber-200 outline-none focus:border-amber-300/60"
//             >
//               <option value="all">All statuses</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="success">Success</option>
//               <option value="rejected">Rejected</option>
//               <option value="failed">Failed</option>
//             </select>
//           </div>
//         </section>

//         {/* Each payout is presented as a horizontal settlement slip, not a table */}
//         <section className="space-y-3">
//           {loading ? (
//             <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-amber-200">
//               <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
//               Loading withdrawal statement...
//             </div>
//           ) : pageItems.length === 0 ? (
//             <div className="border-y border-white/10 py-20 text-center">
//               <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-xl text-slate-500">↗</div>
//               <p className="font-medium text-slate-300">No withdrawal records found</p>
//               <p className="mt-1 text-sm text-slate-500">Try changing the search or status filter.</p>
//             </div>
//           ) : (
//             pageItems.map((group, index) => (
//               <article
//                 key={group._id || `${startIdx}-${index}`}
//                 className="relative overflow-hidden border border-white/[0.09] bg-[#0d141f] transition hover:border-amber-300/25"
//               >
//                 <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[170px_1fr_190px] lg:items-center">
//                   <div className="flex items-center justify-between gap-3 lg:block">
//                     <div>
//                       <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Payout date</p>
//                       <p className="mt-1 text-sm font-semibold text-white">{dateLabel(group.createdAt)}</p>
//                       <p className="mt-1 text-[11px] text-slate-500">{dateLabel(group.createdAt, true).split(", ").slice(-1)[0]}</p>
//                     </div>
//                     <span className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] lg:mt-3 ${statusAppearance(group.status)}`}>
//                       {group.status || "Unknown"}
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-3 gap-3 border-y border-white/[0.07] py-4 lg:border-x lg:border-y-0 lg:px-5 lg:py-1">
//                     <div>
//                       <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">Total</p>
//                       <p className="mt-2 break-all text-base font-semibold text-white sm:text-lg">{money(group.totalGross)}</p>
//                     </div>
//                     <div className="border-l border-white/[0.08] pl-3">
//                       <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">USDT</p>
//                       <p className="mt-2 break-all text-base font-semibold text-amber-200 sm:text-lg">{money(group.totalCryptoNet)}</p>
//                     </div>
//                     <div className="border-l border-white/[0.08] pl-3">
//                       <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">TopUp</p>
//                       <p className="mt-2 break-all text-base font-semibold text-violet-300 sm:text-lg">{money(group.totalTopupNet)}</p>
//                     </div>
//                   </div>

//                   <div className="min-w-0">
//                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Destination wallet</p>
//                     <p className="mt-2 break-all font-mono text-[11px] leading-5 text-slate-300">
//                       {group.walletAddress || "Not provided"}
//                     </p>
//                     {group.entries.length > 1 && (
//                       <p className="mt-2 text-[10px] text-slate-500">
//                         Combined {group.entries.length} requests within 5 seconds
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="h-px w-full bg-gradient-to-r from-amber-300/50 via-white/[0.06] to-transparent" />
//               </article>
//             ))
//           )}
//         </section>

//         {/* Pagination */}
//         {!loading && filtered.length > 0 && (
//           <footer className="mt-6 flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
//             <p>
//               Showing <span className="font-semibold text-white">{startIdx + 1}–{Math.min(startIdx + itemsPerPage, filtered.length)}</span> of{" "}
//               <span className="font-semibold text-white">{filtered.length}</span> records
//             </p>
//             <div className="flex items-center gap-2 self-end sm:self-auto">
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
//                 disabled={page === 1}
//                 className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
//               >
//                 Previous
//               </button>
//               <span className="min-w-[70px] text-center text-slate-300">{page} / {totalPages}</span>
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
//                 disabled={page >= totalPages}
//                 className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
//               >
//                 Next
//               </button>
//             </div>
//           </footer>
//         )}
//       </div>
//     </main>
//   );
// }

// export default UserWithdrawalHistory;



import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const CREDIT_TYPES = ["success", "approved"];

const money = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateLabel = (value, withTime = false) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {}),
  });
};

function UserWithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  // IMPORTANT: User ID string rakhein.
  // Number() use karne se GW5977060 jaise IDs NaN ban jaate hain.
  const userId = String(storedUser?.userId || "").trim();

  const isLeader =
    String(storedUser?.role || "").toLowerCase() === "leader";

  // Fetch withdrawal history
  useEffect(() => {
    let isMounted = true;

    const fetchWithdrawals = async () => {
      if (!userId) {
        console.error(
          "Withdrawal history: User ID not found in localStorage",
          storedUser
        );

        if (isMounted) {
          setWithdrawals([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setLoading(true);

        const res = await api.get(
          `/wallet/withdrawals/${encodeURIComponent(userId)}?t=${Date.now()}`
        );

        console.log("Withdrawal history API response:", res.data);

        // Backend response expected: { withdrawals: [...] }
        const records = Array.isArray(res.data?.withdrawals)
          ? res.data.withdrawals
          : [];

        if (isMounted) {
          setWithdrawals(records);
        }
      } catch (error) {
        console.error(
          "Error fetching withdrawal history:",
          error.response?.data || error.message || error
        );

        if (isMounted) {
          setWithdrawals([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWithdrawals();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Preserve existing 5-second grouping and historical Leader calculation.
  const grouped = useMemo(() => {
    const sorted = [...withdrawals].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );

    const groups = [];
    const thresholdMs = 5000;
    const cutoffTime = new Date(
      "2026-07-13T16:00:00+05:30"
    ).getTime();

    for (const item of sorted) {
      const itemTime = new Date(item.createdAt).getTime();
      const isNewLogic = itemTime >= cutoffTime;

      const itemGross = isNewLogic
        ? Number(item.grossAmount || 0)
        : Number(item.grossAmount || 0) * 2;

      const itemCrypto = Number(item.netAmount || 0);

      const itemTopup = isNewLogic
        ? itemGross - itemCrypto
        : Number(item.netAmount || 0);

      const lastGroup = groups[groups.length - 1];

      const lastEntryTime = lastGroup
        ? new Date(
            lastGroup.entries[lastGroup.entries.length - 1].createdAt
          ).getTime()
        : 0;

      if (
        lastGroup &&
        itemTime - lastEntryTime <= thresholdMs
      ) {
        lastGroup.entries.push(item);
        lastGroup.rawGross += itemGross;
        lastGroup.rawCryptoNet += itemCrypto;
        lastGroup.rawTopupNet += itemTopup;

        const status = String(item.status || "").toLowerCase();

        if (status === "pending") {
          lastGroup.status = "pending";
        } else if (
          status === "rejected" &&
          lastGroup.status !== "pending"
        ) {
          lastGroup.status = "rejected";
        }
      } else {
        groups.push({
          _id: item._id,
          createdAt: item.createdAt,
          entries: [item],
          rawGross: itemGross,
          rawCryptoNet: itemCrypto,
          rawTopupNet: itemTopup,
          walletAddress: item.walletAddress,
          status: item.status || "pending",
          isNewLogic,
        });
      }
    }

    groups.forEach((group) => {
      if (isLeader && !group.isNewLogic) {
        const roundedGross = Math.floor(group.rawGross / 10) * 10;

        group.totalGross = roundedGross;
      } else {
        group.totalGross = group.rawGross;
      }

      // Deduct 10% withdrawal fee from the displayed gross withdrawal amount.
      group.withdrawalFee = group.totalGross * 0.10;
      group.totalNet = group.totalGross - group.withdrawalFee;
    });

    return groups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [withdrawals, isLeader]);

  const totalAmount = useMemo(
    () =>
      grouped.reduce((sum, group) => {
        const status = String(group.status || "").toLowerCase();

        return CREDIT_TYPES.includes(status)
          ? sum + group.totalNet
          : sum;
      }, 0),
    [grouped]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return grouped.filter((group) => {
      const status = String(group.status || "").toLowerCase();

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const searchable = [
        status,
        group.totalGross,
        group.totalCryptoNet,
        group.totalTopupNet,
        group.walletAddress,
        dateLabel(group.createdAt),
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [grouped, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / itemsPerPage)
  );

  const page = Math.min(currentPage, totalPages);
  const startIdx = (page - 1) * itemsPerPage;

  const pageItems = filtered.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const statusAppearance = (status) => {
    const value = String(status || "unknown").toLowerCase();

    if (["success", "approved"].includes(value)) {
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    }

    if (value === "pending") {
      return "border-amber-300/25 bg-amber-300/10 text-amber-200";
    }

    if (["rejected", "failed"].includes(value)) {
      return "border-rose-400/25 bg-rose-400/10 text-rose-300";
    }

    return "border-slate-400/20 bg-slate-400/10 text-slate-300";
  };

  return (
    <main className="min-h-screen w-full bg-[#080c13] px-4 pb-12 pt-24 font-sans text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="relative mb-8 overflow-hidden border-b border-white/10 pb-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-300/[0.08] blur-3xl" />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_310px] lg:items-end">
            <div>
              <p className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.34em] text-amber-300">
                <span className="h-px w-9 bg-amber-300" />
                Global Wealth · Treasury
              </p>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Withdrawal
                <span className="block font-light text-slate-400">
                  statement.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
                Review payout requests, settlement splits and wallet
                destinations in one chronological statement.
              </p>
            </div>

            <div className="relative border-l-2 border-amber-300 pl-5 lg:pb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Successfully withdrawn
              </p>

              <p className="mt-2 text-4xl font-semibold tracking-tight text-emerald-300">
                {money(totalAmount)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Approved and successful requests only
              </p>
            </div>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-9 grid grid-cols-2 gap-x-5 gap-y-6 border-b border-white/10 pb-7 md:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Requests
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {grouped.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Grouped payout records
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Pending
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-200">
              {grouped.filter(
                (g) => String(g.status).toLowerCase() === "pending"
              ).length}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Awaiting processing
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Rejected
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">
              {grouped.filter((g) =>
                ["rejected", "failed"].includes(
                  String(g.status).toLowerCase()
                )
              ).length}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Unsuccessful requests
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Approved
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {grouped.filter((g) =>
                ["approved", "success"].includes(
                  String(g.status).toLowerCase()
                )
              ).length}
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              Completed requests
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
              Payout archive
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Your withdrawal activity
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              All dates and times are shown in IST.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block sm:min-w-[270px]">
              <span className="sr-only">Search withdrawals</span>

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search amount, date, wallet..."
                className="w-full rounded-lg border border-white/10 bg-[#101722] py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300/60"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#101722] px-4 py-3 text-sm font-medium text-amber-200 outline-none focus:border-amber-300/60"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="success">Success</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </section>

        {/* Withdrawal records */}
        <section className="space-y-3">
          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-amber-200">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
              Loading withdrawal statement...
            </div>
          ) : pageItems.length === 0 ? (
            <div className="border-y border-white/10 py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-xl text-slate-500">
                ↗
              </div>

              <p className="font-medium text-slate-300">
                No withdrawal records found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing the search or status filter.
              </p>
            </div>
          ) : (
            pageItems.map((group, index) => (
              <article
                key={group._id || `${startIdx}-${index}`}
                className="relative overflow-hidden border border-white/[0.09] bg-[#0d141f] transition hover:border-amber-300/25"
              >
                <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[170px_1fr_190px] lg:items-center">

                  {/* Date and status */}
                  <div className="flex items-center justify-between gap-3 lg:block">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                        Payout date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {dateLabel(group.createdAt)}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        {dateLabel(group.createdAt, true)
                          .split(", ")
                          .slice(-1)[0]}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] lg:mt-3 ${statusAppearance(
                        group.status
                      )}`}
                    >
                      {group.status || "Unknown"}
                    </span>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-3 border-y border-white/[0.07] py-4 lg:border-x lg:border-y-0 lg:px-5 lg:py-1">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        Withdrawal Amount
                      </p>

                      <p className="mt-2 break-all text-base font-semibold text-white sm:text-lg">
                        {money(group.totalGross)}
                      </p>
                    </div>

                    <div className="border-l border-white/[0.08] pl-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        10% Fee
                      </p>

                      <p className="mt-2 break-all text-base font-semibold text-rose-300 sm:text-lg">
                        -{money(group.withdrawalFee)}
                      </p>
                    </div>

                    <div className="border-l border-white/[0.08] pl-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                        You Receive
                      </p>

                      <p className="mt-2 break-all text-base font-semibold text-emerald-300 sm:text-lg">
                        {money(group.totalNet)}
                      </p>
                    </div>
                  </div>

                  {/* Wallet */}
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      Destination wallet
                    </p>

                    <p className="mt-2 break-all font-mono text-[11px] leading-5 text-slate-300">
                      {group.walletAddress || "Not provided"}
                    </p>

                    {group.entries.length > 1 && (
                      <p className="mt-2 text-[10px] text-slate-500">
                        Combined {group.entries.length} requests within 5 seconds
                      </p>
                    )}
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-amber-300/50 via-white/[0.06] to-transparent" />
              </article>
            ))
          )}
        </section>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <footer className="mt-6 flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-semibold text-white">
                {startIdx + 1}–
                {Math.min(startIdx + itemsPerPage, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {filtered.length}
              </span>{" "}
              records
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((value) => Math.max(1, value - 1))
                }
                disabled={page === 1}
                className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              <span className="min-w-[70px] text-center text-slate-300">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((value) =>
                    Math.min(totalPages, value + 1)
                  )
                }
                disabled={page >= totalPages}
                className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}

export default UserWithdrawalHistory;
