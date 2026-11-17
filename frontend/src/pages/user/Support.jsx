import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import SuccessModal from "../../components/modals/SuccessModal";
import {
  LifeBuoy,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  RotateCcw,
  MessageSquareText,
  ArrowUpRight,
  ShieldCheck,
  Ticket,
} from "lucide-react";

const Support = () => {
  const { user, token } = useAuth();
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [optional, setOptional] = useState("");
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("all");

  const fetchMessages = useCallback(async () => {
    if (!token) {
      setFetching(false);
      return;
    }
    try {
      setFetching(true);
      const res = await api.get(`/support/me?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserMessages(Array.isArray(res.data.supports) ? res.data.supports : []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your message." });
      return;
    }

    setLoading(true);
    setStatusMsg({ type: "", text: "" });
    try {
      const res = await api.post(
        "/support/create",
        {
          message,
          email: user?.email || "unknown",
          walletAddress,
          optional,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSubmittedMessage({ message, walletAddress, optional });
        setShowModal(true);
        setMessage("");
        setWalletAddress("");
        setOptional("");
        fetchMessages();
      }
    } catch (err) {
      const errorText =
        err.response?.data?.error || "Failed to send message. Please try again.";
      setStatusMsg({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setWalletAddress("");
    setOptional("");
    setStatusMsg({ type: "", text: "" });
  };

  const filteredMessages = userMessages.filter((ticket) => {
    if (historyFilter === "all") return true;
    return String(ticket.status || "Pending").toLowerCase() === historyFilter;
  });

  const statusMeta = (status) => {
    const value = String(status || "Pending").toLowerCase();
    if (["resolved", "closed"].includes(value)) {
      return {
        label: status || "Resolved",
        Icon: CheckCircle2,
        style: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
      };
    }
    if (value === "rejected") {
      return {
        label: status,
        Icon: XCircle,
        style: "border-rose-400/25 bg-rose-400/10 text-rose-300",
      };
    }
    return {
      label: status || "Pending",
      Icon: Clock3,
      style: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    };
  };

  const resolvedCount = userMessages.filter((m) =>
    ["resolved", "closed"].includes(String(m.status || "").toLowerCase())
  ).length;
  const pendingCount = userMessages.filter(
    (m) => String(m.status || "pending").toLowerCase() === "pending"
  ).length;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#080c13] px-4 pb-14 pt-24 font-sans text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute -right-40 top-12 h-[420px] w-[420px] rounded-full bg-amber-300/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -left-40 top-[480px] h-[360px] w-[360px] rounded-full bg-cyan-300/[0.035] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Help-desk masthead */}
        <header className="mb-9 flex flex-col justify-between gap-6 border-b border-white/10 pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.34em] text-amber-300">
              <span className="h-px w-8 bg-amber-300" />
              Global Wealth · Client Care
            </p>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] text-amber-200">
                <LifeBuoy size={25} />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                  Support <span className="font-light text-slate-400">desk</span>
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Send a request and follow the response from our support team.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 text-xs">
            <div className="border-l border-amber-300/60 pl-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Your tickets</p>
              <p className="mt-1 text-2xl font-semibold text-white">{userMessages.length}</p>
            </div>
            <div className="border-l border-amber-300/60 pl-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Awaiting reply</p>
              <p className="mt-1 text-2xl font-semibold text-amber-200">{pendingCount}</p>
            </div>
            <div className="border-l border-emerald-300/60 pl-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Resolved</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">{resolvedCount}</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          {/* New ticket workspace */}
          <section className="min-w-0">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">New conversation</p>
                <h2 className="mt-1 text-xl font-semibold">Create a support ticket</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Secure request
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden border border-white/10 bg-[#0d141f] shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300 text-[#151109]">
                    <Ticket size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Ticket details</p>
                    <p className="text-[10px] text-slate-500">Fields marked * are required</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-600">GW / HELP</span>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">User ID</span>
                    <input
                      type="text"
                      value={user?.userId || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-white/[0.07] bg-[#080d15] px-3 py-3 font-mono text-sm text-slate-500 outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Email</span>
                    <input
                      type="text"
                      value={user?.email || "Not available"}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-white/[0.07] bg-[#080d15] px-3 py-3 text-sm text-slate-500 outline-none"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Wallet address <span className="font-normal normal-case tracking-normal text-slate-600">(optional)</span></span>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter the related wallet address"
                    disabled={loading}
                    className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    <span>Describe your issue <span className="text-rose-300">*</span></span>
                    <span className="font-normal tracking-normal text-slate-600">{message.length} characters</span>
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened, when it happened, and what help you need..."
                    rows={7}
                    required
                    disabled={loading}
                    className="w-full resize-y rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Additional information <span className="font-normal normal-case tracking-normal text-slate-600">(optional)</span></span>
                  <input
                    type="text"
                    value={optional}
                    onChange={(e) => setOptional(e.target.value)}
                    placeholder="Reference number or any other useful detail"
                    disabled={loading}
                    className="w-full rounded-lg border border-white/10 bg-[#080d15] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/60"
                  />
                </label>

                {statusMsg.text && statusMsg.type === "error" && (
                  <div role="alert" className="flex items-start gap-2 border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-300">
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span>{statusMsg.text}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:border-white/25 hover:text-white disabled:opacity-40"
                  >
                    <RotateCcw size={15} /> Reset fields
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#17130a] transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={15} /> {loading ? "Sending ticket..." : "Submit support ticket"}
                  </button>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-amber-100/40 to-transparent" />
            </form>
          </section>

          {/* Ticket history as a vertical case-file rail */}
          <section className="min-w-0">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">Case archive</p>
                <h2 className="mt-1 text-xl font-semibold">Your support history</h2>
                <p className="mt-1 text-xs text-slate-500">Updates and replies appear below each ticket.</p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-[#0d141f] p-1">
                {[
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["resolved", "Resolved"],
                  ["rejected", "Rejected"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHistoryFilter(value)}
                    className={`rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition ${
                      historyFilter === value
                        ? "bg-white/10 text-amber-200"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute bottom-5 left-[17px] top-5 w-px bg-gradient-to-b from-amber-300/50 via-white/10 to-transparent" />
              <div className="max-h-[820px] space-y-4 overflow-y-auto pr-1">
                {fetching ? (
                  <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-amber-200">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/30 border-t-amber-300" />
                    Loading ticket history...
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="ml-9 border border-dashed border-white/15 bg-white/[0.02] px-5 py-12 text-center">
                    <MessageSquareText size={25} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">No tickets in this view</p>
                    <p className="mt-1 text-xs text-slate-600">Your submitted support requests will appear here.</p>
                  </div>
                ) : (
                  filteredMessages.map((ticket) => {
                    const meta = statusMeta(ticket.status);
                    const StatusIcon = meta.Icon;
                    return (
                      <article key={ticket._id} className="relative pl-9">
                        <div className="absolute left-[9px] top-5 z-10 flex h-[17px] w-[17px] items-center justify-center rounded-full border border-amber-300/50 bg-[#080c13]">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                        </div>
                        <div className="border border-white/[0.09] bg-[#0d141f] transition hover:border-amber-300/25">
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-600">CASE</span>
                              <span className="text-xs font-semibold text-slate-300">
                                {ticket._id ? String(ticket._id).slice(-8).toUpperCase() : "SUPPORT"}
                              </span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${meta.style}`}>
                              <StatusIcon size={12} /> {meta.label}
                            </span>
                          </div>

                          <div className="p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Your message</p>
                              <p className="text-[10px] text-slate-600">
                                {ticket.createdAt
                                  ? new Date(ticket.createdAt).toLocaleString("en-IN", {
                                      timeZone: "Asia/Kolkata",
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Date unavailable"}
                              </p>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                              {ticket.message}
                            </p>

                            {ticket.adminReply && (
                              <div className="mt-5 border-l-2 border-amber-300 bg-amber-300/[0.055] py-3 pl-4 pr-3">
                                <div className="mb-2 flex items-center gap-2 text-amber-200">
                                  <ShieldCheck size={15} />
                                  <span className="text-[10px] font-black uppercase tracking-[0.17em]">Support team reply</span>
                                  <ArrowUpRight size={13} className="ml-auto opacity-60" />
                                </div>
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                  {ticket.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {submittedMessage && (
        <SuccessModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          customTitle="Ticket Generated"
          customMessage="We've received your message. Our support team will review it and get back to you shortly."
        />
      )}
    </main>
  );
};

export default Support;
