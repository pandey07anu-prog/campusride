const express = require('express');
const router = express.Router();
const { submitStudentVerification, getVerificationStatus, submitDriverVerification } = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/student', protect, submitStudentVerification);
router.get('/status', protect, getVerificationStatus);
router.post('/driver', protect, submitDriverVerification);

module.exports = router;
