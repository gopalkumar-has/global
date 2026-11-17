import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  ArrowRight, ArrowUpRight, ChevronDown, Eye, EyeOff, Fingerprint,
  KeyRound, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles,
  UserRound, X, AlertCircle, Crown, Globe2
} from "lucide-react";

const UserLogin = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [savedUsers, setSavedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const userFieldRef = useRef(null);

  // Keep the existing admin-to-member auto-login handoff.
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get("token");
    const urlUser = queryParams.get("user");
    if (!urlToken || !urlUser) return;

    try {
      const userData = JSON.parse(decodeURIComponent(urlUser));
      localStorage.setItem("token", urlToken);
      localStorage.setItem("user", JSON.stringify(userData));
      login(userData, urlToken);
      window.history.replaceState({}, document.title, "/login");
      window.location.replace("/dashboard");
    } catch {
      setError("This sign-in link is invalid or has expired. Please sign in again.");
    }
  }, [location.search, login]);

  // Remember account IDs only; never store passwords in local storage.
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("savedUsers") || "[]");
      const safeUsers = Array.isArray(users)
        ? users.filter((item) => item && typeof item.id === "string")
            .map((item) => ({ id: item.id })).slice(0, 5)
        : [];
      localStorage.setItem("savedUsers", JSON.stringify(safeUsers));
      setSavedUsers(safeUsers);
    } catch {
      setSavedUsers([]);
    }
  }, []);

  useEffect(() => {
    if (!userId.trim()) setFilteredUsers(savedUsers);
    else {
      const search = userId.toLowerCase();
      setFilteredUsers(savedUsers.filter((item) => item.id.toLowerCase().includes(search)));
    }
  }, [userId, savedUsers]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userFieldRef.current && !userFieldRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleUserSelect = (id) => {
    const selected = savedUsers.find((item) => item.id === id);
    if (!selected) return;
    setUserId(selected.id);
    setPassword("");
    setRememberMe(true);
    setDropdownOpen(false);
    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const fingerprintAgent = await FingerprintJS.load();
      const fingerprint = await fingerprintAgent.get();

      const response = await api.post("/auth/login", {
        userId: userId.trim().toUpperCase(),
        password,
        deviceId: fingerprint.visitorId,
      });

      const { token, user } = response.data;
      login(user, token);

      if (rememberMe) {
        const normalizedId = userId.trim().toUpperCase();
        const updatedUsers = [
          { id: normalizedId },
          ...savedUsers.filter((item) => item.id.toUpperCase() !== normalizedId),
        ].slice(0, 5);
        localStorage.setItem("savedUsers", JSON.stringify(updatedUsers));
        setSavedUsers(updatedUsers);
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "We couldn't sign you in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasSavedMatches = useMemo(
    () => dropdownOpen && filteredUsers.length > 0,
    [dropdownOpen, filteredUsers]
  );

  return (
    <div className="gw-access">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .gw-access{
          --gold:#d9ad48;--gold2:#f8e7ae;--gold3:#9b6c22;--ink:#050604;
          min-height:100vh;position:relative;isolation:isolate;overflow:hidden;
          display:grid;grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr);
          background:#050604;color:#f7f0df;font-family:'DM Sans',sans-serif;
        }
        .gw-access *{box-sizing:border-box}
        .gw-access a{text-decoration:none}
        .gw-access:before{content:"";position:absolute;z-index:-1;inset:0;pointer-events:none;
          background:radial-gradient(ellipse at 12% 8%,rgba(213,165,62,.12),transparent 35%),
          radial-gradient(ellipse at 92% 95%,rgba(213,165,62,.1),transparent 35%)}
        .gw-access-art{min-height:100vh;position:relative;display:flex;flex-direction:column;
          justify-content:space-between;padding:38px clamp(26px,5vw,78px);overflow:hidden;
          border-right:1px solid rgba(220,180,86,.18);
          background:linear-gradient(145deg,rgba(18,17,11,.97),rgba(5,6,4,.98) 65%)}
        .gw-access-art:before{content:"";position:absolute;width:min(780px,90vw);aspect-ratio:1;
          left:50%;top:51%;transform:translate(-50%,-50%);border-radius:50%;
          border:1px solid rgba(225,185,89,.15);
          box-shadow:0 0 0 34px rgba(225,185,89,.025),0 0 0 85px rgba(225,185,89,.018),0 0 0 145px rgba(225,185,89,.012)}
        .gw-access-art:after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.12;
          background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);
          background-size:58px 58px;mask-image:linear-gradient(to bottom,black,transparent 88%)}
        .gw-access-brand{position:relative;z-index:2;width:min(290px,62vw);display:block;padding:11px 14px;
          background:#000;border:1px solid rgba(224,184,83,.24)}
        .gw-access-brand img{display:block;width:100%;height:auto;object-fit:contain}
        .gw-access-showcase{position:relative;z-index:2;max-width:650px;margin:55px auto;text-align:center}
        .gw-access-mark{width:clamp(145px,18vw,220px);aspect-ratio:1;margin:0 auto 38px;display:grid;place-items:center;
          position:relative;border-radius:50%;border:1px solid rgba(240,207,126,.55);
          background:radial-gradient(circle at 42% 32%,#302510,#11110c 64%,#080805);
          box-shadow:0 0 85px rgba(215,169,67,.16),inset 0 0 55px rgba(215,169,67,.14)}
        .gw-access-mark:before,.gw-access-mark:after{content:"";position:absolute;inset:-13px;border:1px solid rgba(225,185,89,.28);border-radius:50%}
        .gw-access-mark:after{inset:-30px;border-style:dashed;opacity:.6}
        .gw-access-mark svg{color:var(--gold2);filter:drop-shadow(0 0 15px rgba(245,211,132,.4))}
        .gw-access-overline{display:flex;align-items:center;justify-content:center;gap:12px;color:var(--gold);font-size:9px;font-weight:800;letter-spacing:.27em}
        .gw-access-overline:before,.gw-access-overline:after{content:"";width:28px;height:1px;background:var(--gold3)}
        .gw-access-showcase h1{margin:19px 0 15px;font:700 clamp(38px,5vw,68px)/.98 'Space Grotesk';letter-spacing:-.075em}
        .gw-access-gold{background:linear-gradient(105deg,#fff0b8,#d8aa42 48%,#fff0b8);background-clip:text;-webkit-background-clip:text;color:transparent}
        .gw-access-description{max-width:430px;margin:0 auto;color:#a59d8b;font-size:12px;line-height:1.9}
        .gw-access-points{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:30px}
        .gw-access-point{display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid rgba(220,180,86,.17);background:rgba(255,255,255,.025);color:#c8bea6;font-size:9px;font-weight:700;letter-spacing:.04em}
        .gw-access-point svg{color:var(--gold)}
        .gw-access-foot{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:14px;color:#706c60;font-size:9px;letter-spacing:.08em}
        .gw-access-foot span{display:flex;align-items:center;gap:7px}
        .gw-access-foot svg{color:var(--gold)}
        .gw-access-main{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:70px clamp(24px,5vw,76px)}
        .gw-access-main:before{content:"";position:absolute;width:330px;height:330px;right:-190px;top:-150px;border-radius:50%;background:rgba(217,173,72,.08);filter:blur(65px);pointer-events:none}
        .gw-access-back{position:absolute;top:30px;left:clamp(24px,5vw,76px);display:inline-flex;align-items:center;gap:8px;color:#8e8879;font-size:10px;font-weight:700;transition:color .2s}
        .gw-access-back:hover{color:var(--gold2)}
        .gw-access-card{position:relative;z-index:1;width:100%;max-width:430px}
        .gw-access-mobile-brand{display:none}
        .gw-access-tag{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid rgba(220,180,86,.23);color:var(--gold2);font-size:8px;font-weight:900;letter-spacing:.18em}
        .gw-access-tag:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold)}
        .gw-access-title{margin:23px 0 9px;font:700 clamp(34px,4vw,48px)/1.04 'Space Grotesk';letter-spacing:-.065em;color:#f8f1e2}
        .gw-access-subtitle{margin:0 0 31px;color:#9a9383;font-size:11px;line-height:1.8}
        .gw-access-error{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;margin:0 0 19px;border:1px solid rgba(255,112,93,.28);background:rgba(157,43,34,.12);color:#ffc0b5;font-size:10px;line-height:1.6}
        .gw-access-field{position:relative;margin-bottom:19px}
        .gw-access-label{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:#d4cbb7;font-size:9px;font-weight:800;letter-spacing:.13em}
        .gw-access-input-wrap{position:relative}
        .gw-access-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#b18a3d;pointer-events:none}
        .gw-access-input{width:100%;height:53px;padding:0 46px 0 43px;border:1px solid rgba(220,180,86,.2);border-radius:2px;outline:none;background:#10110c;color:#f7efd9;font:600 12px 'DM Sans';transition:border .2s,box-shadow .2s}
        .gw-access-input::placeholder{color:#6e695c;font-weight:500}
        .gw-access-input:focus{border-color:rgba(237,199,111,.8);box-shadow:0 0 0 3px rgba(217,173,72,.08);background:#13140e}
        .gw-access-input.user-id{text-transform:uppercase;letter-spacing:.1em}
        .gw-access-action{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:grid;place-items:center;padding:6px;border:0;background:transparent;color:#9e947d;cursor:pointer}
        .gw-access-action:hover{color:var(--gold2)}
        .gw-access-saved{position:absolute;z-index:15;top:calc(100% + 6px);left:0;right:0;max-height:180px;overflow:auto;padding:6px;border:1px solid rgba(220,180,86,.25);background:#11120d;box-shadow:0 16px 35px rgba(0,0,0,.55)}
        .gw-access-saved button{width:100%;display:flex;align-items:center;gap:9px;padding:11px;border:0;background:transparent;color:#e7dec9;text-align:left;font-size:10px;cursor:pointer}
        .gw-access-saved button:hover{background:rgba(217,173,72,.12);color:var(--gold2)}
        .gw-access-saved svg{color:var(--gold)}
        .gw-access-controls{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:3px 0 24px}
        .gw-access-remember{display:flex;align-items:center;gap:8px;color:#aaa18e;font-size:9px;cursor:pointer}
        .gw-access-remember input{width:14px;height:14px;margin:0;accent-color:#d8ad4b}
        .gw-access-forgot{color:var(--gold2);font-size:9px;font-weight:800}
        .gw-access-forgot:hover{color:#fff}
        .gw-access-submit{width:100%;height:52px;display:flex;align-items:center;justify-content:center;gap:11px;border:0;border-radius:2px;
          background:linear-gradient(105deg,#f8e9b8,#d8ad4b 53%,#a97625);color:#171104;
          font:900 9px 'DM Sans';letter-spacing:.17em;cursor:pointer;box-shadow:0 10px 28px rgba(211,165,65,.15);transition:transform .2s,filter .2s}
        .gw-access-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08)}
        .gw-access-submit:disabled{opacity:.65;cursor:wait}
        .gw-access-divider{display:flex;align-items:center;gap:12px;margin:25px 0;color:#6f695c;font-size:8px;letter-spacing:.15em;text-transform:uppercase}
        .gw-access-divider:before,.gw-access-divider:after{content:"";height:1px;flex:1;background:rgba(220,180,86,.15)}
        .gw-access-register{text-align:center;color:#9b9484;font-size:10px}
        .gw-access-register a{color:var(--gold2);font-weight:800}
        .gw-access-register a:hover{text-decoration:underline}
        .gw-access-security{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:28px;color:#716b5e;font-size:9px;line-height:1.5;text-align:center}
        .gw-access-security svg{flex:none;color:#b38c3e}
        @keyframes gwAccessSpin{to{transform:rotate(360deg)}}
        .gw-access .gw-access-spin{animation:gwAccessSpin 1s linear infinite}
        @media(max-width:900px){
          .gw-access{grid-template-columns:.92fr 1.08fr}
          .gw-access-art{padding:30px 25px}
          .gw-access-main{padding-left:32px;padding-right:32px}
          .gw-access-showcase h1{font-size:45px}
        }
        @media(max-width:680px){
          .gw-access{display:flex;flex-direction:column;min-height:100svh}
          .gw-access-art{display:none}
          .gw-access-main{min-height:100svh;padding:76px 22px 35px}
          .gw-access-back{top:22px;left:22px}
          .gw-access-mobile-brand{display:flex;justify-content:center;margin-bottom:32px}
          .gw-access-mobile-brand a{width:min(225px,68vw);padding:8px 10px;background:#000;border:1px solid rgba(220,180,86,.22)}
          .gw-access-mobile-brand img{display:block;width:100%;height:auto}
          .gw-access-card{max-width:440px}
          .gw-access-title{font-size:39px;margin-top:19px}
          .gw-access-subtitle{margin-bottom:25px}
        }
        @media(max-width:380px){
          .gw-access-main{padding-left:17px;padding-right:17px}
          .gw-access-title{font-size:34px}
          .gw-access-controls{align-items:flex-start}
          .gw-access-forgot{text-align:right}
        }
        @media(prefers-reduced-motion:reduce){
          .gw-access *,.gw-access *:before,.gw-access *:after{transition-duration:.01ms!important;animation-duration:.01ms!important}
        }
      `}</style>

      <aside className="gw-access-art">
        <Link to="/" className="gw-access-brand" aria-label="Global Wealth home">
          <img src="/global-wealth-logo.png" alt="Global Wealth"/>
        </Link>

        <div className="gw-access-showcase">
          <div className="gw-access-mark"><Crown size={76} strokeWidth={1.1}/></div>
          <div className="gw-access-overline">THE GLOBAL WEALTH EXPERIENCE</div>
          <h1>WELCOME TO<br/><span className="gw-access-gold">YOUR NEXT CHAPTER.</span></h1>
          <p className="gw-access-description">
            Your member space starts here. Sign in to access your account and continue where you left off.
          </p>
          <div className="gw-access-points">
            <span className="gw-access-point"><ShieldCheck size={13}/> Member access</span>
            <span className="gw-access-point"><Globe2 size={13}/> Global platform</span>
            <span className="gw-access-point"><Sparkles size={13}/> Refined experience</span>
          </div>
        </div>

        <div className="gw-access-foot">
          <span><Fingerprint size={13}/> DEVICE-AWARE SIGN IN</span>
          <span>GLOBAL WEALTH · EST. FORWARD</span>
        </div>
      </aside>

      <main className="gw-access-main">
        <Link to="/" className="gw-access-back">← <span>Back to home</span></Link>

        <section className="gw-access-card">
          <div className="gw-access-mobile-brand">
            <Link to="/" aria-label="Global Wealth home">
              <img src="/global-wealth-logo.png" alt="Global Wealth"/>
            </Link>
          </div>

          <div className="gw-access-tag">GLOBAL WEALTH MEMBER PORTAL</div>
          <h2 className="gw-access-title">Sign in.<br/><span className="gw-access-gold">Move forward.</span></h2>
          <p className="gw-access-subtitle">
            Enter your member credentials to securely continue to your Global Wealth account.
          </p>

          {error && (
            <div className="gw-access-error" role="alert">
              <AlertCircle size={15} style={{flex:"none",marginTop:1}}/>
              <span>{error}</span>
              <button type="button" aria-label="Dismiss error" onClick={() => setError("")}
                style={{marginLeft:"auto",border:0,background:"transparent",color:"inherit",cursor:"pointer",padding:0}}>
                <X size={14}/>
              </button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="gw-access-field" ref={userFieldRef}>
              <label className="gw-access-label" htmlFor="gw-user-id">MEMBER ID <span>REQUIRED</span></label>
              <div className="gw-access-input-wrap">
                <UserRound className="gw-access-input-icon" size={16}/>
                <input id="gw-user-id" className="gw-access-input user-id" type="text"
                  placeholder="Enter your member ID" value={userId}
                  onChange={(event) => {setUserId(event.target.value.toUpperCase());setError("");}}
                  onFocus={() => setDropdownOpen(true)} autoComplete="username" required/>
                {savedUsers.length > 0 && (
                  <button className="gw-access-action" type="button" aria-label="Show saved accounts"
                    onClick={() => setDropdownOpen((value) => !value)}>
                    <ChevronDown size={16}/>
                  </button>
                )}
              </div>
              {hasSavedMatches && (
                <div className="gw-access-saved">
                  {filteredUsers.map((item) => (
                    <button type="button" key={item.id} onClick={() => handleUserSelect(item.id)}>
                      <UserRound size={14}/> {item.id}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="gw-access-field">
              <label className="gw-access-label" htmlFor="gw-password">PASSWORD <span>REQUIRED</span></label>
              <div className="gw-access-input-wrap">
                <KeyRound className="gw-access-input-icon" size={16}/>
                <input id="gw-password" className="gw-access-input" type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" value={password}
                  onChange={(event) => {setPassword(event.target.value);setError("");}}
                  autoComplete="current-password" required/>
                <button className="gw-access-action" type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <div className="gw-access-controls">
              <label className="gw-access-remember">
                <input type="checkbox" checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}/>
                Remember this account
              </label>
              <Link className="gw-access-forgot" to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="gw-access-submit" type="submit" disabled={loading}>
              {loading ? <><LoaderCircle size={16} className="gw-access-spin"/> VERIFYING DETAILS…</> :
                <>ACCESS MY ACCOUNT <ArrowRight size={16}/></>}
            </button>
          </form>

          <div className="gw-access-divider">NEW TO GLOBAL WEALTH?</div>
          <p className="gw-access-register">Not a member yet? <Link to="/register">Create your account <ArrowUpRight size={13} style={{verticalAlign:"middle"}}/></Link></p>
          <div className="gw-access-security">
            <LockKeyhole size={13}/> Never share your password or transaction credentials with anyone.
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserLogin;
