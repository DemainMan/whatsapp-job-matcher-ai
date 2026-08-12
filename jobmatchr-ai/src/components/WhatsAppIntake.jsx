import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Bot, Phone, UserRound, Paperclip } from 'lucide-react';
import SAMPLE_CANDIDATES from '../data/sampleCandidates.js';
import { parseWhatsAppMessage } from '../utils/whatsappParser.js';

export default function WhatsAppIntake({ candidate, onExtract, chatMessages, onSendChat, goToMatrix }) {
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const chatRef = useRef(null);

  const activeName = candidate?.name || 'Candidate';

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const handleExtract = () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const parsed = parseWhatsAppMessage(rawText);
      onExtract({ ...parsed, rawMessage: rawText }, rawText);
      setParsing(false);
      goToMatrix();
    }, 700);
  };

  const quickSelect = (sample) => {
    setRawText(sample.rawMessage);
  };

  const submitQuickSelect = (sample) => {
    onExtract({ ...sample }, sample.rawMessage);
    goToMatrix();
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const input = e.currentTarget.elements.chatInput;
    if (input.value.trim()) {
      onSendChat(input.value.trim());
      input.value = '';
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="glass flex flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 bg-ink-800 px-4 py-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-wa-teal to-wa-green">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-ink-800 bg-wa-green-light" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">JobMatchr WA Bot</p>
            <p className="text-[11px] text-wa-green-light">online · recruiting for {activeName}</p>
          </div>
        </div>

        <div
          ref={chatRef}
          className="flex h-[460px] flex-1 flex-col gap-2 overflow-y-auto bg-ink-900 p-4"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          {chatMessages.length === 0 && (
            <div className="m-auto text-center text-xs text-white/40">
              No conversation yet.
              <br />
              Select a sample candidate or send a raw WhatsApp message on the right.
            </div>
          )}
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-[13px] leading-relaxed shadow-md ${
                msg.from === 'bot'
                  ? 'self-start rounded-bl-sm bg-wa-bubble-in text-[#e9edef]'
                  : 'self-end rounded-br-sm bg-wa-bubble-out text-[#e9edef]'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className={`mt-1 text-right text-[10px] ${msg.from === 'bot' ? 'text-white/40' : 'text-white/30'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="flex items-center gap-2 border-t border-white/10 bg-ink-800 p-3">
          <button type="button" className="rounded-full p-2 text-white/40 transition hover:text-white/70">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            name="chatInput"
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-white/10 bg-ink-700 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
          />
          <button
            type="submit"
            className="rounded-full bg-wa-green p-2.5 text-white transition hover:bg-wa-green-light"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
            <UserRound className="h-4 w-4 text-wa-teal" />
            Quick-Select Sample Candidates
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {SAMPLE_CANDIDATES.map((c) => (
              <button
                key={c.id}
                onClick={() => quickSelect(c)}
                className={`rounded-xl border p-3 text-left transition ${
                  rawText === c.rawMessage
                    ? 'border-wa-teal/60 bg-wa-teal/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-wa-teal/30 hover:bg-white/[0.06]'
                }`}
              >
                <p className="text-sm font-bold text-white">{c.name}</p>
                <p className="mt-0.5 text-[11px] text-white/50">
                  {c.seniority} {c.skills[0]} · {c.yearsOfExperience} yrs · {c.location}
                </p>
                <p className="mt-1.5 inline-flex rounded-full bg-wa-green/15 px-2 py-0.5 text-[10px] font-semibold text-wa-green-light">
                  Load message
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass flex flex-1 flex-col rounded-2xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Phone className="h-4 w-4 text-wa-teal" />
              Raw WhatsApp Message / CV Text
            </h2>
            <button
              onClick={submitQuickSelect}
              disabled={!rawText.trim()}
              className="rounded-lg border border-wa-teal/40 px-2.5 py-1 text-[11px] font-semibold text-wa-teal transition hover:bg-wa-teal/10 disabled:opacity-40"
            >
              Load as {activeName}
            </button>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste any WhatsApp chat dump, voice-note transcript, or CV snippet here. The AI parser extracts name, phone, experience, skills, location, work setup and salary expectations…"
            className="min-h-[180px] flex-1 resize-none rounded-xl border border-white/10 bg-ink-800 p-4 text-sm leading-relaxed text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-white/40">
              {rawText.trim() ? `${rawText.trim().split(/\s+/).length} words ready for extraction` : 'Waiting for input…'}
            </p>
            <button
              onClick={handleExtract}
              disabled={!rawText.trim() || parsing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-wa-teal to-wa-green px-5 py-3 text-sm font-bold text-white shadow-lg shadow-wa-green/25 transition hover:brightness-110 disabled:opacity-40"
            >
              <Sparkles className={`h-4 w-4 ${parsing ? 'animate-pulse' : ''}`} />
              {parsing ? 'Extracting Profile…' : 'Extract Profile with AI'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
