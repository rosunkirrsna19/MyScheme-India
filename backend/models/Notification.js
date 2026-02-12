const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // The user who will receive the notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The notification message
  message: {
    type: String,
    required: true,
  },
  // The link to go to when the notification is clicked
  link: {
    type: String,
    required: true,
  },
  // Read status
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;