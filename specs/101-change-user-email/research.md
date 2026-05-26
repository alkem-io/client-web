# Phase 0 — Research: Platform-Admin Change User Login Email (Web Client)

**Feature**: 101-change-user-email | **Date**: 2026-05-20
**Input**: `spec.md` (this directory), server contract `../../../server/specs/097-change-user-email/`

This document resolves the technical unknowns for the client-web implementation. The
server surface (spec 097) is merged and deployed; no server changes are in scope. All
findings are grounded in the existing client codebase.

---

## D1 — Entry-point host surface

**Decision**: The change-login-email entry point is a **per-user row action** in the
global administration users list (`/admin/users`), rendered by `AdminUsersPage` →
`AdminSearchableTable`. An email action control is added to each row, positioned
**before** the existing license-plan and delete row actions.

**Rationale**:
- The MUI per-user admin detail page (`UserPage`, route `/admin/users/:userNameId`)
  exists but is **orphaned**: `useAdminGlobalUserList.tsx:92` builds each row link as
  `buildSettingsUrl(profile.url)` → `/user/:nameId/settings` (the user's own,
  CRD-migrating settings shell), so the admin list never navigates to `UserPage`.
- `AdminSearchableTable` already renders per-row actions via the `itemActions` render
  prop, immediately before the built-in delete `IconButton`
  (`AdminSearchableTable.tsx`, `renderItemActions(item)` then the delete button). The
  license-plan action is already wired this way in `AdminUsersPage.getActions`.
- A row action is consistent with the two row actions already present (license,
  delete) and is reachable without depending on the orphaned detail page.

**Alternatives considered**:
- *Host on `UserPage` + re-point the list* — re-pointing the list row navigation is a
  behaviour change affecting every admin and downgrades the surface (the settings
  shell is richer than `UserPage`'s flat form). Rejected by stakeholder.
- *Host on `/user/:id/settings`* — that area is the user-owned, CRD-migrating settings
  shell; conflicts with spec A8 (MUI, `src/domain/platformAdmin/`, no CRD). Rejected.

> This supersedes the spec's earlier "per-user detail page" clarification; `spec.md`
> has been updated (FR-001, FR-002, FR-018, FR-024, FR-025, A1, A2).

## D2 — Authorization gating of the row control

**Decision**: The email row control is **rendered for all admin-area users** but is
**enabled only when the current user holds `AuthorizationPrivilege.PlatformAdmin`**;
otherwise it is rendered disabled (grayed out) with an explanatory tooltip/`aria`
label. The privilege is read from `usePlatformLevelAuthorizationQuery()` →
`data.platform.authorization.myPrivileges` — the same query the `/admin` route guard
already issues, so Apollo serves it from cache (no extra round-trip).

**Rationale**:
- `adminUserEmailChange` requires `PLATFORM_ADMIN` server-side (097 contract §7).
  Gating the enabled state on the same privilege keeps client and server aligned and
  fails safe.
- `NonPlatformAdminRedirect` → `NonAdminRedirect` already gates the whole `/admin/*`
  tree on `AuthorizationPrivilege.PlatformAdmin`.

**Observation (documented, not a blocker)**: Under the *current* route guard, every
user who reaches `/admin/users` already holds `PlatformAdmin`, so the disabled state
is not reachable today. The explicit check is still implemented as defense-in-depth
and future-proofing (should the admin area later admit non-`PlatformAdmin` global
roles such as support). The history route additionally guards
itself so direct navigation by a non-admin is denied. The Resolve dialog has no
route of its own — it opens only from the change dialog, so it is gated transitively.

## D3 — GraphQL operations & codegen

**Decision**: Add four colocated `.graphql` documents under the feature folder; rely
on the existing codegen pipeline to produce typed hooks. No server schema changes.

| Document | Kind | Generated hook |
| --- | --- | --- |
| `AdminUserEmailChange.graphql` | mutation | `useAdminUserEmailChangeMutation` |
| `AdminUserEmailChangeDriftResolve.graphql` | mutation | `useAdminUserEmailChangeDriftResolveMutation` |
| `UserEmailChangeAuditEntries.graphql` | query (paginated) | `useUserEmailChangeAuditEntriesQuery` + `refetchUserEmailChangeAuditEntriesQuery` |
| `LatestUserEmailChangeAuditEntry.graphql` | query | `useLatestUserEmailChangeAuditEntryQuery` |

**Rationale**: Matches the established pattern — `.graphql` files colocated with the
domain (e.g. `platformAdminUsersList.graphql`), `codegen.yml` globs `src/**/*.graphql`
and writes `src/core/apollo/generated/{graphql-schema,apollo-hooks,apollo-helpers}.ts`.
Constitution III mandates generated hooks only.

**Codegen note**: `pnpm codegen` fetches the schema from the running backend
(`localhost:3000/graphql`). Because server 097 is merged, the deployed schema already
exposes the new types; codegen regenerates `graphql-schema.ts` (additive only — the
`UserEmailChange*` enums/object types, the `EmailChangeApprover` object + its input,
the `AdminUserEmailChange*` inputs, 2 mutations, 2 `platformAdmin` query fields, and a
`userEmailChanged` field on the platform-admin notification settings type) and
`apollo-hooks.ts`. There is **no client schema diff to review** — the client only
consumes an existing server contract. Generated outputs are committed in the same PR.

**Reason & approver inputs**: `adminUserEmailChange` requires more than `newEmail` —
the deployed 097 contract takes a mandatory `reason: String!` and an
`approver: EmailChangeApproverInput!` (`{ name, role, organization? }`). The change
dialog captures these in a "Reason & approval" section and submits them; the audit
entry returns them as `reason` and `approver { name, role, organization }`, surfaced
on the history list. Drift resolution (`adminUserEmailChangeDriftResolve`) does **not**
take reason/approver — only `userID` + `canonicalEmail`.

**Alternatives considered**: inline `gql` templates — rejected, the repo standard is
`.graphql` files + codegen, and Constitution III forbids unchecked operations.

## D4 — Typed, inline error handling

**Decision**: The change and drift-resolve mutations are called with Apollo context
`{ skipGlobalErrorHandler: true }`. Each feature hook catches the `ApolloError`,
reads `error.graphQLErrors[0].extensions.code`, and maps it through a feature-local
`emailChangeErrorMapping.ts` (code → `translation` i18n key). The dialog renders the
mapped message inline and stays open with input preserved (FR-013, FR-015).

**Rationale**:
- `useErrorHandlerLink.ts` honours an operation-context flag: `if
  (operation.getContext().skipGlobalErrorHandler) return;` — this is the supported,
  no-workaround way to suppress the bottom-right global toast so the dialog can own
  error presentation.
- A feature-local code→key map (rather than extending `AlkemioGraphqlErrorCode`)
  keeps the `EMAIL_CHANGE_*` codes in the domain that owns them (Constitution I) and
  is the minimal change. The map covers all 11 documented codes (097 contract §6)
  plus a generic catch-all for unmapped/unexpected failures (FR-013).
- `EMAIL_CHANGE_CONFLICT` maps to a fixed generic string with **no holder detail**
  (FR-014, SC-004).

**Alternatives considered**: letting the global handler show errors — rejected: it
shows a transient toast, cannot keep the dialog open with preserved input, and would
surface raw/generic copy.

## D5 — Email-change history: dedicated route + pagination

**Decision**: Add a route `:userId/email-history` to `UsersRoute.tsx` rendering a
new MUI page `UserEmailChangeHistoryPage` (wrapped in `AdminLayout`). The route param
is the user **UUID** (`User.id`) — the change flow already holds it (the row item
exposes `id`), so the page reads it directly with `useParams` and queries
`userEmailChangeAuditEntries(userID:)` with no nameId-resolution round-trip.
Pagination uses the existing cursor-pagination
machinery (`first` / `after` / `pageInfo.endCursor` + `fetchMore`), with a
"Load more" button — the pattern in `useAdminGlobalUserList.tsx`. The dialog links
here via a "View change history" link → `/admin/users/<userId>/email-history`.

**Rationale**: Spec A2 mandates a dedicated route. `useUserEmailChangeHistory` calls
`fetchMore` with an explicit `updateQuery` callback that concatenates `auditEntries`.
The shared `paginationFieldPolicy` cannot be reused: it throws on a connection that
carries a `total` field alongside the item array, and a bespoke field policy would
mean editing global `typePolicies.ts`. Keeping the page-merge inside the feature hook
keeps the slice self-contained. Page size follows the admin convention (10).

**Alternatives considered**: history as a dialog tab / inline panel — rejected,
contradicts spec A2 (dedicated route). A `:userNameId` slug param (consistent with
`UserPage`) — rejected: it would require resolving nameId→UUID via `useUrlResolver`
and adding `nameID` to the users-list query + row item, for no benefit on an
admin-only forensic page.

## D6 — Drift surfaced lazily in the change dialog

**Decision**: Drift state is **not** shown on the users-list row. `ChangeUserEmailDialog`
issues `useLatestUserEmailChangeAuditEntryQuery` for its subject **only while it is
open** (`skip` until opened); when the latest entry's `outcome` is `DRIFT_DETECTED` or
`DRIFT_RESOLUTION_FAILED` it shows a drift banner, and the same result drives the
two-address choice in the Resolve dialog.

**Rationale**: `latestUserEmailChangeAuditEntry(userID)` is the contract's per-user
"quick drift-status check" (097 contract §5). There is no batch field and the spec
forbids server changes (A5). A per-row drift badge would therefore need one query per
visible user on every users-list load (~10/page) just to surface a rare (P3)
condition — a poor cost/benefit. Querying once, on demand, when the admin opens a
user's dialog keeps the users list free of feature-specific queries and is fully
sufficient: drift is rare and is acted on through the dialog regardless.

**Alternatives considered**: a per-row amber badge (the original design) — rejected,
superseded by a spec clarification: ~10 per-user queries per page load for an
at-a-glance indicator of a rare condition is not worth it. Extending
`platformAdminUsersList` with per-user drift state — impossible without a server
change (the field lives under `platformAdmin`, not under `User`).

**Cache note**: `latestUserEmailChangeAuditEntry`, `userEmailChangeAuditEntries`, and
`platformAdminUsersList` all select into `platformAdmin` (`PlatformAdminQueryResults`).
That type needs a `merge: true` cache type policy — alongside the sibling container
types `Platform` / `LookupQueryResults` / `MeQueryResults` — so co-resident
`platformAdmin` selections merge instead of clobbering one another and triggering an
endless refetch cascade.

## D7 — Change dialog construction

**Decision**: Build `ChangeUserEmailDialog` on `DialogWithGrid` + `DialogHeader` +
`Actions`, with a `Formik` form using `FormikInputField` for the new-email and
confirmation inputs and a read-only display of the current email. Below the email
inputs, a "Reason & approval" section adds `FormikInputField`s for the reason
(multi-line, `MID_TEXT_LENGTH`), approver name, approver role (each `SMALL_TEXT_LENGTH`,
required), and approver organization (`SMALL_TEXT_LENGTH`, optional). Validation is a
`yup` schema (`emailValidator` for emails, `textLengthValidator` for the
reason/approver fields). The submit `Button` uses `loading` + `disabled` bound to form
validity and mutation in-flight state.

**Rationale**: This is the exact composition used by `SpaceSettingsDialog`
(`DialogWithGrid` + `Formik` + `FormikInputField` + `Actions` + loading button) — a
proven in-repo pattern. `emailValidator` (`src/core/ui/forms/validator/emailValidator.ts`)
supplies email-format validation with existing translation keys.

## D8 — Typed re-confirmation field

**Decision**: The dialog has a second `FormikInputField` ("Confirm new email"). The
`yup` schema requires it to be present and to exactly equal the `newEmail` field —
implemented with a `yup.test` referencing the sibling value; matching `newEmail`
transitively guarantees a valid, different address. (`.oneOf([yup.ref('newEmail')])`
was tried first and rejected — `yup.ref` types as `Reference<unknown>`, which the
`.oneOf` overloads do not accept.) Submit is disabled until the whole schema is valid
(`!isValid`), so an unchanged address, an invalid address, or a confirmation mismatch
all keep submit disabled with inline messages (FR-006, FR-007).

**Rationale**: No "type-to-confirm" component exists in the repo (the closest is the
checkbox in `EntityConfirmDeleteDialog`). FR-005 explicitly requires a re-typed-email
confirmation field, so this is built new with standard Formik + yup primitives. The
case-insensitive "different from current" check mirrors the server's
`EMAIL_CHANGE_NO_CHANGE` rule (097 contract §6).

## D9 — Drift-resolution dialog

**Decision**: `ResolveEmailDriftDialog` on `DialogWithGrid` presents a MUI
`RadioGroup` with exactly two options — the `oldEmail` and `newEmail` from the latest
`DRIFT_DETECTED` audit entry — and no free-text input (FR-026). Submitting calls
`adminUserEmailChangeDriftResolve` with the selected `canonicalEmail`.

**Rationale**: Two fixed, server-supplied choices; a radio group is the accessible,
minimal control. Spec U S4 explicitly accepts a minimal functional UI here (P3).

## D10 — Internationalization

**Decision**: All feature copy goes through `react-i18next` `t()` using the default
`translation` namespace; new English keys are added to
`src/core/i18n/en/translation.en.json` only, under `pages.admin.users.emailChange.*`.

**Rationale**: The `/admin/*` area is MUI and uses the default namespace.
Constitution standard #3 and CLAUDE.md forbid hard-coded copy and forbid editing
non-English locale files (Crowdin-generated). FR-029 ("English only; no localised
copy is added") is satisfied: only `translation.en.json` is touched in this PR;
Crowdin produces the other locales downstream — the feature itself adds no localised
copy. Hard-coding English strings would violate the constitution and is rejected.

## D11 — Outcome labels & classification

**Decision**: A feature-local `emailChangeOutcome.ts` maps each
`UserEmailChangeAuditOutcome` value to (a) a readable label key and (b) one of three
visual classes — `success`, `success-with-warning`, `failure`:

| Outcome | Class |
| --- | --- |
| `COMMITTED`, `DRIFT_RESOLVED` | success |
| `SECURITY_SIGNAL_FAILED`, `NEW_ADDRESS_NOTIFICATION_FAILED`, `GLOBAL_ADMIN_NOTIFICATION_FAILED`, `SPACE_ADMIN_NOTIFICATION_FAILED`, `SESSION_INVALIDATION_FAILED` | success-with-warning |
| `REJECTED_VALIDATION`, `REJECTED_CONFLICT`, `ROLLED_BACK`, `DRIFT_DETECTED`, `DRIFT_RESOLUTION_FAILED` | failure |

The success-with-warning label names the follow-up step that failed (FR-020).

**Rationale**: Directly from FR-020 and the `UserEmailChangeAuditOutcome` enum (097
contract §1). Drift outcomes are classed `failure` because they signal an account
state that needs admin attention.

## D12 — Post-success refresh (no optimistic update)

**Decision**: On a successful change the feature hook refetches `platformAdminUsersList`
(so the users list reflects the new email — FR-011), `LatestUserEmailChangeAuditEntry`
(so an open dialog's drift state stays current), and `UserEmailChangeAuditEntries` (so
an open history view stays current), by operation name via `refetchQueries`. No
displayed email is changed before the server confirms (FR-009) — there is no
`useOptimistic`. A success notification (`useNotification('...', 'success')`) shows the
new email and a note that the user has been emailed (FR-010, FR-012).

**Rationale**: FR-009 forbids optimistic updates. The user record is normalized in
the Apollo cache by `id`; refetching the user query (or the users-list query) updates
all observers without manual refresh.

## D13 — MUI vs CRD (constitution deviation)

**Decision**: The new history page and dialogs are built in **MUI** (`@mui/*`,
`src/core/ui/*`), not the CRD design system.

**Rationale / justification**: Constitution Architecture Standard #2 says "New pages
MUST use the CRD design system." This feature deviates, justified and spec-sanctioned:
- The entire `/admin/*` route tree is MUI and is **not** gated by the CRD
  design-version toggle (`useCrdEnabled`); there is no CRD admin routing or layout.
- Spec A8 (a recorded clarification) explicitly mandates the existing MUI
  platform-administration area and excludes CRD for this feature.
- A lone CRD page inside an otherwise-MUI route tree would need CRD admin
  routing/layout infrastructure that does not exist, for no functional benefit.
- This is consistent with the standard's own carve-out: "existing MUI pages remain
  until migrated" — the admin area is the unmigrated MUI surface.

Logged in the Constitution Check and Complexity Tracking of `plan.md`.

## D14 — React 19 concurrency

**Decision**: The long-running change mutation (synchronous server call, worst case
~5–10s under Kratos retry) uses the mutation's `loading` flag to drive a pending
indicator and disable the submit control until the server responds (FR-008, SC-009).
Rendering stays pure; fallback/pending states are explicit.

**Rationale**: Constitution II. `useOptimistic` is explicitly excluded by FR-009.
The mutation `loading` boolean (optionally wrapped in `useTransition` for the submit
action) is concurrency-safe and matches the in-repo `useLoadingState` pattern. Manual
`useMemo`/`useCallback` are not used — the React Compiler handles memoization.

## D15 — Platform-admin "user email changed" notification preference

**Decision**: Server spec 097 adds a `userEmailChanged` channel to the platform-admin
notification settings (`UserSettings.notification.platform.userEmailChanged`,
`{ email, inApp, push }`). The client threads this new preference through every
existing platform-admin notification surface rather than building anything bespoke:

- GraphQL: add the `userEmailChanged` selection to `userSettingsFragment.graphql` and
  `updateUserSettings.graphql`.
- MUI admin settings: `UserAdminNotificationsPage.tsx`,
  `CombinedPlatformNotificationsSettings.tsx`, and the
  `PlatformAdminNotificationSettings` model — `userEmailChanged` joins the existing
  `userProfileCreated` / `userProfileRemoved` / `userGlobalRoleChanged` / `spaceCreated`
  set (it is grouped with the "triple-switch" admin settings).
- CRD settings: `notificationPayloadBuilders.ts` and `userNotificationsMapper.ts` under
  `src/main/crdPages/topLevelPages/userPages/settings/notifications/`.
- i18n: a new label in `translation.en.json`
  (`...platformAdmin.settings.adminUserEmailChanged`) and in the CRD
  `contributorSettings` namespace.

**Rationale**: The preference is plain plumbing over the regenerated schema — the
established pattern is "one entry per platform-admin notification setting across the
same handful of files." It is the recipient-side counterpart to FR-031: the server
emits the global-admin notification on a successful change; this preference lets each
admin opt in or out.

**Note**: This is the only part of the feature that touches a CRD surface
(`src/main/crdPages/`). It does not breach spec A8 — A8 concerns where the *change
feature itself* is built (the MUI admin area); the notification preference simply
extends a pre-existing setting that already has both MUI and CRD renderings.
