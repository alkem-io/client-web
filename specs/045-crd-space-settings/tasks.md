---
description: "Task list for CRD Space Settings Page implementation"
---

# Tasks: CRD Space Settings Page

**Input**: Design documents from `/specs/045-crd-space-settings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included per `research.md` Decision 12 (mapper unit tests per tab + component tests for shell/Layout grab-mode/dirty-state + integration tests for `useDirtyTabGuard` and `useColumnMenu`). E2E out of scope.

**Organization**: Eight user-story phases (US1–US8), one per tab. All are P1 and ship together per FR-030. The story labels exist for traceability and parallel assignment; no tab is "less important" than another.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no dependency on incomplete tasks in the same phase)
- **[Story]**: US1 About / US2 Layout / US3 Community / US4 Subspaces / US5 Templates / US6 Storage / US7 Settings / US8 Account
- Absolute file paths given from repo root

---

## Phase 1: Setup

- [X] T001 Verify `@dnd-kit/core` and `@dnd-kit/sortable` are already installed in `package.json` (they are, per the existing repo). No `pnpm add` is needed — the `Announcements` API in `@dnd-kit/core` is sufficient for FR-011 grab-mode live-region announcements; the additional `@dnd-kit/accessibility` convenience package is NOT required
- [X] T002 [P] Create the empty folder skeleton `src/crd/components/space/settings/` and `src/main/crdPages/topLevelPages/spaceSettings/{about,layout,community,subspaces,templates,storage,settings,account}/`
- [X] T003 [P] Create the empty i18n folder `src/crd/i18n/spaceSettings/` and a placeholder `spaceSettings.en.json` with `{}`
- [X] T004 [P] Register the `crd-spaceSettings` namespace in the i18n loader following the pattern used by `crd-exploreSpaces` / `crd-search` (lazy-loaded)
- [X] T005 [P] Port `prototype/src/app/components/ui/tabs.tsx` → `src/crd/primitives/tabs.tsx` (shadcn + Radix Tabs), `className` prop, `cn()`, CVA variants, zero application knowledge
- [X] T006 [P] Port `prototype/src/app/components/ui/textarea.tsx` → `src/crd/primitives/textarea.tsx`
- [X] T007 [P] Port `prototype/src/app/components/ui/table.tsx` → `src/crd/primitives/table.tsx` (used by Community tables, Storage tree, Account entitlements)

---

## Phase 2: Foundational (Blocking Prerequisites)

**No user-story work begins until this phase is complete.**

- [X] T008 Extend `src/crd/components/dialogs/ConfirmationDialog.tsx` in place to cover both `variant: 'delete'` and `variant: 'discard'` per `contracts/shell.ts` `ConfirmationDialogProps`. Do NOT create any parallel dialog component
- [X] T009 [P] Create `src/crd/components/common/InlineEditText.tsx` — shared inline-edit primitive. Props: `value`, `onChange`, `placeholder?`, `multiline?`, `ariaLabel`. Used by Layout **column title** and **column description** only (callout title and description are read-only on the Layout tab — edited from the post's own page). **Hover-reveal affordance (FR-006a)**: renders value as plain text by default; on hover, the text gains a 1px underline in `text-muted-foreground` and a trailing `Pencil` icon (`lucide-react`) at `size-3` with `ml-1` spacing; clicking either the text or the pencil enters edit mode. The pencil is keyboard-focusable (Enter / Space activates). No always-visible pencil button.
- [X] T010 [P] Create `src/crd/components/space/settings/SpaceSettingsCard.tsx` — title + inline description + body slot primitive used by every tab
- [X] T011 [P] Create `src/crd/components/space/settings/SpaceSettingsTabStrip.tsx` per `SpaceSettingsTabStripProps` — composes `src/crd/primitives/tabs.tsx` (ported in T005); icon + label per tab from `lucide-react`; horizontally scrollable via Tailwind `overflow-x-auto`. Radix Tabs provides `role="tablist"` + arrow nav
- [X] T012 [P] Create `src/crd/components/space/settings/SpaceSettingsSaveBar.tsx` per `SpaceSettingsSaveBarProps` — sticky bottom-right; hidden on `kind: 'clean'`; Save disabled when `canSave: false`. **Only used by the Layout tab** (About uses per-field autosave — no save bar)
- [X] T013 Create `src/crd/components/space/settings/SpaceSettingsShell.tsx` per `SpaceSettingsShellProps` — reuses `src/crd/components/space/SpaceHeader.tsx` (verbatim — SC-008), renders `SpaceSettingsTabStrip` below, yields the active tab via `children`
- [X] T014 [P] Create `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.ts` per `contracts/shell.ts` — reads/writes active `TabId` from URL (`/settings/:tab`); normalizes unknown values to `'about'`
- [X] T015 Create `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.ts` per `contracts/data-mapper.ts` — wires react-router `useBlocker`, window `beforeunload`, and intercepts `onTabChange` to open the `ConfirmationDialog` discard variant when the Layout buffer is dirty. **Only Layout can trigger the confirm dialog.** When the admin leaves the About tab, the guard instead calls `useAboutTabData().flushPending()` so any in-flight debounced autosave fires immediately; no confirm dialog is shown
- [X] T016 Create `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` — route entry. Composes `SpaceSettingsShell`, owns the single `useDirtyTabGuard` instance, pulls `activeTab` from `useSpaceSettingsTab`, renders per-tab views (wired in each Phase 3+)
- [X] T017 Update `src/main/routing/TopLevelRoutes.tsx` — branch the Space Settings route on `useCrdEnabled()`. When true, render `CrdSpaceSettingsPage`; when false, render the existing MUI `SpaceAdminPage`. Keep the same URL paths
- [X] T018 Seed `src/crd/i18n/spaceSettings/spaceSettings.en.json` with tab labels (About / Layout / Community / Subspaces / Templates / Storage / Settings / Account), confirmation dialog strings (delete + discard variants), and generic Save / Reset / Cancel copy
- [X] T019 [P] Integration test `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.test.ts` — with a mock tab that toggles dirty, asserts that a dirty tab switch is blocked by the confirm dialog, a clean switch passes through, and the guard is a no-op for non-About/non-Layout tabs
- [X] T020 [P] Unit test `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.test.ts` — URL `/settings/:tab` → `TabId`, unknown values normalize to `'about'`, setting active tab updates URL (FR-003)

**Checkpoint**: Foundation ready — Phases 3–10 may begin in any order and in parallel.

---

## Phase 3: User Story 1 — About tab (Priority: P1)

**Goal**: An admin can view and edit every About field. Each field autosaves 2 seconds after the admin stops editing (file uploads autosave immediately). A per-field spinner / "Saved!" / error indicator renders next to each field label. NO Save Changes or Reset button on this tab. The Preview card updates live on every edit.

**Independent Test**: Open About. Edit name — wait 2 seconds — observe spinner next to Name, then "Saved!" when the mutation returns. Edit What — same. Upload a new avatar — autosave fires immediately on upload completion. Verify there are NO Save Changes or Reset buttons anywhere on the tab. Reload — every change persists.

### Tests for User Story 1

- [ ] T021 [P] [US1] Mapper unit test `src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.test.ts` — covers every field mapping (name / tagline / country / city / avatar / pageBanner / cardBanner / tagsetId + tags / profileId + references (title + URL + description) / what (= `profile.description`) / why / who) and the Preview card derivation (initials, `pickColorFromId` color, `href`). **No `email`, `pronouns`, or standalone `visualsGallery`** — these do not exist on Space profile. **No `memberCount` on the Preview** — member count is not editable from About
- [ ] T022 [P] [US1] View component test `src/crd/components/space/settings/SpaceSettingsAboutView.test.tsx` — typing into name updates Preview; the per-field `autosaveState` map drives the correct indicator render (spinner / "Saved!" / error) next to the matching field label; the view renders NO Save or Reset button anywhere
- [ ] T022a [P] [US1] Hook test `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.test.ts` — text-field `onChange` schedules a 2s debounced autosave and emits `autosaveState.<field> = 'pending'` → `'saving'` → `'saved'`; the `'saved'` state is held for exactly 2 seconds then transitions back to `'idle'` (assert via fake timers); file uploads fire the mutation immediately without debounce; `flushPending()` flushes any in-flight debounce immediately; a mutation error puts `autosaveState.<field> = { kind: 'error', message }` and the error persists until the next `onChange` clears it (NO automatic retry)

### Implementation for User Story 1

- [X] T022b [P] [US1] Audit outcome per research Decision 12a: the existing `src/crd/components/space/SpaceCard.tsx` already matches everything the About Preview needs (banner, avatar, privacy badge, name, description, tags). **No code change is required.** The About mapper simply constructs a minimal `SpaceCardData` from live form state and passes it to the unchanged component; sections SpaceCard supports but About doesn't edit (LEADS, membership badge, parent indicator, pinned badge) are left unset and the component hides them automatically. Props remain plain TypeScript (no GraphQL types per CRD CLAUDE.md)
- [X] T023 [P] [US1] Create `src/crd/components/space/settings/SpaceSettingsAboutView.tsx` per `contracts/tab-about.ts`. Two-column layout (field cards on the left, the shared `SpaceCard` from T022b rendered as the live Preview on the right). Cards in this order: **Name** (single `input`), **Tagline** (`input`), **Space Branding** (one card containing the three Visual upload tiles: avatar, page banner 1536×256, card banner 416×256 — same upload + crop flow the current MUI uses via `VisualUpload` + `CropDialog`), **Location** (country + city pair in a single card using the existing `LocationSegment` inputs or equivalent CRD-styled replacements), **What** / **Why** / **Who** (`MarkdownEditor` each, one per card), **Tags** (`tags-input`), **References** (list with title + URL + description per row, Add Reference button, remove-X per row — full CRUD matching current MUI). `InlineEditText` is NOT used on the About tab; every field has a visible input wrapper. Render per-field **autosave indicator** next to each field's label driven by `autosaveState[field]`: spinner on `'saving'`, grayed "Saved!" on `'saved'`, inline error on `'error'`, nothing on `'idle'` / `'pending'`. Each indicator slot MUST be a `role="status"` element with `aria-live="polite"` and an `aria-label` resolved via `t('spaceSettings.about.saveStatus.<state>', { field: <label> })` so screen readers announce the state change (FR-032, CRD CLAUDE.md §Accessibility). **Render NO Save Changes or Reset button anywhere on the view.** Render per-card skeletons while the initial query loads; for fetch errors render an inline error banner at the top of the card column (FR-028). **No email / pronouns / standalone visuals gallery** — those fields do not exist on Space profile
- [X] T024 [P] [US1] Create `src/main/crdPages/topLevelPages/spaceSettings/about/aboutMapper.ts` — pure function `useSpaceAboutDetailsQuery` payload → `AboutFormValues` + `SpaceCardPreview`. Pull `profileId = profile.id`, `tagsetId = profile.tagset.id`. Attach `color = pickColorFromId(space.id)` and `initials` (2 uppercase characters from the space name) to the Preview card
- [X] T025 [US1] Create `src/main/crdPages/topLevelPages/spaceSettings/about/useAboutTabData.ts` per `UseAboutTabData`. **No buffer, no `isDirty`, no `onSave` / `onReset`.** Uses `useSpaceAboutDetailsQuery` to read the initial data, maintains local form state for the Preview to read, and a per-field debounce timer map keyed by `AboutFieldKey`. `onChange(patch)` updates local state and (re)starts the 2-second timer per affected key. When a timer fires, it sets `autosaveState.<field> = 'saving'` and invokes the appropriate mutation wrapped in `useTransition`: text/markdown fields + location → `useUpdateSpaceMutation` (partial `UpdateSpaceInput` via the `mapProfileModelToUpdateProfileInput` helper pattern); tag changes → `useUpdateSpaceMutation` with `about.profile.tagsets: [{ ID: tagsetId, tags }]`; avatar / page banner / card banner → `useUploadVisualMutation({ file, uploadData: { visualID } })` fired immediately; reference add → `useCreateReferenceOnProfileMutation`; reference delete → `useDeleteReferenceMutation`; reference title / URL / description patch → `useUpdateSpaceMutation` with `profile.references: [{ ID, name, uri, description }]`. On success, sets `autosaveState.<field> = { kind: 'saved', at: Date.now() }` and transitions back to `'idle'` after 2 seconds. On error, sets `autosaveState.<field> = { kind: 'error', message }` and keeps the value in local state so retry on the next `onChange` works (no automatic retry). Expose `flushPending(): Promise<void>` that fires any pending debounced autosaves immediately and resolves when they settle
- [X] T026 [US1] Wire About into `CrdSpaceSettingsPage.tsx`; register `flushPending` with `useDirtyTabGuard` so the page flushes pending About autosaves immediately on tab switch / navigation (no confirm dialog — FR-005a / FR-026)
- [X] T027 [US1] Add About-tab strings to `spaceSettings.en.json` — every field label, helper text, the "Saved!" indicator string, the generic autosave error message

**Checkpoint**: About tab functional end-to-end with per-field autosave and zero Save / Reset surface.

---

## Phase 4: User Story 2 — Layout tab (Priority: P1)

**Goal**: An admin can reorder callouts within/across columns, inline-edit **column** titles and descriptions, mark callouts for removal (visibly staged, not yet committed), flip the Post description display toggle, and commit all of it atomically via Save Changes. No mutation fires before Save. Reset reverts to backend state. Callout title/description are rendered read-only — editing the post's own text happens on the post's page.

**Independent Test**: Drag a callout from one column to another. Do not save. Click Reset — callout returns. Drag again, rename a column title inline, toggle Post description display, click Save. Reload — every change persists. Verify callout title/description are not editable on this tab. Verify the per-callout kebab shows only Move to + View Post.

### Tests for User Story 2

- [ ] T028 [P] [US2] Mapper unit test `layout/layoutMapper.test.ts` — dynamic column count from `innovationFlow.states`, column grouping of callouts by `classification.flowState.tags[0]` matching state displayName, order preservation via `sortOrder`
- [ ] T029 [P] [US2] View component test `SpaceSettingsLayoutView.test.tsx` — **view-level behaviors**. dnd-kit keyboard sensor drives Space → Arrow Down → Enter to reorder; cross-column Arrow Right moves the callout; **inline-edit of column title and column description only** — no inline-edit affordance on callout titles/descriptions. Zero mutations fire on any of these interactions (assert Apollo mock received no calls until Save Changes). **Save-in-flight button state** (FR-008): while `saveBar.kind === 'saving'`, both the Save Changes button AND the Reset button are disabled. **Save-error retry** (FR-008): simulate a failing Save Changes mutation; assert `saveBar.kind === 'saveError'`, both Save Changes and Reset are re-enabled, the buffer contents are unchanged, and clicking Save Changes again issues a fresh mutation attempt against the same buffer
- [ ] T029b [P] [US2] Row component test `LayoutCalloutRow.test.tsx` — **per-callout row behaviors (FR-011a)**. Opening the visible kebab shows exactly two entries: Move to / View Post. The Move to submenu lists exactly the other columns on the current board (N-1 when there are N columns total) and clicking an entry fires `onMoveToColumn(callout.id, target)` with the correct target id. Clicking View Post fires `onViewPost(callout.id)`. Callout title and description are rendered read-only (no inline-edit affordance). Zero mutations fire during any of these interactions (Apollo mock asserts no calls — FR-008a)
- [ ] T030 [P] [US2] Integration test `layout/useColumnMenu.test.ts` — exercises `onChangeActivePhase(columnId)` and `onSetAsDefaultPostTemplate(columnId, templateId)` per column against mocked Apollo responses (SC-009)
- [ ] T030a [P] [US2] Component test `LayoutPoolColumn.test.tsx` — column header renders ONLY inline-editable title, inline-editable description, and the top-right three-dot overflow button (NO icon, NO callout-count badge, NO collapse arrow, NO create/delete/reorder-column affordance). Opening the overflow button shows two entries: "Active phase" and "Default post template"; clicking each fires `columnMenuActions.onChangeActivePhase(column.id)` / `onSetAsDefaultPostTemplate(column.id, templateId)` with the correct `column.id`. Inline-edit fields follow the FR-006a hover-reveal pattern (underline + pencil on hover)

### Implementation for User Story 2

- [X] T031 [P] [US2] Create `src/crd/components/space/settings/LayoutCalloutRow.tsx` — row with grab handle, **read-only** title and description (NO inline-edit on callouts — edited from the post's own page). Shows post description only when `postDescriptionDisplay === 'expanded'`. **Render the visible three-dot kebab** with exactly two entries, in this order: (1) **Move to** submenu listing the other columns on the current board — calls `onMoveToColumn(callout.id, target)`; (2) **View Post** — calls `onViewPost(callout.id)`. No "Remove from Tab", no "Undo removal". This row does NOT host the "Active phase" / "Default post template" actions — those are per-column (see T032)
- [X] T032 [P] [US2] Create `src/crd/components/space/settings/LayoutPoolColumn.tsx` — column card with (1) `InlineEditText` for column title (hover-reveal pencil per FR-006a), (2) `InlineEditText` for column description (same hover-reveal pattern, multiline), (3) a top-right **three-dot overflow button** that opens a dropdown with exactly two entries — "Active phase" and "Default post template" — wired to `columnMenuActions.onChangeActivePhase(column.id)` / `onSetAsDefaultPostTemplate(column.id, templateId)`. The column header MUST NOT render an icon, a callout-count badge, a collapse / expand affordance, or any create/delete/reorder-column affordance. Below the header, render the ordered list of `LayoutCalloutRow`s
- [X] T033 [US2] Create `src/crd/components/space/settings/SpaceSettingsLayoutView.tsx` per `contracts/tab-layout.ts` — composes `columns.map(col => <LayoutPoolColumn ... />)` inside a `DndContext` with `PointerSensor` + `KeyboardSensor`. Columns use `InlineEditText` for their title and description; callout rows are read-only (see T031). Configure dnd-kit's `Announcements` API with i18n-resolved messages for `onDragStart`, `onDragOver`, `onDragEnd`, `onDragCancel` so the ARIA live region announces grab-mode state per FR-011. Render per-column skeletons while loading + inline error banner on save/fetch error (FR-028). Include the Post description display toggle + the Save Changes / Reset action bar at the top / bottom of the view
- [X] T034 [P] [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts` — maps `useInnovationFlowSettingsQuery` payload into one `LayoutPoolColumn` per `innovationFlow.states[]` entry. Group callouts into columns by matching `callout.classification.flowState.tags[0]` to each state's `displayName`. Sort callouts within a column by `callout.sortOrder`. Preserve each state's `id`, `displayName`, `description`, and set `isCurrentPhase = (innovationFlow.currentState?.id === state.id)`. Attach each callout's `classification.flowState.id` as `flowStateTagsetId`
- [X] T035 [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts` per `UseLayoutTabData`. Owns the **local dirty buffer** holding every buffered change: reorders, cross-column moves, column renames, and the Post description display toggle. **Zero mutations fire before Save Changes (FR-008a)** — every buffered action is buffer-only. Save flushes in one `useTransition` block: (a) column title/description changes → `useUpdateInnovationFlowStateMutation` PLUS cascade retag of every callout tagged with the old name → `useUpdateCalloutFlowStateMutation` per callout; (b) cross-column moves → `useUpdateCalloutFlowStateMutation` (rewrites `classification.flowState.tags` to the new state's displayName); (c) within-column reorders → `useUpdateCalloutsSortOrderMutation`; (d) `calloutDescriptionDisplayMode` → `useUpdateSpaceSettingsMutation`. Reset discards buffer and re-seeds from latest backend snapshot (re-runs the existing query). **Visible kebab callbacks**: `onMoveToColumn(calloutId, target)` reuses the `onReorder` pipeline with the last index in the target column; `onViewPost(calloutId)` navigates (router-level — when buffer is dirty, `useDirtyTabGuard` intercepts)
- [X] T036 [US2] Create `src/main/crdPages/topLevelPages/spaceSettings/layout/useColumnMenu.ts` per `UseColumnMenu`. Returns `actions.onChangeActivePhase(columnId)` + `actions.onSetAsDefaultPostTemplate(columnId, templateId)` + `availablePostTemplates`, wired to the existing Apollo hooks: **Active phase** → `useUpdateInnovationFlowCurrentStateMutation`; **Default post template** (set) → `useSetDefaultCalloutTemplateOnInnovationFlowStateMutation`; **Default post template** (clear) → `useRemoveDefaultCalloutTemplateOnInnovationFlowStateMutation`. Reference implementation: `src/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings.tsx` (already wires these three today). **These mutations fire immediately** — NOT buffered (FR-010). Every mutation call wrapped in `useTransition` per Constitution Principle II
- [X] T037 [US2] Wire Layout into `CrdSpaceSettingsPage.tsx`; propagate `markDirty`/`clearDirty` to `useDirtyTabGuard`
- [X] T038 [US2] Add Layout-tab strings to `spaceSettings.en.json` (empty-column copy, grab-mode live-region announcements, inline-edit placeholders, Post description display label, column-menu entry labels, save-bar labels)

**Checkpoint**: Layout tab fully functional — drag/keyboard reorder, inline-edit columns with hover-reveal pencil, per-callout kebab (Move to / View Post), and per-column overflow menu (Active phase / Default post template) all working against the real backend.

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

- [X] T049 [P] [US4] Create `src/crd/components/space/settings/SpaceSettingsSubspacesView.tsx` per `contracts/tab-subspaces.ts`. Default Subspace Template selector card (with Change Default Template action). Search input, filter dropdown (All / Active / Archived), Grid/List view toggle. Subspace list in either grid or list view. Per-card kebab: **Pin/Unpin** (alphabetical only), **Save as Template**, **Delete** — no other entries. Title click triggers navigation via `href`. Skeletons while loading + inline error banner on fetch error (FR-028)
- [X] T050 [P] [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/subspaces/subspacesMapper.ts`. Maps backend `SpaceVisibility.Archived` → `'archived'`
- [X] T051 [US4] Create `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useSubspacesTabData.ts`. Wires existing mutations: `updateSubspacePinned`, `createTemplate` (Space), `deleteSpace`, `updateTemplateDefault`, existing subspace-creation flow. Wrap every mutation in `useTransition`. Delete routes through `ConfirmationDialog` (delete variant)
- [X] T052 [US4] Wire Subspaces into `CrdSpaceSettingsPage.tsx`
- [X] T053 [US4] Add Subspaces-tab strings to `spaceSettings.en.json`

**Checkpoint**: Subspaces tab functional with current kebab preserved + new search/filter/view-toggle + Default Template.

---

## Phase 7: User Story 5 — Templates tab (Priority: P1)

**Goal**: An admin can browse five collapsible template categories, search globally, and perform Preview / Duplicate / Edit / Delete on each card.

**Independent Test**: Expand each of the five categories. Search. Create a new custom template via Add New. Edit it, delete it (confirm). Duplicate a platform template as custom. Preview a template.

### Tests for User Story 5

- [ ] T054 [P] [US5] Mapper unit test `templates/templatesMapper.test.ts` — five-category grouping, `isCustom` detection

### Implementation for User Story 5

- [X] T055 [P] [US5] Create `src/crd/components/space/settings/SpaceSettingsTemplatesView.tsx` per `contracts/tab-templates.ts`. Five collapsible categories in order: Space / Collaboration Tool / Whiteboard / Post / Community Guidelines. Global search. Per-card kebab: Preview / Duplicate / Edit (custom only) / Delete (custom only). Skeletons per category; inline error banner per category on fetch error (FR-028)
- [X] T056 [P] [US5] Create `src/main/crdPages/topLevelPages/spaceSettings/templates/templatesMapper.ts`
- [X] T057 [US5] Create `src/main/crdPages/topLevelPages/spaceSettings/templates/useTemplatesTabData.ts`. Opens existing CRUD dialogs (wrapped with CRD styling). Delete routes through `ConfirmationDialog`. Wrap every mutation in `useTransition`
- [X] T058 [US5] Wire Templates into `CrdSpaceSettingsPage.tsx`
- [X] T059 [US5] Add Templates-tab strings to `spaceSettings.en.json`

**Checkpoint**: Templates tab functional.

---

## Phase 8: User Story 6 — Storage tab (Priority: P1)

**Goal**: An admin can browse the hierarchical document tree (folders + files), open a file, and delete a file with confirmation — preserving the current MUI UX restyled with CRD primitives.

**Independent Test**: Expand a folder. Click a file to open in new tab. Delete a file (confirm) — tree refreshes.

### Tests for User Story 6

- [ ] T060 [P] [US6] Mapper unit test `storage/storageMapper.test.ts` — covers folder/file discrimination, size formatting, uploader href construction

### Implementation for User Story 6

- [X] T061 [P] [US6] Create `src/crd/components/space/settings/SpaceSettingsStorageView.tsx` per `contracts/tab-storage.ts`. Hierarchical tree rendered via `src/crd/primitives/table.tsx` + manual expand/collapse rows. Columns: name / size / uploader / uploaded-at. Actions: Open in new tab, Delete. Skeleton rows while loading + inline error banner above the tree on fetch error (FR-028)
- [X] T062 [P] [US6] Create `src/main/crdPages/topLevelPages/spaceSettings/storage/storageMapper.ts`
- [X] T063 [US6] Create `src/main/crdPages/topLevelPages/spaceSettings/storage/useStorageTabData.ts`. Wires `useSpaceStorageAdminPageQuery` + `useDeleteDocumentMutation`. Delete routes through `ConfirmationDialog`. Wrap in `useTransition`
- [X] T064 [US6] Wire Storage into `CrdSpaceSettingsPage.tsx`
- [X] T065 [US6] Add Storage-tab strings to `spaceSettings.en.json`

**Checkpoint**: Storage tab preserves current tree browser with CRD styling.

---

## Phase 9: User Story 7 — Settings tab (Priority: P1)

**Goal**: An admin can toggle every existing Space Settings control; each toggle fires immediately. Danger Zone deletes the space with confirmation.

**Independent Test**: Flip Visibility Public/Private. Flip Membership radio. Add / remove an applicable organization. Flip every Allowed Action. Click Delete this Space → confirmation dialog → cancel. Re-click → confirm (only if on a throwaway space).

### Tests for User Story 7

- [ ] T066 [P] [US7] Mapper unit test `settings/settingsMapper.test.ts`

### Implementation for User Story 7

- [X] T067 [P] [US7] Create `src/crd/components/space/settings/SpaceSettingsSettingsView.tsx` per `contracts/tab-settings.ts`. Accordion sections: Visibility (radio) / Membership (radio) / Applicable Organizations (list + add + automatic access toggle) / Allowed Actions (all 9 toggles listed in `AllowedActionKey`) / Danger Zone (destructive card + Delete Space button). Skeletons while loading; inline error banner on fetch/save error (FR-028)
- [X] T068 [P] [US7] Create `src/main/crdPages/topLevelPages/spaceSettings/settings/settingsMapper.ts`
- [X] T069 [US7] Create `src/main/crdPages/topLevelPages/spaceSettings/settings/useSettingsTabData.ts`. Every toggle → immediate `updateSpaceSettings` mutation. Remove-organization → existing mutation. Delete Space → `ConfirmationDialog` (delete variant, list of what is deleted in description) → `deleteSpace`. Wrap every mutation in `useTransition`
- [X] T070 [US7] Wire Settings into `CrdSpaceSettingsPage.tsx`
- [X] T071 [US7] Add Settings-tab strings to `spaceSettings.en.json` (including the Danger Zone description enumerating what is deleted)

**Checkpoint**: Settings tab functional with Danger Zone.

---

## Phase 10: User Story 8 — Account tab (Priority: P1)

**Goal**: An admin sees URL, License + entitlements + usage, Visibility Status, Host Info (no Change Host), Support contact, and (if permitted) Delete Space. Read-only + three actions.

**Independent Test**: Verify URL with Copy. License shows plan + entitlements + progress bar. Visibility Status badge correct. Host card present without a Change Host button. Contact Alkemio Support opens support link. Delete Space (if permitted) runs existing flow.

### Tests for User Story 8

- [ ] T072 [P] [US8] Mapper unit test `account/accountMapper.test.ts` — plan + entitlement + visibility mapping; confirms `host` has no `onChangeHost` field (contract assertion)

### Implementation for User Story 8

- [X] T073 [P] [US8] Create `src/crd/components/space/settings/SpaceSettingsAccountView.tsx` per `contracts/tab-account.ts` — **pure parity restyle** of the current MUI `SpaceAdminAccount` page. Render exactly: URL display (no Copy button — that's a prototype-only add), current plan name + features + days-left (if applicable), the existing "Change License" external link, the existing "More about Alkemio licenses" link, the existing host / provider card (no avatar-overlay / badges — just what MUI renders today), the existing Contact Alkemio Support link, and the Delete Space button (only when `canDeleteSpace`). Skeletons while loading; inline error banner on fetch error (FR-028). NO new affordances beyond the MUI page's current field/action set
- [X] T074 [P] [US8] Create `src/main/crdPages/topLevelPages/spaceSettings/account/accountMapper.ts`
- [X] T075 [US8] Create `src/main/crdPages/topLevelPages/spaceSettings/account/useAccountTabData.ts`. Query-only (same query the current MUI `SpaceAdminAccount` page uses) + `deleteSpace` mutation wrapped in `useTransition`. No clipboard / no Copy affordance — parity with MUI (FR-024)
- [X] T076 [US8] Wire Account into `CrdSpaceSettingsPage.tsx`
- [X] T077 [US8] Add Account-tab strings to `spaceSettings.en.json`

**Checkpoint**: Every tab functional. All 8 user stories independently testable.

---

## Phase 12: Subspace (L1 / L2) settings — added retroactively in 2026-04-27

**Goal**: Reuse the same CRD Space Settings page for L1 (subspace) and L2 (sub-subspace) admins with level-aware tab visibility, level-aware ID resolution, and per-tab inner gating that mirrors legacy MUI's `SpaceAdminRouteL{0,1,2}.tsx` + `MemberActionsSettings.tsx`. Also closes two missing-feature gaps (member-lead toggle on Community, phase Add / Delete on Layout) — both built generically and gated to L1 / L2 in this PR.

**Independent test**: navigate to `<space>/challenges/<sub>/settings` (L1) and `<space>/challenges/<sub>/opportunities/<subsub>/settings` (L2) with CRD enabled. Confirm visible tab list per Decision 19. Confirm mutations target the subspace's community (Apollo devtools).

### Tests

- [ ] T086 [P] Unit test `useSettingsScope.test.ts` — mocks `useUrlResolver` + `useSpace` + `useSubSpace`; asserts L0 returns space IDs from `useSpace`; L1 / L2 return subspace IDs from `useSubSpace`; `level` is the correct `'L0' | 'L1' | 'L2'` string union.
- [ ] T087 [P] Unit test `useVisibleSettingsTabs.test.ts` — `getVisibleSettingsTabs('L0')` includes all 9 tabs; `('L1')` hides templates / storage / account; `('L2')` additionally hides subspaces.
- [ ] T088 [P] Unit test extension `useSpaceSettingsTab.test.ts` — when `visibleTabs` is provided and the URL points to a hidden tab, the hook redirects to `'about'` via `replace: true`. When visibleTabs is omitted, behaviour is unchanged.
- [ ] T089 [P] Component test `SpaceSettingsCommunityView.test.tsx` (L1/L2 cases) — `level !== 'L0'` shows promote/demote-Lead dropdown items on non-Admin rows; `level === 'L0'` hides them. VC block + "Save as guidelines template" hidden at non-L0.
- [ ] T090 [P] Component test `SpaceSettingsSettingsView.test.tsx` (L1/L2 cases) — at L1, `inheritMembershipRights` is visible AND `subspaceAdminInvitations` / `memberCreateSubspaces` / `subspaceEvents` are visible. At L2, `inheritMembershipRights` visible but the three subspace-related toggles are hidden.
- [ ] T091 [P] Component test `SpaceSettingsLayoutView.test.tsx` (L1/L2 cases) — Add Phase button visible only when `level !== 'L0'` and `columns.length < maximumNumberOfStates`. Delete phase entry in column kebab visible only when `level !== 'L0'` and `columns.length > minimumNumberOfStates`.
- [ ] T092 [P] Component test `AddPhaseDialog.test.tsx` — duplicate-name check triggers inline error; submitting state disables the form; success closes the dialog.
- [ ] T093 Integration test for `useLayoutTabData` — after `onCreateState` / `onDeleteState` resolves, `snapshotRef.current` is reseeded and the Save Changes bar transitions to `clean`. While `isStructureMutating` is true, the Save Changes bar is disabled.
- [ ] T094 Integration test for `useCommunityTabData` — `onUserLeadChange` / `onOrgLeadChange` delegate to `useCommunityAdmin` and fire immediately (no buffer). `leadPolicy` is composed from `useCommunityPolicyChecker` aggregate flags.

### Implementation

- [X] T095 Create `src/main/crdPages/topLevelPages/spaceSettings/useSettingsScope.ts` — level-aware ID resolution per Decision 18.
- [X] T096 Create `src/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs.ts` — `getVisibleSettingsTabs(level)` + `useSettingsTabDescriptors(level)` per Decision 19.
- [X] T097 Update `src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.ts` — accept optional `visibleTabs` and clamp; redirect hidden URL hits to `'about'` via `replace: true`.
- [X] T098 Update `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` — replace direct `useSpace()` / `useUrlResolver()` calls with `useSettingsScope()`; pass `level` (string union) into Community / Settings / Subspaces / Layout views; gate hidden-tab content with `isTabVisible(id)`; pass `onUserLeadChange` / `onOrgLeadChange` / `leadPolicy` to community view; pass `onCreatePhase` / `minimumNumberOfStates` / `maximumNumberOfStates` / `isStructureMutating` to layout view; pass `onChangeDefaultTemplate` only at L0; convert `SpaceLevel` to the string union at the boundary.
- [X] T099 Add subspace settings routes to `src/main/crdPages/subspace/routing/CrdSubspaceRoutes.tsx` — add `<Route path="settings/*" element={<CrdSubspaceSettingsRoute />} />` inside BOTH the L1 layout block AND the L2 layout block. Implement `CrdSubspaceSettingsRoute` as a thin wrapper that calls `useSubSpace()`, feeds the subspace id into `<NonSpaceAdminRedirect>`, and lazy-loads `CrdSpaceSettingsPage`.
- [X] T100 Update `src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx` — when `pathname.includes('/settings')`, render `SpaceSettingsHeader` + `SpaceSettingsTabStrip` (the same primitives the L0 path uses) instead of `SubspaceHeader`. Source the visible tab list from `getVisibleSettingsTabs(settingsLevel)` and the active tab from `useSpaceSettingsTab(visibleSettingsTabs)`.
- [X] T100a Extend the L1 / L2 breadcrumbs in `CrdSubspacePageLayout.tsx` — when `isOnSettings` is true, the subspace name becomes a link (to `data.subspaceUrl`); the trail appends `{ label: t('tabs.settings'), href: \`\${data.subspaceUrl}/settings\` }` plus `{ label: t(\`tabs.\${activeSettingsTab}\`) }`. The trail is set unconditionally before any early return so `useSetBreadcrumbs` is invoked on every render (Decision 22 / FR-041).
- [X] T101 Update `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts` — expose `members[].isLead` / `members[].isAdmin`, `organizations[].isLead`, `leadPolicy: { canAddLead, canRemoveLead }` (from `useCommunityPolicyChecker`), and `onUserLeadChange` / `onOrgLeadChange` (delegating to `useCommunityAdmin`).
- [X] T102 Update `src/main/crdPages/topLevelPages/spaceSettings/layout/useLayoutTabData.ts` — internally call `useInnovationFlowSettings({ collaborationId, skip: !collaborationId })` and re-export `actions.createState` / `actions.deleteState` as `onCreateState` / `onDeleteState`. After each resolves, set `snapshotRef.current = null` so the seed effect re-runs. Expose `minimumNumberOfStates`, `maximumNumberOfStates`, `isStructureMutating`. Disable the Save Changes bar while `isStructureMutating` is true.
- [X] T103 Update `src/main/crdPages/topLevelPages/spaceSettings/layout/useColumnMenu.ts` — accept optional `onDeleteState` / `columnCount` / `minimumNumberOfStates` options. Compute `onDeletePhase` only when `columnCount > minimumNumberOfStates`. Confirm via existing `ConfirmationDialog`.
- [X] T104 Update `src/main/crdPages/topLevelPages/spaceSettings/settings/settingsMapper.ts` + `useSettingsTabData.ts` — add `inheritMembershipRights` to `mapAllowedActions` and to the `collaborationKeyMap` so the toggle round-trips correctly.
- [X] T105 Update `src/crd/components/space/settings/SpaceSettingsSettingsView.tsx` — add `level` prop; introduce `AllowedActionKey` `inheritMembershipRights`; level-based action filtering via three `Set<AllowedActionKey>` constants (`ACTIONS_VISIBLE_AT_L0`, `ACTIONS_VISIBLE_AT_L1`, `ACTIONS_VISIBLE_AT_L2`).
- [X] T106 Update `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx` — add `level`, `leadPolicy`, `onUserLeadChange`, `onOrgLeadChange` props; add `isLead` / `isAdmin` to `CommunityMember`; promote / demote dropdown items gated by `level !== 'L0' && !m.isAdmin`; VC block wrapped in `{level === 'L0' && (...)}`; org rows converted from single button to DropdownMenu.
- [X] T107 Update `src/crd/components/space/settings/SpaceSettingsSubspacesView.tsx` — make `onChangeDefaultTemplate` optional; wrap the entire "Default Subspace Template" card in `{onChangeDefaultTemplate && (<>...</>)}`; add `canSaveAsTemplate` prop (defaults to true).
- [X] T108 Update `src/crd/components/space/settings/SpaceSettingsLayoutView.tsx` — add `level`, `onCreatePhase`, `minimumNumberOfStates`, `maximumNumberOfStates`, `isStructureMutating` props; add "Add Phase" button next to page header (gated to `level !== 'L0'` and `columns.length < maximumNumberOfStates`); render `AddPhaseDialog`.
- [X] T109 Create `src/crd/components/space/settings/AddPhaseDialog.tsx` — modal with name + optional description, duplicate-name check, error display, submitting state.
- [X] T110 Update `src/crd/components/space/settings/LayoutPoolColumn.tsx` — add `Trash2` import; add "Delete phase" menu item gated on `actions.onDeletePhase`. Update `SpaceSettingsLayoutView.types.ts` to include optional `onDeletePhase?: (columnId) => Promise<void>` on `ColumnMenuActions`.
- [X] T111 i18n updates in all six languages (`spaceSettings.{en,nl,es,bg,de,fr}.json`) — add `community.members.role.promoteToLead` / `demoteFromLead`, `layout.column.deletePhase`, `layout.addPhase.button`, `layout.addPhase.dialog.{title,name,description,confirm}`, `settings.allowedActions.inheritMembershipRights`. Per CRD scope rules, all six languages are edited directly in this PR — Crowdin does NOT manage CRD translations.
- [X] T112 Run `pnpm lint` (TypeScript + Biome + ESLint) and `pnpm vitest run` — confirm zero errors and 629 passing tests; run `pnpm build` and confirm successful build.

**Checkpoint**: L1 / L2 settings reachable, gated to admin role, with level-aware tab visibility + per-tab gating. Member-lead toggle and phase Add / Delete functional at L1 / L2.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T078 [P] Responsive QA: tab strip scrolls horizontally on narrow viewports; Layout's columns (dynamic count) stack or horizontally scroll; About's two columns stack; Community tables remain usable; Subspaces grid collapses to one column (SC-002)
- [ ] T079 [P] Accessibility audit: keyboard traversal across every tab; visible focus rings on every input; axe-core pass on `CrdSpaceSettingsPage` with zero violations; live-region announcements verified on save success/failure (Layout Save bar + About per-field autosave) and on Layout grab-mode transitions. **About autosave specifically**: confirm each field's autosave indicator is a `role="status"` with `aria-live="polite"` and a descriptive `aria-label` that changes with the state, so a screen-reader user hears the transition `saving → saved` (or the error message) for every edited field. Verify CRD CLAUDE.md Checklist: icons only from `lucide-react`; sr-only text only via `t()`; interactive elements are `<a>`/`<button>` only; icon-only buttons carry `aria-label`
- [ ] T080 SC-004 parity inventory: side-by-side compare MUI Space Admin vs CRD Space Settings for every action. File the checklist at `specs/045-crd-space-settings/checklists/parity.md`. Expect 0 missing actions except the explicitly deferred Subspaces "Edit Details" / "Archive" kebab entries (pending designer review). **Also verify FR-031 (no GraphQL changes)**: confirm no `*.graphql` files under `src/domain/spaceAdmin/**` or any new `*.graphql` file under `src/main/crdPages/topLevelPages/spaceSettings/**` was added or edited; run `pnpm codegen` and confirm the generated files produce no diff
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
Task: "Integration test useColumnMenu.test.ts"

# Presentational layer in parallel:
Task: "Create src/crd/components/space/settings/LayoutCalloutRow.tsx"
Task: "Create src/crd/components/space/settings/LayoutPoolColumn.tsx"
Task: "Create src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts"

# Then sequential:
Task: "Create SpaceSettingsLayoutView.tsx composing the two row + column components"
Task: "Create useLayoutTabData.ts with the local buffer + Reset model"
Task: "Create useColumnMenu.ts wiring per-column Active-phase and Default-post-template mutations"
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
- The Layout per-**column** overflow menu ("Active phase", "Default post template") is rendered in the top-right three-dot button of each column header (FR-010 / SC-009)
