// // // // // import React, { useState, useEffect } from "react";
// // // // // import api from "../../api/axios"; 
// // // // // import SuccessModal from "./SuccessModal";
// // // // // import MessageModal from "./MessageModal";
// // // // // import { useAuth } from "../../context/AuthContext";
// // // // // import { CheckCircle, ShieldCheck, Zap, X } from "lucide-react"; 

// // // // // const PACKAGE_AMOUNT = 30;

// // // // // const TopUpModal = ({ onClose, onTopUpSuccess }) => {
// // // // //   const { user: loggedInUser, token, login } = useAuth();
// // // // //   const [userId, setUserId] = useState("");
// // // // //   const [userInfo, setUserInfo] = useState(null);
  
// // // // //   const [walletBalance, setWalletBalance] = useState(null);
// // // // //   const [transactionPassword, setTransactionPassword] = useState("");
// // // // //   const [loading, setLoading] = useState(false);
  
// // // // //   const isPromoUser = loggedInUser?.role === "promo";
// // // // //   const isLeaderUser = loggedInUser?.role === "leader";

// // // // //   const [successModalOpen, setSuccessModalOpen] = useState(false);
// // // // //   const [successData, setSuccessData] = useState({ userId: "", name: "", amount: 0 });
// // // // //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

// // // // //   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

// // // // //   // 1. Fetch Balance
// // // // //   useEffect(() => {
// // // // //     const fetchBalance = async () => {
// // // // //       if (!loggedInUser?.userId || !token) return;
// // // // //       try {
// // // // //         const res = await api.get(`/user/${loggedInUser.userId}`, {
// // // // //           headers: { Authorization: `Bearer ${token}` },
// // // // //         });
// // // // //         setWalletBalance(res.data.user.walletBalance || 0);
// // // // //       } catch (err) {
// // // // //         console.error(err);
// // // // //         setWalletBalance(0);
// // // // //       }
// // // // //     };
// // // // //     fetchBalance();
// // // // //   }, [loggedInUser?.userId, token]);

// // // // //   const isBought = userInfo?.packages?.some(p => p.amount === PACKAGE_AMOUNT) || false;

// // // // //   // 2. Fetch User (Only for Non-Promo users)
// // // // //   const fetchUser = async (idToFetch, showManualError = false) => {
// // // // //     if (isPromoUser) return; // Promo user ko fetch karne ki zaroorat nahi
    
// // // // //     if (!idToFetch || idToFetch.toString().trim() === "") {
// // // // //       setUserInfo(null);
// // // // //       return;
// // // // //     }
// // // // //     try {
// // // // //       const res = await api.get(`/user/${idToFetch}`, {
// // // // //         headers: { Authorization: `Bearer ${token}` },
// // // // //       });
// // // // //       if (res.data && res.data.user) {
// // // // //         setUserInfo(res.data.user);
// // // // //       } else {
// // // // //         setUserInfo(null);
// // // // //         if (showManualError) showMessage("Error", "❌ User details not found", "error");
// // // // //       }
// // // // //     } catch (err) {
// // // // //       setUserInfo(null);
// // // // //       if (showManualError) {
// // // // //         const errorMsg = err.response?.data?.message || "❌ User not found";
// // // // //         showMessage("Error", errorMsg, "error");
// // // // //       }
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (isPromoUser) return;
// // // // //     const delayDebounceFn = setTimeout(() => {
// // // // //       if (userId && userId.trim() !== "") fetchUser(userId, false);
// // // // //       else setUserInfo(null);
// // // // //     }, 500);
// // // // //     return () => clearTimeout(delayDebounceFn);
// // // // //   }, [userId, token, isPromoUser]);

// // // // //   // 3. Handle Top Up
// // // // //   const handleTopUp = async () => {
// // // // //     if (!transactionPassword) return showMessage("Error", "❌ Enter transaction password.", "error");
// // // // //     setLoading(true);

// // // // //     try {
// // // // //       if (isPromoUser) {
// // // // //         // PROMO USER HIT
// // // // //         const res = await api.post(`/user/promo-dummy-topup`, { amount: PACKAGE_AMOUNT, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });
// // // // //         setSuccessData({ userId: res.data.generatedId, name: res.data.name, amount: PACKAGE_AMOUNT });
// // // // //         setSuccessModalOpen(true);
// // // // //         if (onTopUpSuccess) onTopUpSuccess();
// // // // //         setTransactionPassword("");
// // // // //       } else {
// // // // //         // NORMAL OR LEADER HIT
// // // // //         if (!userInfo) { setLoading(false); return showMessage("Error", "❌ Please fetch user first.", "error"); }
// // // // //         if (walletBalance < PACKAGE_AMOUNT) { setLoading(false); return showMessage("Error", `❌ Insufficient balance. You have $${walletBalance}`, "error"); }
// // // // //         if (isBought) { setLoading(false); return showMessage("Active", `✅ ID is already active with $${PACKAGE_AMOUNT}.`, "warning"); }

// // // // //         const endpoint = isLeaderUser ? `/user/leader-topup/${Number(userId)}` : `/user/topup/${Number(userId)}`;
// // // // //         await api.put(endpoint, { amount: PACKAGE_AMOUNT, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });

// // // // //         setSuccessData({ userId: userInfo.userId, name: userInfo.name, amount: PACKAGE_AMOUNT });
// // // // //         setSuccessModalOpen(true);

// // // // //         const refreshedRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
// // // // //         const refreshedUser = refreshedRes.data.user;

// // // // //         if (Number(userId) === loggedInUser.userId) {
// // // // //           login(refreshedUser, token);
// // // // //           setWalletBalance(refreshedUser.walletBalance);
// // // // //         } else {
// // // // //           setUserInfo(refreshedUser);
// // // // //         }

// // // // //         if (onTopUpSuccess) onTopUpSuccess();
// // // // //         setTransactionPassword("");
// // // // //       }
// // // // //     } catch (err) {
// // // // //       const msg = err.response?.data?.message || "❌ Top-up failed";
// // // // //       showMessage("Transaction Failed", msg, "error");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
      
// // // // //       <div className="bg-white w-full max-w-md flex flex-col rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] animate-in zoom-in duration-300">
        
// // // // //         {/* Header */}
// // // // //         <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center z-20 shrink-0">
// // // // //           <div className="flex items-center gap-3">
// // // // //             <div className="bg-green-100 p-2 rounded-xl border border-green-200">
// // // // //                <Zap size={18} className="text-green-600" />
// // // // //             </div>
// // // // //             <div>
// // // // //               <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Activate <span className="text-green-600">Node</span></h1>
// // // // //             </div>
// // // // //           </div>
// // // // //           <button onClick={onClose} className="group bg-white hover:bg-red-50 p-1.5 md:p-2 rounded-full transition-all border border-slate-200 hover:border-red-200 shadow-sm cursor-pointer">
// // // // //              <X size={18} className="text-slate-400 group-hover:text-red-500" />
// // // // //           </button>
// // // // //         </div>

// // // // //         {/* Content Body */}
// // // // //         <div className="flex-1 p-4 md:p-5 space-y-4 z-10 bg-white overflow-y-auto custom-scroll">
          
// // // // //           <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
// // // // //              <div>
// // // // //                 <span className="text-black text-[9px] uppercase tracking-wider font-bold block mb-0.5">Your Balance</span>
// // // // //                 <div className="text-base md:text-lg font-black text-slate-800 font-mono">
// // // // //     {walletBalance !== null ? `$${(Math.floor(Number(walletBalance) * 100) / 100).toFixed(2)}` : "..."}
// // // // //                 </div>
// // // // //              </div>
// // // // //              <div className="text-right">
// // // // //                 <span className="text-black text-[9px] uppercase tracking-wider font-bold block mb-0.5">Package</span>
// // // // //                 <div className="text-base md:text-lg font-black text-green-600 font-mono">
// // // // //                   ${PACKAGE_AMOUNT}
// // // // //                 </div>
// // // // //              </div>
// // // // //           </div>

// // // // //           <div className="space-y-1.5">
// // // // //             <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Target Node ID</label>
// // // // //             <div className="flex gap-2">
// // // // //               <div className="relative flex-1">
// // // // //                 {isPromoUser ? (
// // // // //                   <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-3 font-bold flex items-center justify-center gap-2 shadow-sm text-sm">
// // // // //                     <ShieldCheck size={18} /> System will Auto-Pick an Inactive ID
// // // // //                   </div>
// // // // //                 ) : (
// // // // //                   <>
// // // // //                     <input 
// // // // //                       type="number" 
// // // // //                       placeholder="Enter Node ID"
// // // // //                       value={userId}
// // // // //                       onChange={(e) => setUserId(e.target.value)}
// // // // //                       className={`w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-2.5 md:py-3 outline-none transition-all placeholder-slate-400 font-mono shadow-inner text-xs md:text-sm ${
// // // // //                           userInfo ? 'border border-green-500 ring-2 ring-green-100' : 'border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'
// // // // //                       }`}
// // // // //                     />
// // // // //                     {userInfo && (
// // // // //                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
// // // // //                         <CheckCircle size={18} />
// // // // //                       </div>
// // // // //                     )}
// // // // //                   </>
// // // // //                 )}
// // // // //               </div>
              
// // // // //               {!isPromoUser && !userInfo && (
// // // // //                 <button onClick={() => fetchUser(userId, true)} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 rounded-xl font-bold transition-all shadow-sm text-xs md:text-sm">
// // // // //                   Check
// // // // //                 </button>
// // // // //               )}
// // // // //             </div>
            
// // // // //             {/* Fetched User Info Area */}
// // // // //             {!isPromoUser && (
// // // // //               <div className="mt-1 min-h-[50px]">
// // // // //                 {userInfo ? (
// // // // //                   <div className={`border rounded-xl p-2.5 flex justify-between items-center transition-all shadow-sm ${isBought ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
// // // // //                     <div>
// // // // //                       <div className="text-slate-800 font-black text-[11px] md:text-xs">{userInfo.name}</div>
// // // // //                       <div className="text-[10px] font-mono text-black mt-0.5">ID: {userInfo.userId}</div>
// // // // //                     </div>
// // // // //                     <div className="text-right">
// // // // //                       {isBought && (
// // // // //                         <div className="text-green-600 font-black text-[10px] uppercase flex items-center gap-1">
// // // // //                            <CheckCircle size={12}/> Active
// // // // //                         </div>
// // // // //                       )}
// // // // //                     </div>
// // // // //                   </div>
// // // // //                 ) : (
// // // // //                   userId.length > 0 && <div className="text-[10px] text-slate-400 italic px-2 pt-1">Checking ID details...</div>
// // // // //                 )}
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>

// // // // //         {/* Footer (Payment Action) */}
// // // // //         <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 z-20">
// // // // //           <div className="space-y-3">
// // // // //              <div className="relative">
// // // // //                 <input
// // // // //                   type="password"
// // // // //                   placeholder="Transaction Password"
// // // // //                   value={transactionPassword}
// // // // //                   onChange={(e) => setTransactionPassword(e.target.value)}
// // // // //                   className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all placeholder-slate-400 font-mono shadow-sm text-xs md:text-sm"
// // // // //                 />
// // // // //              </div>
             
// // // // //              <button 
// // // // //                onClick={handleTopUp} 
// // // // //                disabled={loading || isBought || (!isPromoUser && !userInfo)}
// // // // //                className={`
// // // // //                  w-full py-3 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm
// // // // //                  ${loading || isBought || (!isPromoUser && !userInfo) 
// // // // //                     ? 'bg-slate-200 text-black cursor-not-allowed border border-slate-300' 
// // // // //                     : 'bg-green-600 hover:bg-green-700 text-white shadow-[0_4px_15px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.6)] hover:-translate-y-0.5'}
// // // // //                `}
// // // // //              >
// // // // //                {loading ? "PROCESSING..." : (
// // // // //                  <>
// // // // //                    ACTIVATE NOW <span className={loading || isBought || (!isPromoUser && !userInfo) ? "text-slate-400" : "text-green-200"}>($30)</span>
// // // // //                  </>
// // // // //                )}
// // // // //              </button>

// // // // //              <button 
// // // // //                onClick={onClose} 
// // // // //                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
// // // // //              >
// // // // //                 Cancel
// // // // //              </button>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>

// // // // //     <SuccessModal
// // // // //         isOpen={successModalOpen}
// // // // //         onClose={() => { setSuccessModalOpen(false); onClose(); }}
// // // // //         type="topup"
// // // // //         userId={successData.userId}
// // // // //         userName={successData.name} 
// // // // //         amount={successData.amount}
// // // // //         reward={0}
// // // // //       />
// // // // //       <MessageModal
// // // // //         isOpen={messageModal.open}
// // // // //         onClose={() => setMessageModal({ ...messageModal, open: false })}
// // // // //         title={messageModal.title}
// // // // //         message={messageModal.message}
// // // // //         type={messageModal.type}
// // // // //       />
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default TopUpModal;


// // // // import React, { useState, useEffect } from "react";
// // // // import api from "../../api/axios"; 
// // // // import SuccessModal from "./SuccessModal";
// // // // import MessageModal from "./MessageModal";
// // // // import { useAuth } from "../../context/AuthContext";
// // // // import { CheckCircle, ShieldCheck, Zap, X } from "lucide-react"; 

// // // // const PACKAGE_AMOUNT = 30;

// // // // const TopUpModal = ({ onClose, onTopUpSuccess }) => {
// // // //   const { user: loggedInUser, token, login } = useAuth();
// // // //   const [userId, setUserId] = useState("");
// // // //   const [userInfo, setUserInfo] = useState(null);
  
// // // //   // 🔥 DONO WALLETS KE LIYE STATE
// // // //   const [walletBalance, setWalletBalance] = useState(null);
// // // //   const [usdtBalance, setUsdtBalance] = useState(null); 

// // // //   const [transactionPassword, setTransactionPassword] = useState("");
// // // //   const [loading, setLoading] = useState(false);
  
// // // //   const isPromoUser = loggedInUser?.role === "promo";
// // // //   const isLeaderUser = loggedInUser?.role === "leader" || loggedInUser?.role === "superleader";

// // // //   const [successModalOpen, setSuccessModalOpen] = useState(false);
// // // //   const [successData, setSuccessData] = useState({ userId: "", name: "", amount: 0 });
// // // //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });

// // // //   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

// // // //   // 1. Fetch Balance (🔥 Fetch Both Balances)
// // // //   useEffect(() => {
// // // //     const fetchBalance = async () => {
// // // //       if (!loggedInUser?.userId || !token) return;
// // // //       try {
// // // //         const res = await api.get(`/user/${loggedInUser.userId}`, {
// // // //           headers: { Authorization: `Bearer ${token}` },
// // // //         });
// // // //         setWalletBalance(res.data.user.walletBalance || 0);
// // // //         setUsdtBalance(res.data.user.usdtBep20Balance || 0); // 🔥 NAYA USDT BEP20 FETCH
// // // //       } catch (err) {
// // // //         console.error(err);
// // // //         setWalletBalance(0);
// // // //         setUsdtBalance(0);
// // // //       }
// // // //     };
// // // //     fetchBalance();
// // // //   }, [loggedInUser?.userId, token]);

// // // //   const isBought = userInfo?.packages?.some(p => p.amount === PACKAGE_AMOUNT) || false;

// // // //   // 2. Fetch User (Only for Non-Promo users)
// // // //   const fetchUser = async (idToFetch, showManualError = false) => {
// // // //     if (isPromoUser) return; // Promo user ko fetch karne ki zaroorat nahi
    
// // // //     if (!idToFetch || idToFetch.toString().trim() === "") {
// // // //       setUserInfo(null);
// // // //       return;
// // // //     }
// // // //     try {
// // // //       const res = await api.get(`/user/${idToFetch}`, {
// // // //         headers: { Authorization: `Bearer ${token}` },
// // // //       });
// // // //       if (res.data && res.data.user) {
// // // //         setUserInfo(res.data.user);
// // // //       } else {
// // // //         setUserInfo(null);
// // // //         if (showManualError) showMessage("Error", "❌ User details not found", "error");
// // // //       }
// // // //     } catch (err) {
// // // //       setUserInfo(null);
// // // //       if (showManualError) {
// // // //         const errorMsg = err.response?.data?.message || "❌ User not found";
// // // //         showMessage("Error", errorMsg, "error");
// // // //       }
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     if (isPromoUser) return;
// // // //     const delayDebounceFn = setTimeout(() => {
// // // //       if (userId && userId.trim() !== "") fetchUser(userId, false);
// // // //       else setUserInfo(null);
// // // //     }, 500);
// // // //     return () => clearTimeout(delayDebounceFn);
// // // //   }, [userId, token, isPromoUser]);

// // // //   // 3. Handle Top Up
// // // //   const handleTopUp = async () => {
// // // //     if (!transactionPassword) return showMessage("Error", "❌ Enter transaction password.", "error");
// // // //     setLoading(true);

// // // //     try {
// // // //       if (isPromoUser) {
// // // //         // PROMO USER HIT
// // // //         const res = await api.post(`/user/promo-dummy-topup`, { amount: PACKAGE_AMOUNT, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });
// // // //         setSuccessData({ userId: res.data.generatedId, name: res.data.name, amount: PACKAGE_AMOUNT });
// // // //         setSuccessModalOpen(true);
// // // //         if (onTopUpSuccess) onTopUpSuccess();
// // // //         setTransactionPassword("");
// // // //       } else {
// // // //         // NORMAL OR LEADER HIT
// // // //         if (!userInfo) { setLoading(false); return showMessage("Error", "❌ Please fetch user first.", "error"); }
// // // //         if (isBought) { setLoading(false); return showMessage("Active", `✅ ID is already active with $${PACKAGE_AMOUNT}.`, "warning"); }

// // // //         const endpoint = isLeaderUser ? `/user/leader-topup/${Number(userId)}` : `/user/topup/${Number(userId)}`;
// // // //         await api.put(endpoint, { amount: PACKAGE_AMOUNT, transactionPassword }, { headers: { Authorization: `Bearer ${token}` } });

// // // //         setSuccessData({ userId: userInfo.userId, name: userInfo.name, amount: PACKAGE_AMOUNT });
// // // //         setSuccessModalOpen(true);

// // // //         // 🔥 Update Both Balances After Success
// // // //         const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
// // // //         const refreshedUser = refreshedRes.data.user;

// // // //         login(refreshedUser, token); // Update context
// // // //         setWalletBalance(refreshedUser.walletBalance);
// // // //         setUsdtBalance(refreshedUser.usdtBep20Balance);

// // // //         if (Number(userId) !== loggedInUser.userId) {
// // // //              const targetRes = await api.get(`/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
// // // //              setUserInfo(targetRes.data.user);
// // // //         }

// // // //         if (onTopUpSuccess) onTopUpSuccess();
// // // //         setTransactionPassword("");
// // // //       }
// // // //     } catch (err) {
// // // //       // Backend se jo error aayega (jaise Insufficient USDT) wo yahan dikhega
// // // //       const msg = err.response?.data?.message || "❌ Top-up failed";
// // // //       showMessage("Transaction Failed", msg, "error");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
      
// // // //       <div className="bg-white w-full max-w-md flex flex-col rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative max-h-[90vh] animate-in zoom-in duration-300">
        
// // // //         {/* Header */}
// // // //         <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center z-20 shrink-0">
// // // //           <div className="flex items-center gap-3">
// // // //             <div className="bg-green-100 p-2 rounded-xl border border-green-200">
// // // //                <Zap size={18} className="text-green-600" />
// // // //             </div>
// // // //             <div>
// // // //               <h1 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Activate <span className="text-green-600">Node</span></h1>
// // // //             </div>
// // // //           </div>
// // // //           <button onClick={onClose} className="group bg-white hover:bg-red-50 p-1.5 md:p-2 rounded-full transition-all border border-slate-200 hover:border-red-200 shadow-sm cursor-pointer">
// // // //              <X size={18} className="text-slate-400 group-hover:text-red-500" />
// // // //           </button>
// // // //         </div>

// // // //         {/* Content Body */}
// // // //         <div className="flex-1 p-4 md:p-5 space-y-4 z-10 bg-white overflow-y-auto custom-scroll">
          
// // // //           {/* 🔥 3-PART WALLET BOX: DONO BALANCES DIKHAYEGA */}
// // // //           <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-3 shadow-sm gap-2">
// // // //              <div className="flex-1">
// // // //                 <span className="text-black text-[9px] uppercase tracking-wider font-bold block mb-0.5"> Wallet Balance</span>
// // // //                 <div className="text-[13px] md:text-sm font-black text-purple-600 font-mono truncate">
// // // //                   {walletBalance !== null ? `$${(Math.floor(Number(walletBalance) * 100) / 100).toFixed(2)}` : "..."}
// // // //                 </div>
// // // //              </div>
// // // //              <div className="flex-1 border-l border-slate-200 pl-2">
// // // //                 <span className="text-black text-[9px] uppercase tracking-wider font-bold block mb-0.5">USDT BEP20 Balance</span>
// // // //                 <div className="text-[13px] md:text-sm font-black text-emerald-600 font-mono truncate">
// // // //                   {usdtBalance !== null ? `$${(Math.floor(Number(usdtBalance) * 100) / 100).toFixed(2)}` : "..."}
// // // //                 </div>
// // // //              </div>
// // // //              <div className="text-right border-l border-slate-200 pl-2">
// // // //                 <span className="text-black text-[9px] uppercase tracking-wider font-bold block mb-0.5">Package</span>
// // // //                 <div className="text-[13px] md:text-sm font-black text-slate-800 font-mono">
// // // //                   ${PACKAGE_AMOUNT}
// // // //                 </div>
// // // //              </div>
// // // //           </div>

// // // //           <div className="space-y-1.5">
// // // //             <label className="text-[10px] font-bold text-black uppercase tracking-widest ml-1">Target Node ID</label>
// // // //             <div className="flex gap-2">
// // // //               <div className="relative flex-1">
// // // //                 {isPromoUser ? (
// // // //                   <div className="w-full bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-3 font-bold flex items-center justify-center gap-2 shadow-sm text-sm">
// // // //                     <ShieldCheck size={18} /> System will Auto-Pick an Inactive ID
// // // //                   </div>
// // // //                 ) : (
// // // //                   <>
// // // //                     <input 
// // // //                       type="number" 
// // // //                       placeholder="Enter Node ID"
// // // //                       value={userId}
// // // //                       onChange={(e) => setUserId(e.target.value)}
// // // //                       className={`w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-2.5 md:py-3 outline-none transition-all placeholder-slate-400 font-mono shadow-inner text-xs md:text-sm ${
// // // //                           userInfo ? 'border border-green-500 ring-2 ring-green-100' : 'border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'
// // // //                       }`}
// // // //                     />
// // // //                     {userInfo && (
// // // //                       <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
// // // //                         <CheckCircle size={18} />
// // // //                       </div>
// // // //                     )}
// // // //                   </>
// // // //                 )}
// // // //               </div>
              
// // // //               {!isPromoUser && !userInfo && (
// // // //                 <button onClick={() => fetchUser(userId, true)} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 rounded-xl font-bold transition-all shadow-sm text-xs md:text-sm">
// // // //                   Check
// // // //                 </button>
// // // //               )}
// // // //             </div>
            
// // // //             {/* Fetched User Info Area */}
// // // //             {!isPromoUser && (
// // // //               <div className="mt-1 min-h-[50px]">
// // // //                 {userInfo ? (
// // // //                   <div className={`border rounded-xl p-2.5 flex justify-between items-center transition-all shadow-sm ${isBought ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
// // // //                     <div>
// // // //                       <div className="text-slate-800 font-black text-[11px] md:text-xs">{userInfo.name}</div>
// // // //                       <div className="text-[10px] font-mono text-black mt-0.5">ID: {userInfo.userId}</div>
// // // //                     </div>
// // // //                     <div className="text-right">
// // // //                       {isBought && (
// // // //                         <div className="text-green-600 font-black text-[10px] uppercase flex items-center gap-1">
// // // //                            <CheckCircle size={12}/> Active
// // // //                         </div>
// // // //                       )}
// // // //                     </div>
// // // //                   </div>
// // // //                 ) : (
// // // //                   userId.length > 0 && <div className="text-[10px] text-slate-400 italic px-2 pt-1">Checking ID details...</div>
// // // //                 )}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>

// // // //         {/* Footer (Payment Action) */}
// // // //         <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 z-20">
// // // //           <div className="space-y-3">
// // // //              <div className="relative">
// // // //                 <input
// // // //                   type="password"
// // // //                   placeholder="Transaction Password"
// // // //                   value={transactionPassword}
// // // //                   onChange={(e) => setTransactionPassword(e.target.value)}
// // // //                   className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all placeholder-slate-400 font-mono shadow-sm text-xs md:text-sm"
// // // //                 />
// // // //              </div>
             
// // // //              <button 
// // // //                onClick={handleTopUp} 
// // // //                disabled={loading || isBought || (!isPromoUser && !userInfo)}
// // // //                className={`
// // // //                  w-full py-3 rounded-xl font-black text-sm md:text-base flex items-center justify-center gap-2 transition-all shadow-sm
// // // //                  ${loading || isBought || (!isPromoUser && !userInfo) 
// // // //                     ? 'bg-slate-200 text-black cursor-not-allowed border border-slate-300' 
// // // //                     : 'bg-green-600 hover:bg-green-700 text-white shadow-[0_4px_15px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.6)] hover:-translate-y-0.5'}
// // // //                `}
// // // //              >
// // // //                {loading ? "PROCESSING..." : (
// // // //                  <>
// // // //                    ACTIVATE NOW <span className={loading || isBought || (!isPromoUser && !userInfo) ? "text-slate-400" : "text-green-200"}>($30)</span>
// // // //                  </>
// // // //                )}
// // // //              </button>

// // // //              <button 
// // // //                onClick={onClose} 
// // // //                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
// // // //              >
// // // //                 Cancel
// // // //              </button>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //     <SuccessModal
// // // //         isOpen={successModalOpen}
// // // //         onClose={() => { setSuccessModalOpen(false); onClose(); }}
// // // //         type="topup"
// // // //         userId={successData.userId}
// // // //         userName={successData.name} 
// // // //         amount={successData.amount}
// // // //         reward={0}
// // // //       />
// // // //       <MessageModal
// // // //         isOpen={messageModal.open}
// // // //         onClose={() => setMessageModal({ ...messageModal, open: false })}
// // // //         title={messageModal.title}
// // // //         message={messageModal.message}
// // // //         type={messageModal.type}
// // // //       />
// // // //     </div>
// // // //   );
// // // // };

// // // // export default TopUpModal;


// // //  import React, { useState, useEffect } from "react";
// // // import api from "../../api/axios"; 
// // // import MessageModal from "./MessageModal";
// // // import { useAuth } from "../../context/AuthContext";

// // // const TopUpModalWithInput = ({ onClose, onSuccess, packageAmount }) => {
// // //   const { user: loggedInUser, token, login } = useAuth();
  
// // //   // Default memberId me current user ki ID rakhi hai, user chahe toh change kar sakta hai
// // //   const [memberId, setMemberId] = useState(loggedInUser?.userId || "");
// // //   const [fundWallet, setFundWallet] = useState(0);
// // //   const [transactionPassword, setTransactionPassword] = useState("");
// // //   const [loading, setLoading] = useState(false);

// // //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });
// // //   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

// // //   // 1. Fetch Fund Wallet Balance
// // //   useEffect(() => {
// // //     const fetchBalance = async () => {
// // //       if (!loggedInUser?.userId || !token) return;
// // //       try {
// // //         const res = await api.get(`/user/${loggedInUser.userId}`, {
// // //           headers: { Authorization: `Bearer ${token}` },
// // //         });
// // //         // 🔥 FIXED: Changed fundWallet to walletBalance according to DB schema
// // //         setFundWallet(res.data.user.walletBalance || 0);
// // //       } catch (err) {
// // //         console.error(err);
// // //         setFundWallet(0);
// // //       }
// // //     };
// // //     fetchBalance();
// // //   }, [loggedInUser?.userId, token]);

// // //   // 2. Handle Form Submit
// // //   const handleBuyPackage = async (e) => {
// // //     e.preventDefault();
// // //     if (!memberId) return showMessage("Error", "❌ Please enter Member ID.", "error");
// // //     if (!transactionPassword) return showMessage("Error", "❌ Enter transaction password.", "error");
    
// // //     setLoading(true);

// // //     try {
// // //       const response = await api.post('/package/activate', {
// // //         userId: loggedInUser.userId,
// // //         memberId: memberId,
// // //         packageAmount: packageAmount,
// // //         txnPassword: transactionPassword
// // //       }, {
// // //         headers: { Authorization: `Bearer ${token}` }
// // //       });

// // //       if (response.data.success) {
// // //         showMessage("Success", response.data.message, "success");
        
// // //         // Update local wallet state
// // //         const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
// // //         login(refreshedRes.data.user, token);
// // //         // 🔥 FIXED: Changed fundWallet to walletBalance here too
// // //         setFundWallet(refreshedRes.data.user.walletBalance);

// // //         if (onSuccess) {
// // //             setTimeout(() => { onSuccess(); onClose(); }, 2000);
// // //         }
// // //       }
// // //     } catch (err) {
// // //       const msg = err.response?.data?.message || "❌ Activation failed";
// // //       showMessage("Transaction Failed", msg, "error");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // Reset button ka logic
// // //   const handleReset = () => {
// // //     setMemberId(loggedInUser?.userId || "");
// // //     setTransactionPassword("");
// // //   };

// // //   return (
// // //     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
// // //       {/* UI Matched with image_64f559.png - Orange Background */}
// // //       <div className="bg-[#ff7f00] w-full max-w-[400px] relative p-6 shadow-xl rounded-sm">
        
// // //         {/* Close Button (X) */}
// // //         <button 
// // //           onClick={onClose} 
// // //           className="absolute top-4 right-4 text-white text-xl font-bold hover:text-gray-200"
// // //         >
// // //           &times;
// // //         </button>

// // //         {/* Title */}
// // //         <h2 className="text-[22px] font-semibold text-white mb-6 tracking-wide">
// // //           Active Member Package
// // //         </h2>

// // //         {/* Form */}
// // //         <form onSubmit={handleBuyPackage}>
          
// // //           {/* User Id (Read-only) */}
// // //           <div className="mb-4">
// // //             <label className="block text-white text-[15px] mb-1">User Id</label>
// // //             <input 
// // //               type="text" 
// // //               value={loggedInUser?.userId || ""} 
// // //               readOnly 
// // //               className="w-full bg-[#e9ecef] text-gray-700 px-3 py-2 outline-none rounded-sm"
// // //             />
// // //           </div>

// // //           {/* Fund Amount (Read-only) */}
// // //           <div className="mb-4">
// // //             <label className="block text-white text-[15px] mb-1">Fund Amount</label>
// // //             <input 
// // //               type="text" 
// // //               value={fundWallet} 
// // //               readOnly 
// // //               className="w-full bg-[#e9ecef] text-gray-700 px-3 py-2 outline-none rounded-sm"
// // //             />
// // //           </div>

// // //           {/* Member Id (Editable) */}
// // //           <div className="mb-4">
// // //             <label className="block text-white text-[15px] mb-1">Member Id</label>
// // //             <input 
// // //               type="text" 
// // //               value={memberId} 
// // //               onChange={(e) => setMemberId(e.target.value)}
// // //               required
// // //               className="w-full bg-[#e9ecef] text-gray-700 px-3 py-2 outline-none rounded-sm focus:ring-2 focus:ring-white"
// // //             />
// // //           </div>

// // //           {/* Package Amount (Read-only - passed from previous screen) */}
// // //           <div className="mb-4">
// // //             <label className="block text-white text-[15px] mb-1">Package Amount</label>
// // //             <input 
// // //               type="text" 
// // //               value={packageAmount} 
// // //               readOnly 
// // //               className="w-full bg-[#e9ecef] text-gray-700 px-3 py-2 outline-none rounded-sm"
// // //             />
// // //           </div>

// // //           {/* Transaction Password (Required for Backend) */}
// // //           <div className="mb-6">
// // //             <label className="block text-white text-[15px] mb-1">Transaction Password</label>
// // //             <input 
// // //               type="password" 
// // //               value={transactionPassword} 
// // //               onChange={(e) => setTransactionPassword(e.target.value)}
// // //               required
// // //               placeholder="Enter Trx Password"
// // //               className="w-full bg-[#e9ecef] text-gray-700 px-3 py-2 outline-none rounded-sm focus:ring-2 focus:ring-white"
// // //             />
// // //           </div>

// // //           {/* Action Buttons */}
// // //           <div className="flex gap-2 mt-2">
// // //             <button 
// // //               type="submit" 
// // //               disabled={loading}
// // //               className="bg-[#0d6efd] hover:bg-blue-700 text-white px-5 py-2 rounded-sm text-sm font-medium transition-colors"
// // //             >
// // //               {loading ? "Please wait..." : "Submit"}
// // //             </button>
// // //             <button 
// // //               type="button" 
// // //               onClick={handleReset}
// // //               className="bg-[#dc3545] hover:bg-red-700 text-white px-5 py-2 rounded-sm text-sm font-medium transition-colors"
// // //             >
// // //               Reset
// // //             </button>
// // //           </div>

// // //         </form>
// // //       </div>

// // //       {/* Message Modal for success/errors */}
// // //       <MessageModal
// // //         isOpen={messageModal.open}
// // //         onClose={() => setMessageModal({ ...messageModal, open: false })}
// // //         title={messageModal.title}
// // //         message={messageModal.message}
// // //         type={messageModal.type}
// // //       />
// // //     </div>
// // //   );
// // // };

// // // export default TopUpModalWithInput;


// // import React, { useState, useEffect } from "react";
// // import api from "../../api/axios"; 
// // import MessageModal from "./MessageModal";
// // import { useAuth } from "../../context/AuthContext";
// // import { X, Eye, EyeOff } from "lucide-react"; // 🔥 Icons import kar liye hain

// // const TopUpModalWithInput = ({ onClose, onSuccess, packageAmount }) => {
// //   const { user: loggedInUser, token, login } = useAuth();
  
// //   // Default memberId me current user ki ID rakhi hai, user chahe toh change kar sakta hai
// //   const [memberId, setMemberId] = useState(loggedInUser?.userId || "");
// //   const [fundWallet, setFundWallet] = useState(0);
// //   const [transactionPassword, setTransactionPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });
// //   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

// //   // 1. Fetch Fund Wallet Balance
// //   useEffect(() => {
// //     const fetchBalance = async () => {
// //       if (!loggedInUser?.userId || !token) return;
// //       try {
// //         const res = await api.get(`/user/${loggedInUser.userId}`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         setFundWallet(res.data.user.walletBalance || 0);
// //       } catch (err) {
// //         console.error(err);
// //         setFundWallet(0);
// //       }
// //     };
// //     fetchBalance();
// //   }, [loggedInUser?.userId, token]);

// //   // 2. Handle Form Submit
// //   const handleBuyPackage = async (e) => {
// //     e.preventDefault();
// //     if (!memberId) return showMessage("Error", "❌ Please enter Member ID.", "error");
// //     if (!transactionPassword) return showMessage("Error", "❌ Enter transaction password.", "error");
    
// //     setLoading(true);

// //     try {
// //       const response = await api.post('/package/activate', {
// //         userId: loggedInUser.userId,
// //         memberId: memberId,
// //         packageAmount: packageAmount,
// //         txnPassword: transactionPassword
// //       }, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });

// //       if (response.data.success) {
// //         showMessage("Success", response.data.message, "success");
        
// //         // Update local wallet state
// //         const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
// //         login(refreshedRes.data.user, token);
// //         setFundWallet(refreshedRes.data.user.walletBalance);

// //        if (onSuccess) {
// //     onSuccess(); 
// //  }
// //       }
// //     } catch (err) {
// //       const msg = err.response?.data?.message || "❌ Activation failed";
// //       showMessage("Transaction Failed", msg, "error");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Reset button ka logic
// //   const handleReset = () => {
// //     setMemberId(loggedInUser?.userId || "");
// //     setTransactionPassword("");
// //   };

// //   return (
// //     <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99999] flex justify-center items-center p-3 sm:p-4">
// //       {/* Dark Navy Theme Container */}
// //       <div className="bg-[#0b101e] w-full max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[#2d3748] overflow-hidden flex flex-col mt-4 sm:mt-0">
        
// //         {/* Header - Gold Theme */}
// //         <div className="bg-[#e4c568] px-4 py-3 flex justify-between items-center shrink-0">
// //           <h2 className="text-black font-extrabold text-[17px] tracking-wide">Active Member Package</h2>
// //           <button onClick={onClose} className="text-black hover:bg-black/10 p-1 rounded-full transition-colors">
// //             <X size={20} strokeWidth={2.5} />
// //           </button>
// //         </div>

// //         {/* Sub Header Notice */}
// //         <div className="bg-[#161c2d] px-4 py-2 border-b border-[#2d3748] shrink-0">
// //           <p className="text-[#e4c568] text-xs font-bold tracking-wide">Confirm Activation Details</p>
// //         </div>

// //         {/* Content Body */}
// //         <div className="p-4 bg-[#0b101e] flex-1 overflow-y-auto">
// //           <form onSubmit={handleBuyPackage} className="space-y-4">
            
// //             {/* Balance Display Box */}
// //             <div className="border border-[#2d3748] rounded-md overflow-hidden flex flex-col font-semibold text-[13px] mb-2">
// //               <div className="flex border-b border-[#2d3748]">
// //                 <div className="w-2/3 bg-[#131927] text-white p-2.5 border-r border-[#2d3748]">Fund Amount</div>
// //                 <div className="w-1/3 bg-[#131927] text-[#00ff88] p-2.5">${fundWallet.toFixed(2)}</div>
// //               </div>
// //             </div>

// //             {/* User Id (Read-only) */}
// //             <div>
// //               <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-1 block">Your User ID</label>
// //               <input 
// //                 type="text" 
// //                 value={loggedInUser?.userId || ""} 
// //                 readOnly 
// //                 className="w-full bg-[#131927] border border-[#2d3748] text-gray-400 px-3 py-2.5 rounded outline-none text-sm cursor-not-allowed"
// //               />
// //             </div>

// //             {/* Member Id (Editable) */}
// //             <div>
// //               <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block">Target Member ID</label>
// //               <input 
// //                 type="text" 
// //                 value={memberId} 
// //                 onChange={(e) => setMemberId(e.target.value)}
// //                 required
// //                 placeholder="Enter Member ID"
// //                 className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 text-sm"
// //               />
// //             </div>

// //             {/* Package Amount (Read-only) */}
// //             <div>
// //               <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-1 block">Package Amount ($)</label>
// //               <input 
// //                 type="text" 
// //                 value={`$${packageAmount}`} 
// //                 readOnly 
// //                 className="w-full bg-[#131927] border border-[#2d3748] text-gray-400 px-3 py-2.5 rounded outline-none text-sm cursor-not-allowed font-mono"
// //               />
// //             </div>

// //             {/* Transaction Password (With Show/Hide) */}
// //             <div>
// //               <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block">Transaction Password</label>
// //               <div className="relative">
// //                 <input 
// //                   type={showPassword ? "text" : "password"} 
// //                   value={transactionPassword} 
// //                   onChange={(e) => setTransactionPassword(e.target.value)}
// //                   required
// //                   placeholder="Enter Trx Password"
// //                   className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 pr-10 text-sm"
// //                 />
// //                 <button 
// //                   type="button" 
// //                   onClick={() => setShowPassword(!showPassword)} 
// //                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
// //                 >
// //                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Action Buttons */}
// //             <div className="flex gap-2 mt-4 pt-2">
// //               <button 
// //                 type="button" 
// //                 onClick={handleReset}
// //                 className="w-1/3 bg-[#1e2536] hover:bg-[#2d3748] text-white font-bold py-2.5 rounded border border-[#2d3748] transition-colors text-sm uppercase tracking-wider"
// //               >
// //                 Reset
// //               </button>
// //               <button 
// //                 type="submit" 
// //                 disabled={loading}
// //                 className="w-2/3 bg-[#e4c568] hover:bg-[#d4af37] text-black font-extrabold py-2.5 rounded shadow-[0_0_10px_rgba(228,197,104,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 uppercase tracking-widest text-[14px]"
// //               >
// //                 {loading ? "Processing..." : "Activate Now"}
// //               </button>
// //             </div>

// //           </form>
// //         </div>
// //       </div>

// //       {/* Message Modal for success/errors */}
// //       <MessageModal
// //         isOpen={messageModal.open}
// //         onClose={() => setMessageModal({ ...messageModal, open: false })}
// //         title={messageModal.title}
// //         message={messageModal.message}
// //         type={messageModal.type}
// //       />
// //     </div>
// //   );
// // };

// // export default TopUpModalWithInput;







 

// // import React, { useState, useEffect } from "react";
// // import api from "../../api/axios"; 
// // import MessageModal from "./MessageModal";
// // import { useAuth } from "../../context/AuthContext";
// // import { X, Eye, EyeOff, ShieldCheck } from "lucide-react"; 

// // const TopUpModalWithInput = ({ onClose, onSuccess, packageAmount }) => {
// //   const { user: loggedInUser, token, login } = useAuth();
  
// //   // Check if user is Promo
// //   const isPromoUser = loggedInUser?.role === "promo";
  
// //   const [memberId, setMemberId] = useState(loggedInUser?.userId || "");
// //   const [fundWallet, setFundWallet] = useState(0);
// //   const [transactionPassword, setTransactionPassword] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });
// //   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

// //   // 1. Fetch Fund Wallet Balance
// //   useEffect(() => {
// //     const fetchBalance = async () => {
// //       if (!loggedInUser?.userId || !token) return;
// //       try {
// //         const res = await api.get(`/user/${loggedInUser.userId}`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         setFundWallet(res.data.user.walletBalance || 0);
// //       } catch (err) {
// //         console.error(err);
// //         setFundWallet(0);
// //       }
// //     };
// //     fetchBalance();
// //   }, [loggedInUser?.userId, token]);

// //   // 2. Handle Form Submit
// //   const handleBuyPackage = async (e) => {
// //     e.preventDefault();
// //     if (!isPromoUser && !memberId) return showMessage("Error", "❌ Please enter Member ID.", "error");
// //     if (!transactionPassword) return showMessage("Error", "❌ Enter transaction password.", "error");
    
// //     setLoading(true);

// //     try {
// //       if (isPromoUser) {
// //         // ===========================================
// //         // 🚀 PROMO USER LOGIC 
// //         // ===========================================
// // const response = await api.post('/transactions/promo-dummy-topup', {
// //               amount: packageAmount,
// //           transactionPassword: transactionPassword
// //         }, {
// //           headers: { Authorization: `Bearer ${token}` }
// //         });

// //         if (response.data.success) {
// //           // Message format ekdam normal jaisa hi rakha hai
// //           showMessage(
// //             "Success", 
// //             `Package of $${packageAmount} activated successfully for ${response.data.generatedId}!`, 
// //             "success"
// //           );
// //           setTransactionPassword("");
          
// //           if (onSuccess) onSuccess(); 
// //         }
// //       } else {
// //         // ===========================================
// //         // 👤 NORMAL USER LOGIC 
// //         // ===========================================
// //         const response = await api.post('/package/activate', {
// //           userId: loggedInUser.userId,
// //           memberId: memberId,
// //           packageAmount: packageAmount,
// //           txnPassword: transactionPassword
// //         }, {
// //           headers: { Authorization: `Bearer ${token}` }
// //         });

// //         if (response.data.success) {
// //           showMessage("Success", response.data.message, "success");
          
// //           // Update local wallet state
// //           const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
// //           login(refreshedRes.data.user, token);
// //           setFundWallet(refreshedRes.data.user.walletBalance);

// //           if (onSuccess) {
// //             onSuccess(); 
// //           }
// //         }
// //       }
// //     } catch (err) {
// //       const msg = err.response?.data?.message || "❌ Activation failed";
// //       showMessage("Transaction Failed", msg, "error");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Reset button ka logic
// //   const handleReset = () => {
// //     setMemberId(loggedInUser?.userId || "");
// //     setTransactionPassword("");
// //   };

// //   return (
// //     <>
// //       {/* 🔥 FIX: Main Modal ka z-index z-[9990] kiya gaya hai taaki Success message iske aage aaye */}
// //       <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9990] flex justify-center items-center p-3 sm:p-4">
// //         {/* Dark Navy Theme Container */}
// //         <div className="bg-[#0b101e] w-full max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[#2d3748] overflow-hidden flex flex-col mt-4 sm:mt-0">
          
// //           {/* Header - Gold Theme */}
// //           <div className="bg-[#e4c568] px-4 py-3 flex justify-between items-center shrink-0">
// //             <h2 className="text-black font-extrabold text-[17px] tracking-wide">
// //               {isPromoUser ? "Promo Auto Activation" : "Active Member Package"}
// //             </h2>
// //             <button onClick={onClose} className="text-black hover:bg-black/10 p-1 rounded-full transition-colors">
// //               <X size={20} strokeWidth={2.5} />
// //             </button>
// //           </div>

// //           {/* Sub Header Notice */}
// //           <div className="bg-[#161c2d] px-4 py-2 border-b border-[#2d3748] shrink-0">
// //             <p className="text-[#e4c568] text-xs font-bold tracking-wide">
// //               {isPromoUser ? "System will generate Fake Profile & Feed Entry" : "Confirm Activation Details"}
// //             </p>
// //           </div>

// //           {/* Content Body */}
// //           <div className="p-4 bg-[#0b101e] flex-1 overflow-y-auto">
// //             <form onSubmit={handleBuyPackage} className="space-y-4">
              
// //               {/* Balance Display Box */}
// //               <div className="border border-[#2d3748] rounded-md overflow-hidden flex flex-col font-semibold text-[13px] mb-2">
// //                 <div className="flex border-b border-[#2d3748]">
// //                   <div className="w-2/3 bg-[#131927] text-white p-2.5 border-r border-[#2d3748]">Fund Amount</div>
// //                   <div className="w-1/3 bg-[#131927] text-[#00ff88] p-2.5">${fundWallet.toFixed(2)}</div>
// //                 </div>
// //               </div>

// //               {/* User Id (Read-only for normal users) */}
// //               {!isPromoUser && (
// //                 <div>
// //                   <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-1 block">Your User ID</label>
// //                   <input 
// //                     type="text" 
// //                     value={loggedInUser?.userId || ""} 
// //                     readOnly 
// //                     className="w-full bg-[#131927] border border-[#2d3748] text-gray-400 px-3 py-2.5 rounded outline-none text-sm cursor-not-allowed"
// //                   />
// //                 </div>
// //               )}

// //               {/* Target Member ID Box */}
// //               {isPromoUser ? (
// //                 <div>
// //                   <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block"> Member ID</label>
// //                   <div className="w-full bg-[#131927] border border-[#2d3748] text-[#e4c568] px-3 py-3 rounded flex items-center gap-2 shadow-inner text-sm font-bold">
// //                      <ShieldCheck size={18} /> System will Auto-Generate Dummy ID
// //                   </div>
// //                 </div>
// //               ) : (
// //                 <div>
// //                   <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block"> Member ID</label>
// //                  <input 
// //     type="text" 
// //     value={memberId} 
// //     // 🔥 YAHAN CHANGE KIYA HAI: e.target.value.toUpperCase()
// //     onChange={(e) => setMemberId(e.target.value.toUpperCase())}
// //     required
// //     placeholder="Enter Member ID"
// //     // 🔥 YAHAN CHANGE KIYA HAI: End me 'uppercase' class add ki hai
// //     className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 text-sm uppercase"
// // />
// //                 </div>
// //               )}

// //               {/* Package Amount (Read-only) */}
// //               <div>
// //                 <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-1 block">Package Amount ($)</label>
// //                 <input 
// //                   type="text" 
// //                   value={`$${packageAmount}`} 
// //                   readOnly 
// //                   className="w-full bg-[#131927] border border-[#2d3748] text-gray-400 px-3 py-2.5 rounded outline-none text-sm cursor-not-allowed font-mono"
// //                 />
// //               </div>

// //               {/* Transaction Password (With Show/Hide) */}
// //               <div>
// //                 <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block">Transaction Password</label>
// //                 <div className="relative">
// //                   <input 
// //                     type={showPassword ? "text" : "password"} 
// //                     value={transactionPassword} 
// //                     onChange={(e) => setTransactionPassword(e.target.value)}
// //                     required
// //                     placeholder="Enter Trx Password"
// //                     className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 pr-10 text-sm"
// //                   />
// //                   <button 
// //                     type="button" 
// //                     onClick={() => setShowPassword(!showPassword)} 
// //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
// //                   >
// //                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
// //                   </button>
// //                 </div>
// //               </div>

// //               {/* Action Buttons */}
// //               <div className="flex gap-2 mt-4 pt-2">
// //                 <button 
// //                   type="button" 
// //                   onClick={handleReset}
// //                   className="w-1/3 bg-[#1e2536] hover:bg-[#2d3748] text-white font-bold py-2.5 rounded border border-[#2d3748] transition-colors text-sm uppercase tracking-wider"
// //                 >
// //                   Reset
// //                 </button>
// //                 <button 
// //                   type="submit" 
// //                   disabled={loading}
// //                   className="w-2/3 bg-[#e4c568] hover:bg-[#d4af37] text-black font-extrabold py-2.5 rounded shadow-[0_0_10px_rgba(228,197,104,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 uppercase tracking-widest text-[14px]"
// //                 >
// //                   {loading ? "Processing..." : (isPromoUser ? "Generate & Activate" : "Activate Now")}
// //                 </button>
// //               </div>

// //             </form>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 🔥 FIX: Message Modal ko z-[999999] wale div me wrap kiya taaki popup screen pe piche na chupe */}
// //       <div className="relative z-[999999]">
// //         <MessageModal
// //           isOpen={messageModal.open}
// //           onClose={() => setMessageModal({ ...messageModal, open: false })}
// //           title={messageModal.title}
// //           message={messageModal.message}
// //           type={messageModal.type}
// //         />
// //       </div>
// //     </>
// //   );
// // };

// // export default TopUpModalWithInput;

// import React, { useState, useEffect } from "react";
// import api from "../../api/axios"; 
// import MessageModal from "./MessageModal";
// import { useAuth } from "../../context/AuthContext";
// import { X, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react"; 

// const TopUpModalWithInput = ({ onClose, onSuccess, packageAmount }) => {
//   const { user: loggedInUser, token, login } = useAuth();
  
//   // Check if user is Promo
//   const isPromoUser = loggedInUser?.role === "promo";
  
//   const [memberId, setMemberId] = useState(loggedInUser?.userId || "");
//   const [fundWallet, setFundWallet] = useState(0);
//   const [transactionPassword, setTransactionPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // 🔥 NAYE STATES: Receiver ka naam aur loading check karne ke liye
//   const [receiverName, setReceiverName] = useState("");
//   const [isCheckingName, setIsCheckingName] = useState(false);

//   const [messageModal, setMessageModal] = useState({ open: false, title: "", message: "", type: "info" });
//   const showMessage = (title, message, type = "info") => setMessageModal({ open: true, title, message, type });

//   // 1. Fetch Fund Wallet Balance
//   useEffect(() => {
//     const fetchBalance = async () => {
//       if (!loggedInUser?.userId || !token) return;
//       try {
//         const res = await api.get(`/user/${loggedInUser.userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setFundWallet(res.data.user.walletBalance || 0);
//       } catch (err) {
//         console.error(err);
//         setFundWallet(0);
//       }
//     };
//     fetchBalance();
//   }, [loggedInUser?.userId, token]);

//   // ==========================================
//   // 🔥 RECEIVER NAME FETCH LOGIC (Debounced)
//   // ==========================================
//   useEffect(() => {
//     const checkReceiverName = async () => {
//       if (isPromoUser) return; // Promo user ko name check ki zaroorat nahi
//       if (memberId.length < 5) {
//         setReceiverName("");
//         return;
//       }
      
//       setIsCheckingName(true);
//       try {
//         const res = await api.get(`/user/check-sponsor/${memberId}`);
//         setReceiverName(res.data.name);
//       } catch (err) {
//         setReceiverName("Invalid User ID");
//       } finally {
//         setIsCheckingName(false);
//       }
//     };

//     const timeoutId = setTimeout(checkReceiverName, 500);
//     return () => clearTimeout(timeoutId);
//   }, [memberId, isPromoUser]);

//   // 2. Handle Form Submit
//   const handleBuyPackage = async (e) => {
//     e.preventDefault();
//     if (!isPromoUser && !memberId) return showMessage("Error", "❌ Please enter Member ID.", "error");
//     if (!isPromoUser && receiverName === "Invalid User ID") return showMessage("Error", "❌ Invalid Member ID.", "error");
//     if (!transactionPassword) return showMessage("Error", "❌ Enter transaction password.", "error");
    
//     setLoading(true);

//     try {
//       if (isPromoUser) {
//         // ===========================================
//         // 🚀 PROMO USER LOGIC 
//         // ===========================================
//         const response = await api.post('/transactions/promo-dummy-topup', {
//           amount: packageAmount,
//           transactionPassword: transactionPassword
//         }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (response.data.success) {
//           showMessage(
//             "Success", 
//             `Package of $${packageAmount} activated successfully for ${response.data.generatedId}!`, 
//             "success"
//           );
//           setTransactionPassword("");
          
//          // if (onSuccess) onSuccess(); 
//         }
//       } else {
//         // ===========================================
//         // 👤 NORMAL USER LOGIC 
//         // ===========================================
//         const response = await api.post('/package/activate', {
//           userId: loggedInUser.userId,
//           memberId: memberId,
//           packageAmount: packageAmount,
//           txnPassword: transactionPassword
//         }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         if (response.data.success) {
//           showMessage("Success", response.data.message, "success");
          
//           // Update local wallet state
//           const refreshedRes = await api.get(`/user/${loggedInUser.userId}`, { headers: { Authorization: `Bearer ${token}` } });
//           login(refreshedRes.data.user, token);
//           setFundWallet(refreshedRes.data.user.walletBalance);

//           // if (onSuccess) {
//           //   onSuccess(); 
//           // }
//         }
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || "❌ Activation failed";
//       showMessage("Transaction Failed", msg, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset button ka logic
//   const handleReset = () => {
//     setMemberId(loggedInUser?.userId || "");
//     setTransactionPassword("");
//   };

//   return (
//     <>
//       <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9990] flex justify-center items-center p-3 sm:p-4">
//         {/* Dark Navy Theme Container */}
//         <div className="bg-[#0b101e] w-full max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)] border border-[#2d3748] overflow-hidden flex flex-col mt-4 sm:mt-0">
          
//           {/* Header - Gold Theme */}
//           <div className="bg-[#e4c568] px-4 py-3 flex justify-between items-center shrink-0">
//             <h2 className="text-black font-extrabold text-[17px] tracking-wide">
//               {isPromoUser ? "Promo Auto Activation" : "Active Member Package"}
//             </h2>
//             <button onClick={onClose} className="text-black hover:bg-black/10 p-1 rounded-full transition-colors">
//               <X size={20} strokeWidth={2.5} />
//             </button>
//           </div>

//           {/* Sub Header Notice */}
//           <div className="bg-[#161c2d] px-4 py-2 border-b border-[#2d3748] shrink-0">
//             <p className="text-[#e4c568] text-xs font-bold tracking-wide">
//               {isPromoUser ? "System will generate Fake Profile & Feed Entry" : "Confirm Activation Details"}
//             </p>
//           </div>

//           {/* Content Body */}
//           <div className="p-4 bg-[#0b101e] flex-1 overflow-y-auto">
//             <form onSubmit={handleBuyPackage} className="space-y-4">
              
//               {/* Balance Display Box */}
//               <div className="border border-[#2d3748] rounded-md overflow-hidden flex flex-col font-semibold text-[13px] mb-2">
//                 <div className="flex border-b border-[#2d3748]">
//                   <div className="w-2/3 bg-[#131927] text-white p-2.5 border-r border-[#2d3748]">Fund Amount</div>
//                   <div className="w-1/3 bg-[#131927] text-[#00ff88] p-2.5">${fundWallet.toFixed(2)}</div>
//                 </div>
//               </div>

//               {/* User Id (Read-only for normal users) */}
//               {!isPromoUser && (
//                 <div>
//                   <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-1 block">Your User ID</label>
//                   <input 
//                     type="text" 
//                     value={loggedInUser?.userId || ""} 
//                     readOnly 
//                     className="w-full bg-[#131927] border border-[#2d3748] text-gray-400 px-3 py-2.5 rounded outline-none text-sm cursor-not-allowed"
//                   />
//                 </div>
//               )}

//               {/* Target Member ID Box */}
//               {isPromoUser ? (
//                 <div>
//                   <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block"> Member ID</label>
//                   <div className="w-full bg-[#131927] border border-[#2d3748] text-[#e4c568] px-3 py-3 rounded flex items-center gap-2 shadow-inner text-sm font-bold">
//                      <ShieldCheck size={18} /> System will Auto-Generate Dummy ID
//                   </div>
//                 </div>
//               ) : (
//                 <div>
//                   <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block"> Member ID</label>
//                   <input 
//                     type="text" 
//                     value={memberId} 
//                     onChange={(e) => setMemberId(e.target.value.toUpperCase())}
//                     required
//                     placeholder="Enter Member ID"
//                     className={`w-full bg-[#131927] border text-white px-3 py-2.5 rounded outline-none placeholder-gray-500 text-sm uppercase transition-colors ${receiverName === "Invalid User ID" ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-[#2d3748] focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568]"}`} 
//                   />
                  
//                   {/* Name validation visual feedback */}
//                   <div className="h-5 mt-1 px-1">
//                     {isCheckingName ? (
//                       <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 animate-pulse">
//                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span> Checking ID...
//                       </span>
//                     ) : receiverName && receiverName !== "Invalid User ID" ? (
//                       <span className="text-[12px] text-[#00ff88] font-bold flex items-center gap-1.5 capitalize tracking-wide">
//                          <CheckCircle2 size={14} /> {receiverName}
//                       </span>
//                     ) : receiverName === "Invalid User ID" ? (
//                       <span className="text-[12px] text-red-400 font-bold flex items-center gap-1.5 tracking-wide">
//                          <AlertCircle size={14} /> Invalid User ID
//                       </span>
//                     ) : null}
//                   </div>
//                 </div>
//               )}

//               {/* Package Amount (Read-only) */}
//               <div>
//                 <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold mb-1 block">Package Amount ($)</label>
//                 <input 
//                   type="text" 
//                   value={`$${packageAmount}`} 
//                   readOnly 
//                   className="w-full bg-[#131927] border border-[#2d3748] text-gray-400 px-3 py-2.5 rounded outline-none text-sm cursor-not-allowed font-mono"
//                 />
//               </div>

//               {/* Transaction Password (With Show/Hide) */}
//               <div>
//                 <label className="text-[#e4c568] text-[11px] uppercase tracking-wider font-bold mb-1 block">Transaction Password</label>
//                 <div className="relative">
//                   <input 
//                     type={showPassword ? "text" : "password"} 
//                     value={transactionPassword} 
//                     onChange={(e) => setTransactionPassword(e.target.value)}
//                     required
//                     placeholder="Enter Trx Password"
//                     className="w-full bg-[#131927] border border-[#2d3748] text-white px-3 py-2.5 rounded outline-none focus:border-[#e4c568] focus:ring-1 focus:ring-[#e4c568] placeholder-gray-500 pr-10 text-sm"
//                   />
//                   <button 
//                     type="button" 
//                     onClick={() => setShowPassword(!showPassword)} 
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-2 mt-4 pt-2">
//                 <button 
//                   type="button" 
//                   onClick={handleReset}
//                   className="w-1/3 bg-[#1e2536] hover:bg-[#2d3748] text-white font-bold py-2.5 rounded border border-[#2d3748] transition-colors text-sm uppercase tracking-wider"
//                 >
//                   Reset
//                 </button>
//                 <button 
//                   type="submit" 
//                   disabled={loading || (!isPromoUser && receiverName === "Invalid User ID")}
//                   className="w-2/3 bg-[#e4c568] hover:bg-[#d4af37] text-black font-extrabold py-2.5 rounded shadow-[0_0_10px_rgba(228,197,104,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-widest text-[14px]"
//                 >
//                   {loading ? "Processing..." : (isPromoUser ? "Generate & Activate" : "Activate Now")}
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       </div>

//       <div className="relative z-[999999]">
//         <MessageModal
//           isOpen={messageModal.open}
//           onClose={() => setMessageModal({ ...messageModal, open: false })}
//           title={messageModal.title}
//           message={messageModal.message}
//           type={messageModal.type}
//         />
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

  const [memberId, setMemberId] = useState(
    loggedInUser?.userId || ""
  );

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
  }, [loggedInUser?.userId, token]);

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

              {/* USER ID */}
              <div>

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

              </div>

              {/* MEMBER ID */}
              <div>

                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#e5c875]">
                  Receiver Member ID
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

              {/* TRANSACTION PASSWORD */}
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

              {/* TERMS NOTICE */}
              <div className="rounded-lg border border-[#d4af37]/15 bg-[#d4af37]/[0.045] px-3 py-2.5">

                <div className="flex items-start gap-2">

                  <ShieldCheck
                    size={15}
                    className="mt-0.5 shrink-0 text-[#e5c875]"
                  />

                  <p className="text-[10px] leading-5 text-gray-400">
                    Please verify the receiver ID, package amount and
                    applicable terms before confirming activation.
                    Package duration displayed is 45 days.
                  </p>

                </div>

              </div>

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
                    walletLoading ||
                    !isValidAmount ||
                    !hasSufficientBalance ||
                    isCheckingName ||
                    receiverName === "Invalid User ID" ||
                    !receiverName
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
                      Activate Package
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
        />
      </div>

    </>
  );
};

export default TopUpModalWithInput;
