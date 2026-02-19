# Research: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10

## R-001: Agent Field Removal Scope

**Decision**: The `agent` field is only queried in one `.graphql` file (`UserAccount.graphql`). Replace `agent { id credentials { id type } }` with `credentials { id type }` directly on User.

**Rationale**: Codebase search confirms only `UserAccount.graphql` queries the `agent` field. The `UserModel.ts` has an `agent?: {}` placeholder that should also be removed. Two TypeScript consumers (`UserAdminAccountPage.tsx`, `UserProfilePage.tsx`) use the `useUserAccountQuery` hook — they will be automatically fixed by codegen once the `.graphql` file is updated.

**Alternatives considered**: None — this is a straightforward field removal with a direct replacement.

## R-002: Contributor Fragment Retargeting Strategy

**Decision**: Retarget three fragments from `on Contributor` to `on ActorFull`. Field selections remain identical since `ActorFull` exposes the same `profile` sub-fields.

**Rationale**: The three fragments are:

1. `ContributorDetails on Contributor` — used by message sender, activity log contributor, and many other contexts
2. `AdminCommunityCandidateMember on Contributor` — used in application/invitation admin views
3. `InnovationPackProviderProfileWithAvatar on Contributor` — used in innovation pack provider display

All three query only `id` and `profile { ... }` sub-fields which are available on `ActorFull`. The `... on User { email }` inline fragments in application/invitation contexts should still work since `User` implements `ActorFull`.

**Alternatives considered**: Creating new fragment names (e.g., `ActorFullDetails`) — rejected because the field selections are identical and renaming would require updating all spread sites unnecessarily. Keeping the existing fragment names and just changing the type target is less disruptive.

## R-003: RoleSetContributorType → ActorType Migration Scope

**Decision**: Replace `RoleSetContributorType` with `ActorType` across ~40 non-generated TypeScript files. The enum value `Virtual` changes to `VirtualContributor`.

**Rationale**: Exhaustive grep reveals `RoleSetContributorType` is referenced in files spanning:

- **Models** (5): `InvitationModel.ts`, `ApplicationModel.ts`, `MembershipTableItem.ts`, `PendingInvitationItem.ts`, `SpaceHostedItem.model.ts`
- **Access/RoleSet** (4): `useRoleSetManager.ts`, `useRoleSetApplicationsAndInvitations.ts`, `useCommunityAdmin.ts`, `AdminAuthorizationPage.tsx`
- **Community/Contributor UI** (12): `ContributorTooltip.tsx`, `ContributorCardSquare.tsx`, `ContributorsView.tsx`, `RoleSetContributorsBlockWide.tsx`, `RoleSetContributorsBlockWideContent.tsx`, `RoleSetVirtualContributorsBlockWide.tsx`, `VirtualContributorsBlock.tsx`, `SpaceLeads.tsx`, `ContributorChip.tsx`, `useContributors.ts`, `Authorship.tsx`, `CardHeader.tsx`
- **Invitations** (5): `InvitationDialog.tsx`, `SingleInvitationFull.tsx`, `InviteContributorsDialog.tsx`, `InviteContributorsProps.tsx`, `InviteContributorsWizard.tsx`
- **Space/Community pages** (8): `SpaceCommunityPage.tsx`, `SpaceWelcomeBlock.tsx`, `ContributorsToggleDialog.tsx`, `CommunityMemberships.tsx`, `useOrganization.ts`, `useUserContributions.ts`, `UserAdminMembershipPage.tsx`, `PendingMembershipsDialog.tsx`
- **Notifications** (1): `InAppNotificationPayloadModel.tsx`
- **Activity** (1): `DetailedActivityDescription.tsx`
- **Profile** (1): `useContributionProvider.ts`

**Key value mapping change**: `RoleSetContributorType.Virtual` → `ActorType.VirtualContributor`. The `User` and `Organization` values remain the same. The `addContributorType()` helper in `useRoleSetApplicationsAndInvitations.ts` must be updated.

**Alternatives considered**: Creating a compatibility shim that maps old enum values — rejected because this is a one-time migration and a shim adds complexity. Straight replacement is cleaner.

## R-004: Role Mutation Unification Strategy

**Decision**: Replace 6 role-set mutations with 2 unified mutations, and update 2 platform role mutations.

**Rationale**: Current state:

- `AssignRole.graphql`: 3 mutations (`assignRoleToUser`, `assignRoleToOrganization`, `assignRoleToVirtualContributor`)
- `RemoveRole.graphql`: 3 mutations (`removeRoleFromUser`, `removeRoleFromOrganization`, `removeRoleFromVirtualContributor`)
- `AssignPlatformRole.graphql`: 1 mutation (`assignPlatformRoleToUser`)
- `RemovePlatformRole.graphql`: 1 mutation (`removePlatformRoleFromUser`)

New state: 2 unified mutations (`assignRole`, `removeRole`) using `AssignRoleOnRoleSetInput`/`RemoveRoleOnRoleSetInput` with `actorId` field. Platform role mutations update `contributorID` → `actorId`.

The main consumer `useRoleSetManagerRolesAssignment.ts` currently has 8 separate mutation handlers — this simplifies to 4 (assignRole, removeRole, assignPlatformRole, removePlatformRole). The hook's public API (`assignRoleToUser`, `removeRoleFromUser`, etc.) can either be preserved as thin wrappers or unified. Since all callers already pass an ID + role, preserving the per-type API names avoids touching downstream callers.

**Alternatives considered**: Fully unifying the public hook API to a single `assignRole(actorId, role)` — this would require updating all callers. Better to keep backward-compatible function signatures in the hook and just change the underlying mutation.

## R-005: Roles Query Unification Strategy

**Decision**: Replace 3 separate queries with 1 `rolesActor` query, updating each call site to pass `actorId` instead of entity-specific IDs.

**Rationale**: Three files:

- `UserContributions.graphql`: `rolesUser(rolesData: { userID: $userId })` → `rolesActor(rolesData: { actorId: $userId })`
- `useOrganizationQueries.graphql`: `rolesOrganization(rolesData: { organizationID: $organizationId })` → `rolesActor(rolesData: { actorId: $organizationId })`
- `VCMembershipPage.graphql`: `rolesVirtualContributor(rolesData: { virtualContributorID: $virtualContributorId })` → `rolesActor(rolesData: { actorId: $virtualContributorId })`

The response type changes from `ContributorRoles` to `ActorRoles` but the shape (spaces, roles, subspaces) is expected to be identical.

**Alternatives considered**: None — direct 1:1 replacement.

## R-006: Invitation Field Changes

**Decision**: Three changes to invitation-related code:

1. Remove `contributorType` from Invitation fragments (4 `.graphql` files)
2. Rename `invitedContributorIDs` → `invitedActorIds` in mutation input
3. Update `CommunityInvitationForRoleResult` fields: `contributorID` → `actorId`, `contributorType` → `actorType`

**Rationale**: The `contributorType` field on Invitation is removed server-side. Client code currently uses it to distinguish between User/Organization/VirtualContributor invitations (especially in `PendingMembershipsDialog.tsx`, `InvitationDialog.tsx`, `SingleInvitationFull.tsx`, `VCMembershipPage.tsx`).

Post-migration, type discrimination should use `contributor.__typename` (already available through GraphQL's intrinsic `__typename`) or query the `type` field if available on the returned Actor. The `addContributorType()` helper already derives the type from `__typename`, so the client can use this approach uniformly for both applications and invitations.

For `InvitationData` fragment in `CurrentUserFull.graphql` and `PendingInvitations.graphql`, the `contributorType` field must be removed and callers updated to derive type from the contributor's `__typename`.

**Alternatives considered**: Querying the `type` field on the Actor — viable but `__typename` is always available and already used in the `addContributorType` helper pattern.

## R-007: Provider/Host/Sender Type Changes

**Decision**: These fields change return type from `Contributor` to `Actor` but the queried sub-fields (`id`, `profile { ... }`) remain available. Minimal changes needed.

**Rationale**:

- `provider` field: Used in `spaceAboutDetails.graphql`, `InnovationPacksMutations.graphql`, `InnovationPackProfile.graphql`. The fragment `InnovationPackProviderProfileWithAvatar on Contributor` needs retargeting (covered in R-002).
- `host` field: Used in `AccountInformation.graphql` — only queries `id`, compatible with Actor.
- `sender` field: Used in `CommentsMessageDetailsFragment.graphql` (uses `...ContributorDetails` fragment — retargeting covers it) and `AddReactionMutation.graphql` (queries `firstName`, `lastName` on sender which was `User` type — these fields won't be available on `Actor`, need `... on User { firstName lastName }` inline fragment).

**Alternatives considered**: None — straightforward type change with fragment retargeting handling most cases.

## R-008: createConversation Input Change

**Decision**: Replace `userID` with `receiverActorId` in the `CreateConversationInput`.

**Rationale**: `CreateConversation.graphql` passes the input as-is. `NewMessageDialog.tsx` (line 94) sets `userID: selectedUser.id` — change to `receiverActorId: selectedUser.id`.

**Alternatives considered**: None — direct field rename.

## R-009: Apollo Cache Considerations

**Decision**: No manual cache migration needed. Running codegen regenerates all `__typename` values and type policies.

**Rationale**: Apollo Client normalizes cache entries by `__typename:id`. The `Contributor` type name will no longer appear in responses — new responses will use `User`, `Organization`, `VirtualContributor` directly (which already have their own `__typename`). The `Contributor` interface was never a concrete type with its own `__typename` in the cache — it was an abstract type. The cache eviction pattern in `useRoleSetManagerRolesAssignment.ts` (`evictFromCache(cache, roleSetId, 'RoleSet')`) targets `RoleSet` which is unchanged.

**Alternatives considered**: Manual cache clearing on migration — unnecessary given the above analysis.
