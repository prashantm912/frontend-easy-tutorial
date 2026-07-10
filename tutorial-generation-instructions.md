# Tutorial Generation Instructions

## Purpose

Convert a provided course transcript (split into sections and lectures) into a complete, visually appealing, copyright-safe, learner-friendly HTML page that preserves all technical information but rewrites the text in original, concise, and professional language suitable for reading (not a transcript). The course may cover **any technology — frontend or backend** (e.g. HTML/CSS/JS, TypeScript, Angular, but equally Java, Python, Go, SQL, DevOps, etc.). Use example code when supplied — from a GitHub repo/branches **or** from attached resource files bundled with the transcript — otherwise reimplement equivalent, improved examples.

## Technology scope — frontend AND backend

These instructions are technology-agnostic. Adapt every concrete detail to the course's actual language/stack:

- **Runnable-in-browser languages** (HTML/CSS/JS): use the shared shell's live, editable sandbox iframe where it exists.
- **Not-runnable-in-browser languages** (TypeScript, Angular, and all **backend** languages such as Java, Python, Go, C#, SQL, shell): the browser cannot execute them. Use **static code blocks next to a simulated output panel** — the `.io` / `pre.code` / `.out` two-column pattern used by `angular-core-deep-dive.html` and `typescript.html`. Trace the code by hand and show the exact console/stdout it would produce; for non-deterministic output (e.g. `HashSet`/`HashMap` iteration order) say so.
- **"Run locally" commands must match the stack**, not a hardcoded web toolchain. Examples: Java → `javac X.java && java X` or `jshell`, Maven/Gradle for projects; Python → `python x.py`; Node → `node x.js`; Angular → `ng serve`. Never emit `npm`/`ng` for a non-JS course.
- **Standalone vs shared shell**: a non-frontend guide is typically a **standalone page** (its own inline CSS/JS, a **unique** theme `localStorage` key) modelled on `angular-core-deep-dive.html`, because the shared front-end shell's live-iframe machinery does not apply. Reuse that page's CSS/JS design system (theme toggle, sidebar TOC + search, scroll-spy, syntax highlighter) and add the course language to the highlighter's keyword map.
- **Syntax highlighting**: extend the highlighter with the target language's keywords; keep the escaping rules below.

## Instructions (must-follow)

- **Read everything** in the transcript. Preserve every technical idea, sequence, and example intent from each lecture and section — do not drop information.

- **Rewrite content**: Do not copy transcript wording; rewrite in original professional English that is easier to read and faster to learn from. Keep meaning and nuance identical.

- **Output format**: A single self-contained HTML5 document (one file) with CSS and inline SVG diagrams (no external dependencies except optional links to a GitHub repo you may be given). The HTML must render well in modern browsers.

- **Structure**: Keep the same Sections and Lectures hierarchy. For each Section create a top-level heading and for each Lecture create a subheading. Include a short 1–2 sentence learning objective for each lecture.

- **Conciseness**: Reduce words where possible without losing content — prefer bullet lists, short paragraphs, and labeled code blocks. When summarizing, keep every technical point (no information loss).

- **Tone & audience**: Professional, clear, explanatory. Target the audience implied by the course — e.g. intermediate web developers for a front-end course, or intermediate programmers comfortable with core language syntax for a backend course (Java, Python, etc.). State any assumed prerequisites in a short context box rather than assuming a web background.

- **Effort level**: High — generate careful, accurate code and explanations; flag any place you are unsure and request the missing detail.

## Page Layout & Visual Design

### Navigation

- Sticky left or top table-of-contents linking to sections and lectures
- Small search box (client-side JS) that filters lecture headings

### For Each Lecture, Include:

- **Learning objective** (1–2 sentences)
- **Explanatory text** (concise, rewritten, professional)
- **Key points** as a short bullet list (2–6 bullets)
- **Example(s)** with code and output rendered side-by-side (in the course's language, not necessarily web)
  - Two-column layout: code on left with syntax highlighting, output on right. For browser-runnable languages the output can be a live rendering; for everything else (TypeScript, Angular, and all backend languages) show a **simulated** console/stdout panel traced by hand from the code
  - Include a "Run locally" snippet with exact commands **for the course's toolchain** (e.g. `javac`/`java`, `python`, `go run`, `mvn`, `ng serve`, `node`) and a link to the relevant GitHub branch if one is available
  
- **GitHub examples**: When the transcript includes a specific example and a GitHub repo/branch exists, pull that example as-is then refactor/improve it (better variable names, comments, smaller focused demo). Include both the original branch reference and the improved snippet. If you cannot access the repo, reimplement an equivalent example and mark it as reimplemented.

- **Visual aids**: Where concepts benefit from diagrams (component tree, change detection flow, data flow, lifecycle hooks, zones, dependency injection graph), generate simple inline SVG diagrams with labels and a short caption. Provide alt text for each diagram.

- **Extra learning aids**:
  - "Common pitfalls" box
  - Short "Cheat-sheet" code snippet (one small copy/paste block with the most important commands/APIs)

## Copyright & Paraphrase Constraints

- Do **not** reproduce the transcript verbatim
- Produce a new text that conveys the same concepts and instructions in different words
- If a sentence in the transcript is short and purely factual (like method names, signatures, CLI commands), you may reuse the exact code or commands but not long prose sentences
- Mark reused code with a small footnote "source: example reimplemented" or the GitHub branch reference
- If the transcript references copyrighted examples you do not have explicit rights to reproduce, re-implement functionally equivalent examples and note "reimplemented for clarity"

## Code & Repo Usage Rules

### When Given a GitHub Repository URL and Branches:

For each lecture that references example code, look for matching files/branches. When found:

- Cite branch name and file path in a small metadata line above the example
- Include both the minimal runnable example and an improved/annotated version
- Include exact clone/checkout (or download) commands in the "Run locally" area
- Use safe, minimal dependencies pinned to a current stable version; include the relevant manifest snippet for the stack (`package.json`, `pom.xml`/`build.gradle`, `requirements.txt`, `go.mod`, …)
- Provide the exact build/run commands for that toolchain (e.g. `ng serve`, `node x.js`, `javac X.java && java X`, `mvn test`, `python x.py`)
- Include a short verification step (expected console output, exit code, or screenshot alt text) so a reader can confirm the example works

### When Given Attached Resource Files (no GitHub repo):

Courses often ship example code as **attached files** bundled with the transcript (e.g. a `Resources/` folder of `.java`, `.py`, `.sql` files) instead of a Git repo. Treat these the same way:

- Read each file and map it to the lecture it illustrates (often the folder/section structure mirrors the transcript's sections and lectures).
- Show an improved, focused version (better names, comments, smaller demo) and, where useful, note it was reimplemented from the attached example.
- These resource files are **copyrighted course content** — paraphrase surrounding prose and keep the raw files out of version control if the repo gitignores them.

## Formatting, Accessibility, and Export

- Use semantic HTML (header, main, nav, article, code, pre, figure, figcaption)
- Ensure keyboard accessible navigation
- Include aria labels where appropriate
- Provide a downloadable ZIP link instruction at the top that bundles the examples and the HTML (if you can produce files). If not, provide a guide to create the ZIP locally using the provided repo/commands
- Add printable CSS so the page prints to a readable two-column handout

## Quality Improvements & Additions

- **Background context**: Where the transcript is thin on background, add short context boxes with links to authoritative docs (Angular official docs) and one-line explanations for prerequisites. If you add external links, use descriptive link text and do not copy large amounts from external sources.

- **Advanced subsections**: Add one "Advanced" subsection per lecture with optional deeper reading or a more complex variant of the example (clearly labeled).

- **Quiz questions**: Add short quiz questions (3 MCQs or 1–2 short tasks) for each section to help active recall.

## Output Requirements

- **Primary deliverable**: One complete HTML file printed to stdout in your response. The file should include all sections and a few example lectures fully implemented as a sample. If the full transcript is large, at minimum produce a full template + first two sections completely rendered and indicate you can continue on confirmation.

- **JSON manifest** (after the HTML file): Concise listing of:
  - Sections count
  - Lectures per section
  - Examples included
  - Repo branches used
  - Any uncertainties or missing details

- **Inline citations/comments**: Use small footnote-style notes inside the HTML (non-intrusive) to indicate origin where you used the GitHub repo or when you reimplemented an example.

## Error Handling & Follow-up

- If any lecture references missing code or ambiguous parts, list those items in the JSON manifest and ask for the specific file path or clear text excerpt
- If code examples require secrets or private APIs, replace those pieces with placeholders and instructions to the user on how to supply credentials locally

## Example Few-Shot Guidance

> **Note:** the examples below are **illustrative samples only** (drawn from a web/Angular course). They are not a fixed script — add to them, improve them, and above all **translate the same treatment to the course's actual technology**. A backend example is included to make that explicit.

### ✓ Good Example 1 (frontend)
"Lecture on lifecycle hooks — produce a 2-column demo showing AppComponent toggling a child component; left: code with ngOnInit/ngOnDestroy; right: rendered view and console logs. Include a small SVG lifecycle timeline."

### ✓ Good Example 2 (frontend)
"Dependency Injection — show a service providedIn: 'root' vs component provider; left: minimal service + two consumers; right: DOM showing injected values and a diagram explaining provider scope."

### ✓ Good Example 3 (backend — Java)
"Lecture on HashMap internals — left: a focused `HashMapDemo` putting/getting a few keys with a custom `hashCode`; right: a **simulated** console showing the printed map and lookups. Add an inline SVG of buckets + linked entries (and treeification past the threshold), and a Pitfall box on mutating a key after insertion. 'Run locally': `javac HashMapDemo.java && java HashMapDemo`."

### ✗ Bad Example
"Copy transcript paragraphs verbatim" — **forbid this.**
"Emit `npm`/`ng serve` for a Java or Python course" — **wrong toolchain; forbid this.**

## What Will Be Provided

- The full transcript (sections + lectures) as text
- Optionally, the GitHub repo URL and branches that contain the course examples

## Final Notes

- Be literal and comprehensive
- If the transcript is very long, produce the full HTML but prioritize fidelity and accuracy over extreme brevity
- Where tradeoffs are needed, preserve technical detail and compress prose only
- If you cannot fetch a GitHub repo, clearly mark examples reimplemented and request the repo link
