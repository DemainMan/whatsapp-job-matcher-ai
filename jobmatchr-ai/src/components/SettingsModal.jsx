import { useState } from 'react';
import { X, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const API_KEY_FIELDS = [
  {
    id: 'jsearch',
    label: 'JSearch (RapidAPI) Key',
    placeholder: 'rjs_xxxxxxxxxxxxxxxx',
    hint: 'Live job search across 40+ boards via RapidAPI.',
  },
  {
    id: 'adzuna_app_id',
    label: 'Adzuna App ID',
    placeholder: 'Your Adzuna App ID',
    hint: 'Global job aggregation, strong UK/ZA coverage.',
  },
  {
    id: 'adzuna_app_key',
    label: 'Adzuna App Key',
    placeholder: 'Your Adzuna App Key',
    hint: 'Paired with the App ID above.',
  },
  {
    id: 'jooble',
    label: 'Jooble Key',
    placeholder: 'Your Jooble API key',
    hint: 'Aggregated job listings worldwide.',
  },
  {
    id: 'meta_wa_token',
    label: 'Meta WhatsApp Cloud API Token',
    placeholder: 'EAAJxxxxxxxx…',
    hint: 'Official WhatsApp Business Cloud API — sends real messages.',
  },
  {
    id: 'twilio_sid',
    label: 'Twilio Account SID',
    placeholder: 'ACxxxxxxxxxxxxxxxx',
    hint: 'Legacy WhatsApp Business API via Twilio.',
  },
  {
    id: 'ai_key',
    label: 'OpenAI / Claude API Key',
    placeholder: 'sk-xxxxxxxx…',
    hint: 'Used for enhanced AI profile extraction.',
  },
];

const STORAGE_KEY = 'jobmatchr_api_keys';

export default function SettingsModal({ open, onClose, onToast }) {
  const [values, setValues] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [showSecrets, setShowSecrets] = useState(false);

  if (!open) return null;

  const update = (id, value) => setValues((prev) => ({ ...prev, [id]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    onToast('API keys saved to this browser');
    onClose();
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setValues({});
    onToast('API keys cleared');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-ink-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-wa-teal/15">
              <KeyRound className="h-4.5 w-4.5 text-wa-teal" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Settings &amp; APIs</h2>
              <p className="text-[11px] text-white/50">Provider credentials stored locally in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSecrets((s) => !s)}
              className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
              aria-label="Toggle key visibility"
            >
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {API_KEY_FIELDS.map((field) => (
            <div key={field.id}>
              <label className="mb-1 block text-xs font-semibold text-white/70">{field.label}</label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={values[field.id] || ''}
                onChange={(e) => update(field.id, e.target.value)}
                placeholder={field.placeholder}
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
              />
              <p className="mt-0.5 text-[10px] text-white/40">{field.hint}</p>
            </div>
          ))}
          <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-[10px] leading-snug text-amber-300/80">
            Keys are stored only in this browser's localStorage and are never sent to the proxy.
            For production use, move keys to a server-side secrets store instead of the browser.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-ink-800 px-5 py-4">
          <button
            onClick={clear}
            className="text-xs font-semibold text-white/40 transition hover:text-amber-400"
          >
            Clear all keys
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-wa-teal to-wa-green px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-wa-green/25 transition hover:brightness-110"
            >
              <ShieldCheck className="h-4 w-4" />
              Save Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
