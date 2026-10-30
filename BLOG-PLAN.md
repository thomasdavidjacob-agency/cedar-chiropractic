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
5. Add the new post to `sitemap.xml`: insert a `<url>` entry at the TOP of the
   "Blog posts" section (right after the comment), using today's date as `<lastmod>`:
   `  <url><loc>https://www.cedar-chiro.com/<slug>.html</loc><lastmod>YYYY-MM-DD</lastmod><changefreq>yearly</changefreq><priority>0.7</priority></url>`
6. Mark that topic `[x]` in the Queue and set its "published" date.
7. `git add -A && git commit` (clear message) `&& git push origin main`. The push
   auto-deploys via Vercel. Do NOT run the Vercel CLI.
8. If every topic is already `[x]`, make no changes — just note the queue is complete.

## Template — copy the structure of `chiropractic-care-after-car-accident.html` exactly
That published post is the canonical example. Match it: the `<head>` (title, meta
description, canonical `https://www.cedar-chiro.com/<slug>.html`, Open Graph, and a
`BlogPosting` JSON-LD with `headline`, `description`, `author` = Organization "Cedar Chiropractic & Auto Injury" (team byline, NOT Dr. Fred),
`datePublished` = today, `articleSection` = the cluster, `keywords`), the topbar, the nav
(mark Blog active), the `page-hero` with eyebrow + H1 + byline `By the Cedar Chiropractic Team · N min read · <a href="blog.html">Back to blog</a>` (**no visible dates anywhere** — posts are evergreen; the date lives only in JSON-LD `datePublished` and sitemap `lastmod`; blog.html cards show the category only, e.g. "Auto Injury"), the `<article class="section">` body, and the standard footer. Keep the same CSS classes.

## Services Fred has NOT confirmed (2026-10-29): do not present as Cedar services
Massage/soft-tissue therapy, sports-injury care, headache/migraine treatment, posture/ergonomic coaching. `massage-soft-tissue.html` was removed. Topics marked `[HOLD]` stay unpublished until Fred confirms; skip them. Don't describe decompression/traction equipment specifics or attorney-lien/records wording either (also pending Fred). PIP: never say it won't raise rates.

## Writing rules (this is what keeps it from looking like an AI blog)
- **Length:** 650–1100 words. Vary it post to post; don't make them all identical length/shape.
- **Voice:** warm, plain-spoken, practical — like a real Milwaukie chiropractor talking to a
  neighbor. Vary the opening (a question, a scenario, a myth, a stat-free observation). Avoid
  formulaic "In today's fast-paced world…" AI intros and repetitive phrasing across posts.
- **Structure:** an intro `<p class="lead">`, then 3–5 `<h2>` sections, occasional `<ul>`,
  and at most one `<div class="callout"><strong>From the front desk:</strong> …</div>` (or `Worth knowing:`) where it fits. Do NOT write "Dr. Fred's tip" or put words in Fred's mouth; the voice is the Cedar team. Vary the H2 skeleton from post to post.
- **Accuracy / YMYL:** educational only. Say "may help," "can support," "often." NEVER
  guarantee outcomes or cures. NEVER give individualized medical or legal advice — point
  readers to a consultation/exam. Don't invent statistics, credentials, or study citations.
- **NEVER mention AI, chatbots, or that this is automated.** Refer to the practice/team in
  human terms only.
- **Local SEO:** weave in 1–2 of these service-area cities **naturally, once or twice** — do
  NOT stuff or list them robotically: Milwaukie, Gladstone, Oregon City, Oak Grove, Portland.
  (Later we add West Linn, Lake Oswego.) Put the primary keyword in the title, H1, first
  paragraph, and meta description — naturally.
- **Internal links:** every post links to `auto-injury.html`, 2–4 of the service pages (`spinal-adjustments.html`, `spinal-decompression.html`, `cervical-lumbar-traction.html`, `ultrasound-e-stim.html`, `rehab-corrective-exercise.html`), `insurance.html`, `services.html`/`new-patients.html`/`contact.html`/`about.html` as relevant, and 1–2 related posts. Natural keyword anchors, never "click here".
- **CTA:** end with a `cta-band`: primary "Book an Appointment" → https://cedarchiro.janeapp.com/ (target _blank rel noopener) + "Call (503) 653-2232". No emoji.
- **Images:** each post gets its own free stock photo (Pexels/Unsplash) at `images/blog/<slug>.jpg`, ~1200px wide, inspected for text/logos/watermarks, never reused. Log the source in `images/blog/SOURCES.md`. Alt text describes what is actually in the photo.

## NAP / brand facts (use exactly)
- Cedar Chiropractic & Auto Injury (legal: Cedar Chiropractic Physicians, LLC)
- 4141 SE Harrison St, Milwaukie, OR 97222 · (503) 653-2232. **Never publish the email address or a mailto link**; link to contact.html instead (spam rule, 2026-10-30).
- Dr. Fred Seater, DC (practice owner; posts are bylined to the team). Booking: https://cedarchiro.janeapp.com/

## Queue (write in this order; one per run)
- [x] `chiropractic-care-after-car-accident` — Chiropractic Care After a Car Accident (Auto Injury) — *published 2026-08-03*
- [x] `whiplash-after-a-car-accident` — Whiplash After a Car Accident: Symptoms, Timeline & Treatment (Auto Injury) — kw: whiplash treatment — *written 2026-10-13, dated 2026-08-10*
- [x] `chiropractor-after-minor-car-accident` — Do You Really Need a Chiropractor After a Minor Fender-Bender? (Auto Injury) — kw: chiropractor after minor car accident — *written 2026-10-13, dated 2026-08-14*
- [x] `auto-injury-pip-medpay-oregon` — How Auto-Injury Care Is Paid For in Oregon (PIP & MedPay) (Auto Injury) — kw: PIP chiropractor Oregon — *written 2026-10-13, dated 2026-08-27*
- [x] `auto-injury-documentation-claim` — Injured in a Crash? How Documentation Supports Your Claim (Auto Injury) — kw: personal injury chiropractor — *written 2026-10-13, dated 2026-09-24*
- [x] `cervical-disc-herniation` — Cervical Disc Herniation: Signs, Causes & Non-Surgical Options (Conditions) — kw: cervical disc herniation treatment — *published 2026-10-30*
- [x] `sciatica-low-back-pain` — Sciatica & Low-Back Pain: What's Actually Going On (Conditions) — kw: sciatica chiropractor — *published 2026-10-30*
- [HOLD] `chiropractor-for-headaches` — The Neck–Headache Connection: Relief for Headaches & Migraines (Conditions) — kw: chiropractor for headaches
- [HOLD] `desk-job-neck-pain` — Desk-Job Neck Pain: Why It Happens and How to Fix It (Conditions) — kw: neck pain chiropractor
- [x] `cervical-traction` — Cervical Traction for Neck Pain & Disc Herniation: How It Works (Therapies) — kw: cervical traction — *published 2026-10-30*
- [x] `lumbar-traction-spinal-decompression` — Lumbar Traction & Spinal Decompression for Low-Back Pain (Therapies) — kw: spinal decompression — *published 2026-10-30*
- [x] `therapeutic-ultrasound` — Therapeutic Ultrasound in Chiropractic Care: What to Expect (Therapies) — kw: therapeutic ultrasound — *published 2026-10-30*
- [x] `electrical-muscle-stimulation-estim` — Electrical Muscle Stimulation (E-Stim): How It Eases Pain (Therapies) — kw: e-stim therapy — *published 2026-10-30*
- [x] `rehab-exercises-lasting-relief` — Why Rehab Exercises Are the Key to Lasting Relief (Therapies) — kw: chiropractic rehab exercises — *published 2026-10-30*
- [x] `are-chiropractic-adjustments-safe` — Are Chiropractic Adjustments Safe? What to Expect on Visit One (Therapies) — kw: are chiropractic adjustments safe — *published 2026-10-30*
- [x] `when-to-see-a-chiropractor` — When Should You See a Chiropractor vs. Wait It Out? (Wellness) — kw: when to see a chiropractor — *published 2026-10-30*
- [HOLD] `desk-posture-tips` — Posture at Your Desk: Small Fixes That Prevent Big Pain (Wellness) — kw: desk posture
- [x] `first-chiropractic-exam` — What Happens at Your First Chiropractic Exam (Wellness) — kw: chiropractic exam — *published 2026-10-30*

**Auto-injury expansion batch (2026-10-13). Already written, do not duplicate** (the later Conditions/Therapies queue items above are different intents and still open):
- [x] `delayed-pain-after-car-accident` — Why Does Pain Show Up Days After a Car Accident? (Auto Injury) — kw: delayed pain after car accident — *written 2026-10-13, dated 2026-08-20*
- [x] `first-72-hours-after-car-accident` — What to Do in the First 72 Hours After a Car Accident (Auto Injury) — kw: what to do after a car accident — *written 2026-10-13, dated 2026-09-02*
- [x] `headaches-after-car-accident` — Headaches After a Car Accident: Why They Happen and When to Worry (Auto Injury) — kw: headaches after car accident — *written 2026-10-13, dated 2026-09-08*
- [x] `cervical-traction-decompression-whiplash-recovery` — How Traction, Decompression, and Rehab Fit Into Whiplash Recovery (Auto Injury) — kw: cervical traction whiplash — *written 2026-10-13, dated 2026-09-14*
- [x] `chiropractor-vs-er-urgent-care-after-accident` — ER, Urgent Care, Your Doctor, or a Chiropractor: Who to See After a Crash (Auto Injury) — kw: chiropractor vs ER after car accident — *written 2026-10-13, dated 2026-09-18*
- [x] `low-back-pain-after-car-accident` — Low-Back Pain After a Car Accident (Auto Injury) — kw: low back pain after car accident — *written 2026-10-13, dated 2026-09-29*
- [x] `concussion-red-flags-after-car-accident` — Concussion Red Flags After a Car Accident: When to Go to the ER (Auto Injury) — kw: concussion after car accident — *written 2026-10-13, dated 2026-10-02*
- [x] `rehab-exercises-after-car-accident` — Rehab Exercises After a Car Accident (Auto Injury) — kw: rehab exercises after car accident — *written 2026-10-13, dated 2026-10-06*
- [x] `muscle-spasm-after-car-accident` — Muscle Spasms After a Car Accident (Auto Injury) — kw: muscle spasm after car accident — *written 2026-10-13, dated 2026-10-09*
- [x] `attorney-and-chiropractor-after-car-accident` — Working With Your Attorney and Your Chiropractor After a Car Accident (Auto Injury) — kw: personal injury chiropractor Oregon — *written 2026-10-13, dated 2026-10-13*
- [x] `rear-end-collision-neck-injuries` — Rear-End Collisions and Neck Injuries (Auto Injury) — kw: rear-end collision neck injury — *published 2026-10-30*
- [x] `seat-belt-airbag-injuries` — Seat Belt and Airbag Soft-Tissue Injuries (Auto Injury) — kw: seat belt injury after car accident — *published 2026-10-30*
- [x] `driving-work-after-car-accident` — Getting Back to Driving and Work After a Crash (Auto Injury) — kw: back to work after car accident — *published 2026-10-30*

*(The placeholder `blog-post.html` ("5 Desk Stretches") was removed from the site on 2026-10-13. Do not recreate it.)*
