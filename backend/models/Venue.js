const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: String,
    city: String,
    capacity: Number,
    sizeSqm: Number,
    amenities: [String],
    pricePerDay: Number,
    images: [String], // emoji or image url placeholders
    unavailableDates: [String], // dates marked unavailable (YYYY-MM-DD)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", venueSchema);
