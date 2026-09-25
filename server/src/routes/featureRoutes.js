const express = require('express');
const router = express.Router();
const { getTimetable, updateTimetable, getCommuteGroups, createCommuteGroup, joinCommuteGroup, leaveCommuteGroup, getPlatformStats, getEnvironmentalImpact, submitReport, submitFeedback, getPublicFeedback, placesAutocomplete } = require('../controllers/featureController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/places-autocomplete', placesAutocomplete);
router.get('/timetable', protect, getTimetable);
router.put('/timetable', protect, updateTimetable);
router.get('/commute-groups', getCommuteGroups);
router.post('/commute-groups', protect, createCommuteGroup);
router.post('/commute-groups/:id/join', protect, joinCommuteGroup);
router.post('/commute-groups/:id/leave', protect, leaveCommuteGroup);
router.get('/platform-stats', getPlatformStats);
router.get('/environmental-impact', getEnvironmentalImpact);
router.post('/report', protect, submitReport);

// Alias feedback endpoints
router.get('/feedback', getPublicFeedback);
router.get('/feedback/public', getPublicFeedback);
router.post('/feedback', optionalAuth, submitFeedback);

module.exports = router;
