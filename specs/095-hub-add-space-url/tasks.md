---
description: "Task list for Innovation Hub — Add Space by URL"
---

# Tasks: Innovation Hub — Add Space by URL

**Input**: Design documents from `/specs/095-hub-add-space-url/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included. The plan calls out a Vitest unit test for the dialog component (`AddSpaceByUrlDialog.test.tsx`) plus a hook test (`useResolveSpaceUrl.test.tsx`). Tests are added per user story alongside the implementation rather than strict pre-implementation TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to a user story from spec.md (US1, US2, US3)
- File paths are absolute from the repo root: `/Users/neilsmyth/Documents/DevAlkemio/client-web/`

## Path Conventions

This is a single Vite SPA. New code lives under `src/domain/innovationHub/InnovationHubsSettings/`. Translations live under `src/core/i18n/en/translation.en.json`. Generated GraphQL artifacts live under `src/core/apollo/generated/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm clean baseline before changes.

- [ ] T001 Confirm baseline: run `pnpm install`, `pnpm codegen`, `pnpm lint`, and `pnpm vitest run` from repo root and verify they all pass and produce no uncommitted diff. This anchors the change set so generated-file diffs in T004 are unambiguous.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: i18n strings, schema cleanup, and codegen — required by every user story below.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Add 8 new i18n keys under `pages.admin.innovationHub.spaceListFilter.addByUrl.*` in `src/core/i18n/en/translation.en.json`: `dialogTitle`, `urlInputLabel`, `urlInputPlaceholder`, `submit`, `cancel`, `validating`, `invalidSpaceUrl` (value: "URL is not a valid top level space"), `alreadyAdded`. Edit only the English source file; per CLAUDE.md the other locale files are managed by Crowdin.
- [ ] T003 [P] Delete `src/domain/innovationHub/InnovationHubsSettings/InnovationHubAvailableSpaces.graphql` — the obsolete candidate-list query. Do not leave a stub.
- [ ] T004 Run `pnpm codegen` (requires backend at `localhost:4000/graphql`) and commit the regenerated `src/core/apollo/generated/apollo-hooks.ts` and `src/core/apollo/generated/graphql.ts`. The diff should remove `useInnovationHubAvailableSpacesQuery` and its types; nothing else should change.

**Checkpoint**: i18n keys exist, dead query gone, codegen clean. User stories can begin.

---

## Phase 3: User Story 1 — Add a top-level Space by URL (Priority: P1) 🎯 MVP

**Goal**: An Innovation Hub admin can paste a valid L0 Space URL into a new dialog and have the Space appended to the Hub's `spaceListFilter`. The dialog scaffolds the loading and inline-error states needed by US2/US3 — those stories add classification tests and the duplicate branch.

**Independent Test**: Quickstart **TC-1** (paste valid L0 URL → Space appears in list and dialog closes), **TC-7** (submit disabled until input is a syntactically valid URL), **TC-9** (cancel resets state).

### Implementation for User Story 1

- [ ] T005 [P] [US1] Create `src/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl.ts` — a hook that wraps `useUrlResolverLazyQuery` (from `src/core/apollo/generated/apollo-hooks.ts`) and exposes `{ resolve(url: string): Promise<{ kind: 'ok'; spaceId: string } | { kind: 'invalid' }> }`. Return `{ kind: 'ok', spaceId }` iff Apollo returns no error AND `data.urlResolver.state === UrlResolverResultState.Resolved` AND `data.urlResolver.type === UrlType.Space` AND `data.urlResolver.space?.level === 0` AND `data.urlResolver.space?.id` is truthy. In every other case (Apollo error, `Forbidden`, `NotFound`, non-`Space` type, `level !== 0`, missing id) return `{ kind: 'invalid' }`. Trim the URL before passing to the resolver. Catch any thrown errors from the lazy query call so the hook never rejects.
- [ ] T006 [US1] Create `src/domain/innovationHub/InnovationHubsSettings/AddSpaceByUrlDialog.tsx` — a presentational MUI dialog with props `{ open: boolean; onClose: () => void; onAdd: (spaceId: string) => Promise<void>; existingSpaceIds: string[] }`. Implementation requirements:
  - Use the existing MUI primitives `DialogWithGrid` and `DialogHeader` from `@/core/ui/dialog/*` to match the surrounding admin styling.
  - Local state machine per `data-model.md`: `{ url: string, status: { kind: 'idle' | 'validating' | 'invalid' | 'duplicate' } }`.
  - Submit button is disabled when `url.trim() === ''` OR when `new URL(url.trim())` throws. Wrap in `try { new URL(value) } catch {}` — do not import a regex.
  - On any input `onChange`, set `status` back to `{ kind: 'idle' }` (clears the inline error).
  - On submit:
    1. `setStatus({ kind: 'validating' })`
    2. `const result = await resolve(url.trim())` (from `useResolveSpaceUrl`)
    3. If `result.kind === 'invalid'` → `setStatus({ kind: 'invalid' })`.
    4. Else if `existingSpaceIds.includes(result.spaceId)` → `setStatus({ kind: 'duplicate' })`. *(This branch is covered by US3's tests; it must be implemented here so the dialog ships in a consistent state.)*
    5. Else `await onAdd(result.spaceId)` then `onClose()`.
  - When `status.kind === 'validating'`: render an inline status text using i18n key `pages.admin.innovationHub.spaceListFilter.addByUrl.validating`, render a spinner inside the submit button, and disable the submit button.
  - When `status.kind === 'invalid'`: render an inline error below the input using i18n key `pages.admin.innovationHub.spaceListFilter.addByUrl.invalidSpaceUrl`. Wrap in an element with `role="alert"` and `aria-live="polite"` so screen readers announce it.
  - When `status.kind === 'duplicate'`: render the same inline-error slot but using i18n key `pages.admin.innovationHub.spaceListFilter.addByUrl.alreadyAdded`.
  - Title from `dialogTitle`, URL field label from `urlInputLabel`, placeholder from `urlInputPlaceholder`, submit button label from `submit`, cancel button label from `cancel`.
  - Do NOT use `useMemo`/`useCallback`/`React.memo` (CLAUDE.md / React Compiler rule).
  - Do NOT import any GraphQL generated types into the dialog's prop interface — keep props as plain TS strings/booleans/callbacks.
- [ ] T007 [US1] Modify `src/domain/innovationHub/InnovationHubsSettings/InnovationHubSpacesField.tsx`:
  - Remove the import of `useInnovationHubAvailableSpacesQuery`, the `Search` icon, `AddIcon`, `TextField`, `LoadingIconButton`, `DataGridTable`, and any `GridColDef`/`GridRenderCellParams` types only used by the search dialog.
  - Remove the `availableSpacesData` query call, the `filter` state, the `filteredAvailableSpaces`/`sortedAvailableSpaces`/`columns`/`loadingItemId` declarations, the `handleAdd` helper, and the `<DialogWithGrid>` block (currently around lines 176–224 of the existing file).
  - Keep `isAddDialogOpen` state and the `<Button onClick={() => setIsAddDialogOpen(true)}>` action.
  - Render `<AddSpaceByUrlDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} existingSpaceIds={itemIds} onAdd={async (spaceId) => { await onChange?.([...itemIds, spaceId]); }} />` in place of the removed dialog.
  - Keep the existing sortable list (`DndContext`/`SortableContext`/`SortableSpaceRow`) untouched.
- [ ] T008 [P] [US1] Create `src/domain/innovationHub/InnovationHubsSettings/AddSpaceByUrlDialog.test.tsx` covering the happy-path subset of the dialog's contract: (a) submit button is disabled when the input is empty; (b) submit button is disabled when the input is `not a url`; (c) submit button becomes enabled when the input is `https://example.com/abc`; (d) clicking submit while `useResolveSpaceUrl` (mocked) returns `{ kind: 'ok', spaceId: 'space-xyz' }` and `existingSpaceIds={[]}` calls `onAdd('space-xyz')` exactly once and then calls `onClose`; (e) the validating status text appears while the resolver promise is pending. Use `vi.mock('@/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl', ...)` to stub the hook.
- [ ] T009 [US1] Manual verification: run `pnpm start` against a live backend, sign in as a Hub admin, navigate to **Admin → Innovation Hubs → \<your hub> → Settings**, and execute quickstart **TC-1**, **TC-7**, **TC-9**. Capture a brief screenshot for the PR description per the constitution's evidence requirement.

**Checkpoint**: US1 functional. Happy path works; the dialog renders the generic-error and duplicate slots even though their classifications are tested in US2/US3.

---

## Phase 4: User Story 2 — Submitted URL is not a valid top-level Space (Priority: P1)

**Goal**: All non-success outcomes (subspace, non-Space, not-found, wrong host, network error, server error) collapse to one inline message: "URL is not a valid top level space". The dialog stays open and the error clears when the input changes.

**Independent Test**: Quickstart **TC-2** through **TC-5**, **TC-8** (the various failure URLs and the network-blocked case).

This story adds **no new component code** beyond US1 — the `'invalid'` branch of the dialog and the catch-all classification in the hook are already implemented in T005/T006. Tasks here exist to lock down the classification with tests and verify the failure modes manually.

### Tests for User Story 2

- [ ] T010 [P] [US2] Create `src/domain/innovationHub/InnovationHubsSettings/useResolveSpaceUrl.test.tsx` covering hook classification by mocking `useUrlResolverLazyQuery`. Assert that `resolve` returns `{ kind: 'invalid' }` when: (i) the lazy query rejects / returns `error`, (ii) `state === UrlResolverResultState.Forbidden`, (iii) `state === UrlResolverResultState.NotFound`, (iv) `type !== UrlType.Space`, (v) `space.level !== 0`, (vi) `space.id` is missing. Assert it returns `{ kind: 'ok', spaceId }` only when `state === Resolved && type === Space && space.level === 0 && space.id` is truthy.
- [ ] T011 [P] [US2] Extend `AddSpaceByUrlDialog.test.tsx` (created in T008): mock `useResolveSpaceUrl` to return `{ kind: 'invalid' }` and assert (a) the inline error renders with the text from i18n key `pages.admin.innovationHub.spaceListFilter.addByUrl.invalidSpaceUrl`, (b) `onAdd` is NOT called, (c) the dialog does NOT call `onClose`, (d) firing an `onChange` on the URL input clears the inline error.

### Manual verification for User Story 2

- [ ] T012 [US2] Manual verification: against a live backend, execute quickstart **TC-2** (subspace URL), **TC-3** (non-Alkemio host like `https://example.com/foo`), **TC-4** (URL of a user profile or organisation), **TC-5** (same-host URL with a fake nameID → 404), and **TC-8** (block the GraphQL endpoint via DevTools → Network and submit). All five must produce the same generic error.

**Checkpoint**: US2 verified. One message covers all failure modes.

---

## Phase 5: User Story 3 — Space is already in the Hub (Priority: P2)

**Goal**: Submitting a URL of a Space already in the Hub shows a distinct inline message and does not create a duplicate.

**Independent Test**: Quickstart **TC-6** (paste URL of a Space already in the Hub list).

The duplicate branch (`status.kind === 'duplicate'`) and the post-resolution `existingSpaceIds.includes(spaceId)` check were implemented in T006 because the dialog must ship as a coherent whole. This story locks the behaviour down with a test and verifies it manually.

### Tests for User Story 3

- [ ] T013 [P] [US3] Extend `AddSpaceByUrlDialog.test.tsx` with the duplicate case: mock `useResolveSpaceUrl` to return `{ kind: 'ok', spaceId: 'space-xyz' }`, render the dialog with `existingSpaceIds={['space-xyz']}`, click submit, then assert (a) the inline message renders with the text from i18n key `pages.admin.innovationHub.spaceListFilter.addByUrl.alreadyAdded`, (b) `onAdd` is NOT called, (c) `onClose` is NOT called, (d) editing the input clears the message.

### Manual verification for User Story 3

- [ ] T014 [US3] Manual verification: against a live backend, execute quickstart **TC-6**. Pick a Space currently in the Hub's list, paste its URL, submit, and confirm the distinct duplicate message appears (not the generic one), the dialog stays open, and the list contains no duplicate entry.

**Checkpoint**: All three user stories independently functional and tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates before opening the PR.

- [ ] T015 [P] Run `pnpm lint` and resolve any new findings introduced by this change set.
- [ ] T016 [P] Run `pnpm vitest run` and confirm the suite is green; verify the two new test files (`AddSpaceByUrlDialog.test.tsx`, `useResolveSpaceUrl.test.tsx`) are picked up and that the deletion of `InnovationHubAvailableSpaces.graphql` produced no orphan test references.
- [ ] T017 Run `pnpm codegen` once more and confirm a clean diff (no further generated changes after T004).
- [ ] T018 A11y pass — execute quickstart **TC-10** (keyboard-only operation): Tab to **Add**, Enter opens the dialog with focus on the input, type a URL, Tab to submit, Enter submits, Esc closes. Confirm the inline error is announced (visible focus or `aria-live` works in a screen reader / VoiceOver test).
- [ ] T019 i18n smoke pass — execute quickstart **TC-11**: switch the app locale, confirm the dialog title, input label, placeholder, button labels, status text, error message, and duplicate message all flow through `t()`. English source is the only file edited; non-English fallbacks are expected until Crowdin runs.
- [ ] T020 Regression check on the surrounding component: confirm the existing sortable list still drag-reorders, the per-row remove button still works, and saving a reordered list still triggers `pages.admin.innovationHubs.saved`. The change set must not have regressed any of `InnovationHubSpacesField.tsx`'s pre-existing behaviour.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup. **Blocks all user stories.** T002 and T003 are independent files and can run in parallel; T004 (`pnpm codegen`) depends on T003 (the deleted `.graphql` file is what changes the generated output).
- **User Story 1 (Phase 3)**: Depends on Foundational. T005 (hook) and T008 (its companion test) can run in parallel with T006 (dialog) since they are different files. T007 (orchestrator wiring) depends on T006. T009 (manual verify) depends on T005, T006, T007.
- **User Story 2 (Phase 4)**: Depends on US1. T010 and T011 are independent files and parallelisable. T012 depends on T010 + T011 + the deployed backend.
- **User Story 3 (Phase 5)**: Depends on US1 (the duplicate branch is in T006). T013 extends the existing dialog test file (parallel-safe vs. T010 since they are different files; serialise vs. T011 because both edit `AddSpaceByUrlDialog.test.tsx`). T014 depends on T013 + the deployed backend.
- **Polish (Phase 6)**: Depends on all stories.

### User Story Dependencies

- **US1 (P1)**: Independent — the MVP increment.
- **US2 (P1)**: Logically additive verification on top of US1 (no new component code; only tests + manual checks).
- **US3 (P2)**: Adds the duplicate-detection assertion + manual verification; the implementation already shipped in T006.

### Within Each Story

- Hooks/components before tests *of* those hooks/components.
- Implementation before manual verification.
- All within-story tests can run in parallel where they target different files.

### Parallel Opportunities

- **Phase 2**: T002 (i18n) and T003 (delete `.graphql`) are different files → run in parallel. T004 must wait for T003.
- **Phase 3**: T005 (`useResolveSpaceUrl.ts`) and T008 (`AddSpaceByUrlDialog.test.tsx`) and T006 (`AddSpaceByUrlDialog.tsx`) all touch different files. T005 and T006 can run in parallel; T008 can be drafted alongside as long as it mocks the hook (so it does not depend on T005's implementation details).
- **Phase 4**: T010 (`useResolveSpaceUrl.test.tsx`) and T011 (extends `AddSpaceByUrlDialog.test.tsx`) target different files → parallel.
- **Phase 5**: T013 must serialise with T011 since both edit `AddSpaceByUrlDialog.test.tsx`.
- **Phase 6**: T015 (lint) and T016 (vitest) can run concurrently; T017–T020 are sequential checks against the running app.

---

## Parallel Example: User Story 1

```bash
# T005 and T006 target different files — run in parallel:
Task: "Create useResolveSpaceUrl.ts hook in src/domain/innovationHub/InnovationHubsSettings/"
Task: "Create AddSpaceByUrlDialog.tsx in src/domain/innovationHub/InnovationHubsSettings/"

# T007 must wait — it imports the dialog and the hook is referenced through it:
Task: "Wire <AddSpaceByUrlDialog/> into InnovationHubSpacesField.tsx"

# T008 (the dialog test) mocks the hook and depends only on the dialog file existing:
Task: "Add Vitest tests for happy path in AddSpaceByUrlDialog.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 → Phase 2 → Phase 3.
2. **STOP and VALIDATE**: a Hub admin can add a valid L0 Space by URL. Failures still render the inline error (the `'invalid'` and `'duplicate'` branches are wired but not yet under test). This is shippable.
3. Phase 4 (US2) and Phase 5 (US3) lock the failure and duplicate behaviours with tests + manual verification — no new component code.
4. Phase 6 polish.

### Incremental Delivery

- After Phase 3: MVP demoable.
- After Phase 4: failure-mode coverage proven.
- After Phase 5: duplicate-detection proven.
- After Phase 6: PR-ready.

### Single-Developer Strategy

This change set is small (≈ −250 / +200 LOC across a handful of files). A single developer can complete Phases 1–6 in one sitting. The story-by-story split exists so the PR description can map evidence (screenshots, test runs) back to each acceptance scenario in the spec, not because the work parallelises across people.

---

## Notes

- All tasks include explicit absolute paths from the repo root.
- `[P]` tasks are different files with no dependency on incomplete tasks.
- Constitution gate (plan.md) passed both pre- and post-design — no Complexity Tracking entries.
- The dialog ships with all three branches (ok / invalid / duplicate) implemented in T006; the user-story split governs **verification**, not **implementation chunks**.
- Do NOT add `useMemo`/`useCallback`/`React.memo` — React Compiler handles memoization (CLAUDE.md).
- Do NOT add comments to code unless they capture non-obvious *why* (CLAUDE.md / Claude global rules).
- Edit only `src/core/i18n/en/translation.en.json`; the other locale files are managed by Crowdin.
- All commits must be signed (CLAUDE.md / repo policy).
