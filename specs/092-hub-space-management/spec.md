# Feature Specification: Innovation Hub Space Management via URL

**Feature Branch**: `092-hub-space-management`  
**Created**: 2026-04-24  
**Status**: Draft  
**Server reference**: https://github.com/alkem-io/server/pull/6003

## Overview

An Innovation Hub operator must be able to add or remove a Space from their hub by entering the Space's URL directly in the Hub settings. The server enforces a two-sided authorization model: the operator must hold `UPDATE` rights on the hub, and the user initiating the action must also have sufficient authority on the target Space (a new space-side privilege). The client is responsible for URL format validation and for gating the UI behind the hub-level `UPDATE` privilege; all deeper authorization is resolved server-side.

This feature replaces the current search-dialog-based add flow (which used the generic hub-update mutation); the new flow uses a URL input with a resolve-preview-confirm pattern, and dedicated add/remove server actions. The existing search dialog and its underlying query are removed.

## Clarifications

### Session 2026-04-24

- Q: Should the new URL-based add replace the existing search dialog entirely, coexist with it, or update the dialog to use the new mutation? → A: Replace the existing search dialog entirely — URL input is the only way to add a Space, following the same UX pattern as the Transfer Space and Space promote/demote admin flows (URL entry → resolve preview → confirm action).
- Q: What should happen to drag-and-drop reordering of the space list? → A: Keep the drag-and-drop feature but handle it separately from this specification; it will require its own dedicated server action and a separate spec/feature. This spec must not include it.
- Q: Should the remove action require a confirmation step, and does it carry the same two-sided authorization checks as add? → A: Yes — a confirmation dialog is required before remove executes. The remove action enforces the same two conditions as add: the operator must hold UPDATE privilege on the Innovation Hub AND the appropriate Space-side privilege. Server returns structured errors for either failure.
- Q: Does the URL resolve/preview step require a dedicated server call, or should the URL go directly to the add mutation? → A: A dedicated server look-up step is required before confirmation. The look-up resolves the Space from the URL AND performs an early check of both privileges (hub UPDATE + Space-side). If either privilege is missing, the error is surfaced at the look-up stage — before the operator sees a confirm button — so they get immediate actionable feedback without committing the action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Space to Hub by URL (Priority: P1)

An Innovation Hub admin operator visits the hub's settings page and uses a URL input field to add a Space. They enter the Space's URL, the system resolves and previews the Space, and the operator confirms the addition. The Space then appears in the hub's member space list.

The UX follows the same two-step pattern used in Transfer Space and Space promote/demote flows: enter URL → resolve to preview → confirm.

**Why this priority**: This is the core capability of the feature. Without it, the feature delivers no value.

**Independent Test**: Can be fully tested by entering a valid Space URL, seeing the resolved Space preview, confirming the add, and verifying the Space appears in the displayed member list.

**Acceptance Scenarios**:

1. **Given** the operator is on the hub settings page and holds `UPDATE` privilege on the hub, **When** they enter a syntactically valid URL and trigger the look-up step, **Then** the server resolves the Space and checks both privileges; if both pass, a preview of the resolved Space (at minimum: name and host) is displayed alongside a confirm-add button.
2. **Given** the look-up step fails because the operator lacks the required Space-side privilege, **When** the response arrives, **Then** the error is shown immediately at the look-up stage — no confirm button is presented — with a message identifying the Space-side failure.
3. **Given** a Space preview is shown and the operator confirms the add, **When** the confirmation server call is made, **Then** the Space is added to the hub's member list and a success notification is shown; the URL input is cleared for a subsequent add.
4. **Given** the operator enters a value that is not a well-formed URL, **When** the form validates, **Then** the look-up step is blocked with an inline validation error before any server call is made.
5. **Given** the operator does not hold `UPDATE` privilege on the hub, **When** they visit the settings page, **Then** the add-Space URL input and all related controls are not rendered.

---

### User Story 2 - Remove Space from Hub (Priority: P2)

An Innovation Hub admin operator wants to remove a Space that is currently listed in the hub. They click the remove control next to that Space in the settings page. The Space is removed from the hub's member list.

**Why this priority**: Management of the hub space list requires both add and remove capability. Removing a space is equally important for ongoing hub curation.

**Independent Test**: Can be fully tested by clicking the remove action for a Space already in the hub's list and confirming that Space no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** the operator holds `UPDATE` privilege on the hub and the Space is in the hub's member list, **When** they click remove and confirm the confirmation dialog, **Then** the dedicated remove server action is called and — if both server-side checks pass — the Space is removed from the displayed list with a success notification.
2. **Given** the operator holds `UPDATE` privilege on the hub and the Space is already absent from the hub's member list, **When** the remove action is triggered (e.g., race condition or duplicate call), **Then** the system handles it gracefully without showing an error (server-side idempotence).
3. **Given** the server rejects the remove because the operator lacks the required Space-side privilege, **When** the response arrives, **Then** the UI displays an error distinguishing space-side failure from hub-side failure (same structured error handling as the add flow).

---

### User Story 3 - Informative Error Feedback (Priority: P3)

When the server rejects an add or remove operation — because either the hub-side or the space-side authorization check fails — the operator receives a clear, specific error message that tells them which side of the authorization failed, so they know what corrective action to take. Both add and remove enforce the same two-sided authorization model: hub `UPDATE` privilege and Space-side privilege.

**Why this priority**: Without meaningful error feedback, operators have no actionable path when the server denies the request.

**Independent Test**: Can be tested by attempting to add or remove a Space where the operator lacks space-level authority, confirming a clear error message is shown that distinguishes a space-authority failure from a hub-authority failure.

**Acceptance Scenarios**:

1. **Given** the server rejects the add because the operator lacks authority on the target Space, **When** the response arrives, **Then** the UI displays an error indicating the Space-side authorization failed (not a generic failure message).
2. **Given** the server rejects the add because the operator lacks `UPDATE` on the hub (a bypass attempt), **When** the response arrives, **Then** the UI displays an error indicating the hub-side authorization failed.
3. **Given** the server rejects because the URL does not resolve to a known Space, **When** the response arrives, **Then** the UI displays a message indicating the Space was not found.
4. **Given** the server rejects the remove because the operator lacks the required Space-side privilege, **When** the response arrives, **Then** the UI displays an error that identifies the Space-side failure specifically.

---

### Edge Cases

- What happens when the operator enters a URL with correct format but pointing to a subspace (not a top-level Space)? The server rejects it (only top-level Spaces can join hubs); the client shows the server error.
- What happens when the operator submits the URL of a Space that is already in the hub? The server handles it idempotently; the client shows success without duplicate entries appearing.
- What happens when the hub is `VISIBILITY`-type (filter-based membership, no explicit space list)? The add/remove UI must not be rendered — this feature applies only to `LIST`-type hubs.
- What happens when the network request fails mid-submission? The client shows a generic communication error; the hub list remains unchanged.
- What happens when the operator enters a URL with trailing whitespace or mixed case? The client normalizes (trims) the URL before validation and submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The add-Space-by-URL control MUST only be rendered when the current user holds `UPDATE` privilege on the Innovation Hub (checked from the hub's authorization data already loaded on the settings page).
- **FR-002**: The add-Space UI MUST present a URL text input and a resolve trigger (e.g., a "Look up" or "Search" button). On trigger, the client calls a server look-up that simultaneously resolves the Space from the URL AND performs an early privilege pre-check for both the hub `UPDATE` and the Space-side authorization. Only when both checks pass does the UI show a Space preview (at minimum: display name and host/provider) and enable the confirm-add button. If either privilege check fails at look-up time, the structured error is shown immediately and no confirm button is presented. This two-step pattern (enter URL → look up → preview + confirm, or error) follows the existing Transfer Space and Space promote/demote admin UX. The former search-dialog-based add flow is removed entirely.
- **FR-003**: The client MUST validate that the entered value is a syntactically valid URL before triggering the resolve step; invalid formats MUST surface an inline error and block any server call.
- **FR-004**: The client MUST trim leading and trailing whitespace from the URL input before validation and submission.
- **FR-005**: On confirm, the client MUST call the dedicated server add action (not the generic hub update action); the add action receives the hub identifier and the Space URL as inputs.
- **FR-006**: The client MUST NOT pass a space list through the generic `updateInnovationHub` mutation; only dedicated add and remove actions may alter hub membership.
- **FR-007**: Clicking the remove control next to a listed Space MUST present a confirmation dialog before any server call is made. On confirmation, the client MUST call the dedicated server remove action (not the generic hub update action); the remove action receives the hub identifier and the Space identifier as inputs. The remove action enforces the same two-sided authorization as add (hub `UPDATE` privilege + Space-side privilege); server-returned structured errors for either failure MUST be displayed with the same distinction as for the add flow.
- **FR-008**: After a successful add, the newly added Space MUST appear in the hub's member space list without requiring a full page reload (post-mutation refetch or cache update). Optimistic update is not appropriate here because the Space entity is not known to the client until the server resolves the URL.
- **FR-009**: After a successful remove, the Space MUST be removed from the displayed list without requiring a full page reload.
- **FR-010**: The client MUST display a success notification after a confirmed add or remove.
- **FR-011**: When the server returns a structured authorization error, the client MUST display a message that distinguishes space-side failure from hub-side failure, using the information provided in the server error response.
- **FR-012**: The add/remove UI MUST only be presented for `LIST`-type hubs (those with an explicit member space list); `VISIBILITY`-type hubs MUST NOT expose this UI.
- **FR-013**: While an add or remove operation is in-flight, the relevant control MUST show a loading state and prevent duplicate submissions.
- **FR-014**: The URL input and resolve step must be cleared/reset after a successful add, ready for the operator to add another Space without reloading the page.

### Key Entities

- **Innovation Hub**: A themed workspace on Alkemio that may maintain an explicit list of member Spaces (`LIST`-type) or use visibility-based filtering (`VISIBILITY`-type). Only `LIST`-type hubs use this feature.
- **Space**: A top-level collaborative workspace on Alkemio. A Space can be added to an Innovation Hub if both the hub operator and a Space admin with the required privilege authorize the action. Only top-level Spaces (not subspaces) may be members of a hub.
- **Hub Member Space List**: The collection of Spaces explicitly included in a `LIST`-type Innovation Hub. Modified only via dedicated add/remove actions. Display ordering and drag-and-drop reordering are out of scope for this feature and will be addressed in a separate specification.

## Assumptions

- The server exposes two new dedicated mutations: one to add a Space to a hub by URL, and one to remove a Space from a hub by Space ID. The existing generic `updateInnovationHub` mutation is no longer used for space list changes.
- The server's structured error response for authorization failures includes at minimum: which side failed (hub or space), the name of the missing privilege, and the relevant entity identifier. The client does not need to determine this itself.
- The `authorization.myPrivileges` field on the Innovation Hub (already returned in the settings query) is the authoritative source for the client-side `UPDATE` privilege check.
- The Space's URL is a sufficient identifier for the server to locate the Space.
- The hub type (`LIST` vs `VISIBILITY`) is returned in the existing hub settings query and can be used to conditionally render the UI.
- The server exposes a look-up endpoint (query or mutation) that accepts a Space URL and Innovation Hub identifier, resolves the Space, and checks both the hub-side and Space-side privileges in a single call. The client calls this at the look-up step before presenting the confirm button. The platform already has URL resolver infrastructure that may be reused or extended for this purpose.
- If either privilege check fails at look-up time, no confirmation step is shown and the error is surfaced immediately. A race-condition failure at the final add confirmation step (e.g., privileges revoked between look-up and confirm) is handled like any other server error.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator with correct privileges can add a Space to a hub by URL — from entering the URL through confirming the add — in under 30 seconds on the settings page.
- **SC-002**: An operator with correct privileges can remove a Space from a hub in under 10 seconds from the settings page.
- **SC-003**: When a URL fails client-side validation, the inline error appears immediately (no server round-trip), keeping failed submissions under 1 second of feedback.
- **SC-004**: When the server returns an authorization error, the displayed error message correctly identifies the failing side (hub vs. space) in 100% of cases.
- **SC-005**: The hub's Space list reflects the result of a successful add or remove without requiring a manual page reload.
- **SC-006**: Operators without `UPDATE` privilege on the hub see no add or remove controls (zero unauthorized UI exposure).
