const mongoose = require('mongoose');

const eligibilitySchema = new mongoose.Schema(
  {
    minCgpa: { type: Number, default: 0 },
    branches: { type: [String], default: [] }, // empty = all branches allowed
    years: { type: [String], default: [] }, // empty = all years allowed
    maxBacklogs: { type: Number, default: 0 },
    requiredSkills: { type: [String], default: [] },
  },
  { _id: false }
);

const driveSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },
    title: { type: String, required: true, trim: true }, // e.g. "SDE Intern"
    jobType: { type: String, enum: ['Internship', 'Full-Time', 'Internship + PPO'], default: 'Full-Time' },
    location: { type: String, default: '' },
    packageMin: { type: Number, default: 0 }, // LPA
    packageMax: { type: Number, default: 0 }, // LPA
    stipend: { type: Number, default: 0 }, // per month, for internships
    description: { type: String, default: '' },
    rolesResponsibilities: { type: String, default: '' },
    batch: { type: String, default: '' }, // e.g. "2025-2027"
    eligibility: { type: eligibilitySchema, default: () => ({}) },
    applyBy: { type: Date, required: true },
    tags: { type: [String], default: [] }, // shown as chips: "Good CGPA", "React", "DSA"
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

driveSchema.index({ title: 'text', location: 'text', tags: 'text' });

module.exports = mongoose.model('Drive', driveSchema);
