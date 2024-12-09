import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("Registration request received:", { name, email, role });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user (password will be hashed by the pre-save middleware)
    const user = await User.create({
      name,
      email,
      password, // Don't hash here, let the middleware do it
      role: role || "Customer",
    });

    if (user) {
      console.log("User created successfully:", {
        id: user._id,
        email: user.email,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Modify the createAdminIfNotExists function
const createAdminIfNotExists = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      // Create admin user
      const adminUser = await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "Admin"
      });
      console.log("Admin user created successfully:", adminUser.email);
      return adminUser;
    }
    return adminExists;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Check if it's admin login attempt
    if (email === process.env.ADMIN_EMAIL) {
      // Ensure admin exists in database
      const adminUser = await createAdminIfNotExists();
      
      // Verify password
      const isMatch = await adminUser.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect email or password" });
      }

      // Create admin token
      const token = generateToken(adminUser._id);

      // Send admin response
      return res.json({
        token,
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "Admin",
      });
    }

    // For non-admin users, continue with normal login process
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password incorrect");
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    console.log("Login successful for:", user.email, "Role:", user.role);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
