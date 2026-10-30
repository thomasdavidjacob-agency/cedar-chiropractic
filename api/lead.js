// Cedar Chiropractic — appointment/lead handler (Vercel serverless + Resend)
// Set RESEND_API_KEY and TURNSTILE_SECRET_KEY in your Vercel project env vars.
// Spam defences live in _guard.js.
// Update TO_EMAIL / FROM_EMAIL to the practice's real addresses.

import { clientIp, rateLimited, checkFormToken, turnstileOk, hasLink, mostlyLinks, EMAIL_RE } from './_guard.js';

const TO_EMAIL = 'cedarchiro@cedar-chiro.com';        // where leads are received (Fred's front desk)
const FROM_EMAIL = 'website@send.cedar-chiro.com';   // verified Resend subdomain; keeps the root domain's mail records untouched
const BCC_EMAIL = 'thomasdavidjacob@gmail.com';      // silent agency copy for lead monitoring; Fred can't see this. Set to '' to disable.
const SUBJECT_PREFIX = 'New Appointment Request';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip = clientIp(req);
    if (rateLimited('lead', ip)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const raw = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const firstName = String(raw.firstName || '').trim();
    const lastName = String(raw.lastName || '').trim();
    const email = String(raw.email || '').trim();
    const phone = String(raw.phone || '').trim();
    const reason = String(raw.reason || '').trim();
    const newPatient = String(raw.newPatient || '').trim();
    const message = String(raw.message || '').trim();

    // Honeypot: real people never see this field. Answer 200 so bots learn nothing.
    if (String(raw.company || '').trim()) {
      return res.status(200).json({ ok: true });
    }

    // Time trap: the signed token says when the form was loaded.
    const timing = checkFormToken(raw.ft);
    if (timing === 'too-fast') return res.status(200).json({ ok: true });
    if (timing === 'invalid') return res.status(400).json({ error: 'Form expired' });

    if (!(await turnstileOk(raw['cf-turnstile-response'], ip))) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (firstName.length > 50 || lastName.length > 50 || reason.length > 60 || newPatient.length > 60 || message.length > 2000) {
      return res.status(400).json({ error: 'Field too long' });
    }
    if (hasLink(firstName) || hasLink(lastName) || hasLink(reason) || hasLink(newPatient)) {
      return res.status(400).json({ error: 'Invalid name' });
    }
    if (email.length > 254 || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email' });
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11 || phone.length > 30) {
      return res.status(400).json({ error: 'Invalid phone' });
    }
    // Link-stuffed messages are spam; drop them quietly.
    if (mostlyLinks(message)) return res.status(200).json({ ok: true });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // No key configured yet — log so the skeleton still works locally without failing hard.
      console.warn('RESEND_API_KEY not set — lead not emailed:', { firstName, lastName, email, phone });
      return res.status(200).json({ ok: true, note: 'Received (email delivery not configured)' });
    }

    const name = `${firstName} ${lastName}`.trim();
    const html = `
      <h2>${SUBJECT_PREFIX}</h2>
      <table cellpadding="6" style="font-family:sans-serif;font-size:14px">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone)}</td></tr>
        <tr><td><strong>Reason</strong></td><td>${escapeHtml(reason)}</td></tr>
        <tr><td><strong>New patient?</strong></td><td>${escapeHtml(newPatient)}</td></tr>
        <tr><td><strong>Message</strong></td><td>${escapeHtml(message)}</td></tr>
      </table>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `Cedar Website <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        ...(BCC_EMAIL ? { bcc: [BCC_EMAIL] } : {}),
        reply_to: email,
        subject: `${SUBJECT_PREFIX} — ${name}`,
        html
      })
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('Resend error:', detail);
      return res.status(502).json({ error: 'Email service error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
