// // import React, { useEffect, useRef, useState } from "react";
// // import api from "../../api/axios";
// // import MessageModal from "./MessageModal";
// // import { useAuth } from "../../context/AuthContext";
// // import {
// //   X, Eye, EyeOff, User, Gem, LockKeyhole, CheckCircle2,
// //   AlertCircle, RefreshCw, ShieldCheck, Wallet, CalendarDays
// // } from "lucide-react";

// // const PACKAGE_AMOUNTS = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
// // const DURATIONS = [25, 50, 100];

// // const formatUSD = (amount) =>
// //   `$${Number(amount || 0).toLocaleString("en-US", {
// //     minimumFractionDigits: 2,
// //     maximumFractionDigits: 2
// //   })}`;

// // const AutoCompoundV2Modal = ({
// //   onClose,
// //   onSuccess,
// //   packageAmount,
// //   packageName = "Auto Compound V2"
// // }) => {
// //   const { user, token } = useAuth();

// //   // Amount Packages.jsx se aayega; modal mein edit nahi hoga.
// //   const selectedAmount = Number(packageAmount);
// //   const isValidAmount = PACKAGE_AMOUNTS.includes(selectedAmount);

// //   const [memberId, setMemberId] = useState(user?.userId || "");
// //   const [selectedDays, setSelectedDays] = useState(25);
// //   const [receiverName, setReceiverName] = useState("");
// //   const [isCheckingName, setIsCheckingName] = useState(false);
// //   const [transactionPassword, setTransactionPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [walletBalance, setWalletBalance] = useState(
// //     Number(user?.walletBalance || 0)
// //   );

// //   const [messageModal, setMessageModal] = useState({
// //     open: false,
// //     title: "",
// //     message: "",
// //     type: "info"
// //   });

// //   const [activationSucceeded, setActivationSucceeded] = useState(false);
// //   const checkRequestId = useRef(0);

// //   const showMessage = (title, message, type = "info") => {
// //     setMessageModal({ open: true, title, message, type });
// //   };

// //   // Member ID verification
// //   useEffect(() => {
// //     const requestId = ++checkRequestId.current;
// //     const cleanMemberId = memberId.trim().toUpperCase();

// //     if (cleanMemberId.length < 5) {
// //       setReceiverName("");
// //       setIsCheckingName(false);
// //       return undefined;
// //     }

// //     setReceiverName("");
// //     setIsCheckingName(true);

// //     const timeoutId = setTimeout(async () => {
// //       try {
// //         const response = await api.get(
// //           `/user/check-sponsor/${encodeURIComponent(cleanMemberId)}`
// //         );

// //         if (requestId !== checkRequestId.current) return;

// //         setReceiverName(response.data?.name || "Invalid User ID");
// //       } catch {
// //         if (requestId !== checkRequestId.current) return;
// //         setReceiverName("Invalid User ID");
// //       } finally {
// //         if (requestId === checkRequestId.current) {
// //           setIsCheckingName(false);
// //         }
// //       }
// //     }, 500);

// //     return () => clearTimeout(timeoutId);
// //   }, [memberId]);

// //   const handleReset = () => {
// //     setMemberId(user?.userId || "");
// //     setSelectedDays(25);
// //     setTransactionPassword("");
// //     setShowPassword(false);
// //   };

// //   const handleMessageClose = () => {
// //     setMessageModal((previous) => ({
// //       ...previous,
// //       open: false
// //     }));

// //     if (activationSucceeded) {
// //       setActivationSucceeded(false);
// //       if (onSuccess) onSuccess();
// //       else onClose?.();
// //     }
// //   };


// // // Activate package
// // const handleBuyPackage = async (event) => {
// //   event.preventDefault();

// //   if (loading) return;

// //   if (!user?.userId || !token) {
// //     showMessage(
// //       "Authentication Required",
// //       "Please log in again to continue.",
// //       "error"
// //     );
// //     return;
// //   }

// //   const cleanMemberId = String(memberId || "").trim().toUpperCase();
// //   const amount = Number(selectedAmount);
// //   const days = Number(selectedDays);
// //   const password = String(transactionPassword || "").trim();

// //   if (!isValidAmount || !Number.isFinite(amount) || amount <= 0) {
// //     showMessage(
// //       "Invalid Package",
// //       "Please select a valid amount from the Packages page.",
// //       "error"
// //     );
// //     return;
// //   }

// //   if (![25, 50, 100].includes(days)) {
// //     showMessage(
// //       "Invalid Duration",
// //       "Please select 25, 50 or 100 days.",
// //       "error"
// //     );
// //     return;
// //   }

// //   if (
// //     !cleanMemberId ||
// //     isCheckingName ||
// //     !receiverName ||
// //     receiverName === "Invalid User ID"
// //   ) {
// //     showMessage(
// //       "Invalid Member",
// //       "Please enter a valid receiver Member ID.",
// //       "error"
// //     );
// //     return;
// //   }

// //   if (!password) {
// //     showMessage(
// //       "Password Required",
// //       "Please enter your transaction password.",
// //       "error"
// //     );
// //     return;
// //   }

// //   if (Number(walletBalance) < amount) {
// //     showMessage(
// //       "Insufficient Balance",
// //       "Your wallet balance is lower than the package amount.",
// //       "error"
// //     );
// //     return;
// //   }

// //   try {
// //     setLoading(true);

// //     const response = await api.post(
// //       "/auto-compound-v2/activate",
// //       {
// //         memberId: cleanMemberId,
// //         packageAmount: amount,
// //         selectedDays: days,
// //         txnPassword: password
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${token}`
// //         }
// //       }
// //     );

// //     if (!response.data?.success) {
// //       throw new Error(
// //         response.data?.message || "Package activation failed."
// //       );
// //     }

// //     // Update wallet balance
// //     if (response.data.walletBalance !== undefined) {
// //       setWalletBalance(Number(response.data.walletBalance));
// //     } else {
// //       setWalletBalance((previous) =>
// //         Math.max(0, Number(previous || 0) - amount)
// //       );
// //     }

// //     setTransactionPassword("");
// //     setActivationSucceeded(true);

// //     showMessage(
// //       "Package Activated Successfully",
// //       response.data.message ||
// //         `Package activated successfully for ${cleanMemberId}.`,
// //       "success"
// //     );

// //   } catch (error) {
// //     console.error("Auto Compound V2 error:", error);

// //     const backendData = error.response?.data;

// //     console.error("BACKEND ERROR RESPONSE:", backendData);

// //     const errorMessage =
// //       backendData?.message ||
// //       backendData?.error ||
// //       error.message ||
// //       "Unable to activate package. Please try again.";

// //     showMessage(
// //       "Activation Failed",
// //       errorMessage,
// //       "error"
// //     );

// //   } finally {
// //     setLoading(false);
// //   }
// // };


// //   return (
// //     <>
// //       <div
// //         className="fixed inset-0 z-[9992] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-5"
// //         onMouseDown={(event) => {
// //           if (
// //             event.target === event.currentTarget &&
// //             !loading
// //           ) {
// //             onClose?.();
// //           }
// //         }}
// //       >
// //         <div className="flex max-h-[94vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-[#080b10] shadow-[0_0_45px_rgba(212,175,55,0.13)]">

// //           {/* HEADER */}
// //           <div className="flex items-center justify-between border-b border-[#d4af37]/20 bg-gradient-to-r from-[#17130a] via-[#29200e] to-[#100e09] px-4 py-4">
// //             <div className="flex items-center gap-3">
// //               <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5c875]/30 bg-[#d4af37]/10">
// //                 <Gem size={21} className="text-[#e5c875]" />
// //               </div>

// //               <div>
// //                 <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
// //                   Global Wealth
// //                 </p>
// //                 <h2 className="mt-1 text-base font-black text-white">
// //                   Auto Compound V2
// //                 </h2>
// //               </div>
// //             </div>

// //             <button
// //               type="button"
// //               onClick={onClose}
// //               disabled={loading}
// //               aria-label="Close modal"
// //               className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white disabled:opacity-50"
// //             >
// //               <X size={19} />
// //             </button>
// //           </div>

// //           {/* FORM */}
// //           <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
// //             <form onSubmit={handleBuyPackage} className="space-y-4">

// //               {/* SELECTED AMOUNT - READ ONLY */}
// //               <div className="rounded-xl border border-[#d4af37]/25 bg-gradient-to-br from-[#19150c] to-[#0d1016] p-4">
// //                 <div className="flex items-center justify-between gap-3">
// //                   <div>
// //                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
// //                       Selected Package
// //                     </p>
// //                     <h3 className="mt-1 text-base font-black text-white">
// //                       {packageName}
// //                     </h3>
// //                   </div>

// //                   <div className="text-right">
// //                     <p className="text-[9px] font-bold uppercase text-gray-500">
// //                       Package Amount
// //                     </p>
// //                     <p className="mt-1 text-xl font-black text-[#e5c875]">
// //                       {formatUSD(selectedAmount)}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <p className="mt-2 text-[10px] text-gray-500">
// //                   Amount selected on Packages page. It cannot be changed here.
// //                 </p>
// //               </div>

// //               {/* DURATION */}
// //               <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-4">
// //                 <div className="flex items-center gap-2">
// //                   <CalendarDays size={16} className="text-[#e5c875]" />
// //                   <p className="text-[10px] font-extrabold uppercase text-gray-400">
// //                     Select Package Duration
// //                   </p>
// //                 </div>

// //                 <div className="mt-3 grid grid-cols-3 gap-2">
// //                   {DURATIONS.map((days) => (
// //                     <button
// //                       key={days}
// //                       type="button"
// //                       disabled={loading}
// //                       onClick={() => setSelectedDays(days)}
// //                       className={`rounded-lg border py-3 ${
// //                         selectedDays === days
// //                           ? "border-[#e5c875] bg-[#d4af37]/15 text-[#f1d98b]"
// //                           : "border-white/10 bg-[#080b10] text-gray-400"
// //                       }`}
// //                     >
// //                       <span className="block text-lg font-black">
// //                         {days}
// //                       </span>
// //                       <span className="text-[9px] font-bold uppercase">
// //                         Days
// //                       </span>
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>

// //               {/* WALLET */}
// //               <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-3.5">
// //                 <div className="flex items-center justify-between gap-2">
// //                   <div className="flex items-center gap-2">
// //                     <Wallet size={18} className="text-emerald-400" />
// //                     <div>
// //                       <p className="text-[9px] uppercase text-gray-500">
// //                         Wallet Balance
// //                       </p>
// //                       <p className="text-sm font-bold text-white">
// //                         {formatUSD(walletBalance)}
// //                       </p>
// //                     </div>
// //                   </div>

// //                   <div className="text-right">
// //                     <p className="text-[9px] uppercase text-gray-500">
// //                       Deduction
// //                     </p>
// //                     <p className="text-lg font-black text-red-400">
// //                       -{formatUSD(selectedAmount)}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="mt-3 flex justify-between border-t border-white/[0.07] pt-2 text-xs">
// //                   <span className="text-gray-500">
// //                     Balance after activation (estimate)
// //                   </span>
// //                   <b className="text-white">
// //                     {formatUSD(
// //                       Math.max(
// //                         0,
// //                         walletBalance -
// //                           (isValidAmount ? selectedAmount : 0)
// //                       )
// //                     )}
// //                   </b>
// //                 </div>
// //               </div>

// //               {/* BUYER USER ID */}
// //               <div>
// //                 <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-gray-400">
// //                   Your User ID
// //                 </label>
// //                 <div className="relative">
// //                   <User
// //                     size={16}
// //                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
// //                   />
// //                   <input
// //                     value={user?.userId || ""}
// //                     readOnly
// //                     className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-3 text-sm text-gray-400"
// //                   />
// //                 </div>
// //               </div>

// //               {/* RECEIVER MEMBER ID */}
// //               <div>
// //                 <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-[#e5c875]">
// //                   Receiver Member ID
// //                 </label>

// //                 <div className="relative">
// //                   <User
// //                     size={16}
// //                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
// //                   />
// //                   <input
// //                     value={memberId}
// //                     onChange={(event) =>
// //                       setMemberId(event.target.value.toUpperCase())
// //                     }
// //                     placeholder="Enter Member ID"
// //                     required
// //                     disabled={loading}
// //                     autoComplete="off"
// //                     className="w-full rounded-lg border border-[#d4af37]/25 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold uppercase text-white placeholder:normal-case placeholder:text-gray-600"
// //                   />
// //                 </div>

// //                 <div className="mt-2 min-h-5 text-xs">
// //                   {isCheckingName && (
// //                     <span className="text-gray-400">
// //                       Verifying Member ID...
// //                     </span>
// //                   )}

// //                   {!isCheckingName &&
// //                     receiverName &&
// //                     receiverName !== "Invalid User ID" && (
// //                       <span className="flex items-center gap-1 text-emerald-400">
// //                         <CheckCircle2 size={14} />
// //                         {receiverName}
// //                       </span>
// //                     )}

// //                   {!isCheckingName &&
// //                     receiverName === "Invalid User ID" && (
// //                       <span className="flex items-center gap-1 text-red-400">
// //                         <AlertCircle size={14} />
// //                         Invalid Member ID
// //                       </span>
// //                     )}
// //                 </div>
// //               </div>

// //               {/* TRANSACTION PASSWORD */}
// //               <div>
// //                 <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-[#e5c875]">
// //                   Transaction Password
// //                 </label>

// //                 <div className="relative">
// //                   <LockKeyhole
// //                     size={16}
// //                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
// //                   />

// //                   <input
// //                     type={showPassword ? "text" : "password"}
// //                     value={transactionPassword}
// //                     onChange={(event) =>
// //                       setTransactionPassword(event.target.value)
// //                     }
// //                     placeholder="Enter transaction password"
// //                     required
// //                     disabled={loading}
// //                     autoComplete="current-password"
// //                     className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-12 text-sm text-white placeholder:text-gray-600"
// //                   />

// //                   <button
// //                     type="button"
// //                     onClick={() =>
// //                       setShowPassword((previous) => !previous)
// //                     }
// //                     aria-label={
// //                       showPassword ? "Hide password" : "Show password"
// //                     }
// //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
// //                   >
// //                     {showPassword ? (
// //                       <EyeOff size={18} />
// //                     ) : (
// //                       <Eye size={18} />
// //                     )}
// //                   </button>
// //                 </div>
// //               </div>

            

// //               {/* BUTTONS */}
// //               <div className="flex gap-2">
// //                 <button
// //                   type="button"
// //                   disabled={loading}
// //                   onClick={handleReset}
// //                   className="flex w-[35%] items-center justify-center gap-1 rounded-lg border border-white/10 bg-[#171e29] py-3 text-[11px] font-extrabold text-gray-300"
// //                 >
// //                   <RefreshCw size={14} />
// //                   Reset
// //                 </button>

// //                 <button
// //                   type="submit"
// //                   disabled={
// //                     loading ||
// //                     !isValidAmount ||
// //                     !transactionPassword.trim() ||
// //                     isCheckingName ||
// //                     !receiverName ||
// //                     receiverName === "Invalid User ID" ||
// //                     walletBalance < selectedAmount
// //                   }
// //                   className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#bd9135] via-[#f1d98b] to-[#bd9135] py-3 text-xs font-black uppercase text-black disabled:opacity-40"
// //                 >
// //                   {loading ? (
// //                     <>
// //                       <RefreshCw size={15} className="animate-spin" />
// //                       Processing...
// //                     </>
// //                   ) : (
// //                     <>
// //                       Activate Package
// //                       <CheckCircle2 size={16} />
// //                     </>
// //                   )}
// //                 </button>
// //               </div>
// //             </form>
// //           </div>

// //           <footer className="border-t border-white/[0.07] px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
// //             GLOBAL WEALTH
// //           </footer>
// //         </div>
// //       </div>

// //       <div className="relative z-[999999]">
// //         <MessageModal
// //           isOpen={messageModal.open}
// //           onClose={handleMessageClose}
// //           title={messageModal.title}
// //           message={messageModal.message}
// //           type={messageModal.type}
// //         />
// //       </div>
// //     </>
// //   );
// // };

// // export default AutoCompoundV2Modal;



























// import React, { useEffect, useRef, useState } from "react";
// import api from "../../api/axios";
// import MessageModal from "./MessageModal";
// import { useAuth } from "../../context/AuthContext";
// import {
//   X, Eye, EyeOff, User, Gem, LockKeyhole, CheckCircle2,
//   AlertCircle, RefreshCw, ShieldCheck, Wallet, CalendarDays
// } from "lucide-react";

// const PACKAGE_AMOUNTS = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
// const DURATIONS = [25, 50, 100];

// const formatUSD = (amount) =>
//   `$${Number(amount || 0).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   })}`;

// const AutoCompoundV2Modal = ({
//   onClose,
//   onSuccess,
//   packageAmount,
//   packageName = "Auto Compound V2"
// }) => {
//   const { user, token } = useAuth();

//   // PROMO USER CHECK
//   const isPromoUser =
//     String(user?.role || "").toLowerCase() === "promo";

//   // Amount Packages.jsx se aayega; modal mein edit nahi hoga.
//   const selectedAmount = Number(packageAmount);
//   const isValidAmount = PACKAGE_AMOUNTS.includes(selectedAmount);

//   const [memberId, setMemberId] = useState(user?.userId || "");
//   const [selectedDays, setSelectedDays] = useState(25);
//   const [receiverName, setReceiverName] = useState("");
//   const [isCheckingName, setIsCheckingName] = useState(false);
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [walletBalance, setWalletBalance] = useState(
//     Number(user?.walletBalance || 0)
//   );

//   const [messageModal, setMessageModal] = useState({
//     open: false,
//     title: "",
//     message: "",
//     type: "info"
//   });

//   const [activationSucceeded, setActivationSucceeded] = useState(false);
//   const checkRequestId = useRef(0);

//   const showMessage = (title, message, type = "info") => {
//     setMessageModal({ open: true, title, message, type });
//   };

//   // Member ID verification - NORMAL USERS ONLY
//   useEffect(() => {
//     if (isPromoUser) {
//       setReceiverName("");
//       setIsCheckingName(false);
//       return undefined;
//     }

//     const requestId = ++checkRequestId.current;
//     const cleanMemberId = memberId.trim().toUpperCase();

//     if (cleanMemberId.length < 5) {
//       setReceiverName("");
//       setIsCheckingName(false);
//       return undefined;
//     }

//     setReceiverName("");
//     setIsCheckingName(true);

//     const timeoutId = setTimeout(async () => {
//       try {
//         const response = await api.get(
//           `/user/check-sponsor/${encodeURIComponent(cleanMemberId)}`
//         );

//         if (requestId !== checkRequestId.current) return;

//         setReceiverName(response.data?.name || "Invalid User ID");
//       } catch {
//         if (requestId !== checkRequestId.current) return;
//         setReceiverName("Invalid User ID");
//       } finally {
//         if (requestId === checkRequestId.current) {
//           setIsCheckingName(false);
//         }
//       }
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [memberId, isPromoUser]);

//   const handleReset = () => {
//     setMemberId(user?.userId || "");
//     setSelectedDays(25);
//     setTransactionPassword("");
//     setShowPassword(false);
//   };

//   const handleMessageClose = () => {
//     setMessageModal((previous) => ({
//       ...previous,
//       open: false
//     }));

//     if (activationSucceeded) {
//       setActivationSucceeded(false);
//       if (onSuccess) onSuccess();
//       else onClose?.();
//     }
//   };

//   // Activate package
//   const handleBuyPackage = async (event) => {
//     event.preventDefault();

//     if (loading) return;

//     if (!user?.userId || !token) {
//       showMessage(
//         "Authentication Required",
//         "Please log in again to continue.",
//         "error"
//       );
//       return;
//     }

//     const cleanMemberId = String(memberId || "").trim().toUpperCase();
//     const amount = Number(selectedAmount);
//     const days = Number(selectedDays);
//     const password = String(transactionPassword || "").trim();

//     if (!isValidAmount || !Number.isFinite(amount) || amount <= 0) {
//       showMessage(
//         "Invalid Package",
//         "Please select a valid amount from the Packages page.",
//         "error"
//       );
//       return;
//     }

//     if (![25, 50, 100].includes(days)) {
//       showMessage(
//         "Invalid Duration",
//         "Please select 25, 50 or 100 days.",
//         "error"
//       );
//       return;
//     }

//     // ==========================================
//     // PROMO USER AUTO COMPOUND ACTIVATION
//     // Dummy records only - No real wallet deduction
//     // ==========================================

//     if (isPromoUser) {
//       try {
//         setLoading(true);

//         const response = await api.post(
//           "/promo/activate",
//           {
//             packageType: "Auto Compound V2",
//             packageAmount: amount,
//             selectedDays: days
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         );

//         if (!response.data?.success) {
//           throw new Error(
//             response.data?.message || "Promo activation failed."
//           );
//         }

//         setTransactionPassword("");
//         setActivationSucceeded(true);

//         showMessage(
//           "Promo Activation Successful",
//           response.data.message ||
//             "Auto Compound V2 promo record created successfully.",
//           "success"
//         );

//       } catch (error) {
//         console.error("Promo Auto Compound error:", error);

//         const backendData = error.response?.data;

//         showMessage(
//           "Promo Activation Failed",
//           backendData?.message ||
//             backendData?.error ||
//             error.message ||
//             "Unable to create promo record.",
//           "error"
//         );

//       } finally {
//         setLoading(false);
//       }

//       return;
//     }

//     // ==========================================
//     // EXISTING NORMAL USER VALIDATION
//     // ==========================================

//     if (
//       !cleanMemberId ||
//       isCheckingName ||
//       !receiverName ||
//       receiverName === "Invalid User ID"
//     ) {
//       showMessage(
//         "Invalid Member",
//         "Please enter a valid receiver Member ID.",
//         "error"
//       );
//       return;
//     }

//     if (!password) {
//       showMessage(
//         "Password Required",
//         "Please enter your transaction password.",
//         "error"
//       );
//       return;
//     }

//     if (Number(walletBalance) < amount) {
//       showMessage(
//         "Insufficient Balance",
//         "Your wallet balance is lower than the package amount.",
//         "error"
//       );
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/auto-compound-v2/activate",
//         {
//           memberId: cleanMemberId,
//           packageAmount: amount,
//           selectedDays: days,
//           txnPassword: password
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       if (!response.data?.success) {
//         throw new Error(
//           response.data?.message || "Package activation failed."
//         );
//       }

//       // Update wallet balance
//       if (response.data.walletBalance !== undefined) {
//         setWalletBalance(Number(response.data.walletBalance));
//       } else {
//         setWalletBalance((previous) =>
//           Math.max(0, Number(previous || 0) - amount)
//         );
//       }

//       setTransactionPassword("");
//       setActivationSucceeded(true);

//       showMessage(
//         "Package Activated Successfully",
//         response.data.message ||
//           `Package activated successfully for ${cleanMemberId}.`,
//         "success"
//       );

//     } catch (error) {
//       console.error("Auto Compound V2 error:", error);

//       const backendData = error.response?.data;

//       console.error("BACKEND ERROR RESPONSE:", backendData);

//       const errorMessage =
//         backendData?.message ||
//         backendData?.error ||
//         error.message ||
//         "Unable to activate package. Please try again.";

//       showMessage(
//         "Activation Failed",
//         errorMessage,
//         "error"
//       );

//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div
//         className="fixed inset-0 z-[9992] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-5"
//         onMouseDown={(event) => {
//           if (
//             event.target === event.currentTarget &&
//             !loading
//           ) {
//             onClose?.();
//           }
//         }}
//       >
//         <div className="flex max-h-[94vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-[#080b10] shadow-[0_0_45px_rgba(212,175,55,0.13)]">

//           {/* HEADER */}
//           <div className="flex items-center justify-between border-b border-[#d4af37]/20 bg-gradient-to-r from-[#17130a] via-[#29200e] to-[#100e09] px-4 py-4">
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5c875]/30 bg-[#d4af37]/10">
//                 <Gem size={21} className="text-[#e5c875]" />
//               </div>

//               <div>
//                 <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
//                   Global Wealth
//                 </p>
//                 <h2 className="mt-1 text-base font-black text-white">
//                   Auto Compound V2
//                 </h2>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading}
//               aria-label="Close modal"
//               className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white disabled:opacity-50"
//             >
//               <X size={19} />
//             </button>
//           </div>

//           {/* FORM */}
//           <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
//             <form onSubmit={handleBuyPackage} className="space-y-4">

//               {/* SELECTED AMOUNT - READ ONLY */}
//               <div className="rounded-xl border border-[#d4af37]/25 bg-gradient-to-br from-[#19150c] to-[#0d1016] p-4">
//                 <div className="flex items-center justify-between gap-3">
//                   <div>
//                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
//                       Selected Package
//                     </p>
//                     <h3 className="mt-1 text-base font-black text-white">
//                       {packageName}
//                     </h3>
//                   </div>

//                   <div className="text-right">
//                     <p className="text-[9px] font-bold uppercase text-gray-500">
//                       Package Amount
//                     </p>
//                     <p className="mt-1 text-xl font-black text-[#e5c875]">
//                       {formatUSD(selectedAmount)}
//                     </p>
//                   </div>
//                 </div>

//                 <p className="mt-2 text-[10px] text-gray-500">
//                   Amount selected on Packages page. It cannot be changed here.
//                 </p>
//               </div>

//               {/* DURATION */}
//               <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-4">
//                 <div className="flex items-center gap-2">
//                   <CalendarDays size={16} className="text-[#e5c875]" />
//                   <p className="text-[10px] font-extrabold uppercase text-gray-400">
//                     Select Package Duration
//                   </p>
//                 </div>

//                 <div className="mt-3 grid grid-cols-3 gap-2">
//                   {DURATIONS.map((days) => (
//                     <button
//                       key={days}
//                       type="button"
//                       disabled={loading}
//                       onClick={() => setSelectedDays(days)}
//                       className={`rounded-lg border py-3 ${
//                         selectedDays === days
//                           ? "border-[#e5c875] bg-[#d4af37]/15 text-[#f1d98b]"
//                           : "border-white/10 bg-[#080b10] text-gray-400"
//                       }`}
//                     >
//                       <span className="block text-lg font-black">
//                         {days}
//                       </span>
//                       <span className="text-[9px] font-bold uppercase">
//                         Days
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* WALLET - NORMAL USERS ONLY */}
//               {!isPromoUser && (
//                 <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-3.5">
//                   <div className="flex items-center justify-between gap-2">
//                     <div className="flex items-center gap-2">
//                       <Wallet size={18} className="text-emerald-400" />
//                       <div>
//                         <p className="text-[9px] uppercase text-gray-500">
//                           Wallet Balance
//                         </p>
//                         <p className="text-sm font-bold text-white">
//                           {formatUSD(walletBalance)}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <p className="text-[9px] uppercase text-gray-500">
//                         Deduction
//                       </p>
//                       <p className="text-lg font-black text-red-400">
//                         -{formatUSD(selectedAmount)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="mt-3 flex justify-between border-t border-white/[0.07] pt-2 text-xs">
//                     <span className="text-gray-500">
//                       Balance after activation (estimate)
//                     </span>
//                     <b className="text-white">
//                       {formatUSD(
//                         Math.max(
//                           0,
//                           walletBalance -
//                             (isValidAmount ? selectedAmount : 0)
//                         )
//                       )}
//                     </b>
//                   </div>
//                 </div>
//               )}

//               {/* BUYER USER ID + RECEIVER ID - NORMAL USERS ONLY */}
//               {!isPromoUser && (
//                 <>
//                   <div>
//                     <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-gray-400">
//                       Your User ID
//                     </label>
//                     <div className="relative">
//                       <User
//                         size={16}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
//                       />
//                       <input
//                         value={user?.userId || ""}
//                         readOnly
//                         className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-3 text-sm text-gray-400"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-[#e5c875]">
//                       Receiver Member ID
//                     </label>

//                     <div className="relative">
//                       <User
//                         size={16}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
//                       />
//                       <input
//                         value={memberId}
//                         onChange={(event) =>
//                           setMemberId(event.target.value.toUpperCase())
//                         }
//                         placeholder="Enter Member ID"
//                         required
//                         disabled={loading}
//                         autoComplete="off"
//                         className="w-full rounded-lg border border-[#d4af37]/25 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold uppercase text-white placeholder:normal-case placeholder:text-gray-600"
//                       />
//                     </div>

//                     <div className="mt-2 min-h-5 text-xs">
//                       {isCheckingName && (
//                         <span className="text-gray-400">
//                           Verifying Member ID...
//                         </span>
//                       )}

//                       {!isCheckingName &&
//                         receiverName &&
//                         receiverName !== "Invalid User ID" && (
//                           <span className="flex items-center gap-1 text-emerald-400">
//                             <CheckCircle2 size={14} />
//                             {receiverName}
//                           </span>
//                         )}

//                       {!isCheckingName &&
//                         receiverName === "Invalid User ID" && (
//                           <span className="flex items-center gap-1 text-red-400">
//                             <AlertCircle size={14} />
//                             Invalid Member ID
//                           </span>
//                         )}
//                     </div>
//                   </div>
//                 </>
//               )}

//               {/* TRANSACTION PASSWORD - NORMAL USERS ONLY */}
//               {!isPromoUser && (
//                 <div>
//                   <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-[#e5c875]">
//                     Transaction Password
//                   </label>

//                   <div className="relative">
//                     <LockKeyhole
//                       size={16}
//                       className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
//                     />

//                     <input
//                       type={showPassword ? "text" : "password"}
//                       value={transactionPassword}
//                       onChange={(event) =>
//                         setTransactionPassword(event.target.value)
//                       }
//                       placeholder="Enter transaction password"
//                       required
//                       disabled={loading}
//                       autoComplete="current-password"
//                       className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-12 text-sm text-white placeholder:text-gray-600"
//                     />

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowPassword((previous) => !previous)
//                       }
//                       aria-label={
//                         showPassword ? "Hide password" : "Show password"
//                       }
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//                     >
//                       {showPassword ? (
//                         <EyeOff size={18} />
//                       ) : (
//                         <Eye size={18} />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* BUTTONS */}
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   disabled={loading}
//                   onClick={handleReset}
//                   className="flex w-[35%] items-center justify-center gap-1 rounded-lg border border-white/10 bg-[#171e29] py-3 text-[11px] font-extrabold text-gray-300"
//                 >
//                   <RefreshCw size={14} />
//                   Reset
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={
//                     loading ||
//                     !isValidAmount ||
//                     (!isPromoUser &&
//                       (
//                         !transactionPassword.trim() ||
//                         isCheckingName ||
//                         !receiverName ||
//                         receiverName === "Invalid User ID" ||
//                         walletBalance < selectedAmount
//                       ))
//                   }
//                   className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#bd9135] via-[#f1d98b] to-[#bd9135] py-3 text-xs font-black uppercase text-black disabled:opacity-40"
//                 >
//                   {loading ? (
//                     <>
//                       <RefreshCw size={15} className="animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       {isPromoUser ? "Buy Promo Package" : "Activate Package"}
//                       <CheckCircle2 size={16} />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>

//           <footer className="border-t border-white/[0.07] px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
//             GLOBAL WEALTH
//           </footer>
//         </div>
//       </div>

//       <div className="relative z-[999999]">
//         <MessageModal
//           isOpen={messageModal.open}
//           onClose={handleMessageClose}
//           title={messageModal.title}
//           message={messageModal.message}
//           type={messageModal.type}
//         />
//       </div>
//     </>
//   );
// };

// export default AutoCompoundV2Modal;






import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import {
  X, Eye, EyeOff, User, Gem, LockKeyhole, CheckCircle2,
  AlertCircle, RefreshCw, ShieldCheck, Wallet, CalendarDays
} from "lucide-react";

const PACKAGE_AMOUNTS = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
const DURATIONS = [25, 50, 100];

const formatUSD = (amount) =>
  `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const AutoCompoundV2Modal = ({
  onClose,
  onSuccess,
  packageAmount,
  packageName = "Auto Compound V2"
  
}) => {
    const displayPackageName = String(packageName || "Auto Compound")
    .replace(/\s*V2\b/i, "")
    .trim();
  const { user, token } = useAuth();

  // PROMO USER CHECK
  const isPromoUser =
    String(user?.role || "").toLowerCase() === "promo";

  // Amount Packages.jsx se aayega; modal mein edit nahi hoga.
  const selectedAmount = Number(packageAmount);
  const isValidAmount = PACKAGE_AMOUNTS.includes(selectedAmount);

  const [memberId, setMemberId] = useState(user?.userId || "");
  const [selectedDays, setSelectedDays] = useState(25);
  const [receiverName, setReceiverName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(
    Number(user?.walletBalance || 0)
  );

  const [messageModal, setMessageModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info"
  });

  const [activationSucceeded, setActivationSucceeded] = useState(false);
  const [promoGeneratedDetails, setPromoGeneratedDetails] = useState(null);
  const checkRequestId = useRef(0);

  const showMessage = (title, message, type = "info") => {
    setMessageModal({ open: true, title, message, type });
  };

  // Member ID verification - NORMAL USERS ONLY
  useEffect(() => {
    if (isPromoUser) {
      setReceiverName("");
      setIsCheckingName(false);
      return undefined;
    }

    const requestId = ++checkRequestId.current;
    const cleanMemberId = memberId.trim().toUpperCase();

    if (cleanMemberId.length < 5) {
      setReceiverName("");
      setIsCheckingName(false);
      return undefined;
    }

    setReceiverName("");
    setIsCheckingName(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get(
          `/user/check-sponsor/${encodeURIComponent(cleanMemberId)}`
        );

        if (requestId !== checkRequestId.current) return;

        setReceiverName(response.data?.name || "Invalid User ID");
      } catch {
        if (requestId !== checkRequestId.current) return;
        setReceiverName("Invalid User ID");
      } finally {
        if (requestId === checkRequestId.current) {
          setIsCheckingName(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [memberId, isPromoUser]);

  const handleReset = () => {
    setMemberId(user?.userId || "");
    setSelectedDays(25);
    setTransactionPassword("");
    setShowPassword(false);
  };

  const handleMessageClose = () => {
    setMessageModal((previous) => ({
      ...previous,
      open: false
    }));

    if (activationSucceeded) {
      setActivationSucceeded(false);
      if (onSuccess) onSuccess();
      else onClose?.();
    }
  };

  // Activate package
  const handleBuyPackage = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!user?.userId || !token) {
      showMessage(
        "Authentication Required",
        "Please log in again to continue.",
        "error"
      );
      return;
    }

    const cleanMemberId = String(memberId || "").trim().toUpperCase();
    const amount = Number(selectedAmount);
    const days = Number(selectedDays);
    const password = String(transactionPassword || "").trim();

    if (!isValidAmount || !Number.isFinite(amount) || amount <= 0) {
      showMessage(
        "Invalid Package",
        "Please select a valid amount from the Packages page.",
        "error"
      );
      return;
    }

    if (![25, 50, 100].includes(days)) {
      showMessage(
        "Invalid Duration",
        "Please select 25, 50 or 100 days.",
        "error"
      );
      return;
    }

    // ==========================================
    // PROMO USER AUTO COMPOUND ACTIVATION
    // Dummy records only - No real wallet deduction
    // ==========================================

    if (isPromoUser) {
      try {
        setLoading(true);

        const response = await api.post(
          "/promo/activate",
          {
            packageType: "Auto Compound V2",
            packageAmount: amount,
            selectedDays: days
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Promo activation failed."
          );
        }

        const promoDetails = response.data?.data || {};

        setPromoGeneratedDetails(promoDetails);
        setTransactionPassword("");
        setActivationSucceeded(true);

        // Keep the same Activation Summary layout used by normal users.
        // MessageModal reads the amount and generated user ID from this message.
        showMessage(
          "Package Activated Successfully",
          `Package of $${amount} activated successfully for ${promoDetails.userId || ""}!`,
          "success"
        );

      } catch (error) {
        console.error("Promo Auto Compound error:", error);

        const backendData = error.response?.data;

        showMessage(
          "Promo Activation Failed",
          backendData?.message ||
            backendData?.error ||
            error.message ||
            "Unable to create promo record.",
          "error"
        );

      } finally {
        setLoading(false);
      }

      return;
    }

    // ==========================================
    // EXISTING NORMAL USER VALIDATION
    // ==========================================

    if (
      !cleanMemberId ||
      isCheckingName ||
      !receiverName ||
      receiverName === "Invalid User ID"
    ) {
      showMessage(
        "Invalid Member",
        "Please enter a valid receiver Member ID.",
        "error"
      );
      return;
    }

    if (!password) {
      showMessage(
        "Password Required",
        "Please enter your transaction password.",
        "error"
      );
      return;
    }

    if (Number(walletBalance) < amount) {
      showMessage(
        "Insufficient Balance",
        "Your wallet balance is lower than the package amount.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auto-compound-v2/activate",
        {
          memberId: cleanMemberId,
          packageAmount: amount,
          selectedDays: days,
          txnPassword: password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Package activation failed."
        );
      }

      // Update wallet balance
      if (response.data.walletBalance !== undefined) {
        setWalletBalance(Number(response.data.walletBalance));
      } else {
        setWalletBalance((previous) =>
          Math.max(0, Number(previous || 0) - amount)
        );
      }

      // Use the same Activation Summary details and message format as promo users.
      setPromoGeneratedDetails({
        packageType: "Auto Compound",
        durationDays: days
      });
      setTransactionPassword("");
      setActivationSucceeded(true);

      showMessage(
        "Package Activated Successfully",
        `Package of $${amount} activated successfully for ${cleanMemberId}!`,
        "success"
      );

    } catch (error) {
      console.error("Auto Compound V2 error:", error);

      const backendData = error.response?.data;

      console.error("BACKEND ERROR RESPONSE:", backendData);

      const errorMessage =
        backendData?.message ||
        backendData?.error ||
        error.message ||
        "Unable to activate package. Please try again.";

      showMessage(
        "Activation Failed",
        errorMessage,
        "error"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9992] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-5"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !loading
          ) {
            onClose?.();
          }
        }}
      >
        <div className="flex max-h-[94vh] w-full mt-24 max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-[#080b10] shadow-[0_0_45px_rgba(212,175,55,0.13)]">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-[#d4af37]/20 bg-gradient-to-r from-[#17130a] via-[#29200e] to-[#100e09] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5c875]/30 bg-[#d4af37]/10">
                <Gem size={21} className="text-[#e5c875]" />
              </div>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
                  Global Wealth
                </p>
                <h2 className="mt-1 text-base font-black text-white">
                  Auto Compound 
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
              className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>

          {/* FORM */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
            <form onSubmit={handleBuyPackage} className="space-y-4">

              {/* SELECTED AMOUNT - READ ONLY */}
              <div className="rounded-xl border border-[#d4af37]/25 bg-gradient-to-br from-[#19150c] to-[#0d1016] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      Selected Package
                    </p>
                    <h3 className="mt-1 text-base font-black text-white">
                      {/* {packageName} */}

{displayPackageName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase text-gray-500">
                      Package Amount
                    </p>
                    <p className="mt-1 text-xl font-black text-[#e5c875]">
                      {formatUSD(selectedAmount)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 text-[10px] text-gray-500">
                  Amount selected on Packages page. It cannot be changed here.
                </p>
              </div>

              {/* DURATION */}
              <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#e5c875]" />
                  <p className="text-[10px] font-extrabold uppercase text-gray-400">
                    Select Package Duration
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {DURATIONS.map((days) => (
                    <button
                      key={days}
                      type="button"
                      disabled={loading}
                      onClick={() => setSelectedDays(days)}
                      className={`rounded-lg border py-3 ${
                        selectedDays === days
                          ? "border-[#e5c875] bg-[#d4af37]/15 text-[#f1d98b]"
                          : "border-white/10 bg-[#080b10] text-gray-400"
                      }`}
                    >
                      <span className="block text-lg font-black">
                        {days}
                      </span>
                      <span className="text-[9px] font-bold uppercase">
                        Days
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* WALLET - NORMAL USERS ONLY */}
              {!isPromoUser && (
                <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} className="text-emerald-400" />
                      <div>
                        <p className="text-[9px] uppercase text-gray-500">
                          Wallet Balance
                        </p>
                        <p className="text-sm font-bold text-white">
                          {formatUSD(walletBalance)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase text-gray-500">
                        Deduction
                      </p>
                      <p className="text-lg font-black text-red-400">
                        -{formatUSD(selectedAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between border-t border-white/[0.07] pt-2 text-xs">
                    <span className="text-gray-500">
                      Balance after activation (estimate)
                    </span>
                    <b className="text-white">
                      {formatUSD(
                        Math.max(
                          0,
                          walletBalance -
                            (isValidAmount ? selectedAmount : 0)
                        )
                      )}
                    </b>
                  </div>
                </div>
              )}

              {/* BUYER USER ID + RECEIVER ID - NORMAL USERS ONLY */}
              {!isPromoUser && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-gray-400">
                      Your User ID
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        value={user?.userId || ""}
                        readOnly
                        className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-3 text-sm text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-[#e5c875]">
                      Receiver Member ID
                    </label>

                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        value={memberId}
                        onChange={(event) =>
                          setMemberId(event.target.value.toUpperCase())
                        }
                        placeholder="Enter Member ID"
                        required
                        disabled={loading}
                        autoComplete="off"
                        className="w-full rounded-lg border border-[#d4af37]/25 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold uppercase text-white placeholder:normal-case placeholder:text-gray-600"
                      />
                    </div>

                    <div className="mt-2 min-h-5 text-xs">
                      {isCheckingName && (
                        <span className="text-gray-400">
                          Verifying Member ID...
                        </span>
                      )}

                      {!isCheckingName &&
                        receiverName &&
                        receiverName !== "Invalid User ID" && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 size={14} />
                            {receiverName}
                          </span>
                        )}

                      {!isCheckingName &&
                        receiverName === "Invalid User ID" && (
                          <span className="flex items-center gap-1 text-red-400">
                            <AlertCircle size={14} />
                            Invalid Member ID
                          </span>
                        )}
                    </div>
                  </div>
                </>
              )}

              {/* TRANSACTION PASSWORD - NORMAL USERS ONLY */}
              {!isPromoUser && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase text-[#e5c875]">
                    Transaction Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={transactionPassword}
                      onChange={(event) =>
                        setTransactionPassword(event.target.value)
                      }
                      placeholder="Enter transaction password"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-12 text-sm text-white placeholder:text-gray-600"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleReset}
                  className="flex w-[35%] items-center justify-center gap-1 rounded-lg border border-white/10 bg-[#171e29] py-3 text-[11px] font-extrabold text-gray-300"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !isValidAmount ||
                    (!isPromoUser &&
                      (
                        !transactionPassword.trim() ||
                        isCheckingName ||
                        !receiverName ||
                        receiverName === "Invalid User ID" ||
                        walletBalance < selectedAmount
                      ))
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#bd9135] via-[#f1d98b] to-[#bd9135] py-3 text-xs font-black uppercase text-black disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isPromoUser ? "Buy Promo Package" : "Activate Package"}
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <footer className="border-t border-white/[0.07] px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
            GLOBAL WEALTH
          </footer>
        </div>
      </div>

      <div className="relative z-[999999]">
        <MessageModal
          isOpen={messageModal.open}
          onClose={handleMessageClose}
          title={messageModal.title}
          message={messageModal.message}
          type={messageModal.type}
          receiverName={promoGeneratedDetails?.name || receiverName}
          successNote={
            promoGeneratedDetails
              ? `${(promoGeneratedDetails.packageType || "Auto Compound").replace(/\s*V2\b/i, "")} • ${promoGeneratedDetails.durationDays || selectedDays} Days`
              : ""
          }
        />
      </div>
    </>
  );
};

export default AutoCompoundV2Modal;
