# Case Study — minimum Angular Deep Dive topics to read first

Which **post–Dependency Injection** sections of the *Angular Core Deep Dive* (sec-10 → sec-19) you
must read before implementing the [Restaurant Chain Management case study](../case-study-restaurant-design.html),
and which you can skip. Derived by cross-referencing each course subsection against the case study's
LLD §16 concept-to-file traceability matrix ([LLD.md](LLD.md)).

> Assumes you have already studied **up to and including Dependency Injection** (sec-1 → sec-9).

## Bottom line

The app leans hard on **Signals (sec-18)** and **Standalone (sec-16)**, plus **OnPush (sec-10)**, one
**custom pipe (sec-13)**, and basic **lifecycle (sec-11)**. It uses **@defer (sec-17)** and a sprinkle
of **i18n (sec-14)** as showcases. It uses **nothing** from **Modules (sec-12)**, **Elements (sec-15)**,
or **Conclusion (sec-19)**.

## Sections you can skip ENTIRELY (not used anywhere)

| Section | Why skippable |
|---|---|
| **sec-12 Modules in Depth** (12-01, 12-02) | App is standalone-only — no `NgModule`/feature modules. Folders + lazy routes replace them. |
| **sec-15 Elements in Depth** (15-01) | No embedding Angular in a non-Angular host; `createCustomElement` unused. |
| **sec-19 Conclusion & Bonus** (19-01, 19-02) | Wrap-up, not implementation topics. |

## Per-section: which subsections to READ vs SKIP

Legend: ✅ read (used) · 🔸 skim (background) · ⏭️ skip (not used)

### sec-10 Change Detection — *uses OnPush + zoneless*
- ✅ 10-02 OnPush · ✅ 10-03 OnPush + Observables (you feed the async pipe into OnPush)
- 🔸 10-01 Default CD — skim only, as background for OnPush
- ⏭️ 10-04 `@Attribute` decorator · ⏭️ 10-05 `ChangeDetectorRef` / `markForCheck` (signals auto-mark)

### sec-11 Lifecycle Hooks — *uses ngOnInit, ngOnDestroy, ngAfterViewInit*
- ✅ 11-01 OnInit/OnDestroy · ✅ 11-05 Complete Overview (covers AfterViewInit for the dialog focus)
- ⏭️ 11-02 OnChanges (replaced by signal inputs) · ⏭️ 11-03 AfterContentChecked · ⏭️ 11-04 AfterViewChecked

### sec-13 Pipes — *uses one pure custom pipe*
- ✅ 13-01 Custom Pipes step-by-step (the `truncate` pipe)
- ⏭️ 13-02 Impure Pipes (kept pure; use computed signals instead)

### sec-14 i18n — *optional; only an `i18n` attribute + one ICU plural*
- ✅ 14-01 Intro / `i18n` attribute · ✅ 14-03 Pluralization (the cart's `{count, plural, …}`)
- ⏭️ 14-02 Unique IDs · ⏭️ 14-04 Alternative / select ICU · ⏭️ 14-05 CLI translated builds / `extract-i18n`
- *If you want the absolute minimum, drop i18n entirely — it's decorative here.*

### sec-16 Standalone — *core; the "migration" framing is N/A for a greenfield app*
- ✅ 16-01 Intro · ✅ 16-02 Importing dependencies (standalone `imports:[…]`) · ✅ 16-04 Bootstrapping (`bootstrapApplication` + `appConfig`)
- ⏭️ 16-03 Removing unused modules (nothing to migrate from)

### sec-17 @defer — *used as a showcase in the Admin dashboard only*
- ✅ 17-02 How it works · ✅ 17-03 @placeholder · ✅ 17-04 @loading · ✅ 17-07 @error · ✅ 17-05 / 17-06 idle + timer + prefetch · ✅ 17-08 viewport · ✅ 17-09 interaction · ✅ 17-10 hover (17-01 intro = context)
- ⏭️ 17-11 Custom Triggers (built-ins are enough)
- *This is the most droppable "used" topic — it's concentrated in one panel. If minimizing, lazy-load via routes and skip most of sec-17.*

### sec-18 Signals — *the app's backbone; read the whole section*
- ✅ ALL 18-01 … 18-12 (signal, update/readonly, no-mutate arrays, computed, dependency tracking, effect, effect cleanup, signal data services, `input()`, avoid-OnChanges, input options required/alias/transform)
- ⏭️ nothing to skip
- ⚠️ Two-way **`model()`** and **`output()`** (used in the cart) are **not** in this deep-dive section — grab those from the main [angular.html](../angular.html) guide.

## Minimum read-list (in order)

1. **sec-16 Standalone** → 16-01, 16-02, 16-04
2. **sec-18 Signals** → whole section (+ `model()` / `output()` from angular.html)
3. **sec-10 Change Detection** → 10-02, 10-03 (skim 10-01)
4. **sec-13 Pipes** → 13-01
5. **sec-11 Lifecycle** → 11-01, 11-05
6. *(optional)* **sec-17 @defer** → 17-02 … 17-10 · **sec-14 i18n** → 14-01, 14-03

That's ~5 core sub-topics + 2 optional showcases. Everything in sec-12, sec-15, sec-19 and the ⏭️
lectures above you can skip and still build the case-study design.
