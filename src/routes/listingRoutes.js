import express from "express";
import { protect, isSeller } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getListings,
  getSellerListings,
  createListing,
  getListing,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import Listing from "../models/Listing.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/seller/:sellerId", getSellerListings);
router.get("/seller", protect, isSeller, getSellerListings);
router.get("/", getListings);
router.post("/", protect, isSeller, upload.array("images", 5), createListing);
router.get("/popular", protect, async (req, res) => {
  try {
    const popularListings = await Listing.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views')
      .populate('sellerId', 'name');
    
    res.json(popularListings);
  } catch (error) {
    console.error("Error fetching popular listings:", error);
    res.status(500).json({ message: error.message });
  }
});
router.get("/:id", getListing);
router.put("/:id", protect, isSeller, upload.array("images", 5), updateListing);
router.patch("/:id", protect, isSeller, updateListing);
router.patch("/:id/status", protect, updateListing);
router.delete("/:id", protect, isSeller, deleteListing);
router.get("/listings", protect, async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("seller", "name")
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/distribution", protect, async (req, res) => {
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
});

export default router;
