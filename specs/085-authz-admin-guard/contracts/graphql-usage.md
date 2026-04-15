# Phase 1 Contracts: GraphQL Usage

**Feature**: 085-authz-admin-guard
**Date**: 2026-04-15

This feature introduces **no new backend endpoints and no schema changes**. It consumes existing fields. This document captures the client-side contract the feature depends on so changes to the schema in the future don't silently break it.

## Fields Consumed (read-only)

### `Authorization.myPrivileges: [AuthorizationPrivilege!]`

- Source of truth for UI enablement on all Add-user / role-assignment controls.
- Must be requested on the `authorization` sub-selection of every role-set / community / organization / entity that governs a covered control.
- Expected to be populated by the server for the calling user on every query that includes the selection.

### `AuthorizationPrivilege.GRANT`

- The specific enum value checked by `useHasPrivilege` for all Add-user sites covered by this feature.
- No other enum members are introduced or modified.

## Mutations Consumed (existing, no signature change)

The following mutations are invoked by the covered sites. Their signatures are unchanged; only client-side `onError` handling is added.

- `assignRoleToUser` / `assignPlatformRoleToUser` (role-set and platform role assignments)
- `assignOrganizationRoleToUser`
- `inviteContributorsEntryRoleSet` (and siblings for VCs)
- Any other role-set/role-assignment mutation exercised by an inventoried site

Per `/speckit.tasks`, each inventoried site's exact mutation name will be recorded alongside its `onError` wiring.

## Client-side Invariants

1. **Single source of privilege truth**: No covered site may implement its own ad-hoc role heuristic in lieu of `useHasPrivilege`.
2. **No new query round-trips**: Privileges must be read from data already in the page's main query. If a page lacks the selection, extend the existing `.graphql` document rather than adding a new query.
3. **Mutation errors always surface**: Every covered mutation call must have an `onError` path that reaches `useNotification()` with severity `error`. Silent catch blocks are forbidden in covered sites.
4. **Generated hooks only**: Apollo calls go through `src/core/apollo/generated/apollo-hooks.ts` (Constitution Principle III).

## Out of Scope

- New REST endpoints (none exist on this platform for this flow).
- New GraphQL schema types, fields, or enum members.
- Changes to the backend's authorization evaluation logic.
