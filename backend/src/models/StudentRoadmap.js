const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const roadmapWeekSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    title: { type: String, required: true },
    focus: { type: String, default: '' },
    skillsTargeted: { type: [String], default: [] },
    tasks: { type: [taskItemSchema], default: [] },
    milestoneProject: { type: String, default: '' },
  },
  { _id: true }
);

const radarScoreSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    currentLevel: { type: Number, default: 60 },
    expectedLevel: { type: Number, default: 80 },
    gap: { type: Number, default: -20 },
    status: { type: String, enum: ['meets', 'below', 'critical'], default: 'below' },
  },
  { _id: false }
);

const topMissingSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    missingInDrivesCount: { type: Number, default: 0 },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  },
  { _id: false }
);

const studentRoadmapSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true, unique: true },
    eligibleDrivesCount: { type: Number, default: 0 },
    nearMatchDrivesCount: { type: Number, default: 0 },
    missedOpportunitiesCount: { type: Number, default: 0 },
    totalDrivesCount: { type: Number, default: 0 },
    whyIneligible: { type: [String], default: [] },
    howToBecomeEligible: { type: [String], default: [] },
    whatToLearnNext: { type: [String], default: [] },
    topMissingSkills: { type: [topMissingSkillSchema], default: [] },
    radarScores: { type: [radarScoreSchema], default: [] },
    weeks: { type: [roadmapWeekSchema], default: [] },
    overallGapScore: { type: Number, default: -85 },
    averageGap: { type: Number, default: -14.3 },
    criticalGapsCount: { type: Number, default: 1 },
    strengthsCount: { type: Number, default: 2 },
    engine: { type: String, enum: ['gemini', 'heuristic'], default: 'heuristic' },
    lastGeneratedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentRoadmap', studentRoadmapSchema);
