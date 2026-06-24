const SourcingRequest = require("../models/SourcingRequest");

// List sourcing requests relevant to the user.
// Organizer -> requests they sent. Vendor -> requests sent to them.
async function getRequests(req, res) {
  try {
    const filter = {};
    if (req.user.role === "vendor") filter.vendor = req.user._id;
    else if (req.user.role === "organizer") filter.organizer = req.user._id;
    if (req.query.event) filter.event = req.query.event;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.deliveryStatus) filter.deliveryStatus = req.query.deliveryStatus;

    const requests = await SourcingRequest.find(filter)
      .populate("vendor", "name companyName mainLocation")
      .populate("organizer", "name phone email")
      .populate("event", "name date")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getRequest(req, res) {
  try {
    const request = await SourcingRequest.findById(req.params.id)
      .populate("vendor", "name companyName")
      .populate("organizer", "name phone email")
      .populate("event", "name date");
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-28: send a sourcing request to a vendor
async function createRequest(req, res) {
  try {
    const request = await SourcingRequest.create({ ...req.body, organizer: req.user._id });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-29: vendor accepts or declines a request
async function respondRequest(req, res) {
  try {
    const { status, notes } = req.body; // accepted | declined
    const request = await SourcingRequest.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.status = status;
    if (status === "accepted") request.deliveryStatus = "preparing";
    if (notes) request.notes = notes;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// FR-30: vendor updates the delivery progress
async function updateDelivery(req, res) {
  try {
    const request = await SourcingRequest.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.deliveryStatus = req.body.deliveryStatus;
    if (req.body.notes !== undefined) request.notes = req.body.notes;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Staff marks a vendor as arrived at the venue (journey 11)
async function markArrived(req, res) {
  try {
    const request = await SourcingRequest.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus: "arrived" },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getRequests, getRequest, createRequest, respondRequest, updateDelivery, markArrived };
