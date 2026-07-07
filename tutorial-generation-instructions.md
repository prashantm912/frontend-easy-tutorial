# Tutorial Generation Instructions

## Purpose

Convert the provided Udemy Angular Core Deep Dive transcript (split into sections and lectures) into a complete, visually appealing, copyright-safe, learner-friendly HTML site that preserves all technical information but rewrites the text in original, concise, and professional language suitable for reading (not a transcript). Use the repository examples (if a GitHub URL / branches are provided) to include runnable code; otherwise reimplement equivalent, improved examples.

## Instructions (must-follow)

- **Read everything** in the transcript. Preserve every technical idea, sequence, and example intent from each lecture and section — do not drop information.

- **Rewrite content**: Do not copy transcript wording; rewrite in original professional English that is easier to read and faster to learn from. Keep meaning and nuance identical.

- **Output format**: A single self-contained HTML5 document (one file) with CSS and inline SVG diagrams (no external dependencies except optional links to a GitHub repo you may be given). The HTML must render well in modern browsers.

- **Structure**: Keep the same Sections and Lectures hierarchy. For each Section create a top-level heading and for each Lecture create a subheading. Include a short 1–2 sentence learning objective for each lecture.

- **Conciseness**: Reduce words where possible without losing content — prefer bullet lists, short paragraphs, and labeled code blocks. When summarizing, keep every technical point (no information loss).

- **Tone & audience**: Professional, clear, explanatory — target audience: intermediate web developers who know basic TypeScript, HTML, and CSS but want deep Angular knowledge.

- **Effort level**: High — generate careful, accurate code and explanations; flag any place you are unsure and request the missing detail.

## Page Layout & Visual Design

### Navigation

- Sticky left or top table-of-contents linking to sections and lectures
- Small search box (client-side JS) that filters lecture headings

### For Each Lecture, Include:

- **Learning objective** (1–2 sentences)
- **Explanatory text** (concise, rewritten, professional)
- **Key points** as a short bullet list (2–6 bullets)
- **Example(s)** with runnable code (TypeScript/HTML/CSS) and live output rendered side-by-side
  - Two-column layout: code on left with syntax highlighting, output (HTML rendering or textual console output) on right
  - Include a "Run locally" snippet with exact commands (npm commands) and a link to the relevant GitHub branch if available
  
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
- Include exact git clone and checkout commands in the "Run locally" area
- Use safe, minimal dependencies (Angular latest LTS), include package.json snippets
- Provide exact npm scripts to run a local demo (ng serve or node-based preview)
- Include a short test or verification step (e.g., expected console output or screenshot alt text) so a reader can confirm the example works

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

## Example Few-Shot Guidance (3 Examples)

### ✓ Good Example 1
"Lecture on lifecycle hooks — produce a 2-column demo showing AppComponent toggling a child component; left: code with ngOnInit/ngOnDestroy; right: rendered view and console logs. Include a small SVG lifecycle timeline."

### ✓ Good Example 2
"Dependency Injection — show a service providedIn: 'root' vs component provider; left: minimal service + two consumers; right: DOM showing injected values and a diagram explaining provider scope."

### ✗ Bad Example
"Copy transcript paragraphs verbatim" — **forbid this.**

## What Will Be Provided

- The full transcript (sections + lectures) as text
- Optionally, the GitHub repo URL and branches that contain the course examples

## Final Notes

- Be literal and comprehensive
- If the transcript is very long, produce the full HTML but prioritize fidelity and accuracy over extreme brevity
- Where tradeoffs are needed, preserve technical detail and compress prose only
- If you cannot fetch a GitHub repo, clearly mark examples reimplemented and request the repo link
