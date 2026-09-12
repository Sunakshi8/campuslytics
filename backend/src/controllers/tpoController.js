const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');

// @desc    List all students (with optional search/filter)
// @route   GET /api/tpo/students
const listStudents = asyncHandler(async (req, res) => {
  const { search, branch, year } = req.query;
  const filter = {};
  if (branch) filter.branch = branch;
  if (year) filter.year = year;

  let profiles = await StudentProfile.find(filter).populate('user', 'name email isActive createdAt');

  if (search) {
    const s = search.toLowerCase();
    profiles = profiles.filter(
      (p) => p.user && (p.user.name.toLowerCase().includes(s) || p.user.email.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, count: profiles.length, students: profiles });
});

// @desc    List all companies
// @route   GET /api/tpo/companies
const listCompanies = asyncHandler(async (req, res) => {
  const companies = await CompanyProfile.find().populate('user', 'name email isActive createdAt');
  res.json({ success: true, count: companies.length, companies });
});

// @desc    List all drives across all companies
// @route   GET /api/tpo/drives
const listAllDrives = asyncHandler(async (req, res) => {
  const drives = await Drive.find().populate('company', 'companyName').sort({ createdAt: -1 });
  res.json({ success: true, count: drives.length, drives });
});

// @desc    List all applications across the platform
// @route   GET /api/tpo/applications
const listAllApplications = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status && req.query.status !== 'All') query.status = req.query.status;

  const applications = await Application.find(query)
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate({ path: 'drive', populate: { path: 'company', select: 'companyName' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: applications.length, applications });
});

// @desc    Deactivate/reactivate a user account (student or company)
// @route   PUT /api/tpo/users/:id/status
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isActive = !!isActive;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Bulk import students from parsed CSV/Excel rows
//          Expects: { rows: [{ name, email, password, branch, year, cgpa, backlogs, skills, rollNumber }, ...] }
//          Frontend parses the CSV/XLSX client-side (SheetJS) and posts JSON rows -
//          this keeps the backend simple and framework-agnostic for file formats.
// @route   POST /api/tpo/students/bulk-import
const bulkImportStudents = asyncHandler(async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    res.status(400);
    throw new Error('No rows provided for import');
  }

  const results = { created: 0, skipped: 0, errors: [] };

  for (const [index, row] of rows.entries()) {
    try {
      if (!row.name || !row.email || !row.password) {
        results.skipped += 1;
        results.errors.push({ row: index + 1, reason: 'Missing name, email, or password' });
        continue;
      }
      const existing = await User.findOne({ email: String(row.email).toLowerCase() });
      if (existing) {
        results.skipped += 1;
        results.errors.push({ row: index + 1, reason: 'Email already exists' });
        continue;
      }

      const user = await User.create({
        name: row.name,
        email: row.email,
        password: row.password,
        role: 'student',
      });

      const skills = Array.isArray(row.skills)
        ? row.skills
        : String(row.skills || '')
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);

      const profile = await StudentProfile.create({
        user: user._id,
        branch: row.branch || '',
        year: row.year || '',
        cgpa: Number(row.cgpa) || 0,
        backlogs: Number(row.backlogs) || 0,
        skills,
        rollNumber: row.rollNumber || '',
      });
      profile.computeCompletion();
      await profile.save();

      results.created += 1;
    } catch (err) {
      results.skipped += 1;
      results.errors.push({ row: index + 1, reason: err.message });
    }
  }

  res.json({ success: true, ...results });
});

// @desc    Placement analytics dashboard data
// @route   GET /api/tpo/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const totalStudents = await StudentProfile.countDocuments();
  const totalDrives = await Drive.countDocuments();

  const selectedApplications = await Application.find({ status: 'Selected' }).populate({
    path: 'drive',
    select: 'packageMin packageMax title',
  });

  const placedStudentIds = new Set(selectedApplications.map((a) => String(a.student)));
  const placedStudents = placedStudentIds.size;

  const packages = selectedApplications
    .map((a) => (a.drive ? a.drive.packageMax || a.drive.packageMin || 0 : 0))
    .filter((p) => p > 0);
  const highestPackage = packages.length ? Math.max(...packages) : 0;
  const averagePackage = packages.length ? Math.round((packages.reduce((a, b) => a + b, 0) / packages.length) * 10) / 10 : 0;

  // Department-wise placement rate
  const branches = await StudentProfile.distinct('branch');
  const departmentWise = [];
  for (const branch of branches.filter(Boolean)) {
    const studentsInBranch = await StudentProfile.find({ branch });
    const branchIds = studentsInBranch.map((s) => String(s._id));
    const placedInBranch = [...placedStudentIds].filter((id) => branchIds.includes(id)).length;
    departmentWise.push({
      branch,
      totalStudents: studentsInBranch.length,
      placedStudents: placedInBranch,
      placementRate: studentsInBranch.length ? Math.round((placedInBranch / studentsInBranch.length) * 100) : 0,
    });
  }

  // Company participation: application counts per company
  const allApplications = await Application.find().populate({ path: 'drive', select: 'company' });
  const companyCounts = {};
  allApplications.forEach((a) => {
    if (!a.drive) return;
    const cId = String(a.drive.company);
    companyCounts[cId] = (companyCounts[cId] || 0) + 1;
  });
  const companyIds = Object.keys(companyCounts);
  const companies = await CompanyProfile.find({ _id: { $in: companyIds } });
  const totalApplications = allApplications.length || 1;
  const companyParticipation = companies
    .map((c) => ({
      company: c.companyName,
      applications: companyCounts[String(c._id)] || 0,
      sharePercent: Math.round(((companyCounts[String(c._id)] || 0) / totalApplications) * 100),
    }))
    .sort((a, b) => b.applications - a.applications);

  const totalCompaniesParticipated = companies.length;

  res.json({
    success: true,
    summary: {
      totalStudents,
      placedStudents,
      totalDrives,
      highestPackage,
      averagePackage,
    },
    departmentWise,
    companyParticipation,
    totalCompaniesParticipated,
  });
});

// @desc    Export applications/students report as CSV
// @route   GET /api/tpo/export/applications
const exportApplicationsCsv = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
    .populate({ path: 'drive', populate: { path: 'company', select: 'companyName' } })
    .sort({ createdAt: -1 });

  const tmpPath = path.join(__dirname, '..', 'uploads', `applications-export-${Date.now()}.csv`);
  const csvWriter = createObjectCsvWriter({
    path: tmpPath,
    header: [
      { id: 'studentName', title: 'Student Name' },
      { id: 'studentEmail', title: 'Student Email' },
      { id: 'company', title: 'Company' },
      { id: 'role', title: 'Role' },
      { id: 'status', title: 'Status' },
      { id: 'matchScore', title: 'Match Score' },
      { id: 'appliedOn', title: 'Applied On' },
    ],
  });

  const records = applications.map((a) => ({
    studentName: a.student?.user?.name || 'N/A',
    studentEmail: a.student?.user?.email || 'N/A',
    company: a.drive?.company?.companyName || 'N/A',
    role: a.drive?.title || 'N/A',
    status: a.status,
    matchScore: a.matchScore,
    appliedOn: a.createdAt.toISOString().split('T')[0],
  }));

  await csvWriter.writeRecords(records);

  res.download(tmpPath, 'campuslytics-applications-report.csv', (err) => {
    fs.unlink(tmpPath, () => {}); // clean up after sending
    if (err) console.error('CSV download error:', err.message);
  });
});

module.exports = {
  listStudents,
  listCompanies,
  listAllDrives,
  listAllApplications,
  setUserActiveStatus,
  bulkImportStudents,
  getAnalytics,
  exportApplicationsCsv,
};
