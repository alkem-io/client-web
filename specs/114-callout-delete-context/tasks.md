# Tasks: Context-Aware Callout Delete Confirmation

**Input**: Design documents from `/specs/114-callout-delete-context/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/crd-delete-dialog.ts, quickstart.md

**Tests**: Included — the plan calls for unit tests (pure mapper), a component render test, and the existing i18n parity test. Test tasks are interleaved within each story.

**Organization**: Grouped by user story. US1 (list contents) is the MVP. US2 (scope button) and US3 (empty callouts) are thin refinements layered on the same dialog.

## Path Conventions

Single web-frontend project. Data layer under `src/domain/collaboration/` (fragment + model) with generated output in `src/core/apollo/generated/`; CRD presentational layer under `src/crd/`; integration glue under `src/main/crdPages/space/callout/`; i18n under `src/crd/i18n/space/`. Tests co-located next to the file under test.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline; no new dependencies for this feature.

- [X] T001 Confirm green baseline before changes: run `pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic` and `pnpm lint`; confirm `src/main/crdPages/space/callout/dataMappers/` exists (it does — used by `mapCalloutDetailsToFormValues`) and the backend is reachable at `localhost:3000/graphql` (required for T002's codegen).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared building blocks every story depends on: the data-layer title stubs (fragment + codegen + model), the plain-TS view-model type, the `ConfirmationDialog` body slot, and all i18n keys.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Extend the `CalloutDetails` fragment's `contributions` selection in `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql` with title + description stubs — `post { id profile { id displayName description } }`, `whiteboard { … }`, `memo { … }`, `collaboraDocument { … }` (`link` is already selected via `LinkDetailsWithAuthorization`) — then run `pnpm codegen` and commit the regenerated `src/core/apollo/generated/` output. Additive: titles + markdown descriptions only, no content bodies/visuals/authors, no new query.
- [X] T003 widen the `contributions` item type in `src/domain/collaboration/callout/models/CalloutDetailsModel.ts` to carry the titled stubs (data-model.md `CalloutContributionStub`): optional `post`/`whiteboard`/`memo`/`collaboraDocument` (`{ id; profile: { id; displayName } }`) and `link?: LinkDetails`. `useCalloutDetails` maps structurally — verify no mapping-site change is needed (`pnpm lint` type-checks it).
- [X] T004 [P] Create the plain-TS view-model types in `src/crd/components/dialogs/calloutDeletionSummary.types.ts` — `CalloutRichContentKind`, `DeletionListItem` (`id`, `label`, optional markdown `description`), `CalloutDeletionSummaryModel` with `contributionCount` (exact total), `contributions: DeletionListItem[]` (titled, sortOrder-sorted), `richContent?`, `links`, `commentCount` (exact shapes from `specs/114-callout-delete-context/contracts/crd-delete-dialog.ts`; the `…Model` suffix avoids colliding with the `CalloutDeletionSummary` component, which `DeleteCalloutDialog.tsx` imports alongside the type). No GraphQL types; plain TypeScript only.
- [X] T005 [P] Extend `src/crd/components/dialogs/ConfirmationDialog.tsx`: add optional `children?: ReactNode` and `showCloseButton?: boolean` to `ConfirmationDialogConfirmProps`; render children beneath `<AlertDialogDescription>` and, when `showCloseButton`, an X control in the title bar wired to the cancel path (aria-label `dialogs.close` — key added to all six locales) — confirm-variant branch only. Leave the discard variant untouched and keep all existing callers working (no children / no flag → no visual change).
- [X] T006 Update the `deleteCallout` keys in `src/crd/i18n/space/space.en.json`: **reword the existing `description` to be neutral** — "“{{title}}” will be deleted permanently. This cannot be undone." — dropping the static "along with its contributions and comments" claim, so the empty-callout dialog doesn't overstate scope (FR-008/US3; the content list carries the scope). Add the new keys: `confirmAll` ("Delete callout and all contents"), the table-header variants `headerContributions_one/_other` ("{{count}} contribution(s) will be deleted"), `headerRich` ("{{content}} will be deleted"), `headerRichContributions_one/_other` ("{{content}} and {{count}} contribution(s) will be deleted"), `contentType.{whiteboard,memo,poll,mediaGallery,document}` (definite-article terms, cased for each language's sentence position), `moreContributions_one/_other` ("{{count}} contribution(s) more..."), `comments_one`/`comments_other` ("{{count}} comment(s) will be deleted"), `attachmentsNote` ("including attached files and links"), `moreLinks_one`/`moreLinks_other`. Keep existing `title`/`confirm`/`saveFailed` unchanged.
- [X] T007 [P] Mirror the exact same `deleteCallout` keys (translated, **including the reworded `description`**) into `src/crd/i18n/space/space.nl.json` (respect the Dutch do-not-translate glossary: keep "Post/Posts" for contributions/callout terms).
- [X] T008 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.es.json`.
- [X] T009 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.bg.json`.
- [X] T010 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.de.json`.
- [X] T011 [P] Mirror the same `deleteCallout` keys (translated) into `src/crd/i18n/space/space.fr.json`.
- [X] T012 Run `pnpm vitest run src/crd/i18n/space/space.parity.test.ts --reporter=basic` and confirm key parity across all six locale files is green.

**Checkpoint**: Data-layer title stubs, types, dialog body slot, and localized copy exist — story implementation can begin.

---

## Phase 3: User Story 1 - See what will be lost before deleting a callout with content (Priority: P1) 🎯 MVP

**Goal**: The delete confirmation for a content-bearing callout renders a variable-height body summarizing what will be permanently removed — contribution count + the first 3 contribution titles + "and N more contributions", rich-content note, named links, comment count — built entirely from data that arrives with the callout's standard load.

**Independent Test**: Open the delete confirmation on a callout that contains contributions/links/a whiteboard and verify the dialog lists the contribution titles and the rest of the content, distinct from the empty-callout prompt, with no extra GraphQL request on open.

### Tests for User Story 1

- [X] T013 [P] [US1] Write unit tests for the mapper in `src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts`: covers exact contribution count; contribution titles + markdown description previews extracted from each entity stub (post/whiteboard/memo/collaboraDocument `profile.{displayName,description}`, link `profile.displayName` with URI fallback; empty descriptions → undefined), sorted by `sortOrder`, unnameable items filtered (count still authoritative); each rich-content kind precedence (whiteboard > memo > poll > mediaGallery > document); framing link + references → `links` with URL fallback and empty-label filtering; `commentCount` from `comments.messagesCount`; and the all-empty callout → zero/empty summary.
- [X] T014 [P] [US1] Write render tests for the summary component in `src/crd/components/dialogs/CalloutDeletionSummary.test.tsx`: asserts the table header variants ("20 contributions will be deleted"; "The whiteboard and 20 contributions will be deleted"; "The whiteboard will be deleted"), up to 3 contribution rows with bold `<th scope="row">` titles and one-line markdown description previews (markdown rendered, not raw), the 4th contribution shown as a row when exactly 4 exist vs. an "N−3 contributions more..." overflow row beyond that (unnameable items counted), the comments row ("27 comments will be deleted") placed before the final clip-icon attachments row (`deleteCallout.attachmentsNote`, shown iff `contributionCount > 0` — FR-007), a comments-only table with no header, links list capped at 3 with an "and N more links" line (and no table when only links exist), long titles/labels carrying the `truncate` class, and no lead-in line. (Empty-state assertion lands in US3/T020.)

### Implementation for User Story 1

- [X] T015 [US1] Implement the pure mapper `mapCalloutToDeletionSummary(callout: CalloutDetailsModelExtended): CalloutDeletionSummaryModel` in `src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.ts` following data-model.md mapping rules (reads only standard-load fields; sortOrder-sorted contribution titles; optional-chained; no `__typename` branching; no fetch/mutation). Import the type from `@/crd/components/dialogs/calloutDeletionSummary.types`.
- [X] T016 [US1] Implement `src/crd/components/dialogs/CalloutDeletionSummary.tsx` — a presentational semantic `<table>` (no lead-in line): `<thead>` scope sentence composed from `headerRichContributions`/`headerRich`/`headerContributions` + `contentType` terms; one row per contribution (first `listCap = 3`, or all 4 when exactly 4 exist, `<th scope="row">` bold title left + `InlineMarkdown clampLines={1}` description preview right); a `moreContributions` overflow row when more remain (remainder = `contributionCount − rows shown`); a `comments` row when `commentCount > 0`; a final `Paperclip` (`aria-hidden`) + `attachmentsNote` row when `contributionCount > 0` (FR-007); then named links as a `<ul>` below (cap 3, `moreLinks` overflow). Truncate long titles/labels (Tailwind `truncate`, `table-fixed`). Copy via `useTranslation('crd-space')`, i18next plural forms. No domain/apollo/router imports; Tailwind + semantic typography tokens only.
- [X] T017 [US1] Update `src/crd/components/dialogs/DeleteCalloutDialog.tsx`: accept optional `content?: CalloutDeletionSummaryModel`; when `content` has deletable content, render `<CalloutDeletionSummary summary={content} />` into the `ConfirmationDialog` `children` slot; pass `showCloseButton` so the title bar offers an X that closes without deleting. Keep `calloutTitle` in the heading/description (description uses the neutral T006 wording). (Confirm-label logic is US2.)
- [X] T018 [US1] Wire it up in `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx`: compute the summary via `mapCalloutToDeletionSummary(callout)` and pass it as `content` to the existing `<DeleteCalloutDialog>`. No change to the `handleDeleteConfirm` mutation path.

**Checkpoint**: Delete dialog now shows a content summary — contribution titles included — for content-bearing callouts; opening it triggers no extra network request.

---

## Phase 4: User Story 2 - Confirm button states the scope of the action (Priority: P1)

**Goal**: When the callout has content, the confirm button reads "Delete callout and all contents" instead of a generic "Delete".

**Independent Test**: Open the delete confirmation on a callout with content and verify the confirm button reads the scope-reflecting label; on an empty callout it stays "Delete".

### Implementation for User Story 2

- [X] T019 [US2] In `src/crd/components/dialogs/DeleteCalloutDialog.tsx`, derive `hasDeletableContent` from the summary (`contributionCount > 0 || richContent || links.length > 0 || commentCount > 0`) and choose `confirmLabel = t(hasDeletableContent ? 'deleteCallout.confirmAll' : 'deleteCallout.confirm')`. Extend `CalloutDeletionSummary.test.tsx` (or add to the dialog test) to assert the label switches with/without content.

**Checkpoint**: Confirm button scope matches the actual deletion effect.

---

## Phase 5: User Story 3 - Empty callouts keep a simple confirmation (Priority: P2)

**Goal**: A callout with no contributions, links, rich content, or comments shows a concise confirmation with no content list.

**Independent Test**: Open the delete confirmation on an empty callout and verify no content list renders and the copy/button remain appropriate for deleting only the callout.

### Implementation for User Story 3

- [X] T020 [US3] Ensure the empty path renders nothing extra: in `src/crd/components/dialogs/DeleteCalloutDialog.tsx` omit the `children` body entirely when `!hasDeletableContent` (do not render an empty `<ul>`), so the dialog collapses to the concise form. Add an assertion to `src/crd/components/dialogs/CalloutDeletionSummary.test.tsx` that an all-empty summary renders no list items (and/or the dialog renders no body).

**Checkpoint**: All three stories work independently; dialog size visibly varies between empty and content-bearing callouts.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, accessibility, and full-suite green.

- [X] T021 [P] Accessibility pass on `CalloutDeletionSummary.tsx` and the extended `ConfirmationDialog.tsx`: summary is a semantic `<table>` (header + `<th scope="row">` titles) with links as a semantic `<ul>`/`<li>` list, the `Paperclip` icon `aria-hidden`, destructive confirm keyboard-reachable and focus-visible, no color-only signaling (WCAG 2.1 AA).
- [X] T022 [P] Run the targeted tests: `pnpm vitest run src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts src/crd/components/dialogs/CalloutDeletionSummary.test.tsx src/crd/i18n/space/space.parity.test.ts --reporter=basic`.
- [X] T023 Run `pnpm lint` and `pnpm vitest run` (full suite) and resolve any TypeScript/Biome/ESLint or test failures.
- [ ] T024 Manual verification per `specs/114-callout-delete-context/quickstart.md` (contribution titles incl. mixed types/whiteboard/links/comments/empty/cancel/failure/language cases) and confirm via the Network tab that opening the delete dialog issues **zero** extra GraphQL requests. Verify the layout-variation criterion (SC-006): compare the dialog across an empty callout, a single-item callout, and a many-item callout — the body/size must visibly differ so the confirmation can't be dismissed from muscle memory; record the design-review outcome.

---

## Phase 7: User Story 4 - Delete a single contribution from its preview (Priority: P2)

**Goal**: The contribution-preview title bar (post + whiteboard) gains a trashcan icon before the close button; clicking it opens a confirmation dialog and, on confirm, deletes just that contribution.

**Independent Test**: Select a contribution in the callout dialog, click the trashcan, confirm — the contribution disappears and the preview closes; cancel leaves it untouched; users without the Delete privilege see no trashcan.

- [X] T025 [US4] Add `onDelete?: () => void` to `src/crd/components/callout/CalloutPostPreview.tsx` and `CalloutWhiteboardContributionPreview.tsx`: a ghost `Trash2` icon button (destructive hover tint, `aria-label` from `postPreview.delete`/`whiteboardPreview.delete`) rendered between `shareSlot` and the close button. The component only calls the prop — confirmation and mutation live in the consumer (Golden Rule #9).
- [X] T026 [US4] Add the i18n keys to all six `space.<lang>.json`: `postPreview.delete`, `whiteboardPreview.delete`, and the `deleteContribution` group (`title`, `description` with `{{title}}`, `confirm`, `saveFailed`) — key parity enforced by the parity test.
- [X] T027 [US4] Wire deletion in `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`: gate `onDelete` on `AuthorizationPrivilege.Delete` from the contribution wrapper's authorization; stage `{ id, title, kind }` in state; render a destructive `ConfirmationDialog` (mounted in both return branches) whose confirm runs `useDeleteContributionMutation` with `refetchQueries: ['CalloutDetails', 'CalloutContributions']`, clears the preview selection, and notifies `deleteContribution.saveFailed` on error.
- [X] T028 [P] [US4] Render tests in `CalloutPostPreview.test.tsx` / `CalloutWhiteboardContributionPreview.test.tsx`: trash button present and ordered before close when `onDelete` is wired, click forwards to the prop, button absent without `onDelete`.

**Checkpoint**: A single contribution can be deleted from its preview, confirmation-gated, permission-gated.

---

## Phase 8: Deletion propagation & success feedback (FR-017 / FR-018, Clarification 2026-07-08)

**Goal**: A confirmed deletion is reflected everywhere immediately — the callout vanishes from the board feed (and every other cached list) without a refresh, a green success toast confirms the deletion, and a detail dialog showing the deleted callout closes. Root cause of the stale board: `useDeleteCalloutMutation` only refetched the legacy `CalloutsOnCalloutsSetUsingClassification`, but since feature 007 the feed renders from `CalloutsListForFeed`, which nothing invalidated — and there is no server-side deletion subscription.

**Independent Test**: On the space board, delete a callout from the card's 3-dots menu → the card disappears without a refresh and a green toast appears. Repeat from inside the detail dialog → the dialog closes, card gone, toast shown.

- [X] T029 Fix cache propagation in `src/domain/collaboration/callout/utils/useCalloutManager.ts`: replace the stale `refetchQueries: ['CalloutsOnCalloutsSetUsingClassification']` with an `update` callback that `cache.evict`s the deleted `Callout` and runs `cache.gc()` — every cached list (feed, post index, classification, dashboards) drops the dangling reference on read, with no extra network round-trip.
- [X] T030 Success feedback in `src/main/crdPages/space/callout/CalloutSettingsConnector.tsx`: after a successful `deleteCallout`, notify `deleteCallout.success` with severity `success` (green), then invoke a new optional `onDeleted` prop. Add the `deleteCallout.success` key (with `{{title}}`) to all six `space.<lang>.json` — parity enforced by the parity test.
- [X] T031 Close the detail dialog on deletion: `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx` passes `onDeleted={() => onOpenChange(false)}` to its `CalloutSettingsConnector` (the feed card's instance needs nothing — the card unmounts when the feed list drops the id).

**Checkpoint**: Deleting a callout is visibly confirmed and fully propagated client-side; no stale card, no double-delete errors.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → **User Stories (Phases 3–5)** → **Polish (Phase 6)**.
- **Phase 2 blocks everything**: T002 (fragment+codegen) blocks T003; T003 (model) blocks T015; T004 (types) blocks T015/T016/T017; T005 (dialog slot) blocks T017; T006–T011 (i18n) block T016/T019; T012 verifies i18n.
- **US1 (Phase 3)** is the MVP and is self-contained once Phase 2 is done. **US2 (T019)** and **US3 (T020)** both edit `DeleteCalloutDialog.tsx` after US1's T017 — run them sequentially (no `[P]` among T017 → T019 → T020).
- Within Phase 2, T004–T011 are `[P]` (distinct files) once T002→T003 are done; T012 depends on T006–T011.
- Within Phase 3, tests T013/T014 are `[P]` (distinct files) and can be written first; T015 & T016 are `[P]` (distinct files); T017 depends on T005+T016; T018 depends on T015+T017.

## Parallel Execution Examples

- **Phase 2 kickoff**: T002 → T003 (data layer, sequential), while T004, T005, and the six i18n tasks T006…T011 proceed in parallel (all distinct files); then T012.
- **Phase 3 start**: T013 and T014 (tests) in parallel; then T015 and T016 in parallel; then T017; then T018.
- **Phase 6**: T021 and T022 in parallel; then T023; then T024.

## Implementation Strategy

- **MVP = Phase 1 + Phase 2 + Phase 3 (US1)** — delivers the context-aware content body with contribution titles, the headline value of the feature.
- **Increment 2 = Phase 4 (US2)** — one-line scope-aware confirm label.
- **Increment 3 = Phase 5 (US3)** — concise empty-callout form.
- **Finish = Phase 6** — a11y + full green + manual/network verification.

## Story → Task Map

| Story | Priority | Tasks |
|---|---|---|
| US1 — list contents | P1 (MVP) | T013, T014, T015, T016, T017, T018 |
| US2 — scope button | P1 | T019 |
| US3 — empty callouts | P2 | T020 |
| US4 — delete contribution from preview | P2 | T025–T028 |
| Foundational (shared) | — | T002–T012 |
| Setup | — | T001 |
| Polish | — | T021–T024 |
