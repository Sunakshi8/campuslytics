const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected'],
      default: 'Applied',
    },
    matchScore: { type: Number, default: 0 }, // resume-vs-drive skill match %
    timeline: { type: [timelineEventSchema], default: [] },
    interview: {
      round: { type: String, default: '' },
      scheduledAt: { type: Date },
      mode: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
