import express from 'express';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import {
    getListings,
    createListing,
    getListing,
    updateListing,
    deleteListing
} from '../controllers/listingController.js';

const router = express.Router();

router.get('/', getListings);
router.post('/', protect, isSeller, createListing);
router.get('/:id', getListing);
router.put('/:id', protect, isSeller, updateListing);
router.delete('/:id', protect, isSeller, deleteListing);

export default router; 