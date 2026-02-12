const express = require('express');
const router = express.Router();
const {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  deleteScheme,
  getEligibleSchemes, 
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/schemes
// @desc    Get all schemes
// @access  Public
router.get('/', getAllSchemes);

// --- MOVED THIS ROUTE UP ---
// @route   GET /api/schemes/eligible
// @desc    Get schemes the user is eligible for
// @access  Private (Citizen only)
router.get('/eligible', protect, authorize('Citizen'), getEligibleSchemes);

// @route   GET /api/schemes/:id
// @desc    Get a single scheme by ID
// @access  Public
router.get('/:id', getSchemeById); // --- This is now AFTER /eligible ---

// --- Admin Only Routes ---

// @route   POST /api/schemes
// @desc    Create a new scheme
// @access  Private (Admin only)
router.post('/', protect, authorize('Admin'), createScheme);

// @route   PUT /api/schemes/:id
// @desc    Update a scheme
// @access  Private (Admin only)
router.put('/:id', protect, authorize('Admin'), updateScheme);

// @route   DELETE /api/schemes/:id
// @desc    Delete a scheme
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin'), deleteScheme);

module.exports = router;