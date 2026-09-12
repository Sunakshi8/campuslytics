const express = require('express');
const router = express.Router();
const { studentSignup, companySignup, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/student/signup', studentSignup);
router.post('/company/signup', companySignup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
