const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    List notifications for the logged-in user
// @route   GET /api/notifications
const listNotifications = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.type && req.query.type !== 'All') query.type = req.query.type;

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.json({ success: true, count: notifications.length, unreadCount, notifications });
});

// @desc    Mark one notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  notification.isRead = true;
  await notification.save();
  res.json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
