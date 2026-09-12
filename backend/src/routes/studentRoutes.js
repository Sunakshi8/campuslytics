const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.post('/resume', upload.single('resume'), ctrl.uploadResume);

router.get('/drives', ctrl.browseDrives);
router.get('/drives/:id', ctrl.getDriveDetails);
router.post('/drives/:id/apply', ctrl.applyToDrive);
router.post('/drives/:id/save', ctrl.toggleSaveDrive);

router.get('/saved-drives', ctrl.listSavedDrives);
router.get('/applications', ctrl.listApplications);
router.get('/eligibility-simulator', ctrl.eligibilitySimulator);

module.exports = router;
