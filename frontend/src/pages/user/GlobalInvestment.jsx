
// import React, { useCallback, useEffect, useState } from "react";
// import api from "../../api/axios";

// // ==========================================
// // FORMAT HELPERS
// // ==========================================

// const money = (value) =>
//   new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     maximumFractionDigits: 2
//   }).format(Number(value || 0));

// const dateText = (value) => {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return "—";

//   return date.toLocaleDateString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     day: "2-digit",
//     month: "short",
//     year: "numeric"
//   });
// };

// // ==========================================
// // STAT CARD
// // ==========================================

// const StatCard = ({
//   title,
//   value,
//   realValue,
//   demoValue,
//   realCount,
//   demoCount,
//   subtitle
// }) => (
//   <div className="rounded-2xl border border-[#c9a45c]/20 bg-gradient-to-br from-[#201a10] to-[#100e0a] p-5 shadow-lg">

//     <p className="text-xs font-semibold uppercase tracking-widest text-[#bca878]">
//       {title}
//     </p>

//     <h2 className="mt-3 break-words text-2xl font-black text-[#f5d68e] sm:text-3xl">
//       {money(value)}
//     </h2>

//     <div className="mt-5 grid grid-cols-2 gap-3">

    

    

//     </div>

//     <p className="mt-3 text-xs text-gray-500">
//       {subtitle}
//     </p>

//   </div>
// );

// // ==========================================
// // MAIN COMPONENT
// // ==========================================

// export default function GlobalInvestment() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // ==========================================
//   // FETCH DASHBOARD DATA
//   // ==========================================

//   const fetchData = useCallback(async (isInitial = false) => {
//     try {
//       if (isInitial) {
//         setLoading(true);
//       } else {
//         setRefreshing(true);
//       }

//       const response = await api.get(
//         "/dashboard/global-investment",
//         {
//           headers: {
//             Accept: "application/json"
//           }
//         }
//       );

//       const result = response.data;

//       if (!result || !result.success) {
//         throw new Error(
//           result?.message || "Unable to load dashboard"
//         );
//       }

//       setData(result);
//       setError("");
//       setLastUpdated(new Date());

//     } catch (err) {
//       console.error(
//         "[GLOBAL INVESTMENT ERROR]",
//         err.response?.data || err.message
//       );

//       setError(
//         err.response?.data?.message ||
//         err.message ||
//         "Unable to load investment data"
//       );

//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   // ==========================================
//   // AUTO REFRESH EVERY 30 SECONDS
//   // ==========================================

//   useEffect(() => {
//     fetchData(true);

//     const interval = setInterval(() => {
//       fetchData(false);
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [fetchData]);

//   // ==========================================
//   // SUMMARY
//   // ==========================================

//   const summary = data?.summary || {};

//   // ==========================================
//   // COMBINED REAL + DEMO ACTIVITY
//   // Backend packages already contains both.
//   // Do not append demoTransactions again.
//   // ==========================================

//   const combinedActivities = (data?.packages || [])
//     .map((item) => {
//       const isDemo = item.isDemo === true;

//       return {
//         ...item,

//         isDemo,

//         displayId: item.userId || item.memberId || "—",

//         displayName:
//           item.name || (isDemo ? "Demo User" : "Member"),

//         // Keep the existing row design and show the daily package rate.
//         displayPackage: (() => {
//           const packageText = String(
//             item.packageType || item.type || item.planType || ""
//           ).toLowerCase();

//           return packageText.includes("auto") || packageText.includes("compound")
//             ? "Auto Compound 5%/Day"
//             : "Package 3%/Day";
//         })(),

//         displayAmount: Number(
//           item.amount ?? item.packageAmount ?? 0
//         ),

//         displayDate: item.createdAt || item.startDate,

//         displayStatus: isDemo
//           ? "DEMO"
//           : item.status || "Active",

//         displayType: isDemo
//           ? item.type === "demo_topup"
//             ? "DEMO TOPUP"
//             : "DEMO PACKAGE"
//           : "REAL PACKAGE"
//       };
//     })
//     .sort(
//       (a, b) =>
//         new Date(b.displayDate || 0).getTime() -
//         new Date(a.displayDate || 0).getTime()
//     );

//   // ==========================================
//   // PAGINATION: 10 / 20 / 30 ENTRIES
//   // ==========================================

//   const totalPages = Math.max(1, Math.ceil(combinedActivities.length / pageSize));
//   const safePage = Math.min(currentPage, totalPages);
//   const pageStart = (safePage - 1) * pageSize;
//   const paginatedActivities = combinedActivities.slice(
//     pageStart,
//     pageStart + pageSize
//   );

//   // ==========================================
//   // ENTRY COUNTS
//   // ==========================================

//   const realCount = Number(
//     summary.normalActiveCount || 0
//   ) + Number(
//     summary.autoCompoundActiveCount || 0
//   );

//   const demoCount = Number(
//     summary.demoPackageCount || 0
//   );

//   const realTodayCount = realCount >= 0
//     ? Number(summary.todayPackageCount || 0) -
//       Number(summary.demoTodayCount || 0)
//     : 0;

//   const demoTodayCount = Number(
//     summary.demoTodayCount || 0
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [pageSize]);

//   // ==========================================
//   // LOADING
//   // ==========================================

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-[#080807] p-8 text-center text-[#e8c77e]">
//         <div>
//           <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#c9a45c]/20 border-t-[#f5d68e]" />

//           Loading Global Investment...
//         </div>
//       </div>
//     );
//   }

//   // ==========================================
//   // MAIN UI
//   // ==========================================

//   return (
//     <div className="min-h-screen bg-[#080807] px-3 py-6 text-white sm:px-6 lg:px-8">

//       <div className="mx-auto max-w-7xl">

//         {/* HEADER */}

//         <div className="mb-7 flex flex-wrap items-center justify-between gap-3">

//           <div>
//             <p className="text-xs font-bold tracking-[0.3em] text-[#c9a45c]">
//               GLOBAL WEALTH
//             </p>

//             <h1 className="mt-2 text-3xl font-black text-[#f5d68e] sm:text-4xl">
//               Global Investment
//             </h1>
 
//           </div>

//           <div className="flex flex-col items-end gap-2">

//             <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
//               <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
//               LIVE DATA · 30 SEC REFRESH
//             </div>

//             <button
//               type="button"
//               onClick={() => fetchData(false)}
//               disabled={refreshing}
//               className="rounded-lg border border-[#c9a45c]/30 px-4 py-2 text-xs font-semibold text-[#f5d68e] transition hover:bg-[#c9a45c]/10 disabled:opacity-50"
//             >
//               {refreshing ? "Refreshing..." : "↻ Refresh Now"}
//             </button>

//             {lastUpdated && (
//               <p className="text-[10px] text-gray-500">
//                 Updated: {dateText(lastUpdated)}
//               </p>
//             )}

//           </div>
//         </div>

//         {/* ERROR */}

//         {error && (
//           <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

//             <span>{error}</span>

//             <button
//               type="button"
//               onClick={() => fetchData(false)}
//               disabled={refreshing}
//               className="font-semibold underline disabled:opacity-50"
//             >
//               Retry
//             </button>

//           </div>
//         )}

//         {/* ==================================
//             TWO SUMMARY BOXES
//         ================================== */}

//         <div className="grid gap-4 lg:grid-cols-2">

//           {/* GLOBAL TOTAL */}

//           <StatCard
//             title="Global Total Investment "
//             value={summary.globalInvestment}
//             realValue={summary.realGlobalInvestment}
//             demoValue={summary.demoGlobalInvestment}
//             realCount={summary.activePackageCount - summary.demoPackageCount}
//             demoCount={summary.demoPackageCount}
//            />

//           {/* TODAY TOTAL */}

//           <StatCard
//             title="Today Investment "
//             value={summary.todayInvestment}
//             realValue={summary.realTodayInvestment}
//             demoValue={summary.demoTodayInvestment}
//             realCount={realTodayCount}
//             demoCount={demoTodayCount}
//            />

//         </div>

//         {/* ==================================
//             COMBINED ACTIVITY TABLE
//         ================================== */}

//         <div className="mt-8 overflow-hidden rounded-2xl border border-[#c9a45c]/20 bg-[#11100d]">

//           <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">

//             <div>
           
//               <p className="mt-1 text-xs text-gray-400">
//                 package entries
//               </p>
//             </div>

//             <span className="rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 px-3 py-1 text-xs font-bold text-[#f5d68e]">
//               {combinedActivities.length} ENTRIES
//             </span>

//           </div>

//           {combinedActivities.length === 0 ? (

//             <p className="p-8 text-center text-sm text-gray-500">
//               No activity entries found.
//             </p>

//           ) : (

//             <div className="overflow-x-auto">

//               <table className="w-full min-w-[760px] text-left text-xs">

//                 <thead className="bg-white/[0.04] text-xs uppercase text-gray-400">

//                   <tr>
//                                         <th className="whitespace-nowrap px-2 py-2">S.No.</th>

//                     <th className="whitespace-nowrap px-2 py-2">Date</th>
//                     <th className="p-4">Member ID</th>
//                     <th className="p-4">Member Name</th>
//                     <th className="p-4">Package Type</th>
//                     <th className="p-4">Package Amount</th>
//                     <th className="p-4">Date</th>
                
//                   </tr>

//                 </thead>

//                 <tbody>

//                   {paginatedActivities.map((item, index) => (



//                     <tr
//                       key={`${item.isDemo ? "demo" : "real"}-${item._id || index}`}
//                       className={`border-t border-white/[0.06] transition hover:bg-white/[0.03] ${
//                         item.isDemo
//                           ? "bg-amber-500/[0.025]"
//                           : ""
//                       }`}
//                     >
                        
//                       <td className="px-2 py-2 font-semibold text-[#c9a45c]">
//                         {pageStart + index + 1}
//                       </td>

//                       <td className="whitespace-nowrap px-2 py-2 text-gray-400">
//                         {dateText(item.displayDate)}
//                       </td>


//                       <td className="px-2 py-2 font-bold text-gray-200">
//                         {item.displayId}
//                       </td>

//                       <td className="px-2 py-2 text-gray-300">
//                         {item.displayName}
//                       </td>

//                       <td className="px-2 py-2 text-[#d9bd7b]">
//                         {item.displayPackage}
//                       </td>

//                       <td className="px-2 py-2 font-bold text-white">
//                         {money(item.displayAmount)}
//                       </td>



//                     </tr>

//                   ))}

//                 </tbody>

//               </table>

//             </div>

//           )}

//           <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
//             <p className="text-[11px] text-gray-500">
//               Showing {combinedActivities.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, combinedActivities.length)} of {combinedActivities.length}
//             </p>

//             <div className="flex flex-wrap items-center gap-2">
//               <label className="flex items-center gap-1 text-[11px] text-gray-400">
//                 Entries
//                 <select
//                   value={pageSize}
//                   onChange={(e) => setPageSize(Number(e.target.value))}
//                   className="rounded-md border border-[#c9a45c]/30 bg-[#17140f] px-2 py-1 text-xs text-[#f5d68e] outline-none"
//                 >
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={30}>30</option>
//                 </select>
//               </label>

//               <button
//                 type="button"
//                 onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
//                 disabled={safePage === 1}
//                 className="rounded-md border border-[#c9a45c]/30 px-2.5 py-1 text-xs text-[#f5d68e] disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Previous
//               </button>

//               <span className="min-w-[64px] text-center text-[11px] text-gray-400">
//                 {safePage} / {totalPages}
//               </span>

//               <button
//                 type="button"
//                 onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
//                 disabled={safePage >= totalPages}
//                 className="rounded-md border border-[#c9a45c]/30 px-2.5 py-1 text-xs text-[#f5d68e] disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           </div>

//         </div>

  

//       </div>

//     </div>
//   );
// }


import React, { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

// ==========================================
// FORMAT HELPERS
// ==========================================

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(Number(value || 0));

const dateText = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({
  title,
  value,
  realValue,
  demoValue,
  realCount,
  demoCount,
  subtitle
}) => (
  <div className="min-w-0 rounded-2xl border border-[#c9a45c]/20 bg-gradient-to-br from-[#201a10] to-[#100e0a] p-3 shadow-lg sm:p-5">

    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#bca878] sm:text-xs">
      {title}
    </p>

    <h2 className="mt-2 break-words text-xl font-black leading-tight text-[#f5d68e] sm:mt-3 sm:text-3xl">
      {money(value)}
    </h2>

    <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">





    </div>

    <p className="mt-2 text-[10px] text-gray-500 sm:mt-3 sm:text-xs">
      {subtitle}
    </p>

  </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function GlobalInvestment() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get(
        "/dashboard/global-investment",
        {
          headers: {
            Accept: "application/json"
          }
        }
      );

      const result = response.data;

      if (!result || !result.success) {
        throw new Error(
          result?.message || "Unable to load dashboard"
        );
      }

      setData(result);
      setError("");
      setLastUpdated(new Date());

    } catch (err) {
      console.error(
        "[GLOBAL INVESTMENT ERROR]",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load investment data"
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================
  // AUTO REFRESH EVERY 30 SECONDS
  // ==========================================

  useEffect(() => {
    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const summary = data?.summary || {};

  // ==========================================
  // COMBINED REAL + DEMO ACTIVITY
  // Backend packages already contains both.
  // Do not append demoTransactions again.
  // ==========================================

  const combinedActivities = (data?.packages || [])
    .map((item) => {
      const isDemo = item.isDemo === true;

      return {
        ...item,

        isDemo,

        displayId: item.userId || item.memberId || "—",

        displayName:
          item.name || (isDemo ? "Demo User" : "Member"),

        // Keep the existing row design and show the daily package rate.
        displayPackage: (() => {
          const packageText = String(
            item.packageType || item.type || item.planType || ""
          ).toLowerCase();

          return packageText.includes("auto") || packageText.includes("compound")
            ? "Auto Compound 5%/Day"
            : "Package 3%/Day";
        })(),

        displayAmount: Number(
          item.amount ?? item.packageAmount ?? 0
        ),

        displayDate: item.createdAt || item.startDate,

        displayStatus: isDemo
          ? "DEMO"
          : item.status || "Active",

        displayType: isDemo
          ? item.type === "demo_topup"
            ? "DEMO TOPUP"
            : "DEMO PACKAGE"
          : "REAL PACKAGE"
      };
    })
    .sort(
      (a, b) =>
        new Date(b.displayDate || 0).getTime() -
        new Date(a.displayDate || 0).getTime()
    );

  // ==========================================
  // PAGINATION: 10 / 20 / 30 ENTRIES
  // ==========================================

  const totalPages = Math.max(1, Math.ceil(combinedActivities.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedActivities = combinedActivities.slice(
    pageStart,
    pageStart + pageSize
  );

  // ==========================================
  // ENTRY COUNTS
  // ==========================================

  const realCount = Number(
    summary.normalActiveCount || 0
  ) + Number(
    summary.autoCompoundActiveCount || 0
  );

  const demoCount = Number(
    summary.demoPackageCount || 0
  );

  const realTodayCount = realCount >= 0
    ? Number(summary.todayPackageCount || 0) -
      Number(summary.demoTodayCount || 0)
    : 0;

  const demoTodayCount = Number(
    summary.demoTodayCount || 0
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080807] p-8 text-center text-[#e8c77e]">
        <div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#c9a45c]/20 border-t-[#f5d68e]" />

          Loading Global Investment...
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#080807] px-3 py-6 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">

          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-[#c9a45c]">
              GLOBAL WEALTH
            </p>

            <h1 className="mt-2 text-3xl font-black text-[#f5d68e] sm:text-4xl">
              Global Investment
            </h1>
 
          </div>

         
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchData(false)}
              disabled={refreshing}
              className="font-semibold underline disabled:opacity-50"
            >
              Retry
            </button>

          </div>
        )}

        {/* ==================================
            TWO SUMMARY BOXES
        ================================== */}

        <div className="grid gap-4 lg:grid-cols-2">

          {/* GLOBAL TOTAL */}

          <StatCard
            title="Global Total Investment "
            value={summary.globalInvestment}
            realValue={summary.realGlobalInvestment}
            demoValue={summary.demoGlobalInvestment}
            realCount={summary.activePackageCount - summary.demoPackageCount}
            demoCount={summary.demoPackageCount}
           />

          {/* TODAY TOTAL */}

          <StatCard
            title="Today Investment "
            value={summary.todayInvestment}
            realValue={summary.realTodayInvestment}
            demoValue={summary.demoTodayInvestment}
            realCount={realTodayCount}
            demoCount={demoTodayCount}
           />

        </div>

        {/* ==================================
            COMBINED ACTIVITY TABLE
        ================================== */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#c9a45c]/20 bg-[#11100d]">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">

            <div>
           
              <p className="mt-1 text-xs text-gray-400">
                package entries
              </p>
            </div>

            <span className="rounded-full border border-[#c9a45c]/30 bg-[#c9a45c]/10 px-3 py-1 text-xs font-bold text-[#f5d68e]">
              {combinedActivities.length} ENTRIES
            </span>

          </div>

          {combinedActivities.length === 0 ? (

            <p className="p-8 text-center text-sm text-gray-500">
              No activity entries found.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[760px] text-left text-xs">

                <thead className="bg-white/[0.04] text-xs uppercase text-gray-400">

                  <tr>
                                        <th className="whitespace-nowrap px-2 py-2">S.No.</th>

                    <th className="whitespace-nowrap px-2 py-2">Date</th>
                    <th className="p-4">Member ID</th>
                    <th className="p-4">Member Name</th>
                    <th className="p-4">Package Type</th>
                    <th className="p-4">Package Amount</th>
                 
                  </tr>

                </thead>

                <tbody>

                  {paginatedActivities.map((item, index) => (



                    <tr
                      key={`${item.isDemo ? "demo" : "real"}-${item._id || index}`}
                      className={`border-t border-white/[0.06] transition hover:bg-white/[0.03] ${
                        item.isDemo
                          ? "bg-amber-500/[0.025]"
                          : ""
                      }`}
                    >
                        
                      <td className="px-2 py-2 font-semibold text-[#c9a45c]">
                        {pageStart + index + 1}
                      </td>

                      <td className="whitespace-nowrap px-2 py-2 text-gray-400">
                        {dateText(item.displayDate)}
                      </td>


                      <td className="px-2 py-2 font-bold text-gray-200">
                        {item.displayId}
                      </td>

                      <td className="px-2 py-2 text-gray-300">
                        {item.displayName}
                      </td>

                      <td className="px-2 py-2 text-[#d9bd7b]">
                        {item.displayPackage}
                      </td>

                      <td className="px-2 py-2 font-bold text-white">
                        {money(item.displayAmount)}
                      </td>



                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
            <p className="text-[11px] text-gray-500">
              Showing {combinedActivities.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + pageSize, combinedActivities.length)} of {combinedActivities.length}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-gray-400">
                Entries
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-md border border-[#c9a45c]/30 bg-[#17140f] px-2 py-1 text-xs text-[#f5d68e] outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1}
                className="rounded-md border border-[#c9a45c]/30 px-2.5 py-1 text-xs text-[#f5d68e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="min-w-[64px] text-center text-[11px] text-gray-400">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safePage >= totalPages}
                className="rounded-md border border-[#c9a45c]/30 px-2.5 py-1 text-xs text-[#f5d68e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

        </div>

  

      </div>

    </div>
  );
}

