# Phase 1 — Data Model: Platform-Admin Change User Login Email (Web Client)

**Feature**: 101-change-user-email | **Date**: 2026-05-20

The client owns **no persistent data** for this feature — all state lives on the
server (spec 097) and is read/written through GraphQL. This document describes the
domain entities as they reach the client, and the **client-side view models** (plain
TypeScript) that decouple presentational components from generated GraphQL types
(Constitution III: "do not export generated GraphQL types directly through UI
contracts"; CLAUDE.md: Views must not import from `src/core/apollo`).

---

## 1. Domain entities (server-owned, consumed via GraphQL)

### 1.1 Login email
The address a user authenticates with. Read from the existing `User.email` field
(already present on the `platformAdminUsersList` query). An email change replaces it
with a new value. Distinct from display/contact info — only the sign-in address.

- **Current value**: `string` — shown read-only in the change dialog.
- **Validation (client)**: standard email format (`emailValidator`); the new value
  must differ from the current value, case-insensitively.

### 1.2 Email-change attempt — audit entry
One recorded attempt to change a user's login email. GraphQL type
`UserEmailChangeAuditEntry` (097 contract §2):

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `UUID!` | Stable key; not shown as primary content (FR-023). |
| `subject` | `{ id, displayName }!` | Affected user. Display name only (FR-023). |
| `initiator` | `{ id, displayName }` | Acting admin. Null only for early-validation rejects. |
| `initiatorRole` | `UserEmailChangeInitiatorRole!` | `SELF` \| `PLATFORM_ADMIN`. Always `PLATFORM_ADMIN` for this feature. |
| `oldEmail` | `String` | Old address at the time of the entry. May be null. |
| `newEmail` | `String` | Proposed/applied/observed new address. May be null. |
| `outcome` | `UserEmailChangeAuditOutcome!` | See §1.3. |
| `failureReason` | `String` | Short, non-leaky reason; set on failure outcomes only. |
| `reason` | `String` | Admin justification recorded for the change (FR-030). |
| `approver` | `{ name, role, organization }` | The `EmailChangeApprover` who authorized the change. Set for platform-admin-initiated entries; null for self-service entries. |
| `timestamp` | `DateTime!` | When recorded. History is ordered by this, descending. |

### 1.3 Outcome
`UserEmailChangeAuditOutcome` enum (097 contract §1) — 12 values. The client maps
each to a readable label and one of three visual classes (FR-020):

| Outcome | Class | Label (English, indicative) |
| --- | --- | --- |
| `COMMITTED` | success | Committed |
| `DRIFT_RESOLVED` | success | Drift resolved |
| `SECURITY_SIGNAL_FAILED` | success-with-warning | Committed — security signal not sent |
| `NEW_ADDRESS_NOTIFICATION_FAILED` | success-with-warning | Committed — new-address notification not sent |
| `GLOBAL_ADMIN_NOTIFICATION_FAILED` | success-with-warning | Committed — admin notification not sent |
| `SPACE_ADMIN_NOTIFICATION_FAILED` | success-with-warning | Committed — space admin notification not sent |
| `SESSION_INVALIDATION_FAILED` | success-with-warning | Committed — sessions not ended |
| `REJECTED_VALIDATION` | failure | Rejected — invalid address |
| `REJECTED_CONFLICT` | failure | Rejected — address in use |
| `ROLLED_BACK` | failure | Rolled back |
| `DRIFT_DETECTED` | failure | Drift detected |
| `DRIFT_RESOLUTION_FAILED` | failure | Drift resolution failed |

`success-with-warning` renders as a success variant whose label also names the
follow-up step that failed (FR-020). An unknown future enum value falls back to a
generic "Unknown outcome" label and the `failure` class — forward-compatible, and
never a raw machine code (FR-020).

### 1.4 Drift state
Derived, not a distinct type: a user is "in drift" when the **latest** audit entry's
`outcome` is `DRIFT_DETECTED` **or** `DRIFT_RESOLUTION_FAILED` (FR-025 — a failed
resolution leaves the account drifted). The latest entry also supplies the two
addresses (`oldEmail`, `newEmail`) the Resolve dialog offers. Source:
`platformAdmin.latestUserEmailChangeAuditEntry(userID)`.

### 1.5 Platform administrator
The only actor permitted to perform feature actions. Represented client-side by the
presence of `AuthorizationPrivilege.PlatformAdmin` in
`platform.authorization.myPrivileges`. Drives the enabled/disabled state of the row
control (D2).

### 1.6 Approval
The governance record attached to an admin-initiated change (FR-030). Two parts:

- **Reason** — `String` — a free-text justification for the change (e.g. a
  support-ticket reference). Required.
- **Approver** — `EmailChangeApprover` `{ name: String!, role: String!, organization: String }`
  — the person who authorized the change within the subject user's organization;
  `name` and `role` required, `organization` optional. Distinct from the *initiator*
  (the platform admin who performed the action in the product).

Captured in the change dialog's "Reason & approval" section, sent with the change
mutation, and returned on the audit entry (§1.2).

### 1.7 Platform-admin "user email changed" notification preference
A per-channel preference (`{ email, inApp, push }`) under the platform-admin
notification settings, letting an administrator opt in or out of being notified when
any user's login email changes (FR-031). Server-owned via `UserSettings`; read and
written through the existing user-settings update flow — not a feature-specific store.

---

## 2. Mutation results & inputs (097 contract §§3–4)

- **`AdminUserEmailChangeInput`** `{ userID: UUID!, newEmail: String!, reason: String!, approver: EmailChangeApproverInput! }`
- **`EmailChangeApproverInput`** `{ name: String!, role: String!, organization: String }`
  — who authorized the change within the subject user's organization (FR-030).
- **`AdminUserEmailChangeDriftResolveInput`** `{ userID: UUID!, canonicalEmail: String! }`
  — drift resolution takes no reason/approver.
  — `canonicalEmail` MUST equal the `oldEmail` or `newEmail` of the outstanding
  `DRIFT_DETECTED` entry (enforced by offering exactly those two choices, FR-026).
- **`UserEmailChangeResult`** `{ success: Boolean!, email: String }` — returned by
  both mutations; `email` is the committed canonical address on success. Failures
  arrive as typed GraphQL errors, not `success: false`.

---

## 3. Client view models (plain TypeScript — no GraphQL imports)

Presentational components receive these; mapping from generated types happens in the
feature hooks / page (the "glue"), never inside a View.

### 3.1 `EmailChangeOutcomeView`
```
type EmailChangeOutcomeClass = 'success' | 'success-with-warning' | 'failure';

type EmailChangeOutcomeView = {
  raw: string;                       // the enum value, for keys/debugging
  labelKey: TranslationKey;          // i18n key; EmailChangeOutcomeChip resolves it via t()
  class: EmailChangeOutcomeClass;    // drives chip colour/variant
};
```

### 3.2 `EmailChangeHistoryEntryView` — one history row
```
type EmailChangeHistoryEntryView = {
  id: string;
  timestamp: Date;
  outcome: EmailChangeOutcomeView;
  initiatorName: string;             // displayName, or a neutral "—" if null
  subjectName: string;
  oldEmail: string | undefined;
  newEmail: string | undefined;
  failureReason: string | undefined;
  reason: string | undefined;        // admin justification recorded for the change
  approver: string | undefined;      // approver pre-formatted as "Name (Role) — Organization"
};
```

### 3.3 `EmailChangeHistoryView` — the paginated list
```
type EmailChangeHistoryView = {
  entries: EmailChangeHistoryEntryView[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
};
```

### 3.4 `DriftStateView` — drift context for the dialog banner / resolve
```
type DriftStateView = {
  isDrifted: boolean;                // latest outcome is DRIFT_DETECTED | DRIFT_RESOLUTION_FAILED
  oldEmail: string | undefined;      // canonical-choice option A
  newEmail: string | undefined;      // canonical-choice option B
};
```

### 3.5 `ChangeUserEmailDialogProps`
`ChangeUserEmailDialog` is self-contained (the `SpaceSettingsDialog` pattern — D7): it
takes a minimal prop set and consumes the feature façade hooks internally —
`useChangeUserEmail` (submit, pending, mapped error), `useLatestUserEmailChangeOutcome`
(drift, queried lazily only while the dialog is open), `useNavigate` (history link).
```
type ChangeUserEmailDialogProps = {
  open: boolean;
  userId: string;                    // subject; drives the façade hooks
  currentEmail: string;              // shown read-only
  onClose: () => void;
};
```

---

## 4. Form model & validation (change dialog)

Formik values:
`{ newEmail: string; confirmEmail: string; reason: string; approver: { name: string; role: string; organization: string } }`.
Yup schema:

| Field | Rules |
| --- | --- |
| `newEmail` | `emailValidator({ required: true })`; AND not equal to `currentEmail` (case-insensitive) → message "unchanged address". |
| `confirmEmail` | required; AND exactly equal to `newEmail` → message "addresses do not match". |
| `reason` | `textLengthValidator({ maxLength: MID_TEXT_LENGTH, required: true })`. |
| `approver.name` | `textLengthValidator({ maxLength: SMALL_TEXT_LENGTH, required: true })`. |
| `approver.role` | `textLengthValidator({ maxLength: SMALL_TEXT_LENGTH, required: true })`. |
| `approver.organization` | `textLengthValidator({ maxLength: SMALL_TEXT_LENGTH })` — optional. |

Submit is enabled only when the whole schema validates (`isValid && dirty`) and no
mutation is in flight (FR-006). `newEmail`-invalid, unchanged-address, and
confirmation-mismatch are all inline field errors caught before any server call
(FR-007) — they correspond to the server's `EMAIL_CHANGE_VALIDATION` /
`EMAIL_CHANGE_NO_CHANGE` codes, which act only as a backstop. The reason and approver
values are trimmed before submission; an empty `approver.organization` is sent as
`undefined`.

---

## 5. Error-code → message mapping (097 contract §6)

`emailChangeErrorMapping.ts` maps `extensions.code` to a `translation` i18n key.
Catch-all `apollo`/generic key for any unmapped or unexpected failure (FR-013).

| `extensions.code` | Surface | Message intent |
| --- | --- | --- |
| `EMAIL_CHANGE_VALIDATION` | change dialog | Enter a valid email address. |
| `EMAIL_CHANGE_NO_CHANGE` | change dialog | New email equals the current one. |
| `EMAIL_CHANGE_CONFLICT` | change dialog | "This email address is already in use." — **generic, no holder info** (FR-014, SC-004). |
| `EMAIL_CHANGE_SUBJECT_NOT_FOUND` | change dialog | User has no usable login identity; cannot be changed. |
| `EMAIL_CHANGE_KRATOS_UNREACHABLE` | change dialog | Identity service unavailable; retry shortly. |
| `EMAIL_CHANGE_KRATOS_WRITE_FAILED` | change dialog | Could not complete; **no changes were made**; retry (FR-016). |
| `EMAIL_CHANGE_ALKEMIO_WRITE_FAILED` | change dialog | Could not complete; **no changes were made**; retry (FR-016). |
| `EMAIL_CHANGE_DRIFT_DETECTED` | change dialog | Partially applied; **directs to Resolve** (FR-017). |
| `EMAIL_CHANGE_DRIFT_RESOLUTION_FAILED` | resolve dialog | Reconciliation could not complete; retry. |
| `EMAIL_CHANGE_DRIFT_NOT_FOUND` | resolve dialog | Nothing to resolve. |
| `EMAIL_CHANGE_UNAUTHORIZED` | either | No permission to perform this action. |
| *(unmapped)* | either | Generic catch-all (FR-013). |

---

## 6. State transitions (account, as seen by the client)

```
            adminUserEmailChange
   [stable] ───────────────────────────▶ [stable]   (COMMITTED / *_FAILED warning outcomes)
       │                                      ▲
       │  adminUserEmailChange (partial)       │ adminUserEmailChangeDriftResolve (success)
       ▼                                      │
   [drifted] ◀────────────────────────────────┘
       │   ▲   adminUserEmailChangeDriftResolve (DRIFT_RESOLUTION_FAILED → stays drifted)
       └───┘
```

The client never computes these transitions — it reads the **latest audit entry**
after each mutation (refetch) and re-derives `DriftStateView`. There is no optimistic
client state (FR-009).
