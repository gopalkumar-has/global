 


// import React, { useEffect, useRef, useState } from "react";
// import api from "../../api/axios";
// import MessageModal from "./MessageModal";
// import { useAuth } from "../../context/AuthContext";
// import {
//   X,
//   Eye,
//   EyeOff,
//   ShieldCheck,
//   CheckCircle2,
//   AlertCircle,
//   Wallet,
//   Clock3,
//   User,
//   LockKeyhole,
//   RefreshCw,
//   Gem
// } from "lucide-react";

// const PACKAGE_DURATION_DAYS = 45;

// const formatUSD = (amount) =>
//   `$${Number(amount || 0).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   })}`;

// const TopUpModalWithInput = ({
//   onClose,
//   onSuccess,
//   packageAmount,
//   packageName = "Saving Package"
// }) => {
//   const { user: loggedInUser, token, login } = useAuth();

//  const [memberId, setMemberId] = useState("");

//   const [fundWallet, setFundWallet] = useState(0);
//   const [walletLoading, setWalletLoading] = useState(true);

//   const [receiverName, setReceiverName] = useState("");
//   const [isCheckingName, setIsCheckingName] = useState(false);

//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const [loading, setLoading] = useState(false);

//   const [messageModal, setMessageModal] = useState({
//     open: false,
//     title: "",
//     message: "",
//     type: "info"
//   });

//   const [activationSucceeded, setActivationSucceeded] = useState(false);

//   const checkRequestId = useRef(0);

//   const amount = Number(packageAmount);
//   const isValidAmount = Number.isFinite(amount) && amount > 0;
//   const hasSufficientBalance = fundWallet >= amount;

//   const showMessage = (title, message, type = "info") => {
//     setMessageModal({
//       open: true,
//       title,
//       message,
//       type
//     });
//   };

//   // FETCH WALLET BALANCE
//   const fetchBalance = async () => {
//     if (!loggedInUser?.userId || !token) {
//       setWalletLoading(false);
//       return;
//     }

//     try {
//       setWalletLoading(true);

//       const response = await api.get(
//         `/user/${loggedInUser.userId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       const userData = response.data?.user;

//       if (userData) {
//         setFundWallet(Number(userData.walletBalance) || 0);
//       }
//     } catch (error) {
//       console.error("Wallet balance error:", error);

//       showMessage(
//         "Wallet Error",
//         "Unable to load your wallet balance. Please try again.",
//         "error"
//       );
//     } finally {
//       setWalletLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBalance();
//   }, [loggedInUser?.userId, token]);

//   // DEBOUNCED MEMBER ID VERIFICATION
//   useEffect(() => {
//     const currentRequest = ++checkRequestId.current;
//     const cleanMemberId = memberId.trim().toUpperCase();

//     if (cleanMemberId.length < 5) {
//       setReceiverName("");
//       setIsCheckingName(false);
//       return;
//     }

//     setReceiverName("");
//     setIsCheckingName(true);

//     const timeoutId = setTimeout(async () => {
//       try {
//         const response = await api.get(
//           `/user/check-sponsor/${encodeURIComponent(cleanMemberId)}`
//         );

//         if (currentRequest !== checkRequestId.current) return;

//         if (response.data?.name) {
//           setReceiverName(response.data.name);
//         } else {
//           setReceiverName("Invalid User ID");
//         }
//       } catch (error) {
//         if (currentRequest !== checkRequestId.current) return;

//         setReceiverName("Invalid User ID");
//       } finally {
//         if (currentRequest === checkRequestId.current) {
//           setIsCheckingName(false);
//         }
//       }
//     }, 500);

//     return () => clearTimeout(timeoutId);
//   }, [memberId]);

//   // RESET FORM
//   const handleReset = () => {
//     setMemberId(loggedInUser?.userId || "");
//     setTransactionPassword("");
//     setShowPassword(false);
//   };

//   // CLOSE MESSAGE MODAL
//   const handleMessageClose = () => {
//     setMessageModal((previous) => ({
//       ...previous,
//       open: false
//     }));

//     if (activationSucceeded) {
//       setActivationSucceeded(false);

//       if (onSuccess) {
//         onSuccess();
//       } else {
//         onClose?.();
//       }
//     }
//   };

//   // NORMAL PACKAGE ACTIVATION
//   const handleBuyPackage = async (event) => {
//     event.preventDefault();

//     if (!loggedInUser?.userId || !token) {
//       showMessage(
//         "Authentication Required",
//         "Please log in again to continue.",
//         "error"
//       );
//       return;
//     }

//     if (!isValidAmount) {
//       showMessage(
//         "Invalid Package",
//         "Please select a valid package amount.",
//         "error"
//       );
//       return;
//     }

//     if (!memberId.trim()) {
//       showMessage(
//         "Member ID Required",
//         "Please enter the receiver Member ID.",
//         "error"
//       );
//       return;
//     }

//     if (isCheckingName) {
//       showMessage(
//         "Please Wait",
//         "Member ID verification is still in progress.",
//         "info"
//       );
//       return;
//     }

//     if (receiverName === "Invalid User ID" || !receiverName) {
//       showMessage(
//         "Invalid Member",
//         "Please enter a valid Member ID.",
//         "error"
//       );
//       return;
//     }

//     if (!transactionPassword.trim()) {
//       showMessage(
//         "Password Required",
//         "Please enter your transaction password.",
//         "error"
//       );
//       return;
//     }

//     if (!hasSufficientBalance) {
//       showMessage(
//         "Insufficient Balance",
//         "Your fund wallet balance is insufficient for this package.",
//         "error"
//       );
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await api.post(
//         "/package/activate",
//         {
//           userId: loggedInUser.userId,
//           memberId: memberId.trim().toUpperCase(),
//           packageAmount: amount,
//           txnPassword: transactionPassword
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

//       // REFRESH WALLET AFTER SUCCESS
//       try {
//         const refreshedResponse = await api.get(
//           `/user/${loggedInUser.userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           }
//         );

//         if (refreshedResponse.data?.user) {
//           const refreshedUser = refreshedResponse.data.user;

//           setFundWallet(
//             Number(refreshedUser.walletBalance) || 0
//           );

//           if (login) {
//             login(refreshedUser, token);
//           }
//         }
//       } catch (refreshError) {
//         console.error("Wallet refresh error:", refreshError);
//       }

//       setTransactionPassword("");
//       setActivationSucceeded(true);

//       showMessage(
//         "Activation Successful",
//         response.data.message ||
//           `Your ${packageName} package has been activated successfully.`,
//         "success"
//       );

//     } catch (error) {
//       console.error("Package activation error:", error);

//       showMessage(
//         "Activation Failed",
//         error.response?.data?.message ||
//           error.message ||
//           "Unable to activate package. Please try again.",
//         "error"
//       );

//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* BACKDROP */}
//       <div
//         className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-5"
//         onMouseDown={(event) => {
//           if (event.target === event.currentTarget && !loading) {
//             onClose?.();
//           }
//         }}
//       >

//         {/* MAIN MODAL */}
//         <div className="relative flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-[#080b10] shadow-[0_0_45px_rgba(212,175,55,0.13)]">

//           {/* HEADER */}
//           <div className="relative shrink-0  pt-20 overflow-hidden border-b border-[#d4af37]/20 bg-gradient-to-r from-[#17130a] via-[#29200e] to-[#100e09] px-5 py-4">

//             <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-[#e5c875]/10" />

//             <div className="relative flex items-center justify-between gap-3">

//               <div className="flex items-center gap-3">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5c875]/30 bg-[#d4af37]/10">
//                   <Gem size={21} className="text-[#e5c875]" />
//                 </div>

//                 <div>
//                   <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
//                     Global Wealth
//                   </p>

//                   <h2 className="mt-1 text-base font-black tracking-wide text-white">
//                     Package Activation
//                   </h2>
//                 </div>

//               </div>

//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={loading}
//                 aria-label="Close modal"
//                 className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-[#d4af37]/40 hover:bg-white/5 hover:text-white disabled:opacity-50"
//               >
//                 <X size={19} />
//               </button>

//             </div>
//           </div>

//           {/* MODAL CONTENT */}
//           <div className="flex-1 overflow-y-auto p-4 sm:p-5">

//             <form
//               onSubmit={handleBuyPackage}
//               className="space-y-4"
//             >

//               {/* PACKAGE DETAILS */}
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
//                     <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
//                       Package Amount
//                     </p>

//                     <p className="mt-1 text-xl font-black text-[#e5c875]">
//                       {formatUSD(amount)}
//                     </p>
//                   </div>

//                 </div>

//                 <div className="mt-4 flex items-center justify-between border-t border-[#d4af37]/15 pt-3">

//                   <span className="flex items-center gap-2 text-xs text-gray-400">
//                     <Clock3 size={14} className="text-[#d4af37]" />
//                     Package Duration
//                   </span>

//                   <span className="text-sm font-bold text-white">
//                     {PACKAGE_DURATION_DAYS} Days
//                   </span>

//                 </div>

//               </div>

//               {/* WALLET BALANCE */}
//               <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-3.5">

//                 <div className="flex items-center justify-between">

//                   <div className="flex items-center gap-2.5">

//                     <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
//                       <Wallet size={18} />
//                     </div>

//                     <div>
//                       <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
//                         Fund Wallet
//                       </p>

//                       <p className="mt-0.5 text-sm font-bold text-white">
//                         Available Balance
//                       </p>
//                     </div>

//                   </div>

//                   <div className="text-right">

//                     {walletLoading ? (
//                       <RefreshCw
//                         size={17}
//                         className="animate-spin text-[#e5c875]"
//                       />
//                     ) : (
//                       <p className="text-lg font-black text-emerald-400">
//                         {formatUSD(fundWallet)}
//                       </p>
//                     )}

//                   </div>

//                 </div>

//                 {!walletLoading && (
//                   <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5">

//                     <span className="text-[10px] text-gray-500">
//                       Balance after package deduction
//                     </span>

//                     <span
//                       className={`text-xs font-bold ${
//                         hasSufficientBalance
//                           ? "text-emerald-400"
//                           : "text-red-400"
//                       }`}
//                     >
//                       {isValidAmount
//                         ? formatUSD(fundWallet - amount)
//                         : "Invalid amount"}
//                     </span>

//                   </div>
//                 )}

//               </div>

//               {/* USER ID */}
//               {/* <div>

//                 <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
//                   Your User ID
//                 </label>

//                 <div className="relative">

//                   <User
//                     size={16}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
//                   />

//                   <input
//                     type="text"
//                     value={loggedInUser?.userId || ""}
//                     readOnly
//                     className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold text-gray-400 outline-none"
//                   />

//                 </div>

//               </div> */}

//               {/* MEMBER ID */}
//               <div>

//                 <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e5c875]">
//                   User ID
//                 </label>

//                 <div className="relative">

//                   <User
//                     size={16}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
//                   />

//                   <input
//                     type="text"
//                     value={memberId}
//                     onChange={(event) => {
//                       setMemberId(event.target.value.toUpperCase());
//                     }}
//                     placeholder="Enter Member ID"
//                     autoComplete="off"
//                     required
//                     disabled={loading}
//                     className="w-full rounded-lg border border-[#d4af37]/25 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold uppercase text-white outline-none transition placeholder:normal-case placeholder:text-gray-600 focus:border-[#e5c875] focus:ring-1 focus:ring-[#e5c875]/30 disabled:opacity-60"
//                   />

//                 </div>

//                 {/* MEMBER VALIDATION */}
//                 <div className="mt-2 min-h-5 px-1">

//                   {isCheckingName && (
//                     <span className="flex items-center gap-2 text-[11px] text-gray-400">
//                       <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
//                       Verifying Member ID...
//                     </span>
//                   )}

//                   {!isCheckingName && receiverName && receiverName !== "Invalid User ID" && (
//                     <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
//                       <CheckCircle2 size={14} />
//                       {receiverName}
//                     </span>
//                   )}

//                   {!isCheckingName && receiverName === "Invalid User ID" && (
//                     <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
//                       <AlertCircle size={14} />
//                       Invalid Member ID
//                     </span>
//                   )}

//                 </div>

//               </div>

//               {/* TRANSACTION PASSWORD */}
//               <div>

//                 <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e5c875]">
//                   Transaction Password
//                 </label>

//                 <div className="relative">

//                   <LockKeyhole
//                     size={16}
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
//                   />

//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={transactionPassword}
//                     onChange={(event) => {
//                       setTransactionPassword(event.target.value);
//                     }}
//                     placeholder="Enter transaction password"
//                     autoComplete="current-password"
//                     required
//                     disabled={loading}
//                     className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#e5c875] focus:ring-1 focus:ring-[#e5c875]/25 disabled:opacity-60"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((previous) => !previous)}
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#e5c875]"
//                   >
//                     {showPassword ? (
//                       <EyeOff size={18} />
//                     ) : (
//                       <Eye size={18} />
//                     )}
//                   </button>

//                 </div>

//               </div>

               

//               {/* BUTTONS */}
//               <div className="flex gap-2 pt-1">

//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   disabled={loading}
//                   className="flex w-[35%] items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#171e29] py-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-300 transition hover:bg-[#202a38] disabled:opacity-50"
//                 >
//                   <RefreshCw size={14} />
//                   Reset
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={
//                     loading ||
//                     walletLoading ||
//                     !isValidAmount ||
//                     !hasSufficientBalance ||
//                     isCheckingName ||
//                     receiverName === "Invalid User ID" ||
//                     !receiverName
//                   }
//                   className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#bd9135] via-[#f1d98b] to-[#bd9135] px-3 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_5px_20px_rgba(212,175,55,0.17)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
//                 >

//                   {loading ? (
//                     <>
//                       <RefreshCw size={15} className="animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       Activate Package
//                       <CheckCircle2 size={16} />
//                     </>
//                   )}

//                 </button>

//               </div>

//             </form>

//           </div>

//           {/* FOOTER */}
//           <div className="shrink-0 border-t border-white/[0.07] px-4 py-3 text-center">
//             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
//               GLOBAL WEALTH
//             </p>
//           </div>

//         </div>
//       </div>

//       {/* MESSAGE MODAL */}
//       <div className="relative z-[999999]">
//        <MessageModal
//   isOpen={messageModal.open}
//   onClose={handleMessageClose}
//   title={messageModal.title}
//   message={messageModal.message}
//   type={messageModal.type}
//   receiverName={receiverName}
// />
//       </div>

//     </>
//   );
// };

// export default TopUpModalWithInput;



 


 


import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import MessageModal from "./MessageModal";
import { useAuth } from "../../context/AuthContext";
import {
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Clock3,
  User,
  LockKeyhole,
  RefreshCw,
  Gem
} from "lucide-react";

const PACKAGE_DURATION_DAYS = 45;

const formatUSD = (amount) =>
  `$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const TopUpModalWithInput = ({
  onClose,
  onSuccess,
  packageAmount,
  packageName = "Saving Package"
}) => {
  const { user: loggedInUser, token, login } = useAuth();
  const isPromoUser = String(loggedInUser?.role || "").toLowerCase() === "promo";

 const [memberId, setMemberId] = useState("");

  const [fundWallet, setFundWallet] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  const [receiverName, setReceiverName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);

  const [transactionPassword, setTransactionPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [messageModal, setMessageModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info"
  });

  const [activationSucceeded, setActivationSucceeded] = useState(false);
  const [successNote, setSuccessNote] = useState("");

  const checkRequestId = useRef(0);

  const amount = Number(packageAmount);
  const isValidAmount = Number.isFinite(amount) && amount > 0;
  const hasSufficientBalance = fundWallet >= amount;

  const showMessage = (title, message, type = "info") => {
    setMessageModal({
      open: true,
      title,
      message,
      type
    });
  };

  // FETCH WALLET BALANCE
  const fetchBalance = async () => {
    if (isPromoUser) {
      setWalletLoading(false);
      return;
    }

    if (!loggedInUser?.userId || !token) {
      setWalletLoading(false);
      return;
    }

    try {
      setWalletLoading(true);

      const response = await api.get(
        `/user/${loggedInUser.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const userData = response.data?.user;

      if (userData) {
        setFundWallet(Number(userData.walletBalance) || 0);
      }
    } catch (error) {
      console.error("Wallet balance error:", error);

      showMessage(
        "Wallet Error",
        "Unable to load your wallet balance. Please try again.",
        "error"
      );
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [loggedInUser?.userId, loggedInUser?.role, token]);

  // DEBOUNCED MEMBER ID VERIFICATION
  useEffect(() => {
    const currentRequest = ++checkRequestId.current;
    const cleanMemberId = memberId.trim().toUpperCase();

    if (cleanMemberId.length < 5) {
      setReceiverName("");
      setIsCheckingName(false);
      return;
    }

    setReceiverName("");
    setIsCheckingName(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await api.get(
          `/user/check-sponsor/${encodeURIComponent(cleanMemberId)}`
        );

        if (currentRequest !== checkRequestId.current) return;

        if (response.data?.name) {
          setReceiverName(response.data.name);
        } else {
          setReceiverName("Invalid User ID");
        }
      } catch (error) {
        if (currentRequest !== checkRequestId.current) return;

        setReceiverName("Invalid User ID");
      } finally {
        if (currentRequest === checkRequestId.current) {
          setIsCheckingName(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [memberId]);

  // RESET FORM
  const handleReset = () => {
    setMemberId(loggedInUser?.userId || "");
    setTransactionPassword("");
    setShowPassword(false);
  };

  // CLOSE MESSAGE MODAL
  const handleMessageClose = () => {
    setMessageModal((previous) => ({
      ...previous,
      open: false
    }));

    if (activationSucceeded) {
      setActivationSucceeded(false);

      if (onSuccess) {
        onSuccess();
      } else {
        onClose?.();
      }
    }
  };

  // NORMAL PACKAGE ACTIVATION
  const handleBuyPackage = async (event) => {
    event.preventDefault();

    if (!loggedInUser?.userId || !token) {
      showMessage(
        "Authentication Required",
        "Please log in again to continue.",
        "error"
      );
      return;
    }

    if (!isValidAmount) {
      showMessage(
        "Invalid Package",
        "Please select a valid package amount.",
        "error"
      );
      return;
    }

    // PROMO PACKAGE: create dummy record only; do not use normal activation route.
    if (isPromoUser) {
      try {
        setLoading(true);

        const response = await api.post(
          "/promo/activate",
          {
            packageType: "Normal",
            packageAmount: amount
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.data?.success || !response.data?.data) {
          throw new Error(
            response.data?.message || "Promo package creation failed."
          );
        }

        const promoData = response.data.data;
        const generatedUserId = promoData.userId || "";
        const generatedName = promoData.name || "";
        const generatedAmount = Number(
          promoData.packageAmount ?? promoData.amount ?? amount
        );
        const durationDays = Number(promoData.durationDays || PACKAGE_DURATION_DAYS);
        const country = promoData.country || "";

        // MessageModal recognizes this format and renders its normal
        // Activation Summary design with generated ID and generated name.
        setReceiverName(generatedName);
             setSuccessNote("");

        setActivationSucceeded(true);

        showMessage(
          "Activation Successful",
          `Promo package of $${generatedAmount} activation created successfully for ${generatedUserId}.`,
          "success"
        );
      } catch (error) {
        console.error("Promo activation error:", error);

        showMessage(
          "Promo Creation Failed",
          error.response?.data?.message ||
            error.message ||
            "Unable to create promo package. Please try again.",
          "error"
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!memberId.trim()) {
      showMessage(
        "Member ID Required",
        "Please enter the receiver Member ID.",
        "error"
      );
      return;
    }

    if (isCheckingName) {
      showMessage(
        "Please Wait",
        "Member ID verification is still in progress.",
        "info"
      );
      return;
    }

    if (receiverName === "Invalid User ID" || !receiverName) {
      showMessage(
        "Invalid Member",
        "Please enter a valid Member ID.",
        "error"
      );
      return;
    }

    if (!transactionPassword.trim()) {
      showMessage(
        "Password Required",
        "Please enter your transaction password.",
        "error"
      );
      return;
    }

    if (!hasSufficientBalance) {
      showMessage(
        "Insufficient Balance",
        "Your fund wallet balance is insufficient for this package.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/package/activate",
        {
          userId: loggedInUser.userId,
          memberId: memberId.trim().toUpperCase(),
          packageAmount: amount,
          txnPassword: transactionPassword
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

      // REFRESH WALLET AFTER SUCCESS
      try {
        const refreshedResponse = await api.get(
          `/user/${loggedInUser.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (refreshedResponse.data?.user) {
          const refreshedUser = refreshedResponse.data.user;

          setFundWallet(
            Number(refreshedUser.walletBalance) || 0
          );

          if (login) {
            login(refreshedUser, token);
          }
        }
      } catch (refreshError) {
        console.error("Wallet refresh error:", refreshError);
      }

      setTransactionPassword("");
      setSuccessNote("");
      setActivationSucceeded(true);

      showMessage(
        "Activation Successful",
        response.data.message ||
          `Your ${packageName} package has been activated successfully.`,
        "success"
      );

    } catch (error) {
      console.error("Package activation error:", error);

      showMessage(
        "Activation Failed",
        error.response?.data?.message ||
          error.message ||
          "Unable to activate package. Please try again.",
        "error"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !loading) {
            onClose?.();
          }
        }}
      >

        {/* MAIN MODAL */}
        <div className="relative flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-[#d4af37]/35 bg-[#080b10] shadow-[0_0_45px_rgba(212,175,55,0.13)]">

          {/* HEADER */}
          <div className="relative shrink-0  pt-20 overflow-hidden border-b border-[#d4af37]/20 bg-gradient-to-r from-[#17130a] via-[#29200e] to-[#100e09] px-5 py-4">

            <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-[#e5c875]/10" />

            <div className="relative flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5c875]/30 bg-[#d4af37]/10">
                  <Gem size={21} className="text-[#e5c875]" />
                </div>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
                    Global Wealth
                  </p>

                  <h2 className="mt-1 text-base font-black tracking-wide text-white">
                    Package Activation
                  </h2>
                </div>

              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Close modal"
                className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-[#d4af37]/40 hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>
          </div>

          {/* MODAL CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">

            <form
              onSubmit={handleBuyPackage}
              className="space-y-4"
            >

              {/* PACKAGE DETAILS */}
              <div className="rounded-xl border border-[#d4af37]/25 bg-gradient-to-br from-[#19150c] to-[#0d1016] p-4">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      Selected Package
                    </p>

                    <h3 className="mt-1 text-base font-black text-white">
                      {packageName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                      Package Amount
                    </p>

                    <p className="mt-1 text-xl font-black text-[#e5c875]">
                      {formatUSD(amount)}
                    </p>
                  </div>

                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#d4af37]/15 pt-3">

                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock3 size={14} className="text-[#d4af37]" />
                    Package Duration
                  </span>

                  <span className="text-sm font-bold text-white">
                    {PACKAGE_DURATION_DAYS} Days
                  </span>

                </div>

              </div>

              {/* WALLET BALANCE */}
              {!isPromoUser && (
              <div className="rounded-xl border border-white/[0.08] bg-[#111720] p-3.5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                      <Wallet size={18} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
                        Fund Wallet
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-white">
                        Available Balance
                      </p>
                    </div>

                  </div>

                  <div className="text-right">

                    {walletLoading ? (
                      <RefreshCw
                        size={17}
                        className="animate-spin text-[#e5c875]"
                      />
                    ) : (
                      <p className="text-lg font-black text-emerald-400">
                        {formatUSD(fundWallet)}
                      </p>
                    )}

                  </div>

                </div>

                {!walletLoading && (
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-2.5">

                    <span className="text-[10px] text-gray-500">
                      Balance after package deduction
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        hasSufficientBalance
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {isValidAmount
                        ? formatUSD(fundWallet - amount)
                        : "Invalid amount"}
                    </span>

                  </div>
                )}

              </div>

              )}

              {/* USER ID */}
              {/* <div>

                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
                  Your User ID
                </label>

                <div className="relative">

                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    value={loggedInUser?.userId || ""}
                    readOnly
                    className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold text-gray-400 outline-none"
                  />

                </div>

              </div> */}

              {/* MEMBER ID */}
              {!isPromoUser && (
              <div>

                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e5c875]">
                  User ID
                </label>

                <div className="relative">

                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    value={memberId}
                    onChange={(event) => {
                      setMemberId(event.target.value.toUpperCase());
                    }}
                    placeholder="Enter Member ID"
                    autoComplete="off"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-[#d4af37]/25 bg-[#111720] py-3 pl-10 pr-3 text-sm font-semibold uppercase text-white outline-none transition placeholder:normal-case placeholder:text-gray-600 focus:border-[#e5c875] focus:ring-1 focus:ring-[#e5c875]/30 disabled:opacity-60"
                  />

                </div>

                {/* MEMBER VALIDATION */}
                <div className="mt-2 min-h-5 px-1">

                  {isCheckingName && (
                    <span className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#d4af37] border-t-transparent" />
                      Verifying Member ID...
                    </span>
                  )}

                  {!isCheckingName && receiverName && receiverName !== "Invalid User ID" && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 size={14} />
                      {receiverName}
                    </span>
                  )}

                  {!isCheckingName && receiverName === "Invalid User ID" && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                      <AlertCircle size={14} />
                      Invalid Member ID
                    </span>
                  )}

                </div>

              </div>

              )}

              {/* TRANSACTION PASSWORD */}
              {!isPromoUser && (
              <div>

                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e5c875]">
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
                    onChange={(event) => {
                      setTransactionPassword(event.target.value);
                    }}
                    placeholder="Enter transaction password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-white/10 bg-[#111720] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#e5c875] focus:ring-1 focus:ring-[#e5c875]/25 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#e5c875]"
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
              <div className="flex gap-2 pt-1">

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex w-[35%] items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#171e29] py-3 text-[11px] font-extrabold uppercase tracking-wider text-gray-300 transition hover:bg-[#202a38] disabled:opacity-50"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !isValidAmount ||
                    (!isPromoUser && (
                      walletLoading ||
                      !hasSufficientBalance ||
                      isCheckingName ||
                      receiverName === "Invalid User ID" ||
                      !receiverName
                    ))
                  }
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#bd9135] via-[#f1d98b] to-[#bd9135] px-3 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[0_5px_20px_rgba(212,175,55,0.17)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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

          {/* FOOTER */}
          <div className="shrink-0 border-t border-white/[0.07] px-4 py-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-600">
              GLOBAL WEALTH
            </p>
          </div>

        </div>
      </div>

      {/* MESSAGE MODAL */}
      <div className="relative z-[999999]">
       <MessageModal
  isOpen={messageModal.open}
  onClose={handleMessageClose}
  title={messageModal.title}
  message={messageModal.message}
  type={messageModal.type}
  receiverName={receiverName}
  successNote={successNote}
/>
      </div>

    </>
  );
};

export default TopUpModalWithInput;



 