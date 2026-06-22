const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

// FR-21/22/23: budget + expenses + computed summary for an event
async function getBudgetForEvent(req, res) {
  try {
    const eventId = req.params.eventId;
    let budget = await Budget.findOne({ event: eventId });
    if (!budget) budget = await Budget.create({ event: eventId, plannedTotal: 0, categories: [] });
    const expenses = await Expense.find({ event: eventId }).sort({ date: -1 });

    const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    // planned vs actual per category (FR-23)
    const byCategory = (budget.categories || []).map((c) => {
      const actual = expenses
        .filter((e) => e.category === c.name)
        .reduce((s, e) => s + (e.amount || 0), 0);
      return {
        name: c.name,
        planned: c.plannedAmount || 0,
        actual,
        difference: (c.plannedAmount || 0) - actual,
      };
    });

    res.json({
      budget,
      expenses,
      summary: {
        plannedTotal: budget.plannedTotal || 0,
        totalSpent,
        remaining: (budget.plannedTotal || 0) - totalSpent,
        byCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-21: create / edit the planned budget + decomposition
async function setBudget(req, res) {
  try {
    const eventId = req.params.eventId;
    const budget = await Budget.findOneAndUpdate(
      { event: eventId },
      {
        event: eventId,
        plannedTotal: req.body.plannedTotal || 0,
        categories: req.body.categories || [],
      },
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-22: record an actual expense
async function addExpense(req, res) {
  try {
    const expense = await Expense.create({ ...req.body, event: req.params.eventId });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateExpense(req, res) {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteExpense(req, res) {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getBudgetForEvent, setBudget, addExpense, updateExpense, deleteExpense };
