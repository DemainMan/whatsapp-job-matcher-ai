# JobMatchr AI  PROJECT

WhatsApp-driven job matching intelligence. A production-ready React + Vite single-page app that ingests a candidate's raw WhatsApp message or CV, extracts a structured profile with heuristic AI, scores it against a live + curated job database, and dispatches a formatted WhatsApp report.

## Features

1. **WhatsApp Intake** — Interactive WhatsApp chat simulator plus raw-text parsing (name, phone, experience, seniority, location, work setup, salary floor, technical skills).
2. **Qualification Matrix** — Edit candidate skills, experience, and salary floor with sliders.
3. **Job API & Matcher** — Weighted qualification scorer (75% core requirements / 25% secondary). Live API mode pulls from the public [Remotive API](https://remotive.com/) with automatic fallback to 18 curated South Africa + Global Remote roles.
4. **WhatsApp Dispatch** — Pre-formatted markdown report, editable before sending, delivered to the built-in bot simulator (with confetti 🎉) or as a `wa.me` deep-link.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS v4 (WhatsApp-themed dark UI)
- lucide-react icons, canvas-confetti
- axios for live job fetching

## Quick Start

The app has two parts: the Vite frontend (`localhost:3000`) and a tiny Node proxy server (`localhost:4000`) that aggregates live South African jobs. Run both:

**Terminal 1 — backend proxy (SA job sources):**
```bash
npm run server
```

**Terminal 2 — frontend:**
```bash
npm run dev
```
Then open **http://localhost:3000/**. The Vite dev server proxies `/api/*` to the backend, so no CORS setup is needed.

One command instead of two terminals:
```bash
npm run dev:all     # starts backend + frontend together
```

Production build:

```bash
npm run build
npm run preview
```

## Live Job Sources (backend proxy)

The `server/index.mjs` Node proxy aggregates jobs into a single `/api/jobs?q=…&location=…` endpoint and caches responses for 5 minutes:

| Source | How it fetches | Coverage |
|--------|---------------|----------|
| **PNet** (`pnet.co.za`) | Scrapes the embedded JSON `items` array from the public search page | South Africa, local + salary in ZAR |
| **MyCareers** (`mycareers.co.za`) | Official WordPress REST API (`/wp-json/wp/v2/posts`) | South Africa, learnerships/internships/bursaries/jobs |
| **Remotive** | Public JSON API passthrough | Global remote roles (USD) |

Why the sites you asked about are not included:
- **Indeed ZA** (`za.indeed.com`) — RSS was discontinued (returns 404) and their search pages return HTTP 403 to non-browser traffic. Blocked.
- **SAYouth** (`sayouth.mobi`) — behind a Keycloak login (SSO), no public listings endpoint. Needs credentials.

Each source is fetched in parallel with `Promise.allSettled`, so if one site is down the others still return. Add a new source by writing a `fetchXxx(q)` function in `server/index.mjs` and registering it in the `sources` array in `aggregateJobs()`.

## Project Structure

```
server/         # Node/Express proxy: aggregates PNet, MyCareers, Remotive → /api/jobs
src/
  components/   # Navbar, WhatsAppIntake, CandidateMatrix, JobSearchEngine, WhatsAppDispatch, SettingsModal
  data/         # sampleCandidates.js, mockJobs.js
  utils/        # whatsappParser.js (regex extraction), qualificationEngine.js (weighted scorer)
```

## API Keys

Optional provider keys (JSearch, Adzuna, Jooble, Meta WhatsApp Cloud API, Twilio, OpenAI/Claude) are stored locally via `localStorage` under `jobmatchr_api_keys` in **Settings & APIs**.
