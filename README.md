# if-then-now LLC — Website

Marketing site for if-then-now LLC: federal automation/AI consulting, the W.A.R.P. Speed Ahead
community STEM program, and the ITN intern think tank — given equal billing per the project brief.

## Stack

Static HTML/CSS/JS. No build step, no dependencies, no package manager.

- `itnwebsite/index.html` — the page
- `itnwebsite/assets/` — every image the site uses, served locally
- `itnwebsite/functions/api/contact.js` — Cloudflare Pages Function behind the contact form
- `itnwebsite/_headers` — security headers applied at the edge
- `itnwebsite/src/css/styles.css` — all styling, design tokens live in `:root` at the top of the file
- `itnwebsite/src/js/main.js` — mobile nav, scroll-based nav highlighting, reveal-on-scroll, contact form handling; all tunable values live in the `SITE_CONFIG` object at the top of the file

## Run locally

No install required. Either:

- Double-click `itnwebsite/index.html` to open it directly in a browser, or
- Serve it so relative paths behave exactly like production:

```bash
# from the project root
cd itnwebsite
python -m http.server 8000
# then open http://localhost:8000/
```

## Deploying

**Host: Cloudflare Pages**, serving the `itnwebsite/` folder with no build step. Full walkthrough —
build settings, environment variables, the contact form, and the order to retire the old site in — is
in [`itnwebsite/README.md`](itnwebsite/README.md#deploying-to-cloudflare-pages).

**`main` is the deployed branch.** Cloudflare's production branch is `main`, so anything merged there
goes live. Work on a feature branch and merge in once it has been reviewed in a browser at both
desktop and mobile widths — several bugs in this repo were only visible at one of the two.

Why not GoDaddy: `www.ifthennow.com` runs on GoDaddy **Website Builder**, which does not accept
HTML/CSS/JS uploads at all, so hosting there would have meant buying an additional cPanel plan.

Why not Netlify: its free and Personal plans do not support connecting a **private,
organization-owned** GitHub repository, and this repo is private under the `if-then-now` org. The
alternatives were making the repo public — which would permanently expose the contributor email
addresses in the commit history — or moving it to a personal account, which is the wrong home for
company IP. Cloudflare Pages has no such restriction.

## Known gaps to close before launch

- **`RESEND_API_KEY` and `CONTACT_TO` must be set in the Cloudflare dashboard**, or the contact form
  returns an error and no enquiry reaches you.
- **No rate limiting on the contact endpoint** — add a Cloudflare rate-limiting rule on
  `/api/contact` if spam ever becomes a problem.

## Closed since the first draft

- ~~**Contact form has no backend**~~ — **fixed**; a Cloudflare Pages Function now validates
  submissions and emails them via Resend, with a spam honeypot and client-side validation. Details
  and verification notes in [`itnwebsite/README.md`](itnwebsite/README.md).
- ~~**Images are hot-linked from the old GoDaddy CDN** (`img1.wsimg.com`)~~ — **fixed**; all images
  now ship locally in `itnwebsite/assets/`.
