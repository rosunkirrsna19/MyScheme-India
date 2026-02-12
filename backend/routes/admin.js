const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getApplicationStatsByStatus,
  getSchemeStatsByDepartment,
  getAllCoordinators, // --- IMPORT NEW FUNCTION ---
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes in this file are protected and restricted to Admins
router.use(protect);
router.use(authorize('Admin'));

// @route   GET /api/admin/dashboard
router.get('/dashboard', getAdminDashboardStats);

// @route   GET /api/admin/stats/application-status
router.get('/stats/application-status', getApplicationStatsByStatus);

// @route   GET /api/admin/stats/scheme-department
router.get('/stats/scheme-department', getSchemeStatsByDepartment);

// --- NEW ROUTE ---
// @route   GET /api/admin/coordinators
// @desc    Get all users with the role 'Coordinator'
// @access  Private (Admin only)
router.get('/coordinators', getAllCoordinators);
// --- END NEW ROUTE ---

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// @route   PUT /api/admin/users/:id
router.put('/users/:id', updateUserRole);

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

module.exports = router;