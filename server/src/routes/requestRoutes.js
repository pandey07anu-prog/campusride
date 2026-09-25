const express = require('express');
const router = express.Router();
const { requestRide, acceptRequest, rejectRequest, cancelRequest, verifyBoarding } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/ride/:id', protect, requestRide);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/cancel', protect, cancelRequest);
router.post('/:id/verify-boarding', protect, verifyBoarding);

module.exports = router;
