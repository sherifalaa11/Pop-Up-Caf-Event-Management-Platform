const Feedback = require("../models/Feedback");
const Guest = require("../models/Guest");
const Notification = require("../models/Notification");

// FR-44 + FR-50: organizer views collected feedback for an event
async function getFeedback(req, res) {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    const feedback = await Feedback.find(filter).populate("event", "name").sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-45: a guest submits feedback
async function submitFeedback(req, res) {
  try {
    const overall = Number(req.body.overall) || 0;
    const sentiment = overall >= 3 ? "positive" : "negative";
    const feedback = await Feedback.create({ ...req.body, sentiment });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-50: summarized feedback trends for an event
async function getTrends(req, res) {
  try {
    const feedback = await Feedback.find({ event: req.params.eventId });
    const n = feedback.length || 1;
    const avg = (key) => (feedback.reduce((s, f) => s + (f[key] || 0), 0) / n).toFixed(1);
    res.json({
      count: feedback.length,
      averages: {
        overall: avg("overall"),
        food: avg("food"),
        venue: avg("venue"),
        organization: avg("organization"),
      },
      positive: feedback.filter((f) => f.sentiment === "positive").length,
      negative: feedback.filter((f) => f.sentiment === "negative").length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-44: organizer sends a feedback request to all guests of an event
async function requestFeedback(req, res) {
  try {
    const { event } = req.body;
    const guests = await Guest.find({ event });
    const docs = guests.map((g) => ({
      event,
      guest: g._id,
      title: "How was the event?",
      body: "Please share your feedback to help us improve.",
      type: "feedback-request",
    }));
    const created = await Notification.insertMany(docs);
    res.status(201).json({ requestsSent: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getFeedback, submitFeedback, getTrends, requestFeedback };
