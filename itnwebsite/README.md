# if-then-now LLC — Website

Marketing site for if-then-now LLC: federal automation/AI consulting, the W.A.R.P. Speed Ahead
community STEM program, and the ITN intern think tank — given equal billing per the project brief.

## Stack

Static HTML/CSS/JS. No build step, no dependencies, no package manager.

- `ifthennow.html` — the page
- `src/css/styles.css` — all styling, design tokens live in `:root` at the top of the file
- `src/js/main.js` — mobile nav, scroll-based nav highlighting, reveal-on-scroll, contact form handling; all tunable values live in the `SITE_CONFIG` object at the top of the file

## Run locally

No install required. Either:

- Double-click `ifthennow.html` to open it directly in a browser, or
- Serve it so relative paths behave exactly like production:

```bash
# from the project root
python -m http.server 8000
# then open http://localhost:8000/ifthennow.html
```

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
