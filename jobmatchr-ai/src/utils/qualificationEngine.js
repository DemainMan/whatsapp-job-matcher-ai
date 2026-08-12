function normalizeSkill(skill) {
  return String(skill || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, '');
}

function skillMatch(candidateSkill, requiredSkill) {
  const cs = normalizeSkill(candidateSkill);
  const rs = normalizeSkill(requiredSkill);
  if (!cs || !rs) return false;
  if (cs === rs) return true;
  if (cs.includes(rs) || rs.includes(cs)) return true;
  const synonyms = {
    nodejs: ['node', 'node.js', 'express', 'nodejs'],
    react: ['reactjs', 'react.js'],
    typescript: ['ts'],
    postgresql: ['postgres', 'sql'],
    restapi: ['rest', 'restful', 'restapis'],
    cicd: ['ci', 'cd', 'jenkins', 'githubactions'],
    golang: ['go'],
    scikitlearn: ['sklearn'],
    tensorflow: ['tf'],
    pytorch: ['torch'],
    mlops: ['mlops'],
    aws: ['amazonwebservices', 'ec2', 's3', 'lambda'],
  };
  return Object.values(synonyms).some((group) => group.includes(cs) && group.includes(rs));
}

function isLocationAllowed(candidateLocation, allowedLocations) {
  const candidate = normalizeSkill(candidateLocation);
  if (!allowedLocations || allowedLocations.length === 0) return true;
  if (allowedLocations.includes('Global Remote')) return true;
  return allowedLocations.some((allowed) => {
    const a = normalizeSkill(allowed);
    if (candidate === a) return true;
    if (a.includes('remote') && candidate.includes('remote')) return true;
    const cityMatch = candidateLocation
      .toLowerCase()
      .includes(allowed.toLowerCase().replace(/\s+/g, ' '));
    return cityMatch;
  });
}

function locationIsRemote(location) {
  return /remote|wfh/i.test(location || '');
}

function calculateJobMatch(candidate, job) {
  if (!candidate || !job) return null;

  const reasons = [];
  const gaps = [];
  let total = 0;

  const requiredSkills = job.requirements?.requiredSkills || [];
  const optionalSkills = job.requirements?.optionalSkills || [];
  const candidateSkills = candidate.skills || [];

  const matchedRequired = requiredSkills.filter((skill) =>
    candidateSkills.some((cSkill) => skillMatch(cSkill, skill)),
  );
  const matchedOptional = optionalSkills.filter((skill) =>
    candidateSkills.some((cSkill) => skillMatch(cSkill, skill)),
  );

  const requiredRatio = requiredSkills.length
    ? matchedRequired.length / requiredSkills.length
    : 1;

  const optionalRatio = optionalSkills.length
    ? matchedOptional.length / optionalSkills.length
    : 1;

  const requiredRatioPct = Math.round(requiredRatio * 100);
  const optionalRatioPct = Math.round(optionalRatio * 100);

  const expPoints = Math.min(25, Math.round((candidate.yearsOfExperience || 0) * 5));
  const expRequirement = job.requirements?.minYearsExperience || 0;

  if ((candidate.yearsOfExperience || 0) >= expRequirement) {
    reasons.push(
      `✓ Exceeds experience requirement (${candidate.yearsOfExperience} yrs vs ${expRequirement} yrs required)`,
    );
  } else if (expRequirement > 0) {
    gaps.push(
      `Missing ${expRequirement - (candidate.yearsOfExperience || 0)} yrs of experience (${candidate.yearsOfExperience || 0} yrs vs ${expRequirement} yrs required)`,
    );
  } else {
    reasons.push(`✓ ${candidate.yearsOfExperience || 0} years of experience`);
  }
  total += expPoints;

  const skillPoints = Math.round(30 * requiredRatio);
  if (requiredRatio === 1) {
    reasons.push(`✓ Full required stack matched (${matchedRequired.length}/${requiredSkills.length})`);
  } else if (matchedRequired.length > 0) {
    reasons.push(
      `✓ Matched ${matchedRequired.length}/${requiredSkills.length} required skills: ${matchedRequired.join(', ')}`,
    );
  }
  if (requiredRatio < 1 && requiredSkills.length > 0) {
    requiredSkills
      .filter((skill) => !matchedRequired.includes(skill))
      .forEach((skill) => gaps.push(`Missing required skill: ${skill}`));
  }
  total += skillPoints;

  const locationAllowed = isLocationAllowed(candidate.location, job.requirements?.allowedLocations);
  const visaRequired = job.requirements?.visaRequired;
  let locationPoints = 0;

  if (locationAllowed && !visaRequired) {
    locationPoints = 20;
    reasons.push(`✓ Location compatible (${candidate.location} allowed for ${job.location})`);
  } else {
    if (!locationAllowed) {
      gaps.push(`Location not listed: ${candidate.location} is not allowed for ${job.location}`);
      locationPoints = locationIsRemote(candidate.location) ? 8 : 4;
    }
    if (visaRequired) {
      gaps.push('Visa sponsorship required but candidate has no visa');
      locationPoints = Math.min(locationPoints, 4);
    }
  }
  total += locationPoints;

  const salaryFloor = candidate.salaryFloorUsd || 0;
  const salaryBudget = job.requirements?.salaryBudget || job.salaryMax || 0;
  let salaryPoints = 0;

  if (salaryFloor === 0) {
    salaryPoints = 15;
    reasons.push(`✓ No salary floor specified — fits ${job.salaryMin}-${job.salaryMax}`);
  } else if (salaryFloor <= salaryBudget) {
    salaryPoints = 15;
    reasons.push(`✓ Salary compatible (floor $${salaryFloor.toLocaleString()} within budget $${salaryBudget.toLocaleString()})`);
  } else {
    salaryPoints = Math.round(15 * Math.max(0.3, salaryBudget / salaryFloor));
    gaps.push(
      `Salary floor $${salaryFloor.toLocaleString()} exceeds budget $${salaryBudget.toLocaleString()}`,
    );
  }
  total += salaryPoints;

  const bonusPoints = Math.round(10 * optionalRatio);
  if (optionalRatio > 0) {
    reasons.push(`✓ ${matchedOptional.length}/${optionalSkills.length} optional skills bonus (${matchedOptional.join(', ')})`);
  }
  if (optionalSkills.length > 0) {
    optionalSkills
      .filter((skill) => !matchedOptional.includes(skill))
      .forEach((skill) => gaps.push(`Missing optional skill: ${skill}`));
  }
  total += bonusPoints;

  const score = Math.max(20, Math.min(100, Math.round(total)));

  let statusBadge;
  let badgeColor;
  if (score >= 85) {
    statusBadge = 'Excellent Match';
    badgeColor = '#00a884';
  } else if (score >= 70) {
    statusBadge = 'Strong Match';
    badgeColor = '#25d366';
  } else if (score >= 55) {
    statusBadge = 'Possible Match';
    badgeColor = '#f5c33b';
  } else {
    statusBadge = 'Weak Match';
    badgeColor = '#f15c43';
  }

  return {
    score,
    statusBadge,
    badgeColor,
    reasons,
    gaps,
    isQualified: score >= 55,
    breakdown: {
      experience: expPoints,
      skills: skillPoints,
      location: locationPoints,
      salary: salaryPoints,
      optional: bonusPoints,
      requiredRatioPct,
      optionalRatioPct,
    },
  };
}

function rankJobsForCandidate(candidate, jobs) {
  return jobs
    .map((job) => ({ ...calculateJobMatch(candidate, job), job }))
    .filter((result) => result !== null)
    .sort((a, b) => b.score - a.score);
}

export { calculateJobMatch, rankJobsForCandidate, skillMatch };
