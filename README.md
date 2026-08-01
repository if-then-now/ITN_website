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

**Host: Netlify.** `netlify.toml` publishes the `itnwebsite/` folder — no build step. The domain stays
registered at GoDaddy and only DNS is repointed. Full walkthrough, including the contact form setup
and the order to retire the old site in, is in
[`itnwebsite/README.md`](itnwebsite/README.md#deploying-to-netlify).

**`main` is the deployed branch.** Netlify's production branch is `main`, so anything merged there
goes live. Work on a feature branch and merge in once it has been reviewed in a browser at both
desktop and mobile widths — several bugs in this repo were only visible at one of the two.

Why not GoDaddy: `www.ifthennow.com` currently runs on GoDaddy **Website Builder**, which does not
accept HTML/CSS/JS uploads at all. Hosting it at GoDaddy would have meant buying an additional
cPanel plan, and Website Builder has no equivalent of Netlify's built-in form handling.

## Known gaps to close before launch

- **Netlify Forms email notifications need switching on in the dashboard.** The form is wired up and
  verified in code, but until a notification address is added, submissions are only stored in the
  Netlify dashboard and nobody is emailed.

## Closed since the first draft

- ~~**Contact form has no backend**~~ — **fixed**; now posts to Netlify Forms, with spam honeypot and
  client-side validation. Details in [`itnwebsite/README.md`](itnwebsite/README.md).
- ~~**Images are hot-linked from the old GoDaddy CDN** (`img1.wsimg.com`)~~ — **fixed**; all images
  now ship locally in `itnwebsite/assets/`.
