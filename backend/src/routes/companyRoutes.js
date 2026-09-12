const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/companyController');

router.use(protect, authorize('company'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);

router.post('/drives', ctrl.createDrive);
router.get('/drives', ctrl.listOwnDrives);
router.put('/drives/:id', ctrl.updateDrive);
router.delete('/drives/:id', ctrl.deleteDrive);

router.get('/drives/:id/applicants', ctrl.getApplicants);
router.put('/applications/:id/status', ctrl.updateApplicationStatus);

module.exports = router;
