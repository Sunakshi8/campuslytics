const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const aiCtrl = require('../controllers/aiController');

// Recruiter & TPO Copilot Routes
router.get(
  '/recruiter/drives/:driveId/ranked-candidates',
  protect,
  authorize('company', 'tpo'),
  aiCtrl.getDriveRankedApplicants
);

router.post(
  '/recruiter/drives/:driveId/analyze-all',
  protect,
  authorize('company', 'tpo'),
  aiCtrl.analyzeAllDriveApplicants
);

router.get(
  '/recruiter/drives/:driveId/candidates/:studentId',
  protect,
  authorize('company', 'tpo'),
  aiCtrl.getCandidateAiReport
);

// Student Copilot Routes
router.get(
  '/student/skill-gap',
  protect,
  authorize('student'),
  aiCtrl.getStudentSkillGap
);

router.get(
  '/student/roadmap',
  protect,
  authorize('student'),
  aiCtrl.getStudentRoadmap
);

router.post(
  '/student/roadmap/regenerate',
  protect,
  authorize('student'),
  aiCtrl.regenerateStudentRoadmap
);

router.put(
  '/student/roadmap/weeks/:weekNumber/tasks/:taskId/toggle',
  protect,
  authorize('student'),
  aiCtrl.toggleRoadmapTask
);

router.get(
  '/student/drives/:driveId/match-report',
  protect,
  authorize('student'),
  aiCtrl.getStudentDriveJobMatchReport
);

module.exports = router;
