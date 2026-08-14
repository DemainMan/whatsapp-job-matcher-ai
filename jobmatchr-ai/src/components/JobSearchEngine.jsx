import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  RefreshCw, Cloud, Database, Search, MapPin, CheckCircle2, AlertTriangle,
  Send, Briefcase, Building2, DollarSign, Star, Info,
} from 'lucide-react';
import MOCK_JOBS from '../data/mockJobs.js';
import { calculateJobMatch } from '../utils/qualificationEngine.js';
import { getLiveToken } from '../lib/billing.js';

const LIVE_API_URL = '/api/jobs';

function deriveQuery(candidate) {
  const type = candidate?.jobType || '';
  const focus = candidate?.role || candidate?.skills?.[0] || '';
  return [type, focus].filter(Boolean).join(' ');
}

export default function JobSearchEngine({
  candidate,
  isLiveApi,
  onToggleLiveApi,
  selectedJobIds,
  onToggleSelectJob,
  onDispatch,
  onProRequired,
}) {
  const [liveJobs, setLiveJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('idle');
  const [sourceStatus, setSourceStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [minMatch, setMinMatch] = useState(60);
  const [locationFilter, setLocationFilter] = useState('All');
  const [matchedJobs, setMatchedJobs] = useState([]);
  const requestSeq = useRef(0);
  const lastQuery = useRef(null);

  const effectiveQuery = (searchQuery.trim() || deriveQuery(candidate)).trim();

  const fetchLiveJobs = async (q = effectiveQuery) => {
    const seq = ++requestSeq.current;
    lastQuery.current = q;
    setLoading(true);
    setApiStatus('loading');
    try {
      const { data } = await axios.get(LIVE_API_URL, {
        headers: getLiveToken() ? { 'x-pro-token': getLiveToken() } : {},
        params: { q, location: 'South Africa' },
        timeout: 20000,
      });
      if (seq !== requestSeq.current) return;
      if (err?.response?.status === 403) onProRequired?.();
      if (!data.jobs || data.jobs.length === 0) throw new Error('Empty response');
      setLiveJobs(data.jobs);
      setSourceStatus(data.status || {});
      setApiStatus('live');
    } catch (err) {
      if (seq !== requestSeq.current) return;
      if (err?.response?.status === 403) onProRequired?.();
      setLiveJobs([]);
      setApiStatus('fallback');
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLiveApi) return;
    const auto = deriveQuery(candidate);
    if (!searchQuery.trim() && auto) setSearchQuery(auto);
  }, [isLiveApi, candidate, searchQuery]);

  useEffect(() => {
    if (!isLiveApi) return;
    const timer = setTimeout(
      () => {
        if (lastQuery.current !== effectiveQuery) fetchLiveJobs(effectiveQuery);
      },
      lastQuery.current === null ? 0 : 700,
    );
    return () => clearTimeout(timer);
  }, [effectiveQuery, isLiveApi]);

  const pool = useMemo(() => {
    if (!isLiveApi) return MOCK_JOBS;
    return liveJobs.length > 0 ? liveJobs : MOCK_JOBS;
  }, [isLiveApi, liveJobs]);

  const results = useMemo(() => {
    if (!candidate) return [];
    return pool
      .map((job) => ({ ...calculateJobMatch(candidate, job), job }))
      .filter((r) => r !== null);
  }, [candidate, pool]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return results
      .filter((r) => r.score >= minMatch)
      .filter((r) => {
        if (locationFilter === 'All') return true;
        if (locationFilter === 'Remote') return r.job.workSetup === 'Remote';
        if (locationFilter === 'International') {
          return ['Remotive', 'Jobicy', 'Arbeitnow'].includes(r.job.source);
        }
        if (locationFilter === 'South Africa') {
          return /cape town|johannesburg|durban|pretoria|bloemfontein|polokwane|east london|port elizabeth|gqeberha|nelspruit|mbombela|potchefstroom|kimberley|richards bay|soweto|randburg|sandton|centurion|stellenbosch|remote za|south africa|pinetown|umhlanga|westville|vereeniging|witbank|emalahleni|rustenburg|middelburg|phuthaditjhaba|tshwane|ekurhuleni|gauteng|western cape|kwazulu-natal|eastern cape|mpumalanga|free state|limpopo|northern cape|north west/i.test(
            `${r.job.location} ${r.job.workSetup}`,
          );
        }
        return true;
      })
      .filter((r) => {
        const words = q.split(/\s+/).filter(Boolean);
        if (!words.length) return true;
        const haystack = `${r.job.title} ${r.job.company} ${r.job.requirements?.requiredSkills?.join(' ')} ${r.job.description}`.toLowerCase();
        return words.some((word) => haystack.includes(word));
      })
      .sort((a, b) => b.score - a.score);
  }, [results, minMatch, locationFilter, searchQuery]);

  useEffect(() => {
    setMatchedJobs(filtered);
  }, [filtered]);

  const selectedCount = selectedJobIds.length;
  const selectedResults = results.filter((r) => selectedJobIds.includes(r.job.id));

  return (
    <div className="flex flex-col gap-4">
      <section className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-wa-teal/15 text-wa-teal">
              {isLiveApi ? <Cloud className="h-5 w-5" /> : <Database className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {isLiveApi ? 'Live API Mode — PNet · MyCareers · CareerJunction · JobMail · Remotive · Jobicy · Arbeitnow' : 'Hybrid Database Mode — 33 curated roles'}
              </p>
              <p className="text-[11px] text-white/50">
                {apiStatus === 'live' &&
                  `Fetched live · “${effectiveQuery}” · ${Object.entries(sourceStatus)
                    .filter(([, s]) => s === 'up')
                    .map(([s]) => s)
                    .join(' + ') || 'sources online'}`}
                {apiStatus === 'fallback' && (
                  <>
                    Live proxy unreachable — auto-fell back to the local job database.{' '}
                    <button
                      onClick={() => fetchLiveJobs()}
                      className="font-bold text-wa-teal underline hover:text-white"
                    >
                      Retry
                    </button>
                  </>
                )}
                {apiStatus === 'loading' && `Searching live jobs for “${effectiveQuery}”…`}
                {apiStatus === 'idle' && 'Matching against the curated South Africa / Global database'}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleLiveApi}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
              isLiveApi
                ? 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                : 'border-wa-teal/50 bg-wa-teal/10 text-wa-teal hover:bg-wa-teal/20'
            }`}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : isLiveApi ? (
              <Database className="h-4 w-4" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            {isLiveApi ? 'Switch to Database' : 'Switch to Live API'}
          </button>
        </div>
      </section>

      <section className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, skills…"
              className="w-full rounded-xl border border-white/10 bg-ink-800 py-2.5 pr-4 pl-10 text-sm text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5">
            <Star className="h-4 w-4 text-wa-green-light" />
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-32"
            />
            <span className="w-12 text-right text-sm font-bold text-wa-green-light">{minMatch}%</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['All', 'Remote', 'International', 'South Africa'].map((filter) => (
            <button
              key={filter}
              onClick={() => setLocationFilter(filter)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                locationFilter === filter
                  ? 'bg-gradient-to-r from-wa-teal to-wa-green text-white'
                  : 'border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              {filter}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-white/40">
            {filtered.length} matches above {minMatch}% score
          </span>
        </div>
      </section>

      {!candidate && (
        <div className="glass rounded-2xl border-wa-green/20 p-6 text-center">
          <Info className="mx-auto h-8 w-8 text-white/20" />
          <p className="mt-2 text-sm font-semibold text-white/60">
            Load a candidate profile first so we can rank jobs against their qualifications.
          </p>
        </div>
      )}

      {candidate && (
        <section className="grid gap-3 xl:grid-cols-2">
          {matchedJobs.map(({ job, score, statusBadge, badgeColor, reasons, gaps }) => {
            const selected = selectedJobIds.includes(job.id);
            const salaryText =
              job.currency === 'ZAR'
                ? `R${(job.salaryMin / 1000).toLocaleString()}k – R${(job.salaryMax / 1000).toLocaleString()}k`
                : `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`;
            return (
              <article
                key={job.id}
                className={`glass rounded-2xl p-4 transition ${
                  selected ? 'border-wa-teal/60 ring-1 ring-wa-teal/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wa-teal/30 to-wa-green/30 text-wa-green-light">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm leading-snug font-bold text-white">{job.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.company} · {job.location} · {job.workSetup}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-wa-green-light">
                        <DollarSign className="h-3.5 w-3.5" />
                        {salaryText}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-block rounded-full px-2.5 py-1 text-xs font-black"
                      style={{ backgroundColor: `${badgeColor}22`, color: badgeColor }}
                    >
                      {score}%
                    </span>
                    <p className="mt-1 text-[10px] font-semibold" style={{ color: badgeColor }}>
                      {statusBadge}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  {reasons.slice(0, 3).map((reason) => (
                    <p key={reason} className="flex items-start gap-1.5 text-[11px] leading-snug text-wa-green-light">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {reason}
                    </p>
                  ))}
                  {gaps.slice(0, 2).map((gap) => (
                    <p key={gap} className="flex items-start gap-1.5 text-[11px] leading-snug text-amber-400">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {gap}
                    </p>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-wa-teal hover:underline"
                  >
                    View source · {job.source}
                  </a>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-white/70">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggleSelectJob(job.id)}
                      className="h-4 w-4 accent-wa-green"
                    />
                    {selected ? 'Selected' : 'Select job'}
                  </label>
                </div>
              </article>
            );
          })}
          {matchedJobs.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center xl:col-span-2">
              <p className="text-sm font-semibold text-white/60">
                No jobs meet the current match threshold ({minMatch}%) with the active filters.
              </p>
              <p className="mt-1 text-xs text-white/40">
                Lower the minimum match % or broaden your location/search filters.
              </p>
            </div>
          )}
        </section>
      )}

      {selectedCount > 0 && (
        <div className="sticky bottom-4 z-30">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-wa-teal/40 bg-ink-800/95 px-5 py-3.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <p className="text-sm font-semibold text-white">
              <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-wa-green text-[11px] font-black text-ink-900">
                {selectedCount}
              </span>
              {selectedCount === 1 ? 'job selected' : 'jobs selected'}
            </p>
            <button
              onClick={() => onDispatch(selectedResults)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-wa-teal to-wa-green px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-wa-green/25 transition hover:brightness-110"
            >
              <Send className="h-4 w-4" />
              Send {selectedCount} Selected Jobs to WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
