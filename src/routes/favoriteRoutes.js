import express from 'express';
import { addToFavorites, removeFromFavorites, isFavorite } from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/favorites', protect, addToFavorites);
router.delete('/favorites', protect, removeFromFavorites);
router.get('/favorites/:listingId', protect, isFavorite);

export default router;
