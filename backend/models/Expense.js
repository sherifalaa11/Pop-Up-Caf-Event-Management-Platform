const mongoose = require("mongoose");

// A single actual expense record (FR-22).
const expenseSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    category: String,
    description: String,
    amount: { type: Number, default: 0 },
    date: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
