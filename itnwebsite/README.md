# if-then-now LLC — Website

Marketing site for if-then-now LLC: federal automation/AI consulting, the W.A.R.P. Speed Ahead
community STEM program, and the ITN intern think tank — given equal billing per the project brief.

## Stack

Static HTML/CSS/JS. No build step, no dependencies, no package manager.

- `index.html` — the page
- `src/css/styles.css` — all styling, design tokens live in `:root` at the top of the file
- `src/js/main.js` — mobile nav, scroll-based nav highlighting, reveal-on-scroll, contact form handling; all tunable values live in the `SITE_CONFIG` object at the top of the file

## Run locally

No install required. Either:

- Double-click `index.html` to open it directly in a browser, or
- Serve it so relative paths behave exactly like production:

```bash
# from the project root
python -m http.server 8000
# then open http://localhost:8000/
```

## Deploying to GoDaddy hosting

Everything needed to go live is in this `itnwebsite/` folder — no build step, no `npm install`.

**1. Get the files.** On GitHub: **Code → Download ZIP** on the repo (or `git clone` the repo URL if
you have git). Unzip it — the files you need are inside `itnwebsite/`:

```
itnwebsite/
├── index.html
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
  traditional hosting plan (cPanel/Web Hosting, above) instead. Check **My Products** in the GoDaddy
  account to see which product the domain is currently attached to.

**3. Verify.** Visiting the domain should load `index.html` automatically, because `index.html` is
the standard default filename every web server looks for at a folder's root — no extra
configuration needed.

## Known gaps to close before launch

- **Contact form has no backend.** `src/js/main.js` → `SITE_CONFIG.form.endpoint` is intentionally
  left blank — no working form endpoint or public contact email was found on the previous live
  site, and none should be guessed. Wire it up to a real form service (Formspree, GoDaddy Forms,
  a serverless function, etc.) and set the endpoint there. Until then the form shows a friendly
  message pointing visitors to LinkedIn instead of failing silently.
- **Images are hot-linked from the old GoDaddy CDN** (`img1.wsimg.com`) so the redesign could ship
  without re-uploading assets. Before decommissioning the GoDaddy site, download these images and
  serve them locally (e.g. from an `assets/` folder) so the site doesn't break if that CDN account
  is ever closed.
- **No git repository exists yet in this folder.** `.claude/CLAUDE.md` calls for feature branches
  and PRs into `dev` — run `git init`, connect the `if-then-now/ITN_website` remote, and push a
  first commit before following that workflow.
