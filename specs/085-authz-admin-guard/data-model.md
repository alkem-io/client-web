# Phase 1 Data Model: Permission-Aware Authorization Admin UI

**Feature**: 085-authz-admin-guard
**Date**: 2026-04-15

This feature introduces no new persisted entities. It consumes existing GraphQL types. Below are the shapes the client reads and the hook contract introduced.

## Consumed GraphQL Types (existing — no schema changes)

### `Authorization`

```graphql
type Authorization {
  id: UUID
  myPrivileges: [AuthorizationPrivilege!]
  # (other fields ignored by this feature)
}
```

- `myPrivileges` is the list of privileges the **current caller** holds on the entity that owns this `Authorization`.
- Returned on `RoleSet.authorization`, `Community.authorization`, `Organization.authorization`, `Space.authorization`, etc.

### `AuthorizationPrivilege` (enum — the value this feature checks)

- `GRANT` — caller may change membership/role assignments on the entity. **This is the privilege gated by this feature.**
- Other values (`READ`, `UPDATE`, `DELETE`, `CREATE`, …) are read by other features and are not altered.

### `Authorizable` client-side interface

At `src/core/utils/Authorizable.ts`:

```ts
export type Authorizable = {
  authorization?: {
    myPrivileges?: AuthorizationPrivilege[];
  };
};
```

This is the shape the new hook accepts — any entity the client already exposes as `Authorizable` can be gated.

## Hook Contract: `useHasPrivilege`

New hook introduced in `src/domain/access/authorization/useHasPrivilege.ts`.

```ts
type UseHasPrivilegeResult = {
  /** true iff authorizable.authorization.myPrivileges includes the requested privilege */
  hasPrivilege: boolean;
  /** true while the authorizable (or its authorization) is not yet available */
  isLoading: boolean;
};

declare function useHasPrivilege(
  authorizable: Authorizable | undefined,
  privilege: AuthorizationPrivilege
): UseHasPrivilegeResult;
```

### Derivation rules

| Input state | `hasPrivilege` | `isLoading` |
|---|---|---|
| `authorizable` is `undefined` | `false` | `true` |
| `authorizable.authorization` is `undefined` | `false` | `true` |
| `authorizable.authorization.myPrivileges` is `undefined` | `false` | `true` |
| `myPrivileges` is an array not containing `privilege` | `false` | `false` |
| `myPrivileges` contains `privilege` | `true` | `false` |

### Consumer contract

Every Add-user (or equivalent) control covered by this feature calls the hook and passes the result into the `DisabledWithTooltipButton` wrapper:

- `disabled = !hasPrivilege`
- tooltip message:
  - `hasPrivilege` true → no tooltip (or default aria-label only)
  - `hasPrivilege` false, `isLoading` true → i18n key `authorization.checkingPermissions`
  - `hasPrivilege` false, `isLoading` false → i18n key `authorization.missingPrivilege.grant`

## Mutation Error-Handling Contract

Hooks owning role-assignment mutations (e.g., `useRoleSetManagerRolesAssignment.ts`) gain an `onError` that:

1. Classifies the error:
   - GraphQL error with extensions indicating a forbidden/authorization failure → permission category.
   - All other failures → generic category.
2. Calls `useNotification()` with severity `error` and:
   - permission → i18n key `authorization.error.permissionDenied`
   - generic → i18n key `authorization.error.operationFailed`
3. Does not swallow the error — upstream callers still see the rejection (so optimistic updates can roll back).

## Entity Touch-Points (read-only consumption)

| Entity | Where it's already fetched | Field needed | Needs `.graphql` extension? |
|---|---|---|---|
| RoleSet | most role-assignment queries | `authorization.myPrivileges` | to be verified per site in `/speckit.tasks` |
| Community | community admin queries | `authorization.myPrivileges` | to be verified |
| Organization | org admin queries | `authorization.myPrivileges` | to be verified |
| Platform authorization target | platform admin query | `authorization.myPrivileges` | to be verified |

Any site where the field is missing gets its `.graphql` document extended and `pnpm codegen` re-run in the same PR (Constitution Principle III).

## State Transitions

Not applicable — this feature does not introduce stateful entities. The UI-level transitions (loading → resolved, permitted → denied) are fully captured by the hook contract above.
