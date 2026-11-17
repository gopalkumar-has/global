import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleAlert,
  Globe2,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  X,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

const countryList = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
    "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam",
    "Yemen", "Zambia", "Zimbabwe"
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const countryRef = useRef(null);
  const sponsorRequestRef = useRef(0);

  const [formData, setFormData] = useState({
    sponsorId: "",
    name: "",
    email: "",
    mobile: "",
    country: "",
    walletAddress: "",
    password: "",
    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [checkingSponsor, setCheckingSponsor] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchCountry, setSearchCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref) setFormData((prev) => ({ ...prev, sponsorId: ref }));
  }, [location.search]);

  useEffect(() => {
    const sponsorId = formData.sponsorId.trim();
    const requestId = ++sponsorRequestRef.current;

    if (!sponsorId || sponsorId.length < 5) {
      setSponsorName("");
      setCheckingSponsor(false);
      return undefined;
    }

    setCheckingSponsor(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await api.get(`/auth/check-sponsor/${encodeURIComponent(sponsorId)}`);
        if (requestId === sponsorRequestRef.current) {
          setSponsorName(res.data?.name || "Invalid Sponsor ID");
        }
      } catch {
        if (requestId === sponsorRequestRef.current) {
          setSponsorName("❌ Invalid Sponsor ID");
        }
      } finally {
        if (requestId === sponsorRequestRef.current) setCheckingSponsor(false);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [formData.sponsorId]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredCountries = useMemo(
    () => countryList.filter((country) => country.toLowerCase().includes(searchCountry.toLowerCase())),
    [searchCountry]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleCountrySelect = (countryName) => {
    setFormData((prev) => ({ ...prev, country: countryName }));
    setShowCountryDropdown(false);
    setSearchCountry("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (checkingSponsor) {
      setError("Please wait while we verify the Sponsor ID.");
      return;
    }
    if (formData.sponsorId.trim().length < 5 || !sponsorName || sponsorName.includes("❌")) {
      setError("Please enter a valid Sponsor ID.");
      return;
    }
    if (!formData.country) {
      setError("Please select your country.");
      return;
    }
    if (!formData.walletAddress.trim()) {
      setError("USDT BEP-20 Wallet Address is required.");
      return;
    }
    if (!formData.agreeTerms) {
      setError("Please agree to the terms of service.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      const formattedDate = new Date().toISOString().split("T")[0];

      setModalData({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userId: res.data.userId,
        trxPassword: res.data.transactionPassword || "Check Email",
        date: formattedDate,
      });
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const sponsorIsInvalid = sponsorName.includes("❌");
  const sponsorIsValid = Boolean(sponsorName) && !sponsorIsInvalid && !checkingSponsor;

  return (
    <div className="gw-register">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .gw-register{
          --black:#030403;--panel:#0b0c08;--panel2:#11120d;--gold:#d8ad4b;
          --gold-light:#ffe9a7;--gold-deep:#9c6e21;--text:#f5edda;--muted:#a79e89;
          --line:rgba(220,180,86,.23);
          min-height:100vh;padding:34px 20px;display:flex;align-items:center;justify-content:center;
          position:relative;overflow:hidden;background:var(--black);color:var(--text);
          font-family:'DM Sans',sans-serif;
        }
        .gw-register *{box-sizing:border-box}
        .gw-register:before{content:"";position:fixed;inset:0;pointer-events:none;
          background:radial-gradient(ellipse at 12% 15%,rgba(202,153,51,.14),transparent 32rem),
          radial-gradient(ellipse at 90% 85%,rgba(202,153,51,.11),transparent 29rem)}
        .gw-register:after{content:"";position:fixed;inset:18px;border:1px solid rgba(220,180,86,.09);pointer-events:none}
        .gw-reg-shell{position:relative;z-index:1;width:min(1080px,100%);display:grid;grid-template-columns:.88fr 1.12fr;
          min-height:690px;border:1px solid var(--line);background:rgba(8,9,6,.94);
          box-shadow:0 30px 100px rgba(0,0,0,.55)}
        .gw-reg-aside{position:relative;overflow:hidden;padding:42px 38px;display:flex;flex-direction:column;
          justify-content:space-between;background:linear-gradient(145deg,#f5dfa0 0%,#d8ad4b 52%,#96671e 100%);color:#171104}
        .gw-reg-aside:before{content:"";position:absolute;width:430px;height:430px;left:-170px;bottom:-175px;border:1px solid rgba(36,24,3,.23);border-radius:50%;
          box-shadow:0 0 0 25px rgba(36,24,3,.04),0 0 0 60px rgba(36,24,3,.035),0 0 0 100px rgba(36,24,3,.025)}
        .gw-reg-aside:after{content:"GW";position:absolute;right:-15px;bottom:70px;color:rgba(39,26,4,.09);
          font:700 175px/.8 'Space Grotesk';letter-spacing:-.13em}
        .gw-reg-brand{position:relative;z-index:1;display:inline-block;width:min(280px,100%);padding:12px;background:rgba(0,0,0,.9);border:1px solid rgba(255,255,255,.18)}
        .gw-reg-brand img{display:block;width:100%;height:auto}
        .gw-reg-aside-copy{position:relative;z-index:1;margin:65px 0 40px}
        .gw-reg-eyebrow{font-size:9px;font-weight:900;letter-spacing:.22em;text-transform:uppercase}
        .gw-reg-aside h1{margin:18px 0 16px;font:700 clamp(43px,5vw,64px)/.98 'Space Grotesk';letter-spacing:-.075em}
        .gw-reg-aside-copy p{max-width:340px;margin:0;color:#4b3710;font-size:12px;line-height:1.9}
        .gw-reg-benefits{position:relative;z-index:1;display:grid;gap:13px}
        .gw-reg-benefit{display:flex;align-items:center;gap:11px;color:#302208;font-size:10px;font-weight:800;letter-spacing:.04em}
        .gw-reg-benefit svg{flex:none}
        .gw-reg-aside-foot{position:relative;z-index:1;margin-top:34px;color:rgba(35,24,4,.65);font-size:9px;line-height:1.7}
        .gw-reg-main{padding:42px clamp(24px,5vw,58px);display:flex;flex-direction:column;justify-content:center}
        .gw-reg-topline{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:29px}
        .gw-reg-back{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font-size:10px;font-weight:700}
        .gw-reg-back:hover{color:var(--gold-light)}
        .gw-reg-step{color:#8d836d;font-size:9px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}
        .gw-reg-heading{margin-bottom:26px}
        .gw-reg-kicker{display:flex;align-items:center;gap:9px;color:var(--gold);font-size:9px;font-weight:900;letter-spacing:.2em;text-transform:uppercase}
        .gw-reg-kicker:before{content:"";width:22px;height:1px;background:var(--gold)}
        .gw-reg-heading h2{margin:12px 0 8px;color:var(--gold-light);font:700 clamp(31px,4vw,43px)/1.02 'Space Grotesk';letter-spacing:-.06em}
        .gw-reg-heading p{margin:0;color:var(--muted);font-size:11px;line-height:1.7}
        .gw-reg-error{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;margin:0 0 18px;border:1px solid rgba(255,103,103,.3);background:rgba(160,34,34,.12);color:#ffbaba;font-size:11px;line-height:1.6}
        .gw-reg-form{display:grid;grid-template-columns:1fr 1fr;gap:14px 13px}
        .gw-reg-field{min-width:0;position:relative}
        .gw-reg-field.full{grid-column:1/-1}
        .gw-reg-field label{display:block;margin:0 0 7px;color:#c9bea4;font-size:9px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
        .gw-reg-input-wrap{position:relative}
        .gw-reg-field-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#b18a3c;pointer-events:none}
        .gw-reg-input,.gw-reg-select-trigger{width:100%;height:47px;padding:0 13px 0 40px;border:1px solid rgba(219,179,85,.2);border-radius:3px;outline:none;background:#10110c;color:#f5edda;font:500 11px 'DM Sans';transition:border-color .2s,box-shadow .2s}
        .gw-reg-input::placeholder{color:#716b5d}
        .gw-reg-input:focus,.gw-reg-select-trigger:focus{border-color:#d8ad4b;box-shadow:0 0 0 3px rgba(216,173,75,.08)}
        .gw-reg-input:disabled{opacity:.65}
        .gw-reg-input.password{padding-right:43px}
        .gw-reg-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);border:0;background:none;color:#9c906f;cursor:pointer;padding:5px}
        .gw-reg-sponsor-status{display:flex;align-items:center;gap:6px;margin:7px 0 0 2px;font-size:9px;font-weight:700}
        .gw-reg-sponsor-status.valid{color:#d9bd73}.gw-reg-sponsor-status.invalid{color:#ff8888}.gw-reg-sponsor-status.pending{color:#b9a77d}
        .gw-reg-select-trigger{display:flex;align-items:center;justify-content:space-between;text-align:left;cursor:pointer}
        .gw-reg-select-trigger.placeholder{color:#716b5d}
        .gw-reg-country-menu{position:absolute;z-index:20;top:calc(100% + 6px);left:0;right:0;padding:8px;border:1px solid var(--line);background:#11120d;box-shadow:0 18px 38px rgba(0,0,0,.55)}
        .gw-reg-country-search{width:100%;height:39px;padding:0 11px;border:1px solid rgba(219,179,85,.2);outline:none;background:#080906;color:#fff;font:11px 'DM Sans'}
        .gw-reg-country-list{max-height:190px;overflow:auto;margin-top:6px}
        .gw-reg-country-option{width:100%;padding:10px;text-align:left;border:0;border-bottom:1px solid rgba(255,255,255,.04);background:transparent;color:#e9dfc8;font:11px 'DM Sans';cursor:pointer}
        .gw-reg-country-option:hover,.gw-reg-country-option[aria-selected="true"]{background:rgba(216,173,75,.13);color:var(--gold-light)}
        .gw-reg-country-empty{padding:13px;color:var(--muted);font-size:10px}
        .gw-reg-terms{grid-column:1/-1;display:flex;align-items:flex-start;gap:10px;margin:5px 0 1px;color:#b7ad98;font-size:10px;line-height:1.65}
        .gw-reg-terms input{width:15px;height:15px;flex:none;margin:1px 0 0;accent-color:#d8ad4b}
        .gw-reg-terms a{color:var(--gold-light);text-decoration:underline}
        .gw-reg-submit{grid-column:1/-1;width:100%;height:49px;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:3px;border:0;border-radius:3px;background:linear-gradient(110deg,#f8e6aa,#d8ad4b 55%,#a97625);color:#171104;font:900 10px 'DM Sans';letter-spacing:.16em;text-transform:uppercase;cursor:pointer;box-shadow:0 9px 28px rgba(216,173,75,.13);transition:filter .2s,transform .2s}
        .gw-reg-submit:hover:not(:disabled){filter:brightness(1.08);transform:translateY(-2px)}
        .gw-reg-submit:disabled{opacity:.6;cursor:not-allowed}
        .gw-reg-login{margin:22px 0 0;text-align:center;color:#8e8778;font-size:10px}
        .gw-reg-login a{color:var(--gold-light);font-weight:800}
        .gw-reg-security{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:17px;color:#6e685a;font-size:9px}
        .gw-reg-modal-backdrop{position:fixed;z-index:1000;inset:0;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.82);backdrop-filter:blur(8px)}
        .gw-reg-modal{position:relative;width:min(440px,100%);max-height:90vh;overflow:auto;padding:34px 28px 27px;border:1px solid rgba(225,185,93,.4);background:linear-gradient(160deg,#14150f,#080906 62%);box-shadow:0 30px 100px rgba(0,0,0,.7)}
        .gw-reg-modal-close{position:absolute;top:13px;right:13px;width:33px;height:33px;display:grid;place-items:center;border:1px solid var(--line);background:transparent;color:#c6b78f;cursor:pointer}
        .gw-reg-success-icon{width:57px;height:57px;display:grid;place-items:center;margin:0 auto 17px;border:1px solid rgba(223,185,94,.6);border-radius:50%;background:rgba(216,173,75,.12);color:var(--gold-light)}
        .gw-reg-modal h3{margin:0;text-align:center;color:var(--gold-light);font:700 25px 'Space Grotesk';letter-spacing:-.04em}
        .gw-reg-modal-sub{margin:8px 0 22px;text-align:center;color:var(--muted);font-size:11px;line-height:1.6}
        .gw-reg-details{padding:7px 15px;border:1px solid var(--line);background:rgba(255,255,255,.025)}
        .gw-reg-detail-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:10px}
        .gw-reg-detail-row:last-child{border-bottom:0}
        .gw-reg-detail-row span:first-child{color:#958c79}
        .gw-reg-detail-row strong{max-width:65%;overflow-wrap:anywhere;text-align:right;color:#f4e8c9;font-size:10px}
        .gw-reg-secret{display:flex;align-items:center;justify-content:flex-end;gap:7px}
        .gw-reg-secret button{padding:2px;border:0;background:transparent;color:var(--gold);cursor:pointer}
        .gw-reg-modal-login{width:100%;height:47px;margin-top:19px;border:0;background:linear-gradient(110deg,#f8e6aa,#d8ad4b 55%,#a97625);color:#171104;font:900 10px 'DM Sans';letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
        .gw-reg-modal-note{margin:13px 0 0;color:#77705f;text-align:center;font-size:9px;line-height:1.65}
        @media(max-width:850px){
          .gw-reg-shell{grid-template-columns:.72fr 1.28fr}
          .gw-reg-aside{padding:32px 25px}
          .gw-reg-main{padding:35px 28px}
          .gw-reg-aside h1{font-size:46px}
        }
        @media(max-width:650px){
          .gw-register{padding:15px 12px;align-items:flex-start}
          .gw-register:after{inset:6px}
          .gw-reg-shell{width:100%;grid-template-columns:1fr;min-height:0;margin:12px 0;border:1px solid var(--line)}
          .gw-reg-aside{min-height:0;padding:19px 20px 20px}
          .gw-reg-brand{width:180px;padding:8px}
          .gw-reg-aside-copy{margin:23px 0 14px}
          .gw-reg-aside h1{margin:9px 0 7px;font-size:34px}
          .gw-reg-aside-copy p{font-size:10px;max-width:100%}
          .gw-reg-benefits{grid-template-columns:1fr 1fr;gap:9px}
          .gw-reg-benefit{font-size:8px}
          .gw-reg-aside-foot{display:none}
          .gw-reg-aside:after{font-size:100px;bottom:18px}
          .gw-reg-main{padding:26px 20px 27px}
          .gw-reg-topline{margin-bottom:22px}
          .gw-reg-heading{margin-bottom:20px}
          .gw-reg-heading h2{font-size:34px}
        }
        @media(max-width:390px){
          .gw-reg-form{grid-template-columns:1fr;gap:13px}
          .gw-reg-field.full,.gw-reg-terms,.gw-reg-submit{grid-column:auto}
          .gw-reg-aside h1{font-size:30px}
          .gw-reg-main{padding:23px 16px}
          .gw-reg-detail-row{font-size:9px}
        }
        @media(prefers-reduced-motion:reduce){
          .gw-register *,.gw-register *:before,.gw-register *:after{transition-duration:.01ms!important;animation-duration:.01ms!important}
        }
      `}</style>

      <div className="gw-reg-shell">
        <aside className="gw-reg-aside">
          <div>
            <Link to="/" className="gw-reg-brand" aria-label="Global Wealth home">
              <img src="/global-wealth-logo.png" alt="Global Wealth"/>
            </Link>
            <div className="gw-reg-aside-copy">
              <div className="gw-reg-eyebrow">THE GLOBAL WEALTH EXPERIENCE</div>
              <h1>YOUR<br/>JOURNEY.<br/><span>YOUR WORLD.</span></h1>
              <p>Make your introduction to Global Wealth. Create your membership and explore the digital platform.</p>
            </div>
          </div>
          <div>
            <div className="gw-reg-benefits">
              <div className="gw-reg-benefit"><BadgeCheck size={15}/> Guided account setup</div>
              <div className="gw-reg-benefit"><Globe2 size={15}/> Global member access</div>
              <div className="gw-reg-benefit"><ShieldCheck size={15}/> Account awareness</div>
              <div className="gw-reg-benefit"><Sparkles size={15}/> A fresh experience</div>
            </div>
            <div className="gw-reg-aside-foot">Global Wealth · Strength · Vision · Progress</div>
          </div>
        </aside>

        <section className="gw-reg-main">
          <div className="gw-reg-topline">
            <Link to="/" className="gw-reg-back"><ArrowLeft size={14}/> Back to home</Link>
            <span className="gw-reg-step">MEMBER REGISTRATION · 01</span>
          </div>

          <div className="gw-reg-heading">
            <div className="gw-reg-kicker">CREATE YOUR ACCOUNT</div>
            <h2>Begin with the essentials.</h2>
            <p>Enter your details below to set up your Global Wealth membership.</p>
          </div>

          {error && (
            <div className="gw-reg-error" role="alert">
              <CircleAlert size={16} style={{flex:"none",marginTop:1}}/>
              <span>{error}</span>
            </div>
          )}

          <form className="gw-reg-form" onSubmit={handleSubmit}>
            <div className="gw-reg-field full">
              <label htmlFor="gw-sponsor">Sponsor ID *</label>
              <div className="gw-reg-input-wrap">
                <UserRound className="gw-reg-field-icon" size={16}/>
                <input id="gw-sponsor" className="gw-reg-input" type="text" name="sponsorId" value={formData.sponsorId} onChange={handleChange} placeholder="Enter sponsor ID" autoComplete="off" required/>
              </div>
              {checkingSponsor && <div className="gw-reg-sponsor-status pending"><LoaderCircle size={12} className="gw-spin"/> Checking sponsor details…</div>}
              {!checkingSponsor && sponsorIsValid && <div className="gw-reg-sponsor-status valid"><BadgeCheck size={12}/> Sponsor verified: {sponsorName}</div>}
              {!checkingSponsor && sponsorIsInvalid && <div className="gw-reg-sponsor-status invalid"><CircleAlert size={12}/> Invalid Sponsor ID</div>}
            </div>

            <div className="gw-reg-field">
              <label htmlFor="gw-name">Full name *</label>
              <div className="gw-reg-input-wrap">
                <UserRound className="gw-reg-field-icon" size={16}/>
                <input id="gw-name" className="gw-reg-input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" required/>
              </div>
            </div>

            <div className="gw-reg-field" ref={countryRef}>
              <label>Country *</label>
              <div className="gw-reg-input-wrap">
                <MapPin className="gw-reg-field-icon" size={16}/>
                <button type="button" className={`gw-reg-select-trigger ${!formData.country ? "placeholder" : ""}`} aria-expanded={showCountryDropdown} onClick={() => setShowCountryDropdown((v) => !v)}>
                  <span>{formData.country || "Choose country"}</span>
                  <ChevronDown size={15}/>
                </button>
              </div>
              {showCountryDropdown && (
                <div className="gw-reg-country-menu">
                  <input className="gw-reg-country-search" type="search" placeholder="Search country…" value={searchCountry} onChange={(e) => setSearchCountry(e.target.value)} autoFocus/>
                  <div className="gw-reg-country-list">
                    {filteredCountries.length ? filteredCountries.map((country) => (
                      <button className="gw-reg-country-option" type="button" key={country} aria-selected={formData.country === country} onClick={() => handleCountrySelect(country)}>{country}</button>
                    )) : <div className="gw-reg-country-empty">No country found</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="gw-reg-field">
              <label htmlFor="gw-email">Email address *</label>
              <div className="gw-reg-input-wrap">
                <Mail className="gw-reg-field-icon" size={16}/>
                <input id="gw-email" className="gw-reg-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" autoComplete="email" required/>
              </div>
            </div>

            <div className="gw-reg-field">
              <label htmlFor="gw-mobile">Mobile number *</label>
              <div className="gw-reg-input-wrap">
                <Phone className="gw-reg-field-icon" size={16}/>
                <input id="gw-mobile" className="gw-reg-input" type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter mobile number" autoComplete="tel" required/>
              </div>
            </div>

            <div className="gw-reg-field full">
              <label htmlFor="gw-wallet">USDT BEP-20 wallet address *</label>
              <div className="gw-reg-input-wrap">
                <Wallet className="gw-reg-field-icon" size={16}/>
                <input id="gw-wallet" className="gw-reg-input" type="text" name="walletAddress" value={formData.walletAddress} onChange={handleChange} placeholder="Enter your BEP-20 wallet address" autoComplete="off" required/>
              </div>
            </div>

            <div className="gw-reg-field full">
              <label htmlFor="gw-password">Create login password *</label>
              <div className="gw-reg-input-wrap">
                <KeyRound className="gw-reg-field-icon" size={16}/>
                <input id="gw-password" className="gw-reg-input password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Create a secure password" autoComplete="new-password" required/>
                <button className="gw-reg-eye" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
              </div>
            </div>

            <label className="gw-reg-terms">
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange}/>
              <span>I have read and agree to the terms of service and understand that digital-asset activities involve risk.</span>
            </label>

            <button className="gw-reg-submit" type="submit" disabled={loading || checkingSponsor || sponsorIsInvalid}>
              {loading ? <><LoaderCircle size={16} className="gw-spin"/> Creating account…</> : <>Create my account <ArrowRight size={16}/></>}
            </button>
          </form>

          <p className="gw-reg-login">Already a member? <Link to="/login">Sign in to your account</Link></p>
          <div className="gw-reg-security"><ShieldCheck size={13}/> Keep your login details private and secure</div>
        </section>
      </div>

      {showModal && modalData && (
        <div className="gw-reg-modal-backdrop" role="presentation">
          <div className="gw-reg-modal" role="dialog" aria-modal="true" aria-labelledby="gw-success-title">
            <button className="gw-reg-modal-close" type="button" aria-label="Close" onClick={() => navigate("/login")}><X size={17}/></button>
            <div className="gw-reg-success-icon"><Check size={29}/></div>
            <h3 id="gw-success-title">You're registered.</h3>
            <p className="gw-reg-modal-sub">Your Global Wealth account has been created successfully. Keep these account details somewhere safe.</p>
            <div className="gw-reg-details">
              <div className="gw-reg-detail-row"><span>Full name</span><strong>{modalData.name}</strong></div>
              <div className="gw-reg-detail-row"><span>User ID</span><strong>{modalData.userId}</strong></div>
              <div className="gw-reg-detail-row">
                <span>Login password</span>
                <strong className="gw-reg-secret">
                  {showModalPassword ? modalData.password : "••••••••"}
                 </strong>
              </div>
              <div className="gw-reg-detail-row"><span>Transaction password</span><strong>{modalData.trxPassword}</strong></div>
              <div className="gw-reg-detail-row"><span>Registration date</span><strong>{modalData.date}</strong></div>
              <div className="gw-reg-detail-row"><span>Email</span><strong>{modalData.email}</strong></div>
            </div>
            <button className="gw-reg-modal-login" type="button" onClick={() => navigate("/login")}>Continue to member login <ArrowRight size={15}/></button>
            <p className="gw-reg-modal-note">For your security, do not share your password or transaction credentials with anyone.</p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes gwSpin{to{transform:rotate(360deg)}}
        .gw-register .gw-spin{animation:gwSpin 1s linear infinite}
      `}</style>
    </div>
  );
};

export default Register;
