# CLAUDE.md

Static, self-contained learning docsite (HTML/CSS/JS/TS/Angular). No build step, no
framework, no external deps — open any `*.html` directly in a browser.

## Run / preview
- Serve locally: `python -m http.server 8712` (config in `.claude/launch.json`), then open `http://localhost:8712/index.html`.
- Pages: `index.html` (home + nav + TOC) and one guide per tech: `html/css/javascript/typescript/angular.html`.
- **Standalone** pages (own inline CSS/JS/SVG, NOT the shared shell): `angular-core-deep-dive.html`, `web-design-html-css-js.html`, `java-collections.html`, `java-multithreading.html`, `java-functional-programming.html`, `cheatsheet-angular.html`, `cheatsheet-web-design.html`. Everything else — including `cheatsheets.html` (the landing page) — uses the shared shell.
- `java-collections.html`, `java-multithreading.html`, and `java-functional-programming.html` are **backend** (Java) study guides generated from a course transcript per `tutorial-generation-instructions.md`. All three reuse the deep-dive's CSS/JS design system verbatim (theme toggle, sidebar TOC + filter, scroll-spy, highlighter) with a `java` keyword branch added to the highlighter, and are assembled from per-section fragments. `java-collections.html` = 14 sections / 101 lectures; `java-multithreading.html` = 12 sections / 40 lectures; `java-functional-programming.html` = 8 sections / 47 lectures (all under the **Java Programming essentials** nav track). Source transcripts + `Resources/` code live under `Source Files/` (gitignored). Multithreading captions are auto-translated (Slovak), so its technical content is derived from the English lecture titles + the real course Java code, not the caption wording. The functional-programming course, by contrast, ships **clean English lecture notes + real Java/JShell code** (`Resources/functional-programming-with-java-master/notes-java.md` + `code.md`) — paraphrase the prose, reuse code/outputs as facts.
- Extract course PDFs with `C:/Users/prash/bin/pdftotext.exe -layout file.pdf` (the Read tool's PDF reader needs poppler/`pdftoppm`, which isn't installed here).

## Architecture
- Shared shell = `styles/site.css` + `scripts/site.js` (theme, TOC filter/scroll-spy, live example iframes, regex syntax highlighter). All guide pages except the deep-dive use it.
- Interactive examples run user code in a **sandboxed iframe** (`srcdoc`) — HTML/CSS/JS only.
- TS and Angular **cannot execute** in the iframe, so those guides use **static `pre.code-block` + simulated output shown side by side** (`.io-grid` in `angular.html`, `.io`/`.out` in the deep-dive and `java-collections.html`, `.sim-output` in `typescript.html`). Backend languages (e.g. Java) likewise can't run in-browser — same static-code-plus-traced-output pattern.

## Gotchas (read before editing)
- **Escape code in highlighted blocks.** Any code inside `pre.code-block > code`, the editor `textarea.code`, or `pre.code data-lang=…` must HTML-escape `&` `<` `>` (`&amp; &lt; &gt;`). Angular/HTML templates are full of `<>`; unescaped code breaks rendering AND the highlighter. The highlighter (`scripts/site.js`) stashes tokens behind a NUL (`\x00`) + private-use-char sentinel — do not use a digit as the placeholder index.
- **Inline SVG `<style>` is document-global.** Namespace class names per-diagram or they collide/leak. Prefer theme vars (`var(--text)` etc.), not hardcoded hex, so dark mode works.
- **Top nav** is hand-duplicated in every page's `.topnav` — edit ALL pages to keep it in sync. Canonical order: Home, HTML, CSS, JavaScript, TypeScript, Angular, **Frontend Development with Angular** (dropdown → Angular Deep Dive, Web Design), **Java Programming essentials** (dropdown → 1 Java Collections from basics to Advanced, 2 Java Multithreading, Concurrency &amp; Performance Optimization, 3 Learn Java Functional Programming with Lambdas &amp; Streams), **Cheatsheets** (Cheatsheets stays **last** — new topics/dropdowns insert before it). Dropdowns are pure-CSS `.nav-dropdown` (open on `:hover` + `:focus-within`, no JS); styles live in `site.css` for the shared shell and are **duplicated inline** in `case-study-restaurant-design.html` (which has its own `.header-links` nav carrying the same dropdowns). A new course under an existing track is just another `<a>` inside that dropdown's `.nav-dropdown-menu`. Header is `min-height` + `flex-wrap` (a fixed height clips wrapped links).
- **Theme localStorage key is per-page.** Shared shell → `devdocs-theme`; deep-dive → `acdd-theme`; web-design → `webdesign-theme`; java-collections → `javacoll-theme`; java-multithreading → `javamt-theme`; java-functional-programming → `javafp-theme`; both cheatsheets → `cheatsheet-theme`. A new standalone page must pick a **unique** key.
- Line endings: repo stores LF; git warns "LF will be replaced by CRLF" on Windows checkout — expected, ignore.

## Preview-tool caveat
The headless preview viewport reports **0 width**, so auto-grow textareas and 2-column grids collapse and `preview_screenshot` times out on long pages. Verify layout by forcing an element width in `preview_eval` and inspecting computed values; don't rely on screenshots for large pages.

## Git / workflow
- Branch `main`; commit and push **only when explicitly asked**.
- Downloaded course transcripts/PDFs are copyrighted and **gitignored** (`*-transcript.txt`, `angular-core-deep-dive/`, `web-design-html-css-js/`) — never commit them. Transcripts are mixed English/Italian auto-captions — paraphrase only, never reproduce verbatim.
- Reusable tooling lives in `.claude/skills/` (e.g. `udemy-transcript-extractor`).
