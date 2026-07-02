# Tasks: Context-Aware Callout Delete Confirmation

**Input**: Design documents from `/specs/114-callout-delete-context/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/crd-delete-dialog.ts, quickstart.md

**Tests**: Included — the plan calls for unit tests (pure mapper), a component render test, and the existing i18n parity test. Test tasks are interleaved within each story.

**Organization**: Grouped by user story. US1 (list contents) is the MVP. US2 (scope button) and US3 (empty callouts) are thin refinements layered on the same dialog.

## Path Conventions

Single web-frontend project. CRD presentational layer under `src/crd/`; integration glue under `src/main/crdPages/space/callout/`; i18n under `src/crd/i18n/space/`. Tests co-located next to the file under test.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline; no new dependencies or codegen for this feature.

- [X] T001 Confirm green baseline before changes: run `pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic` and `pnpm lint`; confirm `src/main/crdPages/space/callout/dataMappers/` exists (it does — used by `mapCalloutDetailsToFormValues`). No `pnpm codegen` is required for this feature (Option A uses cache-only fields).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared building blocks every story depends on: the plain-TS view-model type, the `ConfirmationDialog` body slot, and all i18n keys.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create the plain-TS view-model types in `src/crd/components/dialogs/calloutDeletionSummary.types.ts` — `CalloutRichContentKind`, `DeletionLinkItem`, `CalloutDeletionSummaryModel` (exact shapes from `specs/114-callout-delete-context/contracts/crd-delete-dialog.ts`; the `…Model` suffix avoids colliding with the `CalloutDeletionSummary` component, which `DeleteCalloutDialog.tsx` imports alongside the type). No GraphQL types; plain TypeScript only (defined in CRD so both the mapper in `src/main` and the CRD components can import it).
- [X] T003 [P] Extend `src/crd/components/dialogs/ConfirmationDialog.tsx`: add optional `children?: ReactNode` to `ConfirmationDialogConfirmProps` and render it beneath `<AlertDialogDescription>` in the confirm-variant branch only. Leave the discard variant untouched and keep all existing callers working (no children → no visual change).
- [X] T004 Update the `deleteCallout` keys in `src/crd/i18n/space/space.en.json`: **reword the existing `description` to be neutral** — "“{{title}}” will be deleted permanently. This cannot be undone." — dropping the static "along with its contributions and comments" claim, so the empty-callout dialog doesn't overstate scope (FR-008/US3; the content list carries the scope). Add the new keys: `confirmAll` ("Delete callout and all contents"), `contentsIntro` ("This will permanently delete:"), `contributions_one`/`contributions_other`, `including`, `contentType.{whiteboard,memo,poll,mediaGallery,document}`, `moreLinks_one`/`moreLinks_other`, `comments_one`/`comments_other`, `attachmentsNote` ("including attached files and links"). Keep existing `title`/`confirm`/`saveFailed` unchanged.
- [X] T005 [P] Mirror the exact same `deleteCallout` keys (translated, **including the reworded `description`**) into `src/crd/i18n/space/space.nl.json` (respect the Dutch do-not-translate glossary: keep "Post/Posts" for contributions/callout terms).
- [X] T006 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.es.json`.
- [X] T007 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.bg.json`.
- [X] T008 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.de.json`.
- [X] T009 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.fr.json`.
- [X] T010 Run `pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic` and confirm key parity across all six locale files is green.

**Checkpoint**: Types, dialog body slot, and localized copy exist — story implementation can begin.

---

## Phase 3: User Story 1 - See what will be lost before deleting a callout with content (Priority: P1) 🎯 MVP

**Goal**: The delete confirmation for a content-bearing callout renders a variable-height body summarizing what will be permanently removed (contribution count, rich-content note, named links, comment count), built entirely from cached data.

**Independent Test**: Open the delete confirmation on a callout that contains contributions/links/a whiteboard and verify the dialog lists that content, distinct from the empty-callout prompt, with no extra GraphQL request on open.

### Tests for User Story 1

- [X] T011 [P] [US1] Write unit tests for the mapper in `src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts`: covers contribution count, each rich-content kind precedence (whiteboard > memo > poll > mediaGallery > document), framing link + references → `links` with URL fallback and empty-label filtering, `commentCount` from `comments.messagesCount`, and the all-empty callout → zero/empty summary.
- [X] T012 [P] [US1] Write render tests for the summary component in `src/crd/components/dialogs/CalloutDeletionSummary.test.tsx`: renders the `deleteCallout.contentsIntro` lead-in line whenever the summary has deletable content, pluralized contribution count with the "including attached files and links" note (`deleteCallout.attachmentsNote`, shown iff `contributionCount > 0` — FR-007), "including a whiteboard" note, links list, cap at 3 with an "and N more links" line, comment count, and long link labels carrying the `truncate` class. (Empty-state assertion lands in US3/T018.)

### Implementation for User Story 1

- [X] T013 [US1] Implement the pure mapper `mapCalloutToDeletionSummary(callout: CalloutDetailsModelExtended): CalloutDeletionSummaryModel` in `src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.ts` following data-model.md mapping rules (cache-only; optional-chained; no `__typename` branching; no fetch/mutation). Import the type from `@/crd/components/dialogs/calloutDeletionSummary.types`.
- [X] T014 [US1] Implement `src/crd/components/dialogs/CalloutDeletionSummary.tsx` — presentational `<ul role="list">` rendering counts, rich-content note, and named links (cap `listCap = 3`, "and N more links" overflow), preceded by the `deleteCallout.contentsIntro` lead-in line ("This will permanently delete:") whenever the summary has deletable content. When `contributionCount > 0`, render the `deleteCallout.attachmentsNote` general note ("including attached files and links") alongside the contribution count (FR-007). Truncate long link labels (Tailwind `truncate`) so the dialog stays readable and actions remain reachable. Copy via `useTranslation('crd-space')`, i18next plural forms. No domain/apollo/router imports; Tailwind + semantic typography tokens only; `lucide-react` icons `aria-hidden`.
- [X] T015 [US1] Update `src/crd/components/dialogs/DeleteCalloutDialog.tsx`: accept optional `content?: CalloutDeletionSummaryModel`; when `content` has deletable content, render `<CalloutDeletionSummary summary={content} />` into the `ConfirmationDialog` `children` slot. Keep `calloutTitle` in the heading/description (description now uses the neutral T004 wording). (Confirm-label logic is US2.)
- [X] T016 [US1] Wire it up in `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx`: compute `const deletionSummary = mapCalloutToDeletionSummary(callout);` and pass `content={deletionSummary}` to the existing `<DeleteCalloutDialog>`. No change to the `handleDeleteConfirm` mutation path.

**Checkpoint**: Delete dialog now shows a content summary for content-bearing callouts; opening it triggers no extra network request.

---

## Phase 4: User Story 2 - Confirm button states the scope of the action (Priority: P1)

**Goal**: When the callout has content, the confirm button reads "Delete callout and all contents" instead of a generic "Delete".

**Independent Test**: Open the delete confirmation on a callout with content and verify the confirm button reads the scope-reflecting label; on an empty callout it stays "Delete".

### Implementation for User Story 2

- [X] T017 [US2] In `src/crd/components/dialogs/DeleteCalloutDialog.tsx`, derive `hasDeletableContent` from the summary (`contributionCount > 0 || richContent || links.length > 0 || commentCount > 0`) and choose `confirmLabel = t(hasDeletableContent ? 'deleteCallout.confirmAll' : 'deleteCallout.confirm')`. Extend `CalloutDeletionSummary.test.tsx` (or add to the dialog test) to assert the label switches with/without content.

**Checkpoint**: Confirm button scope matches the actual deletion effect.

---

## Phase 5: User Story 3 - Empty callouts keep a simple confirmation (Priority: P2)

**Goal**: A callout with no contributions, links, rich content, or comments shows a concise confirmation with no content list.

**Independent Test**: Open the delete confirmation on an empty callout and verify no content list renders and the copy/button remain appropriate for deleting only the callout.

### Implementation for User Story 3

- [X] T018 [US3] Ensure the empty path renders nothing extra: in `src/crd/components/dialogs/DeleteCalloutDialog.tsx` omit the `children` body entirely when `!hasDeletableContent` (do not render an empty `<ul>`), so the dialog collapses to the concise form. Add an assertion to `src/crd/components/dialogs/CalloutDeletionSummary.test.tsx` that an all-empty summary renders no list items (and/or the dialog renders no body).

**Checkpoint**: All three stories work independently; dialog size visibly varies between empty and content-bearing callouts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, accessibility, and full-suite green.

- [X] T019 [P] Accessibility pass on `CalloutDeletionSummary.tsx` and the extended `ConfirmationDialog.tsx`: content list is `<ul role="list">`/`<li>`, decorative icons `aria-hidden`, destructive confirm keyboard-reachable and focus-visible, no color-only signaling (WCAG 2.1 AA).
- [X] T020 [P] Run the targeted tests: `pnpm vitest run src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts src/crd/components/dialogs/CalloutDeletionSummary.test.tsx src/crd/i18n/space/space.parity.test.ts --reporter=basic`.
- [X] T021 Run `pnpm lint` and `pnpm vitest run` (full suite) and resolve any TypeScript/Biome/ESLint or test failures.
- [ ] T022 Manual verification per `specs/114-callout-delete-context/quickstart.md` (content/whiteboard/links/comments/empty/cancel/failure/language cases) and confirm via the Network tab that opening the delete dialog issues **zero** extra GraphQL requests. Verify the layout-variation criterion (SC-006): compare the dialog across an empty callout, a single-item callout, and a many-item callout — the body/size must visibly differ so the confirmation can't be dismissed from muscle memory; record the design-review outcome.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Stories (Phases 3–5)** → **Polish (Phase 6)**.
- **Phase 2 blocks everything**: T002 (types) blocks T013/T014/T015; T003 (dialog slot) blocks T015; T004–T009 (i18n) block T014/T017; T010 verifies i18n.
- **US1 (Phase 3)** is the MVP and is self-contained once Phase 2 is done. **US2 (T017)** and **US3 (T018)** both edit `DeleteCalloutDialog.tsx` after US1's T015 — run them sequentially (no `[P]` among T015 → T017 → T018).
- Within Phase 2, T002–T009 are `[P]` (distinct files); T010 depends on T004–T009.
- Within Phase 3, tests T011/T012 are `[P]` (distinct files) and can be written first; T013 & T014 are `[P]` (distinct files); T015 depends on T003+T014; T016 depends on T013+T015.

## Parallel Execution Examples

- **Phase 2 kickoff**: T002, T003, and the six i18n tasks T004…T009 can proceed in parallel (all distinct files); then T010.
- **Phase 3 start**: T011 and T012 (tests) in parallel; then T013 and T014 in parallel; then T015; then T016.
- **Phase 6**: T019 and T020 in parallel; then T021; then T022.

## Implementation Strategy

- **MVP = Phase 1 + Phase 2 + Phase 3 (US1)** — delivers the context-aware content body, the headline value of the feature.
- **Increment 2 = Phase 4 (US2)** — one-line scope-aware confirm label.
- **Increment 3 = Phase 5 (US3)** — concise empty-callout form.
- **Finish = Phase 6** — a11y + full green + manual/network verification.

## Story → Task Map

| Story | Priority | Tasks |
|---|---|---|
| US1 — list contents | P1 (MVP) | T011, T012, T013, T014, T015, T016 |
| US2 — scope button | P1 | T017 |
| US3 — empty callouts | P2 | T018 |
| Foundational (shared) | — | T002–T010 |
| Setup | — | T001 |
| Polish | — | T019–T022 |
