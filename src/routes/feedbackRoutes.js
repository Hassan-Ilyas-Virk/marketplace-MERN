import express from 'express';
import { addFeedback, updateFeedback, deleteFeedback, getUserFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post('/',protect, addFeedback);

// Route to get feedback for a specific seller;

// Add these new routes
router.put('/:id', protect, updateFeedback);
router.delete('/:id', protect, deleteFeedback);

router.get('/user/:userId', getUserFeedback);

export default router; 