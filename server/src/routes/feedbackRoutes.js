const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getPublicFeedback,
  getAllFeedbackAdmin,
} = require('../controllers/feedbackController');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

// Public routes to view student reviews
router.get('/', getPublicFeedback);
router.get('/public', getPublicFeedback);

// Route to submit review (supports authenticated students & optional guest feedback)
router.post('/', optionalAuth, submitFeedback);
router.post('/public', optionalAuth, submitFeedback);

// Admin route to view all feedback
router.get('/admin', protect, adminOnly, getAllFeedbackAdmin);

module.exports = router;
