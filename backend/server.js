require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route files (one per resource)
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const venueRoutes = require("./routes/venueRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const eventRoutes = require("./routes/eventRoutes");
const taskRoutes = require("./routes/taskRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const sourcingRoutes = require("./routes/sourcingRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const messageRoutes = require("./routes/messageRoutes");
const guestRoutes = require("./routes/guestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PopEyez API is running" });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/sourcing", sourcingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`PopEyez API running on http://localhost:${PORT}`));
});
