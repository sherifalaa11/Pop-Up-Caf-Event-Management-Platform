const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "popeyez_dev_secret_change_me";

// Creates a signed token for a user id.
function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

// protect: requires a valid "Authorization: Bearer <token>" header.
// Loads the user and attaches it to req.user.
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// requireRole: only lets the listed roles through (NFR-02 role-based access).
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this action" });
    }
    next();
  };
}

module.exports = { signToken, protect, requireRole, JWT_SECRET };
