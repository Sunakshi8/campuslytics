const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const generateToken = require('../utils/generateToken');

// @desc    Register a student
// @route   POST /api/auth/student/signup
// @access  Public
const studentSignup = asyncHandler(async (req, res) => {
  const { name, email, password, branch, year, rollNumber } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role: 'student' });
  const profile = await StudentProfile.create({
    user: user._id,
    branch: branch || '',
    year: year || '',
    rollNumber: rollNumber || '',
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
    profile,
  });
});

// @desc    Register a company
// @route   POST /api/auth/company/signup
// @access  Public
const companySignup = asyncHandler(async (req, res) => {
  const { name, email, password, companyName, industry, website, location } = req.body;

  if (!name || !email || !password || !companyName) {
    res.status(400);
    throw new Error('Name, email, password and company name are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role: 'company' });
  const profile = await CompanyProfile.create({
    user: user._id,
    companyName,
    industry: industry || '',
    website: website || '',
    location: location || '',
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
    profile,
  });
});

// @desc    Login for student, company, or tpo (role passed explicitly or inferred)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const query = { email: email.toLowerCase() };
  if (role) query.role = role;

  const user = await User.findOne(query).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save();

  let profile = null;
  if (user.role === 'student') {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === 'company') {
    profile = await CompanyProfile.findOne({ user: user._id });
  }

  res.json({
    success: true,
    token: generateToken(user._id, user.role),
    user: user.toSafeObject(),
    profile,
  });
});

// @desc    Get currently authenticated user + profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = null;

  if (user.role === 'student') {
    profile = await StudentProfile.findOne({ user: user._id });
  } else if (user.role === 'company') {
    profile = await CompanyProfile.findOne({ user: user._id });
  }

  res.json({ success: true, user: user.toSafeObject(), profile });
});

// @desc    Logout (stateless JWT - client just discards token; endpoint kept for parity/UX)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = { studentSignup, companySignup, login, getMe, logout };
