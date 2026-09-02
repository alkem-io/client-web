---
description: "Task list for 085-authz-admin-guard"
---

# Tasks: Permission-Aware Authorization Admin UI

**Input**: Design documents from `/specs/085-authz-admin-guard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md

**Tests**: INCLUDED. The spec requires them — SC-001, SC-006 and SC-007 each state "Verified by automated test", and `quickstart.md` enumerates the expected coverage.

**Organization**: Grouped by user story so each is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: US1 / US2, mapping to the user stories in spec.md

## Path Conventions

Single-project frontend SPA. All paths are relative to the repository root and use the `src/` tree described in plan.md.

---

## Phase 1: Setup (Shared Prerequisites)

**Purpose**: Close the one open unknown before any gating code is written.

- [ ] T001 Resolve Open Risk R1 — determine, for each of surfaces 1–3, the `AuthorizationPrivilege` token the backend resolver actually enforces for role assign/remove, following the procedure in `specs/085-authz-admin-guard/quickstart.md` step 1 (read the resolver policy, or capture the `FORBIDDEN` payload in DevTools). Record one token (or token set) per surface in a new "Resolved privilege tokens" section of `specs/085-authz-admin-guard/research.md`, replacing Open Risk R1.
- [ ] T002 Reproduce the defect on surface 1 per `specs/085-authz-admin-guard/quickstart.md` step 0 and note the observed behavior in the PR description, satisfying constitution Engineering Workflow #5 (root cause before fix).

**Checkpoint**: The required privilege per surface is known and the bug is confirmed reproducible.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared copy both user stories consume.

**⚠️ CRITICAL**: US1 needs the error string and US2 needs the three tooltip strings. Neither story can complete until this phase is done.

- [ ] T003 Add four keys to `src/crd/i18n/common/common.en.json` under a `permissions` group: `permissions.denied` (plain-language "you don't have permission to change members of this role"), `permissions.checking` (neutral "checking permissions"), `permissions.unverifiable` ("permissions could not be verified"), and `permissions.errorDenied` (the toast copy for a rejected mutation). Copy MUST contain no privilege token and no escalation target, per spec FR-003 and the i18n contract in `specs/085-authz-admin-guard/contracts/ui-contract.md`.
- [ ] T004 [P] Add the same four keys with translated values to `src/crd/i18n/common/common.nl.json`.
- [ ] T005 [P] Add the same four keys with translated values to `src/crd/i18n/common/common.es.json`.
- [ ] T006 [P] Add the same four keys with translated values to `src/crd/i18n/common/common.bg.json`.
- [ ] T007 [P] Add the same four keys with translated values to `src/crd/i18n/common/common.de.json`.
- [ ] T008 [P] Add the same four keys with translated values to `src/crd/i18n/common/common.fr.json`.
- [ ] T009 Run `pnpm vitest run src/crd/i18n/common/common.parity.test.ts --reporter=basic` and confirm key parity holds across all six locales.

**Checkpoint**: Shared copy exists in all six languages. Both user stories can now proceed in parallel.

---

## Phase 3: User Story 1 - Prevent silent failures with visible error feedback (Priority: P1) 🎯 MVP

**Goal**: Every rejected role-assignment mutation produces a visible error notification instead of a silent no-op — across all eight assign/remove mutations and therefore every consuming surface at once.

**Independent Test**: As a user lacking the required privilege on a role set, trigger an add or remove and confirm exactly one error notification appears, clearly worded as a permission problem, with the roster unchanged. Verify a network failure still produces exactly one notification (from the global handler) and none from the call site.

### Implementation

- [ ] T010 [US1] Add an error-classification helper to `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.ts` that inspects an Apollo rejection and reports whether any GraphQL error carries `AlkemioGraphqlErrorCode.FORBIDDEN` or `FORBIDDEN_POLICY` (imported from `src/main/constants/errors.ts`).
- [ ] T011 [US1] In `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.ts`, wire `useNotification()` (from `src/core/ui/notifications/useNotification.ts`) and `useTranslation('crd-common')` into the hook, and apply shared error handling to all eight mutations: `assignRoleToUser`, `removeRoleFromUser`, `assignPlatformRoleToUser`, `removePlatformRoleFromUser`, `assignRoleToOrganization`, `removeRoleFromOrganization`, `assignRoleToVirtualContributor`, `removeRoleFromVirtualContributor`.
- [ ] T012 [US1] Constrain that handler to fire **only** for authorization codes, per `specs/085-authz-admin-guard/contracts/ui-contract.md` — all other failure classes are already toasted by `useErrorHandlerLink` and a second call would double-notify. Re-throw the rejection rather than swallowing it, and add no refetch or cache eviction (spec FR-016).

### Tests

- [ ] T013 [P] [US1] Add a test to `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.test.ts` asserting a `FORBIDDEN` rejection produces exactly one `useNotification` call with severity `error` (spec SC-001).
- [ ] T014 [P] [US1] Add a test to the same file asserting a `FORBIDDEN_POLICY` rejection behaves identically, and that a network/validation rejection produces **zero** call-site notifications, so the global handler is not doubled.
- [ ] T015 [P] [US1] Add a test to the same file asserting a rejected mutation triggers no refetch and no cache eviction (spec FR-016), and that the rejection still propagates to the caller.

**Checkpoint**: No role-assignment failure is silent anywhere in the app. US1 is independently shippable.

---

## Phase 4: User Story 2 - Disable role-assignment actions when the user lacks privilege (Priority: P1)

**Goal**: Every add and remove control on the four inventoried surfaces renders non-interactive with an explanatory tooltip when the user lacks the required privilege, preventing the attempt rather than reporting it after the fact.

**Independent Test**: As a user lacking the required privilege, load each covered surface and confirm the add control and every per-member remove control are gated, keyboard-focusable, show the tooltip on hover and on focus, and dispatch no mutation when activated. As a privileged user, confirm all controls behave exactly as before.

### Shared building blocks

- [ ] T016 [P] [US2] Create `src/domain/access/permissions/useActionPermission.ts` implementing the hook contract in `specs/085-authz-admin-guard/data-model.md`: `(myPrivileges, required, loading) => { allowed, reason }` with `reason` in `'allowed' | 'checking' | 'denied' | 'unverifiable'`. Every non-affirmative input state must fail closed, an empty `required` array must yield `denied`, and all listed privileges must be present for `allowed`.
- [ ] T017 [P] [US2] Create `src/crd/components/common/GatedAction.tsx` implementing the component contract in `specs/085-authz-admin-guard/data-model.md`: an optional `disabledReason` string and a single child. When set, apply `aria-disabled="true"`, keep the child in the tab order, suppress activation, and wrap it with `Tooltip`/`TooltipTrigger`/`TooltipContent` from `src/crd/primitives/tooltip.tsx`. Never apply the native `disabled` attribute (research Decision 3). No imports from `@/domain`, `@/core/apollo`, `@apollo/client`, `react-router-dom`, or `formik`.
- [ ] T018 [P] [US2] Add `src/domain/access/permissions/useActionPermission.test.ts` covering every row of the derivation table in `data-model.md`, including the multi-privilege case and the empty-`required` case.
- [ ] T019 [P] [US2] Add `src/crd/components/common/__tests__/GatedAction.test.tsx` covering: ungated pass-through with no added ARIA; gated rendering with `aria-disabled`; the child remaining focusable; tooltip shown on hover **and** on keyboard focus; activation suppressed (spec SC-007); and the native `disabled` attribute never being applied.

### Surface 1 — Platform Admin global roles

- [ ] T020 [US2] Add `addDisabledReason?: string` and `removeDisabledReason?: string` props to `src/crd/components/admin/roles/RoleMembersEditor.tsx` and apply them by wrapping the add button and each per-member remove button in `GatedAction`.
- [ ] T021 [US2] In `src/main/crdPages/topLevelPages/admin/authorization/CrdAdminGlobalRolesPage.tsx`, derive the decision with `useActionPermission` from `useRoleSetManager().myPrivileges` and its `loading` flag, using the token resolved in T001, and map `reason` to the matching `crd-common` string before passing it into `RoleMembersEditor`.
- [ ] T022 [P] [US2] Extend `src/main/crdPages/topLevelPages/admin/authorization/__tests__/CrdAdminGlobalRolesPage.test.tsx` to assert the controls are gated without the privilege, enabled with it, and never enabled while privileges are loading (spec SC-006).

### Surfaces 2 & 3 — Organization settings

- [ ] T023 [US2] Add the same two props to `src/crd/components/contributor/settings/RoleAssignmentView.tsx` and apply them via `GatedAction`; this shared view backs both `OrgAuthorizationTabView` and `OrgCommunityTabView`, covering surfaces 2 and 3 in one edit.
- [ ] T024 [P] [US2] In `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/useOrgRoleAssignment.ts`, derive the decision from `useRoleSetManager().myPrivileges` using the T001 token and expose the two reason strings to the tab.
- [ ] T025 [P] [US2] In `src/main/crdPages/topLevelPages/organizationPages/settings/community/useOrgAssociates.ts`, do the same for the associates role.
- [ ] T026 [P] [US2] Extend `src/main/crdPages/topLevelPages/organizationPages/settings/authorization/__tests__/useOrgRoleAssignment.test.ts` with gated/ungated assertions.
- [ ] T027 [P] [US2] Extend `src/main/crdPages/topLevelPages/organizationPages/settings/community/__tests__/useOrgAssociates.test.ts` with gated/ungated assertions.

### Surface 4 — Space settings community

- [ ] T028 [US2] Fix Open Risk R2: forward `canAddUsers` from `useCommunityAdmin` through the `permissions` object returned by `src/main/crdPages/topLevelPages/spaceSettings/community/useCommunityTabData.ts`, which currently drops it, leaving the add-member path entirely ungated.
- [ ] T029 [US2] Add a `disabledReason?: string` prop to `src/crd/components/space/settings/AddCommunityMemberDialog.tsx` and apply it via `GatedAction` on the add control, keeping the existing `disabled={isAdding}` in-flight behavior distinct from permission gating.
- [ ] T030 [US2] Add the equivalent prop to `src/crd/components/space/settings/MemberSettingsDialog.tsx` and apply it to the member remove and role-toggle controls, using the organization token pair (`ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` + `GRANT`) for organization rows per `useCommunityAdmin.ts`.
- [ ] T031 [US2] In `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`, map the forwarded permissions to reason strings and pass them into both dialogs.
- [ ] T032 [P] [US2] Add tests for surface 4 asserting the add-member control is gated without `ROLESET_ENTRY_ROLE_ASSIGN` — a regression test for the previously ungated path.

**Checkpoint**: All four surfaces gate their controls. Combined with US1, the feature is complete.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T033 Walk `specs/085-authz-admin-guard/quickstart.md` steps 2–7 against a running backend, including the double-toast check in step 4.5 and the offline check in step 5.
- [ ] T034 [P] Verify WCAG 2.1 AA on one gated control with VoiceOver or NVDA — focus reachability and announcement of the reason — and attach the evidence to the PR (spec SC-005, constitution Workflow #4).
- [ ] T035 [P] Confirm SC-004 by asserting the network request count on a covered surface is unchanged from before the feature.
- [ ] T036 Run `pnpm lint` and `pnpm vitest run` and confirm both pass.
- [ ] T037 Update `specs/085-authz-admin-guard/research.md` to close Open Risks R1 and R2 with what was actually implemented, and link issue #10258 in the PR description.

---

## Dependencies

```text
Phase 1 (T001-T002)  ──►  Phase 2 (T003-T009)  ──┬──►  Phase 3: US1 (T010-T015)  ──┐
                                                  │                                 ├──►  Phase 5 (T033-T037)
                                                  └──►  Phase 4: US2 (T016-T032)  ──┘
```

- **T001 blocks US2 only** — US1 needs no privilege token and can start as soon as Phase 2 is done.
- **Phase 2 blocks both stories** — US1 needs `permissions.errorDenied`, US2 needs the three tooltip strings.
- **US1 and US2 are independent of each other** and can be built in parallel by different people.
- Within US2: T016 and T017 block every surface task. T020 blocks T021; T023 blocks T024 and T025; T028 blocks T031.

## Parallel Execution Examples

**Phase 2** — T004 through T008 are five separate locale files, all parallel after T003 establishes the key shape.

**US1** — T013, T014 and T015 are parallel once T010–T012 land.

**US2 building blocks** — T016, T017, T018 and T019 are four separate files, all parallel.

**US2 surfaces** — once T016/T017 exist, the three surface groups are independent: {T020, T021, T022}, {T023, T024, T025, T026, T027}, {T028, T029, T030, T031, T032}. T024/T025 are parallel with each other, as are T026/T027.

## Implementation Strategy

**MVP = User Story 1.** It is the smaller change — one hook, no UI work — and on its own it eliminates silent failure across every role-assignment surface in the app, including ones outside this feature's inventory. It is independently shippable and directly closes issue #10258's reported symptom.

**Increment 2 = User Story 2**, which prevents the attempt rather than reporting it, and is where the four-surface inventory work lives. US1 remains the safety net for any case where the UI privilege check and backend decision disagree.

Ship US1 first if the work is split across releases.
