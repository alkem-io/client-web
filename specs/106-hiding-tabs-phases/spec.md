# Feature Specification: Hiding tabs/phases

**Feature Branch**: `story/9727-hiding-tabs-phases`
**Created**: 2026-06-10
**Status**: Draft
**Input**: User description: "Hiding tabs/phases — As a space/subspace admin, I want to be able to hide a tab/phase from the UI. This is only about hiding it from the interface, not removing access to the content; people with a URL can still access the page or content inside it. Add a menu item in the phase/tab menu (space settings > Layout, and subspace 'Manage innovation flow') to hide a phase/tab, plus a confirmation dialog explaining that this only hides the tab/phase in the UI."

## Clarifications

### Session 2026-06-10

All clarifications below were resolved autonomously (YOLO mode), choosing the option most
consistent with client-web conventions and the story intent. Each records the question, the
chosen answer, and a one-line rationale.

- Q: Can an admin hide the phase that is currently the active state, and if so what do members see? → A: Hiding the active phase is allowed; members landing on the space resolve to the first *visible* phase, and admins still see (and can target) the hidden active phase in the management surface.
  - Rationale: Disallowing it would add a confusing special case; the story scopes hide as UI-only, so member navigation simply skips hidden phases and falls back to the first visible one.
- Q: When a member's requested/default phase is hidden (or all phases are hidden), what does the member-facing navigation show? → A: Navigation lists only visible phases and selects the first visible phase by default; if none are visible it shows a neutral empty state, never an error.
  - Rationale: Matches FR-006 and the "hide is non-breaking" guarantee; mirrors how the existing flow degrades when a flow has no usable state.
- Q: How does the client decide the per-phase visibility capability is available (graceful degradation trigger)? → A: Presence of the per-phase visibility field on the innovation-flow state in the GraphQL schema/response; when absent, the Hide/Show affordance is not rendered.
  - Rationale: The repo gates optional capabilities on the generated GraphQL contract (constitution III); this keeps the action from being a misleading no-op (A-002).
- Q: Which localization namespace holds the new confirmation-dialog and menu copy? → A: Legacy/MUI surface uses the main `translation` namespace (English source file only); CRD surface uses the appropriate `crd-*` namespace per CRD i18n conventions.
  - Rationale: Follows the repo's split i18n rules (Crowdin-managed `translation` vs manually-maintained `crd-*`).
- Q: Is this PR scoped to one design surface or both? → A: Implement on whichever surface(s) the innovation-flow phase menu is actually rendered for admins today; if both legacy and CRD render it, both are covered, but the work is bounded to the existing phase-menu surfaces and does not introduce new ones.
  - Rationale: Story note says "client-web only as routed"; we follow existing routing rather than building a new surface, keeping the slice tight.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin hides a phase/tab from the interface (Priority: P1)

A space or subspace admin is managing the layout of a space. One of the phases/tabs
(an innovation-flow state) is not yet ready for members to see, or is only used for
back-office content. The admin opens the per-phase menu, chooses "Hide", confirms in
a dialog that clearly explains the hide is UI-only, and the phase/tab disappears from
the navigation that members see — while the content remains reachable by direct URL.

**Why this priority**: This is the core capability the story asks for. Without it
there is no feature. It is independently shippable and demonstrable on its own.

**Independent Test**: As an admin, open Space settings > Layout (or subspace "Manage
innovation flow"), open a phase's menu, click "Hide", confirm in the dialog. Verify the
phase no longer appears in the member-facing phase navigation, and that opening the
phase's direct URL still loads its content.

**Acceptance Scenarios**:

1. **Given** an admin is on Space settings > Layout with a phase that is currently visible,
   **When** they open that phase's menu and select "Hide",
   **Then** a confirmation dialog appears explaining the action only hides the phase in the UI and that anyone with a URL can still reach the phase or its posts.
2. **Given** the confirmation dialog is shown,
   **When** the admin confirms,
   **Then** the phase is marked hidden, the dialog closes, and the phase is no longer shown in the member-facing phase/tab navigation.
3. **Given** the confirmation dialog is shown,
   **When** the admin cancels (or dismisses) the dialog,
   **Then** no change is made and the phase remains visible.
4. **Given** a subspace admin is using "Manage innovation flow",
   **When** they perform the same hide action on a phase,
   **Then** the behavior is identical to the Space settings > Layout surface.

---

### User Story 2 - Admin re-shows a previously hidden phase/tab (Priority: P2)

An admin who previously hid a phase decides it should be visible again. From the same
per-phase menu they choose to show/unhide the phase, restoring it to the member-facing
navigation. Hiding must be reversible — it is not a destructive action.

**Why this priority**: Hiding without a way to unhide would trap admins and make the
P1 action risky. Reversibility is required for the feature to be safe and complete, but
it is a distinct, smaller slice that can land just after P1.

**Independent Test**: With a phase already hidden, open its menu, choose "Show"/"Unhide",
and verify the phase reappears in the member-facing navigation.

**Acceptance Scenarios**:

1. **Given** a phase that is currently hidden,
   **When** the admin opens its menu,
   **Then** the menu offers a "Show"/"Unhide" action (the hide affordance reflects the current hidden state).
2. **Given** a hidden phase,
   **When** the admin chooses "Show"/"Unhide",
   **Then** the phase is marked visible and reappears in the member-facing phase navigation. (No confirmation dialog is required for unhiding, since it is non-destructive.)

---

### User Story 3 - Admin distinguishes hidden phases while managing layout (Priority: P3)

While managing the layout, an admin needs to tell at a glance which phases are currently
hidden, so they can reason about what members see versus what is hidden.

**Why this priority**: A clarity/affordance improvement. The feature is usable without
it, but it materially reduces admin confusion and mistakes. Lowest priority because it is
purely informational.

**Independent Test**: With at least one phase hidden and one visible, open the layout
management surface and confirm hidden phases are visually distinguished (e.g., a "Hidden"
indicator) from visible ones.

**Acceptance Scenarios**:

1. **Given** the layout management surface shows several phases, some hidden and some visible,
   **When** the admin views the list,
   **Then** each hidden phase carries a clear visual indicator that it is hidden from members.

---

### Edge Cases

- **Hiding the current/active phase**: An admin may hide the phase that is currently set as the active state. The content and active-state semantics are unchanged; only its visibility in member navigation changes. Members do not see the hidden active phase in navigation and instead resolve to the first visible phase. Admins always still see (and can target) the hidden active phase in the management surface so they retain control.
- **Hiding all phases**: If every phase is hidden, member-facing phase navigation has nothing to show. The member-facing experience MUST degrade gracefully (neutral empty state, never an error) rather than break; admins still see all phases (including hidden) in the management surface.
- **Direct URL to a hidden phase or its post**: A member with a direct URL to a hidden phase (or a post within it) can still load the content — hiding is UI-only and does not change authorization. (This is the explicit acceptance criterion from the story.)
- **Non-admin user**: A user without admin (Update) rights on the space never sees the Hide/Show menu action and cannot change phase visibility.
- **Concurrent edits**: Two admins act on the same flow; the visibility state reflects the last successful update. No data loss of phase content occurs from a hide/unhide.
- **Rapid toggle**: Hiding then immediately unhiding (or vice versa) leaves the phase in the last chosen state with the navigation consistent with it.
- **Server field not yet available**: If the persistence layer does not yet expose a per-phase visibility flag (see Dependencies), the Hide action MUST NOT silently appear to work and then lose state. The affordance is gated so it is only offered when the underlying capability is present (graceful degradation), avoiding a misleading no-op.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The per-phase/tab management menu (in Space settings > Layout, and in the subspace "Manage innovation flow" surface) MUST offer an action to hide a phase that is currently visible.
- **FR-002**: Selecting the hide action MUST present a confirmation dialog before the change is applied.
- **FR-003**: The confirmation dialog MUST explain that the action only hides the phase/tab in the UI, and that anyone who has a URL can still access the phase or any of the posts inside it. (Content access is not removed.)
- **FR-004**: Confirming the dialog MUST mark the phase as hidden and persist that state so it is consistent for all viewers of the space (not local to one device/session).
- **FR-005**: Cancelling or dismissing the confirmation dialog MUST make no change; the phase remains visible.
- **FR-006**: A hidden phase MUST NOT appear in the member-facing phase/tab navigation.
- **FR-007**: Hiding a phase MUST NOT remove or restrict access to its underlying content; the phase, and posts within it, MUST remain reachable by direct URL and authorization MUST be unchanged.
- **FR-008**: The per-phase menu MUST offer a reverse action to show/unhide a phase that is currently hidden, restoring it to the member-facing navigation. Unhiding MUST be reversible and non-destructive.
- **FR-009**: The hide/show affordance MUST reflect the phase's current visibility state (offer "Hide" when visible, "Show"/"Unhide" when hidden).
- **FR-010**: Only users with admin (space/subspace management) rights MUST be able to see and use the hide/show action; non-admins MUST NOT see it and MUST NOT be able to change phase visibility.
- **FR-011**: Admins managing the layout MUST still see hidden phases within the management surface (so they can manage and unhide them), even though members do not.
- **FR-012**: Hidden phases SHOULD be visually distinguished from visible ones within the management surface so admins can tell them apart at a glance.
- **FR-013**: The feature MUST behave identically across the two entry surfaces (Space settings > Layout and subspace "Manage innovation flow").
- **FR-014**: The feature MUST work on whichever design surface(s) the admin's phase menu is actually rendered on today (legacy and/or the new design system), consistent with the active design-version preference. The feature MUST NOT introduce a new management surface.
- **FR-015**: When a member's requested or default phase is hidden, member-facing navigation MUST select the first visible phase by default; if no phases are visible, it MUST show a neutral empty state rather than an error.
- **FR-016**: The hide/show affordance MUST be rendered only when the platform exposes a per-phase visibility capability; when that capability is absent, the affordance MUST NOT be shown (so the action is never a misleading no-op).

### Key Entities *(include if feature involves data)*

- **Phase / Tab (Innovation-flow state)**: A named stage within a space's innovation flow. Members navigate content by phase. Each phase has, among existing attributes (name, description, order, active-state membership), a **visibility** attribute indicating whether it is shown in the member-facing navigation. Hidden is a property of the phase, scoped to the space, shared across all viewers.
- **Space / Subspace**: The container whose layout (set of phases) an admin manages. Admin rights on the space gate the hide/show capability.
- **Admin (actor)**: A user with management rights over the space/subspace. Sole actor able to change phase visibility.
- **Member / Anonymous viewer (actor)**: A user without management rights. Sees only visible phases in navigation but can still open hidden content via direct URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can hide a previously-visible phase in 3 or fewer clicks from the layout management surface (open menu → choose Hide → confirm).
- **SC-002**: 100% of hide actions surface a confirmation dialog that states the hide is UI-only and that content remains reachable by URL, before any change is applied.
- **SC-003**: After an admin confirms a hide, the phase is absent from the member-facing navigation for all members on their next load of the space.
- **SC-004**: After a phase is hidden, a member following a direct URL to that phase or a post inside it still reaches the content (0% loss of content access).
- **SC-005**: An admin can reverse a hide (show/unhide) and the phase reappears in member-facing navigation, with no loss of the phase's content or settings.
- **SC-006**: Non-admin users never see the hide/show control (0% exposure to unauthorized users).
- **SC-007**: Within the management surface, an admin can correctly identify which phases are hidden in a single glance (hidden phases carry a visible indicator).

## Assumptions & Dependencies

- **A-001 (Scope — client slice)**: This story is delivered in the web client. The user-facing behavior (menu action, confirmation dialog, member-navigation filtering, admin indicator) is implemented in the client.
- **A-002 (Server dependency)**: Persisting per-phase visibility so it is shared across all viewers requires a persisted per-phase visibility attribute exposed by the platform (the innovation-flow state currently exposes only an "allow new contributions" setting and no visibility flag). This is a documented dependency. The client wires the hide/show action and member-navigation filtering against the anticipated per-phase visibility attribute and degrades gracefully — not offering the affordance — when the platform does not yet expose it, so the action is never a misleading no-op (see Edge Cases / FR-004).
- **A-003 ("Hide" = UI-only)**: Hiding never changes authorization or removes content. It only removes the phase from member-facing navigation. This is explicit in the story acceptance criteria.
- **A-004 (Admin gating)**: "Admin" means a user holding the space/subspace management (Update) privilege already used to gate innovation-flow editing today. No new role is introduced.
- **A-005 (Two surfaces, one behavior)**: "Space settings > Layout" and subspace "Manage innovation flow" are two entry points onto the same innovation-flow management; the feature behaves identically in both.
- **A-006 (Design surfaces)**: The client currently serves a legacy and a new design system selected by a per-user design-version preference. The feature is available on the surface the admin is using; copy for the confirmation dialog is fully localized via the existing localization pipeline.
- **A-007 (No confirmation on unhide)**: Showing/unhiding a phase is non-destructive and does not require a confirmation dialog; only hiding requires confirmation.

## Out of Scope

- Removing or restricting access to phase content (authorization changes). Hiding is UI-only.
- Bulk hide/show of multiple phases in one action.
- Per-member or per-role visibility (visibility is a single shared property of the phase, not audience-specific).
- Scheduling automatic hide/show (time-based visibility).
