# GraphQL Contract Changes: Actor Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10

This document catalogs every `.graphql` file change needed and the resulting TypeScript impact.

## 1. Fragment Retargeting

### `src/community/contributor/graphql/contributorDetails.graphql`

```diff
-fragment ContributorDetails on Contributor {
+fragment ContributorDetails on ActorFull {
```

### `src/domain/access/ApplicationsAndInvitations/RoleSetApplicationsInvitations.graphql`

```diff
-fragment AdminCommunityCandidateMember on Contributor {
+fragment AdminCommunityCandidateMember on ActorFull {
```

### `src/domain/InnovationPack/admin/InnovationPacksMutations.graphql`

```diff
-fragment InnovationPackProviderProfileWithAvatar on Contributor {
+fragment InnovationPackProviderProfileWithAvatar on ActorFull {
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

## 3. Role Mutations (Unified)

### `src/domain/access/RoleSetManager/RolesAssignment/AssignRole.graphql`

```diff
-mutation AssignRoleToUser($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  assignRoleToUser(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
-    id
-  }
-}
-
-mutation AssignRoleToOrganization($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  assignRoleToOrganization(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
-    id
-  }
-}
-
-mutation AssignRoleToVirtualContributor($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  assignRoleToVirtualContributor(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
-    id
-  }
-}
+mutation AssignRole($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
+  assignRole(roleData: { roleSetID: $roleSetId, role: $role, actorId: $actorId }) {
+    id
+  }
+}
```

### `src/domain/access/RoleSetManager/RolesAssignment/RemoveRole.graphql`

```diff
-mutation RemoveRoleFromUser($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  removeRoleFromUser(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
-    id
-  }
-}
-
-mutation removeRoleFromOrganization($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  removeRoleFromOrganization(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
-    id
-  }
-}
-
-mutation removeRoleFromVirtualContributor($roleSetId: UUID!, $role: RoleName!, $contributorId: UUID!) {
-  removeRoleFromVirtualContributor(roleData: { roleSetID: $roleSetId, role: $role, contributorID: $contributorId }) {
-    id
-  }
-}
+mutation RemoveRole($roleSetId: UUID!, $role: RoleName!, $actorId: UUID!) {
+  removeRole(roleData: { roleSetID: $roleSetId, role: $role, actorId: $actorId }) {
+    id
+  }
+}
```

### `src/domain/access/RoleSetManager/RolesAssignment/AssignPlatformRole.graphql`

```diff
-mutation AssignPlatformRoleToUser($role: RoleName!, $contributorId: UUID!) {
-  assignPlatformRoleToUser(roleData: { role: $role, contributorID: $contributorId }) {
+mutation AssignPlatformRoleToUser($role: RoleName!, $actorId: UUID!) {
+  assignPlatformRoleToUser(roleData: { role: $role, actorId: $actorId }) {
     id
   }
 }
```

### `src/domain/access/RoleSetManager/RolesAssignment/RemovePlatformRole.graphql`

```diff
-mutation RemovePlatformRoleFromUser($role: RoleName!, $contributorId: UUID!) {
-  removePlatformRoleFromUser(roleData: { role: $role, contributorID: $contributorId }) {
+mutation RemovePlatformRoleFromUser($role: RoleName!, $actorId: UUID!) {
+  removePlatformRoleFromUser(roleData: { role: $role, actorId: $actorId }) {
     id
     profile {
       id
       displayName
     }
   }
 }
```

## 4. Roles Queries (Unified)

### `src/domain/community/user/userContributions/UserContributions.graphql`

```diff
 query UserContributions($userId: UUID!) {
-  rolesUser(rolesData: { userID: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
+  rolesActor(rolesData: { actorId: $userId, filter: { visibilities: [ACTIVE, DEMO] } }) {
     id
     spaces {
       ...
     }
   }
 }
```

### `src/domain/community/organization/useOrganization/useOrganizationQueries.graphql`

```diff
 query rolesOrganization($organizationId: UUID!) {
-  rolesOrganization(rolesData: { organizationID: $organizationId, filter: { visibilities: [ACTIVE, DEMO] } }) {
+  rolesActor(rolesData: { actorId: $organizationId, filter: { visibilities: [ACTIVE, DEMO] } }) {
     id
     spaces {
       ...
     }
   }
 }
```

### `src/domain/community/virtualContributor/vcMembershipPage/VCMembershipPage.graphql`

```diff
-  rolesVirtualContributor(rolesData: { virtualContributorID: $virtualContributorId }) {
+  rolesActor(rolesData: { actorId: $virtualContributorId }) {
     spaces {
       ...
     }
   }
```

## 5. Invitation Changes

### `src/domain/access/ApplicationsAndInvitations/InvitationsMutations.graphql`

```diff
-mutation InviteForEntryRoleOnRoleSet($roleSetId: UUID!, $invitedContributorIds: [UUID!]!, ...) {
+mutation InviteForEntryRoleOnRoleSet($roleSetId: UUID!, $invitedActorIds: [UUID!]!, ...) {
   inviteForEntryRoleOnRoleSet(invitationData: {
-    invitedContributorIDs: $invitedContributorIds
+    invitedActorIds: $invitedActorIds
     ...
   }) {
     ...
   }
 }
```

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

## 6. Messaging Changes

### `src/main/userMessaging/graphql/CreateConversation.graphql`

No change to the `.graphql` file — the mutation accepts `$conversationData: CreateConversationInput!`. The TypeScript call site changes:

```diff
 // NewMessageDialog.tsx
   conversationData: {
-    userID: selectedUser.id,
+    receiverActorId: selectedUser.id,
   },
```

### `src/domain/communication/room/Comments/AddReactionMutation.graphql`

```diff
     sender {
       id
-      firstName
-      lastName
+      ... on User {
+        firstName
+        lastName
+      }
     }
```

## 7. Notification/Activity Changes

### `src/main/inAppNotifications/graphql/InAppNotificationsFragments.graphql`

No structural changes needed — `triggeredBy` and `contributor` fields already query `id`, `profile { ... }` which remain available on `Actor`. The `__typename` field on `InAppNotificationSpaceCommunityContributor.contributor` is already explicitly requested.

### `src/domain/collaboration/activity/ActivityLog/activityLogFragments.graphql`

No structural changes needed — `contributor` field queries `id`, `profile { ... }`, `... on User { firstName lastName }`. The inline `... on User` fragment will continue to work on Actor since User implements ActorFull.

## TypeScript Files Requiring Changes After Codegen

After running `pnpm codegen`, the following TypeScript files will have type errors that need manual fixes:

### RoleSetContributorType → ActorType (~40 files)

See research.md R-003 for the complete file list.

### Invitation models (contributorType removal)

- `src/domain/access/model/InvitationModel.ts`
- `src/domain/access/model/ApplicationModel.ts`
- `src/domain/community/user/models/PendingInvitationItem.ts`

### Role assignment hook

- `src/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment.ts`

### Invitation hook

- `src/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations.ts`
- `src/domain/access/model/InvitationDataModel.ts`

### Agent removal

- `src/domain/community/user/models/UserModel.ts`

### Messaging

- `src/main/userMessaging/NewMessageDialog.tsx`
