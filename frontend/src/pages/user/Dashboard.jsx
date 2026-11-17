// // // import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
// // // import api from "../../api/axios";
// // // import { useAuth } from "../../context/AuthContext";
// // // import { useNavigate } from "react-router-dom";

// // // import ReferralLink from "../../components/dashboard/ReferralLink";
// // // import QuickActions from "../../components/dashboard/QuickActions";
// // // import TotalEarningBox from "../../components/dashboard/TotalEarningBox";
// // // import LivePackageStatsBox from "../../components/dashboard/LivePackageStatsBox";
// // // import MonthlySalaryCard from "../../components/MonthlySalaryCard";
// // // import UserInfoBoxes from "../../components/dashboard/UserInfoBoxes";

// // // const Packages = lazy(() => import("../../components/Packages"));
// // // const UserPackages = lazy(() => import("../../pages/user/UserPackages"));
 
// // // const SectionLoader = ({ label = "Loading section" }) => (
// // //   <div className="flex min-h-[150px] w-full items-center justify-center gap-3 border border-white/[0.07] bg-[#0c1420] text-sm text-slate-400">
// // //     <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300/25 border-t-amber-300" />
// // //     {label}...
// // //   </div>
// // // );

// // // const DashboardSection = ({ eyebrow, title, children, className = "" }) => (
// // //   <section className={`overflow-hidden border border-white/[0.08] bg-[#0c1420] shadow-[0_18px_55px_rgba(0,0,0,0.18)] ${className}`}>
// // //     <div className="flex flex-col gap-1 border-b border-white/[0.07] px-4 py-4 sm:px-5">
// // //       <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-amber-300">{eyebrow}</p>
// // //       <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
// // //     </div>
// // //     <div className="p-3 sm:p-5">{children}</div>
// // //   </section>
// // // );

// // // const Dashboard = ({ modalState, setModalState }) => {
// // //   const { user, token, setUser, logout } = useAuth();
// // //   const navigate = useNavigate();

// // //   const [loading, setLoading] = useState(false);
// // //   const hasFetched = useRef(false);
// // //   const [stats, setStats] = useState({
// // //     totalGrandInvestment: 0,
// // //     todayTotalInvestment: 0,
// // //     isFetching: true,
// // //   });

// // //   const fetchUserData = async () => {
// // //     if (!token || !user?.userId) return;
// // //     try {
// // //       const userRes = await api.get(
// // //         `/user/${user.userId}?t=${new Date().getTime()}`,
// // //         { headers: { Authorization: `Bearer ${token}` } }
// // //       );
// // //       const fetchedUser = userRes.data.user;
// // //       if (fetchedUser) {
// // //         setUser(fetchedUser);
// // //         localStorage.setItem(`dash_user_${user.userId}`, JSON.stringify(fetchedUser));
// // //       }
// // //     } catch (err) {
// // //       if (err?.response?.status === 401) logout();
// // //       else console.error("Dashboard user refresh failed:", err);
// // //     }
// // //   };

// // //   const fetchStats = async () => {
// // //     if (!token) return;
// // //     try {
// // //       const res = await api.get(
// // //         `/transactions/deposits/live-feed?t=${new Date().getTime()}`,
// // //         { headers: { Authorization: `Bearer ${token}` } }
// // //       );
// // //       if (res.data.stats) {
// // //         const newStats = {
// // //           totalGrandInvestment: Number(res.data.stats.totalGrandInvestment) || 0,
// // //           todayTotalInvestment: Number(res.data.stats.todayTotalInvestment) || 0,
// // //           isFetching: false,
// // //         };
// // //         setStats(newStats);
// // //         localStorage.setItem("dash_stats", JSON.stringify(newStats));
// // //       } else {
// // //         setStats((prev) => ({ ...prev, isFetching: false }));
// // //       }
// // //     } catch (err) {
// // //       setStats((prev) => ({ ...prev, isFetching: false }));
// // //       console.error("Dashboard investment stats failed:", err);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (user?.userId) hasFetched.current = false;
// // //   }, [user?.userId]);

// // //   useEffect(() => {
// // //     if (!hasFetched.current && token && user?.userId) {
// // //       hasFetched.current = true;

// // //       const cachedUser = localStorage.getItem(`dash_user_${user.userId}`);
// // //       const cachedStats = localStorage.getItem("dash_stats");

// // //       if (cachedUser) {
// // //         try {
// // //           setUser(JSON.parse(cachedUser));
// // //         } catch (error) {
// // //           console.error("Dashboard user cache error:", error);
// // //         }
// // //       }
// // //       if (cachedStats) {
// // //         try {
// // //           setStats(JSON.parse(cachedStats));
// // //         } catch (error) {
// // //           console.error("Dashboard stats cache error:", error);
// // //         }
// // //       }

// // //       if (!cachedUser) setLoading(true);

// // //       Promise.all([fetchUserData(), fetchStats()]).finally(() => {
// // //         setLoading(false);
// // //       });
// // //     }
// // //     // Intentionally fetch once per authenticated user/session.
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [user?.userId, token]);

// // //   if (loading || !user) {
// // //     return (
// // //       <div className="flex min-h-[70vh] w-full items-center justify-center bg-[#080c13]">
// // //         <div className="text-center">
// // //           <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-amber-300/20 border-t-amber-300" />
// // //           <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
// // //             Preparing your dashboard
// // //           </p>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   const referralLink = `${window.location.origin}/register?ref=${user.userId}`;
// // //   const totalInvestment = 200000 + (Number(stats.totalGrandInvestment) || 0);
// // //   const todayInvestment = Number(stats.todayTotalInvestment) || 0;

// // //   return (
// // //     <main className="relative min-h-screen w-full overflow-hidden bg-[#080c13] px-3 pb-28 pt-5 font-sans text-white sm:px-5 md:pb-10 lg:px-8">
// // //       <div className="pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full bg-amber-300/[0.055] blur-[110px]" />
// // //       <div className="pointer-events-none absolute -left-48 top-[620px] h-[420px] w-[420px] rounded-full bg-cyan-300/[0.035] blur-[110px]" />

// // //       <div className="relative mx-auto max-w-[1440px] space-y-7">
// // //         {/* Dashboard masthead */}
// // //         <header className="relative overflow-hidden border border-white/[0.08] bg-gradient-to-br from-[#121b29] via-[#0d1420] to-[#0a1019] p-5 sm:p-7 lg:p-9">
// // //           <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(234,179,8,0.12),transparent_65%)]" />
// // //           <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
// // //             <div className="min-w-0">
// // //               <p className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.34em] text-amber-300">
// // //                 <span className="h-px w-8 bg-amber-300" />
// // //                 Global Wealth · Member Overview
// // //               </p>
// // //               <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
// // //                 Welcome back<span className="text-amber-300">.</span>
// // //               </h1>
// // //               <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
// // //                 Your investment activity, earnings and account shortcuts are gathered in one place.
// // //               </p>
// // //               <div className="mt-5 flex flex-wrap items-center gap-2">
// // //                 <span className="border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300">
// // //                   Account active
// // //                 </span>
// // //                 <span className="border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-slate-400">
// // //                   ID · {user.userId}
// // //                 </span>
// // //               </div>
// // //             </div>
// // //             <div className="relative grid grid-cols-2 gap-3 lg:min-w-[390px]">
// // //               <button
// // //                 type="button"
// // //                 onClick={() => navigate("/system-live-feed")}
// // //                 className="group relative overflow-hidden border border-amber-300/35 bg-amber-300 px-4 py-5 text-left transition hover:bg-amber-200"
// // //               >
// // //                 <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#57400b]">Total investment</span>
// // //                 <span className="mt-2 block break-all text-xl font-black tracking-tight text-[#17130a] sm:text-2xl">
// // //                   {stats.isFetching && !stats.totalGrandInvestment ? "..." : `$${totalInvestment.toFixed(2)}`}
// // //                 </span>
// // //                 <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-[#57400b]">View live feed ↗</span>
// // //               </button>
// // //               <button
// // //                 type="button"
// // //                 onClick={() => navigate("/system-live-feed")}
// // //                 className="border border-white/10 bg-[#080e17]/80 px-4 py-5 text-left transition hover:border-amber-300/35"
// // //               >
// // //                 <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Today's investment</span>
// // //                 <span className="mt-2 block break-all text-xl font-bold tracking-tight text-white sm:text-2xl">
// // //                   {stats.isFetching && !todayInvestment ? "..." : `$${todayInvestment.toFixed(2)}`}
// // //                 </span>
// // //                 <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Updated live ↗</span>
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </header>

// // //         {/* User identity / profile information */}
// // //         <section className="border-b border-white/[0.08] pb-2">
// // //           <div className="mb-3 flex items-end justify-between gap-3">
// // //             <div>
// // //               <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300">Member profile</p>
// // //               <h2 className="mt-1 text-lg font-semibold text-white">Account snapshot</h2>
// // //             </div>
// // //           </div>
// // //           <UserInfoBoxes />
// // //         </section>

// // //         {/* Earnings and package metrics */}
// // //         <section className="space-y-3">
// // //           <div className="flex items-end justify-between">
// // //             <div>
// // //               <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300">Performance</p>
// // //               <h2 className="mt-1 text-xl font-semibold">Earnings & package overview</h2>
// // //             </div>
// // //           </div>
// // //           <div className="grid gap-4 xl:grid-cols-2">
// // //             <div className="min-w-0"><TotalEarningBox user={user} /></div>
// // //             <div className="min-w-0"><LivePackageStatsBox user={user} /></div>
// // //           </div>
// // //           <div className="min-w-0">
// // //             <MonthlySalaryCard userId={user.userId} />
// // //           </div>
// // //         </section>

// // //         {/* Referral and quick action area — split editorial composition */}
// // //         <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
// // //           <div className="min-w-0 border border-white/[0.08] bg-[#0c1420] p-4 sm:p-5">
// // //             <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300">Grow your network</p>
// // //             <ReferralLink link={referralLink} />
// // //           </div>
// // //           <div className="min-w-0 border border-white/[0.08] bg-[#0c1420] p-4 sm:p-5">
// // //             <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300">Account shortcuts</p>
// // //             <QuickActions
// // //               onDepositClick={() => {
// // //                 if (setModalState) {
// // //                   setModalState((prev) => ({ ...prev, showDeposit: true }));
// // //                 }
// // //               }}
// // //             />
// // //           </div>
// // //         </section>

// // //         {/* Investment package catalogue */}
// // //         <DashboardSection eyebrow="Explore opportunities" title="Investment packages">
// // //           <Suspense fallback={<SectionLoader label="Loading investment packages" />}>
// // //             <Packages />
// // //           </Suspense>
// // //         </DashboardSection>

// // //         {/* User's own packages */}
// // //         <DashboardSection eyebrow="Your portfolio" title="Active & purchased packages">
// // //           <Suspense fallback={<SectionLoader label="Loading your packages" />}>
// // //             <UserPackages />
// // //           </Suspense>
// // //         </DashboardSection>

       

      

    
// // //       </div>
// // //     </main>
// // //   );
// // // };

// // // export default Dashboard;


// // import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
// // import api from "../../api/axios";
// // import { useAuth } from "../../context/AuthContext";
// // import { useNavigate } from "react-router-dom";

// // import ReferralLink from "../../components/dashboard/ReferralLink";
// // import QuickActions from "../../components/dashboard/QuickActions";
// // import TotalEarningBox from "../../components/dashboard/TotalEarningBox";
// // import LivePackageStatsBox from "../../components/dashboard/LivePackageStatsBox";
// // import MonthlySalaryCard from "../../components/MonthlySalaryCard";
// // import UserInfoBoxes from "../../components/dashboard/UserInfoBoxes";

// // const Packages = lazy(() => import("../../components/Packages"));
// // const UserPackages = lazy(() => import("../../pages/user/UserPackages"));

// // const SectionLoader = ({ label = "Loading" }) => (
// //   <div className="flex min-h-[92px] items-center justify-center gap-2 border-y border-[#b99348]/20 text-xs text-[#b8aa8c]">
// //     <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#b99348]/30 border-t-[#e4c477]" />
// //     {label}...
// //   </div>
// // );

// // const SectionHeading = ({ kicker, title, action }) => (
// //   <div className="mb-3 flex items-end justify-between gap-3 border-b border-[#b99348]/20 pb-2">
// //     <div>
// //       <p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#c4a35d]">{kicker}</p>
// //       <h2 className="mt-1 font-serif text-lg font-bold text-[#f3e4c0] sm:text-xl">{title}</h2>
// //     </div>
// //     {action}
// //   </div>
// // );

// // const Dashboard = ({ modalState, setModalState }) => {
// //   const { user, token, setUser, logout } = useAuth();
// //   const navigate = useNavigate();

// //   const [loading, setLoading] = useState(false);
// //   const hasFetched = useRef(false);
// //   const [stats, setStats] = useState({
// //     totalGrandInvestment: 0,
// //     todayTotalInvestment: 0,
// //     isFetching: true,
// //   });

// //   const fetchUserData = async () => {
// //     if (!token || !user?.userId) return;
// //     try {
// //       const userRes = await api.get(
// //         `/user/${user.userId}?t=${new Date().getTime()}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       const fetchedUser = userRes.data.user;
// //       if (fetchedUser) {
// //         setUser(fetchedUser);
// //         localStorage.setItem(`dash_user_${user.userId}`, JSON.stringify(fetchedUser));
// //       }
// //     } catch (err) {
// //       if (err?.response?.status === 401) logout();
// //       else console.error("Dashboard user refresh failed:", err);
// //     }
// //   };

// //   const fetchStats = async () => {
// //     if (!token) return;
// //     try {
// //       const res = await api.get(
// //         `/transactions/deposits/live-feed?t=${new Date().getTime()}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       if (res.data.stats) {
// //         const newStats = {
// //           totalGrandInvestment: Number(res.data.stats.totalGrandInvestment) || 0,
// //           todayTotalInvestment: Number(res.data.stats.todayTotalInvestment) || 0,
// //           isFetching: false,
// //         };
// //         setStats(newStats);
// //         localStorage.setItem("dash_stats", JSON.stringify(newStats));
// //       } else {
// //         setStats((prev) => ({ ...prev, isFetching: false }));
// //       }
// //     } catch (err) {
// //       setStats((prev) => ({ ...prev, isFetching: false }));
// //       console.error("Dashboard investment stats failed:", err);
// //     }
// //   };

// //   useEffect(() => {
// //     if (user?.userId) hasFetched.current = false;
// //   }, [user?.userId]);

// //   useEffect(() => {
// //     if (!hasFetched.current && token && user?.userId) {
// //       hasFetched.current = true;
// //       const cachedUser = localStorage.getItem(`dash_user_${user.userId}`);
// //       const cachedStats = localStorage.getItem("dash_stats");

// //       if (cachedUser) {
// //         try {
// //           setUser(JSON.parse(cachedUser));
// //         } catch (error) {
// //           console.error("Dashboard user cache error:", error);
// //         }
// //       }
// //       if (cachedStats) {
// //         try {
// //           setStats(JSON.parse(cachedStats));
// //         } catch (error) {
// //           console.error("Dashboard stats cache error:", error);
// //         }
// //       }
// //       if (!cachedUser) setLoading(true);
// //       Promise.all([fetchUserData(), fetchStats()]).finally(() => setLoading(false));
// //     }
// //     // Intentionally fetch once per authenticated user/session.
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [user?.userId, token]);

// //   if (loading || !user) {
// //     return (
// //       <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#050505]">
// //         <div className="text-center">
// //           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#c6a45e]/20 border-t-[#e7c879]" />
// //           <p className="mt-3 text-[9px] font-bold uppercase tracking-[.25em] text-[#b69a5b]">Preparing dashboard</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const referralLink = `${window.location.origin}/register?ref=${user.userId}`;
// //   const totalInvestment = 200000 + (Number(stats.totalGrandInvestment) || 0);
// //   const todayInvestment = Number(stats.todayTotalInvestment) || 0;
// //   const money = (value) => `$${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// //   return (
// //     <main className="relative min-h-screen w-full overflow-hidden bg-[#050505] px-3 pb-24 pt-3 font-sans text-white sm:px-5 sm:pt-5 md:pb-10 lg:px-8">
// //       <div className="pointer-events-none absolute -right-36 top-0 h-80 w-80 rounded-full bg-[#c69e4e]/[.08] blur-[100px]" />
// //       <div className="pointer-events-none absolute left-[-180px] top-[520px] h-80 w-80 rounded-full bg-[#9c762f]/[.05] blur-[100px]" />

// //       <div className="relative mx-auto max-w-[1440px] space-y-5 sm:space-y-7">
// //         {/* Compact luxury welcome strip */}
// //         <header className="relative overflow-hidden border border-[#b99348]/35 bg-[radial-gradient(ellipse_at_90%_0%,rgba(190,148,65,.16),transparent_45%),linear-gradient(120deg,#17140d,#090909_58%,#11100c)] px-4 py-4 sm:px-6 sm:py-6">
// //           <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-[#c5a45e]/10" />
// //           <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
// //             <div className="min-w-0">
// //               <p className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[.28em] text-[#c6a45e] sm:text-[9px]">
// //                 <span className="h-px w-5 bg-[#c6a45e]" /> GLOBAL WEALTH / MEMBER DASHBOARD
// //               </p>
// //               <h1 className="mt-2 font-serif text-[27px] font-bold leading-tight text-[#f4e6c6] sm:text-4xl">
// //                 Welcome back<span className="text-[#cba75e]">, {user.name || "Member"}.</span>
// //               </h1>
// //               <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px]">
// //                 <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[.07] px-2.5 py-1 font-bold uppercase tracking-wider text-emerald-300">
// //                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Account active
// //                 </span>
// //                 <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[#b9ad95]">ID · {user.userId}</span>
// //               </div>
// //             </div>
            
// //           </div>
// //         </header>
 

// //         {/* Earnings widgets */}
// //         <section>
// //           <SectionHeading kicker="Financial snapshot" title="Earnings & packages" />
// //           <div className="grid min-w-0 gap-3 xl:grid-cols-2">
// //             <div className="min-w-0 overflow-hidden border-y border-[#b99348]/25 bg-gradient-to-r from-[#17140e] to-[#0a0a09] p-2 sm:p-3">
// //               <TotalEarningBox user={user} />
// //             </div>
// //             <div className="min-w-0 overflow-hidden border-y border-[#b99348]/25 bg-gradient-to-r from-[#11100d] to-[#090909] p-2 sm:p-3">
// //               <LivePackageStatsBox user={user} />
// //             </div>
// //           </div>
        
// //         </section>

// //         {/* Referral + actions in a slim two-column utility rail */}
// //         <section className="grid min-w-0 gap-3 xl:grid-cols-[1.05fr_.95fr]">
// //           <div className="min-w-0 border-l-2 border-[#c4a15b] bg-gradient-to-r from-[#17130b] to-transparent px-3 py-3 sm:px-4">
// //             <p className="mb-2 text-[8px] font-black uppercase tracking-[.24em] text-[#c6a45e]">Referral network</p>
// //             <ReferralLink link={referralLink} />
// //           </div>
// //           <div className="min-w-0 border-l-2 border-[#806536] bg-gradient-to-r from-[#12100b] to-transparent px-3 py-3 sm:px-4">
// //             <p className="mb-2 text-[8px] font-black uppercase tracking-[.24em] text-[#c6a45e]">Quick access</p>
// //             <QuickActions onDepositClick={() => {
// //               if (setModalState) setModalState((prev) => ({ ...prev, showDeposit: true }));
// //             }} />
// //           </div>
// //         </section>

// //         {/* Catalogue and personal holdings */}
// //         <section>
// //           <SectionHeading kicker="Discover" title="Investment packages" />
// //           <Suspense fallback={<SectionLoader label="Loading packages" />}>
// //             <Packages />
// //           </Suspense>
// //         </section>

// //         <section>
// //           <SectionHeading kicker="Your holdings" title="Active & purchased packages" />
// //           <Suspense fallback={<SectionLoader label="Loading your portfolio" />}>
// //             <UserPackages />
// //           </Suspense>
// //         </section>
// //       </div>
// //     </main>
// //   );
// // };

// // export default Dashboard;


// import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
// import api from "../../api/axios";
// import { useAuth } from "../../context/AuthContext";

// import ReferralLink from "../../components/dashboard/ReferralLink";
// import QuickActions from "../../components/dashboard/QuickActions";
// import TotalEarningBox from "../../components/dashboard/TotalEarningBox";
// import LivePackageStatsBox from "../../components/dashboard/LivePackageStatsBox";

// const Packages = lazy(() => import("../../components/Packages"));
// const UserPackages = lazy(() => import("../../pages/user/UserPackages"));

// const SectionLoader = ({ label = "Loading" }) => (
//   <div className="flex min-h-[88px] items-center justify-center gap-2 text-xs text-[#b8aa8c]">
//     <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#b99348]/30 border-t-[#e4c477]" />
//     <span>{label}</span>
//   </div>
// );

// const Dashboard = ({ setModalState }) => {
//   const { user, token, setUser, logout } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const hasFetched = useRef(false);

//   const fetchUserData = async () => {
//     if (!token || !user?.userId) return;

//     try {
//       const userRes = await api.get(
//         `/user/${encodeURIComponent(user.userId)}?t=${Date.now()}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const fetchedUser = userRes.data?.user;
//       if (fetchedUser) {
//         setUser(fetchedUser);
//         localStorage.setItem(
//           `dash_user_${user.userId}`,
//           JSON.stringify(fetchedUser)
//         );
//       }
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         logout();
//       } else {
//         console.error("Dashboard user refresh failed:", err);
//       }
//     }
//   };

//   useEffect(() => {
//     hasFetched.current = false;
//   }, [user?.userId]);

//   useEffect(() => {
//     if (hasFetched.current || !token || !user?.userId) return;

//     hasFetched.current = true;
//     const cachedUser = localStorage.getItem(`dash_user_${user.userId}`);

//     if (cachedUser) {
//       try {
//         const parsedUser = JSON.parse(cachedUser);
//         if (parsedUser) setUser(parsedUser);
//       } catch (error) {
//         console.error("Dashboard user cache error:", error);
//       }
//     } else {
//       setLoading(true);
//     }

//     fetchUserData().finally(() => setLoading(false));
//     // Fetch the profile once for each authenticated user.
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.userId, token]);

//   if (loading || !user) {
//     return (
//       <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#050505]">
//         <div className="text-center">
//           <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#c6a45e]/20 border-t-[#e7c879]" />
//           <p className="mt-3 text-[9px] font-bold uppercase tracking-[.2em] text-[#b69a5b]">
//             Loading your account
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const referralLink = `${window.location.origin}/register?ref=${encodeURIComponent(user.userId)}`;

//   return (
//     <main className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 pb-28 pt-4 font-sans text-white sm:px-5 sm:pb-10 sm:pt-6 lg:px-8">
//       <div className="pointer-events-none absolute -right-40 -top-32 h-[420px] w-[420px] rounded-full bg-[#b88d3d]/[.07] blur-[110px]" />
//       <div className="pointer-events-none absolute -left-40 top-[650px] h-[360px] w-[360px] rounded-full bg-[#8b6b32]/[.05] blur-[100px]" />

//       <div className="relative mx-auto max-w-[1440px]">
//         {/* Welcome area */}
//         <header className="relative mb-7 overflow-hidden border-b border-[#b99348]/35 pb-5 sm:mb-9 sm:pb-7">
//           <div className="absolute right-0 top-0 hidden select-none font-serif text-[100px] font-bold leading-none text-[#d4b46d]/[.035] md:block">
//             GW
//           </div>

//           <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//             <div className="min-w-0">
//               <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.26em] text-[#c6a45e]">
//                 <span className="h-px w-7 bg-[#c6a45e]" />
//                 Global Wealth
//               </div>
//               <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#f4e7c9] sm:text-4xl lg:text-5xl">
//                 Welcome, <span className="text-[#c9a45b]">{user.name || "Member"}</span>
//               </h1>
//               <p className="mt-2 text-xs text-[#8f8879] sm:text-sm">
//                 Your account at a glance.
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-2 sm:justify-end">
//               <span className="inline-flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/[.06] px-3 py-2 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-300">
//                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
//                 Active
//               </span>
//               <span className="border border-white/10 bg-white/[.025] px-3 py-2 font-mono text-[10px] text-[#c9bea7]">
//                 ID: {user.userId}
//               </span>
//             </div>
//           </div>
//         </header>

//         {/* Main account figures */}
//         <section className="mb-8 sm:mb-10">
//           <div className="mb-4 flex items-center justify-between gap-3">
//             <h2 className="font-serif text-xl text-[#f0dfb9] sm:text-2xl">
//               Your overview
//             </h2>
//             <span className="text-[9px] uppercase tracking-[.18em] text-[#82765f]">
//               Account summary
//             </span>
//           </div>

//           <div className="grid min-w-0 gap-4 xl:grid-cols-2">
//             <div className="min-w-0 border border-[#b99348]/25 bg-[linear-gradient(135deg,rgba(36,29,17,.72),rgba(12,12,11,.94)_65%)] p-3 sm:p-4">
//               <TotalEarningBox user={user} />
//             </div>
//             <div className="min-w-0 border border-white/[.09] bg-[linear-gradient(135deg,rgba(25,24,20,.88),rgba(11,11,10,.96)_70%)] p-3 sm:p-4">
//               <LivePackageStatsBox user={user} />
//             </div>
//           </div>
//         </section>

//         {/* Referral and actions: compact utility strip */}
//         <section className="mb-9 grid min-w-0 gap-5 border-y border-white/[.09] py-5 lg:grid-cols-[1.1fr_.9fr] lg:gap-8">
//           <div className="min-w-0">
//             <div className="mb-3 flex items-center gap-2">
//               <span className="h-5 w-[2px] bg-[#c6a45e]" />
//               <h2 className="text-xs font-bold uppercase tracking-[.17em] text-[#d8c69e]">
//                 Invite & refer
//               </h2>
//             </div>
//             <ReferralLink link={referralLink} />
//           </div>

//           <div >
           
//             <QuickActions
//               onDepositClick={() => {
//                 if (setModalState) {
//                   setModalState((prev) => ({ ...prev, showDeposit: true }));
//                 }
//               }}
//             />
//           </div>
//         </section>

//         {/* Package catalogue */}
//         <section className="mb-10 sm:mb-12">
//           <div className="mb-4 flex flex-col gap-1 border-l-2 border-[#c6a45e] pl-3 sm:flex-row sm:items-end sm:justify-between">
//             <h2 className="font-serif text-2xl text-[#f0dfb9] sm:text-3xl">
//               Explore packages
//             </h2>
//             <p className="text-[10px] text-[#817967]">
//               Browse available investment plans
//             </p>
//           </div>
//           <Suspense fallback={<SectionLoader label="Loading available packages" />}>
//             <Packages />
//           </Suspense>
//         </section>

//         {/* Member holdings */}
//         <section>
//           <div className="mb-4 flex flex-col gap-1 border-l-2 border-[#806536] pl-3 sm:flex-row sm:items-end sm:justify-between">
//             <h2 className="font-serif text-2xl text-[#f0dfb9] sm:text-3xl">
//               My portfolio
//             </h2>
//             <p className="text-[10px] text-[#817967]">
//               Your purchased and active packages
//             </p>
//           </div>
//           <Suspense fallback={<SectionLoader label="Loading your portfolio" />}>
//             <UserPackages />
//           </Suspense>
//         </section>
//       </div>
//     </main>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

import ReferralLink from "../../components/dashboard/ReferralLink";
import QuickActions from "../../components/dashboard/QuickActions";
import TotalEarningBox from "../../components/dashboard/TotalEarningBox";
import LivePackageStatsBox from "../../components/dashboard/LivePackageStatsBox";

const Packages = lazy(() => import("../../components/Packages"));
const UserPackages = lazy(() => import("../../pages/user/UserPackages"));

const SectionLoader = ({ label = "Loading" }) => (
  <div className="flex min-h-[56px] items-center justify-center gap-2 text-[11px] text-[#b8aa8c]">
    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#b99348]/30 border-t-[#e4c477]" />
    {label}
  </div>
);

const Dashboard = ({ setModalState }) => {
  const { user, token, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchUserData = async () => {
    if (!token || !user?.userId) return;

    try {
      const response = await api.get(
        `/user/${encodeURIComponent(user.userId)}?t=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const freshUser = response.data?.user;
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem(`dash_user_${user.userId}`, JSON.stringify(freshUser));
      }
    } catch (error) {
      if (error?.response?.status === 401) logout();
      else console.error("Dashboard user refresh failed:", error);
    }
  };

  useEffect(() => {
    hasFetched.current = false;
  }, [user?.userId]);

  useEffect(() => {
    if (hasFetched.current || !token || !user?.userId) return;

    hasFetched.current = true;
    const cached = localStorage.getItem(`dash_user_${user.userId}`);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) setUser(parsed);
      } catch (error) {
        console.error("Dashboard user cache error:", error);
      }
    } else {
      setLoading(true);
    }

    fetchUserData().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, token]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[45vh] w-full items-center justify-center bg-[#070707]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c6a45e]/20 border-t-[#e7c879]" />
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[.16em] text-[#b69a5b]">
            Loading account
          </p>
        </div>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/register?ref=${encodeURIComponent(user.userId)}`;

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#070707] px-3 pb-24 pt-3 font-sans text-white sm:px-5 sm:pb-8 sm:pt-4 lg:px-8">
      <div className="pointer-events-none absolute -right-40 -top-32 h-[360px] w-[360px] rounded-full bg-[#b88d3d]/[.06] blur-[100px]" />

      <div className="relative mx-auto max-w-[1440px] space-y-5 sm:space-y-6">
        {/* Compact member header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b99348]/25 pb-3">
          {/* <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[.2em] text-[#c6a45e]">
              Global Wealth
            </p>
            <h1 className="mt-1 truncate font-serif text-2xl font-semibold text-[#f4e7c9] sm:text-3xl">
              Welcome, <span className="text-[#c9a45b]">{user.name || "Member"}</span>
            </h1>
          </div> */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 border border-emerald-500/20 px-2.5 py-1.5 text-[9px] font-bold uppercase text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
            <span className="border border-white/10 px-2.5 py-1.5 font-mono text-[10px] text-[#c9bea7]">
              {user.userId}
            </span>
          </div>
        </header>

        {/* Account figures */}
        <section className="grid min-w-0 gap-3 xl:grid-cols-2">
          <div className="min-w-0 overflow-hidden border border-[#b99348]/20 bg-[linear-gradient(135deg,rgba(36,29,17,.62),rgba(12,12,11,.94)_65%)] p-2.5 sm:p-3">
            <TotalEarningBox user={user} />
          </div>
          <div className="min-w-0 overflow-hidden border border-white/[.08] bg-[linear-gradient(135deg,rgba(25,24,20,.75),rgba(11,11,10,.96)_70%)] p-2.5 sm:p-3">
            <LivePackageStatsBox user={user} />
          </div>
        </section>

        {/* Referral only. QuickActions remains a separate dock and cannot stretch this row. */}
        <section className="min-w-0 border-y border-[#b99348]/20 py-3">
          <ReferralLink link={referralLink} />
        </section>

        <div className="h-0">
          <QuickActions
            onDepositClick={() => {
              if (setModalState) {
                setModalState((prev) => ({ ...prev, showDeposit: true }));
              }
            }}
          />
        </div>

        {/* Package catalogue */}
        <section className="min-w-0">
          <Suspense fallback={<SectionLoader label="Loading packages" />}>
            <Packages />
          </Suspense>
        </section>

        {/* Member packages
        <section className="min-w-0">
          <Suspense fallback={<SectionLoader label="Loading portfolio" />}>
            <UserPackages />
          </Suspense>
        </section> */}
      </div>
    </main>
  );
};

export default Dashboard;
