---
description: "Task list for CRD Space Settings Page implementation"
---

# Tasks: CRD Space Settings Page

**Input**: Design documents from `/specs/045-crd-space-settings/`
**Prerequisites**: plan.md, spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because `research.md` Decision 9 prescribes a three-layer testing scope (mapper unit tests, component tests, one dirty-guard integration test). End-to-end tests are explicitly out of scope.

**Organization**: Tasks are grouped by user story (US1 = About, US2 = Layout, US3 = Subspaces/Templates/Storage, US4 = Community/Settings/Account) to enable independent verification. Per FR-018 and Clarification Q1, all 8 tabs MUST ship together in a single release — user-story phases are used for traceability and parallel assignment, not for phased rollout.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 / US4 per spec.md user-story priorities
- Absolute file paths are given from the repo root

## Path Conventions

- CRD presentational components live under `src/crd/components/space/settings/`
- CRD primitives live under `src/crd/primitives/`
- CRD i18n under `src/crd/i18n/spaceSettings/`
- Integration (route entry, mappers, data hooks, dirty guard) under `src/main/crdPages/topLevelPages/spaceSettings/`
- Existing MUI Space Admin (`src/domain/spaceAdmin/*`) stays untouched

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding and dependencies required for any work below.

- [ ] T001 Add `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/accessibility` as runtime dependencies via `pnpm add` and commit the updated `pnpm-lock.yaml`
- [ ] T002 [P] Create the empty folder skeleton `src/crd/components/space/settings/` and `src/main/crdPages/topLevelPages/spaceSettings/{about,layout,community,subspaces,templates,storage,settings,account}/`
- [ ] T003 [P] Create the empty i18n folder `src/crd/i18n/spaceSettings/` and a placeholder `spaceSettings.en.json` with `{}`
- [ ] T004 [P] Register the `crd-spaceSettings` namespace in the i18n loader following the pattern used by `crd-exploreSpaces` / `crd-search` (lazy-loaded)
- [ ] T004a [P] Port `prototype/src/app/components/ui/tabs.tsx` to `src/crd/primitives/tabs.tsx` (shadcn + Radix Tabs) following CRD primitive conventions (zero application knowledge, `className` prop, `cn()`, CVA variants). Used by T009
- [ ] T004b [P] Port `prototype/src/app/components/ui/textarea.tsx` to `src/crd/primitives/textarea.tsx`. Used by Settings/Community multi-line fields
- [ ] T004c [P] Port `prototype/src/app/components/ui/table.tsx` to `src/crd/primitives/table.tsx`. Used by Storage documents table and Account entitlements table

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shell, guards, and shared primitives that every tab depends on. No user-story work begins until this phase is complete.

- [ ] T005 [P] **Reuse** the existing `src/crd/components/dialogs/ConfirmationDialog.tsx`. If its props do not already cover a three-action "Save / Discard & leave / Cancel" case, extend it (discriminated-union `variant: 'delete' | 'discard'`) — do NOT create a parallel `ConfirmDiscardDialog`. Keep the destructive `variant: 'delete'` behavior (red confirm button) available for tabs that delete items. Update `contracts/shell.ts` `ConfirmDiscardDialogProps` name if the merged API differs
- [ ] T006 [P] Verify `ConfirmationDialog` handles the destructive variant required by FR-014; if not, extend it with a red confirm button and a clear destructive tone. Any tab that deletes items (Layout / Subspaces / Templates / Storage / Community) MUST route through this single component (DRY, Arch #6.f)
- [ ] T007 [P] Create `src/crd/components/space/settings/SpaceSettingsCard.tsx` — title + inline description + body slot primitive used by every tab
- [ ] T008 [P] Create `src/crd/components/space/settings/SpaceSettingsSaveBar.tsx` per `SpaceSettingsSaveBarProps`; sticky bottom-right; hidden on `kind: 'clean'`; disabled Save when `canSave: false`
- [ ] T009 [P] Create `src/crd/components/space/settings/SpaceSettingsTabStrip.tsx` per `SpaceSettingsTabStripProps` — compose the shadcn `Tabs` / `TabsList` / `TabsTrigger` primitives from `src/crd/primitives/tabs.tsx` (ported in T004a); icon + label per tab via `lucide-react`; horizontally scrollable on narrow viewports via Tailwind `overflow-x-auto`. Radix Tabs already provides `role="tablist"` + arrow-key nav — do not reimplement
- [ ] T010 Create `src/crd/components/space/settings/SpaceSettingsShell.tsx` per `SpaceSettingsShellProps` — reuses `src/crd/components/space/SpaceHeader.tsx` for the hero, renders `SpaceSettingsTabStrip` below, and yields the active tab's content via `children`
- [ ] T011 [P] Create `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.ts` — reads/writes the active `TabId` from the URL (`/settings/:tab`); normalizes unknown values to `'about'`
- [ ] T012 Create `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.ts` per `contracts/data-mapper.ts` (`UseDirtyTabGuard`) — wires react-router `useBlocker`, window `beforeunload`, and intercepts `onTabChange` to open `ConfirmDiscardDialog`; enforces "at most one dirty tab" invariant (Clarification Q2)
- [ ] T013 Create `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` — route entry that composes `SpaceSettingsShell`, pulls active tab from `useSpaceSettingsTab`, owns the `useDirtyTabGuard` instance, and renders a placeholder per tab (tabs are wired in their own phases)
- [ ] T014 Update `src/main/routing/TopLevelRoutes.tsx` — branch the Space Settings route on `useCrdEnabled()`: render `CrdSpaceSettingsPage` when true, existing MUI `SpaceAdminPage` when false; keep the same URL paths
- [ ] T015 Seed `src/crd/i18n/spaceSettings/spaceSettings.en.json` with tab labels (About / Layout / Community / Subspaces / Templates / Storage / Settings / Account), confirmation dialog strings, and generic Save / Reset / Cancel copy
- [ ] T016 [P] Integration test `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.test.ts` — renders a shell with a mocked tab that toggles dirty, asserts a dirty tab switch is blocked by the confirm dialog and a clean switch passes through
- [ ] T016a [P] Unit test `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.test.ts` — verifies URL `/settings/:tab` → active `TabId`, unknown values normalize to `'about'`, and setting the active tab updates the URL (FR-003)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Edit Space Identity on the About Tab (Priority: P1) 🎯 MVP

**Goal**: An admin can open Space Settings, see the CRD hero and tab strip, edit space identity fields on the About tab, watch the Preview card update live, and persist changes via the save bar.

**Independent Test**: Toggle CRD on, open Space Settings, confirm About tab is active, edit name/tagline/banner, confirm Preview updates live, Save and reload → changes persisted. Other tabs render placeholders at this point (final wiring lands in later phases before release, per FR-018).

### Tests for User Story 1

- [ ] T017 [P] [US1] Mapper unit test at `src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.test.ts` — fixture-driven coverage of Apollo payload → `AboutViewProps` mapping (banner/avatar URL resolution, tag normalization, preview derivation)
- [ ] T018 [P] [US1] View component test at `src/crd/components/space/settings/SpaceSettingsAboutView.test.tsx` — typing into name updates Preview; Save fires `onSave`; Reset fires `onReset`; save bar hidden when `kind: 'clean'`

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create `src/crd/components/space/settings/SpaceSettingsAboutView.tsx` per `contracts/tab-about.ts` — two-column layout (form cards on the left, `SpaceCard`-preview on the right). Compose existing CRD assets: `src/crd/primitives/input.tsx` for name/tagline, `src/crd/primitives/textarea.tsx` for short text, `src/crd/forms/markdown/MarkdownEditor.tsx` for vision / mission / impact / who, `src/crd/forms/tags-input.tsx` for tags, `src/crd/primitives/card.tsx` for grouping, and `src/crd/components/space/SpaceCard.tsx` for the live Preview. Render per-card skeleton placeholders while `loading` and an inline error banner inside the affected card on `saveBar.kind === 'saveError'` or fetch error (FR-016)
- [ ] T020 [P] [US1] Create `src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.ts` — pure function `SpaceSettingsQuery → AboutViewProps` using generated fragments. Call `pickColorFromId(space.id)` from `@/crd/lib/pickColorFromId` and attach it to the `previewCard` so the `SpaceCard` Preview uses the deterministic accent color when banner/avatar are missing (CRD CLAUDE.md §Deterministic Accent Colors)
- [ ] T021 [US1] Create `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts` per `UseAboutTabData` — reuses existing generated Apollo query/mutation hooks; owns local form buffer; emits `SaveBarState` and `isDirty`; uploads handled via existing file upload mutation. Wrap every save/upload mutation invocation in `useTransition` per Constitution Principle II (React 19 Concurrent UX) so the UI stays responsive during mutation inflight
- [ ] T022 [US1] Wire the About tab into `CrdSpaceSettingsPage.tsx` — call `useAboutTabData(spaceId)`, propagate `markDirty`/`clearDirty` to `useDirtyTabGuard`
- [ ] T023 [US1] Add About-tab strings to `src/crd/i18n/spaceSettings/spaceSettings.en.json` (card titles, help text, field labels, upload hints including banner dimensions)

**Checkpoint**: About tab is fully functional end-to-end; hero, tab strip, save bar, and dirty-guard all exercised.

---

## Phase 4: User Story 2 - Reorder and Manage Navigation Tabs on the Layout Tab (Priority: P1)

**Goal**: An admin can reorder pages within a column, move callouts across columns (system pages stay pinned), rename inline, add new pages, and delete pages with confirmation. Keyboard users get the FR-021 grab-mode equivalent.

**Independent Test**: Open Layout tab, drag a callout from Home to Community, rename a page inline, delete a page (with confirm), Save, reload, verify persistence. Repeat using only the keyboard (Tab → Space → arrows → Enter).

### Tests for User Story 2

- [ ] T024 [P] [US2] Mapper unit test at `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.test.ts` — fixtures covering system-vs-callout discrimination, column grouping, and order preservation
- [ ] T025 [P] [US2] Component test at `src/crd/components/space/settings/SpaceSettingsLayoutView.test.tsx` — dnd-kit keyboard sensor drives Space → Arrow Down → Enter to reorder; system rows cannot enter grab-mode; cross-column Arrow Right moves the page

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create `src/crd/components/space/settings/LayoutPageRow.tsx` — renders a single row with icon, name, inline rename affordance, delete button; shows a lock icon and no grab handle when `kind === 'system'`
- [ ] T027 [P] [US2] Create `src/crd/components/space/settings/LayoutPoolColumn.tsx` per `LayoutPoolColumn` contract — column card with title, description, ordered list of `LayoutPageRow`, and `Add Page` affordance
- [ ] T028 [US2] Create `src/crd/components/space/settings/SpaceSettingsLayoutView.tsx` per `contracts/tab-layout.ts` — composes four `LayoutPoolColumn`s inside a `DndContext` with `PointerSensor` + `KeyboardSensor`; wires `onReorder` / `onRename` / `onAdd` / `onRemove`; pinned rows are filtered out of drop targets. Render per-column skeleton placeholders while loading and an inline error banner inside the affected column on fetch/save error (FR-016). Configure dnd-kit's `Announcements` API with i18n-resolved messages for `onDragStart` (grab), `onDragOver` (moved), `onDragEnd` (dropped), and `onDragCancel` (cancelled) so the ARIA live region announces grab-mode state and position changes per FR-021
- [ ] T029 [P] [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts` — maps the space tabset query into the four `LayoutPoolColumn` shapes, tagging each entry as `system` or `callout` using the existing backend discriminator
- [ ] T030 [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts` per `UseLayoutTabData` — owns the local ordered state, composes the mutation calls on Save, rejects moves with `kind === 'system'` as a defense in depth. Wrap every mutation invocation in `useTransition` per Constitution Principle II
- [ ] T031 [US2] Wire the Layout tab into `CrdSpaceSettingsPage.tsx`
- [ ] T032 [US2] Add Layout-tab strings to `spaceSettings.en.json` (column titles, help text, empty-column prompts, grab-mode live-region announcements)

**Checkpoint**: About and Layout tabs are both fully functional. Dirty-state guard exercised by two independent tabs.

---

## Phase 5: User Story 3 - Manage Subspaces, Templates, Storage with Safe Destructive Actions (Priority: P2)

**Goal**: An admin can list, create, edit, and delete child subspaces, templates, and documents, always with a CRD confirmation dialog before destructive actions.

**Independent Test**: Open Subspaces → delete a subspace (Cancel dismisses, Confirm removes). Open Templates → create, edit, delete. Open Storage → drag-and-drop upload a file, see it in the list, delete it.

### Tests for User Story 3

- [ ] T033 [P] [US3] Mapper unit test `subspaces/subspacesMapper.test.ts`
- [ ] T034 [P] [US3] Mapper unit test `templates/templatesMapper.test.ts`
- [ ] T035 [P] [US3] Mapper unit test `storage/storageMapper.test.ts`

### Implementation for User Story 3 — Subspaces

- [ ] T036 [P] [US3] Create `src/crd/components/space/settings/SpaceSettingsSubspacesView.tsx` per `contracts/tab-subspaces.ts` — CRD grid of subspace tiles with rename / move / delete per tile. Render tile skeletons while loading; render an inline error banner above the grid on fetch error (FR-016)
- [ ] T037 [P] [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/subspaces/subspacesMapper.ts`
- [ ] T038 [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useSubspacesTabData.ts` per `UseSubspacesTabData` — wires existing create/rename/move/delete mutations; destructive actions funnel through `ConfirmDeleteDialog`. Wrap every mutation invocation in `useTransition` per Constitution Principle II

### Implementation for User Story 3 — Templates

- [ ] T039 [P] [US3] Create `src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx` per `contracts/tab-templates.ts` — category-grouped CRD grid with create / edit / delete. Render category skeletons while loading; render an inline error banner inside the affected category card on fetch error (FR-016)
- [ ] T040 [P] [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/templates/templatesMapper.ts`
- [ ] T041 [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/templates/useTemplatesTabData.ts` — edit/create open existing template dialogs wrapped in CRD shell. Wrap every mutation invocation in `useTransition` per Constitution Principle II

### Implementation for User Story 3 — Storage

- [ ] T042 [P] [US3] Create `src/crd/components/space/settings/SpaceSettingsStorageView.tsx` per `contracts/tab-storage.ts` — CRD drop zone + document table built on `src/crd/primitives/table.tsx` (ported in T004c). Render table skeleton rows while loading; render an inline error banner above the table on fetch/upload error (FR-016)
- [ ] T043 [P] [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/storage/storageMapper.ts`
- [ ] T044 [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/storage/useStorageTabData.ts` — wires upload + delete mutations. Wrap every mutation invocation in `useTransition` per Constitution Principle II

### Shared for User Story 3

- [ ] T045 [US3] Wire Subspaces / Templates / Storage tabs into `CrdSpaceSettingsPage.tsx`
- [ ] T046 [US3] Add Subspaces / Templates / Storage strings to `spaceSettings.en.json`

**Checkpoint**: P1 and P2 tabs are complete. Every destructive action across the three tabs passes through `ConfirmDeleteDialog`.

---

## Phase 6: User Story 4 - Configure Community, Privacy and Plan (Priority: P3)

**Goal**: An admin can manage members, leads, invitation policy, and the application form on the Community tab; toggle privacy/visibility on the Settings tab; and view the plan/entitlements read-only on the Account tab. Community interactions visually match spec 084.

**Independent Test**: Open Community → remove a member (with confirm). Open Settings → flip privacy Public → Private → Save, reload, confirm persistence. Open Account → confirm plan + entitlements table + contact link render read-only.

### Tests for User Story 4

- [ ] T047 [P] [US4] Mapper unit test `community/communityMapper.test.ts`
- [ ] T048 [P] [US4] Mapper unit test `settings/settingsMapper.test.ts`
- [ ] T049 [P] [US4] Mapper unit test `account/accountMapper.test.ts`

### Implementation for User Story 4 — Community

- [ ] T050 [P] [US4] Create `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx` per `contracts/tab-community.ts` — reuses the `MemberRow` shape from `src/crd/components/dialogs/PendingMembershipsDialog/*` (spec 084) for zero visual divergence. Compose existing CRD assets: `src/crd/primitives/radio-group.tsx` for invitation policy, `src/crd/forms/markdown/MarkdownEditor.tsx` for guidelines editing, `src/crd/components/common/MarkdownContent.tsx` for any read-only guideline preview. Render member-list skeletons while loading; render an inline error banner inside the affected card (members / leads / application-form / guidelines) on fetch/save error (FR-016)
- [ ] T051 [P] [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/community/communityMapper.ts`
- [ ] T052 [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts` — member remove / promote-lead / demote / invitation-policy / application-form / guidelines mutations; destructive actions funnel through `ConfirmDeleteDialog`. Wrap every mutation invocation in `useTransition` per Constitution Principle II
- [ ] T053 [US4] Add a `requirements.md` checklist row verifying the `MemberRow` shape equals the one used in spec 084; block-merge if diverged (SC-008)

### Implementation for User Story 4 — Settings

- [ ] T054 [P] [US4] Create `src/crd/components/space/settings/SpaceSettingsSettingsView.tsx` per `contracts/tab-settings.ts` — privacy radio, host display, toggle switches, save bar. Render card skeletons while loading; render an inline error banner inside the affected card on fetch/save error (FR-016)
- [ ] T055 [P] [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/settings/settingsMapper.ts`
- [ ] T056 [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/settings/useSettingsTabData.ts` — wires privacy / visibility / host mutations. Wrap every mutation invocation in `useTransition` per Constitution Principle II

### Implementation for User Story 4 — Account

- [ ] T057 [P] [US4] Create `src/crd/components/space/settings/SpaceSettingsAccountView.tsx` per `contracts/tab-account.ts` — read-only plan card + entitlements table built on `src/crd/primitives/table.tsx` + contact-admin link. Render card + table skeletons while loading; render an inline error banner inside the affected card on fetch error (FR-016)
- [ ] T058 [P] [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/account/accountMapper.ts`
- [ ] T059 [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/account/useAccountTabData.ts` (query-only; no mutations)

### Shared for User Story 4

- [ ] T060 [US4] Wire Community / Settings / Account tabs into `CrdSpaceSettingsPage.tsx`
- [ ] T061 [US4] Add Community / Settings / Account strings to `spaceSettings.en.json`

**Checkpoint**: All 8 tabs fully functional. Parity inventory ready for SC-004 review.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Release-readiness items that span tabs. These MUST be complete before flipping the toggle on for real users (FR-018).

- [ ] T062 [P] Responsive QA: verify tab strip scrolls horizontally, the Layout tab's four columns stack, and the About tab's two columns collapse on narrow viewports
- [ ] T063 [P] Accessibility audit: keyboard traversal across every tab; focus rings on every input; axe-core run on `CrdSpaceSettingsPage` with zero violations; live-region announcements verified on save success/failure and on Layout grab-mode transitions. Additionally verify CRD conventions (`src/crd/CLAUDE.md` Checklist): every icon is imported from `lucide-react` only; every sr-only string is rendered via `t()` from the `crd-spaceSettings` namespace, never hardcoded; every interactive element is `<a>` or `<button>` (not clickable `<div>`); every icon-only button has `aria-label`
- [ ] T064 SC-004 parity inventory: side-by-side compare MUI Space Admin vs CRD Space Settings actions; file the checklist in `specs/045-crd-space-settings/checklists/parity.md` with 0 missing actions
- [ ] T065 Toggle round-trip verification: flip `alkemio-crd-enabled` off → MUI renders unchanged; flip on → CRD renders; no console errors; documented per FR-018 / SC-006
- [ ] T066 [P] Run `pnpm lint` and `pnpm vitest run`; attach results to the PR
- [ ] T067 Run the full quickstart manual checklist from `quickstart.md`; attach screenshots to the PR description. Include an explicit SC-001 check — time the About-tab end-to-end edit → save round-trip and record the elapsed seconds (target < 60s)
- [ ] T068 [P] CRD forbidden-import guard (FR-017 + `src/crd/CLAUDE.md` Golden Rules 1–2): add an ESLint `no-restricted-imports` rule for `src/crd/**` that forbids ALL of: `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, `formik`. Apply a narrower rule to `src/main/crdPages/**` forbidding only `@mui/*` and `@emotion/*` (crdPages is the integration layer and legitimately needs Apollo / router / formik). CI fails on violation. Run `rg "@mui|@emotion" src/crd src/main/crdPages` and `rg "@apollo/client|@/domain|react-router-dom|formik" src/crd` as manual double-checks and expect zero matches
- [ ] T069 [US4] Concurrent-edit handling (spec Edge Cases "last save wins"): in every tab's `use<Tab>TabData.ts`, detect the Apollo conflict/version mismatch error shape and surface an inline banner inside the affected card offering "Reload current values" (refetches and clears the dirty buffer) vs "Discard my changes" (keeps server state). Covered under US4 because the Community tab is the most exposed to concurrent edits; applies to all other editable tabs

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** — no dependencies
- **Phase 2 (Foundational)** — depends on Phase 1; blocks every user-story phase
- **Phase 3–6 (US1–US4)** — each depends only on Phase 2; may be worked on in parallel by separate developers
- **Phase 7 (Polish)** — depends on every user-story phase (all 8 tabs must ship together per FR-018)

### User Story Dependencies

- **US1 (About)** — foundational only
- **US2 (Layout)** — foundational + dnd-kit dependency (Phase 1 T001)
- **US3 (Subspaces / Templates / Storage)** — foundational only
- **US4 (Community / Settings / Account)** — foundational only; Community tab additionally depends on the `MemberRow` shape from spec 084

### Within Each User Story

- Tests first when included (FAIL before implementation)
- Presentational view + mapper (parallelizable) → data hook (depends on both) → page wiring → i18n strings
- Each destructive action must route through `ConfirmDeleteDialog` (seeded in Phase 2)

### Parallel Opportunities

- All `[P]` Setup tasks (T002–T004) can run in parallel
- All `[P]` Foundational tasks (T005–T009, T011, T016) can run in parallel
- Once Phase 2 is complete, US1, US2, US3, US4 can start in parallel for different developers
- Within a story, view/mapper tasks marked `[P]` run in parallel; the data hook task follows

---

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "Mapper unit test at src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.test.ts"
Task: "View component test at src/crd/components/space/settings/SpaceSettingsAboutView.test.tsx"

# Presentational layer in parallel:
Task: "Create src/crd/components/space/settings/SpaceSettingsAboutView.tsx"
Task: "Create src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.ts"

# Then sequential:
Task: "Create useAboutTabData.ts wiring generated Apollo hooks"
Task: "Wire About tab into CrdSpaceSettingsPage.tsx"
Task: "Add About strings to spaceSettings.en.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — for internal validation)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — shell, tab strip, save bar, dirty guard, route wiring
3. Complete Phase 3: About tab
4. **STOP and VALIDATE**: toggle CRD on, edit a space's About tab end-to-end, keep toggle off for production users

### Release Cut (required for real users)

Per FR-018, the CRD Space Settings page MUST NOT be enabled until all 8 tabs are migrated. The release sequence is therefore:

1. Phase 1 + Phase 2 complete
2. Phases 3 + 4 (both P1 stories)
3. Phase 5 (P2 story covering Subspaces / Templates / Storage)
4. Phase 6 (P3 story covering Community / Settings / Account)
5. Phase 7 polish
6. Flip the toggle default only after all phases are validated

### Parallel Team Strategy

1. Whole team lands Phases 1–2 together
2. After the Phase 2 checkpoint, split:
   - Developer A: US1 (About)
   - Developer B: US2 (Layout, including dnd-kit keyboard sensor)
   - Developer C: US3 (Subspaces / Templates / Storage)
   - Developer D: US4 (Community / Settings / Account) — coordinates with spec 084 author on `MemberRow`
3. Reconvene for Phase 7

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks in the same phase
- `[Story]` label maps task to the user story for traceability and parallel assignment only — per FR-018 all 8 tabs release together
- Existing MUI Space Admin (`src/domain/spaceAdmin/*`) is NOT touched in this feature; it continues to serve admins with the CRD toggle off
- Every destructive action MUST use `ConfirmDeleteDialog`; every tab-switch or page-exit with a dirty tab MUST use `ConfirmDiscardDialog`
- Commit after each task or cohesive group; all commits must be signed; run `pnpm lint` before staging
