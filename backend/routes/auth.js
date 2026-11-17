 

// require('dotenv').config();
// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const User = require('../models/User');
// const Setting = require('../models/Setting'); 
// const sanitizeUser = require('../utils/sanitizeUser');
// const sendEmail = require('../utils/sendEmail');
// const checkFeature = require('../middleware/checkFeatureEnabled');
// const DummyUser = require('../models/DummyUser.js');
// const LoginHistory = require('../models/LoginHistory'); 
// const IpRule = require('../models/IpRule'); 
// const FakeUser = require('../models/FakeUser'); 
// const BlockedDevice = require('../models/BlockedDevice'); 
// const { bot } = require('../utils/telegramBot');

// const JWT_SECRET = process.env.JWT_SECRET;
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// const getClientIP = (req) => {
//     let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress || '127.0.0.1';
//     if (ip.includes('::ffff:')) {
//         ip = ip.replace('::ffff:', '');
//     }
//     return ip;
// };

// // 🔥 UPDATE 1: Generate "WF" + 7 Digit User ID
// const generateUserId = async () => {
//   let id;
//   let exists = true;
//   while (exists) {
//     // 7 digit random number (1000000 to 9999999)
//     const random7Digit = Math.floor(1000000 + Math.random() * 9000000);
//     id = `WF${random7Digit}`; // Output example: WF1234567
    
//     const existsInReal = await User.exists({ userId: id });
//     const existsInDummy = await DummyUser.exists({ userId: id });
//     if (!existsInReal && !existsInDummy) {
//       exists = false;
//     }
//   }
//   return id;
// };

// const generateTransactionPassword = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };
 


 

// router.get('/check-sponsor/:id', async (req, res) => {
//     try {
//         const searchId = new RegExp('^' + req.params.id + '$', 'i'); // Case insensitive search taaki wf aur WF dono chal jaye

//         // 1. Pehle REAL User database me check karo
//         let sponsor = await User.findOne({ userId: searchId });

//         // 2. Agar Real User nahi mila, toh DUMMY User database me check karo
//         if (!sponsor) {
//             sponsor = await DummyUser.findOne({ userId: searchId });
//         }

//         // 3. Agar dono me nahi mila, tabhi Invalid error do
//         if (!sponsor) {
//             return res.status(404).json({ message: "❌ Invalid Sponsor ID" });
//         }

//         // 4. Agar mil gaya (Real ya Dummy koi bhi), toh uska naam wapas bhej do
//         res.json({ name: sponsor.name });
//     } catch (err) {
//         console.error("Check Sponsor Error:", err);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// router.post('/register', checkFeature('allowRegistrations'), async (req, res) => {
//   try {
//     // 🔥 YAHAN walletAddress ADD KIYA HAI
//     let { name, mobile, email, sponsorId, deviceId, upi, password, country, walletAddress } = req.body;
//     const userIP = getClientIP(req);

//     name = name ? name.trim() : '';
//     mobile = mobile ? mobile.trim() : '';
//     email = email ? email.trim().toLowerCase() : '';
//     country = country ? country.trim() : '';
//     walletAddress = walletAddress ? walletAddress.trim() : ''; // BEP20 Wallet

//     const nameRegex = /^[A-Za-z\s]{3,50}$/;
//     if (!name || !nameRegex.test(name)) {
//         return res.status(400).json({ message: 'Invalid Name. Only alphabets are allowed.' });
//     }

//     if (!country) {
//         return res.status(400).json({ message: 'Country is required.' });
//     }

//     // 🔥 USDT BEP-20 Wallet Address Compulsory Check + Basic Validation
//     if (!walletAddress) {
//         return res.status(400).json({ message: 'USDT BEP-20 Wallet Address is compulsory.' });
//     }
    
//     // BEP20 (BSC) Address Validation (Starts with 0x and is 42 chars long)
//     const walletRegex = /^0x[a-fA-F0-9]{40}$/;
//     if (!walletRegex.test(walletAddress)) {
//         return res.status(400).json({ message: 'Invalid USDT BEP-20 Address.' });
//     }

//     const mobileRegex = /^[0-9]{10,15}$/;
//     if (!mobile || !mobileRegex.test(mobile)) {
//         return res.status(400).json({ message: 'Invalid Mobile Number.' });
//     }

//     if (!email || !email.endsWith('@gmail.com')) {
//         return res.status(400).json({ message: 'Registration failed: Wrong Gmail.' });
//     }

//     if (!password || password.length < 6) {
//         return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
//     }

//     // --- Anti-Bot Security ---
//     const isLocalIP = userIP === '127.0.0.1' || userIP === '::1';
//     if (!isLocalIP) {
//         const rule = await IpRule.findOne({ ipAddress: userIP });
//         if (rule && rule.isBlocked) return res.status(403).json({ message: "Access Denied." });
//     }

//     if (deviceId) {
//         const isDeviceBlocked = await BlockedDevice.findOne({ deviceId });
//         if (isDeviceBlocked) return res.status(403).json({ message: "Device blocked." });
//     }
//     // -------------------------

//     // Top ID / Genesis ID Logic
//     const userCount = await User.countDocuments();
//     let actualSponsorId = null;

//     if (userCount === 0) {
//         actualSponsorId = sponsorId || 'ROOT'; 
//     } else {
//         if (!sponsorId) return res.status(400).json({ message: 'Sponsor ID is compulsory.' });

//         actualSponsorId = sponsorId; 
//         let sponsorExists = await User.findOne({ userId: actualSponsorId });

//         if (!sponsorExists) return res.status(400).json({ message: 'Invalid Sponsor ID.' });
//     }
//     // ----------------------------------------------------

//     const newUserId = await generateUserId(); 
    
//     // System generated 6-digit transaction password
//     const txPassword = generateTransactionPassword();

//     // 🔥 User Object me walletAddress pass kar diya hai
//     const user = new User({
//       userId: newUserId, 
//       name, 
//       mobile, 
//       email, 
//       country, 
//       walletAddress, // Added to DB Model
//       upi,
//       password: password, 
//       transactionPassword: txPassword, 
//       sponsorId: actualSponsorId, 
//       role: 'user',
//       ipAddress: userIP,
//       deviceId: deviceId || null 
//     });

//     await user.save();

//     // =========================================================
//     // 🔥 FIX: Email bhejne ko background me daal diya gaya hai.
//     // Yahan try/catch aur await hata diya hai taaki timeout ka 
//     // asar registration par na pade.
//     // =========================================================
//     sendEmail({
//         email: user.email,
//         subject: '🎉 Welcome to global wealth 24!',
//         html: `
//         <div style="font-family: Arial; padding: 20px;">
//             <h2 style="color: #03a9f4;">🚀 Welcome to global wealth 24</h2>
//             <p>Hello <strong>${user.name}</strong>,</p>
//             <p>Your account has been successfully created.</p>
//             <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #03a9f4;">
//                 <p>👤 <strong>User ID:</strong> ${user.userId}</p>
//                 <p>🔑 <strong>Login Password:</strong> ${user.password}</p>
//                 <p>🛡️ <strong>Transaction Password:</strong> <span style="color:red;">${user.transactionPassword}</span> (Keep this safe!)</p>
//             </div>
//             <br/>
//             <a href="${process.env.FRONTEND_URL}/login" style="background-color: #03a9f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
//         </div>
//         ` 
//     }).catch(emailErr => { 
//         // Ye bas console me print karega ki email fail hua, par aage ka code nahi rokega.
//         console.error("⚠️ Background Email failed, but user is registered:", emailErr.message); 
//     });

//     // 🚀 Registration turant successful bhej dega (1 second me)
//     return res.status(201).json({ 
//         message: 'User registered successfully.', 
//         userId: user.userId, 
//         name: user.name,
//         transactionPassword: txPassword 
//     });

//   } catch (err) {
//     console.error('Register error:', err);
//     res.status(500).json({ message: 'Server error.' });
//   }
// });





require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Setting = require('../models/Setting'); 
const sanitizeUser = require('../utils/sanitizeUser');
const sendEmail = require('../utils/sendEmail');
const checkFeature = require('../middleware/checkFeatureEnabled');
const DummyUser = require('../models/DummyUser.js');
const LoginHistory = require('../models/LoginHistory'); 
const IpRule = require('../models/IpRule'); 
const FakeUser = require('../models/FakeUser'); 
const BlockedDevice = require('../models/BlockedDevice'); 
const { bot } = require('../utils/telegramBot');

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const getClientIP = (req) => {
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress || '127.0.0.1';
    if (ip.includes('::ffff:')) ip = ip.replace('::ffff:', '');
    return ip;
};

// 🔥 UPDATE 1: Generate "WF" + 7 Digit User ID
const generateUserId = async () => {
  let id;
  let exists = true;
  while (exists) {
    const random7Digit = Math.floor(1000000 + Math.random() * 9000000);
    id = `GW${random7Digit}`; 
    const existsInReal = await User.exists({ userId: id });
    const existsInDummy = await DummyUser.exists({ userId: id });
    if (!existsInReal && !existsInDummy) exists = false;
  }
  return id;
};

const generateTransactionPassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

router.get('/check-sponsor/:id', async (req, res) => {
    try {
        // 🔥 FIX: NoSQL Injection Block (Ensure it's a string)
        const sponsorIdParam = String(req.params.id).trim();
        const searchId = new RegExp('^' + sponsorIdParam + '$', 'i'); 

        let sponsor = await User.findOne({ userId: searchId });
        if (!sponsor) sponsor = await DummyUser.findOne({ userId: searchId });

        if (!sponsor) return res.status(404).json({ message: "❌ Invalid Sponsor ID" });
        res.json({ name: sponsor.name });
    } catch (err) {
        console.error("Check Sponsor Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/register', checkFeature('allowRegistrations'), async (req, res) => {
  try {
    // 🔥 FIX: Strict Type Casting (Prevents JSON Object Injection)
    const name = String(req.body.name || '').trim();
    const mobile = String(req.body.mobile || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const country = String(req.body.country || '').trim();
    const walletAddress = String(req.body.walletAddress || '').trim();
    const password = String(req.body.password || '');
    const upi = String(req.body.upi || '').trim();
    const deviceId = String(req.body.deviceId || '').trim();
    const sponsorId = String(req.body.sponsorId || '').trim();
    
    const userIP = getClientIP(req);

    // --- Validations ---
    const nameRegex = /^[A-Za-z\s]{3,50}$/;
    if (!name || !nameRegex.test(name)) return res.status(400).json({ message: 'Invalid Name. Only alphabets are allowed.' });
    if (!country) return res.status(400).json({ message: 'Country is required.' });

    if (!walletAddress) return res.status(400).json({ message: 'USDT BEP-20 Wallet Address is compulsory.' });
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!walletRegex.test(walletAddress)) return res.status(400).json({ message: 'Invalid USDT BEP-20 Address.' });

    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobile || !mobileRegex.test(mobile)) return res.status(400).json({ message: 'Invalid Mobile Number.' });

    if (!email || !email.endsWith('@gmail.com')) return res.status(400).json({ message: 'Registration failed: Only Gmail is allowed.' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });

     
    // --- Anti-Bot Security ---
    const isLocalIP = userIP === '127.0.0.1' || userIP === '::1';
    if (!isLocalIP) {
        const rule = await IpRule.findOne({ ipAddress: userIP });
        if (rule && rule.isBlocked) return res.status(403).json({ message: "Access Denied." });
    }

    if (deviceId) {
        const isDeviceBlocked = await BlockedDevice.findOne({ deviceId });
        if (isDeviceBlocked) return res.status(403).json({ message: "Device blocked." });
    }

    // --- Sponsor Check ---
    const userCount = await User.countDocuments();
    let actualSponsorId = null;

    if (userCount === 0) {
        actualSponsorId = sponsorId || 'ROOT'; 
    } else {
        if (!sponsorId) return res.status(400).json({ message: 'Sponsor ID is compulsory.' });
        actualSponsorId = sponsorId; 
        const sponsorExists = await User.findOne({ userId: actualSponsorId });
        if (!sponsorExists) return res.status(400).json({ message: 'Invalid Sponsor ID.' });
    }

    // --- Create User ---
    const newUserId = await generateUserId(); 
    const txPassword = generateTransactionPassword();

    const user = new User({
      userId: newUserId, 
      name, 
      mobile, 
      email, 
      country, 
      walletAddress, 
      upi,
      password: password, // Note: Mongoose pre-save hook must hash this!
      transactionPassword: txPassword, 
      sponsorId: actualSponsorId, 
      role: 'user',
      ipAddress: userIP,
      deviceId: deviceId || null 
    });

    await user.save();

   
const frontendUrl = (process.env.FRONTEND_URL || 'https://globalwealth.trade').replace(/\/+$/, '');

sendEmail({
    email: user.email,
    subject: '🎉 Welcome to Global Wealth – Your Account is Ready!',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;">

      <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.07);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#071b3a,#0877d1);padding:38px 25px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:30px;letter-spacing:1px;">
            GLOBAL WEALTH
          </h1>
          <p style="color:#d7eaff;margin:12px 0 0;font-size:14px;">
            Welcome to Your New Journey
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding:32px 28px;">

          <h2 style="color:#142b49;font-size:24px;margin:0 0 18px;">
            🎉 Welcome, ${user.name}!
          </h2>

          <p style="color:#526176;font-size:15px;line-height:1.8;">
            Congratulations! Your Global Wealth account has been
            successfully created.
          </p>

          <p style="color:#526176;font-size:15px;line-height:1.8;">
            We are delighted to welcome you to our community.
            Your account details are provided below.
          </p>

          <!-- Account Details -->
         <!-- Account Details -->
<div style="background:#f1f6fc;border:1px solid #dce8f5;border-radius:10px;padding:22px;margin:25px 0;">

  <h3 style="color:#123b68;margin:0 0 18px;font-size:17px;">
    Your Account Information
  </h3>

  <p style="margin:12px 0;color:#43546a;font-size:14px;">
    <strong>User ID:</strong>
    <span style="color:#0877d1;font-weight:bold;">
      ${user.userId}
    </span>
  </p>

  <p style="margin:12px 0;color:#43546a;font-size:14px;">
    <strong>Account Name:</strong> ${user.name}
  </p>

  <p style="margin:12px 0;color:#43546a;font-size:14px;">
    <strong>Email:</strong> ${user.email}
  </p>

  <div style="background:#ffffff;border:1px solid #dce8f5;border-radius:8px;padding:16px;margin-top:20px;">

    <h3 style="color:#123b68;margin:0 0 15px;font-size:16px;">
      Your Login Credentials
    </h3>

    <p style="margin:12px 0;color:#43546a;font-size:14px;">
      <strong>Login Password:</strong>
      <span style="color:#0877d1;font-weight:bold;">
        ${password}
      </span>
    </p>

    <p style="margin:12px 0;color:#43546a;font-size:14px;">
      <strong>Transaction Password:</strong>
      <span style="color:#0877d1;font-weight:bold;">
        ${txPassword}
      </span>
    </p>

  </div>

  <p style="margin:18px 0 0;color:#d97706;font-size:13px;line-height:1.7;">
    🔐 Security Notice: Keep both passwords confidential.
    Never share them with anyone. Change your passwords after
    your first login and never reuse them on other websites.
  </p>

</div>

          <!-- Login Button -->
          <div style="text-align:center;margin:30px 0;">
            <a href="${frontendUrl}/login"
               style="display:inline-block;background:#0877d1;color:#ffffff;text-decoration:none;padding:15px 38px;border-radius:7px;font-size:15px;font-weight:bold;">
              LOGIN TO YOUR ACCOUNT →
            </a>
          </div>

          <p style="color:#526176;font-size:14px;line-height:1.8;">
            If you have any questions or need assistance, please contact
            our support team.
          </p>

          <p style="color:#142b49;font-size:15px;font-weight:bold;margin-top:25px;">
            Best Regards,<br>
            Global Wealth Team
          </p>

        </div>

        <!-- Footer -->
        <div style="background:#071b3a;padding:23px;text-align:center;">
          <p style="color:#ffffff;font-size:13px;margin:0 0 8px;">
            © ${new Date().getFullYear()} Global Wealth. All Rights Reserved.
          </p>
          <p style="color:#b8cce3;font-size:12px;margin:0;">
            This is an automated account registration email.
          </p>
        </div>

      </div>

    </body>
    </html>
    `
}).catch(emailErr =>
    console.error("⚠️ Welcome email failed:", emailErr.message)
);


    return res.status(201).json({ 
        message: 'User registered successfully.', 
        userId: user.userId, 
        name: user.name,
        transactionPassword: txPassword 
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

 
 


router.post('/login', async (req, res) => {
    try {
        const { userId, password, deviceId } = req.body;
        const userIP = getClientIP(req);
        
        // 1. Ensure userId search is case-insensitive for 'WF'
        const user = await User.findOne({ userId: new RegExp('^' + userId + '$', 'i') });
        if (!user) return res.status(401).json({ message: 'Invalid UserID or Password' });

        // 2. 👇 YEH ACCOUNT BLOCK CHECK ADD KIYA HAI 👇
        if (user.isBlocked) {
            return res.status(403).json({ 
                message: '' 
            });
        }
        // 👆 ---------------------------------- 👆

        // 3. Strict Password Match
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid UserID or Password' });
        }
        
        // 4. 🛡️ SMART LOGIN LIMIT (25 Users Per IP + Admin Block)
        if (user.role !== 'admin') {
            const isLocalIP = userIP === '127.0.0.1' || userIP === '::1';

            if (!isLocalIP) {
                const rule = await IpRule.findOne({ ipAddress: userIP });
                
                if (rule && rule.isBlocked) {
                    return res.status(403).json({ message: "Access Denied: Your IP has been blocked by the Administrator." });
                }

                // ✅ Login IP Limit (Default 25)
                const allowedLimit = (rule && rule.limit) ? rule.limit : 25;
                const uniqueUsersOnThisIP = await LoginHistory.distinct('userId', { ipAddress: userIP });

                if (uniqueUsersOnThisIP.length >= allowedLimit && !uniqueUsersOnThisIP.includes(user.userId)) {
                    return res.status(403).json({ 
                        message: `Access Denied: You have reached the maximum limit of ${allowedLimit} accounts per network.` 
                    });
                }
            }
        }

        // 5. 🚀 DEVICE FINGERPRINT CHECK
        if (deviceId) {
            const isDeviceBlocked = await BlockedDevice.findOne({ deviceId });
            if (isDeviceBlocked) {
                return res.status(403).json({ message: "Access Denied: Your device has been blocked due to a policy violation." });        
            }
        }

        // 6. Maintenance & Security Checks
        const settings = await Setting.findOne();
        if (settings) {
            if (settings.maintenanceMode && user.role !== 'admin') {
                const whitelist = (settings.maintenanceWhitelist || []).map(String);
                if (!whitelist.includes(String(user.userId))) return res.status(503).json({ message: 'Maintenance Mode.' });
            }
            if (!settings.allowLogin && user.role !== 'admin') return res.status(403).json({ message: 'Login is disabled.' });
        }

        // 7. ✅ IP Update (Migration)
        user.ipAddress = userIP; 
        if (deviceId) {
            user.deviceId = deviceId;
        }
        await user.save();

        // 8. ✅ Save History with Real IP (Bug Fix ke sath)
        try {
           await LoginHistory.create({
             userId: user.userId,
             name: user.name,
             mobile: user.mobile || "N/A", // 🔥 Agar mobile undefined hua to crash hone se bachayega
             ipAddress: userIP 
           });
        } catch (hErr) { 
           console.error('❌ History Save Error:', hErr.message); 
        }

        // 9. Generate Token and Response
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '50m' });
        res.json({ message: 'Login successfull', token, user: sanitizeUser(user) });
        
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

 // ====================== FORGOT PASSWORD ======================
// ====================== FORGOT PASSWORD ======================



 

router.post('/forgot-password', checkFeature(), async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // 🕒 RATE LIMITING LOGIC: Din mein sirf 3 Password Reset Emails
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!user.lastPasswordResetDate || user.lastPasswordResetDate < startOfToday) {
        user.passwordResetCount = 0; 
    }

    if (user.passwordResetCount >= 3) {
        return res.status(429).json({ 
            message: "Daily limit exceeded. You can only request a password reset 3 times a day." 
        });
    }

    // 🔐 Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // 📈 Update limit count aur date
    user.passwordResetCount += 1; 
    user.lastPasswordResetDate = now;

    await user.save();

    const resetLink = `https://globalwealth.trade/reset-password/${resetToken}`;
    
    // 📧 SEND EMAIL (PREMIUM FORMAT)
    
await sendEmail({
  email: user.email,
  subject: '🔐 Global Wealth | Secure Password Reset',
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;">

    <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 5px 25px rgba(0,0,0,0.07);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#071b3a,#0877d1);padding:38px 25px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;">
          GLOBAL WEALTH
        </h1>
        <p style="color:#d7eaff;margin:12px 0 0;font-size:14px;">
          Account Security & Protection
        </p>
      </div>

      <!-- Main Content -->
      <div style="padding:32px 28px;">

        <div style="text-align:center;margin-bottom:25px;">
          <div style="display:inline-block;background:#eaf4ff;border-radius:50%;padding:18px;font-size:30px;">
            🔐
          </div>
        </div>

        <h2 style="color:#142b49;font-size:24px;text-align:center;margin:0 0 20px;">
          Password Reset Request
        </h2>

        <p style="color:#526176;font-size:15px;line-height:1.8;">
          Hello <strong style="color:#0877d1;">${user.name}</strong>,
        </p>

        <p style="color:#526176;font-size:15px;line-height:1.8;">
          We received a request to reset the password for your Global Wealth account.
          Please use the secure button below to create a new password.
        </p>

        <!-- Account Details -->
        <div style="background:#f1f6fc;border:1px solid #dce8f5;border-radius:10px;padding:20px;margin:24px 0;">

          <h3 style="color:#123b68;margin:0 0 15px;font-size:16px;">
            Account Information
          </h3>

          <p style="margin:10px 0;color:#43546a;font-size:14px;">
            <strong>User ID:</strong>
            <span style="color:#0877d1;font-weight:bold;">
              ${user.userId}
            </span>
          </p>

          <p style="margin:10px 0;color:#43546a;font-size:14px;">
            <strong>Account Name:</strong> ${user.name}
          </p>

        </div>

        <!-- Reset Button -->
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetLink}"
             style="display:inline-block;background:#0877d1;color:#ffffff;text-decoration:none;padding:16px 38px;border-radius:7px;font-size:15px;font-weight:bold;">
            RESET MY PASSWORD →
          </a>
        </div>

        <!-- Security Warning -->
        <div style="background:#fff8e8;border-left:4px solid #f0ad36;padding:17px;border-radius:5px;margin:25px 0;">

          <p style="color:#9a6700;font-size:14px;font-weight:bold;margin:0 0 8px;">
            ⚠️ Important Security Notice
          </p>

          <p style="color:#80652c;font-size:13px;line-height:1.7;margin:0;">
            This password reset link is valid for exactly 1 hour.
            For your security, do not share this link with anyone.
            If you did not request this reset, simply ignore this email.
            Your existing password will remain unchanged.
          </p>

        </div>

        <p style="color:#526176;font-size:14px;line-height:1.8;">
          If the button does not work, copy and paste the reset link into your browser.
        </p>

        <p style="color:#142b49;font-size:15px;font-weight:bold;margin-top:25px;">
          Best Regards,<br>
          Global Wealth Security Team
        </p>

      </div>

      <!-- Footer -->
      <div style="background:#071b3a;padding:23px;text-align:center;">
        <p style="color:#ffffff;font-size:13px;margin:0 0 8px;">
          © ${new Date().getFullYear()} Global Wealth. All Rights Reserved.
        </p>

        <p style="color:#b8cce3;font-size:12px;margin:0;">
          This is an automated security notification.
        </p>
      </div>

    </div>

  </body>
  </html>
  `,
});


    res.json({ message: '✅ Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ====================== RESET PASSWORD ======================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // ✅ Update password
    user.password = newPassword;
    user.transactionPassword = newPassword;

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    // ✅ EMAIL SEND (PREMIUM FORMAT)
    try {
      await sendEmail({
        email: user.email,
        subject: '✅ Global Wealth - Password Reset Successful',
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #218838 100%); padding: 25px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Password Reset Successful</h2>
          </div>
          <div style="padding: 30px; color: #444;">
            <p style="font-size: 16px;">Hello <strong style="color: #218838;">${user.name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Your account passwords have been successfully updated. Please find your new credentials below:</p>
            
            <div style="background: #f4f8f4; border-left: 4px solid #28a745; padding: 15px 20px; border-radius: 0 6px 6px 0; margin: 25px 0;">
              <p style="margin: 5px 0; font-size: 15px;"><b>User ID:</b> ${user.userId}</p>
              <p style="margin: 5px 0; font-size: 15px;"><b>Login Password:</b> ${newPassword}</p>
              <p style="margin: 5px 0; font-size: 15px;"><b>Transaction Password:</b> ${newPassword}</p>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="https:// globalwealth.trade/login" style="background: #03a9f4; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(3,169,244,0.3);">Login to Dashboard</a>
            </div>
          </div>
          <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eaeaea;">
            &copy; ${new Date().getFullYear()} Global Wealth. All rights reserved.
          </div>
        </div>
        `,
      });
    } catch (e) {
      console.log("Email failed:", e.message);
    }

    res.json({
      message: 'Password reset successful',
      userId: user.userId,
      password: newPassword,
      transactionPassword: newPassword,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;