const mongoose = require("mongoose");

// One notification document per guest per message, so we can track
// received / seen status and send follow-ups (FR-41 / FR-42).
const notificationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest" },
    title: String,
    body: String,
    type: {
      type: String,
      enum: ["invitation", "announcement", "day-of", "reminder", "feedback-request"],
      default: "announcement",
    },
    seen: { type: Boolean, default: false },
    seenAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
