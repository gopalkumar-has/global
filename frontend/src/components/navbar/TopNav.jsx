import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu, LogOut, ChevronRight
} from "lucide-react";

const TopNav = ({ onHamburgerClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoClick = () => {
    navigate("/dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#b99a5a]/25 bg-[#090909] text-[#f3ead8] shadow-[0_10px_35px_rgba(0,0,0,0.45)] sm:h-[82px]">
      {/* Fine metallic top edge */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d9bd78] to-transparent opacity-80" />

      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand lockup */}
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label="Go to dashboard"
          className="group flex min-w-0 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#d9bd78] focus-visible:ring-offset-4 focus-visible:ring-offset-[#090909]"
        >
          <span className="relative flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border border-[#d5b66e]/55 bg-[radial-gradient(circle_at_35%_25%,#3a2d16_0%,#17130c_55%,#0b0a08_100%)] p-[5px] shadow-[0_0_0_4px_rgba(201,164,92,0.06),0_5px_20px_rgba(0,0,0,0.5)] transition duration-300 group-hover:border-[#f0d99d] group-hover:shadow-[0_0_0_5px_rgba(201,164,92,0.1),0_5px_24px_rgba(201,164,92,0.14)] sm:h-[56px] sm:w-[56px]">
            <img
              src="/global-wealth-logo.png"
              alt="Global Wealth"
              className="h-full w-full rounded-full object-contain"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
            <span className="pointer-events-none absolute inset-[2px] rounded-full border border-[#e7d29b]/10" />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="truncate font-serif text-[16px] font-bold leading-none tracking-[0.07em] text-[#f1dfb8] transition-colors group-hover:text-[#ffe9b4] sm:text-[20px] sm:tracking-[0.1em]">
              GLOBAL WEALTH
            </span>
            <span className="mt-2 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#9d8757] sm:text-[9px]">
              <span className="h-px w-4 bg-[#b99a5a]/70" />
              Member Dashboard
              <span className="hidden h-px w-4 bg-[#b99a5a]/70 min-[420px]:block" />
            </span>
          </span>
        </button>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout from account"
            title="Logout"
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-[#a85b50]/35 bg-[#281512]/65 px-3 text-[#d99a8e] transition-all duration-300 hover:border-[#c8796d] hover:bg-[#963f35] hover:text-white active:scale-95 sm:h-11 sm:px-4"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#a85b50]/15 transition-colors group-hover:bg-white/15">
              <LogOut size={14} strokeWidth={2.2} />
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.15em] sm:inline">
              Logout
            </span>
          </button>

          <span className="mx-0.5 hidden h-8 w-px bg-gradient-to-b from-transparent via-[#b99a5a]/40 to-transparent sm:block" />

          <button
            type="button"
            onClick={onHamburgerClick}
            aria-label="Open navigation"
            title="Open menu"
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-[#c9a45c]/45 bg-gradient-to-br from-[#d4b66f] via-[#b18b43] to-[#80602b] px-3 text-[#171108] shadow-[0_4px_15px_rgba(178,139,67,0.15)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_5px_22px_rgba(201,164,92,0.25)] active:scale-95 sm:h-11 sm:gap-2.5 sm:px-4"
          >
            <Menu size={19} strokeWidth={2.3} className="transition-transform duration-300 group-hover:rotate-[-8deg]" />
            <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.16em] sm:inline">
              Menu
            </span>
            <ChevronRight size={14} strokeWidth={2.5} className="hidden opacity-70 sm:block" />
          </button>
        </div>
      </div>

      {/* Bottom inner highlight */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d5b66e]/25 to-transparent" />
    </header>
  );
};

export default TopNav;
