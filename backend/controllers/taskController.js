const Task = require("../models/Task");

// FR-18/20/27 + journey 9: list tasks with filters
// /api/tasks?event=..&status=..&speciality=..
async function getTasks(req, res) {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.speciality) filter.speciality = req.query.speciality;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    const tasks = await Task.find(filter)
      .populate("assignedTo", "name speciality")
      .populate("event", "name date")
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Staff: my assigned tasks (FR-19, journey 9)
async function getMyTasks(req, res) {
  try {
    const filter = { assignedTo: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const tasks = await Task.find(filter).populate("event", "name date").sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-18 / FR-20: create a task (assigned or unassigned)
async function createTask(req, res) {
  try {
    const data = { ...req.body };
    data.status = data.assignedTo ? "pending" : "unassigned";
    const task = await Task.create(data);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateTask(req, res) {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-18: assign a task to a staff member
async function assignTask(req, res) {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.assignedTo, status: "pending" },
      { new: true }
    ).populate("assignedTo", "name speciality");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-19: staff update the status of an assigned task
async function updateStatus(req, res) {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteTask(req, res) {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getTasks, getMyTasks, createTask, updateTask, assignTask, updateStatus, deleteTask };
