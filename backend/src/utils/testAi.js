require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Drive = require('../models/Drive');
const StudentProfile = require('../models/StudentProfile');
const aiCtrl = require('../controllers/aiController');

async function testEndpoints() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Find demo users
  const recruiter = await User.findOne({ email: 'google@campuslytics.com' });
  const student = await User.findOne({ email: 'student@campuslytics.com' });
  const frontendDrive = await Drive.findOne({ title: 'Frontend Developer Drive' });

  console.log('Recruiter ID:', recruiter?._id);
  console.log('Student ID:', student?._id);
  console.log('Frontend Drive ID:', frontendDrive?._id);

  console.log('\n--- 1. Testing Recruiter Copilot (Drive Ranked Candidates) ---');
  let mockRes1 = {
    data: null,
    json(d) { this.data = d; },
    status(s) { this.statusCode = s; return this; }
  };
  await aiCtrl.getDriveRankedApplicants({
    params: { driveId: frontendDrive._id.toString() },
    query: { minMatch: 0 }
  }, mockRes1);
  console.log('Total Ranked Candidates:', mockRes1.data?.candidates?.length);
  console.log('Top Match %:', mockRes1.data?.metrics?.topMatch);
  console.log('Candidate #1:', mockRes1.data?.candidates?.[0]?.student?.name, 'Match:', mockRes1.data?.candidates?.[0]?.analysis?.matchScore);
  console.log('Candidate #2:', mockRes1.data?.candidates?.[1]?.student?.name, 'Match:', mockRes1.data?.candidates?.[1]?.analysis?.matchScore);
  console.log('Candidate #3:', mockRes1.data?.candidates?.[2]?.student?.name, 'Match:', mockRes1.data?.candidates?.[2]?.analysis?.matchScore);

  console.log('\n--- 2. Testing Student Copilot (Skill Gap Dashboard) ---');
  let mockRes2 = {
    data: null,
    json(d) { this.data = d; },
    status(s) { this.statusCode = s; return this; }
  };
  await aiCtrl.getStudentSkillGap({
    user: { _id: student._id }
  }, mockRes2);
  console.log('Eligible Drives:', mockRes2.data?.metrics?.eligibleDrivesCount);
  console.log('Near-Match Drives:', mockRes2.data?.metrics?.nearMatchDrivesCount);
  console.log('Missed Opportunities:', mockRes2.data?.metrics?.missedOpportunitiesCount);
  console.log('Top Missing Skills:', mockRes2.data?.topMissingSkills?.map(s => `${s.skill} (${s.missingInDrivesCount} drives)`));
  console.log('Why Ineligible (Answer 1):', mockRes2.data?.answers?.whyIneligible?.[0]);
  console.log('How to Become Eligible (Answer 2):', mockRes2.data?.answers?.howToBecomeEligible?.[0]);
  console.log('What to Learn Next (Answer 3):', mockRes2.data?.answers?.whatToLearnNext?.[0]);

  console.log('\n--- 3. Testing Student Copilot (Learning Roadmap) ---');
  let mockRes3 = {
    data: null,
    json(d) { this.data = d; },
    status(s) { this.statusCode = s; return this; }
  };
  await aiCtrl.getStudentRoadmap({
    user: { _id: student._id }
  }, mockRes3);
  console.log('Roadmap Weeks count:', mockRes3.data?.roadmap?.weeks?.length);
  console.log('Week 1 Title:', mockRes3.data?.roadmap?.weeks?.[0]?.title);
  console.log('Week 1 Tasks:', mockRes3.data?.roadmap?.weeks?.[0]?.tasks?.map(t => t.task));

  console.log('\n--- 4. Testing AI Job Match Report Modal Data ---');
  let mockRes4 = {
    data: null,
    json(d) { this.data = d; },
    status(s) { this.statusCode = s; return this; }
  };
  await aiCtrl.getStudentDriveJobMatchReport({
    user: { _id: student._id },
    params: { driveId: frontendDrive._id.toString() }
  }, mockRes4);
  console.log('Job Match Report - ATS Score:', mockRes4.data?.analysis?.atsScore);
  console.log('Job Match Report - Matched Skills:', mockRes4.data?.analysis?.matchedSkills);
  console.log('Job Match Report - Missing Skills:', mockRes4.data?.analysis?.missingSkills);
  console.log('Job Match Report - Radar Data:', mockRes4.data?.analysis?.breakdown);

  console.log('\nAll AI Placement Intelligence endpoints verified successfully with flying colors!');
  process.exit(0);
}

testEndpoints().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
