import React, { useEffect, useState } from "react";
import {
  X,
  Pencil,
  RotateCcw,
  Check,
  Layers3,
  Crown,
  ShieldCheck,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const formatAmount = (value) => {
  const number = Number(value);
  return (Number.isFinite(number) ? number : 0).toFixed(2);
};

const getSafeAmount = (value) => {
  if (value == null) return 0;
  if (typeof value === "object" && value.$numberDecimal != null) {
    return Number(value.$numberDecimal) || 0;
  }
  return Number(value) || 0;
};

const getArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.packages)) return payload.packages;
  if (Array.isArray(payload?.data?.packages)) return payload.data.packages;
  return [];
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const LivePackageStatsBox = ({ user }) => {
  const { token } = useAuth();

  const [highestActive, setHighestActive] = useState(0);
  const [totalCompound, setTotalCompound] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const isPromo = user?.role === "promo";
  const [promoCompound, setPromoCompound] = useState(() =>
    user?.userId ? localStorage.getItem(`promo_compound_${user.userId}`) : null
  );
  const [promoHighest, setPromoHighest] = useState(() =>
    user?.userId ? localStorage.getItem(`promo_highest_${user.userId}`) : null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editType, setEditType] = useState("");
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchLiveStats = async () => {
      if (!user?.userId || !token) {
        setHighestActive(0);
        setTotalCompound(0);
        return;
      }

      setLoadingStats(true);
      const headers = { Authorization: `Bearer ${token}` };
      const cacheBust = `t=${Date.now()}`;

      try {
        // A) Normal package history (existing endpoint and eligibility rule retained).
        const historyRequest = api.get(
          `/wallet/topup-history/${encodeURIComponent(user.userId)}?${cacheBust}`,
          { headers }
        );

        // B) Auto Compound V2 packages belong to the authenticated user.
        // This route is registered by the autoCompoundV2 routes file.
        const v2Request = api.get(`/auto-compound-v2/my-packages?${cacheBust}`, {
          headers,
        });

        const [historyResult, v2Result] = await Promise.allSettled([
          historyRequest,
          v2Request,
        ]);

        if (cancelled) return;

        let highestNormal = 0;
        if (historyResult.status === "fulfilled") {
          const history = getArray(historyResult.value?.data);
          const now = Date.now();

          history.forEach((tx) => {
            const receiverId = String(tx?.toUserId || tx?.userId || "");
            if (receiverId !== String(user.userId)) return;

            const dateValue = tx?.createdAt || tx?.date;
            if (!isValidDate(dateValue)) return;

            const ageDays = Math.floor(
              Math.abs(now - new Date(dateValue).getTime()) / 86400000
            );
            const amount = getSafeAmount(tx?.amount ?? tx?.grossAmount);
            const type = String(tx?.type || "").toLowerCase();
            const description = String(tx?.description || "").toLowerCase();

            const isPackageTransaction =
              (type.includes("activation") ||
                type.includes("topup") ||
                type.includes("package")) &&
              !type.includes("compound");

            if (
              isPackageTransaction &&
              !description.includes("promotion") &&
              ageDays <= 25 &&
              amount > highestNormal
            ) {
              highestNormal = amount;
            }
          });
        } else {
          console.error("[LIVE STATS] Normal package history error:", historyResult.reason);
        }

        let compoundPackages = [];
        if (v2Result.status === "fulfilled") {
          const response = v2Result.value?.data;
          compoundPackages = getArray(response);
        } else {
          console.error("[LIVE STATS] Auto Compound V2 API error:", v2Result.reason);
        }

        // Keep only active V2 packages. Distribution is an active lifecycle stage too.
        compoundPackages = compoundPackages.filter((pkg) => {
          const status = String(pkg?.status || "").toLowerCase();
          return (
            ["active", "distribution"].includes(status) &&
            getSafeAmount(pkg?.packageAmount) >= 2
          );
        });

        // Fetch each package's ledger so the displayed amount uses the newest
        // ledger closingBalance, not the original packageAmount.
        const ledgerResults = await Promise.allSettled(
          compoundPackages.map((pkg) =>
            api.get(
              `/auto-compound-v2/ledger/${encodeURIComponent(pkg._id)}?${cacheBust}`,
              { headers }
            )
          )
        );

        if (cancelled) return;

        let compoundBalanceTotal = 0;
        let highestV2Package = 0;

        compoundPackages.forEach((pkg, index) => {
          const originalAmount = getSafeAmount(pkg?.packageAmount);
          highestV2Package = Math.max(highestV2Package, originalAmount);

          const ledgerResponse = ledgerResults[index];
          const ledger =
            ledgerResponse?.status === "fulfilled"
              ? getArray(ledgerResponse.value?.data?.ledger ?? ledgerResponse.value?.data)
              : [];

          // API currently returns ledger ascending by createdAt; sort defensively.
          const latestLedger = [...ledger].sort((a, b) => {
            const aTime = new Date(a?.createdAt || a?.updatedAt || a?.processingDate || 0).getTime();
            const bTime = new Date(b?.createdAt || b?.updatedAt || b?.processingDate || 0).getTime();
            return bTime - aTime;
          })[0];

          const status = String(pkg?.status || "").toLowerCase();
          let currentBalance;

          if (latestLedger && latestLedger.closingBalance != null) {
            currentBalance = getSafeAmount(latestLedger.closingBalance);
          } else if (status === "distribution") {
            currentBalance = getSafeAmount(pkg?.remainingAmount);
          } else {
            currentBalance = getSafeAmount(pkg?.currentBalance ?? pkg?.packageAmount);
          }

          compoundBalanceTotal += Math.max(0, currentBalance);
        });

        if (!cancelled) {
          setHighestActive(Math.max(highestNormal, highestV2Package));
          setTotalCompound(compoundBalanceTotal);
        }
      } catch (error) {
        console.error("[LIVE STATS] Unexpected API error:", error);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    fetchLiveStats();
    return () => {
      cancelled = true;
    };
  }, [user?.userId, token]);

  // Reload promo overrides when switching accounts in the same mounted component.
  useEffect(() => {
    setPromoCompound(
      user?.userId ? localStorage.getItem(`promo_compound_${user.userId}`) : null
    );
    setPromoHighest(
      user?.userId ? localStorage.getItem(`promo_highest_${user.userId}`) : null
    );
  }, [user?.userId]);

  const handleDoubleClick = (type) => {
    if (!isPromo) return;
    setEditType(type);
    setEditValue(
      type === "compound"
        ? promoCompound ?? formatAmount(totalCompound)
        : promoHighest ?? formatAmount(highestActive)
    );
    setIsModalOpen(true);
  };

  const handleSavePromo = () => {
    const numericValue = Number(editValue);
    if (!user?.userId || !Number.isFinite(numericValue) || numericValue < 0) return;

    const value = formatAmount(numericValue);
    if (editType === "compound") {
      setPromoCompound(value);
      localStorage.setItem(`promo_compound_${user.userId}`, value);
    } else if (editType === "highest") {
      setPromoHighest(value);
      localStorage.setItem(`promo_highest_${user.userId}`, value);
    }
    setIsModalOpen(false);
  };

  const handleResetPromo = () => {
    if (!user?.userId) return;

    if (editType === "compound") {
      setPromoCompound(null);
      localStorage.removeItem(`promo_compound_${user.userId}`);
    } else if (editType === "highest") {
      setPromoHighest(null);
      localStorage.removeItem(`promo_highest_${user.userId}`);
    }
    setIsModalOpen(false);
  };

  const displayCompound =
    promoCompound !== null ? formatAmount(promoCompound) : formatAmount(totalCompound);
  const displayHighest =
    promoHighest !== null ? formatAmount(promoHighest) : formatAmount(highestActive);

  const activeEditLabel =
    editType === "compound" ? "Auto Compound Active" : "Highest Active Package";

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-[24px] border border-[#c5a45b]/25 bg-[#0a0e15] text-white shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#d7b96f]/10" />
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[#d7b96f]/10" />
          <div className="absolute bottom-0 left-0 h-32 w-1/2 bg-gradient-to-tr from-[#b99548]/[0.07] to-transparent blur-2xl" />
        </div>

        <div className="relative  sm:px-5 sm:pb-5">
          <div className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#111823]">
            <button
              type="button"
              onDoubleClick={() => handleDoubleClick("compound")}
              className={`group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.025] sm:px-5 ${
                isPromo ? "cursor-pointer" : "cursor-default"
              }`}
              aria-label={isPromo ? "Double click to edit Auto Compound Active" : "Auto Compound Active"}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.09] text-emerald-300 ring-1 ring-inset ring-emerald-300/15">
                <Layers3 size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                    Auto Compound Active
                  </p>
                  {isPromo && <Pencil size={11} className="text-slate-600 group-hover:text-[#e5c878]" />}
                </div>
                <p className="mt-1 text-[clamp(1.25rem,5vw,1.8rem)] font-semibold leading-none tracking-tight text-white tabular-nums">
                  <span className="mr-1 text-base text-emerald-300">$</span>{displayCompound}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">
                  {loadingStats ? "Syncing…" : "Latest ledger balance"}
                </p>
                <ShieldCheck size={15} className="ml-auto mt-1 text-emerald-400/70" />
              </div>
            </button>

            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.09] to-transparent sm:mx-5" />

            <button
              type="button"
              onDoubleClick={() => handleDoubleClick("highest")}
              className={`group flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.025] sm:px-5 ${
                isPromo ? "cursor-pointer" : "cursor-default"
              }`}
              aria-label={isPromo ? "Double click to edit Highest Active Package" : "Highest Active Package"}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/[0.09] text-sky-300 ring-1 ring-inset ring-sky-300/15">
                <Crown size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                    Highest Active Package
                  </p>
                  {isPromo && <Pencil size={11} className="text-slate-600 group-hover:text-[#e5c878]" />}
                </div>
                <p className="mt-1 text-[clamp(1.25rem,5vw,1.8rem)] font-semibold leading-none tracking-tight text-white tabular-nums">
                  <span className="mr-1 text-base text-sky-300">$</span>{displayHighest}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-600">
                  Normal + Auto Compound V2
                </p>
                <Crown size={15} className="ml-auto mt-1 text-sky-300/70" />
              </div>
            </button>
          </div>

          {isPromo && (
            <p className="mt-3 text-center text-[9px] font-medium tracking-wide text-slate-600">
              Double-click a value to customise its display
            </p>
          )}
        </div>
      </section>

      {isModalOpen && isPromo && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="w-full max-w-[390px] overflow-hidden rounded-[22px] border border-[#d3b15d]/30 bg-[#0b1018] shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7b65f]">Promo controls</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{activeEditLabel}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Custom amount (USD)
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-[#111925] px-4 transition focus-within:border-[#d3b15d]/70">
                <span className="mr-2 text-lg font-semibold text-[#d9b960]">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  className="w-full bg-transparent py-3.5 text-lg font-semibold text-white outline-none placeholder:text-slate-600"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                Custom display value is saved in this browser for this promo account.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleResetPromo}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3 py-3 text-xs font-bold text-rose-300 transition hover:bg-rose-500/[0.13]"
                >
                  <RotateCcw size={14} /> Reset original
                </button>
                <button
                  type="button"
                  onClick={handleSavePromo}
                  disabled={!editValue.trim() || !Number.isFinite(Number(editValue)) || Number(editValue) < 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c5a04c] to-[#ecd58c] px-3 py-3 text-xs font-extrabold text-[#17130a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check size={15} /> Save amount
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LivePackageStatsBox;
