# Tasks: CRD (Sub)Space Settings — Functional Parity with Legacy Settings

**Input**: Design documents from `/specs/103-crd-settings-parity/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/graphql-operations.md, quickstart.md

**Tests**: Per the project constitution (Principle V / Workflow #4), tests covering non-trivial logic are mandatory PR evidence. UI wiring is validated manually (`quickstart.md`), but the **pure logic units** added by this feature get Vitest unit tests: the subspace drag/pin predicate, the Layout mapper (`profileUrl` + active-phase), and the VC item mapper. Test tasks: T012, T019, T027.

**Organization**: Tasks are grouped by user story (priority order). Each story is an independently testable increment. Phases follow spec priority (US1, US2 = P1; US3, US4, US5 = P2; US6 = P3); the implementation strategy section also offers a smallest-first order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US6 (maps to spec user stories)
- All paths are repo-relative.

## Conventions (apply to every CRD task)

- CRD components in `src/crd/`: pure — props + callbacks only, no `@mui/*`/`@emotion/*`, no GraphQL types, no `react-router-dom`, Tailwind + semantic typography tokens, icons from `lucide-react`, all strings via `useTranslation('crd-*')`, WCAG 2.1 AA.
- All data/permission/navigation wiring lives in `src/main/crdPages/`.
- New i18n keys are added to the relevant `crd-*` namespace for **all 6 languages** (en, nl, es, bg, de, fr) in this PR (CRD is not Crowdin-managed).
- Legacy MUI files under `src/domain/spaceAdmin/*` and `src/domain/community/inviteContributors/*` are read-only references — **do not modify**.
- **Terminology**: an Innovation Flow *phase* = a *state* in GraphQL = a *column* in the CRD Layout view; the three names refer to the same entity.

---

## Phase 1: Setup

**Purpose**: Environment + shared references

- [ ] T001 [P] Verify dev environment: backend on `localhost:3000`, `pnpm start`, and opt into CRD (`localStorage.setItem('alkemio-design-version','2')`). Confirm access to an L0 space and an L1 subspace (admin) with ≥2 subspaces, an Innovation Flow with ≥2 phases + ≥1 callout, and a VC on the account + a VC in the library (per `quickstart.md`).

---

## Phase 2: Foundational (shared prerequisite)

**Purpose**: Shared reference used by every string-adding story (US2–US6) and the connector swap (US1).

- [ ] T002 [P] Identify the `crd-*` i18n namespace files and `useTranslation(...)` namespaces used by the Community, Layout, and Subspaces settings tabs — inspect `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx`, `LayoutPoolColumn.tsx`, `SpaceSettingsSubspacesView.tsx`, and the matching files under `src/crd/i18n/`. Record namespace + file paths so every new key in US2–US6 lands in the correct namespace for all 6 languages.

**Checkpoint**: With T002 done, all user stories can proceed independently.

---

## Phase 3: User Story 1 - Member invite with one smart input, message, and role (Priority: P1) 🎯 MVP

**Goal**: The settings Community tab uses the parity-complete invite dialog (single live-detect input, editable pre-filled welcome message, role selection incl. Admin), targeting the correct (sub)space community.

**Independent Test**: Settings → Community → Invite Members; invite an existing user as Admin with a custom message and confirm roles+message land; confirm subspace invites target the subspace community (`quickstart.md` US1).

- [ ] T003 [US1] Parameterize `src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx`: add optional `roleSetId`, `spaceId`, `spaceName` props that override the internal `useUrlResolver()` lookup when provided (fall back to resolver when absent). Keep the CRD `InviteMembersDialog` and the `inviteContributorsOnRoleSet` mutation path unchanged.
- [ ] T004 [US1] In `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`, replace the stripped settings invite mount (≈ lines 804–818) with `<InviteMembersDialogConnector>` wired to `scope.roleSetId` / `scope.id` and the loaded space display name; ensure the Community tab "Invite Members" button (`SpaceSettingsCommunityView` `onInviteUsers`) opens it. (Depends on T003.)
- [ ] T005 [US1] Remove the now-unused stripped invite path: delete `src/crd/components/space/settings/InviteMembersDialog.tsx` and the `useInviteUsersDialog`/invite-by-email portion of `src/main/crdPages/topLevelPages/spaceSettings/community/useAddCommunityMemberDialog.ts` once `CrdSpaceSettingsPage.tsx` no longer references them. (Depends on T004.)
- [ ] T006 [US1] Verify in a **subspace** that the invite targets the subspace's community (not the parent), and confirm all invite-dialog i18n keys resolve in the settings context. (Depends on T004.)

**Checkpoint**: Member invites from settings have message + roles + live single input, in both L0 and subspaces.

---

## Phase 4: User Story 2 - Invite a Virtual Contributor (Priority: P1)

**Goal**: A separate "Invite Virtual Contributor" entry point in the Community tab lets an admin add an account VC or invite a library VC (with message).

**Independent Test**: Settings → Community → "Invite Virtual Contributor"; add an account VC and invite a library VC with a message; confirm both join; confirm the entry point is permission-gated (`quickstart.md` US2).

- [ ] T007 [P] [US2] Create the pure CRD component `src/crd/components/community/VirtualContributorInviteDialog.tsx` per `data-model.md` §5: search field, "On account" list (add), "In library" list (invite-with-message step), `loading`/`inviting` states, empty-state messaging, all labels via props/`crd-*`, WCAG (icon-button `aria-label`, list semantics).
- [ ] T008 [P] [US2] Add a separate "Invite Virtual Contributor" entry point to `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx`: new `onInviteVc?: () => void` prop + button, rendered distinct from "Invite Members" and shown only when `permissions.canAddVirtualContributors`.
- [ ] T009 [US2] Create the connector `src/main/crdPages/topLevelPages/spaceSettings/community/VirtualContributorInviteConnector.tsx` and a pure mapper `mapVcToInviteItem` (in a sibling `vcInviteMapper.ts`): load available account VCs + library VCs (via `useVirtualContributorsAdmin`/the available-VC queries), map to `VcInviteItem[]` (apply `pickColorFromId`), wire `onAddAccountVc` → `virtualContributorAdmin.onAdd`, `onInviteLibraryVc` → `virtualContributorAdmin.inviteContributors({ welcomeMessage, invitedContributorIds:[id], invitedUserEmails:[] })`. (Depends on T007.)
- [ ] T010 [US2] Mount the VC connector + wire the entry point in `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`, feeding `community._adminRef.virtualContributorAdmin` and `permissions.canAddVirtualContributors`. (Depends on T008, T009.)
- [ ] T011 [P] [US2] Add VC-invite i18n keys (entry-point label, section titles "On account"/"In library", invite/add labels, message field, empty/loading states) to the relevant `crd-*` namespace for all 6 languages.
- [ ] T012 [P] [US2] Add Vitest `vcInviteMapper.test.ts` next to `vcInviteMapper.ts` covering `mapVcToInviteItem`: account vs library item shape, `pickColorFromId` applied, avatar/tagline pass-through, empty list. (Depends on T009.)

**Checkpoint**: VCs can be added/invited from settings via a separate, permission-gated entry point, with the mapper unit-tested.

---

## Phase 5: User Story 3 - See the active Innovation Flow phase (Priority: P2)

**Goal**: The active phase column is visibly distinguished on the Layout tab.

> **Note (FR-007)**: Setting the active phase + persistence is **already implemented** (`useColumnMenu` → `useUpdateInnovationFlowCurrentStateMutation`, optimistic `markCurrentPhaseChanged`; see research R3). No task needed — it is exercised by the manual check below and T032. This story adds only the missing visual indicator (FR-006).

**Independent Test**: Settings → Layout; confirm the current phase column has a visible indicator; change it via the column menu and confirm it moves and persists after reload (`quickstart.md` US3).

- [ ] T013 [US3] In `src/crd/components/space/settings/LayoutPoolColumn.tsx`, render a visible active-phase indicator when `isCurrentPhase` is true — accent border + a small "Current phase" badge/icon (not color-only; pair color with an icon + label and an appropriate `aria` cue). No data/mutation changes.
- [ ] T014 [P] [US3] Add the "Current phase" badge i18n key to the Layout settings `crd-*` namespace for all 6 languages.

**Checkpoint**: The active phase is identifiable at a glance.

---

## Phase 6: User Story 4 - Reorder subspaces from settings (Priority: P2)

**Goal**: Alphabetical/Custom sort-mode selector + @dnd-kit drag-reorder in the subspaces view, with pinning interplay matching legacy (Custom → all draggable; Alphabetical → only pinned). The data hook already exposes `onReorder` + the mutations.

**Independent Test**: Settings → Subspaces; pick Custom and drag to reorder (persists after reload); in Alphabetical only pinned are draggable; reorder via keyboard (`quickstart.md` US4).

- [ ] T015 [US4] Add ordering UI to `src/crd/components/space/settings/SpaceSettingsSubspacesView.tsx`: new props `sortMode: 'alphabetical' | 'manual'`, `onSortModeChange(mode)`, `onReorder(orderedIds)`; render an Alphabetical/Custom selector; wrap the list in `@dnd-kit` `DndContext` + `SortableContext` with a sortable row + drag handle and a `KeyboardSensor` (follow `src/crd/components/callout/CalloutContributionsSortDialog.tsx` / `src/crd/forms/callout/PollOptionsEditor.tsx`). Drag-enabled logic must call a **pure helper** `isSubspaceDragDisabled(sortMode, isPinned)` extracted into `src/main/crdPages/topLevelPages/spaceSettings/subspaces/subspacesMapper.ts` (`manual` → never disabled; `alphabetical` → disabled unless `isPinned`). Keep the existing kebab pin action.
- [ ] T016 [US4] Update `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useSubspacesTabData.ts`: expose `sortMode` (from the already-read `settings.sortMode` via `mapSortMode`) and a new `onSortModeChange` → `useUpdateSpaceSettingsMutation` (`settingsData.settings.sortMode`, refetch `SubspacesInSpace`). `onReorder` already exists — keep it.
- [ ] T017 [US4] In `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` (subspaces tab render, ≈ lines 468–477), pass `sortMode`, `onSortModeChange`, and the existing `onReorder` to `SpaceSettingsSubspacesView`. (Depends on T015, T016.)
- [ ] T018 [P] [US4] Add sort-mode labels ("Alphabetical"/"Custom") and drag-handle `aria-label` i18n keys to the Subspaces settings `crd-*` namespace for all 6 languages.
- [ ] T019 [P] [US4] Add Vitest `subspacesMapper.test.ts` next to `subspacesMapper.ts` covering `isSubspaceDragDisabled` (both modes × pinned/unpinned) and the `mapSortMode` / `mapSortModeToBackend` round-trip. (Depends on T015.)

**Checkpoint**: Subspace ordering (incl. pinning interplay) works, persists, is keyboard-accessible, and the predicate is unit-tested.

---

## Phase 7: User Story 5 - Phase descriptions render as formatted text (Priority: P2)

**Goal**: The Layout column description renders markdown/HTML as formatted text (no literal tags), keeping the current truncation. The editor is unchanged.

**Independent Test**: Settings → Layout, phase with `**bold**`/`<strong>`; confirm formatted (not literal) and still clamped (`quickstart.md` US5).

- [ ] T020 [US5] In `src/crd/components/space/settings/LayoutPoolColumn.tsx` (≈ lines 127–129), render the phase `description` via `InlineMarkdown` (`@/crd/components/common/InlineMarkdown`) instead of raw `{column.description}`; change the wrapper element from `<p>` to `<div>` (InlineMarkdown emits block content) while keeping the `line-clamp-3` + muted `text-body` classes so truncation is unchanged.

**Checkpoint**: Descriptions show formatted, still truncated.

---

## Phase 8: User Story 6 - "View post" navigates to the post (Priority: P3)

**Goal**: "View post" on a Layout callout navigates to the callout via its `profile.url`; the item is not shown as an actionable no-op when no URL exists.

**Independent Test**: Settings → Layout, callout ⋮ → View post → navigates to the post (`quickstart.md` US6).

- [ ] T021 [US6] Add `url` under `callouts { framing { profile { … } } }` in `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowCollaboration.fragment.graphql` (contract C1).
- [ ] T022 [US6] Run `pnpm codegen` (backend at `localhost:3000/graphql`) and commit the regenerated `src/core/apollo/generated/apollo-hooks.ts` and `graphql-schema.ts`; note the additive schema diff in the PR. (Depends on T021.)
- [ ] T023 [P] [US6] Add `profileUrl: string` to `LayoutCallout` in `src/crd/components/space/settings/SpaceSettingsLayoutView.types.ts`.
- [ ] T024 [US6] In `src/main/crdPages/topLevelPages/spaceSettings/layout/layoutMapper.ts` (`calloutToLayoutCallout`), set `profileUrl: rawCallout.framing.profile.url`. (Depends on T022, T023.)
- [ ] T025 [US6] In `src/crd/components/space/settings/LayoutCalloutRow.tsx`, render the "View post" menu item only when `callout.profileUrl` is non-empty (avoid an actionable no-op per FR-010). (Depends on T023.)
- [ ] T026 [US6] Replace the no-op `onViewPost` handler in `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` (≈ lines 366–370): resolve the callout's `profileUrl` from the loaded columns and navigate to it (use the callout's canonical `profile.url` — do not template a path inline). (Depends on T024.)
- [ ] T027 [P] [US6] Add Vitest `layoutMapper.test.ts` next to `layoutMapper.ts` covering `calloutToLayoutCallout.profileUrl` mapping (including empty/missing url) and the `isCurrentPhase` flag in `mapCollaborationToLayoutColumns`. (Depends on T024.)

**Checkpoint**: View post navigates correctly; no dead menu items; mapper unit-tested.

---

## Phase 9: Polish & Cross-Cutting

- [ ] T028 [P] Run `pnpm lint` (TypeScript + Biome + ESLint react-compiler) and fix any findings across changed files.
- [ ] T029 [P] Run `pnpm vitest run` and ensure the suite (incl. the new T012/T019/T027 tests) passes.
- [ ] T030 [P] i18n completeness: confirm every new key exists in all 6 language files (en, nl, es, bg, de, fr) for each touched `crd-*` namespace; apply the Dutch do-not-translate glossary (Space, Subspace, Post, Virtual Contributor, etc.).
- [ ] T031 Regression guard (FR-011): set `localStorage('alkemio-design-version','1')`, reload, and confirm the legacy MUI settings still behave unchanged for all six areas.
- [ ] T032 Parity sweep (FR-012): walk every story in `quickstart.md` in **both** a top-level space and a subspace (this also exercises the pre-existing set-active-phase behaviour, FR-007).
- [ ] T033 Permissions verification (FR-013): confirm the Admin/Lead role options in the invite dialog only appear when the role-set permits granting them, the VC entry point only shows with `canAddVirtualContributors`, and the reorder / set-active-phase / phase-edit controls only show for admins.
- [ ] T034 Safeguards verification (FR-014): confirm the new VC invite dialog and the swapped member-invite dialog route dirty/authored-content closes through `useDialogCloseGuard` (`DiscardChangesDialog`), and that no new unconfirmed destructive action was introduced (existing deletes still go through `ConfirmationDialog`).
- [ ] T035 Accessibility verification (Constitution Principle V / WCAG 2.1 AA): keyboard-reorder subspaces via the drag handle (KeyboardSensor), confirm the active-phase indicator conveys state by icon + text (not color alone) with an appropriate `aria` cue, and confirm icon-only buttons in the VC dialog have `aria-label`.

---

## Dependencies & Execution Order

- **Setup (T001) → Foundational (T002)** before story work.
- **User stories are independent** of each other and may proceed in parallel after T002. Within stories:
  - US1: T003 → T004 → {T005, T006}
  - US2: {T007, T008} → T009 (needs T007) → {T010 (needs T008+T009), T012 (needs T009)}; T011 parallel
  - US3: T013; T014 parallel
  - US4: {T015, T016} → T017; T018 parallel; T019 needs T015
  - US5: T020 (standalone)
  - US6: T021 → T022 → T024 → {T026, T027}; T023 parallel → enables T024/T025; T025 needs T023
- **Polish (T028–T035)** after the stories being shipped are complete. T029 requires the new test tasks (T012, T019, T027) to exist.

## Parallel Opportunities

- All `[P]` i18n tasks (T011, T014, T018) and the type-only task (T023) run alongside their story's component work.
- The three unit-test tasks (T012, T019, T027) each run in parallel with sibling work once their mapper exists.
- Across stories: US3 (T013), US5 (T020), and the US2 component scaffolds (T007, T008) can all be built concurrently.

## Implementation Strategy

- **MVP (priority order)**: US1 (member invite parity) is the most-degraded area and the recommended MVP. US2 (VC invite) is the other P1.
- **Alternative smallest-first order** (fastest visible wins): US6 → US3 → US5 → US1 → US4 → US2. The codegen prerequisite (T021–T022) gates only US6.
- Ship each story as its own reviewable increment; each maps to one acceptance criterion in issue #9752 and is independently verifiable via `quickstart.md`.

## Task Summary

- **Total tasks**: 35
- **Per story**: US1 = 4 (T003–T006) · US2 = 6 (T007–T012) · US3 = 2 (T013–T014) · US4 = 5 (T015–T019) · US5 = 1 (T020) · US6 = 7 (T021–T027); Setup/Foundational = 2; Polish = 8.
- **Unit-test tasks (pure logic)**: 3 — T012 (VC mapper), T019 (subspace drag/pin predicate + sort-mode round-trip), T027 (layout mapper profileUrl + active-phase).
- **GraphQL change**: 1 additive fragment field (+codegen).
- **Net-new files**: 4 (CRD `VirtualContributorInviteDialog.tsx`, its connector + `vcInviteMapper.ts`, and 3 `*.test.ts` colocated with their mappers/helpers — note the predicate test reuses the existing `subspacesMapper.ts`). Everything else extends/wires existing files.
