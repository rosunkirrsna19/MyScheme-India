const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authController');
const {
  registerRules,
  loginRules,
  validate,
} = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerRules(), validate, registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginRules(), validate, loginUser);

// @route   GET /api/auth/me
// @desc    Get logged in user's data
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;