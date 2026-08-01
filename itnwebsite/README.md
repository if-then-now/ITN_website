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
# from this itnwebsite/ folder
python -m http.server 8000
# then open http://localhost:8000/
```

The contact form will report an error locally. That is expected: Netlify Forms only exists on
Netlify's edge, so there is nothing to receive the POST on your machine. Test the form on a deploy
preview or the live site, not locally.

## Deploying

**Host: Netlify.** The domain stays registered *and DNS-managed* at GoDaddy — only two records are
added, so the Microsoft 365 mail records are never touched. The GoDaddy upload route is kept at the
end for reference.

> **This repository is public**, which is a deployment requirement rather than a preference:
> Netlify's Free and Personal plans cannot connect a **private, organization-owned** GitHub repo.
> Public org repos are fine. Cloudflare Pages was evaluated as the private alternative, but it
> cannot serve an apex domain over external DNS — it would have required moving nameservers off
> GoDaddy, putting the company mail records in the path of a migration. Publishing a repo that
> contains only a marketing site was the smaller risk. Contributor emails were rewritten to GitHub
> noreply addresses before publishing.
>
> Consequence to respect: **never commit a secret to this repo.** Anything pushed here is public
> immediately and permanently, and forks cannot be recalled.

### Deploying to Netlify

`netlify.toml` at the repo root sets `publish = "itnwebsite"`, so Netlify serves that folder as the
document root. There is no build command — the site is static.

**1. Connect the repo.** On Netlify: **Add new site → Import an existing project → Deploy with
GitHub → `if-then-now/ITN_website`**. Set the production branch to **`main`**. Leave the build
command empty and confirm the publish directory reads `itnwebsite`; `netlify.toml` supplies both, so
the fields should already be filled in. Deploy.

You'll get a `*.netlify.app` URL immediately. Check the site there before touching DNS — nothing
about the live domain changes until step 3.

**2. Turn on the contact form.** Form detection is **off by default** and must be enabled before the
deploy that registers the form: **Forms → Enable form detection**, then redeploy
(**Deploys → Trigger deploy → Deploy site**), since detection only runs at build time. A form named
`contact` should then appear. Send a test message through the deployed site, confirm it lands, then
add your address under **Forms → Form notifications → Email notification** — otherwise submissions
sit in the dashboard and nobody is told. Check the current submission allowance under Forms →
usage and billing.

**3. Point the domain.** In Netlify: **Domain management → Add a custom domain → `ifthennow.com`**.
Netlify will name the records to create. In GoDaddy: **My Products → Domains → DNS**, then add them
— typically an `A` record for the apex and a `CNAME` for `www`. Add only those; leave every existing
record alone, particularly `MX` and the SPF `TXT`, which carry company email. Netlify provisions
HTTPS automatically once DNS resolves; allow a few hours for propagation.

**4. Only then retire the old site.** All images ship from `assets/`, so the new site no longer
depends on the Website Builder CDN. Confirm it renders on the real domain first, and note that the
existing GoDaddy contact form stops collecting the moment the old site goes away — so make sure
Netlify form notifications are confirmed working (step 2) or there will be a window where inbound
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

- **Netlify form detection must be enabled, then the site redeployed.** Detection is off by default
  and only runs at build time, so enabling it without a redeploy registers nothing. Until the form
  is registered *and* a notification address is set, submissions go nowhere and nobody is told.

## Closed since the first draft

- ~~Contact form has no backend~~ — **fixed.** The form posts to Netlify Forms:
  `data-netlify="true"` plus a hidden `form-name` field (required because `main.js` submits over
  `fetch` rather than a native post, so there is nothing else for Netlify to route on), and a
  `bot-field` honeypot for spam. Netlify's documented AJAX contract wants url-encoded bodies rather
  than multipart `FormData`, so the request body is a `URLSearchParams`.

  Two related fixes went in alongside it:
  - Client-side validation, because the form carries `novalidate` — which had been disabling the
    `required` attributes and letting empty submissions through.
  - `name` is now optional. It previously carried `required` while being conceptually optional, so
    leaving it blank produced the misleading message "Please fill in your email and message", which
    named the wrong fields. Only starred fields are required.

  Verified against a local capture server: an empty submit is blocked with no POST issued, and a
  filled submit posts `form-name=contact` with every field correctly url-encoded, including `&` and
  `=` inside the message body.

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
