---
name: udemy-transcript-extractor
description: Use when the user wants to bulk-export transcripts / captions from a Udemy course they legitimately have access to (personal Udemy or Udemy Business). Runs a browser-console script against their already-logged-in session to download every lecture's captions as one text file. Covers courseId auto-detection, the org-subdomain 403 fix, httpOnly-token handling, and caption fallbacks.
---

# Udemy transcript extractor

Bulk-download the captions of a Udemy course the user has legitimate access to,
as a single `.txt` — no clicking through each lecture. The script lives at
`extract-transcripts.js` in this skill folder.

## Scope & ethics (state this to the user)

- Only for courses the user **legitimately has access to** (their own purchase or
  an employer's Udemy Business seat), for **personal study**.
- Uses the user's **existing logged-in browser session** — nothing is scraped
  anonymously and no login is automated.
- The output is the course's **copyrighted content**. Help the user clean,
  summarize, outline, or gap-check it, but **do not reproduce it verbatim** in
  your own responses, and don't help redistribute/publish it.

## Procedure

1. Ask the user to open the course in Udemy, **logged in**, on any lecture.
2. Have them open DevTools → **Console** (F12).
3. Paste the contents of `extract-transcripts.js` and press Enter.
4. Watch the console:
   - `courseId: N | origin: ...` then `curriculum items: ~130` then
     `Done: X/Y lectures had captions.` → success, a `.txt` downloads.
   - Some lectures showing `(no captions)` is normal (text-only / ebook / bonus
     lectures have no video → no captions).
5. Once they have the file, offer to **clean** (auto-captions run words together),
   **summarize** into a study outline, or **gap-check** it against their own notes
   or docs. Work from the file they provide; never reproduce it wholesale.

`COURSE_ID` defaults to `'auto'` (detected from the page). To target a specific
course, set it to the numeric id at the top of the script.

## Why the naive approach fails (troubleshooting from real runs)

| Symptom | Cause | Fix (already baked into the script) |
|---|---|---|
| `403 Forbidden` on every API call | Called `www.udemy.com` but the user is on a **Business org subdomain** (e.g. `company.udemy.com`). Udemy API is same-origin. | Call the API on `location.origin`, not a hardcoded host. |
| `token found: false` | The `access_token` cookie is **httpOnly** — JS cannot read it. | Don't try to read the token. Use `fetch(..., { credentials: 'include' })` so the browser attaches the session automatically. |
| `404` on `users/me/subscribed-courses/{id}/curriculum-items/` | Wrong endpoint. | Use `courses/{id}/subscriber-curriculum-items/` on the org origin. |
| `403` even with the session cookie | Missing the `X-Requested-With: XMLHttpRequest` header the SPA sends. | Header is included. |
| `Course id not found` via slug lookup | Subscribed-courses slug match is unreliable. | Detect from `document.querySelector('[data-module-args]')` → `moduleArgs.courseId`, with a regex fallback. |
| Captions missing on some lectures | Not returned inline on the curriculum asset. | Fall back to the per-lecture detail endpoint for captions. |

## Security note (always tell the user)

If the user ever pastes a "Copy as fetch" or their cookies to you, that blob
contains **live session tokens** (`access_token`, `ud_user_jwt`, `cf_clearance`,
`csrftoken`). Warn them to treat it as a secret and to **log out/in afterward to
rotate it**. The script itself needs none of this — prefer it over hand-copied
requests precisely so no secrets change hands.

## Adapting to other platforms

The same pattern generalizes: (1) detect the course/content id from an embedded
config attribute, (2) call the platform API on `location.origin` with
`credentials: 'include'` and whatever `X-Requested-With`/app header the SPA uses,
(3) page the curriculum, (4) fetch each caption/VTT and strip cues, (5) blob-download.
Coursera, Pluralsight, and LinkedIn Learning expose similar caption/VTT endpoints.
