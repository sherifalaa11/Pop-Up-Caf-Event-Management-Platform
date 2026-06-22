const mongoose = require("mongoose");

// A guest invited to a specific event (FR-36..40).
const guestSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    email: String,
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // linked guest account
    status: {
      type: String,
      enum: ["invited", "attending", "not-attending", "maybe"],
      default: "invited",
    },
    dietaryPreference: String,
    checkedIn: { type: Boolean, default: false },
    invitedAt: { type: Date, default: Date.now },
    rsvpAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guest", guestSchema);
