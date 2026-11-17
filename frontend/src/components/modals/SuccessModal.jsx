 


// import React from "react";
// import {
//   CheckCircle2,
//   Zap,
//   Landmark,
//   ArrowRightLeft,
//   Gift,
//   ShieldCheck,
//   ArrowDownLeft,
//   User,
//   CalendarDays,
//   Sparkles,
// } from "lucide-react";

// const SuccessModal = ({
//   isOpen,
//   onClose,
//   type = "credit",
//   userId = "",
//   userName = "",
//   amount = 0,
//   reward = 0,
//   spinQuantity = 0,
//   customTitle = "",
//   customMessage = "",
//   source = "",
// }) => {
//   if (!isOpen) return null;

//   const currentDate = new Date().toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const getContent = () => {
//     if (customTitle || customMessage) {
//       return { icon: CheckCircle2, title: customTitle || "Success", message: customMessage, idLabel: null };
//     }
//     switch (type) {
//       case "withdrawal":
//         return { icon: Landmark, title: "Withdrawal Success", valueText: `$${amount}`, valueLabel: "Amount Processed", idLabel: "User ID" };
//       case "convert":
//         return { icon: ArrowRightLeft, title: "Conversion Done", valueText: `${amount} CCT`, valueLabel: "Converted Value", idLabel: "User ID" };
//       case "stake":
//         return { icon: ShieldCheck, title: "Staking Done", valueText: `${amount} CCT`, valueLabel: "Staked Amount", idLabel: "Target ID" };
//       case "deposit":
//         return { icon: ArrowDownLeft, title: "Deposit Successful", valueText: `+ $${amount}`, valueLabel: "Fund Added", idLabel: null };
//       case "credit":
//         return { icon: ArrowDownLeft, title: "Wallet Credited", valueText: `+ $${amount}`, valueLabel: "Amount Added", idLabel: null, source };
//       case "transfer":
//       case "usdt_transfer":
//         return {
//           icon: ArrowRightLeft,
//           title: type === "usdt_transfer" ? "USDT Transfer Done" : "Wallet Transfer Done",
//           valueText: `$${amount}`,
//           valueLabel: "Transfer Amount",
//           idLabel: "Sent To",
//         };
//       case "cct_transfer":
//         return { icon: ArrowRightLeft, title: "CCT Transfer Done", valueText: `${amount} CCT`, valueLabel: "Transfer Amount", idLabel: "Sent To" };
//       case "topup":
//         return { icon: Zap, title: "Node Activated", valueText: `$${amount}`, valueLabel: "Activation Value", idLabel: "Target ID" };
//       case "buy":
//         return { icon: Gift, title: "Spins Purchased", valueText: `${spinQuantity} Spins`, valueLabel: `Cost: $${amount}`, idLabel: null };
//       case "spin":
//         return { icon: Gift, title: "Spin Reward", valueText: `$${reward}`, valueLabel: "You Won", idLabel: null };
//       default:
//         return null;
//     }
//   };

//   const content = getContent();
//   if (!content) return null;

//   const { icon: Icon, title, valueText, valueLabel, message, idLabel, source: srcVal } = content;

//   return (
//     <div className="fixed inset-0 bg-[#070b14]/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300">
//       <div className="w-full max-w-sm rounded-[28px] overflow-hidden shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 relative bg-[#0b1120] border border-white/10">

//         {/* Top gradient banner with glowing ring icon */}
//         <div className="relative pt-10 pb-16 px-6 text-center bg-gradient-to-b from-[#eab308]/15 via-[#0b1120] to-[#0b1120] overflow-hidden">
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-52 bg-[#eab308]/20 blur-[60px] rounded-full pointer-events-none"></div>
//           <Sparkles size={16} className="absolute top-8 left-10 text-[#eab308]/50" />
//           <Sparkles size={12} className="absolute top-16 right-12 text-[#eab308]/40" />

//           <div className="relative z-10 mx-auto w-20 h-20 flex items-center justify-center">
//             <div className="absolute inset-0 rounded-full border-2 border-[#eab308]/30 animate-ping-slow"></div>
//             <div className="absolute inset-1 rounded-full border border-[#eab308]/50"></div>
//             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5cc4a] to-[#eab308] flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
//               <Icon size={26} strokeWidth={2.5} className="text-[#0b1120]" />
//             </div>
//           </div>

//           <h2 className="relative z-10 mt-5 text-white text-xl font-black uppercase tracking-wide">
//             {title}
//           </h2>

//           {!message && (
//             <p className="relative z-10 text-[10px] text-[#eab308]/80 font-bold uppercase tracking-[0.2em] mt-1">
//               Transaction Confirmed
//             </p>
//           )}
//         </div>

//         {/* Ticket-stub notch divider */}
//         <div className="relative -mt-4 mb-1">
//           <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-[#070b14]"></div>
//           <div className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-[#070b14]"></div>
//           <div className="border-t-2 border-dashed border-white/10 mx-6"></div>
//         </div>

//         {/* Body */}
//         <div className="px-6 pb-6 pt-5">
//           {message ? (
//             <p className="text-sm text-gray-300 font-medium leading-relaxed text-center">
//               {message}
//             </p>
//           ) : (
//             <>
//               <div className="text-center mb-5">
//                 <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">
//                   {valueLabel}
//                 </span>
//                 <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500 drop-shadow-sm">
//                   {valueText}
//                 </span>
//               </div>

//               <div className="bg-[#111827] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
//                 {idLabel && (
//                   <div className="flex justify-between items-center px-4 py-3">
//                     <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
//                       <User size={12} className="text-[#eab308]" /> {idLabel}
//                     </span>
//                     <span className="text-white font-black font-mono text-sm">{userId}</span>
//                   </div>
//                 )}
//                 {idLabel && userName && userName !== "N/A" && (
//                   <div className="flex justify-between items-center px-4 py-3">
//                     <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Name</span>
//                     <span className="text-[#eab308] font-black text-xs uppercase tracking-wider">{userName}</span>
//                   </div>
//                 )}
//                 {srcVal && (
//                   <div className="flex justify-between items-center px-4 py-3">
//                     <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Source</span>
//                     <span className="text-[#eab308] font-black text-xs uppercase tracking-wider">{srcVal}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between items-center px-4 py-3">
//                   <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
//                     <CalendarDays size={12} className="text-[#eab308]" /> Date
//                   </span>
//                   <span className="text-white font-black font-mono text-sm">{currentDate}</span>
//                 </div>
//               </div>

//               <div className="flex justify-center mt-4">
//                 <span className="text-[#eab308] bg-[#eab308]/10 px-4 py-1.5 rounded-full border border-[#eab308]/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
//                   <ShieldCheck size={13} /> Secured Transaction
//                 </span>
//               </div>
//             </>
//           )}

//           <button
//             onClick={onClose}
//             className="w-full mt-6 bg-gradient-to-r from-[#d4af37] to-[#eab308] hover:brightness-110 text-[#070b14] transition-all font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl shadow-[0_4px_20px_rgba(234,179,8,0.3)] hover:-translate-y-0.5 active:scale-95"
//           >
//             Continue
//           </button>
//         </div>
//       </div>

//       <style>{`
//         @keyframes ping-slow {
//           0% { transform: scale(1); opacity: 1; }
//           75%, 100% { transform: scale(1.6); opacity: 0; }
//         }
//         .animate-ping-slow { animation: ping-slow 2.2s cubic-bezier(0,0,0.2,1) infinite; }
//       `}</style>
//     </div>
//   );
// };

// export default SuccessModal;


import React from "react";
import {
  CheckCircle2,
  Zap,
  Landmark,
  ArrowRightLeft,
  Gift,
  ShieldCheck,
  ArrowDownLeft,
  User,
  CalendarDays,
  Sparkles,
  Layers3,
  X
} from "lucide-react";

const SuccessModal = ({
  isOpen,
  onClose,
  type = "credit",
  userId = "",
  userName = "",
  amount = 0,
  reward = 0,
  spinQuantity = 0,
  customTitle = "",
  customMessage = "",
  source = "",
}) => {
  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getContent = () => {
    if (customTitle || customMessage) {
      return {
        icon: CheckCircle2,
        title: customTitle || "Success",
        message: customMessage,
        idLabel: null,
      };
    }

    switch (type) {
      case "withdrawal":
        return {
          icon: Landmark,
          title: "Withdrawal Successful",
          valueText: `$${formatAmount(amount)}`,
          valueLabel: "Amount Processed",
          idLabel: "User ID",
        };

      case "convert":
        return {
          icon: ArrowRightLeft,
          title: "Conversion Completed",
          valueText: `${formatAmount(amount)} CCT`,
          valueLabel: "Converted Value",
          idLabel: "User ID",
        };

      case "stake":
        return {
          icon: ShieldCheck,
          title: "Staking Successful",
          valueText: `${formatAmount(amount)} CCT`,
          valueLabel: "Staked Amount",
          idLabel: "Target ID",
        };

      case "deposit":
        return {
          icon: ArrowDownLeft,
          title: "Deposit Successful",
          valueText: `+$${formatAmount(amount)}`,
          valueLabel: "Funds Added",
          idLabel: null,
        };

      case "credit":
        return {
          icon: ArrowDownLeft,
          title: "Wallet Credited",
          valueText: `+$${formatAmount(amount)}`,
          valueLabel: "Amount Added",
          idLabel: null,
          source,
        };

      case "transfer":
      case "usdt_transfer":
        return {
          icon: ArrowRightLeft,
          title:
            type === "usdt_transfer"
              ? "USDT Transfer Completed"
              : "Wallet Transfer Completed",
          valueText: `$${formatAmount(amount)}`,
          valueLabel: "Transfer Amount",
          idLabel: "Sent To",
        };

      case "cct_transfer":
        return {
          icon: ArrowRightLeft,
          title: "CCT Transfer Completed",
          valueText: `${formatAmount(amount)} CCT`,
          valueLabel: "Transfer Amount",
          idLabel: "Sent To",
        };

      case "topup":
        return {
          icon: Zap,
          title: "Package Activated",
          valueText: `$${formatAmount(amount)}`,
          valueLabel: "Activation Amount",
          idLabel: "Target ID",
        };

      case "auto_compound":
        return {
          icon: Layers3,
          title: "Auto Compound Activated",
          valueText: `$${formatAmount(amount)}`,
          valueLabel: "Package Amount",
          idLabel: "Target ID",
        };

      case "buy":
        return {
          icon: Gift,
          title: "Spins Purchased",
          valueText: `${spinQuantity} Spins`,
          valueLabel: `Cost: $${formatAmount(amount)}`,
          idLabel: null,
        };

      case "spin":
        return {
          icon: Gift,
          title: "Spin Reward",
          valueText: `$${formatAmount(reward)}`,
          valueLabel: "Reward Received",
          idLabel: null,
        };

      default:
        return {
          icon: CheckCircle2,
          title: "Transaction Successful",
          valueText: `$${formatAmount(amount)}`,
          valueLabel: "Transaction Amount",
          idLabel: userId ? "User ID" : null,
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  const title = content.title;
  const message = content.message;
  const valueText = content.valueText;
  const valueLabel = content.valueLabel;
  const idLabel = content.idLabel;
  const srcVal = content.source;

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#070b14]/90 backdrop-blur-lg animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-[#eab308]/20 bg-[#0b1120] shadow-[0_30px_100px_rgba(0,0,0,0.75)] animate-in zoom-in-95 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Background Glow */}
        <div className="absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-[#eab308]/15 blur-[75px] pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close success modal"
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#eab308]/15 via-[#0b1120] to-[#0b1120] px-6 pb-12 pt-10 text-center">
          <Sparkles className="absolute left-10 top-8 text-[#eab308]/50" size={17} />
          <Sparkles className="absolute right-12 top-16 text-[#eab308]/40" size={13} />

          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#eab308]/30 animate-ping-slow" />
            <div className="absolute inset-2 rounded-full border border-[#eab308]/50" />

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f5cc4a] to-[#d4a017] shadow-[0_0_35px_rgba(234,179,8,0.4)]">
              <Icon size={29} strokeWidth={2.5} className="text-[#0b1120]" />
            </div>
          </div>

          <h2
            id="success-modal-title"
            className="relative mt-5 text-xl font-black uppercase tracking-wide text-white"
          >
            {title}
          </h2>

          <div className="relative mt-2 flex items-center justify-center gap-2">
            <span className="h-px w-7 bg-[#eab308]/40" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#eab308]">
              Transaction Confirmed
            </span>
            <span className="h-px w-7 bg-[#eab308]/40" />
          </div>
        </div>

        {/* Ticket Divider */}
        <div className="relative -mt-3">
          <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-[#070b14]" />
          <div className="absolute -right-3 top-0 h-6 w-6 rounded-full bg-[#070b14]" />
          <div className="mx-6 border-t border-dashed border-white/15" />
        </div>

        {/* Body */}
        <div className="px-6 pb-7 pt-5">
          {message ? (
            <p className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-5 text-center text-sm font-medium leading-relaxed text-gray-300">
              {message}
            </p>
          ) : (
            <>
              {valueText && (
                <div className="mb-5 text-center">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    {valueLabel}
                  </span>

                  <span className="break-all bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-4xl font-black text-transparent">
                    {valueText}
                  </span>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111827] divide-y divide-white/5">
                {idLabel && userId && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      <User size={13} className="text-[#eab308]" />
                      {idLabel}
                    </span>
                    <span className="break-all text-right font-mono text-sm font-bold text-white">
                      {userId}
                    </span>
                  </div>
                )}

                {idLabel && userName && userName !== "N/A" && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Name
                    </span>
                    <span className="text-right text-xs font-black uppercase tracking-wider text-[#eab308]">
                      {userName}
                    </span>
                  </div>
                )}

                {srcVal && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Source
                    </span>
                    <span className="text-right text-xs font-black uppercase tracking-wider text-[#eab308]">
                      {srcVal}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <CalendarDays size={13} className="text-[#eab308]" />
                    Date
                  </span>
                  <span className="font-mono text-sm font-bold text-white">
                    {currentDate}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Security Label */}
          <div className="mt-5 flex justify-center">
            <span className="flex items-center gap-2 rounded-full border border-[#eab308]/25 bg-[#eab308]/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#eab308]">
              <ShieldCheck size={14} />
              Secured Transaction
            </span>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleClose}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#d4af37] to-[#eab308] px-6 py-4 text-sm font-black uppercase tracking-widest text-[#070b14] shadow-[0_5px_25px_rgba(234,179,8,0.2)] transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2.2s cubic-bezier(0,0,0.2,1) infinite;
        }
      `}</style>
    </div>
  );
};

export default SuccessModal;
