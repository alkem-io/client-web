# Data Model: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10
**Updated**: 2026-02-20 (aligned with final server schema on branch `026-actor-transformation-v2`)

## Entity Changes

### Removed Entities

| Entity                   | Replaced By           | Notes                                                                                                                                                                                                                         |
| ------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Agent`                  | Direct credentials    | Credentials move onto the entity itself                                                                                                                                                                                       |
| `AgentType`              | `ActorType`           | Same values, new name                                                                                                                                                                                                         |
| `Contributor` interface  | `ActorFull` interface | Same fields (`id`, `nameID`, `profile`), new name. **Implementation note**: fragments were retargeted to `Actor` (not `ActorFull`) because the server uses `Actor` as the return type for contributor/provider/sender fields. |
| `RoleSetContributorType` | `ActorType`           | `Virtual` → `VirtualContributor` (value changes!)                                                                                                                                                                             |

### New Entities

| Entity      | Fields                                                  | Implementors                                           |
| ----------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `Actor`     | `id`, `type: ActorType`, `profile?: Profile`            | Lightweight return type for fields returning identity  |
| `ActorFull` | `id`, `type`, `nameID`, `profile`, `credentials`        | User, Organization, VirtualContributor, Space, Account |
| `ActorType` | USER, ORGANIZATION, VIRTUAL_CONTRIBUTOR, SPACE, ACCOUNT | Enum (note: VIRTUAL_CONTRIBUTOR, not VIRTUAL)          |

> **Note**: `ContributorRoles` is renamed to `ActorRoles` and `ContributorRolePolicy` is renamed to `ActorRolePolicy`. These are only referenced in generated code, so codegen handles the rename automatically.

### Field Changes on Existing Entities

| Entity                        | Field                           | Before                    | After                        |
| ----------------------------- | ------------------------------- | ------------------------- | ---------------------------- |
| User, Org, VC                 | `agent`                         | `Agent`                   | **removed**                  |
| User, Org, VC, Space, Account | `credentials`                   | via `agent.credentials`   | direct `[Credential!]`       |
| User, Org, VC, Space, Account | `type`                          | N/A                       | `ActorType!` (new)           |
| Invitation                    | `contributorType`               | `RoleSetContributorType!` | **removed**                  |
| Invitation                    | `contributor`                   | `Contributor!`            | `Actor!`                     |
| SpaceAbout                    | `provider`                      | `Contributor`             | `Actor`                      |
| InnovationHub/Pack            | `provider`                      | `Contributor!`            | `Actor!`                     |
| VirtualContributor            | `provider`                      | `Contributor!`            | `Actor!`                     |
| Account                       | `host`                          | `Contributor`             | `Actor`                      |
| Message                       | `sender`                        | `Contributor`             | `Actor`                      |
| Reaction                      | `sender`                        | `User`                    | `User` (unchanged)           |
| InAppNotification             | `triggeredBy`                   | `Contributor`             | `Actor`                      |
| InAppNotification             | `receiver`                      | `Contributor`             | `Actor`                      |
| ActivityLogEntryMemberJoined  | `contributor`                   | `Contributor!`            | `Actor!`                     |
| ActivityLogEntryMemberJoined  | `contributorType` → `actorType` | `RoleSetContributorType!` | `ActorType!` (field RENAMED) |

> **Note**: `CommunityInvitationForRoleResult.contributorID` is renamed to `actorID`. The `contributorType` field on `Invitation` is removed (actor type is inferred from the contributor's intrinsic type).

### Input Type Changes

Per-type role set mutation inputs, invitation inputs, and conversation inputs remain unchanged. Platform role inputs and the invitation result type have field renames:

| Input Type                                       | Status                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `AssignRoleOnRoleSetToUserInput`                 | **REMOVED** — replaced by unified `AssignRoleOnRoleSetInput` with `actorID` (BREAKING) |
| `AssignRoleOnRoleSetToOrganizationInput`         | **REMOVED** — replaced by unified `AssignRoleOnRoleSetInput` with `actorID` (BREAKING) |
| `AssignRoleOnRoleSetToVirtualContributorInput`   | **REMOVED** — replaced by unified `AssignRoleOnRoleSetInput` with `actorID` (BREAKING) |
| `RemoveRoleOnRoleSetFromUserInput`               | **REMOVED** — replaced by unified `RemoveRoleOnRoleSetInput` with `actorID` (BREAKING) |
| `RemoveRoleOnRoleSetFromOrganizationInput`       | **REMOVED** — replaced by unified `RemoveRoleOnRoleSetInput` with `actorID` (BREAKING) |
| `RemoveRoleOnRoleSetFromVirtualContributorInput` | **REMOVED** — replaced by unified `RemoveRoleOnRoleSetInput` with `actorID` (BREAKING) |
| `AssignPlatformRoleInput`                        | **`contributorID` → `actorID`** (BREAKING)                                             |
| `RemovePlatformRoleInput`                        | **`contributorID` → `actorID`** (BREAKING)                                             |
| `RolesUserInput`                                 | **REMOVED** — replaced by unified `RolesActorInput` with `actorID` (BREAKING)          |
| `RolesOrganizationInput`                         | **REMOVED** — replaced by unified `RolesActorInput` with `actorID` (BREAKING)          |
| `RolesVirtualContributorInput`                   | **REMOVED** — replaced by unified `RolesActorInput` with `actorID` (BREAKING)          |
| `InviteForEntryRoleOnRoleSetInput`               | **No change** (`invitedContributorIDs` stays)                                          |
| `CreateConversationInput`                        | **No change** (`userID` stays)                                                         |

### Result/Return Type Changes

| Type                               | Change                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| `CommunityInvitationForRoleResult` | **`contributorID` → `actorID`** (BREAKING)             |
| `ContributorRoles`                 | **Renamed to `ActorRoles`** (generated code only)      |
| `ContributorRolePolicy`            | **Renamed to `ActorRolePolicy`** (generated code only) |

### Query/Mutation Changes

Per-type role queries and mutations remain but their **input types have been unified**. All per-type role mutations now use `AssignRoleOnRoleSetInput`/`RemoveRoleOnRoleSetInput` with `actorID` (replacing the old per-type inputs with `contributorID`/`userID`/etc.). All role queries now use `RolesActorInput` with `actorID`:

| Query/Mutation                     | Status                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `rolesUser`                        | Input changed: `RolesUserInput` → `RolesActorInput` with `actorID` (BREAKING)               |
| `rolesOrganization`                | Input changed: `RolesOrganizationInput` → `RolesActorInput` with `actorID` (BREAKING)       |
| `rolesVirtualContributor`          | Input changed: `RolesVirtualContributorInput` → `RolesActorInput` with `actorID` (BREAKING) |
| `assignRoleToUser`                 | Input changed: per-type input → `AssignRoleOnRoleSetInput` with `actorID` (BREAKING)        |
| `assignRoleToOrganization`         | Input changed: per-type input → `AssignRoleOnRoleSetInput` with `actorID` (BREAKING)        |
| `assignRoleToVirtualContributor`   | Input changed: per-type input → `AssignRoleOnRoleSetInput` with `actorID` (BREAKING)        |
| `removeRoleFromUser`               | Input changed: per-type input → `RemoveRoleOnRoleSetInput` with `actorID` (BREAKING)        |
| `removeRoleFromOrganization`       | Input changed: per-type input → `RemoveRoleOnRoleSetInput` with `actorID` (BREAKING)        |
| `removeRoleFromVirtualContributor` | Input changed: per-type input → `RemoveRoleOnRoleSetInput` with `actorID` (BREAKING)        |
| `assignPlatformRoleToUser`         | Input uses `actorID` instead of `contributorID` (BREAKING)                                  |
| `removePlatformRoleFromUser`       | Input uses `actorID` instead of `contributorID` (BREAKING)                                  |

New queries/mutations added by the server:

| New                         | Notes                                                       |
| --------------------------- | ----------------------------------------------------------- |
| `assignRole`                | Unified role assignment (alternative to per-type mutations) |
| `removeRole`                | Unified role removal (alternative to per-type mutations)    |
| `actor(id: UUID!)`          | Returns lightweight `Actor` (id, type, profile)             |
| `grantCredentialToActor`    | Unified credential grant (admin-only)                       |
| `revokeCredentialFromActor` | Unified credential revoke (admin-only)                      |

## Enum Value Mapping

```
RoleSetContributorType  →  ActorType
─────────────────────────────────────
User                    →  User
Organization            →  Organization
Virtual                 →  VirtualContributor  (VALUE CHANGES!)
(N/A)                   →  Space               (new)
(N/A)                   →  Account             (new)
```

> **Important**: The server uses `VIRTUAL_CONTRIBUTOR` (not `VIRTUAL`). This means both the enum **type name** (`RoleSetContributorType` → `ActorType`) AND the **value** for virtual contributors (`.Virtual` → `.VirtualContributor`) change. All ~26 comparison sites using `.Virtual` must update to `.VirtualContributor`.
