const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const StudentProfile = require('../models/StudentProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const SavedDrive = require('../models/SavedDrive');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { parseResume, computeMatchScore } = require('../utils/resumeParser');
const { checkEligibility, evaluateDrivesForStudent, simulateImprovements } = require('../utils/eligibilityEngine');

const getOwnProfile = async (userId) => {
  const profile = await StudentProfile.findOne({ user: userId });
  if (!profile) {
    const err = new Error('Student profile not found');
    err.statusCode = 404;
    throw err;
  }
  return profile;
};

// @desc    Get own student profile
// @route   GET /api/student/profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  res.json({ success: true, profile });
});

// @desc    Update own student profile
// @route   PUT /api/student/profile
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const editable = ['branch', 'year', 'cgpa', 'backlogs', 'skills', 'phone', 'rollNumber'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) profile[field] = req.body[field];
  });
  profile.computeCompletion();
  await profile.save();
  res.json({ success: true, profile });
});

// @desc    Upload resume (PDF), parse it, store URL
// @route   POST /api/student/resume
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No resume file uploaded');
  }

  const profile = await getOwnProfile(req.user._id);
  const localPath = req.file.path;

  const parsed = await parseResume(localPath);

  let resumeUrl = `/uploads/${req.file.filename}`;
  let resumePublicId = '';

  if (process.env.STORAGE_DRIVER === 'cloudinary') {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'raw',
      folder: 'campuslytics/resumes',
    });
    resumeUrl = result.secure_url;
    resumePublicId = result.public_id;
    fs.unlink(localPath, () => {}); // clean up local temp copy
  }

  profile.resumeUrl = resumeUrl;
  profile.resumePublicId = resumePublicId;
  profile.resumeParsed = parsed;

  // Merge extracted skills into profile skills (deduped)
  const merged = new Set([...(profile.skills || []), ...parsed.extractedSkills]);
  profile.skills = Array.from(merged);
  profile.computeCompletion();

  await profile.save();

  res.json({ success: true, profile, parsed });
});

// @desc    Browse drives with search/filter, tagged with eligibility + match score
// @route   GET /api/student/drives
const browseDrives = asyncHandler(async (req, res) => {
  const { search, company, role, location, eligibleOnly } = req.query;
  const query = { status: 'open' };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.title = { $regex: role, $options: 'i' };
  if (location) query.location = { $regex: location, $options: 'i' };

  let drives = await Drive.find(query).populate('company', 'companyName logoUrl location').sort({ createdAt: -1 });

  if (company) {
    drives = drives.filter((d) => d.company && d.company.companyName.toLowerCase().includes(company.toLowerCase()));
  }

  const profile = await getOwnProfile(req.user._id);

  let results = drives.map((drive) => {
    const { eligible, reasons } = checkEligibility(profile, drive);
    const matchScore = computeMatchScore(profile.skills, drive.eligibility?.requiredSkills || []);
    return { drive, eligible, reasons, matchScore };
  });

  if (eligibleOnly === 'true') {
    results = results.filter((r) => r.eligible);
  }

  res.json({ success: true, count: results.length, results });
});

// @desc    Get a single drive's details (with eligibility + match score for this student)
// @route   GET /api/student/drives/:id
const getDriveDetails = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id).populate('company', 'companyName logoUrl location website description');
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  const profile = await getOwnProfile(req.user._id);
  const { eligible, reasons } = checkEligibility(profile, drive);
  const matchScore = computeMatchScore(profile.skills, drive.eligibility?.requiredSkills || []);

  const existingApplication = await Application.findOne({ student: profile._id, drive: drive._id });
  const isSaved = await SavedDrive.findOne({ student: profile._id, drive: drive._id });

  res.json({
    success: true,
    drive,
    eligible,
    reasons,
    matchScore,
    hasApplied: !!existingApplication,
    applicationStatus: existingApplication ? existingApplication.status : null,
    isSaved: !!isSaved,
  });
});

// @desc    Apply to a drive
// @route   POST /api/student/drives/:id/apply
const applyToDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  if (drive.status !== 'open') {
    res.status(400);
    throw new Error('This drive is no longer accepting applications');
  }
  if (new Date(drive.applyBy) < new Date()) {
    res.status(400);
    throw new Error('The application deadline for this drive has passed');
  }

  const profile = await getOwnProfile(req.user._id);
  const { eligible, reasons } = checkEligibility(profile, drive);
  if (!eligible) {
    res.status(400);
    throw new Error(`You are not eligible for this drive: ${reasons.map((r) => r.message).join('; ')}`);
  }

  const alreadyApplied = await Application.findOne({ student: profile._id, drive: drive._id });
  if (alreadyApplied) {
    res.status(400);
    throw new Error('You have already applied to this drive');
  }

  const matchScore = computeMatchScore(profile.skills, drive.eligibility?.requiredSkills || []);

  const application = await Application.create({
    student: profile._id,
    drive: drive._id,
    status: 'Applied',
    matchScore,
    timeline: [{ status: 'Applied', note: 'Application submitted', date: new Date() }],
  });

  await Notification.create({
    user: req.user._id,
    type: 'application',
    title: 'Application submitted',
    message: `Your application for ${drive.title} has been submitted successfully.`,
  });

  res.status(201).json({ success: true, application });
});

// @desc    Save / unsave (bookmark) a drive
// @route   POST /api/student/drives/:id/save
const toggleSaveDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }
  const profile = await getOwnProfile(req.user._id);
  const existing = await SavedDrive.findOne({ student: profile._id, drive: drive._id });

  if (existing) {
    await existing.deleteOne();
    return res.json({ success: true, saved: false });
  }
  await SavedDrive.create({ student: profile._id, drive: drive._id });
  res.json({ success: true, saved: true });
});

// @desc    List saved drives
// @route   GET /api/student/saved-drives
const listSavedDrives = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const saved = await SavedDrive.find({ student: profile._id }).populate({
    path: 'drive',
    populate: { path: 'company', select: 'companyName logoUrl' },
  });
  res.json({ success: true, saved });
});

// @desc    List own applications (optionally filtered by status)
// @route   GET /api/student/applications
const listApplications = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const query = { student: profile._id };
  if (req.query.status && req.query.status !== 'All') query.status = req.query.status;

  const applications = await Application.find(query)
    .populate({ path: 'drive', populate: { path: 'company', select: 'companyName logoUrl' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
});

// @desc    Placement Eligibility Simulator - current eligibility + what-if scenarios
// @route   GET /api/student/eligibility-simulator
const eligibilitySimulator = asyncHandler(async (req, res) => {
  const profile = await getOwnProfile(req.user._id);
  const drives = await Drive.find({ status: 'open' }).populate('company', 'companyName');
  const simulation = simulateImprovements(profile, drives);
  const { eligible } = evaluateDrivesForStudent(profile, drives);

  res.json({
    success: true,
    profile: {
      cgpa: profile.cgpa,
      branch: profile.branch,
      year: profile.year,
      backlogs: profile.backlogs,
      skills: profile.skills,
    },
    eligibleCompanies: eligible.length,
    totalCompanies: drives.length,
    simulation,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  browseDrives,
  getDriveDetails,
  applyToDrive,
  toggleSaveDrive,
  listSavedDrives,
  listApplications,
  eligibilitySimulator,
};
