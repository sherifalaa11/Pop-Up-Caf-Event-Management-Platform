const Venue = require("../models/Venue");
const User = require("../models/User");

// FR-08/09/10: browse + filter venues
// /api/venues?city=Cairo&minCapacity=100&maxPrice=2000&date=2026-07-01
async function getVenues(req, res) {
  try {
    const filter = { isActive: true };
    if (req.query.city) filter.city = { $regex: req.query.city, $options: "i" };
    if (req.query.minCapacity) filter.capacity = { $gte: Number(req.query.minCapacity) };
    if (req.query.maxPrice) filter.pricePerDay = { $lte: Number(req.query.maxPrice) };

    let venues = await Venue.find(filter).populate("owner", "name companyName contact");

    // filter out venues unavailable on a given date
    if (req.query.date) {
      venues = venues.filter((v) => !(v.unavailableDates || []).includes(req.query.date));
    }
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Venues owned by the logged-in venue owner
async function getMyVenues(req, res) {
  try {
    const venues = await Venue.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getVenue(req, res) {
  try {
    const venue = await Venue.findById(req.params.id).populate("owner", "name companyName contact");
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-05 / owner journey 23: create a listing
async function createVenue(req, res) {
  try {
    const venue = await Venue.create({ ...req.body, owner: req.user._id });
    res.status(201).json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateVenue(req, res) {
  try {
    const venue = await Venue.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteVenue(req, res) {
  try {
    const venue = await Venue.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json({ message: "Venue removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-11: add / remove a venue from the organizer's shortlist
async function toggleShortlist(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const id = req.params.id;
    const exists = user.shortlist.some((v) => v.toString() === id);
    if (exists) {
      user.shortlist = user.shortlist.filter((v) => v.toString() !== id);
    } else {
      user.shortlist.push(id);
    }
    await user.save();
    res.json({ shortlist: user.shortlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get the organizer's shortlisted venues (full details)
async function getShortlist(req, res) {
  try {
    const user = await User.findById(req.user._id).populate("shortlist");
    res.json(user.shortlist || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getVenues,
  getMyVenues,
  getVenue,
  createVenue,
  updateVenue,
  deleteVenue,
  toggleShortlist,
  getShortlist,
};
