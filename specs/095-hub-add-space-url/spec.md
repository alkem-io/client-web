# Feature Specification: Innovation Hub — Add Space by URL

**Feature Branch**: `095-hub-add-space-url`
**Created**: 2026-05-01
**Status**: Draft
**Linked Issue**: [#9616](https://github.com/alkem-io/client-web/issues/9616)

## Clarifications

### Session 2026-05-01

- Q: What is the UI state while the platform resolves the submitted URL? → A: Disable the submit button and show an inline loading spinner; additionally display a short status message (e.g., "URL is being validated…") in place of / above the submit button during resolution.
- Q: What happens to the dialog after a failed resolution? → A: The dialog stays open. The error is shown inline below the URL input. The admin can correct the URL and resubmit without reopening the dialog.

### Session 2026-05-09

- Directive: The URL-based add MUST replace the existing search-based Add dialog. The "Add" button opens a single URL-input dialog; the prior search dialog is removed. (Supersedes the 2026-05-01 decision to retain both options.)
- Directive: All failure cases (bad URL, wrong host, subspace, non-Space entity, not found, permission failure, network error, level > 0, etc.) collapse to a single user-visible message: "URL is not a valid top level space". The duplicate case is the only other branch.
- Q: When a submitted URL resolves to a valid L0 Space that is already in the Hub, distinct message or generic? → A: Distinct "already added" message — duplicate is a legitimate, non-error condition worth its own feedback.
- Q: Should the client pre-validate the URL (host match, path-segment count) before calling the server? → A: No. Always defer to the server. Single uniform validation path; one generic error message on any failure. (Supersedes the 2026-05-01 decision to perform client-side host and path checks.)
- Q: For empty input or syntactically malformed URLs, what happens on submit? → A: The submit button stays disabled until the field contains a syntactically valid URL.

## Context

Innovation Hub admins currently add Spaces to their Hub via a search-based dialog. A platform-level bug (#1848) prevents Spaces from appearing in that listing, making it impossible to add new Spaces. This feature replaces the search-based Add dialog with a simpler URL-input dialog: the admin pastes the URL of the Space they want to add, the platform resolves it, and — if it points to a valid top-level Space on the current Alkemio instance — the Space is added to the Hub. Anything else is rejected with a single uniform message.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Add a top-level Space by URL (Priority: P1)

An Innovation Hub admin pastes the URL of a top-level Space into the Add dialog and submits. The Space appears in the Hub's Space list immediately.

**Why this priority**: This is the workaround that restores the ability to manage Hub membership while platform issue #1848 (broken Space search) is unresolved.

**Independent Test**: Admin opens Hub settings, clicks "Add", pastes a known L0 Space URL on the current Alkemio instance, submits, and verifies the Space appears in the Hub list.

**Acceptance Scenarios**:

1. **Given** the admin is on the Innovation Hub settings page, **When** they click "Add", paste a valid L0 Space URL on the current instance, and submit, **Then** the Space is added to the Hub's Space list and the dialog closes.

---

### User Story 2 — Submitted URL is not a valid top-level Space (Priority: P1)

The admin submits a URL that does not resolve to a top-level Space on the current instance. The system shows a single generic message and the dialog stays open so the admin can correct and retry.

**Why this priority**: Without clear feedback the admin cannot self-correct; this is essential to the workaround being usable.

**Independent Test**: Admin submits any URL that is not a valid L0 Space on the current instance (e.g., a subspace URL, a user profile URL, an unknown URL, a URL on a different host). The error message "URL is not a valid top level space" appears inline below the input; nothing is added to the Hub list.

**Acceptance Scenarios**:

1. **Given** the admin submits a URL that resolves to anything other than a top-level Space on the current Alkemio instance — including subspaces, user profiles, organisations, Innovation Packs, unknown URLs, URLs on a different host, permission failures, and network/resolver errors — **Then** the system shows the inline error "URL is not a valid top level space" below the input, the dialog stays open, and nothing is added to the Hub list.
2. **Given** the error is showing, **When** the admin edits the URL input, **Then** the error message clears.

---

### User Story 3 — Space is already in the Hub (Priority: P2)

The admin submits the URL of a Space that is already in the Hub's list. The system informs them the Space is already present and does not duplicate it.

**Why this priority**: Avoids confusing duplicate entries and gives clear feedback for a common honest mistake.

**Independent Test**: Admin submits a URL that resolves to a Space already in the Hub list and verifies the inline duplicate message appears and the list is unchanged.

**Acceptance Scenarios**:

1. **Given** the submitted URL resolves to a valid L0 Space that is already in the Hub's list, **When** the admin submits, **Then** the system shows an inline message indicating the Space is already added to this Hub, the dialog stays open, and no duplicate is created.

---

### Edge Cases

- Submit button is disabled while the input is empty or the value does not parse as a URL — the admin cannot submit syntactically invalid content; no error message is shown until they actually attempt a submit with a parseable URL.
- Trailing slashes, query parameters, or fragments on a URL are tolerated; the URL is passed to the server resolver, which is the single source of truth for validity.
- Network or server errors during resolution surface as the generic "URL is not a valid top level space" message; the admin can retry by editing the URL and resubmitting.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Innovation Hub settings page MUST expose an "Add" action that opens a URL-based Add dialog. The previous search-based Add dialog MUST be removed (no two-mode dialog, no toggle, no fallback).
- **FR-002**: The Add dialog MUST contain a single text input that accepts a URL, plus a submit action and a cancel action.
- **FR-003**: The submit button MUST be disabled while the input is empty or the value does not parse as a syntactically valid URL.
- **FR-004**: On submit, the system MUST send the URL to the platform resolver. The server is the single source of truth for whether the URL points to a valid top-level (Level 0) Space on the current Alkemio instance. The client MUST NOT pre-validate hostname, path structure, or any other URL property.
- **FR-005**: While resolution is in progress, the system MUST disable the submit button, show an inline loading spinner, and display a short i18n-ready status message (e.g., "URL is being validated…").
- **FR-006**: If the URL resolves to a top-level Space on the current instance and that Space is not already in the Hub's list, the system MUST add the Space to the list and close the dialog.
- **FR-007**: For every failure case other than the duplicate case in FR-008 — including but not limited to: wrong host, subspace, non-Space entity, unknown URL, server 404, permission failure, network/resolver error, or hierarchy level > 0 — the system MUST display a single inline error "URL is not a valid top level space" below the URL input. The dialog MUST remain open. No other error variants MUST be exposed.
- **FR-008**: If the URL resolves to a valid top-level Space that is already present in the Hub's list, the system MUST display a distinct inline message indicating the Space is already added to this Hub. The dialog MUST remain open and no duplicate MUST be created.
- **FR-009**: The inline error or duplicate message MUST be cleared when the admin modifies the URL input.
- **FR-010**: All user-visible strings (status, error, duplicate, dialog title, button labels, input label/placeholder) MUST be localised via the existing i18n mechanism; no hardcoded strings.
- **FR-011**: The dialog MUST be operable by keyboard alone and MUST meet WCAG 2.1 AA criteria for focus management, ARIA labelling, and error announcement.

### Key Entities

- **Innovation Hub**: A curated view of the Alkemio platform scoped to a specific set of Spaces; managed by Hub admins. Maintains an ordered list of Space IDs.
- **Space (Level 0)**: A top-level collaborative Space on the Alkemio platform. Distinguished from subspaces by hierarchy level being 0.
- **Space URL**: The canonical URL assigned to a Space, resolvable by the platform to a Space entity and its metadata (ID, level).

## Assumptions

- The platform exposes a server-side URL → Space resolver that, on success, returns the Space entity (including its hierarchy level) and, on failure, returns a not-found or error response. The client treats every non-success outcome uniformly via FR-007.
- Determining whether a URL belongs to the "current" Alkemio instance is the server's responsibility; the client does not duplicate this check.
- This feature is a workaround for platform issue #1848 (broken Space search). If/when search is restored, a future iteration may reintroduce search-based discovery; that is out of scope for the current change.
- Bulk-add (multiple URLs at once) is out of scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An Innovation Hub admin can add a top-level Space to their Hub using only its URL in 3 steps or fewer (open dialog → paste URL → submit) and in under 30 seconds.
- **SC-002**: 100% of submitted URLs that do not resolve to a valid top-level Space on the current instance produce the message "URL is not a valid top level space" and result in no change to the Hub's Space list.
- **SC-003**: 100% of submissions that resolve to a Space already in the Hub produce the duplicate message and result in no duplicate entry.
- **SC-004**: The flow is fully operable without a mouse — keyboard-only navigation, submission, error recovery, and dialog dismissal all work end-to-end.
