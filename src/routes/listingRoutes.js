import express from 'express';
import { protect, isSeller } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
    getListings,
    getSellerListings,
    createListing,
    getListing,
    updateListing,
    deleteListing
} from '../controllers/listingController.js';

const router = express.Router();

router.get('/seller/:sellerId', getSellerListings);
router.get('/seller', protect, isSeller, getSellerListings);
router.get('/', getListings);
router.post('/', protect, isSeller, upload.array('images', 5), createListing);
router.get('/:id', getListing);
router.put('/:id', protect, isSeller, upload.array('images', 5), updateListing);
router.patch('/:id', protect, isSeller, updateListing);
router.patch('/:id/status', protect, updateListing);
router.delete('/:id', protect, isSeller, deleteListing);

export default router; 