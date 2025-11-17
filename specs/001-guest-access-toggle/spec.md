# Feature Specification: Whiteboard Guest Access Toggle

**Feature Branch**: `[001-guest-access-toggle]`
**Created**: 2025-11-17
**Status**: Draft
**Input**: User description: "I want the Share dialog in each whiteboard to allow authorized users — those with privilege PUBLIC_SHARE (already implemented) — to enable or disable guest access using a toggle, which should have UI results based on a flag in the whiteboard data called 'guestContributionsAllowed'. When “Guest access” is toggled ON by one of these users (the share dialog already allows only users with privilege PUBLIC_SHARE this and that's the way it should stay!), the client sends a request to the backend to update the whiteboard’s access. A mutation, to be exact. If the backend confirms the update, the whiteboard will have a field 'guestContributionsAllowed' which is True. Otherwise we get it as False. Once we have it as True, the Share dialog should display a read-only public URL field to all space members. The UI must show a clear warning indicating the whiteboard is publicly accessible to guests. The warning is visible on top of the preview of the whiteboard in the top-right corner (https://www.figma.com/design/mOEXZjlXJ0I4M5HiGI0a9n/Guest-Contributions?node-id=25-2756&m=dev), and in the bottom-right corner of the whiteboard dialog when the whiteboard is open for edit (https://www.figma.com/design/mOEXZjlXJ0I4M5HiGI0a9n/Guest-Contributions?node-id=25-2565&m=dev). When the toggle is switched OFF, the Share dialog should immediately hide the public link and warning, reflecting that guest access is no longer available. The client should only show the public URL when permission is active, as confirmed by the backend (using the guestContributionsAllowed field from whiteboard data). If the backend denies a toggle request (for example, if user privileges change while the dialog is open), the UI should revert state, remove the public link, and notify the user about the change."

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Enable guest access for collaboration (Priority: P1)

Authorized whiteboard facilitators with PUBLIC_SHARE privilege can turn on guest access from the Share dialog so external guests can contribute using a public link.

**Why this priority**: Unlocking guest collaboration is the core outcome requested and delivers immediate value when implemented alone.

**Independent Test**: Open a whiteboard Share dialog as a privileged user, toggle guest access on, confirm backend acknowledgement, and verify the Share dialog surfaces the new public link and warnings without relying on other stories.

**Acceptance Scenarios**:

1. **Given** a whiteboard Share dialog opened by a PUBLIC_SHARE user and guest access currently disabled, **When** the user toggles Guest access on and the backend confirms the update, **Then** the toggle remains on, the public link field becomes visible, and the warning banner appears in the dialog.
2. **Given** the Share dialog is open for a PUBLIC_SHARE user and their privilege is revoked while interacting, **When** they toggle Guest access on but the backend denies the request, **Then** the toggle resets to off, the link stays hidden, and the user receives a notification explaining guest access could not be enabled.

---

### User Story 2 - Share link visibility for members (Priority: P2)

Space members need to see that a whiteboard is publicly accessible and copy the guest link whenever guest access is active.

**Why this priority**: Members must understand exposure risk and be able to share the link; this depends on Story 1 but can be verified independently once guest access is active.

**Independent Test**: With guest access already enabled via API, open the Share dialog and confirm any space member can read the link field and warning indicators without requiring further configuration.

**Acceptance Scenarios**:

1. **Given** guest access is active for a whiteboard, **When** any authenticated space member opens the Share dialog, **Then** they see a read-only public URL field and warning copy that the board is guest-accessible.
2. **Given** guest access is active, **When** a member copies the link, **Then** the UI confirms copy success using existing Share dialog patterns without exposing edit controls they lack permission for.

---

### User Story 3 - Revoke guest access and surface safeguards (Priority: P3)

Facilitators can turn off guest access at any time and the interface must immediately withdraw public indicators to avoid unintended exposure.

**Why this priority**: Ensures administrators can quickly mitigate exposure and is critical for risk management even though it builds on Story 1.

**Independent Test**: Start with guest access active, toggle it off, and verify the link and warnings disappear instantly while backend state and UI stay in sync.

**Acceptance Scenarios**:

1. **Given** guest access is active for a whiteboard, **When** a PUBLIC_SHARE user toggles Guest access off and the backend confirms the change, **Then** the link field and warning banners disappear from the Share dialog and editor preview.
2. **Given** guest access is active and the backend later reports it as disabled (e.g., another user disabled it), **When** the Share dialog is opened or refreshed, **Then** the toggle shows as off, the link is hidden, and no stale warning is shown.

---

### Edge Cases

- Backend returns an error or false confirmation; the UI must roll back optimistic state, hide public indicators, and explain the failure.
- Network latency or disconnect during the toggle request; the toggle should show pending feedback and resolve without leaving the dialog in an indeterminate state.
- Guest access is altered elsewhere (e.g., another facilitator or admin) while a user has the dialog open; the dialog must re-sync to the authoritative `guestContributionsAllowed` flag.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

Document how this feature satisfies the Constitution:

- **Domain boundaries**: Extend the whiteboard collaboration façade in `src/domain/collaboration/whiteboard` to expose the authoritative `guestContributionsAllowed` flag and mutation helpers, while the Share dialog UI in `src/domain/shared/components/ShareDialog` remains an orchestrator that consumes domain hooks. Ensure routed shells under `src/main` only compose these façades without embedding business rules.
- **GraphQL contract fidelity**: Update the Whiteboard fragments in `src/domain/collaboration/whiteboard/containers/WhiteboardQueries.graphql` (e.g., `WhiteboardDetails`, `CollaborationWithWhiteboardDetails`) to include `guestContributionsAllowed` and introduce the mutation document that toggles guest contributions. Regenerate types via `pnpm run codegen`, review schema diffs, and keep component props typed explicitly instead of forwarding generated types.
- **React 19 concurrency**: Handle the toggle interaction using transitions or async actions so concurrent renders never expose stale link states. Provide fallbacks while the mutation is pending and document any risks where legacy synchronous patterns remain.
- **State & side-effect isolation**: Source whiteboard state from Apollo cache updates, ensuring that cache writes after the mutation remain normalized. Avoid duplicating state in components; use domain-level hooks for data fetching and effect orchestration.
- **Experience safeguards**: Add accessible warning copy with appropriate semantics in both the Share dialog and whiteboard editor. Verify keyboard focus remains on the toggle during async updates, audit translations for new copy, and track success/failure telemetry so denials can be monitored. Include regression tests for privilege gating and UI state transitions.

### Functional Requirements

- **FR-001**: The Share dialog for a whiteboard MUST surface a Guest access toggle only to users who currently hold the PUBLIC_SHARE privilege.
- **FR-002**: When a privileged user enables Guest access, the client MUST invoke the whiteboard access mutation and persist the server-confirmed `guestContributionsAllowed` value as the single source of truth.
- **FR-003**: When `guestContributionsAllowed` is true, the Share dialog MUST display a read-only public URL field and contextual warning messaging to every authenticated member of the space.
- **FR-004**: The whiteboard editor preview and dialog MUST present a visible warning badge/banner in the locations described by the provided Figma references whenever guest access is active, and hide them immediately when the flag becomes false.
- **FR-005**: If the backend rejects a toggle request or returns `guestContributionsAllowed` as false, the UI MUST revert the toggle, remove public indicators, and notify the user about the denial without leaving stale state.
- **FR-006**: The client MUST hide the public URL and warnings whenever `guestContributionsAllowed` is false, regardless of any local optimistic state, ensuring stale data cannot expose the link.
- **FR-007**: The system MUST log or surface an analytics/telemetry event for each toggle attempt and outcome so administrators can monitor guest access changes.

_Example of marking unclear requirements:_

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities _(include if feature involves data)_

- **Whiteboard**: Collaboration artifact that now exposes `guestContributionsAllowed` to indicate whether an anonymous guest link is active, alongside existing preview and profile data.
- **Space Member**: Authenticated user scoped to the whiteboard’s parent space who may view warnings and, when permitted, enable or disable guest access via PUBLIC_SHARE privilege.
- **Guest Share Link**: Generated public URL surfaced only when the backend confirms guest contributions are allowed; must be treated as sensitive exposure information rather than a configurable resource.

### Assumptions

- The backend already exposes or will expose a mutation that accepts the desired guest access state and returns the updated whiteboard with `guestContributionsAllowed` and the canonical public URL.
- The PUBLIC_SHARE privilege gating is enforced server-side; the client change only reveals or hides controls and responds to privilege changes, without adding new authorization logic.
- Copywriting for warning banners and toggle labels can reuse existing localization patterns; new strings will be provided through the standard translation workflow without additional approval cycles.
- The public guest link is generated client-side from existing whiteboard identifiers; re-enabling guest access reuses the same deterministic URL format rather than requesting a new link from the backend.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 90% of authorized facilitators can enable guest access in under 10 seconds without encountering an error notification during usability testing.
- **SC-002**: 100% of Share dialog views with `guestContributionsAllowed = true` display both the public URL field and warning banner in the same session telemetry event.
- **SC-003**: 100% of Share dialog views with `guestContributionsAllowed = false` hide the public URL field and warning banner, ensuring no stale exposure is logged across QA test runs.
- **SC-004**: Fewer than 5% of toggle attempts generate backend denial or error outcomes in staging over a 7-day observation window; any denial produces a visible user notification captured by telemetry.

## Clarifications

### Session 2025-11-17

- Q: What should happen to the public URL if guest access is disabled then re-enabled? → A: Client generates the public URL deterministically without rotation.
