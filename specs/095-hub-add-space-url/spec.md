# Feature Specification: Innovation Hub — Add Space by URL

**Feature Branch**: `095-hub-add-space-url`
**Created**: 2026-05-01
**Status**: Draft
**Linked Issue**: [#9616](https://github.com/alkem-io/client-web/issues/9616)

## Clarifications

### Session 2026-05-01

- Q: How should "Add by URL" be exposed in the UI — separate button, replace existing, or inside the existing Add dialog? → A: The existing "Add" button continues to open the Add dialog. The dialog gains two options: (1) "Add by URL" (prioritised, shown first/default) and (2) the existing search (retained while the underlying search bug is fixed). No new top-level button is introduced.
- Q: What is the UI state while the platform resolves the submitted URL? → A: Disable the submit button and show an inline loading spinner; additionally display a short status message (e.g., "URL is being validated…") in place of / above the submit button during resolution.
- Q: What happens to the dialog after a failed resolution (invalid URL, subspace, not found)? → A: The dialog stays open. The error is shown inline below the URL input. The admin can correct the URL and resubmit without reopening the dialog.
- Q: Should the client pre-validate the URL host before making any server call, and how far can validation go client-side? → A: Yes. (1) If the URL hostname does not match the current Alkemio instance, show an immediate inline error stating the expected format (e.g., `https://alkem.io/<space-name>`) — no server request made. (2) L0 validation is also purely client-side: a URL whose path contains exactly one non-empty segment is treated as an L0 Space; two or more segments indicate a subspace. Both checks happen at zero server cost. A server call is only made when both checks pass, to look up the Space by nameId and add it to the Hub.

## Context

Innovation Hub admins currently add Spaces to their Hub via a search-based dialog. A platform-level bug (#1848) prevents spaces from appearing in that listing, making it impossible to add new spaces. This feature provides a client-side workaround: the admin supplies the direct URL of the Space they wish to add, the platform validates it, and — if valid — adds it to the Hub without relying on the broken search flow.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Add a valid top-level Space by URL (Priority: P1)

An Innovation Hub admin knows the URL of a top-level Space (Level 0) they want to feature in their Hub. Because the existing search dialog no longer returns results, they use the new "Add by URL" option, paste the Space URL, and confirm. The Space immediately appears in the Hub's Space list.

**Why this priority**: This is the core workaround that restores the ability to manage Hub membership while the underlying search bug is unresolved.

**Independent Test**: Can be fully tested end-to-end by an admin navigating to their Hub settings, opening "Add by URL", pasting a known L0 Space URL, and verifying the space appears in the list.

**Acceptance Scenarios**:

1. **Given** the admin is on the Innovation Hub settings page, **When** they click "Add by URL" and enter `https://<host>/<space-nameId>` (a valid L0 Space URL) and submit, **Then** the Space is added to the Hub's Space list and the dialog closes.
2. **Given** the space is already in the Hub's list, **When** the admin submits its URL, **Then** the system informs them the Space is already added and does not create a duplicate.

---

### User Story 2 — Rejected URL: not a valid URL format (Priority: P2)

An admin accidentally pastes a non-URL string (e.g., a Space name or partial path). The system immediately shows inline validation feedback before they submit, preventing a wasteful server round-trip.

**Why this priority**: Good form UX is essential to confidence; without it, the workaround feels fragile.

**Independent Test**: Testable by entering an invalid string, observing the inline error, and confirming the submit button is disabled or submission is blocked.

**Acceptance Scenarios**:

1. **Given** the URL input is empty or contains a non-URL string, **When** the field loses focus or the user attempts to submit, **Then** an inline validation error is shown and the Space is not added.
2. **Given** the field contains a syntactically valid URL, **When** the user clicks submit, **Then** the system proceeds with the server-side resolution step.

---

### User Story 3 — Rejected URL: points to a subspace or non-Space entity (Priority: P3)

An admin accidentally pastes the URL of a subspace (Level 1 or deeper) or an unrelated Alkemio page (e.g., a user profile or organisation). The system resolves the URL, determines it is not an L0 Space, and shows a clear error message.

**Why this priority**: Prevents silent data corruption where non-top-level Spaces enter the Hub list.

**Independent Test**: Testable by entering a subspace URL and verifying the error message without the space being added to the list.

**Acceptance Scenarios**:

1. **Given** the admin submits a URL that resolves to a Space at level 1 or deeper, **Then** an error message states that only top-level Spaces can be added to an Innovation Hub.
2. **Given** the admin submits a URL that resolves to a non-Space entity (user, organisation, etc.), **Then** an error message states the URL does not point to a Space.
3. **Given** the admin submits a URL that cannot be resolved at all (404 or unknown), **Then** an error message states the Space could not be found.

---

### Edge Cases

- What happens when the URL is structurally valid but belongs to a different Alkemio deployment (i.e., the host does not match the current instance)? → Caught by the client-side hostname check (FR-003a); an inline error is shown immediately stating the expected format (e.g., `https://alkem.io/<space-name>`). No server request is made.
- What happens if the URL has a single path segment but the nameId does not exist on the server? → The server lookup (FR-004) returns not-found; the system shows a "Space not found" inline error and the dialog stays open.
- What happens if the Space is found but the admin's account lacks permission to view it? → The resolver will return an unauthorised/not-found result; the system shows a "Space not found or not accessible" error.
- What happens if the network call to resolve the URL times out or fails? → The system shows a generic "Could not reach the server" error and leaves the input intact so the admin can retry.
- What happens if the Space is already in the Hub? → The system informs the admin the Space is already present; no duplicate is created.
- What happens if the admin pastes a URL with trailing slashes or query parameters? → The system normalises the URL before resolution (or passes it as-is and relies on the server resolver's tolerance).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The existing "Add" button on the Innovation Hub settings page MUST continue to open the Add dialog. The dialog MUST present two options: "Add by URL" (displayed first, as the prioritised entry point) and "Search" (the existing search flow, retained while the underlying platform bug is being resolved).
- **FR-001a**: The "Add by URL" option MUST be the default active view when the dialog opens.
- **FR-001b**: The "Search" option MUST remain visible and selectable; it MAY be non-functional while the platform search bug persists.
- **FR-002**: The "Add by URL" option MUST present a text input field that accepts a URL.
- **FR-002a**: While URL resolution is in progress, the system MUST disable the submit button, display an inline loading spinner, and show a brief status message (e.g., "URL is being validated…") visible to the admin. The message MUST be i18n-ready.
- **FR-003**: The system MUST validate that the input is a syntactically well-formed URL (parseable, contains a scheme and hostname) before any further checks.
- **FR-003a**: The system MUST validate client-side that the URL's hostname matches the current Alkemio instance hostname. If it does not match, an inline error MUST be shown immediately stating the expected URL format (e.g., `https://alkem.io/<space-name>`). No server request is made.
- **FR-003b**: The system MUST determine the Space hierarchy level purely from the URL path structure, client-side, at zero server cost. A URL path with exactly one non-empty segment identifies an L0 (top-level) Space. A path with two or more segments identifies a subspace (Level 1 or deeper) and MUST be rejected with an inline error.
- **FR-004**: Only after FR-003, FR-003a, and FR-003b all pass, the system MUST make a server request to look up the Space by the nameId extracted from the URL path, retrieve its ID, and add it to the Hub's Space list.
- **FR-005**: The system MUST reject URLs whose path contains two or more segments (subspaces), with a user-visible inline error message stating only top-level Spaces can be added. This check is client-side (see FR-003b); no server request is required.
- **FR-006**: The system MUST reject URLs that resolve to a non-Space entity (user profile, organisation, Innovation Pack, etc.), with a user-visible error message.
- **FR-007**: The system MUST reject URLs that cannot be resolved (unknown URL, network error, server 404), with a user-visible inline error message displayed below the URL input field.
- **FR-007a**: On any resolution failure (format error, subspace, non-Space entity, not found, network error), the dialog MUST remain open so the admin can correct the URL and resubmit without reopening the dialog. The error message MUST be cleared when the admin modifies the input.
- **FR-008**: When the resolved URL points to a valid Level 0 Space that is not already in the Hub, the system MUST add that Space to the Hub's Space list immediately.
- **FR-009**: The system MUST prevent adding a Space that is already present in the Hub and inform the admin accordingly.
- **FR-010**: All error and confirmation messages MUST be localised (i18n-ready); no hardcoded user-facing strings.
- **FR-011**: The "Add by URL" flow MUST be accessible to keyboard-only users and screen reader users (focus management, ARIA labels, error announcements).

### Key Entities

- **Innovation Hub**: A curated view of the Alkemio platform scoped to a specific set of Spaces; managed by Hub admins. Maintains an ordered list of Space IDs.
- **Space (Level 0)**: A top-level collaborative Space on the Alkemio platform. Distinguished from subspaces by its hierarchy level being 0.
- **Space URL**: The canonical URL assigned to a Space, resolvable by the platform to a Space entity and its metadata (ID, level, visibility).

## Assumptions

- The platform's URL resolution endpoint is used only to fetch the Space ID after all client-side checks pass; the hierarchy level is NOT determined server-side.
- L0 vs subspace determination is made purely from URL path structure: one segment = L0, two or more segments = subspace. This is valid because Alkemio Space URLs follow the canonical pattern `https://<host>/<space-nameId>` for L0 and `https://<host>/<space-nameId>/<subspace-nameId>` for subspaces.
- The current Alkemio instance hostname is available client-side (from `window.location.hostname` or the configured environment) and can be compared against the submitted URL's hostname without a server call.
- There is no requirement to support bulk-add (multiple URLs at once) in this workaround scope.
- Visibility (active, demo, inactive) is not a blocking criterion for the URL-based add; the same visibilities supported by the existing search are accepted here.
- This feature is a temporary workaround; it does not replace the search-based add permanently. Both may coexist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An Innovation Hub admin can add a top-level Space to their Hub using only its URL, in 3 steps or fewer (open dialog → paste URL → confirm), in under 30 seconds.
- **SC-002**: 100% of submitted URLs that fail the hostname check or contain more than one path segment are rejected client-side with a descriptive inline error, before any server request is made.
- **SC-003**: 100% of submitted URLs that fail format validation (not a well-formed URL) are rejected client-side without triggering a server request.
- **SC-004**: No duplicate Spaces are ever added to the Hub's Space list via the URL flow.
- **SC-005**: The feature is fully operable without a mouse (keyboard-only navigation and submission work end-to-end).
