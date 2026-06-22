const User = require("../models/User");

// List users, optionally filtered (FR: staff list + filters, journey "Team Members")
// e.g. /api/users?role=staff&speciality=Catering&employmentType=full-time
async function getUsers(req, res) {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.speciality) filter.speciality = req.query.speciality;
    if (req.query.employmentType) filter.employmentType = req.query.employmentType;
    if (req.query.q) filter.name = { $regex: req.query.q, $options: "i" };
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Organizer creates accounts for team members, guests and vendors (journey 1)
async function createUser(req, res) {
  try {
    const { email } = req.body;
    const exists = await User.findOne({ email: (email || "").toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already in use" });
    const user = await User.create({ ...req.body, createdBy: req.user._id });
    const out = user.toObject();
    delete out.password;
    res.status(201).json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update own profile (FR-03 / FR-04 / FR-05)
async function updateMe(req, res) {
  try {
    const updates = { ...req.body };
    delete updates.role; // can't change own role here
    delete updates.isActive;
    if (updates.password) {
      req.user.password = updates.password;
      delete updates.password;
      await req.user.save();
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Organizer updates any user (incl. permissions FR-06)
async function updateUser(req, res) {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      const u = await User.findById(req.params.id);
      if (u) {
        u.password = updates.password;
        await u.save();
      }
      delete updates.password;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Deactivate / reactivate a stakeholder account (journey 1)
async function setActive(req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive !== false },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getUsers, getUser, createUser, updateMe, updateUser, setActive };
