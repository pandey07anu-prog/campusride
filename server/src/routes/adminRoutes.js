const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getUsersList,
  toggleUserSuspend,
  getPendingVerifications,
  approveStudentVerification,
  rejectStudentVerification,
  approveDriverVerification,
  rejectDriverVerification,
  getAdminReports,
  clearAllDatabaseData,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public trigger route to clear database on deployment reset
router.post('/clear-database', clearAllDatabaseData);
router.get('/clear-database', clearAllDatabaseData);

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getAdminDashboardStats);
router.get('/users', getUsersList);
router.put('/users/:id/toggle-suspend', toggleUserSuspend);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/student/:id/approve', approveStudentVerification);
router.put('/verifications/student/:id/reject', rejectStudentVerification);
router.put('/verifications/driver/:id/approve', approveDriverVerification);
router.put('/verifications/driver/:id/reject', rejectDriverVerification);
router.get('/reports', getAdminReports);

module.exports = router;
