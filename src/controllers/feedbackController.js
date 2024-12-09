import Feedback from '../models/Feedback.js';

// Add feedback
export const addFeedback = async (req, res) => {
  try {
    const feedback = new Feedback({
      ...req.body,
      givenBy: req.user._id
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get feedback for a specific user
export const getUserFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find({ receivedBy: req.params.userId })
      .populate('givenBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ receivedBy: req.params.userId });
    
    res.status(200).json({
      feedbacks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFeedbacks: total
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if the user is the one who gave the feedback
    if (feedback.givenBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this feedback' });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comments: req.body.comments },
      { new: true }
    ).populate('givenBy', 'name');

    res.status(200).json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Check if the user is the one who gave the feedback
    if (feedback.givenBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();
    res.status(200).json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 