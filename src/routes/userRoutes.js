import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile, uploadProfilePic } from '../controllers/userController.js';
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

export default router; 