const Message = require("../models/Message");
const User = require("../models/User");

// FR-35: all messages involving the logged-in user
async function getMessages(req, res) {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    })
      .populate("from", "name role")
      .populate("to", "name role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Conversation thread with one other user
async function getThread(req, res) {
  try {
    const other = req.params.userId;
    const messages = await Message.find({
      $or: [
        { from: req.user._id, to: other },
        { from: other, to: req.user._id },
      ],
    })
      .populate("from", "name role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-35: send a message
async function sendMessage(req, res) {
  try {
    const message = await Message.create({ ...req.body, from: req.user._id });
    const populated = await message.populate("from", "name role");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// People the user can message (organizers <-> vendors)
async function getContacts(req, res) {
  try {
    const wanted = req.user.role === "vendor" ? "organizer" : "vendor";
    const contacts = await User.find({ role: wanted, isActive: true }).select("name role companyName");
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function markRead(req, res) {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMessages, getThread, sendMessage, getContacts, markRead };
