# Data Model: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10

## Entity Changes

### Removed Entities

| Entity                   | Replaced By           | Notes                                             |
| ------------------------ | --------------------- | ------------------------------------------------- |
| `Agent`                  | Direct credentials    | Credentials move onto the entity itself           |
| `AgentType`              | `ActorType`           | Same values, new name                             |
| `Contributor` interface  | `ActorFull` interface | Same fields (`id`, `nameID`, `profile`), new name |
| `ContributorRoles`       | `ActorRoles`          | Same shape (spaces, roles, subspaces)             |
| `ContributorRolePolicy`  | `ActorRolePolicy`     | Same shape (minimum, maximum)                     |
| `RoleSetContributorType` | `ActorType`           | Value change: `Virtual` → `VirtualContributor`    |

### New Entities

| Entity       | Fields                                                                 | Implementors                                           |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `Actor`      | `id`, `type: ActorType`, `profile?: Profile`                           | Lightweight return type for fields returning identity  |
| `ActorFull`  | `id`, `type`, `nameID`, `profile`, `credentials`                       | User, Organization, VirtualContributor, Space, Account |
| `ActorType`  | USER, ORGANIZATION, VIRTUAL_CONTRIBUTOR, SPACE, ACCOUNT                | Enum                                                   |
| `ActorRoles` | `id`, `spaces[]`, `organizations[]`, `applications[]`, `invitations[]` | Replaces ContributorRoles                              |

### Field Changes on Existing Entities

| Entity                           | Field             | Before                    | After                                  |
| -------------------------------- | ----------------- | ------------------------- | -------------------------------------- |
| User, Org, VC                    | `agent`           | `Agent`                   | **removed**                            |
| User, Org, VC, Space, Account    | `credentials`     | via `agent.credentials`   | direct `[Credential!]`                 |
| User, Org, VC, Space, Account    | `type`            | N/A                       | `ActorType!` (new)                     |
| Invitation                       | `contributorType` | `RoleSetContributorType!` | **removed**                            |
| Invitation                       | `contributor`     | `Contributor!`            | `Actor!`                               |
| SpaceAbout                       | `provider`        | `Contributor`             | `Actor`                                |
| InnovationHub/Pack               | `provider`        | `Contributor!`            | `Actor!`                               |
| VirtualContributor               | `provider`        | `Contributor!`            | `Actor!`                               |
| Account                          | `host`            | `Contributor`             | `Actor`                                |
| Message                          | `sender`          | `Contributor`             | `Actor`                                |
| Reaction                         | `sender`          | `User`                    | `Actor`                                |
| InAppNotification                | `triggeredBy`     | `Contributor`             | `Actor`                                |
| InAppNotification                | `receiver`        | `Contributor`             | `Actor`                                |
| ActivityLogEntryMemberJoined     | `contributor`     | `Contributor!`            | `Actor!`                               |
| ActivityLogEntryMemberJoined     | `contributorType` | `RoleSetContributorType!` | `ActorType!`                           |
| CommunityInvitationForRoleResult | `contributorID`   | `UUID!`                   | **renamed to** `actorId`               |
| CommunityInvitationForRoleResult | `contributorType` | `RoleSetContributorType!` | **renamed to** `actorType: ActorType!` |

### Input Type Changes

| Old Input                                        | New Input                  | Field Changes                               |
| ------------------------------------------------ | -------------------------- | ------------------------------------------- |
| `AssignRoleOnRoleSetToUserInput`                 | `AssignRoleOnRoleSetInput` | `contributorID` → `actorId`                 |
| `AssignRoleOnRoleSetToOrganizationInput`         | `AssignRoleOnRoleSetInput` | same                                        |
| `AssignRoleOnRoleSetToVirtualContributorInput`   | `AssignRoleOnRoleSetInput` | same                                        |
| `RemoveRoleOnRoleSetFromUserInput`               | `RemoveRoleOnRoleSetInput` | `contributorID` → `actorId`                 |
| `RemoveRoleOnRoleSetFromOrganizationInput`       | `RemoveRoleOnRoleSetInput` | same                                        |
| `RemoveRoleOnRoleSetFromVirtualContributorInput` | `RemoveRoleOnRoleSetInput` | same                                        |
| `AssignPlatformRoleInput`                        | `AssignPlatformRoleInput`  | `contributorID` → `actorId`                 |
| `RemovePlatformRoleInput`                        | `RemovePlatformRoleInput`  | `contributorID` → `actorId`                 |
| `RolesUserInput`                                 | `RolesActorInput`          | `userID` → `actorId`                        |
| `RolesOrganizationInput`                         | `RolesActorInput`          | `organizationID` → `actorId`                |
| `RolesVirtualContributorInput`                   | `RolesActorInput`          | `virtualContributorID` → `actorId`          |
| `InviteForEntryRoleOnRoleSetInput`               | same name                  | `invitedContributorIDs` → `invitedActorIds` |
| `CreateConversationInput`                        | same name                  | `userID` → `receiverActorId`                |

### Query/Mutation Changes

| Old                                | New          | Notes                |
| ---------------------------------- | ------------ | -------------------- |
| `rolesUser`                        | `rolesActor` | Returns `ActorRoles` |
| `rolesOrganization`                | `rolesActor` | Returns `ActorRoles` |
| `rolesVirtualContributor`          | `rolesActor` | Returns `ActorRoles` |
| `assignRoleToUser`                 | `assignRole` | Unified input        |
| `assignRoleToOrganization`         | `assignRole` | Unified input        |
| `assignRoleToVirtualContributor`   | `assignRole` | Unified input        |
| `removeRoleFromUser`               | `removeRole` | Unified input        |
| `removeRoleFromOrganization`       | `removeRole` | Unified input        |
| `removeRoleFromVirtualContributor` | `removeRole` | Unified input        |

## Enum Value Mapping

```
RoleSetContributorType  →  ActorType
─────────────────────────────────────
User                    →  User
Organization            →  Organization
Virtual                 →  VirtualContributor
(N/A)                   →  Space         (new)
(N/A)                   →  Account       (new)
```
