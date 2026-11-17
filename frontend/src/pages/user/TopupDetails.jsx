import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import {
  Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft,
  RefreshCcw, CheckCircle2, UserRound, CalendarDays, Package,
  Wallet, Sparkles, AlertCircle, ArrowRightLeft, X
} from "lucide-react";

const TopupDetails = () => {
  const { user } = useAuth();
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Convert MongoDB Decimal128 and regular numeric values safely.
  const getSafeAmount = (value) => {
    if (!value) return 0;
    if (value.$numberDecimal) return parseFloat(value.$numberDecimal) || 0;
    return parseFloat(value) || 0;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTopups = async () => {
      if (!user?.userId) {
        setLoading(false);
        setError("User not found. Please log in.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await api.get(
          `/wallet/topup-history/${user.userId}?t=${new Date().getTime()}`
        );

        if (!isMounted) return;

        if (Array.isArray(res.data)) {
          const userTopups = res.data.filter((transaction) => {
            const typeStr = (transaction.type || "").toLowerCase();
            const sourceStr = (transaction.source || "").toLowerCase();
            const descStr = (transaction.description || "").toUpperCase();

            const isTopupRelated =
              typeStr.includes("topup") ||
              sourceStr.includes("topup") ||
              typeStr.includes("activation") ||
              typeStr.includes("package");

            const isNotPromo = !descStr.includes("PROMOTION");
            return isTopupRelated && isNotPromo;
          });

          const uniqueTopups = Array.from(
            new Map(
              userTopups.map((transaction) => [
                `${transaction._id}-${transaction.createdAt}`,
                transaction,
              ])
            ).values()
          );

          uniqueTopups.sort(
            (a, b) =>
              new Date(b.createdAt || b.date) -
              new Date(a.createdAt || a.date)
          );

          setTopups(uniqueTopups);
        } else {
          setTopups([]);
        }
      } catch (err) {
        console.error("Topup fetch error:", err);
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load top-ups.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopups();
    return () => {
      isMounted = false;
    };
  }, [user?.userId]);

  const currentUserId = String(user?.userId || "");

  const getTransactionView = (transaction) => {
    let senderId = transaction.fromUserId
      ? String(transaction.fromUserId)
      : String(transaction.userId || "");
    let receiverId = transaction.toUserId
      ? String(transaction.toUserId)
      : String(transaction.userId || "");

    const isDebitTransaction =
      transaction.type?.toLowerCase().includes("debit") ||
      Number(getSafeAmount(transaction.amount)) < 0;

    if (isDebitTransaction && !transaction.toUserId) {
      senderId = currentUserId;
      const descMatch = transaction.description?.match(
        /(?:for|user|to|#|-)\s*([0-9]{4,10})/i
      );
      receiverId = descMatch?.[1] || "Team Member";
    }

    let tag = {
      label: "ACTIVATED",
      icon: CheckCircle2,
      className: "border-white/10 bg-white/[0.04] text-[#b9b1a2]",
    };

    if (senderId === currentUserId && receiverId === currentUserId) {
      tag = {
        label: "SELF ACTIVATION",
        icon: CheckCircle2,
        className: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400",
      };
    } else if (senderId === currentUserId && receiverId !== currentUserId) {
      tag = {
        label: "ACTIVATED FOR TEAM",
        icon: ArrowUpRight,
        className: "border-[#c9a45c]/25 bg-[#c9a45c]/[0.08] text-[#e2c47f]",
      };
    } else if (receiverId === currentUserId && senderId !== currentUserId) {
      tag = {
        label: "ACTIVATED BY UPLINE",
        icon: ArrowDownLeft,
        className: "border-sky-500/20 bg-sky-500/[0.08] text-sky-400",
      };
    }

    return { senderId, receiverId, tag };
  };

  const filteredTopups = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    return topups.filter((transaction) => {
      const { senderId, receiverId } = getTransactionView(transaction);
      const descStr = (transaction.description || "").toLowerCase();
      const amountStr = getSafeAmount(
        transaction.amount || transaction.grossAmount
      ).toString().toLowerCase();

      return (
        senderId.toLowerCase().includes(searchLower) ||
        receiverId.toLowerCase().includes(searchLower) ||
        descStr.includes(searchLower) ||
        amountStr.includes(searchLower)
      );
    });
  }, [topups, searchQuery, currentUserId]);

  const totalPages = Math.max(1, Math.ceil(filteredTopups.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const indexOfFirstRow = (safeCurrentPage - 1) * rowsPerPage;
  const indexOfLastRow = safeCurrentPage * rowsPerPage;
  const currentRows = filteredTopups.slice(indexOfFirstRow, indexOfLastRow);

  const totalAmount = topups.reduce(
    (sum, transaction) =>
      sum + Math.abs(
        getSafeAmount(transaction.amount || transaction.grossAmount)
      ),
    0
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const formatRecordDate = (date, pattern) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? "N/A" : format(parsed, pattern);
  };

  const renderMember = (memberId) => {
    if (memberId === currentUserId) {
      return (
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#e5c984]">
          #{memberId}
          <span className="rounded bg-[#c9a45c]/15 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-[#d9bb78]">
            YOU
          </span>
        </span>
      );
    }

    return (
      <span className="break-all text-[#d7d0c3]">
        {memberId.includes("Team") ? memberId : `#${memberId || "N/A"}`}
      </span>
    );
  };

  const TransactionTag = ({ tag }) => {
    const Icon = tag.icon;
    return (
      <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold tracking-[0.08em] ${tag.className}`}>
        <Icon size={12} />
        {tag.label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-[#080808] px-3 pb-12 pt-6 font-sans text-[#eee6d6] sm:px-6 sm:pt-9 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Page intro */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#b99a5a]">
              <span className="h-px w-7 bg-[#b99a5a]" />
              Global Wealth / Membership
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#f1e2c1] sm:text-4xl">
              Package <span className="italic text-[#c9a45c]">Details</span>
            </h1>
         
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c9a45c]/20 bg-[#c9a45c]/[0.06] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#d6bd83]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Package activity
          </div>
        </div>

        {/* Overview cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-[#c9a45c]/25 bg-gradient-to-br from-[#211b10] via-[#15120d] to-[#0d0d0c] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-[#c9a45c]/10" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-[#a58c59]">Total activations</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[#f1e2c1]">{topups.length.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-[11px] text-[#8e8575]">All recorded package entries</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a45c]/25 bg-[#c9a45c]/[0.08] text-[#d9bb78]">
                <Package size={22} />
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#c9a45c]/25 bg-gradient-to-br from-[#211b10] via-[#15120d] to-[#0d0d0c] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full border border-[#c9a45c]/10" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-[#a58c59]">My all Package Total</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-[#f1e2c1]">
                  ${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-[11px] text-[#8e8575]">Sum of recorded top-up amounts</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9a45c]/25 bg-[#c9a45c]/[0.08] text-[#d9bb78]">
                <Wallet size={22} />
              </span>
            </div>
          </div>
        </div>

        {/* History panel */}
        <section className="overflow-hidden rounded-[24px] border border-[#c9a45c]/20 bg-[#10100f] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a45c]/20 bg-[#c9a45c]/[0.08] text-[#d9bb78]">
                <ArrowRightLeft size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-[#eee1c7]">Activation history</h2>
                <p className="mt-0.5 text-[10px] text-[#827a6d]">Search and review package transactions</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-xs text-[#9b9385]">
                <span>Show</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="rounded-lg border border-[#c9a45c]/25 bg-[#090909] px-3 py-2 text-sm text-[#e7d5ac] outline-none transition focus:border-[#d8b76e]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </label>

              <label className="relative block w-full sm:w-72">
                <span className="sr-only">Search package history</span>
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8250]" />
                <input
                  type="search"
                  placeholder="Search ID, details, amount..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full rounded-lg border border-[#c9a45c]/25 bg-[#090909] py-2.5 pl-9 pr-9 text-sm text-[#f5f0e6] outline-none transition placeholder:text-[#625c52] focus:border-[#d8b76e]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827a6d] hover:text-[#e5c984]"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="bg-[#19160f] text-[9px] uppercase tracking-[0.18em] text-[#c9a45c]">
                <tr>
                  <th className="px-4 py-4 text-center font-bold">Sr.</th>
                  <th className="px-4 py-4 font-bold">Date & Time</th>
                  <th className="px-4 py-4 font-bold">Action Type</th>
                  <th className="px-4 py-4 font-bold">Sender</th>
                  <th className="px-4 py-4 font-bold">Receiver</th>
                  <th className="px-4 py-4 text-right font-bold">Amount</th>
                  <th className="px-4 py-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.055] text-xs text-[#d6d0c5]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-[#c9a45c]">
                      <RefreshCcw size={22} className="mx-auto mb-3 animate-spin" />
                      Loading package history...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-red-400">
                      <AlertCircle size={22} className="mx-auto mb-3" />
                      {error}
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-[#827b70]">
                      <Package size={24} className="mx-auto mb-3 opacity-50" />
                      No package records found.
                    </td>
                  </tr>
                ) : currentRows.map((transaction, index) => {
                  const { senderId, receiverId, tag } = getTransactionView(transaction);
                  const TagIcon = tag.icon;
                  const recordDate = transaction.createdAt || transaction.date;
                  const finalAmount = Math.abs(getSafeAmount(transaction.amount || transaction.grossAmount));

                  return (
                    <tr key={`${transaction._id}-${transaction.createdAt}-${index}`} className="transition hover:bg-[#c9a45c]/[0.045]">
                      <td className="px-4 py-4 text-center text-[#756d60]">{indexOfFirstRow + index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-[#e5dccb]">{formatRecordDate(recordDate, "dd MMM yyyy")}</span>
                          <span className="text-[10px] text-[#80796c]">{formatRecordDate(recordDate, "hh:mm a")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold tracking-[0.07em] ${tag.className}`}>
                          <TagIcon size={12} /> {tag.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">{renderMember(senderId)}</td>
                      <td className="px-4 py-4 font-medium">{renderMember(receiverId)}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums text-[#e2c47f]">
                        ${finalAmount.toFixed(2)}
                      </td>
                      <td className="max-w-[240px] px-4 py-4 text-[#a9a091]" title={transaction.description || "Top-up package"}>
                        <span className="line-clamp-2">{transaction.description || "Top-up package"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tablet and mobile transaction cards */}
          <div className="grid gap-3 p-3 xl:hidden">
            {loading ? (
              <div className="py-14 text-center text-sm text-[#c9a45c]">
                <RefreshCcw size={22} className="mx-auto mb-3 animate-spin" />
                Loading package history...
              </div>
            ) : error ? (
              <div className="py-12 text-center text-sm text-red-400">
                <AlertCircle size={22} className="mx-auto mb-3" />
                {error}
              </div>
            ) : currentRows.length === 0 ? (
              <div className="py-14 text-center text-sm text-[#827b70]">
                <Package size={24} className="mx-auto mb-3 opacity-50" />
                No package records found.
              </div>
            ) : currentRows.map((transaction, index) => {
              const { senderId, receiverId, tag } = getTransactionView(transaction);
              const recordDate = transaction.createdAt || transaction.date;
              const finalAmount = Math.abs(getSafeAmount(transaction.amount || transaction.grossAmount));

              return (
                <article key={`${transaction._id}-${transaction.createdAt}-${index}`} className="rounded-2xl border border-[#c9a45c]/15 bg-[#171510] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-[10px] text-[#928876]">
                      <CalendarDays size={13} className="text-[#b99a5a]" />
                      <span>{formatRecordDate(recordDate, "dd MMM yyyy")}</span>
                      <span className="text-[#5d5547]">·</span>
                      <span>{formatRecordDate(recordDate, "hh:mm a")}</span>
                    </div>
                    <span className="text-[10px] text-[#6f6759]">#{indexOfFirstRow + index + 1}</span>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <TransactionTag tag={tag} />
                    <p className="text-xl font-semibold tabular-nums text-[#e2c47f]">${finalAmount.toFixed(2)}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-[#766e60]">Sender</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <UserRound size={12} className="shrink-0 text-[#8c8067]" />
                        <span className="min-w-0 break-all">{renderMember(senderId)}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1 text-[9px] uppercase tracking-[0.16em] text-[#766e60]">Receiver</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <UserRound size={12} className="shrink-0 text-[#8c8067]" />
                        <span className="min-w-0 break-all">{renderMember(receiverId)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-white/[0.06] pt-3">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#766e60]">Details</p>
                    <p className="mt-1 break-words text-xs leading-5 text-[#aaa091]">{transaction.description || "Top-up package"}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredTopups.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-white/[0.07] px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-[#827b70]">
                Showing <span className="font-semibold text-[#e8d9b8]">{indexOfFirstRow + 1}</span>
                {" "}to <span className="font-semibold text-[#e8d9b8]">{Math.min(indexOfLastRow, filteredTopups.length)}</span>
                {" "}of <span className="font-semibold text-[#e8d9b8]">{filteredTopups.length}</span> entries
              </p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#c9a45c]/20 px-3 py-2 text-xs font-medium text-[#d8c28f] transition hover:border-[#c9a45c]/50 hover:bg-[#c9a45c]/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="min-w-20 rounded-lg border border-[#c9a45c]/25 bg-[#c9a45c]/[0.08] px-4 py-2 text-center text-xs font-semibold text-[#e2c47f]">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#c9a45c]/20 px-3 py-2 text-xs font-medium text-[#d8c28f] transition hover:border-[#c9a45c]/50 hover:bg-[#c9a45c]/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[9px] uppercase tracking-[0.2em] text-[#5e574b]">
          <Sparkles size={11} className="text-[#9c8048]" />
          Global Wealth · Package activity
        </p>
      </div>
    </main>
  );
};

export default TopupDetails;
