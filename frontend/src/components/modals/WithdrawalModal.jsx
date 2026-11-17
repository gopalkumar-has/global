 



//  import React, { useEffect, useMemo, useState } from "react";
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";
// import Swal from "sweetalert2";

// import {
//   X,
//   Eye,
//   EyeOff,
//   Zap,
//   Users,
//   RefreshCcw,
//   ShieldCheck,
//   Wallet,
//   ArrowUpRight,
//   LockKeyhole,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   Copy,
// } from "lucide-react";

// // FORMAT AMOUNT
// const formatExact = (value) => {
//   const number = Number(value);
//   return Number.isFinite(number) ? number.toFixed(4) : "0.0000";
// };

// // INCOME BOX
// const IncomeBox = ({
//   title,
//   icon: Icon,
//   color,
//   earned,
//   value,
//   onChange,
//   disabled,
// }) => {
//   const available = Math.max(0, Number(earned) || 0);

//   return (
//     <div
//       className="overflow-hidden rounded-2xl border p-4 transition-all duration-300"
//       style={{
//         backgroundColor: "#080808",
//         borderColor: `${color}45`,
//       }}
//     >
//       <div className="flex items-center justify-between gap-3">
//         <div className="flex min-w-0 flex-1 items-center gap-3">
//           <div
//             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
//             style={{
//               backgroundColor: `${color}12`,
//               borderColor: `${color}40`,
//               color,
//             }}
//           >
//             <Icon size={20} />
//           </div>

//           <div className="min-w-0">
//             <h3 className="text-xs font-extrabold tracking-wider text-white">
//               {title}
//             </h3>

//             <p className="mt-1 text-[10px] leading-relaxed text-gray-400">
//               Available to withdraw{" "}
//               <span className="font-bold text-emerald-400">
//                 ${formatExact(available)}
//               </span>
//             </p>
//           </div>
//         </div>

//         <div className="w-[145px] shrink-0 sm:w-[175px]">
//           <div className="mb-1 flex items-center justify-between">
//             <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
//               Amount
//             </span>

//             <button
//               type="button"
//               disabled={disabled || available <= 0}
//               onClick={() => onChange(formatExact(available))}
//               className="rounded-md border border-[#d4af37]/40 bg-[#d4af37]/10 px-2.5 py-1 text-[9px] font-black tracking-wider text-[#e4c568] transition hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               MAX
//             </button>
//           </div>

//           <div
//             className="flex items-center rounded-lg border px-2"
//             style={{
//               backgroundColor: "#000000",
//               borderColor: `${color}50`,
//             }}
//           >
//             <span
//               className="mr-1 text-sm font-bold"
//               style={{ color }}
//             >
//               $
//             </span>

//             <input
//               type="number"
//               min="0"
//               max={available}
//               step="0.0001"
//               value={value}
//               disabled={disabled}
//               onChange={(e) => onChange(e.target.value)}
//               placeholder="0.0000"
//               aria-label={`${title} withdrawal amount`}
//               className="w-full min-w-0 bg-transparent py-2.5 text-right text-xs font-bold text-white outline-none placeholder:text-gray-600 disabled:opacity-50"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // MAIN WITHDRAWAL MODAL
// const WithdrawalModal = ({ onClose }) => {
//   const { user, token } = useAuth();

//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);

//   const [walletData, setWalletData] = useState({
//     directIncome: 0,
//     levelIncome: 0,
//     levelRoiIncome: 0,
//     roiIncome: 0,
//     balance: 0,
//     totalWithdrawn: 0,
//     walletAddress: user?.walletAddress || null,
//   });

//   const [directAmount, setDirectAmount] = useState("");
//   const [levelAmount, setLevelAmount] = useState("");
//   const [levelRoiAmount, setLevelRoiAmount] = useState("");
//   const [roiAmount, setRoiAmount] = useState("");

//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [inlineMessage, setInlineMessage] = useState("");
//   const [isError, setIsError] = useState(false);

//   // TOTAL WITHDRAWAL
//   const totalSelection = useMemo(() => {
//     return (
//       (Number(directAmount) || 0) +
//       (Number(levelAmount) || 0) +
//       (Number(levelRoiAmount) || 0) +
//       (Number(roiAmount) || 0)
//     );
//   }, [directAmount, levelAmount, levelRoiAmount, roiAmount]);

//   // FETCH WALLET DATA
//   const fetchWalletData = async () => {
//     try {
//       setFetching(true);

//       const res = await api.get("/wallet/info", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setWalletData({
//         directIncome: Number(res.data.directIncome) || 0,
//         levelIncome: Number(res.data.levelIncome) || 0,
//         levelRoiIncome: Number(res.data.levelRoiIncome) || 0,
//         roiIncome: Number(res.data.roiIncome) || 0,
//         balance: Number(res.data.availableBalance) || 0,
//         totalWithdrawn: Number(res.data.totalWithdrawn) || 0,
//         walletAddress:
//           res.data.walletAddress || user?.walletAddress || null,
//       });
//     } catch (error) {
//       console.error("Wallet fetch error:", error);

//       setInlineMessage(
//         error.response?.data?.message ||
//           "Unable to load wallet information. Please try again."
//       );

//       setIsError(true);
//     } finally {
//       setFetching(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchWalletData();
//     } else {
//       setFetching(false);
//     }
//   }, [token]);

//   // AMOUNT INPUT HANDLER
//   const handleAmountChange = (setter, value) => {
//     if (value === "" || /^\d*\.?\d{0,4}$/.test(value)) {
//       setter(value);
//       setInlineMessage("");
//       setIsError(false);
//     }
//   };

//   // COPY WALLET ADDRESS
//   const handleCopyAddress = async () => {
//     if (!walletData.walletAddress) return;

//     try {
//       await navigator.clipboard.writeText(walletData.walletAddress);

//       Swal.fire({
//         toast: true,
//         position: "top",
//         icon: "success",
//         title: "Wallet address copied",
//         showConfirmButton: false,
//         timer: 1800,
//         background: "#080808",
//         color: "#ffffff",
//       });
//     } catch (error) {
//       console.error("Copy address error:", error);

//       Swal.fire({
//         icon: "error",
//         title: "Copy failed",
//         text: "Please copy the address manually.",
//         background: "#080808",
//         color: "#ffffff",
//       });
//     }
//   };

//   // WITHDRAW SUBMISSION
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (loading || fetching) return;

//     if (!token) {
//       setInlineMessage("Your session has expired. Please login again.");
//       setIsError(true);
//       return;
//     }

//     if (!walletData.walletAddress) {
//       setInlineMessage(
//         "Please add your USDT BEP-20 wallet address in your profile."
//       );
//       setIsError(true);
//       return;
//     }

//     const direct = Number(directAmount) || 0;
//     const level = Number(levelAmount) || 0;
//     const levelRoi = Number(levelRoiAmount) || 0;
//     const roi = Number(roiAmount) || 0;

//     const total = direct + level + levelRoi + roi;

//     // VALIDATE AMOUNTS
//     if (
//       !Number.isFinite(direct) ||
//       !Number.isFinite(level) ||
//       !Number.isFinite(levelRoi) ||
//       !Number.isFinite(roi) ||
//       direct < 0 ||
//       level < 0 ||
//       levelRoi < 0 ||
//       roi < 0
//     ) {
//       setInlineMessage("Please enter valid withdrawal amounts.");
//       setIsError(true);
//       return;
//     }

//     // VALIDATE INDIVIDUAL INCOME BALANCES
//     if (direct > walletData.directIncome) {
//       setInlineMessage(
//         `Direct income available is only $${formatExact(walletData.directIncome)}.`
//       );
//       setIsError(true);
//       return;
//     }

//     if (level > walletData.levelIncome) {
//       setInlineMessage(
//         `Level income available is only $${formatExact(walletData.levelIncome)}.`
//       );
//       setIsError(true);
//       return;
//     }

//     if (levelRoi > walletData.levelRoiIncome) {
//       setInlineMessage(
//         `Level ROI income available is only $${formatExact(walletData.levelRoiIncome)}.`
//       );
//       setIsError(true);
//       return;
//     }

//     if (roi > walletData.roiIncome) {
//       setInlineMessage(
//         `ROI income available is only $${formatExact(walletData.roiIncome)}.`
//       );
//       setIsError(true);
//       return;
//     }

//     // MINIMUM WITHDRAWAL
//     if (total < 2) {
//       setInlineMessage("Minimum total withdrawal amount is $2.");
//       setIsError(true);
//       return;
//     }

//     // TOTAL BALANCE VALIDATION
//     if (total > walletData.balance) {
//       setInlineMessage(
//         `Insufficient total balance. Available: $${formatExact(walletData.balance)}`
//       );
//       setIsError(true);
//       return;
//     }

//     // TRANSACTION PASSWORD
//     if (!transactionPassword.trim()) {
//       setInlineMessage("Please enter your transaction password.");
//       setIsError(true);
//       return;
//     }

//     setLoading(true);
//     setInlineMessage("");
//     setIsError(false);

//     try {
//       const response = await api.post(
//         "/wallet/withdraw",
//         {
//           amount: total,
//           transactionPassword,
//           details: {
//             direct: directAmount || "0",
//             level: levelAmount || "0",
//             levelRoi: levelRoiAmount || "0",
//             roi: roiAmount || "0",
//           },
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.data?.success) {
//         throw new Error(
//           response.data?.message || "Withdrawal request failed."
//         );
//       }

//       await Swal.fire({
//         icon: "success",
//         title: "Request Submitted!",
//         text:
//           response.data.message ||
//           "Your withdrawal request has been submitted successfully.",
//         background: "#080808",
//         color: "#ffffff",
//         confirmButtonColor: "#d4af37",
//         confirmButtonText: "Continue",
//       });

//       onClose();
//     } catch (error) {
//       console.error("Withdrawal error:", error);

//       const errorMsg =
//         error.response?.data?.message ||
//         error.message ||
//         "Something went wrong. Please try again.";

//       setInlineMessage(errorMsg);
//       setIsError(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // UI
//   return (
//     <div
//       className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/95 p-0 backdrop-blur-sm sm:items-center sm:p-4"
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget && !loading) onClose();
//       }}
//     >
//       <div className="flex max-h-[95vh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[25px] border border-[#d4af37]/25 bg-black shadow-[0_0_50px_rgba(212,175,55,0.08)] sm:max-h-[92vh] sm:rounded-[25px]">
//         {/* HEADER */}
//         <div className="flex pt-24 shrink-0 items-center justify-between border-b border-[#d4af37]/20 bg-black px-5 py-4">
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e4c568]">
//               <Wallet size={21} />
//             </div>

//             <div>
//               <h2 className="text-base font-black tracking-wide text-white">
//                 WITHDRAW FUNDS
//               </h2>

//               <p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-gray-500">
//                 SECURE WITHDRAWAL CENTER
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             disabled={loading}
//             className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-40"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="flex min-h-0 flex-1 flex-col"
//         >
//           <div className="flex-1 space-y-5 overflow-y-auto bg-black px-4 py-5 sm:px-5">
//             {/* AVAILABLE BALANCE */}
//             <div className="rounded-2xl border border-[#d4af37]/40 bg-[#080808] p-5">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Wallet size={16} className="text-[#e4c568]" />
//                   <p className="text-[10px] font-extrabold tracking-widest text-gray-400">
//                     AVAILABLE BALANCE
//                   </p>
//                 </div>

//                 <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">
//                   AVAILABLE
//                 </span>
//               </div>

//               <p className="mt-4 text-3xl font-black tracking-tight text-white">
//                 <span className="text-[#d4af37]">$</span>
//                 {fetching ? "------" : formatExact(walletData.balance)}
//               </p>

//               <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
//                 <span className="text-[10px] text-gray-500">
//                   Total Withdrawn
//                 </span>

//                 <span className="text-xs font-bold text-gray-300">
//                   ${formatExact(walletData.totalWithdrawn)}
//                 </span>
//               </div>
//             </div>

//             {/* WALLET ADDRESS */}
//             <div className="rounded-2xl border border-white/15 bg-[#080808] p-4">
//               <div className="mb-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <ShieldCheck size={17} className="text-[#e4c568]" />
//                   <h3 className="text-[10px] font-extrabold tracking-wider text-gray-300">
//                     USDT BEP-20 ADDRESS
//                   </h3>
//                 </div>

//                 {walletData.walletAddress ? (
//                   <CheckCircle2 size={17} className="text-emerald-400" />
//                 ) : (
//                   <AlertCircle size={17} className="text-red-400" />
//                 )}
//               </div>

//               {walletData.walletAddress ? (
//                 <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black p-3">
//                   <p className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-gray-300">
//                     {walletData.walletAddress}
//                   </p>

//                   <button
//                     type="button"
//                     onClick={handleCopyAddress}
//                     className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/20 text-[#e4c568] hover:bg-[#d4af37]/10"
//                     title="Copy address"
//                   >
//                     <Copy size={14} />
//                   </button>
//                 </div>
//               ) : (
//                 <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">
//                   Wallet address not found. Please update it in your profile.
//                 </p>
//               )}
//             </div>

//             {/* INCOME SECTION */}
//             <div>
//               <div className="mb-3">
//                 <h3 className="text-xs font-black tracking-widest text-white">
//                   SELECT INCOME
//                 </h3>

//                 <p className="mt-1 text-[10px] text-gray-500">
//                   Select withdrawal amount from each income source.
//                 </p>
//               </div>

//               <div className="space-y-3">
//                 <IncomeBox
//                   title="DIRECT INCOME"
//                   icon={Zap}
//                   color="#e4c568"
//                   earned={walletData.directIncome}
//                   value={directAmount}
//                   onChange={(value) =>
//                     handleAmountChange(setDirectAmount, value)
//                   }
//                   disabled={loading || fetching}
//                 />

//                 <IncomeBox
//                   title="LEVEL INCOME"
//                   icon={Users}
//                   color="#60a5fa"
//                   earned={walletData.levelIncome}
//                   value={levelAmount}
//                   onChange={(value) =>
//                     handleAmountChange(setLevelAmount, value)
//                   }
//                   disabled={loading || fetching}
//                 />

//                 <IncomeBox
//                   title="LEVEL ROI INCOME"
//                   icon={Users}
//                   color="#34d399"
//                   earned={walletData.levelRoiIncome}
//                   value={levelRoiAmount}
//                   onChange={(value) =>
//                     handleAmountChange(setLevelRoiAmount, value)
//                   }
//                   disabled={loading || fetching}
//                 />

//                 <IncomeBox
//                   title="ROI INCOME"
//                   icon={RefreshCcw}
//                   color="#c084fc"
//                   earned={walletData.roiIncome}
//                   value={roiAmount}
//                   onChange={(value) =>
//                     handleAmountChange(setRoiAmount, value)
//                   }
//                   disabled={loading || fetching}
//                 />
//               </div>
//             </div>

//             {/* TOTAL WITHDRAWAL */}
//             <div className="rounded-2xl border border-[#d4af37]/40 bg-[#080808] p-4">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <p className="text-[10px] font-extrabold tracking-widest text-gray-400">
//                     TOTAL WITHDRAWAL
//                   </p>

//                   <p className="mt-1 text-[10px] text-gray-600">
//                     Combined selected amount
//                   </p>
//                 </div>

//                 <p className="text-2xl font-black text-[#e4c568]">
//                   ${formatExact(totalSelection)}
//                 </p>
//               </div>

//               <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
//                 <div
//                   className="h-full rounded-full bg-gradient-to-r from-[#b58a2a] to-[#f2d989] transition-all"
//                   style={{
//                     width: `${
//                       walletData.balance > 0
//                         ? Math.min(
//                             (totalSelection / walletData.balance) * 100,
//                             100
//                           )
//                         : 0
//                     }%`,
//                   }}
//                 />
//               </div>

//               <div className="mt-2 flex justify-between text-[9px] text-gray-500">
//                 <span>Selected: ${formatExact(totalSelection)}</span>
//                 <span>Available: ${formatExact(walletData.balance)}</span>
//               </div>
//             </div>

//             {/* TRANSACTION PASSWORD */}
//             <div className="rounded-2xl border border-white/15 bg-[#080808] p-4">
//               <div className="mb-3 flex items-center gap-2">
//                 <LockKeyhole size={16} className="text-[#e4c568]" />

//                 <label className="text-[10px] font-extrabold tracking-wider text-gray-300">
//                   TRANSACTION PASSWORD
//                 </label>
//               </div>

//               <div className="flex items-center rounded-xl border border-white/15 bg-black px-3 focus-within:border-[#d4af37]/60">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={transactionPassword}
//                   onChange={(e) => {
//                     setTransactionPassword(e.target.value);
//                     setInlineMessage("");
//                     setIsError(false);
//                   }}
//                   placeholder="Enter Transaction Password"
//                   autoComplete="current-password"
//                   disabled={loading}
//                   className="w-full bg-transparent py-3.5 text-sm font-semibold text-white outline-none placeholder:text-gray-700"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="ml-2 text-gray-500 hover:text-[#e4c568]"
//                 >
//                   {showPassword ? (
//                     <EyeOff size={18} />
//                   ) : (
//                     <Eye size={18} />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* ERROR MESSAGE */}
//             {inlineMessage && (
//               <div
//                 className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${
//                   isError
//                     ? "border-red-500/30 bg-red-500/5 text-red-300"
//                     : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
//                 }`}
//               >
//                 <AlertCircle size={16} className="mt-0.5 shrink-0" />
//                 <p>{inlineMessage}</p>
//               </div>
//             )}

//             {/* WITHDRAWAL INFORMATION */}
//             <div className="rounded-2xl border border-white/10 bg-[#080808] p-4">
//               <div className="mb-3 flex items-center gap-2">
//                 <Clock size={16} className="text-[#e4c568]" />

//                 <h3 className="text-[10px] font-extrabold tracking-widest text-gray-300">
//                   WITHDRAWAL INFORMATION
//                 </h3>
//               </div>

//               <div className="space-y-3 text-[10px]">
//                 <div className="flex justify-between gap-3">
//                   <span className="text-gray-500">Minimum Withdrawal</span>
//                   <span className="font-bold text-white">$2.00</span>
//                 </div>

//                 <div className="flex justify-between gap-3">
//                   <span className="text-gray-500">Application Timing</span>
//                   <span className="font-bold text-white">
//                     09:00 AM – 12:00 PM
//                   </span>
//                 </div>

//                 <div className="flex justify-between gap-3">
//                   <span className="text-gray-500">Daily Withdrawal Limit</span>
//                   <span className="text-right font-bold text-[#e4c568]">
//                     $ amount
//                   </span>
//                 </div>

           

//                 <div className="flex justify-between gap-3">
//                   <span className="text-gray-500">Withdrawal Fee</span>
//                   <span className="font-bold text-emerald-400">10%</span>
//                 </div>

               
//               </div>
//             </div>
//           </div>

//           {/* STICKY FOOTER */}
//           <div className="shrink-0 border-t border-[#d4af37]/20 bg-black p-4">
//             <button
//               type="submit"
//               disabled={
//                 loading ||
//                 fetching ||
//                 !walletData.walletAddress ||
//                 !transactionPassword.trim()
//               }
//               className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#f1d889]/40 bg-gradient-to-r from-[#b58a2a] via-[#e4c568] to-[#b58a2a] px-4 py-4 text-xs font-black tracking-[0.15em] text-black shadow-[0_0_20px_rgba(212,175,55,0.12)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={17} className="animate-spin" />
//                   PROCESSING REQUEST...
//                 </>
//               ) : fetching ? (
//                 <>
//                   <Loader2 size={17} className="animate-spin" />
//                   LOADING WALLET...
//                 </>
//               ) : (
//                 <>
//                   <ArrowUpRight size={17} />
//                   WITHDRAW NOW
//                 </>
//               )}
//             </button>

           
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default WithdrawalModal;









 import React, { useEffect, useMemo, useState } from "react";

import api from "../../api/axios";

import { useAuth } from "../../context/AuthContext";

import Swal from "sweetalert2";



import {

  X,

  Eye,

  EyeOff,

  Zap,

  Users,

  RefreshCcw,

  ShieldCheck,

  Wallet,

  ArrowUpRight,

  LockKeyhole,

  Clock,

  CheckCircle2,

  AlertCircle,

  Loader2,

  Copy,

} from "lucide-react";



// FORMAT AMOUNT

const formatExact = (value) => {

  const number = Number(value);

  return Number.isFinite(number) ? number.toFixed(4) : "0.0000";

};



// INCOME BOX

const IncomeBox = ({

  title,

  icon: Icon,

  color,

  earned,

  value,

  onChange,

  disabled,

}) => {

  const available = Math.max(0, Number(earned) || 0);



  return (

    <div

      className="overflow-hidden rounded-2xl border p-4 transition-all duration-300"

      style={{

        backgroundColor: "#080808",

        borderColor: `${color}45`,

      }}

    >

      <div className="flex items-center justify-between gap-3">

        <div className="flex min-w-0 flex-1 items-center gap-3">

          <div

            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"

            style={{

              backgroundColor: `${color}12`,

              borderColor: `${color}40`,

              color,

            }}

          >

            <Icon size={20} />

          </div>



          <div className="min-w-0">

            <h3 className="text-xs font-extrabold tracking-wider text-white">

              {title}

            </h3>



            <p className="mt-1 text-[10px] leading-relaxed text-gray-400">

              Available to withdraw{" "}

              <span className="font-bold text-emerald-400">

                ${formatExact(available)}

              </span>

            </p>

          </div>

        </div>



        <div className="w-[145px] shrink-0 sm:w-[175px]">

          <div className="mb-1 flex items-center justify-between">

            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">

              Amount

            </span>



            <button

              type="button"

              disabled={disabled || available <= 0}

              onClick={() => onChange(formatExact(available))}

              className="rounded-md border border-[#d4af37]/40 bg-[#d4af37]/10 px-2.5 py-1 text-[9px] font-black tracking-wider text-[#e4c568] transition hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-40"

            >

              MAX

            </button>

          </div>



          <div

            className="flex items-center rounded-lg border px-2"

            style={{

              backgroundColor: "#000000",

              borderColor: `${color}50`,

            }}

          >

            <span

              className="mr-1 text-sm font-bold"

              style={{ color }}

            >

              $

            </span>



            <input

              type="number"

              min="0"

              max={available}

              step="0.0001"

              value={value}

              disabled={disabled}

              onChange={(e) => onChange(e.target.value)}

              placeholder="0.0000"

              aria-label={`${title} withdrawal amount`}

              className="w-full min-w-0 bg-transparent py-2.5 text-right text-xs font-bold text-white outline-none placeholder:text-gray-600 disabled:opacity-50"

            />

          </div>

        </div>

      </div>

    </div>

  );

};



// MAIN WITHDRAWAL MODAL

const WithdrawalModal = ({ onClose }) => {

  const { user, token } = useAuth();



  const [loading, setLoading] = useState(false);

  const [fetching, setFetching] = useState(true);



  const [walletData, setWalletData] = useState({

    directIncome: 0,

    levelIncome: 0,

    levelRoiIncome: 0,

    roiIncome: 0,

    balance: 0,

    totalWithdrawn: 0,

    walletAddress: user?.walletAddress || null,

  });



  const [directAmount, setDirectAmount] = useState("");

  const [levelAmount, setLevelAmount] = useState("");

  const [levelRoiAmount, setLevelRoiAmount] = useState("");

  const [roiAmount, setRoiAmount] = useState("");



  const [transactionPassword, setTransactionPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);



  const [inlineMessage, setInlineMessage] = useState("");

  const [isError, setIsError] = useState(false);



  // TOTAL WITHDRAWAL

  const totalSelection = useMemo(() => {

    return (

      (Number(directAmount) || 0) +

      (Number(levelAmount) || 0) +

      (Number(levelRoiAmount) || 0) +

      (Number(roiAmount) || 0)

    );

  }, [directAmount, levelAmount, levelRoiAmount, roiAmount]);



  // FETCH WALLET DATA

  const fetchWalletData = async () => {

    try {

      setFetching(true);



      const res = await api.get("/wallet/info", {

        headers: {

          Authorization: `Bearer ${token}`,

        },

      });



      setWalletData({

        directIncome: Number(res.data.directIncome) || 0,

        levelIncome: Number(res.data.levelIncome) || 0,

        levelRoiIncome: Number(res.data.levelRoiIncome) || 0,

        roiIncome: Number(res.data.roiIncome) || 0,

        balance: Number(res.data.availableBalance) || 0,

        totalWithdrawn: Number(res.data.totalWithdrawn) || 0,

        walletAddress:

          res.data.walletAddress || user?.walletAddress || null,

      });

    } catch (error) {

      console.error("Wallet fetch error:", error);



      setInlineMessage(

        error.response?.data?.message ||

          "Unable to load wallet information. Please try again."

      );



      setIsError(true);

    } finally {

      setFetching(false);

    }

  };



  useEffect(() => {

    if (token) {

      fetchWalletData();

    } else {

      setFetching(false);

    }

  }, [token]);



  // AMOUNT INPUT HANDLER

  const handleAmountChange = (setter, value) => {

    if (value === "" || /^\d*\.?\d{0,4}$/.test(value)) {

      setter(value);

      setInlineMessage("");

      setIsError(false);

    }

  };



  // COPY WALLET ADDRESS

  const handleCopyAddress = async () => {

    if (!walletData.walletAddress) return;



    try {

      await navigator.clipboard.writeText(walletData.walletAddress);



      Swal.fire({

        toast: true,

        position: "top",

        icon: "success",

        title: "Wallet address copied",

        showConfirmButton: false,

        timer: 1800,

        background: "#080808",

        color: "#ffffff",

      });

    } catch (error) {

      console.error("Copy address error:", error);



      Swal.fire({

        icon: "error",

        title: "Copy failed",

        text: "Please copy the address manually.",

        background: "#080808",

        color: "#ffffff",

      });

    }

  };



  // WITHDRAW SUBMISSION

  const handleSubmit = async (e) => {

    e.preventDefault();



    if (loading || fetching) return;



    if (!token) {

      setInlineMessage("Your session has expired. Please login again.");

      setIsError(true);

      return;

    }



    if (!walletData.walletAddress) {

      setInlineMessage(

        "Please add your USDT BEP-20 wallet address in your profile."

      );

      setIsError(true);

      return;

    }



    const direct = Number(directAmount) || 0;

    const level = Number(levelAmount) || 0;

    const levelRoi = Number(levelRoiAmount) || 0;

    const roi = Number(roiAmount) || 0;



    const total = direct + level + levelRoi + roi;



    // VALIDATE AMOUNTS

    if (

      !Number.isFinite(direct) ||

      !Number.isFinite(level) ||

      !Number.isFinite(levelRoi) ||

      !Number.isFinite(roi) ||

      direct < 0 ||

      level < 0 ||

      levelRoi < 0 ||

      roi < 0

    ) {

      setInlineMessage("Please enter valid withdrawal amounts.");

      setIsError(true);

      return;

    }



    // VALIDATE INDIVIDUAL INCOME BALANCES

    if (direct > walletData.directIncome) {

      setInlineMessage(

        `Direct income available is only $${formatExact(walletData.directIncome)}.`

      );

      setIsError(true);

      return;

    }



    if (level > walletData.levelIncome) {

      setInlineMessage(

        `Level income available is only $${formatExact(walletData.levelIncome)}.`

      );

      setIsError(true);

      return;

    }



    if (levelRoi > walletData.levelRoiIncome) {

      setInlineMessage(

        `Level ROI income available is only $${formatExact(walletData.levelRoiIncome)}.`

      );

      setIsError(true);

      return;

    }



    if (roi > walletData.roiIncome) {

      setInlineMessage(

        `ROI income available is only $${formatExact(walletData.roiIncome)}.`

      );

      setIsError(true);

      return;

    }



    // MINIMUM WITHDRAWAL

    if (total < 2) {

      setInlineMessage("Minimum total withdrawal amount is $2.");

      setIsError(true);

      return;

    }



    // TOTAL BALANCE VALIDATION

    if (total > walletData.balance) {

      setInlineMessage(

        `Insufficient total balance. Available: $${formatExact(walletData.balance)}`

      );

      setIsError(true);

      return;

    }



    // TRANSACTION PASSWORD

    if (!transactionPassword.trim()) {

      setInlineMessage("Please enter your transaction password.");

      setIsError(true);

      return;

    }



    setLoading(true);

    setInlineMessage("");

    setIsError(false);



    try {

      const response = await api.post(

        "/wallet/withdraw",

        {

          amount: total,

          transactionPassword,

          details: {

            direct: directAmount || "0",

            level: levelAmount || "0",

            levelRoi: levelRoiAmount || "0",

            roi: roiAmount || "0",

          },

        },

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      if (!response.data?.success) {

        throw new Error(

          response.data?.message || "Withdrawal request failed."

        );

      }



      await Swal.fire({
        // No success icon: show a neutral request-submitted confirmation.
        title: "Withdrawal Request Submitted",
        text:
          response.data.message ||
          "Your withdrawal request has been submitted for processing.",
        background: "#080808",
        color: "#ffffff",
        confirmButtonColor: "#d4af37",
        confirmButtonText: "Continue",
      });



      onClose();

    } catch (error) {

      console.error("Withdrawal error:", error);



      const errorMsg =

        error.response?.data?.message ||

        error.message ||

        "Something went wrong. Please try again.";



      setInlineMessage(errorMsg);

      setIsError(true);

    } finally {

      setLoading(false);

    }

  };



  // UI

  return (

    <div

      className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/95 p-0 backdrop-blur-sm sm:items-center sm:p-4"

      onMouseDown={(e) => {

        if (e.target === e.currentTarget && !loading) onClose();

      }}

    >

      <div className="flex max-h-[95vh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-[25px] border border-[#d4af37]/25 bg-black shadow-[0_0_50px_rgba(212,175,55,0.08)] sm:max-h-[92vh] sm:rounded-[25px]">

        {/* HEADER */}

        <div className="flex pt-24 shrink-0 items-center justify-between border-b border-[#d4af37]/20 bg-black px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#e4c568]">

              <Wallet size={21} />

            </div>



            <div>

              <h2 className="text-base font-black tracking-wide text-white">

                WITHDRAW FUNDS

              </h2>



              <p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-gray-500">

                SECURE WITHDRAWAL CENTER

              </p>

            </div>

          </div>



          <button

            type="button"

            onClick={onClose}

            disabled={loading}

            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-40"

          >

            <X size={19} />

          </button>

        </div>



        <form

          onSubmit={handleSubmit}

          className="flex min-h-0 flex-1 flex-col"

        >

          <div className="flex-1 space-y-5 overflow-y-auto bg-black px-4 py-5 sm:px-5">

            {/* AVAILABLE BALANCE */}

            <div className="rounded-2xl border border-[#d4af37]/40 bg-[#080808] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Wallet size={16} className="text-[#e4c568]" />

                  <p className="text-[10px] font-extrabold tracking-widest text-gray-400">

                    AVAILABLE BALANCE

                  </p>

                </div>



                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">

                  AVAILABLE

                </span>

              </div>



              <p className="mt-4 text-3xl font-black tracking-tight text-white">

                <span className="text-[#d4af37]">$</span>

                {fetching ? "------" : formatExact(walletData.balance)}

              </p>



              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">

                <span className="text-[10px] text-gray-500">

                  Total Withdrawn

                </span>



                <span className="text-xs font-bold text-gray-300">

                  ${formatExact(walletData.totalWithdrawn)}

                </span>

              </div>

            </div>



            {/* WALLET ADDRESS */}

            <div className="rounded-2xl border border-white/15 bg-[#080808] p-4">

              <div className="mb-3 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <ShieldCheck size={17} className="text-[#e4c568]" />

                  <h3 className="text-[10px] font-extrabold tracking-wider text-gray-300">

                    USDT BEP-20 ADDRESS

                  </h3>

                </div>



                {walletData.walletAddress ? (

                  <CheckCircle2 size={17} className="text-emerald-400" />

                ) : (

                  <AlertCircle size={17} className="text-red-400" />

                )}

              </div>



              {walletData.walletAddress ? (

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black p-3">

                  <p className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-gray-300">

                    {walletData.walletAddress}

                  </p>



                  <button

                    type="button"

                    onClick={handleCopyAddress}

                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/20 text-[#e4c568] hover:bg-[#d4af37]/10"

                    title="Copy address"

                  >

                    <Copy size={14} />

                  </button>

                </div>

              ) : (

                <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">

                  Wallet address not found. Please update it in your profile.

                </p>

              )}

            </div>



            {/* INCOME SECTION */}

            <div>

              <div className="mb-3">

                <h3 className="text-xs font-black tracking-widest text-white">

                  SELECT INCOME

                </h3>



                <p className="mt-1 text-[10px] text-gray-500">

                  Select withdrawal amount from each income source.

                </p>

              </div>



              <div className="space-y-3">

                <IncomeBox

                  title="DIRECT INCOME"

                  icon={Zap}

                  color="#e4c568"

                  earned={walletData.directIncome}

                  value={directAmount}

                  onChange={(value) =>

                    handleAmountChange(setDirectAmount, value)

                  }

                  disabled={loading || fetching}

                />



                <IncomeBox

                  title="LEVEL INCOME"

                  icon={Users}

                  color="#60a5fa"

                  earned={walletData.levelIncome}

                  value={levelAmount}

                  onChange={(value) =>

                    handleAmountChange(setLevelAmount, value)

                  }

                  disabled={loading || fetching}

                />



                <IncomeBox

                  title="LEVEL ROI INCOME"

                  icon={Users}

                  color="#34d399"

                  earned={walletData.levelRoiIncome}

                  value={levelRoiAmount}

                  onChange={(value) =>

                    handleAmountChange(setLevelRoiAmount, value)

                  }

                  disabled={loading || fetching}

                />



                <IncomeBox

                  title="ROI INCOME"

                  icon={RefreshCcw}

                  color="#c084fc"

                  earned={walletData.roiIncome}

                  value={roiAmount}

                  onChange={(value) =>

                    handleAmountChange(setRoiAmount, value)

                  }

                  disabled={loading || fetching}

                />

              </div>

            </div>



            {/* TOTAL WITHDRAWAL */}

            <div className="rounded-2xl border border-[#d4af37]/40 bg-[#080808] p-4">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <p className="text-[10px] font-extrabold tracking-widest text-gray-400">

                    TOTAL WITHDRAWAL

                  </p>



                  <p className="mt-1 text-[10px] text-gray-600">

                    Combined selected amount

                  </p>

                </div>



                <p className="text-2xl font-black text-[#e4c568]">

                  ${formatExact(totalSelection)}

                </p>

              </div>



              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">

                <div

                  className="h-full rounded-full bg-gradient-to-r from-[#b58a2a] to-[#f2d989] transition-all"

                  style={{

                    width: `${

                      walletData.balance > 0

                        ? Math.min(

                            (totalSelection / walletData.balance) * 100,

                            100

                          )

                        : 0

                    }%`,

                  }}

                />

              </div>



              <div className="mt-2 flex justify-between text-[9px] text-gray-500">

                <span>Selected: ${formatExact(totalSelection)}</span>

                <span>Available: ${formatExact(walletData.balance)}</span>

              </div>

            </div>



            {/* TRANSACTION PASSWORD */}

            <div className="rounded-2xl border border-white/15 bg-[#080808] p-4">

              <div className="mb-3 flex items-center gap-2">

                <LockKeyhole size={16} className="text-[#e4c568]" />



                <label className="text-[10px] font-extrabold tracking-wider text-gray-300">

                  TRANSACTION PASSWORD

                </label>

              </div>



              <div className="flex items-center rounded-xl border border-white/15 bg-black px-3 focus-within:border-[#d4af37]/60">

                <input

                  type={showPassword ? "text" : "password"}

                  value={transactionPassword}

                  onChange={(e) => {

                    setTransactionPassword(e.target.value);

                    setInlineMessage("");

                    setIsError(false);

                  }}

                  placeholder="Enter Transaction Password"

                  autoComplete="current-password"

                  disabled={loading}

                  className="w-full bg-transparent py-3.5 text-sm font-semibold text-white outline-none placeholder:text-gray-700"

                />



                <button

                  type="button"

                  onClick={() => setShowPassword(!showPassword)}

                  className="ml-2 text-gray-500 hover:text-[#e4c568]"

                >

                  {showPassword ? (

                    <EyeOff size={18} />

                  ) : (

                    <Eye size={18} />

                  )}

                </button>

              </div>

            </div>



            {/* ERROR MESSAGE */}

            {inlineMessage && (

              <div

                className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${

                  isError

                    ? "border-red-500/30 bg-red-500/5 text-red-300"

                    : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"

                }`}

              >

                <AlertCircle size={16} className="mt-0.5 shrink-0" />

                <p>{inlineMessage}</p>

              </div>

            )}



            {/* WITHDRAWAL INFORMATION */}

            <div className="rounded-2xl border border-white/10 bg-[#080808] p-4">

              <div className="mb-3 flex items-center gap-2">

                <Clock size={16} className="text-[#e4c568]" />



                <h3 className="text-[10px] font-extrabold tracking-widest text-gray-300">

                  WITHDRAWAL INFORMATION

                </h3>

              </div>



              <div className="space-y-3 text-[10px]">

                <div className="flex justify-between gap-3">

                  <span className="text-gray-500">Minimum Withdrawal</span>

                  <span className="font-bold text-white">$2.00</span>

                </div>



                <div className="flex justify-between gap-3">

                  <span className="text-gray-500">Application Timing</span>

                  <span className="font-bold text-white">

                    09:00 AM – 12:00 PM

                  </span>

                </div>



                <div className="flex justify-between gap-3">

                  <span className="text-gray-500">Daily Withdrawal Limit</span>

                  <span className="text-right font-bold text-[#e4c568]">

                    $ amount

                  </span>

                </div>







                <div className="flex justify-between gap-3">

                  <span className="text-gray-500">Withdrawal Fee</span>

                  <span className="font-bold text-emerald-400">10%</span>

                </div>





              </div>

            </div>

          </div>



          {/* STICKY FOOTER */}

          <div className="shrink-0 border-t border-[#d4af37]/20 bg-black p-4">

            <button

              type="submit"

              disabled={

                loading ||

                fetching ||

                !walletData.walletAddress ||

                !transactionPassword.trim()

              }

              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#f1d889]/40 bg-gradient-to-r from-[#b58a2a] via-[#e4c568] to-[#b58a2a] px-4 py-4 text-xs font-black tracking-[0.15em] text-black shadow-[0_0_20px_rgba(212,175,55,0.12)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"

            >

              {loading ? (

                <>

                  <Loader2 size={17} className="animate-spin" />

                  PROCESSING REQUEST...

                </>

              ) : fetching ? (

                <>

                  <Loader2 size={17} className="animate-spin" />

                  LOADING WALLET...

                </>

              ) : (

                <>

                  <ArrowUpRight size={17} />

                  WITHDRAW NOW

                </>

              )}

            </button>





          </div>

        </form>

      </div>

    </div>

  );

};



export default WithdrawalModal;