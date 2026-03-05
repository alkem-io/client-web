# Research: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10
**Updated**: 2026-02-19 (aligned with server PR #5856 on branch `026-actor-transformation-v2`)

## R-001: Agent Field Removal Scope

**Decision**: The `agent` field is only queried in one `.graphql` file (`UserAccount.graphql`). Replace `agent { id credentials { id type } }` with `credentials { id type }` directly on User.

**Rationale**: Codebase search confirms only `UserAccount.graphql` queries the `agent` field. The `UserModel.ts` has an `agent?: {}` placeholder that should also be removed. Two TypeScript consumers (`UserAdminAccountPage.tsx`, `UserProfilePage.tsx`) use the `useUserAccountQuery` hook — they will be automatically fixed by codegen once the `.graphql` file is updated.

**Alternatives considered**: None — this is a straightforward field removal with a direct replacement.

## R-002: Contributor Fragment Retargeting Strategy

**Decision**: Retarget three fragments from `on Contributor` to `on Actor`. Field selections remain identical since `Actor` exposes the same `profile` sub-fields. **Implementation note (2026-02-24)**: Originally planned as `on ActorFull`, but the server uses `Actor` as the return type for these fields.

**Rationale**: The three fragments are:

1. `ContributorDetails on Contributor` — used by message sender, activity log contributor, and many other contexts
2. `AdminCommunityCandidateMember on Contributor` — used in application/invitation admin views
3. `InnovationPackProviderProfileWithAvatar on Contributor` — used in innovation pack provider display

All three query only `id` and `profile { ... }` sub-fields which are available on `Actor`. The `... on User { email }` inline fragments in application/invitation contexts should still work since `User` implements `Actor`.

**Alternatives considered**: Creating new fragment names (e.g., `ActorFullDetails`) — rejected because the field selections are identical and renaming would require updating all spread sites unnecessarily. Keeping the existing fragment names and just changing the type target is less disruptive.

**Post-implementation note (2026-02-24)**: Additionally, a new `ActorDetails.graphql` query was added (not in original spec) to fetch type-specific fields (email, firstName, contactEmail, etc.) via the `actor(id)` root query with inline type narrowing. This is used in `useRoleSetApplicationsAndInvitations.ts` and `useActivityOnCollaboration.ts` as an N+1 enrichment pattern. Follow-up work should inline these fields into the parent queries.

## R-003: RoleSetContributorType → ActorType Migration Scope

**Decision**: Replace `RoleSetContributorType` with `ActorType` across ~43 non-generated TypeScript files. The enum value `Virtual` changes to `VirtualContributor` (schema: `VIRTUAL_CONTRIBUTOR`). `User` and `Organization` stay the same.

> **Updated 2026-02-20**: The final server schema uses `VIRTUAL_CONTRIBUTOR` (not `VIRTUAL`). This means all ~26 `.Virtual` comparison sites must change to `.VirtualContributor` — both the type name AND the value change.

**Rationale**: Exhaustive grep reveals `RoleSetContributorType` is referenced in files spanning:

- **Models** (5): `InvitationModel.ts`, `ApplicationModel.ts`, `MembershipTableItem.ts`, `PendingInvitationItem.ts`, `SpaceHostedItem.model.ts`
- **Access/RoleSet** (4): `useRoleSetManager.ts`, `useRoleSetApplicationsAndInvitations.ts`, `useCommunityAdmin.ts`, `AdminAuthorizationPage.tsx`
- **Community/Contributor UI** (12): `ContributorTooltip.tsx`, `ContributorCardSquare.tsx`, `ContributorsView.tsx`, `RoleSetContributorsBlockWide.tsx`, `RoleSetContributorsBlockWideContent.tsx`, `RoleSetVirtualContributorsBlockWide.tsx`, `VirtualContributorsBlock.tsx`, `SpaceLeads.tsx`, `ContributorChip.tsx`, `useContributors.ts`, `Authorship.tsx`, `CardHeader.tsx`
- **Invitations** (5): `InvitationDialog.tsx`, `SingleInvitationFull.tsx`, `InviteContributorsDialog.tsx`, `InviteContributorsProps.tsx`, `InviteContributorsWizard.tsx`
- **Space/Community pages** (8): `SpaceCommunityPage.tsx`, `SpaceWelcomeBlock.tsx`, `ContributorsToggleDialog.tsx`, `CommunityMemberships.tsx`, `useOrganization.ts`, `useUserContributions.ts`, `UserAdminMembershipPage.tsx`, `PendingMembershipsDialog.tsx`
- **Notifications** (1): `InAppNotificationPayloadModel.tsx`
- **Activity** (1): `DetailedActivityDescription.tsx`
- **Profile** (1): `useContributionProvider.ts`

**Key value mapping**: `RoleSetContributorType.Virtual` → `ActorType.VirtualContributor` (value changes!). `User` and `Organization` stay the same.

**Alternatives considered**: Creating a compatibility shim that maps old enum values — rejected because this is a one-time migration and a shim adds complexity. Straight replacement is cleaner.

## ~~R-004: Role Mutation Unification Strategy~~ — REMOVED

> **Updated 2026-02-20**: The server adds unified `assignRole`/`removeRole` mutations but keeps all 6 per-type mutations. Adoption of unified mutations is deferred. However, platform role mutations (`assignPlatformRoleToUser`, `removePlatformRoleFromUser`) now use `actorID` instead of `contributorID` — this is a BREAKING change requiring GraphQL document and variable updates.

## ~~R-005: Roles Query Unification Strategy~~ — REMOVED

> **Removed 2026-02-19**: The server PR does not unify role queries. `rolesUser`, `rolesOrganization`, `rolesVirtualContributor` all remain with their existing input types. No changes needed.

## R-006: Invitation Field Changes

**Decision**: ~~Three~~ One change to invitation-related code:

1. Remove `contributorType` from Invitation fragments (4 `.graphql` files)
2. ~~Rename `invitedContributorIDs` → `invitedActorIds` in mutation input~~ — **REMOVED**: server keeps `invitedContributorIDs`
3. ~~Update `CommunityInvitationForRoleResult` fields~~ — **REMOVED**: server keeps `contributorID` and `contributorType` on this type

**Rationale**: The `contributorType` field on Invitation is removed server-side. Client code currently uses it to distinguish between User/Organization/VirtualContributor invitations (especially in `PendingMembershipsDialog.tsx`, `InvitationDialog.tsx`, `SingleInvitationFull.tsx`, `VCMembershipPage.tsx`).

Post-migration, type discrimination should use `contributor.__typename` (already available through GraphQL's intrinsic `__typename`) or query the `type` field if available on the returned Actor. The `addContributorType()` helper already derives the type from `__typename`, so the client can use this approach uniformly for both applications and invitations.

For `InvitationData` fragment in `CurrentUserFull.graphql` and `PendingInvitations.graphql`, the `contributorType` field must be removed and callers updated to derive type from the contributor's `__typename`.

**Alternatives considered**: Querying the `type` field on the Actor — viable but `__typename` is always available and already used in the `addContributorType` helper pattern.

## R-007: Provider/Host/Sender Type Changes

**Decision**: These fields change return type from `Contributor` to `Actor` but the queried sub-fields (`id`, `profile { ... }`) remain available. Minimal changes needed.

**Rationale**:

- `provider` field: Used in `spaceAboutDetails.graphql`, `InnovationPacksMutations.graphql`, `InnovationPackProfile.graphql`. The fragment `InnovationPackProviderProfileWithAvatar on Contributor` needs retargeting (covered in R-002).
- `host` field: Used in `AccountInformation.graphql` — only queries `id`, compatible with Actor.
- `sender` field: Used in `CommentsMessageDetailsFragment.graphql` (uses `...ContributorDetails` fragment — retargeting covers it) and `AddReactionMutation.graphql` (queries `firstName`, `lastName` on sender). **Correction (2026-02-24)**: `Reaction.sender` remains `User` (not `Actor`) in the actual schema — no `... on User` wrapper needed.

**Alternatives considered**: None — straightforward type change with fragment retargeting handling most cases.

## ~~R-008: createConversation Input Change~~ — REMOVED

> **Removed 2026-02-19**: The server PR does not change `CreateConversationInput`. `userID` and `virtualContributorID` fields remain as-is. No changes needed to `NewMessageDialog.tsx`.

## R-009: Apollo Cache Considerations

**Decision**: No manual cache migration needed. Running codegen regenerates all `__typename` values and type policies.

**Rationale**: Apollo Client normalizes cache entries by `__typename:id`. The `Contributor` type name will no longer appear in responses — new responses will use `User`, `Organization`, `VirtualContributor` directly (which already have their own `__typename`). The `Contributor` interface was never a concrete type with its own `__typename` in the cache — it was an abstract type. The cache eviction pattern in `useRoleSetManagerRolesAssignment.ts` (`evictFromCache(cache, roleSetId, 'RoleSet')`) targets `RoleSet` which is unchanged.

**Alternatives considered**: Manual cache clearing on migration — unnecessary given the above analysis.
