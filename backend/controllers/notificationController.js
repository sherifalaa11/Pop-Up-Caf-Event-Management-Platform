const Notification = require("../models/Notification");
const Guest = require("../models/Guest");

// FR-41 / journey 6: organizer sends a communication to guests of an event.
// Creates one notification per guest so we can track who has seen it.
async function sendNotification(req, res) {
  try {
    const { event, title, body, type, guestIds } = req.body;
    let guests;
    if (guestIds && guestIds.length) {
      guests = await Guest.find({ _id: { $in: guestIds } });
    } else {
      guests = await Guest.find({ event });
    }
    const docs = guests.map((g) => ({
      event,
      guest: g._id,
      title,
      body,
      type: type || "announcement",
    }));
    const created = await Notification.insertMany(docs);
    res.status(201).json({ sent: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Organizer: see all notifications for an event with who has seen them
async function getEventNotifications(req, res) {
  try {
    const notifications = await Notification.find({ event: req.params.eventId })
      .populate("guest", "name email")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-42 / guest journey 19: notifications for the logged-in guest
async function getMyNotifications(req, res) {
  try {
    const myGuests = await Guest.find({
      $or: [{ userRef: req.user._id }, { email: req.user.email }],
    }).select("_id");
    const ids = myGuests.map((g) => g._id);
    const notifications = await Notification.find({ guest: { $in: ids } })
      .populate("event", "name date")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Guest marks a message as seen
async function markSeen(req, res) {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { seen: true, seenAt: new Date() },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// journey 6: send a follow-up to guests who have not seen messages yet
async function followUpUnseen(req, res) {
  try {
    const { event, title, body } = req.body;
    const unseen = await Notification.find({ event, seen: false }).select("guest");
    const guestIds = [...new Set(unseen.map((n) => n.guest.toString()))];
    const docs = guestIds.map((g) => ({
      event,
      guest: g,
      title: title || "Reminder",
      body: body || "Please check your earlier message.",
      type: "day-of",
    }));
    const created = await Notification.insertMany(docs);
    res.status(201).json({ followUpSent: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  sendNotification,
  getEventNotifications,
  getMyNotifications,
  markSeen,
  followUpUnseen,
};
