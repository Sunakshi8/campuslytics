const mongoose = require('mongoose');

const savedDriveSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    drive: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },
  },
  { timestamps: true }
);

savedDriveSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('SavedDrive', savedDriveSchema);
