import { Sparkles, MessageCircle, Grid3X3, Briefcase, Send, Settings2, Crown } from 'lucide-react';

const TABS = [
  { id: 'intake', label: '1. WhatsApp Intake', icon: MessageCircle },
  { id: 'matrix', label: '2. Qualification Matrix', icon: Grid3X3 },
  { id: 'jobs', label: '3. Job API & Matcher', icon: Briefcase },
  { id: 'dispatch', label: '4. WhatsApp Dispatch', icon: Send },
];

export default function Navbar({ activeTab, onTabChange, selectedJobCount, isLiveApi, onOpenSettings, isPro, onUpgrade }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-wa-teal to-wa-green shadow-lg shadow-wa-green/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-white">
                JobMatchr <span className="text-wa-teal">AI</span>
              </h1>
              <p className="text-[11px] font-medium leading-tight text-white/50">
                WhatsApp-Driven Job Matching Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-300">
                <Crown className="h-3.5 w-3.5" />
                Pro
              </span>
            ) : (
              <button
                onClick={onUpgrade}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-3 py-2 text-xs font-bold text-ink-900 shadow-lg shadow-amber-400/20 transition hover:brightness-110"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden md:inline">Upgrade to Pro</span>
                <span className="md:hidden">Pro</span>
              </button>
            )}
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold sm:inline-flex ${
                isLiveApi
                  ? 'border-wa-green/40 bg-wa-green/10 text-wa-green-light'
                  : 'border-white/10 bg-white/5 text-white/60'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isLiveApi ? 'animate-pulse bg-wa-green-light' : 'bg-white/30'}`}
              />
              {isLiveApi ? 'Live API Mode' : 'Hybrid Database Mode'}
            </span>
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-wa-teal/40 hover:text-white"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden md:inline">Settings &amp; APIs</span>
              <span className="md:hidden">Settings</span>
            </button>
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition sm:text-[13px] ${
                activeTab === id
                  ? 'bg-gradient-to-r from-wa-teal to-wa-green text-white shadow-lg shadow-wa-green/25'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === 'jobs' && selectedJobCount > 0 && (
                <span className="rounded-full bg-wa-green-light px-1.5 py-0.5 text-[10px] font-bold text-ink-900">
                  {selectedJobCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
