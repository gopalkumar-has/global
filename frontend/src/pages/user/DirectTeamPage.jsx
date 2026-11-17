import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const DirectTeamPage = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDirectTeam = async () => {
      if (!user?.userId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError("");
        }

        const res = await api.get(
          `/user/direct-team/${user.userId}?t=${new Date().getTime()}`
        );

        const teamData = Array.isArray(res.data.team) ? res.data.team : [];
        if (isMounted) setTeam(teamData);
      } catch (err) {
        console.error("Error fetching direct team:", err);
        if (isMounted) {
          setTeam([]);
          setError("Unable to load your direct team. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDirectTeam();
    return () => {
      isMounted = false;
    };
  }, [user?.userId]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return team;

    return team.filter((member) =>
      [
        member.userId,
        member.name,
        member.mobile,
      ].some((value) => String(value ?? "").toLowerCase().includes(s))
    );
  }, [team, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, entriesPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const indexOfFirst = (safePage - 1) * entriesPerPage;
  const indexOfLast = Math.min(indexOfFirst + entriesPerPage, filtered.length);
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  const activeCount = useMemo(
    () => team.filter((member) => Number(member.topUpAmount) > 0).length,
    [team]
  );
  const pendingCount = team.length - activeCount;

  const formatAmount = (amount) => {
    const value = Number(amount);
    return Number.isFinite(value)
      ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
      : "$0";
  };

  const formatDate = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toLocaleDateString("en-GB");
  };

  const handleRefresh = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      setError("");
      const res = await api.get(
        `/user/direct-team/${user.userId}?t=${new Date().getTime()}`
      );
      setTeam(Array.isArray(res.data.team) ? res.data.team : []);
    } catch (err) {
      console.error("Error refreshing direct team:", err);
      setError("Unable to refresh your direct team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pageNumbers = [];
  const startPage = Math.max(1, safePage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  for (let page = Math.max(1, endPage - 4); page <= endPage; page += 1) {
    pageNumbers.push(page);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 py-5 font-sans text-white sm:px-5 md:px-8 md:py-8">
      {/* Ambient glassmorphism lighting */}
      <div className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full bg-amber-500/10 blur-[110px]" />
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
                Network Overview
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Direct <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-300 bg-clip-text text-transparent">Team</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                View your personally referred members, activation status and joining details.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-amber-200/25 bg-amber-300/[0.09] px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/[0.15] disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
            >
              <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* Summary metrics */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition hover:border-amber-200/25">
            <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-300/[0.08] blur-2xl transition group-hover:bg-amber-300/[0.14]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Total Direct Team</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{team.length}</p>
                <p className="mt-1 text-xs text-white/35">All referred members</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200/15 bg-amber-200/[0.08] text-amber-200">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.035] p-5 backdrop-blur-xl transition hover:border-emerald-300/30">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Active Members</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-300">{activeCount}</p>
                <p className="mt-1 text-xs text-white/35">Members with top-up</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-300">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-orange-300/15 bg-orange-300/[0.035] p-5 backdrop-blur-xl transition hover:border-orange-300/30">
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/40">Pending Members</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-orange-200">{pendingCount}</p>
                <p className="mt-1 text-xs text-white/35">Awaiting activation</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-orange-300/15 bg-orange-300/[0.08] text-orange-200">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Directory panel */}
        <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Member Directory</h2>
              <p className="mt-1 text-xs text-white/40">Search and review your direct referrals</p>
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
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, name or mobile..."
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

          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.025] text-[10px] uppercase tracking-[0.18em] text-amber-100/55">
                  <th className="px-5 py-4 font-semibold">#</th>
                  <th className="px-5 py-4 font-semibold">Member ID</th>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">Mobile</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Activation Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-sm text-amber-100/65">
                      <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-amber-200/20 border-t-amber-200" />
                      Loading direct team...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-sm text-white/35">
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((member, index) => {
                    const isActive = Number(member.topUpAmount) > 0;
                    return (
                      <tr key={member._id || member.userId || index} className="transition hover:bg-white/[0.035]">
                        <td className="px-5 py-4 text-white/35">{indexOfFirst + index + 1}</td>
                        <td className="px-5 py-4 font-semibold text-amber-100">{member.userId || "-"}</td>
                        <td className="px-5 py-4 text-white/80">{member.name || "-"}</td>
                        <td className="px-5 py-4">
                          {member.mobile ? (
                            <div className="flex items-center gap-3">
                              <span className="text-white/65">{member.mobile}</span>
                              <a
                                href={`tel:${member.mobile}`}
                                title={`Call ${member.mobile}`}
                                aria-label={`Call ${member.mobile}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300 transition hover:bg-emerald-300/[0.16]"
                              >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M6.6 3.8 9 3.3l2 4.8-1.8 1.5a15 15 0 0 0 5.2 5.2l1.5-1.8 4.8 2-.5 2.4a2 2 0 0 1-2.2 1.6C10.8 18.2 5.8 13.2 5 6a2 2 0 0 1 1.6-2.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </a>
                            </div>
                          ) : <span className="text-white/25">-</span>}
                        </td>
                        <td className="px-5 py-4 font-semibold text-amber-200">{formatAmount(isActive ? member.topUpAmount : 0)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isActive ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300" : "border-orange-300/20 bg-orange-300/[0.07] text-orange-200"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-orange-200"}`} />
                            {isActive ? "Active" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/50">{isActive ? formatDate(member.createdAt) : ""}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile member cards */}
          <div className="space-y-3 p-3 md:hidden">
            {loading ? (
              <div className="py-12 text-center text-sm text-amber-100/65">
                <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-amber-200/20 border-t-amber-200" />
                Loading direct team...
              </div>
            ) : currentItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-white/35">No matching records found</div>
            ) : (
              currentItems.map((member, index) => {
                const isActive = Number(member.topUpAmount) > 0;
                return (
                  <article key={member._id || member.userId || index} className="rounded-2xl border border-white/[0.09] bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Member ID</p>
                        <p className="mt-1 truncate font-semibold text-amber-100">{member.userId || "-"}</p>
                        <p className="mt-1 truncate text-sm text-white/75">{member.name || "-"}</p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isActive ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-300" : "border-orange-300/20 bg-orange-300/[0.07] text-orange-200"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-300" : "bg-orange-200"}`} />
                        {isActive ? "Active" : "Pending"}
                      </span>
                    </div>
                    <div className="my-4 h-px bg-white/[0.07]" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Amount</p>
                        <p className="mt-1 text-sm font-semibold text-amber-200">{formatAmount(isActive ? member.topUpAmount : 0)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Activation Date</p>
                        <p className="mt-1 text-sm text-white/60">{isActive ? formatDate(member.createdAt) || "-" : "-"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Mobile</p>
                        <p className="mt-1 truncate text-sm text-white/65">{member.mobile || "-"}</p>
                      </div>
                      {member.mobile && (
                        <a
                          href={`tel:${member.mobile}`}
                          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-300/[0.16]"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M6.6 3.8 9 3.3l2 4.8-1.8 1.5a15 15 0 0 0 5.2 5.2l1.5-1.8 4.8 2-.5 2.4a2 2 0 0 1-2.2 1.6C10.8 18.2 5.8 13.2 5 6a2 2 0 0 1 1.6-2.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Call
                        </a>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-white/[0.08] px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/40">
              Showing <span className="font-semibold text-white/80">{filtered.length === 0 ? 0 : indexOfFirst + 1}</span>
              {" "}to <span className="font-semibold text-white/80">{indexOfLast}</span>
              {" "}of <span className="font-semibold text-white/80">{filtered.length}</span> entries
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage === 1 || loading}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-amber-200/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-25"
              >
                Previous
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
                disabled={safePage === totalPages || loading}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-amber-200/30 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-25"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-[10px] tracking-wide text-white/20">
          DIRECT TEAM • MEMBER OVERVIEW
        </p>
      </main>
    </div>
  );
};

export default DirectTeamPage;
