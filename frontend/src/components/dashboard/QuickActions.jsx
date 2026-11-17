// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { DollarSign, CreditCard, Users, Headset, Ticket, Building, Send, ArrowLeftRight, Wallet } from "lucide-react"; 

// // // 🔥 Modals import kiye hain
// // import WithdrawalModal from "../modals/WithdrawalModal";
// // import WalletTransferModal from "../modals/WalletTransferModal";
// // import CreditToWalletModal from "../modals/CreditToWalletModal";

// // const QuickActions = ({ onDepositClick }) => {
// //   const navigate = useNavigate();
  
// //   // 🔥 Modals ke states
// //   const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
// //   const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
// //   const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

// //   const iconBoxStyle = "w-[50px] h-[50px] bg-[#0a0f1c] border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:border-[#d4af37] group-hover:shadow-[0_0_12px_rgba(212,175,55,0.5)] group-hover:scale-105 transition-all duration-300";

// //   return (
// //     <>
// //       <div className="bg-[#111827] rounded-xl shadow-lg shadow-black/40 border border-[#1f2937] overflow-hidden">
// //         <div className="h-1.5 w-full bg-gradient-to-r from-[#d4af37] to-[#f3e5ab]"></div>
        
// //         <div className="p-5 md:p-6">
// //           <div className="grid grid-cols-4 gap-y-7 gap-x-2">
            
// //             {/* Recharge */}
// //             <div 
// //               onClick={() => {
// //                 if (onDepositClick) {
// //                   onDepositClick();
// //                 } else {
// //                   navigate('/recharge'); 
// //                 }
// //               }} 
// //               className="flex flex-col items-center gap-2 cursor-pointer group"
// //             >
// //               <div className={`${iconBoxStyle} rounded-2xl`}>
// //                 <DollarSign size={26} strokeWidth={2.5} />
// //               </div>
// //               <span className="text-[12px] md:text-[13px] font-semibold text-white group-hover:text-[#d4af37] transition-colors">Recharge</span>
// //             </div>

// //             {/* Withdrawal */}
// //             <div onClick={() => setIsWithdrawModalOpen(true)} className="flex flex-col items-center gap-2 cursor-pointer group">
// //               <div className={`${iconBoxStyle} rounded-[18px]`}>
// //                 <CreditCard size={24} strokeWidth={2.5} />
// //               </div>
// //               <span className="text-[12px] md:text-[13px] font-semibold text-white group-hover:text-[#d4af37] transition-colors">Withdrawal</span>
// //             </div>

// //             {/* 🔥 Fund Transfer Button */}
// //             <div onClick={() => setIsTransferModalOpen(true)} className="flex flex-col items-center gap-2 cursor-pointer group">
// //               <div className={`${iconBoxStyle} rounded-full`}>
// //                 <ArrowLeftRight size={24} strokeWidth={2.5} />
// //               </div>
// //               <span className="text-[11px] md:text-[12px] font-semibold text-white group-hover:text-[#d4af37] transition-colors text-center leading-tight">Fund<br/>Transfer</span>
// //             </div>

// //             {/* 🔥 Credit To Wallet Button */}
// //             <div onClick={() => setIsCreditModalOpen(true)} className="flex flex-col items-center gap-2 cursor-pointer group">
// //               <div className={`${iconBoxStyle} rounded-[18px]`}>
// //                 <Wallet size={24} strokeWidth={2.5} />
// //               </div>
// //               <span className="text-[11px] md:text-[12px] font-semibold text-white group-hover:text-[#d4af37] transition-colors text-center leading-tight">Wallet<br/>to Fund</span>
// //             </div>

// //             {/* Team */}
// //            <div 
// //   onClick={() => navigate('/all-team')} 
// //   className="flex flex-col items-center gap-2 cursor-pointer group"
// // >
// //   <div className={`${iconBoxStyle} rounded-full`}>
// //     <Users size={24} strokeWidth={2.5} />
// //   </div>
  
// // </div>
         

         

      

     

// //           </div>
// //         </div>
// //       </div>

// //       {/* 🔥 Modals Rendering */}
// //       {isWithdrawModalOpen && (
// //         <WithdrawalModal onClose={() => setIsWithdrawModalOpen(false)} />
// //       )}

// //       {isTransferModalOpen && (
// //         <WalletTransferModal onClose={() => setIsTransferModalOpen(false)} />
// //       )}

// //       {isCreditModalOpen && (
// //         <CreditToWalletModal onClose={() => setIsCreditModalOpen(false)} />
// //       )}
// //     </>
// //   );
// // };

// // export default QuickActions;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeftRight,
//   CreditCard,
//   DollarSign,
//   Users,
//   Wallet,
//   X,
// } from "lucide-react";

// import WithdrawalModal from "../modals/WithdrawalModal";
// import WalletTransferModal from "../modals/WalletTransferModal";
// import CreditToWalletModal from "../modals/CreditToWalletModal";

// const QuickActions = ({ onDepositClick }) => {
//   const navigate = useNavigate();

//   const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
//   const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
//   const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

//   const actions = [
//     {
//       id: "recharge",
//       label: "Recharge",
//       icon: DollarSign,
//       tone: "text-emerald-300",
//       iconBg: "bg-emerald-400/[0.10]",
//       border: "border-emerald-300/20",
//       onClick: () => {
//         if (onDepositClick) onDepositClick();
//         else navigate("/recharge");
//       },
//     },
//     {
//       id: "withdrawal",
//       label: "Withdrawal",
//       icon: CreditCard,
//       tone: "text-[#e5c875]",
//       iconBg: "bg-[#d4b45f]/[0.10]",
//       border: "border-[#d4b45f]/25",
//       onClick: () => setIsWithdrawModalOpen(true),
//     },
//     {
//       id: "transfer",
//       label: "Fund Transfer",
//       icon: ArrowLeftRight,
//       tone: "text-sky-300",
//       iconBg: "bg-sky-400/[0.10]",
//       border: "border-sky-300/20",
//       onClick: () => setIsTransferModalOpen(true),
//     },
//     {
//       id: "wallet",
//       label: "Wallet to Fund",
//       icon: Wallet,
//       tone: "text-violet-300",
//       iconBg: "bg-violet-400/[0.10]",
//       border: "border-violet-300/20",
//       onClick: () => setIsCreditModalOpen(true),
//     },
//   ];

//   return (
//     <>
//       {/* Spacer keeps the page content clear of the fixed bottom action dock. */}
//       <div aria-hidden="true" className="h-[104px] sm:h-[112px]" />

//       <nav
//         aria-label="Quick actions"
//         className="fixed inset-x-0 bottom-0 z-[900] px-2 pb-[max(8px,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4"
//       >
//         <div className="mx-auto max-w-3xl overflow-hidden rounded-[20px] border border-[#c5a45b]/30 bg-[#090e15]/95 shadow-[0_-10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
//           <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2 sm:px-4">
//             <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#d9bd75]">
//               Quick actions
//             </span>
//             <button
//               type="button"
//               onClick={() => navigate("/all-team")}
//               className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] px-2.5 py-1 text-[10px] font-semibold text-slate-400 transition hover:border-[#d4b45f]/30 hover:text-[#e5c875]"
//             >
//               <Users size={12} />
//               My team
//             </button>
//           </div>

//           <div className="grid grid-cols-4 divide-x divide-white/[0.07]">
//             {actions.map(({ id, label, icon: Icon, tone, iconBg, border, onClick }) => (
//               <button
//                 key={id}
//                 type="button"
//                 onClick={onClick}
//                 className="group flex min-w-0 flex-col items-center justify-center gap-1.5 px-1.5 py-3 transition-colors hover:bg-white/[0.04] active:bg-white/[0.07] sm:gap-2 sm:py-3.5"
//               >
//                 <span
//                   className={`flex h-9 w-9 items-center justify-center rounded-[13px] border ${border} ${iconBg} ${tone} transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-10 sm:w-10`}
//                 >
//                   <Icon size={18} strokeWidth={2.2} />
//                 </span>
//                 <span className="max-w-full truncate text-center text-[9px] font-semibold leading-tight text-slate-300 group-hover:text-white sm:text-[11px]">
//                   {label}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>

//       {isWithdrawModalOpen && (
//         <WithdrawalModal onClose={() => setIsWithdrawModalOpen(false)} />
//       )}

//       {isTransferModalOpen && (
//         <WalletTransferModal onClose={() => setIsTransferModalOpen(false)} />
//       )}

//       {isCreditModalOpen && (
//         <CreditToWalletModal onClose={() => setIsCreditModalOpen(false)} />
//       )}
//     </>
//   );
// };

// export default QuickActions;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  CreditCard,
  DollarSign,
  Wallet,
} from "lucide-react";

import WithdrawalModal from "../modals/WithdrawalModal";
import WalletTransferModal from "../modals/WalletTransferModal";
import CreditToWalletModal from "../modals/CreditToWalletModal";

const QuickActions = ({ onDepositClick }) => {
  const navigate = useNavigate();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const actions = [
    {
      id: "recharge",
      label: "Recharge",
      icon: DollarSign,
      accent: "text-emerald-300",
      surface: "bg-emerald-400/[0.09]",
      outline: "border-emerald-300/20",
      onClick: () => (onDepositClick ? onDepositClick() : navigate("/recharge")),
    },
    {
      id: "withdrawal",
      label: "Withdrawal",
      icon: CreditCard,
      accent: "text-[#e6c875]",
      surface: "bg-[#d4b45f]/[0.09]",
      outline: "border-[#d4b45f]/25",
      onClick: () => setIsWithdrawModalOpen(true),
    },
    {
      id: "transfer",
      label: "Fund Transfer",
      icon: ArrowLeftRight,
      accent: "text-sky-300",
      surface: "bg-sky-400/[0.09]",
      outline: "border-sky-300/20",
      onClick: () => setIsTransferModalOpen(true),
    },
    {
      id: "wallet",
      label: "Wallet to Fund",
      icon: Wallet,
      accent: "text-violet-300",
      surface: "bg-violet-400/[0.09]",
      outline: "border-violet-300/20",
      onClick: () => setIsCreditModalOpen(true),
    },
  ];

  return (
    <>
      {/* Reserve space so page content is not hidden behind the fixed dock. */}
      <div aria-hidden="true" className="h-[92px] sm:h-[104px]" />

      <nav
        aria-label="Wallet quick actions"
        className="fixed inset-x-0 bottom-0 z-[900] px-2 pb-[max(8px,env(safe-area-inset-bottom))] sm:px-4 sm:pb-4"
      >
        <div className="mx-auto max-w-2xl overflow-hidden rounded-[20px] border border-[#c5a45b]/30 bg-[#090e15]/[0.97] shadow-[0_-12px_42px_rgba(0,0,0,0.48)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5 sm:px-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#d9bd75]">
                Wallet shortcuts
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Manage your funds
              </p>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,0.7)]" />
          </div>

          <div className="grid grid-cols-4">
            {actions.map(({ id, label, icon: Icon, accent, surface, outline, onClick }) => (
              <button
                key={id}
                type="button"
                onClick={onClick}
                className="group flex min-w-0 flex-col items-center justify-center gap-1.5 border-r border-white/[0.06] px-1 py-3 transition-colors last:border-r-0 hover:bg-white/[0.035] active:bg-white/[0.07] sm:gap-2 sm:py-3.5"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] border ${outline} ${surface} ${accent} transition duration-200 group-hover:-translate-y-0.5 group-hover:brightness-125 sm:h-11 sm:w-11`}
                >
                  <Icon size={19} strokeWidth={2.2} />
                </span>
                <span className="w-full truncate text-center text-[9px] font-semibold leading-tight text-slate-300 group-hover:text-white sm:text-[11px]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {isWithdrawModalOpen && (
        <WithdrawalModal onClose={() => setIsWithdrawModalOpen(false)} />
      )}

      {isTransferModalOpen && (
        <WalletTransferModal onClose={() => setIsTransferModalOpen(false)} />
      )}

      {isCreditModalOpen && (
        <CreditToWalletModal onClose={() => setIsCreditModalOpen(false)} />
      )}
    </>
  );
};

export default QuickActions;
