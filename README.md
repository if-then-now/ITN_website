# if-then-now LLC — Website

Marketing site for if-then-now LLC: federal automation/AI consulting, the W.A.R.P. Speed Ahead
community STEM program, and the ITN intern think tank — given equal billing per the project brief.

## Stack

Static HTML/CSS/JS. No build step, no dependencies, no package manager.

- `itnwebsite/index.html` — the page
- `itnwebsite/assets/` — every image the site uses, served locally
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

**Host: Netlify.** `netlify.toml` publishes the `itnwebsite/` folder — no build step. The domain
stays registered *and DNS-managed* at GoDaddy; only two records are added, so the Microsoft 365 mail
records are never touched. Full walkthrough, including the contact form and the order to retire the
old site in, is in [`itnwebsite/README.md`](itnwebsite/README.md#deploying-to-netlify).

**`main` is the deployed branch.** Netlify's production branch is `main`, so anything merged there
goes live. Work on a feature branch and merge in once it has been reviewed in a browser at both
desktop and mobile widths — several bugs in this repo were only visible at one of the two.

**This repo is public, and must stay that way to deploy.** Netlify's Free and Personal plans cannot
connect a private, organization-owned GitHub repo; public org repos are fine. So: **never commit a
secret here.** Anything pushed is public immediately and permanently, and forks cannot be recalled.
Contributor emails were rewritten to GitHub noreply addresses before the repo was published.

Why not GoDaddy: `www.ifthennow.com` runs on GoDaddy **Website Builder**, which does not accept
HTML/CSS/JS uploads at all, so hosting there would have meant buying an additional cPanel plan.

Why not Cloudflare Pages: it deploys private org repos happily, but cannot serve an **apex** domain
over external DNS — `ifthennow.com` would have required moving nameservers off GoDaddy, putting the
company mail records inside a migration. Publishing a repo containing only a marketing site was the
smaller risk.

## Known gaps to close before launch

- **Netlify form detection must be enabled and the site redeployed**, then a notification address
  added. Detection only runs at build time, so enabling it without a redeploy registers nothing.

## Closed since the first draft

- ~~**Contact form has no backend**~~ — **fixed**; the form posts to Netlify Forms, with a spam
  honeypot and client-side validation. Details and verification notes in
  [`itnwebsite/README.md`](itnwebsite/README.md).
- ~~**Images are hot-linked from the old GoDaddy CDN** (`img1.wsimg.com`)~~ — **fixed**; all images
  now ship locally in `itnwebsite/assets/`.
