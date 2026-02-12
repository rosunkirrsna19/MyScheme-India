const express = require('express');
const router = express.Router();
const {
  updateMyProfile,
  saveScheme,
  getSavedSchemes,
  removeSavedScheme,
  changePassword, // <-- 1. IMPORT NEW FUNCTION
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes here are for any logged-in user
router.use(protect);

// @route   PUT /api/users/profile
// @desc    Update logged-in user's profile
// @access  Private
router.put('/profile', updateMyProfile);

// --- 2. ADD NEW ROUTE ---
// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', changePassword);
// --- END NEW ROUTE ---

// @route   POST /api/users/save-scheme
// @desc    Save a scheme
// @access  Private
router.post('/save-scheme', saveScheme);

// @route   GET /api/users/saved-schemes
// @desc    Get logged-in user's saved schemes
// @access  Private
router.get('/saved-schemes', getSavedSchemes);

// @route   DELETE /api/users/saved-schemes/:id
// @desc    Remove a saved scheme
// @access  Private
router.delete('/saved-schemes/:id', removeSavedScheme);

module.exports = router;