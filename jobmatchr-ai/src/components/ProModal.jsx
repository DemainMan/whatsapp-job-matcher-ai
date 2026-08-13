import { useState } from 'react';
import { Crown, X, Check, ExternalLink } from 'lucide-react';
import {
  getCheckoutUrl, setCheckoutUrl, openCheckout, DEFAULT_CHECKOUT_URL, isValidCheckoutUrl,
} from '../lib/billing.js';

const FEATURES = [
  'Unlimited job matches',
  'Live SA sources (PNet + MyCareers)',
  'Unlimited WhatsApp reports',
  'Save candidate profiles',
];

export default function ProModal({ open, onClose, onUnlock, onToast }) {
  const [checkoutUrl, setCheckoutUrlInput] = useState(() => getCheckoutUrl());

  if (!open) return null;

  const handleCheckoutBlur = () => {
    const trimmed = checkoutUrl.trim();
    if (!isValidCheckoutUrl(trimmed)) {
      setCheckoutUrlInput(getCheckoutUrl());
      onToast('Enter a valid https:// checkout link', 'error');
      return;
    }
    setCheckoutUrl(trimmed);
    onToast('Checkout link saved');
  };

  const handleBuy = () => {
    const saved = getCheckoutUrl();
    if (saved === DEFAULT_CHECKOUT_URL) {
      onToast('Set your Lemon Squeezy checkout link first', 'error');
      return;
    }
    if (!isValidCheckoutUrl(saved)) {
      onToast('Checkout link must be a valid https:// URL', 'error');
      return;
    }
    openCheckout();
  };

  const handleUnlock = () => {
    onUnlock();
    onToast('Pro unlocked — enjoy unlimited matches!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-ink-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500">
              <Crown className="h-4.5 w-4.5 text-ink-900" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Upgrade to Pro</h2>
              <p className="text-[11px] text-white/50">Unlock the full JobMatchr AI experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 p-2 text-white/60 transition hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-5">
          <ul className="space-y-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-white/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wa-green/15">
                  <Check className="h-3 w-3 text-wa-green-light" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-white/10 bg-ink-800 p-4">
            <label className="mb-1.5 block text-xs font-semibold text-white/70">Lemon Squeezy checkout link</label>
            <input
              type="url"
              value={checkoutUrl}
              onChange={(e) => setCheckoutUrlInput(e.target.value)}
              onBlur={handleCheckoutBlur}
              placeholder={DEFAULT_CHECKOUT_URL}
              autoComplete="off"
              className="w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-wa-teal/60"
            />
            <p className="mt-0.5 text-[10px] text-white/40">Paste your Lemon Squeezy buy link (must be https://) here — saved in this browser on blur.</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 bg-ink-800 px-5 py-4">
          <button
            onClick={handleBuy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3 text-sm font-bold text-ink-900 shadow-lg shadow-amber-400/25 transition hover:brightness-110"
          >
            <Crown className="h-4 w-4" />
            Buy Pro now
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </button>
          <button
            onClick={handleUnlock}
            className="w-full rounded-xl border border-wa-green/40 bg-wa-green/10 px-5 py-2.5 text-sm font-bold text-wa-green-light transition hover:bg-wa-green/20"
          >
            I've paid — unlock Pro
          </button>
        </div>
      </div>
    </div>
  );
}
