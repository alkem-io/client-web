# GraphQL Contract Changes: Actor Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10
**Updated**: 2026-02-20 (aligned with final server schema on branch `026-actor-transformation-v2`)

This document catalogs every `.graphql` file change needed and the resulting TypeScript impact.

> **Scope update (2026-02-20)**: Role query unification (3→1), invitation input renames, and conversation input renames are **out of scope**. The migration includes: fragment retargeting, agent removal, invitation `contributorType` field removal, platform role input field renames (`contributorID` → `actorID`), enum rename (including `.Virtual` → `.VirtualContributor`), and `... on User` wrapping for Actor-typed sender fields.

## 1. Fragment Retargeting

### `src/domain/community/contributor/graphql/contributorDetails.graphql`

```diff
-fragment ContributorDetails on Contributor {
+fragment ContributorDetails on Actor {
```

### `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`

```diff
-fragment AdminCommunityCandidateMember on Contributor {
+fragment AdminCommunityCandidateMember on Actor {
```

### `src/domain/InnovationPack/admin/InnovationPacksMutations.graphql`

```diff
-fragment InnovationPackProviderProfileWithAvatar on Contributor {
+fragment InnovationPackProviderProfileWithAvatar on Actor {
```

## 2. Agent Field Removal

### `src/domain/community/user/graphql/queries/UserAccount.graphql`

```diff
 query UserAccount($userId: UUID!) {
   lookup {
     user(ID: $userId) {
       id
       profile {
         id
         displayName
       }
-      agent {
-        id
-        credentials {
-          id
-          type
-        }
-      }
+      credentials {
+        id
+        type
+      }
       account {
         id
       }
     }
   }
 }
```

## 3. Invitation `contributorType` Removal

### `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`

```diff
 fragment AdminCommunityInvitation on Invitation {
   ...
-  contributorType
   contributor {
     ...AdminCommunityCandidateMember
     ... on User {
       email
     }
   }
 }
```

### `src/domain/community/userCurrent/CurrentUserProvider/CurrentUserFull.graphql`

```diff
 fragment InvitationData on CommunityInvitationResult {
   ...
   invitation {
     ...
-    contributorType
   }
 }
```

### `src/main/topLevelPages/myDashboard/InvitationsBlock/PendingInvitations.graphql`

```diff
       invitation {
         ...
-        contributorType
       }
```

### `src/domain/spaceAdmin/SpaceAdminCommunity/components/CommunityInvitationDialog/CommunityInvitation.graphql`

```diff
     invitation(ID: $invitationId) @skip(if: $isPlatformInvitation) {
       ...
-      contributorType
       contributor {
         ...
       }
     }
```

## ~~4. Sender/Reaction Fix~~ — NOT NEEDED

~~### `src/domain/communication/room/Comments/AddReactionMutation.graphql`~~

**CORRECTION**: `Reaction.sender` remains typed as `User` in the actual schema (not `Actor`). The `AddReactionMutation.graphql` queries `sender { id firstName lastName }` on the `Reaction` return type, where `sender` is `User`. No `... on User` wrapper is needed — `firstName`/`lastName` are directly available. **No change required for this file.**

## 5. Per-Type Role Mutation Input Renames (contributorID → actorID)

The per-type role mutations (`assignRoleToUser`, `removeRoleFromUser`, etc.) now use unified input types (`AssignRoleOnRoleSetInput`, `RemoveRoleOnRoleSetInput`) with `actorID` instead of the old per-type inputs with `contributorID`.

### `src/domain/access/RoleSetManager/RolesAssignment/AssignRole.graphql`

```diff
-mutation AssignRoleToUser($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  assignRoleToUser(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
+mutation AssignRoleToUser($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
+  assignRoleToUser(roleData: { roleSetID: $roleSetId, role: $role, actorID: $actorId }) {
     id
   }
 }

-mutation AssignRoleToOrganization($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  assignRoleToOrganization(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
+mutation AssignRoleToOrganization($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
+  assignRoleToOrganization(roleData: { roleSetID: $roleSetId, role: $role, actorID: $actorId }) {
     id
   }
 }

-mutation AssignRoleToVirtualContributor($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  assignRoleToVirtualContributor(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
+mutation AssignRoleToVirtualContributor($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
+  assignRoleToVirtualContributor(roleData: { roleSetID: $roleSetId, role: $role, actorID: $actorId }) {
     id
   }
 }
```

### `src/domain/access/RoleSetManager/RolesAssignment/RemoveRole.graphql`

```diff
-mutation RemoveRoleFromUser($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  removeRoleFromUser(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
+mutation RemoveRoleFromUser($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
+  removeRoleFromUser(roleData: { roleSetID: $roleSetId, role: $role, actorID: $actorId }) {
     id
   }
 }

-mutation removeRoleFromOrganization($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
+mutation removeRoleFromOrganization($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
   removeRoleFromOrganization(
-    roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }
+    roleData: { roleSetID: $roleSetId, role: $role, actorID: $actorId }
   ) {
     id
   }
 }

-mutation removeRoleFromVirtualContributor($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
+mutation removeRoleFromVirtualContributor($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
   removeRoleFromVirtualContributor(
-    roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }
+    roleData: { roleSetID: $roleSetId, role: $role, actorID: $actorId }
   ) {
     id
   }
 }
```

## 6. Role Query Input Renames (userID/organizationID/virtualContributorID → actorID)

The per-type role queries now use a unified `RolesActorInput` with `actorID` instead of separate per-type inputs.

### `src/main/search/SearchQueries.graphql`

```diff
-query userRolesSearchCards($userId: UUID!) {
-  rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
+query userRolesSearchCards($actorId: UUID!) {
+  rolesUser(rolesData: { actorID: $actorId, filter: { visibilities: [ACTIVE, DEMO] } }) {
```

### `src/domain/community/user/userContributions/UserContributions.graphql`

```diff
-query UserContributions($userId: UUID!) {
-  rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
+query UserContributions($actorId: UUID!) {
+  rolesUser(rolesData: { actorID: $actorId, filter: { visibilities: [ACTIVE, DEMO] } }) {
```

### `src/domain/community/user/userContributions/UserOrganizationIds.graphql`

```diff
-query UserOrganizationIds($userId: UUID!) {
-  rolesUser(rolesData: { userID: $userId }) {
+query UserOrganizationIds($actorId: UUID!) {
+  rolesUser(rolesData: { actorID: $actorId }) {
```

### `src/domain/community/organization/useOrganization/useOrganizationQueries.graphql`

```diff
-query rolesOrganization($organizationId: UUID!) {
-  rolesOrganization(rolesData: { organizationID: $organizationId, filter: { visibilities: [ACTIVE, DEMO] } }) {
+query rolesOrganization($actorId: UUID!) {
+  rolesOrganization(rolesData: { actorID: $actorId, filter: { visibilities: [ACTIVE, DEMO] } }) {
```

### `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.graphql`

```diff
-query VCMemberships($virtualContributorId: UUID!) {
+query VCMemberships($actorId: UUID!) {
   lookup {
-    virtualContributor(ID: $virtualContributorId) {
+    virtualContributor(ID: $actorId) {
       ...
     }
   }
-  rolesVirtualContributor(rolesData: { virtualContributorID: $virtualContributorId }) {
+  rolesVirtualContributor(rolesData: { actorID: $actorId }) {
```

## 7. Platform Role Input Renames

### `src/domain/access/RoleSetManager/RolesAssignment/AssignPlatformRole.graphql`

```diff
-mutation AssignPlatformRoleToUser($role: RoleName!, $contributorId: UUID!) {
-  assignPlatformRoleToUser(roleData: { role: $role, contributorID: $contributorId }) {
+mutation AssignPlatformRoleToUser($role: RoleName!, $actorId: UUID!) {
+  assignPlatformRoleToUser(roleData: { role: $role, actorID: $actorId }) {
     id
   }
 }
```

### `src/domain/access/RoleSetManager/RolesAssignment/RemovePlatformRole.graphql`

```diff
-mutation RemovePlatformRoleFromUser($role: RoleName!, $contributorId: UUID!) {
-  removePlatformRoleFromUser(roleData: { role: $role, contributorID: $contributorId }) {
+mutation RemovePlatformRoleFromUser($role: RoleName!, $actorId: UUID!) {
+  removePlatformRoleFromUser(roleData: { role: $role, actorID: $actorId }) {
     id
     profile {
       id
       displayName
     }
   }
 }
```

## 8. New ActorDetails Query (added during implementation, not in original spec)

### `src/domain/community/contributor/graphql/ActorDetails.graphql` (NEW FILE)

```graphql
query ActorDetails($actorId: UUID!) {
  actor(id: $actorId) {
    id
    type
    nameID
    profile {
      id
      displayName
      url
    }
    ... on User {
      email
      firstName
      lastName
      phone
      isContactable
    }
    ... on Organization {
      contactEmail
      domain
      legalEntityName
    }
    ... on VirtualContributor {
      bodyOfKnowledgeType
    }
  }
}
```

This query was added to fetch type-specific fields that are no longer available on the lightweight `Actor` type returned by parent queries. Used via `useActorDetailsLazyQuery()` in `useRoleSetApplicationsAndInvitations.ts` and `useActivityOnCollaboration.ts`.

**Known issue**: Introduces N+1 network requests per unique contributor. Follow-up work should inline these type-specific fields into the parent queries.

## ~~Removed Sections (not in server schema scope)~~

The following changes were originally planned but are **not** in scope:

- ~~**Adopting unified mutations (6→2)**: `assignRoleToUser/Org/VC` → `assignRole`, `removeRoleFromUser/Org/VC` → `removeRole`~~ — Unified mutations exist but adoption is deferred; per-type mutations remain valid (though their input types changed — see sections 5 and 6).
- ~~**Adopting unified query (3→1)**: `rolesUser/Org/VC` → single `rolesActor` query~~ — Per-type queries remain (though their input types changed — see section 6).
- ~~**Invitation Input Rename**: `invitedContributorIDs` → `invitedActorIds`~~ — Input field remains.
- ~~**Messaging Input Rename**: `userID` → `receiverActorId`~~ — Input field remains.

## TypeScript Files Requiring Changes After Codegen

After running `pnpm codegen`, the following TypeScript files will have type errors that need manual fixes:

### RoleSetContributorType → ActorType (~40 files)

See research.md R-003 for the complete file list. **Note**: The enum value for virtual contributors changes from `.Virtual` to `.VirtualContributor` (schema: `VIRTUAL_CONTRIBUTOR`). All ~26 comparison sites using `.Virtual` must update to `.VirtualContributor`. The values for `.User` and `.Organization` remain the same.

### Role mutation/query variable renames

- `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.ts` — rename `contributorId` variable to `actorId` in ALL role mutation calls (per-type + platform)
- `src/domain/community/user/userContributions/useUserContributions.ts` — rename `userId` variable to `actorId` for `rolesUser` query
- `src/domain/community/organization/useOrganization/useOrganization.ts` — rename `organizationId` variable to `actorId` for `rolesOrganization` query
- `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.tsx` — rename `virtualContributorId` variable to `actorId` for `rolesVirtualContributor` query
- `src/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard.tsx` — rename `contributorId` to `actorId` in `assignRoleToVirtualContributor` call

### Invitation models (contributorType removal)

- `src/domain/access/model/InvitationModel.ts`
- `src/domain/access/model/ApplicationModel.ts`
- `src/domain/community/user/models/PendingInvitationItem.ts`

### Agent removal

- `src/domain/community/user/models/UserModel.ts`

### ~~Removed from scope~~

- ~~`src/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts`~~ — The `addContributorType()` helper was renamed to `getContributorType()`, returns `ActorType` with fallback. Additionally, `useActorDetailsLazyQuery()` was added to enrich contributors with type-specific fields (not in original spec). No `invitedActorIds` rename.
- ~~`src/domain/access/model/InvitationDataModel.ts`~~ — `invitedContributorIds` field name stays.
- ~~`src/main/userMessaging/NewMessageDialog.tsx`~~ — `userID` stays.
