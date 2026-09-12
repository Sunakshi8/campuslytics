const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.use(protect);

router.get('/', ctrl.listNotifications);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.markAllAsRead);

module.exports = router;
