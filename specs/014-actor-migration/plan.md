# Implementation Plan: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-actor-migration/spec.md`

## Summary

Migrate the client-web GraphQL layer and TypeScript code from the legacy Agent/Contributor model to the server's unified Actor/ActorFull model. This is a pure data-access-layer migration with zero user-facing behavior changes. The migration touches ~20 GraphQL documents and ~45 TypeScript files, unifies 6 role mutations into 2, consolidates 3 roles queries into 1, and replaces the `RoleSetContributorType` enum with `ActorType` across the codebase.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Apollo Client, MUI, react-i18next, GraphQL codegen
**Storage**: Apollo Client normalized cache (in-memory)
**Testing**: Vitest with jsdom (19 files, 247 tests)
**Target Platform**: Web (SPA served by Vite, localhost:3001)
**Project Type**: Web application (single frontend SPA)
**Performance Goals**: No regression — migration must not degrade page load or query response times
**Constraints**: Server must be running on actor-migration branch for codegen. No user-facing behavior changes.
**Scale/Scope**: ~20 GraphQL documents, ~45 TypeScript files, ~8 mutations, ~3 queries, ~40 enum reference sites

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
| Architecture Standard 6 (SOLID/DRY)          | PASS   | Mutation unification reduces duplication (6→2 mutations, simplifies hook).                                    |
| Engineering Workflow 2 (codegen in PR)       | PASS   | Codegen is an explicit step in the migration.                                                                 |
| Engineering Workflow 3 (domain-first)        | PASS   | Migration follows domain-first: update GraphQL → update domain hooks → verify UI.                             |
| Engineering Workflow 5 (Root cause analysis) | PASS   | This is a planned schema migration, not a workaround.                                                         |

### Post-Design Check

| Principle                      | Status | Notes                                                                                                       |
| ------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------- |
| III. GraphQL Contract Fidelity | PASS   | Contracts documented in `contracts/graphql-changes.md`. All mutations/queries align with new server schema. |
| Architecture Standard 6d (ISP) | PASS   | Mutation unification reduces the hook's internal complexity without changing its public interface.          |
| Architecture Standard 6f (DRY) | PASS   | The `addContributorType()` helper pattern is reused (updated to `ActorType`) rather than duplicated.        |

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
├── community/
│   └── contributor/graphql/
│       └── contributorDetails.graphql          # Fragment retarget: Contributor → ActorFull
├── domain/
│   ├── access/
│   │   ├── ApplicationsAndInvitations/
│   │   │   ├── InvitationsMutations.graphql    # invitedContributorIDs → invitedActorIds
│   │   │   ├── RoleSetApplicationsInvitations.graphql  # Fragment retarget + remove contributorType
│   │   │   └── useRoleSetApplicationsAndInvitations.ts # Enum + field renames
│   │   ├── RoleSetManager/
│   │   │   ├── RolesAssignment/
│   │   │   │   ├── AssignRole.graphql          # 3 mutations → 1
│   │   │   │   ├── RemoveRole.graphql          # 3 mutations → 1
│   │   │   │   ├── AssignPlatformRole.graphql  # contributorID → actorId
│   │   │   │   ├── RemovePlatformRole.graphql  # contributorID → actorId
│   │   │   │   └── useRoleSetManagerRolesAssignment.ts  # Rewrite to use unified mutations
│   │   │   └── useRoleSetManager.ts            # RoleSetContributorType → ActorType
│   │   └── model/
│   │       ├── InvitationModel.ts              # Remove contributorType, update enum
│   │       ├── ApplicationModel.ts             # Remove contributorType, update enum
│   │       ├── InvitationDataModel.ts          # invitedContributorIds → invitedActorIds
│   │       └── MembershipTableItem.ts          # RoleSetContributorType → ActorType
│   ├── community/
│   │   ├── contributor/
│   │   │   ├── ContributorTooltip/             # RoleSetContributorType → ActorType
│   │   │   ├── ContributorCardSquare/          # RoleSetContributorType → ActorType
│   │   │   └── RoleSetContributorsBlockWide/   # RoleSetContributorType → ActorType (4 files)
│   │   ├── inviteContributors/                 # RoleSetContributorType → ActorType (5 files)
│   │   ├── invitations/                        # RoleSetContributorType → ActorType (2 files)
│   │   ├── pendingMembership/                  # RoleSetContributorType → ActorType
│   │   ├── user/
│   │   │   ├── graphql/queries/UserAccount.graphql  # Remove agent field
│   │   │   ├── models/UserModel.ts                  # Remove agent property
│   │   │   ├── models/PendingInvitationItem.ts      # Update enum
│   │   │   ├── userContributions/UserContributions.graphql  # rolesUser → rolesActor
│   │   │   └── ContributorsView.tsx                 # RoleSetContributorType → ActorType
│   │   ├── organization/useOrganization/
│   │   │   ├── useOrganizationQueries.graphql       # rolesOrganization → rolesActor
│   │   │   └── useOrganization.ts                   # RoleSetContributorType → ActorType
│   │   ├── virtualContributor/vcMembershipPage/
│   │   │   └── VCMembershipPage.graphql             # rolesVirtualContributor → rolesActor
│   │   └── userCurrent/CurrentUserProvider/
│   │       └── CurrentUserFull.graphql              # Remove contributorType from InvitationData
│   ├── collaboration/activity/ActivityLog/
│   │   └── activityLogFragments.graphql             # No change needed (Actor compatible)
│   ├── communication/room/Comments/
│   │   ├── CommentsMessageDetailsFragment.graphql   # No change needed (uses ContributorDetails fragment)
│   │   └── AddReactionMutation.graphql              # Add ... on User wrapper for firstName/lastName
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
│   ├── platformAdmin/authorization/
│   │   └── AdminAuthorizationPage.tsx               # RoleSetContributorType → ActorType
│   └── shared/components/ActivityDescription/
│       └── DetailedActivityDescription.tsx          # RoleSetContributorType → ActorType
├── main/
│   ├── userMessaging/
│   │   ├── graphql/CreateConversation.graphql       # No .graphql change
│   │   └── NewMessageDialog.tsx                     # userID → receiverActorId
│   ├── topLevelPages/myDashboard/InvitationsBlock/
│   │   └── PendingInvitations.graphql               # Remove contributorType
│   └── inAppNotifications/
│       ├── graphql/InAppNotificationsFragments.graphql  # No change needed (Actor compatible)
│       └── model/InAppNotificationPayloadModel.tsx  # RoleSetContributorType → ActorType
```

**Structure Decision**: No new directories. All changes are edits to existing files within the established directory structure. The mutation unification reduces file count (6 mutations → 2 in the `.graphql` files).

## Complexity Tracking

No constitution violations. The mutation unification (6→2) and query unification (3→1) reduce complexity rather than adding it.
