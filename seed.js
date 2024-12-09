import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Listing from "./src/models/Listing.js";

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    // Create users
    const users = await User.insertMany([
      {
        name: "John Doe",
        email: "john.doe@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "Customer",
        profileImage: null,
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: await bcrypt.hash("password123", 10),
        role: "Seller",
        profileImage: null,
      },
    ]);

    // Create listings
    await Listing.insertMany([
      {
        sellerId: users[1]._id, // Assuming Jane Smith is the seller
        title: "Vintage Chair",
        description: "A beautiful vintage chair in excellent condition.",
        price: 150,
        category: "Furniture",
        images: ["/uploads/chair1.jpg", "/uploads/chair2.jpg"],
        location: "New York",
        status: "Active",
        views: 0,
      },
      {
        sellerId: users[1]._id, // Assuming Jane Smith is the seller
        title: "Mountain Bike",
        description: "A sturdy mountain bike perfect for off-road trails.",
        price: 300,
        category: "Sports",
        images: ["/uploads/bike1.jpg", "/uploads/bike2.jpg"],
        location: "San Francisco",
        status: "Active",
        views: 0,
      },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
