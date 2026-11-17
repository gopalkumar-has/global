
import React from "react";
import { X, Gem, RefreshCw, ArrowRight, Clock3 } from "lucide-react";

const PackageModeModal = ({
  packageName,
  packageAmount,
  onNormal,
  onAutoCompound,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-[9980] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md">

      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-[#d4af37]/30 bg-[#080b10] shadow-[0_0_40px_rgba(212,175,55,0.12)]">

        <div className="flex items-center justify-between border-b border-[#d4af37]/20 bg-gradient-to-r from-[#17130a] to-[#29200e] px-5 py-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
              Global Wealth
            </p>
            <h2 className="mt-1 text-lg font-black text-white">
              Choose Package Mode
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">

          <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#17130c] p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
              Selected Package
            </p>

            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-white">
                {packageName}
              </span>

              <span className="text-lg font-black text-[#e5c875]">
                ${Number(packageAmount).toLocaleString("en-US")}
              </span>
            </div>
          </div>

          {/* NORMAL PACKAGE */}
          <button
            type="button"
            onClick={onNormal}
            className="group mb-3 flex w-full items-center gap-3 rounded-xl border border-[#d4af37]/25 bg-[#111720] p-4 text-left transition hover:border-[#e5c875] hover:bg-[#171b20]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#e5c875]">
              <Gem size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-white">
                3% Daily Roi
              </h3>
              <p className="mt-1 text-[10px] text-gray-400">
                Existing package activation · 45 days
              </p>
            </div>

            <ArrowRight size={18} className="text-[#e5c875] transition group-hover:translate-x-1" />
          </button>

          {/* AUTO COMPOUND V2 */}
          <button
            type="button"
            onClick={onAutoCompound}
            className="group flex w-full items-center gap-3 rounded-xl border border-purple-400/25 bg-[#11131c] p-4 text-left transition hover:border-purple-300/60 hover:bg-[#171725]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-400/10 text-purple-300">
              <RefreshCw size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-white">
                Auto Compound 
              </h3>
              <p className="mt-1 text-[10px] text-gray-400">
                Demo simulation · 25 / 50 / 100 days
              </p>
            </div>

            <ArrowRight size={18} className="text-purple-300 transition group-hover:translate-x-1" />
          </button>

          <p className="mt-4 text-center text-[9px] leading-5 text-gray-500">
            Select the mode you want to view. Auto Compound is
           </p>

        </div>
      </div>
    </div>
  );
};

export default PackageModeModal;
