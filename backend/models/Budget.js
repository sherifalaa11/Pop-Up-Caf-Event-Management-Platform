const mongoose = require("mongoose");

// Planned budget for an event (FR-21). Actual spending lives in Expense.
const budgetSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    plannedTotal: { type: Number, default: 0 },
    categories: [{ name: String, plannedAmount: Number }], // budget decomposition
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
