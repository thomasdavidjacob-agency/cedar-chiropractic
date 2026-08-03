# Google Review Automation — Cedar Chiropractic & Auto Injury

Internal playbook (not published on the site). Goal: a steady stream of genuine
Google reviews by making it effortless and asking every patient.

## Compliance (read first)
- **Ask everyone** — no "review gating" (you may not screen so only happy patients
  get the Google link). Gating violates Google policy and can get the listing filtered.
- **No incentives** — no discounts, gifts, or entries for leaving a review.
- **Consent + opt-out** — only text patients who've consented (capture at intake);
  every SMS includes "Reply STOP to opt out."
- Route service problems to a phone call, not a filter — the templates below invite
  unhappy patients to call the office directly (that's allowed; it's not gating the
  Google link).

## The destination
- **Review page:** `/review.html` (branded thank-you + one-tap Google button + QR + call fallback).
- **QR code:** `images/review-qr.png` (navy, print-ready) — front-desk card / checkout counter.
- **Official Google review link — NEEDED FROM PHUONG:** in Google Business Profile →
  "Ask for reviews," copy the short link (looks like `https://g.page/r/XXXX/review`).
  Then: (1) update the button `href` in `review.html`, (2) regenerate `review-qr.png`
  to that link, (3) drop it into the templates below. (Interim link currently points
  at the Google listing's reviews; CID `16121069728669343550`.)

## Request templates

**SMS** (after a completed visit):
> Hi {FirstName}, thanks for visiting Cedar Chiropractic & Auto Injury! If Dr. Fred
> helped you feel better, a quick Google review means a lot: {ReviewLink}
> Reply STOP to opt out.

**Email** — subject: `How was your visit, {FirstName}?`
> Hi {FirstName},
>
> Thank you for trusting Cedar Chiropractic & Auto Injury with your care. If Dr. Fred
> and the team helped you feel better, would you take a minute to share your experience
> on Google? It helps others in Milwaukie find gentle, trusted care.
>
> ➜ Leave a Google review: {ReviewLink}
>
> If anything about your visit fell short, please call us at (503) 653-2232 — we read
> every note and want to make it right.
>
> Warmly,
> The Cedar Chiropractic & Auto Injury team

**Front desk / checkout (verbal + QR card):**
> "We'd love your feedback — scan this code to leave a quick Google review."

## Automation workflow
1. **Recommended engine — Jane native.** Once Fred is on Jane, use Jane's automated
   patient emails to send the review link ~2–24 hrs after a **completed** appointment
   (Jane triggers follow-up/"thank you" emails; SMS is an add-on). Keeps patient data
   inside Jane (HIPAA-friendly; Jane provides its own BAA) and needs no middleware.
   *(If Jane's automated email can't carry a custom review link on the cadence we want,
   fall back to a dedicated HIPAA-compliant review-request tool or the manual flow below.)*
2. **Cadence:** one request after the visit; optional single reminder 3–4 days later if
   no review. Never more than that.
3. **Interim (works today, pre-ChiroSpring):** front desk (Bobbie) hands the QR card at
   checkout and/or sends the SMS/email template manually. This starts generating reviews
   immediately while the auto-trigger is set up.

## Open items
- [ ] Official Google review short link from GBP (Phuong) → finalize link, QR, templates.
- [ ] Confirm the auto-send engine (Jane automated emails vs. a review tool) — gated on Jane setup.
- [ ] Confirm patient texting consent is captured at intake.
