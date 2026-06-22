const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    title: { type: String, required: true },
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    speciality: String, // Catering, Seating, Logistics, ...
    status: {
      type: String,
      enum: ["unassigned", "pending", "in-progress", "done"],
      default: "unassigned",
    },
    dueDate: String, // YYYY-MM-DD (used for reminders)
    day: String, // label for the guided daily workflow
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
