export const DEFAULT_CHECKOUT_URL = 'https://YOUR-STORE.lemonsqueezy.com/buy/YOUR-PRODUCT';

const PRO_KEY = 'jobmatchr_pro';
const CHECKOUT_URL_KEY = 'jobmatchr_checkout_url';
const API_KEYS_KEY = 'jobmatchr_api_keys';

export function isValidCheckoutUrl(url) {
  try {
    const parsed = new URL(String(url || '').trim());
    if (parsed.protocol !== 'https:') return false;
    if (parsed.username || parsed.password) return false;
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function getCheckoutUrl() {
  return localStorage.getItem(CHECKOUT_URL_KEY) || DEFAULT_CHECKOUT_URL;
}

export function setCheckoutUrl(url) {
  const trimmed = String(url || '').trim();
  if (!isValidCheckoutUrl(trimmed)) return false;
  localStorage.setItem(CHECKOUT_URL_KEY, trimmed);
  return true;
}

export function isPro() {
  return localStorage.getItem(PRO_KEY) === 'true';
}

export function setPro(value) {
  localStorage.setItem(PRO_KEY, String(Boolean(value)));
}

export function openCheckout() {
  const url = getCheckoutUrl();
  if (!isValidCheckoutUrl(url) || url === DEFAULT_CHECKOUT_URL) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function getLiveToken() {
  try {
    const parsed = JSON.parse(localStorage.getItem(API_KEYS_KEY) || '{}');
    return typeof parsed.live_pro_token === 'string' ? parsed.live_pro_token.trim() : '';
  } catch {
    return '';
  }
}
