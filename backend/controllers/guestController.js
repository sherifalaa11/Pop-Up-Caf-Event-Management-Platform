const Guest = require("../models/Guest");
const Notification = require("../models/Notification");

// FR-39 + filters: list guests by event / status / dietary / search
async function getGuests(req, res) {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.dietary) filter.dietaryPreference = { $regex: req.query.dietary, $options: "i" };
    if (req.query.q) filter.name = { $regex: req.query.q, $options: "i" };
    const guests = await Guest.find(filter).populate("event", "name date").sort({ name: 1 });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Guest journey 17: invitations addressed to me
async function getMyInvitations(req, res) {
  try {
    const guests = await Guest.find({
      $or: [{ userRef: req.user._id }, { email: req.user.email }],
    }).populate("event");
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getGuest(req, res) {
  try {
    const guest = await Guest.findById(req.params.id).populate("event");
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-36: send a digital invitation (creates the guest + an invitation notification)
async function inviteGuest(req, res) {
  try {
    const guest = await Guest.create(req.body);
    await Notification.create({
      event: guest.event,
      guest: guest._id,
      title: "You're invited!",
      body: "You have received an invitation. Please RSVP.",
      type: "invitation",
    });
    res.status(201).json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateGuest(req, res) {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-37 / FR-38: RSVP + dietary preference
async function rsvp(req, res) {
  try {
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        dietaryPreference: req.body.dietaryPreference,
        rsvpAt: new Date(),
      },
      { new: true }
    );
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-40 / staff journey 11: check a guest in
async function checkIn(req, res) {
  try {
    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { checkedIn: req.body.checkedIn !== false },
      { new: true }
    );
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    res.json(guest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteGuest(req, res) {
  try {
    await Guest.findByIdAndDelete(req.params.id);
    res.json({ message: "Guest removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getGuests,
  getMyInvitations,
  getGuest,
  inviteGuest,
  updateGuest,
  rsvp,
  checkIn,
  deleteGuest,
};
