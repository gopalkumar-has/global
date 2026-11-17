import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (loading || message) return;

    setError("");
    setMessage("");

    if (!token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match. Please check both fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Please choose a password with at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        { newPassword }
      );
      setMessage(res.data.message || "Your password has been reset successfully.");
      redirectTimer.current = window.setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token. Request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gw-reset">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .gw-reset{
          --gold:#d8ad4b;--gold-light:#ffedb4;--gold-deep:#98691f;
          min-height:100vh;display:grid;grid-template-columns:1fr 1fr;position:relative;
          overflow:hidden;isolation:isolate;background:#040503;color:#f5edda;
          font-family:'DM Sans',sans-serif
        }
        .gw-reset *{box-sizing:border-box}
        .gw-reset a{text-decoration:none}
        .gw-reset:before{content:"";position:absolute;z-index:-1;inset:0;pointer-events:none;
          background:radial-gradient(ellipse at 10% 10%,rgba(210,160,52,.13),transparent 34rem),
          radial-gradient(ellipse at 90% 90%,rgba(210,160,52,.1),transparent 30rem)}
        .gw-reset-art{position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;
          padding:38px clamp(25px,5vw,75px);border-right:1px solid rgba(220,180,86,.2);
          background:linear-gradient(145deg,#12120d 0%,#080906 58%,#040503 100%);overflow:hidden}
        .gw-reset-art:before{content:"";position:absolute;width:590px;aspect-ratio:1;left:50%;top:52%;
          transform:translate(-50%,-50%);border:1px solid rgba(226,187,91,.2);border-radius:50%;
          box-shadow:0 0 0 30px rgba(226,187,91,.025),0 0 0 75px rgba(226,187,91,.018),0 0 0 125px rgba(226,187,91,.012)}
        .gw-reset-art:after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.1;
          background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
          background-size:56px 56px;mask-image:linear-gradient(to bottom,black,transparent 90%)}
        .gw-reset-logo{position:relative;z-index:2;display:block;width:min(260px,60vw);padding:10px 13px;background:#000;border:1px solid rgba(220,180,86,.25)}
        .gw-reset-logo img{display:block;width:100%;height:auto;object-fit:contain}
        .gw-reset-art-center{position:relative;z-index:2;max-width:530px;margin:45px auto;text-align:center}
        .gw-reset-emblem{width:190px;aspect-ratio:1;margin:0 auto 35px;display:grid;place-items:center;position:relative;
          border:1px solid rgba(239,207,128,.55);border-radius:50%;background:radial-gradient(circle at 40% 30%,#302511,#11120d 66%,#070805);
          box-shadow:0 0 75px rgba(213,164,53,.15),inset 0 0 45px rgba(213,164,53,.12)}
        .gw-reset-emblem:before,.gw-reset-emblem:after{content:"";position:absolute;inset:-14px;border:1px solid rgba(224,184,83,.23);border-radius:50%}
        .gw-reset-emblem:after{inset:-34px;border-style:dashed;opacity:.6}
        .gw-reset-emblem svg{color:var(--gold-light);filter:drop-shadow(0 0 17px rgba(231,195,109,.35))}
        .gw-reset-kicker{color:var(--gold);font-size:9px;font-weight:900;letter-spacing:.24em;text-transform:uppercase}
        .gw-reset-art h1{margin:18px 0 15px;color:#f7edda;font:700 clamp(38px,5vw,62px)/1 'Space Grotesk';letter-spacing:-.07em}
        .gw-reset-gold{background:linear-gradient(105deg,#fff0b7,#d9ad48 48%,#fff0b7);background-clip:text;-webkit-background-clip:text;color:transparent}
        .gw-reset-art-copy{max-width:390px;margin:0 auto;color:#a49b88;font-size:12px;line-height:1.9}
        .gw-reset-art-foot{position:relative;z-index:2;display:flex;justify-content:space-between;gap:12px;color:#746d5e;font-size:9px}
        .gw-reset-art-foot span{display:flex;align-items:center;gap:7px}
        .gw-reset-art-foot svg{color:var(--gold)}
        .gw-reset-main{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:70px clamp(22px,5vw,76px);position:relative}
        .gw-reset-back{position:absolute;top:29px;left:clamp(22px,5vw,76px);display:inline-flex;align-items:center;gap:8px;color:#938a78;font-size:10px;font-weight:700}
        .gw-reset-back:hover{color:var(--gold-light)}
        .gw-reset-card{width:100%;max-width:430px}
        .gw-reset-mobile-logo{display:none}
        .gw-reset-tag{display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(220,180,86,.23);color:var(--gold-light);font-size:8px;font-weight:900;letter-spacing:.18em}
        .gw-reset-tag:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold)}
        .gw-reset-title{margin:22px 0 10px;color:#f8f0df;font:700 clamp(34px,4vw,47px)/1.04 'Space Grotesk';letter-spacing:-.065em}
        .gw-reset-subtitle{margin:0 0 27px;color:#9d9584;font-size:11px;line-height:1.85}
        .gw-reset-alert{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;margin-bottom:18px;border-radius:2px;font-size:10px;line-height:1.65}
        .gw-reset-alert.error{border:1px solid rgba(255,111,96,.28);background:rgba(160,42,34,.12);color:#ffc0b6}
        .gw-reset-alert.success{border:1px solid rgba(218,183,93,.34);background:rgba(216,173,75,.1);color:#f1dda7}
        .gw-reset-field{margin-bottom:19px}
        .gw-reset-label{display:block;margin-bottom:9px;color:#d6cbb3;font-size:9px;font-weight:800;letter-spacing:.13em}
        .gw-reset-input-wrap{position:relative}
        .gw-reset-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#b18a3d;pointer-events:none}
        .gw-reset-input{width:100%;height:53px;padding:0 47px 0 43px;border:1px solid rgba(220,180,86,.22);border-radius:2px;outline:none;background:#10110c;color:#f8efd9;font:500 12px 'DM Sans';transition:border .2s,box-shadow .2s}
        .gw-reset-input::placeholder{color:#6d685b}
        .gw-reset-input:focus{border-color:rgba(237,199,111,.8);box-shadow:0 0 0 3px rgba(217,173,72,.08)}
        .gw-reset-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:grid;place-items:center;padding:6px;border:0;background:transparent;color:#9e947d;cursor:pointer}
        .gw-reset-eye:hover{color:var(--gold-light)}
        .gw-reset-hint{margin:7px 0 0 2px;color:#766f60;font-size:9px;line-height:1.6}
        .gw-reset-submit{width:100%;height:52px;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:6px;border:0;border-radius:2px;
          background:linear-gradient(105deg,#f8e9b8,#d8ad4b 53%,#a97625);color:#171104;font:900 9px 'DM Sans';letter-spacing:.16em;cursor:pointer;
          box-shadow:0 10px 28px rgba(211,165,65,.15);transition:transform .2s,filter .2s}
        .gw-reset-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08)}
        .gw-reset-submit:disabled{opacity:.65;cursor:wait}
        .gw-reset-bottom{margin:25px 0 0;text-align:center;color:#928a79;font-size:10px;line-height:1.8}
        .gw-reset-bottom a{color:var(--gold-light);font-weight:800}
        .gw-reset-bottom a:hover{text-decoration:underline}
        .gw-reset-security{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:25px;color:#706a5d;font-size:9px}
        .gw-reset-security svg{color:#b18a3d}
        @keyframes gwResetSpin{to{transform:rotate(360deg)}}
        .gw-reset .gw-reset-spin{animation:gwResetSpin 1s linear infinite}
        @media(max-width:760px){
          .gw-reset{grid-template-columns:1fr}
          .gw-reset-art{display:none}
          .gw-reset-main{min-height:100svh;padding:80px 22px 38px}
          .gw-reset-back{top:22px;left:22px}
          .gw-reset-mobile-logo{display:flex;justify-content:center;margin-bottom:34px}
          .gw-reset-mobile-logo a{width:min(220px,68vw);padding:8px 11px;background:#000;border:1px solid rgba(220,180,86,.22)}
          .gw-reset-mobile-logo img{display:block;width:100%;height:auto}
          .gw-reset-title{font-size:39px}
        }
        @media(max-width:380px){
          .gw-reset-main{padding-left:17px;padding-right:17px}
          .gw-reset-title{font-size:34px}
        }
        @media(prefers-reduced-motion:reduce){
          .gw-reset *,.gw-reset *:before,.gw-reset *:after{transition-duration:.01ms!important;animation-duration:.01ms!important}
        }
      `}</style>

      <aside className="gw-reset-art">
        <Link to="/" className="gw-reset-logo" aria-label="Global Wealth home">
          <img src="/global-wealth-logo.png" alt="Global Wealth"/>
        </Link>
        <div className="gw-reset-art-center">
          <div className="gw-reset-emblem"><KeyRound size={72} strokeWidth={1.1}/></div>
          <div className="gw-reset-kicker">SECURE PASSWORD UPDATE</div>
          <h1>A FRESH START.<br/><span className="gw-reset-gold">A SECURE SIGN-IN.</span></h1>
          <p className="gw-reset-art-copy">
            Choose a new password for your Global Wealth account and keep your member access protected.
          </p>
        </div>
        <div className="gw-reset-art-foot">
          <span><ShieldCheck size={13}/> ACCOUNT SECURITY</span>
          <span>GLOBAL WEALTH</span>
        </div>
      </aside>

      <main className="gw-reset-main">
        <Link to="/login" className="gw-reset-back"><ArrowLeft size={14}/> Back to login</Link>
        <section className="gw-reset-card">
          <div className="gw-reset-mobile-logo">
            <Link to="/" aria-label="Global Wealth home">
              <img src="/global-wealth-logo.png" alt="Global Wealth"/>
            </Link>
          </div>

          <div className="gw-reset-tag">PASSWORD RESET · MEMBER SECURITY</div>
          <h2 className="gw-reset-title">Create a new<br/><span className="gw-reset-gold">password.</span></h2>
          <p className="gw-reset-subtitle">
            Set a new password for your account. Use a strong password that you do not use on other websites.
          </p>

          {error && (
            <div className="gw-reset-alert error" role="alert">
              <CircleAlert size={15} style={{flex:"none",marginTop:1}}/><span>{error}</span>
            </div>
          )}
          {message && (
            <div className="gw-reset-alert success" role="status">
              <BadgeCheck size={16} style={{flex:"none",marginTop:1}}/>
              <span>{message}<br/><small>Redirecting to member login in 3 seconds…</small></span>
            </div>
          )}

          {!message && (
            <form onSubmit={handleReset}>
              <div className="gw-reset-field">
                <label className="gw-reset-label" htmlFor="gw-new-password">NEW PASSWORD</label>
                <div className="gw-reset-input-wrap">
                  <LockKeyhole className="gw-reset-input-icon" size={16}/>
                  <input
                    id="gw-new-password"
                    className="gw-reset-input"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => {setNewPassword(e.target.value);setError("");}}
                    autoComplete="new-password"
                    required
                  />
                  <button className="gw-reset-eye" type="button" aria-label={showNewPassword ? "Hide new password" : "Show new password"} onClick={() => setShowNewPassword((v) => !v)}>
                    {showNewPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <p className="gw-reset-hint">Use at least 6 characters and avoid reusing an old password.</p>
              </div>

              <div className="gw-reset-field">
                <label className="gw-reset-label" htmlFor="gw-confirm-password">CONFIRM NEW PASSWORD</label>
                <div className="gw-reset-input-wrap">
                  <LockKeyhole className="gw-reset-input-icon" size={16}/>
                  <input
                    id="gw-confirm-password"
                    className="gw-reset-input"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(e) => {setConfirmPassword(e.target.value);setError("");}}
                    autoComplete="new-password"
                    required
                  />
                  <button className="gw-reset-eye" type="button" aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"} onClick={() => setShowConfirmPassword((v) => !v)}>
                    {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <button className="gw-reset-submit" type="submit" disabled={loading}>
                {loading ? <><LoaderCircle size={16} className="gw-reset-spin"/> SAVING NEW PASSWORD…</> : <>UPDATE PASSWORD <ArrowRight size={16}/></>}
              </button>
            </form>
          )}

          <p className="gw-reset-bottom">
            Need to return instead? <Link to="/login">Go to member login</Link>
          </p>
          <div className="gw-reset-security"><ShieldCheck size={13}/> Never share your password with anyone.</div>
        </section>
      </main>
    </div>
  );
};

export default ResetPassword;
