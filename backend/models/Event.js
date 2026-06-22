const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    date: String, // YYYY-MM-DD
    time: String,
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
    venueName: String, // simple display fallback
    dressCode: String,
    agenda: String,
    status: {
      type: String,
      enum: ["planning", "upcoming", "today", "completed"],
      default: "planning",
    },
    // schedule / milestones (FR-17)
    schedule: [{ title: String, date: String, done: { type: Boolean, default: false } }],
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // venue layout designer data (FR-24 / FR-25)
    layout: {
      elements: [
        {
          id: String,
          type: { type: String }, // table, chair, booth, stage, door, ... ("type" needs this form in Mongoose)
          x: Number,
          y: Number,
          w: Number,
          h: Number,
          label: String,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
