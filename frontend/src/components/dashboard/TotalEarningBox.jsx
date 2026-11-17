// import React, { useEffect, useMemo, useState } from "react";
// import api from "../../api/axios";
// import {
//   X,
//   Pencil,
//   TrendingUp,
//   Wallet,
//   RotateCcw,
//   Check,
//   Users,
//   Network,
//   Layers,
//   Activity,
//   Sparkles ,
//   Coins,
//   BriefcaseBusiness,
// } from "lucide-react";

// const getAmount = (...values) => {
//   for (const value of values) {
//     if (value === undefined || value === null || value === "") continue;
//     const raw =
//       typeof value === "object" && value.$numberDecimal !== undefined
//         ? value.$numberDecimal
//         : value;
//     const number = Number(raw);
//     if (Number.isFinite(number)) return number;
//   }
//   return 0;
// };

// const formatAmount = (value) => getAmount(value).toFixed(2);

// const TotalEarningBox = ({ user }) => {
//   const userId = user?.userId;
//   const isPromo = user?.role === "promo";

//   const [myTopupDisplay, setMyTopupDisplay] = useState(0);
//   const [promoEarning, setPromoEarning] = useState(() =>
//     userId ? localStorage.getItem(`promo_earning_${userId}`) : null
//   );
//   const [promoTopup, setPromoTopup] = useState(() =>
//     userId ? localStorage.getItem(`promo_topup_${userId}`) : null
//   );

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editType, setEditType] = useState("");
//   const [editValue, setEditValue] = useState("");

//   // Current income-wallet balances (available balances).
//   const currentIncome = useMemo(
//     () => ({
//       direct: getAmount(user?.directIncome, user?.directEarning),
//       level: getAmount(user?.levelIncome),
//       levelRoi: getAmount(user?.levelRoiIncome),
//       roi: getAmount(user?.roiIncome, user?.packageRoiIncome),
//       autoCompound: getAmount(user?.autoCompoundIncome),
//     }),
//     [user]
//   );

//   // Lifetime totals. Use the explicit total field where available, otherwise
//   // fall back to its current wallet field. Do not add current + lifetime values.
//   const lifetimeIncome = useMemo(
//     () => ({
//       direct: getAmount(user?.totalDirectIncome, user?.directIncome, user?.directEarning),
//       level: getAmount(user?.totalLevelIncome, user?.levelIncome),
//       levelRoi: getAmount(user?.totalLevelRoiIncome, user?.levelRoiIncome),
//       roi: getAmount(user?.totalRoiIncome, user?.roiIncome, user?.packageRoiIncome),
//       autoCompound: getAmount(user?.totalAutoCompoundIncome, user?.autoCompoundIncome),
//       reward: getAmount(user?.totalRewardIncome, user?.rewardIncome),
//       fastTrack: getAmount(user?.totalFastTrackIncome, user?.fastTrackIncome),
//       royalty: getAmount(
//         user?.totalRoyaltyPoolIncome,
//         user?.royaltyPoolIncome,
//         user?.poolIncome
//       ),
//       salary: getAmount(user?.salaryTotalIncome),
//     }),
//     [user]
//   );

//   const calculatedTotal = Object.values(lifetimeIncome).reduce(
//     (sum, amount) => sum + amount,
//     0
//   );

//   // Prefer the component's full breakdown so newly added income types are not
//   // omitted by an older/stale totalEarnings field on the profile object.
//   const totalEarningDisplay = formatAmount(calculatedTotal);

//   useEffect(() => {
//     let cancelled = false;

//     const fetchTotalTopup = async () => {
//       if (!userId) {
//         setMyTopupDisplay(0);
//         return;
//       }

//       try {
//         const res = await api.get(
//           `/wallet/topup-history/${encodeURIComponent(userId)}?t=${Date.now()}`
//         );
//         if (!Array.isArray(res.data)) return;

//         const currentUserId = String(userId);
//         const uniqueTopups = new Map();

//         res.data.forEach((transaction) => {
//           const typeStr = String(transaction.type || "").toLowerCase();
//           const sourceStr = String(transaction.source || "").toLowerCase();
//           const descStr = String(transaction.description || "").toLowerCase();

//           const isTopupRelated =
//             typeStr.includes("topup") ||
//             sourceStr.includes("topup") ||
//             typeStr.includes("activation") ||
//             typeStr.includes("package");

//           if (
//             !isTopupRelated ||
//             descStr.includes("promotion") ||
//             typeStr.includes("compound") ||
//             descStr.includes("compound")
//           ) {
//             return;
//           }

//           const receiverId = transaction.toUserId
//             ? String(transaction.toUserId)
//             : String(transaction.userId || "");

//           if (receiverId !== currentUserId) return;

//           const date = new Date(transaction.createdAt || transaction.date);
//           const ageDays = (Date.now() - date.getTime()) / 86400000;
//           if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > 25) return;

//           const key =
//             transaction._id ||
//             `${receiverId}-${date.toISOString()}-${getAmount(
//               transaction.amount,
//               transaction.grossAmount
//             )}`;
//           uniqueTopups.set(
//             key,
//             Math.abs(getAmount(transaction.amount, transaction.grossAmount))
//           );
//         });

//         const total = [...uniqueTopups.values()].reduce((sum, amount) => sum + amount, 0);
//         if (!cancelled) setMyTopupDisplay(total);
//       } catch (error) {
//         console.error("Topup fetch error in TotalEarningBox:", error);
//       }
//     };

//     fetchTotalTopup();
//     return () => {
//       cancelled = true;
//     };
//   }, [userId]);

//   useEffect(() => {
//     setPromoEarning(
//       userId ? localStorage.getItem(`promo_earning_${userId}`) : null
//     );
//     setPromoTopup(
//       userId ? localStorage.getItem(`promo_topup_${userId}`) : null
//     );
//   }, [userId]);

//   const displayEarning =
//     promoEarning !== null ? formatAmount(promoEarning) : totalEarningDisplay;
//   const displayTopup =
//     promoTopup !== null ? formatAmount(promoTopup) : formatAmount(myTopupDisplay);

//   const handleDoubleClick = (type) => {
//     if (!isPromo) return;
//     setEditType(type);
//     setEditValue(type === "earning" ? displayEarning : displayTopup);
//     setIsModalOpen(true);
//   };

//   const handleSavePromo = () => {
//     const numericValue = Number(editValue);
//     if (!userId || !Number.isFinite(numericValue) || numericValue < 0) return;

//     const value = formatAmount(numericValue);
//     if (editType === "earning") {
//       setPromoEarning(value);
//       localStorage.setItem(`promo_earning_${userId}`, value);
//     } else if (editType === "topup") {
//       setPromoTopup(value);
//       localStorage.setItem(`promo_topup_${userId}`, value);
//     }
//     setIsModalOpen(false);
//   };

//   const handleResetPromo = () => {
//     if (!userId) return;
//     if (editType === "earning") {
//       setPromoEarning(null);
//       localStorage.removeItem(`promo_earning_${userId}`);
//     } else if (editType === "topup") {
//       setPromoTopup(null);
//       localStorage.removeItem(`promo_topup_${userId}`);
//     }
//     setIsModalOpen(false);
//   };

//   const cards = [
//     { title: "Direct Income", amount: currentIncome.direct, total: lifetimeIncome.direct, icon: Users, tone: "text-cyan-300", glow: "bg-cyan-400/10", border: "border-cyan-400/20" },
//     { title: "Level Income", amount: currentIncome.level, total: lifetimeIncome.level, icon: Network, tone: "text-blue-300", glow: "bg-blue-400/10", border: "border-blue-400/20" },
//     { title: "Level ROI Income", amount: currentIncome.levelRoi, total: lifetimeIncome.levelRoi, icon: Layers, tone: "text-violet-300", glow: "bg-violet-400/10", border: "border-violet-400/20" },
//     { title: "Package ROI Income", amount: currentIncome.roi, total: lifetimeIncome.roi, icon: Activity, tone: "text-emerald-300", glow: "bg-emerald-400/10", border: "border-emerald-400/20" },
//     { title: "Auto Compound Income", amount: currentIncome.autoCompound, total: lifetimeIncome.autoCompound, icon: Coins, tone: "text-amber-300", glow: "bg-amber-400/10", border: "border-amber-400/20" },
//     { title: "Salary Income", amount: 0, total: lifetimeIncome.salary, icon: BriefcaseBusiness, tone: "text-indigo-300", glow: "bg-indigo-400/10", border: "border-indigo-400/20" },
//   ];

//   return (
//     <>
//       <section className="relative mb-6 overflow-hidden rounded-[2px] border border-[#b99548]/25 bg-[#090d13] text-white shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
//         <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#c7a451]/[0.09] blur-3xl" />
//         <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-2/3 bg-gradient-to-r from-transparent via-[#d8b765]/40 to-transparent" />

//         <div className="relative flex items-center justify-between border-b border-white/[0.07] px-3 py-3 sm:px-4">
//           <div>
//             <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e2c36e]">
//               Income Overview
//             </p>
//             <p className="mt-1 text-[10px] text-slate-500">
//               Current wallet balances and lifetime income totals
//             </p>
//           </div>
//           {isPromo && (
//             <span className="rounded-full border border-[#d3b15d]/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#e2c36e]">
//               Promo edit enabled
//             </span>
//           )}
//         </div>

//         <div className="relative grid grid-cols-2 divide-x divide-white/[0.08]">
//           <button
//             type="button"
//             onDoubleClick={() => handleDoubleClick("earning")}
//             className={`group min-w-0 px-3 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-4 sm:py-5 ${isPromo ? "cursor-pointer" : "cursor-default"}`}
//             aria-label={isPromo ? "Double click to edit Total Income" : "Total Income"}
//           >
//             <div className="mb-3 flex items-center justify-between gap-2">
//               <span className="flex items-center gap-2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
//                 <TrendingUp size={14} className="shrink-0 text-emerald-400" /> Total Income
//               </span>
//               {isPromo && <Pencil size={12} className="text-slate-600 group-hover:text-[#e5c878]" />}
//             </div>
//             <div className="flex items-start gap-1">
//               <span className="mt-1 text-sm font-semibold text-emerald-400 sm:text-base">$</span>
//               <span className="break-all text-[clamp(1.2rem,5vw,2rem)] font-semibold leading-none tracking-[-0.055em] text-white tabular-nums">{displayEarning}</span>
//             </div>
//           </button>

//           <button
//             type="button"
//             onDoubleClick={() => handleDoubleClick("topup")}
//             className={`group min-w-0 px-3 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-4 sm:py-5 ${isPromo ? "cursor-pointer" : "cursor-default"}`}
//             aria-label={isPromo ? "Double click to edit My Investment" : "My Investment"}
//           >
//             <div className="mb-3 flex items-center justify-between gap-2">
//               <span className="flex items-center gap-2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
//                 <Wallet size={14} className="shrink-0 text-[#e2bd62]" /> My Investment
//               </span>
//               {isPromo && <Pencil size={12} className="text-slate-600 group-hover:text-[#e5c878]" />}
//             </div>
//             <div className="flex items-start gap-1">
//               <span className="mt-1 text-sm font-semibold text-[#e2bd62] sm:text-base">$</span>
//               <span className="break-all text-[clamp(1.2rem,5vw,2rem)] font-semibold leading-none tracking-[-0.055em] text-white tabular-nums">{displayTopup}</span>
//             </div>
//           </button>
//         </div>

//         <div className="relative border-t border-white/[0.07] px-3 py-2.5 sm:px-4">
//           <div className="mb-2 flex items-center gap-2">
//             <Sparkles size={13} className="text-[#d8b765]" />
//             <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d8b765]">
//               Income Breakdown
//             </p>
//           </div>
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
//             {cards.map(({ title, amount, total, icon: Icon, tone, glow, border }) => (
//               <div key={title} className={`min-w-0 rounded-xl border ${border} bg-white/[0.025] p-2.5 sm:p-3`}>
//                 <div className="flex items-center gap-1.5">
//                   <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${glow} ${tone}`}>
//                     <Icon size={14} />
//                   </span>
//                   <p className="min-w-0 text-[9px] font-bold uppercase leading-tight tracking-[0.08em] text-slate-400">
//                     {title}
//                   </p>
//                 </div>
//                 <p className="mt-2 break-all text-[13px] font-semibold text-white tabular-nums">
//                   ${formatAmount(amount)}
//                 </p>
//                 <p className="mt-1 text-[8px] text-slate-500 sm:text-[9px]">
//                   Lifetime: <span className={tone}>${formatAmount(total)}</span>
//                 </p>
//               </div>
//             ))}
//           </div>
//           <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d3b15d]/20 bg-[#d3b15d]/[0.05] px-3 py-2.5">
//             <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#d8b765]">
//               Total lifetime income
//             </span>
//             <span className="text-sm font-bold text-white tabular-nums">
//               ${formatAmount(calculatedTotal)}
//             </span>
//           </div>
//         </div>

//         {isPromo && (
//           <div className="border-t border-white/[0.07] px-4 py-2.5 text-center text-[10px] text-slate-500 sm:px-5">
//             Double-click Total Income or My Investment to customise its display
//           </div>
//         )}
//       </section>

//       {isModalOpen && isPromo && (
//         <div
//           className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
//           onMouseDown={(event) => {
//             if (event.target === event.currentTarget) setIsModalOpen(false);
//           }}
//         >
//           <div className="w-full max-w-[390px] overflow-hidden rounded-[22px] border border-[#d3b15d]/30 bg-[#0b1018] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
//             <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
//               <div>
//                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7b65f]">Promo controls</p>
//                 <h2 className="mt-1 text-lg font-semibold text-white">
//                   Edit {editType === "earning" ? "Total Income" : "My Investment"}
//                 </h2>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setIsModalOpen(false)}
//                 className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
//                 aria-label="Close"
//               >
//                 <X size={17} />
//               </button>
//             </div>

//             <div className="p-5">
//               <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
//                 Custom amount (USD)
//               </label>
//               <div className="flex items-center rounded-xl border border-white/10 bg-[#111925] px-4 transition focus-within:border-[#d3b15d]/70">
//                 <span className="mr-2 text-lg font-semibold text-[#d9b960]">$</span>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={editValue}
//                   onChange={(event) => setEditValue(event.target.value)}
//                   className="w-full bg-transparent py-3.5 text-lg font-semibold text-white outline-none placeholder:text-slate-600"
//                   placeholder="0.00"
//                   autoFocus
//                 />
//               </div>
//               <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
//                 This changes the displayed value for this promo user on this browser only.
//               </p>

//               <div className="mt-5 grid grid-cols-2 gap-2.5">
//                 <button
//                   type="button"
//                   onClick={handleResetPromo}
//                   className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3 py-3 text-xs font-bold text-rose-300 transition hover:bg-rose-500/[0.13]"
//                 >
//                   <RotateCcw size={14} /> Reset original
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSavePromo}
//                   disabled={!editValue.trim() || !Number.isFinite(Number(editValue)) || Number(editValue) < 0}
//                   className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c5a04c] to-[#ecd58c] px-3 py-3 text-xs font-extrabold text-[#17130a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
//                 >
//                   <Check size={15} /> Save amount
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default TotalEarningBox;

import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  X,
  Pencil,
  TrendingUp,
  Wallet,
  RotateCcw,
  Check,
  Users,
  Network,
  Layers,
  Activity,
  Sparkles ,
  Coins,
  BriefcaseBusiness,
} from "lucide-react";

const getAmount = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null || value === "") continue;
    const raw =
      typeof value === "object" && value.$numberDecimal !== undefined
        ? value.$numberDecimal
        : value;
    const number = Number(raw);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};

const formatAmount = (value) => getAmount(value).toFixed(2);

const TotalEarningBox = ({ user }) => {
  const userId = user?.userId;
  const isPromo = user?.role === "promo";

  const [myTopupDisplay, setMyTopupDisplay] = useState(0);
  const [promoEarning, setPromoEarning] = useState(() =>
    userId ? localStorage.getItem(`promo_earning_${userId}`) : null
  );
  const [promoTopup, setPromoTopup] = useState(() =>
    userId ? localStorage.getItem(`promo_topup_${userId}`) : null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editType, setEditType] = useState("");
  const [editValue, setEditValue] = useState("");

  // Current income-wallet balances (available balances).
  const currentIncome = useMemo(
    () => ({
      direct: getAmount(user?.directIncome, user?.directEarning),
      level: getAmount(user?.levelIncome),
      levelRoi: getAmount(user?.levelRoiIncome),
      roi: getAmount(user?.roiIncome, user?.packageRoiIncome),
      autoCompound: getAmount(user?.autoCompoundIncome),
    }),
    [user]
  );

  // Lifetime totals. Use the explicit total field where available, otherwise
  // fall back to its current wallet field. Do not add current + lifetime values.
  const lifetimeIncome = useMemo(
    () => ({
      direct: getAmount(user?.totalDirectIncome, user?.directIncome, user?.directEarning),
      level: getAmount(user?.totalLevelIncome, user?.levelIncome),
      levelRoi: getAmount(user?.totalLevelRoiIncome, user?.levelRoiIncome),
      roi: getAmount(user?.totalRoiIncome, user?.roiIncome, user?.packageRoiIncome),
      autoCompound: getAmount(user?.totalAutoCompoundIncome, user?.autoCompoundIncome),
      reward: getAmount(user?.totalRewardIncome, user?.rewardIncome),
      fastTrack: getAmount(user?.totalFastTrackIncome, user?.fastTrackIncome),
      royalty: getAmount(
        user?.totalRoyaltyPoolIncome,
        user?.royaltyPoolIncome,
        user?.poolIncome
      ),
      salary: getAmount(user?.salaryTotalIncome),
    }),
    [user]
  );

  const calculatedTotal = Object.values(lifetimeIncome).reduce(
    (sum, amount) => sum + amount,
    0
  );

  // Prefer the component's full breakdown so newly added income types are not
  // omitted by an older/stale totalEarnings field on the profile object.
  const totalEarningDisplay = formatAmount(calculatedTotal);

  useEffect(() => {
    let cancelled = false;

    const fetchTotalTopup = async () => {
      if (!userId) {
        setMyTopupDisplay(0);
        return;
      }

      try {
        const res = await api.get(
          `/wallet/topup-history/${encodeURIComponent(userId)}?t=${Date.now()}`
        );
        if (!Array.isArray(res.data)) return;

        const currentUserId = String(userId);
        const uniqueTopups = new Map();

        res.data.forEach((transaction) => {
          const typeStr = String(transaction.type || "").toLowerCase();
          const sourceStr = String(transaction.source || "").toLowerCase();
          const descStr = String(transaction.description || "").toLowerCase();

          const isTopupRelated =
            typeStr.includes("topup") ||
            sourceStr.includes("topup") ||
            typeStr.includes("activation") ||
            typeStr.includes("package");

          if (
            !isTopupRelated ||
            descStr.includes("promotion") ||
            typeStr.includes("compound") ||
            descStr.includes("compound")
          ) {
            return;
          }

          const receiverId = transaction.toUserId
            ? String(transaction.toUserId)
            : String(transaction.userId || "");

          if (receiverId !== currentUserId) return;

          const date = new Date(transaction.createdAt || transaction.date);
          const ageDays = (Date.now() - date.getTime()) / 86400000;
          if (!Number.isFinite(ageDays) || ageDays < 0 || ageDays > 25) return;

          const key =
            transaction._id ||
            `${receiverId}-${date.toISOString()}-${getAmount(
              transaction.amount,
              transaction.grossAmount
            )}`;
          uniqueTopups.set(
            key,
            Math.abs(getAmount(transaction.amount, transaction.grossAmount))
          );
        });

        const total = [...uniqueTopups.values()].reduce((sum, amount) => sum + amount, 0);
        if (!cancelled) setMyTopupDisplay(total);
      } catch (error) {
        console.error("Topup fetch error in TotalEarningBox:", error);
      }
    };

    fetchTotalTopup();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    setPromoEarning(
      userId ? localStorage.getItem(`promo_earning_${userId}`) : null
    );
    setPromoTopup(
      userId ? localStorage.getItem(`promo_topup_${userId}`) : null
    );
  }, [userId]);

  const displayEarning =
    promoEarning !== null ? formatAmount(promoEarning) : totalEarningDisplay;
  const displayTopup =
    promoTopup !== null ? formatAmount(promoTopup) : formatAmount(myTopupDisplay);

  const handleDoubleClick = (type) => {
    if (!isPromo) return;
    setEditType(type);
    setEditValue(type === "earning" ? displayEarning : displayTopup);
    setIsModalOpen(true);
  };

  const handleSavePromo = () => {
    const numericValue = Number(editValue);
    if (!userId || !Number.isFinite(numericValue) || numericValue < 0) return;

    const value = formatAmount(numericValue);
    if (editType === "earning") {
      setPromoEarning(value);
      localStorage.setItem(`promo_earning_${userId}`, value);
    } else if (editType === "topup") {
      setPromoTopup(value);
      localStorage.setItem(`promo_topup_${userId}`, value);
    }
    setIsModalOpen(false);
  };

  const handleResetPromo = () => {
    if (!userId) return;
    if (editType === "earning") {
      setPromoEarning(null);
      localStorage.removeItem(`promo_earning_${userId}`);
    } else if (editType === "topup") {
      setPromoTopup(null);
      localStorage.removeItem(`promo_topup_${userId}`);
    }
    setIsModalOpen(false);
  };

  const cards = [
    { title: "Direct Income", amount: currentIncome.direct, total: lifetimeIncome.direct, icon: Users, tone: "text-cyan-300", glow: "bg-cyan-400/10", border: "border-cyan-400/20" },
    { title: "Level Income", amount: currentIncome.level, total: lifetimeIncome.level, icon: Network, tone: "text-blue-300", glow: "bg-blue-400/10", border: "border-blue-400/20" },
    { title: "Level ROI Income", amount: currentIncome.levelRoi, total: lifetimeIncome.levelRoi, icon: Layers, tone: "text-violet-300", glow: "bg-violet-400/10", border: "border-violet-400/20" },
    { title: "Package ROI Income", amount: currentIncome.roi, total: lifetimeIncome.roi, icon: Activity, tone: "text-emerald-300", glow: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { title: "Auto Compound Income", amount: currentIncome.autoCompound, total: lifetimeIncome.autoCompound, icon: Coins, tone: "text-amber-300", glow: "bg-amber-400/10", border: "border-amber-400/20" },
    { title: "Salary Income", amount: 0, total: lifetimeIncome.salary, icon: BriefcaseBusiness, tone: "text-indigo-300", glow: "bg-indigo-400/10", border: "border-indigo-400/20" },
  ];

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-[2px] border border-[#b99548]/25 bg-[#090d13] text-white shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[#c7a451]/[0.09] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-2/3 bg-gradient-to-r from-transparent via-[#d8b765]/40 to-transparent" />

        <div className="relative flex items-center justify-between border-b border-white/[0.07] px-3 py-3 sm:px-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e2c36e]">
              Income Overview
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Current wallet balances and lifetime income totals
            </p>
          </div>
          {isPromo && (
            <span className="rounded-full border border-[#d3b15d]/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#e2c36e]">
              Promo edit enabled
            </span>
          )}
        </div>

        <div className="relative grid grid-cols-2 divide-x divide-white/[0.08]">
          <button
            type="button"
            onDoubleClick={() => handleDoubleClick("earning")}
            className={`group min-w-0 px-3 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-4 sm:py-5 ${isPromo ? "cursor-pointer" : "cursor-default"}`}
            aria-label={isPromo ? "Double click to edit Total Income" : "Total Income"}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
                <TrendingUp size={14} className="shrink-0 text-emerald-400" /> Total Income
              </span>
              {isPromo && <Pencil size={12} className="text-slate-600 group-hover:text-[#e5c878]" />}
            </div>
            <div className="flex items-start gap-1">
              <span className="mt-1 text-sm font-semibold text-emerald-400 sm:text-base">$</span>
              <span className="break-all text-[clamp(1.2rem,5vw,2rem)] font-semibold leading-none tracking-[-0.055em] text-white tabular-nums">{displayEarning}</span>
            </div>
          </button>

          <button
            type="button"
            onDoubleClick={() => handleDoubleClick("topup")}
            className={`group min-w-0 px-3 py-4 text-left transition-colors hover:bg-white/[0.025] sm:px-4 sm:py-5 ${isPromo ? "cursor-pointer" : "cursor-default"}`}
            aria-label={isPromo ? "Double click to edit My Investment" : "My Investment"}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
                <Wallet size={14} className="shrink-0 text-[#e2bd62]" /> My Investment
              </span>
              {isPromo && <Pencil size={12} className="text-slate-600 group-hover:text-[#e5c878]" />}
            </div>
            <div className="flex items-start gap-1">
              <span className="mt-1 text-sm font-semibold text-[#e2bd62] sm:text-base">$</span>
              <span className="break-all text-[clamp(1.2rem,5vw,2rem)] font-semibold leading-none tracking-[-0.055em] text-white tabular-nums">{displayTopup}</span>
            </div>
          </button>
        </div>

        <div className="relative border-t border-white/[0.07] px-3 py-2.5 sm:px-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={13} className="text-[#d8b765]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d8b765]">
              Income Breakdown
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cards.map(({ title, total, icon: Icon, tone, glow, border }) => (
              <div key={title} className={`min-w-0 rounded-xl border ${border} bg-white/[0.025] p-2.5 sm:p-3`}>
                <div className="flex items-center gap-1.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${glow} ${tone}`}>
                    <Icon size={14} />
                  </span>
                  <p className="min-w-0 text-[9px] font-bold uppercase leading-tight tracking-[0.08em] text-slate-400">
                    {title}
                  </p>
                </div>
                <p className="mt-2 break-all text-[13px] font-semibold text-white tabular-nums">
                  ${formatAmount(total)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[#d3b15d]/20 bg-[#d3b15d]/[0.05] px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#d8b765]">
              Total lifetime income
            </span>
            <span className="text-sm font-bold text-white tabular-nums">
              ${formatAmount(calculatedTotal)}
            </span>
          </div>
        </div>

        {isPromo && (
          <div className="border-t border-white/[0.07] px-4 py-2.5 text-center text-[10px] text-slate-500 sm:px-5">
            Double-click Total Income or My Investment to customise its display
          </div>
        )}
      </section>

      {isModalOpen && isPromo && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="w-full max-w-[390px] overflow-hidden rounded-[22px] border border-[#d3b15d]/30 bg-[#0b1018] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7b65f]">Promo controls</p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Edit {editType === "earning" ? "Total Income" : "My Investment"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Custom amount (USD)
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-[#111925] px-4 transition focus-within:border-[#d3b15d]/70">
                <span className="mr-2 text-lg font-semibold text-[#d9b960]">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="w-full bg-transparent py-3.5 text-lg font-semibold text-white outline-none placeholder:text-slate-600"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                This changes the displayed value for this promo user on this browser only.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleResetPromo}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3 py-3 text-xs font-bold text-rose-300 transition hover:bg-rose-500/[0.13]"
                >
                  <RotateCcw size={14} /> Reset original
                </button>
                <button
                  type="button"
                  onClick={handleSavePromo}
                  disabled={!editValue.trim() || !Number.isFinite(Number(editValue)) || Number(editValue) < 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c5a04c] to-[#ecd58c] px-3 py-3 text-xs font-extrabold text-[#17130a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check size={15} /> Save amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TotalEarningBox;
