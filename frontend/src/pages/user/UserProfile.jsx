import React from "react";
import { useAuth } from "../../context/AuthContext";
import {
  UserRound, ShieldCheck, CalendarDays, Mail, Globe2,
  Wallet, Copy, Check, Sparkles, Fingerprint, BadgeCheck
} from "lucide-react";

function UserProfile() {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#080808] px-4 text-center font-sans text-[#e5cc8d]">
        <div className="w-full max-w-sm rounded-3xl border border-[#c9a45c]/20 bg-[#11100d] p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a45c]/25 bg-[#c9a45c]/[0.08]">
            <ShieldCheck size={25} className="text-[#d9bb78]" />
          </div>
          <h2 className="text-xl font-semibold text-[#f0dfb8]">Login Required</h2>
          <p className="mt-2 text-sm leading-6 text-[#948b7a]">Please log in to view your account profile.</p>
        </div>
      </div>
    );
  }

  // Preserve the existing joining-date display rule.
  let joinDate = "N/A";
  if (user?.createdAt) {
    const userDate = new Date(user.createdAt);
    const thresholdDate = new Date("2026-08-01T00:00:00");
    if (userDate < thresholdDate) {
      joinDate = "01-Aug-2026";
    } else {
      joinDate = userDate
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-");
    }
  }

  const walletAddress = user.walletAddress || "Not Provided";

  const handleCopyWallet = async () => {
    if (!user.walletAddress) return;
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Unable to copy wallet address:", error);
    }
  };

  const details = [
    { label: "Sponsor ID", value: user.sponsorId || "N/A", icon: Fingerprint },
    { label: "Full Name", value: user.name || "N/A", icon: UserRound },
    { label: "Member ID", value: user.userId || "N/A", icon: BadgeCheck },
    { label: "Joining Date", value: joinDate, icon: CalendarDays },
    { label: "Email Address", value: user.email || "N/A", icon: Mail },
    { label: "Country", value: user.country || "India", icon: Globe2 },
  ];

  return (
    <main className="min-h-screen bg-[#080808] px-3 pb-16 pt-6 font-sans text-[#eee6d6] sm:px-6 sm:pt-9 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Intro */}
        <div className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#b99a5a]">
            <span className="h-px w-7 bg-[#b99a5a]" />
            Global Wealth / Account
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#f1e2c1] sm:text-4xl">
                My <span className="italic text-[#c9a45c]">Profile</span>
              </h1>
              <p className="mt-2 text-sm text-[#898273]">
                Your personal and account information in one place.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Account profile
            </div>
          </div>
        </div>

        {/* Profile identity panel */}
        <section className="relative mb-5 overflow-hidden rounded-[26px] border border-[#c9a45c]/25 bg-[linear-gradient(115deg,#211a0e_0%,#14120e_42%,#0e0e0d_100%)] p-5 shadow-[0_20px_65px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border border-[#c9a45c]/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-44 w-44 rounded-full border border-[#c9a45c]/10" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[24px] border border-[#d7b96f]/40 bg-gradient-to-br from-[#d6b66c] to-[#80602d] text-[#171108] shadow-[0_10px_28px_rgba(201,164,92,0.18)]">
              <UserRound size={34} strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a58c59]">Member account</p>
              <h2 className="mt-1 break-words font-serif text-2xl font-semibold text-[#f3e5c7] sm:text-3xl">
                {user.name || "Member"}
              </h2>
              <p className="mt-1 text-sm text-[#a89e8b]">Member ID: <span className="font-semibold text-[#e0c681]">{user.userId || "N/A"}</span></p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-[#c9a45c]/20 bg-black/20 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#d6bd83] sm:self-center">
              <ShieldCheck size={15} />
              Profile details
            </div>
          </div>
          <div className="relative mt-6 grid grid-cols-1 gap-3 border-t border-[#c9a45c]/15 pt-5 sm:grid-cols-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#84775d]">Sponsor ID</p>
              <p className="mt-1 break-all text-sm font-medium text-[#e7dcc7]">{user.sponsorId || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#84775d]">Joining date</p>
              <p className="mt-1 text-sm font-medium text-[#e7dcc7]">{joinDate}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-[#84775d]">Country</p>
              <p className="mt-1 text-sm font-medium text-[#e7dcc7]">{user.country || "India"}</p>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#10100f] shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9a45c]/20 bg-[#c9a45c]/[0.08] text-[#d9bb78]">
              <UserRound size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#eee1c7]">Personal information</h3>
              <p className="mt-0.5 text-[10px] text-[#827a6d]">Basic details linked to your account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-white/[0.045] sm:grid-cols-2">
            {details.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex min-w-0 items-start gap-3 bg-[#10100f] px-5 py-4 sm:px-6">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c9a45c]/[0.07] text-[#b99a5a]">
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#807766]">{item.label}</p>
                    <p className="mt-1 break-words text-sm font-medium leading-6 text-[#e0d7c8]">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Wallet information */}
        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#c9a45c]/20 bg-[linear-gradient(120deg,#19150d,#10100f_72%)] shadow-[0_18px_55px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-3 border-b border-[#c9a45c]/10 px-5 py-4 sm:px-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9a45c]/25 bg-[#c9a45c]/[0.08] text-[#d9bb78]">
              <Wallet size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#eee1c7]">Wallet information</h3>
              <p className="mt-0.5 text-[10px] text-[#827a6d]">Registered BEP20 wallet address</p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8d7b57]">Wallet (BEP20)</p>
            <div className="flex flex-col gap-3 rounded-xl border border-[#c9a45c]/15 bg-black/35 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <p className="min-w-0 break-all font-mono text-xs leading-6 text-[#dfc98f] sm:text-sm">
                {walletAddress}
              </p>
              {user.walletAddress && (
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-[#c9a45c]/25 bg-[#c9a45c]/[0.08] px-3 py-2 text-xs font-semibold text-[#dfc98f] transition hover:border-[#d8b76e]/60 hover:bg-[#c9a45c]/15 active:scale-95 sm:self-auto"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy address"}
                </button>
              )}
            </div>
          </div>
        </section>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[9px] uppercase tracking-[0.2em] text-[#5e574b]">
          <Sparkles size={11} className="text-[#9c8048]" />
          Global Wealth · Member profile
        </p>
      </div>
    </main>
  );
}

export default UserProfile;
