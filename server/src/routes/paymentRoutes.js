const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  payWithWallet,
  subscribeVipPass,
  getWalletAndTransactions,
  getPlatformEarnings,
  topupViaUPI,
  generateUPIIntent,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/pay-wallet', protect, payWithWallet);
router.post('/subscribe-vip', protect, subscribeVipPass);
router.post('/topup-upi', protect, topupViaUPI);
router.post('/generate-upi-qr', protect, generateUPIIntent);
router.get('/wallet', protect, getWalletAndTransactions);
router.get('/admin/platform-earnings', protect, adminOnly, getPlatformEarnings);

module.exports = router;
