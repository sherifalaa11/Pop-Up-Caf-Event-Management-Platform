const Booking = require("../models/Booking");
const Venue = require("../models/Venue");

// List bookings relevant to the logged-in user.
// Organizer -> their own requests. Venue owner -> requests for their venues.
async function getBookings(req, res) {
  try {
    let bookings;
    if (req.user.role === "venueOwner") {
      const myVenues = await Venue.find({ owner: req.user._id }).select("_id");
      const ids = myVenues.map((v) => v._id);
      const filter = { venue: { $in: ids } };
      if (req.query.status) filter.status = req.query.status;
      bookings = await Booking.find(filter)
        .populate("venue", "name city")
        .populate("organizer", "name email")
        .sort({ createdAt: -1 });
    } else {
      const filter = { organizer: req.user._id };
      if (req.query.status) filter.status = req.query.status;
      bookings = await Booking.find(filter)
        .populate("venue", "name city pricePerDay")
        .sort({ createdAt: -1 });
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getBooking(req, res) {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("venue")
      .populate("organizer", "name email");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-12: request a venue booking
async function createBooking(req, res) {
  try {
    const booking = await Booking.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-13 / owner journey 24: approve or decline a booking request
async function respondBooking(req, res) {
  try {
    const { status, message } = req.body; // status: approved | declined
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = status;
    if (message) booking.messages.push({ sender: "owner", text: message });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-15: cancel a booking request before it is confirmed
async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "approved") {
      return res.status(400).json({ message: "Approved bookings cannot be cancelled here" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Add a message to the booking thread (counter-proposal / clarification)
async function addMessage(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const sender = req.user.role === "venueOwner" ? "owner" : "organizer";
    booking.messages.push({ sender, text: req.body.text });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getBookings, getBooking, createBooking, respondBooking, cancelBooking, addMessage };
