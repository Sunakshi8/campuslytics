const asyncHandler = require('express-async-handler');
const CompanyProfile = require('../models/CompanyProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

const getOwnCompany = async (userId) => {
  const profile = await CompanyProfile.findOne({ user: userId });
  if (!profile) {
    const err = new Error('Company profile not found');
    err.statusCode = 404;
    throw err;
  }
  return profile;
};

// @desc    Get own company profile
// @route   GET /api/company/profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  res.json({ success: true, profile });
});

// @desc    Update own company profile
// @route   PUT /api/company/profile
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  const editable = ['companyName', 'website', 'industry', 'description', 'location', 'logoUrl'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });
  await profile.save();
  res.json({ success: true, profile });
});

// @desc    Post a new drive
// @route   POST /api/company/drives
const createDrive = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  const {
    title, jobType, location, packageMin, packageMax, stipend,
    description, rolesResponsibilities, batch, eligibility, applyBy, tags,
  } = req.body;

  if (!title || !applyBy) {
    res.status(400);
    throw new Error('Title and application deadline are required');
  }

  const drive = await Drive.create({
    company: profile._id,
    title,
    jobType,
    location,
    packageMin,
    packageMax,
    stipend,
    description,
    rolesResponsibilities,
    batch,
    eligibility,
    applyBy,
    tags,
  });

  res.status(201).json({ success: true, drive });
});

// @desc    List own drives
// @route   GET /api/company/drives
const listOwnDrives = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  const drives = await Drive.find({ company: profile._id }).sort({ createdAt: -1 });

  // attach applicant counts
  const withCounts = await Promise.all(
    drives.map(async (drive) => {
      const applicantCount = await Application.countDocuments({ drive: drive._id });
      return { ...drive.toObject(), applicantCount };
    })
  );

  res.json({ success: true, drives: withCounts });
});

// @desc    Update a drive owned by this company
// @route   PUT /api/company/drives/:id
const updateDrive = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  const drive = await Drive.findOne({ _id: req.params.id, company: profile._id });
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found or not owned by this company');
  }

  const editable = [
    'title', 'jobType', 'location', 'packageMin', 'packageMax', 'stipend',
    'description', 'rolesResponsibilities', 'batch', 'eligibility', 'applyBy', 'tags', 'status',
  ];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) drive[field] = req.body[field];
  });
  await drive.save();
  res.json({ success: true, drive });
});

// @desc    Delete/close a drive
// @route   DELETE /api/company/drives/:id
const deleteDrive = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  const drive = await Drive.findOneAndDelete({ _id: req.params.id, company: profile._id });
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found or not owned by this company');
  }
  await Application.deleteMany({ drive: drive._id });
  res.json({ success: true, message: 'Drive deleted' });
});

// @desc    View applicants for a specific drive
// @route   GET /api/company/drives/:id/applicants
const getApplicants = asyncHandler(async (req, res) => {
  const profile = await getOwnCompany(req.user._id);
  const drive = await Drive.findOne({ _id: req.params.id, company: profile._id });
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found or not owned by this company');
  }

  const query = { drive: drive._id };
  if (req.query.status && req.query.status !== 'All') query.status = req.query.status;

  const applications = await Application.find(query)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .sort({ matchScore: -1, createdAt: -1 });

  res.json({ success: true, drive: { id: drive._id, title: drive.title }, count: applications.length, applications });
});

// @desc    Update an applicant's status (Applied -> Shortlisted -> Interview -> Selected/Rejected)
// @route   PUT /api/company/applications/:id/status
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note, interview } = req.body;
  const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  const profile = await getOwnCompany(req.user._id);
  const application = await Application.findById(req.params.id)
    .populate('drive')
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

  if (!application || String(application.drive.company) !== String(profile._id)) {
    res.status(404);
    throw new Error('Application not found for this company');
  }

  application.status = status;
  application.timeline.push({ status, note: note || '', date: new Date() });
  if (interview) {
    application.interview = { ...application.interview.toObject(), ...interview };
  }
  await application.save();

  await Notification.create({
    user: application.student.user._id,
    type: status === 'Interview' ? 'interview' : 'application',
    title: `Application status updated: ${status}`,
    message: `Your application for ${application.drive.title} is now "${status}".`,
  });

  await sendEmail({
    to: application.student.user.email,
    subject: `Campuslytics: Your application status changed to ${status}`,
    html: `<p>Hi ${application.student.user.name},</p><p>Your application for <b>${application.drive.title}</b> is now <b>${status}</b>.</p>`,
  });

  res.json({ success: true, application });
});

module.exports = {
  getProfile,
  updateProfile,
  createDrive,
  listOwnDrives,
  updateDrive,
  deleteDrive,
  getApplicants,
  updateApplicationStatus,
};
