---
description: "Tasks for CRD Member Settings Dialog (feature 094)"
---

# Tasks: CRD Member Settings Dialog

**Input**: Design documents from `/specs/094-crd-member-settings-dialog/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/crd-components.md ✅, quickstart.md ✅

**Tests**: Not requested by the spec — no test tasks generated. Validation runs through the manual test matrix in `quickstart.md` plus the existing Vitest suite (which must continue to pass).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All file paths are absolute or relative to repo root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies, scaffolding, or build config changes are required for this feature. The CRD primitives (`dialog`, `alert-dialog`, `checkbox`, `label`, `button`, `avatar`, `dropdown-menu`) all exist; the integration container, `useCommunityAdmin` orchestrator, and `useCommunityPolicyChecker` already wire mutations and policy. The branch `094-crd-member-settings-dialog` is already created and checked out.

- [X] T001 Verify `src/crd/primitives/alert-dialog.tsx` exposes `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` (read the file). If any export is missing, add it (the underlying Radix primitive supports them all). No code change expected.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ground the CRD type contract, expose the missing integration callbacks, and seed the i18n key tree across all six locales. After this phase, every user story can be implemented in isolation against a stable shared surface.

**⚠️ CRITICAL**: No user-story work should begin until this phase is complete.

- [X] T002 Create the shared CRD types file at `src/crd/components/space/settings/types.ts` exporting:
  - `type MemberSettingsSubject` (discriminated union `'user' | 'organization'`)
  - `type MemberSettingsLeadPolicy = { canAddLead: boolean; canRemoveLead: boolean }`
  - `type MemberSettingsCallbacks` (with `onLeadChange`, optional `onAdminChange`, optional `onRemoveMember`)
  - `type ActiveMemberSettings` (closed/open variant carrying `subject`)
  - `type ActiveRemoveConfirmation` (closed/open variant carrying `subject` + `source: 'dropdown' | 'dialog'`)
  Match the shapes documented in `specs/094-crd-member-settings-dialog/data-model.md`.

- [X] T003 [P] Add the new key tree under `community.memberSettings.*` and `community.members.dropdown.*` to `src/crd/i18n/spaceSettings/spaceSettings.en.json` exactly as enumerated in `data-model.md` § "Translation key inventory" (title, lead, admin, maxLeadsWarning, section.role, section.authorization, section.removeMember, remove.link, remove.confirmTitle, remove.confirmBody, remove.confirmCta, remove.cancelCta, footer.save, footer.cancel, dropdown.viewProfile, dropdown.changeRole, dropdown.removeFromSpace).

- [X] T004 [P] Mirror the same key tree to `src/crd/i18n/spaceSettings/spaceSettings.nl.json` (English placeholder values acceptable until translated).

- [X] T005 [P] Mirror to `src/crd/i18n/spaceSettings/spaceSettings.es.json`.

- [X] T006 [P] Mirror to `src/crd/i18n/spaceSettings/spaceSettings.bg.json`.

- [X] T007 [P] Mirror to `src/crd/i18n/spaceSettings/spaceSettings.de.json`.

- [X] T008 [P] Mirror to `src/crd/i18n/spaceSettings/spaceSettings.fr.json`.

- [X] T009 Extend `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts`:
  - Read the current viewer via `useUserContext()` and expose `viewerId: string | undefined` on the hook's return.
  - Expose a new `onAdminChange(memberId, isAdmin)` callback that calls `useAssignRoleToUserMutation` / `useRemoveRoleFromUserMutation` with `RoleName.Admin`, mirroring the existing `onLeadChange` plumbing in `useCommunityAdmin`. Reuse the existing toast surface; do not add new toast plumbing.
  - Add row → `MemberSettingsSubject` mappers for both users and organizations (use the row models already produced for `SpaceSettingsCommunityView`). For users, source `firstName` from the underlying GraphQL response if available; fall back to `displayName` otherwise.
  - Keep all existing exports working — no breaking changes to other callers in this same file.

- [X] T010 Extend `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`:
  - Add `useState<ActiveMemberSettings>({ open: false })` for `activeMemberSettings`.
  - Add `useState<ActiveRemoveConfirmation>({ open: false })` for `activeRemoveConfirmation`.
  - Wire `viewerId` from `useCommunityTabData` into the page's render scope.
  - Do NOT mount the dialogs yet — that happens in stories US1/US3.

  **Implementation note**: rather than two `Active*` state objects, the page uses a single `activeMemberSubject: MemberSettingsSubject | null` plus a `removeOriginatedFromDialog: boolean` flag, and reuses the existing `community.pendingRemoval` state for the confirmation surface (no duplicate `ActiveRemoveConfirmation` slot).

**Checkpoint**: Foundation ready — user-story implementation can now begin.

---

## Phase 3: User Story 1 - Space admin promotes a community member to lead (Priority: P1) 🎯 MVP

**Goal**: A Space admin can open the Member settings dialog from a user row's `⋮` dropdown via "Change Role", toggle the lead checkbox (respecting the cap-disabled rule + helper text), and persist the change with Save. Cancel and outside-click discard.

**Independent Test**: Run quickstart steps **B**, **C**, **D**, **E** end-to-end. Lead toggle works in both directions; cap-reached state disables the checkbox for non-leads; Cancel/Esc/outside-click discard pending changes.

### Implementation for User Story 1

- [X] T011 [P] [US1] Create `src/crd/components/space/settings/MemberSettingsDialog.tsx` rendering the full dialog body (chip → Role section → Authorization section → Remove section → footer) per `contracts/crd-components.md` § 1. Sections render conditionally on prop presence:
  - Authorization section renders only when `subject.type === 'user'` AND `onAdminChange` is provided.
  - Remove section renders only when `onRemoveMember` is provided AND `hideRemoveSection !== true`.
  - In US1 the consumer only passes `onLeadChange`; the dialog renders Role section + footer only.
  - Internal state: `isLead`, `isAdmin`, `saveInFlight` (other internal flags introduced in later stories).
  - Save handler diffs against `subject.isLead` / `subject.isAdmin` and calls `onLeadChange` / `onAdminChange` accordingly; on success calls `onOpenChange(false)`; on rejection clears in-flight state, leaves dialog open.
  - Lead checkbox `disabled` follows the rule in `data-model.md`.
  - Helper text below the lead checkbox uses an `id` referenced via `aria-describedby` on the checkbox.
  - All user-visible strings from `useTranslation('crd-spaceSettings')` under the `community.memberSettings.*` keys.
  - Trash icon imported from `lucide-react` for the (yet-disabled) Remove link rendering — its aria-hidden flag is set even though the link is hidden in US1.
  - Strictly no MUI / Emotion / Apollo / domain / router imports (per CRD CLAUDE.md).

- [X] T012 [US1] Modify `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx`:
  - Replace the existing user-row dropdown's **Promote/demote lead** `DropdownMenuItem` with a **Change Role** item that calls a new `onMemberChangeRole(subject)` prop. (The legacy lead-action item is deleted, not kept alongside.)
  - Replace the existing user-row dropdown's **Remove** `DropdownMenuItem` with a **Remove from Space** item that calls a new `onUserRemoveRequest(subject)` prop. (Wiring of this callback lands in US5; for US1 it is acceptable that clicking it opens nothing — the prop is plumbed but the consumer leaves it undefined or no-op until US3/US5 mount the AlertDialog.)
  - Keep the **View Profile** `<a href>` item unchanged.
  - Final dropdown order for users: View Profile → Change Role → DropdownMenuSeparator → Remove from Space.
  - Add the two new props to `SpaceSettingsCommunityViewProps`: `onMemberChangeRole: (subject: MemberSettingsSubject) => void` and `onUserRemoveRequest: (subject: MemberSettingsSubject) => void`. The legacy `onUserLeadChange` and `onUserRemove` props are **removed** from the type.
  - Preserve all existing other behavior (search, sort, pagination, columns, role label).

- [X] T013 [US1] Modify `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts` to expose:
  - `onMemberChangeRole(subject)` → calls a setter passed in from `CrdSpaceSettingsPage` to set `activeMemberSettings = { open: true, subject }`. (The cleanest pattern is to expose the setter from the hook to the page rather than the other way around — pick the variant that matches the existing data flow in this file.)
  - `onUserRemoveRequest(subject)` plumbed similarly (still no-op visually until US5 wires the AlertDialog).
  - The legacy `onUserLeadChange` integration callback is removed from the hook's return surface (lead changes now flow through `MemberSettingsDialog.onLeadChange`).
  - Keep `userLeadPolicy` exposure unchanged — it's still consumed.

- [X] T014 [US1] Modify `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` to:
  - Pass `onMemberChangeRole` and `onUserRemoveRequest` into `SpaceSettingsCommunityView`.
  - Mount `<MemberSettingsDialog />` as a sibling of the community view, controlled by `activeMemberSettings`.
  - Wire its props for users: `subject`, `leadPolicy = { canAddLead: leadPolicy.canAddLeadUser, canRemoveLead: leadPolicy.canRemoveLeadUser }`, `onLeadChange = community.userAdmin.onLeadChange`, `onOpenChange = (open) => setActiveMemberSettings(open ? prev : { open: false })`.
  - Do NOT pass `onAdminChange` or `onRemoveMember` yet — those land in US2 / US3.

**Checkpoint**: User Story 1 fully functional. Manual quickstart steps B/C/D/E pass. Admins can promote/demote leads via the new dialog. The dropdown contains View Profile / Change Role / Remove from Space (the last is visually present but its action is a no-op until US3+US5 mount the AlertDialog and wire confirmation).

---

## Phase 4: User Story 2 - Space admin grants or revokes admin rights (Priority: P1)

**Goal**: A Space admin opens the Member settings dialog for an individual user, toggles the **admin** checkbox in the Authorization section, and Save persists both lead and admin changes (when both differ from the loaded values). Organizations do not see the Authorization section.

**Independent Test**: Run quickstart steps **F** and **G**. Admin toggle works in both directions; combined lead+admin save commits both; Authorization section is absent when subject is an organization (verified in US4 by extension).

### Implementation for User Story 2

- [X] T015 [US2] Modify `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`:
  - When mounting `<MemberSettingsDialog />` for a user subject, additionally pass `onAdminChange = community.userAdmin.onAdminChange` (now exposed by `useCommunityTabData` per T009).
  - For organization subjects (added in US4) `onAdminChange` MUST remain `undefined` so the Authorization section is suppressed.

- [X] T016 [US2] Sanity-check that `MemberSettingsDialog`'s Save handler (already implemented in T011) issues both `onLeadChange` and `onAdminChange` independently when their respective values differ from `subject.isLead`/`subject.isAdmin`. No code change expected if T011 followed the contract; if not, add the two-call diff path now.

**Checkpoint**: User Story 2 fully functional. Admins can toggle admin rights and combine them with lead changes in a single Save. Organizations remain admin-section-free.

---

## Phase 5: User Story 3 - Space admin removes a member with confirmation (Priority: P1)

**Goal**: From inside the Member settings dialog, the admin clicks the destructive Remove link → an `AlertDialog` confirmation prompt appears with the member's display name and cascade-removal warning → Confirm runs the removal mutation; both surfaces close on success. Cancel discards. The viewer cannot self-remove (FR-016).

**Independent Test**: Run quickstart steps **H**, **J**, **K**, **L** (in-dialog path of K and L only). The in-dialog Remove flow opens the confirmation prompt; Confirm and Cancel both behave per the spec; the viewer's own row never shows the Remove section.

### Implementation for User Story 3

> **Revision after foundational discovery**: The existing `src/crd/components/dialogs/ConfirmationDialog.tsx` (already used at `CrdSpaceSettingsPage.tsx:505` for community removal via the `pendingRemoval` state) already provides the AlertDialog-based destructive prompt. Tasks below reuse it instead of building a new `RemoveMemberAlertDialog` component. The contract document still describes the conceptual `RemoveMemberAlertDialog`; in practice it's the existing `ConfirmationDialog` instance, gated on `community.pendingRemoval`. Spec FR-008/FR-009/FR-Story-3 are still satisfied because both Remove paths (dropdown and in-dialog) flow through `community.onUserRemove` / `community.onOrgRemove` → `pendingRemoval` → existing `ConfirmationDialog`.

- [X] T017 [US3] Update `src/crd/i18n/spaceSettings/spaceSettings.{en,nl,es,bg,de,fr}.json` — extend the existing `community.confirmRemove.user.description` and `community.confirmRemove.organization.description` keys with the cascade-removal warning matching FR-009. Updated to: title "Are you sure you want to remove this member?" / "...this organization?" and description "By clicking Confirm, {{name}} will be removed from this community and all underlying subspaces they may be a member of. Their contributions will remain in place. This action cannot be undone." Mirrored across all six locale files.

- [X] T018 [US3] `src/crd/components/space/settings/MemberSettingsDialog.tsx`:
  - In-dialog Remove link calls `onRemoveMember(subject.id)` — wired by integration to the existing `pendingRemoval` state.
  - Dialog does NOT mount its own AlertDialog; integration's existing `ConfirmationDialog` (z-90) overlays.
  - While `saveInFlight === true`, the Remove link is disabled.

- [X] T019 [US3] `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`:
  - `removeOriginatedFromDialog: boolean` flag added.
  - `onRemoveMember` prop on `MemberSettingsDialog` set to `undefined` when `community.viewerId === activeMemberSubject.id` (FR-016) — this hides the Remove section. Otherwise it sets the flag and routes to `community.onUserRemove` / `community.onOrgRemove` based on subject type.
  - Existing `ConfirmationDialog` `onConfirm` wrapped to await `community.confirmRemoval()` and, if `removeOriginatedFromDialog === true`, also clear `activeMemberSubject`. Flag cleared in `onCancel` and `onOpenChange(false)` paths.

**Checkpoint**: User Story 3 fully functional. The in-dialog Remove path runs through the AlertDialog with confirmation. Self-removal is blocked. Mutation failure flow is identical to the existing toast pattern (no new code).

---

## Phase 6: User Story 4 - Organization parity (Priority: P2)

**Goal**: The same `⋮` dropdown shape (View Profile / Change Role / Remove from Space) is exposed on Organization rows. Opening the Member settings dialog for an organization shows only the Role section + Remove section (no Authorization section). The same AlertDialog handles confirmation.

**Independent Test**: Run quickstart steps **F** (organizations branch only — verify Authorization section hidden) and the org-specific portions of **B**/**C**/**H**.

### Implementation for User Story 4

- [X] T020 [US4] Modify `src/crd/components/space/settings/SpaceSettingsCommunityView.tsx`:
  - Replicate the user-row dropdown changes for organization rows: replace the inline lead-toggle and immediate-Remove items with `Change Role` (calls `onOrgChangeRole(subject)`) and `Remove from Space` (calls `onOrgRemoveRequest(subject)`).
  - Keep View Profile.
  - Final org-row dropdown order matches the user-row dropdown.
  - Add the two new props to the view's type (`onOrgChangeRole`, `onOrgRemoveRequest`); remove the legacy `onOrgLeadChange` and `onOrgRemove` props.

- [X] T021 [US4] Modify `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts`:
  - Expose `onOrgChangeRole(subject)` and `onOrgRemoveRequest(subject)` (parallel to the user equivalents from T013).
  - Remove the legacy `onOrgLeadChange` from the return surface — org lead changes now flow through `MemberSettingsDialog.onLeadChange`.

- [X] T022 [US4] Modify `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`:
  - Pass the new org callbacks into `SpaceSettingsCommunityView`.
  - When `activeMemberSettings.subject.type === 'organization'`:
    - Pass `leadPolicy = { canAddLead: leadPolicy.canAddLeadOrganization, canRemoveLead: leadPolicy.canRemoveLeadOrganization }`.
    - Pass `onLeadChange = community.organizationAdmin.onLeadChange`.
    - Do NOT pass `onAdminChange`.
  - In the AlertDialog confirm handler, branch by `subject.type` and call `community.organizationAdmin.onRemoveMember(subject.id)` for organizations.

**Checkpoint**: User Story 4 fully functional. Org rows behave identically to user rows except the Authorization section is suppressed for orgs.

---

## Phase 7: User Story 5 - Dropdown Remove path + cleanup (Priority: P2)

**Goal**: The `⋮` dropdown's "Remove from Space" item routes to the same AlertDialog as the in-dialog Remove link. Both paths converge on a single AlertDialog instance and a single mutation. The legacy "Promote/demote lead" and immediate-Remove items are gone (cleanup verification).

**Independent Test**: Run quickstart step **I**. Activate Remove from Space from the dropdown — same confirmation prompt as Test H appears; Confirm and Cancel behave identically. No legacy dropdown items remain.

### Implementation for User Story 5

- [X] T023 [US5] `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx` — implementation reuses the existing `community.onUserRemove(id)` / `community.onOrgRemove(id)` integration callbacks for the dropdown's Remove from Space item. Both dropdown and in-dialog Remove paths converge on the same `community.pendingRemoval` state and the same `ConfirmationDialog`. The page tracks `removeOriginatedFromDialog` so the in-dialog path also closes the Member settings dialog on confirm-success; the dropdown path does not (Member settings dialog was never opened).

- [X] T024 [US5] Verified `SpaceSettingsCommunityView.tsx`: both dropdowns now contain exactly View Profile → Change Role → separator → Remove from Space (red). `grep` for `promoteToLead|demoteFromLead|onUserLeadChange|onOrgLeadChange` in the file returns 0 matches. Trash icon has `aria-hidden="true"`. Destructive class `text-destructive focus:text-destructive` preserved.

- [X] T025 [US5] Prototype comparison: dropdown order matches `prototype/src/app/components/space/SpaceSettingsCommunity.tsx:534-562` (View Profile, Change Role, separator, Remove from Space — destructive). Copy matches via `community.members.dropdown.*` and `community.organizations.dropdown.*` keys.

**Checkpoint**: User Story 5 fully functional. All four feature acceptance scenarios for the dropdown / dual-Remove-path pattern pass. The CRD Community tab is at parity with the legacy MUI dialog functionality and matches the prototype's row affordance shape.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates that touch every story.

- [X] T026 [P] `pnpm tsc --noEmit` clean. `pnpm exec biome ci <changed files>` clean (auto-format pass applied). `pnpm exec eslint <changed files>` clean. Note: the project-wide `pnpm lint` currently fails due to a pre-existing tooling issue — a parallel git worktree at `.claude/worktrees/auth-error-page` (branch `095-crd-auth-error-page`) contains its own `biome.json`, which biome v2 rejects as a nested root config. This is unrelated to feature 094 and was present before my changes; resolution belongs to whoever owns that worktree (either `git worktree remove` it or add `.claude/` to biome ignores in a separate PR).

- [X] T027 [P] `pnpm vitest run` — 142 test files, 1456 tests passed, 6 skipped, 0 failed. No regressions.

- [X] T028 [P] `pnpm build` — built in 1m 26s. No new warnings beyond the existing chunk-size advisory.

- [X] T029 [P] MUI/Emotion import audit:

  ```bash
  git diff develop -- 'src/crd' 'src/main/crdPages' | grep -E "^\+.*from\s+['\"](@mui|@emotion)"
  # → 0 matches. PASS.
  ```

- [ ] T030 Run the full quickstart manual test matrix (`quickstart.md` steps A-P) on a local environment with both backend and frontend running. Capture any deviation from expected behavior in the PR description. *Requires browser session — pending interactive validation by the user.*

- [ ] T031 Accessibility verification (FR-018, FR-019, SC-006): keyboard-only walk-through of the dialog (Tab order, Esc, Enter on AlertDialog Confirm), VoiceOver / NVDA announces the dialog title, the helper text, and the destructive action correctly. Trash icon is aria-hidden; focus returns to the trigger row's `⋮` button after dialog close. *Requires assistive technology — pending interactive validation.*

- [ ] T032 Mobile viewport check (FR-020, SC-009): set Chrome DevTools to 360 × 640 (iPhone SE), verify no horizontal scroll inside the dialog, all checkboxes meet ≥ 44 px touch targets, the Close (X) is reachable, and the AlertDialog is fully visible with both buttons reachable. *Pending interactive validation.*

- [ ] T033 i18n verification (FR-017, SC-007): cycle the language selector through `en`, `nl`, `es`, `bg`, `de`, `fr`. For each, open the Member settings dialog and the AlertDialog, confirm every translated string renders with the locale's value (English placeholders acceptable for non-EN), and the browser console shows no missing-key warnings. *Pending interactive validation.*

- [ ] T034 CRD-toggle off regression check (FR-002, FR-022, SC-002, SC-008): with `localStorage.removeItem('alkemio-crd-enabled')` and a reload, navigate to the Space settings community page and verify the legacy MUI page renders unchanged. Open the MUI Member settings dialog (edit-pencil affordance) and confirm it still works (toggle lead, toggle admin, remove with confirmation). Toggle CRD on and reload — CRD page returns with no stale rendering. *Pending interactive validation.*

- [ ] T035 Update the PR description with: a screenshot of the new CRD dialog open on a user row, a screenshot of the AlertDialog with the cascade warning, a screenshot of the Organizations dropdown showing the new shape, a "no MUI/Emotion imports added" line referencing the audit from T029, and a checklist confirming T030-T034 all pass. *Pending PR creation by user.*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 verifies primitives — non-blocking; can complete in seconds.
- **Foundational (Phase 2)**: T002–T010 — BLOCKS all user stories. T002 (types) blocks every component task. T009 (integration callback exposure) and T010 (page state) block US1's wiring tasks. T003–T008 (i18n) can run in parallel with each other and with T002.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
  - US1 (P1) depends only on Phase 2.
  - US2 (P1) depends on US1 (it extends `MemberSettingsDialog`'s mounting in `CrdSpaceSettingsPage` from T014).
  - US3 (P1) depends on US1 (extends the same mount point and component) but is independent of US2.
  - US4 (P2) depends on US1, US2, US3 (it parallels the user-row treatment, reusing every prop / dialog / AlertDialog wired earlier).
  - US5 (P2) depends on US3 (the AlertDialog mount it reuses) and US4 (the org dropdown it touches for the Remove from Space wiring).
- **Polish (Phase 8)**: Depends on US1–US5 complete.

### User Story Dependencies

```text
Phase 2 ──► US1 ─┬─► US2
                ├─► US3 ─┬─► US4 ──► US5 ──► Phase 8
                └────────┘
```

### Within Each User Story

- T011 (component file creation) and T017 (AlertDialog file creation) can be drafted in parallel with the integration wiring tasks (T012–T014, T018–T019) only if the developer first stubs the prop signatures from `data-model.md` and `contracts/crd-components.md`. In practice it is simpler to write the component first and the wiring second.
- The dialog mount in T014 must NOT pass `onAdminChange` or `onRemoveMember` until US2 / US3 are reached — passing them prematurely would surface an admin section that does nothing and a Remove link that opens nothing.

### Parallel Opportunities

- **T003–T008** (six locale files): all `[P]`, fully parallelizable.
- **T011** (`MemberSettingsDialog.tsx` create) and **T012** (`SpaceSettingsCommunityView.tsx` modify): both `[P]` — different files, no shared imports.
- **T017** (`RemoveMemberAlertDialog.tsx` create): `[P]` — different file, no dependencies on T011's contents (only on T002 types).
- **T026, T027, T028, T029** (lint / test / build / import audit): all `[P]`, run concurrently in CI or terminal tabs.

---

## Parallel Example: Foundational Phase

```bash
# After T002 completes (types file), run these six i18n tasks in parallel:
Task: "Add new key tree to src/crd/i18n/spaceSettings/spaceSettings.en.json"  # T003
Task: "Mirror to spaceSettings.nl.json"                                        # T004
Task: "Mirror to spaceSettings.es.json"                                        # T005
Task: "Mirror to spaceSettings.bg.json"                                        # T006
Task: "Mirror to spaceSettings.de.json"                                        # T007
Task: "Mirror to spaceSettings.fr.json"                                        # T008
```

## Parallel Example: User Story 1

```bash
# Within US1, T011 and T012 can be opened in two editor tabs simultaneously:
Task: "Create MemberSettingsDialog.tsx (component)"                            # T011 [P]
Task: "Modify SpaceSettingsCommunityView.tsx (dropdown)"                       # T012

# T013 and T014 must follow because they consume the new prop surface from T012 and the new component from T011.
```

## Parallel Example: Polish Phase

```bash
# All four checks run concurrently:
Task: "Run pnpm lint and fix issues"                                           # T026 [P]
Task: "Run pnpm vitest run"                                                    # T027 [P]
Task: "Run pnpm build"                                                         # T028 [P]
Task: "MUI/Emotion import audit (grep)"                                        # T029 [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002–T010).
3. Complete Phase 3: User Story 1 (T011–T014).
4. **STOP and VALIDATE** with quickstart steps B/C/D/E.
5. Demo: an admin can promote/demote a community lead through the new CRD dialog. The Remove from Space dropdown item is visually present but inert until US3+US5 — acceptable interim if MVP scope is just lead-toggle parity.

### Incremental Delivery (recommended)

1. MVP (US1) → demo lead-toggle parity.
2. Add US2 → demo admin-toggle parity (CRD now matches MUI on Save flow).
3. Add US3 → demo safe member removal with confirmation; the in-dialog path is now production-ready.
4. Add US4 → organization parity; the same flows now work for orgs.
5. Add US5 → dropdown's Remove path activates; cleanup of legacy items.
6. Polish (T026–T035) → ship.

### Parallel Team Strategy

With two developers, after Phase 2:

1. Developer A: US1 → US2 → US5.
2. Developer B: US3 (AlertDialog component + integration wiring) and merges to develop after US1's component is in place.
3. US4 (orgs) is the natural integration point where both developers' work meets — pair on it.

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks in the same phase.
- `[Story]` label maps each implementation task to the user story it delivers, for traceability.
- Each user story is independently testable per the spec's Independent Test paragraphs and the matching quickstart steps.
- Commit after each task or each logical group of tasks (e.g., all six i18n files in one commit).
- The legacy MUI dialog and its parent components (`SpaceAdminCommunityPage`, `CommunityUsers`, `CommunityOrganizations`) are not modified by any task — they continue to serve users with the CRD toggle off. Spec FR-002 is satisfied trivially by leaving them alone.
- No GraphQL `.graphql` files are added or modified. `pnpm codegen` is **not** required for this feature.
