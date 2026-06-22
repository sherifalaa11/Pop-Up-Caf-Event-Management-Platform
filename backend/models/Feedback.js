const mongoose = require("mongoose");

// Post-event feedback from a guest (FR-44 / FR-45 / FR-50).
const feedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest" },
    guestName: String,
    overall: { type: Number, min: 1, max: 5 },
    food: { type: Number, min: 1, max: 5 },
    venue: { type: Number, min: 1, max: 5 },
    organization: { type: Number, min: 1, max: 5 },
    comments: String,
    sentiment: String, // "positive" or "negative" (derived from overall rating)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
