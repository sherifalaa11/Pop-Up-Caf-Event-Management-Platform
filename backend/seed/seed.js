// ============================================================================
// Seed script — wipes every collection and inserts realistic dummy data.
// Run with:  npm run seed
//
// It creates ONE primary login account per role (the 5 you log in with) plus
// supporting records (extra staff/vendors/guests/owners/venues/events/...) so
// that EVERY page for EVERY role is populated with data.
//
//   Primary logins (password: password123)
//     Organizer    organizer@popeyez.com
//     Team / Staff staff@popeyez.com
//     Vendor       vendor@popeyez.com
//     Guest        guest@popeyez.com
//     Venue Owner  owner@popeyez.com
// ============================================================================
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Task = require("../models/Task");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const SourcingRequest = require("../models/SourcingRequest");
const Invoice = require("../models/Invoice");
const Message = require("../models/Message");
const Guest = require("../models/Guest");
const Notification = require("../models/Notification");
const Feedback = require("../models/Feedback");

// --- date helpers (relative to today, so the demo always looks current) ---
const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const TODAY = iso(today);
const PAST = addDays(-20);
const SOON = addDays(14);

async function run() {
  await connectDB();

  console.log("Clearing old data...");
  await Promise.all([
    User.deleteMany({}),
    Venue.deleteMany({}),
    Booking.deleteMany({}),
    Event.deleteMany({}),
    Task.deleteMany({}),
    Budget.deleteMany({}),
    Expense.deleteMany({}),
    SourcingRequest.deleteMany({}),
    Invoice.deleteMany({}),
    Message.deleteMany({}),
    Guest.deleteMany({}),
    Notification.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  const pw = await bcrypt.hash("password123", 10); // one shared password for all demo accounts

  // ======================================================================
  // USERS — one PRIMARY login per role (index 0) + supporting accounts
  // ======================================================================
  console.log("Creating users...");

  // -- Organizer (primary) --
  // NOTE: all users are inserted with insertMany so the pre-save hash hook is
  // skipped (pw is already a bcrypt hash). Using User.create here would double-hash.
  const [organizer] = await User.insertMany([
    { name: "Sara Adel", email: "organizer@popeyez.com", password: pw, role: "organizer", phone: "+20 100 111 2222" },
  ]);

  // -- Venue Owners (owner@ is primary) --
  const owners = await User.insertMany([
    { name: "Omar Hassan", email: "owner@popeyez.com", password: pw, role: "venueOwner", companyName: "Downtown Spaces", contact: "+20 100 000 0001" },
    { name: "Layla Ibrahim", email: "owner2@popeyez.com", password: pw, role: "venueOwner", companyName: "Nile View Properties", contact: "+20 100 000 0002" },
  ]);
  const owner = owners[0];

  // -- Vendors (vendor@ is primary) --
  const vendors = await User.insertMany([
    {
      name: "Hassan Coffee Co", email: "vendor@popeyez.com", password: pw, role: "vendor",
      companyName: "Hassan Coffee Co", mainLocation: "Cairo", contact: "+20 122 333 4444",
      suppliesOffered: ["Coffee Beans", "Espresso Machines", "Syrups"],
      pricingList: [{ item: "Coffee Beans (kg)", price: 15 }, { item: "Espresso Machine Rental", price: 200 }],
    },
    {
      name: "Fresh Bakes", email: "vendor2@popeyez.com", password: pw, role: "vendor",
      companyName: "Fresh Bakes", mainLocation: "Cairo", contact: "+20 122 555 6666",
      suppliesOffered: ["Pastries", "Bread", "Cakes"],
      pricingList: [{ item: "Croissant (dozen)", price: 40 }, { item: "Cake", price: 120 }],
    },
    {
      name: "Green Cups", email: "vendor3@popeyez.com", password: pw, role: "vendor",
      companyName: "Green Cups", mainLocation: "Giza", contact: "+20 122 777 8888",
      suppliesOffered: ["Cups", "Napkins", "Compostable Plates"],
      pricingList: [{ item: "Cups (100 pack)", price: 25 }, { item: "Napkins (500 pack)", price: 18 }],
    },
  ]);
  const vendor = vendors[0];

  // -- Staff (staff@ is primary) --
  const staff = await User.insertMany([
    { name: "Mike Tawfik", email: "staff@popeyez.com", password: pw, role: "staff", speciality: "Catering", employmentType: "full-time", age: 28, permissions: ["tasks", "guests"] },
    { name: "Nour Khaled", email: "staff2@popeyez.com", password: pw, role: "staff", speciality: "Seating", employmentType: "part-time", age: 24 },
    { name: "Karim Adel", email: "staff3@popeyez.com", password: pw, role: "staff", speciality: "Logistics", employmentType: "full-time", age: 31 },
    { name: "Dina Samir", email: "staff4@popeyez.com", password: pw, role: "staff", speciality: "Catering", employmentType: "part-time", age: 26 },
    { name: "Tarek Fouad", email: "staff5@popeyez.com", password: pw, role: "staff", speciality: "Logistics", employmentType: "full-time", age: 35 },
  ]);
  const primaryStaff = staff[0];

  // -- Guests (guest@ is primary) --
  const guestUsers = await User.insertMany([
    { name: "Ahmed Mohamed", email: "guest@popeyez.com", password: pw, role: "guest", dietaryPreference: "Vegetarian" },
    { name: "Mona Said", email: "guest2@popeyez.com", password: pw, role: "guest", dietaryPreference: "Vegan" },
  ]);
  const primaryGuest = guestUsers[0];

  // ======================================================================
  // VENUES — owner@ owns 4, owner2 owns 3
  // ======================================================================
  console.log("Creating venues...");
  const img = (seed) => `https://picsum.photos/seed/${seed}/600/400`;
  const venues = await Venue.insertMany([
    { owner: owner._id, name: "Downtown Art Loft", description: "Bright loft in the heart of Cairo, perfect for intimate pop-ups.", city: "Cairo", capacity: 80, sizeSqm: 120, amenities: ["WiFi", "Sound System", "Kitchenette"], pricePerDay: 1500, images: ["🎨", img("loft")], unavailableDates: [] },
    { owner: owner._id, name: "Rooftop Garden", description: "Open-air rooftop with skyline views.", city: "Cairo", capacity: 150, sizeSqm: 200, amenities: ["Outdoor", "Bar", "Lighting"], pricePerDay: 2500, images: ["🌿", img("rooftop")], unavailableDates: [] },
    { owner: owner._id, name: "Giza Warehouse Studio", description: "Industrial-style warehouse, blank canvas.", city: "Giza", capacity: 250, sizeSqm: 350, amenities: ["High Ceilings", "Parking", "Loading Dock"], pricePerDay: 3000, images: ["🏭", img("warehouse")], unavailableDates: [] },
    { owner: owner._id, name: "Maadi Green Patio", description: "Leafy patio in a quiet neighbourhood.", city: "Cairo", capacity: 100, sizeSqm: 150, amenities: ["Outdoor", "WiFi", "Bar"], pricePerDay: 1800, images: ["🌳", img("patio")], unavailableDates: [] },
    { owner: owners[1]._id, name: "Nile View Hall", description: "Elegant hall overlooking the Nile.", city: "Cairo", capacity: 300, sizeSqm: 400, amenities: ["AC", "Parking", "Stage", "WiFi"], pricePerDay: 4000, images: ["🏛️", img("nilehall")], unavailableDates: [SOON] },
    { owner: owners[1]._id, name: "Alexandria Beach Deck", description: "Seaside wooden deck for breezy events.", city: "Alexandria", capacity: 120, sizeSqm: 180, amenities: ["Sea View", "Outdoor", "Sound System"], pricePerDay: 2200, images: ["🏖️", img("beachdeck")], unavailableDates: [] },
    { owner: owners[1]._id, name: "Cozy Corner Cafe Space", description: "Small charming spot for tasting events.", city: "Cairo", capacity: 40, sizeSqm: 60, amenities: ["WiFi", "Kitchenette"], pricePerDay: 900, images: ["☕", img("cozycafe")], unavailableDates: [] },
  ]);

  // organizer shortlists a couple of venues
  await User.findByIdAndUpdate(organizer._id, { shortlist: [venues[1]._id, venues[4]._id] });

  // ======================================================================
  // EVENTS — past / today / upcoming, primary staff on ALL THREE
  // ======================================================================
  console.log("Creating events...");
  const events = await Event.insertMany([
    {
      organizer: organizer._id, name: "Spring Coffee Pop-Up", description: "A weekend celebrating spring blends.",
      date: PAST, time: "10:00", venue: venues[0]._id, venueName: venues[0].name, status: "completed",
      dressCode: "Casual", agenda: "Tastings, latte art workshop, live music",
      teamMembers: [primaryStaff._id, staff[1]._id],
      schedule: [
        { title: "Confirm venue", date: addDays(-30), done: true },
        { title: "Order supplies", date: addDays(-25), done: true },
        { title: "Send invitations", date: addDays(-23), done: true },
      ],
      layout: { elements: [
        { id: "t1", type: "table", x: 40, y: 40, w: 80, h: 80, label: "Table 1" },
        { id: "b1", type: "booth", x: 220, y: 60, w: 120, h: 70, label: "Coffee Bar" },
        { id: "s1", type: "stage", x: 80, y: 220, w: 160, h: 60, label: "Stage" },
        { id: "d1", type: "door", x: 380, y: 20, w: 60, h: 30, label: "Entrance" },
      ] },
    },
    {
      organizer: organizer._id, name: "Rooftop Espresso Night", description: "Evening espresso under the stars.",
      date: TODAY, time: "18:00", venue: venues[1]._id, venueName: venues[1].name, status: "today",
      dressCode: "Smart Casual", agenda: "Welcome drinks, brewing demo, networking",
      teamMembers: [primaryStaff._id, staff[2]._id],
      schedule: [
        { title: "Final headcount", date: TODAY, done: true },
        { title: "Setup venue", date: TODAY, done: false },
      ],
      layout: { elements: [
        { id: "t1", type: "table", x: 50, y: 50, w: 80, h: 80, label: "VIP" },
        { id: "c1", type: "chair", x: 160, y: 70, w: 40, h: 40, label: "Seat" },
        { id: "b1", type: "booth", x: 250, y: 60, w: 120, h: 70, label: "Espresso Bar" },
        { id: "d1", type: "door", x: 380, y: 20, w: 60, h: 30, label: "Entrance" },
      ] },
    },
    {
      organizer: organizer._id, name: "Summer Bean Festival", description: "Three-day celebration of single-origin beans.",
      date: SOON, time: "12:00", venue: venues[2]._id, venueName: venues[2].name, status: "upcoming",
      dressCode: "Casual", agenda: "Roasting masterclass, vendor market, cupping sessions",
      teamMembers: [primaryStaff._id, staff[1]._id, staff[3]._id],
      schedule: [
        { title: "Confirm vendors", date: addDays(2), done: false },
        { title: "Marketing push", date: addDays(5), done: false },
        { title: "Print signage", date: addDays(9), done: false },
      ],
      layout: { elements: [
        { id: "s1", type: "stage", x: 60, y: 40, w: 180, h: 70, label: "Main Stage" },
        { id: "b1", type: "booth", x: 300, y: 50, w: 120, h: 70, label: "Vendor 1" },
      ] },
    },
  ]);
  const [pastEvent, todayEvent, upcomingEvent] = events;

  // ======================================================================
  // TASKS — primary staff assigned across events & statuses (+ unassigned)
  // ======================================================================
  console.log("Creating tasks...");
  await Task.insertMany([
    // upcoming event (planning) — mixed statuses
    { event: upcomingEvent._id, title: "Plan catering menu", description: "Design the tasting menu", speciality: "Catering", assignedTo: primaryStaff._id, status: "pending", dueDate: addDays(3), day: "Day 1" },
    { event: upcomingEvent._id, title: "Coordinate logistics", speciality: "Logistics", assignedTo: staff[2]._id, status: "in-progress", dueDate: addDays(4), day: "Day 1" },
    { event: upcomingEvent._id, title: "Plan seating layout", speciality: "Seating", assignedTo: staff[1]._id, status: "in-progress", dueDate: addDays(4), day: "Day 1" },
    { event: upcomingEvent._id, title: "Order signage", speciality: "Logistics", status: "unassigned", dueDate: addDays(8), day: "Day 2" },
    { event: upcomingEvent._id, title: "Design vendor map", speciality: "Logistics", status: "unassigned", dueDate: addDays(6), day: "Day 2" },
    // today event
    { event: todayEvent._id, title: "Set up coffee bar", speciality: "Catering", assignedTo: primaryStaff._id, status: "in-progress", dueDate: TODAY, day: "Event Day" },
    { event: todayEvent._id, title: "Brief the team", speciality: "Catering", assignedTo: primaryStaff._id, status: "pending", dueDate: TODAY, day: "Event Day" },
    { event: todayEvent._id, title: "Arrange chairs", speciality: "Seating", assignedTo: staff[2]._id, status: "done", dueDate: TODAY, day: "Event Day" },
    // past event
    { event: pastEvent._id, title: "Clean up venue", speciality: "Logistics", assignedTo: primaryStaff._id, status: "done", dueDate: PAST, day: "Event Day" },
    { event: pastEvent._id, title: "Wrap-up report", speciality: "Catering", assignedTo: staff[1]._id, status: "done", dueDate: PAST, day: "Event Day" },
  ]);

  // ======================================================================
  // BUDGET + EXPENSES
  // ======================================================================
  console.log("Creating budgets and expenses...");
  await Budget.insertMany([
    { event: upcomingEvent._id, plannedTotal: 50000, categories: [{ name: "Venue", plannedAmount: 20000 }, { name: "Catering", plannedAmount: 15000 }, { name: "Marketing", plannedAmount: 8000 }, { name: "Supplies", plannedAmount: 7000 }] },
    { event: todayEvent._id, plannedTotal: 25000, categories: [{ name: "Venue", plannedAmount: 12000 }, { name: "Catering", plannedAmount: 8000 }, { name: "Supplies", plannedAmount: 5000 }] },
    { event: pastEvent._id, plannedTotal: 18000, categories: [{ name: "Venue", plannedAmount: 9000 }, { name: "Catering", plannedAmount: 6000 }, { name: "Supplies", plannedAmount: 3000 }] },
  ]);
  await Expense.insertMany([
    { event: upcomingEvent._id, category: "Venue", description: "Venue deposit", amount: 10000, date: addDays(-2) },
    { event: upcomingEvent._id, category: "Marketing", description: "Social media ads", amount: 3000, date: addDays(-1) },
    { event: todayEvent._id, category: "Venue", description: "Rooftop rental", amount: 12000, date: addDays(-3) },
    { event: todayEvent._id, category: "Catering", description: "Pastries & coffee", amount: 6500, date: addDays(-1) },
    { event: pastEvent._id, category: "Venue", description: "Loft rental", amount: 9000, date: addDays(-22) },
    { event: pastEvent._id, category: "Catering", description: "Catering full", amount: 6200, date: addDays(-21) },
    { event: pastEvent._id, category: "Supplies", description: "Cups and napkins", amount: 2800, date: addDays(-21) },
  ]);

  // ======================================================================
  // BOOKINGS — owner@ gets pending + approved + declined; owner2 gets one
  // ======================================================================
  console.log("Creating bookings...");
  await Booking.insertMany([
    // owner@ — PENDING (so the primary owner can approve/decline in a demo)
    { venue: venues[1]._id, organizer: organizer._id, event: upcomingEvent._id, eventType: "Pop-up cafe", date: SOON, attendeesExpected: 140, specialRequirements: "Need outdoor lighting", status: "pending", messages: [{ sender: "organizer", text: "Is this date still available?" }] },
    // owner@ — APPROVED (confirmed booking, shows on owner dashboard)
    { venue: venues[2]._id, organizer: organizer._id, event: upcomingEvent._id, eventType: "Festival", date: SOON, attendeesExpected: 220, status: "approved" },
    // owner@ — DECLINED (history + counter-proposal thread)
    { venue: venues[3]._id, organizer: organizer._id, eventType: "Workshop", date: addDays(7), attendeesExpected: 35, status: "declined", messages: [{ sender: "owner", text: "Sorry, already booked. Could offer the 10th instead." }] },
    // owner2 — PENDING
    { venue: venues[4]._id, organizer: organizer._id, eventType: "Tasting event", date: addDays(20), attendeesExpected: 90, status: "pending" },
  ]);

  // ======================================================================
  // SOURCING REQUESTS — primary vendor gets pending + accepted (varied)
  // ======================================================================
  console.log("Creating sourcing requests...");
  await SourcingRequest.insertMany([
    // vendor@ — PENDING (so the primary vendor can accept/decline in a demo)
    { event: upcomingEvent._id, organizer: organizer._id, vendor: vendor._id, items: [{ name: "Coffee Beans (kg)", quantity: 20 }, { name: "Syrups", quantity: 6 }], deliveryDate: addDays(12), location: "Giza Warehouse Studio", status: "pending", deliveryStatus: "not-started" },
    // vendor@ — ACCEPTED / preparing
    { event: upcomingEvent._id, organizer: organizer._id, vendor: vendor._id, items: [{ name: "Espresso Machine Rental", quantity: 2 }], deliveryDate: addDays(11), location: "Giza Warehouse Studio", status: "accepted", deliveryStatus: "preparing" },
    // vendor@ — ACCEPTED / delivered (today — staff can mark arrived)
    { event: todayEvent._id, organizer: organizer._id, vendor: vendor._id, items: [{ name: "Coffee Beans (kg)", quantity: 10 }], deliveryDate: TODAY, location: "Rooftop Garden", status: "accepted", deliveryStatus: "delivered" },
    // vendor@ — ACCEPTED / arrived (past)
    { event: pastEvent._id, organizer: organizer._id, vendor: vendor._id, items: [{ name: "Coffee Beans (kg)", quantity: 15 }], deliveryDate: PAST, location: "Downtown Art Loft", status: "accepted", deliveryStatus: "arrived" },
    // vendor2 — accepted / out-for-delivery (today)
    { event: todayEvent._id, organizer: organizer._id, vendor: vendors[1]._id, items: [{ name: "Croissant (dozen)", quantity: 10 }, { name: "Cake", quantity: 2 }], deliveryDate: TODAY, location: "Rooftop Garden", status: "accepted", deliveryStatus: "out-for-delivery" },
    // vendor3 — pending (upcoming)
    { event: upcomingEvent._id, organizer: organizer._id, vendor: vendors[2]._id, items: [{ name: "Cups (100 pack)", quantity: 5 }], deliveryDate: addDays(11), location: "Giza Warehouse Studio", status: "pending", deliveryStatus: "not-started" },
  ]);

  // ======================================================================
  // INVOICES — primary vendor gets pending + approved + paid
  // ======================================================================
  console.log("Creating invoices...");
  await Invoice.insertMany([
    // vendor@ — PENDING (organizer can review it)
    { event: todayEvent._id, vendor: vendor._id, organizer: organizer._id, items: [{ description: "Coffee Beans", quantity: 10, unitPrice: 15 }], amount: 150, status: "pending", notes: "For today's rooftop event" },
    // vendor@ — APPROVED
    { event: pastEvent._id, vendor: vendor._id, organizer: organizer._id, items: [{ description: "Coffee Beans", quantity: 15, unitPrice: 15 }], amount: 225, status: "approved" },
    // vendor@ — PAID
    { event: pastEvent._id, vendor: vendor._id, organizer: organizer._id, items: [{ description: "Espresso Machine Rental", quantity: 1, unitPrice: 200 }], amount: 200, status: "paid" },
    // vendor2 — pending
    { event: todayEvent._id, vendor: vendors[1]._id, organizer: organizer._id, items: [{ description: "Croissants", quantity: 10, unitPrice: 40 }, { description: "Cakes", quantity: 2, unitPrice: 120 }], amount: 640, status: "pending" },
  ]);

  // ======================================================================
  // GUESTS — primary guest invited to ALL THREE events (varied statuses)
  // ======================================================================
  console.log("Creating guests...");
  const todayGuests = await Guest.insertMany([
    { event: todayEvent._id, name: "Ahmed Mohamed", email: "guest@popeyez.com", userRef: primaryGuest._id, status: "attending", dietaryPreference: "Vegetarian", checkedIn: false, rsvpAt: addDays(-2) },
    { event: todayEvent._id, name: "Mona Said", email: "guest2@popeyez.com", userRef: guestUsers[1]._id, status: "attending", dietaryPreference: "Vegan", checkedIn: true, rsvpAt: addDays(-2) },
    { event: todayEvent._id, name: "Youssef Nabil", email: "youssef@example.com", status: "attending", dietaryPreference: "None", checkedIn: true, rsvpAt: addDays(-3) },
    { event: todayEvent._id, name: "Salma Reda", email: "salma@example.com", status: "maybe", dietaryPreference: "Gluten-free", checkedIn: false },
    { event: todayEvent._id, name: "Hany Adel", email: "hany@example.com", status: "not-attending", checkedIn: false, rsvpAt: addDays(-4) },
    { event: todayEvent._id, name: "Rana Sherif", email: "rana@example.com", status: "invited", checkedIn: false },
  ]);
  const pastGuests = await Guest.insertMany([
    { event: pastEvent._id, name: "Ahmed Mohamed", email: "guest@popeyez.com", userRef: primaryGuest._id, status: "attending", dietaryPreference: "Vegetarian", checkedIn: true },
    { event: pastEvent._id, name: "Mona Said", email: "guest2@popeyez.com", userRef: guestUsers[1]._id, status: "attending", checkedIn: true },
    { event: pastEvent._id, name: "Laila Mostafa", email: "laila@example.com", status: "attending", checkedIn: true },
    { event: pastEvent._id, name: "Omar Zaki", email: "omarz@example.com", status: "attending", checkedIn: true },
    { event: pastEvent._id, name: "Farida Sami", email: "farida@example.com", status: "attending", checkedIn: false },
  ]);
  const upcomingGuests = await Guest.insertMany([
    { event: upcomingEvent._id, name: "Ahmed Mohamed", email: "guest@popeyez.com", userRef: primaryGuest._id, status: "invited" },
    { event: upcomingEvent._id, name: "Nadia Hatem", email: "nadia@example.com", status: "maybe" },
    { event: upcomingEvent._id, name: "Sherif Ali", email: "sherifa@example.com", status: "attending", dietaryPreference: "Halal" },
    { event: upcomingEvent._id, name: "Yara Adel", email: "yara@example.com", status: "invited" },
  ]);

  // ======================================================================
  // NOTIFICATIONS — primary guest gets invitation + day-of (unseen) + feedback-request
  // ======================================================================
  console.log("Creating notifications...");
  await Notification.insertMany([
    // day-of for today event — Ahmed's is UNSEEN so the guest can mark it seen
    { event: todayEvent._id, guest: todayGuests[0]._id, title: "Welcome!", body: "Doors open at 6 PM. See you on the rooftop!", type: "day-of", seen: false },
    { event: todayEvent._id, guest: todayGuests[1]._id, title: "Welcome!", body: "Doors open at 6 PM. See you on the rooftop!", type: "day-of", seen: true, seenAt: new Date() },
    { event: todayEvent._id, guest: todayGuests[2]._id, title: "Welcome!", body: "Doors open at 6 PM. See you on the rooftop!", type: "day-of", seen: false },
    // a follow-up reminder to Ahmed
    { event: todayEvent._id, guest: todayGuests[0]._id, title: "Parking note", body: "Use the south entrance for parking.", type: "day-of", seen: false },
    // invitation for the upcoming event (Ahmed)
    { event: upcomingEvent._id, guest: upcomingGuests[0]._id, title: "You're invited!", body: "Join us for the Summer Bean Festival. Please RSVP.", type: "invitation", seen: false },
    // feedback request for the past event (Ahmed)
    { event: pastEvent._id, guest: pastGuests[0]._id, title: "How was the event?", body: "Please share your feedback to help us improve.", type: "feedback-request", seen: false },
  ]);

  // ======================================================================
  // FEEDBACK (past event) — mix of positive/negative for dashboards
  // ======================================================================
  console.log("Creating feedback...");
  await Feedback.insertMany([
    { event: pastEvent._id, guest: pastGuests[0]._id, guestName: "Ahmed Mohamed", overall: 5, food: 5, venue: 4, organization: 5, comments: "Amazing coffee and vibe!", sentiment: "positive" },
    { event: pastEvent._id, guest: pastGuests[1]._id, guestName: "Mona Said", overall: 5, food: 4, venue: 5, organization: 5, comments: "Loved the latte art!", sentiment: "positive" },
    { event: pastEvent._id, guest: pastGuests[2]._id, guestName: "Laila Mostafa", overall: 4, food: 4, venue: 5, organization: 4, comments: "Great, a bit crowded.", sentiment: "positive" },
    { event: pastEvent._id, guest: pastGuests[3]._id, guestName: "Omar Zaki", overall: 2, food: 3, venue: 2, organization: 2, comments: "Long queues for coffee.", sentiment: "negative" },
    { event: pastEvent._id, guestName: "Anonymous", overall: 4, food: 5, venue: 4, organization: 3, comments: "Great pastries.", sentiment: "positive" },
  ]);

  // ======================================================================
  // MESSAGES — organizer <-> primary vendor thread (+ one to vendor2)
  // ======================================================================
  console.log("Creating messages...");
  await Message.insertMany([
    { from: organizer._id, to: vendor._id, event: upcomingEvent._id, text: "Hi Hassan, can you deliver the beans a day earlier?" },
    { from: vendor._id, to: organizer._id, event: upcomingEvent._id, text: "Sure, we can do that. No problem!" },
    { from: organizer._id, to: vendor._id, event: upcomingEvent._id, text: "Perfect, thank you!" },
    { from: organizer._id, to: vendors[1]._id, event: todayEvent._id, text: "Are the pastries ready for today?" },
  ]);

  // ======================================================================
  // VENDOR RATINGS — feeds the Reports vendor-performance table
  // ======================================================================
  console.log("Creating vendor ratings...");
  await User.findByIdAndUpdate(vendor._id, {
    $push: { ratings: { rating: 5, comment: "Reliable and on time.", event: pastEvent._id, by: organizer._id } },
  });
  await User.findByIdAndUpdate(vendors[1]._id, {
    $push: { ratings: { rating: 4, comment: "Tasty pastries, slight delay.", event: pastEvent._id, by: organizer._id } },
  });

  // ======================================================================
  // DONE
  // ======================================================================
  const counts = {
    users: await User.countDocuments(),
    venues: await Venue.countDocuments(),
    events: await Event.countDocuments(),
    bookings: await Booking.countDocuments(),
    tasks: await Task.countDocuments(),
    guests: await Guest.countDocuments(),
    sourcing: await SourcingRequest.countDocuments(),
    invoices: await Invoice.countDocuments(),
    notifications: await Notification.countDocuments(),
    feedback: await Feedback.countDocuments(),
    messages: await Message.countDocuments(),
  };

  console.log("\n========================================");
  console.log("  Seed complete! Records:", JSON.stringify(counts));
  console.log("========================================");
  console.log("  PRIMARY LOGINS (password: password123)");
  console.log("  Organizer    : organizer@popeyez.com");
  console.log("  Team / Staff : staff@popeyez.com");
  console.log("  Vendor       : vendor@popeyez.com");
  console.log("  Guest        : guest@popeyez.com");
  console.log("  Venue Owner  : owner@popeyez.com");
  console.log("  ---");
  console.log("  Extra accounts: staff2..staff5, vendor2/3, guest2, owner2 @popeyez.com");
  console.log("========================================\n");

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
