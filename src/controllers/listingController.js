import Listing from '../models/Listing.js';

// Get all listings
export const getListings = async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate('sellerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new listing
export const createListing = async (req, res) => {
    try {
        const { title, description, price, category, images, location } = req.body;
        const listing = await Listing.create({
            sellerId: req.user._id,
            title,
            description,
            price,
            category,
            images,
            location
        });
        res.status(201).json(listing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single listing
export const getListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('sellerId', 'name email');
        if (listing) {
            res.json(listing);
        } else {
            res.status(404).json({ message: 'Listing not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update listing
export const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Verify seller ownership
        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedListing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete listing
export const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Verify seller ownership
        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await listing.remove();
        res.json({ message: 'Listing removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 