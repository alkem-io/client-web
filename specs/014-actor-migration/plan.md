# Implementation Plan: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Updated**: 2026-02-20 (aligned with final server schema on branch `026-actor-transformation-v2`)
**Input**: Feature specification from `/specs/014-actor-migration/spec.md`

## Summary

Migrate the client-web GraphQL layer and TypeScript code from the legacy Agent/Contributor model to the server's unified Actor/ActorFull model. This is a pure data-access-layer migration with zero user-facing behavior changes. The migration touches ~20 GraphQL documents and ~48 TypeScript files, retargets fragments from `Contributor` to `ActorFull`, removes Agent indirection for credentials, removes `contributorType` from invitations, renames `contributorID`/`userID`/`organizationID`/`virtualContributorID` → `actorID` on all role mutation inputs, role query inputs, and platform role inputs, and replaces the `RoleSetContributorType` enum with `ActorType` (including `.Virtual` → `.VirtualContributor` value change) across the codebase.

> **Scope note (2026-02-20)**: Role queries (3 per-type) and role mutations (6 per-type) are **not** unified into single operations — but their **input types are unified**: all per-type mutations now use `AssignRoleOnRoleSetInput`/`RemoveRoleOnRoleSetInput` with `actorID` (replacing old per-type inputs with `contributorID`), and all role queries use `RolesActorInput` with `actorID` (replacing `RolesUserInput`/`RolesOrganizationInput`/`RolesVirtualContributorInput`). Platform role inputs rename `contributorID` → `actorID`. Invitation and conversation input field names are **not** renamed. `Reaction.sender` remains `User` (not `Actor`). `ActivityLogEntryMemberJoined.contributorType` is renamed to `actorType`. The `ActorType` enum uses `VIRTUAL_CONTRIBUTOR` (not `VIRTUAL`).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Apollo Client, MUI, react-i18next, GraphQL codegen
**Storage**: Apollo Client normalized cache (in-memory)
**Testing**: Vitest with jsdom (19 files, 247 tests)
**Target Platform**: Web (SPA served by Vite, localhost:3001)
**Project Type**: Web application (single frontend SPA)
**Performance Goals**: No regression — migration must not degrade page load or query response times
**Constraints**: Server must be running on actor-migration branch for codegen. No user-facing behavior changes.
**Scale/Scope**: ~20 GraphQL documents, ~48 TypeScript files, ~40 enum reference sites (including ~26 `.Virtual` → `.VirtualContributor` value changes), ~7 role query/mutation GQL variable renames

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Check

| Principle                                    | Status | Notes                                                                                                         |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries         | PASS   | Changes are confined to domain hooks, models, and GraphQL documents. No business logic moves into components. |
| II. React 19 Concurrent UX Discipline        | PASS   | No rendering changes. Migration is purely at the data access layer.                                           |
| III. GraphQL Contract Fidelity               | PASS   | All changes require `pnpm codegen` with schema diff. Generated hooks remain the only data access mechanism.   |
| IV. State & Side-Effect Isolation            | PASS   | Apollo cache patterns unchanged. No new side effects introduced.                                              |
| V. Experience Quality & Safeguards           | PASS   | Zero visual changes. Existing tests must pass.                                                                |
| Architecture Standard 5 (No barrel exports)  | PASS   | No barrel exports introduced.                                                                                 |
| Architecture Standard 6 (SOLID/DRY)          | PASS   | Enum rename is mechanical. No new abstractions needed.                                                        |
| Engineering Workflow 2 (codegen in PR)       | PASS   | Codegen is an explicit step in the migration.                                                                 |
| Engineering Workflow 3 (domain-first)        | PASS   | Migration follows domain-first: update GraphQL → update domain hooks → verify UI.                             |
| Engineering Workflow 5 (Root cause analysis) | PASS   | This is a planned schema migration, not a workaround.                                                         |

### Post-Design Check

| Principle                      | Status | Notes                                                                                                |
| ------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| III. GraphQL Contract Fidelity | PASS   | Contracts documented in `contracts/graphql-changes.md`. All changes align with new server schema.    |
| Architecture Standard 6f (DRY) | PASS   | The `addContributorType()` helper pattern is reused (updated to `ActorType`) rather than duplicated. |

## Project Structure

### Documentation (this feature)

```text
specs/014-actor-migration/
├── plan.md                          # This file
├── spec.md                          # Feature specification
├── research.md                      # Phase 0: research findings
├── data-model.md                    # Phase 1: entity/field change catalog
├── quickstart.md                    # Phase 1: migration execution guide
├── contracts/
│   └── graphql-changes.md           # Phase 1: every .graphql file diff
├── checklists/
│   └── requirements.md              # Spec quality checklist
└── tasks.md                         # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/generated/            # Regenerated by codegen (graphql-schema.ts, apollo-hooks.ts)
│   └── ui/
│       ├── authorship/Authorship.tsx           # RoleSetContributorType → ActorType
│       └── card/CardHeader.tsx                 # RoleSetContributorType → ActorType
├── domain/
│   ├── access/
│   │   ├── ApplicationsAndInvitations/
│   │   │   ├── RoleSetApplicationsInvitations.graphql  # Fragment retarget + remove contributorType
│   │   │   └── useRoleSetApplicationsAndInvitations.ts # Enum type rename + .Virtual → .VirtualContributor
│   │   ├── RoleSetManager/
│   │   │   ├── useRoleSetManager.ts            # RoleSetContributorType → ActorType + .Virtual → .VirtualContributor
│   │   │   └── RolesAssignment/
│   │   │       ├── AssignRole.graphql          # contributorID → actorID on all 3 mutations
│   │   │       ├── RemoveRole.graphql          # contributorID → actorID on all 3 mutations
│   │   │       ├── AssignPlatformRole.graphql  # contributorID → actorID
│   │   │       ├── RemovePlatformRole.graphql  # contributorID → actorID
│   │   │       └── useRoleSetManagerRolesAssignment.ts  # Variable rename contributorId → actorId (all mutations)
│   │   └── model/
│   │       ├── InvitationModel.ts              # Remove contributorType, update enum
│   │       ├── ApplicationModel.ts             # Remove contributorType, update enum
│   │       └── MembershipTableItem.ts          # RoleSetContributorType → ActorType
│   ├── community/
│   │   ├── contributor/
│   │   │   ├── graphql/ActorDetails.graphql         # NEW: actor(id) query with inline type narrowing (not in original spec)
│   │   │   ├── graphql/contributorDetails.graphql  # Fragment retarget: Contributor → Actor
│   │   │   ├── ContributorTooltip/             # RoleSetContributorType → ActorType
│   │   │   ├── ContributorCardSquare/          # RoleSetContributorType → ActorType
│   │   │   └── RoleSetContributorsBlockWide/   # RoleSetContributorType → ActorType (4 files)
│   │   ├── inviteContributors/                 # RoleSetContributorType → ActorType (5 files)
│   │   ├── invitations/                        # RoleSetContributorType → ActorType (3 files)
│   │   ├── pendingMembership/                  # RoleSetContributorType → ActorType
│   │   ├── user/
│   │   │   ├── graphql/queries/UserAccount.graphql  # Remove agent field
│   │   │   ├── models/UserModel.ts                  # Remove agent property
│   │   │   ├── models/PendingInvitationItem.ts      # Update enum
│   │   │   ├── userContributions/
│   │   │   │   ├── UserContributions.graphql         # userID → actorID in rolesUser input
│   │   │   │   ├── UserOrganizationIds.graphql       # userID → actorID in rolesUser input
│   │   │   │   └── useUserContributions.ts           # Variable rename userId → actorId
│   │   │   ├── userAdmin/tabs/UserAdminMembershipPage.tsx  # RoleSetContributorType → ActorType
│   │   │   └── ContributorsView.tsx                 # RoleSetContributorType → ActorType
│   │   ├── organization/
│   │   │   └── useOrganization/
│   │   │       ├── useOrganizationQueries.graphql    # organizationID → actorID in rolesOrganization input
│   │   │       └── useOrganization.ts                # Variable rename organizationId → actorId + enum
│   │   ├── virtualContributor/vcMembershipPage/
│   │   │   ├── VCMembershipPage.graphql             # virtualContributorID → actorID in rolesVirtualContributor input
│   │   │   └── VCMembershipPage.tsx                 # RoleSetContributorType → ActorType + variable rename
│   │   └── userCurrent/CurrentUserProvider/
│   │       └── CurrentUserFull.graphql              # Remove contributorType from InvitationData
│   ├── collaboration/
│   │   ├── activity/ActivityLog/
│   │   │   └── activityLogFragments.graphql             # No change needed (Actor compatible)
│   │   └── calloutContributions/calloutContributionPreview/
│   │       └── CalloutContributionPreview.tsx            # RoleSetContributorType → ActorType
│   ├── communication/room/Comments/
│   │   └── CommentsMessageDetailsFragment.graphql   # No change needed (uses ContributorDetails fragment)
│   │   # Note: AddReactionMutation.graphql needs NO change — Reaction.sender is still User
│   ├── InnovationPack/admin/
│   │   └── InnovationPacksMutations.graphql         # Fragment retarget: Contributor → ActorFull
│   ├── space/
│   │   ├── about/graphql/fragments/spaceAboutDetails.graphql  # No change (provider fields compatible)
│   │   ├── components/SpaceWelcomeBlock.tsx          # RoleSetContributorType → ActorType
│   │   ├── components/ContributorsToggleDialog.tsx   # RoleSetContributorType → ActorType
│   │   ├── components/cards/components/SpaceLeads.tsx # RoleSetContributorType → ActorType
│   │   └── models/SpaceHostedItem.model.ts          # RoleSetContributorType → ActorType
│   ├── spaceAdmin/SpaceAdminCommunity/
│   │   ├── SpaceAdminCommunityPage.tsx              # RoleSetContributorType → ActorType
│   │   ├── hooks/useCommunityAdmin.ts               # RoleSetContributorType → ActorType
│   │   └── components/
│   │       ├── CommunityInvitationDialog/CommunityInvitation.graphql  # Remove contributorType
│   │       └── CommunityMemberships.tsx             # RoleSetContributorType → ActorType
│   ├── account/queries/
│   │   └── AccountInformation.graphql               # No change (host { id } compatible)
│   ├── platformAdmin/management/authorization/
│   │   └── AdminAuthorizationPage.tsx               # RoleSetContributorType → ActorType
│   └── shared/components/ActivityDescription/
│       └── DetailedActivityDescription.tsx          # RoleSetContributorType → ActorType
├── main/
│   ├── search/
│   │   └── SearchQueries.graphql                     # userID → actorID in rolesUser input
│   ├── topLevelPages/myDashboard/
│   │   ├── InvitationsBlock/
│   │   │   └── PendingInvitations.graphql            # Remove contributorType
│   │   └── newVirtualContributorWizard/
│   │       └── useVirtualContributorWizard.tsx        # contributorId → actorId in assignRoleToVC
│   └── inAppNotifications/
│       ├── graphql/InAppNotificationsFragments.graphql  # No change needed (Actor compatible)
│       └── model/InAppNotificationPayloadModel.tsx  # RoleSetContributorType → ActorType
```

**Structure Decision**: No new directories. All changes are edits to existing files within the established directory structure. ~~No mutation/query files are added or removed.~~ **Implementation note (2026-02-24)**: One new file was added: `src/domain/community/contributor/graphql/ActorDetails.graphql` — a query using the server's `actor(id)` root query with inline type narrowing to fetch type-specific fields.

## Complexity Tracking

No constitution violations. The migration scope includes: enum rename (type AND value for `.Virtual` → `.VirtualContributor`), fragment retarget (to `Actor`, not `ActorFull`), agent removal, `contributorType` removal, per-type role mutation input renames (`contributorID` → `actorID`), per-type role query input renames (`userID`/`organizationID`/`virtualContributorID` → `actorID`), platform role input field rename (`contributorID` → `actorID`), and `ActivityLogEntryMemberJoined.contributorType` field rename to `actorType`. Unified role mutations are available but adoption is deferred. `Reaction.sender` remains `User` (no change needed).

**Implementation deviations (2026-02-24)**:

- Fragments target `on Actor` instead of `on ActorFull` — server uses `Actor` as return type
- New `ActorDetails.graphql` query added for type-specific field enrichment (N+1 pattern, known NFR-001 deviation)
- `addContributorType()` renamed to `getContributorType()`
- `contributorType` retained as derived field in models (not fully removed)
- `UserModel.ts` still has `agent?: {}` (empty optional, not fully cleaned up)
