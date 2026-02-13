# Quickstart: Actor Architecture Migration

**Branch**: `014-actor-migration` | **Date**: 2026-02-10

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- Server running on the actor-migration branch at `localhost:4000/graphql` (for codegen)
- Backend accessible at `localhost:3000` (for dev server)

## Migration Execution Order

### Step 1: Update GraphQL Documents

Edit the `.graphql` files in the order specified in `contracts/graphql-changes.md`. Work in this sequence to minimize intermediate breakage:

1. **Fragments first** — retarget `on Contributor` → `on ActorFull` (3 files)
2. **Field removals** — remove `agent` field from `UserAccount.graphql`, remove `contributorType` from 4 invitation `.graphql` files
3. **Mutation unification** — replace 6 role mutations with 2 unified ones, update platform role mutations (4 files)
4. **Query unification** — replace 3 roles queries with `rolesActor` (3 files)
5. **Field renames** — `invitedContributorIDs` → `invitedActorIds` in `InvitationsMutations.graphql`
6. **Sender fix** — add `... on User` inline fragment in `AddReactionMutation.graphql`

### Step 2: Run Codegen

```bash
pnpm codegen
```

This regenerates `src/core/apollo/generated/graphql-schema.ts` and `src/core/apollo/generated/apollo-hooks.ts` against the new server schema.

### Step 3: Fix TypeScript Errors

After codegen, the compiler will flag all breakage points. Fix in this order:

1. **RoleSetContributorType → ActorType** — bulk find-and-replace across ~40 files. Pay attention to `RoleSetContributorType.Virtual` → `ActorType.VirtualContributor`.
2. **Role assignment hook** — rewrite `useRoleSetManagerRolesAssignment.ts` to use the 2 unified mutations.
3. **Invitation models** — remove `contributorType` from `InvitationModel.ts`, `ApplicationModel.ts`, update `InvitationDataModel.ts` field names.
4. **Agent removal** — remove `agent` from `UserModel.ts`, update data access in `UserAdminAccountPage.tsx` and `UserProfilePage.tsx`.
5. **Messaging** — update `NewMessageDialog.tsx` to use `receiverActorId`.
6. **Helper functions** — update `addContributorType()` in `useRoleSetApplicationsAndInvitations.ts`.

### Step 4: Verify

```bash
pnpm lint          # Type checking + linting
pnpm vitest run    # Run tests
pnpm build         # Production build
```

## Key Gotchas

- The enum value `Virtual` → `VirtualContributor` is easy to miss in switch statements and comparisons.
- The `addContributorType()` helper returns `RoleSetContributorType` — it needs to return `ActorType` with updated values.
- The `useRoleSetManagerRolesAssignment.ts` hook exports 8 separate functions — even though the underlying mutations unify, the hook's public API can keep backward-compatible names to avoid touching all callers.
- The `AddReactionMutation.graphql` queried `firstName`/`lastName` directly on `sender` (which was `User`). Now `sender` is `Actor`, so these fields need an `... on User {}` wrapper.
- The roles query responses change type name from `ContributorRoles` to `ActorRoles` — TypeScript code accessing these via generated types will automatically get the new type, but any manual type references need updating.
