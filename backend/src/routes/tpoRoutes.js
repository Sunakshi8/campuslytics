const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/tpoController');

router.use(protect, authorize('tpo'));

router.get('/students', ctrl.listStudents);
router.get('/companies', ctrl.listCompanies);
router.get('/drives', ctrl.listAllDrives);
router.get('/applications', ctrl.listAllApplications);

router.put('/users/:id/status', ctrl.setUserActiveStatus);
router.post('/students/bulk-import', ctrl.bulkImportStudents);

router.get('/analytics', ctrl.getAnalytics);
router.get('/export/applications', ctrl.exportApplicationsCsv);

module.exports = router;
