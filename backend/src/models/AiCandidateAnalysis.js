const mongoose = require('mongoose');

const dimensionScoresSchema = new mongoose.Schema(
  {
    technicalSkills: { type: Number, default: 70 },
    cultureFit: { type: Number, default: 75 },
    communication: { type: Number, default: 70 },
    experience: { type: Number, default: 65 },
  },
  { _id: false }
);

const breakdownSchema = new mongoose.Schema(
  {
    skillMatch: { type: Number, default: 0 },
    experienceFit: { type: Number, default: 0 },
    requirementFit: { type: Number, default: 0 },
  },
  { _id: false }
);

const aiCandidateAnalysisSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    atsScore: { type: Number, default: 70 },
    keywordCoverage: { type: Number, default: 65 },
    breakdown: { type: breakdownSchema, default: () => ({}) },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    candidateSummary: { type: String, default: '' },
    dimensionScores: { type: dimensionScoresSchema, default: () => ({}) },
    aiRecommendation: {
      type: String,
      enum: ['Strong Match', 'Good Match', 'Potential Fit', 'Not Recommended'],
      default: 'Good Match',
    },
    engine: { type: String, enum: ['gemini', 'heuristic'], default: 'heuristic' },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

aiCandidateAnalysisSchema.index({ student: 1, drive: 1 }, { unique: true });
aiCandidateAnalysisSchema.index({ drive: 1, matchScore: -1 });

module.exports = mongoose.model('AiCandidateAnalysis', aiCandidateAnalysisSchema);
