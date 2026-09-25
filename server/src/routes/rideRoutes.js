const express = require('express');
const router = express.Router();
const { offerRide, searchRides, getGoingNowRides, getRideById, startRide, completeRide, cancelRide, deleteRide } = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, offerRide);
router.get('/search', searchRides);
router.get('/going-now', getGoingNowRides);
router.get('/:id', getRideById);
router.post('/:id/start', protect, startRide);
router.post('/:id/complete', protect, completeRide);
router.post('/:id/cancel', protect, cancelRide);
router.delete('/:id', protect, deleteRide);

module.exports = router;
