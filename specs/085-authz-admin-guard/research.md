# Phase 0 Research: Permission-Aware Authorization Admin UI

**Feature**: 085-authz-admin-guard
**Date**: 2026-04-15

## Unknowns Resolved

There were no outstanding `NEEDS CLARIFICATION` markers in the Technical Context. Research instead focused on (a) where the silent-failure pattern occurs in the codebase, (b) what privilege semantics are already available client-side, and (c) what shared helpers exist so we avoid duplication.

---

### Decision 1: Use the existing `Authorization.myPrivileges` GraphQL field

- **Decision**: Drive UI enablement from the `myPrivileges` array returned on each authorization-administered entity's `Authorization` object. Check for `AuthorizationPrivilege.Grant`.
- **Rationale**: This is the same privilege list the backend evaluates server-side, satisfying spec FR-010 (UI and backend agree by construction). It is already fetched on most relevant entities (role-sets, communities, organizations). `src/core/utils/Authorizable.ts` standardizes the shape `{ authorization?: { myPrivileges?: AuthorizationPrivilege[] } }`.
- **Alternatives considered**:
  - Adding a new backend `canAddUser` boolean field — rejected: duplicates existing data, requires schema change, and still diverges from backend-authoritative privilege evaluation.
  - Attempting the mutation optimistically and treating permission errors as the only "source of truth" — rejected: that *is* the current silent-failure bug; it provides no up-front UX feedback and violates spec FR-002.
  - Using a client-side role heuristic (e.g., "user is platform admin") — rejected: brittle and subject to drift from backend authorization rules.

### Decision 2: Privilege token is `GRANT` (corrected during clarification)

- **Decision**: The privilege checked for add-user / assign-role actions is `AuthorizationPrivilege.Grant`. Per clarification 2026-04-15, the initial input's reference to `UPDATE` was a mis-recollection.
- **Rationale**: On the platform's authorization model, `GRANT` is the privilege that allows an actor to change the membership/roles of others on an entity, which is exactly what "Add user" does. `UPDATE` governs mutation of the entity's own fields and is not the correct gate.
- **Alternatives considered**: `UPDATE` (original input — rejected by user upon re-reading), `CREATE` (wrong semantic on role-set).

### Decision 3: Scope is every app surface with an Add-user control (not only one page)

- **Decision**: Apply the disable-with-tooltip + error-on-failure pattern to every site in the app where an "Add user" (or equivalent role/user-assignment) control exists. Clarification 2026-04-15 selected this scope.
- **Rationale**: Silent failure is a systemic bug, not a single-page defect. Producing a shared hook + shared disabled-button wrapper makes broad application cheap and keeps UX consistent.
- **Alternatives considered**: Narrowing to a single admin page — rejected by user; would leave equivalent silent-failure bugs untouched elsewhere.

### Decision 4: Share one privilege hook + one disabled-with-tooltip wrapper

- **Decision**: Create `useHasPrivilege(authorizable, privilege)` in `src/domain/access/authorization/` and a `DisabledWithTooltipButton` composable. Both MUI and CRD variants of the button exist because two design systems coexist in the codebase; the hook is design-system-agnostic.
- **Rationale**: SOLID/DRY (constitution Arch Std #6a, #6f). Centralizes the check so every consumer site is a one-line change. Tooltip wrapper handles the MUI quirk that `disabled` buttons don't fire pointer events (requires a `<span>` wrapper to make the tooltip work) in one place.
- **Alternatives considered**:
  - Inlining the check in each site — rejected: duplication, drift risk.
  - A higher-order HOC — rejected: React 19 + hooks idioms prefer composition over HOC patterns.

### Decision 5: Error-toast via existing `useNotification()`

- **Decision**: Handle Apollo mutation `onError` in the role-set/role-assignment mutation hooks (e.g., `useRoleSetManagerRolesAssignment.ts`) and call `useNotification()` with severity `error`. Detect permission errors (GraphQL error code or message) to produce a distinct, permission-specific message (spec FR-007).
- **Rationale**: Keeps error handling at the mutation boundary (constitution Principle IV: side-effect isolation), reuses the canonical toast helper, and avoids ad-hoc error UI per site.
- **Alternatives considered**:
  - Handling errors in each calling component — rejected: duplicates logic; easy to forget; the current bug is exactly this pattern.
  - Adding an Apollo global error link — rejected: too broad; would spam toasts for expected/handled errors elsewhere.

### Decision 6: Loading state defaults to disabled

- **Decision**: While `authorization?.myPrivileges` is `undefined` (query in-flight or field missing), the `useHasPrivilege` hook returns `{ hasPrivilege: false, isLoading: true }` and the button renders disabled with a neutral tooltip ("Checking permissions…").
- **Rationale**: Satisfies spec FR-008 and edge case "privileges not yet loaded". Avoids the flicker-then-disable pattern where a button is briefly clickable before privileges resolve.
- **Alternatives considered**: Hide the button while loading — rejected: causes layout shift and hides the action's existence from privileged users.

### Decision 7: GraphQL documents that lack `myPrivileges` must be extended

- **Decision**: Any `.graphql` file driving an inventoried Add-user site that does not already request `authorization { myPrivileges }` on the role-set/entity MUST be extended, and `pnpm codegen` re-run. Committed alongside this feature's changes.
- **Rationale**: Constitution Principle III (GraphQL Contract Fidelity) requires schema changes/regeneration in the same PR. Most sites already request `myPrivileges`; a minority may not.
- **Alternatives considered**: Adding a separate privileges query per site — rejected: extra network round-trips and cache-key duplication for data that belongs on the already-fetched entity.

---

## Open Items For `/speckit.tasks`

- Exact list of `.graphql` files needing `myPrivileges` added — determined by inspecting each inventoried site's existing query during task breakdown.
- i18n key names for the tooltip ("…does not have the required privilege to add users") and the permission-specific error ("The operation failed: you do not have permission…") — chosen in `/speckit.tasks` to match project conventions.
- Accessibility verification steps per touched page — enumerated per site in tasks.md.
