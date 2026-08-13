# JobMatchr AI  PROJECT

WhatsApp-driven job matching intelligence. A production-ready React + Vite single-page app that ingests a candidate's raw WhatsApp message or CV, extracts a structured profile with heuristic AI, scores it against a live + curated job database, and dispatches a formatted WhatsApp report.

## Features

1. **WhatsApp Intake** — Interactive WhatsApp chat simulator plus raw-text parsing (name, phone, experience, seniority, location, work setup, salary floor, technical skills).
2. **Qualification Matrix** — Edit candidate skills, experience, and salary floor with sliders.
3. **Job API & Matcher** — Weighted qualification scorer (75% core requirements / 25% secondary). Live API mode pulls from 5 live sources (PNet, MyCareers, CareerJunction, JobMail, Remotive) with automatic fallback to 33 curated South Africa + Global Remote roles — spanning entry-level jobs, learnerships, apprenticeships, internships, bursaries and skilled trades, not just tech.
4. **WhatsApp Dispatch** — Pre-formatted markdown report, editable before sending, delivered to the built-in bot simulator (with confetti 🎉) or as a `wa.me` deep-link.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS v4 (WhatsApp-themed dark UI)
- lucide-react icons, canvas-confetti
- axios for live job fetching

## Quick Start

The app has two parts: the Vite frontend (`https://localhost:3000`) and a tiny Node proxy server (`https://localhost:4000`) that aggregates live South African jobs. Run both:

**Terminal 1 — backend proxy (SA job sources):**
```bash
npm run server
```

**Terminal 2 — frontend:**
```bash
npm run dev
```
Then open **https://localhost:3000/**. The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed.

One command instead of two terminals:
```bash
npm run dev:all     # starts backend + frontend together
```

Production build:

```bash
npm run build
npm run preview
```

## HTTPS (secure portal)

Both the frontend and the API proxy serve HTTPS using a locally generated certificate, so WhatsApp deep-links and API calls travel over TLS end to end.

First-time setup (generates a self-signed cert into `certs/`):
```bash
npm run cert
```

- Open **https://localhost:3000/**. Your browser will show a "not secure / self-signed" warning the first time because the cert is self-signed — accept/continue to proceed. For a fully trusted local cert, use [mkcert](https://github.com/FiloSottile/mkcert) and point `SSL_CERT`/`SSL_KEY` (or `certs/`) at its `localhost.pem`/`localhost-key.pem` files.
- If `certs/` is missing, both servers fall back to plain HTTP automatically.
- Run `npm run cert` again to refresh an expiring certificate.

## Production Deployment & Security

The backend proxy is hardened and can serve the built frontend from the same process (no separate static host needed).

### Recommended topology (TLS-terminating reverse proxy)

The simplest secure setup: put a reverse proxy (Caddy or nginx) with a real Let's Encrypt certificate in front of the app, and run the app on loopback only.

```bash
npm run build          # builds dist/
npm run start          # NODE_ENV=production → listens on :4000, serves dist/ + /api, TLS via reverse proxy
```

Point the reverse proxy at `http://127.0.0.1:4000`, set `TRUST_PROXY=1` (so rate limiting sees real client IPs from `X-Forwarded-For`), and set `CORS_ORIGIN=https://yourdomain.example`.

### Single-process option (self-managed TLS)

Alternatively terminate TLS in the app itself with real certificates:

```bash
SSL_CERT=/etc/letsencrypt/live/yourdomain/fullchain.pem \
SSL_KEY=/etc/letsencrypt/live/yourdomain/privkey.pem \
PORT=443 \
NODE_ENV=production \
npm run start
```

### Configuration

Copy `.env.example` → `.env` and adjust. All values are optional; see `server/index.mjs` for the full list. Never commit real `.env` files or `certs/` (both gitignored).

### Security hardening included in `server/index.mjs`

- **Security headers** via `helmet`: Content-Security-Policy (`script-src 'self'`, no inline scripts), `X-Content-Type-Options: nosniff`, HSTS, `Referrer-Policy: no-referrer` (job-board clicks don't leak the referrer), `frame-ancestors 'none'` / `X-Frame-Options` (clickjacking), `Cross-Origin-Opener-Policy` and `Permissions-Policy`.
- **Rate limiting** — 60 requests/min/IP on `/api/*` by default (`RATE_LIMIT_MAX`), returns `429` with `Retry-After`. Respects `TRUST_PROXY`.
- **CORS allow-list** — only origins in `CORS_ORIGIN` get cross-origin access; same-origin only by default.
- **Input sanitization** — `q`/`location` are stripped of control characters and length-capped (80 chars) before hitting the cache key or any upstream fetch.
- **Safe job URLs** — every job link is validated with `sanitizeUrl()` so only `http`/`https` URLs ever reach the browser (blocks `javascript:`/`data:` payloads from attacker-controlled job postings). Frontend links open with `rel="noopener noreferrer"`.
- **Bounded upstream responses** — upstream fetches stream-read with a 2 MB cap and a 12 s timeout, so a hostile or broken source page cannot exhaust memory.
- **Bounded cache** — max 500 entries with 5-minute TTL; LRU-style eviction prevents memory growth.
- **No information leakage** — internal errors are logged server-side only; clients get a generic message. No `X-Powered-By`, no stack traces, and request logs omit query strings.
- **SSRF-safe** — the proxy only ever fetches the five hardcoded `https://` source URLs; user input is URL-encoded into query strings, never into hosts or paths.
- **Certificates & secrets** — `certs/*.pem` and `.env*` are gitignored; startup logs list config but never secrets.
- **Bind address** — set `HOST=127.0.0.1` to expose the app on loopback only (recommended behind a reverse proxy).

## Live Job Sources (backend proxy)

The `server/index.mjs` Node proxy aggregates jobs into a single `/api/jobs?q=…&location=…` endpoint and caches responses for 5 minutes:

| Source | How it fetches | Coverage |
|--------|---------------|----------|
| **PNet** (`pnet.co.za`) | Scrapes the embedded JSON `items` array from the public search page | South Africa, local + salary in ZAR |
| **MyCareers** (`mycareers.co.za`) | Official WordPress REST API (`/wp-json/wp/v2/posts`), searched per query term and merged | South Africa, learnerships/internships/bursaries/apprenticeships |
| **CareerJunction** (`careerjunction.co.za`) | Scrapes the server-rendered search results HTML | South Africa, professional + artisan roles |
| **JobMail** (`jobmail.co.za`) | Scrapes the public search results HTML | South Africa, entry-level + artisan roles |
| **Remotive** | Public JSON API passthrough (query is filtered locally since their `search` param is unreliable) | Global remote roles (USD) |

All five run in parallel with `Promise.allSettled`, and the combined list is de-duplicated by title + company, so if one site is down the others still return. Add a new source by writing a `fetchXxx(q)` function in `server/index.mjs` and registering it in the `sources` array in `aggregateJobs()`.

Why the sites you asked about are not included:
- **Harambee / SA Youth** (`sayouth.mobi`) — Harambee's job marketplace runs on SA Youth, which is behind a Keycloak SSO login; there is no public listings endpoint. Harambee-posted roles already appear via PNet/JobMail.
- **Indeed ZA** (`za.indeed.com`) — RSS was discontinued (returns 404) and their search pages return HTTP 403 to non-browser traffic. Blocked.
- **Careers24** (`careers24.com`) — returns HTTP 403 to non-browser traffic. Blocked.

## Project Structure

```
server/         # Node/Express proxy: aggregates PNet, MyCareers, CareerJunction, JobMail, Remotive → /api/jobs
src/
  components/   # Navbar, WhatsAppIntake, CandidateMatrix, JobSearchEngine, WhatsAppDispatch, SettingsModal
  data/         # sampleCandidates.js, mockJobs.js
  utils/        # whatsappParser.js (regex extraction), qualificationEngine.js (weighted scorer)
```

## API Keys

Optional provider keys (JSearch, Adzuna, Jooble, Meta WhatsApp Cloud API, Twilio, OpenAI/Claude) are stored locally via `localStorage` under `jobmatchr_api_keys` in **Settings & APIs**.

> ⚠️ **Security note:** keys are kept client-side only and are never sent to the proxy. `localStorage` is readable by any script running on the page, so this is acceptable for a demo but not for production. For a real deployment, store provider keys server-side in a secrets store and proxy the calls through the backend. The CSP (`script-src 'self'`) in this project helps reduce the XSS exposure of client-side keys.
