// import React, { useState, useEffect } from "react";
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import Swal from 'sweetalert2';
// import { X, Eye, EyeOff, Zap, Users, RefreshCcw, ShieldCheck } from "lucide-react";
// import { Loader2 } from "lucide-react";

// const WithdrawalModal = ({ onClose }) => {
//   const { user, token } = useAuth();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
//   const [walletData, setWalletData] = useState({ 
//     directIncome: 0, levelIncome: 0, roiIncome: 0, balance: 0, totalWithdrawn: 0, 
//     walletAddress: user?.walletAddress || null // 🔥 FIX: Direct user context se address le liya pehle
//   });
  
//   const [directAmount, setDirectAmount] = useState("");
//   const [levelAmount, setLevelAmount] = useState("");
//   const [roiAmount, setRoiAmount] = useState("");
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [inlineMessage, setInlineMessage] = useState("");
//   const [isError, setIsError] = useState(false);

//   useEffect(() => {
//     fetchWalletData();
//   }, []);

//   const fetchWalletData = async () => {
//     try {
//       const res = await api.get(`/wallet/info`, { headers: { Authorization: `Bearer ${token}` }});
//       setWalletData({
//         directIncome: res.data.directIncome || 0,
//         levelIncome: res.data.levelIncome || 0,
//         roiIncome: res.data.roiIncome || 0,
//         balance: res.data.availableBalance || 0,
//         totalWithdrawn: res.data.totalWithdrawn || 0,
//         // 🔥 FIX: API se check karega, nahi mila toh existing user data se uthayega
//         walletAddress: res.data.walletAddress || user?.walletAddress || null 
//       });
//     } catch (err) {
//       console.error("Failed to fetch wallet data", err);
//     }
//   };

//   const totalSelection = (Number(directAmount) || 0) + (Number(levelAmount) || 0) + (Number(roiAmount) || 0);

//   // 🔥 YEH FUNCTION EXACT 4 DECIMALS DIKHAYEGA BINA ROUND OFF KIYE
//   // const formatExact = (num) => {
//   //   if (!num) return "0";
//   //   const str = Number(num).toString(); 
//   //   if (str.includes('.')) {
//   //     const parts = str.split('.');
//   //     return `${parts[0]}.${parts[1].substring(0, 4)}`; // Point ke baad max 4 digits
//   //   }
//   //   return str;
//   // };

//   // 🔥 YEH FUNCTION DUST (E-16) VALUES KO BHI PROPERLY HANDLE KAREGA
//   const formatExact = (num) => {
//     if (!num) return "0.0000";
//     return Number(num).toFixed(4); 
//   };

//   // const handleSubmit = async () => {
//   //   if (!walletData.walletAddress) {
//   //     return Swal.fire({ icon: 'error', title: 'Address Missing', text: 'Please update your USDT BEP-20 Wallet Address in your profile first.', background: '#111827', color: '#ff4d4d' });
//   //   }
//   //   if (totalSelection < 2) {
//   //     return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum total withdrawal is $2.', background: '#111827', color: '#d4af37' });
//   //   }
//   //   if (totalSelection > walletData.balance) {
//   //     // 🔥 FIX: Error message me bhi formatExact laga diya
//   //     return Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: `You only have $${formatExact(walletData.balance)} available to withdraw.`, background: '#111827', color: '#ff4d4d' });
//   //   }
//   //   if (!transactionPassword) {
//   //     return Swal.fire({ icon: 'warning', title: 'Password Required', text: 'Enter Transaction Password.', background: '#111827', color: '#d4af37' });
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     const response = await api.post('/wallet/withdraw', {
//   //       amount: totalSelection, 
//   //       transactionPassword,
//   //       details: { direct: directAmount, level: levelAmount, roi: roiAmount }
//   //     }, { headers: { Authorization: `Bearer ${token}` }});

//   //     if (response.data.success) {
//   //       Swal.fire({ icon: 'success', title: 'Success!', text: response.data.message, background: '#111827', color: '#d4af37' });
//   //       onClose();
//   //      }
//   //   } catch (err) {
//   //     Swal.fire({ icon: 'error', title: 'Request Failed', text: err.response?.data?.message || 'Something went wrong.', background: '#111827', color: '#ff4d4d' });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//  const handleSubmit = async (e) => {
//   if (e && e.preventDefault) e.preventDefault();

//   // 🔴 1. Purana Validation Logic (Swal Popups)
//   if (!walletData.walletAddress) {
//     return Swal.fire({ icon: 'error', title: 'Address Missing', text: 'Please update your USDT BEP-20 Wallet Address in your profile first.', background: '#111827', color: '#ff4d4d' });
//   }
//   if (totalSelection < 2) {
//     return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum total withdrawal is $2.', background: '#111827', color: '#d4af37' });
//   }
//   if (totalSelection > walletData.balance) {
//     return Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: `You only have $${formatExact(walletData.balance)} available to withdraw.`, background: '#111827', color: '#ff4d4d' });
//   }
//   if (!transactionPassword) {
//     return Swal.fire({ icon: 'warning', title: 'Password Required', text: 'Enter Transaction Password.', background: '#111827', color: '#d4af37' });
//   }

//   // 🟡 2. Start Loading (Processing State)
//   setLoading(true);
//   setInlineMessage(""); // Reset inline message

//   try {
//     const response = await api.post('/wallet/withdraw', {
//       amount: totalSelection, 
//       transactionPassword,
//       details: { direct: directAmount, level: levelAmount, roi: roiAmount }
//     }, { headers: { Authorization: `Bearer ${token}` }});

//     // 🟢 3. Success Popup
//     if (response.data.success) {
//       Swal.fire({ icon: 'success', title: 'Success!', text: response.data.message, background: '#111827', color: '#d4af37' });
//       onClose();
//     }
//   } catch (err) {
//     const errorMsg = err.response?.data?.message || 'Something went wrong.';

//     // 🔥 4. NAYA LOGIC: Sirf Heavy Traffic Error ke liye Inline Red Box
// //     if (errorMsg.includes('Processing Please wait a while...') || errorMsg.includes('Processing Please wait a while...')) {
// //       setInlineMessage("Processing Please wait a while...");
// //     } else {
// //       // Baki sabhi API errors ke liye wapas Swal Popup
// //       Swal.fire({ icon: 'error', title: 'Request Failed', text: errorMsg, background: '#111827', color: '#ff4d4d' });
// //     }
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// if (errorMsg.includes('Processing Please wait a while...')) {
//       setInlineMessage("Processing Please wait a while...");
//   } else if (errorMsg.includes('You can apply for withdrawal only once every 10 days')) {
//       // 🔥 NAYA LOGIC: 10 din wala error ab popup ki jagah inline dikhega
//       // Hum direct 'errorMsg' pass kar rahe hain taaki "after X days" wala dynamic text sahi dikhe
//       setInlineMessage(errorMsg);
//   } else {
//       // Baki sabhi API errors ke liye wapas Swal Popup
//       Swal.fire({ icon: 'error', title: 'Request Failed', text: errorMsg, background: '#111827', color: '#ff4d4d' });
//   }
// } finally {
//   setLoading(false);
// }
//  };


//   return (
//     <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex justify-center items-start sm:items-center pt-16 sm:pt-4 p-3 sm:p-4">
      
//       <div className="bg-[#0b101e] w-full max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[#2d3748] overflow-hidden flex flex-col">
        
//         {/* Header */}
//         <div className="bg-[#e4c568] px-4 py-3 flex justify-between items-center shrink-0">
//           <h2 className="text-black font-extrabold text-[17px] tracking-wide">
//             Withdraw Funds
//           </h2>
//           <button onClick={onClose} className="text-black hover:bg-black/10 p-1 rounded-full transition-colors">
//             <X size={20} strokeWidth={2.5} />
//           </button>
//         </div>

//         {/* Scrollable Content Area */}
//         <div className="p-4 bg-[#0b101e] flex-1 overflow-y-auto custom-scroll space-y-4">
          
//           {/* Top Info Cards */}
//           <div className="flex gap-2 mb-2">
//             <div className="flex-1 bg-[#161c2d] border border-[#2d3748] p-3 rounded-lg text-center shadow-inner">
//               <p className="text-[10px] text-gray-400 font-bold tracking-wider mb-1 uppercase">Withdrawable Balance</p>
//               {/* 🔥 FIX: toFixed hatakar formatExact lagaya */}
//               <p className="text-[#00ff88] font-black text-xl">${formatExact(walletData.balance)}</p>
//             </div>
//           </div>

//           {/* 🔥 Mandatory Wallet Address Block */}
//           <div className={`p-3 rounded-lg border ${walletData.walletAddress ? 'bg-[#131927] border-[#00ff88]/30' : 'bg-[#2a1111] border-[#ff4d4d]/50'}`}>
//             <p className={`text-xs font-bold mb-1.5 flex items-center gap-1.5 ${walletData.walletAddress ? 'text-[#00ff88]' : 'text-[#ff4d4d]'}`}>
//               <ShieldCheck size={14} /> YOUR SAVED USDT BEP-20 ADDRESS
//             </p>
//             {walletData.walletAddress ? (
//               <p className="text-white text-sm break-all font-mono opacity-90">{walletData.walletAddress}</p>
//             ) : (
//               <p className="text-[#ff4d4d] text-[11px] font-semibold italic">Address not found! Please update in your profile to withdraw.</p>
//             )}
//           </div>

//           {/* 🔥 DIRECT INCOME BOX */}
         

//           <div className="bg-[#1e2536] p-3.5 rounded-lg border border-[#2d3748] shadow-sm">
//   <div className="flex justify-between items-center mb-2.5">
//     <span className="text-[#e4c568] text-xs font-bold flex items-center gap-1.5"><Zap size={14}/> DIRECT INCOME</span>
//     {/* 🔥 Green color, increased text size, and bright white font */}
//     <span className="text-green-400 text-sm sm:text-base font-extrabold">Earned: ${formatExact(walletData.directIncome)}</span>
//   </div>
//   <div className="flex items-center gap-2 bg-[#0b101e] border border-[#2d3748] rounded px-3 py-2.5 focus-within:border-[#e4c568] transition-colors">
//     <span className="text-[#e4c568] font-bold">$</span>
//     <input 
//       type="number" value={directAmount} onChange={(e) => setDirectAmount(e.target.value)} 
//       className="bg-transparent outline-none text-white w-full text-sm font-semibold" placeholder="0.00" 
//     />
//   </div>
// </div>

//           {/* 🔥 LEVEL INCOME BOX */}
//          {/* 🔥 LEVEL INCOME BOX */}
//           <div className="bg-[#1e2536] p-3.5 rounded-lg border border-[#2d3748] shadow-sm">
//             <div className="flex justify-between items-center mb-2.5">
//               <span className="text-[#60a5fa] text-xs font-bold flex items-center gap-1.5"><Users size={14}/> LEVEL INCOME</span>
//               <span className="text-green-400 text-sm sm:text-base font-extrabold">Earned: ${formatExact(walletData.levelIncome)}</span>
//             </div>
//             <div className="flex items-center gap-2 bg-[#0b101e] border border-[#2d3748] rounded px-3 py-2.5 focus-within:border-[#60a5fa] transition-colors">
//               <span className="text-[#60a5fa] font-bold">$</span>
//               <input 
//                 type="number" value={levelAmount} onChange={(e) => setLevelAmount(e.target.value)} 
//                 className="bg-transparent outline-none text-white w-full text-sm font-semibold" placeholder="0.00" 
//               />
//             </div>
//           </div>

//           {/* 🔥 ROI INCOME BOX */}
//           <div className="bg-[#1e2536] p-3.5 rounded-lg border border-[#2d3748] shadow-sm">
//             <div className="flex justify-between items-center mb-2.5">
//               <span className="text-[#c084fc] text-xs font-bold flex items-center gap-1.5"><RefreshCcw size5={14}/> ROI INCOME</span>
//               <span className="text-green-400 text-sm sm:text-base font-extrabold">Earned: ${formatExact(walletData.roiIncome)}</span>
//             </div>
//             <div className="flex items-center gap-2 bg-[#0b101e] border border-[#2d3748] rounded px-3 py-2.5 focus-within:border-[#c084fc] transition-colors">
//               <span className="text-[#c084fc] font-bold">$</span>
//               <input 
//                 type="number" value={roiAmount} onChange={(e) => setRoiAmount(e.target.value)} 
//                 className="bg-transparent outline-none text-white w-full text-sm font-semibold" placeholder="0.00" 
//               />
//             </div>
//           </div>

//           {/* 🔥 TOTAL SELECTION */}
//           <div className="flex justify-between items-center bg-[#131927] border border-[#d4af37]/30 p-3.5 rounded-lg mt-2">
//             <span className="text-gray-300 text-xs font-extrabold tracking-widest uppercase">Total Selection</span>
//             {/* 🔥 FIX: toFixed hatakar formatExact lagaya */}
//             <span className="text-[#d4af37] text-lg font-black">${formatExact(totalSelection)}</span>
//           </div>

//           {/* Transaction Password */}
//           <div className="mt-4">
//             <label className="text-gray-400 text-[11px] font-bold mb-1.5 block tracking-wide uppercase">Transaction Password</label>
//             <div className="relative">
//               <input 
//                 type={showPassword ? "text" : "password"}
//                 value={transactionPassword}
//                 onChange={(e) => setTransactionPassword(e.target.value)}
//                 placeholder="Enter Secure PIN"
//                 className="w-full bg-[#131927] border border-[#2d3748] text-white px-4 py-3 rounded-lg outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-600 text-sm font-semibold"
//               />
//               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           {/* <button 
//             onClick={handleSubmit}
//             disabled={loading || !walletData.walletAddress}
//             className="w-full mt-2 bg-gradient-to-r from-[#d4af37] to-[#e4c568] hover:brightness-110 text-black font-extrabold py-3.5 rounded-lg shadow-[0_0_15px_rgba(228,197,104,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest text-[14px]"
//           >
//             {loading ? 'Processing...' : 'WITHDRAW NOW'}
//           </button> */}


//         {/* <div className="mt-2">
//   <button 
//     onClick={handleSubmit}
//     disabled={loading || !walletData?.walletAddress}
//     className="w-full bg-gradient-to-r from-[#d4af37] to-[#e4c568] hover:brightness-110 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(228,197,104,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest text-[12px] sm:text-[13px] leading-snug flex items-center justify-center"
//   >
//     {loading ? (
//       <div className="flex items-center gap-2">
//         <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0"></span>
//         <span>PROCESSING... PLEASE WAIT</span>
//       </div>
//     ) : inlineMessage ? (
//        <span className="animate-pulse text-center w-full">
//         {inlineMessage}
//       </span>
//     ) : (
//        <span>WITHDRAW NOW</span>
//     )}
//   </button>
// </div> */}


// <div className="mt-2">
//   <button 
//     onClick={handleSubmit}
//     disabled={loading || !walletData?.walletAddress}
//     className="w-full bg-gradient-to-r from-[#d4af37] to-[#e4c568] hover:brightness-110 text-black font-extrabold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(228,197,104,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest text-[12px] sm:text-[14px] flex items-center justify-center gap-2 leading-snug"
//   >
//     {loading ? (
//       <>
//         {/* 🔥 Black Spinner & Processing Text */}
//         <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0"></span>
//         <span>PROCESSING... PLEASE WAIT</span>
//       </>
//     ) : inlineMessage ? (
//       /* 🔥 Heavy Traffic Message (In Gold Button Only) */
//       <span className="animate-pulse text-center">{inlineMessage}</span>
//     ) : (
//       /* 🔥 Default State */
//       <span>WITHDRAW NOW</span>
//     )}
//   </button>
// </div>
//           {/* Terms and Conditions */}
//           {/* <div className="mt-4 text-[#6b7280] text-[10px] leading-relaxed font-medium text-center px-2">
//             <p>Minimum withdrawal is $2. Timing: 10:00 AM to 12:00 PM.</p>
//             <p>Withdrawal Fees 0%. Payments processed via USDT BEP20.</p>
//           </div> */}

//           <div className="mt-4 text-[#9ca3af] text-xs sm:text-sm font-bold text-center px-2 space-y-1.5">
//             <p>Min withdrawal is $2. Timing: 10:00 AM to 12:00 PM.</p>
            
//             {/* 🔥 NAYE RULES */}
//             <p className="text-[#d4af37]">Daily Withdrawal Limit: Equal to your highest active package amount.</p>
             
//             <p>Receive time: 10:00 PM to 12:00 AM. 0% Fees via USDT BEP20.</p>
//            <p className="text-[8px] text-gray-400 mt-1">
//      You can apply for a withdrawal only once every 10 days. The requested amount will be credited to your wallet exactly 10 days after the withdrawal date.
// </p>
//           </div>

//         </div>
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
        icon: "success",
        title: "Request Submitted!",
        text:
          response.data.message ||
          "Your withdrawal request has been submitted successfully.",
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
        <div className="flex shrink-0 items-center justify-between border-b border-[#d4af37]/20 bg-black px-5 py-4">
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
                  placeholder="Enter your secure PIN"
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
                    10:00 AM – 12:00 PM
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Daily Withdrawal Limit</span>
                  <span className="text-right font-bold text-[#e4c568]">
                    Highest active package amount
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Expected Receive Time</span>
                  <span className="font-bold text-white">
                    10:00 PM – 12:00 AM
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Withdrawal Fee</span>
                  <span className="font-bold text-emerald-400">0%</span>
                </div>

                <div className="border-t border-white/10 pt-3 text-center leading-relaxed text-gray-500">
                  You can apply for a withdrawal only once every 10 days.
                  Withdrawal requests are subject to backend approval and
                  processing rules.
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

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold tracking-wider text-gray-600">
              <ShieldCheck size={12} className="text-emerald-500" />
              SECURE WITHDRAWAL · USDT BEP-20
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;