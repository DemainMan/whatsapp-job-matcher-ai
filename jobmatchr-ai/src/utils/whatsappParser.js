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
  const location = extractLocation(text);
  const workSetup = extractWorkSetup(text);
  const salaryFloorUsd = extractSalaryFloorUsd(text);
  const skills = extractSkills(text);

  return {
    name: extractName(text),
    phone,
    yearsOfExperience,
    seniority,
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
  extractLocation,
  extractWorkSetup,
  extractSalaryFloorUsd,
  extractPhoneNumber,
  extractName,
  toE164,
};
