import { useState } from 'react';
import {
  UserRound, Phone, MapPin, Briefcase, CheckCircle2, XCircle,
  Plus, GraduationCap, Banknote, Search, Globe2,
} from 'lucide-react';
import { toE164 } from '../utils/whatsappParser.js';

export default function CandidateMatrix({ candidate, onUpdateCandidate, onSearchJobs }) {
  const [newSkill, setNewSkill] = useState('');
  const [profileText, setProfileText] = useState(candidate?.profileText || '');
  const [phone, setPhone] = useState(candidate?.phone || '');

  if (!candidate) {
    return (
      <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
        <UserRound className="mx-auto h-12 w-12 text-white/20" />
        <h2 className="mt-4 text-lg font-bold text-white">No candidate loaded yet</h2>
        <p className="mt-1 text-sm text-white/50">
          Head to the WhatsApp Intake tab to extract or select a candidate profile first.
        </p>
      </div>
    );
  }

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (!candidate.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      onUpdateCandidate({ ...candidate, skills: [...candidate.skills, skill] });
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    onUpdateCandidate({
      ...candidate,
      skills: candidate.skills.filter((s) => s !== skill),
    });
  };

  const updateYears = (value) =>
    onUpdateCandidate({ ...candidate, yearsOfExperience: Number(value) });

  const updateSalary = (value) =>
    onUpdateCandidate({ ...candidate, salaryFloorUsd: Number(value) });

  const updateProfileText = (value) => {
    setProfileText(value);
    onUpdateCandidate({ ...candidate, profileText: value });
  };

  const updatePhone = (value) => {
    setPhone(value);
    onUpdateCandidate({ ...candidate, phone: value, phoneE164: toE164(value) });
  };

  const Field = ({ label, value, icon: Icon }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
        <Icon className="h-3.5 w-3.5 text-wa-teal" /> {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-wa-teal to-wa-green text-lg font-black text-white shadow-lg shadow-wa-green/25">
              {candidate.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <p className="text-xs font-medium text-white/50">
                {candidate.seniority} level · {candidate.yearsOfExperience} years experience
              </p>
            </div>
          </div>
          <button
            onClick={onSearchJobs}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-wa-teal to-wa-green px-5 py-3 text-sm font-bold text-white shadow-lg shadow-wa-green/25 transition hover:brightness-110"
          >
            <Search className="h-4 w-4" />
            Search Qualified Jobs
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
              <Phone className="h-3.5 w-3.5 text-wa-teal" /> Phone
            </p>
            <input
              value={phone}
              onChange={(e) => updatePhone(e.target.value)}
              placeholder="+27 …"
              className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none placeholder-white/30"
            />
          </div>
          <Field label="Location" value={candidate.location || '—'} icon={MapPin} />
          <Field label="Work Setup" value={candidate.workSetup || '—'} icon={Briefcase} />
          <Field label="Visa Status" value={candidate.visaRequired ? 'Visa Required' : 'No Visa Needed'} icon={CheckCircle2} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="glass rounded-2xl p-5 lg:col-span-3">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <GraduationCap className="h-4 w-4 text-wa-teal" />
            Technical Skills Matrix
          </h3>

          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="group inline-flex items-center gap-1.5 rounded-full border border-wa-teal/30 bg-wa-teal/10 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-wa-green-light"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="rounded-full p-0.5 text-white/40 transition hover:bg-wa-green hover:text-ink-900"
                  aria-label={`Remove ${skill}`}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </span>
            ))}
            {candidate.skills.length === 0 && (
              <p className="text-xs text-white/40">No skills detected yet. Add skills below.</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addSkill();
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g. Kafka, NestJS, Figma)…"
              className="flex-1 rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl border border-wa-teal/40 px-4 py-2.5 text-sm font-semibold text-wa-teal transition hover:bg-wa-teal/10"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </form>

          <div className="mt-5">
            <label className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-wa-teal" />
                Years of Experience
              </span>
              <span className="rounded-lg bg-wa-green/15 px-2.5 py-1 text-sm font-bold text-wa-green-light">
                {candidate.yearsOfExperience} yrs
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={candidate.yearsOfExperience}
              onChange={(e) => updateYears(e.target.value)}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-white/30">
              <span>0</span>
              <span>15 yrs</span>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
              <span className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-wa-teal" />
                Minimum Salary Floor
              </span>
              <span className="rounded-lg bg-wa-green/15 px-2.5 py-1 text-sm font-bold text-wa-green-light">
                ${candidate.salaryFloorUsd?.toLocaleString() || 0}
              </span>
            </label>
            <input
              type="range"
              min="30000"
              max="150000"
              step="5000"
              value={candidate.salaryFloorUsd || 30000}
              onChange={(e) => updateSalary(e.target.value)}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-white/30">
              <span>$30k</span>
              <span>$150k</span>
            </div>
          </div>
        </section>

        <section className="glass flex flex-col rounded-2xl p-5 lg:col-span-2">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <Globe2 className="h-4 w-4 text-wa-teal" />
            Profile Summary (auto-generated)
          </h3>
          <textarea
            value={profileText}
            onChange={(e) => updateProfileText(e.target.value)}
            placeholder="This summary is used in the WhatsApp dispatch message. Edit it freely."
            className="min-h-[200px] flex-1 resize-none rounded-xl border border-white/10 bg-ink-800 p-4 text-sm leading-relaxed text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
          />
          <div className="mt-3 rounded-xl border border-wa-teal/20 bg-wa-teal/5 p-3 text-xs leading-relaxed text-white/60">
            <p className="font-semibold text-wa-green-light">Match intelligence</p>
            <p className="mt-1">
              {candidate.skills.length} skills tracked · {candidate.yearsOfExperience} yrs experience ·
              ${candidate.salaryFloorUsd?.toLocaleString() || 0} salary floor ·{' '}
              {candidate.workSetup || 'Any'} preferred
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
