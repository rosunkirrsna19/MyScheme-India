const express = require('express');
const router = express.Router();
const {
  getPendingApplications,
  getCoordinatorDashboardStats,
  getApplicationById,
  updateApplicationStatus,
  getAllApplications, // --- IMPORT NEW FUNCTION ---
} = require('../controllers/coordinatorController');
const { protect, authorize } = require('../middleware/auth');

// All routes in this file are protected and restricted to Coordinators
router.use(protect);
router.use(authorize('Coordinator'));

// @route   GET /api/coordinator/dashboard
// @desc    Get stats for coordinator dashboard
// @access  Private (Coordinator only)
router.get('/dashboard', getCoordinatorDashboardStats);

// @route   GET /api/coordinator/applications/pending
// @desc    Get all applications with 'Pending' status
// @access  Private (Coordinator only)
router.get('/applications/pending', getPendingApplications);

// --- NEW ROUTE ---
// @route   GET /api/coordinator/applications/all
// @desc    Get all applications (pending, approved, rejected)
// @access  Private (Coordinator only)
router.get('/applications/all', getAllApplications);

// @route   GET /api/coordinator/applications/:id
// @desc    Get a single application by its ID
// @access  Private (Coordinator only)
router.get('/applications/:id', getApplicationById);

// @route   PUT /api/coordinator/applications/:id
// @desc    Approve or reject an application
// @access  Private (Coordinator only)
router.put('/applications/:id', updateApplicationStatus);

module.exports = router;