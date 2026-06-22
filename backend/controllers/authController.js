const User = require("../models/User");
const { signToken } = require("../middleware/auth");

// Strip the password before sending a user back to the client.
function publicUser(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.password;
  return u;
}

// FR-01: create an account
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const allowedSelfRoles = ["organizer", "vendor", "venueOwner", "guest"];
    const finalRole = allowedSelfRoles.includes(role) ? role : "guest";

    const user = await User.create({ ...req.body, role: finalRole });
    const token = signToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-02: log in securely
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Return the logged-in user (used by the frontend on refresh)
async function me(req, res) {
  res.json(req.user);
}

// FR-07: reset password (simplified - no real email is sent)
async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(404).json({ message: "No account with that email" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login, me, resetPassword };
