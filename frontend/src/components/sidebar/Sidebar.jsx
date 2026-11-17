import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SidebarItem = ({ label, active, onClick, badge, path, number }) => {
  const className = `group mx-2 my-1 flex min-h-[54px] w-[calc(100%-1rem)] items-center gap-3 rounded-[15px] border px-3.5 py-2.5 text-left transition-all duration-300 ${
    active
      ? "border-[#e0c27e]/35 bg-[linear-gradient(105deg,rgba(214,184,111,0.17),rgba(255,255,255,0.045)_58%,rgba(255,255,255,0.015))] text-[#f2e7cf] shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_8px_22px_rgba(0,0,0,0.18)]"
      : "border-transparent text-[#aaa394] hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-[#f0e6d2]"
  }`;

  const content = (
    <>
      <span className={`w-7 shrink-0 text-[11px] font-bold tabular-nums tracking-[0.08em] ${
        active ? "text-[#e6c77f]" : "text-[#756b58] group-hover:text-[#c9aa69]"
      }`}>
        {String(number).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 whitespace-normal break-words text-[13px] font-semibold leading-5 tracking-[0.01em]">
        {label}
      </span>
      {Number(badge) > 0 && (
        <span className="flex h-[21px] min-w-[21px] shrink-0 items-center justify-center rounded-full border border-rose-300/20 bg-gradient-to-b from-[#d96a61] to-[#963b36] px-1.5 text-[9px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e4c77f] shadow-[0_0_10px_rgba(228,199,127,.55)]" />}
    </>
  );

  if (path && path !== "#") {
    return (
      <Link to={path} onClick={onClick} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return <button type="button" onClick={onClick} className={className}>{content}</button>;
};

const Sidebar = ({ user, isOpen, setIsOpen }) => {
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const [openGroups, setOpenGroups] = useState(["Overview"]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchNotifCount = async () => {
      if (!user?.userId) return;
      try {
        const res = await api.get(
          `/admin/notifications/count/${user.userId}?t=${new Date().getTime()}`
        );
        if (isMounted) setNotifCount(res.data.count || 0);
      } catch (err) {
        console.log("Notification error", err);
      }
    };

    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.userId]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024 && isOpen) setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  // Keep every original navigation destination and menu group.
  const menuGroups = [
    {
      title: "Overview",
      subtitle: "Your account at a glance",
      items: [
        { label: "Dashboard Overview", path: "/dashboard" },
          { label: "My Profile", path: "/profile" },
      ],
    },
    {
      title: "Packages",
      subtitle: "Plans and memberships",
      items: [
        { label: "Buy a Package", path: "/topup-details" },
        { label: "My Packages", path: "/my-packages" },
        { label: "Auto Compound", path: "/my-compound-packages" },
      ],
    },
    {
      title: "My Team",
      subtitle: "People in your network",
      items: [
        { label: "Deposit Records", path: "/deposit-history" },
        { label: "Direct Members", path: "/direct-team" },
        { label: "All Team Members", path: "/all-team" },
        { label: "Team Business", path: "/downline-business" },
       ],
    },
    {
      title: "My Earnings",
      subtitle: "Income and reward reports",
      items: [
        { label: "ROI Earnings", path: "/roi-income" },
        { label: "Direct Earnings", path: "/direct-income" },
        { label: "Level Earnings", path: "/level-income" },
      ],
    },
    {
      title: "Wallet & Help",
      subtitle: "Funds, transactions and support",
      items: [
        { label: "Transactions", path: "/wallet-history" },
        { label: "Withdraw Funds", path: "/withdrawals" },
        { label: "Help & Support", path: "/support", badge: notifCount },
      ],
    },
  ];

  const isPathActive = (path) => {
    if (!path) return false;
    if (location.pathname === path) return true;
    return path !== "/dashboard" && location.pathname.startsWith(`${path}/`);
  };

  // Automatically expand the section containing the current page.
  useEffect(() => {
    const activeGroup = menuGroups.find((group) =>
      group.items.some((item) => isPathActive(item.path))
    );
    if (activeGroup) {
      setOpenGroups((current) =>
        current.includes(activeGroup.title) ? current : [...current, activeGroup.title]
      );
    }
  }, [location.pathname]);

  return (
    <>
      {/* Frosted backdrop overlay for small screens */}
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[55] bg-[#030303]/75 backdrop-blur-md transition-all duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[60] flex h-[100dvh] w-[min(350px,91vw)] flex-col overflow-hidden border-l border-white/[0.10] bg-[linear-gradient(155deg,rgba(30,29,25,0.97)_0%,rgba(13,14,14,0.98)_42%,rgba(8,9,10,0.99)_100%)] shadow-[-25px_0_90px_rgba(0,0,0,0.62)] backdrop-blur-2xl transition-transform duration-300 ease-out lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-[318px] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Glass reflections and ambient highlights */}
        <div className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-[#c6a45d]/[0.055] blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-44 h-56 w-56 rounded-full bg-[#8b7444]/[0.045] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ead49b]/45 to-transparent" />

        {/* Brand and member identity */}
        <div className="relative border-b border-white/[0.08] px-5 pb-5 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] border border-[#e2c47f]/35 bg-[linear-gradient(145deg,rgba(220,190,120,0.2),rgba(255,255,255,0.035))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_8px_25px_rgba(0,0,0,0.28)]">
                <img
                  src="/global-wealth-logo.png"
                  alt="Global Wealth"
                  className="h-full w-full object-contain"
                  onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
                />
                <span className="pointer-events-none absolute inset-0 rounded-[17px] ring-1 ring-inset ring-white/[0.08]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-extrabold uppercase tracking-[0.16em] text-[#f1e4c8]">Global Wealth</p>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.23em] text-[#a18c61]">Member space</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="rounded-xl border border-white/[0.10] bg-white/[0.04] p-2 text-[#b8ad98] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#d9bb78]/40 hover:bg-[#d9bb78]/10 hover:text-[#f1d99f] lg:hidden"
            >
              <X size={17} />
            </button>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-[19px] border border-white/[0.10] bg-[linear-gradient(115deg,rgba(255,255,255,0.085),rgba(255,255,255,0.025))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-5 -top-7 h-24 w-24 rounded-full border border-[#d8b76e]/10" />
            <div className="relative flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9bb78]" />
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#a18c61]">Signed in as</p>
                <p className="mt-1 truncate text-sm font-semibold text-[#eee3cf]">{user?.name || user?.userId || "Member"}</p>
                {user?.userId && <p className="mt-0.5 truncate text-[10px] text-[#938a7b]">Member ID · {user.userId}</p>}
              </div>
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.45)]" />
            </div>
          </div>
        </div>

        {/* Scrollable grouped navigation */}
        <div className="gw-glass-scroll relative flex-1 overflow-y-auto px-2 py-5">
          <style>{`
            .gw-glass-scroll { scrollbar-width: thin; scrollbar-color: rgba(199,164,93,.48) transparent; }
            .gw-glass-scroll::-webkit-scrollbar { width: 4px; }
            .gw-glass-scroll::-webkit-scrollbar-thumb { background: linear-gradient(#d4b66f,#71582d); border-radius: 20px; }
            .gw-glass-scroll::-webkit-scrollbar-track { background: transparent; }
          `}</style>

          <nav aria-label="Member navigation" className="flex flex-col gap-3">
            {(() => {
              let itemNumber = 0;
              return menuGroups.map((group, groupIndex) => {
                const isExpanded = openGroups.includes(group.title);
                const hasActiveItem = group.items.some((item) => isPathActive(item.path));
                return (
                  <section
                    key={group.title}
                    className={`overflow-hidden rounded-[18px] border transition-colors duration-300 ${
                      hasActiveItem
                        ? "border-[#d9bb78]/25 bg-[#d9bb78]/[0.035]"
                        : "border-white/[0.055] bg-white/[0.018]"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setOpenGroups((current) =>
                        current.includes(group.title)
                          ? current.filter((title) => title !== group.title)
                          : [...current, group.title]
                      )}
                      className="flex min-h-[66px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.035]"
                    >
                      <span className={`w-8 shrink-0 text-[12px] font-extrabold tabular-nums tracking-[0.08em] ${
                        hasActiveItem ? "text-[#e5c77f]" : "text-[#9b875d]"
                      }`}>
                        {String(groupIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#d3b875]">
                          {group.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-[#746d60]">{group.subtitle}</span>
                      </span>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isExpanded
                          ? "rotate-180 border-[#d9bb78]/35 bg-[#d9bb78]/10 text-[#e4c77f]"
                          : "border-white/[0.08] bg-white/[0.025] text-[#8c826f]"
                      }`}>
                        <ChevronDown size={15} />
                      </span>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-white/[0.055] py-2">
                          {group.items.map((item) => {
                            itemNumber += 1;
                            return (
                              <SidebarItem
                                key={item.path}
                                label={item.label}
                                path={item.path}
                                badge={item.badge}
                                number={itemNumber}
                                active={isPathActive(item.path)}
                                onClick={() => {
                                  if (window.innerWidth < 1024) setIsOpen(false);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              });
            })()}
          </nav>
        </div>

        {/* Frosted footer and logout */}
        <div className="relative border-t border-white/[0.09] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(0,0,0,0.32))] p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#928875]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Session active
            </span>
            <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[9px] text-[#a79b83]">
              {notifCount} alerts
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center justify-between rounded-[17px] border border-rose-300/15 bg-[linear-gradient(105deg,rgba(177,72,65,0.13),rgba(255,255,255,0.025))] px-3 py-2.5 text-sm font-semibold text-[#d99a8f] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition-all duration-300 hover:border-rose-300/35 hover:bg-[linear-gradient(105deg,rgba(177,72,65,0.85),rgba(121,47,43,0.8))] hover:text-white hover:shadow-[0_8px_24px_rgba(160,55,50,0.18)]"
          >
            <span className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Logout Account</span>
            </span>
            <span className="text-[10px] font-semibold tracking-[0.12em] opacity-60">LOG OUT</span>
          </button>
          <p className="mt-3 text-center text-[8px] font-medium tracking-[0.18em] text-[#5f584b]">GLOBAL WEALTH · GLASS MEMBER AREA</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
