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

## Placeholders to replace (search & swap)
- **Phone:** `(503) 555-0142` / `tel:+15035550142`
- **Email:** `hello@cedarchiro.com`, and in `api/lead.js` the `TO_EMAIL` / `FROM_EMAIL`
- **Address:** `1234 Cedar Ave, Suite 200, Portland, OR 97201` (and the map `bbox` in `contact.html`)
- **ChiroTouch portal URL:** in `portal.html`, the two `https://www.chirotouch.com/` links (marked with a TODO) → the practice's real ChiroTouch portal/login URL
- **Photos:** every `.ph` placeholder block (hero, Dr. Fred, team, blog thumbnails) → real images
- **Copy:** review the "since 2010 / 15+ years / 4.9★ / 300+ reviews" claims and make them accurate

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
- **Palette:** deep cedar green `#2f4a3a`, sage `#7d9b86`, warm cream `#f8f5ef`, cedar/terracotta accent `#b5673f`.
- **Type:** Fraunces (headings) + Inter (body), loaded from Google Fonts.
- All design tokens live at the top of `style.css` under `:root`.
