# Phase 1 Contracts: UI & Data Consumption

**Feature**: 085-authz-admin-guard
**Date**: 2026-09-02

This is a frontend-only feature. It exposes no external API and changes no GraphQL schema. The contracts below are the internal interfaces the feature depends on, captured so a future schema or design-system change cannot silently break it.

## GraphQL fields consumed (read-only, existing)

### `Authorization.myPrivileges: [AuthorizationPrivilege!]`

- Sole source of truth for control enablement on every covered surface.
- Reached via the existing `RoleSetAuthorization` query; no `.graphql` document is added or modified by this feature.
- **Invariant**: if a future change removes this selection from `RoleSetAuthorization`, every covered control degrades to `unverifiable` (gated with "could not verify permissions" copy) rather than becoming wrongly enabled. Fail-closed is required.

### `AuthorizationPrivilege` enum members read

`GRANT`, `ROLESET_ENTRY_ROLE_ASSIGN`, `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION`. No member is added, removed, or repurposed.

## Mutations covered (existing, signatures unchanged)

All eight exposed by `useRoleSetManagerRolesAssignment`. Only client-side error handling is added; variables and selections are untouched.

| Mutation | Contributor type |
|---|---|
| `assignRoleToUser` / `removeRoleFromUser` | User |
| `assignPlatformRoleToUser` / `removePlatformRoleFromUser` | User (platform role) |
| `assignRoleToOrganization` / `removeRoleFromOrganization` | Organization |
| `assignRoleToVirtualContributor` / `removeRoleFromVirtualContributor` | Virtual contributor |

## Error-code contract

Depends on `AlkemioGraphqlErrorCode` (`src/main/constants/errors.ts`) and on the exclusion list in `useErrorHandlerLink.ts`.

- The call-site handler notifies for exactly `FORBIDDEN` and `FORBIDDEN_POLICY`.
- The global link notifies for everything except `FORBIDDEN`, `FORBIDDEN_POLICY`, `URL_RESOLVER_ERROR`.
- **Invariant**: these two sets must stay complementary for the covered mutations. If `FORBIDDEN` is ever removed from the global exclusion list, the call-site handler must be removed in the same change, or users get two toasts for one failure. This coupling is deliberate (FR-014) and is the reason the exclusion list must not be edited casually.
- `URL_RESOLVER_ERROR` is not raised by these mutations and is not handled here.

## Component contract — `GatedAction`

Consumers pass `disabledReason?: string` and a single child element. Full behavioral contract in `data-model.md`.

**Invariants**:

1. `GatedAction` never imports from `@/domain/*`, `@/core/apollo`, `@apollo/client`, `react-router-dom`, or `formik` (CRD rule).
2. It never receives a privilege array, a GraphQL type, or a boolean named after a privilege — only a finished, translated string.
3. It never applies the native `disabled` attribute.

## Hook contract — `useActionPermission`

Signature and derivation table in `data-model.md`.

**Invariants**:

1. Single source of privilege truth: no covered surface may re-implement the check inline or substitute a role-name heuristic.
2. No network access: the hook accepts already-loaded data and issues no query, preserving SC-004.
3. Fail-closed: every non-affirmative input state yields `allowed: false`.

## i18n contract

- Keys live in `crd-common` (`src/crd/i18n/common/common.<lang>.json`), all six locales, key parity enforced by the existing `common.parity.test.ts`.
- Three distinct strings are required, matching the three non-allowed `reason` values: `checking`, `denied`, `unverifiable`.
- Copy must contain no privilege token and no escalation target (spec FR-003).

## Out of scope

- New REST or GraphQL endpoints.
- Any schema type, field, or enum change.
- Backend authorization logic.
- The global Apollo error handler's behavior (FR-014).
