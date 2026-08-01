# if-then-now LLC — Website

Marketing site for if-then-now LLC: federal automation/AI consulting, the W.A.R.P. Speed Ahead
community STEM program, and the ITN intern think tank — given equal billing per the project brief.

## Stack

Static HTML/CSS/JS. No build step, no dependencies, no package manager.

- `index.html` — the page
- `src/css/styles.css` — all styling, design tokens live in `:root` at the top of the file
- `src/js/main.js` — mobile nav, scroll-based nav highlighting, reveal-on-scroll, contact form handling; all tunable values live in the `SITE_CONFIG` object at the top of the file
- `assets/` — every image the site uses, served locally (no external CDN dependency)

Note that `url()` paths inside `styles.css` resolve relative to the stylesheet, so the hero
background is `../../assets/hero.jpg` — not `assets/hero.jpg`.

## Run locally

No install required. Either:

- Double-click `index.html` to open it directly in a browser, or
- Serve it so relative paths behave exactly like production:

```bash
# from the project root
python -m http.server 8000
# then open http://localhost:8000/
```

## Deploying

**Chosen host: Netlify.** The domain stays registered at GoDaddy; only DNS is repointed. See
[Deploying to Netlify](#deploying-to-netlify) below. The GoDaddy upload route is kept after it for
reference in case the hosting decision is ever revisited.

### Deploying to Netlify

`netlify.toml` at the repo root already sets `publish = "itnwebsite"`, so Netlify serves that folder
as the document root. There is no build command — the site is static.

**1. Connect the repo.** On Netlify: **Add new site → Import an existing project → GitHub →
`if-then-now/ITN_website`**. Pick the branch to deploy (`beta` today, or `main` once the work is
merged there). Leave the build command empty and confirm the publish directory reads `itnwebsite`;
`netlify.toml` supplies both, so the fields should already be filled in. Deploy.

You'll get a `*.netlify.app` URL immediately. Check the site there before touching DNS — nothing
about the live domain changes until step 3.

**2. Confirm the contact form.** Netlify detects the form at deploy time (it's in the static HTML,
which is what detection requires). Open **Site configuration → Forms** and you should see a form
named `contact`. Submit a test message through the deployed site and confirm it appears there, then
add your address under **Forms → Form notifications → Email notification** so submissions are
emailed rather than only sitting in the dashboard. The free tier covers 100 submissions/month.

**3. Point the domain.** In Netlify: **Domain management → Add a custom domain →
`ifthennow.com`**. Netlify will tell you which records to create. In GoDaddy: **My Products →
Domains → DNS**, then set those records — typically an `A` record for the apex and a `CNAME` for
`www`. Netlify provisions the HTTPS certificate automatically once DNS resolves; allow up to a few
hours for propagation. Do not cancel the Website Builder subscription until the new site is live and
verified — see the warning in step 4.

**4. Only then retire the old site.** All images now ship from `assets/`, so the new site no longer
depends on the Website Builder CDN. Still, confirm the new site renders completely on the real domain
before cancelling anything, and note that the existing GoDaddy contact form stops collecting the
moment the old site goes away — so make sure Netlify Forms notifications are working first (step 2)
or there will be a window where inbound leads are lost.

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

- **Netlify Forms email notifications must be switched on in the dashboard.** The form itself is
  wired up and verified in code, but Netlify only stores submissions until you add a notification
  address (see step 2 above). Until then messages land in the dashboard and nobody gets an email.

## Closed since the first draft

- ~~Contact form has no backend~~ — **fixed.** The form now posts to Netlify Forms:
  `data-netlify="true"` plus a hidden `form-name` field (required because `main.js` submits over
  `fetch` rather than a native post), a `bot-field` honeypot for spam, and
  `SITE_CONFIG.form.endpoint = '/'`. Netlify wants AJAX submissions url-encoded rather than as
  multipart `FormData`, so the request body is a `URLSearchParams`. Client-side validation was added
  because the form carries `novalidate`, which had been disabling the `required` attributes and
  letting empty submissions through. Verified against a local capture server: empty submits are
  blocked with no POST, and a filled submit sends `form-name=contact` with all fields correctly
  encoded.

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
