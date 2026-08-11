# Blog Content Engine — Cedar Chiropractic & Auto Injury

**This file is the operating manual for the scheduled blog routine.** Each run: write and
publish ONE new post from the queue below, following every rule here. This file is internal
(kept out of the deployed site via `.vercelignore`).

## Your job, each run
1. `cd` into the repo. Run `date +%Y-%m-%d` to get today's date.
2. In the **Queue** below, find the first topic still marked `[ ]` (top-to-bottom).
3. Write ONE new blog post as a **root-level** HTML file named `<slug>.html`.
4. Add its card to the top of the grid in `blog.html` (newest first) and to the home
   blog preview in `index.html` if it's an auto-injury post (replace the oldest preview card).
5. Mark that topic `[x]` in the Queue and set its "published" date.
6. `git add -A && git commit` (clear message) `&& git push origin main`. The push
   auto-deploys via Vercel. Do NOT run the Vercel CLI.
7. If every topic is already `[x]`, make no changes — just note the queue is complete.

## Template — copy the structure of `chiropractic-care-after-car-accident.html` exactly
That published post is the canonical example. Match it: the `<head>` (title, meta
description, canonical `https://www.cedar-chiro.com/<slug>.html`, Open Graph, and a
`BlogPosting` JSON-LD with `headline`, `description`, `author` = "Dr. Fred Seater",
`datePublished` = today, `articleSection` = the cluster, `keywords`), the topbar, the nav
(mark Blog active), the `page-hero` with eyebrow + H1 + byline `By Dr. Fred Seater · <today, e.g. Aug 12, 2026> · N min read · <a href="blog.html">Back to blog</a>`, the `<article class="section">` body, and the standard footer. Keep the same CSS classes.

## Writing rules (this is what keeps it from looking like an AI blog)
- **Length:** 700–1000 words. Vary it post to post; don't make them all identical length/shape.
- **Voice:** warm, plain-spoken, practical — like a real Milwaukie chiropractor talking to a
  neighbor. Vary the opening (a question, a scenario, a myth, a stat-free observation). Avoid
  formulaic "In today's fast-paced world…" AI intros and repetitive phrasing across posts.
- **Structure:** an intro `<p class="lead">`, then 3–5 `<h2>` sections, occasional `<ul>`,
  and one `<div class="callout"><strong>Dr. Fred's tip:</strong> …</div>` where it fits.
- **Accuracy / YMYL:** educational only. Say "may help," "can support," "often." NEVER
  guarantee outcomes or cures. NEVER give individualized medical or legal advice — point
  readers to a consultation/exam. Don't invent statistics, credentials, or study citations.
- **NEVER mention AI, chatbots, or that this is automated.** Refer to the practice/team in
  human terms only.
- **Local SEO:** weave in 1–2 of these service-area cities **naturally, once or twice** — do
  NOT stuff or list them robotically: Milwaukie, Gladstone, Oregon City, Oak Grove, Portland.
  (Later we add West Linn, Lake Oswego.) Put the primary keyword in the title, H1, first
  paragraph, and meta description — naturally.
- **Internal links:** link to `services.html`, the relevant service, `contact.html`, the Jane
  booking (`https://cedarchiro.janeapp.com/`), and 1–2 related posts already published.
- **CTA:** end with a `cta-band`. For auto-injury posts: "Request an injury evaluation" →
  `contact.html` + phone. For other posts: "Book Online" → the Jane link + phone.
- **Images:** use one of the existing repo photos as the featured image, rotating so they
  don't repeat back-to-back: `images/treatment-room.jpg`, `images/waiting-room.jpg`,
  `images/entrance.jpg` (pick whichever best fits the topic). Alt text should describe the
  image + practice + Milwaukie.

## NAP / brand facts (use exactly)
- Cedar Chiropractic & Auto Injury (legal: Cedar Chiropractic Physicians, LLC)
- 4141 SE Harrison St, Milwaukie, OR 97222 · (503) 653-2232 · cedarchiro@cedar-chiro.com
- Dr. Fred Seater, DC. Booking: https://cedarchiro.janeapp.com/

## Queue (write in this order; one per run)
- [x] `chiropractic-care-after-car-accident` — Chiropractic Care After a Car Accident (Auto Injury) — *published 2026-08-03*
- [ ] `whiplash-after-a-car-accident` — Whiplash After a Car Accident: Symptoms, Timeline & Treatment (Auto Injury) — kw: whiplash treatment
- [ ] `chiropractor-after-minor-car-accident` — Do You Really Need a Chiropractor After a Minor Fender-Bender? (Auto Injury) — kw: chiropractor after minor car accident
- [ ] `auto-injury-pip-medpay-oregon` — How Auto-Injury Care Is Paid For in Oregon (PIP & MedPay) (Auto Injury) — kw: PIP chiropractor Oregon
- [ ] `auto-injury-documentation-claim` — Injured in a Crash? How Documentation Supports Your Claim (Auto Injury) — kw: personal injury chiropractor
- [ ] `cervical-disc-herniation` — Cervical Disc Herniation: Signs, Causes & Non-Surgical Options (Conditions) — kw: cervical disc herniation treatment
- [ ] `sciatica-low-back-pain` — Sciatica & Low-Back Pain: What's Actually Going On (Conditions) — kw: sciatica chiropractor
- [ ] `chiropractor-for-headaches` — The Neck–Headache Connection: Relief for Headaches & Migraines (Conditions) — kw: chiropractor for headaches
- [ ] `desk-job-neck-pain` — Desk-Job Neck Pain: Why It Happens and How to Fix It (Conditions) — kw: neck pain chiropractor
- [ ] `cervical-traction` — Cervical Traction for Neck Pain & Disc Herniation: How It Works (Therapies) — kw: cervical traction
- [ ] `lumbar-traction-spinal-decompression` — Lumbar Traction & Spinal Decompression for Low-Back Pain (Therapies) — kw: spinal decompression
- [ ] `therapeutic-ultrasound` — Therapeutic Ultrasound in Chiropractic Care: What to Expect (Therapies) — kw: therapeutic ultrasound
- [ ] `electrical-muscle-stimulation-estim` — Electrical Muscle Stimulation (E-Stim): How It Eases Pain (Therapies) — kw: e-stim therapy
- [ ] `rehab-exercises-lasting-relief` — Why Rehab Exercises Are the Key to Lasting Relief (Therapies) — kw: chiropractic rehab exercises
- [ ] `are-chiropractic-adjustments-safe` — Are Chiropractic Adjustments Safe? What to Expect on Visit One (Therapies) — kw: are chiropractic adjustments safe
- [ ] `when-to-see-a-chiropractor` — When Should You See a Chiropractor vs. Wait It Out? (Wellness) — kw: when to see a chiropractor
- [ ] `desk-posture-tips` — Posture at Your Desk: Small Fixes That Prevent Big Pain (Wellness) — kw: desk posture
- [ ] `first-chiropractic-exam` — What Happens at Your First Chiropractic Exam (Wellness) — kw: chiropractic exam

*(Already live and not in the queue: `blog-post.html` = "5 Desk Stretches", published 2026-07-21.)*
