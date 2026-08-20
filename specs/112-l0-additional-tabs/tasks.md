---
description: "Task list for 112-l0-additional-tabs (client-web#9857)"
---

# Tasks: Additional Tabs on L0 Spaces

**Input**: Design documents from `specs/112-l0-additional-tabs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/layout-view.md, contracts/layout-data.md
**Story**: alkem-io/client-web#9857 · **Epic**: alkem-io/alkemio#1930 · **Server slice**: server#6177

**Tests**: Included — the protection rule (no Delete on the first four) and the subspace no-regression guarantee are the feature's core safety invariants (SC-002/SC-003/SC-005) and are pure/derivable, so unit tests are warranted.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: can run in parallel (different files, no dependency)
- **[Story]**: US1 (add tab), US2 (delete + protect), US3 (consistency/templates), or `-` for shared/polish

## Path Conventions
CRD-only web SPA. Presentational components in `src/crd/`, integration glue in `src/main/crdPages/`. Tests co-located as `*.test.ts(x)`.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 [-] Confirm the worktree builds clean on the base: run `pnpm install` then `pnpm vitest run` to capture the green baseline before changes (records the subspace tests that must stay green for SC-005).

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: these shared type + data changes unblock every user story. Do them first.

- [X] T002 [-] Add `isDeletable?: boolean` to `LayoutPoolColumn` in `src/crd/components/space/settings/SpaceSettingsLayoutView.types.ts`, documented as opt-out (undefined ⇒ deletable) per contracts/layout-view.md.
- [X] T003 [-] Add the L0 admin capability `canManageTabs?: boolean` to `SpaceSettingsLayoutViewProps` in `src/crd/components/space/settings/SpaceSettingsLayoutView.tsx`; compute `canManagePhases := (canManageTabs ?? (level !== 'L0')) && !!onCreatePhase`. Leave `canReorderColumns` as `level !== 'L0' && !!onReorderColumns` (reorder stays off on L0). Depends on nothing in src but conceptually pairs with T002.
- [X] T004 [-] Add a `level: 'L0' | 'L1' | 'L2'` parameter to `mapCollaborationToLayoutColumns` in `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts` and stamp each column `isDeletable: level === 'L0' ? index >= 4 : true` (ordered by sortOrder; do not reorder). Depends on T002.
- [X] T004a [-] Add a `level` parameter to `useLayoutTabData` in `src/main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts` (signature `useLayoutTabData(spaceId, level)`) and forward it to the `mapCollaborationToLayoutColumns(collaboration, level)` call at line ~175. The page passes `level` (see T006). Depends on T004.

**Checkpoint**: column data carries protection; the view can be told to manage tabs on L0.

---

## Phase 3: User Story 1 — Add an additional tab to an L0 Space (Priority: P1) 🎯 MVP

**Goal**: An L0 admin can add a tab from Settings → Layout; it appears in the editor and the main tab bar.

**Independent Test**: As an L0 admin, Settings → Layout → Add tab → confirm the new tab in the editor and the Space tab navigation.

### Tests for User Story 1

- [X] T005 [P] [US1] Unit test in `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.test.ts` (extend if present): asserts `isDeletable` is `false` for L0 indices 0–3 and `true` for L0 index ≥ 4, and `true` for L1/L2. (Write first; expect fail until T004 lands.)

### Implementation for User Story 1

- [X] T006 [US1] In `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`, pass `level` to `useLayoutTabData(spaceId, level)`; compute `canManageTabs` from the same admin/update privilege used for subspace tab management and pass `canManageTabs` + `onCreatePhase={canManageTabs ? layout.onCreateState : undefined}` (replacing the `level !== 'L0'` gate at line ~434) and `maximumNumberOfStates`. Keep `headerActionsSlot` omitted on L0. Depends on T003, T004a.
- [X] T007 [P] [US1] Add tab-worded i18n keys for the Add affordance (dialog title, submit CTA, duplicate-name validation) to `src/crd/i18n/spaceSettings/spaceSettings.en.json` and parity across `nl, es, bg, de, fr` — respect the Dutch glossary ("Post"/"Posts", "template"). 
- [X] T008 [US1] Add `entityNoun?: 'tab' | 'phase'` (default `'phase'`) to `AddPhaseDialog` in `src/crd/components/space/settings/AddPhaseDialog.tsx`; select the tab-worded keys when `'tab'`. Wire `entityNoun={level === 'L0' ? 'tab' : 'phase'}` from the view → dialog (thread a `entityNoun`/label prop through `SpaceSettingsLayoutView`). Depends on T007.
- [X] T009 [US1] Verify (manually per quickstart step 1–2) that an added L0 tab renders in the main tab bar via the existing `useCrdSpaceTabs` index-≥-4 path — no code change expected; if a gap is found, fix it here. Depends on T006.
- [X] T009a [US1] Verify FR-014: while a create/delete is in flight on L0, the Add affordance is disabled — confirm `canAddPhase` already includes `!isStructureMutating` and that the L0 path inherits it (no new code expected; the view formula is reused). Depends on T006.

**Checkpoint**: US1 fully functional — L0 admins can add tabs, capped at max, rendered in the tab bar.

---

## Phase 4: User Story 2 — Delete an admin-added tab, protect the first four (Priority: P1)

**Goal**: An L0 admin can delete an additional tab (posts move to first tab); the first four tabs never offer Delete.

**Independent Test**: Add a tab with a post, delete it (post relocates to first tab); confirm no Delete on the four built-ins.

### Tests for User Story 2

- [X] T010 [P] [US2] Component test for `LayoutPoolColumn`/`ColumnOverflowMenu` in `src/crd/components/space/settings/LayoutPoolColumn.test.tsx`: Delete entry is **absent** when `column.isDeletable === false` (even with `onDeletePhase` present), and **present** when `isDeletable === true` + `onDeletePhase` present. (Write first; expect fail until T012.)

### Implementation for User Story 2

- [X] T011 [US2] In `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`, provide `onDeleteState: layout.onDeleteState` at every level (replace the `level !== 'L0' ? … : undefined` gate at line ~226). Depends on T006.
- [X] T012 [US2] In `src/crd/components/space/settings/LayoutPoolColumn.tsx`, gate the Delete menu entry on `actions.onDeletePhase && column.isDeletable !== false`; use the tab-worded delete label + `ConfirmationDialog` (variant destructive) title/CTA on L0. Depends on T002, T013.
- [X] T013 [P] [US2] Add tab-worded Delete i18n keys (menu label, confirm dialog title/body/CTA) to `src/crd/i18n/spaceSettings/spaceSettings.{en,nl,es,bg,de,fr}.json` with key parity (Dutch glossary respected).
- [X] T014 [US2] In `src/main/crdPages/topLevelPages/spaceSettings/layout/useColumnMenu.ts`, drop the "L1/L2 only" assumption in the doc-comment/logic so `onDeleteState` is honoured on L0; keep the `canDelete = columnCount > minimumNumberOfStates` formula (positional protection is handled by `isDeletable`, not here). Depends on T011.
- [X] T015 [US2] Confirm active-tab-advance-before-delete (FR-008) works on L0 — it is reused unchanged from `useLayoutTabData.onDeleteState`; add no new logic, verify via quickstart step 5. Depends on T011.

**Checkpoint**: US2 functional — additional tabs deletable with post relocation; first four protected; both P1 stories work.

---

## Phase 5: User Story 3 — Consistency with subspaces + templates (Priority: P2)

**Goal**: Rename/description/visibility behave as on subspaces; templates capture all tabs; no L1/L2 regression.

**Independent Test**: Rename + hide an additional L0 tab (behaves like a subspace); save the Space as a template and confirm all tabs are captured.

### Tests for User Story 3

- [X] T016 [P] [US3] Regression assertion: existing subspace layout tests pass unchanged — run the full `pnpm vitest run` and confirm no subspace tab/phase test regressed (SC-005). If a shared test needs an `isDeletable`/`canManageTabs` default, update it to assert prior behaviour rather than changing behaviour.

### Implementation for User Story 3

- [X] T017 [US3] Verify rename + description edit on an additional L0 tab use the existing `onSaveColumnDetails` path unchanged (FR-012); no code change expected — confirm via quickstart step 6. Depends on T006.
- [X] T018 [US3] Verify visibility toggle on additional L0 tabs uses the already-wired `onToggleVisibility` (it was always enabled at L0); confirm via quickstart step 6. No code change expected.
- [X] T019 [US3] Verify Space templates capture all tabs via the existing `SpaceTemplateContent_Collaboration` → `InnovationFlowStates` fragment (FR-013/SC-006) — confirm via quickstart step 7; no client change expected. If a template path drops index-≥-4 states, fix it here.

**Checkpoint**: All stories independently functional; subspaces unchanged; templates complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T020 [P] [-] Confirm six-language key parity for all new `spaceSettings` keys (en/nl/es/bg/de/fr) — no missing/extra keys; Dutch glossary terms preserved.
- [X] T021 [P] [-] Accessibility pass on the new/changed affordances: Add/Delete buttons have `aria-label`s, Delete confirm names the action, focus-visible rings present (WCAG 2.1 AA).
- [X] T022 [-] Run the local exit gates in order: `pnpm vitest run` → `pnpm build` → `pnpm lint`. Fix any failure and restart from the first gate.
- [X] T023 [-] Run quickstart.md manual verification checklist end-to-end (steps 1–9).

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (P1)** → **Foundational (P2)** blocks all stories → **US1/US2 (P1)** → **US3 (P2)** → **Polish**.
- Foundational T002 → T004 (mapper needs the type); T003 is independent within P2.

### User Story Dependencies
- **US1 (P1)**: after Foundational. Self-contained add path.
- **US2 (P1)**: after Foundational; shares the settings-page wiring with US1 (T006 precedes T011) but is independently testable.
- **US3 (P2)**: after Foundational; mostly verification of already-working subspace-shared behaviour.

### Within Each Story
- Tests (T005, T010) written first and expected to fail before their implementation tasks.
- Types/mapper before view; view before settings-page wiring; i18n keys before the components that read them.

### Parallel Opportunities
- T007 ‖ T013 (different locale JSON edits vs … actually same files — coordinate: both touch `spaceSettings.<lang>.json`, so do NOT run T007 and T013 in parallel on the same file; sequence them).
- T005 ‖ T010 (different test files).
- T020 ‖ T021 (parity check vs a11y check).

> **File-conflict note**: T007 and T013 both edit the six `spaceSettings.<lang>.json` files — treat them as sequential despite both being i18n, or merge into one edit pass per locale to avoid clobbering.

---

## Implementation Strategy

### MVP (both P1 stories)
1. Setup (T001) → Foundational (T002–T004).
2. US1 (T005–T009) → validate add + render.
3. US2 (T010–T015) → validate delete + protection.
4. STOP & validate the two P1 stories independently (quickstart 1–5).

### Increment
5. US3 (T016–T019) → consistency + templates.
6. Polish (T020–T023) → parity, a11y, gates, manual sweep.

## Notes
- [P] = different files, no dependency (mind the i18n file-conflict note).
- Commit in logical slices (types+mapper; add path; delete+protection; i18n; verification).
- Keep the working tree green between tasks; never leave subspace tests red.
