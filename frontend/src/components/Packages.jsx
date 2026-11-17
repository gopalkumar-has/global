
// import React, { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   ArrowUpRight,
//   Clock3,
//   Gem,
//   ShieldCheck
// } from "lucide-react";

// import TopUpModalWithInput from "./modals/TopUpModalWithInput";
// import PackageModeModal from "./modals/PackageModeModal";
// import AutoCompoundV2Modal from "./modals/AutoCompoundV2Modal";

// const PACKAGE_DURATION_DAYS = 45;

// const packagesList = [
//   { id: 1, price: 2 },
//   { id: 2, price: 5 },
//   { id: 3, price: 10 },
//   { id: 4, price: 20 },
//   { id: 5, price: 50 },
//   { id: 6, price: 100 },
//   { id: 7, price: 200 },
//   { id: 8, price: 500 },
//   { id: 9, price: 1000 }
// ];

// const formatUSD = (amount) =>
//   `$${Number(amount).toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   })}`;

// const Packages = () => {
//   const { user } = useAuth();

//   // Selected package
//   const [selectedPackage, setSelectedPackage] = useState({
//     amount: 0
//   });

//   // Modal states
//   const [showModeModal, setShowModeModal] = useState(false);
//   const [showNormalModal, setShowNormalModal] = useState(false);
//   const [showAutoCompoundModal, setShowAutoCompoundModal] =
//     useState(false);

//   // User selects package amount
//   const handleBuyClick = (pkg) => {
//     setSelectedPackage({
//       amount: pkg.price
//     });

//     setShowModeModal(true);
//   };

//   // Open normal package
//   const handleNormalPackage = () => {
//     setShowModeModal(false);
//     setShowNormalModal(true);
//   };

//   // Open Auto Compound V2
//   const handleAutoCompound = () => {
//     setShowModeModal(false);
//     setShowAutoCompoundModal(true);
//   };

//   // Close all modals
//   const closeAllModals = () => {
//     setShowModeModal(false);
//     setShowNormalModal(false);
//     setShowAutoCompoundModal(false);
//   };

//   if (!user) return null;

//   return (
//     <section className="min-h-screen w-full bg-[#050608] px-3 pb-10 pt-4 text-white sm:px-5">

//       <div className="mx-auto max-w-6xl">

//         {/* GLOBAL WEALTH HEADER */}
//         <header className="relative mb-6 overflow-hidden rounded-2xl border border-[#d4af37]/25 bg-black shadow-[0_12px_45px_rgba(0,0,0,0.5)]">

//           <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 via-transparent to-transparent" />

//           <div className="relative flex flex-col items-center px-4 py-5 sm:px-8 sm:py-7">

//             <img
//               src="/global-wealth-logo.png"
//               alt="Global Wealth"
//               className="h-auto max-h-[145px] w-full max-w-[650px] object-contain"
//             />

//             <div className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />

//             <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-[#d8bd70] sm:text-xs">
//               Global Wealth · Package Collection
//             </p>

//             <h1 className="mt-2 text-center text-xl font-black tracking-wide text-white sm:text-3xl">
//               Choose Your{" "}
//               <span className="text-[#e5c875]">Package</span>
//             </h1>

//             <p className="mt-2 max-w-lg text-center text-xs leading-5 text-gray-400 sm:text-sm">
//               Select your preferred package amount and choose
//               your activation mode.
//             </p>

//           </div>
//         </header>

//         {/* PACKAGE OVERVIEW */}
//         <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#0c1017]">

//           <div className="border-r border-[#d4af37]/15 px-3 py-4 text-center">
//             <Gem
//               className="mx-auto mb-2 text-[#e5c875]"
//               size={20}
//             />

//             <p className="text-xl font-black text-white">
//               {packagesList.length}
//             </p>

//             <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-500">
//               Available Packages
//             </p>
//           </div>

//           <div className="px-3 py-4 text-center">
//             <Clock3
//               className="mx-auto mb-2 text-[#e5c875]"
//               size={20}
//             />

//             <p className="text-xl font-black text-white">
//               {PACKAGE_DURATION_DAYS}
//             </p>

//             <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-500">
//               Normal Package Days
//             </p>
//           </div>

//         </div>

//         {/* SECTION HEADING */}
//         <div className="mb-4 px-1">
//           <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
//             Select Your Amount
//           </p>

//           <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
//             Available Packages
//           </h2>
//         </div>

//         {/* PACKAGE AMOUNTS */}
//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

//           {packagesList.map((pkg) => (

//             <article
//               key={pkg.id}
//               className="group relative overflow-hidden rounded-xl border border-[#d4af37]/20 bg-gradient-to-br from-[#131923] to-[#090c11] transition-all duration-200 hover:border-[#d4af37]/60 hover:shadow-[0_5px_25px_rgba(212,175,55,0.10)]"
//             >

//               <div className="flex items-center justify-between gap-3 p-4">

//                 {/* AMOUNT */}
//                 <div className="flex items-center gap-3">

//                   <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#e5c875]">
//                     <Gem size={20} />
//                   </div>

//                   <div>
//                     <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
//                       Package Amount
//                     </p>

//                     <h3 className="mt-1 text-xl font-black text-[#e5c875]">
//                       {formatUSD(pkg.price)}
//                     </h3>
//                   </div>

//                 </div>

//                 {/* SELECT BUTTON */}
//                 <button
//                   type="button"
//                   onClick={() => handleBuyClick(pkg)}
//                   className="flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#c5a04c] via-[#f0d98e] to-[#c5a04c] px-3 text-[10px] font-black tracking-wide text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)] transition-all hover:brightness-110 active:scale-[0.97]"
//                 >
//                   SELECT
//                   <ArrowUpRight size={14} />
//                 </button>

//               </div>

//               <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#d4af37] to-transparent transition-all duration-300 group-hover:w-full" />

//             </article>

//           ))}

//         </div>

//         {/* PACKAGE MODE INFORMATION */}
//         <div className="mt-6 rounded-xl border border-[#d4af37]/15 bg-[#0c1017] p-4">

//           <div className="flex items-start gap-3">

//             <ShieldCheck
//               size={20}
//               className="mt-0.5 shrink-0 text-[#e5c875]"
//             />

//             <div>
//               <h3 className="text-xs font-bold text-[#e5c875]">
//                 Choose Your Activation Mode
//               </h3>

//               <p className="mt-1 text-[10px] leading-5 text-gray-400">
//                 After selecting an amount, choose Normal Package
//                 or Auto Compound V2. Review the applicable terms
//                 and activation details before proceeding.
//               </p>
//             </div>

//           </div>

//         </div>

//       </div>

//       {/* STEP 1: PACKAGE MODE SELECTION */}
//       {showModeModal && (
//         <PackageModeModal
//           packageName="Selected Package"
//           packageAmount={selectedPackage.amount}
//           onClose={closeAllModals}
//           onNormal={handleNormalPackage}
//           onAutoCompound={handleAutoCompound}
//         />
//       )}

//       {/* STEP 2A: NORMAL PACKAGE */}
//       {showNormalModal && (
//         <TopUpModalWithInput
//           packageAmount={selectedPackage.amount}
//           packageName="Selected Package"
//           onClose={() => setShowNormalModal(false)}
//           onSuccess={() => {
//             setShowNormalModal(false);
//           }}
//         />
//       )}

//       {/* STEP 2B: AUTO COMPOUND V2 */}
//       {showAutoCompoundModal && (
//         <AutoCompoundV2Modal
//           packageAmount={selectedPackage.amount}
//           onClose={() => setShowAutoCompoundModal(false)}
//           onSuccess={() => {
//             setShowAutoCompoundModal(false);
//           }}
//         />
//       )}

//     </section>
//   );
// };

// export default Packages;


import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowUpRight, Gem } from "lucide-react";

import TopUpModalWithInput from "./modals/TopUpModalWithInput";
import PackageModeModal from "./modals/PackageModeModal";
import AutoCompoundV2Modal from "./modals/AutoCompoundV2Modal";

const packagesList = [
  { id: 1, price: 2 },
  { id: 2, price: 5 },
  { id: 3, price: 10 },
  { id: 4, price: 20 },
  { id: 5, price: 50 },
  { id: 6, price: 100 },
  { id: 7, price: 200 },
  { id: 8, price: 500 },
  { id: 9, price: 1000 },
];

const formatUSD = (amount) =>
  `$${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Packages = () => {
  const { user } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState({ amount: 0 });
  const [showModeModal, setShowModeModal] = useState(false);
  const [showNormalModal, setShowNormalModal] = useState(false);
  const [showAutoCompoundModal, setShowAutoCompoundModal] = useState(false);

  const handleBuyClick = (pkg) => {
    setSelectedPackage({ amount: pkg.price });
    setShowModeModal(true);
  };

  const handleNormalPackage = () => {
    setShowModeModal(false);
    setShowNormalModal(true);
  };

  const handleAutoCompound = () => {
    setShowModeModal(false);
    setShowAutoCompoundModal(true);
  };

  const closeAllModals = () => {
    setShowModeModal(false);
    setShowNormalModal(false);
    setShowAutoCompoundModal(false);
  };

  if (!user) return null;

  return (
    <section className="min-h-screen w-full bg-[#050608] px-3 pb-10 pt-4 text-white sm:px-5">
      <div className="mx-auto max-w-6xl">
        {/* Package selection heading */}
        <div className="mb-5 px-1 sm:mb-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#d4af37]">
            Select Your Amount
          </p>
          <h2 className="mt-1 text-lg font-bold text-white sm:text-xl">
            Available Packages
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Choose a package amount to continue.
          </p>
        </div>

        {/* Package amounts */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packagesList.map((pkg) => (
            <article
              key={pkg.id}
              className="group relative overflow-hidden rounded-xl border border-[#d4af37]/20 bg-gradient-to-br from-[#131923] to-[#090c11] transition-all duration-200 hover:border-[#d4af37]/60 hover:shadow-[0_5px_25px_rgba(212,175,55,0.10)]"
            >
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#e5c875]">
                    <Gem size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                      Package Amount
                    </p>
                    <h3 className="mt-1 text-xl font-black text-[#e5c875]">
                      {formatUSD(pkg.price)}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuyClick(pkg)}
                  className="flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#c5a04c] via-[#f0d98e] to-[#c5a04c] px-3 text-[10px] font-black tracking-wide text-black shadow-[0_4px_15px_rgba(212,175,55,0.15)] transition-all hover:brightness-110 active:scale-[0.97]"
                >
                  SELECT
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#d4af37] to-transparent transition-all duration-300 group-hover:w-full" />
            </article>
          ))}
        </div>
      </div>

      {/* Step 1: package mode selection */}
      {showModeModal && (
        <PackageModeModal
          packageName="Selected Package"
          packageAmount={selectedPackage.amount}
          onClose={closeAllModals}
          onNormal={handleNormalPackage}
          onAutoCompound={handleAutoCompound}
        />
      )}

      {/* Step 2A: normal package */}
      {showNormalModal && (
        <TopUpModalWithInput
          packageAmount={selectedPackage.amount}
          packageName="Selected Package"
          onClose={() => setShowNormalModal(false)}
          onSuccess={() => setShowNormalModal(false)}
        />
      )}

      {/* Step 2B: Auto Compound V2 */}
      {showAutoCompoundModal && (
        <AutoCompoundV2Modal
          packageAmount={selectedPackage.amount}
          onClose={() => setShowAutoCompoundModal(false)}
          onSuccess={() => setShowAutoCompoundModal(false)}
        />
      )}
    </section>
  );
};

export default Packages;
