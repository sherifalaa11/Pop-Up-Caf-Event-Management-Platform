const mongoose = require("mongoose");

// Vendor invoice for completed orders (FR-32..34).
const invoiceSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sourcingRequest: { type: mongoose.Schema.Types.ObjectId, ref: "SourcingRequest" },
    items: [{ description: String, quantity: Number, unitPrice: Number }],
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
    },
    attachmentUrl: String, // link to a supporting document / itemized breakdown
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
