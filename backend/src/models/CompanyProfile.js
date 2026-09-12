const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
