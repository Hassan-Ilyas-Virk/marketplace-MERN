import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile, uploadProfilePic, getUser, getSellerListings } from '../controllers/userController.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.put('/update-profile', protect, updateProfile);
router.post('/upload-profile-pic', protect, upload.single('image'), uploadProfilePic);
router.get('/:id', getUser);
router.get('/:id/listings', getSellerListings);

export default router; 