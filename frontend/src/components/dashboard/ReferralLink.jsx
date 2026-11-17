import React, { useState } from "react";
import { Copy, Check, Link2, Sparkles } from "lucide-react";

const ReferralLinkBox = ({ link }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    if (!link) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Referral link copy failed:", error);
      setCopyError(true);
      setCopied(false);
    }
  };

  return (
    <section className="relative mb-6 w-full overflow-hidden rounded-[22px] border border-[#c5a45b]/25 bg-[#090e15] text-white shadow-[0_16px_42px_rgba(0,0,0,0.3)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#d4b45f]/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#d4b45f]/35 to-transparent" />

      <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d4b45f]/25 bg-[#d4b45f]/[0.09] text-[#e5c875]">
            <Link2 size={18} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d9bd75]">
              Network invitation
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-white sm:text-base">
              Your referral link
            </h3>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-slate-500 sm:flex">
          <Sparkles size={11} className="text-[#d9bd75]" />
          Invite & grow
        </span>
      </div>

      <div className="relative p-4 sm:p-5">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Personal invitation URL
          </label>
          <span className="text-[9px] font-medium text-slate-600">Share with your network</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-white/[0.09] bg-[#111925] px-3.5 transition focus-within:border-[#d4b45f]/50">
            <Link2 size={15} className="mr-2.5 shrink-0 text-[#c8a653]" />
            <input
              type="text"
              readOnly
              value={link || ""}
              onFocus={(event) => event.target.select()}
              aria-label="Referral link"
              className="min-w-0 w-full bg-transparent py-3.5 font-mono text-xs text-[#e1c779] outline-none selection:bg-[#d4b45f] selection:text-black sm:text-sm"
              placeholder="Referral link unavailable"
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!link}
            className={`flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-xs font-extrabold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              copied
                ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : "bg-gradient-to-r from-[#c5a04c] to-[#ecd58c] text-[#17130a] shadow-[0_7px_20px_rgba(197,160,76,0.14)] hover:brightness-105"
            }`}
          >
            {copied ? <Check size={16} strokeWidth={2.8} /> : <Copy size={16} strokeWidth={2.5} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        {copyError ? (
          <p className="mt-2 text-[10px] text-rose-300">
            Copy was blocked by the browser. Select the link above and copy it manually.
          </p>
        ) : (
          <p className="mt-2 text-[10px] text-slate-600">
            {copied ? "Referral link copied to clipboard." : "Use the copy button to share your personal invitation link."}
          </p>
        )}
      </div>
    </section>
  );
};

export default ReferralLinkBox;
