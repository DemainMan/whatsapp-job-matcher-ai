const SKILL_KEYWORDS = {
  JavaScript: ['javascript', 'js'],
  TypeScript: ['typescript', 'ts'],
  React: ['react', 'reactjs', 'react.js'],
  'Node.js': ['node', 'nodejs', 'node.js'],
  'Next.js': ['nextjs', 'next.js'],
  GraphQL: ['graphql'],
  Python: ['python'],
  Django: ['django'],
  Flask: ['flask'],
  'REST APIs': ['rest', 'rest api', 'restful', 'api design', 'web api'],
  PostgreSQL: ['postgresql', 'postgres', 'sql database'],
  MySQL: ['mysql'],
  MongoDB: ['mongodb', 'mongo'],
  Redis: ['redis'],
  Celery: ['celery'],
  Docker: ['docker', 'containerization'],
  Kubernetes: ['kubernetes', 'k8s'],
  Terraform: ['terraform'],
  AWS: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  'Google Cloud': ['gcp', 'google cloud'],
  Azure: ['azure'],
  'CI/CD': ['cicd', 'ci/cd', 'continuous integration', 'continuous delivery'],
  Linux: ['linux', 'unix', 'bash'],
  Go: ['golang', 'go programming'],
  Rust: ['rust'],
  TensorFlow: ['tensorflow', 'tf'],
  PyTorch: ['pytorch', 'torch'],
  'scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn'],
  'Machine Learning': ['machine learning', 'ml'],
  'Deep Learning': ['deep learning', 'dl'],
  'LLM': ['llm', 'large language model', 'gpt', 'langchain'],
  MLOps: ['mlops'],
  SQL: ['sql'],
  'Data Science': ['data science'],
  'Pandas': ['pandas'],
  'Numpy': ['numpy', 'numpy'],
  Prometheus: ['prometheus'],
  Grafana: ['grafana'],
  Kafka: ['kafka'],
  'Microservices': ['microservice'],
  'System Design': ['system design'],
  Agile: ['agile', 'scrum'],
  Git: ['git'],
};

const SENIORITY_LEVELS = [
  { level: 'Lead', keywords: ['lead', 'principal', 'architect', 'staff', 'head of', 'tech lead'] },
  { level: 'Senior', keywords: ['senior', 'sr', 'expert'] },
  { level: 'Mid', keywords: ['mid', 'intermediate', 'regular', 'experienced'] },
  { level: 'Junior', keywords: ['junior', 'jr', 'graduate', 'entry'] },
];

const JOB_TYPES = [
  { type: 'learnership', keywords: ['learnership', 'learnerships', 'learners', 'learning programme', 'nqf training'] },
  { type: 'apprenticeship', keywords: ['apprentice', 'apprenticeship', 'apprenticeships', 'trade test'] },
  { type: 'internship', keywords: ['intern', 'internship', 'internships', 'interns'] },
  { type: 'graduate', keywords: ['graduate', 'graduates', 'grad programme', 'grad programme'] },
  { type: 'bursary', keywords: ['bursary', 'bursaries', 'scholarship'] },
  { type: 'trainee', keywords: ['trainee', 'traineeship', 'training programme'] },
  { type: 'vacation work', keywords: ['vacation work', 'holiday work', 'vac job', 'summer work'] },
  { type: 'work experience', keywords: ['experiential learning', 'practical training', 'work readiness', 'practical experience'] },
  { type: 'yes programme', keywords: ['yes programme', 'yes program', 'yes4youth', 'youth employment service'] },
  { type: 'cadetship', keywords: ['cadetship', 'cadet programme', 'cadet program'] },
  { type: 'entry-level', keywords: ['entry level', 'entry-level', 'no experience', 'school leaver', 'matric', 'first job', 'in-service'] },
];

const ROLE_KEYWORDS = [
  { role: 'electrician', keywords: ['electrician'] },
  { role: 'welder', keywords: ['welder', 'welding', 'boilermaker'] },
  { role: 'plumber', keywords: ['plumber', 'plumbing'] },
  { role: 'mechanic', keywords: ['mechanic', 'motor mechanic', 'diesel mechanic'] },
  { role: 'fitter', keywords: ['fitter'] },
  { role: 'millwright', keywords: ['millwright'] },
  { role: 'driver', keywords: ['driver', 'driving', 'delivery driver'] },
  { role: 'carpenter', keywords: ['carpenter', 'carpentry', 'joiner'] },
  { role: 'tiler', keywords: ['tiler', 'tiling'] },
  { role: 'painter', keywords: ['painter', 'painting'] },
  { role: 'bricklayer', keywords: ['bricklayer', 'bricklaying', 'mason'] },
  { role: 'security guard', keywords: ['security guard', 'security officer'] },
  { role: 'cleaner', keywords: ['cleaner', 'cleaning', 'housekeeping'] },
  { role: 'admin', keywords: ['administrator', 'admin', 'clerical'] },
  { role: 'receptionist', keywords: ['receptionist'] },
  { role: 'nurse', keywords: ['nurse', 'nursing', 'staff nurse', 'enrolled nurse'] },
  { role: 'teacher', keywords: ['teacher', 'educator', 'teaching'] },
  { role: 'cook', keywords: ['cook', 'chef', 'kitchen'] },
  { role: 'baker', keywords: ['baker', 'baking'] },
  { role: 'technician', keywords: ['technician'] },
  { role: 'cashier', keywords: ['cashier', 'retail assistant', 'shop assistant'] },
  { role: 'sales', keywords: ['sales', 'salesperson', 'sales rep'] },
  { role: 'waiter', keywords: ['waiter', 'waitress', 'front of house'] },
  { role: 'call center', keywords: ['call centre', 'call center', 'call agent'] },
  { role: 'developer', keywords: ['developer', 'programmer', 'software engineer', 'web developer'] },
  { role: 'data analyst', keywords: ['data analyst', 'business analyst'] },
  { role: 'accountant', keywords: ['accountant', 'accounting', 'bookkeeper'] },
  { role: 'pharmacist', keywords: ['pharmacist', 'pharmacy'] },
  { role: 'builder', keywords: ['builder', 'construction', 'general worker', 'labourer'] },
  { role: 'seamstress', keywords: ['seamstress', 'tailor', 'sewing'] },
  { role: 'hairdresser', keywords: ['hairdresser', 'hair stylist', 'beautician'] },
  { role: 'engineer', keywords: ['engineer', 'engineering'] },
  { role: 'artisan', keywords: ['artisan', 'skilled trade'] },
  { role: 'forklift operator', keywords: ['forklift', 'reach truck', 'reach stacker'] },
  { role: 'machine operator', keywords: ['machine operator', 'machinery operator', 'cnc operator', 'lathe operator'] },
  { role: 'packer', keywords: ['packer', 'packing'] },
  { role: 'picker', keywords: ['picker', 'order picker'] },
  { role: 'petrol attendant', keywords: ['petrol attendant', 'fuel attendant', 'forecourt'] },
  { role: 'farm worker', keywords: ['farm worker', 'farmhand', 'agricultural worker', 'farm labourer'] },
  { role: 'gardener', keywords: ['gardener', 'landscaping', 'garden service'] },
  { role: 'data capturer', keywords: ['data capturer', 'data capture', 'data entry'] },
  { role: 'typist', keywords: ['typist'] },
  { role: 'IT support', keywords: ['it support', 'it technician', 'helpdesk', 'help desk', 'desktop support', 'it assistant'] },
  { role: 'lab assistant', keywords: ['lab assistant', 'laboratory assistant', 'lab worker'] },
  { role: 'office assistant', keywords: ['office assistant', 'office clerk', 'office administrator'] },
  { role: 'HR assistant', keywords: ['hr assistant', 'human resources assistant', 'hr clerk'] },
  { role: 'personal assistant', keywords: ['personal assistant', 'executive assistant'] },
  { role: 'handyman', keywords: ['handyman', 'maintenance man', 'maintenance worker'] },
  { role: 'barista', keywords: ['barista'] },
  { role: 'hostess', keywords: ['hostess', 'front desk host'] },
  { role: 'lifeguard', keywords: ['lifeguard', 'life guard'] },
  { role: 'ranger', keywords: ['ranger', 'field ranger', 'game ranger', 'anti-poaching'] },
  { role: 'scaffolder', keywords: ['scaffolder', 'scaffolding'] },
  { role: 'panel beater', keywords: ['panel beater', 'panelbeater'] },
  { role: 'spray painter', keywords: ['spray painter', 'spraypainter'] },
  { role: 'roofer', keywords: ['roofer', 'roofing'] },
  { role: 'merchandiser', keywords: ['merchandiser', 'merchandising'] },
  { role: 'warehouse worker', keywords: ['warehouse', 'warehousing', 'storeman', 'storage'] },
  { role: 'stock controller', keywords: ['stock controller', 'stock control', 'inventory clerk'] },
  { role: 'delivery rider', keywords: ['delivery rider', 'courier', 'motorcycle courier'] },
  { role: 'driver assistant', keywords: ['driver assistant', 'driver helper'] },
  { role: 'kitchen assistant', keywords: ['kitchen assistant', 'kitchen hand', 'kitchen porter'] },
  { role: 'teacher assistant', keywords: ['teacher assistant', 'teaching assistant', 'classroom assistant'] },
  { role: 'tutor', keywords: ['tutor', 'tutoring', 'marking assistant'] },
  { role: 'caretaker', keywords: ['caretaker', 'care taker', 'facilities caretaker'] },
  { role: 'groundskeeper', keywords: ['groundskeeper', 'groundsman', 'horticulture assistant'] },
  { role: 'nurse assistant', keywords: ['nurse assistant', 'nursing assistant', 'care worker', 'caregiver'] },
  { role: 'social worker', keywords: ['social worker', 'community worker'] },
  { role: 'firefighter', keywords: ['firefighter', 'fire fighter'] },
  { role: 'paramedic', keywords: ['paramedic', 'emergency care'] },
  { role: 'cabin crew', keywords: ['cabin crew', 'flight attendant'] },
  { role: 'quality inspector', keywords: ['quality inspector', 'quality control'] },
  { role: 'machinist', keywords: ['machinist', 'machining'] },
  { role: 'boilermaker', keywords: ['boilermaker'] },
  { role: 'diesel mechanic', keywords: ['diesel mechanic', 'auto mechanic'] },
  { role: 'auto electrician', keywords: ['auto electrician'] },
];

const WORK_SETUPS = [
  { setup: 'Remote', keywords: ['remote', 'work from home', 'wfh', 'distributed'] },
  { setup: 'Hybrid', keywords: ['hybrid'] },
  { setup: 'On-site', keywords: ['on site', 'onsite', 'in office', 'in-office'] },
];

const CITIES = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'];

const PHONE_PATTERNS = [
  /(?:\+27|0027)\s?\(?\d{2,3}\)?[\s-]?\d{3}[\s-]?\d{4}/,
  /0\d{2}[\s-]?\d{3}[\s-]?\d{4}/,
  /(?:tel|phone|cell|whatsapp|wa)[:\s]+([+\d][\d\s().-]{7,})/i,
];

function normalize(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function extractSkills(text) {
  const lower = ` ${text.toLowerCase()} `;
  const skills = [];
  Object.entries(SKILL_KEYWORDS).forEach(([skill, keywords]) => {
    if (keywords.some((kw) => lower.includes(` ${kw} `) || lower.includes(` ${kw},`))) {
      skills.push(skill);
    }
  });
  return [...new Set(skills)];
}

function extractYearsOfExperience(text) {
  const lower = text.toLowerCase();
  const patterns = [
    /(\d{1,2})\+?\s*(?:yrs?|years?)\s*(?:of\s+)?experience/i,
    /(?:over|above)\s+(\d{1,2})\s*(?:yrs?|years?)/i,
    /(\d{1,2})\s*(?:yrs?|years?)\s*(?:of\s+)?(?:hands-on\s+)?exp/i,
  ];
  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      const years = parseInt(match[1], 10);
      if (years >= 0 && years <= 30) return years;
    }
  }
  return null;
}

function extractSeniority(text) {
  const lower = text.toLowerCase();
  let best = { level: 'Mid', score: 0 };
  SENIORITY_LEVELS.forEach(({ level, keywords }) => {
    let score = 0;
    keywords.forEach((kw) => {
      if (lower.includes(kw)) score += 1;
    });
    if (score > best.score) best = { level, score };
  });
  return best.level;
}

function extractJobType(text) {
  const lower = ` ${text.toLowerCase()} `;
  for (const { type, keywords } of JOB_TYPES) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return null;
}

const FALLBACK_ROLE_STOPWORDS = new Set([
  'job', 'jobs', 'work', 'works', 'working', 'position', 'positions', 'opening', 'openings',
  'vacancy', 'vacancies', 'post', 'role', 'career', 'opportunity', 'opportunities',
  'anything', 'something', 'somewhere', 'anywhere', 'one', 'some', 'any', 'a', 'an', 'the',
  'and', 'or', 'for', 'with', 'as', 'in', 'at', 'on', 'to', 'of', 'my', 'me', 'i', 'im',
  'am', 'is', 'are', 'looking', 'searching', 'seeking', 'find', 'found', 'please', 'help',
  'want', 'need', 'can', 'do', 'get', 'like', 'would', 'could', 'also', 'have', 'has', 'been',
  'currently', 'now', 'from', 'based', 'remote', 'hybrid', 'onsite', 'south', 'africa', 'za',
  'who', 'which', 'that', 'person', 'people', 'guys', 'hardworking', 'hard', 'good', 'great',
  'ready', 'able', 'willing', 'willingness', 'cpt', 'jhb', 'pta', 'dbn', 'gauteng', 'kwazulu', 'natal', 'kzn', 'western', 'eastern',
  'northern', 'cape', 'free', 'state', 'limpopo', 'mpumalanga', 'north', 'west', 'province',
  'province', 'town', 'city', 'cities', 'relocate', 'relocation', 'willing',
  ...CITIES.map((c) => c.toLowerCase()),
]);

const FALLBACK_ROLE_PATTERNS = [
  /(?:looking|searching|seeking|hunting|applying|open|want(?:ing)?|need(?:ing)?)\s+(?:for|to)\s+(?:(?:a|an|some|any)\s+)?([a-z][\w\s-]{2,60})/,
  /(?:would like to|want to|would love to|hoping to|trying to)\s+(?:be|become|work as|get)\s+(?:(?:a|an)\s+)?([a-z][\w\s-]{2,60})/,
  /(?:job|work|position|role|vacancy)\s+as\s+(?:(?:a|an)\s+)?([a-z][\w\s-]{2,60})/,
  /(?:as a|as an)\s+([a-z][\w\s-]{2,60})/,
  /(?:interested|keen)\s+in\s+(?:(?:a|an)\s+)?([a-z][\w\s-]{2,60})/,
];

function isJobTypeWord(phrase) {
  const lower = String(phrase || '').toLowerCase();
  return JOB_TYPES.some(
    ({ keywords }) => keywords.some((kw) => lower.includes(kw) || kw.includes(lower)),
  );
}

function extractFallbackRole(text) {
  const lower = ` ${text.toLowerCase()} `;
  for (const pattern of FALLBACK_ROLE_PATTERNS) {
    const match = lower.match(pattern);
    if (!match) continue;
    const raw = match[1]
      .replace(/[.,;:!?()[\]"']/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!raw) continue;

    const words = [];
    for (const word of raw.split(/\s+/)) {
      if (FALLBACK_ROLE_STOPWORDS.has(word)) break;
      words.push(word);
      if (words.length >= 3) break;
    }
    let role = words.join(' ').trim();
    if (!role || role.length < 2) continue;
    if (isJobTypeWord(role)) continue;
    return role;
  }
  return null;
}

function extractRole(text) {
  const lower = text.toLowerCase();
  for (const { role, keywords } of ROLE_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return role;
  }
  return extractFallbackRole(text);
}

function extractLocation(text) {
  const found = CITIES.find((city) => text.includes(city));
  if (found) return found;
  if (/\bremote\b/i.test(text)) return 'Remote';
  return 'Unknown';
}

function extractWorkSetup(text) {
  const lower = text.toLowerCase();
  for (const { setup, keywords } of WORK_SETUPS) {
    if (keywords.some((kw) => lower.includes(kw))) return setup;
  }
  return 'Unknown';
}

function extractSalaryFloorUsd(text) {
  const lower = text.toLowerCase();

  const usdMatch =
    lower.match(/[$]\s?(\d{1,3}(?:,\d{3})*)\s*(?:k|,000)?/) ||
    lower.match(/usd\s*(\d{1,3}(?:,\d{3})*)\s*k?/i) ||
    lower.match(/(\d{1,3}(?:,\d{3})*)\s*(?:usd|us dollars?)/i);

  if (usdMatch) {
    const raw = usdMatch[1].replace(/,/g, '');
    const value = parseInt(raw, 10);
    if (value <= 1000) return value * 1000;
    return value;
  }

  const zarMatch = lower.match(/(?:r|zar)\s*(\d{1,3}(?:,\d{3})*)\s*(?:k|p\/a)?/i);
  if (zarMatch) {
    const raw = zarMatch[1].replace(/,/g, '');
    const value = parseInt(raw, 10);
    const zarToUsd = value <= 1000 ? value * 1000 : value;
    return Math.round(zarToUsd / 18);
  }

  return null;
}

function toE164(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) return `+27${digits.slice(1)}`;
  if (digits.length >= 9 && digits.length <= 15) return `+${digits}`;
  return null;
}

function extractPhoneNumber(text) {
  for (const pattern of PHONE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const phone = match[0].replace(/^tel[:\s]+|^phone[:\s]+|^cell[:\s]+|^whatsapp[:\s]+|^wa[:\s]+/i, '');
      const cleaned = phone.replace(/[^+\d]/g, '');
      if (cleaned.replace(/\D/g, '').length >= 9) return cleaned;
    }
  }
  return null;
}

const NAME_STOPWORDS = [
  'from', 'at', 'a', 'an', 'the', 'based', 'currently', 'looking', 'seeking',
  'for', 'in', 'with', 'and', 'i', 'im', 'am', 'is', 'this', 'my', 'name',
];
const GREETINGS = new Set([
  'hi', 'hello', 'hey', 'howzit', 'yo', 'hiya', 'gday', 'goodday',
  'sawubona', 'halo', 'hola', 'dankie', 'thanks', 'thankyou', 'guten',
]);

function extractName(text) {
  const nameMatch = text.match(
    /\b(?:i'?m|i am|my name is|this is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2})/i,
  );
  if (nameMatch) {
    const words = nameMatch[1].split(/\s+/).filter((w) => !NAME_STOPWORDS.includes(w.toLowerCase()));
    if (words.length >= 1) return words.join(' ');
  }
  const headWords = text.split(/\s+/).slice(0, 6);
  const capitalized = headWords.filter((w) => /^[A-Z][a-z]+$/.test(w));
  const nameWords = capitalized.filter((w) => {
    const lower = w.toLowerCase();
    return !GREETINGS.has(lower) && !NAME_STOPWORDS.includes(lower);
  });
  if (nameWords.length >= 1) return nameWords.slice(0, 2).join(' ');
  return 'Unknown Candidate';
}

function parseWhatsAppMessage(rawText) {
  const text = normalize(rawText);
  const phone = extractPhoneNumber(text);
  const yearsOfExperience = extractYearsOfExperience(text);
  const seniority = extractSeniority(text);
  const jobType = extractJobType(text);
  const role = extractRole(text);
  const location = extractLocation(text);
  const workSetup = extractWorkSetup(text);
  const salaryFloorUsd = extractSalaryFloorUsd(text);
  const skills = extractSkills(text);

  return {
    name: extractName(text),
    phone,
    yearsOfExperience,
    seniority,
    jobType,
    role,
    location,
    workSetup,
    visaRequired: /visa\s+(?:needed|required)|needs?\s+visa|work\s+permit|sponsorship/i.test(text),
    salaryFloorUsd,
    skills,
    rawMessage: rawText,
  };
}

export {
  parseWhatsAppMessage,
  extractSkills,
  extractYearsOfExperience,
  extractSeniority,
  extractJobType,
  extractRole,
  extractLocation,
  extractWorkSetup,
  extractSalaryFloorUsd,
  extractPhoneNumber,
  extractName,
  toE164,
};
