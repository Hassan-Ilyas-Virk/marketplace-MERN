import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

const addAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing admin first (for testing)
    await User.findOneAndDelete({ email: process.env.ADMIN_EMAIL });
    console.log("Removed existing admin if any");

    // Create new admin using User model (will use pre-save middleware)
    const admin = new User({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, // Plain password - will be hashed by middleware
      role: "Admin",
    });

    await admin.save();
    console.log("Admin added successfully!");
    console.log("Admin email:", process.env.ADMIN_EMAIL);
    console.log("Admin password (from .env):", process.env.ADMIN_PASSWORD);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

addAdmin();
