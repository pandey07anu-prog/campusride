const Feedback = require('../models/Feedback');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc Submit Student Feedback / Experience Review
// @route POST /api/feedback
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, category, message, name, university } = req.body;

    if (!message || !message.trim()) {
      return errorResponse(res, 400, 'Please enter your review message');
    }

    const studentName = (name || req.user?.fullName || 'Verified Student').trim();
    const studentUni = (university || req.user?.university || 'Chitkara University').trim();
    const starRating = Number(rating) || 5;

    const feedback = await Feedback.create({
      userId: req.user?._id || null,
      name: studentName,
      university: studentUni,
      rating: starRating,
      category: category || 'Carpool Experience',
      message: message.trim(),
      isFeatured: true,
    });

    return successResponse(res, 201, 'Thank you! Your experience review has been saved permanently! 🎉', feedback);
  } catch (error) {
    console.error('[Feedback Submission Error]:', error);
    return errorResponse(res, 500, 'Could not save feedback. Please try again.');
  }
};

// @desc Get Public Featured Student Reviews (for Home / Landing Page)
// @route GET /api/feedback/public
const getPublicFeedback = async (req, res, next) => {
  try {
    const reviews = await Feedback.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, 200, 'Public student reviews fetched', reviews || []);
  } catch (error) {
    next(error);
  }
};

// @desc Admin: Get All Submitted Feedback & Reviews
// @route GET /api/feedback/admin
const getAllFeedbackAdmin = async (req, res, next) => {
  try {
    const allFeedback = await Feedback.find()
      .populate('userId', 'fullName email phone university')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'All student feedback fetched', allFeedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  getPublicFeedback,
  getAllFeedbackAdmin,
};
