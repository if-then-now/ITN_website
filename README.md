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

## Deploying to GoDaddy hosting

Everything needed to go live is in the `itnwebsite/` folder — no build step, no `npm install`. See
[`itnwebsite/README.md`](itnwebsite/README.md#deploying-to-godaddy-hosting) for the full
download-and-upload walkthrough for whoever manages the GoDaddy account.

## Known gaps to close before launch

- **Contact form has no backend.** `itnwebsite/src/js/main.js` → `SITE_CONFIG.form.endpoint` is
  intentionally left blank — no working form endpoint or public contact email was found on the
  previous live site, and none should be guessed. Wire it up to a real form service (Formspree,
  GoDaddy Forms, a serverless function, etc.) and set the endpoint there. Until then the form shows
  a friendly message pointing visitors to LinkedIn instead of failing silently.
- ~~**Images are hot-linked from the old GoDaddy CDN** (`img1.wsimg.com`)~~ — **fixed**; all images
  now ship locally in `itnwebsite/assets/`.
- **The domain's current GoDaddy plan can't host this site.** `www.ifthennow.com` runs on GoDaddy
  Website Builder, which does not accept HTML/CSS/JS uploads. See
  [`itnwebsite/README.md`](itnwebsite/README.md#deploying-to-godaddy-hosting) for what going live
  actually requires.
