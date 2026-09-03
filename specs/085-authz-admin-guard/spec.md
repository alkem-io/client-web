# Feature Specification: Permission-Aware Authorization Admin UI

**Feature Branch**: `085-authz-admin-guard`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "for the admin of authorizations on the platform, as shown in the attached image, when the user can see the page but does not have rights to do it on the backend the operation silently fails. I would like to first make sure that the user gets an error pop up that the operation failed, but more importantly that the button to add the user is disabled with a hover stating that the user does not have the correct privilege. The privilege to check in this case is UPDATE."

## Clarifications

### Session 2026-04-15

- Q: Which privilege must the current user hold on the entity for the "Add user" action to be enabled? → A: GRANT (correction of the initial input, which said UPDATE). **Superseded 2026-09-03**: verified against the running backend, the platform role set enforces `GRANT_GLOBAL_ADMINS`, not `GRANT`. FR-012 governs — the token is per-surface and determined by the resolver.
- Q: What is the scope of pages this change should cover? → A: Every page in the app where an "Add user" control exists — treat silent failure as a global bug and apply the disable+tooltip+error pattern consistently wherever role/user assignment controls appear.
- Q: Is there existing prior art in the codebase for this pattern? → A: The Platform Admin "Conversions & Transfer" tab's callout-transfer feature (`src/domain/platformAdmin/management/transfer/transferCallout/`) already reads `authorization.myPrivileges` to gate its action button (using `TransferResourceOffer` on the source and `TransferResourceAccept` on the target). It is a **different use case** and is **out of scope** for this feature — it is NOT to be migrated onto the shared pattern. It should be treated as reference material only: its approach to reading privileges from GraphQL informs this feature's design. If — and only if — aligning it to the same hover/focus tooltip feedback pattern is cheap and non-disruptive, it MAY be updated as a nice-to-have; otherwise it is left alone.

### Session 2026-09-02

- Q: Where should permission-error feedback be produced — the global Apollo error handler or the individual mutation call sites? → A: At the mutation call sites. The global Apollo error link (`useErrorHandlerLink`) currently suppresses `FORBIDDEN` / `FORBIDDEN_POLICY` from the toast pipeline for all operations; that suppression stays as-is and MUST NOT be changed by this feature. Each role-assignment mutation covered here wires its own error handling to the existing notification helper. (FR-006 later narrowed this: the call site notifies for authorization codes only, since the global handler already covers every other failure class and a second notification would duplicate it.)
- Q: Which actions does the pattern cover — only "add user", or removal and other contributor types too? → A: Both assignment and removal, across every contributor type (user, organization, virtual contributor, platform role) — i.e. all eight mutations exposed by `useRoleSetManagerRolesAssignment`. Add and remove controls render in the same component and are gated by the same privilege, so covering only one would leave a visibly inconsistent page. Invitation flows (`src/domain/community/inviteContributors/`) are a separate mutation family and are out of scope.
- Q: What should the disabled-control tooltip say — plain language, or should it name the required privilege? → A: Plain language only, with no privilege token exposed (e.g. "You don't have permission to change members of this role."). `GRANT` is an internal authorization token that is meaningless to end users. A single surface-agnostic string is used; no escalation target is named, because the correct one differs per surface (platform vs. space vs. organization admin).
- Q: How should the success criteria that cannot be verified at merge time be handled? → A: Split them. SC-002 and SC-003 are kept verbatim but explicitly labelled trailing indicators that are observed after release and do NOT gate the PR; a set of deterministic, test-verifiable criteria is added alongside them as the merge gate.
- Q: When the backend rejects an action the UI believed was permitted (stale privileges), should the client automatically refresh privilege state? → A: No. The error notification is shown and nothing else happens — no refetch, no cache eviction. The control corrects itself the next time the page loads or the user navigates. Automatic recovery is explicitly out of scope.

## User Scenarios & Testing *(mandatory)*

> **Note on the privilege token**: both stories are written against the platform authorization admin page, whose token is `GRANT_GLOBAL_ADMINS` (confirmed against the backend; see research.md). Other covered surfaces enforce more granular tokens (e.g. `ROLESET_ENTRY_ROLE_ASSIGN`); FR-012 governs those, and the scenarios below read identically with each surface's own token substituted.

### User Story 1 - Prevent silent failures with visible error feedback (Priority: P1)

A platform user visits the authorization admin page for an entity (e.g., a role-set or credential assignment). They attempt to add a user to a role. If the backend rejects the action because their account lacks the required privilege, the UI must surface a clear error message instead of failing silently. The user learns that the action did not succeed and understands it was a permission problem.

**Why this priority**: This closes a confusing bug where users believe their change was applied but the backend silently refused it. Without this, data-integrity expectations are broken — the list appears unchanged and no explanatory feedback is given. This is the baseline correctness fix.

**Independent Test**: Log in as a user who can view the authorization admin page but who does not hold the `GRANT` privilege on the target entity. Attempt to add a user to a role. Verify that a visible, dismissible error message appears stating the operation failed due to insufficient privileges, and the roster remains unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing the authorization admin page without `GRANT` privilege on the entity, **When** they submit an "add user to role" action and the backend returns an authorization error, **Then** the UI displays a clearly worded error notification naming the failure as a permission issue and the list of assigned users is not visually modified.
2. **Given** any backend failure during an add-user action (authorization or otherwise), **When** the request fails, **Then** the user sees an error notification rather than a silent no-op.
3. **Given** a user with the `GRANT` privilege performs the same action successfully, **When** the backend confirms the change, **Then** no error is shown and the roster reflects the update.

---

### User Story 2 - Disable role-assignment actions when the user lacks privilege (Priority: P1)

When the current user does not hold the `GRANT` privilege on the entity shown on the authorization admin page, the role-assignment controls on that page — the "Add" button and each per-member "Remove" control — must be rendered disabled. Hovering or focusing the disabled control must reveal a tooltip explaining that the user does not have the required privilege to perform the action. This prevents the user from attempting an action they cannot complete and communicates the reason up front.

**Why this priority**: This is the primary UX improvement the feature is about. Preventing the attempt is better than handling the failure. Both P1 stories together deliver the complete solution — Story 2 stops the attempt, Story 1 is the safety net if the UI privilege check is ever out of sync with backend state.

**Independent Test**: Log in as a user without the required privilege on the target entity and navigate to its authorization admin page. Verify that the "Add" control and every per-member "Remove" control are visibly disabled, cannot be activated by click or keyboard, and show an explanatory tooltip on hover/focus stating in plain language that permission is missing.

**Acceptance Scenarios**:

1. **Given** the authorization admin page is loaded for an entity on which the current user does not have the `GRANT` privilege, **When** the page renders, **Then** the "Add user" button appears in a disabled state.
2. **Given** the "Add user" button is disabled due to missing privilege, **When** the user hovers or keyboard-focuses the button, **Then** a tooltip is shown explaining in plain language that the user does not have permission to change the role's members.
3. **Given** the "Add user" button is disabled, **When** the user clicks or activates it via keyboard, **Then** no dialog opens and no request is sent.
4. **Given** the current user holds the `GRANT` privilege on the entity, **When** the page renders, **Then** the "Add user" button is enabled, has no blocking tooltip, and functions normally.
5. **Given** the current user does not hold the `GRANT` privilege, **When** the page renders the list of current role members, **Then** each per-member "Remove" control is likewise disabled and carries the same explanatory tooltip.

---

### Edge Cases

- The entity's authorization metadata is not yet loaded when the page renders: the action control must default to disabled (with a neutral "checking permissions" indication) until privileges are known, rather than appearing enabled and then flipping to disabled.
- The user's privileges change during the session (e.g., a role is revoked elsewhere): if the backend rejects an action despite the UI allowing it, the error notification from Story 1 is shown and nothing further happens. The stale control is not automatically corrected — it re-renders in its correct disabled state on the next page load or navigation.
- The entity does not expose a privilege list at all (unexpected backend response): the control is disabled with a tooltip indicating privileges could not be verified, and no request is attempted.
- The page contains multiple authorization controls with differing privilege requirements: each control is evaluated independently against the privilege its own action requires; a missing privilege disables only the controls that depend on it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A surface MUST determine whether the current user holds the privilege its backend enforces for the action (see FR-012) on the entity being administered, before rendering role-assignment controls in an interactive state. On the platform authorization admin page this is `GRANT_GLOBAL_ADMINS`; other surfaces enforce more granular tokens such as `ROLESET_ENTRY_ROLE_ASSIGN`.
- **FR-002**: When the current user does not hold the required privilege on the entity, every role-assignment control on the page — both the "Add" control and the per-member "Remove" control, for all contributor types — MUST be rendered in a disabled state that cannot be activated by mouse, keyboard, or assistive technology. The control itself is genuinely disabled — visibly greyed and non-activatable — and FR-003's explanatory tooltip is therefore carried by a focusable wrapper around it, which is how FR-004's keyboard reachability is satisfied without leaving the control activatable.
- **FR-003**: A disabled role-assignment control MUST display, on hover and on keyboard focus, a tooltip stating in plain language that the user lacks permission for the action. The tooltip MUST NOT expose internal privilege tokens (such as `GRANT`) and MUST NOT name an escalation target, so that one surface-agnostic string serves every covered surface.
- **FR-004**: The tooltip text MUST be accessible to screen readers and conform to the platform's accessibility standards (WCAG 2.1 AA), including being reachable via keyboard focus.
- **FR-005**: When a role-assignment control is disabled due to missing privilege, the system MUST NOT send any backend request if the user attempts to activate it.
- **FR-006**: When any role-assignment request to the backend fails for any reason (authorization, validation, network, server), the user MUST see exactly one visible, dismissible error notification; silent failure is not permitted, and neither is double-notification. The notification is produced by whichever of two mechanisms owns that failure class, and the two MUST remain mutually exclusive:
  - **Authorization failures** (`FORBIDDEN`, `FORBIDDEN_POLICY`) are notified at the mutation call site — the hook owning the assignment mutation — because the platform's global error handler deliberately filters these codes out of its pipeline (see FR-014).
  - **All other failure classes** (validation, network, server) are already notified by that global handler and MUST NOT also be notified at the call site.
- **FR-007**: Error notifications for permission-related backend rejections MUST clearly communicate that the failure was due to insufficient privileges, distinct from generic network or server errors.
- **FR-008**: While the entity's privilege information is still loading, role-assignment controls MUST render in the same disabled state as FR-002, carrying a neutral "checking permissions" message rather than a permission-denied one. Where the privilege information is absent entirely (Edge Case 3), they MUST render disabled with a distinct "permissions could not be verified" message. In neither case may a control render enabled first.
- **FR-009**: When a user holds the required privilege, the existing enabled behavior of the role-assignment controls and their flows MUST be preserved with no regression.
- **FR-010**: Privilege evaluation for UI enablement MUST use the same privilege semantics the backend uses to authorize the action, so that the UI state and backend decision agree in the common case.
- **FR-011**: The disable-with-tooltip + error-on-failure pattern MUST be applied to every page in the app exposing a role-assignment control — assignment or removal, for any contributor type (user, organization, virtual contributor, platform role) — not only to a single admin page. An inventory of such surfaces MUST be produced during planning and each surface MUST be covered.
- **FR-012**: The privilege gating a role-assignment control is determined per surface by the privilege its backend resolver actually enforces for that action — it is not a single platform-wide constant. Each surface MUST check that privilege (or that set of privileges, where more than one is required). `GRANT` is one such token, used on the platform authorization admin page; other surfaces enforce more granular tokens. The pattern (disable + tooltip + error fallback) is identical regardless of which token applies.
- **FR-013**: The callout-transfer feature on the Platform Admin "Conversions & Transfer" tab is **out of scope** — its control and behavior MUST NOT be modified by this feature. It MAY serve as a reference implementation for reading `authorization.myPrivileges`. Optionally (nice-to-have, not required), if aligning its disabled-button feedback to the new hover/focus tooltip pattern can be done without altering its different use case and without disruptive rework, it MAY be updated to match; otherwise it stays as-is.
- **FR-014**: The platform's global Apollo error handler MUST NOT be modified by this feature. Its existing suppression of authorization error codes (`FORBIDDEN`, `FORBIDDEN_POLICY`) from the global toast pipeline is deliberate — it prevents unreadable-content queries from producing user-facing noise — and MUST remain in place. Covered surfaces therefore supply their own error notification rather than relying on the global handler.
- **FR-015**: Invitation flows (`src/domain/community/inviteContributors/`) are out of scope for this feature. They use a different mutation family with its own privilege semantics; if they exhibit the same silent-failure behavior, that is tracked separately.
- **FR-016**: When a covered mutation is rejected because the user's privileges have changed since the page loaded, the system MUST show the error notification and MUST NOT trigger any automatic refetch, cache eviction, or re-render of the control into its corrected state. Privilege state is refreshed only by the next page load or navigation.
- **FR-017**: Two further role-assignment paths are out of scope: a user removing their own membership from a space (self-service departure, not administration of another contributor), and role assignment performed as a step inside the virtual-contributor creation wizard (not a roster control). Neither is a roster administration surface; if either exhibits silent failure, it is tracked separately.

### Key Entities *(include if feature involves data)*

- **Authorization-administered entity**: The object whose role/user assignments are being managed on the page (for example, a role set governing membership of a space or organization). Carries the set of privileges granted to the current user for this entity, whichever tokens those are (see FR-012).
- **Current user privileges on entity**: The list of privilege tokens (e.g., `READ`, `UPDATE`, `GRANT`) the current user holds for the administered entity. Used to drive both UI enablement and the backend's authorization decision.
- **Role assignment action**: A user-initiated operation that changes role membership on the entity — assigning a contributor to a role or removing one from it, for any contributor type (user, organization, virtual contributor, platform role). Requires the privilege the backend enforces for that action on the entity (see FR-012) to succeed.

## Success Criteria *(mandatory)*

### Merge Gate — deterministic, verified before the PR lands

- **SC-001**: Zero silent failures — every failed role-assignment mutation (assign or remove) on a covered surface produces a visible, dismissible error notification. Verified by automated test.
- **SC-004**: The privilege check introduces no additional network request on any covered surface — enablement is derived from data the page already loads. Verified by asserting the query count on a covered surface is unchanged.
- **SC-005**: Accessibility review confirms the disabled control and its explanatory tooltip meet WCAG 2.1 AA, including keyboard focusability and screen-reader announcement of the reason.
- **SC-006**: A role-assignment control is never interactive while the user's privileges are unknown or known to lack the required privilege — there is no intermediate render in which the control is enabled. Verified by automated test.
- **SC-007**: Activating a disabled role-assignment control by mouse or keyboard dispatches no mutation. Verified by automated test.

### Trailing Indicators — observed after release; do NOT gate the PR

- **SC-002**: Users without the required privilege encounter the disabled, tooltip-explained control before attempting the action in at least 95% of sessions (the privilege check resolves before the user clicks in the vast majority of cases).
- **SC-003**: Support and bug reports describing "I clicked Add user and nothing happened" on the authorization admin page drop to zero within one release cycle after the change ships.

## Assumptions

- Scope covers every page in the app where an "Add user" (or equivalent role/user assignment) control exists — platform authorization admin, organization admin, space/community admin, and any other role-set surface. Silent failure is treated as a global bug, and planning will produce the authoritative inventory of affected surfaces.
- Scope is defined by the **action**, not by the privilege token. Every role-assignment control is in scope whatever privilege its backend enforces — `GRANT`, `ROLESET_ENTRY_ROLE_ASSIGN`, `ROLESET_ENTRY_ROLE_ASSIGN_ORGANIZATION`, or a combination. Controls governing other actions on the entity (editing its own fields via `UPDATE`, deleting it via `DELETE`) are out of scope for this change; if they silently fail too, the same pattern applies to them under separate work.
- The privilege data is already available client-side on the primary surface: `useRoleSetManager` runs the `RoleSetAuthorization` query and returns the role set's `myPrivileges`, and the authorization admin page already consumes that hook. No new query, no codegen run, and no backend change is required there. Other surfaces identified during planning MUST be checked individually; any that do not already fetch `authorization { myPrivileges }` need their existing `.graphql` document extended rather than a new query added.
- Error notifications use the platform's existing notification/toast mechanism and its existing wording conventions; no new notification system is introduced. The mechanism is invoked directly by the covered mutation hooks, because the global Apollo error link filters authorization errors out of that pipeline by design.
