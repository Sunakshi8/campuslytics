require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

const run = async () => {
  await connectDB();
  console.log('Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    CompanyProfile.deleteMany({}),
    Drive.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // --- TPO / Admin ---
  const tpoUser = await User.create({
    name: 'Admin TPO',
    email: 'tpo@campuslytics.com',
    password: 'Password@123',
    role: 'tpo',
  });

  // --- Student ---
  const studentUser = await User.create({
    name: 'Rahul Sharma',
    email: 'student@campuslytics.com',
    password: 'Password@123',
    role: 'student',
  });
  const studentProfile = await StudentProfile.create({
    user: studentUser._id,
    branch: 'Computer Science',
    year: '3rd Year',
    cgpa: 7.8,
    backlogs: 0,
    skills: ['Python', 'C++', 'DSA', 'Git'],
    rollNumber: 'CS2022041',
    phone: '9876543210',
  });
  studentProfile.computeCompletion();
  await studentProfile.save();

  // A second student for variety
  const studentUser2 = await User.create({
    name: 'Ananya Verma',
    email: 'ananya@campuslytics.com',
    password: 'Password@123',
    role: 'student',
  });
  const studentProfile2 = await StudentProfile.create({
    user: studentUser2._id,
    branch: 'Information Technology',
    year: '4th Year',
    cgpa: 8.9,
    backlogs: 0,
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'System Design'],
    rollNumber: 'IT2021017',
    phone: '9876500000',
  });
  studentProfile2.computeCompletion();
  await studentProfile2.save();

  // --- Companies ---
  const googleUser = await User.create({
    name: 'Google Recruiter',
    email: 'google@campuslytics.com',
    password: 'Password@123',
    role: 'company',
  });
  const google = await CompanyProfile.create({
    user: googleUser._id,
    companyName: 'Google',
    industry: 'Technology',
    website: 'https://careers.google.com',
    location: 'Bengaluru',
    description: 'A global technology leader focused on building products that improve people\'s lives.',
    isVerified: true,
  });

  const msUser = await User.create({
    name: 'Microsoft Recruiter',
    email: 'microsoft@campuslytics.com',
    password: 'Password@123',
    role: 'company',
  });
  const microsoft = await CompanyProfile.create({
    user: msUser._id,
    companyName: 'Microsoft',
    industry: 'Technology',
    website: 'https://careers.microsoft.com',
    location: 'Hyderabad',
    description: 'Empowering every person and organization on the planet to achieve more.',
    isVerified: true,
  });

  const amazonUser = await User.create({
    name: 'Amazon Recruiter',
    email: 'amazon@campuslytics.com',
    password: 'Password@123',
    role: 'company',
  });
  const amazon = await CompanyProfile.create({
    user: amazonUser._id,
    companyName: 'Amazon',
    industry: 'E-commerce & Cloud',
    website: 'https://www.amazon.jobs',
    location: 'Bengaluru',
    description: 'Customer-obsessed global technology company.',
    isVerified: true,
  });

  // --- Drives ---
  const applyBy = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const googleDrive = await Drive.create({
    company: google._id,
    title: 'SDE Intern',
    jobType: 'Internship',
    location: 'Bengaluru',
    packageMin: 12,
    packageMax: 16,
    stipend: 80000,
    description: "Google is a global technology leader focused on building products that improve people's lives. Join us for an exciting internship opportunity!",
    rolesResponsibilities: 'Work on core product teams, write production-quality code, collaborate with senior engineers.',
    batch: '2025-2027',
    eligibility: { minCgpa: 7.5, branches: [], years: ['3rd Year', '4th Year'], maxBacklogs: 0, requiredSkills: ['DSA', 'Python'] },
    applyBy: applyBy(15),
    tags: ['Good CGPA', 'React', 'DSA'],
  });

  const msDrive = await Drive.create({
    company: microsoft._id,
    title: 'Software Engineer',
    jobType: 'Full-Time',
    location: 'Hyderabad',
    packageMin: 8,
    packageMax: 12,
    stipend: 0,
    description: 'Build products used by billions of people worldwide.',
    rolesResponsibilities: 'Design, develop and maintain scalable software systems.',
    batch: '2026',
    eligibility: { minCgpa: 7, branches: [], years: ['4th Year'], maxBacklogs: 1, requiredSkills: ['System Design', 'Communication'] },
    applyBy: applyBy(20),
    tags: ['System Design', 'Communication'],
  });

  const amazonDrive = await Drive.create({
    company: amazon._id,
    title: 'SDE Intern',
    jobType: 'Internship + PPO',
    location: 'Bengaluru',
    packageMin: 8,
    packageMax: 10,
    stipend: 60000,
    description: 'Build and scale systems that serve millions of Amazon customers.',
    rolesResponsibilities: 'Contribute to backend services, participate in on-call rotations, write design docs.',
    batch: '2025-2026',
    eligibility: { minCgpa: 7, branches: [], years: ['3rd Year', '4th Year'], maxBacklogs: 0, requiredSkills: ['Java', 'DSA', 'Problem Solving'] },
    applyBy: applyBy(10),
    tags: ['Java', 'DSA', 'Problem Solving'],
  });

  // --- Sample applications for the second student (more skills, so Selected/Shortlisted make sense) ---
  await Application.create({
    student: studentProfile2._id,
    drive: googleDrive._id,
    status: 'Shortlisted',
    matchScore: 65,
    timeline: [
      { status: 'Applied', note: 'Application submitted', date: applyBy(-10) },
      { status: 'Shortlisted', note: 'Shortlisted for technical round', date: applyBy(-5) },
    ],
  });

  await Notification.create({
    user: studentUser._id,
    type: 'system',
    title: 'Welcome to Campuslytics',
    message: 'Complete your profile to unlock more placement opportunities.',
  });

  console.log('\nSeed complete. Demo accounts (all passwords: Password@123):');
  console.log('  TPO/Admin  -> tpo@campuslytics.com');
  console.log('  Student 1  -> student@campuslytics.com (Rahul Sharma)');
  console.log('  Student 2  -> ananya@campuslytics.com (Ananya Verma)');
  console.log('  Company    -> google@campuslytics.com / microsoft@campuslytics.com / amazon@campuslytics.com');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
