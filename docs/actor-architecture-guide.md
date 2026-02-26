# Architecture Guide: Actor Model (post-014 migration)

This codebase has migrated from the legacy Agent/Contributor identity model to a unified Actor model. All new feature work MUST follow the new architecture.

## Core Concepts

- **Actor** — Lightweight identity type returned by most GraphQL fields (provider, host, sender, contributor, triggeredBy). Fields: `id`, `type: ActorType`, `profile?: Profile`. This is the type you'll encounter on query results.
- **ActorFull** — Rich interface implemented by User, Organization, VirtualContributor, Space, Account. Adds `nameID` and supports inline type narrowing (`... on User { email }`). Use this when you need type-specific fields.
- **ActorType** — Enum: `USER`, `ORGANIZATION`, `VIRTUAL_CONTRIBUTOR`, `SPACE`, `ACCOUNT`. Always use `ActorType.VirtualContributor` (never `.Virtual`). Replaces the old `RoleSetContributorType`.

## Patterns to Follow

### 1. Type Discrimination

Use `actor.type` (ActorType enum) or `__typename` for type checks. Never rely on a separate `contributorType` field — it was removed from Invitation and is computed from `contributor.type` where still needed in models.

### 2. GraphQL Fragments Target `Actor`

When writing fragments for identity fields (displayName, avatar, profile link), target `on Actor`. The server returns `Actor` for provider/sender/contributor/host fields.

### 3. Inline Type Narrowing for Type-Specific Fields

When you need User-only fields (email, firstName) or Org-only fields (contactEmail, domain), use inline fragments:

```graphql
query SomeQuery {
  someField {
    id
    type
    profile {
      displayName
      url
    }
    ... on User {
      email
      firstName
      lastName
    }
    ... on Organization {
      contactEmail
    }
  }
}
```

Prefer inlining these in the parent query over separate N+1 ActorDetails calls.

### 4. Role Mutations Use `actorID`

All role assignment/removal mutations (per-type and platform) take `actorID` in their input, not `contributorID`/`userID`/`organizationID`. Variable naming: use `actorId` in TypeScript.

### 5. Role Queries Use `actorID`

`rolesUser`, `rolesOrganization`, `rolesVirtualContributor` all take `RolesActorInput` with `actorID`. Per-type queries still exist (not unified yet).

### 6. Unified Mutations Available but Not Yet Adopted

The server provides `assignRole`/`removeRole` as unified alternatives to the 6 per-type mutations. New code SHOULD prefer the unified mutations when practical. If using per-type mutations, use `actorID` in the input.

### 7. Unchanged Input Fields

- `invitedContributorIDs` is still the field name (not renamed)
- `CreateConversationInput.userID` also unchanged
- `Reaction.sender` is still `User` — no need for `... on User` wrapping on reaction sender fields

## What NOT to Do

- Do NOT use `RoleSetContributorType` — it's been replaced by `ActorType`
- Do NOT use `.Virtual` enum value — use `.VirtualContributor`
- Do NOT reference `agent` on entities — the agent layer is removed
- Do NOT add a `contributorType` field to new GraphQL queries — derive type from `actor.type` or `__typename`
- Do NOT create new N+1 ActorDetails calls — inline type-specific fields in the parent query instead
- Do NOT use old per-type input types (`AssignRoleOnRoleSetToUserInput`, `RolesUserInput`, etc.) — they no longer exist

## Key Files & Patterns to Reference

- Fragment example: `src/domain/community/contributor/graphql/contributorDetails.graphql` (targets `on Actor`)
- Type-narrowing query: `src/domain/community/contributor/graphql/ActorDetails.graphql` (shows `... on User/Org/VC` pattern)
- Role mutation pattern: `src/domain/access/RoleSetManager/RolesAssignment/AssignRole.graphql` (uses `actorID`)
- Invitation model pattern: `src/domain/access/model/InvitationModel.ts` (derives `contributorType` from `contributor.type`)
- Enum usage: `src/domain/access/RoleSetManager/useRoleSetManager.ts` (uses `ActorType`)

## Deferred Work (contribute to these when touching nearby code)

- Adopt unified `assignRole`/`removeRole` mutations (replace 6 per-type → 2 unified)
- Inline type-specific fields into parent queries to eliminate N+1 `ActorDetails` calls
- Remove `agent?: {}` remnant from `UserModel.ts`
- Minimize actor data fetched per context (only request fields actually rendered)

## Spec Reference

Full migration spec: `specs/014-actor-migration/` (spec.md, data-model.md, contracts/graphql-changes.md, quickstart.md)
