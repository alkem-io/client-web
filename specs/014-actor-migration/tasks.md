# Tasks: Actor Architecture Migration

**Input**: Design documents from `/specs/014-actor-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/graphql-changes.md, quickstart.md
**Updated**: 2026-02-20 (aligned with final server schema on branch `026-actor-transformation-v2`)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Since this is a schema migration, user stories share a common foundational layer (GraphQL documents + codegen) that must complete first.

> **Scope update (2026-02-20)**: Adopting unified role mutations/queries (6→2 mutations, 3→1 query) is **not** in scope — per-type operations remain. However, all per-type role mutation inputs are now unified (`AssignRoleOnRoleSetInput`/`RemoveRoleOnRoleSetInput` with `actorID`), all role query inputs are unified (`RolesActorInput` with `actorID`), platform role inputs rename `contributorID` → `actorID` (BREAKING), `CommunityInvitationForRoleResult` renames `contributorID` → `actorID` (BREAKING), `Reaction.sender` remains `User` (no change needed), `ActivityLogEntryMemberJoined.contributorType` is renamed to `actorType`, and the `ActorType` enum value for virtual contributors is `VIRTUAL_CONTRIBUTOR` (not `VIRTUAL`) — so `.Virtual` comparisons MUST change to `.VirtualContributor`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Prepare the branch and verify prerequisites

- [x] T001 ~~Ensure server is running~~ — SKIPPED (server not available; schema provided manually)

---

## Phase 2: Foundational — GraphQL Documents & Codegen

**Purpose**: Update ALL GraphQL documents first, then run codegen ONCE to regenerate types. This MUST complete before any TypeScript work begins.

### Fragment Retargeting (Contributor → Actor)

> **Implementation note (2026-02-24)**: Fragments were retargeted to `on Actor` (not `on ActorFull` as originally planned). The server uses `Actor` as the return type for contributor/provider/sender fields.

- [x] T002 [P] Retarget fragment `ContributorDetails on Contributor` → `on Actor` in `src/domain/community/contributor/graphql/contributorDetails.graphql`
- [x] T003 [P] Retarget fragment `AdminCommunityCandidateMember on Contributor` → `on Actor` in `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`
- [x] T004 [P] Retarget fragment `InnovationPackProviderProfileWithAvatar on Contributor` → `on Actor` in `src/domain/InnovationPack/admin/InnovationPacksMutations.graphql`

### Agent Field Removal

- [x] T005 Replace `agent { id credentials { id type } }` with direct `credentials { id type }` on User in `src/domain/community/user/graphql/queries/UserAccount.graphql`

### Invitation `contributorType` Removal

- [x] T006 [P] Remove `contributorType` field from `AdminCommunityInvitation` fragment in `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`
- [x] T007 [P] Remove `contributorType` field from `InvitationData` fragment in `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserFull.graphql`
- [x] T008 [P] Remove `contributorType` field from invitation query in `src/main/topLevelPages/myDashboard/InvitationsBlock/PendingInvitations.graphql`
- [x] T009 [P] Remove `contributorType` field from invitation lookup in `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityInvitationDialog/CommunityInvitation.graphql`

### ~~Sender/Reaction Fix~~ — NOT NEEDED

- ~~T010 Wrap `firstName`/`lastName` in `... on User { }` inline fragment on sender in `src/domain/communication/room/Comments/AddReactionMutation.graphql`~~ — **REMOVED**: `Reaction.sender` remains `User` in the actual schema. No inline fragment needed.

### Per-Type Role Mutation Input Renames (contributorID → actorID)

- [x] T010c [P] Rename `$contributorId` → `$actorId` and `contributorID` → `actorID` in all 3 mutations in `src/domain/access/RoleSetManager/RolesAssignment/AssignRole.graphql`
- [x] T010d [P] Rename `$contributorId` → `$actorId` and `contributorID` → `actorID` in all 3 mutations in `src/domain/access/RoleSetManager/RolesAssignment/RemoveRole.graphql`

### Per-Type Role Query Input Renames (userID/organizationID/virtualContributorID → actorID)

- [x] T010e [P] Rename `$userId` → `$actorId` and `userID` → `actorID` in `src/main/search/SearchQueries.graphql`
- [x] T010f [P] Rename `$userId` → `$actorId` and `userID` → `actorID` in `src/domain/community/user/userContributions/UserContributions.graphql`
- [x] T010g [P] Rename `$userId` → `$actorId` and `userID` → `actorID` in `src/domain/community/user/userContributions/UserOrganizationIds.graphql`
- [x] T010h [P] Rename `$organizationId` → `$actorId` and `organizationID` → `actorID` in `src/domain/community/organization/useOrganization/useOrganizationQueries.graphql`
- [x] T010i [P] Rename `$virtualContributorId` → `$actorId`, `virtualContributorID` → `actorID` for `rolesVirtualContributor` input, and `$virtualContributorId` → `$actorId` for `lookup.virtualContributor(ID:)` in `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.graphql`

### Platform Role Input Renames (contributorID → actorID)

- [x] T010a [P] Rename `contributorID` → `actorID` in `src/domain/access/RoleSetManager/RolesAssignment/AssignPlatformRole.graphql` — update variable name `$contributorId` → `$actorId` and field `contributorID` → `actorID`
- [x] T010b [P] Rename `contributorID` → `actorID` in `src/domain/access/RoleSetManager/RolesAssignment/RemovePlatformRole.graphql` — update variable name `$contributorId` → `$actorId` and field `contributorID` → `actorID`

### Run Codegen

- [x] T011 ~~Run `pnpm codegen`~~ — SKIPPED (server not available; codegen must be run manually when server is up)

**Checkpoint**: All GraphQL documents updated, codegen complete. TypeScript will have compile errors — that's expected. All user story work can now begin.

---

## Phase 3: User Story 1 — Profiles and Credentials Display Correctly (Priority: P1)

**Goal**: Credentials fetched directly from entities, all profile/provider/host/sender displays work with Actor types.

**Independent Test**: Navigate to user profile, organization page, VC page, space page (provider), account page (host), and message thread. Verify display name, avatar, credentials, and sender info all render correctly.

### Implementation for User Story 1

- [x] T012 [US1] Remove `agent?: {}` property from `UserModel` interface and `defaultUser` in `src/domain/community/user/models/UserModel.ts`
- [x] T013 [US1] Update data access from `user.agent.credentials` to `user.credentials` in consumers of `useUserAccountQuery` — check `src/domain/community/userAdmin/tabs/UserAdminAccountPage.tsx` and `src/domain/community/user/userProfilePage/UserProfilePage.tsx`

**Checkpoint**: User Story 1 complete — profile and credential pages display correctly.

---

## Phase 4: User Story 2 — Role Assignment and Removal Works (Priority: P1)

**Goal**: Enum references updated from `RoleSetContributorType` to `ActorType`. Role mutations themselves are unchanged (still 6 per-type mutations).

**Independent Test**: As a space admin, assign a user/org/VC to a role and remove them. As a platform admin, assign and remove a platform role.

### Implementation for User Story 2

- [x] T014 [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/access/RoleSetManager/useRoleSetManager.ts` — update imports, `contributorTypes` parameter type, and all `RoleSetContributorType.User`/`.Organization`/`.Virtual` comparisons to `ActorType.User`/`.Organization`/`.VirtualContributor`
- [x] T015 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/platformAdmin/management/authorization/AdminAuthorizationPage.tsx`
- [x] T016 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/organizationAdmin/views/OrganizationAssociatesView.tsx`
- [x] T017 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/organizationAdmin/views/OrganizationAuthorizationRoleAssignementView.tsx`
- [x] T018 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/spaceAdmin/SpaceAdminCommunity/SpaceAdminCommunityPage.tsx`
- [x] T019 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin.ts`
- [x] T020 [P] [US2] Update `RoleSetContributorType` → `ActorType` in `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityMemberships.tsx`
- [x] T020a [US2] Update `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.ts` — rename `contributorId` variable to `actorId` in ALL role mutation calls: `assignRoleToUser`, `removeRoleFromUser`, `assignRoleToOrganization`, `removeRoleFromOrganization`, `assignRoleToVirtualContributor`, `removeRoleFromVirtualContributor`, `assignPlatformRoleToUser`, `removePlatformRoleFromUser` (aligns with GraphQL variable renames in T010a–T010d)
- [x] T020b [P] [US2] Update `src/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard.tsx` — rename `contributorId` variable to `actorId` in `assignRoleToVirtualContributor` call

**Checkpoint**: User Story 2 complete — role assignment/removal works for all actor types.

---

## Phase 5: User Story 3 — Invitations Work (Priority: P1)

**Goal**: Invitation display no longer relies on `contributorType` field. Enum references updated. Note: invitation mutation input field name (`invitedContributorIDs`) is unchanged.

**Independent Test**: Invite a user and a VC to a space. Verify invitations appear in pending lists on the dashboard, community admin page, and VC membership page.

### Implementation for User Story 3

- [x] T021 [US3] Update `addContributorType()` helper — change return type from `RoleSetContributorType` to `ActorType`, update enum values (`.Virtual` → `.VirtualContributor`) in `src/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts`
- [x] T022 [P] [US3] Remove `contributorType` field and update enum import from `RoleSetContributorType` to `ActorType` in `src/domain/access/model/InvitationModel.ts`
- [x] T023 [P] [US3] Remove `contributorType` field and update enum import from `RoleSetContributorType` to `ActorType` in `src/domain/access/model/ApplicationModel.ts`
- [x] T024 [P] [US3] Update `RoleSetContributorType` → `ActorType` and `contributorType` references in `src/domain/access/model/MembershipTableItem.ts`
- [x] T025 [P] [US3] Update `contributorType` references from `RoleSetContributorType` to `ActorType` (using `__typename` derivation) in `src/domain/community/user/models/PendingInvitationItem.ts`
- [x] T026 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/invitations/InvitationDialog.tsx` — replace `invitation.contributorType` with type derived from `contributor.__typename` or `contributor.type`
- [x] T027 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/invitations/SingleInvitationFull.tsx` — replace `invitation.contributorType` with type derived from `contributor.__typename` or `contributor.type`
- [x] T028 [P] [US3] Update `src/domain/community/invitations/InvitationCardHorizontal/InvitationCardHorizontal.tsx` — replace `invitation.invitation.contributorType` with type derived from `contributor.__typename` or `contributor.type`
- [x] T029 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/pendingMembership/PendingMembershipsDialog.tsx`
- [x] T030 [P] [US3/US4] Update `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.tsx` — update `RoleSetContributorType` → `ActorType` AND rename `virtualContributorId` variable to `actorId` in `rolesVirtualContributor` query call (aligns with GQL rename in T010i)
- [x] T031 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/InviteContributorsDialog.tsx`
- [x] T032 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/InviteContributorsProps.tsx`
- [x] T033 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/InviteContributorsWizard.tsx`
- [x] T034 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors.ts`
- [x] T035 [P] [US3] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/inviteContributors/components/ContributorChip/ContributorChip.tsx`

**Checkpoint**: User Story 3 complete — invitations work for all actor types.

---

## Phase 6: User Story 4 — Membership and Contributions Views (Priority: P2)

**Goal**: Membership views display correctly for all actor types. Role queries (`rolesUser`, `rolesOrganization`, `rolesVirtualContributor`) remain per-type but their input types changed (`RolesActorInput` with `actorID`). Enum references updated, and TS consumers updated for the role query variable renames.

**Independent Test**: Navigate to user contributions page, organization memberships section, and VC membership page. Verify space memberships, roles, and subspace data display correctly.

### Implementation for User Story 4

- [x] T036 [US4] Update `src/domain/community/user/userContributions/useUserContributions.ts` — rename `userId` variable to `actorId` in `rolesUser` query call AND update `RoleSetContributorType` → `ActorType` (aligns with GQL rename in T010f/T010g)
- [x] T037 [US4] Update `src/domain/community/organization/useOrganization/useOrganization.ts` — rename `organizationId` variable to `actorId` in `rolesOrganization` query call AND update `RoleSetContributorType` → `ActorType` (aligns with GQL rename in T010h)
- [x] T038 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/userAdmin/tabs/UserAdminMembershipPage.tsx`
- [x] T039 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/user/ContributorsView.tsx`
- [x] T040 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/profile/useContributionProvider/useContributionProvider.ts`
- [x] T041 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/models/SpaceHostedItem.model.ts`
- [x] T042 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/ContributorTooltip/ContributorTooltip.tsx`
- [x] T043 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/ContributorCardSquare/ContributorCardSquare.tsx`
- [x] T044 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWide.tsx`
- [x] T045 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWideContent.tsx`
- [x] T046 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetVirtualContributorsBlockWide.tsx`
- [x] T047 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/community/VirtualContributorsBlock/VirtualContributorsBlock.tsx`
- [x] T048 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/community/community/utils/useCommunityMembersAsCardProps.ts`
- [x] T049 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/components/SpaceWelcomeBlock.tsx`
- [x] T050 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/components/ContributorsToggleDialog.tsx`
- [x] T051 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/components/cards/components/SpaceLeads.tsx`
- [x] T052 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/space/layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage.tsx`
- [x] T053 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.tsx`
- [x] T054 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/core/ui/authorship/Authorship.tsx`
- [x] T055 [P] [US4] Update `RoleSetContributorType` → `ActorType` in `src/core/ui/card/CardHeader.tsx`

**Checkpoint**: User Story 4 complete — all membership and contributions views display correctly.

---

## Phase 7: User Story 5 — Conversations and Messaging (Priority: P2)

**Goal**: Sender displays work with Actor type. Note: `CreateConversationInput` is **unchanged** (`userID` remains).

**Independent Test**: Create a new conversation with a user. Send a message and verify sender info displays. Add a reaction and verify reactor identity.

### Implementation for User Story 5

No TypeScript changes needed — the `CreateConversationInput` field names are unchanged, `Reaction.sender` remains `User` (no wrapping needed), and sender display changes for messages are handled by the fragment retargeting (T002) in Phase 2.

**Checkpoint**: User Story 5 complete — messaging and conversations work correctly.

---

## Phase 8: User Story 6 — Notifications and Activity Logs (Priority: P3)

**Goal**: Notification and activity log displays work with Actor types for triggeredBy/contributor fields.

**Independent Test**: Trigger a notification, verify it displays correctly. View an activity log with member-joined entries.

### Implementation for User Story 6

- [x] T056 [P] [US6] Update `RoleSetContributorType` → `ActorType` in `src/main/inAppNotifications/model/InAppNotificationPayloadModel.tsx`
- [x] T057 [P] [US6] Update `RoleSetContributorType` → `ActorType` in `src/domain/shared/components/ActivityDescription/DetailedActivityDescription.tsx`

**Checkpoint**: User Story 6 complete — notifications and activity logs display correctly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete migration, ensure no stale references remain

- [ ] T058 Run `pnpm lint` to verify zero type errors and zero lint errors across the entire codebase — BLOCKED on codegen (generated types stale)
- [ ] T059 Run `pnpm vitest run` to verify all 247 tests pass. Before running, grep test files (`src/**/*.test.*`) for `Agent`, `Contributor`, `RoleSetContributorType`, and `contributorType` — update any matching mocks/fixtures to use the new types. — BLOCKED on codegen (generated types stale)
- [ ] T060 Run `pnpm build` to verify production build succeeds without errors — BLOCKED on codegen (generated types stale)
- [x] T061 Search for any remaining references to removed types: grep for `RoleSetContributorType`, `AgentType`, `on Contributor`, `contributorType` (in non-generated `src/` files) and fix any stragglers. Note: `invitedContributorIDs`, `rolesUser`, `rolesOrganization`, `rolesVirtualContributor`, and per-type role mutations are **valid and must NOT be removed**. Also verify no `.Virtual` enum values remain (should all be `.VirtualContributor`). — DONE: only generated file (`graphql-schema.ts`) has remaining `RoleSetContributorType` references; no `.Virtual` enum values remain in source files.
- [ ] T062 Commit all generated files from codegen (`src/core/apollo/generated/`) — BLOCKED on codegen (server not available)

### Implementation Deviations (noted 2026-02-24)

- [x] T063 [NEW] Added `ActorDetails.graphql` query at `src/domain/community/contributor/graphql/ActorDetails.graphql` — uses `actor(id)` root query with inline type narrowing. **Not in original spec.** Introduces `useActorDetailsLazyQuery()` for fetching type-specific fields (email, firstName, lastName, contactEmail).
- [x] T064 [NEW] Added `useActorDetailsLazyQuery()` enrichment in `useRoleSetApplicationsAndInvitations.ts` — fetches type-specific contributor details for applications and invitations. **Known NFR-001 deviation**: introduces N+1 queries.
- [x] T065 [NEW] Added `useActorDetailsLazyQuery()` enrichment in `useActivityOnCollaboration.ts` — fetches type-specific contributor details for activity log entries. **Known NFR-001 deviation**: introduces N+1 queries.

### Follow-up Tasks (next PRs)

- [ ] T066 Remove `agent?: {}` from `UserModel.ts` — currently left as empty optional type, should be fully removed.
- [ ] T067 Inline type-specific fields (`... on User { email firstName lastName }`, `... on Organization { contactEmail }`) into parent queries (`RoleSetApplicationsInvitations.graphql`, `activityLogFragments.graphql`) to eliminate `ActorDetails` N+1 queries and restore NFR-001 compliance.
- [ ] T068 Adopt unified `assignRole`/`removeRole` mutations (replacing 6 per-type mutations with 2).
- [ ] T069 Clean up actor data model — ensure client fetches minimal actor data per context, remove unnecessary fields from queries.

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
  - US5 (Phase 7): No work needed (handled by Phase 2)
  - US6 (Phase 8): No dependencies on other stories
- **Polish (Phase 9)**: Depends on ALL user stories being complete

### Within Each User Story

- Models/interfaces before hooks that consume them
- Hooks before components that use them
- All `[P]` tasks within a phase can run in parallel

### Parallel Opportunities

- T002–T004 (fragment retargeting): all parallel
- T006–T009 (invitation contributorType removal): all parallel
- T010a–T010d (role mutation input renames — platform + per-type): all parallel
- T010e–T010i (role query input renames): all parallel
- After codegen (T011), all 6 user stories can start in parallel
- Within US2: T015–T020 are all parallel; T020b parallel with T020a
- Within US3: T022–T035 are all parallel (different files)
- Within US4: T038–T055 are all parallel (different files, all enum replacements)
- Within US6: T056–T057 are parallel

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
6. Phase 7 (US5) → No work needed
7. Phase 8 (US6) → Notifications/activity logs work
8. Phase 9 → Polish, full validation, commit

### Recommended Single-Developer Flow

Since this is a migration (not new features), the most efficient approach is:

1. Do ALL GraphQL changes in one pass (Phase 2)
2. Run codegen once
3. Work through TypeScript fixes by story priority (Phase 3 → 4 → 5 → 6 → 8)
4. Run lint/test/build at the end (Phase 9)

---

## Notes

- The enum type rename (`RoleSetContributorType` → `ActorType`) is the bulk of the work (~40 files). Unlike the earlier assumption, the **value** for virtual contributors also changes: `.Virtual` → `.VirtualContributor` (schema: `VIRTUAL_CONTRIBUTOR`). The values for `User` and `Organization` stay the same. This means ~26 comparison sites need both the type name AND the value updated.
- The `contributorType` removal from invitations requires deriving the actor type from `contributor.__typename` or `contributor.type` instead — this is the most logic-sensitive change.
- Platform role inputs (`AssignPlatformRoleInput`, `RemovePlatformRoleInput`) rename `contributorID` → `actorID`. This is a BREAKING change — the GraphQL documents and the variable names in `useRoleSetManagerRolesAssignment.ts` must be updated.
- After codegen, the TypeScript compiler will flag every breakage point — use `pnpm lint` output as a checklist.
- **Provider-field consumers need no changes**: `useInnovationPackCardProps.ts`, `PreviewTemplateDialog.tsx`, and `SpaceAdminAccountPage.tsx` only access `.profile` sub-fields (displayName, avatar, url, location) or `.__typename`, all of which remain identical on Actor. Verified during analysis — no tasks needed.
- **Per-type role mutations/queries stay but inputs changed**: The server adds unified `assignRole`/`removeRole` but does not remove per-type mutations. `assignRoleToUser`, `removeRoleFromOrganization`, `rolesUser`, etc. all remain valid. However, ALL per-type role mutation inputs are now unified (`AssignRoleOnRoleSetInput`/`RemoveRoleOnRoleSetInput` with `actorID` replacing `contributorID`), and all role query inputs are unified (`RolesActorInput` with `actorID` replacing `userID`/`organizationID`/`virtualContributorID`). Adopting unified mutations is deferred to a follow-up.
- **`Reaction.sender` remains `User`**: No change needed for `AddReactionMutation.graphql` — `sender { id firstName lastName }` works as-is.
- **`ActivityLogEntryMemberJoined.contributorType` renamed to `actorType`**: This is a field name change (not just type change). The activity log fragment does not currently select this field, so no GQL change is needed, but TypeScript consumers that reference the field name must update.
- **`ContributorRoles` → `ActorRoles`, `ContributorRolePolicy` → `ActorRolePolicy`**: These renames are handled automatically by codegen — no manual changes needed.
- **`CommunityInvitationForRoleResult.contributorID` → `actorID`**: This is a BREAKING field rename. Any code reading this result (currently only generated code) will be updated by codegen automatically.

---

## Removed Tasks (from original spec, not in server schema scope)

The following tasks were removed because the server schema does not make the corresponding API changes:

- ~~T010: Wrap `firstName`/`lastName` in `... on User` on `AddReactionMutation.graphql`~~ — `Reaction.sender` remains `User`, no change needed.
- ~~T010–T012 (old): Replace `rolesUser`/`rolesOrganization`/`rolesVirtualContributor` with `rolesActor`~~ — Queries not unified.
- ~~T013 (old): Rename `invitedContributorIds` → `invitedActorIds`~~ — Input field not renamed.
- ~~T031–T032 (old): Update `invitedContributorIds` → `invitedActorIds` in model/hook~~ — Input field not renamed.
- ~~T037–T038 (old): Update `invitedContributorIds` → `invitedActorIds` in dialogs~~ — Input field not renamed.
- ~~T048–T049 (old): Update `rolesUser`/`rolesOrganization` field access to `rolesActor`~~ — Queries not unified.
- ~~T069 (old): Update `userID` → `receiverActorId` in NewMessageDialog.tsx~~ — Input field not renamed.

## Deferred Tasks (server supports but not in migration scope)

The following changes are supported by the new server schema but are deferred to a follow-up PR to limit migration scope:

- Adopt unified `assignRole`/`removeRole` mutations (replacing 6 per-type mutations with 2) — per-type mutations still work.
- Adopt unified `rolesActor` query if/when server adds it — per-type queries still work.
