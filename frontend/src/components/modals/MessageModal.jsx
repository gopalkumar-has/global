// import React from "react";
// import { 
//   X, 
//   Info, 
//   CheckCircle2, 
//   AlertCircle, 
//   TriangleAlert,
//   Calendar
// } from "lucide-react";

// const MessageModal = ({
//   isOpen,
//   onClose,
//   title = "Message",
//   message = "",
//   type = "info",
//   zIndex = 2000,
// }) => {
//   if (!isOpen) return null;

//   // 🔥 PREMIUM FINANCE THEME CONFIG
//   const theme = {
//     success: {
//       color: "text-emerald-400",
//       bg: "bg-emerald-500/10",
//       border: "border-emerald-500/20",
//       icon: CheckCircle2,
//       btn: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
//     },
//     error: {
//       color: "text-rose-400",
//       bg: "bg-rose-500/10",
//       border: "border-rose-500/20",
//       icon: AlertCircle,
//       btn: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
//     },
//     warning: {
//       color: "text-amber-400",
//       bg: "bg-amber-500/10",
//       border: "border-amber-500/20",
//       icon: TriangleAlert,
//       btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
//     },
//     info: {
//       color: "text-blue-400",
//       bg: "bg-blue-500/10",
//       border: "border-blue-500/20",
//       icon: Info,
//       btn: "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
//     },
//   };

//   const currentTheme = theme[type] || theme.info;
//   const Icon = currentTheme.icon;

//   // Get current date only (no time)
//   const todayDate = new Date().toLocaleDateString('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric'
//   });

//   return (
//     <div
//       className="fixed inset-0 bg-[#070b14]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
//       style={{ zIndex }}
//     >
//       {/* Premium Minimalist Modal Card */}
//       <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-sm flex flex-col relative overflow-hidden">
        
//         {/* Subtle Top Gradient Line */}
//         <div className={`absolute top-0 left-0 right-0 h-1 ${currentTheme.btn} opacity-70`}></div>

//         {/* Top Close Button */}
//         <div className="absolute top-4 right-4 z-10">
//            <button 
//              onClick={onClose} 
//              className="p-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all text-gray-400 hover:text-white"
//            >
//               <X size={16} strokeWidth={2.5} />
//            </button>
//         </div>

//         {/* Content Area */}
//         <div className="flex flex-col items-center pt-10 pb-4 px-6 relative z-10">
          
//           {/* Elegant Icon Box */}
//           <div className={`p-4 rounded-2xl ${currentTheme.bg} border ${currentTheme.border} mb-5 shadow-inner`}>
//             <Icon size={32} className={currentTheme.color} strokeWidth={2.5} />
//           </div>

//           {/* Title */}
//           <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wide">
//             {title}
//           </h2>

//           {/* Message Area */}
//           <div className="max-h-32 overflow-y-auto w-full text-center px-2 custom-scroll">
//             <p className="text-sm text-gray-400 leading-relaxed font-medium">
//               {message}
//             </p>
//           </div>
//         </div>

//         {/* Footer Area with Button & Date */}
//         <div className="px-6 pb-6 pt-3 flex flex-col gap-4">
//           <button
//             onClick={onClose}
//             className={`w-full py-3.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-200 active:scale-95 shadow-lg ${currentTheme.btn}`}
//           >
//             Got It
//           </button>
          
//           {/* Footer Date Section */}
//           <div className="flex items-center justify-center gap-1.5 text-gray-500">
//             <Calendar size={13} />
//             <span className="text-xs font-medium tracking-wider uppercase">{todayDate}</span>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         /* Minimalist Scrollbar for Dark Mode */
//         .custom-scroll { scrollbar-width: thin; scrollbar-color: #374151 transparent; }
//         .custom-scroll::-webkit-scrollbar { width: 3px; }
//         .custom-scroll::-webkit-scrollbar-track { background: transparent; }
//         .custom-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
//         .custom-scroll::-webkit-scrollbar-thumb:hover { background: #4b5563; }
//       `}</style>
//     </div>
//   );
// };

// export default MessageModal;


import React, { useEffect } from "react";
import {
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  Calendar,
  Sparkles
} from "lucide-react";

const MessageModal = ({
  isOpen,
  onClose,
  title = "Message",
  message = "",
  type = "info",
  zIndex = 9998,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && typeof onClose === "function") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const themes = {
    success: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      glow: "bg-emerald-500/10",
      icon: CheckCircle2,
      button: "from-emerald-500 to-green-600",
      label: "Successfully Completed",
    },

    error: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/25",
      glow: "bg-rose-500/10",
      icon: AlertCircle,
      button: "from-rose-500 to-red-600",
      label: "Something Went Wrong",
    },

    warning: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      glow: "bg-amber-500/10",
      icon: TriangleAlert,
      button: "from-amber-500 to-yellow-600",
      label: "Please Check",
    },

    info: {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      glow: "bg-blue-500/10",
      icon: Info,
      button: "from-blue-500 to-indigo-600",
      label: "Information",
    },
  };

  const currentTheme = themes[type] || themes.info;
  const Icon = currentTheme.icon;

  const todayDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#070b14]/90 p-4 backdrop-blur-lg animate-in fade-in duration-200"
      style={{ zIndex }}
      onClick={handleClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="message-modal-title"
        className="relative w-full max-w-sm overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1120] shadow-[0_30px_90px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Top Accent */}
        <div
          className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${currentTheme.button}`}
        />

        {/* Glow */}
        <div
          className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-[75px] ${currentTheme.glow}`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close message"
          className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={17} />
        </button>

        {/* Main Content */}
        <div className="relative flex flex-col items-center px-6 pb-5 pt-11">
          {/* Icon */}
          <div
            className={`mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border shadow-inner ${currentTheme.bg} ${currentTheme.border}`}
          >
            <Icon
              size={36}
              strokeWidth={2.2}
              className={currentTheme.color}
            />
          </div>

          {/* Heading */}
          <h2
            id="message-modal-title"
            className="text-center text-xl font-black tracking-wide text-white"
          >
            {title}
          </h2>

          {/* Status Label */}
          <div className="mt-2 flex items-center gap-2">
            <span className={`h-px w-6 ${currentTheme.bg}`} />
            <span
              className={`text-[9px] font-black uppercase tracking-[0.2em] ${currentTheme.color}`}
            >
              {currentTheme.label}
            </span>
            <span className={`h-px w-6 ${currentTheme.bg}`} />
          </div>

          {/* Message */}
          <div className="custom-message-scroll mt-6 max-h-40 w-full overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-5 text-center">
            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-gray-300">
              {message || "No additional information available."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-7">
          <button
            type="button"
            onClick={handleClose}
            className={`w-full rounded-xl bg-gradient-to-r ${currentTheme.button} py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]`}
          >
            Got It
          </button>

          {/* Date */}
          <div className="mt-5 flex items-center justify-center gap-2 text-gray-500">
            <Calendar size={13} />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {todayDate}
            </span>
            <Sparkles size={12} className="text-[#eab308]/60" />
          </div>
        </div>
      </div>

      <style>{`
        .custom-message-scroll {
          scrollbar-width: thin;
          scrollbar-color: #374151 transparent;
        }
        .custom-message-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .custom-message-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-message-scroll::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-message-scroll::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default MessageModal;
