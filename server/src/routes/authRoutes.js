const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtps,
  resendOtps,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  sendLoginOtp,
  verifyLoginOtp,
  initiateSignup,
  verifyEmailOtp,
  verifyWhatsappOtp,
  verifyFirebasePhoneOtp,
  resendEmailOtp,
  resendWhatsappOtp,
  completeSignup,
  sendEmailOtp,
  sendWhatsappOtp,
  createAccount,
  testSms,
  clearDatabase,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/test-sms', testSms);
router.get('/clear-database', clearDatabase);
router.post('/register', register);
router.post('/verify-otps', verifyOtps);
router.post('/resend-otps', resendOtps);
router.post('/login', login);
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);

// Pre-registration dual OTP verification routes & aliases
router.post('/initiate-signup', initiateSignup);
router.post('/send-email-otp', sendEmailOtp);
router.post('/send-whatsapp-otp', sendWhatsappOtp);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/verify-whatsapp-otp', verifyWhatsappOtp);
router.post('/verify-firebase-phone', verifyFirebasePhoneOtp);
router.post('/resend-email-otp', resendEmailOtp);
router.post('/resend-whatsapp-otp', resendWhatsappOtp);
router.post('/complete-signup', completeSignup);
router.post('/create-account', createAccount);

const { submitFeedback, getPublicFeedback } = require('../controllers/feedbackController');

router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Alias feedback endpoints
router.get('/feedback', getPublicFeedback);
router.post('/feedback', submitFeedback);

module.exports = router;
