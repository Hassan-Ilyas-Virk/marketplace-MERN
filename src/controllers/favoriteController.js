import Favorite from '../models/Favorite.js';
import Listing from '../models/Listing.js';

// Add to favorites
export const addToFavorites = async (req, res) => {
    try {
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Create a new favorite
        const favorite = new Favorite({
            customerId: req.user._id,
            listingId: listingId
        });

        await favorite.save();
        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
    try {
        const { listingId } = req.body;

        // Find and remove the favorite
        const favorite = await Favorite.findOneAndDelete({
            customerId: req.user._id,
            listingId: listingId
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if listing is in user's favorites
export const isFavorite = async (req, res) => {
    try {
        const { listingId } = req.params;

        const favorite = await Favorite.findOne({
            customerId: req.user._id,
            listingId: listingId
        });

        res.status(200).json({ isFavorite: !!favorite });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
