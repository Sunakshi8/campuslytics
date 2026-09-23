require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Drive = require('../models/Drive');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const AiCandidateAnalysis = require('../models/AiCandidateAnalysis');
const StudentRoadmap = require('../models/StudentRoadmap');
const geminiService = require('../services/geminiService');

const run = async () => {
  await connectDB();
  console.log('Seeding database with enhanced AI Placement Intelligence demo data...');

  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    CompanyProfile.deleteMany({}),
    Drive.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
    AiCandidateAnalysis.deleteMany({}),
    StudentRoadmap.deleteMany({}),
  ]);

  // --- TPO / Admin ---
  const tpoUser = await User.create({
    name: 'Admin TPO',
    email: 'tpo@campuslytics.com',
    password: 'Password@123',
    role: 'tpo',
  });

  // --- Primary Student (Rahul Sharma) ---
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
    skills: ['Python', 'C++', 'DSA', 'Git', 'Problem Solving'],
    rollNumber: 'CS2022041',
    phone: '9876543210',
    resumeParsed: {
      rawText: 'Rahul Sharma - 3rd Year CSE student at Campuslytics Institute of Tech. Skills: Python, C++, Data Structures and Algorithms, Git, Linux. Built an algorithmic graph visualizer and basic CLI tools.',
      extractedSkills: ['python', 'c++', 'dsa', 'git', 'problem solving', 'linux'],
      extractedEmail: 'student@campuslytics.com',
      extractedPhone: '9876543210',
      parsedAt: new Date(),
    },
  });
  studentProfile.computeCompletion();
  await studentProfile.save();

  // --- Candidates for Frontend & SDE Drives ---
  const candidateDefs = [
    {
      name: 'Aditi Sharma',
      email: 'aditi@campuslytics.com',
      branch: 'Computer Science',
      year: '4th Year',
      cgpa: 9.1,
      skills: ['React', 'Redux', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS', 'REST API', 'Git'],
      summary: 'Strong React portfolio with modern component state management and clean modular architecture.',
      score: 94,
      ats: 92,
      rec: 'Strong Match',
      dims: { technicalSkills: 95, cultureFit: 92, communication: 90, experience: 88 },
      strengths: ['Exceptional React and frontend component architecture', 'High 9.1 CGPA with verified project repository', 'Strong TypeScript and Tailwind UI proficiency'],
      missing: ['Docker', 'AWS'],
      matched: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux'],
    },
    {
      name: 'Rahul Verma',
      email: 'rahulv@campuslytics.com',
      branch: 'Information Technology',
      year: '4th Year',
      cgpa: 8.4,
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux', 'Git', 'Bootstrap'],
      summary: 'Good frontend experience with solid foundational knowledge in React and state workflows.',
      score: 87,
      ats: 85,
      rec: 'Good Match',
      dims: { technicalSkills: 88, cultureFit: 85, communication: 86, experience: 82 },
      strengths: ['Hands-on responsive web development experience', 'Clean Git workflow and team collaboration experience'],
      missing: ['TypeScript', 'Next.js'],
      matched: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
    },
    {
      name: 'Priya Singh',
      email: 'priya@campuslytics.com',
      branch: 'Computer Science',
      year: '3rd Year',
      cgpa: 7.9,
      skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Express'],
      summary: 'Needs stronger backend and advanced frontend skills; shows good potential in UI rendering.',
      score: 76,
      ats: 74,
      rec: 'Potential Fit',
      dims: { technicalSkills: 75, cultureFit: 80, communication: 82, experience: 68 },
      strengths: ['Familiar with both client and server basics', 'Active contributor in university hackathons'],
      missing: ['TypeScript', 'Tailwind CSS', 'Redux Toolkit'],
      matched: ['React', 'JavaScript', 'HTML', 'CSS'],
    },
    {
      name: 'Emily Chen',
      email: 'emily@campuslytics.com',
      branch: 'Computer Science',
      year: '4th Year',
      cgpa: 9.4,
      skills: ['Python', 'AWS', 'React', 'AI', 'Machine Learning', 'Docker', 'PostgreSQL'],
      summary: 'Top candidate with stellar cloud architecture and modern React design patterns.',
      score: 98,
      ats: 96,
      rec: 'Strong Match',
      dims: { technicalSkills: 98, cultureFit: 95, communication: 96, experience: 92 },
      strengths: ['Production AWS deployment experience', 'Published full-stack AI applications', 'Near-perfect 9.4 CGPA'],
      missing: [],
      matched: ['Python', 'AWS', 'React', 'Docker'],
    },
    {
      name: 'David Kim',
      email: 'david@campuslytics.com',
      branch: 'Information Technology',
      year: '4th Year',
      cgpa: 8.8,
      skills: ['Java', 'Kotlin', 'SQL', 'GCP', 'Spring Boot', 'Docker', 'React'],
      summary: 'Versatile enterprise engineer with strong cloud and microservices capabilities.',
      score: 96,
      ats: 94,
      rec: 'Strong Match',
      dims: { technicalSkills: 94, cultureFit: 91, communication: 89, experience: 88 },
      strengths: ['Deep experience in distributed systems and GCP', 'Proven Spring Boot and React integration'],
      missing: [],
      matched: ['Java', 'SQL', 'GCP', 'Docker', 'React'],
    },
    {
      name: 'Sarah Jones',
      email: 'sarah@campuslytics.com',
      branch: 'Computer Science',
      year: '4th Year',
      cgpa: 8.9,
      skills: ['C++', 'Linux', 'Azure', 'Security', 'React', 'Networking'],
      summary: 'High-performing systems engineer with cloud security and React frontend skills.',
      score: 94,
      ats: 92,
      rec: 'Strong Match',
      dims: { technicalSkills: 94, cultureFit: 94, communication: 71, experience: 88 },
      strengths: ['Strong systems programming foundations in C++ & Linux', 'Security-first architecture approach'],
      missing: ['Redux', 'TypeScript'],
      matched: ['React', 'Linux', 'Security'],
    },
    {
      name: 'Michael Lee',
      email: 'michael@campuslytics.com',
      branch: 'Data Science',
      year: '3rd Year',
      cgpa: 8.6,
      skills: ['R', 'Tableau', 'ML', 'NLP', 'Python', 'React', 'SQL'],
      summary: 'Solid analytical background with ML specialization and interactive dashboard expertise.',
      score: 93,
      ats: 89,
      rec: 'Good Match',
      dims: { technicalSkills: 93, cultureFit: 93, communication: 61, experience: 87 },
      strengths: ['Advanced ML/NLP and data visualization', 'Strong analytical and mathematical acumen'],
      missing: ['TypeScript', 'State Management'],
      matched: ['Python', 'SQL', 'React'],
    },
    {
      name: 'Jessica Williams',
      email: 'jessica@campuslytics.com',
      branch: 'Information Technology',
      year: '4th Year',
      cgpa: 8.5,
      skills: ['Go', 'Docker', 'K8s', 'Terraform', 'React', 'Linux'],
      summary: 'Exceptional cloud-native and infrastructure developer with full-stack delivery skills.',
      score: 91,
      ats: 90,
      rec: 'Good Match',
      dims: { technicalSkills: 91, cultureFit: 82, communication: 77, experience: 55 },
      strengths: ['Kubernetes and infrastructure-as-code proficiency', 'Scalable microservice design in Go'],
      missing: ['TypeScript', 'Tailwind'],
      matched: ['Docker', 'Linux', 'React'],
    },
  ];

  const createdCandidateProfiles = [];
  for (const c of candidateDefs) {
    const user = await User.create({
      name: c.name,
      email: c.email,
      password: 'Password@123',
      role: 'student',
    });

    const prof = await StudentProfile.create({
      user: user._id,
      branch: c.branch,
      year: c.year,
      cgpa: c.cgpa,
      backlogs: 0,
      skills: c.skills,
      rollNumber: `CS2021${Math.floor(100 + Math.random() * 900)}`,
      phone: `9811${Math.floor(100000 + Math.random() * 900000)}`,
      resumeParsed: {
        rawText: `${c.name} - Senior Engineering Student. Technical skills include: ${c.skills.join(', ')}. Strong project background in scalable web applications.`,
        extractedSkills: c.skills.map((s) => s.toLowerCase()),
        extractedEmail: c.email,
        parsedAt: new Date(),
      },
    });
    prof.computeCompletion();
    await prof.save();
    createdCandidateProfiles.push({ profile: prof, meta: c });
  }

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

  const applyBy = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // --- Drives ---
  // Drive 1: Frontend Developer Drive (Featured in user prompt)
  const frontendDrive = await Drive.create({
    company: google._id,
    title: 'Frontend Developer Drive',
    jobType: 'Full-Time',
    location: 'Bengaluru / Remote',
    packageMin: 14,
    packageMax: 20,
    stipend: 0,
    description: 'We are seeking passionate Frontend Engineers to architect beautiful, scalable web applications using React, TypeScript, and modern state architectures. Join the Google Web Platform team!',
    rolesResponsibilities: 'Design component libraries, optimize web performance metrics (CWV), integrate REST/GraphQL APIs, and write modular unit tests.',
    batch: '2025-2026',
    eligibility: {
      minCgpa: 7.0,
      branches: ['Computer Science', 'Information Technology'],
      years: ['3rd Year', '4th Year'],
      maxBacklogs: 0,
      requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux'],
    },
    applyBy: applyBy(25),
    tags: ['React', 'Frontend', 'TypeScript', 'Tailwind CSS', 'Redux'],
    status: 'open',
  });

  // Drive 2: SDE Intern
  const sdeInternDrive = await Drive.create({
    company: amazon._id,
    title: 'SDE Intern',
    jobType: 'Internship + PPO',
    location: 'Bengaluru',
    packageMin: 10,
    packageMax: 14,
    stipend: 75000,
    description: 'Amazon is hiring SDE Interns to build resilient cloud microservices for billions of global customers.',
    rolesResponsibilities: 'Work on distributed transaction backends, write clean design documentation, implement algorithms and data structures.',
    batch: '2025-2027',
    eligibility: {
      minCgpa: 7.5,
      branches: [],
      years: ['3rd Year', '4th Year'],
      maxBacklogs: 0,
      requiredSkills: ['Java', 'DSA', 'Problem Solving', 'Node.js', 'System Design'],
    },
    applyBy: applyBy(15),
    tags: ['Java', 'DSA', 'Problem Solving', 'System Design'],
    status: 'open',
  });

  // Drive 3: Cloud & DevOps Specialist
  const devOpsDrive = await Drive.create({
    company: microsoft._id,
    title: 'Cloud & DevOps Engineer',
    jobType: 'Full-Time',
    location: 'Hyderabad',
    packageMin: 12,
    packageMax: 18,
    stipend: 0,
    description: 'Join the Azure infrastructure core team automating CI/CD pipelines, container orchestration, and cloud reliability.',
    rolesResponsibilities: 'Implement Kubernetes clusters, write Infrastructure as Code with Terraform, manage container registries.',
    batch: '2026',
    eligibility: {
      minCgpa: 7.0,
      branches: [],
      years: ['4th Year'],
      maxBacklogs: 1,
      requiredSkills: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Azure'],
    },
    applyBy: applyBy(30),
    tags: ['Docker', 'Kubernetes', 'Linux', 'Azure'],
    status: 'open',
  });

  // Drive 4: Full Stack Engineer
  const fullstackDrive = await Drive.create({
    company: google._id,
    title: 'Full Stack Engineer',
    jobType: 'Full-Time',
    location: 'Bengaluru',
    packageMin: 16,
    packageMax: 24,
    stipend: 0,
    description: 'Build end-to-end cloud platforms bridging intuitive React clients with scalable Node.js microservices.',
    rolesResponsibilities: 'Architect REST & GraphQL APIs, manage MongoDB and PostgreSQL databases, deploy containers on GCP.',
    batch: '2025-2026',
    eligibility: {
      minCgpa: 7.5,
      branches: [],
      years: ['3rd Year', '4th Year'],
      maxBacklogs: 0,
      requiredSkills: ['Node.js', 'React', 'MongoDB', 'Docker', 'TypeScript'],
    },
    applyBy: applyBy(18),
    tags: ['Node.js', 'React', 'MongoDB', 'Docker', 'TypeScript'],
    status: 'open',
  });

  // Additional drives to provide realistic skill-gap counts (Node.js missing in 9 drives, Docker in 6, TypeScript in 4)
  const moreDrives = [
    { title: 'Backend Node.js Developer', skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'REST API'] },
    { title: 'Platform Engineer', skills: ['Node.js', 'Docker', 'Kubernetes', 'Linux'] },
    { title: 'Microservices Developer', skills: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL'] },
    { title: 'API Integration Specialist', skills: ['Node.js', 'REST API', 'JavaScript', 'Docker'] },
    { title: 'Cloud Application Developer', skills: ['Node.js', 'AWS', 'Docker', 'TypeScript'] },
    { title: 'Distributed Systems Engineer', skills: ['Node.js', 'Go', 'Docker', 'System Design'] },
    { title: 'Enterprise Web Developer', skills: ['Node.js', 'TypeScript', 'React', 'MongoDB'] },
    { title: 'Server-side Software Engineer', skills: ['Node.js', 'SQL', 'Docker', 'Linux'] },
  ];

  for (const md of moreDrives) {
    await Drive.create({
      company: microsoft._id,
      title: md.title,
      jobType: 'Full-Time',
      location: 'Hyderabad / Bengaluru',
      packageMin: 10,
      packageMax: 15,
      description: `Opportunity for ${md.title} to work on cutting-edge enterprise cloud platforms.`,
      rolesResponsibilities: 'Develop high-throughput APIs, build containerized services, collaborate across cross-functional squads.',
      batch: '2025-2026',
      eligibility: {
        minCgpa: 7.0,
        branches: [],
        years: ['3rd Year', '4th Year'],
        maxBacklogs: 0,
        requiredSkills: md.skills,
      },
      applyBy: applyBy(20),
      tags: md.skills,
      status: 'open',
    });
  }

  // --- Seed Applications and Pre-compute AI Analysis for Frontend Drive ---
  const statuses = ['Shortlisted', 'Shortlisted', 'Interview', 'Selected', 'Interview', 'Shortlisted', 'Applied', 'Interview'];

  for (let i = 0; i < createdCandidateProfiles.length; i++) {
    const { profile, meta } = createdCandidateProfiles[i];
    const status = statuses[i] || 'Applied';

    const app = await Application.create({
      student: profile._id,
      drive: frontendDrive._id,
      status,
      matchScore: meta.score,
      timeline: [
        { status: 'Applied', note: 'Application received via Campuslytics portal', date: applyBy(-12) },
        { status: 'Shortlisted', note: 'AI screening: high match score profile', date: applyBy(-8) },
      ],
    });

    await AiCandidateAnalysis.create({
      student: profile._id,
      drive: frontendDrive._id,
      application: app._id,
      matchScore: meta.score,
      atsScore: meta.ats,
      keywordCoverage: Math.round(meta.score * 0.9),
      breakdown: {
        skillMatch: meta.score,
        experienceFit: meta.dims.experience,
        requirementFit: Math.min(100, meta.score + 5),
      },
      matchedSkills: meta.matched,
      missingSkills: meta.missing,
      strengths: meta.strengths,
      candidateSummary: meta.summary,
      dimensionScores: meta.dims,
      aiRecommendation: meta.rec,
      engine: 'gemini',
      analyzedAt: new Date(),
    });
  }

  // Student 1 (Rahul Sharma) applies to Amazon SDE Intern
  await Application.create({
    student: studentProfile._id,
    drive: sdeInternDrive._id,
    status: 'Applied',
    matchScore: 65,
    timeline: [{ status: 'Applied', note: 'Application submitted', date: new Date() }],
  });

  // Pre-generate Student 1's Roadmap & Skill Gap in DB
  const allDrives = await Drive.find({ status: 'open' });
  const studentAiResult = await geminiService.generateStudentSkillGapAndRoadmap(studentProfile, allDrives);
  await StudentRoadmap.create({
    student: studentProfile._id,
    ...studentAiResult,
    lastGeneratedAt: new Date(),
  });

  console.log('\nSeed successfully completed!');
  console.log('-------------------------------------------------------------');
  console.log('Demo Accounts: (All passwords: Password@123)');
  console.log('  1. TPO / Admin:       tpo@campuslytics.com');
  console.log('  2. Student (Rahul):   student@campuslytics.com');
  console.log('  3. Google Recruiter:  google@campuslytics.com');
  console.log('  4. MS Recruiter:      microsoft@campuslytics.com');
  console.log('  5. Amazon Recruiter:  amazon@campuslytics.com');
  console.log('-------------------------------------------------------------');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
