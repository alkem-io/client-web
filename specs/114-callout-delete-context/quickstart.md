# Quickstart: Context-Aware Callout Delete Confirmation

**Feature**: 114-callout-delete-context | **Date**: 2026-07-02

How to implement, run, and verify this feature. Assumes the repo conventions in `CLAUDE.md` and `src/crd/CLAUDE.md`.

## What changes (5 touch points)

1. **`src/crd/components/dialogs/ConfirmationDialog.tsx`** — add optional `children?: ReactNode` to the confirm variant; render it under `<AlertDialogDescription>`. Discard variant untouched. Existing callers unaffected.
2. **`src/crd/components/dialogs/CalloutDeletionSummary.tsx`** (NEW) — presentational content list (`<ul role="list">`) that renders the `contentsIntro` lead-in, counts, "and N more", rich-content note, and named links from a plain-TS `CalloutDeletionSummaryModel` (types in `calloutDeletionSummary.types.ts`; the `…Model` suffix avoids colliding with this component's name). Copy from `useTranslation('crd-space')`, plural-aware.
3. **`src/crd/components/dialogs/DeleteCalloutDialog.tsx`** — accept optional `content: CalloutDeletionSummaryModel`; when it has deletable content, render `CalloutDeletionSummary` in the dialog body and use `deleteCallout.confirmAll`; otherwise keep the concise form + `deleteCallout.confirm`.
4. **`src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.ts`** (NEW) — pure `CalloutDetailsModelExtended → CalloutDeletionSummaryModel` (see data-model.md mapping rules). Cache-only, no fetch.
5. **`src/crd/i18n/space/space.<lang>.json`** (×6) — add the `deleteCallout.*` keys from the contract and reword the existing `description` to the neutral form (no contributions/comments claim), key parity across en/nl/es/bg/de/fr.

Plus wiring in **`CalloutSettingsConnector.tsx`**: `const deletionSummary = mapCalloutToDeletionSummary(callout);` then pass `content={deletionSummary}` to `<DeleteCalloutDialog>`.

## Implementation order

1. Add i18n keys (all six files) → keeps `space.parity.test.ts` green as you go.
2. Add the pure mapper + its unit test.
3. Extend `ConfirmationDialog` with the body slot.
4. Build `CalloutDeletionSummary` + its render test.
5. Update `DeleteCalloutDialog` (content prop + confirm-label logic).
6. Wire the mapper into `CalloutSettingsConnector`.

## Commands

```bash
pnpm install                 # if needed
pnpm vitest run src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts --reporter=basic
pnpm vitest run src/crd/components/dialogs/CalloutDeletionSummary.test.tsx --reporter=basic
pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic
pnpm lint                    # TypeScript + Biome + ESLint (react-compiler rule)
pnpm vitest run              # full suite before staging
```

> **No `pnpm codegen`** — this feature adds no `.graphql` changes (Option A uses cache-only fields).

## Manual verification

Run `pnpm start` (backend at `localhost:3000`) and, as a user who can delete a callout, open the callout 3-dots menu → Delete:

| Case | Expectation |
|---|---|
| Callout with several posts | Body shows the "This will permanently delete:" intro, "N contributions" + attachments note; confirm button reads "Delete callout and all contents". |
| Callout whose body is a whiteboard | Body shows "including a whiteboard". |
| Callout with references/links | Links listed (≤3), "and N more links" beyond the cap. |
| Callout with comments | "and N comments" line. |
| Empty callout | No content list; neutral description mentions only the callout itself (no contributions/comments claim); confirm button reads "Delete". |
| Cancel | Nothing deleted. |
| Delete fails | Error toast (`deleteCallout.saveFailed`); callout not silently lost. |
| Switch language | All new strings localized; singular vs plural correct. |
| Layout variation (SC-006) | Compare empty vs. single-item vs. many-item callouts side by side: the dialog body/size visibly differs, so the confirmation can't be dismissed from muscle memory. Record the design-review outcome. |

## Guardrails (must hold)

- Opening the dialog issues **zero** extra GraphQL requests (verify Network tab).
- `src/crd/` files import no `@/domain/*`, `@/core/apollo/*`, `@apollo/client`, `react-router-dom`, `@mui/*`, `@emotion/*`.
- Content list uses `<ul role="list">` / `<li>`; destructive confirm reachable by keyboard; icon-only affordances have `aria-label`.
- i18n key parity across all six locale files (parity test green).
- No `__typename` branching in the mapper — rich-content kind derives from framing body fields.

## Acceptance mapping

- Story 1 (list contents) → mapper + `CalloutDeletionSummary` render (cases above).
- Story 2 (scope button) → `confirmAll` label logic in `DeleteCalloutDialog`.
- Story 3 (empty callout) → body omitted + `confirm` label + neutral description.
- FR-011 / SC-005 → six-language keys + parity test.
- SC-006 (anti-muscle-memory layout variation) → manual "Layout variation" check above.
- Performance goal → no fetch on open (Network tab check).
