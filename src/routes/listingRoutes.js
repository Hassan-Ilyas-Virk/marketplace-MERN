import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getListings,
    createListing,
    getListing,
    updateListing,
    deleteListing
} from '../controllers/listingController.js';

const router = express.Router();

router.get('/', getListings);
router.post('/', protect, createListing);
router.get('/:id', getListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router; 