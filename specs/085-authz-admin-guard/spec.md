# Feature Specification: Permission-Aware Authorization Admin UI

**Feature Branch**: `085-authz-admin-guard`
**Created**: 2026-04-15
**Status**: Draft
**Input**: User description: "for the admin of authorizations on the platform, as shown in the attached image, when the user can see the page but does not have rights to do it on the backend the operation silently fails. I would like to first make sure that the user gets an error pop up that the operation failed, but more importantly that the button to add the user is disabled with a hover stating that the user does not have the correct privilege. The privilege to check in this case is UPDATE."

## Clarifications

### Session 2026-04-15

- Q: Which privilege must the current user hold on the entity for the "Add user" action to be enabled? → A: GRANT (correction of the initial input, which said UPDATE)
- Q: What is the scope of pages this change should cover? → A: Every page in the app where an "Add user" control exists — treat silent failure as a global bug and apply the disable+tooltip+error pattern consistently wherever role/user assignment controls appear.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prevent silent failures with visible error feedback (Priority: P1)

A platform user visits the authorization admin page for an entity (e.g., a role-set or credential assignment). They attempt to add a user to a role. If the backend rejects the action because their account lacks the required privilege, the UI must surface a clear error message instead of failing silently. The user learns that the action did not succeed and understands it was a permission problem.

**Why this priority**: This closes a confusing bug where users believe their change was applied but the backend silently refused it. Without this, data-integrity expectations are broken — the list appears unchanged and no explanatory feedback is given. This is the baseline correctness fix.

**Independent Test**: Log in as a user who can view the authorization admin page but who does not hold the `GRANT` privilege on the target entity. Attempt to add a user to a role. Verify that a visible, dismissible error message appears stating the operation failed due to insufficient privileges, and the roster remains unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing the authorization admin page without `GRANT` privilege on the entity, **When** they submit an "add user to role" action and the backend returns an authorization error, **Then** the UI displays a clearly worded error notification naming the failure as a permission issue and the list of assigned users is not visually modified.
2. **Given** any backend failure during an add-user action (authorization or otherwise), **When** the request fails, **Then** the user sees an error notification rather than a silent no-op.
3. **Given** a user with the `GRANT` privilege performs the same action successfully, **When** the backend confirms the change, **Then** no error is shown and the roster reflects the update.

---

### User Story 2 - Disable the "Add user" action when the user lacks privilege (Priority: P1)

When the current user does not hold the `GRANT` privilege on the entity shown on the authorization admin page, the "Add user" button (and equivalent role-assignment controls on that page) must be rendered disabled. Hovering or focusing the disabled control must reveal a tooltip explaining that the user does not have the required privilege to perform the action. This prevents the user from attempting an action they cannot complete and communicates the reason up front.

**Why this priority**: This is the primary UX improvement the feature is about. Preventing the attempt is better than handling the failure. Both P1 stories together deliver the complete solution — Story 2 stops the attempt, Story 1 is the safety net if the UI privilege check is ever out of sync with backend state.

**Independent Test**: Log in as a user without `GRANT` privilege on the target entity and navigate to its authorization admin page. Verify that the "Add user" control is visibly disabled, cannot be activated by click or keyboard, and shows an explanatory tooltip on hover/focus naming the missing privilege.

**Acceptance Scenarios**:

1. **Given** the authorization admin page is loaded for an entity on which the current user does not have the `GRANT` privilege, **When** the page renders, **Then** the "Add user" button appears in a disabled state.
2. **Given** the "Add user" button is disabled due to missing privilege, **When** the user hovers or keyboard-focuses the button, **Then** a tooltip is shown explaining that the user does not have the required privilege to add users.
3. **Given** the "Add user" button is disabled, **When** the user clicks or activates it via keyboard, **Then** no dialog opens and no request is sent.
4. **Given** the current user holds the `GRANT` privilege on the entity, **When** the page renders, **Then** the "Add user" button is enabled, has no blocking tooltip, and functions normally.

---

### Edge Cases

- The entity's authorization metadata is not yet loaded when the page renders: the action control must default to disabled (with a neutral "checking permissions" indication) until privileges are known, rather than appearing enabled and then flipping to disabled.
- The user's privileges change during the session (e.g., a role is revoked elsewhere): if the backend rejects an action despite the UI allowing it, the error notification from Story 1 is shown and the page state is refreshed so the control re-renders in its correct (disabled) state.
- The entity does not expose a privilege list at all (unexpected backend response): the control is disabled with a tooltip indicating privileges could not be verified, and no request is attempted.
- The page contains multiple authorization controls with differing privilege requirements: each control is evaluated independently; a missing `GRANT` privilege disables add-user / role-assignment controls only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The authorization admin page MUST determine whether the current user holds the `GRANT` privilege on the entity being administered before rendering user/role assignment controls in an interactive state.
- **FR-002**: When the current user does not hold `GRANT` on the entity, the "Add user" control (and equivalent role-assignment controls on the page) MUST be rendered in a disabled state that cannot be activated by mouse, keyboard, or assistive technology.
- **FR-003**: A disabled "Add user" control MUST display, on hover and on keyboard focus, a tooltip that clearly states the action is unavailable because the user does not have the required privilege.
- **FR-004**: The tooltip text MUST be accessible to screen readers and conform to the platform's accessibility standards (WCAG 2.1 AA), including being reachable via keyboard focus.
- **FR-005**: When the "Add user" control is disabled due to missing privilege, the system MUST NOT send any backend request if the user attempts to activate it.
- **FR-006**: When any add-user or role-assignment request to the backend fails for any reason (authorization, validation, network, server), the UI MUST present a visible, dismissible error notification to the user; silent failure is not permitted.
- **FR-007**: Error notifications for permission-related backend rejections MUST clearly communicate that the failure was due to insufficient privileges, distinct from generic network or server errors.
- **FR-008**: While the entity's privilege information is still loading or unavailable, interactive assignment controls MUST default to disabled with an appropriate non-blaming indication rather than enabled.
- **FR-009**: When a user holds the `GRANT` privilege, the existing enabled behavior of the "Add user" control and flow MUST be preserved with no regression.
- **FR-010**: Privilege evaluation for UI enablement MUST use the same privilege semantics the backend uses to authorize the action, so that the UI state and backend decision agree in the common case.
- **FR-011**: The disable-with-tooltip + error-on-failure pattern MUST be applied to every page in the app where an "Add user" (or equivalent role/user assignment) control exists, not only to a single admin page. An inventory of such surfaces MUST be produced during planning and each surface MUST be covered.
- **FR-012**: When the privilege required for a given assignment control differs from `GRANT` on a particular surface, that surface MUST check the privilege the backend actually enforces for its action; the pattern (disable + tooltip + error fallback) is the same even if the specific privilege token differs.

### Key Entities *(include if feature involves data)*

- **Authorization-administered entity**: The object whose role/user assignments are being managed on the page (for example, a role set governing membership of a space or organization). Carries the set of privileges granted to the current user for this entity, including `GRANT`.
- **Current user privileges on entity**: The list of privilege tokens (e.g., `READ`, `UPDATE`, `GRANT`) the current user holds for the administered entity. Used to drive both UI enablement and the backend's authorization decision.
- **Role assignment action**: The user-initiated operation to add a user to a role on the entity. Requires `GRANT` on the entity to succeed on the backend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero silent failures — 100% of failed add-user actions on the authorization admin page result in a visible error notification to the user.
- **SC-002**: Users without the required privilege encounter the disabled, tooltip-explained control before attempting the action in at least 95% of sessions (the privilege check resolves before the user clicks in the vast majority of cases).
- **SC-003**: Support and bug reports describing "I clicked Add user and nothing happened" on the authorization admin page drop to zero within one release cycle after the change ships.
- **SC-004**: For users who hold the required privilege, time-to-complete an add-user action does not measurably regress compared with the current implementation (no perceptible added latency introduced by the privilege check).
- **SC-005**: Accessibility review confirms the disabled control and its explanatory tooltip meet WCAG 2.1 AA, including keyboard focusability and screen-reader announcement of the reason.

## Assumptions

- Scope covers every page in the app where an "Add user" (or equivalent role/user assignment) control exists — platform authorization admin, organization admin, space/community admin, and any other role-set surface. Silent failure is treated as a global bug, and planning will produce the authoritative inventory of affected surfaces.
- The privilege token to check is `GRANT` on the administered entity (corrected during clarification; the original input said `UPDATE`). Other controls on the page that require different privileges (e.g., `UPDATE`, `DELETE`) are out of scope for this change unless they also currently silently fail — if so, the same pattern (disable + tooltip + error fallback) should be applied using the correct privilege for each.
- The backend already returns the current user's privileges on the entity as part of the data used to render the page, so no new backend capability is required. If that turns out not to be true, exposing privileges on this entity becomes a dependency.
- Error notifications use the platform's existing notification/toast mechanism and its existing wording conventions; no new notification system is introduced.
- The change applies only to the authorization admin page in scope; other pages with similar "silent failure" patterns are acknowledged but are not part of this feature.
