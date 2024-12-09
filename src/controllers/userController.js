import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Listing from "../models/Listing.js";

export const updateProfile = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Email update validation
    if (email) {
      // Check if new email is same as current
      if (email === user.email) {
        return res
          .status(400)
          .json({ message: "New email must be different from current email" });
      }

      // Check if email is already in use
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = email;
    }

    // Password update validation
    if (currentPassword && newPassword) {
      // Check if current password is correct
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Check if new password meets minimum length
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
      }

      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password must be different from current password",
        });
      }

      user.password = newPassword; // Will be hashed by pre-save middleware
    }

    // Update name if provided
    if (name) {
      user.name = name;
    }

    await user.save();

    // Send response without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };

    res.json({
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's profileImage in DB
    user.profileImage = imageUrl;
    await user.save();

    // Get the updated user data
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    };

    // Send back the full user object so frontend can update localStorage
    res.json({
      message: "Profile image updated successfully",
      imageUrl: imageUrl,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({ message: "Error uploading profile image" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//admin routes are below

export const getSellerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.status = status || user.status;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8);
    user.password = newPassword;
    await user.save();

    // In a real application, you would send this password to the user's email
    res.json({ message: "Password reset successfully", newPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    console.log("Fetching user stats...");

    // Get counts in parallel for better performance
    const [
      totalUsers,
      customerCount,
      sellerCount,
      totalListings,
      distinctSellers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Customer" }),
      User.countDocuments({ role: "Seller" }),
      Listing.countDocuments(),
      Listing.distinct("sellerId")
    ]);

    const activeSellers = distinctSellers.length;

    const stats = {
      totalUsers,
      customerCount,
      sellerCount,
      activeSellers,
      totalListings,
    };

    console.log("Stats calculated:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error in getUserStats:", error);
    res.status(500).json({
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

export const getUserDistribution = async (req, res) => {
  try {
    const [customerCount, sellerCount, adminCount] = await Promise.all([
      User.countDocuments({ role: "Customer" }),
      User.countDocuments({ role: "Seller" }),
      User.countDocuments({ role: "Admin" })
    ]);

    res.json({
      customerCount,
      sellerCount,
      adminCount
    });
  } catch (error) {
    console.error("Error getting user distribution:", error);
    res.status(500).json({ message: error.message });
  }
};
