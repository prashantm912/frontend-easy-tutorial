# DevDocs — file manifest

Static, self-contained documentation site teaching HTML, CSS, JavaScript, TypeScript, and Angular
(basics → advanced). No CDN, no build step. Open `index.html` by double-clicking it.

| File | Purpose |
|------|---------|
| `index.html` | Landing / table of contents. Overview, "how to use", syllabus cards linking each tech page, live mini-playground, **two use-case maps** — `#use-case-employee-dashboard` and `#use-case-typed-employee` — each linking a use case's requirements to the page/anchor that teaches it. 8 sections. |
| `html.html` | HTML guide — **24 sections** (~2600 lines, 51 live examples). Core + dashboard sections, **+ deep gap-fill: data-tables, audio/video (+`<track>`), embedded-content (iframe sandbox/`object`), character-references, global-attributes (`contenteditable`/`inert`/`hidden`…), advanced-form-controls (`datalist`/`output`/`progress`/`meter` + Constraint Validation API), dialog-popover (`<dialog>`/Popover API), inline-svg, resource-loading (`defer`/`async`/`module`, `preload`/`prefetch`), drag-and-drop**. |
| `css.html` | CSS guide — **26 sections** (~2800 lines, 62 live examples). Core + dashboard sections, **+ deep gap-fill: values-and-units, typography (`@font-face`/variable fonts), colors-and-gradients (oklch/`color-mix`), sizing-object-fit, backgrounds-borders-shadows, overflow-and-scroll (scroll-snap), advanced-selectors-pseudos (`:has`/`:is`/`:where`/`::marker`…), css-nesting-scope (`&`/`@scope`), feature-and-advanced-media-queries (`@supports`/`prefers-*`), filters-blend-clip-mask, more-topics**. |
| `javascript.html` | JS guide — **27 sections** (~2700 lines, 56 live examples). Core + dashboard sections, **+ deep gap-fill: this-and-binding, prototypes-and-classes (`#private`/static/mixins), error-handling (custom errors/`cause`/`AggregateError`), iterators-and-generators (async generators), regular-expressions, object-model-immutability (descriptors/`freeze`), more-topics** (regex/proxy/observers/timers/URL/files/security pointers). |
| `typescript.html` | TS guide — **35 sections** (~2800 lines, 96 code-blocks + 13 runnable). Core + employee-flow sections, **+ deep gap-fill: classes-advanced (abstract/`implements`/parameter-props/`override`/polymorphic `this`), type-assertions-and-casting, utility-types-catalog, enums-deep, tuples-and-variadic, satisfies-and-const-context, modules-and-import-type, template-literal-types, type-level-programming (recursive conditional types), variance-and-advanced-generics (`in`/`out`), control-flow-narrowing, more-topics**. Source + simulated `tsc`/runtime output (no compiler bundled offline). |
| `angular.html` | Angular guide — **40 sections** (~2340 lines, 134 code+output pairs). Basics → advanced, Angular 17–22: introduction/why/setup, components, `@Input`/`@Output`, two-way binding, block control flow (`@if`/`@for`/`@switch`/`@let`), legacy structural directives, `ngClass`/`ngStyle`, `ng-container`, attribute & custom structural directives, `ng-template`/`ngTemplateOutlet`, ViewChild & content queries, content projection, view encapsulation, pipes, services, `HttpClient` + async pipe, dependency injection + `inject()`, change detection, lifecycle hooks, NgModules, standalone components, routing & guards, forms, RxJS, `@defer`, Signals, signal `input()`/`output()`/`model()`, Resource API, zoneless reactivity, SSR/hydration/i18n/Elements, testing. Static code + **side-by-side simulated `Output`** (no Angular compiler bundled offline) via the `.io-grid` layout. |
| `styles/site.css` | Shared docsite stylesheet — layout, two-column example grid, light/dark theme variables, syntax-token colors, responsive rules. UI only. |
| `scripts/site.js` | Shared docsite runtime — builds each example's live `iframe` (`srcdoc` = HTML+CSS+JS with an injected console panel), Run/Reset buttons, editor tabs, TOC filter, theme toggle, scroll-spy, regex syntax highlighter. UI only — not the JavaScript lessons. |
| `MANIFEST.md` | This file. |

## How the live examples work
Each `.example` = editable code on the left, sandboxed `<iframe>` preview on the right.
`site.js` reads the `textarea.code[data-lang]` editors, assembles a document, and sets
`iframe.srcdoc`. JS-only examples log to an injected console panel. Edit any code and
click **Run** (or `Ctrl/Cmd+Enter`); **Reset** restores the original.

## Note on structure
The build uses **separate pages per technology** (`html.html`, `css.html`, `javascript.html`,
`typescript.html`) per the spec's "each technology must be a separate HTML page" — not the
combined `javascript_typescript.html` mentioned once later in the same spec.
