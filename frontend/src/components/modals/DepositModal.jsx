// // // import React, { useEffect, useState } from "react";
// // // import api from "../../api/axios"; 
// // // import { QRCodeCanvas } from "qrcode.react";
// // // import { Copy, CheckCircle2, AlertTriangle, X, Wallet, QrCode } from "lucide-react";

// // // // 🔥 FIX: 'isOpen' yahan se hata diya kyunki UserLayout already condition check kar raha hai
// // // export default function DepositModal({ onClose, user, userId }) {
// // //   const [address, setAddress] = useState("");
// // //   const [loading, setLoading] = useState(true);
// // //   const [copied, setCopied] = useState(false);

// // //   // Fetch the permanent address when the modal opens
// // //   useEffect(() => {
// // //     // 🔥 FIX: Jaise hi ye load hoga, turant API hit karega
// // //     if (userId) {
// // //       fetchDepositAddress();
// // //     }
// // //   }, [userId]);

// // //   const fetchDepositAddress = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const token = localStorage.getItem('token');
      
// // //       const res = await api.get("/deposit/get-address", {
// // //         headers: { Authorization: `Bearer ${token}` }
// // //       }); 
      
// // //       setAddress(res.data.address);
// // //     } catch (err) {
// // //       console.error("Failed to fetch address", err);
// // //       alert("Could not load deposit address. Please try again.");
// // //       onClose(); 
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const copyText = async () => {
// // //     if (!address) return;
// // //     try {
// // //       if (navigator.clipboard?.writeText) {
// // //         await navigator.clipboard.writeText(address);
// // //       } else {
// // //         const ta = document.createElement("textarea");
// // //         ta.value = address;
// // //         document.body.appendChild(ta);
// // //         ta.select();
// // //         document.execCommand("copy");
// // //         document.body.removeChild(ta);
// // //       }
// // //       setCopied(true);
// // //       setTimeout(() => setCopied(false), 2000);
// // //     } catch {
// // //       alert("Copy failed. Please copy manually.");
// // //     }
// // //   };

// // //   // 🔥 FIX: Wo 'return null' wali line yahan se completely hata di hai!

// // //   return (
// // //     <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex justify-center items-center p-4">
      
// // //       {/* Modal Container - Height Compact & Scrollable */}
// // //       <div className="bg-white mt-8 w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in duration-300 max-h-[90vh]">
        
// // //         {/* Ambient Glow Effects */}
// // //         <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 blur-[60px] pointer-events-none rounded-full"></div>
// // //         <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 blur-[60px] pointer-events-none rounded-full"></div>

// // //         {/* Header - Padding Reduced */}
// // //         <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center relative z-10 shrink-0">
// // //            <div className="flex items-center gap-3">
// // //               <div className="p-2 bg-green-100 rounded-xl border border-green-200 text-green-600">
// // //                   <Wallet size={18} />
// // //               </div>
// // //               <div>
// // //                 <h2 className="text-slate-800 font-black text-base md:text-lg uppercase tracking-wide flex items-center gap-2">
// // //                   Deposit USDT
// // //                   <span className="bg-green-100 text-green-700 border border-green-200 text-[9px] px-2 py-0.5 rounded-md font-bold tracking-widest">
// // //                     BEP-20
// // //                   </span>
// // //                 </h2>
// // //                 <p className="text-black text-[9px] font-bold uppercase tracking-widest mt-0.5">Add funds to your wallet</p>
// // //               </div>
// // //            </div>
// // //            <button onClick={onClose} className="group bg-white hover:bg-red-50 p-1.5 md:p-2 rounded-full transition-all border border-slate-200 hover:border-red-200 shadow-sm cursor-pointer">
// // //               <X size={18} className="text-slate-400 group-hover:text-red-500" />
// // //            </button>
// // //         </div>

// // //         {/* Body - Padding Reduced & Scrollbar Added */}
// // //         <div className="p-4 md:p-5 relative z-10 flex flex-col items-center bg-white overflow-y-auto custom-scroll">
// // //           {loading ? (
// // //             <div className="py-10 flex flex-col items-center justify-center gap-4">
// // //                <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// // //                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// // //                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// // //                </svg>
// // //                <p className="text-black text-[10px] font-bold uppercase tracking-widest animate-pulse">Generating Secure Address...</p>
// // //             </div>
// // //           ) : (
// // //             <div className="w-full">
// // //               <p className="text-center text-black text-[10px] md:text-[11px] font-medium mb-4 px-1">
// // //                 Send any amount of USDT to this address. Your wallet will be credited automatically.
// // //               </p>

// // //               {/* QR Code Container */}
// // //               <div className="flex justify-center mb-4 relative">
// // //                  <div className="absolute inset-0 bg-green-100 rounded-3xl blur-[15px] opacity-60"></div>
// // //                  <div className="relative p-2.5 bg-white rounded-2xl border-2 border-slate-100 shadow-md flex flex-col items-center">
// // //                    <QRCodeCanvas value={address} size={120} level="H" />
// // //                    <div className="mt-1.5 text-slate-400 font-black text-[8px] tracking-widest uppercase flex items-center gap-1">
// // //                       <QrCode size={10} /> Scan to Pay
// // //                    </div>
// // //                  </div>
// // //               </div>

// // //               {/* Address Display & Copy */}
// // //               <div className="w-full">
// // //                 <label className="block text-[9px] font-bold text-black mb-1 ml-1 uppercase tracking-wider">
// // //                   Your Permanent Deposit Address
// // //                 </label>
// // //                 <div className="flex flex-col sm:flex-row gap-2">
// // //                   <input
// // //                     readOnly
// // //                     value={address}
// // //                     onFocus={(e) => e.target.select()}
// // //                     className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-[11px] md:text-xs font-mono tracking-wider focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all text-center sm:text-left shadow-inner"
// // //                   />
// // //                   <button 
// // //                     onClick={copyText} 
// // //                     className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-black text-[11px] tracking-wide transition-all shadow-sm shrink-0 ${
// // //                         copied 
// // //                             ? 'bg-green-50 text-green-600 border border-green-200' 
// // //                             : 'bg-green-600 hover:bg-green-700 text-white border border-transparent hover:-translate-y-0.5 active:scale-95'
// // //                     }`}
// // //                   >
// // //                     {copied ? <><CheckCircle2 size={14} /> COPIED</> : <><Copy size={14} /> COPY</>}
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {/* Warning Note */}
// // //               <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2 shadow-sm">
// // //                 <AlertTriangle className="text-red-500 shrink-0 w-4 h-4 mt-0.5" />
// // //                 <p className="text-red-600 text-[9px] md:text-[10px] font-bold leading-relaxed">
// // //                   <span className="text-red-800 font-black">WARNING:</span> Send only USDT via the <span className="text-red-800 font-black">BNB Smart Chain (BEP-20)</span> network.
// // //                 </p>
// // //               </div>

// // //               {/* Cancel Button */}
// // //               <div className="mt-4 pt-3 border-t border-slate-100 w-full">
// // //                  <button 
// // //                    onClick={onClose} 
// // //                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
// // //                  >
// // //                     Cancel
// // //                  </button>
// // //               </div>

// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }
// // import React, { useEffect, useState } from "react";
// // import api from "../../api/axios"; 
// // import { QRCodeCanvas } from "qrcode.react";
// // import { ChevronLeft } from "lucide-react"; 
// // import Swal from 'sweetalert2';
// // import SuccessModal from "./SuccessModal"; 

// // export default function DepositModal({ onClose, user, userId }) {
// //   const [address, setAddress] = useState("");
// //   const [loading, setLoading] = useState(true);
// //   const [copied, setCopied] = useState(false);
// //   const [submitting, setSubmitting] = useState(false); 

// //   // 🔥 FORM STATES
// //   const [amount, setAmount] = useState("");
// //   const [txnHash, setTxnHash] = useState("");

// //   // Nayi states custom modal ke liye
// //   const [isSuccessMode, setIsSuccessMode] = useState(false);
// //   const [successMessage, setSuccessMessage] = useState("");

// //   // Exchange rate assumption (1 USDT = 90 INR)
// //   const exchangeRate = 90; 

// //   useEffect(() => {
// //     if (userId) {
// //       fetchDepositAddress();
// //     }
// //   }, [userId]);

// //   const fetchDepositAddress = async () => {
// //     try {
// //       setLoading(true);
// //       const token = localStorage.getItem('token');
      
// //       const res = await api.get("/deposit/get-address", {
// //         headers: { Authorization: `Bearer ${token}` }
// //       }); 
      
// //       setAddress(res.data.address);
// //     } catch (err) {
// //       console.error("Failed to fetch address", err);
// //       alert("Could not load deposit address. Please try again.");
// //       onClose(); 
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const copyText = async () => {
// //     if (!address) return;
// //     try {
// //       if (navigator.clipboard?.writeText) {
// //         await navigator.clipboard.writeText(address);
// //       } else {
// //         const ta = document.createElement("textarea");
// //         ta.value = address;
// //         document.body.appendChild(ta);
// //         ta.select();
// //         document.execCommand("copy");
// //         document.body.removeChild(ta);
// //       }
// //       setCopied(true);
// //       setTimeout(() => setCopied(false), 2000);
// //     } catch {
// //       alert("Copy failed. Please copy manually.");
// //     }
// //   };

// //   // 🔥 Form Reset Function
// //   const handleReset = () => {
// //     setAmount("");
// //     setTxnHash("");
// //   };

// //   // 🔥 Submit Form Function
// //   const handleSubmit = async () => {
// //     if (!amount || !txnHash) {
// //       Swal.fire({
// //         icon: 'warning',
// //         title: 'Incomplete',
// //         text: 'Please enter both Amount and Transaction Hash!',
// //         background: '#111827',
// //         color: '#d4af37'
// //       });
// //       return;
// //     }

// //     try {
// //       setSubmitting(true);
// //       const token = localStorage.getItem('token');

// //       const response = await api.post('/deposit/verify-deposit', {
// //         amount: Number(amount),
// //         transactionHash: txnHash
// //       }, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
      
// //       if (response.data.success) {
// //         setSuccessMessage(response.data.message || "Deposit submitted successfully!");
// //         setIsSuccessMode(true);
// //       }
// //     } catch (error) {
// //       Swal.fire({
// //         icon: 'info',
// //         title: 'Pending...',
// //         text: error.response?.data?.message || "Deposit not found or pending. Please wait.",
// //         confirmButtonColor: '#d4af37',
// //         background: '#111827',
// //         color: '#fff'
// //       });
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   if (isSuccessMode) {
// //     return (
// //       <SuccessModal 
// //         isOpen={true}
// //         onClose={() => {
// //           onClose(); 
// //           window.location.reload(); 
// //         }}
// //         customTitle="Payment Submitted! 🎉"
// //         customMessage={successMessage}
// //         zIndex={2050} 
// //       />
// //     );
// //   }

// //   return (
// //     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex justify-center items-center p-0 sm:p-4">
      
// //       {/* 🔶 MAIN MODAL CONTAINER (Premium Dark & Gold Background) */}
// //       <div className="bg-[#0a0f1c] border border-[#d4af37]/30 w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-xl sm:rounded-2xl flex flex-col relative overflow-y-auto custom-scroll shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        
// //         {/* Header with Back Button */}
// //         <div className="p-4 md:p-5 flex items-center gap-3 border-b border-[#1f2937]">
// //           <button onClick={onClose} className="text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer p-1">
// //             <ChevronLeft size={28} strokeWidth={2.5} />
// //           </button>
// //           <h2 className="text-[20px] md:text-[22px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] uppercase tracking-wide">
// //             Instant Deposit Fund
// //           </h2>
// //         </div>

// //         {/* Body Content */}
// //         <div className="p-5 md:p-6 flex-1 flex flex-col">
          
// //           {/* Form Fields */}
// //           <div className="space-y-5 mb-6">
            
// //             {/* USDT Amount */}
// //             <div>
// //               <label className="block text-gray-300 text-[14px] font-medium mb-2">Fund Amount (USDT)</label>
// //               <input 
// //                 type="number" 
// //                 value={amount}
// //                 onChange={(e) => setAmount(e.target.value)}
// //                 placeholder="Enter USDT Amount" 
// //                 className="w-full p-3 bg-[#111827] text-white rounded-lg border border-gray-700 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder-gray-600"
// //               />
// //             </div>

// //             {/* Transaction Hash */}
// //             <div>
// //               <label className="block text-gray-300 text-[14px] font-medium mb-2">Transaction Hash</label>
// //               <input 
// //                 type="text" 
// //                 value={txnHash}
// //                 onChange={(e) => setTxnHash(e.target.value)}
// //                 placeholder="Paste Transaction Hash" 
// //                 className="w-full p-3 bg-[#111827] text-white rounded-lg border border-gray-700 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder-gray-600"
// //               />
// //               <p className="text-[#d4af37]/70 text-xs mt-2">Example : 0x123456789abcdef....</p>
// //             </div>

// //           </div>

// //           {/* Action Buttons */}
// //           <div className="flex gap-4 mb-8">
// //             <button 
// //               onClick={handleSubmit} 
// //               disabled={submitting || loading}
// //               className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-extrabold px-6 py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
// //             >
// //               {submitting ? "Wait..." : "SUBMIT"}
// //             </button>
// //             <button 
// //               onClick={handleReset}
// //               className="px-6 py-3 bg-transparent border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 font-bold rounded-lg transition-colors"
// //             >
// //               RESET
// //             </button>
// //           </div>

// //           {/* QR Code Section */}
// //           <div className="flex flex-col items-center bg-[#111827] p-5 rounded-xl border border-[#1f2937]">
// //             <h3 className="text-lg font-bold text-[#d4af37] mb-4 text-center">
// //               USDT (BEP-20) Wallet Address
// //             </h3>

// //             {loading ? (
// //               <div className="w-[180px] h-[180px] bg-gray-800 animate-pulse rounded-xl flex items-center justify-center mb-5 border border-gray-700">
// //                 <span className="text-[#d4af37] text-sm font-bold">Loading QR...</span>
// //               </div>
// //             ) : (
// //               <div className="bg-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-6 border-4 border-[#d4af37] inline-block">
// //                 <QRCodeCanvas value={address} size={180} level="H" />
// //               </div>
// //             )}

// //             {/* Readonly Address Field */}
// //             <div className="w-full mb-4">
// //               <input 
// //                 type="text" 
// //                 value={address || "Loading address..."}
// //                 readOnly
// //                 className="w-full p-3 bg-black/40 text-[#d4af37] text-sm md:text-sm rounded-lg border border-[#d4af37]/30 outline-none text-center font-mono tracking-wide"
// //               />
// //             </div>

// //             {/* Copy Button */}
// //             <div className="w-full flex justify-center">
// //               <button 
// //                 onClick={copyText}
// //                 className="w-full sm:w-auto bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-extrabold px-10 py-2.5 rounded-lg transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] hover:scale-[1.02]"
// //               >
// //                 {copied ? "COPIED!" : "COPY ADDRESS"}
// //               </button>
// //             </div>

// //           </div>

// //         </div>
// //       </div>
      
// //     </div>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import api from "../../api/axios"; 
// import { QRCodeCanvas } from "qrcode.react";
// import { ChevronLeft } from "lucide-react"; 
// import Swal from 'sweetalert2';
// import SuccessModal from "./SuccessModal"; 

// export default function DepositModal({ onClose, user, userId }) {
//   const [address, setAddress] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [copied, setCopied] = useState(false);
//   const [submitting, setSubmitting] = useState(false); 

//   // 🔥 FORM STATES
//   const [amount, setAmount] = useState("");
//   const [txnHash, setTxnHash] = useState("");

//   const [isSuccessMode, setIsSuccessMode] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");

//   useEffect(() => {
//     if (userId) {
//       fetchDepositAddress();
//     }
//   }, [userId]);

//   const fetchDepositAddress = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       const res = await api.get("/deposit/get-address", {
//         headers: { Authorization: `Bearer ${token}` }
//       }); 
      
//       setAddress(res.data.address);
//     } catch (err) {
//       console.error("Failed to fetch address", err);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Could not load deposit address. Please try again.',
//         background: '#111827',
//         color: '#fff'
//       });
//       onClose(); 
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyText = async () => {
//     if (!address) return;
//     try {
//       if (navigator.clipboard?.writeText) {
//         await navigator.clipboard.writeText(address);
//       } else {
//         const ta = document.createElement("textarea");
//         ta.value = address;
//         document.body.appendChild(ta);
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);
//       }
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch {
//       alert("Copy failed. Please copy manually.");
//     }
//   };

//   const handleReset = () => {
//     setAmount("");
//     setTxnHash("");
//   };

//   const handleSubmit = async () => {
//     if (!amount || !txnHash) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Incomplete',
//         text: 'Please enter both Amount and Transaction Hash!',
//         background: '#111827',
//         color: '#d4af37'
//       });
//       return;
//     }

//     // 🔥 Safety Check: Agar address abhi tak load nahi hua toh rok do
//     if (!address) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Please Wait',
//         text: 'Deposit address is still loading. Please wait a moment.',
//         background: '#111827',
//         color: '#d4af37'
//       });
//       return;
//     }

//     try {
//       setSubmitting(true);
//       const token = localStorage.getItem('token');

//       const response = await api.post('/deposit/verify-deposit', {
//         amount: Number(amount),
//         transactionHash: txnHash
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       if (response.data.success) {
//         setSuccessMessage(response.data.message || "Deposit submitted successfully!");
//         setIsSuccessMode(true);
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'info',
//         title: 'Submitted / Pending',
//         text: error.response?.data?.message || "Deposit request registered. Please wait for confirmation.",
//         confirmButtonColor: '#d4af37',
//         background: '#111827',
//         color: '#fff'
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (isSuccessMode) {
//     return (
//       <SuccessModal 
//         isOpen={true}
//         onClose={() => {
//           onClose(); 
//           window.location.reload(); 
//         }}
//         customTitle="Payment Submitted! 🎉"
//         customMessage={successMessage}
//         zIndex={2050} 
//       />
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex justify-center items-center p-0 sm:p-4">
      
//       <div className="bg-[#0a0f1c] border border-[#d4af37]/30 w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-xl sm:rounded-2xl flex flex-col relative overflow-y-auto custom-scroll shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        
//         {/* Header */}
//         <div className="p-4 md:p-5 flex items-center gap-3 border-b border-[#1f2937]">
//           <button onClick={onClose} className="text-gray-400 hover:text-[#d4af37] transition-colors cursor-pointer p-1">
//             <ChevronLeft size={28} strokeWidth={2.5} />
//           </button>
//           <h2 className="text-[20px] md:text-[22px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] uppercase tracking-wide">
//             Instant Deposit Fund
//           </h2>
//         </div>

//         {/* Body Content */}
//         <div className="p-5 md:p-6 flex-1 flex flex-col">
          
//           {/* Form Fields */}
//           <div className="space-y-5 mb-6">
//             <div>
//               <label className="block text-gray-300 text-[14px] font-medium mb-2">Fund Amount (USDT)</label>
//               <input 
//                 type="number" 
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 placeholder="Enter USDT Amount" 
//                 className="w-full p-3 bg-[#111827] text-white rounded-lg border border-gray-700 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder-gray-600"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-300 text-[14px] font-medium mb-2">Transaction Hash</label>
//               <input 
//                 type="text" 
//                 value={txnHash}
//                 onChange={(e) => setTxnHash(e.target.value)}
//                 placeholder="Paste Transaction Hash" 
//                 className="w-full p-3 bg-[#111827] text-white rounded-lg border border-gray-700 outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all placeholder-gray-600"
//               />
//               <p className="text-[#d4af37]/70 text-xs mt-2">Example : 0x123456789abcdef....</p>
//             </div>
//           </div>

//           {/* Action Buttons (Disabled if address is loading) */}
//           <div className="flex gap-4 mb-8">
//             <button 
//               onClick={handleSubmit} 
//               disabled={submitting || loading || !address}
//               className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-extrabold px-6 py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
//             >
//               {loading ? "Loading Address..." : submitting ? "Submitting..." : "SUBMIT"}
//             </button>
//             <button 
//               onClick={handleReset}
//               className="px-6 py-3 bg-transparent border-2 border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 font-bold rounded-lg transition-colors"
//             >
//               RESET
//             </button>
//           </div>

//           {/* QR Code Section */}
//           <div className="flex flex-col items-center bg-[#111827] p-5 rounded-xl border border-[#1f2937]">
//             <h3 className="text-lg font-bold text-[#d4af37] mb-4 text-center">
//               USDT (BEP-20) Wallet Address
//             </h3>

//             {loading ? (
//               <div className="w-[180px] h-[180px] bg-gray-800 animate-pulse rounded-xl flex items-center justify-center mb-5 border border-gray-700">
//                 <span className="text-[#d4af37] text-sm font-bold">Loading QR...</span>
//               </div>
//             ) : (
//               <div className="bg-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-6 border-4 border-[#d4af37] inline-block">
//                 <QRCodeCanvas value={address} size={180} level="H" />
//               </div>
//             )}

//             <div className="w-full mb-4">
//               <input 
//                 type="text" 
//                 value={address || "Loading address..."}
//                 readOnly
//                 className="w-full p-3 bg-black/40 text-[#d4af37] text-sm md:text-sm rounded-lg border border-[#d4af37]/30 outline-none text-center font-mono tracking-wide"
//               />
//             </div>

//             <div className="w-full flex justify-center">
//               <button 
//                 onClick={copyText}
//                 disabled={!address}
//                 className="w-full sm:w-auto bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black font-extrabold px-10 py-2.5 rounded-lg transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] hover:scale-[1.02] disabled:opacity-50"
//               >
//                 {copied ? "COPIED!" : "COPY ADDRESS"}
//               </button>
//             </div>

//           </div>

//         </div>
//       </div>
      
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Info,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import SuccessModal from "./SuccessModal";

const swalTheme = {
  background: "#101722",
  color: "#f8fafc",
  confirmButtonColor: "#d6b45e",
};

const formatAddress = (value) => String(value || "").trim();

export default function DepositModal({ onClose, userId }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [txnHash, setTxnHash] = useState("");
  const [isSuccessMode, setIsSuccessMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDepositAddress = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/deposit/get-address", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cancelled) {
          setAddress(formatAddress(res?.data?.address));
        }
      } catch (error) {
        console.error("Failed to fetch deposit address:", error);

        if (!cancelled) {
          await Swal.fire({
            ...swalTheme,
            icon: "error",
            title: "Address unavailable",
            text: "We could not load the deposit address. Please try again.",
          });
          onClose?.();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDepositAddress();

    return () => {
      cancelled = true;
    };
  }, [userId, onClose]);

  const copyText = async () => {
    if (!address) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copiedSuccessfully = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!copiedSuccessfully) throw new Error("Clipboard copy failed");
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Address copy failed:", error);
      await Swal.fire({
        ...swalTheme,
        icon: "info",
        title: "Copy unavailable",
        text: "Please select and copy the wallet address manually.",
      });
    }
  };

  const handleReset = () => {
    setAmount("");
    setTxnHash("");
  };

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    const cleanHash = txnHash.trim();

    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      await Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Enter a valid amount",
        text: "Please enter a deposit amount greater than zero.",
      });
      return;
    }

    if (!cleanHash) {
      await Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Transaction hash required",
        text: "Paste the transaction hash for your USDT transfer.",
      });
      return;
    }

    if (!address) {
      await Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Address not ready",
        text: "The deposit address is not available yet. Please wait and try again.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/deposit/verify-deposit",
        {
          amount: numericAmount,
          transactionHash: cleanHash,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        setSuccessMessage(
          response.data.message || "Your deposit has been submitted successfully."
        );
        setIsSuccessMode(true);
      } else {
        await Swal.fire({
          ...swalTheme,
          icon: "info",
          title: "Awaiting confirmation",
          text:
            response?.data?.message ||
            "Your request was received. Please wait for confirmation.",
        });
      }
    } catch (error) {
      await Swal.fire({
        ...swalTheme,
        icon: "info",
        title: "Deposit status",
        text:
          error.response?.data?.message ||
          "The request could not be confirmed right now. Please check your transaction status before submitting it again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccessMode) {
    return (
      <SuccessModal
        isOpen={true}
        onClose={() => {
          onClose?.();
          window.location.reload();
        }}
        customTitle="Deposit Submitted!"
        customMessage={successMessage}
        zIndex={2050}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#02050a]/90 p-0 backdrop-blur-md sm:p-4">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#080e18] text-white shadow-[0_25px_100px_rgba(0,0,0,0.65)] sm:h-auto sm:max-h-[94vh] sm:max-w-2xl sm:rounded-[28px] sm:border sm:border-[#d6b45e]/25">
        {/* Ambient background accents */}
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#d6b45e]/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-cyan-500/[0.06] blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#d6b45e]/50 hover:text-[#f0d58c]"
              aria-label="Close deposit window"
            >
              <ChevronLeft size={21} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d6b45e]">
                Wallet
              </p>
              <h2 className="mt-0.5 truncate text-lg font-extrabold tracking-wide text-white sm:text-xl">
                Add Funds
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1.5">
            <ShieldCheck size={13} className="text-emerald-300" />
            <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-emerald-200 sm:text-[10px]">
              Secure Deposit
            </span>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div className="grid gap-5 p-4 sm:gap-6 sm:p-6 md:grid-cols-[1fr_0.92fr]">
            {/* Deposit details */}
            <section className="min-w-0 space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d6b45e]/10 text-[#e6c978]">
                    <ArrowDownToLine size={16} />
                  </span>
                  <h3 className="text-sm font-bold text-white">Deposit details</h3>
                </div>
                <p className="pl-10 text-xs leading-relaxed text-slate-400">
                  Enter the amount you transferred and the transaction hash from your wallet.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="deposit-amount"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300"
                  >
                    Deposit amount
                  </label>
                  <div className="flex items-center rounded-2xl border border-white/10 bg-[#101927] px-4 transition focus-within:border-[#d6b45e]/70 focus-within:ring-2 focus-within:ring-[#d6b45e]/10">
                    <span className="mr-3 text-sm font-extrabold text-[#e5c36c]">USDT</span>
                    <input
                      id="deposit-amount"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                      className="min-w-0 w-full bg-transparent py-4 text-lg font-semibold text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="deposit-hash"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300"
                  >
                    Transaction hash
                  </label>
                  <textarea
                    id="deposit-hash"
                    rows={3}
                    value={txnHash}
                    onChange={(event) => setTxnHash(event.target.value)}
                    placeholder="Paste your transaction hash here"
                    spellCheck={false}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-[#101927] px-4 py-3.5 font-mono text-xs leading-relaxed text-white outline-none transition placeholder:font-sans placeholder:text-slate-600 focus:border-[#d6b45e]/70 focus:ring-2 focus:ring-[#d6b45e]/10"
                  />
                  <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                    <Info size={12} className="mt-0.5 shrink-0 text-[#d6b45e]" />
                    Make sure the hash belongs to the USDT transfer on the BEP-20 network.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-bold tracking-wide text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50 sm:flex-1"
                >
                  <RefreshCw size={14} />
                  CLEAR FORM
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || loading || !address}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c6a24e] via-[#e8ce82] to-[#c6a24e] px-4 py-3.5 text-xs font-black tracking-[0.12em] text-[#17130a] shadow-[0_8px_25px_rgba(198,162,78,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-[1.35]"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin" />
                      VERIFYING...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      VERIFY DEPOSIT
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Wallet address / QR */}
            <section className="min-w-0 rounded-[22px] border border-[#d6b45e]/20 bg-gradient-to-b from-[#121b29] to-[#0c1420] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d6b45e]">
                    Send USDT to
                  </p>
                  <h3 className="mt-1 text-sm font-extrabold text-white">Deposit wallet</h3>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                    BEP-20
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-white/[0.07] bg-[#070c14]/70 px-3 py-5">
                {loading ? (
                  <div className="flex h-[180px] w-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                    <LoaderCircle size={25} className="animate-spin text-[#d6b45e]" />
                    <span className="text-[10px] font-semibold text-slate-400">
                      Loading wallet...
                    </span>
                  </div>
                ) : address ? (
                  <div className="rounded-2xl border border-[#d6b45e]/50 bg-white p-2.5 shadow-[0_0_28px_rgba(214,180,94,0.12)]">
                    <QRCodeCanvas value={address} size={164} level="H" includeMargin />
                  </div>
                ) : (
                  <div className="flex h-[185px] w-[185px] flex-col items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] px-4 text-center">
                    <Wallet size={25} className="text-rose-300" />
                    <span className="text-xs font-bold text-rose-200">
                      Address unavailable
                    </span>
                    <span className="text-[10px] leading-relaxed text-slate-500">
                      Close this window and try again.
                    </span>
                  </div>
                )}

                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Wallet address
                </p>
                <div className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="break-all text-center font-mono text-[10px] leading-relaxed text-[#e6c978] sm:text-[11px]">
                    {loading ? "Loading address..." : address || "No deposit address available"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyText}
                  disabled={!address || loading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d6b45e]/35 bg-[#d6b45e]/[0.08] px-4 py-3 text-[10px] font-extrabold tracking-[0.13em] text-[#f0d58c] transition hover:bg-[#d6b45e]/[0.15] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "ADDRESS COPIED" : "COPY WALLET ADDRESS"}
                </button>
              </div>

              <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-300/15 bg-amber-300/[0.045] p-3">
                <Info size={15} className="mt-0.5 shrink-0 text-[#e5c36c]" />
                <p className="text-[10px] leading-relaxed text-slate-400">
                  Send <span className="font-bold text-[#e5c36c]">USDT on BEP-20 only</span>.
                  Sending funds through another network may result in loss of funds.
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className="relative flex items-center justify-center gap-2 border-t border-white/[0.07] px-4 py-3 text-center">
          <ShieldCheck size={12} className="text-emerald-400" />
          <p className="text-[9px] font-medium tracking-wide text-slate-500">
            Always verify the network and wallet address before sending funds.
          </p>
        </div>
      </div>
    </div>
  );
}
