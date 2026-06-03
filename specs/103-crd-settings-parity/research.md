# Phase 0 Research: CRD (Sub)Space Settings Parity

All findings come from reading the current codebase (MUI baseline + CRD current state). Line numbers are accurate as of branch `103-crd-settings-parity`. Each item states the **root cause** before the chosen fix (Constitution Workflow #5).

---

## R1 — Member invite parity (US1, FR-001…FR-004)

**Root cause**: The settings Community tab mounts a *stripped-down* invite dialog (`src/crd/components/space/settings/InviteMembersDialog.tsx`, split email/users tabs, no welcome message, no roles) wired by `useInviteUsersDialog` in `src/main/crdPages/topLevelPages/spaceSettings/community/useAddCommunityMemberDialog.ts` (always sends `welcomeMessage: ''`, no `extraRoles`). A **parity-complete** dialog already exists and is unused by settings.

**Existing reusable assets**:
- `src/crd/components/community/InviteMembersDialog.tsx` (lines 1–237) — single `ContributorSelector` input, welcome message (required, send-disabled when empty), `RoleMultiSelect` (`LOCKED_ROLES=['Member']`, `OPTIONAL_ROLES=['Lead','Admin']`), result view + Back.
- `src/crd/forms/ContributorSelector.tsx` + `src/domain/community/inviteContributors/.../useContributors.ts` — live as-you-type search with `filter: { displayName: q, email: q }` (FR-001 live detection is **already satisfied** by this dialog); emails added on Enter/button via `emailParser`.
- `src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx` (lines 1–327) — self-contained connector; calls `useRoleSetApplicationsAndInvitations.inviteContributorsOnRoleSet({ roleSetId, invitedContributorIds, invitedUserEmails, welcomeMessage, extraRoles })` (the same mutation the stripped path uses, but with message + roles).

**Decision**: Use the parity connector from settings. The connector currently resolves `spaceId`/`roleSetId` via `useUrlResolver()`, which is wrong for subspace settings opened from a parent context (FR-012). Parameterize `InviteMembersDialogConnector` with **optional** `roleSetId` / `spaceId` / `spaceName` props that override the `useUrlResolver` lookup when provided. Settings passes `scope.roleSetId` / `scope.id` and the loaded space display name (available in `CrdSpaceSettingsPage`). Remove the stripped dialog + `useInviteUsersDialog` usage from the settings page (mounted at `CrdSpaceSettingsPage.tsx` lines 804–818). The stripped component file can stay until the page no longer references it; delete in cleanup.

**Rationale**: DRY (Constitution Arch. #6) — one invite experience, one mutation path. **Alternatives rejected**: (a) add message/roles to the stripped dialog → duplicates the parity dialog; (b) leave `useUrlResolver` → breaks subspace targeting.

---

## R2 — Virtual Contributor invite (US2, FR-005)

**Root cause**: No CRD VC-invite UI exists at all; spec 097 explicitly deferred it. MUI has a full flow.

**MUI baseline** (`src/domain/community/inviteContributors/virtualContributors/`):
- `InviteVCsDialog.tsx` — search + two sections: **On Account** and **In Library**.
- On-account VCs → direct **add** via `virtualContributorAdmin.onAdd(id)` (no message).
- Library VCs → **invite with message** via `InviteVirtualContributorDialog.tsx` → `virtualContributorAdmin.inviteContributors({ welcomeMessage, invitedContributorIds: [id], invitedUserEmails: [] })`.
- Available-VC queries via `useVirtualContributorsAdmin`: `useAvailableVirtualContributorsInSpaceAccount…`/`…InSpace…` (on account) and `useAvailableVirtualContributorsInLibrary…` (library).

**Already available in settings**: `useCommunityTabData` exposes `_adminRef` = `useCommunityAdmin(...)`, whose `virtualContributorAdmin` provides `members`, `onAdd`, `inviteContributors`, `onRemove`, and `permissions.canAddVirtualContributors`.

**Decision**: Build a **separate** CRD presentational dialog `src/crd/components/community/VirtualContributorInviteDialog.tsx` (pure: receives `accountVcs[]`, `libraryVcs[]`, `searchQuery`, `onSearchChange`, `onAddAccountVc(id)`, `onInviteLibraryVc(id, message)`, loading flags, labels) plus a connector `src/main/crdPages/topLevelPages/spaceSettings/community/VirtualContributorInviteConnector.tsx` wiring it to `virtualContributorAdmin` + the available-VC queries. Surface a distinct "Invite Virtual Contributor" entry point in `SpaceSettingsCommunityView` gated by `permissions.canAddVirtualContributors` (separate from the people "Invite Members" button — matches the clarified decision). Library invites require a message; use a message step/field inside the dialog. Adding/removing follow CRD rules (no destructive add; removal already confirmed elsewhere).

**Rationale**: Separate entry point mirrors legacy structure (clarified). **Alternatives rejected**: merging VC into the people invite dialog (diverges from legacy and conflates two mutation shapes).

---

## R3 — Active-phase indicator (US3, FR-006/FR-007)

**Root cause**: The *set-active-phase* capability is **already fully wired** — `LayoutPoolColumn.tsx` (lines 207–216) shows a menu item "✓ Current Phase / Set as Active Phase" calling `useColumnMenu`'s `onChangeActivePhase` → `useUpdateInnovationFlowCurrentStateMutation` (`useColumnMenu.ts` lines 48, 55–67), with optimistic update `markCurrentPhaseChanged` (`useLayoutTabData.ts` 306–315). The `LayoutPoolColumn` type already carries `isCurrentPhase: boolean` (`SpaceSettingsLayoutView.types.ts` 16–22), set by the mapper (`layoutMapper.ts` line 64). **What is missing is the at-a-glance visual indicator** on the column card (MUI shows a colored top border on the active state column).

**Decision**: FR-007 is already met; implement **only** FR-006 — add a visible indicator on the active column in `LayoutPoolColumn.tsx` (e.g. accent border + a small "Current phase" badge/icon). Must not rely on color alone (WCAG): pair the accent with an icon + `t()` label, and an `aria` cue. No data or mutation changes.

**Rationale**: Minimal, root-caused fix. **Alternatives rejected**: re-implementing the set-active flow (already works).

---

## R4 — Subspace sort/pin parity (US4, FR-009)

**Root cause**: The CRD subspaces **view** (`SpaceSettingsSubspacesView.tsx`) has no sort-mode selector and no drag-reorder; the **data hook already supports it but it's unwired**: `useSubspacesTabData.ts` reads `settings.sortMode` (line 54), runs `useSubspacesSorted` (line 62), and defines `onReorder` → `useUpdateSubspacesSortOrderMutation` (lines 138–142) plus `useUpdateSubspacePinnedMutation` — but the page (`CrdSpaceSettingsPage.tsx` lines 468–477) never passes `onReorder` and the view has no `sortMode`/`onSortModeChange` props. Mapper helpers `mapSortMode` / `mapSortModeToBackend` exist (lines 24–30) but are unused.

**MUI baseline** (`src/domain/spaceAdmin/SpaceAdminSubspaces/`): `SortModeDropdown` (Alphabetical/Custom via `useUpdateSpaceSettingsMutation` `settings.sortMode`); `SubspacesSortableList` + `SubspacesSortableItem` (@dnd-kit) where `isDragDisabled` = in Custom mode nothing disabled (all draggable), in Alphabetical mode only **pinned** items draggable.

**Existing CRD @dnd-kit patterns to follow**: `src/crd/forms/callout/PollOptionsEditor.tsx`, `src/crd/components/callout/CalloutContributionsSortDialog.tsx` (vertical list + `KeyboardSensor`), and `SpaceSettingsLayoutView.tsx` (grid drag) — so no new dependency, just a new sortable list in the subspaces view.

**Decision**: Add to `SpaceSettingsSubspacesView` the props `sortMode: 'alphabetical' | 'manual'`, `onSortModeChange(mode)`, `onReorder(orderedIds)`; render a sort-mode selector and wrap the list in @dnd-kit `DndContext`/`SortableContext` with `isDragDisabled` mirroring MUI (Custom → all draggable; Alphabetical → only `isPinned`). Wire `useSubspacesTabData` to expose `sortMode` (from the already-read `settings.sortMode`, via `mapSortMode`) and a new `onSortModeChange` → `useUpdateSpaceSettingsMutation`; pass `onReorder`/`sortMode`/`onSortModeChange` from the page. Keep the existing kebab pin action; only its drag interplay is mode-gated. Drag must be keyboard-accessible (reuse the sensor config).

**Rationale**: Full parity incl. pinning (clarified) with the least new code — the data layer already exists. **Alternatives rejected**: custom-only reorder (rejected by clarification).

---

## R5 — Innovation Flow phase description rendering (US5, FR-008)

**Root cause**: `LayoutPoolColumn.tsx` (lines 127–129) renders the phase description as a raw string inside `<p className="… line-clamp-3 …">{column.description}</p>`, so stored markdown/HTML (`<strong>…</strong>`) shows literally (CRD Golden Rule #10 violation). The **editor is already a rich-text editor** (the edit form lower in the same file) and is out of scope per the user's correction. Note: `LayoutCallout.description` is separately always-empty today — unrelated, not in scope.

**Existing reusable asset**: `src/crd/components/common/InlineMarkdown.tsx` (truncated/preview markdown renderer; the CRD equivalent of MUI `WrapperMarkdown plain`). `MarkdownContent.tsx` also exists (full rich render).

**Decision**: Replace the raw `{column.description}` render with `<InlineMarkdown>`; because `InlineMarkdown` emits a block (`<div>`), change the wrapper element from `<p>` to `<div>` (avoid invalid nesting per Golden Rule #10 checklist) while keeping `line-clamp-3` and the muted text token so the **truncation is unchanged**. No data change.

**Rationale**: Smallest correct fix; matches the clamp the user wants kept. **Alternatives rejected**: switching the editor (explicitly out of scope); `MarkdownContent` (full render breaks the intended clamp/preview density).

---

## R6 — "View post" navigation (US6, FR-010)

**Root cause**: `LayoutCalloutRow.tsx` (line 95) correctly calls `onViewPost(callout.id)`, but the handler in `CrdSpaceSettingsPage.tsx` (lines 366–370) is a TODO no-op because the callout's `profile.url` is not fetched or mapped — `LayoutCallout` carries only `id/title/description/flowStateTagsetId`, and the callout `framing.profile` selection lacks `url`.

**GraphQL source to change**: `src/domain/collaboration/InnovationFlow/graphql/InnovationFlowCollaboration.fragment.graphql` — `callouts.framing.profile` selects `id, displayName` but **not** `url`. Add `url`. Then `pnpm codegen` (Constitution III) and commit the regenerated `apollo-hooks.ts` / `graphql-schema.ts`.

**Decision**: Add `url` to the fragment; map it in `layoutMapper.ts` (`calloutToLayoutCallout`) to a new `LayoutCallout.profileUrl`; add `profileUrl: string` to `SpaceSettingsLayoutView.types.ts`; replace the no-op handler so it resolves the callout's `profileUrl` from the loaded columns and navigates to it (the callout's canonical `profile.url`, per the URL rule — read it off the entity rather than templating a path). If a `profileUrl` is empty/unresolved, do not render "View post" as an actionable no-op (per FR-010 / AC-2).

**Rationale**: Reads the canonical URL off the entity (migration-guide URL rule). **Alternatives rejected**: hand-building `/collaboration/<nameId>` inline (violates the urlBuilders/profile.url rule).

---

## Cross-cutting decisions

- **i18n**: new strings (sort-mode labels, "Current phase" badge, VC-invite labels) go to the appropriate `crd-*` namespace files for all six languages (en, nl, es, bg, de, fr) in this PR (CRD is not Crowdin-managed). Reuse existing settings/community namespaces where present.
- **Subspace vs top-level (FR-012)**: every change must be verified in both. The invite-connector parameterization (R1) is the main risk point — explicitly pass the subspace's `roleSetId`.
- **Permissions (FR-013)**: gate the VC entry point on `permissions.canAddVirtualContributors`; the role multi-select only offers Admin/Lead where the role-set permits (the parity dialog already respects this).
- **Safeguards (FR-014)**: deletions reachable here keep `ConfirmationDialog`; the invite dialog already uses the discard guard where it holds authored content. No new destructive actions introduced.
- **Codegen**: exactly one fragment changes; run `pnpm codegen` against a running backend and commit generated outputs.
