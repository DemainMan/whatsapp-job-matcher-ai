import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Send, MessageCircle, ExternalLink, CheckCircle2, Sparkles, PenLine, Bot,
} from 'lucide-react';

function formatSalary(job) {
  if (job.currency === 'ZAR') {
    return `R${(job.salaryMin / 1000).toLocaleString()}k – R${(job.salaryMax / 1000).toLocaleString()}k/yr`;
  }
  return `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}/yr`;
}

function buildDefaultMessage(candidate, selectedJobs) {
  const lines = [];
  lines.push(`Hi! 🤖 *JobMatchr AI* has prepared your job matches.`);
  lines.push('');
  lines.push(`*Candidate:* ${candidate.name}`);
  lines.push(`📍 ${candidate.location} · ${candidate.workSetup} · ${candidate.yearsOfExperience || 0} yrs experience`);
  const focus = candidate.role || candidate.jobType || null;
  lines.push(focus ? `🎯 Looking for: ${focus}` : `🎯 Skills: ${candidate.skills.slice(0, 6).join(', ') || '—'}`);
  if (candidate.salaryFloorUsd) {
    lines.push(`💵 Salary floor: $${candidate.salaryFloorUsd.toLocaleString()}`);
  }
  lines.push('');
  lines.push(`*Top Matches (${selectedJobs.length}):*`);
  selectedJobs.forEach(({ score, statusBadge, job }, i) => {
    lines.push('');
    lines.push(`${i + 1}. ${job.title}`);
    lines.push(`   🏢 ${job.company} · ${job.location} (${job.workSetup})`);
    lines.push(`   💰 ${formatSalary(job)}`);
    lines.push(`   ✅ Match score: ${score}% (${statusBadge})`);
    lines.push(`   🔗 ${job.url}`);
  });
  lines.push('');
  lines.push('_Reply "APPLY" to have JobMatchr AI submit your application._');
  return lines.join('\n');
}

export default function WhatsAppDispatch({
  candidate,
  selectedJobs,
  onSendToSimulator,
  onOpenDeepLink,
  goToIntake,
}) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const defaultMessage = useMemo(
    () => (candidate && selectedJobs.length ? buildDefaultMessage(candidate, selectedJobs) : ''),
    [candidate, selectedJobs],
  );

  useEffect(() => {
    setMessage(defaultMessage);
    setSent(false);
  }, [defaultMessage]);

  if (!candidate || selectedJobs.length === 0) {
    return (
      <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-white/20" />
        <h2 className="mt-4 text-lg font-bold text-white">Nothing to dispatch yet</h2>
        <p className="mt-1 text-sm text-white/50">
          Select one or more matched jobs in the Job API &amp; Matcher tab to build your WhatsApp message.
        </p>
        <button
          onClick={goToIntake}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-wa-teal to-wa-green px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          <Bot className="h-4 w-4" />
          Start from WhatsApp Intake
        </button>
      </div>
    );
  }

  const handleSimulator = () => {
    onSendToSimulator(message);
    setSent(true);
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00a884', '#25d366', '#075e54', '#ffffff'],
    });
  };

  const handleDeepLink = () => onOpenDeepLink(message);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-wa-teal to-wa-green">
            <Send className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Dispatch Preview</h2>
            <p className="text-[11px] text-white/50">
              Markdown message to {candidate.phone || 'candidate'} · {selectedJobs.length} jobs attached
            </p>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-4">
          <div className="max-w-[95%] rounded-lg rounded-bl-sm bg-wa-bubble-in px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap text-[#e9edef]">
            {message || '…'}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/70">
            <PenLine className="h-3.5 w-3.5 text-wa-teal" />
            Edit message before sending
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSent(false);
            }}
            className="min-h-[180px] w-full resize-y rounded-xl border border-white/10 bg-ink-800 p-4 text-sm leading-relaxed text-white outline-none transition focus:border-wa-teal/60"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4 text-wa-teal" />
            Candidate Summary
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/50">Name</span>
              <span className="font-semibold text-white">{candidate.name}</span>
            </p>
            <p className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/50">Phone</span>
              <span className="font-semibold text-white">{candidate.phone || '—'}</span>
            </p>
            <p className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/50">Experience</span>
              <span className="font-semibold text-white">{candidate.yearsOfExperience} yrs · {candidate.seniority}</span>
            </p>
            <p className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/50">Location</span>
              <span className="font-semibold text-white">{candidate.location} · {candidate.workSetup}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-white/50">Salary floor</span>
              <span className="font-semibold text-wa-green-light">${(candidate.salaryFloorUsd || 0).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="glass flex-1 rounded-2xl p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Delivery Options</h3>
          <div className="grid gap-3">
            <button
              onClick={handleSimulator}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-wa-teal to-wa-green px-5 py-4 text-sm font-bold text-white shadow-lg shadow-wa-green/25 transition hover:brightness-110"
            >
              <MessageCircle className="h-4 w-4" />
              Send to WhatsApp Bot Simulator
            </button>
            <button
              onClick={handleDeepLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-wa-teal/50 bg-wa-teal/10 px-5 py-4 text-sm font-bold text-wa-teal transition hover:bg-wa-teal/20"
            >
              <ExternalLink className="h-4 w-4" />
              Open in WhatsApp (wa.me Deep-Link)
            </button>
          </div>

          {sent && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-wa-green/40 bg-wa-green/10 p-3 text-sm font-semibold text-wa-green-light">
              <CheckCircle2 className="h-4 w-4" />
              Message delivered to the simulator in the WhatsApp Intake tab!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
