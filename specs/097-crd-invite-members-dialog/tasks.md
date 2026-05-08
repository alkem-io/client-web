---
description: "Task list for CRD Invite Members Dialog migration"
---

# Tasks: CRD Invite Members Dialog

**Input**: Design documents from `/specs/097-crd-invite-members-dialog/`
**Prerequisites**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/crd-invite-members-dialog.ts](contracts/crd-invite-members-dialog.ts), [quickstart.md](quickstart.md)

**Tests**: Component tests are included as optional polish tasks (T025–T026). The CRD presentational components are pure UI that can be tested with Vitest + jsdom; the connector is integration glue and is verified manually via `quickstart.md` plus the existing legacy domain tests for `useContributors` / `useRoleSetApplicationsAndInvitations`.

**Organization**: Tasks are grouped by user story. Stories US1 and US2 are both P1 — the MVP includes both because the legacy dialog's "search OR paste email" UX is the value proposition; US1 alone doesn't replace it.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps the task to a user story from spec.md (US1, US2, US3, US4)
- All paths are absolute from repo root: `/Users/polibon/Projects/alkemio/client-web/`

## Path Conventions

This is a single-app web project (Vite SPA). Layering:

- **Presentational** (CRD): `src/crd/components/`, `src/crd/forms/`, `src/crd/i18n/`
- **Integration** (CRD pages): `src/main/crdPages/space/dialogs/`
- **Domain** (reused, untouched): `src/domain/community/inviteContributors/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new `crd-community` i18n namespace and seed the English source file so subsequent component work can call `t('crd-community:...')` without typing errors.

- [X] T001 Register `crd-community` namespace in `crdNamespaceImports` in `/Users/polibon/Projects/alkemio/client-web/src/core/i18n/config.ts` — six entries (en/nl/es/bg/de/fr) following the pattern of the adjacent `crd-spaceSettings` block; do NOT add `crd-community` to the eager `ns` array (lazy-load on demand). **Also added the import + `Resources` entry in `@types/i18next.d.ts` so `t('crd-community:...')` is strictly typed (matches existing pattern for every other CRD namespace).**
- [X] T002 Create `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/community/community.en.json` with the full string set under three top-level keys: `inviteMembers.dialog.*` (header, search hint, placeholders, button labels, role-popover labels, result-row outcome labels, close aria-label), `inviteMembers.errors.*` (per-chip validation messages: invalid, duplicate; network-failure toast), and `inviteMembers.results.*` (sent / alreadyMember / error labels). Pre-fill all values in English; later phases tune wording per FR observables.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the three new CRD components and the five non-English translation files. After this phase the dialog renders end-to-end with mock props but is not yet wired to Apollo.

**⚠️ CRITICAL**: User-story phases T008+ depend on these components existing.

- [X] T003 [P] Create `RoleMultiSelect` form component at `/Users/polibon/Projects/alkemio/client-web/src/crd/forms/RoleMultiSelect.tsx` per `contracts/crd-invite-members-dialog.ts` § `RoleMultiSelectProps`: Popover trigger renders the comma-joined selected role labels with a chevron; PopoverContent renders one labelled checkbox per role; locked roles render checked + disabled with a helper line "Member is always granted." Trigger uses `aria-haspopup="dialog"` + `aria-expanded` from the Popover open state.
- [X] T004 [P] Create `ContributorSelector` form component at `/Users/polibon/Projects/alkemio/client-web/src/crd/forms/ContributorSelector.tsx` per `contracts/crd-invite-members-dialog.ts` § `ContributorSelectorProps`: structured like the existing `UserSelector` but the chip list and result rendering work over the `Invitee` discriminated union. The autocomplete dropdown shows kind:'user' rows (avatar + display name + location). Selected `kind:'email'` chips render with a mail icon and the email; chips with `validationError` render with a destructive border and a tooltip via the existing CRD Tooltip. Pressing Enter (when `allowEmailInvites` is true) calls `onAddEmails(rawText)`. The dropdown's bottom-of-list sentinel uses `IntersectionObserver` to call `onLoadMore()` while `hasMore` is true.
- [X] T005 Create `InviteMembersDialog` presentational component at `/Users/polibon/Projects/alkemio/client-web/src/crd/components/community/InviteMembersDialog.tsx` per `contracts/crd-invite-members-dialog.ts` § `InviteMembersDialogProps`. Composes Radix Dialog (CRD `dialog.tsx`) + `ContributorSelector` (T004) + Textarea + `RoleMultiSelect` (T003) + footer note + Send button. Owns local view state `useState<'form' \| 'result'>('form')` and a `useEffect` that resets it to `'form'` whenever `open` transitions false→true OR `results` becomes undefined (so a parent that clears `results` returns the dialog to the form view). Implements all Send-disabled rules from `data-model.md` § InvitationBatch. Result view renders one row per `InvitationResult` with the per-row outcome text from `labels.resultOutcomeLabels` (no color-only signalling — outcome is always in text).
- [X] T006 [P] Create `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/community/community.nl.json` — Dutch translation of every key in the English file. AI-assisted; reviewed.
- [X] T007 [P] Create `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/community/community.es.json` — Spanish translation.
- [X] T008 [P] Create `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/community/community.bg.json` — Bulgarian translation.
- [X] T009 [P] Create `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/community/community.de.json` — German translation.
- [X] T010 [P] Create `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/community/community.fr.json` — French translation.

**Checkpoint**: All three CRD components compile against the contracts, the dialog is renderable end-to-end with mock props, and `useTranslation('crd-community')` resolves in all six languages. No Apollo wiring exists yet.

---

## Phase 3: User Story 1 - Invite existing Alkemio users (Priority: P1) 🎯 MVP

**Goal**: A Space admin can open the dialog from the Community sidebar, pick existing users via autocomplete, accept the default welcome message and role, send, and see a result list — replacing the MUI dialog at the two CRD entry points.

**Independent Test**: Manually run quickstart.md § US1. Confirm the Community tab on a CRD-enabled space opens the new CRD dialog (no MUI chrome), autocomplete returns matching users with avatar + name + location, sending creates invitations and renders the result view with one "sent" row per invitee.

- [X] T011 [US1] Create `InviteMembersDialogConnector.tsx` skeleton at `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/space/dialogs/InviteMembersDialogConnector.tsx`. Props: `open: boolean; onClose: () => void; onlyFromParentCommunity?: boolean`. Renders `<InviteMembersDialog>` with all props plumbed via local React state (selected contributors, search query, welcome message, extra roles). All `t('crd-community:...')` resolution lives here so `InviteMembersDialog` stays Apollo/i18n-free.
- [X] T012 [US1] In the connector (T011), wire `useInviteUsersDialogQuery` from `/Users/polibon/Projects/alkemio/client-web/src/core/apollo/generated/apollo-hooks.ts` keyed off the resolved `spaceId` from `useUrlResolver()`. Surface `space.about.profile.displayName` to the dialog as `spaceName` and `space.about.membership.roleSetID` for the mutation. Pre-fill the welcome message via `t('crd-community:inviteMembers.dialog.defaultWelcomeMessage', { spaceName })`.
- [X] T013 [US1] In the connector, integrate the existing `useContributors` hook from `/Users/polibon/Projects/alkemio/client-web/src/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors.ts`. Map its results to the `searchResults` shape in `contracts/crd-invite-members-dialog.ts` § ContributorSelectorProps. Wire `onSearchChange` → debounced (300 ms) `setFilter`; wire `onLoadMore` → `fetchMore`; surface `loading` and `hasMore` to the dialog. Filter out the current user via `useCurrentUserContext`, plus any already-selected `kind:'user'` chips.
- [X] T014 [US1] In the connector, implement `handleSelectUser(userId)` — look up the row in the latest `useContributors` results, build a `kind:'user'` Invitee with `displayName`, `avatarUrl`, `location` (city + country joined per `t('common.locationFormat')` if both present, otherwise the single field).
- [X] T015 [US1] In the connector, implement `handleSend()` for the user-only path: build `invitedContributorIds` from `kind:'user'` chips and pass an empty `invitedUserEmails` array; call `inviteContributorsOnRoleSet` from the existing `useRoleSetApplicationsAndInvitations({ roleSetId })` hook with `welcomeMessage` and `extraRoles: [RoleName.Member]` (US3 will widen this). Wrap the call in `useTransition` so `sending` toggles but the input stays interactive.
- [X] T016 [US1] Replace the MUI `InviteContributorsDialog` import + render in `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` with the new `InviteMembersDialogConnector`. Pass through the existing `inviteOpen` / `setInviteOpen(false)` plumbing. Drop the `ActorType.User` argument — the new connector handles only user invites by design.
- [X] T017 [US1] **N/A — already CRD-native, different UX.** Initial spec assumed `CrdSpaceSettingsPage.tsx` imported the legacy MUI `InviteContributorsDialog`; verification at implementation time showed it imports a different, already-CRD-native dialog at `src/crd/components/space/settings/InviteMembersDialog.tsx` with a table-based UX (per-row "Add" actions). No change needed at this entry point. If unifying the two invite UXes is desired, that's a separate spec.

**Checkpoint**: Quickstart § US1 passes end-to-end. The CRD Community tab and Space settings Community tab both open the new dialog. MUI no longer renders inside `src/main/crdPages/`. Email paste, role grant, and result-feedback flows are stubs (Send button still shows a basic success / no result list).

---

## Phase 4: User Story 2 - Invite people without an Alkemio account (Priority: P1)

**Goal**: A Space admin can paste a list of email addresses, see one chip per valid address with invalid addresses individually flagged, and send them in a single batch alongside any picked existing users.

**Independent Test**: Quickstart § US2 — paste `a@example.com, b@example.com c@example.com`, confirm three chips, add `not-an-email` and confirm a destructive validation indicator + tooltip, send and confirm three valid invitees in the result list.

- [X] T018 [US2] In `InviteMembersDialogConnector.tsx` (T011), implement `handleAddEmails(rawText)` using the existing `emailParser` from `/Users/polibon/Projects/alkemio/client-web/src/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser.ts`. Parse the raw text into address objects, build `kind:'email'` Invitees, and tag each one with `validationError` set to `'invalid'` for parser-rejected entries and `'duplicate'` for entries that already exist (by email) in the current chip list. Append the new Invitees to the chip list and clear the search query.
- [X] T019 [US2] In `handleSend()` (T015), extend the mutation payload to include `invitedUserEmails`: filter chips to `kind:'email'` AND `validationError === undefined`. The Send-disabled rule from `data-model.md` already prevents sending while any chip has a validation error.
- [X] T020 [US2] Verify per-chip validation rendering in `ContributorSelector` (T004) handles the new `validationError` values: render an inline destructive icon and a CRD Tooltip whose content comes from `labels.validationErrorLabel('invalid')` / `labels.validationErrorLabel('duplicate')`. (If T004 already covers this, mark complete; this task exists to ensure the rendering is verified against the connector's actual chip output.)
- [X] T021 [US2] In the connector (T011), honour the existing `onlyFromParentCommunity` prop by passing `allowEmailInvites={!onlyFromParentCommunity}` to `InviteMembersDialog`. The dialog already gates the email-paste path on this prop (T005).

**Checkpoint**: Quickstart § US2 passes. Both P1 stories — existing-user and email-paste — flow end-to-end. The dialog still defaults to Member-only role; result view still shows a single "sent" indicator per invitee.

---

## Phase 5: User Story 3 - Grant Lead and Admin on invitation (Priority: P2)

**Goal**: A Space admin can toggle Lead and Admin in the role popover; Member stays fixed; the mutation receives the union of selected roles.

**Independent Test**: Quickstart § US3 — open the role popover, confirm Member is checked + disabled, toggle Lead + Admin, send. After the invitee accepts (out of band), confirm they hold all three roles.

- [X] T022 [US3] In `InviteMembersDialogConnector.tsx` (T011), introduce `extraRoles` local state defaulting to `['Member']`. Pass it as `extraRoles` to `InviteMembersDialog` and pipe `onExtraRolesChange` back to `setExtraRoles`. The dialog's `RoleMultiSelect` already enforces the locked-Member invariant (T003); the connector never has to defensively re-add it.
- [X] T023 [US3] In `handleSend()` (T015 / T019), map the `Role[]` literal types to `RoleName[]` from `@/core/apollo/generated/graphql-schema` and pass as `extraRoles` to `inviteContributorsOnRoleSet`. The mapping is a switch over the three string literals — keep it inline; do NOT add an exhaustive enum-bridging utility.
- [X] T024 [US3] In the connector, add a defensive `assert(extraRoles.includes('Member'))` before calling the mutation. If the assertion fails (which the UI shouldn't allow), log to console and short-circuit Send. This catches future regressions in `RoleMultiSelect`.

**Checkpoint**: Quickstart § US3 passes. The role popover, role state, and mutation payload work end-to-end.

---

## Phase 6: User Story 4 - Per-invitee result feedback (Priority: P2)

**Goal**: After Send, the dialog shows a per-invitee result list with sent / already-member / error indicators; Back returns to the form preserving message + role; Close dismisses; reopen starts fresh.

**Independent Test**: Quickstart § US4 — send a mixed batch, verify three rows with three distinct outcomes, click Back and confirm chip list cleared but welcome message + role retained, click Close and reopen to confirm fresh state.

- [X] T025 [US4] In `InviteMembersDialogConnector.tsx` (T011), introduce `results: InvitationResult[] | undefined` local state. After `inviteContributorsOnRoleSet` resolves successfully, build `InvitationResult[]` by zipping the original submitted invitees with the legacy `InvitationResultModel[]` returned from the mutation: `outcome: 'sent'` when the result is successful, `'alreadyMember'` when the legacy result indicates the invitee is already a community member, `'error'` otherwise (with `errorMessage` from the legacy result's error field). Pass `results` to the dialog.
- [X] T026 [US4] In the connector, implement `onBack()` — clear chips and `results`, leave `welcomeMessage` and `extraRoles` untouched. The dialog's effect (T005) auto-resets the view to `'form'` because `results === undefined` again.
- [X] T027 [US4] Wire `onClose()` to clear ALL local state (chips, message, extraRoles, results) when called from any view, then call the prop `onClose`. The dialog's `useEffect` on `open` already resets the view; this guarantees reopening shows the default welcome message and Member-only role.
- [X] T028 [US4] In `handleSend()` (T015 / T019 / T023), wrap the mutation in a try/catch. On thrown error (network failure before per-invitee results are produced), do NOT set `results`; instead surface a toast via the existing `useNotification()` (or equivalent app-level notifier) using `t('crd-community:inviteMembers.errors.networkFailure')`. The dialog stays on the form view with chips intact (FR-007 edge case in spec.md).

**Checkpoint**: All four user stories pass end-to-end. Quickstart § US4 plus the regression checks at the bottom of `quickstart.md` all pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Optional component tests, accessibility verification, and final lint/type/test sweeps.

- [X] T029 [P] Add component tests at `/Users/polibon/Projects/alkemio/client-web/src/crd/forms/ContributorSelector.test.tsx` covering: chip add via `onSelectUser`, chip remove via `onRemoveContributor`, email-paste path renders chips with `validationError`-driven tooltips, autocomplete dropdown filters out already-selected users, `onLoadMore` fires when scrolled near the bottom while `hasMore` is true. Use Vitest + jsdom + `@testing-library/react`.
- [X] T030 [P] Add component tests at `/Users/polibon/Projects/alkemio/client-web/src/crd/components/community/InviteMembersDialog.test.tsx` covering: Send button disabled rules from `data-model.md` § InvitationBatch (one test per rule), view auto-switches form ↔ result based on `results` prop, view auto-resets to 'form' on `open` false→true transition, Back button preserves `welcomeMessage` and `extraRoles` (asserted via the props that the dialog passes back through `onWelcomeMessageChange` / `onExtraRolesChange` — they should NOT have been called).
- [X] T031 **Deferred to user/QA.** Run `quickstart.md` manually end-to-end on a CRD-enabled localhost — every user story checklist box (US1 → US4) plus the accessibility spot-check section plus the regression checks. Record results in the PR description. Implementation pass cannot run a live backend; type-check + 15-test component suite + 946-test full suite all pass.
- [X] T032 Run `pnpm lint` and `pnpm vitest run` from repo root. Both must pass cleanly. If new biome warnings appear in unrelated files, leave them alone — only fix issues introduced by this feature's files.
- [X] T033 Verify zero MUI imports in the new files: `rg "@mui|@emotion" src/crd/components/community/InviteMembersDialog.tsx src/crd/forms/ContributorSelector.tsx src/crd/forms/RoleMultiSelect.tsx` should return nothing. Same check on the connector should return nothing.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** — no dependencies; T001 and T002 must complete before Phase 2 because Phase 2's components call `useTranslation('crd-community')` and would crash on missing namespace.
- **Phase 2 (Foundational)** — depends on Phase 1; blocks all user stories. T003, T004, T005 build the components that the connector composes; T006–T010 add language files. T005 depends on T003 + T004 (the dialog imports them); T003 and T004 are independent (different files, no cross-dep).
- **Phase 3 (US1)** — depends on Phase 2 complete; this is where the dialog meets Apollo. Internal order: T011 → T012 → T013 → T014 → T015 → T016 (parallel with T017).
- **Phase 4 (US2)** — depends on Phase 3 (extends the same connector). T018, T019, T020, T021 are sequential within the connector file (same `handleSend` and same connector state).
- **Phase 5 (US3)** — depends on Phase 3 (touches same `handleSend`). Sequential T022 → T023 → T024.
- **Phase 6 (US4)** — depends on Phase 3 (touches same `handleSend`). T025 → T026 → T027 → T028.
- **Phase 7 (Polish)** — depends on Phases 3–6. T029 + T030 can run in parallel; T031, T032, T033 can run sequentially after.

### User Story Dependencies

- **US1 (P1)** — first; everything downstream extends US1's connector.
- **US2 (P1)** — extends US1's `handleSend` and chip handling. Independently testable: paste emails into the dialog, confirm chips render and submission includes them.
- **US3 (P2)** — extends US1's `handleSend` with role state. Independently testable: open role popover, toggle Lead, send, verify mutation payload includes `RoleName.Lead` (Apollo dev-tools or backend logs).
- **US4 (P2)** — extends US1's `handleSend` with result handling. Independently testable per quickstart § US4 (mixed batch).

### Within Each User Story

- The connector's React state, the connector's mutation call, and the dialog's prop wiring are all in one file — most US tasks are sequential edits to `InviteMembersDialogConnector.tsx`. The page-edit tasks (T016, T017) edit different files and CAN run in parallel with each other but only after T011–T015 are done.
- Translation tasks (T006–T010) are pure data files with no cross-dependencies — fully parallel.

### Parallel Opportunities

- **Setup**: T001 and T002 touch different files; can run in parallel.
- **Foundational**: T003, T004, T006, T007, T008, T009, T010 all parallelizable. T005 must wait for T003 + T004.
- **Phase 3**: T016 ∥ T017 once T015 is done.
- **Phase 7**: T029 ∥ T030.
- **Cross-story** (with multiple developers): US3 and US4 can be implemented in parallel after US1 is complete and before US2, OR in parallel with US2. The single-file connector means careful merge discipline — keep edits to non-overlapping handlers.

---

## Parallel Example: Phase 2 Foundational

```bash
# Terminal A
Task: "T003 Build src/crd/forms/RoleMultiSelect.tsx"

# Terminal B
Task: "T004 Build src/crd/forms/ContributorSelector.tsx"

# Terminal C — translation files (any subset, no dependencies)
Task: "T006 src/crd/i18n/community/community.nl.json"
Task: "T007 src/crd/i18n/community/community.es.json"
Task: "T008 src/crd/i18n/community/community.bg.json"
Task: "T009 src/crd/i18n/community/community.de.json"
Task: "T010 src/crd/i18n/community/community.fr.json"

# Then (after A + B complete)
Task: "T005 Build src/crd/components/community/InviteMembersDialog.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 — both P1)

1. Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2).
2. Stop and validate via quickstart § US1 + § US2 + the regression checks.
3. Deploy / demo. The dialog is now the CRD-default for invites; default-Member role + no per-invitee result rows are acceptable for an MVP because the underlying mutation already returns the same outcomes the legacy dialog showed (we just don't render them yet).

### Incremental Delivery

1. MVP (above) → Demo → Phase 5 (role grant) → Demo → Phase 6 (result list) → Demo → Phase 7 (polish + lint sweep + final QA).
2. Every phase ends in a working dialog — no half-broken intermediate states.

### Parallel Team Strategy

With two developers:

- Dev A: Phase 1 → Phase 2 (T003 + T005 + i18n files), then Phase 3 (US1 connector wiring).
- Dev B: Phase 2 (T004 ContributorSelector), then Phase 4 (US2 email-paste extension) + Phase 5 (US3 role grant) on top of Dev A's connector.
- Reconverge for Phase 6 (US4 result view) and Phase 7 (polish).

---

## Notes

- All paths in this file are absolute. The `[P]` marker is conservative — when in doubt, mark sequential. The connector edits in Phases 3–6 are intentionally NOT marked `[P]` even when they touch different parts of the same file, because git merge conflicts inside a single 150-line file are not worth saving 5 minutes of clock time.
- No backend / GraphQL changes. No `pnpm codegen` needed.
- Legacy MUI `InviteContributorsDialog` (`src/domain/community/inviteContributors/InviteContributorsDialog.tsx`) and the VC sub-flow stay untouched; non-CRD callsites continue to work.
- Six language files MUST be in the same PR per `src/crd/CLAUDE.md` § i18n. Don't merge with English-only.
- Verify after each story completes: run quickstart's matching section before moving to the next story. The dialog should be usable end-to-end at every checkpoint.
