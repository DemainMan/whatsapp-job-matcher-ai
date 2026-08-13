import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import WhatsAppIntake from './components/WhatsAppIntake.jsx';
import CandidateMatrix from './components/CandidateMatrix.jsx';
import JobSearchEngine from './components/JobSearchEngine.jsx';
import WhatsAppDispatch from './components/WhatsAppDispatch.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import SAMPLE_CANDIDATES from './data/sampleCandidates.js';
import { toE164 } from './utils/whatsappParser.js';

let chatId = 0;

function createBotMessages(candidate) {
  const messages = [
    {
      id: ++chatId,
      from: 'bot',
      text: `Hi ${candidate.name}! 👋 I'm JobMatchr AI. I can match your profile to the best remote & SA jobs.\n\nTell me about your stack, experience and salary expectations.`,
      timestamp: Date.now(),
    },
  ];
  if (candidate.rawMessage) {
    messages.push({
      id: ++chatId,
      from: 'user',
      text: candidate.rawMessage,
      timestamp: Date.now(),
    });
    messages.push({
      id: ++chatId,
      from: 'bot',
      text: `Got it, ${candidate.name.split(' ')[0]}! ✅\n\nExtracted: ${candidate.yearsOfExperience} yrs experience, ${candidate.skills.length} skills (${candidate.skills.slice(0, 4).join(', ')}…), ${candidate.location}, ${candidate.workSetup}.\n\nLet's find you the best matches!`,
      timestamp: Date.now(),
    });
  }
  return messages;
}

function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [candidate, setCandidate] = useState(null);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [dispatchJobs, setDispatchJobs] = useState([]);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const loadCandidate = useCallback(
    (candidateData) => {
      setCandidate(candidateData);
      setChatMessages(createBotMessages(candidateData));
      setSelectedJobIds([]);
    },
    [],
  );

  const handleExtract = (parsed) => {
    const phoneE164 = toE164(parsed.phone);
    const focus = parsed.role || parsed.jobType || 'a job';
    const merged = {
      ...SAMPLE_CANDIDATES[0],
      ...parsed,
      phoneE164,
      profileText: `I am ${parsed.name}. I have ${parsed.yearsOfExperience || 0} years of experience. Looking for ${focus} work based in ${parsed.location} (${parsed.workSetup}). ${parsed.skills.length ? `Relevant skills: ${parsed.skills.join(', ')}.` : ''}`,
    };
    loadCandidate(merged);
    showToast(`Profile extracted for ${merged.name}`);
  };

  const handleSendChat = (text) => {
    setChatMessages((prev) => [
      ...prev,
      { id: ++chatId, from: 'user', text, timestamp: Date.now() },
    ]);
  };

  const handleDispatch = (selectedResults) => {
    setDispatchJobs(selectedResults);
    setActiveTab('dispatch');
  };

  const handleToggleSelectJob = (jobId) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId],
    );
  };

  const handleSendToSimulator = (message) => {
    setChatMessages((prev) => [
      ...prev,
      { id: ++chatId, from: 'bot', text: message, timestamp: Date.now() },
    ]);
    showToast('Message delivered to the WhatsApp simulator');
  };

  const handleOpenDeepLink = (message) => {
    const raw = candidate.phoneE164 || candidate.phone || '';
    const phone = (raw.startsWith('+') ? raw : toE164(raw)).replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-ink-900 text-white">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgba(0,168,132,0.12), transparent 40%), radial-gradient(circle at 80% 100%, rgba(7,94,84,0.15), transparent 45%)',
        }}
      />
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedJobCount={selectedJobIds.length}
        isLiveApi={isLiveApi}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'intake' && (
          <WhatsAppIntake
            candidate={candidate}
            onExtract={handleExtract}
            chatMessages={chatMessages}
            onSendChat={handleSendChat}
            goToMatrix={() => setActiveTab('matrix')}
          />
        )}
        {activeTab === 'matrix' && (
          <CandidateMatrix
            candidate={candidate}
            onUpdateCandidate={setCandidate}
            onSearchJobs={() => setActiveTab('jobs')}
          />
        )}
        {activeTab === 'jobs' && (
          <JobSearchEngine
            candidate={candidate}
            isLiveApi={isLiveApi}
            onToggleLiveApi={() => setIsLiveApi((v) => !v)}
            selectedJobIds={selectedJobIds}
            onToggleSelectJob={handleToggleSelectJob}
            onDispatch={handleDispatch}
          />
        )}
        {activeTab === 'dispatch' && (
          <WhatsAppDispatch
            candidate={candidate}
            selectedJobs={dispatchJobs}
            onSendToSimulator={handleSendToSimulator}
            onOpenDeepLink={handleOpenDeepLink}
            goToIntake={() => setActiveTab('intake')}
          />
        )}
      </main>

      <footer className="relative border-t border-white/5 py-6 text-center text-xs text-white/30">
        JobMatchr AI · WhatsApp-driven job matching · Built with React, Vite &amp; Tailwind CSS
      </footer>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onToast={showToast}
      />

      {toast && (
        <div className="fixed right-4 bottom-4 z-50 flex max-w-sm items-center gap-2 rounded-xl border border-wa-green/40 bg-ink-800 px-4 py-3 shadow-2xl backdrop-blur-xl">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-wa-green-light" />
          ) : (
            <X className="h-5 w-5 shrink-0 text-amber-400" />
          )}
          <p className="text-sm font-medium text-white">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
