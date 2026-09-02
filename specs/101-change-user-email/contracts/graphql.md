# Phase 1 — GraphQL Contract (client operations)

**Feature**: 101-change-user-email | **Date**: 2026-05-20

This feature **adds no server schema** — it consumes the surface shipped by server
spec 097 (merged, deployed). This document specifies the four **client-side GraphQL
documents** to author. They are colocated under
`src/domain/platformAdmin/domain/users/emailChange/` and processed by `pnpm codegen`
into typed hooks in `src/core/apollo/generated/apollo-hooks.ts`.

The server-side SDL these operations target is fixed and authoritative:
`../../../server/specs/097-change-user-email/contracts/graphql.md`.

---

## 1. `AdminUserEmailChange.graphql` — mutation

```graphql
mutation AdminUserEmailChange(
  $userID: UUID!
  $newEmail: String!
  $reason: String!
  $approver: EmailChangeApproverInput!
) {
  adminUserEmailChange(
    adminUserEmailChangeData: { userID: $userID, newEmail: $newEmail, reason: $reason, approver: $approver }
  ) {
    success
    email
  }
}
```

- **Generated hook**: `useAdminUserEmailChangeMutation`
- **`reason` / `approver`**: the mandatory governance inputs (FR-030). `approver` is
  `EmailChangeApproverInput { name: String!, role: String!, organization: String }`.
  Captured in the dialog's "Reason & approval" section; trimmed before submission with
  an empty `organization` sent as `undefined`.
- **Called with context**: `{ skipGlobalErrorHandler: true }` (D4) so the dialog owns
  error presentation.
- **On success**: refetch `platformAdminUsersList`, `LatestUserEmailChangeAuditEntry`,
  and `UserEmailChangeAuditEntries` by operation name (FR-011). No optimistic update
  (FR-009).
- **On error**: map `graphQLErrors[0].extensions.code`; dialog stays open (FR-015).

## 2. `AdminUserEmailChangeDriftResolve.graphql` — mutation

```graphql
mutation AdminUserEmailChangeDriftResolve($userID: UUID!, $canonicalEmail: String!) {
  adminUserEmailChangeDriftResolve(
    adminUserEmailChangeDriftResolveData: { userID: $userID, canonicalEmail: $canonicalEmail }
  ) {
    success
    email
  }
}
```

- **Generated hook**: `useAdminUserEmailChangeDriftResolveMutation`
- **`canonicalEmail`**: exactly the `oldEmail` or `newEmail` of the outstanding
  `DRIFT_DETECTED` entry — guaranteed by offering only those two radio options
  (FR-026).
- **Context / refetch / errors**: same handling as §1.

## 3. `UserEmailChangeAuditEntries.graphql` — paginated query

```graphql
query UserEmailChangeAuditEntries($userID: UUID!, $first: Float, $after: String) {
  platformAdmin {
    userEmailChangeAuditEntries(userID: $userID, first: $first, after: $after) {
      auditEntries {
        id
        timestamp
        outcome
        initiatorRole
        initiator {
          id
          displayName
        }
        subject {
          id
          displayName
        }
        oldEmail
        newEmail
        failureReason
        reason
        approver {
          name
          role
          organization
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      total
    }
  }
}
```

- **Generated hooks**: `useUserEmailChangeAuditEntriesQuery`,
  `useUserEmailChangeAuditEntriesLazyQuery`, `refetchUserEmailChangeAuditEntriesQuery`.
- **Pagination**: cursor-based — `first` + `after`; "Load more" passes
  `after: pageInfo.endCursor` via `fetchMore` (FR-021). Page size 10 (admin
  convention). Entries arrive newest-first from the server (FR-018).
- **Note**: `pageInfo` is selected inline (the shared `PageInfo` fragment omits
  `hasPreviousPage`, which is harmless to include here; selecting inline keeps the
  document self-contained).
- **`reason` / `approver`**: the governance fields recorded with the change (FR-030)
  are selected per entry and rendered on the history list. `approver` is the nullable
  `EmailChangeApprover { name, role, organization }`; it is null for self-service
  entries.

## 4. `LatestUserEmailChangeAuditEntry.graphql` — query

```graphql
query LatestUserEmailChangeAuditEntry($userID: UUID!) {
  platformAdmin {
    latestUserEmailChangeAuditEntry(userID: $userID) {
      id
      outcome
      oldEmail
      newEmail
      timestamp
    }
  }
}
```

- **Generated hook**: `useLatestUserEmailChangeAuditEntryQuery`
- **Purpose**: drift detection for (a) the dialog drift banner and (b) the Resolve
  dialog's two address choices (D6). Returns `null` when the user has no audit entry.
- Issued **lazily on dialog open** — one query per opened change-email dialog,
  scoped to the subject user. The global administration users list does NOT display
  a per-row drift indicator and does NOT issue this query per visible row (spec
  FR-024 / clarification 2026-05-20; see research.md D6).

---

## 5. Error contract (consumed, not defined)

Errors surface as GraphQL errors with a stable `extensions.code`. The 11 codes and
their UI messages are enumerated in `data-model.md` §5 and originate from 097
contract §6. The client maps them in `emailChangeErrorMapping.ts`. The
`EMAIL_CHANGE_CONFLICT` message is fixed and generic — it MUST NOT vary with, name,
or hint at the holder (FR-014, SC-004).

## 6. Codegen & verification

- Run `pnpm codegen` against a backend that has spec 097 deployed
  (`localhost:3000/graphql`). It regenerates `graphql-schema.ts` (additive types
  from 097), `apollo-hooks.ts` (the six hooks above), and `apollo-helpers.ts`.
- Commit all generated outputs in the same PR (Constitution III, Workflow #2).
- **No client schema diff**: the client introduces no schema change; it only adds
  consumer operations over an already-deployed server contract.
- If codegen reports the `UserEmailChange*` types as unknown, the target backend
  predates spec 097 — point codegen at an up-to-date backend rather than working
  around it.
