// Cedar Chiropractic — live front-desk texting bridge
//
// A visitor sends a message from the site widget; this route pushes it straight
// to the front desk as an SMS so Bobbie sees it arrive in real time and can text
// the patient back from the office line. A copy is emailed to the practice inbox
// as a written record of the conversation starter.
//
// Vercel env vars (Project → Settings → Environment Variables):
//   TWILIO_ACCOUNT_SID   Twilio account SID (starts "AC…")
//   TWILIO_AUTH_TOKEN    Twilio auth token
//   TWILIO_FROM_NUMBER   the practice's Twilio number, E.164 — e.g. +15035550123
//   STAFF_SMS            who gets notified, comma-separated E.164 — e.g. +15035551234,+15035555678
//   RESEND_API_KEY       (already set for /api/lead) — used for the email copy
//
// Until the Twilio vars exist the route still succeeds and delivers by email
// only, so the widget works from the moment it deploys.

const TO_EMAIL = 'cedarchiro@cedar-chiro.com';
const FROM_EMAIL = 'website@cedar-chiro.com';
const BCC_EMAIL = 'thomasdavidjacob@gmail.com';   // silent agency copy; set to '' to disable

const MAX_NAME = 80;
const MAX_MESSAGE = 900;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name = '', phone = '', message = '', company = '', page = '' } = body;

    // Honeypot — bots fill hidden fields. Answer 200 so they don't learn anything.
    if (String(company).trim()) {
      return res.status(200).json({ ok: true });
    }

    const cleanName = String(name).trim().slice(0, MAX_NAME);
    const cleanMessage = String(message).trim().slice(0, MAX_MESSAGE);
    const visitorNumber = toE164(phone);

    if (!cleanName || !cleanMessage) {
      return res.status(400).json({ error: 'Missing name or message' });
    }
    if (!visitorNumber) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const smsResult = await notifyFrontDesk({ cleanName, cleanMessage, visitorNumber });
    const emailResult = await emailCopy({ cleanName, cleanMessage, visitorNumber, page });

    if (smsResult.error && emailResult.error) {
      console.error('Text bridge: both channels failed', smsResult.error, emailResult.error);
      return res.status(502).json({ error: 'Delivery failed' });
    }

    return res.status(200).json({
      ok: true,
      delivered: { sms: smsResult.sent, email: emailResult.sent }
    });
  } catch (err) {
    console.error('Text handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

/* ---------- Front-desk SMS (Twilio) ---------- */

async function notifyFrontDesk({ cleanName, cleanMessage, visitorNumber }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const staff = (process.env.STAFF_SMS || '')
    .split(',')
    .map(n => toE164(n))
    .filter(Boolean);

  if (!sid || !token || !from || !staff.length) {
    console.warn('Text bridge: Twilio not configured — front desk not paged by SMS');
    return { sent: false, error: null };
  }

  // Bobbie replies by texting the patient directly, so the patient's number
  // leads the message and is easy to tap on a phone.
  const smsBody =
    `Website text from ${cleanName} — ${formatUs(visitorNumber)}\n\n` +
    `"${cleanMessage}"\n\n` +
    `Reply by texting ${formatUs(visitorNumber)} back.`;

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;

  const sends = await Promise.allSettled(staff.map(to => {
    const form = new URLSearchParams({ To: to, From: from, Body: smsBody });
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form.toString()
    }).then(async r => {
      if (!r.ok) throw new Error(`Twilio ${r.status}: ${await r.text()}`);
      return true;
    });
  }));

  const ok = sends.filter(s => s.status === 'fulfilled').length;
  sends.filter(s => s.status === 'rejected')
    .forEach(s => console.error('Twilio send failed:', s.reason && s.reason.message));

  return ok > 0
    ? { sent: true, error: null }
    : { sent: false, error: 'all Twilio sends failed' };
}

/* ---------- Email copy (Resend) ---------- */

async function emailCopy({ cleanName, cleanMessage, visitorNumber, page }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('Text bridge: RESEND_API_KEY not set — no email copy', {
      cleanName, visitorNumber, cleanMessage
    });
    return { sent: false, error: null };
  }

  const html = `
    <h2>New text from the website</h2>
    <table cellpadding="6" style="font-family:sans-serif;font-size:14px">
      <tr><td><strong>Name</strong></td><td>${escapeHtml(cleanName)}</td></tr>
      <tr><td><strong>Mobile</strong></td><td>
        <a href="sms:${escapeHtml(visitorNumber)}">${escapeHtml(formatUs(visitorNumber))}</a></td></tr>
      <tr><td><strong>Message</strong></td><td>${escapeHtml(cleanMessage)}</td></tr>
      <tr><td><strong>Sent from</strong></td><td>${escapeHtml(page || '/')}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:13px;color:#555">
      Reply by texting ${escapeHtml(formatUs(visitorNumber))} from the office line.</p>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `Cedar Website <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        ...(BCC_EMAIL ? { bcc: [BCC_EMAIL] } : {}),
        subject: `Website text — ${cleanName} (${formatUs(visitorNumber)})`,
        html
      })
    });
    if (!resp.ok) throw new Error(`Resend ${resp.status}: ${await resp.text()}`);
    return { sent: true, error: null };
  } catch (err) {
    console.error('Text bridge email failed:', err.message);
    return { sent: false, error: err.message };
  }
}

/* ---------- helpers ---------- */

// Accepts "(503) 653-2232", "503-653-2232", "+15036532232" → "+15036532232".
function toE164(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

function formatUs(e164) {
  const d = String(e164 || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(e164 || '');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
