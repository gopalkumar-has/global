import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const CREDIT_TYPES = [
  "deposit",
  "credit_to_wallet",
  "credit",
  "topup",
  "manual_credit",
  "fast_track",
  "fund_transfer_received",
];

const DEBIT_TYPES = [
  "withdrawal",
  "debit_topup",
  "manual_debit",
  "package_activation",
  "fund_transfer_sent",
];

const amountValue = (value) => {
  if (value && typeof value === "object") {
    return Number(value.$numberDecimal ?? value.amount ?? 0);
  }
  return Number(value ?? 0);
};

const formatMoney = (value) =>
  `$${amountValue(value).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })}`;

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const titleCaseType = (type) => {
  if (!type) return "Transaction";
  if (type === "manual_credit") return "Deposit";
  return type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const WalletHistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balances, setBalances] = useState({
    walletBalance: 0,
    usdtBep20Balance: 0,
  });
  const [search, setSearch] = useState("");
  const [direction, setDirection] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletHistory = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(
          `/wallet/history/${user.userId}?t=${new Date().getTime()}`
        );
        setTransactions(Array.isArray(res.data.history) ? res.data.history : []);
        setBalances(
          res.data.balances || {
            walletBalance: 0,
            usdtBep20Balance: 0,
          }
        );
      } catch (err) {
        console.error("Error fetching wallet history:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletHistory();
  }, [user?.userId]);

  const classified = useMemo(
    () =>
      transactions.map((tx) => {
        const type = String(tx.type || "").toLowerCase();
        const isCredit = CREDIT_TYPES.includes(type);
        const isDebit = DEBIT_TYPES.includes(type);
        return {
          ...tx,
          _direction: isCredit ? "credit" : isDebit ? "debit" : "other",
          _amount: amountValue(tx.amount),
        };
      }),
    [transactions]
  );

  const totals = useMemo(() => {
    return classified.reduce(
      (result, tx) => {
        if (tx._direction === "credit") result.credit += tx._amount;
        if (tx._direction === "debit") result.debit += tx._amount;
        return result;
      },
      { credit: 0, debit: 0 }
    );
  }, [classified]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return classified.filter((tx) => {
      const matchesDirection =
        direction === "all" || tx._direction === direction;
      const matchesSearch =
        !term ||
        String(tx.type || "").toLowerCase().includes(term) ||
        String(tx.description || "").toLowerCase().includes(term) ||
        String(tx.amount ?? "").toLowerCase().includes(term) ||
        String(tx.status || "").toLowerCase().includes(term);
      return matchesDirection && matchesSearch;
    });
  }, [classified, search, direction]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, direction, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const visibleItems = filtered.slice(startIndex, startIndex + entriesPerPage);

  const statusStyle = (status) => {
    const value = String(status || "success").toLowerCase();
    if (["success", "completed", "approved"].includes(value)) {
      return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    }
    if (["pending", "processing"].includes(value)) {
      return "border-amber-300/25 bg-amber-300/10 text-amber-200";
    }
    return "border-rose-400/25 bg-rose-400/10 text-rose-300";
  };

  return (
    <main className="min-h-screen w-full bg-[#070b12] px-4 pb-12 pt-24 font-sans text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Editorial page heading */}
        <header className="relative mb-9 overflow-hidden border-b border-white/10 pb-7">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-amber-300">
                <span className="h-px w-8 bg-amber-300" />
                Global Wealth / Account
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                Wallet <span className="font-light text-amber-300">Journal</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                A clear record of every movement in your fund wallet, from incoming credits to outgoing debits.
              </p>
            </div>
            <div className="relative min-w-[210px] border-l-2 border-amber-300 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Current fund wallet
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {formatMoney(balances.walletBalance)}
              </p>
              <p className="mt-2 text-xs text-slate-500">Available balance</p>
            </div>
          </div>
        </header>

        {/* Transaction flow summary — deliberately typographic, not repeated cards */}
        <section className="mb-10 grid gap-6 border-b border-white/10 pb-8 sm:grid-cols-3">
          <div className="sm:pr-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Total recorded credits</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">{formatMoney(totals.credit)}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-emerald-300">↗</span> Incoming wallet movements
            </div>
          </div>
          <div className="border-y border-white/10 py-5 sm:border-x sm:border-y-0 sm:px-6 sm:py-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Total recorded debits</p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">{formatMoney(totals.debit)}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-rose-300">↘</span> Outgoing wallet movements
            </div>
          </div>
          <div className="sm:pl-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Journal entries</p>
            <p className="mt-2 text-2xl font-semibold text-amber-200">{transactions.length.toLocaleString("en-US")}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-amber-300">◈</span> All transactions received
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">Activity record</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Transaction timeline</h2>
            <p className="mt-1 text-xs text-slate-500">Dates are displayed in Indian Standard Time (IST).</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
              {[
                ["all", "All"],
                ["credit", "Credits"],
                ["debit", "Debits"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDirection(value)}
                  className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                    direction === value
                      ? "bg-amber-300 text-[#17130a]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="relative block min-w-0 flex-1 sm:min-w-[250px]">
              <span className="sr-only">Search transactions</span>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search type, details, status..."
                className="w-full rounded-lg border border-white/10 bg-[#0d1420] py-3 pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
              />
            </label>
          </div>
        </section>

        {/* Timeline ledger */}
        <section className="overflow-hidden border-y border-white/10">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_130px_150px] gap-4 border-b border-white/10 bg-white/[0.025] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 md:grid">
            <span>Transaction</span>
            <span>Description</span>
            <span>Status</span>
            <span className="text-right">Amount / Date</span>
          </div>

          {loading ? (
            <div className="flex min-h-[230px] items-center justify-center gap-3 text-sm text-amber-200">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
              Loading wallet activity...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-xl text-slate-500">⌕</div>
              <p className="font-medium text-slate-300">No matching transactions</p>
              <p className="mt-1 text-sm text-slate-500">Try another search term or activity filter.</p>
            </div>
          ) : (
            <div>
              {visibleItems.map((tx, index) => {
                const isCredit = tx._direction === "credit";
                const isDebit = tx._direction === "debit";
                const amountTone = isCredit
                  ? "text-emerald-300"
                  : isDebit
                  ? "text-rose-300"
                  : "text-white";
                const sign = isCredit ? "+" : isDebit ? "−" : "";
                return (
                  <article
                    key={tx._id || `${startIndex}-${index}`}
                    className="group grid gap-3 border-b border-white/[0.07] px-4 py-5 transition hover:bg-white/[0.025] sm:px-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_130px_150px] md:items-center md:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg ${
                        isCredit
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                          : isDebit
                          ? "border-rose-400/25 bg-rose-400/10 text-rose-300"
                          : "border-white/10 bg-white/[0.04] text-slate-300"
                      }`}>
                        {isCredit ? "↙" : isDebit ? "↗" : "◇"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{titleCaseType(tx.type)}</p>
                        <p className="mt-1 text-[11px] text-slate-500">Entry #{startIndex + index + 1}</p>
                      </div>
                    </div>

                    <div className="min-w-0 md:py-1">
                      <p className="break-words text-sm leading-5 text-slate-300">{tx.description || "—"}</p>
                      <p className="mt-1 text-[11px] text-slate-500 md:hidden">{formatDate(tx.createdAt || tx.date)} · IST</p>
                    </div>

                    <div>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] ${statusStyle(tx.status)}`}>
                        {tx.status || "Success"}
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3 md:block md:text-right">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-slate-600 md:hidden">Amount</span>
                      <div>
                        <p className={`text-base font-semibold tabular-nums ${amountTone}`}>
                          {sign}{formatMoney(tx.amount)}
                        </p>
                        <p className="mt-1 hidden text-[11px] text-slate-500 md:block">{formatDate(tx.createdAt || tx.date)} · IST</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        <footer className="mt-5 flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span>Rows per page</span>
            <select
              value={entriesPerPage}
              onChange={(event) => setEntriesPerPage(Number(event.target.value))}
              className="rounded-md border border-white/10 bg-[#0d1420] px-2.5 py-2 text-white outline-none focus:border-amber-300/60"
            >
              {[10, 25, 50, 100].map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
            <span className="ml-1">
              Showing {filtered.length ? startIndex + 1 : 0}–{Math.min(startIndex + entriesPerPage, filtered.length)} of {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>
            <span className="min-w-[72px] text-center text-slate-300">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage >= totalPages}
              className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default WalletHistoryPage;
