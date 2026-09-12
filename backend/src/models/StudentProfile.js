const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    branch: { type: String, trim: true, default: '' },
    year: { type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', ''], default: '' },
    cgpa: { type: Number, min: 0, max: 10, default: 0 },
    backlogs: { type: Number, min: 0, default: 0 },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, default: '' },
    resumePublicId: { type: String, default: '' },
    resumeParsed: {
      rawText: { type: String, default: '' },
      extractedSkills: { type: [String], default: [] },
      extractedEmail: { type: String, default: '' },
      extractedPhone: { type: String, default: '' },
      parsedAt: { type: Date },
    },
    phone: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    profileCompletion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Recalculate a simple profile-completion percentage before saving.
studentProfileSchema.methods.computeCompletion = function computeCompletion() {
  const fields = [
    this.branch,
    this.year,
    this.cgpa > 0,
    this.skills && this.skills.length > 0,
    this.resumeUrl,
    this.phone,
    this.rollNumber,
  ];
  const filled = fields.filter(Boolean).length;
  this.profileCompletion = Math.round((filled / fields.length) * 100);
  return this.profileCompletion;
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
