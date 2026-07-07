# CLAUDE.md

Static, self-contained learning docsite (HTML/CSS/JS/TS/Angular). No build step, no
framework, no external deps — open any `*.html` directly in a browser.

## Run / preview
- Serve locally: `python -m http.server 8712` (config in `.claude/launch.json`), then open `http://localhost:8712/index.html`.
- Pages: `index.html` (home + nav + TOC) and one guide per tech: `html/css/javascript/typescript/angular.html`.
- `angular-core-deep-dive.html` is **standalone** (its own inline CSS/JS/SVG) — NOT the shared shell.

## Architecture
- Shared shell = `styles/site.css` + `scripts/site.js` (theme, TOC filter/scroll-spy, live example iframes, regex syntax highlighter). All guide pages except the deep-dive use it.
- Interactive examples run user code in a **sandboxed iframe** (`srcdoc`) — HTML/CSS/JS only.
- TS and Angular **cannot execute** in the iframe, so those guides use **static `pre.code-block` + simulated output shown side by side** (`.io-grid` in `angular.html`, `.io`/`.out` in the deep-dive, `.sim-output` in `typescript.html`).

## Gotchas (read before editing)
- **Escape code in highlighted blocks.** Any code inside `pre.code-block > code`, the editor `textarea.code`, or `pre.code data-lang=…` must HTML-escape `&` `<` `>` (`&amp; &lt; &gt;`). Angular/HTML templates are full of `<>`; unescaped code breaks rendering AND the highlighter. The highlighter (`scripts/site.js`) stashes tokens behind a NUL (`\x00`) + private-use-char sentinel — do not use a digit as the placeholder index.
- **Inline SVG `<style>` is document-global.** Namespace class names per-diagram or they collide/leak. Prefer theme vars (`var(--text)` etc.), not hardcoded hex, so dark mode works.
- **Top nav** lives in every page's `.topnav`; the header is `min-height` + `flex-wrap` (a fixed height clips wrapped links).
- Line endings: repo stores LF; git warns "LF will be replaced by CRLF" on Windows checkout — expected, ignore.

## Preview-tool caveat
The headless preview viewport reports **0 width**, so auto-grow textareas and 2-column grids collapse and `preview_screenshot` times out on long pages. Verify layout by forcing an element width in `preview_eval` and inspecting computed values; don't rely on screenshots for large pages.

## Git / workflow
- Branch `main`; commit and push **only when explicitly asked**.
- Downloaded course transcripts are copyrighted and **gitignored** (`*-transcript.txt`, `angular-core-deep-dive/`) — never commit them.
- Reusable tooling lives in `.claude/skills/` (e.g. `udemy-transcript-extractor`).
