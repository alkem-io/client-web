# Quickstart: CRD Comments Refinement

**Feature**: 089-crd-comments-refinement
**Date**: 2026-04-21

Developer setup, CRD feature-toggle steps, and the manual verification matrix tying acceptance scenarios (spec §User Scenarios) to tangible browser checks.

---

## 1. Prerequisites

- Node ≥22 and pnpm ≥10.17.1 (the repo's Volta pin targets Node 24.14.0).
- Alkemio backend reachable at `localhost:3000` (Traefik reverse proxy; see `CLAUDE.md` §Development Server).
- Install dependencies with `pnpm install` (lockfile is authoritative).

---

## 2. Start the dev server

```bash
pnpm start
```

Opens the SPA at `http://localhost:3001`. Wait for Vite to finish transforming modules (~5–10 s on warm cache).

---

## 3. Enable the CRD feature toggle

CRD pages are off by default. Enable them in the browser's DevTools console:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To disable later:

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

This toggle is read by `src/main/crdPages/useCrdEnabled.ts` and routes space pages through CRD in `TopLevelRoutes.tsx`.

---

## 4. Manual verification matrix

Complete the following checks on both **desktop** (≥768px viewport) and **mobile** (a phone-width browser window or DevTools device mode). Each check maps back to a user story / functional requirement in the spec.

### A. Timeline event detail modal

1. Navigate to any space → **Timeline** tab.
2. Click any calendar event to open the detail modal.

| # | Check | Maps to |
|---|-------|---------|
| A1 | The **comment input** is the first interactive element below the "Comments (N)" label, above the list. | US2, FR-001 |
| A2 | The comments list wrapper has a visible max height and an internal scroll bar when there are enough comments to overflow (~5+). | US1, FR-007, SC-001 |
| A3 | Event banner, title, date, location, and description remain visible without dialog-level scrolling even when the thread is long. | US1, SC-001 |
| A4 | No "Newest first / Oldest first" toggle appears in the comments header. | US3, FR-004, SC-004 |
| A5 | Post a new top-level comment → it appears at the **top** of the list within a second. | US3, FR-002, SC-003 |
| A6 | Post 6+ comments in total → the list scrolls internally; event body is not pushed. | US1, SC-001 |
| A7 | Click **Reply** on any top-level comment → inline input appears indented below it. Submit → the reply appears indented under the parent. | US4, FR-005 |
| A8 | The reply item **does not** show a Reply button. | US4, FR-005, SC-005 |
| A9 | The reply author can **Delete** their own reply. | FR-006 |
| A10 | Comment reactions (add + remove) still work. | FR-010, SC-006 |
| A11 | Delete your own top-level comment → it disappears (or shows "deleted" placeholder if it has replies). | FR-010 |
| A12 | Member without post permission (test with a second account or adjust via backend) sees the thread but no input. | FR-009 |

### B. Callout discussion modal

1. Navigate to a space callouts surface → open a discussion callout.

| # | Check | Maps to |
|---|-------|---------|
| B1 | Comment input appears **above** the thread in the dialog body flow (not pinned to a bottom footer). | US2, FR-001, SC-007 |
| B2 | The dialog has no sticky footer for the input. | FR-001, SC-007 |
| B3 | Scrolling the dialog scrolls the input + thread **together** (they are part of the same scroll flow). | FR-011 |
| B4 | Newest top-level comment is at the top; no sort toggle visible. | US3, FR-002, FR-004 |
| B5 | Post / reply / react / delete flows all succeed. | FR-010, SC-006 |
| B6 | Reply items show no Reply button. | US4, FR-005 |

### C. Cross-surface consistency

| # | Check | Maps to |
|---|-------|---------|
| C1 | Input placement is identical between A and B (both above the thread, directly under the header). | FR-011, SC-007 |
| C2 | Sort order is identical (newest-first top-level, oldest-first replies) on both surfaces. | FR-002, FR-003 |
| C3 | Reply affordance (button hidden on replies) is identical on both surfaces. | FR-005 |

### D. Edge cases

| # | Check | Maps to |
|---|-------|---------|
| D1 | Event with **0 comments**: input is visible; empty-state message appears where the list would be; no scroll bar. | Spec Edge Cases |
| D2 | Event with **1–4 comments**: no scroll bar; list sizes to content. | US1 AS3 |
| D3 | Deleted parent comment with surviving replies: a "Deleted" placeholder is shown with replies indented beneath it. | Spec Edge Cases |
| D4 | Mobile viewport (narrow window, e.g., 390×844): timeline event modal comments area still respects the bounded height; event body stays visible. | Spec Edge Cases |

---

## 5. Automated checks

From the repository root:

```bash
# TypeScript + Biome + ESLint
pnpm lint

# Vitest (jsdom) — non-interactive
pnpm vitest run
```

Expectations:
- `pnpm lint` completes clean. The two-prop removal on `CommentsContainerData` will surface as a TS error at the single call site in `useCrdRoomComments.tsx` if the call site is not updated in the same pass.
- `pnpm vitest run` completes with the existing ~595 tests passing.

No new tests are required — the feature does not introduce new logic branches, only simplifies existing rendering. The existing upstream domain tests (`usePostMessageMutations`, `useCommentReactionsMutations`, `useRemoveMessageOnRoomMutation`) continue to cover the mutation flows surfaced by the connector.

---

## 6. Rollback

If regressions are discovered, reverting this feature requires reverting the single PR — there are no schema changes, no data migrations, no config changes, and no cross-service dependencies to unwind. The CRD toggle remains off by default in deployed environments during the migration.
