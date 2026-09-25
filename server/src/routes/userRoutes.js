const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addEmergencyContact, saveRoute, getUserPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.post('/emergency-contacts', protect, addEmergencyContact);
router.post('/saved-routes', protect, saveRoute);
router.get('/:id', getUserPublicProfile);

module.exports = router;
