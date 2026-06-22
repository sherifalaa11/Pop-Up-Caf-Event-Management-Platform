const mongoose = require("mongoose");

// Connect to MongoDB. Falls back to a local database if no env var is set,
// so the project runs out of the box.
async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/popeyez";
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", uri);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.error("Is MongoDB running? Try: brew services start mongodb-community");
    process.exit(1);
  }
}

module.exports = connectDB;
