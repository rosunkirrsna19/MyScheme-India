const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload'); // <-- IMPORT NEW MIDDLEWARE

// All routes here are for logged-in Citizens
router.use(protect);
router.use(authorize('Citizen'));

// @route   POST /api/applications
// @desc    Submit a new application for a private scheme
// @access  Private (Citizen only)
// --- UPDATED: Use the new custom 'uploadMiddleware' ---
router.post('/', uploadMiddleware, submitApplication);

// @route   GET /api/applications/my
// @desc    Get all applications submitted by the logged-in user
// @access  Private (Citizen only)
router.get('/my', getMyApplications);

module.exports = router;