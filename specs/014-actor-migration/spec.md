# Feature Specification: Actor Architecture Migration

**Feature Branch**: `014-actor-migration`
**Created**: 2026-02-10
**Status**: Draft
**Updated**: 2026-02-20 (aligned with final server schema on branch `026-actor-transformation-v2`)
**Input**: Migrate client-web data access layer to accommodate the server's unified Actor model, replacing the legacy Agent and Contributor concepts with Actor/ActorFull.

> **Scope Note (2026-02-20)**: The server unifies the **identity and credential model** (Agent/Contributor → Actor/ActorFull), renames `contributorID` → `actorID` on platform role inputs and invitation results, unifies all per-type role mutation/query input types to use `actorID` (replacing `contributorID`/`userID`/`organizationID`/`virtualContributorID`), and adds unified `assignRole`/`removeRole` mutations (alongside existing per-type mutations). Role queries remain per-type but use unified `RolesActorInput`. Invitation and conversation input field names are **not** renamed. The `ActorType` enum uses `VIRTUAL_CONTRIBUTOR` (not `VIRTUAL`). `Reaction.sender` remains `User` (not `Actor`). `ActivityLogEntryMemberJoined.contributorType` is renamed to `actorType`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Profiles and Credentials Display Correctly (Priority: P1)

As a platform user, when I view any profile page (my own, another user's, an organization's, or a virtual contributor's), all identity information — display name, avatar, description, tags, location, and credentials — continues to display correctly after the server migrates from Agent/Contributor to Actor/ActorFull.

**Why this priority**: Profile and credential display is the most fundamental user-facing feature. Every page on the platform renders contributor identity information. If this breaks, the entire application is visually broken.

**Independent Test**: Navigate to a user profile page, an organization page, and a virtual contributor page. Verify that display name, avatar, description, location, and tags all render. For an admin viewing user credentials, verify the credentials list appears without the intermediary agent layer.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing their own profile, **When** the page loads, **Then** their display name, avatar, credentials, and account information render identically to pre-migration behavior.
2. **Given** a user viewing an organization's profile, **When** the page loads, **Then** the organization's display name, avatar, description, tags, and location render correctly.
3. **Given** a space page displaying its provider, **When** the page loads, **Then** the provider's name, avatar, and profile link display correctly.
4. **Given** an admin viewing account details, **When** the page loads, **Then** the account host identity displays correctly.
5. **Given** a message thread, **When** messages load, **Then** each message's sender name and avatar render correctly.

---

### User Story 2 - Role Assignment and Removal Works for All Actor Types (Priority: P1)

As a space admin or platform admin, I can assign and remove roles for users, organizations, and virtual contributors. The server now provides unified `assignRole`/`removeRole` mutations alongside the existing per-type mutations; the client may adopt either approach. Platform role inputs (`AssignPlatformRoleInput`, `RemovePlatformRoleInput`) now use `actorID` instead of `contributorID`. The enum type used for actor classification changes from `RoleSetContributorType` to `ActorType`.

**Why this priority**: Role management is essential for community governance. Admins must be able to control who has what access. If role assignment breaks, spaces cannot be managed.

**Independent Test**: As a space admin, assign a user to a role and verify they appear. Remove them and verify they disappear. Repeat for an organization and a virtual contributor. As a platform admin, assign and remove a platform-level role.

**Acceptance Scenarios**:

1. **Given** a space admin on the community management page, **When** they assign a user to a role, **Then** the operation succeeds and the user appears in the role's member list.
2. **Given** a space admin managing roles, **When** they remove an organization from a role, **Then** the operation succeeds and the organization disappears from the role's member list.
3. **Given** a space admin, **When** they assign a virtual contributor to a role, **Then** the operation succeeds and the VC appears in the role's member list.
4. **Given** a platform admin on the authorization page, **When** they assign or remove a platform role from a user, **Then** the operation succeeds.

---

### User Story 3 - Invitations Work for All Actor Types (Priority: P1)

As a space admin, I can invite users (by selecting existing contributors or by email) and virtual contributors to join a space. The invitation flow, pending invitation display, and acceptance/rejection all continue working identically.

**Why this priority**: Invitations are the primary mechanism for growing communities. If invitations break, no new members can join spaces.

**Independent Test**: Send an invitation to a user by contributor selection, send one by email, and invite a virtual contributor. Verify all three appear in the pending invitations list. As the invited user, verify the invitation appears on the dashboard.

**Acceptance Scenarios**:

1. **Given** a space admin in the invite dialog, **When** they select contributors and send invitations, **Then** the invitations are created and appear in the pending list.
2. **Given** a user with a pending invitation, **When** they view their dashboard, **Then** the invitation displays with the correct contributor name, avatar, and space information.
3. **Given** a virtual contributor invitation, **When** an admin invites a VC, **Then** the invitation appears on the VC's membership page.
4. **Given** the community management page, **When** an admin views pending invitations, **Then** each invitation correctly identifies whether the invitee is a user, organization, or virtual contributor.

---

### User Story 4 - Membership and Contributions Views Display Correctly (Priority: P2)

As a user or admin, I can view membership information — which spaces a user, organization, or virtual contributor belongs to, and what roles they hold. The system continues to use per-type queries (`rolesUser`, `rolesOrganization`, `rolesVirtualContributor`) — these are **not** unified in the server PR. The enum type changes from `RoleSetContributorType` to `ActorType`.

**Why this priority**: Membership views are read-only and secondary to write operations, but they are essential for users to understand their participation and for admins to audit memberships.

**Independent Test**: Navigate to a user's contributions page, an organization's memberships section, and a VC's membership page. Verify all space memberships, roles, and subspace information display correctly.

**Acceptance Scenarios**:

1. **Given** a user viewing their contributions page, **When** the page loads, **Then** their space memberships with roles and subspace information display correctly.
2. **Given** an organization profile, **When** the memberships section loads, **Then** space memberships with visibility and roles display correctly.
3. **Given** a virtual contributor's membership page, **When** the page loads, **Then** space memberships with subspace levels display correctly.

---

### User Story 5 - Conversations and Messaging Work (Priority: P2)

As a user, I can create new conversations and send messages. Sender identity displays correctly in message threads and reactions. **Note**: The `CreateConversationInput` is **not** changed in the server PR — `userID` remains as-is. The only change is that sender fields return `Actor` instead of `Contributor`.

**Why this priority**: Messaging is important for collaboration but used less frequently than navigation and role management. Failures are contained to the messaging feature.

**Independent Test**: Create a new conversation with another user. Send a message and verify sender information displays. Add a reaction and verify the reactor's identity shows.

**Acceptance Scenarios**:

1. **Given** a user starting a new conversation, **When** they select a recipient and send, **Then** the conversation is created successfully.
2. **Given** a message thread, **When** messages display, **Then** each sender's name and avatar are correct.
3. **Given** a message with reactions, **When** reactions display, **Then** each reactor's identity is correct.

---

### User Story 6 - Notifications and Activity Logs Display Correctly (Priority: P3)

As a user, I receive in-app notifications that show who triggered the action, and I can view activity logs showing community events like members joining. All identity information in these views displays correctly.

**Why this priority**: Notifications and activity logs are informational. Incorrect display is a cosmetic issue but does not block core workflows.

**Independent Test**: Trigger a notification (e.g., get invited to a space) and verify the notification shows the triggering user's name and avatar. View an activity log with member-joined entries and verify contributor information displays.

**Acceptance Scenarios**:

1. **Given** a notification triggered by another user, **When** the notification displays, **Then** the triggering user's name, avatar, and profile link are correct.
2. **Given** a community activity log, **When** member-joined entries display, **Then** the joining member's name, avatar, and type are correct.

---

### Edge Cases

- **EC-001**: When a field returns a lightweight Actor (id and type only, no profile), the UI MUST render gracefully — showing a fallback avatar and "Unknown" or empty display name rather than crashing or showing broken layout.
- **EC-002**: When inline type narrowing (e.g., `... on User { firstName lastName }`) encounters a non-User actor type, the system MUST NOT error. The narrowed fields are simply absent, and the UI MUST render the base Actor fields (displayName from profile) as fallback.
- **EC-003**: When the client's local Apollo cache contains stale entries referencing the old `Contributor` type name, the system MUST function correctly after a page refresh. No manual cache migration is required — codegen regenerates all type names and Apollo's normalized cache handles the transition.
- **EC-004**: The enum rename from `RoleSetContributorType` to `ActorType` changes the type name AND one value: `Virtual` → `VirtualContributor` (schema value `VIRTUAL_CONTRIBUTOR`). The values `User` and `Organization` remain the same. All ~26 comparison sites using `.Virtual` MUST update to `.VirtualContributor`. Additionally, `ActivityLogEntryMemberJoined.contributorType` is renamed to `actorType` (field name change, not just type change).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST retrieve user credentials directly from the entity rather than through an intermediary agent object.
- **FR-002**: All data fragments that reference the Contributor concept MUST be updated to reference the ActorFull concept while preserving the same field selections (display name, avatar, description, tags, location).
- **FR-003**: All references to the contributor-type enumeration (User/Organization/Virtual) MUST be updated to use the actor-type enumeration (User/Organization/VirtualContributor), including all comparison logic and filtering. **Note**: The server uses `VIRTUAL_CONTRIBUTOR` (not `VIRTUAL`), so all `.Virtual` comparisons MUST change to `.VirtualContributor`.
- **FR-004**: The contributor-type field MUST be removed from invitation data; actor type discrimination MUST rely on the entity's intrinsic type identity or the type field on ActorFull.
- **FR-005**: The server provides unified `assignRole`/`removeRole` mutations alongside the existing per-type mutations. The client keeps per-type mutations for now (unified adoption deferred to follow-up). **However**, the per-type mutations now use unified input types (`AssignRoleOnRoleSetInput`/`RemoveRoleOnRoleSetInput`) with `actorID` instead of the old per-type inputs with `contributorID`. The client MUST update all per-type role mutation GraphQL documents and their TypeScript consumers to use `actorID`.
- **FR-006**: The platform role inputs (`AssignPlatformRoleInput`, `RemovePlatformRoleInput`) MUST use `actorID` instead of the removed `contributorID` field. The GraphQL documents and variable names MUST be updated accordingly.
- **FR-005a**: The per-type role queries (`rolesUser`, `rolesOrganization`, `rolesVirtualContributor`) remain as separate queries but now use a unified `RolesActorInput` with `actorID` instead of separate per-type inputs (`RolesUserInput`/`RolesOrganizationInput`/`RolesVirtualContributorInput` with `userID`/`organizationID`/`virtualContributorID`). All role query GraphQL documents and their TypeScript consumers MUST be updated to use `actorID`.
- **~~FR-007~~**: ~~The three separate membership queries MUST be replaced with a single unified query.~~ **REMOVED** — Server PR does not unify role queries; `rolesUser`, `rolesOrganization`, `rolesVirtualContributor` all remain (but their input type changed — see FR-005a).
- **~~FR-008~~**: ~~The invitation operation MUST use the renamed actor identifiers field.~~ **REMOVED** — Server PR keeps `invitedContributorIDs`.
- **FR-009**: All fields that previously returned Contributor-typed data (provider, host, sender, triggeredBy, contributor on notifications and activity log entries) MUST work correctly with the Actor return type.
- **~~FR-010~~**: ~~The create-conversation operation MUST use the receiver actor identifier field.~~ **REMOVED** — Server PR keeps `CreateConversationInput.userID`.
- **FR-011**: The `CommunityInvitationForRoleResult` type now uses `actorID` instead of `contributorID`. Any code consuming this result type MUST use the renamed field. Note: `contributorType` is removed from `Invitation` (see FR-004) but `CommunityInvitationForRoleResult` retains type information through the actor's intrinsic type.
- **FR-012**: After all data layer changes, the type generation process MUST be run to regenerate all derived types and operation hooks, and all generated outputs MUST be committed.
- **FR-013**: All existing automated tests MUST pass after migration, with test fixtures updated to reflect the new data shapes.
- **FR-014**: No user-visible behavior MUST change as a result of this migration — all changes are confined to the data access layer.

### Key Entities

- **Actor**: The lightweight base identity for all entities in the system. Carries an identifier, a type classification, and an optional profile. Replaces both the Agent concept (which held credentials) and serves as the return type for fields that previously returned Contributor. **Implementation note**: Fragments were retargeted to `on Actor` (not `on ActorFull` as originally planned) because the server uses `Actor` as the return type for contributor/provider/sender fields.
- **ActorFull**: The rich identity interface implemented by all first-class entities (User, Organization, VirtualContributor, Space, Account). Provides identifier, type, profile, credentials, and name identifier. Replaces the Contributor interface. **Implementation note**: Not used as fragment target in the current implementation — `Actor` is used instead.
- **ActorType**: The classification of an actor's kind (User, Organization, VirtualContributor, Space, Account). Replaces both the agent-type and contributor-type enumerations. **Note**: The schema value for virtual contributors is `VIRTUAL_CONTRIBUTOR`, which codegen renders as `ActorType.VirtualContributor` in TypeScript.

### Non-Functional Requirements

- **NFR-001**: The migration MUST NOT degrade page load times or GraphQL query response times. No additional network requests or cache invalidation overhead may be introduced. **Implementation note (2026-02-24)**: The current implementation introduces N+1 `ActorDetails` queries in two hooks to fetch type-specific fields. This is a known deviation — follow-up work will inline these fields into parent queries to restore compliance.
- **NFR-002**: The migration MUST NOT introduce any new TypeScript compilation errors or ESLint warnings beyond pre-migration baseline.
- **NFR-003**: All changes MUST be confined to the data access layer (GraphQL documents, generated types, domain hooks/models, and enum references). No user-facing UI layout, styling, or interaction behavior may change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All profile pages (user, organization, virtual contributor) display identity information identically to pre-migration behavior — zero visual regressions.
- **SC-002**: Role assignment and removal succeeds for all three actor types (user, organization, virtual contributor) in both space and platform contexts.
- **SC-003**: Invitations can be sent to users (by selection and by email) and virtual contributors, and appear correctly in all pending invitation views.
- **SC-004**: All membership/contributions views display correct space memberships, roles, and subspace data for all actor types.
- **SC-005**: All automated tests pass (current baseline: 19 files, 247 tests) with zero regressions.
- **SC-006**: The application builds and passes linting with zero new errors.
- **SC-007**: Zero references to the removed concepts (Agent, Contributor as an interface, `RoleSetContributorType` enumeration, old per-type input types like `AssignRoleOnRoleSetToUserInput`, `RolesUserInput`, etc.) remain in non-generated source files. Note: `invitedContributorIDs`, `rolesUser`, `rolesOrganization`, `rolesVirtualContributor`, and per-type role mutations remain valid and are **not** removed. However, all `contributorID`/`userID`/`organizationID`/`virtualContributorID` fields on role mutation and query inputs are renamed to `actorID` and must be updated.

## Assumptions

- The new server schema is available and running on the corresponding server branch for type generation to succeed.
- The ActorFull interface exposes the same profile sub-fields (displayName, avatar/visual, url, description, tagsets, location) that Contributor previously exposed, so field selections remain valid after re-targeting.
- Inline type narrowing (e.g., accessing User-specific fields like firstName/lastName on an Actor-typed field) continues to work because User still implements the ActorFull interface.
- The ActorType enum values are USER, ORGANIZATION, VIRTUAL_CONTRIBUTOR, SPACE, and ACCOUNT. The value for virtual contributors changed from `VIRTUAL` (in `RoleSetContributorType`) to `VIRTUAL_CONTRIBUTOR` (in `ActorType`), requiring all `.Virtual` comparisons to change to `.VirtualContributor`.
- The local cache will handle the type rename naturally through regenerated type names; no manual cache migration is needed.
- The profile field on User/Organization/VirtualContributor remains effectively always populated even if the schema declares it nullable at the interface level.
