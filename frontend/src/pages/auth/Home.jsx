import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChevronDown,
  CircleHelp,
  Globe2,
  Layers3,
  LockKeyhole,
  Menu,
  MoveUpRight,
  Network,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";

const questions = [
  {
    q: "What can I do on Global Wealth?",
    a: "Global Wealth brings member access and platform information into one place. Sign in to view the tools and services currently enabled for your account.",
  },
  {
    q: "How do I join?",
    a: "Use the Create Account link and complete the registration steps shown on the website. Keep your login details private and use accurate information.",
  },
  {
    q: "I already have an account. Where do I sign in?",
    a: "Choose Member Login and enter your registered User ID and password. If you have trouble signing in, use the password recovery link.",
  },
  {
    q: "How should I handle digital-asset transfers?",
    a: "Before sending anything, verify the asset, network and destination address shown in your authenticated account. Transfers sent to an incorrect address or network may not be recoverable.",
  },
  {
    q: "Are returns guaranteed?",
    a: "No. Digital assets and related activities carry risk, including the possible loss of the amount committed. No profit or return is guaranteed. Read all terms and risk disclosures before participating.",
  },
];

const pillars = [
  {
    icon: Globe2,
    index: "01 / GLOBAL",
    title: "One connected destination",
    body: "Move between platform information and your member tools through a single, clear experience.",
  },
  {
    icon: Network,
    index: "02 / COMMUNITY",
    title: "Built around connection",
    body: "Find the community and network features that are available within your member account.",
  },
  {
    icon: Layers3,
    index: "03 / CLARITY",
    title: "A simpler overview",
    body: "A considered layout helps you locate account areas and review the information presented.",
  },
];

function Logo() {
  return (
    <Link className="gwm-logo" to="/" aria-label="Global Wealth home">
      <img src="/global-wealth-logo.png" alt="Global Wealth" />
    </Link>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [compactHeader, setCompactHeader] = useState(false);

  useEffect(() => {
    const update = () => setCompactHeader(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Global Wealth — Beyond Boundaries";
    return () => { document.title = oldTitle; };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="gwm-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .gwm-page{
          --black:#030403;--black2:#090a07;--gold:#d8ad4b;--gold2:#f8e5a8;
          --gold3:#b9872c;--paper:#f4d98a;--muted:#a9a18d;--line:rgba(222,181,87,.22);
          min-height:100vh;background:var(--black);color:#f7f0df;
          font-family:'DM Sans',sans-serif;overflow:hidden;position:relative;
        }
        .gwm-page *{box-sizing:border-box}
        .gwm-page a{text-decoration:none}
        .gwm-wrap{width:min(1240px,calc(100% - 64px));margin:0 auto}
        .gwm-gold-text{color:var(--gold2)}
        .gwm-kicker{display:flex;align-items:center;gap:12px;color:var(--gold);font-size:10px;font-weight:800;letter-spacing:.23em;text-transform:uppercase}
        .gwm-kicker:before{content:"";width:31px;height:1px;background:var(--gold)}
        .gwm-header{position:fixed;z-index:99;top:0;left:0;right:0;padding:19px 0;border-bottom:1px solid transparent;transition:background .25s,padding .25s,border-color .25s}
        .gwm-header.is-compact{padding:10px 0;background:rgba(3,4,3,.94);border-color:var(--line);backdrop-filter:blur(18px)}
        .gwm-nav{display:flex;align-items:center;justify-content:space-between;gap:25px}
        .gwm-logo{display:block;flex:none}
        .gwm-logo img{display:block;width:213px;max-height:65px;object-fit:contain}
        .gwm-links{display:flex;align-items:center;gap:28px}
        .gwm-links a{color:#d1c7ad;font-size:12px;font-weight:700;transition:color .2s}
        .gwm-links a:hover{color:var(--gold2)}
        .gwm-nav-actions{display:flex;gap:10px;align-items:center}
        .gwm-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:0 21px;border-radius:4px;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;transition:transform .2s,filter .2s,background .2s}
        .gwm-btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .gwm-btn-gold{color:#100d05;background:linear-gradient(115deg,#fff0b5 0%,#e4bf66 40%,#c39134 100%);box-shadow:0 9px 30px rgba(210,166,70,.18)}
        .gwm-btn-outline{color:var(--gold2);border:1px solid rgba(225,188,99,.55);background:transparent}
        .gwm-toggle{display:none;width:43px;height:43px;align-items:center;justify-content:center;color:var(--gold2);border:1px solid var(--line);background:#0c0d09;border-radius:4px}
        .gwm-mobile{display:none}

        /* New editorial hero */
        .gwm-hero{min-height:790px;padding:155px 0 90px;position:relative;display:flex;align-items:center}
        .gwm-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,4,3,.96) 0%,rgba(3,4,3,.88) 47%,rgba(3,4,3,.2) 100%),url('/global-wealth-logo.png') no-repeat 112% 52%/min(900px,75vw) auto;opacity:.15;filter:grayscale(1);pointer-events:none}
        .gwm-hero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:.6}
        .gwm-hero-layout{position:relative;z-index:1;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:52px}
        .gwm-hero-copy{max-width:680px}
        .gwm-hero h1{margin:25px 0 22px;font:700 clamp(54px,7.5vw,96px)/.98 'Space Grotesk',sans-serif;letter-spacing:-.075em;color:#fff1c4}
        .gwm-hero h1 span{display:block;color:var(--gold);text-shadow:0 8px 45px rgba(216,173,75,.15)}
        .gwm-lead{max-width:535px;color:#b9b09b;font-size:15px;line-height:1.95}
        .gwm-hero-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
        .gwm-risk-note{max-width:560px;margin-top:24px;color:#777363;font-size:10px;line-height:1.8}
        .gwm-hero-visual{position:relative;min-height:465px;display:flex;align-items:center;justify-content:center}
        .gwm-gold-disc{position:absolute;width:min(430px,90%);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 27%,#fff0b4 0%,#e4bd62 17%,#c18d2f 43%,#5a3e12 69%,#120e05 75%);box-shadow:0 0 100px rgba(207,159,55,.22),inset -20px -30px 50px rgba(0,0,0,.38)}
        .gwm-gold-disc:before{content:"";position:absolute;inset:13px;border:1px solid rgba(255,241,193,.55);border-radius:50%}
        .gwm-gold-disc:after{content:"";position:absolute;inset:-22px;border:1px solid rgba(218,174,74,.24);border-radius:50%;box-shadow:0 0 0 18px rgba(218,174,74,.025)}
        .gwm-hero-logo{position:relative;z-index:2;width:min(480px,108%);padding:17px 12px;background:rgba(0,0,0,.48);border:1px solid rgba(255,232,166,.32);box-shadow:0 28px 70px rgba(0,0,0,.58);transform:rotate(-3deg)}
        .gwm-hero-logo img{width:100%;display:block}
        .gwm-visual-label{position:absolute;z-index:3;right:-5px;bottom:28px;padding:13px 17px;background:#080906;border-left:3px solid var(--gold);color:#f5dfa0;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
        .gwm-vertical-word{position:absolute;right:-14px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;color:rgba(239,205,125,.32);font:700 10px 'Space Grotesk';letter-spacing:.38em}

        /* Gold marquee */
        .gwm-marquee{overflow:hidden;background:linear-gradient(100deg,#bd8b30,#f2d78c 42%,#c49338);color:#120e04}
        .gwm-marquee-inner{display:flex;justify-content:space-around;align-items:center;gap:30px;padding:17px 20px;white-space:nowrap;font:700 10px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase}
        .gwm-marquee-inner span{display:flex;align-items:center;gap:12px}
        .gwm-marquee-inner svg{width:14px;height:14px}

        /* Gold feature panels */
        .gwm-section{padding:112px 0}
        .gwm-section-heading{max-width:770px;margin-bottom:52px}
        .gwm-section-heading h2{margin:18px 0 15px;font:700 clamp(38px,5vw,64px)/1.02 'Space Grotesk';letter-spacing:-.065em;color:#fff0c0}
        .gwm-section-heading p{max-width:610px;color:#a9a18d;font-size:14px;line-height:1.9}
        .gwm-pillar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:17px}
        .gwm-pillar{min-height:310px;padding:28px 27px 25px;background:linear-gradient(145deg,#f4d98a 0%,#d9ad4b 54%,#a97824 100%);color:#171105;position:relative;overflow:hidden;transition:transform .25s,box-shadow .25s}
        .gwm-pillar:hover{transform:translateY(-7px);box-shadow:0 22px 48px rgba(204,157,55,.16)}
        .gwm-pillar:after{content:"";position:absolute;width:190px;height:190px;right:-105px;bottom:-110px;border:1px solid rgba(36,24,3,.24);border-radius:50%;box-shadow:0 0 0 19px rgba(36,24,3,.05),0 0 0 40px rgba(36,24,3,.04)}
        .gwm-pillar-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:49px}
        .gwm-pillar-icon{width:49px;height:49px;display:grid;place-items:center;border:1px solid rgba(27,19,5,.32);background:rgba(255,248,217,.24)}
        .gwm-pillar-index{font-size:9px;font-weight:800;letter-spacing:.16em}
        .gwm-pillar h3{max-width:270px;margin:0 0 12px;font:700 23px/1.12 'Space Grotesk';letter-spacing:-.045em}
        .gwm-pillar p{max-width:300px;margin:0;color:#45320d;font-size:12px;line-height:1.85}
        .gwm-pillar-arrow{position:absolute;right:25px;bottom:22px}

        /* Feature story */
        .gwm-story{padding:0 0 110px}
        .gwm-story-panel{display:grid;grid-template-columns:.9fr 1.1fr;min-height:420px;border:1px solid var(--line);background:#090a07}
        .gwm-story-left{padding:55px 48px;display:flex;flex-direction:column;justify-content:center}
        .gwm-story-left h2{margin:17px 0;font:700 clamp(35px,4vw,53px)/1.04 'Space Grotesk';letter-spacing:-.06em;color:var(--gold2)}
        .gwm-story-left p{max-width:390px;color:#aaa18c;font-size:13px;line-height:1.9}
        .gwm-story-right{padding:35px;background:linear-gradient(135deg,#f4df9e,#d4a644 52%,#9d6c1d);color:#161004;display:flex;flex-direction:column;justify-content:center;gap:13px}
        .gwm-step{display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:16px;padding:19px 17px;border-bottom:1px solid rgba(37,25,4,.22)}
        .gwm-step:last-child{border-bottom:0}
        .gwm-step-icon{width:43px;height:43px;display:grid;place-items:center;border:1px solid rgba(30,21,4,.32)}
        .gwm-step h3{margin:0 0 5px;font:700 15px 'Space Grotesk'}
        .gwm-step p{margin:0;color:#594216;font-size:11px;line-height:1.65}
        .gwm-step-no{font:700 11px 'Space Grotesk';opacity:.6}

        /* CTA */
        .gwm-cta{padding:0 0 112px}
        .gwm-cta-box{position:relative;overflow:hidden;padding:55px 58px;background:linear-gradient(110deg,#f7e4a9,#dfb956 55%,#b98227);color:#120e04}
        .gwm-cta-box:after{content:"GW";position:absolute;right:20px;top:50%;transform:translateY(-55%);font:700 190px/.8 'Space Grotesk';letter-spacing:-.12em;color:rgba(45,29,3,.08);pointer-events:none}
        .gwm-cta-content{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:35px}
        .gwm-cta h2{max-width:680px;margin:14px 0 10px;font:700 clamp(34px,4.6vw,57px)/1.02 'Space Grotesk';letter-spacing:-.065em}
        .gwm-cta p{max-width:600px;margin:0;color:#49350f;font-size:12px;line-height:1.85}
        .gwm-cta .gwm-kicker{color:#3e2a08}
        .gwm-cta .gwm-kicker:before{background:#3e2a08}
        .gwm-cta .gwm-btn{flex:none;background:#090a07;color:#f6df9c}

        /* FAQ + footer */
        .gwm-faq-layout{display:grid;grid-template-columns:.75fr 1.25fr;gap:65px}
        .gwm-faq-title h2{margin:17px 0;font:700 clamp(38px,4.5vw,57px)/1.02 'Space Grotesk';letter-spacing:-.06em;color:#f4dfa0}
        .gwm-faq-title p{color:#a9a18d;font-size:13px;line-height:1.9}
        .gwm-faq-item{border-top:1px solid var(--line)}
        .gwm-faq-item:last-child{border-bottom:1px solid var(--line)}
        .gwm-faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:18px;padding:20px 0;border:0;background:none;color:#f1e6ca;text-align:left;font:700 14px 'DM Sans';cursor:pointer}
        .gwm-faq-q svg{color:var(--gold);flex:none;transition:transform .2s}
        .gwm-faq-q[aria-expanded="true"] svg{transform:rotate(180deg)}
        .gwm-faq-a{padding:0 36px 20px 0;color:#aaa18c;font-size:12px;line-height:1.9}
        .gwm-footer{padding:55px 0 23px;background:#080906;border-top:1px solid var(--line)}
        .gwm-footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:45px;padding-bottom:37px}
        .gwm-footer-about{max-width:390px;margin:17px 0 0;color:#8e8878;font-size:11px;line-height:1.9}
        .gwm-footer h4{margin:5px 0 17px;color:var(--gold2);font:700 10px 'Space Grotesk';letter-spacing:.2em}
        .gwm-footer-links{display:grid;gap:13px}
        .gwm-footer-links a{color:#aaa18d;font-size:11px}
        .gwm-footer-links a:hover{color:var(--gold2)}
        .gwm-footer-bottom{display:flex;justify-content:space-between;gap:15px;padding-top:20px;border-top:1px solid rgba(222,181,87,.12);color:#716b5d;font-size:9px}
        @media(max-width:980px){
          .gwm-links{gap:16px}.gwm-logo img{width:180px}
          .gwm-hero-layout{gap:25px}.gwm-hero h1{font-size:clamp(54px,7vw,76px)}
          .gwm-story-left{padding:38px 30px}.gwm-faq-layout{gap:35px}
        }
        @media(max-width:760px){
          .gwm-wrap{width:calc(100% - 36px)}
          .gwm-header{padding:10px 0}.gwm-logo img{width:170px;max-height:55px}
          .gwm-links,.gwm-nav-actions{display:none}.gwm-toggle{display:flex}
          .gwm-mobile{position:absolute;display:grid;gap:4px;top:calc(100% + 8px);left:18px;right:18px;padding:12px;background:#0b0c08;border:1px solid var(--line);box-shadow:0 20px 45px rgba(0,0,0,.55)}
          .gwm-mobile>a{padding:12px;color:#f0e4c6;font-size:12px;font-weight:700}
          .gwm-mobile-ctas{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:5px}
          .gwm-mobile-ctas .gwm-btn{padding:0 8px;font-size:9px}
          .gwm-hero{min-height:0;padding:125px 0 70px}
          .gwm-hero-layout{grid-template-columns:1fr;text-align:center;gap:15px}
          .gwm-kicker{justify-content:center}
          .gwm-hero h1{font-size:clamp(49px,12vw,76px);margin:22px 0 18px}
          .gwm-lead{margin:0 auto;font-size:13px}
          .gwm-hero-ctas{justify-content:center}
          .gwm-risk-note{margin:20px auto 0}
          .gwm-hero-visual{min-height:350px;margin-top:5px}
          .gwm-gold-disc{width:min(310px,80vw)}
          .gwm-hero-logo{width:min(390px,100%)}
          .gwm-visual-label{right:0;bottom:13px}
          .gwm-vertical-word{right:0}
          .gwm-marquee-inner{justify-content:flex-start;overflow:hidden;padding:15px 18px;font-size:9px}
          .gwm-section{padding:78px 0}
          .gwm-section-heading{margin-bottom:30px}
          .gwm-section-heading h2{font-size:43px}
          .gwm-pillar-grid{grid-template-columns:1fr;gap:12px}
          .gwm-pillar{min-height:245px;padding:24px}
          .gwm-pillar-top{margin-bottom:31px}
          .gwm-story{padding-bottom:78px}
          .gwm-story-panel{grid-template-columns:1fr}
          .gwm-story-left{padding:35px 25px}
          .gwm-story-right{padding:18px 12px}
          .gwm-step{grid-template-columns:42px 1fr auto;padding:16px 10px;gap:12px}
          .gwm-cta{padding-bottom:78px}
          .gwm-cta-box{padding:34px 24px}
          .gwm-cta-content{align-items:flex-start;flex-direction:column;gap:22px}
          .gwm-cta-box:after{font-size:120px;right:8px}
          .gwm-faq-layout{grid-template-columns:1fr;gap:26px}
          .gwm-faq-title{text-align:center}
          .gwm-faq-title .gwm-kicker{justify-content:center}
          .gwm-faq-title h2{font-size:43px}
          .gwm-footer-grid{grid-template-columns:1fr 1fr;gap:30px 18px}
          .gwm-footer-grid>div:first-child{grid-column:1/-1}
          .gwm-footer-bottom{flex-direction:column;text-align:center}
        }
        @media(max-width:390px){
          .gwm-wrap{width:calc(100% - 30px)}
          .gwm-logo img{width:154px}
          .gwm-hero h1{font-size:46px}
          .gwm-hero-ctas{display:grid;grid-template-columns:1fr}
          .gwm-hero-ctas .gwm-btn{width:100%}
          .gwm-footer-grid{grid-template-columns:1fr}
          .gwm-footer-grid>div:first-child{grid-column:auto}
        }
        @media(prefers-reduced-motion:reduce){
          .gwm-page *,.gwm-page *:before,.gwm-page *:after{transition-duration:.01ms!important;animation-duration:.01ms!important;scroll-behavior:auto!important}
        }
      `}</style>

      <header className={`gwm-header ${compactHeader ? "is-compact" : ""}`}>
        <div className="gwm-wrap gwm-nav">
          <Logo />
          <nav className="gwm-links" aria-label="Main navigation">
            <a href="#top">Home</a>
            <a href="#platform">Platform</a>
            <a href="#journey">Your Journey</a>
            <a href="#questions">Questions</a>
          </nav>
          <div className="gwm-nav-actions">
            <Link to="/login" className="gwm-btn gwm-btn-outline">Sign In</Link>
            <Link to="/register" className="gwm-btn gwm-btn-gold">Join Now <ArrowUpRight size={15}/></Link>
          </div>
          <button className="gwm-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
          {menuOpen && (
            <nav className="gwm-mobile" aria-label="Mobile navigation">
              <a href="#top" onClick={closeMenu}>Home</a>
              <a href="#platform" onClick={closeMenu}>Platform</a>
              <a href="#journey" onClick={closeMenu}>Your Journey</a>
              <a href="#questions" onClick={closeMenu}>Questions</a>
              <div className="gwm-mobile-ctas">
                <Link to="/login" className="gwm-btn gwm-btn-outline" onClick={closeMenu}>Sign In</Link>
                <Link to="/register" className="gwm-btn gwm-btn-gold" onClick={closeMenu}>Join Now</Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main id="top">
        <section className="gwm-hero">
          <div className="gwm-wrap gwm-hero-layout">
            <div className="gwm-hero-copy">
              <div className="gwm-kicker">A new perspective on global connection</div>
              <h1>BEYOND<br/>BOUNDARIES<span>BEYOND LIMITS.</span></h1>
              <p className="gwm-lead">
                Step into Global Wealth — a digital destination shaped around
                access, connection and a more considered way to explore your
                member experience.
              </p>
              <div className="gwm-hero-ctas">
                <Link to="/register" className="gwm-btn gwm-btn-gold">Become a Member <MoveUpRight size={16}/></Link>
                <Link to="/login" className="gwm-btn gwm-btn-outline">Enter Your Account <ArrowRight size={16}/></Link>
              </div>
              <p className="gwm-risk-note">
                Global Wealth does not guarantee profits or investment returns. Digital assets
                and related activities involve risk, including possible loss. Review applicable
                terms and risk information before participating.
              </p>
            </div>
            <div className="gwm-hero-visual">
              <div className="gwm-gold-disc"/>
              <div className="gwm-hero-logo">
                <img src="/global-wealth-logo.png" alt="Global Wealth gold bull emblem"/>
              </div>
              <div className="gwm-visual-label">Strength · Vision · Progress</div>
              <div className="gwm-vertical-word">GLOBAL WEALTH / ESTABLISH YOUR DIRECTION</div>
            </div>
          </div>
        </section>

        <div className="gwm-marquee" aria-label="Global Wealth values">
          <div className="gwm-marquee-inner">
            <span><Sparkles/> GLOBAL VISION</span>
            <span><Globe2/> CONNECTED EXPERIENCE</span>
            <span><BadgeCheck/> MEMBER FIRST</span>
            <span><LockKeyhole/> ACCOUNT AWARENESS</span>
          </div>
        </div>

        <section className="gwm-section" id="platform">
          <div className="gwm-wrap">
            <div className="gwm-section-heading">
              <div className="gwm-kicker">The platform</div>
              <h2>MADE TO MOVE<br/><span className="gwm-gold-text">WITH YOUR WORLD.</span></h2>
              <p>
                A clear digital environment for exploring platform information,
                reaching your member area and discovering the features available
                to your account.
              </p>
            </div>
            <div className="gwm-pillar-grid">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="gwm-pillar" key={item.index}>
                    <div className="gwm-pillar-top">
                      <div className="gwm-pillar-icon"><Icon size={23}/></div>
                      <span className="gwm-pillar-index">{item.index}</span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <ArrowUpRight className="gwm-pillar-arrow" size={20}/>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="gwm-story" id="journey">
          <div className="gwm-wrap">
            <div className="gwm-story-panel">
              <div className="gwm-story-left">
                <div className="gwm-kicker">Start with confidence</div>
                <h2>YOUR NEXT CHAPTER STARTS HERE.</h2>
                <p>
                  Take a moment to understand the platform, review the information
                  available to you and keep your account details protected at every step.
                </p>
                <div style={{marginTop:22}}>
                  <Link to="/register" className="gwm-btn gwm-btn-gold">Open Your Account <ArrowUpRight size={15}/></Link>
                </div>
              </div>
              <div className="gwm-story-right">
                <div className="gwm-step">
                  <div className="gwm-step-icon"><WalletCards size={21}/></div>
                  <div><h3>Set up your membership</h3><p>Complete the registration process using your details.</p></div>
                  <span className="gwm-step-no">01</span>
                </div>
                <div className="gwm-step">
                  <div className="gwm-step-icon"><Globe2 size={21}/></div>
                  <div><h3>Discover your workspace</h3><p>Explore the member tools and platform information available.</p></div>
                  <span className="gwm-step-no">02</span>
                </div>
                <div className="gwm-step">
                  <div className="gwm-step-icon"><ShieldCheck size={21}/></div>
                  <div><h3>Stay informed and secure</h3><p>Review details carefully and protect your sign-in credentials.</p></div>
                  <span className="gwm-step-no">03</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gwm-cta">
          <div className="gwm-wrap">
            <div className="gwm-cta-box">
              <div className="gwm-cta-content">
                <div>
                  <div className="gwm-kicker">Your global access point</div>
                  <h2>READY TO STEP INSIDE?</h2>
                  <p>Access your existing account or create your Global Wealth membership to explore the platform.</p>
                </div>
                <Link to="/login" className="gwm-btn">Access Member Area <ArrowRight size={16}/></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="gwm-section" id="questions">
          <div className="gwm-wrap gwm-faq-layout">
            <div className="gwm-faq-title">
              <div className="gwm-kicker">Help centre</div>
              <h2>THE DETAILS<br/><span className="gwm-gold-text">MATTER.</span></h2>
              <p>Useful information to help you understand account access and platform basics.</p>
              <CircleHelp size={38} color="#d8ad4b" strokeWidth={1.2}/>
            </div>
            <div>
              {questions.map((item, index) => (
                <div className="gwm-faq-item" key={item.q}>
                  <button className="gwm-faq-q" type="button" aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}>
                    {item.q}<ChevronDown size={18}/>
                  </button>
                  {activeFaq === index && <div className="gwm-faq-a">{item.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="gwm-footer">
        <div className="gwm-wrap">
          <div className="gwm-footer-grid">
            <div>
              <Logo/>
              <p className="gwm-footer-about">
                Global Wealth is a digital platform experience. Always review the
                applicable service terms and risk disclosures before using any
                financial or digital-asset features.
              </p>
            </div>
            <div>
              <h4>DISCOVER</h4>
              <div className="gwm-footer-links">
                <a href="#top">Home</a>
                <a href="#platform">The Platform</a>
                <a href="#journey">Your Journey</a>
                <a href="#questions">Help Centre</a>
              </div>
            </div>
            <div>
              <h4>YOUR ACCOUNT</h4>
              <div className="gwm-footer-links">
                <Link to="/login">Member Sign In</Link>
                <Link to="/register">Create Membership</Link>
                <Link to="/forgot-password">Password Recovery</Link>
              </div>
            </div>
          </div>
          <div className="gwm-footer-bottom">
            <span>© {new Date().getFullYear()} Global Wealth. All rights reserved.</span>
            <span>Digital assets involve risk. Returns are not guaranteed.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
