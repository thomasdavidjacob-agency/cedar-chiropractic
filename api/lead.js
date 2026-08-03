// Cedar Chiropractic — appointment/lead handler (Vercel serverless + Resend)
// Set RESEND_API_KEY in your Vercel project env vars before deploying.
// Update TO_EMAIL / FROM_EMAIL to the practice's real addresses.

const TO_EMAIL = 'cedarchiro@cedar-chiro.com';        // where leads are received
const FROM_EMAIL = 'website@cedar-chiro.com';        // must be a verified Resend domain sender (verify cedar-chiro.com in Resend)
const SUBJECT_PREFIX = 'New Appointment Request';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { firstName = '', lastName = '', email = '', phone = '', reason = '', newPatient = '', message = '' } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return res.status(400).json({ error: 'Invalid email' });

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
