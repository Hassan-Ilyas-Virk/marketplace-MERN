import Favorite from '../models/Favorite.js';
import Listing from '../models/Listing.js';

// Add to favorites
export const addToFavorites = async (req, res) => {
    try {
        const { listingId } = req.body;
        const userId = req.user._id;

        console.log('Adding favorite:', {
            userId: userId,
            listingId: listingId
        });

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            console.log('Listing not found:', listingId);
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if favorite already exists
        const existingFavorite = await Favorite.findOne({
            customerId: userId,
            listingId: listingId
        });

        if (existingFavorite) {
            console.log('Favorite already exists');
            return res.status(400).json({ message: 'Already in favorites' });
        }

        // Create a new favorite
        const favorite = new Favorite({
            customerId: userId,
            listingId: listingId
        });

        await favorite.save();
        console.log('Favorite saved successfully');
        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        console.error('Server error in addToFavorites:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
    try {
        const { listingId } = req.body;
        const userId = req.user._id;

        console.log('Removing favorite:', {
            userId: userId,
            listingId: listingId
        });

        // Find and remove the favorite
        const favorite = await Favorite.findOneAndDelete({
            customerId: userId,
            listingId: listingId
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        console.log('Favorite removed successfully');
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Server error in removeFromFavorites:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
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

// Get user's favorite listings
export const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const favorites = await Favorite.find({ customerId: userId }).populate('listingId');
        const favoriteListings = favorites.map(fav => fav.listingId);
        
        console.log('Favorite Listings:', favoriteListings);
        
        res.status(200).json(favoriteListings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
