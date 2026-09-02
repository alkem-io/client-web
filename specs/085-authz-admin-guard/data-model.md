# Phase 1 Data Model: Permission-Aware Authorization Admin UI

**Feature**: 085-authz-admin-guard
**Date**: 2026-09-02

No new persisted entities and no schema changes. This documents the shapes consumed and the two contracts introduced.

## Consumed GraphQL shapes (existing)

### `Authorization.myPrivileges: [AuthorizationPrivilege!]`

The privileges the **current caller** holds on the entity owning that `Authorization`. Reaches the client through the existing `RoleSetAuthorization` query (`src/domain/access/graphql/queries/RoleSetDetails.graphql`), which selects it on both `platform.authorization` and `lookup.roleSet.authorization`.

### `AuthorizationPrivilege` values relevant here

Defined in `src/core/apollo/generated/graphql-schema.ts:1053-1079`. This feature reads them; it introduces and modifies none.

| Value | Meaning in this feature |
|---|---|
| `GRANT` | General grant privilege. Combined with `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` for organization assignment on surface 4. |
| `ROLESET_ENTRY_ROLE_ASSIGN` | Direct add/remove of a user or virtual contributor on a role set. |
| `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION` | Direct add/remove of an organization on a role set. |
| `ROLESET_ENTRY_ROLE_INVITE` | Invitation — **out of scope** (FR-015), listed only to prevent confusion with the assign tokens. |
| `READ` | Not gated by this feature; already governs whether the roster renders at all. |

Which token applies to which surface is per-surface configuration, not a constant — see research Decision 2 and Open Risk R1.

## Contract 1 — `useActionPermission`

New hook at `src/domain/access/permissions/useActionPermission.ts`. Pure derivation over data the caller already holds; issues no query of its own.

```ts
type ActionPermissionReason = 'allowed' | 'checking' | 'denied' | 'unverifiable';

type ActionPermission = {
  /** true only when every required privilege is present. */
  allowed: boolean;
  /** Why the action is in its current state; drives which tooltip copy the caller picks. */
  reason: ActionPermissionReason;
};

declare function useActionPermission(
  myPrivileges: AuthorizationPrivilege[] | undefined,
  required: AuthorizationPrivilege[],
  loading: boolean
): ActionPermission;
```

### Derivation rules

| `loading` | `myPrivileges` | `required` satisfied | `allowed` | `reason` |
|---|---|---|---|---|
| `true` | any | — | `false` | `checking` |
| `false` | `undefined` | — | `false` | `unverifiable` |
| `false` | array | no | `false` | `denied` |
| `false` | array | yes | `true` | `allowed` |

- `required` is satisfied only when **every** listed privilege is present (surface 4's organization case needs two).
- An empty `required` array is a programming error, not a permissive default; it is treated as `denied`.
- `unverifiable` is the spec's Edge Case 3 (entity exposes no privilege list) and carries distinct copy from `denied`.

## Contract 2 — `GatedAction` (CRD presentational)

New component at `src/crd/components/common/GatedAction.tsx`. Holds no business logic and imports nothing from `@/domain`, `@/core/apollo`, or `@apollo/client` — it receives a finished string.

```ts
type GatedActionProps = {
  /**
   * When set, the action is gated: rendered aria-disabled, kept focusable,
   * its handler suppressed, and this string shown as the tooltip.
   * When undefined, children render and behave normally.
   */
  disabledReason?: string;
  children: React.ReactElement;
};
```

### Behavioral contract

1. `disabledReason === undefined` → children render untouched, no tooltip wrapper, no added ARIA.
2. `disabledReason` set → the child gets `aria-disabled="true"`, remains in the tab order, and its `onClick` / activation handler is suppressed (FR-005, SC-007).
3. The tooltip shows on both hover and keyboard focus, and is associated with the control for screen readers (FR-003, FR-004, SC-005).
4. The native `disabled` attribute is never applied — it would remove the control from the tab order and defeat requirement 3 (research Decision 3).

## Contract 3 — Mutation error notification

`useRoleSetManagerRolesAssignment.ts` gains error handling shared by all eight mutations:

1. Inspect the rejection's GraphQL error codes.
2. If any is `FORBIDDEN` or `FORBIDDEN_POLICY` (`AlkemioGraphqlErrorCode`, `src/main/constants/errors.ts`) → call `useNotification()(message, 'error')` with the permission-specific string.
3. Otherwise → do nothing. The global error link (`useErrorHandlerLink`) already notifies for those classes; a second call would double-toast.
4. The rejection is re-thrown, not swallowed, so callers can still react.
5. No refetch, no cache eviction (FR-016).

## Consumer wiring per surface

Each glue site computes the decision and passes down a string; no CRD component receives privileges.

| Surface | Privileges source | Required token(s) | Props passed to the view |
|---|---|---|---|
| 1 — Platform global roles | `useRoleSetManager().myPrivileges` | per R1 | `addDisabledReason`, `removeDisabledReason` |
| 2 — Org authorization | `useRoleSetManager().myPrivileges` | per R1 | same |
| 3 — Org associates | `useRoleSetManager().myPrivileges` | per R1 | same |
| 4 — Space community | `useCommunityAdmin().permissions` (already computed) | `ROLESET_ENTRY_ROLE_ASSIGN`; organizations additionally `GRANT` | same, after `useCommunityTabData` forwards `canAddUsers` (R2) |

## State transitions

None — no stateful entity is introduced. The only transition is the derivation table above, which is a pure function of `(loading, myPrivileges, required)`.
