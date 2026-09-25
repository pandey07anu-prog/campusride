const express = require('express');
const router = express.Router();
const { getOfferedRides, getBookedRides, getBackupSuggestions } = require('../controllers/myRidesController');
const { protect } = require('../middleware/authMiddleware');

router.get('/offered', protect, getOfferedRides);
router.get('/booked', protect, getBookedRides);
router.get('/backup-suggestions/:rideId', protect, getBackupSuggestions);

module.exports = router;
