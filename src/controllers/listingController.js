import Listing from "../models/Listing.js";

// Add this new utility function at the top of the file
const incrementViewCount = async (listings) => {
  if (!Array.isArray(listings)) {
    listings = [listings];
  }

  return Promise.all(
    listings.map((listing) =>
      Listing.findByIdAndUpdate(
        listing._id,
        { $inc: { views: 1 } },
        { new: true }
      )
    )
  );
};

// Get all listings
export const getListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("sellerId", "name email profilePicture")
      .sort({ createdAt: -1 });

    await incrementViewCount(listings);

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new listing
export const createListing = async (req, res) => {
  try {
    // Handle uploaded files
    const imageUrls = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const listing = new Listing({
      ...req.body,
      sellerId: req.user._id,
      images: imageUrls,
      price: Number(req.body.price),
    });

    const savedListing = await listing.save();
    res.status(201).json(savedListing);
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({
      message: "Error creating listing",
      error: error.message,
    });
  }
};

// Get single listing
export const getListing = async (req, res) => {
  try {
    console.log("Getting listing with ID:", req.params.id);

    const listing = await Listing.findById(req.params.id).populate(
      "sellerId",
      "name email profilePicture"
    );

    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ message: "Listing not found" });
    }
  } catch (error) {
    console.error("Error in getListing:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update listing
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Allow status updates from buyers
    if (req.body.status === "Pending") {
      // Skip seller verification for status updates to Pending
    } else if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If there are new files, handle them
    const imageUrls = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : listing.images;

    const updatedData = {
      ...req.body,
      images: imageUrls,
    };

    // If updating status, make sure it's a valid status
    if (req.body.status) {
      if (!["Active", "Sold", "Pending"].includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updatedData.status = req.body.status;
    }

    // Convert price to number if it exists in the request
    if (req.body.price) {
      updatedData.price = Number(req.body.price);
    }

    console.log("Updating with data:", updatedData); // Debug log

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    console.log("Updated listing:", updatedListing); // Debug log
    res.json(updatedListing);
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({
      message: "Error updating listing",
      error: error.message,
    });
  }
};

// Delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if this is the seller's listing
    if (listing.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({
      message: "Error deleting listing",
      error: error.message,
    });
  }
};

// Update getSellerListings function
export const getSellerListings = async (req, res) => {
  try {
    // Use sellerId from params or from authenticated user
    const sellerId = req.params.sellerId || req.user._id;

    const listings = await Listing.find({ sellerId })
      .populate("sellerId", "name email profilePicture")
      .sort({ createdAt: -1 });

    if (!listings) {
      return res.status(404).json({ message: "No listings found" });
    }

    res.json(listings);
  } catch (error) {
    console.error("Error in getSellerListings:", error);
    res.status(500).json({
      message: "Error fetching seller listings",
      error: error.message,
    });
  }
};
