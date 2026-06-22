const mongoose = require("mongoose");

// Supply request from an organizer to a vendor (FR-28..31).
const sourcingRequestSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ name: String, quantity: Number }],
    deliveryDate: String,
    location: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["not-started", "preparing", "out-for-delivery", "delivered", "arrived"],
      default: "not-started",
    },
    notes: String, // vendor clarifications / delay notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("SourcingRequest", sourcingRequestSchema);
