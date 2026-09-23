const fs = require('fs');
const pdfParse = require('pdf-parse');

// A reasonably broad skill dictionary used for keyword extraction from resumes.
// Extend this list any time - it's plain data, no ML required.
const SKILL_DICTIONARY = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c', 'c#', 'go', 'rust',
  'react', 'redux', 'redux toolkit', 'next.js', 'vue', 'angular', 'node.js', 'node',
  'express', 'express.js', 'django', 'flask', 'spring', 'spring boot',
  'html', 'css', 'tailwind', 'tailwind css', 'bootstrap', 'sass',
  'mongodb', 'mongoose', 'mysql', 'postgresql', 'sql', 'redis', 'firebase',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github',
  'dsa', 'data structures', 'algorithms', 'oop', 'system design',
  'machine learning', 'deep learning', 'nlp', 'pandas', 'numpy', 'tensorflow', 'pytorch',
  'rest api', 'graphql', 'microservices', 'socket.io',
  'linux', 'bash', 'shell scripting', 'problem solving', 'communication', 'leadership',
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\d{10}/;

async function parseResume(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const rawText = data.text || '';
  const lowerText = rawText.toLowerCase();

  const extractedSkills = SKILL_DICTIONARY.filter((skill) => lowerText.includes(skill));

  const emailMatch = rawText.match(EMAIL_REGEX);
  const phoneMatch = rawText.match(PHONE_REGEX);

  return {
    rawText: rawText.slice(0, 5000), // cap stored text size
    extractedSkills: [...new Set(extractedSkills)],
    extractedEmail: emailMatch ? emailMatch[0] : '',
    extractedPhone: phoneMatch ? phoneMatch[0] : '',
    parsedAt: new Date(),
  };
}

/**
 * Computes a simple percentage match between the student's known skills
 * (profile skills + resume-extracted skills) and a drive's required skills.
 */
function computeMatchScore(studentSkills = [], requiredSkills = []) {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  const norm = (arr) => arr.map((s) => s.trim().toLowerCase());
  const have = new Set(norm(studentSkills));
  const need = norm(requiredSkills);
  const matched = need.filter((s) => have.has(s));
  return Math.round((matched.length / need.length) * 100);
}

module.exports = { parseResume, computeMatchScore, SKILL_DICTIONARY };
