import express from 'express';
import { addToFavorites } from '../controllers/favoriteController.js';
import { removeFromFavorites } from '../controllers/favoriteController.js';
import { isFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add to favorites route
router.post('/favorites',protect, addToFavorites);
router.delete('/favorites',protect, removeFromFavorites);
router.get('/favorites/:listingId',protect, isFavorite);
// ... existing code ...

export default router;
