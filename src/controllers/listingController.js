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
        // Handle uploaded files
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const listing = new Listing({
            ...req.body,
            sellerId: req.user._id,
            images: imageUrls,
            price: Number(req.body.price)
        });

        const savedListing = await listing.save();
        res.status(201).json(savedListing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ 
            message: 'Error creating listing',
            error: error.message 
        });
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

        // Check if this is the seller's listing
        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If there are new files, handle them
        const imageUrls = req.files 
            ? req.files.map(file => `/uploads/${file.filename}`)
            : listing.images;

        const updatedData = {
            ...req.body,
            images: imageUrls
        };

        // If updating status, make sure it's a valid status
        if (req.body.status) {
            if (!['Active', 'Sold', 'Pending'].includes(req.body.status)) {
                return res.status(400).json({ message: 'Invalid status value' });
            }
            updatedData.status = req.body.status;
        }

        // Convert price to number if it exists in the request
        if (req.body.price) {
            updatedData.price = Number(req.body.price);
        }

        console.log('Updating with data:', updatedData); // Debug log

        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );

        console.log('Updated listing:', updatedListing); // Debug log
        res.json(updatedListing);
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ 
            message: 'Error updating listing',
            error: error.message 
        });
    }
};

// Delete listing
export const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if this is the seller's listing
        if (listing.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Listing.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ 
            message: 'Error deleting listing',
            error: error.message 
        });
    }
};

export const getSellerListings = async (req, res) => {
    try {
        console.log('Seller ID:', req.user._id); // Debug log
        
        const listings = await Listing.find({ sellerId: req.user._id })
            .sort({ createdAt: -1 });
        
        console.log('Found listings:', listings); // Debug log
        
        res.json(listings);
    } catch (error) {
        console.error('Error in getSellerListings:', error);
        res.status(500).json({ 
            message: 'Error fetching seller listings',
            error: error.message 
        });
    }
}; 