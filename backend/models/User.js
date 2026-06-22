const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// One User model for all roles. Role-specific fields are optional.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["organizer", "staff", "vendor", "guest", "venueOwner"],
      required: true,
    },
    phone: String,
    isActive: { type: Boolean, default: true }, // organizer can deactivate (journey 1)
    permissions: [String], // FR-06: team member access permissions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Staff fields
    age: Number,
    speciality: String, // Catering, Seating, Logistics, ...
    employmentType: String, // part-time / full-time

    // Vendor fields (FR-04)
    companyName: String,
    suppliesOffered: [String],
    mainLocation: String,
    pricingList: [{ item: String, price: Number }],
    contact: String,
    // FR-48: organizers rate vendor performance after an event
    ratings: [
      {
        rating: Number,
        comment: String,
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],

    // Guest field
    dietaryPreference: String,

    // Organizer field (FR-11 shortlist)
    shortlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Venue" }],
  },
  { timestamps: true }
);

// Hash password before saving (FR-07 / NFR-04 security)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare a plain password with the stored hash
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
