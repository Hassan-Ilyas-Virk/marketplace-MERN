import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  updateProfile,
  uploadProfilePic,
  getUser,
  getSellerListings,
  getAllUsers,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
  getUserDistribution,
} from "../controllers/userController.js";
import multer from "multer";
import User from "../models/User.js";

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.put("/update-profile", protect, updateProfile);
router.post(
  "/upload-profile-pic",
  protect,
  upload.single("image"),
  uploadProfilePic
);
router.get("/:id", getUser);
router.get("/:id/listings", getSellerListings);

// First, let's verify the profile route
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password") // Exclude password
      .lean(); // For better performance

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile route error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in /me route:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", protect, isAdmin, getAllUsers);

router.put("/:id", protect, isAdmin, updateUser);
router.delete("/:id", protect, isAdmin, deleteUser);
router.post("/:id/reset-password", protect, isAdmin, resetUserPassword);

router.get("/admin/stats", protect, isAdmin, getUserStats);

router.get("/distribution", protect, isAdmin, async (req, res) => {
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
    res.status(500).json({ message: "Error fetching user distribution" });
  }
});

export default router;
