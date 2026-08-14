import express from 'express';
import helmet from 'helmet';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;
const MAX_QUERY_LENGTH = 80;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 60);

const PRO_TOKEN = process.env.PRO_TOKEN ? String(process.env.PRO_TOKEN) : null;

const SOURCE_HOMEPAGES = {
  PNet: 'https://www.pnet.co.za',
  MyCareers: 'https://www.mycareers.co.za',
  CareerJunction: 'https://www.careerjunction.co.za',
  JobMail: 'https://www.jobmail.co.za',
  Remotive: 'https://remotive.com/remote-jobs',
  Jobicy: 'https://jobicy.com',
  Arbeitnow: 'https://arbeitnow.com',
};

const CERT_DIR = path.join(process.cwd(), 'certs');
const certPath = process.env.SSL_CERT || path.join(CERT_DIR, 'cert.pem');
const keyPath = process.env.SSL_KEY || path.join(CERT_DIR, 'key.pem');
const useHttps =
  Boolean(process.env.SSL_FORCE) ||
  (fs.existsSync(certPath) && fs.existsSync(keyPath));

const DIST_DIR = path.join(__dirname, '../dist');
const SERVE_STATIC =
  process.env.SERVE_STATIC === '1' ||
  (process.env.SERVE_STATIC === undefined &&
    process.env.NODE_ENV === 'production' &&
    fs.existsSync(path.join(DIST_DIR, 'index.html')));

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

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

app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < CACHE_TTL_MS) return entry.value;
  cache.delete(key);
  return null;
}

function setCached(key, value) {
  cache.set(key, { at: Date.now(), value });
  if (cache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

function stripControlChars(value) {
  let out = '';
  for (const ch of String(value || '')) {
    const code = ch.charCodeAt(0);
    out += code < 32 || code === 127 ? ' ' : ch;
  }
  return out;
}

function cleanInput(value) {
  return stripControlChars(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

function sanitizeUrl(value, fallback) {
  const raw = String(value || '').trim();
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch {
    /* not a valid absolute URL — use the safe fallback */
  }
  return fallback;
}

const rateHits = new Map();

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;
const IPV6_RE = /^[0-9a-fA-F:.]+$/;

function getClientIp(req) {
  const ip = req.ip || '';
  if (IPV4_RE.test(ip) || (IPV6_RE.test(ip) && ip.includes(':'))) return ip;
  return 'unknown';
}

function rateLimitMiddleware(req, res, next) {
  if (!req.path.startsWith('/api/')) return next();
  const key = getClientIp(req);
  const now = Date.now();
  const bucket = rateHits.get(key);
  if (!bucket || now - bucket.at >= RATE_LIMIT_WINDOW_MS) {
    rateHits.set(key, { at: now, count: 1 });
    return next();
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    res.setHeader('Retry-After', Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.at)) / 1000));
    return res.status(429).json({ error: 'Too many requests, please try again shortly.' });
  }
  return next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateHits) {
    if (now - bucket.at >= RATE_LIMIT_WINDOW_MS) rateHits.delete(key);
  }
}, 5 * 60 * 1000).unref();

function requireProToken(req, res, next) {
  if (!PRO_TOKEN) return next();
  const provided =
    req.get('x-pro-token') ||
    String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(String(provided || ''));
  const b = Buffer.from(PRO_TOKEN);
  if (a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)) {
    return next();
  }
  return res.status(403).json({ error: 'Upgrade to Pro to unlock live job sources.' });
}

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
}

function securityHeaders(req, res, next) {
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(`[req] ${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`);
  });
  next();
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(requestLogger);
app.use(rateLimitMiddleware);

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
    url: sanitizeUrl(url, SOURCE_HOMEPAGES[source] || 'https://remotive.com/remote-jobs'),
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

async function readBounded(res, maxBytes) {
  if (!res.body) throw new Error('Empty response body');
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error('Upstream response exceeded size limit');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchBounded(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: options.accept || '*/*',
        'Accept-Language': 'en-ZA,en;q=0.9',
        ...(options.headers || {}),
      },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await readBounded(res, options.maxBytes || MAX_RESPONSE_BYTES);
    return { res, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options = {}) {
  const { text } = await fetchBounded(url, {
    ...options,
    accept: 'application/json, text/plain, */*',
  });
  return JSON.parse(text);
}

async function fetchText(url, options = {}) {
  const { text } = await fetchBounded(url, {
    ...options,
    accept: 'text/html,application/xhtml+xml',
  });
  return text;
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
    .slice(0, 25)
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
  const terms = String(q || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  const searchTerms = terms.length ? terms : ['jobs'];

  const batches = await Promise.all(
    searchTerms.map((term) =>
      fetchJson(
        `https://www.mycareers.co.za/wp-json/wp/v2/posts?per_page=30&_fields=id,link,title,excerpt,date&search=${encodeURIComponent(term)}`,
      ).catch(() => []),
    ),
  );

  const byId = new Map();
  batches.forEach((batch) =>
    (batch || []).forEach((post) => {
      if (post?.id && !byId.has(post.id)) byId.set(post.id, post);
    }),
  );

  const GUIDE_RE = /how to|guide|step.?by.?step|what is|best |is it|review|free|list of|2026|roadmap|requirements to become/i;
  const STRONG_JOB_RE = /learnership|apprenticeship|internship|vacan|posts?|position|trainee|recruit|hiring|career|graduate|bursar|artisan/i;
  const JOB_RE = /job|vacan|learnership|internship|bursar|graduate|career|position|hiring|opening|recruit|apprentice|artisan|driver|cleaner|admin|apprenticeship/i;

  let posts = [...byId.values()].filter((post) => {
    const title = post.title?.rendered;
    if (!title) return false;
    if (STRONG_JOB_RE.test(title)) return true;
    return JOB_RE.test(title) && !GUIDE_RE.test(title);
  });

  if (terms.length) {
    const haystackOf = (post) =>
      `${stripHtml(post.title.rendered)} ${stripHtml(post.excerpt?.rendered || '')}`.toLowerCase();
    const allMatches = posts.filter((post) => terms.every((word) => haystackOf(post).includes(word)));
    const someMatches = posts.filter((post) => terms.some((word) => haystackOf(post).includes(word)));
    posts = allMatches.length ? allMatches : someMatches;
  }

  return posts
    .slice(0, 25)
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
  const url = `https://remotive.com/api/remote-jobs?limit=15`;
  const data = await fetchJson(url);
  const query = String(q || '').trim().toLowerCase();
  const pool = (data.jobs || []).filter((job) => job.title);
  const words = query.split(/\s+/).filter(Boolean);

  const relevant = words.length
    ? pool.filter((job) => {
        const haystack =
          `${job.title} ${job.company_name} ${(job.tags || []).join(' ')} ${job.category || ''}`.toLowerCase();
        return words.some((word) => haystack.includes(word));
      })
    : pool;

  return relevant
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

async function fetchCareerJunction(q) {
  const url =
    `https://www.careerjunction.co.za/jobs/results?Keywords=${encodeURIComponent(q || 'job')}&SortBy=Relevance&PerPage=50`;
  const html = await fetchText(url);

  return html
    .split('class="module job-result')
    .slice(1)
    .map((chunk) => {
      const id = chunk.match(/jobId="(\d+)"/)?.[1];
      const href = chunk.match(/href="(\/[^"]+\.aspx)"/)?.[1];
      const title = chunk.match(/jobId="\d+"[^>]*>\s*([^<]+?)\s*<\/a>/)?.[1];
      if (!id || !href || !title) return null;
      const company = chunk.match(/<h3>\s*<a href="[^"]*">([^<]+)<\/a>/)?.[1];
      const salary = chunk.match(/<li class="salary">([^<]*)<\/li>/)?.[1];
      const position = chunk.match(/<li class="position">([^<]*)<\/li>/)?.[1];
      const location = chunk.match(/<li class="location">\s*<a href="[^"]+">([^<]+)<\/a>/)?.[1];
      return normalizeJob(
        {
          id: `careerjunction-${id}`,
          title: title.trim(),
          company: (company || 'Unknown company').trim(),
          url: `https://www.careerjunction.co.za${href.split('?')[0]}`,
          description: `${title} ${position || ''} ${salary || ''} ${location || ''}`,
          requiredSkills: extractSkills(`${title} ${position || ''}`, []),
        },
        'CareerJunction',
        'ZAR',
        (location || 'South Africa').trim(),
      );
    })
    .filter(Boolean)
    .slice(0, 25);
}

async function fetchJobMail(q) {
  const url = `https://www.jobmail.co.za/jobs?q=${encodeURIComponent(q || 'jobs')}`;
  const html = await fetchText(url);

  return html
    .split('class="results-item tablinks"')
    .slice(1)
    .map((item) => {
      const id = item.match(/results-item-(\d+)/)?.[1];
      const href = item.match(/id="jobDetailUrl-\d+" href="([^"]+)"/)?.[1];
      const title = item.match(/<h3>([^<]+)<\/h3>/)?.[1];
      if (!id || !href || !title) return null;
      const company = item.match(/<span class="recruiter">\s*([^<]+?)\s*<\/span>/)?.[1];
      const salary = item.match(/<div class="job-info"><b>([^<]+)<\/b><\/div>/)?.[1];
      const location = item.match(/<div class="job-location">([^<]+)<\/div>/)?.[1];
      return normalizeJob(
        {
          id: `jobmail-${id}`,
          title: stripHtml(title).trim(),
          company: stripHtml(company || '').trim() || 'Job Mail',
          url: `https://www.jobmail.co.za${href.split('?')[0]}`,
          description: `${title} ${salary || ''} ${location || ''}`,
          requiredSkills: extractSkills(title, []),
        },
        'JobMail',
        'ZAR',
        stripHtml(location || '').trim() || 'South Africa',
      );
    })
    .filter(Boolean)
    .slice(0, 25);
}

async function fetchJobicy(q) {
  const url = `https://jobicy.com/api/v2/remote-jobs?count=25`;
  const data = await fetchJson(url);
  const pool = (data.jobs || []).filter((job) => job.jobTitle);
  const query = String(q || '').trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const relevant = words.length
    ? pool.filter((job) => {
        const haystack =
          `${job.jobTitle} ${job.companyName} ${(job.jobIndustry || []).join(' ')} ${job.jobExcerpt || ''}`.toLowerCase();
        return words.some((w) => haystack.includes(w));
      })
    : pool;

  return relevant
    .slice(0, 20)
    .map((job) =>
      normalizeJob(
        {
          id: `jobicy-${job.id}`,
          title: job.jobTitle,
          company: job.companyName,
          url: job.url,
          description: `${job.jobExcerpt || ''} ${(job.jobIndustry || []).join(' ')}`,
          workSetup: 'Remote',
          requiredSkills: extractSkills(`${job.jobTitle} ${(job.jobIndustry || []).join(' ')}`, []),
        },
        'Jobicy',
        'USD',
        job.jobGeo || 'Global Remote',
      ),
    );
}

async function fetchArbeitnow(q) {
  const url = `https://arbeitnow.com/api/job-board-api`;
  const data = await fetchJson(url);
  const pool = data.data || [];
  const query = String(q || '').trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const relevant = words.length
    ? pool.filter((job) => {
        const haystack =
          `${job.title || ''} ${job.company_name || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
        return words.some((w) => haystack.includes(w));
      })
    : pool;

  return relevant
    .slice(0, 20)
    .map((job) => {
      const loc = Array.isArray(job.location) ? job.location.join(', ') : job.location || 'Germany / Europe';
      return normalizeJob(
        {
          id: `arbeitnow-${job.slug}`,
          title: job.title,
          company: job.company_name,
          url: job.url,
          description: stripHtml(job.description || ''),
          workSetup: job.remote === true ? 'Remote' : 'On-site',
          requiredSkills: extractSkills(`${job.title} ${(job.tags || []).join(' ')}`, []),
        },
        'Arbeitnow',
        'EUR',
        loc,
      );
    });
}

async function aggregateJobs(q, location) {
  const sources = [
    { name: 'PNet', run: () => fetchPNet(q, location) },
    { name: 'MyCareers', run: () => fetchMyCareers(q) },
    { name: 'CareerJunction', run: () => fetchCareerJunction(q) },
    { name: 'JobMail', run: () => fetchJobMail(q) },
    { name: 'Remotive', run: () => fetchRemotive(q) },
    { name: 'Jobicy', run: () => fetchJobicy(q) },
    { name: 'Arbeitnow', run: () => fetchArbeitnow(q) },
  ];

  const settled = await Promise.allSettled(sources.map((s) => s.run()));
  const jobs = [];
  const status = {};
  settled.forEach((result, i) => {
    status[sources[i].name] = result.status === 'fulfilled' ? 'up' : 'down';
    if (result.status === 'fulfilled') jobs.push(...result.value);
  });

  const seen = new Set();
  const deduped = [];
  for (const job of jobs) {
    const key = `${String(job.title || '').toLowerCase()}::${String(job.company || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(job);
  }
  return { jobs: deduped, status };
}

app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    ok: true,
    service: 'jobmatchr-proxy',
    sources: ['PNet', 'MyCareers', 'CareerJunction', 'JobMail', 'Remotive', 'Jobicy', 'Arbeitnow'],
  });
});

app.get('/api/jobs', requireProToken, async (req, res) => {
  const q = cleanInput(req.query.q);
  const location = cleanInput(req.query.location);
  const cacheKey = `jobs:${q.toLowerCase()}:${location.toLowerCase()}`;

  const cached = getCached(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'no-store');
    return res.json(cached);
  }

  try {
    const result = await aggregateJobs(q, location);
    result.fetchedAt = new Date().toISOString();
    setCached(cacheKey, result);
    res.setHeader('Cache-Control', 'no-store');
    res.json(result);
  } catch (err) {
    console.error('[api/jobs]', err.message);
    res.status(502).json({
      error: 'Job sources are temporarily unavailable, please try again shortly.',
      jobs: [],
      status: {},
    });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (SERVE_STATIC) {
  app.use(
    express.static(DIST_DIR, {
      index: 'index.html',
      etag: true,
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api/') &&
      fs.existsSync(path.join(DIST_DIR, 'index.html'))
    ) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    return next();
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error('[error]', err?.message || err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error' });
});

const protocol = useHttps ? 'https' : 'http';
const listen = () => {
  console.log(`JobMatchr proxy listening on ${protocol}://${HOST}:${PORT}`);
  console.log(
    `TLS: ${useHttps ? `enabled (${certPath})` : 'disabled — set SSL_CERT/SSL_KEY or use a TLS-terminating reverse proxy'}`,
  );
  console.log(`Rate limit: ${RATE_LIMIT_MAX} req/min/IP | Cache: ${CACHE_MAX_ENTRIES} entries, ${CACHE_TTL_MS / 1000}s TTL`);
  console.log(`Static hosting: ${SERVE_STATIC ? `enabled (${DIST_DIR})` : 'disabled (set SERVE_STATIC=1 or NODE_ENV=production)'}`);
  console.log(`Live API access: ${PRO_TOKEN ? 'Pro token required (PRO_TOKEN set)' : 'open (no PRO_TOKEN configured)'}`);
  console.log(`CORS origins: ${allowedOrigins.length ? allowedOrigins.join(', ') : 'same-origin only'}`);
  console.log('Sources: PNet, MyCareers, CareerJunction, JobMail, Remotive, Jobicy, Arbeitnow');
};

if (useHttps) {
  https.createServer({ cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }, app).listen(PORT, HOST, listen);
} else {
  app.listen(PORT, HOST, listen);
}
