#!/usr/bin/env python3
"""Render docs-src/*.md into standalone pages under itnwebsite/.

The site itself has no build step; this is a one-off generator you run by hand
when a source doc changes, and the generated HTML is committed alongside it. That
keeps the published folder dependency-free while still letting the markdown be
the source of truth.

    python tools/build-docs.py

Requires: pip install markdown-it-py mdit-py-plugins

markdown-it-py rather than Python-Markdown deliberately: it is CommonMark
compliant, and Python-Markdown silently mis-renders a fenced code block nested
inside a list item — it came out as a single inline <code>, collapsing the SMTP
config in the Files section onto one line.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    from markdown_it import MarkdownIt
    from mdit_py_plugins.anchors import anchors_plugin
except ImportError:
    sys.exit(
        "Missing dependencies. Run:\n"
        "  python -m pip install --user markdown-it-py mdit-py-plugins"
    )

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs-src"
OUT = ROOT / "itnwebsite"
SITE = "https://ifthennow.com"

# Public as of 2026-08-02. Relative links in the source resolve against this, so
# a reader on the website gets the same files a reader on GitHub would.
REPO = "https://github.com/if-then-now/agentouija"
REPO_BLOB = f"{REPO}/blob/main"

DOCS = [
    {
        "src": "HOW_TO.md",
        "out": "agent-ouija-how-to.html",
        "title": "How to use Agent Ouija",
        "description": (
            "A walkthrough of every tab in Agent Ouija, the open source multi-model AI "
            "platform built by the if-then-now Think Tank."
        ),
    },
]


def gh_slug(text: str) -> str:
    """Slugify the way GitHub does, so the anchors already written into the
    markdown keep working. Each space becomes one dash with no collapsing — that
    is what produces the double dash in `tab-1--agent-ouija`, where an em dash was
    stripped from between two spaces. A slugifier that collapses runs would
    silently break every table-of-contents link in the doc."""
    slug = text.strip().lower()
    slug = re.sub(r"[^\w\s-]", "", slug, flags=re.UNICODE)
    return slug.replace(" ", "-")


def preprocess(md: str) -> str:
    """Adjust the source for a public web page rather than a repo README."""

    # The doc is addressed to whoever publishes it; a visitor should not see it.
    md = re.sub(
        r"Companion piece intended for\s*\n?\[www\.ifthennow\.com\]\([^)]*\)"
        r"\s*—\s*feel free to link\s*\n?directly from the site\.\s*\n",
        "",
        md,
    )

    # SETUP.md is a sibling file in the app's repo, so a bare relative link would
    # 404 here. Resolve it against the repo, preserving any deep anchor.
    md = re.sub(
        r"\[SETUP\.md\]\(SETUP\.md([^)]*)\)",
        lambda m: f"[SETUP.md]({REPO_BLOB}/SETUP.md{m.group(1)})",
        md,
    )

    # A localhost autolink is not clickable for a reader; show it as an address.
    md = md.replace("<http://localhost:7860>", "`http://localhost:7860`")

    # The repo's own issue and discussion links pass through untouched now that it
    # is public — a reader can actually use them.

    # Two of the five table-of-contents links are dead in the source: the Tab 4 and
    # Tab 5 headings carry a trailing subtitle, so they slugify to something longer
    # than the short anchor the TOC points at. Broken on GitHub too. Repoint the
    # links at the anchors the headings actually generate.
    md = md.replace("](#tab-4--persona)", "](#tab-4--persona--jarvis-for-agent-ouija)")
    md = md.replace("](#tab-5--data)", "](#tab-5--data--accounting-and-training-stats)")
    return md


def indent_html(html: str, pad: str = "    ") -> str:
    """Indent the body to sit neatly inside the template — but never inside a
    <pre>, where leading whitespace is content and would show up as phantom
    indentation on every line of a code block after the first."""
    out, in_pre = [], False
    for line in html.split("\n"):
        if not in_pre and "<pre" in line:
            in_pre = True
            out.append(pad + line if line.strip() else line)
            if "</pre>" in line:
                in_pre = False
            continue
        if in_pre:
            out.append(line)
            if "</pre>" in line:
                in_pre = False
            continue
        out.append(pad + line if line.strip() else line)
    return "\n".join(out)


def externalise_links(html: str) -> str:
    """Off-site links open in a new tab, matching the rest of the site."""

    def repl(match: re.Match) -> str:
        href = match.group(1)
        if href.startswith("#") or href.startswith("/") or href.startswith(SITE):
            return match.group(0)
        if not href.startswith(("http://", "https://")):
            return match.group(0)
        return f'<a href="{href}" rel="noopener" target="_blank">'

    return re.sub(r'<a href="([^"]+)">', repl, html)


TEMPLATE = """<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — if-then-now LLC</title>
  <meta name="description" content="{description}" />
  <meta name="theme-color" content="#fe8510" />
  <link rel="canonical" href="{site}/{out}" />

  <meta property="og:url" content="{site}/{out}" />
  <meta property="og:site_name" content="if-then-now LLC" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:type" content="article" />
  <meta property="og:image" content="{site}/assets/hero.jpg" />

  <link rel="icon" href="assets/logo-mark.jpg" />
  <link rel="apple-touch-icon" href="assets/logo-mark.jpg" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="src/css/styles.css" />
  <link rel="stylesheet" href="src/css/docs.css" />
</head>
<body>
  <a class="skip-link" href="#doc-content">Skip to content</a>

  <header class="doc-header">
    <div class="doc-header__bar">
      <a class="brand" href="index.html">
        <img class="brand__mark" src="assets/logo-mark.jpg" alt="if-then-now LLC logo" width="40" height="40" />
        <span class="brand__name">if-then-now</span>
      </a>
      <a class="doc-header__back" href="index.html#portfolio">← Back to Portfolio</a>
    </div>
  </header>

  <main class="doc" id="doc-content">
{body}
    <p class="doc__footer">
      Built by the <a href="index.html#community">ITN Think Tank</a> at if-then-now LLC.
      Questions? <a href="index.html#contact">Get in touch</a>.
    </p>
  </main>
</body>
</html>
"""


def build(doc: dict) -> Path:
    md_text = preprocess((SRC / doc["src"]).read_text(encoding="utf-8"))

    converter = (
        MarkdownIt("commonmark", {"html": False, "linkify": False})
        .enable("table")
        .use(anchors_plugin, min_level=1, max_level=4, slug_func=gh_slug, permalink=False)
    )
    body = indent_html(externalise_links(converter.render(md_text)))

    html = TEMPLATE.format(
        title=doc["title"],
        description=doc["description"],
        site=SITE,
        out=doc["out"],
        body=body,
    )
    target = OUT / doc["out"]
    target.write_text(html, encoding="utf-8")
    return target


def main() -> None:
    if not SRC.is_dir():
        sys.exit(f"no source directory at {SRC}")
    for doc in DOCS:
        target = build(doc)
        print(f"wrote {target.relative_to(ROOT)}  ({target.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
