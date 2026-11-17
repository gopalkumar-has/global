import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { getUserId } from "../../utils/authUtils";
import {
  Search,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  CalendarDays,
  RefreshCw,
  TrendingUp,
  ReceiptText,
} from "lucide-react";
import SpinnerOverlay from "../../components/common/SpinnerOverlay";

const DirectIncome = () => {
  const userId = getUserId();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDirectIncome = async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.get(
        `/transaction/transactions/${userId}?type=direct_income&t=${new Date().getTime()}`
      );

      const sorted = (Array.isArray(res.data) ? res.data : [])
        // Keep self-income excluded, as in the original page.
        .filter((txn) => String(txn.fromUserId) !== String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setTransactions(sorted);
    } catch (err) {
      console.error("Failed to fetch direct income", err);
      setTransactions([]);
      setError("Unable to load direct income records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectIncome();
    // userId is the account identifier for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return transactions;

    return transactions.filter(
      (txn) =>
        txn.description?.toLowerCase().includes(value) ||
        String(txn.fromUserId ?? "").toLowerCase().includes(value)
    );
  }, [transactions, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  const totalIncome = useMemo(
    () =>
      transactions.reduce((sum, txn) => {
        const amount = Number(txn.amount);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [transactions]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirst = (safePage - 1) * entriesPerPage;
  const indexOfLast = Math.min(indexOfFirst + entriesPerPage, filtered.length);
  const paginated = filtered.slice(indexOfFirst, indexOfLast);

  const formatMoney = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPackageAmount = (txn) =>
    Number(txn.package) > 0 ? Number(txn.package) : Number(txn.amount) * 10;

  const getCleanDescription = (txn) =>
    txn.description
      ? txn.description.replace(/\s*\(Leader\)/gi, "").trim()
      : "Direct income";

  const startPage = Math.max(1, safePage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const pageNumbers = [];
  for (let page = Math.max(1, endPage - 4); page <= endPage; page += 1) {
    pageNumbers.push(page);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 py-5 font-sans text-white sm:px-5 md:px-8 md:py-8">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-amber-500/10 blur-[115px]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-yellow-300/[0.07] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-500/[0.06] blur-[110px]" />

      {loading && <SpinnerOverlay />}

      <main className="relative mx-auto max-w-7xl">
        {/* Page heading */}
        <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-amber-300/10" />
          <div className="pointer-events-none absolute -right-1 -top-9 h-40 w-40 rounded-full border border-amber-300/10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
                Earnings Overview
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Direct <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-300 bg-clip-text text-transparent">Income</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                Review income generated from your direct referrals and explore each transaction.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchDirectIncome}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-amber-200/25 bg-amber-300/[0.09] px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/[0.15] disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-5 backdrop-blur-xl">
            <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-300/[0.09] blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Total Direct Income</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-200">${formatMoney(totalIncome)}</p>
                <p className="mt-1 text-xs text-white/35">All loaded direct-income records</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.08] text-amber-200">
                <DollarSign size={23} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5 backdrop-blur-xl">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Transactions</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{transactions.length}</p>
                <p className="mt-1 text-xs text-white/35">Direct-income entries</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-300">
                <ReceiptText size={23} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-orange-300/15 bg-orange-300/[0.035] p-5 backdrop-blur-xl">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Matching Records</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-orange-200">{filtered.length}</p>
                <p className="mt-1 text-xs text-white/35">Based on current search</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-300/15 bg-orange-300/[0.08] text-orange-200">
                <TrendingUp size={23} />
              </div>
            </div>
          </div>
        </section>

        {/* Transactions directory */}
        <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Income Transactions</h2>
              <p className="mt-1 text-xs text-white/40">Search and review your direct-income history</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="flex items-center gap-2 text-xs text-white/45">
                <span className="whitespace-nowrap">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-[#151515] px-3 py-2.5 text-sm text-white outline-none transition focus:border-amber-300/50"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </label>

              <div className="relative w-full sm:w-72">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search User ID or details..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-amber-300/50 focus:bg-black/40"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200 sm:mx-6">
              {error}
            </div>
          )}

          {/* Desktop transaction table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.025] text-[10px] uppercase tracking-[0.18em] text-amber-100/55">
                  <th className="px-5 py-4 text-center font-semibold">Sr.</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">From User</th>
                  <th className="px-5 py-4 text-center font-semibold">Package</th>
                  <th className="px-5 py-4 text-center font-semibold">Income</th>
                  <th className="px-5 py-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-amber-100/65">
                      Loading income records...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-white/35">
                      No Direct Income Records Found
                    </td>
                  </tr>
                ) : (
                  paginated.map((txn, idx) => {
                    const packageAmount = getPackageAmount(txn);
                    const cleanDescription = getCleanDescription(txn);
                    return (
                      <tr key={txn._id || idx} className="transition hover:bg-white/[0.035]">
                        <td className="px-5 py-4 text-center text-white/35">{indexOfFirst + idx + 1}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-white/55">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={14} className="text-white/30" />
                            {formatDate(txn.createdAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-white/85">
                          <span className="inline-flex items-center gap-2">
                            <UserCircle size={17} className="text-amber-200" />
                            {txn.fromUserId || "N/A"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-3 py-1 text-xs font-semibold text-amber-100">
                            ${formatMoney(packageAmount)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-emerald-300">
                          + ${formatMoney(txn.amount)}
                        </td>
                        <td className="max-w-[240px] px-5 py-4 text-xs text-white/45">
                          <span className="block truncate" title={cleanDescription}>{cleanDescription}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile transaction cards */}
          <div className="space-y-3 p-3 md:hidden">
            {loading ? (
              <div className="py-12 text-center text-sm text-amber-100/65">Loading income records...</div>
            ) : paginated.length === 0 ? (
              <div className="py-12 text-center text-sm text-white/35">No Direct Income Records Found</div>
            ) : (
              paginated.map((txn, idx) => {
                const packageAmount = getPackageAmount(txn);
                const cleanDescription = getCleanDescription(txn);
                return (
                  <article key={txn._id || idx} className="rounded-2xl border border-white/[0.09] bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">From User</p>
                        <p className="mt-1 flex items-center gap-2 truncate font-semibold text-amber-100">
                          <UserCircle size={16} />
                          {txn.fromUserId || "N/A"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1 text-xs font-bold text-emerald-300">
                        + ${formatMoney(txn.amount)}
                      </span>
                    </div>
                    <div className="my-4 h-px bg-white/[0.07]" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Package</p>
                        <p className="mt-1 text-sm font-semibold text-amber-100">${formatMoney(packageAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Date</p>
                        <p className="mt-1 text-sm text-white/65">{formatDate(txn.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Description</p>
                      <p className="mt-1 break-words text-sm text-white/60">{cleanDescription}</p>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/[0.08] px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-white/40">
                Showing <span className="font-semibold text-white/80">{indexOfFirst + 1}</span>
                {" "}to <span className="font-semibold text-white/80">{indexOfLast}</span>
                {" "}of <span className="font-semibold text-white/80">{filtered.length}</span> entries
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-amber-200/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                {pageNumbers.map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    aria-current={safePage === page ? "page" : undefined}
                    className={`h-9 min-w-9 rounded-lg border px-3 text-xs font-semibold transition ${safePage === page ? "border-amber-200/40 bg-amber-200/[0.13] text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.08)]" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-amber-200/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-[10px] tracking-wide text-white/20">
          DIRECT INCOME • TRANSACTION HISTORY
        </p>
      </main>
    </div>
  );
};

export default DirectIncome;
