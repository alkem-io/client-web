# Quickstart: CRD Search — Scope Switching

**Feature**: 093-crd-search-scope
**Date**: 2026-04-27

How to verify the feature works end-to-end on your machine. No new dependencies; no codegen.

---

## Prerequisites

- Node ≥ 22 / pnpm ≥ 10.17.1 (Volta-pinned to Node 24.14.0)
- Local Alkemio backend running at `http://localhost:3000` (the client expects `localhost:3000` via Traefik; the GraphQL endpoint is `localhost:4000/graphql` for codegen — not needed for this feature)
- At least two Spaces in your local data, each containing at least one Post whose title shares a substring (so you can verify scope-filtering removes results)

## One-time setup

```bash
pnpm install
```

## Run the dev server

```bash
pnpm start
```

App is served at `http://localhost:3001`. Sign in with any local user.

## Enable the CRD design system toggle

Open the browser console and run:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

After reload, CRD-migrated pages render via the new design system, including the search overlay.

---

## End-to-end verification

### Test 1 — Scope dropdown appears on a Space page (P1, Story 1)

1. Navigate to any Space, e.g. `http://localhost:3001/secondspace`.
2. Open the search overlay (header search icon, or `Cmd+K` / `Ctrl+K` if the shortcut is wired in your local build).
3. Verify the search bar shows a pill-shaped dropdown trigger with **"Search In: <Space's display name>"** (e.g. "Search In: second space"). The trigger has a globe icon and the primary-filled "scoped" styling.
4. Click the trigger; the menu reveals exactly **two** items: the Space's display name and **"Entire platform"** (NOT "All Spaces" — verify the rename).
5. Type `wb` and press Enter.
6. Verify all returned cards belong to the current Space (the "in: <space>" caption on each post card shows the same Space). No content from other Spaces appears in any category.

### Test 2 — Switch scope and re-query (P1, Story 1)

1. From Test 1's state, click the scope trigger and choose **"Entire platform"**.
2. Verify the trigger label switches to "Search In: Entire platform" and loses the primary-filled styling.
3. Verify the result list re-fetches (loading spinner briefly appears) and now includes posts/users/spaces from other Spaces — i.e. matching the screenshot the user attached when reporting the bug.
4. Click the trigger again and choose the Space's name.
5. Verify the results re-narrow to that Space without you re-typing or re-pressing Enter.

### Test 3 — No dropdown on non-Space pages (P1, Story 2)

1. Navigate to `http://localhost:3001/home` (or `/spaces`, your profile, an admin route).
2. Open the search overlay.
3. Verify the search bar has **no scope trigger** — only the input and the close button.
4. Type a term that exists in any Space and press Enter.
5. Verify results are platform-wide (no filtering by any single Space).
6. Click a Space result to navigate into a Space, close the overlay if it didn't auto-close, and re-open it from inside the Space.
7. Verify the dropdown now appears with the Space's name as the default.

### Test 4 — "Search the entire platform instead" recovery (P2, Story 3)

1. Inside a Space (Test 1's setup), type a term that has **no results in this Space** but does on the platform.
2. After the search executes, verify the no-results panel shows:
   - The standard "No results found for …" message
   - A button labelled exactly **"Search the entire platform instead"** (NOT "Search all Spaces instead" — verify the rename)
3. Click the button.
4. Verify the scope flips to "Entire platform" (trigger updates), the search re-runs, and results appear.

Negative cases:
- Switch scope to "Entire platform" and search for nonsense; verify the recovery button is **not** shown (already platform-wide).
- On a non-Space page, force a no-results state; verify the recovery button is **not** shown.

### Test 5 — State resets on overlay close (P3, Story 4)

1. On a Space, open the overlay, switch scope to "Entire platform".
2. Close the overlay.
3. Re-open it.
4. Verify the scope is back to the current Space (default).

### Test 6 — Subspace pages use the level-zero Space (Q1 clarification)

1. Navigate to a Subspace, e.g. `http://localhost:3001/parentspace/challenges/childsubspace`.
2. Open the overlay.
3. Verify the dropdown shows the **parent (level-zero) Space's** name, not the Subspace's name. Both options behave identically: "Search In: <parent Space name>" or "Search In: Entire platform".
4. Search for a term that exists only in the Subspace; verify it appears in the scoped results (because the level-zero scope includes the whole Space tree).

### Test 7 — Translation parity (FR-023, SC-008)

1. Switch the platform language via the footer dropdown to each of: nl, es, bg, de, fr.
2. On a Space page, open the overlay and verify:
   - The trigger says "Search In: …" (or its localized equivalent — interpolation inserts the option label).
   - The "Entire platform" option text is translated, not falling back to English.
   - The "Search the entire platform instead" recovery button is translated.
3. Verify the browser console shows no `i18next::translator: missingKey` warnings for any of the new keys (`search.scopeTriggerLabel`, `search.a11y.scopeTrigger`, the renamed `search.scopeAll`, the renamed `search.searchAllSpaces`).

### Test 8 — Accessibility (FR-018 to FR-022, SC-006)

1. Open the overlay on a Space page using only the keyboard.
2. Tab to the scope trigger; verify a visible focus ring appears.
3. Press Enter or Space; the menu opens.
4. Use Up/Down arrows to navigate items; press Enter to select; menu closes; results re-fetch.
5. With a screen reader (VoiceOver / NVDA), verify the trigger announces something like "Change search scope. Currently searching: <option>, button" — confirming the new `a11y.scopeTrigger` key is wired.
6. Verify the `aria-live` region inside the overlay announces "Searching…" → "{{n}} results found" / "No results found" as the scope flips.

### Test 9 — MUI fallback regression (SC-007)

1. Disable CRD: `localStorage.removeItem('alkemio-crd-enabled'); location.reload();`
2. On a Space, open the search bar.
3. Verify the **MUI** search dialog renders (not the CRD overlay) with its existing "Search In:" dropdown working exactly as before — no regression in the MUI path.

### Test 10 — Original bug fixed (Background gap #2)

This test is a regression check for the screenshot in the spec.

1. Re-enable CRD.
2. On `localhost:3001/secondspace`, open the overlay, type `wb`, press Enter.
3. Verify the result cards are **only** from the current Space. Specifically: a post titled "WB strange post (in: Welcome Space)" — visible in the original bug screenshot — must NOT appear if it doesn't belong to `secondspace`.
4. Switching the scope to "Entire platform" makes it appear again.

---

## Lint, types, tests

After implementation:

```bash
pnpm lint              # Biome + ESLint + tsc
pnpm vitest run        # All unit tests
```

Both must pass with zero new errors. Existing tests under `src/main/crdPages/search/` and `src/crd/components/search/` should continue to pass; if any test asserts the old "All Spaces" copy or the bare-label trigger, update those expectations alongside the implementation.

## What "done" looks like

- Searching "wb" on `/secondspace` returns only that Space's posts (no Welcome Space content).
- Trigger reads "Search In: …" with the dropdown reachable via keyboard.
- "Entire platform" is the canonical platform-wide label across all six languages.
- "Search the entire platform instead" recovery button works on Space-scoped no-results.
- MUI fallback path is untouched.
- `pnpm lint` and `pnpm vitest run` are green.
