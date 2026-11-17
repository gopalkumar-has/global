 

const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Agar aapka Admin model hai
const User = require("../models/User");   // User model jisme role 'admin' hota hai

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

console.log("ADMIN TOKEN DEBUG:", {
  adminId: decoded.adminId,
  role: decoded.role,
  id: decoded.id
});
    
    // 🔥 THE MISSING DATABASE CHECK 🔥
    const adminDbId = decoded.adminId || decoded.id || decoded._id;
    let isAdminValid = false;

    // 1. Pehle Admin collection me check karo
    const adminRecord = await Admin.findById(adminDbId);
    console.log("ADMIN DB CHECK:", {
  adminDbId,
  adminFound: !!adminRecord,
  adminRole: adminRecord?.role
});
    if (adminRecord) {
        isAdminValid = true;
    } else {
        // 2. Agar wahan nahi hai, toh User collection me check karo ki role admin hai ya nahi
        const adminUser = await User.findById(adminDbId);
        if (adminUser && adminUser.role === 'admin') {
            isAdminValid = true;
        }
    }

    // Agar Database me admin valid nahi mila (ya kisi ne normal token bhej diya)
    if (!isAdminValid) {
      console.log("❌ Blocked: Old, Invalid, or Normal User token tried to access Admin route!");
      return res.status(403).json({ message: "Access denied. Admin not found or token revoked." });
    }

    req.admin = decoded;
    req.user = decoded; // Fallback ke liye
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = verifyAdmin;