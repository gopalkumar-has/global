import React, { useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const ForgotPassword = () => {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/auth/forgot-password", {
        userId: userId.trim().toUpperCase(),
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gw-forgot">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        .gw-forgot {
          --gold:#d8ad4b;
          --gold-light:#ffedb4;
          --gold-deep:#98691f;
          min-height:100vh;
          display:grid;
          grid-template-columns:1fr 1fr;
          position:relative;
          overflow:hidden;
          isolation:isolate;
          color:#f5edda;
          background:#040503;
          font-family:'DM Sans',sans-serif;
        }
        .gw-forgot *{box-sizing:border-box}
        .gw-forgot a{text-decoration:none}
        .gw-forgot:before{
          content:"";position:absolute;z-index:-1;inset:0;pointer-events:none;
          background:radial-gradient(ellipse at 10% 10%,rgba(210,160,52,.13),transparent 34rem),
          radial-gradient(ellipse at 90% 90%,rgba(210,160,52,.1),transparent 30rem);
        }
        .gw-forgot-art{
          position:relative;min-height:100vh;display:flex;flex-direction:column;
          justify-content:space-between;padding:38px clamp(25px,5vw,75px);
          border-right:1px solid rgba(220,180,86,.2);
          background:linear-gradient(145deg,#12120d 0%,#080906 58%,#040503 100%);
          overflow:hidden;
        }
        .gw-forgot-art:before{
          content:"";position:absolute;width:590px;aspect-ratio:1;left:50%;top:52%;
          transform:translate(-50%,-50%);border:1px solid rgba(226,187,91,.2);border-radius:50%;
          box-shadow:0 0 0 30px rgba(226,187,91,.025),0 0 0 75px rgba(226,187,91,.018),0 0 0 125px rgba(226,187,91,.012);
        }
        .gw-forgot-art:after{
          content:"";position:absolute;inset:0;pointer-events:none;opacity:.1;
          background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);
          background-size:56px 56px;mask-image:linear-gradient(to bottom,black,transparent 90%);
        }
        .gw-forgot-logo{position:relative;z-index:2;display:block;width:min(260px,60vw);padding:10px 13px;background:#000;border:1px solid rgba(220,180,86,.25)}
        .gw-forgot-logo img{display:block;width:100%;height:auto;object-fit:contain}
        .gw-forgot-art-center{position:relative;z-index:2;max-width:530px;margin:45px auto;text-align:center}
        .gw-forgot-emblem{
          width:190px;aspect-ratio:1;margin:0 auto 35px;display:grid;place-items:center;
          position:relative;border:1px solid rgba(239,207,128,.55);border-radius:50%;
          background:radial-gradient(circle at 40% 30%,#302511,#11120d 66%,#070805);
          box-shadow:0 0 75px rgba(213,164,53,.15),inset 0 0 45px rgba(213,164,53,.12);
        }
        .gw-forgot-emblem:before,.gw-forgot-emblem:after{content:"";position:absolute;inset:-14px;border:1px solid rgba(224,184,83,.23);border-radius:50%}
        .gw-forgot-emblem:after{inset:-34px;border-style:dashed;opacity:.6}
        .gw-forgot-emblem svg{color:var(--gold-light);filter:drop-shadow(0 0 17px rgba(231,195,109,.35))}
        .gw-forgot-kicker{color:var(--gold);font-size:9px;font-weight:900;letter-spacing:.24em;text-transform:uppercase}
        .gw-forgot-art h1{margin:18px 0 15px;color:#f7edda;font:700 clamp(38px,5vw,62px)/1 'Space Grotesk';letter-spacing:-.07em}
        .gw-forgot-gold{background:linear-gradient(105deg,#fff0b7,#d9ad48 48%,#fff0b7);background-clip:text;-webkit-background-clip:text;color:transparent}
        .gw-forgot-art-copy{max-width:390px;margin:0 auto;color:#a49b88;font-size:12px;line-height:1.9}
        .gw-forgot-art-foot{position:relative;z-index:2;display:flex;justify-content:space-between;gap:12px;color:#746d5e;font-size:9px}
        .gw-forgot-art-foot span{display:flex;align-items:center;gap:7px}
        .gw-forgot-art-foot svg{color:var(--gold)}
        .gw-forgot-main{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:70px clamp(22px,5vw,76px);position:relative}
        .gw-forgot-back{position:absolute;top:29px;left:clamp(22px,5vw,76px);display:inline-flex;align-items:center;gap:8px;color:#938a78;font-size:10px;font-weight:700}
        .gw-forgot-back:hover{color:var(--gold-light)}
        .gw-forgot-card{width:100%;max-width:430px}
        .gw-forgot-mobile-logo{display:none}
        .gw-forgot-tag{display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(220,180,86,.23);color:var(--gold-light);font-size:8px;font-weight:900;letter-spacing:.18em}
        .gw-forgot-tag:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold)}
        .gw-forgot-title{margin:22px 0 10px;color:#f8f0df;font:700 clamp(34px,4vw,47px)/1.04 'Space Grotesk';letter-spacing:-.065em}
        .gw-forgot-subtitle{margin:0 0 30px;color:#9d9584;font-size:11px;line-height:1.85}
        .gw-forgot-info{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;margin-bottom:22px;border:1px solid rgba(220,180,86,.18);background:rgba(216,173,75,.055);color:#bdb29a;font-size:10px;line-height:1.7}
        .gw-forgot-info svg{flex:none;color:var(--gold);margin-top:1px}
        .gw-forgot-alert{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;margin-bottom:18px;border-radius:2px;font-size:10px;line-height:1.65}
        .gw-forgot-alert.error{border:1px solid rgba(255,111,96,.28);background:rgba(160,42,34,.12);color:#ffc0b6}
        .gw-forgot-alert.success{border:1px solid rgba(218,183,93,.34);background:rgba(216,173,75,.1);color:#f1dda7}
        .gw-forgot-field{margin-bottom:21px}
        .gw-forgot-label{display:block;margin-bottom:9px;color:#d6cbb3;font-size:9px;font-weight:800;letter-spacing:.13em}
        .gw-forgot-input-wrap{position:relative}
        .gw-forgot-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#b18a3d}
        .gw-forgot-input{width:100%;height:53px;padding:0 14px 0 43px;border:1px solid rgba(220,180,86,.22);border-radius:2px;outline:none;background:#10110c;color:#f8efd9;font:600 12px 'DM Sans';text-transform:uppercase;letter-spacing:.08em;transition:border .2s,box-shadow .2s}
        .gw-forgot-input::placeholder{color:#6d685b;text-transform:none;letter-spacing:0;font-weight:500}
        .gw-forgot-input:focus{border-color:rgba(237,199,111,.8);box-shadow:0 0 0 3px rgba(217,173,72,.08)}
        .gw-forgot-submit{width:100%;height:52px;display:flex;align-items:center;justify-content:center;gap:10px;border:0;border-radius:2px;background:linear-gradient(105deg,#f8e9b8,#d8ad4b 53%,#a97625);color:#171104;font:900 9px 'DM Sans';letter-spacing:.16em;cursor:pointer;box-shadow:0 10px 28px rgba(211,165,65,.15);transition:transform .2s,filter .2s}
        .gw-forgot-submit:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08)}
        .gw-forgot-submit:disabled{opacity:.65;cursor:wait}
        .gw-forgot-bottom{margin:26px 0 0;text-align:center;color:#928a79;font-size:10px;line-height:1.8}
        .gw-forgot-bottom a{color:var(--gold-light);font-weight:800}
        .gw-forgot-bottom a:hover{text-decoration:underline}
        .gw-forgot-security{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:25px;color:#706a5d;font-size:9px}
        .gw-forgot-security svg{color:#b18a3d}
        @keyframes gwForgotSpin{to{transform:rotate(360deg)}}
        .gw-forgot .gw-forgot-spin{animation:gwForgotSpin 1s linear infinite}
        @media(max-width:760px){
          .gw-forgot{grid-template-columns:1fr}
          .gw-forgot-art{display:none}
          .gw-forgot-main{min-height:100svh;padding:80px 22px 38px}
          .gw-forgot-back{top:22px;left:22px}
          .gw-forgot-mobile-logo{display:flex;justify-content:center;margin-bottom:34px}
          .gw-forgot-mobile-logo a{width:min(220px,68vw);padding:8px 11px;background:#000;border:1px solid rgba(220,180,86,.22)}
          .gw-forgot-mobile-logo img{display:block;width:100%;height:auto}
          .gw-forgot-title{font-size:39px}
        }
        @media(max-width:380px){
          .gw-forgot-main{padding-left:17px;padding-right:17px}
          .gw-forgot-title{font-size:34px}
        }
        @media(prefers-reduced-motion:reduce){
          .gw-forgot *,.gw-forgot *:before,.gw-forgot *:after{transition-duration:.01ms!important;animation-duration:.01ms!important}
        }
      `}</style>

      <aside className="gw-forgot-art">
        <Link to="/" className="gw-forgot-logo" aria-label="Global Wealth home">
          <img src="/global-wealth-logo.png" alt="Global Wealth"/>
        </Link>

        <div className="gw-forgot-art-center">
          <div className="gw-forgot-emblem"><LockKeyhole size={72} strokeWidth={1.1}/></div>
          <div className="gw-forgot-kicker">ACCOUNT RECOVERY</div>
          <h1>YOUR ACCESS.<br/><span className="gw-forgot-gold">RESTORED WITH CARE.</span></h1>
          <p className="gw-forgot-art-copy">
            A simple recovery step to help you get back to your Global Wealth member space.
          </p>
        </div>

        <div className="gw-forgot-art-foot">
          <span><ShieldCheck size={13}/> ACCOUNT SECURITY</span>
          <span>GLOBAL WEALTH</span>
        </div>
      </aside>

      <main className="gw-forgot-main">
        <Link to="/login" className="gw-forgot-back"><ArrowLeft size={14}/> Back to login</Link>

        <section className="gw-forgot-card">
          <div className="gw-forgot-mobile-logo">
            <Link to="/" aria-label="Global Wealth home">
              <img src="/global-wealth-logo.png" alt="Global Wealth"/>
            </Link>
          </div>

          <div className="gw-forgot-tag">MEMBER ACCOUNT SUPPORT</div>
          <h2 className="gw-forgot-title">Forgot your<br/><span className="gw-forgot-gold">password?</span></h2>
          <p className="gw-forgot-subtitle">
            Enter your registered User ID below. If your account is eligible,
            we’ll send the password reset instructions.
          </p>

          <div className="gw-forgot-info">
            <ShieldCheck size={16}/>
            <span>For your protection, only submit a reset request for an account you own. Keep any recovery link private.</span>
          </div>

          {error && (
            <div className="gw-forgot-alert error" role="alert">
              <CircleAlert size={15}/><span>{error}</span>
            </div>
          )}
          {message && (
            <div className="gw-forgot-alert success" role="status">
              <BadgeCheck size={16}/><span>{message}</span>
            </div>
          )}

          <form onSubmit={handleForgot}>
            <div className="gw-forgot-field">
              <label className="gw-forgot-label" htmlFor="gw-forgot-userid">REGISTERED USER ID</label>
              <div className="gw-forgot-input-wrap">
                <UserRound className="gw-forgot-input-icon" size={16}/>
                <input
                  id="gw-forgot-userid"
                  className="gw-forgot-input"
                  type="text"
                  placeholder="Enter your User ID"
                  value={userId}
                  onChange={(e) => {setUserId(e.target.value.toUpperCase());setError("");setMessage("");}}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <button className="gw-forgot-submit" type="submit" disabled={loading}>
              {loading ? <><LoaderCircle size={16} className="gw-forgot-spin"/> SENDING REQUEST…</> : <>SEND RESET INSTRUCTIONS <ArrowRight size={16}/></>}
            </button>
          </form>

          <p className="gw-forgot-bottom">
            Remembered your password? <Link to="/login">Return to member login</Link>
          </p>
          <div className="gw-forgot-security"><LockKeyhole size={13}/> Your account details are handled securely.</div>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;
