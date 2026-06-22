const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    eventType: String,
    date: String,
    attendeesExpected: Number,
    specialRequirements: String,
    status: {
      type: String,
      enum: ["pending", "approved", "declined", "cancelled"],
      default: "pending",
    },
    // lightweight negotiation thread (owner counter-proposals, etc.)
    messages: [
      {
        sender: String, // "organizer" or "owner"
        text: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
