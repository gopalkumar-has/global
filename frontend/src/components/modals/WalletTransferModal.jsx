// // import React, { useState, useEffect } from "react";
// // import api from "../../api/axios";
// // import { useAuth } from "../../context/AuthContext";
// // import { useNavigate } from "react-router-dom";
// // import Swal from 'sweetalert2';
// // import { X, Eye, EyeOff } from "lucide-react";

// // const WalletTransferModal = ({ onClose }) => {
// //   const { user, token } = useAuth();
// //   const navigate = useNavigate();
  
// //   const [loading, setLoading] = useState(false);
// //   const [walletData, setWalletData] = useState({ balance: 0 });
// //   const [receiverId, setReceiverId] = useState("");
// //   const [amount, setAmount] = useState("");
// //   const [transactionPassword, setTransactionPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);

// //   useEffect(() => {
// //     fetchWalletData();
// //   }, []);

// //   const fetchWalletData = async () => {
// //     try {
// //       const res = await api.get(`/wallet/info`, { headers: { Authorization: `Bearer ${token}` }});
// //       // Ab backend se walletBalance aayega, toh yahan $0 nahi dikhega
// //       setWalletData({ balance: res.data.walletBalance || 0 });
// //     } catch (err) {
// //       console.error("Failed to fetch wallet data");
// //     }
// //   };

// //   const handleQuickAmount = (val) => setAmount(val);

// //   const handleSubmit = async () => {
// //     if (!receiverId) return Swal.fire({ icon: 'warning', title: 'User ID Required', text: 'Please enter receiver User ID.', background: '#0b101e', color: '#e4c568' });
// //     if (!amount || amount < 1) return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum transfer is $1.', background: '#0b101e', color: '#e4c568' });
// //     if (!transactionPassword) return Swal.fire({ icon: 'warning', title: 'Password Required', text: 'Enter Transaction Password.', background: '#0b101e', color: '#e4c568' });

// //     setLoading(true);
// //     try {
// //       const response = await api.post('/wallet/transfer', {
// //         receiverId,
// //         amount: Number(amount),
// //         transactionPassword
// //       }, { headers: { Authorization: `Bearer ${token}` }});

// //       if (response.data.success) {
// //         Swal.fire({ icon: 'success', title: 'Transferred!', text: response.data.message, background: '#0b101e', color: '#e4c568' });
// //         onClose();
// //       }
// //     } catch (err) {
// //       Swal.fire({ icon: 'error', title: 'Transfer Failed', text: err.response?.data?.message || 'Something went wrong.', background: '#0b101e', color: '#ff4d4d' });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex justify-center items-center p-3 sm:p-4">
// //       <div className="bg-[#0b101e] w-full max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[#2d3748] overflow-hidden flex flex-col mt-4 sm:mt-0">
        
// //         <div className="bg-[#e4c568] px-4 py-3 flex justify-between items-center shrink-0">
// //           <h2 className="text-black font-extrabold text-[17px] tracking-wide">Fund  Transfer</h2>
// //           <button onClick={onClose} className="text-black hover:bg-black/10 p-1 rounded-full transition-colors"><X size={20} strokeWidth={2.5} /></button>
// //         </div>

// //         <div className="bg-[#161c2d] px-4 py-2 border-b border-[#2d3748] shrink-0">
// //           <p className="text-[#e4c568] text-xs font-bold tracking-wide">Minimum $1 Amount For Transfer!</p>
// //         </div>

// //         <div className="p-4 bg-[#0b101e] flex-1 overflow-y-auto">
// //           <div className="border border-[#2d3748] rounded-md overflow-hidden flex flex-col font-semibold text-[13px]">
// //             <div className="flex border-b border-[#2d3748]">
// //               <div className="w-2/3 bg-[#131927] text-white p-2.5 border-r border-[#2d3748]">Available Fund Balance</div>
// //               <div className="w-1/3 bg-[#131927] text-[#00ff88] p-2.5">${walletData.balance.toFixed(2)}</div>
// //             </div>
// //           </div>

// //           <div className="mt-4 space-y-3">
// //             {/* <input type="text" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Enter Receiver User ID" className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 text-sm" /> */}
            
// //             <input 
// //     type="text" 
// //     value={receiverId} 
// //     // 🔥 YAHAN CHANGE KIYA HAI: .toUpperCase() add kiya hai
// //     onChange={(e) => setReceiverId(e.target.value.toUpperCase())} 
// //     placeholder="Enter Receiver User ID" 
// //     // 🔥 YAHAN CHANGE KIYA HAI: End me 'uppercase' class add ki hai
// //     className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 text-sm uppercase" 
// // />

// //             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter Transfer Amount ($)" className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 text-sm" />
            
// //             <div className="flex gap-2">
// //               {[1, 5, 10, 20, 50].map((val) => (
// //                 <button key={val} type="button" onClick={() => handleQuickAmount(val)} className="flex-1 bg-[#1e2536] hover:bg-[#2d3748] border border-[#2d3748] text-white py-1.5 rounded font-bold text-sm transition-colors">${val}</button>
// //               ))}
// //             </div>

// //             <div className="relative mt-2">
// //               <input type={showPassword ? "text" : "password"} value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)} placeholder="Enter Transaction Password" className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 pr-10 text-sm" />
// //               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
// //             </div>

// //             <button onClick={handleSubmit} disabled={loading} className="w-full mt-3 bg-[#e4c568] hover:bg-[#d4af37] text-black font-extrabold py-2.5 rounded shadow-[0_0_10px_rgba(228,197,104,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 uppercase tracking-widest text-[15px]">
// //               {loading ? 'Processing...' : 'TRANSFER FUNDS'}
// //             </button>
// //           </div>

// //           <div className="mt-4 pb-2 text-[#9ca3af] text-[11px] leading-relaxed font-medium">
// //             <h4 className="text-[#e4c568] font-bold text-xs mb-1.5">Terms & Conditions</h4>
// //             <p>1. Minimum transfer amount is $1.</p>
// //             <p>2. Fund transfers cannot be reversed once processed.</p>
// //             <p>3. Active package upgrade is required for transfers.</p>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default WalletTransferModal;

// import React, { useState, useEffect } from "react";
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import Swal from 'sweetalert2';
// import { X, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

// const WalletTransferModal = ({ onClose }) => {
//   const { user, token } = useAuth();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(false);
//   const [walletData, setWalletData] = useState({ balance: 0 });
//   const [receiverId, setReceiverId] = useState("");
//   const [amount, setAmount] = useState("");
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // 🔥 NAYE STATES: Receiver ka naam aur loading check karne ke liye
//   const [receiverName, setReceiverName] = useState("");
//   const [isCheckingName, setIsCheckingName] = useState(false);

//   useEffect(() => {
//     fetchWalletData();
//   }, []);

//   const fetchWalletData = async () => {
//     try {
//       const res = await api.get(`/wallet/info`, { headers: { Authorization: `Bearer ${token}` }});
//       setWalletData({ balance: res.data.walletBalance || 0 });
//     } catch (err) {
//       console.error("Failed to fetch wallet data");
//     }
//   };

//   // ==========================================
//   // 🔥 RECEIVER NAME FETCH LOGIC (Debounced)
//   // ==========================================
//   useEffect(() => {
//     const checkReceiverName = async () => {
//       // Agar ID 5 character se choti hai, toh check mat karo
//       if (receiverId.length < 5) {
//         setReceiverName("");
//         return;
//       }
      
//       setIsCheckingName(true);
//       try {
//         // Aapke existing check-sponsor route ko call kar raha hai
//         const res = await api.get(`/user/check-sponsor/${receiverId}`);
//         setReceiverName(res.data.name);
//       } catch (err) {
//         setReceiverName("Invalid User ID");
//       } finally {
//         setIsCheckingName(false);
//       }
//     };

//     // User ke type karne ke baad 500ms (aadha second) wait karke API call karega (Load bachane ke liye)
//     const timeoutId = setTimeout(checkReceiverName, 500);
//     return () => clearTimeout(timeoutId);
//   }, [receiverId]);

//   const handleQuickAmount = (val) => setAmount(val);

//   const handleSubmit = async () => {
//     if (!receiverId) return Swal.fire({ icon: 'warning', title: 'User ID Required', text: 'Please enter receiver User ID.', background: '#0b101e', color: '#e4c568' });
//     if (receiverName === "Invalid User ID") return Swal.fire({ icon: 'error', title: 'Invalid Receiver', text: 'Please enter a valid User ID.', background: '#0b101e', color: '#ff4d4d' });
//     if (!amount || amount < 1) return Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum transfer is $1.', background: '#0b101e', color: '#e4c568' });
//     if (!transactionPassword) return Swal.fire({ icon: 'warning', title: 'Password Required', text: 'Enter Transaction Password.', background: '#0b101e', color: '#e4c568' });

//     setLoading(true);
//     try {
//       const response = await api.post('/wallet/transfer', {
//         receiverId,
//         amount: Number(amount),
//         transactionPassword
//       }, { headers: { Authorization: `Bearer ${token}` }});

//       if (response.data.success) {
//         Swal.fire({ icon: 'success', title: 'Transferred!', text: response.data.message, background: '#0b101e', color: '#e4c568' });
//         onClose();
//       }
//     } catch (err) {
//       Swal.fire({ icon: 'error', title: 'Transfer Failed', text: err.response?.data?.message || 'Something went wrong.', background: '#0b101e', color: '#ff4d4d' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex justify-center items-center p-3 sm:p-4">
//       <div className="bg-[#0b101e] w-full max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[#2d3748] overflow-hidden flex flex-col mt-4 sm:mt-0">
        
//         <div className="bg-[#e4c568] px-4 py-3 flex justify-between items-center shrink-0">
//           <h2 className="text-black font-extrabold text-[17px] tracking-wide">Fund  Transfer</h2>
//           <button onClick={onClose} className="text-black hover:bg-black/10 p-1 rounded-full transition-colors"><X size={20} strokeWidth={2.5} /></button>
//         </div>

//         <div className="bg-[#161c2d] px-4 py-2 border-b border-[#2d3748] shrink-0">
//           <p className="text-[#e4c568] text-xs font-bold tracking-wide">Minimum $1 Amount For Transfer!</p>
//         </div>

//         <div className="p-4 bg-[#0b101e] flex-1 overflow-y-auto">
//           <div className="border border-[#2d3748] rounded-md overflow-hidden flex flex-col font-semibold text-[13px]">
//             <div className="flex border-b border-[#2d3748]">
//               <div className="w-2/3 bg-[#131927] text-white p-2.5 border-r border-[#2d3748]">Available Fund Balance</div>
//               <div className="w-1/3 bg-[#131927] text-[#00ff88] p-2.5">${walletData.balance.toFixed(2)}</div>
//             </div>
//           </div>

//           <div className="mt-4 space-y-3">
            
//             {/* 🔥 RECEIVER ID INPUT WITH NAME PREVIEW */}
//             <div>
//                 <input 
//                     type="text" 
//                     value={receiverId} 
//                     onChange={(e) => setReceiverId(e.target.value.toUpperCase())} 
//                     placeholder="Enter Receiver User ID" 
//                     className={`w-full bg-[#131927] border text-white px-3 py-2.5 rounded outline-none placeholder-gray-500 text-sm uppercase transition-colors ${receiverName === "Invalid User ID" ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#2d3748] focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568]"}`} 
//                 />
                
//                 {/* Name validation visual feedback */}
//                 <div className="h-5 mt-1 px-1">
//                   {isCheckingName ? (
//                     <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 animate-pulse">
//                        <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span> Checking ID...
//                     </span>
//                   ) : receiverName && receiverName !== "Invalid User ID" ? (
//                     <span className="text-[12px] text-[#00ff88] font-bold flex items-center gap-1.5 capitalize tracking-wide">
//                        <CheckCircle2 size={14} /> {receiverName}
//                     </span>
//                   ) : receiverName === "Invalid User ID" ? (
//                     <span className="text-[12px] text-red-400 font-bold flex items-center gap-1.5 tracking-wide">
//                        <AlertCircle size={14} /> Invalid User ID
//                     </span>
//                   ) : null}
//                 </div>
//             </div>

//             <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter Transfer Amount ($)" className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 text-sm" />
            
//             <div className="flex gap-2">
//               {[1, 5, 10, 20, 50].map((val) => (
//                 <button key={val} type="button" onClick={() => handleQuickAmount(val)} className="flex-1 bg-[#1e2536] hover:bg-[#2d3748] border border-[#2d3748] text-white py-1.5 rounded font-bold text-sm transition-colors">${val}</button>
//               ))}
//             </div>

//             <div className="relative mt-2">
//               <input type={showPassword ? "text" : "password"} value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)} placeholder="Enter Transaction Password" className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 pr-10 text-sm" />
//               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
//             </div>

//             <button onClick={handleSubmit} disabled={loading || receiverName === "Invalid User ID"} className="w-full mt-3 bg-[#e4c568] hover:bg-[#d4af37] text-black font-extrabold py-2.5 rounded shadow-[0_0_10px_rgba(228,197,104,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-widest text-[15px]">
//               {loading ? 'Processing...' : 'TRANSFER FUNDS'}
//             </button>
//           </div>

//           <div className="mt-4 pb-2 text-[#9ca3af] text-[11px] leading-relaxed font-medium">
//             <h4 className="text-[#e4c568] font-bold text-xs mb-1.5">Terms & Conditions</h4>
//             <p>1. Minimum transfer amount is $1.</p>
//             <p>2. Fund transfers cannot be reversed once processed.</p>
//             <p>3. Active package upgrade is required for transfers.</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WalletTransferModal;

import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

const swalTheme = {
  background: "#0b1018",
  color: "#e8d8a7",
  confirmButtonColor: "#c5a04c",
};

const formatUSD = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const WalletTransferModal = ({ onClose }) => {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [walletData, setWalletData] = useState({ balance: 0 });
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);

  const normalizedReceiverId = receiverId.trim().toUpperCase();
  const numericAmount = Number(amount);
  const balance = Number(walletData.balance) || 0;

  const hasValidAmount =
    amount.trim() !== "" &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 1;

  const canSubmit =
    !loading &&
    !walletLoading &&
    !isCheckingName &&
    normalizedReceiverId.length >= 5 &&
    Boolean(receiverName) &&
    receiverName !== "Invalid User ID" &&
    hasValidAmount &&
    numericAmount <= balance &&
    Boolean(transactionPassword.trim());

  const quickAmounts = [1, 5, 10, 20, 50];

  useEffect(() => {
    let active = true;

    const fetchWalletData = async () => {
      setWalletLoading(true);
      try {
        const response = await api.get("/wallet/info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (active) {
          setWalletData({
            balance: Number(response.data?.walletBalance) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
        if (active) {
          Swal.fire({
            ...swalTheme,
            icon: "error",
            title: "Wallet unavailable",
            text: error.response?.data?.message || "Could not load your wallet balance.",
          });
        }
      } finally {
        if (active) setWalletLoading(false);
      }
    };

    if (token) fetchWalletData();
    else setWalletLoading(false);

    return () => {
      active = false;
    };
  }, [token]);

  // Debounced receiver lookup. Cleanup prevents older requests from replacing
  // the validation result for a newer ID.
  useEffect(() => {
    let active = true;
    const currentId = normalizedReceiverId;

    if (currentId.length < 5) {
      setReceiverName("");
      setIsCheckingName(false);
      return undefined;
    }

    setReceiverName("");
    setIsCheckingName(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get(
          `/user/check-sponsor/${encodeURIComponent(currentId)}`
        );

        if (!active) return;
        const name = response.data?.name;
        setReceiverName(
          typeof name === "string" && name.trim()
            ? name.trim()
            : "Invalid User ID"
        );
      } catch (error) {
        if (active) setReceiverName("Invalid User ID");
      } finally {
        if (active) setIsCheckingName(false);
      }
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [normalizedReceiverId]);

  const handleQuickAmount = (value) => {
    setAmount(String(value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!normalizedReceiverId) {
      return Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "User ID required",
        text: "Please enter the receiver's User ID.",
      });
    }

    if (normalizedReceiverId.length < 5 || isCheckingName) {
      return Swal.fire({
        ...swalTheme,
        icon: "info",
        title: "Checking receiver",
        text: "Please wait until the receiver ID has been verified.",
      });
    }

    if (!receiverName || receiverName === "Invalid User ID") {
      return Swal.fire({
        ...swalTheme,
        icon: "error",
        title: "Invalid receiver",
        text: "Please enter a valid User ID.",
      });
    }

    if (!hasValidAmount) {
      return Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Invalid amount",
        text: "Minimum transfer amount is $1.",
      });
    }

    if (numericAmount > balance) {
      return Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Insufficient balance",
        text: "Transfer amount cannot exceed your available fund balance.",
      });
    }

    if (!transactionPassword.trim()) {
      return Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Password required",
        text: "Please enter your transaction password.",
      });
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/wallet/transfer",
        {
          receiverId: normalizedReceiverId,
          amount: numericAmount,
          transactionPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        await Swal.fire({
          ...swalTheme,
          icon: "success",
          title: "Transfer successful",
          text: response.data.message || "Funds have been transferred.",
          confirmButtonText: "Done",
        });
        onClose();
      } else {
        await Swal.fire({
          ...swalTheme,
          icon: "error",
          title: "Transfer not completed",
          text: response.data?.message || "The transfer could not be completed.",
        });
      }
    } catch (error) {
      await Swal.fire({
        ...swalTheme,
        icon: "error",
        title: "Transfer failed",
        text: error.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const amountRemaining = useMemo(
    () => Math.max(balance - (hasValidAmount ? numericAmount : 0), 0),
    [balance, hasValidAmount, numericAmount]
  );

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#020408]/85 p-2.5 backdrop-blur-md sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-transfer-title"
        className="relative flex max-h-[94dvh] w-full max-w-[470px] flex-col overflow-hidden rounded-[26px] border border-[#c5a45b]/30 bg-[#090e15] text-white shadow-[0_28px_90px_rgba(0,0,0,0.7)]"
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#d7b96f]/10" />
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[#d7b96f]/10" />

        <header className="relative flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d4b45f]/25 bg-[#d4b45f]/[0.09] text-[#e5c875]">
              <ArrowLeftRight size={19} />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#d9bd75]">
                Secure wallet service
              </p>
              <h2 id="wallet-transfer-title" className="mt-0.5 text-base font-semibold text-white">
                Fund transfer
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close transfer modal"
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
          >
            <X size={17} />
          </button>
        </header>

        <div className="relative flex-1 overflow-y-auto">
          <div className="px-5 pb-5 pt-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[20px] border border-[#d2b35f]/25 bg-gradient-to-br from-[#1a2028] via-[#111923] to-[#0d131c] p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full bg-[#d4b45f]/[0.09] blur-2xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    <Wallet size={12} className="text-[#e3c46e]" />
                    Available fund balance
                  </p>
                  <p className="mt-2 text-[clamp(1.8rem,7vw,2.35rem)] font-semibold leading-none tracking-tight text-white tabular-nums">
                    <span className="mr-1 text-lg text-[#e3c46e]">$</span>
                    {walletLoading ? "—" : formatUSD(balance)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-300/15 bg-emerald-300/[0.07] p-2.5 text-emerald-300">
                  <ShieldCheck size={19} />
                </div>
              </div>
              <div className="relative mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                <span className="text-[10px] text-slate-500">Minimum transfer</span>
                <span className="text-xs font-bold text-[#e5c875]">$1.00</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="transfer-receiver" className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Recipient User ID
                  </label>
                  <span className="text-[9px] text-slate-600">Enter account ID</span>
                </div>
                <div className={`flex items-center gap-2 rounded-xl border bg-[#111925] px-3.5 transition focus-within:border-[#d4b45f]/60 ${
                  receiverName === "Invalid User ID" ? "border-rose-500/50" : "border-white/[0.09]"
                }`}>
                  <UserRound size={16} className="shrink-0 text-slate-500" />
                  <input
                    id="transfer-receiver"
                    type="text"
                    autoComplete="off"
                    value={receiverId}
                    onChange={(event) => setReceiverId(event.target.value.toUpperCase())}
                    placeholder="e.g. GW12345"
                    className="min-w-0 w-full bg-transparent py-3.5 text-sm font-semibold uppercase tracking-wide text-white outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-600"
                  />
                  {isCheckingName && <LoaderCircle size={16} className="shrink-0 animate-spin text-[#d9bd75]" />}
                </div>

                <div className="mt-2 min-h-[22px]">
                  {isCheckingName ? (
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <LoaderCircle size={12} className="animate-spin" /> Verifying account…
                    </span>
                  ) : receiverName && receiverName !== "Invalid User ID" ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                      <CheckCircle2 size={13} /> Recipient verified: {receiverName}
                    </span>
                  ) : receiverName === "Invalid User ID" ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                      <AlertCircle size={13} /> User ID not found. Check and try again.
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600">Recipient name will appear after ID verification.</span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="transfer-amount" className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Transfer amount
                  </label>
                  <span className="text-[9px] text-slate-600">USD · Minimum $1</span>
                </div>
                <div className="flex items-center rounded-xl border border-white/[0.09] bg-[#111925] px-3.5 transition focus-within:border-[#d4b45f]/60">
                  <span className="mr-2 text-lg font-semibold text-[#e3c46e]">$</span>
                  <input
                    id="transfer-amount"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max={balance}
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent py-3.5 text-lg font-semibold text-white outline-none placeholder:text-slate-600"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleQuickAmount(value)}
                      className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${
                        amount === String(value)
                          ? "border-[#d4b45f]/50 bg-[#d4b45f]/[0.12] text-[#e5c875]"
                          : "border-white/[0.08] bg-white/[0.025] text-slate-400 hover:border-[#d4b45f]/30 hover:text-white"
                      }`}
                    >
                      ${value}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(balance >= 1 ? formatUSD(balance).replaceAll(",", "") : "")}
                    disabled={balance < 1 || walletLoading}
                    className="ml-auto rounded-lg border border-[#d4b45f]/20 px-3 py-1.5 text-[10px] font-bold text-[#d9bd75] transition hover:bg-[#d4b45f]/[0.08] disabled:opacity-40"
                  >
                    Max
                  </button>
                </div>
                {hasValidAmount && numericAmount > balance && (
                  <p className="mt-2 text-[10px] font-medium text-rose-300">
                    Amount is higher than your available balance.
                  </p>
                )}
                {hasValidAmount && numericAmount <= balance && (
                  <p className="mt-2 text-[10px] text-slate-500">
                    Remaining after transfer: <span className="font-semibold text-slate-300">${formatUSD(amountRemaining)}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="transfer-password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Transaction password
                </label>
                <div className="flex items-center rounded-xl border border-white/[0.09] bg-[#111925] px-3.5 transition focus-within:border-[#d4b45f]/60">
                  <LockKeyhole size={16} className="mr-2.5 shrink-0 text-slate-500" />
                  <input
                    id="transfer-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={transactionPassword}
                    onChange={(event) => setTransactionPassword(event.target.value)}
                    placeholder="Enter transaction password"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="ml-2 shrink-0 text-slate-500 transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c5a04c] to-[#ecd58c] px-4 text-xs font-extrabold uppercase tracking-[0.13em] text-[#17130a] shadow-[0_8px_24px_rgba(197,160,76,0.14)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Processing transfer…
                  </>
                ) : (
                  <>
                    Confirm transfer <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3.5">
              <p className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#d9bd75]">
                <ShieldCheck size={12} /> Transfer information
              </p>
              <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-slate-500">
                <li className="flex gap-2"><span className="text-[#d9bd75]">01</span> Minimum transfer amount is $1.</li>
                <li className="flex gap-2"><span className="text-[#d9bd75]">02</span> Transfers cannot be reversed after processing.</li>
                <li className="flex gap-2"><span className="text-[#d9bd75]">03</span> Active package upgrade is required for transfers.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WalletTransferModal;
