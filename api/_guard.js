// Shared spam defences for /api/lead and /api/text. The leading underscore keeps
// Vercel from deploying this file as its own route.
//
// Layers, in the order the routes apply them:
//   1. per-IP rate limit
//   2. honeypot field (fake 200 on a hit)
//   3. signed form token = time trap (fake 200 if sent < MIN_FILL_MS after load)
//   4. Cloudflare Turnstile, verified server-side
//   5. field validation (lengths, formats, links)

import crypto from 'node:crypto';

const MIN_FILL_MS = 3000;                 // humans don't fill a form in under 3s
const MAX_TOKEN_AGE_MS = 2 * 60 * 60e3;   // a token older than 2h is stale
const RATE_WINDOW_MS = 10 * 60e3;
const RATE_MAX = 5;                       // submissions per IP per route per window

// HMAC key for form tokens. A dedicated FORM_SIGNING_SECRET is preferred; the
// fallbacks are existing server-only secrets, so the time trap works without
// another env var. They're only used as a key, never sent anywhere.
function signingKey() {
  return process.env.FORM_SIGNING_SECRET || process.env.RESEND_API_KEY || process.env.TURNSTILE_SECRET_KEY || '';
}

export function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '');
  return (fwd.split(',')[0] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '').trim();
}

/* ---------- 1. rate limit ----------
   In-memory, so it's per warm function instance rather than global. Good enough to
   stop one client hammering the route; Turnstile does the heavy lifting. */
const hits = new Map();
export function rateLimited(route, ip) {
  const now = Date.now();
  const key = `${route}|${ip}`;
  const recent = (hits.get(key) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();     // keep a long-lived instance from growing forever
  return recent.length > RATE_MAX;
}

/* ---------- 3. signed timestamp ---------- */
export function issueFormToken() {
  const ts = String(Date.now());
  return `${ts}.${hmac(ts)}`;
}

// 'ok' | 'too-fast' | 'invalid'
export function checkFormToken(token) {
  const key = signingKey();
  if (!key) return 'ok';                   // nothing to verify against; other layers still apply
  const [ts, sig] = String(token || '').split('.');
  if (!ts || !sig || !/^\d+$/.test(ts)) return 'invalid';
  const expected = hmac(ts);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return 'invalid';
  const age = Date.now() - Number(ts);
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > MAX_TOKEN_AGE_MS) return 'invalid';
  return 'ok';
}

function hmac(value) {
  return crypto.createHmac('sha256', signingKey()).update(value).digest('base64url');
}

/* ---------- 4. Turnstile ---------- */
export async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY not set; Turnstile check skipped');
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: String(token) });
    if (ip) body.set('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = await r.json();
    if (!data.success) console.warn('Turnstile rejected:', data['error-codes']);
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verify failed:', err.message);
    return false;
  }
}

/* ---------- 5. validation helpers ---------- */
const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|cn|xyz|top|info|biz|io)\b)/gi;

export function hasLink(s) {
  return new RegExp(LINK_RE.source, 'i').test(String(s || ''));
}

// More than two links, or links with almost no words around them.
export function mostlyLinks(s) {
  const text = String(s || '');
  const links = text.match(LINK_RE) || [];
  if (links.length === 0) return false;
  if (links.length > 2) return true;
  const words = text.replace(/\S*(https?:\/\/|www\.)\S*/gi, ' ').replace(/\s+/g, ' ').trim();
  return words.length < 20;
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
