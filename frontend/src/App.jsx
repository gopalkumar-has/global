 
 
// import React, { useEffect, useState, Suspense, lazy } from 'react'; // 👈 NAYA: Suspense aur lazy add kiya
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
// } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from './api/axios.js'; 
// import { AuthProvider, useAuth } from './context/AuthContext.jsx';
// import RequireUserAuth from './components/RequireUserAuth.jsx';
// import RequireAdminAuth from './components/RequireAdminAuth.jsx';

// // 🔹 Public Pages
// import Home from './pages/auth/Home.jsx';
// import Login from './pages/auth/Login.jsx';
// import Register from './pages/auth/Register.jsx';
// import MaintenancePage from './pages/error/MaintenancePage.jsx';
// import ForgotPassword from './pages/auth/ForgotPassword.jsx';
// import ResetPassword from './pages/auth/ResetPassword.jsx'; 

// // 🔹 User Pages (Normal Imports)
// import Dashboard from './pages/user/Dashboard.jsx';
// import UserProfile from './pages/user/UserProfile.jsx';
// import FAQPage from './pages/user/FAQPage.jsx';
// import UserWithdrawalHistory from './pages/user/UserWithdrawalHistory.jsx';
// import WalletHistory from './pages/user/WalletHistory.jsx';
// import AllTeamPage from './pages/user/AllTeamPage.jsx';
// import DirectTeamPage from './pages/user/DirectTeamPage.jsx';
// import DirectIncome from './pages/user/DirectIncome.jsx';
//  import LevelIncome from './pages/user/LevelIncome.jsx';
//   import DailyROIIncome from './components/dashboard/DailyROI.jsx';
// import MyTransfers from './pages/user/MyTransfers.jsx';
// import DepositHistory from "./pages/user/DepositHistory.jsx";
// import TopupDetails from "./pages/user/TopupDetails.jsx";
// import CommunityEarning from './pages/user/CommunityEarning';
// import Support from "./pages/user/Support.jsx";
// import TransactionDetails from './pages/user/TransactionDetails.jsx';
// import DownlineBusiness from './pages/user/DownlineBusiness.jsx';
// import CreditToWallet from './pages/user/CreditToWallet.jsx';
// import Notifications from "./pages/user/Notifications.jsx";
// import UserLayout from "./components/layout/UserLayout.jsx";
// import RoiIncome from './pages/user/RoiIncome';
// import GlobalTeam from './pages/user/GlobalTeam';


// // 🔥 NAYA: Vite Warning hatane ke liye inko Lazy Load kar diya (Static Import hata diya)
// const UserPackages = lazy(() => import('./pages/user/UserPackages.jsx'));
//  const UserCompoundPackages = lazy(() => import('./pages/user/UserCompoundPackages.jsx'));
 
// // 🔹 Admin Pages
// import AdminLogin from './pages/admin/AdminLogin.jsx';
// import AdminLayout from './pages/admin/AdminLayout.jsx';
// import AdminDashboard from './pages/admin/Admin.jsx';
// import UserListTable from './pages/admin/UserListTable.jsx';
// import DepositTable from './pages/admin/DepositTable.jsx';
// import AdminTransactions from './pages/admin/AdminTransactions.jsx';
// import TotalTopUpPage from './pages/admin/TotalTopUpPage.jsx';
// import HighestActivePackagesPage from './pages/admin/HighestActivePackagesPage.jsx';
// import SystemIncomeReport from "./pages/admin/SystemIncomeReport";
// import TotalAutoCompoundPage from "./pages/admin/TotalAutoCompoundPage";
// import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
// import RequestWithdrawalPage from './pages/admin/RequestWithdrawalPage.jsx';
// import AllWithdrawalsPage from './pages/admin/AllWithdrawalsPage.jsx';
// import DirectIncomePage from './pages/admin/DirectIncomePage.jsx';
// import LevelIncomePage from './pages/admin/LevelIncomePage.jsx';
// import WalletSummaryPage from './pages/admin/WalletSummaryPage.jsx';
//  import UserFundOverview from './pages/admin/UserFundOverview.jsx';
// import CreditToWalletPage from './pages/admin/CreditToWallet.jsx';
// import BlockedUsers from "./pages/admin/BlockedUsers.jsx";
// import ReverseTransaction from './pages/admin/ReverseTransaction.jsx';
// import AddUser from './pages/admin/AddUser.jsx';
// import AdminNotifications from './pages/admin/AdminCreateNotification.jsx';
// import AdminSupport from "./pages/admin/AdminSupport.jsx";
// import ManualDeposit from './pages/admin/ManualDeposit.jsx';
//  import AdminLoginStats from './pages/admin/AdminLoginStats.jsx'; 
// import AdminSecurity from './pages/admin/AdminSecurity.jsx'; 
// import DeviceManager from './pages/admin/DeviceManager.jsx';
//  import AdminManageUsers from './pages/admin/AdminManageUsers.jsx';
// import MonthlyRewardReport from './pages/admin/MonthlyRewardReport.jsx';
// import MonthlySalaryClaims from './pages/admin/MonthlySalaryClaims.jsx';
// import SalaryCronPredictor from './pages/admin/SalaryCronPredictor.jsx';
// import WalletDirectStats from './pages/admin/WalletDirectStats'; 
//  import UserDirectsReport from './pages/admin/UserDirectsReport';
// import UserLifetimeTxReport from './pages/admin/UserLifetimeTxReport';
// import LeaderAutoWithdraw from './pages/admin/LeaderAutoWithdraw';
// import DepositAddressMonitor from './pages/admin/DepositAddressMonitor';
// import IndiaBoostControl from './pages/admin/IndiaBoostControl';
//  import UserLevelReport from './pages/admin/UserLevelReport';
// import ChangeSponsor from './pages/admin/ChangeSponsor';
// import WalletUpdateHistory from './pages/admin/WalletUpdateHistory';

// // 📜 Scroll Restoration
// const ScrollToTop = () => {
//   const { pathname } = useLocation();
//   useEffect(() => {
//       window.scrollTo(0, 0); 
//   }, [pathname]);
//   return null;
// };

// // ⏳ Fallback Loader for Suspense
// const PageLoader = () => (
//   <div className="h-screen w-full flex justify-center items-center bg-slate-50">
//     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
//   </div>
// );

// function AppContent() {
//   const location = useLocation();
//   const path = location.pathname;
//   const [maintenance, setMaintenance] = useState(false);
//   const [checked, setChecked] = useState(false);
//   const [whitelist, setWhitelist] = useState([]);

//   const isAdmin = !!localStorage.getItem('adminToken');
//   const hostname = window.location.hostname;
//   const isGoodSubdomain = hostname.startsWith('pure.');

//   useEffect(() => {
//     setMaintenance(false);
//     setWhitelist([]);
//     setChecked(true);
//   }, []);

//   const currentUserId = JSON.parse(localStorage.getItem('user'))?.userId;
//   const isAllowed = !maintenance || whitelist.includes(currentUserId) || isAdmin;

//   if (!checked) return (
//     <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
//       <div className="flex flex-col items-center gap-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#eab308]"></div>
//         <p className="text-[#eab308] text-sm font-bold tracking-widest uppercase animate-pulse">
//            global wealth 24...
//         </p>
//       </div>
//     </div>
//   );

//   if (!isAllowed) return <MaintenancePage />;

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-green-500/30 selection:text-green-900 relative">
//       <div className="fixed inset-0 pointer-events-none z-0" style={{
//           backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)',
//           backgroundSize: '50px 50px'
//       }}></div>
//       <div className="fixed inset-0 pointer-events-none z-0">
//         <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-green-400/10 blur-[120px] rounded-full"></div>
//         <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
//       </div>

//       <div className="min-h-screen relative z-10">
//         <ScrollToTop />
        
//         {/* 🔥 NAYA: Poore Routes ko Suspense se wrap kar diya */}
//         <Suspense fallback={<PageLoader />}>
//           {isGoodSubdomain ? (
//             /* ================= ADMIN ================= */
//             <Routes>
//               <Route path="/" element={<Navigate to="/community-access" />} />
//               <Route path="/community-access" element={<AdminLogin />} />
//               <Route path="/super-panal" element={<RequireAdminAuth><AdminLayout /></RequireAdminAuth>}>
//                 <Route index element={<AdminDashboard />} />
//                 <Route path="users" element={<UserListTable />} />
//                 <Route path="topups" element={<TotalTopUpPage />} />
//                 <Route path="highest-active-packages" element={<HighestActivePackagesPage />} />
//                 <Route path="auto-compound" element={<TotalAutoCompoundPage />} />
//                 <Route path="income-reports" element={<SystemIncomeReport />} />
//                  <Route path="auto-compound" element={<TotalAutoCompoundPage />} />
//                 <Route path="deposits" element={<DepositTable />} />
//                 <Route path="address-monitor" element={<DepositAddressMonitor />} />
//                 <Route path="india-boost" element={<IndiaBoostControl />} />
//                 <Route path="booster-offer" element={<BoosterOfferPage />} />
//                 <Route path="change-sponsor" element={<ChangeSponsor />} />
//                 <Route path="wallet-history" element={<WalletUpdateHistory />} />
//                 <Route path="security" element={<AdminSecurity />} />
//                 <Route path="withdrawals/request" element={<RequestWithdrawalPage />} />
//                 <Route path="withdrawals/all" element={<AllWithdrawalsPage />} />
//                 <Route path="direct-income" element={<DirectIncomePage />} />
//                 <Route path="notifications" element={<AdminNotifications />} />
//                 <Route path="level-income" element={<LevelIncomePage />} />
//                 <Route path="wallet-summary" element={<WalletSummaryPage />} />
//                  <Route path="user-fund-overview" element={<UserFundOverview />} />
//                 <Route path="credit-to-wallet" element={<CreditToWalletPage />} />
//                 <Route path="blocked-users" element={<BlockedUsers />} />
//                 <Route path="transactions" element={<AdminTransactions />} />
//                 <Route path="user-level-report" element={<UserLevelReport />} />
//                 <Route path="wallet-direct-stats" element={<WalletDirectStats />} />
//                  <Route path="user-directs" element={<UserDirectsReport />} />
//                 <Route path="user-lifetime-tx" element={<UserLifetimeTxReport />} />
//                 <Route path="leader-auto-withdraw" element={<LeaderAutoWithdraw />} />
//                 <Route path="reward-progress" element={<MonthlyRewardReport />} />
//                 <Route path="salary-claims" element={<MonthlySalaryClaims />} />
//                 <Route path="salary-cron-predictor" element={<SalaryCronPredictor />} />
//                 <Route path="lucky-winners" element={<AdminLuckyWinner />} />
//                 <Route path="settings" element={<AdminSettingsPage />} />
//                 <Route path="transactions/reverse" element={<ReverseTransaction />} />
//                 <Route path="login-stats" element={<AdminLoginStats />} />
//                 <Route path="add-user" element={<AddUser />} />
//                 <Route path="manual-deposit" element={<ManualDeposit />} />
//                 <Route path="promo-video" element={<AdminPromoVideo />} />
//                 <Route path="device-manager" element={<DeviceManager />} />
//                 <Route path="manage-users" element={<AdminManageUsers />} />
//                 <Route path="support" element={<AdminSupport />} />
//               </Route>
//               <Route path="*" element={<Navigate to="/community-access" />} />
//             </Routes>
//           ) : (
//             /* ================= USER / PUBLIC ================= */
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />
//               <Route path="/maintenance" element={<MaintenancePage />} />
//               <Route path="/forgot-password" element={<ForgotPassword />} />
//               <Route path="/reset-password/:token" element={<ResetPassword />} />

//               <Route path="/dashboard" element={<RequireUserAuth><UserLayout><Dashboard /></UserLayout></RequireUserAuth>} />
//               <Route path="/dashboard/:userId" element={<RequireUserAuth><UserLayout><Dashboard /></UserLayout></RequireUserAuth>} />
//               <Route path="/profile" element={<RequireUserAuth><UserLayout><UserProfile /></UserLayout></RequireUserAuth>} />
//               <Route path="/faq" element={<RequireUserAuth><UserLayout><FAQPage /></UserLayout></RequireUserAuth>} />
//               <Route path="/withdrawals" element={<RequireUserAuth><UserLayout><UserWithdrawalHistory /></UserLayout></RequireUserAuth>} />
//               <Route path="/notifications" element={<RequireUserAuth><UserLayout><Notifications/></UserLayout></RequireUserAuth>} />
//               <Route path="/wallet-history" element={<RequireUserAuth><UserLayout><WalletHistory /></UserLayout></RequireUserAuth>} />
//               <Route path="/direct-team" element={<RequireUserAuth><UserLayout><DirectTeamPage /></UserLayout></RequireUserAuth>} />
              
//               <Route path="/all-team" element={<RequireUserAuth><UserLayout><AllTeamPage /></UserLayout></RequireUserAuth>} />
//               <Route path="/my-packages" element={<RequireUserAuth><UserLayout><UserPackages /></UserLayout></RequireUserAuth>} />
//             <Route path="/my-compound-packages" element={<RequireUserAuth><UserLayout><UserCompoundPackages /></UserLayout></RequireUserAuth>} />
//                 <Route path="/global-community" element={<RequireUserAuth><UserLayout><GlobalTeam /></UserLayout></RequireUserAuth>} />
//               <Route path="/roi-income" element={<RequireUserAuth><UserLayout><RoiIncome /></UserLayout></RequireUserAuth>} />
//                <Route path="/community-income" element={<RequireUserAuth><UserLayout><CommunityEarning /></UserLayout></RequireUserAuth>} />
//               <Route path="/level-income" element={<RequireUserAuth><UserLayout><LevelIncome /></UserLayout></RequireUserAuth>} />
//               <Route path="/direct-income" element={<RequireUserAuth><UserLayout><DirectIncome /></UserLayout></RequireUserAuth>} />
//                <Route path="/daily-roi" element={<RequireUserAuth><UserLayout><DailyROIIncome /></UserLayout></RequireUserAuth>} />
//                <Route path="/my-transfers" element={<RequireUserAuth><UserLayout><MyTransfers /></UserLayout></RequireUserAuth>} />
//               <Route path="/deposit-history" element={<RequireUserAuth><UserLayout><DepositHistory /></UserLayout></RequireUserAuth>} />
//               <Route path="/topup-details" element={<RequireUserAuth><UserLayout><TopupDetails /></UserLayout></RequireUserAuth>} />
//               <Route path="/support" element={<RequireUserAuth><UserLayout><Support /></UserLayout></RequireUserAuth>} />
//               <Route path="/transaction-details" element={<RequireUserAuth><UserLayout><TransactionDetails /></UserLayout></RequireUserAuth>} />
//               <Route path="/downline-business" element={<RequireUserAuth><UserLayout><DownlineBusiness /></UserLayout></RequireUserAuth>} />
//               <Route path="/credit-to-wallet" element={<RequireUserAuth><UserLayout><CreditToWallet /></UserLayout></RequireUserAuth>} />
//               <Route path="*" element={<Navigate to="/" />} />
//             </Routes>
//           )}
//         </Suspense>
//       </div>
//     </div>
//   );
// }

// function AppWithAuthReady() {
//   const { ready } = useAuth();
  
//   if (!ready) return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
//       <div className="flex flex-col items-center gap-4">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
//         <p className="text-black text-sm">Authenticating Node...</p>
//       </div>
//     </div>
//   );
//   return <AppContent />;
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <AppWithAuthReady />
//         <ToastContainer theme="light" position="top-right" autoClose={3000} />
//       </Router>
//     </AuthProvider>
//   );
// }



import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import RequireUserAuth from "./components/RequireUserAuth.jsx";
import RequireAdminAuth from "./components/RequireAdminAuth.jsx";

// Public pages
import Home from "./pages/auth/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import MaintenancePage from "./pages/error/MaintenancePage.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

// User pages
import Dashboard from "./pages/user/Dashboard.jsx";
import UserProfile from "./pages/user/UserProfile.jsx";
import FAQPage from "./pages/user/FAQPage.jsx";
import UserWithdrawalHistory from "./pages/user/UserWithdrawalHistory.jsx";
import WalletHistory from "./pages/user/WalletHistory.jsx";
import AllTeamPage from "./pages/user/AllTeamPage.jsx";
import DirectTeamPage from "./pages/user/DirectTeamPage.jsx";
import DirectIncome from "./pages/user/DirectIncome.jsx";
import LevelIncome from "./pages/user/LevelIncome.jsx";
import DailyROIIncome from "./components/dashboard/DailyROI.jsx";
import MyTransfers from "./pages/user/MyTransfers.jsx";
import DepositHistory from "./pages/user/DepositHistory.jsx";
import TopupDetails from "./pages/user/TopupDetails.jsx";
import CommunityEarning from "./pages/user/CommunityEarning";
import Support from "./pages/user/Support.jsx";
import TransactionDetails from "./pages/user/TransactionDetails.jsx";
import DownlineBusiness from "./pages/user/DownlineBusiness.jsx";
import CreditToWallet from "./pages/user/CreditToWallet.jsx";
import Notifications from "./pages/user/Notifications.jsx";
import UserLayout from "./components/layout/UserLayout.jsx";
import RoiIncome from "./pages/user/RoiIncome";
import GlobalInvestment from "./pages/user/GlobalInvestment.jsx";
import GlobalTeam from "./pages/user/GlobalTeam";

// Lazy user pages
const UserPackages = React.lazy(() => import("./pages/user/UserPackages.jsx"));
const UserCompoundPackages = React.lazy(() =>
  import("./pages/user/UserCompoundPackages.jsx")
);

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/Admin.jsx";
import UserListTable from "./pages/admin/UserListTable.jsx";
import DepositTable from "./pages/admin/DepositTable.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import TotalTopUpPage from "./pages/admin/TotalTopUpPage.jsx";
import HighestActivePackagesPage from "./pages/admin/HighestActivePackagesPage.jsx";
import SystemIncomeReport from "./pages/admin/SystemIncomeReport";
import TotalAutoCompoundPage from "./pages/admin/TotalAutoCompoundPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";
import RequestWithdrawalPage from "./pages/admin/RequestWithdrawalPage.jsx";
import AllWithdrawalsPage from "./pages/admin/AllWithdrawalsPage.jsx";
import DirectIncomePage from "./pages/admin/DirectIncomePage.jsx";
import LevelIncomePage from "./pages/admin/LevelIncomePage.jsx";
import WalletSummaryPage from "./pages/admin/WalletSummaryPage.jsx";
import UserFundOverview from "./pages/admin/UserFundOverview.jsx";
import CreditToWalletPage from "./pages/admin/CreditToWallet.jsx";
import BlockedUsers from "./pages/admin/BlockedUsers.jsx";
import ReverseTransaction from "./pages/admin/ReverseTransaction.jsx";
import AddUser from "./pages/admin/AddUser.jsx";
import AdminNotifications from "./pages/admin/AdminCreateNotification.jsx";
import AdminSupport from "./pages/admin/AdminSupport.jsx";
import ManualDeposit from "./pages/admin/ManualDeposit.jsx";
import AdminLoginStats from "./pages/admin/AdminLoginStats.jsx";
import AdminSecurity from "./pages/admin/AdminSecurity.jsx";
import DeviceManager from "./pages/admin/DeviceManager.jsx";
import AdminManageUsers from "./pages/admin/AdminManageUsers.jsx";
import MonthlyRewardReport from "./pages/admin/MonthlyRewardReport.jsx";
import MonthlySalaryClaims from "./pages/admin/MonthlySalaryClaims.jsx";
import SalaryCronPredictor from "./pages/admin/SalaryCronPredictor.jsx";
import WalletDirectStats from "./pages/admin/WalletDirectStats";
import UserDirectsReport from "./pages/admin/UserDirectsReport";
import UserLifetimeTxReport from "./pages/admin/UserLifetimeTxReport";
import LeaderAutoWithdraw from "./pages/admin/LeaderAutoWithdraw";
import DepositAddressMonitor from "./pages/admin/DepositAddressMonitor";
import IndiaBoostControl from "./pages/admin/IndiaBoostControl";
import UserLevelReport from "./pages/admin/UserLevelReport";
import ChangeSponsor from "./pages/admin/ChangeSponsor";
import WalletUpdateHistory from "./pages/admin/WalletUpdateHistory";

// NOTE: The source provided references BoosterOfferPage, AdminLuckyWinner and
// AdminPromoVideo but does not include their imports. Add the correct project
// imports for these three components before using their routes.

const WealthBackdrop = () => (
  <>
    <div className="gw-ambient-grid" />
    <div className="gw-ambient-glow gw-ambient-glow-gold" />
    <div className="gw-ambient-glow gw-ambient-glow-jade" />
    <div className="gw-ambient-grain" />
  </>
);

const WealthLoader = ({ label = "Loading your workspace", fullScreen = true }) => (
  <div
    className={`gw-loader ${fullScreen ? "gw-loader-screen" : "gw-loader-inline"}`}
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    {fullScreen && <WealthBackdrop />}
    <div className="gw-loader-content">
      <div className="gw-loader-emblem" aria-hidden="true">
        <span className="gw-loader-monogram">GW</span>
        <span className="gw-loader-emblem-accent" />
      </div>
      <div className="gw-loader-wordmark">GLOBAL <span>WEALTH</span></div>
      <p className="gw-loader-caption">{label}</p>
      <div className="gw-loader-progress"><span /></div>
      <span className="gw-loader-footnote">SECURE MEMBER EXPERIENCE</span>
    </div>
  </div>
);

const PageLoader = () => (
  <div className="gw-page-loading">
    <WealthBackdrop />
    <WealthLoader label="Preparing your page" fullScreen={false} />
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const readStoredUserId = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.userId || null;
  } catch {
    return null;
  }
};

function AppContent() {
  const location = useLocation();
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);
  const [whitelist, setWhitelist] = useState([]);

  const isAdmin = Boolean(localStorage.getItem("adminToken"));
  const hostname = window.location.hostname;
  const isGoodSubdomain = hostname.startsWith("pure.");

  useEffect(() => {
    setMaintenance(false);
    setWhitelist([]);
    setChecked(true);
  }, []);

  const currentUserId = readStoredUserId();
  const isAllowed = !maintenance || whitelist.includes(currentUserId) || isAdmin;

  if (!checked) {
    return (
      <div className="gw-initial-loading">
        <WealthBackdrop />
        <WealthLoader label="Starting Global Wealth" fullScreen={false} />
      </div>
    );
  }

  if (!isAllowed) return <MaintenancePage />;

  return (
    <div className="gw-app-shell">
      <WealthBackdrop />
      <div className="gw-app-content">
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          {isGoodSubdomain ? (
            <Routes>
              <Route path="/" element={<Navigate to="/community-access" replace />} />
              <Route path="/community-access" element={<AdminLogin />} />
              <Route
                path="/super-panal"
                element={
                  <RequireAdminAuth>
                    <AdminLayout />
                  </RequireAdminAuth>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserListTable />} />
                <Route path="topups" element={<TotalTopUpPage />} />
                <Route path="highest-active-packages" element={<HighestActivePackagesPage />} />
                <Route path="auto-compound" element={<TotalAutoCompoundPage />} />
                <Route path="income-reports" element={<SystemIncomeReport />} />
                <Route path="deposits" element={<DepositTable />} />
                <Route path="address-monitor" element={<DepositAddressMonitor />} />
                <Route path="india-boost" element={<IndiaBoostControl />} />
                {/* Add the correct import for BoosterOfferPage in this file. */}
                <Route path="booster-offer" element={<div className="p-6 text-slate-300">Booster offer page import is required.</div>} />
                <Route path="change-sponsor" element={<ChangeSponsor />} />
                <Route path="wallet-history" element={<WalletUpdateHistory />} />
                <Route path="security" element={<AdminSecurity />} />
                <Route path="withdrawals/request" element={<RequestWithdrawalPage />} />
                <Route path="withdrawals/all" element={<AllWithdrawalsPage />} />
                <Route path="direct-income" element={<DirectIncomePage />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="level-income" element={<LevelIncomePage />} />
                <Route path="wallet-summary" element={<WalletSummaryPage />} />
                <Route path="user-fund-overview" element={<UserFundOverview />} />
                <Route path="credit-to-wallet" element={<CreditToWalletPage />} />
                <Route path="blocked-users" element={<BlockedUsers />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="user-level-report" element={<UserLevelReport />} />
                <Route path="wallet-direct-stats" element={<WalletDirectStats />} />
                <Route path="user-directs" element={<UserDirectsReport />} />
                <Route path="user-lifetime-tx" element={<UserLifetimeTxReport />} />
                <Route path="leader-auto-withdraw" element={<LeaderAutoWithdraw />} />
                <Route path="reward-progress" element={<MonthlyRewardReport />} />
                <Route path="salary-claims" element={<MonthlySalaryClaims />} />
                <Route path="salary-cron-predictor" element={<SalaryCronPredictor />} />
                {/* Add the correct import for AdminLuckyWinner in this file. */}
                <Route path="lucky-winners" element={<div className="p-6 text-slate-300">Lucky winners page import is required.</div>} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="transactions/reverse" element={<ReverseTransaction />} />
                <Route path="login-stats" element={<AdminLoginStats />} />
                <Route path="add-user" element={<AddUser />} />
                <Route path="manual-deposit" element={<ManualDeposit />} />
                {/* Add the correct import for AdminPromoVideo in this file. */}
                <Route path="promo-video" element={<div className="p-6 text-slate-300">Promo video page import is required.</div>} />
                <Route path="device-manager" element={<DeviceManager />} />
                <Route path="manage-users" element={<AdminManageUsers />} />
                <Route path="support" element={<AdminSupport />} />
              </Route>
              <Route path="*" element={<Navigate to="/community-access" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route path="/dashboard" element={<RequireUserAuth><UserLayout><Dashboard /></UserLayout></RequireUserAuth>} />
              <Route path="/dashboard/:userId" element={<RequireUserAuth><UserLayout><Dashboard /></UserLayout></RequireUserAuth>} />
              <Route
  path="/global-investment"
  element={
    <RequireUserAuth>
      <UserLayout>
        <GlobalInvestment />
      </UserLayout>
    </RequireUserAuth>
  }
/>
              <Route path="/profile" element={<RequireUserAuth><UserLayout><UserProfile /></UserLayout></RequireUserAuth>} />
              <Route path="/faq" element={<RequireUserAuth><UserLayout><FAQPage /></UserLayout></RequireUserAuth>} />
              <Route path="/withdrawals" element={<RequireUserAuth><UserLayout><UserWithdrawalHistory /></UserLayout></RequireUserAuth>} />
              <Route path="/notifications" element={<RequireUserAuth><UserLayout><Notifications /></UserLayout></RequireUserAuth>} />
              <Route path="/wallet-history" element={<RequireUserAuth><UserLayout><WalletHistory /></UserLayout></RequireUserAuth>} />
              <Route path="/direct-team" element={<RequireUserAuth><UserLayout><DirectTeamPage /></UserLayout></RequireUserAuth>} />
              <Route path="/all-team" element={<RequireUserAuth><UserLayout><AllTeamPage /></UserLayout></RequireUserAuth>} />
              <Route path="/my-packages" element={<RequireUserAuth><UserLayout><UserPackages /></UserLayout></RequireUserAuth>} />
              <Route path="/my-compound-packages" element={<RequireUserAuth><UserLayout><UserCompoundPackages /></UserLayout></RequireUserAuth>} />
              <Route path="/global-community" element={<RequireUserAuth><UserLayout><GlobalTeam /></UserLayout></RequireUserAuth>} />
              <Route path="/roi-income" element={<RequireUserAuth><UserLayout><RoiIncome /></UserLayout></RequireUserAuth>} />
              <Route path="/community-income" element={<RequireUserAuth><UserLayout><CommunityEarning /></UserLayout></RequireUserAuth>} />
              <Route path="/level-income" element={<RequireUserAuth><UserLayout><LevelIncome /></UserLayout></RequireUserAuth>} />
              <Route path="/direct-income" element={<RequireUserAuth><UserLayout><DirectIncome /></UserLayout></RequireUserAuth>} />
              <Route path="/daily-roi" element={<RequireUserAuth><UserLayout><DailyROIIncome /></UserLayout></RequireUserAuth>} />
              <Route path="/my-transfers" element={<RequireUserAuth><UserLayout><MyTransfers /></UserLayout></RequireUserAuth>} />
              <Route path="/deposit-history" element={<RequireUserAuth><UserLayout><DepositHistory /></UserLayout></RequireUserAuth>} />
              <Route path="/topup-details" element={<RequireUserAuth><UserLayout><TopupDetails /></UserLayout></RequireUserAuth>} />
              <Route path="/support" element={<RequireUserAuth><UserLayout><Support /></UserLayout></RequireUserAuth>} />
              <Route path="/transaction-details" element={<RequireUserAuth><UserLayout><TransactionDetails /></UserLayout></RequireUserAuth>} />
              <Route path="/downline-business" element={<RequireUserAuth><UserLayout><DownlineBusiness /></UserLayout></RequireUserAuth>} />
              <Route path="/credit-to-wallet" element={<RequireUserAuth><UserLayout><CreditToWallet /></UserLayout></RequireUserAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Suspense>
      </div>
    </div>
  );
}

function AppWithAuthReady() {
  const { ready } = useAuth();

  if (!ready) {
    return (
      <div className="gw-initial-loading">
        <WealthBackdrop />
        <WealthLoader label="Securing your session" fullScreen={false} />
      </div>
    );
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <style>{`
          :root {
            color-scheme: dark;
            --gw-gold: #d7b568;
            --gw-gold-bright: #f0d38f;
            --gw-gold-muted: rgba(215,181,104,.16);
            --gw-bg: #050505;
          }
          * { box-sizing: border-box; }
          html { background: var(--gw-bg); }
          body {
            margin: 0; min-width: 320px; background: var(--gw-bg);
            color: #f5f0e5; -webkit-font-smoothing: antialiased;
          }
          .gw-app-shell, .gw-initial-loading, .gw-page-loading {
            position: relative; isolation: isolate; min-height: 100vh; min-height: 100svh;
            overflow: hidden; background:
              radial-gradient(ellipse at 80% -15%, rgba(170,126,45,.13), transparent 42%),
              radial-gradient(ellipse at 0% 100%, rgba(23,104,87,.055), transparent 38%),
              #050505;
          }
          .gw-app-content { position: relative; z-index: 2; min-height: 100vh; }
          .gw-ambient-grid {
            position: fixed; inset: 0; z-index: -3; pointer-events: none; opacity: .13;
            background-image:
              linear-gradient(rgba(211,177,105,.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(211,177,105,.07) 1px, transparent 1px);
            background-size: 52px 52px;
            mask-image: linear-gradient(to bottom, black, transparent 92%);
          }
          .gw-ambient-glow {
            position: fixed; z-index: -2; pointer-events: none; border-radius: 50%;
            filter: blur(105px); opacity: .17; animation: gw-drift 17s ease-in-out infinite alternate;
          }
          .gw-ambient-glow-gold {
            width: 420px; height: 420px; top: -250px; right: -120px; background: #b88a38;
          }
          .gw-ambient-glow-jade {
            width: 360px; height: 360px; bottom: -230px; left: -150px;
            background: #147565; opacity: .09; animation-delay: -7s;
          }
          .gw-ambient-grain {
            position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: .025;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
          }
          .gw-initial-loading, .gw-page-loading {
            display: flex; align-items: center; justify-content: center; padding: 20px;
          }
          .gw-loader {
            position: relative; isolation: isolate; display: flex; width: 100%;
            align-items: center; justify-content: center; overflow: hidden;
            color: #f5e8c8; background: transparent;
          }
          .gw-loader-screen { min-height: 100vh; min-height: 100svh; }
          .gw-loader-inline {
            min-height: 100vh; min-height: 100svh;
          }
          .gw-loader-content {
            position: relative; z-index: 1; display: flex; width: min(90%, 360px);
            flex-direction: column; align-items: center; padding: 26px 14px; text-align: center;
          }
          .gw-loader-emblem {
            position: relative; display: grid; width: 64px; height: 64px; place-items: center;
            margin-bottom: 19px; border: 1px solid rgba(215,181,104,.5); border-radius: 17px;
            background: linear-gradient(145deg, rgba(196,153,71,.2), rgba(12,10,7,.96) 72%);
            box-shadow: 0 12px 38px rgba(0,0,0,.28), inset 0 0 22px rgba(190,147,67,.1);
            animation: gw-emblem-breathe 2.4s ease-in-out infinite;
          }
          .gw-loader-emblem::before {
            content: ""; position: absolute; inset: 6px; border: 1px solid rgba(215,181,104,.16);
            border-radius: 11px;
          }
          .gw-loader-monogram {
            position: relative; z-index: 1; color: var(--gw-gold-bright);
            font: 800 21px Georgia, serif; letter-spacing: -.09em;
            text-shadow: 0 0 16px rgba(229,190,111,.4);
          }
          .gw-loader-emblem-accent {
            position: absolute; right: -3px; top: 9px; width: 7px; height: 7px;
            border-radius: 2px; background: #f3d58e;
            box-shadow: 0 0 13px 3px rgba(255,216,135,.55);
          }
          .gw-loader-wordmark {
            color: #f5e8c8; font: 800 19px Georgia, 'Times New Roman', serif;
            letter-spacing: .13em;
          }
          .gw-loader-wordmark span { color: var(--gw-gold); }
          .gw-loader-caption {
            margin: 9px 0 18px; color: #a99c81; font-size: 10px;
            font-weight: 600; letter-spacing: .13em; text-transform: uppercase;
          }
          .gw-loader-progress {
            width: 158px; height: 2px; overflow: hidden; border-radius: 20px;
            background: rgba(202,166,96,.16);
          }
          .gw-loader-progress span {
            display: block; width: 42%; height: 100%; border-radius: inherit;
            background: linear-gradient(90deg, transparent, #f0d28e, #a77d32, transparent);
            box-shadow: 0 0 10px rgba(235,197,119,.65);
            animation: gw-progress 1.65s ease-in-out infinite;
          }
          .gw-loader-footnote {
            margin-top: 12px; color: rgba(183,157,103,.52);
            font-size: 7px; font-weight: 700; letter-spacing: .22em;
          }
          @keyframes gw-emblem-breathe {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes gw-progress { 0% { transform: translateX(-120%); } 100% { transform: translateX(360%); } }
          @keyframes gw-drift { from { transform: translate3d(0,0,0) scale(.95); } to { transform: translate3d(-26px,28px,0) scale(1.08); } }
          @media (max-width: 480px) {
            .gw-loader-emblem { width: 58px; height: 58px; margin-bottom: 15px; border-radius: 15px; }
            .gw-loader-monogram { font-size: 19px; }
            .gw-loader-wordmark { font-size: 17px; }
            .gw-loader-caption { font-size: 9px; }
          }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              scroll-behavior: auto !important; animation-duration: .01ms !important;
              animation-iteration-count: 1 !important; transition-duration: .01ms !important;
            }
          }
          .Toastify__toast {
            border: 1px solid rgba(215,181,104,.2) !important;
            border-radius: 13px !important; background: #11100d !important;
            color: #f5f0e5 !important; box-shadow: 0 18px 55px rgba(0,0,0,.4) !important;
          }
          .Toastify__progress-bar { background: var(--gw-gold) !important; }
          .Toastify__close-button { color: #c9b98f !important; }
        `}</style>
        <AppWithAuthReady />
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}
