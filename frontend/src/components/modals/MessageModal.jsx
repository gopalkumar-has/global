 

// import React, { useEffect, useMemo } from "react";
// import {
//   X,
//   Info,
//   CheckCircle2,
//   AlertCircle,
//   TriangleAlert,
//   CalendarDays,
//   Sparkles,
//   ShieldCheck,
//   ArrowRight,
//   UserRound,
//   PackageCheck,
// } from "lucide-react";

// const MessageModal = ({
//   isOpen,
//   onClose,
//   title = "Message",
//   message = "",
//   type = "info",
//   zIndex = 9998,
//   receiverName = "",
// }) => {
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (event) => {
//       if (event.key === "Escape" && typeof onClose === "function") {
//         onClose();
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isOpen, onClose]);

//   const activationDetails = useMemo(() => {
//     const text = String(message || "").replace(/\*\*/g, "").trim();

//     // Recognizes messages such as:
//     // "Package of $50 activated successfully for GW5977060!"
//     const amountMatch = text.match(
//       /(?:package\s+of|amount\s*(?:of|:)?|for)\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i
//     ) || text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);

//     const userIdMatch = text.match(/\b[A-Z]{2,}[A-Z0-9]*\d{3,}\b/i);
//     const isPackageActivation =
//       /package/i.test(text) &&
//       /activat(?:ed|ion)/i.test(text) &&
//       Boolean(amountMatch);

//     if (!isPackageActivation) return null;

//     const numericAmount = Number(amountMatch[1].replace(/,/g, ""));
//     if (!Number.isFinite(numericAmount)) return null;

//     return {
//       amount: numericAmount.toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//       }),
//       userId: userIdMatch?.[0] || "",
//     };
//   }, [message]);

//   if (!isOpen) return null;

//   const themes = {
//     success: {
//       icon: CheckCircle2,
//       label: "Successfully Completed",
//       shortLabel: "Success",
//     },
//     error: {
//       icon: AlertCircle,
//       label: "Something Went Wrong",
//       shortLabel: "Error",
//     },
//     warning: {
//       icon: TriangleAlert,
//       label: "Please Check",
//       shortLabel: "Warning",
//     },
//     info: {
//       icon: Info,
//       label: "Information",
//       shortLabel: "Information",
//     },
//   };

//   const currentTheme = themes[type] || themes.info;
//   const Icon = currentTheme.icon;

//   const todayDate = new Date().toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   const handleClose = () => {
//     if (typeof onClose === "function") onClose();
//   };

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center bg-[#05080d]/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
//       style={{ zIndex }}
//       onClick={handleClose}
//     >
//       <div
//         role="alertdialog"
//         aria-modal="true"
//         aria-labelledby="message-modal-title"
//         aria-describedby="message-modal-description"
//         className="relative w-full max-w-[410px] overflow-hidden rounded-[24px] border border-[#b99548]/30 bg-[#0b1018] shadow-[0_28px_100px_rgba(0,0,0,0.78)] animate-in zoom-in-95 duration-200"
//         onClick={(event) => event.stopPropagation()}
//       >
//         {/* Global Wealth brand header */}
//         <div className="relative overflow-hidden border-b border-[#b99548]/15 bg-gradient-to-br from-[#171b20] via-[#10151d] to-[#0b1018] px-6 pb-6 pt-6">
//           <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#d8b765]/[0.10] blur-[65px]" />
//           <div className="pointer-events-none absolute -bottom-20 -left-12 h-36 w-36 rounded-full bg-[#b99548]/[0.08] blur-[55px]" />

         

//           <div className="relative mt-1 flex items-center gap-4">
//             <div className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-2xl border border-[#d8b765]/45 bg-gradient-to-br from-[#d8b765]/20 to-[#8f7135]/10 shadow-[0_8px_28px_rgba(185,149,72,0.12)]">
//               <div className="absolute inset-1 rounded-xl border border-[#e2c36e]/15" />
//               <Icon size={31} strokeWidth={1.9} className="relative text-[#e2c36e]" />
//             </div>

//             <div className="min-w-0">
//               <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#b99548]/30 bg-[#d8b765]/[0.07] px-2.5 py-1">
//                 <span className="h-1.5 w-1.5 rounded-full bg-[#e2c36e] shadow-[0_0_8px_rgba(226,195,110,0.7)]" />
//                 <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#e2c36e]">
//                   {currentTheme.shortLabel}
//                 </span>
//               </div>
//               <h2
//                 id="message-modal-title"
//                 className="break-words text-lg font-extrabold leading-tight tracking-wide text-white sm:text-xl"
//               >
//                 {activationDetails ? "Package Activated Successfully" : title}
//               </h2>
//             </div>
//               <button
//               type="button"
//               onClick={handleClose}
//               aria-label="Close message"
//               className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:border-[#b99548]/40 hover:bg-[#d8b765]/10 hover:text-[#e2c36e]"
//             >
//               <X size={17} />
//             </button>
//           </div>
//         </div>

//         {/* Message details */}
//         <div className="px-6 pb-5 pt-5">
//           <div className="mb-3 flex items-center justify-between">
//             <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#b99548]">
//               {activationDetails ? "Activation Summary" : "Notification Details"}
//             </p>
//             <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
//               {currentTheme.label}
//             </span>
//           </div>

//           {activationDetails ? (
//             <div
//               id="message-modal-description"
//               className="relative overflow-hidden rounded-2xl border border-[#b99548]/30 bg-gradient-to-br from-[#171b20] via-[#10151d] to-[#080d14] p-4 shadow-[inset_0_1px_18px_rgba(216,183,101,0.04)]"
//             >
//               <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#d8b765]/[0.08] blur-3xl" />

//               <div className="relative flex items-center justify-between gap-3">
//                 <div className="min-w-0">
//                   <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
//                     Package Amount
//                   </p>
//                   <p className="mt-2 break-all text-4xl font-black leading-none tracking-tight text-[#e2c36e] tabular-nums sm:text-[42px]">
//                     ${activationDetails.amount}
//                   </p>
//                 </div>

//                 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#b99548]/45 bg-[#d8b765]/[0.10] shadow-[0_0_24px_rgba(185,149,72,0.15)]">
//                   <CheckCircle2
//                     size={31}
//                     strokeWidth={2.1}
//                     className="text-[#e2c36e]"
//                   />
//                 </div>
//               </div>

//               {activationDetails.userId && (
//                 <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
//                   <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
//                     <UserRound size={13} className="text-[#b99548]" />
//                     User ID
//                   </span>
//                   <span className="break-all text-right font-mono text-xs font-bold tracking-wide text-white">
//                     {activationDetails.userId}
//                   </span>

                  

                  
//                 </div>
//               )}

//               {receiverName && receiverName !== "Invalid User ID" && (
//   <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
//     <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
//       <UserRound size={13} className="text-[#b99548]" />
//       User Name
//     </span>

//     <span className="break-all text-right text-xs font-bold tracking-wide text-white">
//       {receiverName}
//     </span>
//   </div>
// )}

//               <div className="relative mt-3 flex items-center gap-2 rounded-lg border border-[#b99548]/15 bg-[#d8b765]/[0.05] px-3 py-2">
//                 <PackageCheck size={15} className="shrink-0 text-[#d8b765]" />
//                 <span className="text-[9px] font-semibold text-[#c9bea7]">
//                   Your package is now active.
//                 </span>
//               </div>
//             </div>
//           ) : (
//             <div className="custom-message-scroll max-h-48 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#080d14] px-4 py-4 shadow-inner">
//               <p
//                 id="message-modal-description"
//                 className="whitespace-pre-wrap break-words text-left text-[13px] font-medium leading-6 text-slate-300"
//               >
//                 {message || "No additional information available."}
//               </p>
//             </div>
//           )}

         
//         </div>

//           <div className="mt-4 flex items-center justify-center gap-2 text-slate-600">
//   <CalendarDays size={15} className="text-[#a9843e]" />
//   <span className="text-[12px] font-extrabold uppercase tracking-[0.17em]">
//     {todayDate}
//   </span>
//   <span className="mx-1 h-1 w-1 rounded-full bg-[#8f7135]" />
//   <span className="text-[12px] font-extrabold uppercase tracking-[0.17em]">
//     Global Wealth
//   </span>
// </div>

//         {/* Footer */}
//         <div className="border-t border-white/[0.06] bg-[#080d14]/70 px-6 pb-5 pt-4">
//           <button
//             type="button"
//             onClick={handleClose}
//             className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a9843e] via-[#d8b765] to-[#e2c36e] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#090d13] shadow-[0_7px_24px_rgba(185,149,72,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.99]"
//           >
//             Done
//            </button>

       
//         </div>
//       </div>

//       <style>{`
//         .custom-message-scroll {
//           scrollbar-width: thin;
//           scrollbar-color: #8f7135 transparent;
//         }
//         .custom-message-scroll::-webkit-scrollbar {
//           width: 3px;
//         }
//         .custom-message-scroll::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .custom-message-scroll::-webkit-scrollbar-thumb {
//           background: #8f7135;
//           border-radius: 10px;
//         }
//         .custom-message-scroll::-webkit-scrollbar-thumb:hover {
//           background: #d8b765;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MessageModal;





import React, { useEffect, useMemo } from "react";

import {

  X,

  Info,

  CheckCircle2,

  AlertCircle,

  TriangleAlert,

  CalendarDays,

  Sparkles,

  ShieldCheck,

  ArrowRight,

  UserRound,

  PackageCheck,

} from "lucide-react";



const MessageModal = ({

  isOpen,

  onClose,

  title = "Message",

  message = "",

  type = "info",

  zIndex = 9998,

  receiverName = "",
  transactionDetails = null,
  successNote = "",

}) => {

  useEffect(() => {

    if (!isOpen) return;



    const handleKeyDown = (event) => {

      if (event.key === "Escape" && typeof onClose === "function") {

        onClose();

      }

    };



    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);

  }, [isOpen, onClose]);



  const activationDetails = useMemo(() => {
    const text = String(message || "").replace(/\*/g, "").trim();

    // Recognizes messages such as:
    // "Package of $50 activated successfully for GW5977060!"
    const amountMatch =
      text.match(/(?:package\s+of|amount\s*(?:of|:)?|for)\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i) ||
      text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);

    const userIdMatch = text.match(/\b[A-Z]{2,}[A-Z0-9]*\d{3,}\b/i);
    const isPackageActivation =
      /package/i.test(text) &&
      /activat(?:ed|ion)/i.test(text) &&
      Boolean(amountMatch);

    if (!isPackageActivation) return null;

    const numericAmount = Number(amountMatch[1].replace(/,/g, ""));
    if (!Number.isFinite(numericAmount)) return null;

    return {
      amount: numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      userId: userIdMatch?.[0] || "",
    };
  }, [message]);

  const displayDetails = transactionDetails
    ? {
        amount: Number(transactionDetails.amount || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        userId: transactionDetails.userId || "",
      }
    : activationDetails;

  const isWithdrawal = Boolean(transactionDetails);



  if (!isOpen) return null;



  const themes = {

    success: {

      icon: CheckCircle2,

      label: "Successfully Completed",

      shortLabel: "Success",

    },

    error: {

      icon: AlertCircle,

      label: "Something Went Wrong",

      shortLabel: "Error",

    },

    warning: {

      icon: TriangleAlert,

      label: "Please Check",

      shortLabel: "Warning",

    },

    info: {

      icon: Info,

      label: "Information",

      shortLabel: "Information",

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

    if (typeof onClose === "function") onClose();

  };



  return (

    <div

      className="fixed inset-0 flex items-center justify-center bg-[#05080d]/85 p-4 backdrop-blur-md animate-in fade-in duration-200"

      style={{ zIndex }}

      onClick={handleClose}

    >

      <div

        role="alertdialog"

        aria-modal="true"

        aria-labelledby="message-modal-title"

        aria-describedby="message-modal-description"

        className="relative w-full max-w-[410px] overflow-hidden rounded-[24px] border border-[#b99548]/30 bg-[#0b1018] shadow-[0_28px_100px_rgba(0,0,0,0.78)] animate-in zoom-in-95 duration-200"

        onClick={(event) => event.stopPropagation()}

      >

        {/* Global Wealth brand header */}

        <div className="relative overflow-hidden border-b border-[#b99548]/15 bg-gradient-to-br from-[#171b20] via-[#10151d] to-[#0b1018] px-6 pb-6 pt-6">

          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#d8b765]/[0.10] blur-[65px]" />

          <div className="pointer-events-none absolute -bottom-20 -left-12 h-36 w-36 rounded-full bg-[#b99548]/[0.08] blur-[55px]" />







          <div className="relative mt-1 flex items-center gap-4">

            <div className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-2xl border border-[#d8b765]/45 bg-gradient-to-br from-[#d8b765]/20 to-[#8f7135]/10 shadow-[0_8px_28px_rgba(185,149,72,0.12)]">

              <div className="absolute inset-1 rounded-xl border border-[#e2c36e]/15" />

              <Icon size={31} strokeWidth={1.9} className="relative text-[#e2c36e]" />

            </div>



            <div className="min-w-0">

              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#b99548]/30 bg-[#d8b765]/[0.07] px-2.5 py-1">

                <span className="h-1.5 w-1.5 rounded-full bg-[#e2c36e] shadow-[0_0_8px_rgba(226,195,110,0.7)]" />

                <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#e2c36e]">

                  {currentTheme.shortLabel}

                </span>

              </div>

              <h2

                id="message-modal-title"

                className="break-words text-lg font-extrabold leading-tight tracking-wide text-white sm:text-xl"

              >

                {activationDetails ? "Package Activated Successfully" : title}

              </h2>

            </div>

              <button

              type="button"

              onClick={handleClose}

              aria-label="Close message"

              className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:border-[#b99548]/40 hover:bg-[#d8b765]/10 hover:text-[#e2c36e]"

            >

              <X size={17} />

            </button>

          </div>

        </div>



        {/* Message details */}

        <div className="px-6 pb-5 pt-5">

          <div className="mb-3 flex items-center justify-between">

            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#b99548]">

              {displayDetails
                ? isWithdrawal
                  ? "Withdrawal Summary"
                  : "Activation Summary"
                : "Notification Details"}

            </p>

            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">

              {currentTheme.label}

            </span>

          </div>



          {displayDetails ? (

            <div

              id="message-modal-description"

              className="relative overflow-hidden rounded-2xl border border-[#b99548]/30 bg-gradient-to-br from-[#171b20] via-[#10151d] to-[#080d14] p-4 shadow-[inset_0_1px_18px_rgba(216,183,101,0.04)]"

            >

              <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#d8b765]/[0.08] blur-3xl" />



              <div className="relative flex items-center justify-between gap-3">

                <div className="min-w-0">

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">

                    {isWithdrawal ? "Withdrawal Amount" : "Package Amount"}

                  </p>

                  <p className="mt-2 break-all text-4xl font-black leading-none tracking-tight text-[#e2c36e] tabular-nums sm:text-[42px]">

                    ${displayDetails.amount}

                  </p>

                </div>



                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#b99548]/45 bg-[#d8b765]/[0.10] shadow-[0_0_24px_rgba(185,149,72,0.15)]">

                  <CheckCircle2

                    size={31}

                    strokeWidth={2.1}

                    className="text-[#e2c36e]"

                  />

                </div>

              </div>



              {displayDetails.userId && (

                <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">

                  <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">

                    <UserRound size={13} className="text-[#b99548]" />

                    User ID

                  </span>

                  <span className="break-all text-right font-mono text-xs font-bold tracking-wide text-white">

                    {displayDetails.userId}

                  </span>









                </div>

              )}



              {receiverName && receiverName !== "Invalid User ID" && (

  <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">

    <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">

      <UserRound size={13} className="text-[#b99548]" />

      User Name

    </span>



    <span className="break-all text-right text-xs font-bold tracking-wide text-white">

      {receiverName}

    </span>

  </div>

)}



              <div className="relative mt-3 flex items-center gap-2 rounded-lg border border-[#b99548]/15 bg-[#d8b765]/[0.05] px-3 py-2">

                <PackageCheck size={15} className="shrink-0 text-[#d8b765]" />

                <span className="text-[9px] font-semibold text-[#c9bea7]">

                  {successNote || "Your package is now active."}

                </span>

              </div>

            </div>

          ) : (

            <div className="custom-message-scroll max-h-48 overflow-y-auto rounded-xl border border-white/[0.07] bg-[#080d14] px-4 py-4 shadow-inner">

              <p

                id="message-modal-description"

                className="whitespace-pre-wrap break-words text-left text-[13px] font-medium leading-6 text-slate-300"

              >

                {message || "No additional information available."}

              </p>

            </div>

          )}





        </div>



          <div className="mt-4 flex items-center justify-center gap-2 text-slate-600">

  <CalendarDays size={15} className="text-[#a9843e]" />

  <span className="text-[12px] font-extrabold uppercase tracking-[0.17em]">

    {todayDate}

  </span>

  <span className="mx-1 h-1 w-1 rounded-full bg-[#8f7135]" />

  <span className="text-[12px] font-extrabold uppercase tracking-[0.17em]">

    Global Wealth

  </span>

</div>



        {/* Footer */}

        <div className="border-t border-white/[0.06] bg-[#080d14]/70 px-6 pb-5 pt-4">

          <button

            type="button"

            onClick={handleClose}

            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#a9843e] via-[#d8b765] to-[#e2c36e] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#090d13] shadow-[0_7px_24px_rgba(185,149,72,0.18)] transition-all hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.99]"

          >

            Done

           </button>





        </div>

      </div>



      <style>{`

        .custom-message-scroll {

          scrollbar-width: thin;

          scrollbar-color: #8f7135 transparent;

        }

        .custom-message-scroll::-webkit-scrollbar {

          width: 3px;

        }

        .custom-message-scroll::-webkit-scrollbar-track {

          background: transparent;

        }

        .custom-message-scroll::-webkit-scrollbar-thumb {

          background: #8f7135;

          border-radius: 10px;

        }

        .custom-message-scroll::-webkit-scrollbar-thumb:hover {

          background: #d8b765;

        }

      `}</style>

    </div>

  );

};



export default MessageModal;
