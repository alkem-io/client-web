---
description: "Task list for CRD Space Settings Page implementation"
---

# Tasks: CRD Space Settings Page

**Input**: Design documents from `/specs/045-crd-space-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included per `research.md` Decision 12 (mapper unit tests per tab + component tests for shell/Layout grab-mode/dirty-state + integration tests for `useDirtyTabGuard` and `useDeferredColumnMenu`). E2E out of scope.

**Organization**: Eight user-story phases (US1–US8), one per tab. All are P1 and ship together per FR-030. The story labels exist for traceability and parallel assignment; no tab is "less important" than another.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no dependency on incomplete tasks in the same phase)
- **[Story]**: US1 About / US2 Layout / US3 Community / US4 Subspaces / US5 Templates / US6 Storage / US7 Settings / US8 Account
- Absolute file paths given from repo root

---

## Phase 1: Setup

- [ ] T001 Verify `@dnd-kit/core` and `@dnd-kit/sortable` are already installed in `package.json` (they are, per the existing repo). No `pnpm add` is needed — the `Announcements` API in `@dnd-kit/core` is sufficient for FR-011 grab-mode live-region announcements; the additional `@dnd-kit/accessibility` convenience package is NOT required
- [ ] T002 [P] Create the empty folder skeleton `src/crd/components/space/settings/` and `src/main/crdPages/topLevelPages/spaceSettings/{about,layout,community,subspaces,templates,storage,settings,account}/`
- [ ] T003 [P] Create the empty i18n folder `src/crd/i18n/spaceSettings/` and a placeholder `spaceSettings.en.json` with `{}`
- [ ] T004 [P] Register the `crd-spaceSettings` namespace in the i18n loader following the pattern used by `crd-exploreSpaces` / `crd-search` (lazy-loaded)
- [ ] T005 [P] Port `prototype/src/app/components/ui/tabs.tsx` → `src/crd/primitives/tabs.tsx` (shadcn + Radix Tabs), `className` prop, `cn()`, CVA variants, zero application knowledge
- [ ] T006 [P] Port `prototype/src/app/components/ui/textarea.tsx` → `src/crd/primitives/textarea.tsx`
- [ ] T007 [P] Port `prototype/src/app/components/ui/table.tsx` → `src/crd/primitives/table.tsx` (used by Community tables, Storage tree, Account entitlements)

---

## Phase 2: Foundational (Blocking Prerequisites)

**No user-story work begins until this phase is complete.**

- [ ] T008 Extend `src/crd/components/dialogs/ConfirmationDialog.tsx` in place to cover both `variant: 'delete'` and `variant: 'discard'` per `contracts/shell.ts` `ConfirmationDialogProps`. Do NOT create any parallel dialog component
- [ ] T009 [P] Create `src/crd/components/common/InlineEditText.tsx` — shared inline-edit primitive. Props: `value`, `onChange`, `placeholder?`, `multiline?`, `ariaLabel`. Used by Layout **column title** and **column description** only (callout title and description are read-only on the Layout tab — edited from the post's own page)
- [ ] T010 [P] Create `src/crd/components/space/settings/SpaceSettingsCard.tsx` — title + inline description + body slot primitive used by every tab
- [ ] T011 [P] Create `src/crd/components/space/settings/SpaceSettingsTabStrip.tsx` per `SpaceSettingsTabStripProps` — composes `src/crd/primitives/tabs.tsx` (ported in T005); icon + label per tab from `lucide-react`; horizontally scrollable via Tailwind `overflow-x-auto`. Radix Tabs provides `role="tablist"` + arrow nav
- [ ] T012 [P] Create `src/crd/components/space/settings/SpaceSettingsSaveBar.tsx` per `SpaceSettingsSaveBarProps` — sticky bottom-right; hidden on `kind: 'clean'`; Save disabled when `canSave: false`. **Only used by the Layout tab** (About uses per-field autosave — no save bar)
- [ ] T013 Create `src/crd/components/space/settings/SpaceSettingsShell.tsx` per `SpaceSettingsShellProps` — reuses `src/crd/components/space/SpaceHeader.tsx` (verbatim — SC-008), renders `SpaceSettingsTabStrip` below, yields the active tab via `children`
- [ ] T014 [P] Create `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.ts` per `contracts/shell.ts` — reads/writes active `TabId` from URL (`/settings/:tab`); normalizes unknown values to `'about'`
- [ ] T015 Create `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.ts` per `contracts/data-mapper.ts` — wires react-router `useBlocker`, window `beforeunload`, and intercepts `onTabChange` to open the `ConfirmationDialog` discard variant when the Layout buffer is dirty. **Only Layout can trigger the confirm dialog.** When the admin leaves the About tab, the guard instead calls `useAboutTabData().flushPending()` so any in-flight debounced autosave fires immediately; no confirm dialog is shown
- [ ] T016 Create `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` — route entry. Composes `SpaceSettingsShell`, owns the single `useDirtyTabGuard` instance, pulls `activeTab` from `useSpaceSettingsTab`, renders per-tab views (wired in each Phase 3+)
- [ ] T017 Update `src/main/routing/TopLevelRoutes.tsx` — branch the Space Settings route on `useCrdEnabled()`. When true, render `CrdSpaceSettingsPage`; when false, render the existing MUI `SpaceAdminPage`. Keep the same URL paths
- [ ] T018 Seed `src/crd/i18n/spaceSettings/spaceSettings.en.json` with tab labels (About / Layout / Community / Subspaces / Templates / Storage / Settings / Account), confirmation dialog strings (delete + discard variants), and generic Save / Reset / Cancel copy
- [ ] T019 [P] Integration test `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.test.ts` — with a mock tab that toggles dirty, asserts that a dirty tab switch is blocked by the confirm dialog, a clean switch passes through, and the guard is a no-op for non-About/non-Layout tabs
- [ ] T020 [P] Unit test `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.test.ts` — URL `/settings/:tab` → `TabId`, unknown values normalize to `'about'`, setting active tab updates URL (FR-003)

**Checkpoint**: Foundation ready — Phases 3–10 may begin in any order and in parallel.

---

## Phase 3: User Story 1 — About tab (Priority: P1)

**Goal**: An admin can view and edit every About field. Each field autosaves 2 seconds after the admin stops editing (file uploads autosave immediately). A per-field spinner / "Saved!" / error indicator renders next to each field label. NO Save Changes or Reset button on this tab. The Preview card updates live on every edit.

**Independent Test**: Open About. Edit name — wait 2 seconds — observe spinner next to Name, then "Saved!" when the mutation returns. Edit What — same. Upload a new avatar — autosave fires immediately on upload completion. Verify there are NO Save Changes or Reset buttons anywhere on the tab. Reload — every change persists.

### Tests for User Story 1

- [ ] T021 [P] [US1] Mapper unit test `src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.test.ts` — covers every field mapping (name, tagline, email, pronouns, country, city, avatar, page banner, card banner, visuals, tags, references, what/why/who) and `pickColorFromId` attachment to the Preview
- [ ] T022 [P] [US1] View component test `src/crd/components/space/settings/SpaceSettingsAboutView.test.tsx` — typing into name updates Preview; the per-field `autosaveState` map drives the correct indicator render (spinner / "Saved!" / error) next to the matching field label; the view renders NO Save or Reset button anywhere
- [ ] T022a [P] [US1] Hook test `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.test.ts` — text-field `onChange` schedules a 2s debounced autosave and emits `autosaveState.<field> = 'pending'` → `'saving'` → `'saved'`; the `'saved'` state is held for exactly 2 seconds then transitions back to `'idle'` (assert via fake timers); file uploads fire the mutation immediately without debounce; `flushPending()` flushes any in-flight debounce immediately; a mutation error puts `autosaveState.<field> = { kind: 'error', message }` and the error persists until the next `onChange` clears it (NO automatic retry)

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create `src/crd/components/space/settings/SpaceSettingsAboutView.tsx` per `contracts/tab-about.ts`. Two-column layout (field cards on the left, SpaceCard Preview on the right). Each field (or obviously-paired pair — country+city, email+pronouns) is its own CRD card, no umbrella grouping. Compose: `input` (name/tagline/email/pronouns/country/city), `MarkdownEditor` (What / Why / Who), `tags-input` (tags), references list (with Add Reference + remove-X per row), avatar upload, page banner upload, card banner upload, visuals gallery. Render per-field **autosave indicator** next to each field's label driven by `autosaveState[field]`: spinner on `'saving'`, grayed "Saved!" on `'saved'`, inline error on `'error'`, nothing on `'idle'` / `'pending'`. Each indicator slot MUST be a `role="status"` element with `aria-live="polite"` and an `aria-label` resolved via `t('spaceSettings.about.saveStatus.<state>', { field: <label> })` so screen readers announce the state change (FR-032, CRD CLAUDE.md §Accessibility). **Render NO Save Changes or Reset button anywhere on the view.** Render per-card skeletons while the initial query loads; for fetch errors render an inline error banner at the top of the card column (FR-028)
- [ ] T024 [P] [US1] Create `src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.ts` — pure function `SpaceAboutFullQuery → AboutViewProps`. Attach `color = pickColorFromId(space.id)` to the Preview
- [ ] T025 [US1] Create `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts` per `UseAboutTabData`. **No buffer, no `isDirty`, no `onSave` / `onReset`.** Maintains local form state for the Preview to read, and a per-field debounce timer map keyed by `AboutFieldKey`. `onChange(patch)` updates local state and (re)starts the 2-second timer on each affected field. When a timer fires, it sets `autosaveState.<field> = 'saving'` and invokes the existing generated Apollo mutation wrapped in `useTransition`. On success, sets `autosaveState.<field> = { kind: 'saved', at: Date.now() }` and clears after a short visible period. On error, sets `autosaveState.<field> = { kind: 'error', message }` and keeps the value in local state so retry on the next `onChange` works. File-upload / references / visuals callbacks fire the mutation immediately (no debounce). Expose `flushPending(): Promise<void>` that fires any pending debounced autosaves immediately and resolves when they settle; `useDirtyTabGuard` calls this on tab-away from About
- [ ] T026 [US1] Wire About into `CrdSpaceSettingsPage.tsx`; register `flushPending` with `useDirtyTabGuard` so the page flushes pending About autosaves immediately on tab switch / navigation (no confirm dialog — FR-005a / FR-026)
- [ ] T027 [US1] Add About-tab strings to `spaceSettings.en.json` — every field label, helper text, the "Saved!" indicator string, the generic autosave error message

**Checkpoint**: About tab functional end-to-end with per-field autosave and zero Save / Reset surface.

---

## Phase 4: User Story 2 — Layout tab (Priority: P1)

**Goal**: An admin can reorder callouts within/across columns, inline-edit **column** titles and descriptions, mark callouts for removal (visibly staged, not yet committed), flip the Post description display toggle, and commit all of it atomically via Save Changes. No mutation fires before Save. Reset reverts to backend state. Callout title/description are rendered read-only — editing the post's own text happens on the post's page.

**Independent Test**: Drag a callout Home → Community. Do not save. Click Reset — callout returns. Drag again, rename a column title inline, Remove a different callout from tab (row stays with pending-removal styling), toggle Post description display, click Save. Reload — column rename persists, the removed callout is unassigned, the display toggle sticks. Verify callout title/description are not editable on this tab.

### Tests for User Story 2

- [ ] T028 [P] [US2] Mapper unit test `layout/layoutMapper.test.ts` — system vs callout discrimination via `__typename === 'Callout'`; column grouping; order preservation
- [ ] T029 [P] [US2] View component test `SpaceSettingsLayoutView.test.tsx` — dnd-kit keyboard sensor drives Space → Arrow Down → Enter to reorder; system rows cannot enter grab-mode; cross-column Arrow Right moves the callout; **inline-edit of column title and column description only** — no inline-edit affordance on callout titles/descriptions. Zero mutations fire on any of these interactions (assert Apollo mock received no calls until Save Changes). **Save-in-flight button state** (FR-008): while `saveBar.kind === 'saving'`, both the Save Changes button AND the Reset button are disabled. **Save-error retry** (FR-008): simulate a failing Save Changes mutation; assert `saveBar.kind === 'saveError'`, both Save Changes and Reset are re-enabled, the buffer contents are unchanged, and clicking Save Changes again issues a fresh mutation attempt against the same buffer
- [ ] T029a [P] [US2] Component test `LayoutCalloutRow.test.tsx` — opening the visible kebab shows exactly three entries in order (Move to / View Post / Remove from Tab); the Move to submenu lists exactly the other three columns; clicking each entry fires the correct prop callback; pinned system rows render NO kebab; Remove from Tab is rendered with destructive styling; the callout row renders NO "Active phase" / "Default post template" entries (those belong to the column, not the callout). **When `pendingRemoval === true`**, the row renders with pending-removal styling and the kebab's Remove entry is replaced by **Undo removal** wired to `onUndoRemoveFromTab`. Callout title and description are rendered read-only (no inline-edit affordance). Zero mutations are fired by any of these interactions (assert via Apollo mock)
- [ ] T030 [P] [US2] Integration test `layout/useDeferredColumnMenu.test.ts` — exercises both `onChangeActivePhase(columnId, phaseId)` and `onSetAsDefaultPostTemplate(columnId, templateId)` per column with `isDeferredMenuVisible` both `false` and `true`, so flipping the flag later requires no additional test work (SC-009)
- [ ] T030a [P] [US2] Component test `LayoutPoolColumn.test.tsx` — column header shows NO overflow trigger when `isDeferredMenuVisible === false`; shows the overflow trigger with "Active phase" and "Default post template" entries when `isDeferredMenuVisible === true`; clicking each entry fires `deferredColumnMenuActions.onChangeActivePhase(column.id, phaseId)` / `onSetAsDefaultPostTemplate(column.id, templateId)` with the correct column.id; column title and description are inline-editable via `onRenameColumn`

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create `src/crd/components/space/settings/LayoutCalloutRow.tsx` — row with grab handle, **read-only** title and description (NO inline-edit on callouts — edited from the post's own page), pinned lock icon when `kind === 'system'`. Shows post description only when `postDescriptionDisplay === 'expanded'`. When `pendingRemoval === true`, render the row with a pending-removal visual treatment (reduced opacity + strikethrough on the title, or a "will be removed" badge) and replace the kebab's Remove entry with **Undo removal** wired to `onUndoRemoveFromTab(callout.id)`. **Render the visible three-dot kebab** for movable rows (not for pinned system rows) with exactly three entries in this order: (1) **Move to** submenu listing the other three columns — calls `onMoveToColumn(callout.id, target)`; (2) **View Post** — calls `onViewPost(callout.id)`; (3) **Remove from Tab** with destructive styling — calls `onRemoveFromTab(callout.id)`. This row does NOT host the deferred "Active phase" / "Default post template" actions — those are per-column (see T032)
- [ ] T032 [P] [US2] Create `src/crd/components/space/settings/LayoutPoolColumn.tsx` — column card with `InlineEditText` for column title + description, ordered list of `LayoutCalloutRow`. **Hosts the deferred per-column overflow menu** (Active phase / Default post template). When `isDeferredMenuVisible === false` (this iteration), render NO overflow trigger on the column header. When the designer later flips the flag, the column header surfaces an overflow button that opens a menu wired to `deferredColumnMenuActions.onChangeActivePhase(column.id, phaseId)` and `deferredColumnMenuActions.onSetAsDefaultPostTemplate(column.id, templateId)`
- [ ] T033 [US2] Create `src/crd/components/space/settings/SpaceSettingsLayoutView.tsx` per `contracts/tab-layout.ts` — composes four `LayoutPoolColumn`s inside a `DndContext` with `PointerSensor` + `KeyboardSensor`. Columns use `InlineEditText` for their title and description; callout rows are read-only (see T031). Configure dnd-kit's `Announcements` API with i18n-resolved messages for `onDragStart`, `onDragOver`, `onDragEnd`, `onDragCancel` so the ARIA live region announces grab-mode state per FR-011. Filter pinned rows out of drop targets. Render per-column skeletons while loading + inline error banner on save/fetch error (FR-028). Include the Post description display toggle at the top of the view
- [ ] T034 [P] [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts` — maps space tabset payload into four `LayoutPoolColumn`s, tagging each entry as `'system'` or `'callout'` via `__typename`
- [ ] T035 [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts` per `UseLayoutTabData`. Owns the **local dirty buffer** holding every buffered change: reorders, moves, pending removals (`pendingRemoval: true` per `LayoutCallout`), column renames, and the Post description display toggle. **Zero mutations fire before Save Changes (FR-008a)** — every action is buffer-only. Save flushes in one `useTransition` block: compute the minimum diff vs the backend snapshot and issue in order: column-rename → reorder/move → unassign-from-tab (for `pendingRemoval` entries) → `updateSpaceSettings` for `calloutDescriptionDisplayMode`. Reset discards buffer and re-seeds from latest backend snapshot (re-runs the existing query). Rejects reorder / Move to / Remove from Tab when source `kind === 'system'` (defense in depth). **Visible kebab callbacks**: `onMoveToColumn(calloutId, target)` reuses the `onReorder` pipeline with the last index in the target column; `onViewPost(calloutId)` navigates (router-level — when buffer is dirty, `useDirtyTabGuard` intercepts); `onRemoveFromTab(calloutId)` sets `pendingRemoval: true` in the buffer (no mutation); `onUndoRemoveFromTab(calloutId)` clears the flag
- [ ] T036 [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/useDeferredColumnMenu.ts` per `UseDeferredColumnMenu`. Returns `actions.onChangeActivePhase(columnId, phaseId)` + `actions.onSetAsDefaultPostTemplate(columnId, templateId)` + `availablePhases` + `availablePostTemplates`, all wired to the existing per-column mutations. Returns `isDeferredMenuVisible: false` (hard-coded this iteration — FR-010). Every mutation wrapped in `useTransition`
- [ ] T037 [US2] Wire Layout into `CrdSpaceSettingsPage.tsx`; propagate `markDirty`/`clearDirty` to `useDirtyTabGuard`
- [ ] T038 [US2] Add Layout-tab strings to `spaceSettings.en.json` (column titles + descriptions, empty-column copy, grab-mode live-region announcements, inline-edit placeholders, Post description display label)

**Checkpoint**: Layout tab functional including deferred-menu wiring behind the flag.

---

## Phase 5: User Story 3 — Community tab (Priority: P1)

**Goal**: An admin can manage space users in a paginated top table. Organizations and Virtual Contributors appear as separate 5-row tables inside their own collapsible sections.

**Independent Test**: Search a user, change their role, remove another (confirm). Expand Organizations — 5-row table appears. Expand Virtual Contributors — 5-row table appears. Edit the Application Form.

### Tests for User Story 3

- [ ] T039 [P] [US3] Mapper unit test `community/communityMapper.test.ts` — covers user / org / VC → `MemberRow` conversion for each `kind`

### Implementation for User Story 3

- [ ] T040 [P] [US3] Create `src/crd/components/space/settings/CommunityUsersTable.tsx` — main users table, 10 rows visible, pagination + search + role/status filters + Invite button. Built on `src/crd/primitives/table.tsx`. Row kebab: View Profile / Change Role / Resend / Revoke / Approve / Reject / Remove (conditional by status). Inline Approve / Reject icons for Pending rows
- [ ] T041 [P] [US3] Create `src/crd/components/space/settings/CommunityOrgsTable.tsx` — organizations table, 5 rows visible, inside a collapsible card. Uses the same row template as the users table
- [ ] T042 [P] [US3] Create `src/crd/components/space/settings/CommunityVirtualContributorsTable.tsx` — VC table, 5 rows visible, inside a collapsible card. Uses the same row template
- [ ] T043 [US3] Create `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx` per `contracts/tab-community.ts` — composes all three tables plus Application Form card (existing question list editor) and Community Guidelines card (MarkdownEditor + Save-as-Template). Per-card skeletons while loading + inline error banners on save/fetch error (FR-028)
- [ ] T044 [P] [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/community/communityMapper.ts`
- [ ] T045 [US3] Create `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts`. Dispatches `onRowAction(kind, id, action)` to the correct existing mutation (`useRoleSetManager`, `useRoleSetApplicationsAndInvitations`, VC admin mutations). Wrap every mutation in `useTransition`. Destructive row actions route through `ConfirmationDialog` (delete variant)
- [ ] T046 [US3] Wire Community into `CrdSpaceSettingsPage.tsx`
- [ ] T047 [US3] Add Community-tab strings to `spaceSettings.en.json`

**Checkpoint**: Community tab functional with three tables + Application Form + Guidelines.

---

## Phase 6: User Story 4 — Subspaces tab (Priority: P1)

**Goal**: An admin can browse, filter, and manage subspaces with the current MUI kebab (Pin/Unpin, Save as Template, Delete). Adds search, filter-by-archived, Grid/List view. Subspace-title click navigates.

**Independent Test**: Create a subspace. Switch to alphabetical sort, pin it. Save another as template. Delete one (confirm). Search by name. Filter Archived — archived subspaces appear. Toggle Grid/List. Title click → navigation.

### Tests for User Story 4

- [ ] T048 [P] [US4] Mapper unit test `subspaces/subspacesMapper.test.ts` — covers `visibility` → `'active' | 'archived'` mapping, pinned flag, and the fixed kebab action set (no Edit Details / Archive / View)

### Implementation for User Story 4

- [ ] T049 [P] [US4] Create `src/crd/components/space/settings/SpaceSettingsSubspacesView.tsx` per `contracts/tab-subspaces.ts`. Default Subspace Template selector card (with Change Default Template action). Search input, filter dropdown (All / Active / Archived), Grid/List view toggle. Subspace list in either grid or list view. Per-card kebab: **Pin/Unpin** (alphabetical only), **Save as Template**, **Delete** — no other entries. Title click triggers navigation via `href`. Skeletons while loading + inline error banner on fetch error (FR-028)
- [ ] T050 [P] [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/subspaces/subspacesMapper.ts`. Maps backend `SpaceVisibility.Archived` → `'archived'`
- [ ] T051 [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useSubspacesTabData.ts`. Wires existing mutations: `updateSubspacePinned`, `createTemplate` (Space), `deleteSpace`, `updateTemplateDefault`, existing subspace-creation flow. Wrap every mutation in `useTransition`. Delete routes through `ConfirmationDialog` (delete variant)
- [ ] T052 [US4] Wire Subspaces into `CrdSpaceSettingsPage.tsx`
- [ ] T053 [US4] Add Subspaces-tab strings to `spaceSettings.en.json`

**Checkpoint**: Subspaces tab functional with current kebab preserved + new search/filter/view-toggle + Default Template.

---

## Phase 7: User Story 5 — Templates tab (Priority: P1)

**Goal**: An admin can browse five collapsible template categories, search globally, and perform Preview / Duplicate / Edit / Delete on each card.

**Independent Test**: Expand each of the five categories. Search. Create a new custom template via Add New. Edit it, delete it (confirm). Duplicate a platform template as custom. Preview a template.

### Tests for User Story 5

- [ ] T054 [P] [US5] Mapper unit test `templates/templatesMapper.test.ts` — five-category grouping, `isCustom` detection

### Implementation for User Story 5

- [ ] T055 [P] [US5] Create `src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx` per `contracts/tab-templates.ts`. Five collapsible categories in order: Space / Collaboration Tool / Whiteboard / Post / Community Guidelines. Global search. Per-card kebab: Preview / Duplicate / Edit (custom only) / Delete (custom only). Skeletons per category; inline error banner per category on fetch error (FR-028)
- [ ] T056 [P] [US5] Create `src/main/crdPages/topLevelPages/spaceSettings/templates/templatesMapper.ts`
- [ ] T057 [US5] Create `src/main/crdPages/topLevelPages/spaceSettings/templates/useTemplatesTabData.ts`. Opens existing CRUD dialogs (wrapped with CRD styling). Delete routes through `ConfirmationDialog`. Wrap every mutation in `useTransition`
- [ ] T058 [US5] Wire Templates into `CrdSpaceSettingsPage.tsx`
- [ ] T059 [US5] Add Templates-tab strings to `spaceSettings.en.json`

**Checkpoint**: Templates tab functional.

---

## Phase 8: User Story 6 — Storage tab (Priority: P1)

**Goal**: An admin can browse the hierarchical document tree (folders + files), open a file, and delete a file with confirmation — preserving the current MUI UX restyled with CRD primitives.

**Independent Test**: Expand a folder. Click a file to open in new tab. Delete a file (confirm) — tree refreshes.

### Tests for User Story 6

- [ ] T060 [P] [US6] Mapper unit test `storage/storageMapper.test.ts` — covers folder/file discrimination, size formatting, uploader href construction

### Implementation for User Story 6

- [ ] T061 [P] [US6] Create `src/crd/components/space/settings/SpaceSettingsStorageView.tsx` per `contracts/tab-storage.ts`. Hierarchical tree rendered via `src/crd/primitives/table.tsx` + manual expand/collapse rows. Columns: name / size / uploader / uploaded-at. Actions: Open in new tab, Delete. Skeleton rows while loading + inline error banner above the tree on fetch error (FR-028)
- [ ] T062 [P] [US6] Create `src/main/crdPages/topLevelPages/spaceSettings/storage/storageMapper.ts`
- [ ] T063 [US6] Create `src/main/crdPages/topLevelPages/spaceSettings/storage/useStorageTabData.ts`. Wires `useSpaceStorageAdminPageQuery` + `useDeleteDocumentMutation`. Delete routes through `ConfirmationDialog`. Wrap in `useTransition`
- [ ] T064 [US6] Wire Storage into `CrdSpaceSettingsPage.tsx`
- [ ] T065 [US6] Add Storage-tab strings to `spaceSettings.en.json`

**Checkpoint**: Storage tab preserves current tree browser with CRD styling.

---

## Phase 9: User Story 7 — Settings tab (Priority: P1)

**Goal**: An admin can toggle every existing Space Settings control; each toggle fires immediately. Danger Zone deletes the space with confirmation.

**Independent Test**: Flip Visibility Public/Private. Flip Membership radio. Add / remove an applicable organization. Flip every Allowed Action. Click Delete this Space → confirmation dialog → cancel. Re-click → confirm (only if on a throwaway space).

### Tests for User Story 7

- [ ] T066 [P] [US7] Mapper unit test `settings/settingsMapper.test.ts`

### Implementation for User Story 7

- [ ] T067 [P] [US7] Create `src/crd/components/space/settings/SpaceSettingsSettingsView.tsx` per `contracts/tab-settings.ts`. Accordion sections: Visibility (radio) / Membership (radio) / Applicable Organizations (list + add + automatic access toggle) / Allowed Actions (all 9 toggles listed in `AllowedActionKey`) / Danger Zone (destructive card + Delete Space button). Skeletons while loading; inline error banner on fetch/save error (FR-028)
- [ ] T068 [P] [US7] Create `src/main/crdPages/topLevelPages/spaceSettings/settings/settingsMapper.ts`
- [ ] T069 [US7] Create `src/main/crdPages/topLevelPages/spaceSettings/settings/useSettingsTabData.ts`. Every toggle → immediate `updateSpaceSettings` mutation. Remove-organization → existing mutation. Delete Space → `ConfirmationDialog` (delete variant, list of what is deleted in description) → `deleteSpace`. Wrap every mutation in `useTransition`
- [ ] T070 [US7] Wire Settings into `CrdSpaceSettingsPage.tsx`
- [ ] T071 [US7] Add Settings-tab strings to `spaceSettings.en.json` (including the Danger Zone description enumerating what is deleted)

**Checkpoint**: Settings tab functional with Danger Zone.

---

## Phase 10: User Story 8 — Account tab (Priority: P1)

**Goal**: An admin sees URL, License + entitlements + usage, Visibility Status, Host Info (no Change Host), Support contact, and (if permitted) Delete Space. Read-only + three actions.

**Independent Test**: Verify URL with Copy. License shows plan + entitlements + progress bar. Visibility Status badge correct. Host card present without a Change Host button. Contact Alkemio Support opens support link. Delete Space (if permitted) runs existing flow.

### Tests for User Story 8

- [ ] T072 [P] [US8] Mapper unit test `account/accountMapper.test.ts` — plan + entitlement + visibility mapping; confirms `host` has no `onChangeHost` field (contract assertion)

### Implementation for User Story 8

- [ ] T073 [P] [US8] Create `src/crd/components/space/settings/SpaceSettingsAccountView.tsx` per `contracts/tab-account.ts`. URL card with Copy button. License card with progress bars built on `src/crd/primitives/table.tsx` (for entitlements) + progress rendering. Visibility Status badge. Host card — avatar + name + org badges, NO Change Host button. Support footer card with Contact Alkemio Support link. Delete Space button shown only when `canDeleteSpace`. Skeletons while loading; inline error banner on fetch error (FR-028)
- [ ] T074 [P] [US8] Create `src/main/crdPages/topLevelPages/spaceSettings/account/accountMapper.ts`
- [ ] T075 [US8] Create `src/main/crdPages/topLevelPages/spaceSettings/account/useAccountTabData.ts`. Query-only + `deleteSpace` mutation wrapped in `useTransition`. Copy URL uses `navigator.clipboard` from the hook (not from CRD)
- [ ] T076 [US8] Wire Account into `CrdSpaceSettingsPage.tsx`
- [ ] T077 [US8] Add Account-tab strings to `spaceSettings.en.json`

**Checkpoint**: Every tab functional. All 8 user stories independently testable.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T078 [P] Responsive QA: tab strip scrolls horizontally on narrow viewports; Layout's four columns stack; About's two columns stack; Community tables remain usable; Subspaces grid collapses to one column (SC-002)
- [ ] T079 [P] Accessibility audit: keyboard traversal across every tab; visible focus rings on every input; axe-core pass on `CrdSpaceSettingsPage` with zero violations; live-region announcements verified on save success/failure (Layout Save bar + About per-field autosave) and on Layout grab-mode transitions. **About autosave specifically**: confirm each field's autosave indicator is a `role="status"` with `aria-live="polite"` and a descriptive `aria-label` that changes with the state, so a screen-reader user hears the transition `saving → saved` (or the error message) for every edited field. Verify CRD CLAUDE.md Checklist: icons only from `lucide-react`; sr-only text only via `t()`; interactive elements are `<a>`/`<button>` only; icon-only buttons carry `aria-label`
- [ ] T080 SC-004 parity inventory: side-by-side compare MUI Space Admin vs CRD Space Settings for every action. File the checklist at `specs/045-crd-space-settings/checklists/parity.md`. Expect 0 missing actions except explicitly deferred items (Subspaces Edit Details/Archive; Layout per-column deferred menu CTA). **Also verify FR-031 (no GraphQL changes)**: confirm no `*.graphql` files under `src/domain/spaceAdmin/**` or any new `*.graphql` file under `src/main/crdPages/topLevelPages/spaceSettings/**` was added or edited; run `pnpm codegen` and confirm the generated files produce no diff
- [ ] T081 Toggle round-trip verification (SC-006): flip `alkemio-crd-enabled` off → MUI renders unchanged; flip on → CRD renders; no console errors; verified across all 8 tabs
- [ ] T082 [P] CRD forbidden-import guard (FR-029 + `src/crd/CLAUDE.md` Golden Rules): add ESLint `no-restricted-imports` for `src/crd/**` forbidding `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, `formik`. Apply narrower rule to `src/main/crdPages/**` forbidding only `@mui/*` and `@emotion/*`. Run `rg "@mui|@emotion" src/crd src/main/crdPages` and `rg "@apollo/client|@/domain|react-router-dom|formik" src/crd` as manual double-checks — expect zero matches
- [ ] T083 [P] Run `pnpm lint` and `pnpm vitest run`; attach results to the PR
- [ ] T084 Run the full quickstart manual checklist from `quickstart.md`. Record two separate timing measurements for SC-001: (a) **Layout** — time the full Save Changes round-trip starting from the click to the action bar clearing (target < 60s for a typical buffer). (b) **About** — edit any text field, stop typing, and time from the last keystroke to the moment the "Saved!" indicator renders (target < 3s; the 2s debounce already accounts for ~2 of those seconds). Attach screenshots to the PR description
- [ ] T085 Hero parity check (SC-008): side-by-side screenshots of the CRD space hero as it appears on the CRD Space Page (spec 042) vs on CRD Space Settings. File in `checklists/parity.md`; block-merge on any divergence

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** — no dependencies
- **Phase 2** — depends on Phase 1; blocks every user-story phase
- **Phases 3–10 (US1–US8)** — each depends only on Phase 2; may be worked on in parallel
- **Phase 11** — depends on every user-story phase (all 8 tabs must ship together per FR-030)

### User Story Dependencies

- US1 About — foundational only
- US2 Layout — foundational + dnd-kit (T001) + `InlineEditText` (T009)
- US3 Community — foundational + `table.tsx` (T007)
- US4 Subspaces — foundational only
- US5 Templates — foundational only
- US6 Storage — foundational + `table.tsx` (T007)
- US7 Settings — foundational only
- US8 Account — foundational + `table.tsx` (T007) for entitlements

### Within Each User Story

- Tests first (FAIL before implementation)
- Presentational view + mapper (parallelizable) → data hook (depends on both) → page wiring → i18n strings
- Every destructive action routes through `ConfirmationDialog` (T008)

### Parallel Opportunities

- All `[P]` Setup tasks (T002–T007) run in parallel
- Most `[P]` Foundational tasks (T009–T012, T014, T019–T020) run in parallel (T008, T013, T015–T018 have ordering)
- After Phase 2, all 8 user stories can start in parallel for different developers
- Within a story, view + mapper + test tasks marked `[P]` run in parallel; the data hook task follows

---

## Parallel Example: User Story 2 (Layout)

```bash
# Tests in parallel:
Task: "Mapper unit test at src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.test.ts"
Task: "View component test SpaceSettingsLayoutView.test.tsx"
Task: "Integration test useDeferredColumnMenu.test.ts"

# Presentational layer in parallel:
Task: "Create src/crd/components/space/settings/LayoutCalloutRow.tsx"
Task: "Create src/crd/components/space/settings/LayoutPoolColumn.tsx"
Task: "Create src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts"

# Then sequential:
Task: "Create SpaceSettingsLayoutView.tsx composing the two row + column components"
Task: "Create useLayoutTabData.ts with the local buffer + Reset model"
Task: "Create useDeferredColumnMenu.ts wiring per-column Active-phase and Default-post-template mutations"
Task: "Wire Layout tab into CrdSpaceSettingsPage.tsx"
Task: "Add Layout strings to spaceSettings.en.json"
```

---

## Implementation Strategy

### Release Cut (required for real users — FR-030)

All 8 tabs ship together. The release sequence is:

1. Phase 1 (Setup)
2. Phase 2 (Foundational)
3. Phases 3–10 (US1–US8) — can be run in parallel by up to 8 developers
4. Phase 11 (Polish)
5. Flip the toggle default ONLY after every phase is validated

### Parallel Team Strategy

Whole team lands Phases 1–2 together. After the Phase 2 checkpoint:

- Dev A: US1 (About)
- Dev B: US2 (Layout — the longest single phase; consider pairing)
- Dev C: US3 (Community — three tables)
- Dev D: US4 (Subspaces)
- Dev E: US5 (Templates)
- Dev F: US6 (Storage)
- Dev G: US7 (Settings)
- Dev H: US8 (Account)

Reconvene for Phase 11.

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks in the same phase
- `[Story]` maps task → user story for traceability and parallel assignment; **no tab is lower-priority** — all 8 are P1 and ship together
- Existing MUI Space Admin (`src/domain/spaceAdmin/*`) is NOT touched; it continues to serve admins when the CRD toggle is off
- Every destructive action MUST use `ConfirmationDialog` (delete variant); every tab-switch or page-exit with a dirty About/Layout tab MUST use `ConfirmationDialog` (discard variant)
- Commit after each task or cohesive group; all commits must be signed; run `pnpm lint` before staging
- The deferred Layout per-**column** menu ("Active phase", "Default post template") is implemented + tested in this iteration but not surfaced in the UI (FR-010); flipping `isDeferredMenuVisible` to `true` in a follow-up patch is a one-line component change in `LayoutPoolColumn.tsx` (SC-009)
