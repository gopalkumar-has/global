import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { format, isValid } from "date-fns";
import {
  Search,
  History,
  ArrowDownCircle,
  CalendarDays,
  ExternalLink,
  RefreshCw,
  Wallet,
  ReceiptText,
  TrendingUp,
  Copy,
  Check,
} from "lucide-react";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedHash, setCopiedHash] = useState("");

  const getSafeAmount = (value) => {
    if (value == null || value === "") return 0;

    // MongoDB Decimal128 may arrive as {$numberDecimal: "..."}.
    if (typeof value === "object" && value.$numberDecimal != null) {
      const parsed = Number.parseFloat(value.$numberDecimal);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getRecordHash = (record) => {
    const hash = record?.txHash || record?.txnHash || "";
    if (typeof hash !== "string") return "";
    return hash.trim();
  };

  const formatHash = (hash) => {
    if (!hash) return "";
    if (hash.length < 15) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  const getRecordDate = (record) => {
    const rawDate = record?.createdAt || record?.date;
    if (!rawDate) return null;
    const date = new Date(rawDate);
    return isValid(date) ? date : null;
  };

  const formatAmount = (value) =>
    getSafeAmount(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const fetchDeposits = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const userId = user?.userId;

      if (!userId) {
        setDeposits([]);
        return;
      }

      const res = await api.get(
        `/wallet/history/${userId}?t=${new Date().getTime()}`
      );

      const historyData =
        res.data?.history || (Array.isArray(res.data) ? res.data : []);

      const processedDeposits = (Array.isArray(historyData) ? historyData : [])
        .filter((item) => {
          const type = String(item?.type || "").toLowerCase();
          return type === "deposit" || type === "manual_credit";
        })
        .sort((a, b) => {
          const dateA = new Date(a?.createdAt || a?.date || 0).getTime();
          const dateB = new Date(b?.createdAt || b?.date || 0).getTime();
          return dateB - dateA;
        });

      setDeposits(processedDeposits);
    } catch (error) {
      console.error("Failed to fetch deposit history:", error);
      setDeposits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
    // Initial fetch only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDeposits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return deposits;

    return deposits.filter((record) => {
      const amount = getSafeAmount(
        record.amount ?? record.grossAmount
      ).toString();
      const date = getRecordDate(record);
      const dateText = date ? format(date, "dd-MM-yyyy") : "";
      const hash = getRecordHash(record).toLowerCase();
      const type = String(record.type || "deposit").toLowerCase();

      return (
        amount.includes(query) ||
        dateText.includes(query) ||
        hash.includes(query) ||
        type.includes(query)
      );
    });
  }, [deposits, search]);

  const totalAmount = useMemo(
    () =>
      deposits.reduce(
        (sum, record) =>
          sum + getSafeAmount(record.amount ?? record.grossAmount),
        0
      ),
    [deposits]
  );

  const onChainCount = useMemo(
    () => deposits.filter((record) => getRecordHash(record)).length,
    [deposits]
  );

  const handleCopyHash = async (hash) => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      window.setTimeout(() => {
        setCopiedHash((current) => (current === hash ? "" : current));
      }, 1600);
    } catch (error) {
      console.error("Unable to copy transaction hash:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 py-5 font-sans text-white sm:px-5 md:px-8 md:py-8">
      {/* Ambient glass lighting */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[115px]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-yellow-300/[0.07] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/[0.06] blur-[110px]" />

      <main className="relative mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-amber-300/10" />
          <div className="pointer-events-none absolute -right-1 -top-9 h-40 w-40 rounded-full border border-amber-300/10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
                Wallet Activity
              </div>
              <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                <History className="text-amber-200" size={27} />
                Deposit <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-300 bg-clip-text text-transparent">History</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                Review deposit and manual-credit records, amounts, dates and available blockchain transaction details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchDeposits(true)}
              disabled={loading || refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-amber-200/25 bg-amber-300/[0.09] px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/[0.15] disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-5 backdrop-blur-xl">
            <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-300/[0.09] blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Total Deposit Amount</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-200">${formatAmount(totalAmount)}</p>
                <p className="mt-1 text-xs text-white/35">Across loaded records</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.08] text-amber-200">
                <Wallet size={23} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5 backdrop-blur-xl">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Total Records</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{deposits.length}</p>
                <p className="mt-1 text-xs text-white/35">Deposits and manual credits</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-300">
                <ReceiptText size={23} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-orange-300/15 bg-orange-300/[0.035] p-5 backdrop-blur-xl">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">With Transaction Hash</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-orange-200">{onChainCount}</p>
                <p className="mt-1 text-xs text-white/35">Records with a supplied hash</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-300/15 bg-orange-300/[0.08] text-orange-200">
                <TrendingUp size={23} />
              </div>
            </div>
          </div>
        </section>

        {/* History table */}
        <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Transaction Records</h2>
              <p className="mt-1 text-xs text-white/40">Search by amount, date or transaction hash</p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Search amount, date or tx hash..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-amber-300/50 focus:bg-black/40"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.025] text-[10px] uppercase tracking-[0.18em] text-amber-100/55">
                  <th className="px-5 py-4 text-center font-semibold">Sr.</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 text-center font-semibold">Transaction Hash</th>
                  <th className="px-5 py-4 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-amber-100/65">
                      <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-amber-200/20 border-t-amber-200" />
                      Loading deposit records...
                    </td>
                  </tr>
                ) : filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-white/35">
                      No Deposit Records Found
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((record, index) => {
                    const date = getRecordDate(record);
                    const amount = getSafeAmount(record.amount ?? record.grossAmount);
                    const hash = getRecordHash(record);
                    const isManual = String(record.type || "").toLowerCase() === "manual_credit";

                    return (
                      <tr key={record._id || record.id || index} className="transition hover:bg-white/[0.035]">
                        <td className="px-5 py-4 text-center text-white/35">{index + 1}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-white/60">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={14} className="text-white/30" />
                            {date ? format(date, "dd MMM yyyy") : "N/A"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isManual
                              ? "border-sky-300/20 bg-sky-300/[0.08] text-sky-200"
                              : "border-amber-200/20 bg-amber-200/[0.08] text-amber-100"
                          }`}>
                            <ArrowDownCircle size={12} />
                            {isManual ? "Manual Credit" : "Deposit"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {hash ? (
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={`https://bscscan.com/tx/${encodeURIComponent(hash)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/25 px-3 py-2 font-mono text-[11px] font-semibold text-amber-100 transition hover:border-amber-200/30 hover:bg-amber-200/[0.08]"
                                title="Open transaction on BscScan"
                              >
                                {formatHash(hash)}
                                <ExternalLink size={12} />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleCopyHash(hash)}
                                title="Copy transaction hash"
                                aria-label="Copy transaction hash"
                                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/45 transition hover:border-amber-200/25 hover:text-amber-100"
                              >
                                {copiedHash === hash ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-white/30">No on-chain hash</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-bold tabular-nums text-emerald-300">
                          + ${formatAmount(amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-3 md:hidden">
            {loading ? (
              <div className="py-12 text-center text-sm text-amber-100/65">
                <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-amber-200/20 border-t-amber-200" />
                Loading deposit records...
              </div>
            ) : filteredDeposits.length === 0 ? (
              <div className="py-12 text-center text-sm text-white/35">No Deposit Records Found</div>
            ) : (
              filteredDeposits.map((record, index) => {
                const date = getRecordDate(record);
                const amount = getSafeAmount(record.amount ?? record.grossAmount);
                const hash = getRecordHash(record);
                const isManual = String(record.type || "").toLowerCase() === "manual_credit";

                return (
                  <article key={record._id || record.id || index} className="rounded-2xl border border-white/[0.09] bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Transaction Type</p>
                        <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isManual
                            ? "border-sky-300/20 bg-sky-300/[0.08] text-sky-200"
                            : "border-amber-200/20 bg-amber-200/[0.08] text-amber-100"
                        }`}>
                          <ArrowDownCircle size={12} />
                          {isManual ? "Manual Credit" : "Deposit"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Amount</p>
                        <p className="mt-1 text-lg font-bold tabular-nums text-emerald-300">+ ${formatAmount(amount)}</p>
                      </div>
                    </div>

                    <div className="my-4 h-px bg-white/[0.07]" />

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Date</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-white/65">
                        <CalendarDays size={14} className="text-white/35" />
                        {date ? format(date, "dd MMM yyyy") : "N/A"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Transaction Hash</p>
                      {hash ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <a
                            href={`https://bscscan.com/tx/${encodeURIComponent(hash)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[11px] font-semibold text-amber-100"
                          >
                            {formatHash(hash)} <ExternalLink size={12} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(hash)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"
                          >
                            {copiedHash === hash ? <Check size={13} /> : <Copy size={13} />}
                            {copiedHash === hash ? "Copied" : "Copy"}
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-white/30">No on-chain hash</p>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-white/40">
              Showing <span className="font-semibold text-white/80">{filteredDeposits.length}</span>
              {" "}of <span className="font-semibold text-white/80">{deposits.length}</span> records
            </p>
            <p className="text-[10px] text-white/25">
              {search.trim() ? "Filtered results" : "Most recent records first"}
            </p>
          </div>
        </section>

        <p className="mt-5 text-center text-[10px] tracking-wide text-white/20">
          DEPOSIT HISTORY • WALLET ACTIVITY
        </p>
      </main>
    </div>
  );
};

export default DepositHistory;
