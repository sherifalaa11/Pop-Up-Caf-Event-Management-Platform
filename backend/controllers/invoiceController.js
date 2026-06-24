const Invoice = require("../models/Invoice");
const Message = require("../models/Message");

// List invoices. Vendor -> their own. Organizer -> invoices to review.
async function getInvoices(req, res) {
  try {
    const filter = {};
    if (req.user.role === "vendor") filter.vendor = req.user._id;
    else if (req.user.role === "organizer") filter.organizer = req.user._id;
    if (req.query.event) filter.event = req.query.event;
    if (req.query.status) filter.status = req.query.status;

    const invoices = await Invoice.find(filter)
      .populate("vendor", "name companyName")
      .populate("event", "name date")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getInvoice(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("vendor", "name companyName")
      .populate("event", "name date");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-32: vendor submits an invoice for completed orders
async function createInvoice(req, res) {
  try {
    const items = req.body.items || [];
    const amount =
      req.body.amount ||
      items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
    const invoice = await Invoice.create({ ...req.body, amount, vendor: req.user._id });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-33 / FR-34: organizer reviews -> approve / reject / mark paid
async function reviewInvoice(req, res) {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Notify the vendor that their invoice was reviewed (journey 16)
    await Message.create({
      from: req.user._id,
      to: invoice.vendor,
      event: invoice.event,
      text: `Your invoice (amount $${invoice.amount}) was ${invoice.status}.`,
    });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getInvoices, getInvoice, createInvoice, reviewInvoice };
