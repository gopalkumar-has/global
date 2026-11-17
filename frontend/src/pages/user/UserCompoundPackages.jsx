import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Activity,
  Loader2,
  Layers,
  Zap,
  ArrowDownToLine,
  DollarSign,
  Wallet,
  RefreshCw,
  Users,
  Network,
  Clock3,
  TrendingUp,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const toAmount = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const raw =
    typeof value === "object" && value.$numberDecimal !== undefined
      ? value.$numberDecimal
      : value;
  const number = Number(raw);
  return Number.isFinite(number) ? number : 0;
};

const money = (value) =>
  `$${toAmount(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateText = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const asArray = (response, keys = ["data"]) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const getLatestLedger = (ledger) => {
  if (!Array.isArray(ledger) || ledger.length === 0) return null;
  return [...ledger].sort((a, b) => {
    const aDate = new Date(
      a?.createdAt || a?.processingDate || a?.updatedAt || 0
    ).getTime();
    const bDate = new Date(
      b?.createdAt || b?.processingDate || b?.updatedAt || 0
    ).getTime();
    return bDate - aDate;
  })[0];
};

const CircularProgress = ({ completed, total, color = "text-[#e5c875]" }) => {
  const safeTotal = Math.max(1, toAmount(total));
  const safeCompleted = Math.min(safeTotal, Math.max(0, toAmount(completed)));
  const percentage = Math.min(100, (safeCompleted / safeTotal) * 100);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 64 64" className="-rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4.5"
          fill="transparent"
          className="text-white/10"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="4.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentage / 100) * circumference}
          strokeLinecap="round"
          className={`${color} transition-all duration-700`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-black leading-none text-white">
          {safeCompleted}
        </span>
        <span className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-500">
          Day
        </span>
      </div>
    </div>
  );
};

const UserCompoundPackages = () => {
  const { user, token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = useCallback(async (showLoader = true) => {
    if (!user?.userId || !token) {
      setPackages([]);
      setCommissions([]);
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);
    setErrorMessage("");

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Matches the supplied autoCompoundV2Routes:
      // GET /my-packages and GET /my-commissions
      const [packageResult, commissionResult] = await Promise.allSettled([
        api.get("/auto-compound-v2/my-packages", { headers }),
        api.get("/auto-compound-v2/my-commissions", { headers }),
      ]);

      if (packageResult.status !== "fulfilled") {
        throw packageResult.reason;
      }

      const packageList = asArray(packageResult.value, ["data", "packages"]);

      // The backend ledger endpoint returns { success, package, ledger }.
      // Fetch each package ledger so the UI displays the actual latest
      // closingBalance, rather than incorrectly treating packageAmount as profit.
      const ledgerResults = await Promise.allSettled(
        packageList.map((pkg) =>
          pkg?._id
            ? api.get(
                `/auto-compound-v2/ledger/${encodeURIComponent(pkg._id)}`,
                { headers }
              )
            : Promise.resolve({ data: { ledger: [] } })
        )
      );

      const packagesWithLedger = packageList.map((pkg, index) => {
        const result = ledgerResults[index];
        const ledger =
          result.status === "fulfilled"
            ? asArray(result.value, ["ledger"])
            : [];
        const latestLedger = getLatestLedger(ledger);

        // Backend stores currentBalance and remainingAmount on the package.
        // Prefer latest ledger closingBalance whenever a ledger entry exists.
        const status = String(pkg?.status || "").toLowerCase();
        let currentBalance;
        if (latestLedger?.closingBalance !== undefined &&
            latestLedger?.closingBalance !== null) {
          currentBalance = toAmount(latestLedger.closingBalance);
        } else if (status === "distribution") {
          currentBalance = toAmount(pkg?.remainingAmount);
        } else {
          currentBalance = toAmount(pkg?.currentBalance ?? pkg?.packageAmount);
        }

        return {
          ...pkg,
          ledger,
          latestLedger,
          displayCurrentBalance: Math.max(0, currentBalance),
        };
      });

      setPackages(packagesWithLedger);

      if (commissionResult.status === "fulfilled") {
        setCommissions(
          asArray(commissionResult.value, ["data", "commissions"])
        );
      } else {
        console.warn(
          "Auto Compound V2 commission fetch failed:",
          commissionResult.reason
        );
        setCommissions([]);
      }
    } catch (error) {
      console.error("Auto Compound V2 page fetch error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to load Auto Compound V2 details. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId, token]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.userId || !token) {
        setPackages([]);
        setCommissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [packageResult, commissionResult] = await Promise.allSettled([
          api.get("/auto-compound-v2/my-packages", { headers }),
          api.get("/auto-compound-v2/my-commissions", { headers }),
        ]);

        if (packageResult.status !== "fulfilled") {
          throw packageResult.reason;
        }

        const packageList = asArray(packageResult.value, ["data", "packages"]);
        const ledgerResults = await Promise.allSettled(
          packageList.map((pkg) =>
            pkg?._id
              ? api.get(
                  `/auto-compound-v2/ledger/${encodeURIComponent(pkg._id)}`,
                  { headers }
                )
              : Promise.resolve({ data: { ledger: [] } })
          )
        );

        if (cancelled) return;

        const withLedger = packageList.map((pkg, index) => {
          const result = ledgerResults[index];
          const ledger =
            result.status === "fulfilled"
              ? asArray(result.value, ["ledger"])
              : [];
          const latestLedger = getLatestLedger(ledger);
          const status = String(pkg?.status || "").toLowerCase();

          let currentBalance;
          if (latestLedger?.closingBalance !== undefined &&
              latestLedger?.closingBalance !== null) {
            currentBalance = toAmount(latestLedger.closingBalance);
          } else if (status === "distribution") {
            currentBalance = toAmount(pkg?.remainingAmount);
          } else {
            currentBalance = toAmount(pkg?.currentBalance ?? pkg?.packageAmount);
          }

          return {
            ...pkg,
            ledger,
            latestLedger,
            displayCurrentBalance: Math.max(0, currentBalance),
          };
        });

        setPackages(withLedger);
        setCommissions(
          commissionResult.status === "fulfilled"
            ? asArray(commissionResult.value, ["data", "commissions"])
            : []
        );
      } catch (error) {
        console.error("Auto Compound V2 page fetch error:", error);
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message ||
              "Unable to load Auto Compound V2 details. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user?.userId, token]);

  const ongoingPackages = useMemo(
    () =>
      packages.filter((pkg) =>
        ["active", "distribution"].includes(
          String(pkg?.status || "").toLowerCase()
        )
      ),
    [packages]
  );

  const completedPackages = useMemo(
    () =>
      packages.filter(
        (pkg) => String(pkg?.status || "").toLowerCase() === "completed"
      ),
    [packages]
  );

  const activePrincipal = useMemo(
    () =>
      ongoingPackages.reduce(
        (sum, pkg) => sum + Math.max(0, toAmount(pkg?.packageAmount)),
        0
      ),
    [ongoingPackages]
  );

  const currentCompoundBalance = useMemo(
    () =>
      ongoingPackages.reduce(
        (sum, pkg) => sum + Math.max(0, toAmount(pkg?.displayCurrentBalance)),
        0
      ),
    [ongoingPackages]
  );

  const pendingDirect = useMemo(
    () =>
      commissions
        .filter(
          (item) =>
            String(item?.type || "").toLowerCase() === "direct_income" &&
            String(item?.status || "").toLowerCase() === "pending"
        )
        .reduce((sum, item) => sum + Math.max(0, toAmount(item?.amount)), 0),
    [commissions]
  );

  const pendingLevel = useMemo(
    () =>
      commissions
        .filter(
          (item) =>
            String(item?.type || "").toLowerCase() === "level_income" &&
            String(item?.status || "").toLowerCase() === "pending"
        )
        .reduce((sum, item) => sum + Math.max(0, toAmount(item?.amount)), 0),
    [commissions]
  );

  const refresh = async () => {
    setRefreshing(true);
    await fetchData(false);
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-[22px] border border-[#d4af37]/20 bg-[#080d15] p-3 text-white shadow-[0_18px_55px_rgba(0,0,0,0.32)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#e5c875]">
            <Layers size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black uppercase tracking-[0.13em] text-white sm:text-base">
              Auto Compound V2
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-[10px]">
              <Zap size={11} className="text-[#e5c875]" />
              Live Package &amp; Ledger Details
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading || refreshing}
          aria-label="Refresh Auto Compound V2"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-[#d4af37]/40 hover:text-[#e5c875] disabled:opacity-40"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="col-span-2 rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#d4af37]/[0.12] to-[#101722] p-3.5 sm:col-span-2 sm:p-4">
          <div className="flex items-center gap-2 text-[#e5c875]">
            <Wallet size={15} />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.13em]">
              Active Package Amount
            </span>
          </div>
          <p className="mt-2 break-all text-2xl font-black tracking-tight text-white tabular-nums sm:text-[26px]">
            {loading ? "—" : money(activePrincipal)}
          </p>
          <p className="mt-1 text-[9px] text-slate-500">
            Sum of active + distribution packageAmount
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
              Current Balance
            </span>
          </div>
          <p className="mt-2 break-all text-lg font-black text-white tabular-nums">
            {loading ? "—" : money(currentCompoundBalance)}
          </p>
          <p className="mt-1 text-[9px] text-slate-500">Latest ledger closing</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 sm:p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity size={14} className="text-[#e5c875]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
              Ongoing Plans
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-white tabular-nums">
            {loading ? "—" : ongoingPackages.length}
          </p>
          <p className="mt-1 text-[9px] text-slate-500">Active + distribution</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Users size={13} className="text-[#e5c875]" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Pending Direct Commission
            </span>
          </div>
          <p className="mt-1.5 text-base font-black text-white tabular-nums">
            {loading ? "—" : money(pendingDirect)}
          </p>
          <p className="mt-1 text-[8px] text-slate-500">
            Backend commission status: pending
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Network size={13} className="text-cyan-300" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Pending Level Commission
            </span>
          </div>
          <p className="mt-1.5 text-base font-black text-white tabular-nums">
            {loading ? "—" : money(pendingLevel)}
          </p>
          <p className="mt-1 text-[8px] text-slate-500">
            Backend commission status: pending
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-3 animate-spin text-[#d4af37]" size={28} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Loading Auto Compound V2...
          </span>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] px-4 py-7 text-center">
          <p className="text-xs font-semibold text-rose-200">{errorMessage}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 rounded-lg border border-[#d4af37]/30 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#e5c875] hover:bg-[#d4af37]/10"
          >
            Try Again
          </button>
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d4af37]/20 bg-[#0b111b] px-4 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/[0.07] text-[#e5c875]">
            <Layers size={21} />
          </span>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.13em] text-slate-300">
            No Auto Compound V2 Packages
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Your V2 packages will appear here after activation.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {packages.map((pkg, index) => {
            const status = String(pkg?.status || "unknown").toLowerCase();
            const isDistribution = status === "distribution";
            const isCompleted = status === "completed";
            const isActive = status === "active";
            const amount = toAmount(pkg?.packageAmount);
            const currentBalance = toAmount(pkg?.displayCurrentBalance);
            const selectedDays = Math.max(1, toAmount(pkg?.selectedDays) || 1);
            const daysCompleted = toAmount(pkg?.daysCompleted);
            const distributionDays = Math.max(
              1,
              toAmount(pkg?.distributionDays) || 25
            );
            const distributionDaysCompleted = toAmount(
              pkg?.distributionDaysCompleted
            );

            const stageCompleted = isDistribution
              ? distributionDaysCompleted
              : daysCompleted;
            const stageTotal = isDistribution ? distributionDays : selectedDays;
            const stageLabel = isDistribution
              ? "Distribution Progress"
              : "Compounding Progress";
            const progressColor = isCompleted
              ? "text-emerald-400"
              : isDistribution
                ? "text-cyan-300"
                : "text-[#e5c875]";

            const latestGrowth = toAmount(
              pkg?.latestLedger?.calculatedAmount
            );
            const latestStage = String(
              pkg?.latestLedger?.stage || ""
            ).toLowerCase();

            return (
              <article
                key={pkg?._id || `${pkg?.createdAt || "v2"}-${index}`}
                className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-gradient-to-br from-[#121a27] to-[#090e16] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:border-[#d4af37]/40 sm:gap-4 sm:p-4"
              >
                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#d4af37]/[0.045] blur-3xl" />

                <CircularProgress
                  completed={stageCompleted}
                  total={stageTotal}
                  color={progressColor}
                />

                <div className="z-10 min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className="flex items-center gap-1 text-sm font-black text-white sm:text-base">
                        <DollarSign size={14} className="text-[#e5c875]" />
                        {money(amount)}
                      </h3>
                      <span className="rounded-md border border-[#d4af37]/25 bg-[#d4af37]/[0.08] px-1.5 py-1 text-[8px] font-black uppercase tracking-wide text-[#e5c875]">
                        Auto Compound V2 · {selectedDays} Days
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-extrabold uppercase tracking-wider ${
                        isCompleted
                          ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                          : isActive
                            ? "border-[#d4af37]/25 bg-[#d4af37]/[0.08] text-[#e5c875]"
                            : isDistribution
                              ? "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300"
                              : "border-slate-400/20 bg-slate-400/[0.06] text-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={10} />
                      ) : isDistribution ? (
                        <ArrowDownToLine size={10} />
                      ) : (
                        <Activity size={10} />
                      )}
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.07] bg-[#070c14]/75 p-2.5 sm:grid-cols-3 sm:p-3">
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Current Package Balance
                      </p>
                      <p className="mt-1 break-all text-xs font-black text-emerald-300 tabular-nums">
                        {money(currentBalance)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        {stageLabel}
                      </p>
                      <p className="mt-1 text-xs font-black text-white tabular-nums">
                        {stageCompleted} / {stageTotal} Days
                      </p>
                    </div>

                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Latest Ledger Growth
                      </p>
                      <p className="mt-1 break-all text-xs font-black text-[#e5c875] tabular-nums">
                        {pkg?.latestLedger ? money(latestGrowth) : "—"}
                      </p>
                      {latestStage && (
                        <p className="mt-0.5 text-[8px] capitalize text-slate-500">
                          {latestStage}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 mt-1 border-t border-white/[0.07] pt-2 sm:col-span-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          <CalendarDays size={10} className="text-[#d4af37]" />
                          Started {dateText(pkg?.startDate)}
                        </p>
                        <p className="flex items-center gap-1.5 text-[8px] font-semibold text-slate-500">
                          <Clock3 size={10} />
                          Ends {dateText(pkg?.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && completedPackages.length > 0 && (
        <p className="mt-3 text-right text-[9px] font-semibold text-slate-500">
          {completedPackages.length} completed package
          {completedPackages.length === 1 ? "" : "s"} included in package history
        </p>
      )}
    </section>
  );
};

export default UserCompoundPackages;
