import express from 'express';

const PORT = process.env.PORT || 4000;
const CACHE_TTL_MS = 5 * 60 * 1000;

const BROWSER_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const SKILL_POOL = [
  'React', 'TypeScript', 'Node.js', 'JavaScript', 'Python', 'Django', 'Java',
  'PostgreSQL', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'Go', 'GraphQL',
  'Redis', 'CI/CD', 'Linux', 'PHP', 'CSS', 'HTML', 'C#', '.NET', 'Angular',
  'Vue', 'Flutter', 'Salesforce', 'SAP', 'Excel', 'Accounting',
];

const app = express();
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < CACHE_TTL_MS) return entry.value;
  cache.delete(key);
  return null;
}

function setCached(key, value) {
  cache.set(key, { at: Date.now(), value });
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSkills(text, fallback) {
  const haystack = ` ${String(text).toLowerCase()} `;
  const matched = SKILL_POOL.filter((s) => haystack.includes(s.toLowerCase()));
  return matched.length > 0 ? matched.slice(0, 5) : fallback;
}

function estimateSalary(currency, hasAmount) {
  if (currency === 'ZAR') {
    return hasAmount
      ? { min: 420000, max: 750000 }
      : { min: 250000, max: 550000 };
  }
  return hasAmount ? { min: 60000, max: 90000 } : { min: 45000, max: 80000 };
}

function normalizeJob(raw, source, currency, location) {
  const { title, company, url, description } = raw;
  const salary = estimateSalary(currency, Boolean(raw.salaryMin));
  const requiredSkills = raw.requiredSkills || extractSkills(`${title} ${description}`, []);
  const workSetup = raw.workSetup || (source === 'Remotive' ? 'Remote' : 'On-site');

  return {
    id: raw.id || `${source}-${encodeURIComponent(title)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    company: company || 'Unknown company',
    location: location || 'South Africa',
    workSetup,
    salaryMin: raw.salaryMin || salary.min,
    salaryMax: raw.salaryMax || salary.max,
    currency,
    source,
    url,
    description: stripHtml(description).slice(0, 400) || `${source} role sourced live.`,
    requirements: {
      minYearsExperience: raw.minYearsExperience ?? 2,
      requiredSkills,
      optionalSkills: ['Communication', 'Team player'],
      allowedLocations: ['South Africa', 'Global Remote', 'Remote ZA'],
      visaRequired: false,
      salaryBudget: raw.salaryMax || salary.max,
    },
  };
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-ZA,en;q=0.9',
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-ZA,en;q=0.9',
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPNet(q, location) {
  const url =
    `https://www.pnet.co.za/jobs?what=${encodeURIComponent(q || 'developer')}` +
    `&where=${encodeURIComponent(location || '')}`;
  const html = await fetchText(url);
  const marker = '"items":';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error('PNet items array not found');
  const from = start + marker.length;

  let depth = 0;
  let end = -1;
  for (let i = from; i < html.length; i += 1) {
    const ch = html[i];
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error('PNet items array not closed');
  const items = JSON.parse(html.slice(from, end));

  return items
    .filter((item) => item.title && item.url)
    .slice(0, 20)
    .map((item) =>
      normalizeJob(
        {
          id: `pnet-${item.id}`,
          title: item.title,
          company: item.companyName,
          url: `https://www.pnet.co.za${item.url.split('?')[0]}`,
          description: `${item.textSnippet || ''} ${item.title}`,
          workSetup: item.workFromHome === '1' ? 'Remote' : 'On-site',
          requiredSkills: extractSkills(`${item.title} ${item.textSnippet || ''}`, []),
        },
        'PNet',
        'ZAR',
        item.location || location || 'South Africa',
      ),
    );
}

async function fetchMyCareers(q) {
  const url =
    `https://www.mycareers.co.za/wp-json/wp/v2/posts?per_page=20&_fields=id,link,title,excerpt,date&search=${encodeURIComponent(q || 'jobs')}`;
  const data = await fetchJson(url);
  const GUIDE_RE = /how to|guide|step.?by.?step|what is|best |is it|review|free|list of|2026|roadmap|requirements to become/i;
  const JOB_RE = /job|vacan|learnership|internship|bursar|graduate|career|position|hiring|opening|recruit|apprentice|artisan|driver|cleaner|admin/i;

  return data
    .filter((post) => post.title?.rendered && !GUIDE_RE.test(post.title.rendered))
    .filter((post) => JOB_RE.test(post.title.rendered))
    .slice(0, 15)
    .map((post) =>
      normalizeJob(
        {
          id: `mycareers-${post.id}`,
          title: stripHtml(post.title.rendered),
          company: 'MyCareers',
          url: post.link,
          description: stripHtml(post.excerpt?.rendered || ''),
        },
        'MyCareers',
        'ZAR',
        'South Africa',
      ),
    );
}

async function fetchRemotive(q) {
  const url = `https://remotive.com/api/remote-jobs?limit=15&search=${encodeURIComponent(q || '')}`;
  const data = await fetchJson(url);
  return (data.jobs || [])
    .filter((job) => job.title)
    .slice(0, 15)
    .map((job) =>
      normalizeJob(
        {
          id: `remotive-${job.id}`,
          title: job.title,
          company: job.company_name,
          url: job.url,
          description: `${job.category || ''} ${job.tags?.join(' ') || ''}`,
          workSetup: 'Remote',
          requiredSkills: extractSkills(`${job.title} ${job.tags?.join(' ') || ''}`, []),
        },
        'Remotive',
        'USD',
        'Global Remote',
      ),
    );
}

async function aggregateJobs(q, location) {
  const sources = [
    { name: 'PNet', run: () => fetchPNet(q, location) },
    { name: 'MyCareers', run: () => fetchMyCareers(q) },
    { name: 'Remotive', run: () => fetchRemotive(q) },
  ];

  const settled = await Promise.allSettled(sources.map((s) => s.run()));
  const jobs = [];
  const status = {};
  settled.forEach((result, i) => {
    status[sources[i].name] = result.status === 'fulfilled' ? 'up' : 'down';
    if (result.status === 'fulfilled') jobs.push(...result.value);
  });
  return { jobs, status };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'jobmatchr-proxy', sources: ['PNet', 'MyCareers', 'Remotive'] });
});

app.get('/api/jobs', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const location = String(req.query.location || '').trim();
  const cacheKey = `jobs:${q.toLowerCase()}:${location.toLowerCase()}`;

  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const result = await aggregateJobs(q, location);
    result.fetchedAt = new Date().toISOString();
    setCached(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('[api/jobs]', err.message);
    res.status(502).json({ error: err.message, jobs: [], status: {} });
  }
});

app.listen(PORT, () => {
  console.log(`JobMatchr proxy listening on http://localhost:${PORT}`);
  console.log('Sources: PNet (scrape), MyCareers (WP REST), Remotive (global remote)');
});
