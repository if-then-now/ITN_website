# if-then-now LLC — Website

Marketing site for if-then-now LLC: federal automation/AI consulting, the W.A.R.P. Speed Ahead
community STEM program, and the ITN intern think tank — given equal billing per the project brief.

## Stack

Static HTML/CSS/JS. No build step, no dependencies, no package manager.

- `index.html` — the page
- `src/css/styles.css` — all styling, design tokens live in `:root` at the top of the file
- `src/js/main.js` — mobile nav, scroll-based nav highlighting, reveal-on-scroll, contact form handling; all tunable values live in the `SITE_CONFIG` object at the top of the file
- `assets/` — every image the site uses, served locally (no external CDN dependency)
- `functions/api/contact.js` — Cloudflare Pages Function backing the contact form
- `_headers` — security headers Cloudflare Pages applies at the edge

Note that `url()` paths inside `styles.css` resolve relative to the stylesheet, so the hero
background is `../../assets/hero.jpg` — not `assets/hero.jpg`.

## Run locally

For the static site alone, no install is needed:

```bash
# from this itnwebsite/ folder
python -m http.server 8000
# then open http://localhost:8000/
```

The contact form will show an error under that server, because the Pages Function isn't running —
that's expected, not a bug. To exercise the form too, use Wrangler, which runs the Function the same
way Cloudflare does:

```bash
# from this itnwebsite/ folder
npx wrangler pages dev . \
  --binding RESEND_API_KEY=<key> CONTACT_TO=you@example.com
```

To test without sending real email, point it at a local mock instead:

```bash
npx wrangler pages dev . \
  --binding RESEND_API_KEY=test CONTACT_TO=you@example.com \
  RESEND_ENDPOINT=http://127.0.0.1:8990/
```

## Deploying

**Host: Cloudflare Pages.** Netlify was ruled out: its free and Personal plans do not support
connecting a **private, organization-owned** GitHub repository, and this repo is private under the
`if-then-now` org. Cloudflare Pages has no such restriction, so the repo stays private and
org-owned. The GoDaddy upload route is kept at the end for reference.

### Deploying to Cloudflare Pages

**1. Create the project.** Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to
Git** → `if-then-now/ITN_website`. Then set:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `/` |
| Root directory | `itnwebsite` |

Root directory is the one that matters. Setting it to `itnwebsite` makes everything Pages needs
self-contained in that folder — `index.html`, `assets/`, `functions/` and `_headers` all resolve
from there. This was verified locally with `npx wrangler pages dev .` run from inside `itnwebsite`:
Wrangler compiled the Function and reported "Parsed 1 valid header rule", confirming both are
picked up at that level.

**2. Add the environment variables.** Settings → **Environment variables**, for both Production and
Preview:

| Variable | Value | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | your Resend API key | **Encrypt this one** |
| `CONTACT_TO` | where enquiries should land | e.g. your Microsoft 365 address |
| `CONTACT_FROM` | *(optional)* | omit to use Resend's onboarding sender |

Get the key from [resend.com](https://resend.com) — the free tier covers 3,000 emails/month. Leaving
`CONTACT_FROM` unset means no DNS work at all to start: Resend's onboarding sender is used, and
`reply_to` is set to the visitor so replying from your mail client reaches them directly.

If you later want a branded sender like `noreply@ifthennow.com`, verify a **subdomain**
(e.g. `send.ifthennow.com`) in Resend rather than the root domain. A subdomain gets its own
SPF/DKIM records and leaves the root domain's existing Microsoft 365 SPF and MX untouched. Adding a
second SPF record to the root domain would break mail — a domain may only have one.

**3. Deploy and check.** You'll get a `*.pages.dev` URL. Verify the page renders with images, then
send a test enquiry through the form and confirm it arrives. Nothing about the live domain has
changed at this point.

**4. Point the domain.** Custom domains → Set up a domain. Note the constraint:

- **Apex (`ifthennow.com`) requires the domain to be a zone on Cloudflare**, i.e. moving nameservers
  off GoDaddy. Cloudflare cannot serve an apex domain over external DNS, because DNS does not permit
  CNAME records at the zone apex. If you take this route, export every existing GoDaddy DNS record
  first and confirm Cloudflare imported the `MX`, SPF and `MS=` verification records **before**
  changing nameservers, then send yourself a test email immediately after. Getting this wrong breaks
  company email.
- **`www.ifthennow.com` only** works over external DNS: add a `CNAME` from `www` to
  `<project>.pages.dev` at GoDaddy and use GoDaddy domain forwarding to send the apex to `www`. Your
  nameservers, MX and SPF are never touched. Slightly less tidy, materially lower risk.

**5. Only then retire the old site.** All images ship from `assets/`, so the new site no longer
depends on the Website Builder CDN. Confirm the new site renders on the real domain first, and note
that the existing GoDaddy contact form stops collecting the moment the old site goes away — so make
sure a test enquiry has actually reached your inbox (step 3) or there will be a window where inbound
leads are lost.

### Deploying to GoDaddy hosting (reference — not the chosen route)

Everything needed to go live is in this `itnwebsite/` folder — no build step, no `npm install`.

**1. Get the files.** On GitHub: **Code → Download ZIP** on the repo (or `git clone` the repo URL if
you have git). Unzip it — the files you need are inside `itnwebsite/`:

```
itnwebsite/
├── index.html
├── assets/          <- all 10 images; must be uploaded too or the site renders blank panels
└── src/
    ├── css/styles.css
    └── js/main.js
```

**2. Upload to GoDaddy**, preserving that exact folder structure (`index.html` must sit next to the
`src/` folder, not inside it):

- **If you have a GoDaddy Web Hosting / cPanel plan:** log in to GoDaddy → **My Products → Web
  Hosting → Manage → File Manager** (or connect over FTP with the credentials in that same panel).
  Open the `public_html` folder (this is the document root for your domain) and upload `index.html`
  and the `src/` folder into it. If an old site's files are already in `public_html`, move or back
  those up first rather than deleting them, in case anything is still needed.
- **If your domain is on GoDaddy's "Website Builder" / "Website + Marketing" product instead:** that
  tool does not accept raw HTML/CSS/JS file uploads — it only supports its own drag-and-drop editor
  (with a very limited custom-HTML embed block). To host this file as-is, the domain needs a
  traditional hosting plan (cPanel/Web Hosting, above) instead.

> **Confirmed as of 2026-08-01:** `www.ifthennow.com` is currently served by **Website Builder**, not
> cPanel hosting. The live response headers report `Server: DPS/2.0.0-beta` and preload assets from
> `website-builder-data-prod`, both of which are Website Builder signatures. So the second bullet is
> the situation that applies: **this site cannot be uploaded to the domain's current plan.** Going
> live requires either adding a GoDaddy Web Hosting (cPanel) plan and repointing the domain, or
> hosting the static files elsewhere and repointing DNS while the domain stays registered at GoDaddy.

**3. Verify.** Visiting the domain should load `index.html` automatically, because `index.html` is
the standard default filename every web server looks for at a folder's root — no extra
configuration needed.

## Known gaps to close before launch

- **`RESEND_API_KEY` and `CONTACT_TO` must be set in the Cloudflare dashboard.** Without them the
  Function returns a 500 and tells the visitor to use LinkedIn instead — it fails honestly rather
  than silently, but no enquiry reaches you until they're set. See step 2 above.
- **No rate limiting on the Function.** A determined spammer could burn through the Resend quota
  even with the honeypot in place. If that ever happens, add a Cloudflare rate-limiting rule on
  `/api/contact` (no code change needed) or a Turnstile challenge.

## Closed since the first draft

- ~~Contact form has no backend~~ — **fixed.** `functions/api/contact.js` validates the submission
  and emails it via Resend, with `reply_to` set to the visitor so replying goes straight back to
  them. Notes on the implementation:
  - The route exports `onRequest`, not just `onRequestPost`. With only `onRequestPost`, a `GET` to
    `/api/contact` fell through to the static asset handler and returned **200 with the homepage
    HTML**, which crawlers would index as duplicate content. Non-POST methods now get a 405.
  - Submitted text is HTML-escaped before going into the email body.
  - The `bot-field` honeypot returns 200 without sending, so a bot cannot tell it was caught.
  - Client-side validation was added because the form carries `novalidate`, which had been disabling
    the `required` attributes and letting empty submissions through.
  - `name` is optional on both sides. It previously carried `required` in the HTML while the server
    treated it as optional, so leaving it blank produced the misleading message "Please fill in your
    email and message". Only starred fields are required now.

  Verified with `wrangler pages dev` against a mock Resend endpoint: valid submissions send exactly
  one email with the right recipient and `reply_to`; honeypot submissions send none; malformed
  emails, missing fields and oversized messages are each rejected with their own message; and
  GET/PUT/DELETE/HEAD all return 405 with an `Allow: POST` header.

  Worth knowing: the **old** GoDaddy Website Builder site had a working contact form. Launching
  before this was fixed would have replaced a working form with one that silently discarded
  messages — a regression, not merely an unfinished feature.

- ~~Images are hot-linked from the old GoDaddy CDN (`img1.wsimg.com`)~~ — **fixed.** All 9 CDN
  images were downloaded at the exact sizes/crops the old site rendered them and now live in
  `assets/`. This mattered more than it first looked: that CDN belongs to the Website Builder
  product itself, so cancelling the old site would have broken every image on the new one.
  `og:image` and `twitter:image` still need absolute URLs for social scrapers, so they point at
  `https://ifthennow.com/assets/hero.jpg` — update that host if the site lands on a different
  domain.
