# Quickstart: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10
**Updated**: 2026-02-24 (aligned with actual implementation state)

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- Server running on the actor-migration branch at `localhost:4000/graphql` (for codegen)
- Backend accessible at `localhost:3000` (for dev server)

## Migration Execution Order

### Step 1: Update GraphQL Documents

Edit the `.graphql` files in the order specified in `contracts/graphql-changes.md`. Work in this sequence to minimize intermediate breakage:

1. **Fragments first** — retarget `on Contributor` → `on Actor` (3 files). Note: the server uses `Actor` (not `ActorFull`) as the target type for these fragments.
2. **Field removals** — remove `agent` field from `UserAccount.graphql`, remove `contributorType` from 4 invitation `.graphql` files
3. **Role mutation/query input renames** — rename `contributorID`/`userID`/`organizationID`/`virtualContributorID` → `actorID` in all role mutation and query `.graphql` files (see `contracts/graphql-changes.md` sections 5–7)

> **Note (2026-02-19)**: Mutation unification, query unification, invitation input renames, and conversation input renames are **not** in scope — the server PR does not make these API changes.
>
> **Note**: `Reaction.sender` remains `User` (not `Actor`). No `... on User` wrapper needed in `AddReactionMutation.graphql`.

### Step 2: Run Codegen

```bash
pnpm codegen
```

This regenerates `src/core/apollo/generated/graphql-schema.ts` and `src/core/apollo/generated/apollo-hooks.ts` against the new server schema.

### Step 3: Fix TypeScript Errors

After codegen, the compiler will flag all breakage points. Fix in this order:

1. **RoleSetContributorType → ActorType** — bulk find-and-replace across ~43 files. The enum **value** for virtual contributors changes: `.Virtual` → `.VirtualContributor` (schema: `VIRTUAL_CONTRIBUTOR`). `User` and `Organization` values stay the same.
2. **Invitation models** — `contributorType` is retained as a **derived field** in `InvitationModel.ts` and `ApplicationModel.ts` (type changed to `ActorType`). Its value is now computed from `contributor.type` instead of being a standalone GraphQL field.
3. **Agent removal** — remove `agent` from `UserModel.ts` (currently left as empty `agent?: {}`; should be fully removed in follow-up), update data access in `UserAdminAccountPage.tsx` and `UserProfilePage.tsx`.
4. **Helper functions** — `addContributorType()` was renamed to `getContributorType()` in `useRoleSetApplicationsAndInvitations.ts`. Returns `ActorType` with a fallback to `ActorType.User`.
5. **Role mutation/query variables** — rename `contributorId`/`userId`/`organizationId`/`virtualContributorId` → `actorId` in all role mutation/query hook consumers.

### Step 4: Verify

```bash
pnpm lint          # Type checking + linting
pnpm vitest run    # Run tests
pnpm build         # Production build
```

## Implementation Notes (deviations from original spec)

### ActorDetails query (new, not in original spec)

A new `ActorDetails.graphql` query was added at `src/domain/community/contributor/graphql/ActorDetails.graphql`. It uses the server's `actor(id)` root query with inline type narrowing (`... on User`, `... on Organization`, `... on VirtualContributor`) to fetch type-specific fields (email, firstName, lastName, contactEmail, etc.).

This query is consumed via `useActorDetailsLazyQuery()` in two hooks:

- `useRoleSetApplicationsAndInvitations.ts` — enriches application/invitation contributors with type-specific fields
- `useActivityOnCollaboration.ts` — enriches activity log contributors with type-specific fields

**Known deviation (NFR-001)**: This introduces N+1 additional network requests (one per unique contributor). This is a pragmatic trade-off for the initial migration — the existing queries return `Actor` without type-specific fields, and adding inline fragments to every existing query was deemed too invasive for this PR. **Follow-up work should inline these type-specific fields into the parent queries to eliminate the extra requests.**

### Fragment target type

Fragments were retargeted to `on Actor` (not `on ActorFull` as originally planned). The server schema uses `Actor` as the return type for contributor/provider/sender fields.

## Key Gotchas

- The enum **type name** changes (`RoleSetContributorType` → `ActorType`) AND the **value** for virtual contributors changes (`.Virtual` → `.VirtualContributor`). All ~26 `.Virtual` comparison sites must update.
- The `addContributorType()` helper was renamed to `getContributorType()` — it returns `ActorType` with a fallback to `ActorType.User` when type is undefined.
- `Reaction.sender` remains `User` — no `... on User` wrapper needed for `AddReactionMutation.graphql`.
- Platform role inputs (`AssignPlatformRoleInput`, `RemovePlatformRoleInput`) rename `contributorID` → `actorID`. Update GraphQL documents and variable names.
- Per-type role mutations, role queries, invitation input names (`invitedContributorIDs`), and conversation input names (`userID`) are **unchanged** — do not modify these.
- The `contributorType` removal from Invitation means code that checks `invitation.contributorType` must derive the type from `contributor.type` instead. The internal models retain `contributorType` as a computed field for backward compatibility.
- `UserModel.ts` still has `agent?: {}` — should be fully removed in follow-up.

## Follow-up Work (next PRs)

- Remove `agent?: {}` from `UserModel.ts`
- Inline type-specific fields into parent queries to eliminate `ActorDetails` N+1 queries (NFR-001)
- Adopt unified `assignRole`/`removeRole` mutations (replacing 6 per-type mutations with 2)
- Clean up the actor data model — ensure the client only fetches the minimal actor data needed per context
