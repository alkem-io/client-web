# Quickstart: Context-Aware Callout Delete Confirmation

**Feature**: 114-callout-delete-context | **Date**: 2026-07-02

How to implement, run, and verify this feature. Assumes the repo conventions in `CLAUDE.md` and `src/crd/CLAUDE.md`.

## What changes (7 touch points)

1. **`src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql`** — extend the `CalloutDetails` fragment's `contributions` selection with title + description stubs: `post { id profile { id displayName description } }`, `whiteboard { … }`, `memo { … }`, `collaboraDocument { … }` (`link` is already selected). Then run **`pnpm codegen`** (backend at `localhost:3000` required) and commit the generated output.
2. **`src/domain/collaboration/callout/models/CalloutDetailsModel.ts`** — widen the `contributions` item type to carry the titled stubs (see data-model.md `CalloutContributionStub`). `useCalloutDetails` maps structurally — no mapping-site change.
3. **`src/crd/components/dialogs/ConfirmationDialog.tsx`** — add optional `children?: ReactNode` and `showCloseButton?: boolean` to the confirm variant; render children under `<AlertDialogDescription>` and an X close control (cancel path, `dialogs.close` aria-label) when enabled. Discard variant untouched. Existing callers unaffected.
4. **`src/crd/components/dialogs/CalloutDeletionSummary.tsx`** (NEW) — presentational summary: a semantic `<table>` headed by the scope sentence ("The whiteboard and 20 contributions will be deleted" / "20 contributions will be deleted" / "The whiteboard will be deleted"), a row per listed contribution (first 3 — bold title left, one-line `InlineMarkdown` description preview right), a comments row ("27 comments will be deleted"), a final `Paperclip` + attachments-note row, then named links as a `<ul>` below — all from a plain-TS `CalloutDeletionSummaryModel` (types in `calloutDeletionSummary.types.ts`; the `…Model` suffix avoids colliding with this component's name). Copy from `useTranslation('crd-space')`, plural-aware.
5. **`src/crd/components/dialogs/DeleteCalloutDialog.tsx`** — accept optional `content: CalloutDeletionSummaryModel`; when it has deletable content, render `CalloutDeletionSummary` in the dialog body and use `deleteCallout.confirmAll`; otherwise keep the concise form + `deleteCallout.confirm`.
6. **`src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.ts`** (NEW) — pure `CalloutDetailsModelExtended → CalloutDeletionSummaryModel` (see data-model.md mapping rules). No fetch — reads only what the standard load carries.
7. **`src/crd/i18n/space/space.<lang>.json`** (×6) — add the `deleteCallout.*` keys from the contract (table-header variants `headerContributions`/`headerRich`/`headerRichContributions`, reworded `comments_*` rows, `contentType` terms, `attachmentsNote`, `moreLinks_*`) and reword the existing `description` to the neutral form (no contributions/comments claim), key parity across en/nl/es/bg/de/fr.

Plus wiring in **`CalloutSettingsConnector.tsx`**: `const deletionSummary = mapCalloutToDeletionSummary(callout);` then pass `content={deletionSummary}` to `<DeleteCalloutDialog>`.

## Implementation order

1. Extend the `CalloutDetails` fragment + `pnpm codegen`; widen `CalloutDetailsModel.contributions`.
2. Add i18n keys (all six files) → keeps `space.parity.test.ts` green as you go.
3. Add the pure mapper + its unit test.
4. Extend `ConfirmationDialog` with the body slot.
5. Build `CalloutDeletionSummary` + its render test.
6. Update `DeleteCalloutDialog` (content prop + confirm-label logic).
7. Wire the mapper into `CalloutSettingsConnector`.

## Commands

```bash
pnpm install                 # if needed
pnpm codegen                 # after the fragment change (backend at localhost:3000/graphql)
pnpm vitest run src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts --reporter=basic
pnpm vitest run src/crd/components/dialogs/CalloutDeletionSummary.test.tsx --reporter=basic
pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic
pnpm lint                    # TypeScript + Biome + ESLint (react-compiler rule)
pnpm vitest run              # full suite before staging
```

> **No new query, no server change** — the fragment extension is additive and title-only; the data rides the callout's standard load, so the dialog still opens with zero extra requests.

## Manual verification

Run `pnpm start` (backend at `localhost:3000`) and, as a user who can delete a callout, open the callout 3-dots menu → Delete:

| Case | Expectation |
|---|---|
| Callout with several posts | Body shows a table headed "N contributions will be deleted" (exact total), rows with the first 3 titles in bold + one-line description previews (the 4th shown as a row when exactly 4 exist), an "N−3 contributions more..." row beyond that, and a final clip-icon row "including attached files and links"; confirm button reads "Delete callout and all contents". |
| Callout with mixed contributions (post + whiteboard + link) | Every listed contribution shows its title regardless of type, ordered by their sort order. |
| Callout whose body is a whiteboard | Table header reads "The whiteboard will be deleted" — or "The whiteboard and N contributions will be deleted" when contributions exist. |
| Callout with references/links | Links listed (≤3), "and N more links" beyond the cap. |
| Callout with comments | "N comments will be deleted" row, placed before the clip-icon attachments row. |
| Empty callout | No content list; neutral description mentions only the callout itself (no contributions/comments claim); confirm button reads "Delete". |
| Cancel / X in the title bar | Nothing deleted; the X closes via the cancel path. |
| Delete fails | Error toast (`deleteCallout.saveFailed`); callout not silently lost. |
| Switch language | All new strings localized; singular vs plural correct. |
| Select a contribution → trashcan in the preview title bar | Trash icon sits between share and close (only with Delete privilege); clicking opens a confirmation naming the contribution; confirm deletes it and returns to the grid; cancel keeps it. |
| Layout variation (SC-006) | Compare empty vs. single-item vs. many-item callouts side by side: the dialog body/size visibly differs, so the confirmation can't be dismissed from muscle memory. Record the design-review outcome. |

## Guardrails (must hold)

- Opening the dialog issues **zero** extra GraphQL requests (verify Network tab) — contribution titles arrive with the callout's standard load.
- Contribution create/delete mutations refetch `CalloutDetails` (not just the grid's `CalloutContributions`) — otherwise the summary's stubs go stale after adding a contribution; renames propagate via the normalized `Profile` entity (all rename mutations select `profile.displayName`).
- The fragment extension is title + description only (`profile { id displayName description }` stubs) — no content bodies, visuals, or author fields; `pnpm codegen` output committed in the same PR.
- `src/crd/` files import no `@/domain/*`, `@/core/apollo/*`, `@apollo/client`, `react-router-dom`, `@mui/*`, `@emotion/*`.
- Summary uses a semantic `<table>` (header + `<th scope="row">` titles) and a semantic `<ul>` / `<li>` links list; the `Paperclip` icon is `aria-hidden`; destructive confirm reachable by keyboard.
- i18n key parity across all six locale files (parity test green).
- No `__typename` branching in the mapper — contribution kind/title derive from the concrete entity stubs, rich-content kind from framing body fields.

## Acceptance mapping

- Story 1 (list contents) → fragment extension + mapper + `CalloutDeletionSummary` render (cases above).
- Story 2 (scope button) → `confirmAll` label logic in `DeleteCalloutDialog`.
- Story 3 (empty callout) → body omitted + `confirm` label + neutral description.
- FR-011 / SC-005 → six-language keys + parity test.
- SC-006 (anti-muscle-memory layout variation) → manual "Layout variation" check above.
- Performance goal → no fetch on open (Network tab check).
