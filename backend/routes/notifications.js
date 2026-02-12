const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes in this file are protected
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', getMyNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', markAsRead);

module.exports = router;