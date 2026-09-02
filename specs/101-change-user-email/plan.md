# Implementation Plan: Platform-Admin Change User Login Email (Web Client)

**Branch**: `101-change-user-email` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/101-change-user-email/spec.md`

## Summary

Add a platform-admin capability to change any user's **login email** from the global
administration users area, plus a paginated email-change **history** view and a
**drift-resolution** flow. The client consumes the already-deployed server surface
from spec 097 — no server changes.

Per stakeholder decision (and the updated spec), the entry point is a **per-user row
action** in the `/admin/users` list: an email action control on each user's row,
before the existing license-plan and delete actions, enabled only for platform
administrators (grayed out otherwise). Activating it opens a destructive-confirmation
**change dialog** (current email read-only, new-email input, re-typed confirmation
input, a **reason & approval** section — required reason plus approver name/role and
optional approver organization — session-end warning, typed inline errors). The dialog
links to a dedicated **history route** and surfaces a **drift banner + Resolve** when
the user is drifted (the drift state is queried on demand only when the dialog opens).

The branch also threads a new server-097 platform-admin **`userEmailChanged`
notification preference** through the existing user notification-settings surfaces
(MUI admin and CRD), so an administrator can opt in to being notified when any user's
login email changes.

The feature is built in the existing MUI platform-administration area
(`src/domain/platformAdmin/`, `src/core/ui/`), consistent with spec assumption A8.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled)
**Primary Dependencies**: Apollo Client (GraphQL), MUI + Emotion, Formik + Yup,
react-i18next, react-router-dom — all already in the project; **no new dependencies**
**Storage**: None client-side. All state server-owned (spec 097), accessed via
GraphQL; Apollo normalized cache only
**Testing**: Vitest + jsdom (`pnpm vitest run`)
**Target Platform**: Browser SPA served by Vite (dev `localhost:3001`, backend
`localhost:3000`); browser features must have >90% global support
**Project Type**: Single web client (this repository)
**Performance Goals**: A routine change completes in <1 min of admin time excluding
server processing (SC-008); pending indicator visible for the full server wait, no
duplicate submit (SC-009, worst case ~5–10s under Kratos retry)
**Constraints**: No optimistic UI (FR-009); `EMAIL_CHANGE_CONFLICT` message leaks
nothing about the holder (FR-014, SC-004); English-only copy via `t()` /
`translation.en.json` (FR-029); WCAG 2.1 AA; no manual `useMemo`/`useCallback`/`memo`
**Scale/Scope**: ~1 modified list page, ~1 new route/page, 2 dialogs, ~4 feature
hooks, 4 `.graphql` documents, ~3 small presentational components; plus the FR-031
`userEmailChanged` notification preference threaded through ~8 existing
notification-settings files; admin-only, low-traffic surface

**Unknowns**: None outstanding. The three open design points raised by the row-action
pivot (spec consistency, history entry point, drift surfacing) were resolved with the
stakeholder on 2026-05-20 and folded into `spec.md` and `research.md`.

## Constitution Check

*GATE: re-checked after Phase 1 design — PASS with one documented, justified deviation.*

| Principle / Standard | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | Business logic (mutations, error mapping, outcome classification, drift derivation) lives in `src/domain/platformAdmin/domain/users/emailChange/` façade hooks. Dialogs/lists are presentational, consuming hooks + plain view models. |
| II. React 19 Concurrent UX | PASS | Pending state from the mutation `loading` flag drives the indicator and disables submit (FR-008); explicit fallback/empty/loading states; no optimistic update (FR-009); rendering pure; no manual memoization (React Compiler). |
| III. GraphQL Contract Fidelity | PASS | 4 colocated `.graphql` documents → generated hooks only; `pnpm codegen` run and generated artifacts committed. No schema change (consuming deployed 097). |
| IV. State & Side-Effect Isolation | PASS | State in Apollo cache; effects confined to feature hooks; `skipGlobalErrorHandler` is a supported operation-context flag, not a workaround. |
| V. Experience Quality & Safeguards | PASS | WCAG: dialog labelling/focus, disabled control has an accessible label/tooltip, radio group for Resolve. Vitest covers error mapping, outcome classification, form schema, drift derivation. |
| Arch. Std #2 — new pages use CRD | **DEVIATION** | The new history page is MUI. Justified — see Complexity Tracking + research.md D13. |
| Arch. Std #3 — i18n, no hard-coded copy | PASS | All copy via `t()`; English keys added only to `translation.en.json` (D10); FR-029 satisfied. |
| Arch. Std #5 — no barrel exports | PASS | Explicit file-path imports throughout. |
| Arch. Std #6 — SOLID / DRY | PASS | Data hooks vs presentational components (SRP); shared error map & outcome map (DRY); components depend on hook abstractions (DIP). |
| Workflow #3 — domain-first | PASS | Task order: `.graphql` + façade hooks → codegen → UI. |
| Workflow #5 — root cause before fixes | PASS | No `fetchPolicy`/retry workarounds; `skipGlobalErrorHandler` and per-row drift query are deliberate, documented design choices. |

**Gate result**: PASS. The single deviation (MUI history page vs CRD) is spec-sanctioned
(A8) and recorded below; no unresolved violation blocks Phase 2.

## Project Structure

### Documentation (this feature)

```text
specs/101-change-user-email/
├── plan.md              # This file
├── research.md          # Phase 0 — technical decisions D1–D14
├── data-model.md        # Phase 1 — entities + client view models
├── quickstart.md        # Phase 1 — build/run/verify guide
├── contracts/
│   └── graphql.md        # Phase 1 — the 4 client GraphQL documents
├── checklists/
│   └── requirements.md  # Pre-existing spec quality checklist
└── tasks.md             # Phase 2 — created by /speckit.tasks (NOT this command)
```

### Source Code (repository root)

```text
src/domain/platformAdmin/domain/users/emailChange/        # NEW — feature folder (domain façade + UI)
├── AdminUserEmailChange.graphql                          # mutation
├── AdminUserEmailChangeDriftResolve.graphql              # mutation
├── UserEmailChangeAuditEntries.graphql                   # paginated query
├── LatestUserEmailChangeAuditEntry.graphql               # query
├── useChangeUserEmail.ts                                 # façade: change mutation + typed-error mapping + refetch
├── useResolveUserEmailDrift.ts                           # façade: drift-resolve mutation + typed-error mapping
├── useUserEmailChangeHistory.ts                          # façade: paginated audit query (load-more)
├── useLatestUserEmailChangeOutcome.ts                    # façade: latest entry → DriftStateView
├── emailChangeErrorMapping.ts                            # extensions.code → translation key
├── emailChangeOutcome.ts                                 # outcome enum → label + success/warning/failure class
├── UserEmailChangeRowAction.tsx                          # row email icon, owns dialog open state
├── ChangeUserEmailDialog.tsx                             # change dialog: Formik form, typed errors, drift banner, history link
├── ResolveEmailDriftDialog.tsx                           # drift-resolution dialog: 2-choice radio
├── EmailChangeHistoryList.tsx                            # presentational paginated history list
├── EmailChangeOutcomeChip.tsx                            # presentational outcome chip (3 variants)
└── *.test.ts(x)                                          # Vitest: error map, outcome map, form schema, drift derivation

src/domain/platformAdmin/domain/users/pages/
└── UserEmailChangeHistoryPage.tsx                        # NEW — dedicated MUI history route page (AdminLayout)

src/domain/platformAdmin/domain/users/routing/
└── UsersRoute.tsx                                        # MODIFIED — add ":userId/email-history" route (userId = UUID)

src/domain/platformAdmin/domain/users/
└── useAdminGlobalUserList.tsx                            # MODIFIED — expose user id + email on row items

src/domain/shared/components/SearchableList/
└── SimpleSearchableTable.tsx                            # MODIFIED — add optional `email` to SearchableListItem

src/core/apollo/config/
└── typePolicies.ts                                       # MODIFIED — `merge: true` on PlatformAdminQueryResults (co-resident platformAdmin selections)

src/main/admin/users/adminUsers/
└── AdminUsersPage.tsx                                    # MODIFIED — render UserEmailChangeRowAction in getActions (before license); pass platform-admin privilege

src/core/i18n/en/
└── translation.en.json                                  # MODIFIED — emailChange.* keys + platformAdmin.settings.adminUserEmailChanged

src/domain/community/userAdmin/                           # MODIFIED — `userEmailChanged` platform-admin notification preference (FR-031)
├── graphql/userSettingsFragment.graphql                  # MODIFIED — select userEmailChanged channels
├── graphql/updateUserSettings.graphql                    # MODIFIED — select userEmailChanged channels
├── tabs/UserAdminNotificationsPage.tsx                   # MODIFIED — apply/build userEmailChanged setting
├── tabs/components/CombinedPlatformNotificationsSettings.tsx # MODIFIED — userEmailChanged option + grouping
└── tabs/model/NotificationSettings.model.ts              # MODIFIED — userEmailChanged on PlatformAdminNotificationSettings

src/main/crdPages/topLevelPages/userPages/settings/notifications/  # MODIFIED — CRD notification settings
├── notificationPayloadBuilders.ts                        # MODIFIED — build userEmailChanged channel
└── userNotificationsMapper.ts                            # MODIFIED — map userEmailChanged row

src/crd/i18n/contributorSettings/
└── contributorSettings.en.json                           # MODIFIED — userEmailChanged label

src/core/apollo/generated/
└── graphql-schema.ts, apollo-hooks.ts, apollo-helpers.ts # REGENERATED by pnpm codegen — committed
```

**Structure Decision**: Single web client. The feature is a self-contained slice
under `src/domain/platformAdmin/domain/users/emailChange/` (matches Constitution
Architecture Standard #1 — domain logic in `src/domain/<context>`). The thin `src/main`
touch points are the existing admin users page and route tree. This mirrors how the
sibling features in `src/domain/platformAdmin/domain/users/` are organised.

## Phase summary

- **Phase 0 (research.md)** — DONE. 14 technical decisions resolved against the live
  codebase; no NEEDS CLARIFICATION remain.
- **Phase 1 (data-model.md, contracts/graphql.md, quickstart.md)** — DONE. Entities,
  client view models, the 4 GraphQL documents, and the verification guide are
  defined. Agent context updated via `.specify/scripts/bash/update-agent-context.sh`.
- **Phase 2 (tasks.md)** — NOT in scope of `/speckit.plan`. Run `/speckit.tasks` to
  generate the dependency-ordered task list. Expected task ordering (domain-first,
  Workflow #3): (1) author the 4 `.graphql` documents → `pnpm codegen` → commit
  generated artifacts; (2) `emailChangeErrorMapping` + `emailChangeOutcome` + their
  tests; (3) façade hooks (`useChangeUserEmail`, `useResolveUserEmailDrift`,
  `useUserEmailChangeHistory`, `useLatestUserEmailChangeOutcome`); (4) presentational
  components + dialogs; (5) row action wiring in `AdminUsersPage` /
  `useAdminGlobalUserList`; (6) history route + page in `UsersRoute`; (7) i18n keys;
  (8) tests + manual verification per `quickstart.md`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| New page (`UserEmailChangeHistoryPage`) built in MUI, deviating from Arch. Std #2 ("new pages MUST use CRD") | The `/admin/*` route tree is entirely MUI and is not gated by the CRD design-version toggle; spec A8 (a recorded clarification) mandates the existing MUI admin area for this feature. The history page must live in that tree, linked from a MUI dialog. | Building the page in CRD would require CRD admin routing + layout infrastructure that does not exist for `/admin/*`, producing one inconsistent CRD page inside an otherwise-MUI tree — more complexity, no functional benefit. The standard's own carve-out ("existing MUI pages remain until migrated") covers the unmigrated admin area. See research.md D13. |
