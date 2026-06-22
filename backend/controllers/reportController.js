const Guest = require("../models/Guest");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const SourcingRequest = require("../models/SourcingRequest");
const Invoice = require("../models/Invoice");
const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const User = require("../models/User");

// Turn an array of flat objects into CSV text.
function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","));
  }
  return lines.join("\n");
}

// Send either JSON or a downloadable CSV based on ?format=csv
function send(res, jsonData, csvRows, filename) {
  if (csvRows && jsonData.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    return res.send(toCsv(csvRows));
  }
  res.json(jsonData);
}

// FR-46 / FR-43: attendance report (with CSV export)
async function attendance(req, res) {
  try {
    const guests = await Guest.find({ event: req.params.eventId });
    const data = {
      total: guests.length,
      attending: guests.filter((g) => g.status === "attending").length,
      maybe: guests.filter((g) => g.status === "maybe").length,
      notAttending: guests.filter((g) => g.status === "not-attending").length,
      checkedIn: guests.filter((g) => g.checkedIn).length,
      format: req.query.format,
    };
    const csvRows = guests.map((g) => ({
      name: g.name,
      email: g.email,
      rsvp: g.status,
      dietary: g.dietaryPreference,
      checkedIn: g.checkedIn ? "yes" : "no",
    }));
    send(res, data, csvRows, "attendance.csv");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-47: financial summary / expense report (with CSV export)
async function financial(req, res) {
  try {
    const eventId = req.params.eventId;
    const budget = await Budget.findOne({ event: eventId });
    const expenses = await Expense.find({ event: eventId });
    const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const planned = budget ? budget.plannedTotal : 0;

    const data = {
      plannedTotal: planned,
      totalSpent,
      remaining: planned - totalSpent,
      expenseCount: expenses.length,
      format: req.query.format,
    };
    const csvRows = expenses.map((e) => ({
      category: e.category,
      description: e.description,
      amount: e.amount,
      date: e.date,
    }));
    send(res, data, csvRows, "financial.csv");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-48: vendor performance (deliveries, invoices, average rating)
async function vendorPerformance(req, res) {
  try {
    const vendors = await User.find({ role: "vendor" }).select("name companyName ratings");
    const result = [];
    for (const v of vendors) {
      const requests = await SourcingRequest.find({ vendor: v._id });
      const invoices = await Invoice.find({ vendor: v._id });
      const ratings = v.ratings || [];
      const avgRating =
        ratings.length > 0
          ? (ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length).toFixed(1)
          : null;
      result.push({
        id: v._id,
        name: v.companyName || v.name,
        totalRequests: requests.length,
        delivered: requests.filter((r) =>
          ["delivered", "arrived"].includes(r.deliveryStatus)
        ).length,
        invoices: invoices.length,
        invoiceTotal: invoices.reduce((s, i) => s + (i.amount || 0), 0),
        avgRating,
        ratingCount: ratings.length,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-48: organizer rates a vendor's performance
async function rateVendor(req, res) {
  try {
    const vendor = await User.findById(req.params.vendorId);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }
    vendor.ratings.push({
      rating: req.body.rating,
      comment: req.body.comment,
      event: req.body.event,
      by: req.user._id,
    });
    await vendor.save();
    res.json({ message: "Rating saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-49: combined analytics report for an event (costs + attendance + outcomes)
async function analytics(req, res) {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId).populate("venue", "name city");
    const guests = await Guest.find({ event: eventId });
    const budget = await Budget.findOne({ event: eventId });
    const expenses = await Expense.find({ event: eventId });
    const feedback = await Feedback.find({ event: eventId });
    const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    res.json({
      event: { name: event?.name, date: event?.date, venue: event?.venue?.name },
      attendance: {
        invited: guests.length,
        attending: guests.filter((g) => g.status === "attending").length,
        checkedIn: guests.filter((g) => g.checkedIn).length,
      },
      costs: {
        planned: budget ? budget.plannedTotal : 0,
        spent: totalSpent,
        remaining: (budget ? budget.plannedTotal : 0) - totalSpent,
      },
      outcomes: {
        feedbackCount: feedback.length,
        positive: feedback.filter((f) => f.sentiment === "positive").length,
        negative: feedback.filter((f) => f.sentiment === "negative").length,
        avgOverall:
          feedback.length > 0
            ? (feedback.reduce((s, f) => s + (f.overall || 0), 0) / feedback.length).toFixed(1)
            : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { attendance, financial, vendorPerformance, rateVendor, analytics };
