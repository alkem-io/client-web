# Tasks: Actor Architecture Migration

**Input**: Design documents from `/specs/014-actor-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/graphql-changes.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Since this is a schema migration, user stories share a common foundational layer (GraphQL documents + codegen) that must complete first.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Prepare the branch and verify prerequisites

- [ ] T001 Ensure server is running on actor-migration branch at localhost:4000/graphql for codegen

---

## Phase 2: Foundational — GraphQL Documents & Codegen

**Purpose**: Update ALL GraphQL documents first, then run codegen ONCE to regenerate types. This MUST complete before any TypeScript work begins.

### Fragment Retargeting (Contributor → ActorFull)

- [ ] T002 [P] Retarget fragment `ContributorDetails on Contributor` → `on ActorFull` in `src/community/contributor/graphql/contributorDetails.graphql`
- [ ] T003 [P] Retarget fragment `AdminCommunityCandidateMember on Contributor` → `on ActorFull` in `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`
- [ ] T004 [P] Retarget fragment `InnovationPackProviderProfileWithAvatar on Contributor` → `on ActorFull` in `src/domain/InnovationPack/admin/InnovationPacksMutations.graphql`

### Agent Field Removal

- [ ] T005 Replace `agent { id credentials { id type } }` with direct `credentials { id type }` on User in `src/domain/community/user/graphql/queries/UserAccount.graphql`

### Role Mutation Unification (6 → 2)

- [ ] T006 [P] Replace 3 assign mutations with single `AssignRole` mutation using `actorId` in `src/domain/access/RoleSetManager/RolesAssignment/AssignRole.graphql`
- [ ] T007 [P] Replace 3 remove mutations with single `RemoveRole` mutation using `actorId` in `src/domain/access/RoleSetManager/RolesAssignment/RemoveRole.graphql`
- [ ] T008 [P] Update `contributorID` → `actorId` in variable and input in `src/domain/access/RoleSetManager/RolesAssignment/AssignPlatformRole.graphql`
- [ ] T009 [P] Update `contributorID` → `actorId` in variable and input in `src/domain/access/RoleSetManager/RolesAssignment/RemovePlatformRole.graphql`

### Roles Query Unification (3 → 1)

- [ ] T010 [P] Replace `rolesUser` with `rolesActor(rolesData: { actorId: $userId })` in `src/domain/community/user/userContributions/UserContributions.graphql`
- [ ] T011 [P] Replace `rolesOrganization` with `rolesActor(rolesData: { actorId: $organizationId })` in `src/domain/community/organization/useOrganization/useOrganizationQueries.graphql`
- [ ] T012 [P] Replace `rolesVirtualContributor` with `rolesActor(rolesData: { actorId: $virtualContributorId })` in `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.graphql`

### Invitation GraphQL Changes

- [ ] T013 Rename `invitedContributorIds`/`invitedContributorIDs` → `invitedActorIds` in variable and input in `src/domain/access/ApplicationsAndInvitations/InvitationsMutations.graphql`
- [ ] T014 [P] Remove `contributorType` field from `AdminCommunityInvitation` fragment in `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`
- [ ] T015 [P] Remove `contributorType` field from `InvitationData` fragment in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserFull.graphql`
- [ ] T016 [P] Remove `contributorType` field from invitation query in `src/main/topLevelPages/myDashboard/InvitationsBlock/PendingInvitations.graphql`
- [ ] T017 [P] Remove `contributorType` field from invitation lookup in `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityInvitationDialog/CommunityInvitation.graphql`

### Sender/Reaction Fix

- [ ] T018 Wrap `firstName`/`lastName` in `... on User { }` inline fragment on sender in `src/domain/communication/room/Comments/AddReactionMutation.graphql`

### Run Codegen

- [ ] T019 Run `pnpm codegen` to regenerate `src/core/apollo/generated/graphql-schema.ts` and `src/core/apollo/generated/apollo-hooks.ts`

**Checkpoint**: All GraphQL documents updated, codegen complete. TypeScript will have compile errors — that's expected. All user story work can now begin.

---

## Phase 3: User Story 1 — Profiles and Credentials Display Correctly (Priority: P1)

**Goal**: Credentials fetched directly from entities, all profile/provider/host/sender displays work with Actor types.

**Independent Test**: Navigate to user profile, organization page, VC page, space page (provider), account page (host), and message thread. Verify display name, avatar, credentials, and sender info all render correctly.

### Implementation for User Story 1

- [ ] T020 [US1] Remove `agent?: {}` property from `UserModel` interface and `defaultUser` in `src/domain/community/user/models/UserModel.ts`
- [ ] T021 [US1] Update data access from `user.agent.credentials` to `user.credentials` in consumers of `useUserAccountQuery` — check `src/domain/community/userAdmin/tabs/UserAdminAccountPage.tsx` and `src/domain/community/user/userProfilePage/UserProfilePage.tsx`

**Checkpoint**: User Story 1 complete — profile and credential pages display correctly.

---

## Phase 4: User Story 2 — Role Assignment and Removal Works (Priority: P1)

**Goal**: Unified role mutations work for all actor types. The hook's public API preserves backward compatibility.

**Independent Test**: As a space admin, assign a user/org/VC to a role and remove them. As a platform admin, assign and remove a platform role.

### Implementation for User Story 2

- [ ] T022 [US2] Rewrite `useRoleSetManagerRolesAssignment.ts` to use unified `useAssignRoleMutation` and `useRemoveRoleMutation` hooks (replacing 6 per-type mutation calls with 2 unified ones) and update `useAssignPlatformRoleToUserMutation`/`useRemovePlatformRoleFromUserMutation` to pass `actorId` instead of `contributorId`. Preserve backward-compatible public function names (`assignRoleToUser`, `removeRoleFromUser`, etc.) in `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.ts`
- [ ] T023 [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/access/RoleSetManager/useRoleSetManager.ts` — update imports, `contributorTypes` parameter type, and all `RoleSetContributorType.User`/`.Organization`/`.Virtual` comparisons to `ActorType.User`/`.Organization`/`.VirtualContributor`
- [ ] T024 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/platformAdmin/authorization/AdminAuthorizationPage.tsx`
- [ ] T025 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/organizationAdmin/views/OrganizationAssociatesView.tsx`
- [ ] T026 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/organizationAdmin/views/OrganizationAuthorizationRoleAssignementView.tsx`
- [ ] T027 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/spaceAdmin/SpaceAdminCommunity/SpaceAdminCommunityPage.tsx`
- [ ] T028 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin.ts`
- [ ] T029 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityMemberships.tsx`

**Checkpoint**: User Story 2 complete — role assignment/removal works for all actor types through the unified mutations.

---

## Phase 5: User Story 3 — Invitations Work (Priority: P1)

**Goal**: Invitation mutation uses `invitedActorIds`, invitation display no longer relies on `contributorType` field, models updated.

**Independent Test**: Invite a user and a VC to a space. Verify invitations appear in pending lists on the dashboard, community admin page, and VC membership page.

### Implementation for User Story 3

- [ ] T030 [US3] Update `addContributorType()` helper → rename to `getActorType()`, change return type from `RoleSetContributorType` to `ActorType`, update `Virtual` → `VirtualContributor` in `src/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts`
- [ ] T031 [US3] Update `invitedContributorIds` → `invitedActorIds` in the `handleInviteContributorsOnRoleSet` function parameter and mutation variables in `src/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts`
- [ ] T032 [US3] Update `invitedContributorIds` → `invitedActorIds` in `InviteContributorsData` interface in `src/domain/access/model/InvitationDataModel.ts`
- [ ] T033 [P] [US3] Remove `contributorType` field and update enum import from `RoleSetContributorType` to `ActorType` in `src/domain/access/model/InvitationModel.ts`
- [ ] T034 [P] [US3] Remove `contributorType` field and update enum import from `RoleSetContributorType` to `ActorType` in `src/domain/access/model/ApplicationModel.ts`
- [ ] T035 [P] [US3] Update `RoleSetContributorType` → `ActorType` and `contributorType` references in `src/domain/access/model/MembershipTableItem.ts`
- [ ] T036 [P] [US3] Update `contributorType` references from `RoleSetContributorType` to `ActorType` (using `__typename` derivation) in `src/domain/community/user/models/PendingInvitationItem.ts`
- [ ] T037 [P] [US3] Update `invitedContributorIds` → `invitedActorIds` in `src/domain/community/inviteContributors/users/InviteUsersDialog.tsx`
- [ ] T038 [P] [US3] Update `invitedContributorIds` → `invitedActorIds` in `src/domain/community/inviteContributors/virtualContributors/InviteVirtualContributorDialog.tsx`
- [ ] T039 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/invitations/InvitationDialog.tsx` — update `.Virtual` comparisons to `.VirtualContributor`, replace `invitation.contributorType` with type derived from `contributor.__typename` or `contributor.type`
- [ ] T040 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/invitations/SingleInvitationFull.tsx` — update `.Virtual` comparisons to `.VirtualContributor`, replace `invitation.contributorType` with type derived from `contributor.__typename` or `contributor.type`
- [ ] T040a [P] [US3] Update `src/domain/community/invitations/InvitationCardHorizontal/InvitationCardHorizontal.tsx` — replace `invitation.invitation.contributorType` (line 51, passed as `type` prop to `DetailedActivityDescription`) with type derived from `contributor.__typename` or `contributor.type`
- [ ] T041 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/pendingMembership/PendingMembershipsDialog.tsx` — update `.Virtual` comparisons to `.VirtualContributor`
- [ ] T042 [P] [US3/US4] Update `RoleSetContributorType` → `ActorType` and update `rolesVirtualContributor` → `rolesActor` field access in `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.tsx` — update `.Virtual` comparisons to `.VirtualContributor` and `data.rolesVirtualContributor` to `data.rolesActor`
- [ ] T043 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/InviteContributorsDialog.tsx`
- [ ] T044 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/InviteContributorsProps.tsx`
- [ ] T045 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/InviteContributorsWizard.tsx`
- [ ] T046 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors.ts`
- [ ] T047 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/components/ContributorChip/ContributorChip.tsx`

**Checkpoint**: User Story 3 complete — invitations work for all actor types.

---

## Phase 6: User Story 4 — Membership and Contributions Views (Priority: P2)

**Goal**: Membership views use the unified `rolesActor` query and display correctly for all actor types.

**Independent Test**: Navigate to user contributions page, organization memberships section, and VC membership page. Verify space memberships, roles, and subspace data display correctly.

### Implementation for User Story 4

- [ ] T048 [US4] Update `useUserContributions.ts` to handle `rolesActor` response type (was `rolesUser`) — update field access from `data.rolesUser` to `data.rolesActor` and update `RoleSetContributorType` → `ActorType` in `src/domain/community/user/userContributions/useUserContributions.ts`
- [ ] T049 [US4] Update `useOrganization.ts` to handle `rolesActor` response type (was `rolesOrganization`) — update field access and update `RoleSetContributorType` → `ActorType` in `src/domain/community/organization/useOrganization/useOrganization.ts`
- [ ] T052 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/userAdmin/tabs/UserAdminMembershipPage.tsx`
- [ ] T053 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/user/ContributorsView.tsx`
- [ ] T054 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/profile/useContributionProvider/useContributionProvider.ts`
- [ ] T055 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/models/SpaceHostedItem.model.ts`
- [ ] T056 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/ContributorTooltip/ContributorTooltip.tsx`
- [ ] T057 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/ContributorCardSquare/ContributorCardSquare.tsx`
- [ ] T058 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWide.tsx`
- [ ] T059 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWideContent.tsx`
- [ ] T060 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetVirtualContributorsBlockWide.tsx`
- [ ] T061 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock.tsx`
- [ ] T062 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/community/utils/useCommunityMembersAsCardProps.ts`
- [ ] T063 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/components/SpaceWelcomeBlock.tsx`
- [ ] T064 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/components/ContributorsToggleDialog.tsx`
- [ ] T065 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/components/cards/components/SpaceLeads.tsx`
- [ ] T066 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage.tsx`
- [ ] T067 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/core/ui/authorship/Authorship.tsx`
- [ ] T068 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/core/ui/card/CardHeader.tsx`

**Checkpoint**: User Story 4 complete — all membership and contributions views display correctly.

---

## Phase 7: User Story 5 — Conversations and Messaging (Priority: P2)

**Goal**: Create conversation uses `receiverActorId`, sender displays work with Actor type.

**Independent Test**: Create a new conversation with a user. Send a message and verify sender info displays. Add a reaction and verify reactor identity.

### Implementation for User Story 5

- [ ] T069 [US5] Update `userID` → `receiverActorId` in `conversationData` object in `src/main/userMessaging/NewMessageDialog.tsx` (line ~94)

**Checkpoint**: User Story 5 complete — messaging and conversations work correctly.

---

## Phase 8: User Story 6 — Notifications and Activity Logs (Priority: P3)

**Goal**: Notification and activity log displays work with Actor types for triggeredBy/contributor fields.

**Independent Test**: Trigger a notification, verify it displays correctly. View an activity log with member-joined entries.

### Implementation for User Story 6

- [ ] T070 [P] [US6] Update `RoleSetContributorType` → `ActorType` in `src/main/inAppNotifications/model/InAppNotificationPayloadModel.tsx`
- [ ] T071 [P] [US6] Update `RoleSetContributorType` → `ActorType` in `src/domain/shared/components/ActivityDescription/DetailedActivityDescription.tsx` — update `.Virtual` comparison to `.VirtualContributor`

**Checkpoint**: User Story 6 complete — notifications and activity logs display correctly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete migration, ensure no stale references remain

- [ ] T072 Run `pnpm lint` to verify zero type errors and zero lint errors across the entire codebase
- [ ] T073 Run `pnpm vitest run` to verify all 247 tests pass. Before running, grep test files (`src/**/*.test.*`) for `Agent`, `Contributor`, `RoleSetContributorType`, `contributorID`, `contributorType`, and `invitedContributorIds` — update any matching mocks/fixtures to use the new types. (Current baseline: zero test files reference these terms.)
- [ ] T074 Run `pnpm build` to verify production build succeeds without errors
- [ ] T075 Search for any remaining references to removed types: grep for `RoleSetContributorType`, `AgentType`, `ContributorRoles`, `on Contributor`, `contributorID`, `contributorType`, `invitedContributorIDs`, `rolesUser`, `rolesOrganization`, `rolesVirtualContributor`, `assignRoleToUser`, `removeRoleFromUser` in non-generated `src/` files and fix any stragglers
- [ ] T076 Commit all generated files from codegen (`src/core/apollo/generated/`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify server branch
- **Foundational (Phase 2)**: Depends on Phase 1 — updates all GraphQL documents then runs codegen. BLOCKS all user stories.
- **User Stories (Phases 3–8)**: All depend on Phase 2 (codegen) completion
  - US1 (Phase 3): No dependencies on other stories
  - US2 (Phase 4): No dependencies on other stories
  - US3 (Phase 5): No dependencies on other stories
  - US4 (Phase 6): No dependencies on other stories
  - US5 (Phase 7): No dependencies on other stories
  - US6 (Phase 8): No dependencies on other stories
- **Polish (Phase 9)**: Depends on ALL user stories being complete

### Within Each User Story

- Models/interfaces before hooks that consume them
- Hooks before components that use them
- All `[P]` tasks within a phase can run in parallel

### Parallel Opportunities

- T002–T004 (fragment retargeting): all parallel
- T006–T009 (role mutations): all parallel
- T010–T012 (roles queries): all parallel
- T014–T017 (invitation contributorType removal): all parallel
- After codegen (T019), all 6 user stories can start in parallel
- Within US3: T033–T047 are all parallel (different files)
- Within US4: T052–T068 are all parallel (different files, all enum replacements); T042 (US3) already covers VCMembershipPage.tsx
- Within US6: T070–T071 are parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all fragment retargets together:
Task: T002 "Retarget ContributorDetails on Contributor → ActorFull"
Task: T003 "Retarget AdminCommunityCandidateMember on Contributor → ActorFull"
Task: T004 "Retarget InnovationPackProviderProfileWithAvatar on Contributor → ActorFull"

# Launch all role mutation changes together:
Task: T006 "Replace 3 assign mutations with AssignRole"
Task: T007 "Replace 3 remove mutations with RemoveRole"
Task: T008 "Update AssignPlatformRole contributorID → actorId"
Task: T009 "Update RemovePlatformRole contributorID → actorId"

# Launch all roles query changes together:
Task: T010 "Replace rolesUser with rolesActor"
Task: T011 "Replace rolesOrganization with rolesActor"
Task: T012 "Replace rolesVirtualContributor with rolesActor"
```

## Parallel Example: User Story 4 (Enum Replacement)

```bash
# After T048-T049 complete, launch all enum replacements together:
Task: T052 "Update ActorType in UserAdminMembershipPage.tsx"
Task: T053 "Update ActorType in ContributorsView.tsx"
Task: T054 "Update ActorType in useContributionProvider.ts"
... (all T055–T068 in parallel)
```

---

## Implementation Strategy

### First Checkpoint (User Story 1 Only)

1. Complete Phase 1: Setup (verify server)
2. Complete Phase 2: All GraphQL changes + codegen
3. Complete Phase 3: US1 (profiles/credentials)
4. **STOP and VALIDATE**: Run `pnpm lint` to check remaining errors are only in US2–US6 scope
5. This confirms profile/credential data access works; codebase is not deployable until all phases complete

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready (codegen done)
2. Phase 3 (US1) → Profiles/credentials work
3. Phase 4 (US2) → Role management works
4. Phase 5 (US3) → Invitations work
5. Phase 6 (US4) → Membership views work
6. Phase 7 (US5) → Messaging works
7. Phase 8 (US6) → Notifications/activity logs work
8. Phase 9 → Polish, full validation, commit

### Recommended Single-Developer Flow

Since this is a migration (not new features), the most efficient approach is:

1. Do ALL GraphQL changes in one pass (Phase 2)
2. Run codegen once
3. Work through TypeScript fixes by story priority (Phase 3 → 4 → 5 → 6 → 7 → 8)
4. Run lint/test/build at the end (Phase 9)

---

## Notes

- The `RoleSetContributorType.Virtual` → `ActorType.VirtualContributor` value change is the most error-prone part — every switch statement and comparison must be updated
- The `useRoleSetManagerRolesAssignment.ts` rewrite (T022) is the most complex single task — it replaces 6 per-type mutation calls with 2 unified ones and updates 2 platform role mutations to use `actorId`, while preserving the public API
- Many enum replacement tasks (T024–T029, T039–T047, T052–T068, T070–T071) are mechanical find-and-replace within individual files
- After codegen, the TypeScript compiler will flag every breakage point — use `pnpm lint` output as a checklist
- **Provider-field consumers need no changes**: `useInnovationPackCardProps.ts`, `PreviewTemplateDialog.tsx`, and `SpaceAdminAccountPage.tsx` only access `.profile` sub-fields (displayName, avatar, url, location) or `.__typename`, all of which remain identical on Actor. Verified during analysis — no tasks needed.
