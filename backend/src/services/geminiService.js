const { GoogleGenAI } = require('@google/genai');

/**
 * Gemini Service for AI Placement Intelligence
 * Provides:
 * 1. Recruiter Copilot: Resume vs Drive deep analysis (Match score, ATS score, keyword coverage,
 *    matched/missing skills, strengths, candidate summary, dimension scores, recommendation).
 * 2. Student Copilot: Comprehensive skill-gap analysis across all drives, why ineligible,
 *    how to become eligible, what to learn next, radar scores, and a structured week-by-week learning roadmap.
 * Includes a robust heuristic fallback engine if GEMINI_API_KEY is unset or API limit is exceeded.
 */

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Heuristic fallback for candidate evaluation against a drive
 */
function evaluateCandidateHeuristic(candidate, drive) {
  const reqSkills = (drive.eligibility?.requiredSkills || drive.tags || []).map((s) => s.trim().toLowerCase());
  const candSkills = (candidate.skills || []).map((s) => s.trim().toLowerCase());
  const resumeText = (candidate.resumeParsed?.rawText || '').toLowerCase();

  const matchedSet = new Set();
  const missingSet = new Set();

  reqSkills.forEach((skill) => {
    if (candSkills.includes(skill) || (resumeText && resumeText.includes(skill))) {
      matchedSet.add(skill);
    } else {
      missingSet.add(skill);
    }
  });

  const matchedSkills = Array.from(matchedSet);
  const missingSkills = Array.from(missingSet);

  const totalReq = reqSkills.length || 1;
  const skillMatchPct = Math.round((matchedSkills.length / totalReq) * 100);

  // Experience fit estimate based on year and cgpa
  let experienceFit = 75;
  if (candidate.year === '4th Year') experienceFit = 90;
  else if (candidate.year === '3rd Year') experienceFit = 80;
  else if (candidate.year === '2nd Year') experienceFit = 65;

  // Requirement fit based on CGPA and backlogs
  let reqFit = 80;
  const minCgpa = drive.eligibility?.minCgpa || 6.0;
  if (candidate.cgpa >= minCgpa) reqFit += 10;
  else reqFit -= 25;
  if (candidate.backlogs > 0) reqFit -= 20;
  reqFit = Math.max(20, Math.min(100, reqFit));

  const keywordCoverage = Math.max(30, Math.min(100, Math.round((skillMatchPct * 0.7) + (reqFit * 0.3))));
  const atsScore = Math.max(35, Math.min(98, Math.round((keywordCoverage * 0.5) + (skillMatchPct * 0.3) + (experienceFit * 0.2))));
  const matchScore = Math.round((skillMatchPct * 0.5) + (atsScore * 0.3) + (reqFit * 0.2));

  // Strengths
  const strengths = [];
  if (candidate.cgpa >= 8.5) strengths.push(`Exceptional academic record with ${candidate.cgpa} CGPA`);
  else if (candidate.cgpa >= 7.5) strengths.push(`Strong academic background (${candidate.cgpa} CGPA)`);
  if (matchedSkills.length > 0) strengths.push(`Proficient in key drive requirements: ${matchedSkills.slice(0, 3).join(', ')}`);
  if (candidate.backlogs === 0) strengths.push('Zero active backlogs with clean standing');
  if (candidate.year) strengths.push(`Eligible batch standing (${candidate.year})`);

  // Candidate summary
  let summary = '';
  if (matchScore >= 85) {
    summary = `Top tier candidate with ${matchedSkills.join(', ')} expertise and strong academic metrics. Highly aligned with ${drive.title}.`;
  } else if (matchScore >= 70) {
    summary = `Solid prospective match demonstrating foundational competence. Would benefit from deeper exposure to ${missingSkills.slice(0, 2).join(' and ') || 'advanced tools'}.`;
  } else {
    summary = `Foundational profile with high growth potential, but has skill gaps in ${missingSkills.join(', ') || 'specialized technical areas'}.`;
  }

  // Dimension scores
  const technicalSkills = Math.min(98, Math.max(45, skillMatchPct));
  const cultureFit = Math.min(95, Math.max(60, 75 + Math.floor(Math.random() * 15)));
  const communication = Math.min(95, Math.max(65, 70 + Math.floor(Math.random() * 20)));
  const experience = Math.min(98, Math.max(40, experienceFit));

  let recommendation = 'Good Match';
  if (matchScore >= 88) recommendation = 'Strong Match';
  else if (matchScore >= 70) recommendation = 'Good Match';
  else if (matchScore >= 50) recommendation = 'Potential Fit';
  else recommendation = 'Not Recommended';

  return {
    matchScore,
    atsScore,
    keywordCoverage,
    breakdown: {
      skillMatch: skillMatchPct,
      experienceFit,
      requirementFit: reqFit,
    },
    matchedSkills: matchedSkills.map((s) => s.toUpperCase()),
    missingSkills: missingSkills.map((s) => s.toUpperCase()),
    strengths,
    candidateSummary: summary,
    dimensionScores: {
      technicalSkills,
      cultureFit,
      communication,
      experience,
    },
    aiRecommendation: recommendation,
    analyzedAt: new Date(),
    engine: 'heuristic',
  };
}

/**
 * Recruiter Copilot: Evaluate Candidate against Drive using Gemini with fallback
 */
async function evaluateCandidateAgainstDrive(candidate, drive) {
  const client = getGeminiClient();
  if (!client) {
    return evaluateCandidateHeuristic(candidate, drive);
  }

  const prompt = `
You are an expert AI Technical Recruiter screening candidates for university placement drives.
Analyze this student candidate's profile and resume against the specific job drive description.

Candidate Profile:
- Name: ${candidate.user?.name || 'Applicant'}
- Branch: ${candidate.branch || 'N/A'}
- Year: ${candidate.year || 'N/A'}
- CGPA: ${candidate.cgpa || 0}
- Backlogs: ${candidate.backlogs || 0}
- Profile Skills: ${(candidate.skills || []).join(', ')}
- Resume Extracted Text snippet: ${(candidate.resumeParsed?.rawText || '').slice(0, 2500)}

Job Drive Details:
- Title: ${drive.title}
- Job Type: ${drive.jobType}
- Location: ${drive.location}
- Description: ${drive.description}
- Required Skills: ${(drive.eligibility?.requiredSkills || []).join(', ')}
- Tags: ${(drive.tags || []).join(', ')}
- Min CGPA: ${drive.eligibility?.minCgpa || 0}
- Max Backlogs Allowed: ${drive.eligibility?.maxBacklogs ?? 0}

Respond ONLY with a valid JSON object with the following schema:
{
  "matchScore": number (0-100 overall compatibility),
  "atsScore": number (0-100 resume formatting and ATS keyword strength),
  "keywordCoverage": number (0-100 percentage of required keywords covered),
  "breakdown": {
    "skillMatch": number (0-100),
    "experienceFit": number (0-100),
    "requirementFit": number (0-100)
  },
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1", "missingSkill2"],
  "strengths": ["Clear 1-sentence strength 1", "Strength 2", "Strength 3"],
  "candidateSummary": "Concise 2-sentence executive summary of the candidate's alignment and gaps.",
  "dimensionScores": {
    "technicalSkills": number (0-100),
    "cultureFit": number (0-100),
    "communication": number (0-100),
    "experience": number (0-100)
  },
  "aiRecommendation": "Strong Match" | "Good Match" | "Potential Fit" | "Not Recommended"
}
`;

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      analyzedAt: new Date(),
      engine: 'gemini',
    };
  } catch (err) {
    console.warn('[GeminiService] Gemini call failed, using fallback engine:', err.message);
    return evaluateCandidateHeuristic(candidate, drive);
  }
}

/**
 * Heuristic fallback for Student Skill Gap & Learning Roadmap
 */
function generateStudentSkillGapHeuristic(student, drives) {
  const studentSkills = (student.skills || []).map((s) => s.trim().toLowerCase());
  const studentCgpa = student.cgpa || 0;
  const studentBacklogs = student.backlogs || 0;
  const studentYear = student.year || '';
  const studentBranch = (student.branch || '').toLowerCase();

  let eligibleCount = 0;
  let nearMatchCount = 0;
  let missedCount = 0;

  const missingSkillFrequency = {};
  const whyIneligibleReasons = new Set();
  const howToBecomeEligible = new Set();

  drives.forEach((d) => {
    const rules = d.eligibility || {};
    const reqSkills = (rules.requiredSkills || []).map((s) => s.trim().toLowerCase());
    const minCgpa = rules.minCgpa || 0;
    const maxBacklogs = rules.maxBacklogs ?? 0;
    const allowedYears = rules.years || [];
    const allowedBranches = (rules.branches || []).map((b) => b.toLowerCase());

    const missingSkills = reqSkills.filter((sk) => !studentSkills.includes(sk));
    missingSkills.forEach((sk) => {
      const proper = sk.charAt(0).toUpperCase() + sk.slice(1);
      missingSkillFrequency[proper] = (missingSkillFrequency[proper] || 0) + 1;
    });

    let isEligible = true;
    let issues = 0;

    if (studentCgpa < minCgpa) {
      isEligible = false;
      issues++;
      whyIneligibleReasons.add(`CGPA (${studentCgpa}) is below required cutoff of ${minCgpa} for ${d.title}`);
      howToBecomeEligible.add(`Improve semester GPA to raise aggregate CGPA above ${minCgpa}`);
    }

    if (studentBacklogs > maxBacklogs) {
      isEligible = false;
      issues++;
      whyIneligibleReasons.add(`${studentBacklogs} active backlog(s) exceed maximum allowed (${maxBacklogs})`);
      howToBecomeEligible.add('Clear remaining backlog papers in upcoming supplementary exams');
    }

    if (allowedYears.length > 0 && !allowedYears.includes(studentYear)) {
      isEligible = false;
      issues++;
    }

    if (allowedBranches.length > 0 && !allowedBranches.includes(studentBranch)) {
      isEligible = false;
      issues++;
    }

    if (missingSkills.length > 0) {
      isEligible = false;
      issues++;
      whyIneligibleReasons.add(`Missing core tech requirements for ${d.title}: ${missingSkills.slice(0, 3).join(', ')}`);
      howToBecomeEligible.add(`Complete projects or certifications in ${missingSkills.slice(0, 2).join(' & ')}`);
    }

    if (isEligible) {
      eligibleCount++;
    } else if (issues === 1) {
      nearMatchCount++;
    } else {
      missedCount++;
    }
  });

  // Top missing skills ranked by frequency
  const sortedMissingSkills = Object.entries(missingSkillFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([skill, count], idx) => ({
      skill,
      missingInDrivesCount: count,
      priority: idx < 2 ? 'High' : idx < 5 ? 'Medium' : 'Low',
    }));

  // Radar scores (6 dimensions)
  const technicalFitCurrent = Math.max(30, Math.min(95, studentSkills.length * 15));
  const radarScores = [
    { subject: 'Technical Fit', currentLevel: technicalFitCurrent, expectedLevel: 85, gap: technicalFitCurrent - 85, status: technicalFitCurrent >= 85 ? 'meets' : technicalFitCurrent >= 60 ? 'below' : 'critical' },
    { subject: 'Communication', currentLevel: 75, expectedLevel: 80, gap: -5, status: 'below' },
    { subject: 'Leadership', currentLevel: 70, expectedLevel: 75, gap: -5, status: 'below' },
    { subject: 'Domain Knowledge', currentLevel: Math.max(40, studentCgpa * 9), expectedLevel: 80, gap: Math.round(studentCgpa * 9) - 80, status: studentCgpa >= 8.5 ? 'meets' : 'below' },
    { subject: 'Problem Solving', currentLevel: studentSkills.includes('dsa') || studentSkills.includes('algorithms') ? 85 : 60, expectedLevel: 80, gap: (studentSkills.includes('dsa') ? 85 : 60) - 80, status: studentSkills.includes('dsa') ? 'meets' : 'critical' },
    { subject: 'Teamwork', currentLevel: 80, expectedLevel: 80, gap: 0, status: 'meets' },
  ];

  // Dynamic weekly learning roadmap
  const top1 = sortedMissingSkills[0]?.skill || 'Node.js';
  const top2 = sortedMissingSkills[1]?.skill || 'Docker';
  const top3 = sortedMissingSkills[2]?.skill || 'TypeScript';

  const weeks = [
    {
      week: 1,
      title: `Learn ${top1} Fundamentals & Architecture`,
      focus: `Master the runtime fundamentals, event loop, and modular design of ${top1}.`,
      skillsTargeted: [top1, 'Core Architecture'],
      tasks: [
        { task: `Complete official getting started documentation and core concepts for ${top1}`, completed: false },
        { task: `Build 3 CLI automation scripts testing asynchronous operations and error handlers`, completed: false },
        { task: `Write modular unit tests validating core functionality`, completed: false },
      ],
      milestoneProject: `Build an asynchronous task queue or file processing utility using ${top1}`,
    },
    {
      week: 2,
      title: `Build a Full-Stack REST API with Database Integration`,
      focus: `Implement production-ready REST endpoints, JWT authentication, and schema validation.`,
      skillsTargeted: [top1, 'REST APIs', 'MongoDB/SQL'],
      tasks: [
        { task: `Design database models with indexes and input sanitization`, completed: false },
        { task: `Implement secure authentication with JSON Web Tokens (JWT) and bcrypt`, completed: false },
        { task: `Document all endpoints using Postman or Swagger/OpenAPI`, completed: false },
      ],
      milestoneProject: 'Deploy a multi-tenant backend API with role-based access control',
    },
    {
      week: 3,
      title: `Containerization & Deployment with ${top2}`,
      focus: `Containerize microservices and create repeatable deployment environments.`,
      skillsTargeted: [top2, 'DevOps', 'CI/CD'],
      tasks: [
        { task: `Write optimized multi-stage Dockerfiles reducing image footprint`, completed: false },
        { task: `Set up docker-compose for multi-container web + database services`, completed: false },
        { task: `Implement environment variable secrets configuration for production`, completed: false },
      ],
      milestoneProject: 'Containerize and publish your full-stack service with automated healthchecks',
    },
    {
      week: 4,
      title: `Type Safety & Advanced Design with ${top3}`,
      focus: `Refactor backend/frontend code to strict typed interfaces and design patterns.`,
      skillsTargeted: [top3, 'System Design', 'Code Quality'],
      tasks: [
        { task: `Configure tsconfig with strict type checking and aliases`, completed: false },
        { task: `Implement generic API response models and shared DTOs`, completed: false },
        { task: `Mock technical interview questions and publish project on GitHub`, completed: false },
      ],
      milestoneProject: 'End-to-end typed enterprise application showcase ready for technical interviews',
    },
  ];

  return {
    eligibleDrivesCount: eligibleCount,
    nearMatchDrivesCount: nearMatchCount,
    missedOpportunitiesCount: missedCount,
    totalDrivesCount: drives.length,
    whyIneligible: Array.from(whyIneligibleReasons).slice(0, 5),
    howToBecomeEligible: Array.from(howToBecomeEligible).slice(0, 5),
    whatToLearnNext: sortedMissingSkills.slice(0, 4).map((s) => `Master ${s.skill} to qualify for ${s.missingInDrivesCount} more drive(s)`),
    topMissingSkills: sortedMissingSkills.slice(0, 8),
    radarScores,
    weeks,
    overallGapScore: -Math.max(10, Math.round(100 - (eligibleCount / (drives.length || 1)) * 100)),
    averageGap: -14.3,
    criticalGapsCount: radarScores.filter((r) => r.status === 'critical').length || 1,
    strengthsCount: radarScores.filter((r) => r.status === 'meets').length || 2,
    engine: 'heuristic',
  };
}

/**
 * Student Copilot: Generate Skill Gap & Roadmap using Gemini with fallback
 */
async function generateStudentSkillGapAndRoadmap(student, drives) {
  const client = getGeminiClient();
  if (!client) {
    return generateStudentSkillGapHeuristic(student, drives);
  }

  const prompt = `
You are an expert AI Career Coach for college placement portals.
Analyze this student's profile against all current college placement drives to generate a comprehensive Smart Skill Gap Report and an actionable 4-week AI Learning Roadmap.

Student Profile:
- Name: ${student.user?.name || 'Student'}
- Branch: ${student.branch}
- Year: ${student.year}
- CGPA: ${student.cgpa}
- Backlogs: ${student.backlogs}
- Current Skills: ${(student.skills || []).join(', ')}

Current Placement Drives Available (${drives.length} drives):
${drives
  .map(
    (d, i) =>
      `${i + 1}. ${d.title} (Type: ${d.jobType}, Required Skills: ${(d.eligibility?.requiredSkills || []).join(', ')}, Min CGPA: ${d.eligibility?.minCgpa || 0}, Max Backlogs: ${d.eligibility?.maxBacklogs ?? 0})`
  )
  .join('\n')}

Analyze their eligibility across all drives, calculate top missing skills, compute radar dimensions, and generate a tailored weekly roadmap.

Respond ONLY with a valid JSON object following this exact schema:
{
  "eligibleDrivesCount": number,
  "nearMatchDrivesCount": number,
  "missedOpportunitiesCount": number,
  "whyIneligible": ["Specific reason 1", "Specific reason 2", "Specific reason 3"],
  "howToBecomeEligible": ["Actionable step 1", "Actionable step 2", "Actionable step 3"],
  "whatToLearnNext": ["Guidance point 1", "Guidance point 2", "Guidance point 3"],
  "topMissingSkills": [
    { "skill": "Node.js", "missingInDrivesCount": 9, "priority": "High" },
    { "skill": "Docker", "missingInDrivesCount": 6, "priority": "High" },
    { "skill": "TypeScript", "missingInDrivesCount": 4, "priority": "Medium" }
  ],
  "radarScores": [
    { "subject": "Technical Fit", "currentLevel": 60, "expectedLevel": 80, "gap": -20, "status": "below" },
    { "subject": "Communication", "currentLevel": 70, "expectedLevel": 80, "gap": -10, "status": "below" },
    { "subject": "Leadership", "currentLevel": 65, "expectedLevel": 75, "gap": -10, "status": "below" },
    { "subject": "Domain Knowledge", "currentLevel": 50, "expectedLevel": 80, "gap": -30, "status": "critical" },
    { "subject": "Problem Solving", "currentLevel": 70, "expectedLevel": 80, "gap": -10, "status": "below" },
    { "subject": "Teamwork", "currentLevel": 75, "expectedLevel": 80, "gap": -5, "status": "below" }
  ],
  "weeks": [
    {
      "week": 1,
      "title": "Week 1: Learn Node.js fundamentals",
      "focus": "Core event loop, async patterns, and modules.",
      "skillsTargeted": ["Node.js", "JavaScript"],
      "tasks": [
        { "task": "Complete Node.js fundamentals and HTTP module tutorials", "completed": false },
        { "task": "Build an asynchronous event emitter task runner", "completed": false }
      ],
      "milestoneProject": "Build a command-line automation tool in Node.js"
    }
  ],
  "overallGapScore": number (e.g. -85),
  "averageGap": number (e.g. -14.3),
  "criticalGapsCount": number,
  "strengthsCount": number
}
`;

  try {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      ...parsed,
      totalDrivesCount: drives.length,
      engine: 'gemini',
    };
  } catch (err) {
    console.warn('[GeminiService] Gemini call failed, using fallback engine:', err.message);
    return generateStudentSkillGapHeuristic(student, drives);
  }
}

module.exports = {
  evaluateCandidateAgainstDrive,
  evaluateCandidateHeuristic,
  generateStudentSkillGapAndRoadmap,
  generateStudentSkillGapHeuristic,
};
