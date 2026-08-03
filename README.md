# Cedar Chiropractic Physicians — Website

A skeleton build for Dr. Fred's chiropractic practice. Static HTML/CSS/JS, deployable on Vercel with a Resend-powered appointment form. No build step.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Home — hero, services, about, steps, testimonials, portal callout, blog preview |
| `services.html` | Full services grid |
| `about.html` | Dr. Fred bio, philosophy, team |
| `new-patients.html` | First-visit steps, insurance, FAQ |
| `contact.html` | Appointment request form + clinic info + map |
| `portal.html` | ChiroTouch patient portal gateway |
| `blog.html` | Blog index |
| `blog-post.html` | Article template |
| `api/lead.js` | Serverless form handler (Resend) |

## Still needs the client (before go-live)
Real NAP, hours, logo, photos (Fred, Bobbie, office), and testimonials are all in place.
Remaining:
- **Resend:** verify a sending domain in Resend, then set `RESEND_API_KEY` (Vercel env) and real `TO_EMAIL` / `FROM_EMAIL` in `api/lead.js`. Until then the form no-ops gracefully.
- **Booking / portal:** wire Fred's **Jane** online-booking URL + patient login (MyJane) once his Jane account is set up. Booking CTAs currently route to the contact form; `portal.html` is EHR-neutral. (EHR decision history: ChiroTouch → ChiroSpring → **Jane**.)
- **Blog:** replace the single sample article with real posts + thumbnails.
- **Reviews:** confirm current Google rating/count if we want to display numbers (currently linked, not hardcoded).
- **Domain:** point cedar-chiro.com at Vercel (GoDaddy DNS) when ready to go live.

## Local preview
Any static server works, e.g.:
```
npx serve .
```
The form posts to `/api/lead`, which only runs under Vercel (`vercel dev`) — locally it will show the fallback error and prompt to call.

## Deploy (Vercel)
1. Push to a Git repo and import in Vercel, or run `vercel`.
2. Add env var **`RESEND_API_KEY`** (from resend.com) in Project → Settings → Environment Variables.
3. Verify your sending domain in Resend and update `FROM_EMAIL` in `api/lead.js`.
4. Point the practice's domain at the project.

## Design notes
- **Palette:** deep navy `#0a325a`, sage green `#50826e`, warm cream `#f6f4ee`, green CTA accent `#3f7358` — sampled from the Cedar logo (`images/Logo.png`).
- **Type:** Fraunces (headings) + Inter (body), loaded from Google Fonts.
- All design tokens live at the top of `style.css` under `:root`.
