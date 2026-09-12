/**
 * Rule-based eligibility engine.
 * No ML - pure comparison of a student profile against a drive's eligibility rules.
 * Used both to filter which drives a student can apply to, and to power the
 * Placement Eligibility Simulator (what-if scenarios, missing-skill detection).
 */

const normalizeSkills = (skills = []) => skills.map((s) => s.trim().toLowerCase()).filter(Boolean);

/**
 * Checks a single student profile against a single drive's eligibility rules.
 * Returns { eligible, reasons } where reasons explains every failing rule.
 */
function checkEligibility(student, drive) {
  const reasons = [];
  const rules = drive.eligibility || {};

  const studentSkills = normalizeSkills(student.skills);
  const requiredSkills = normalizeSkills(rules.requiredSkills);

  // CGPA check
  if (rules.minCgpa && student.cgpa < rules.minCgpa) {
    reasons.push({
      rule: 'cgpa',
      message: `CGPA ${student.cgpa} is below the required ${rules.minCgpa}`,
    });
  }

  // Branch check (empty list = open to all branches)
  if (rules.branches && rules.branches.length > 0) {
    const allowed = rules.branches.map((b) => b.toLowerCase());
    if (!allowed.includes((student.branch || '').toLowerCase())) {
      reasons.push({
        rule: 'branch',
        message: `Branch '${student.branch || 'Not set'}' is not in the eligible list (${rules.branches.join(', ')})`,
      });
    }
  }

  // Year check
  if (rules.years && rules.years.length > 0) {
    if (!rules.years.includes(student.year)) {
      reasons.push({
        rule: 'year',
        message: `Year '${student.year || 'Not set'}' is not eligible (requires ${rules.years.join(', ')})`,
      });
    }
  }

  // Backlog check
  if (typeof rules.maxBacklogs === 'number' && student.backlogs > rules.maxBacklogs) {
    reasons.push({
      rule: 'backlogs',
      message: `${student.backlogs} active backlog(s) exceeds the allowed ${rules.maxBacklogs}`,
    });
  }

  // Skills check
  if (requiredSkills.length > 0) {
    const missing = requiredSkills.filter((skill) => !studentSkills.includes(skill));
    if (missing.length > 0) {
      reasons.push({
        rule: 'skills',
        message: `Missing required skill(s): ${missing.join(', ')}`,
        missingSkills: missing,
      });
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

/**
 * Runs eligibility across a whole list of drives, returns eligible + ineligible splits.
 */
function evaluateDrivesForStudent(student, drives) {
  const eligible = [];
  const ineligible = [];

  drives.forEach((drive) => {
    const result = checkEligibility(student, drive);
    if (result.eligible) {
      eligible.push(drive);
    } else {
      ineligible.push({ drive, reasons: result.reasons });
    }
  });

  return { eligible, ineligible };
}

/**
 * Builds the "what if" simulator payload:
 * - current eligible count
 * - projected eligible count if CGPA improves, skills are added, or backlogs cleared
 * - aggregated list of missing skills across all currently-ineligible-but-close drives
 */
function simulateImprovements(student, drives) {
  const base = evaluateDrivesForStudent(student, drives);
  const baseCount = base.eligible.length;

  // Scenario 1: CGPA raised to 8.5
  const cgpaBoost = { ...student.toObject ? student.toObject() : student, cgpa: Math.max(student.cgpa, 8.5) };
  const cgpaResult = evaluateDrivesForStudent(cgpaBoost, drives);

  // Scenario 2: all missing skills across ineligible drives added
  const missingSkillsSet = new Set();
  base.ineligible.forEach(({ reasons }) => {
    reasons.forEach((r) => {
      if (r.missingSkills) r.missingSkills.forEach((s) => missingSkillsSet.add(s));
    });
  });
  const skillBoost = {
    ...(student.toObject ? student.toObject() : student),
    skills: [...student.skills, ...Array.from(missingSkillsSet)],
  };
  const skillResult = evaluateDrivesForStudent(skillBoost, drives);

  // Scenario 3: backlogs cleared
  const backlogBoost = { ...(student.toObject ? student.toObject() : student), backlogs: 0 };
  const backlogResult = evaluateDrivesForStudent(backlogBoost, drives);

  // Reasons breakdown: why the student is currently ineligible for each drive, grouped by rule
  const ruleFailureCounts = {};
  base.ineligible.forEach(({ reasons }) => {
    reasons.forEach((r) => {
      ruleFailureCounts[r.rule] = (ruleFailureCounts[r.rule] || 0) + 1;
    });
  });

  return {
    currentEligibleCount: baseCount,
    totalDrives: drives.length,
    scenarios: {
      ifCgpaImproves: {
        newEligibleCount: cgpaResult.eligible.length,
        gain: cgpaResult.eligible.length - baseCount,
        targetCgpa: 8.5,
      },
      ifSkillsAdded: {
        newEligibleCount: skillResult.eligible.length,
        gain: skillResult.eligible.length - baseCount,
        addedSkills: Array.from(missingSkillsSet),
      },
      ifBacklogsCleared: {
        newEligibleCount: backlogResult.eligible.length,
        gain: backlogResult.eligible.length - baseCount,
      },
    },
    missingSkills: Array.from(missingSkillsSet),
    ineligibilityBreakdown: ruleFailureCounts,
  };
}

module.exports = { checkEligibility, evaluateDrivesForStudent, simulateImprovements };
