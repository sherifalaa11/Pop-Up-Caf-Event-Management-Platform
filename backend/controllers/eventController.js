const Event = require("../models/Event");
const Task = require("../models/Task");
const Guest = require("../models/Guest");
const Feedback = require("../models/Feedback");
const SourcingRequest = require("../models/SourcingRequest");

// FR: list events (organizer's own) with optional date/status filters
async function getEvents(req, res) {
  try {
    const filter = { organizer: req.user._id };
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;
    const events = await Event.find(filter).populate("venue", "name city").sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Staff: events I'm part of (journey 9)
async function getMyEvents(req, res) {
  try {
    const filter = { teamMembers: req.user._id };
    if (req.query.date) filter.date = req.query.date;
    const events = await Event.find(filter).populate("venue", "name city").sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id)
      .populate("venue")
      .populate("teamMembers", "name role speciality");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-16: create a new event
async function createEvent(req, res) {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-17: update event (schedule, milestones, status, agenda...)
async function updateEvent(req, res) {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteEvent(req, res) {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-24: save the venue layout designed by the organizer
async function saveLayout(req, res) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { layout: { elements: req.body.elements || [] } },
      { new: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event.layout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-25: anyone on the team can view the shared layout
async function getLayout(req, res) {
  try {
    const event = await Event.findById(req.params.id).select("layout name");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event.layout || { elements: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Manage team members on an event
async function setTeam(req, res) {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { teamMembers: req.body.teamMembers || [] },
      { new: true }
    ).populate("teamMembers", "name role speciality");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-26: organizer daily dashboard summary
async function getDashboard(req, res) {
  try {
    const events = await Event.find({ organizer: req.user._id });
    const eventIds = events.map((e) => e._id);
    const today = new Date().toISOString().slice(0, 10);

    const todaysEvents = events.filter((e) => e.date === today || e.status === "today");
    const upcoming = events.filter((e) => e.date >= today && e.status !== "completed");

    const tasks = await Task.find({ event: { $in: eventIds } });
    const doneTasks = tasks.filter((t) => t.status === "done").length;

    // Reminders: tasks not done that are due within the next 3 days (or overdue)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 3);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const eventNames = {};
    events.forEach((e) => (eventNames[e._id.toString()] = e.name));
    const dueSoonTasks = tasks
      .filter((t) => t.status !== "done" && t.dueDate && t.dueDate <= cutoffStr)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
      .map((t) => ({ title: t.title, dueDate: t.dueDate, status: t.status, event: eventNames[t.event.toString()] }));

    const feedback = await Feedback.find({ event: { $in: eventIds } });
    const positive = feedback.filter((f) => f.sentiment === "positive").length;
    const negative = feedback.filter((f) => f.sentiment === "negative").length;
    const avgOverall =
      feedback.length > 0
        ? (feedback.reduce((s, f) => s + (f.overall || 0), 0) / feedback.length).toFixed(1)
        : 0;

    res.json({
      totalEvents: events.length,
      todaysEvents,
      upcomingCount: upcoming.length,
      taskProgress: { total: tasks.length, done: doneTasks },
      feedback: { positive, negative, avgOverall, total: feedback.length },
      dueSoonTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-27 / day-of operations: live counts for one event
async function getDayOf(req, res) {
  try {
    const eventId = req.params.id;
    const guests = await Guest.find({ event: eventId });
    const tasks = await Task.find({ event: eventId });
    const vendors = await SourcingRequest.find({ event: eventId }).populate("vendor", "name companyName");

    res.json({
      totalGuests: guests.length,
      attending: guests.filter((g) => g.status === "attending").length,
      arrivedGuests: guests.filter((g) => g.checkedIn).length,
      tasks: { total: tasks.length, done: tasks.filter((t) => t.status === "done").length },
      vendors: vendors.map((v) => ({
        id: v._id,
        name: v.vendor ? v.vendor.companyName || v.vendor.name : "Vendor",
        deliveryStatus: v.deliveryStatus,
        arrived: v.deliveryStatus === "arrived",
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getEvents,
  getMyEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  saveLayout,
  getLayout,
  setTeam,
  getDashboard,
  getDayOf,
};
