# Feature Specification: Enhanced Error Handling with Server Error Extensions

**Feature Branch**: `013-error-handling-extensions`
**Created**: 2026-01-28
**Status**: Draft
**Input**: User description: "Enhance error handling to use new server error extensions (numericCode, userMessage) with support contact mailto and extended notification time"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Meaningful Error Messages (Priority: P1)

When an error occurs during any operation, the user sees a clear, localized error message that helps them understand what went wrong, rather than a generic technical error.

**Why this priority**: This is the core value proposition - users need to understand errors in their language to take appropriate action. Without meaningful messages, all other enhancements are less useful.

**Independent Test**: Can be tested by triggering any server error that includes a `userMessage` extension and verifying the translated message appears in the notification.

**Acceptance Scenarios**:

1. **Given** a server error with `extensions.userMessage` set to `"errors.space.not.found"`, **When** the error is processed, **Then** the notification displays the translated message from i18n using that key.
2. **Given** a server error with `extensions.userMessage` that has no corresponding translation key, **When** the error is processed, **Then** the notification displays the existing fallback message (generic error with code).
3. **Given** a server error without `extensions.userMessage`, **When** the error is processed, **Then** the notification displays using the current behavior (code-based or generic message).

---

### User Story 2 - Extended Time to Read and Act on Errors (Priority: P2)

When an error notification appears, the user has sufficient time (15 seconds) to read the message and decide whether to contact support, rather than the notification disappearing quickly.

**Why this priority**: Users need adequate time to comprehend error messages and take action. This directly enables the support contact feature to be useful.

**Independent Test**: Can be tested by triggering any error and measuring the notification display duration.

**Acceptance Scenarios**:

1. **Given** any error notification is displayed, **When** the user does not interact with it, **Then** it automatically hides after 15 seconds.
2. **Given** an error notification is displayed, **When** the user clicks the close button, **Then** it hides immediately.

---

### User Story 3 - Contact Support Directly from Error Notification (Priority: P3)

When an error occurs, the user can click a support link within the notification to open their email client with a pre-filled support request containing the error code and context.

**Why this priority**: This transforms errors from dead-ends into actionable paths for resolution. Depends on P1 (meaningful messages) and P2 (time to act) being in place.

**Independent Test**: Can be tested by triggering any error with a `numericCode` and clicking the support link to verify the mailto opens with correct pre-filled content.

**Acceptance Scenarios**:

1. **Given** an error notification with `extensions.numericCode` is displayed, **When** the user clicks the "Contact Support" link, **Then** their default email client opens with a mailto link.
2. **Given** the mailto link is opened, **When** the email draft appears, **Then** the subject contains "Support Request - Error [numericCode]" and the body contains a user-friendly message with the error code.
3. **Given** an error without `extensions.numericCode`, **When** the notification is displayed, **Then** the "Contact Support" link is still present but uses a generic subject without a specific code.

---

### User Story 4 - Error Boundary Shows Enhanced Error Details (Priority: P4)

When a catastrophic error triggers the error boundary fallback page, the user sees enhanced error information and can contact support with error details.

**Why this priority**: Error boundary errors are less frequent than notification errors but more severe. The same enhancements should apply for consistency.

**Independent Test**: Can be tested by triggering a render error that causes the error boundary to display its fallback UI.

**Acceptance Scenarios**:

1. **Given** a render error with `numericCode` triggers the error boundary, **When** the ErrorPage is displayed, **Then** the error code is visible and the support mailto link includes the code.
2. **Given** the error boundary displays, **When** the user clicks the support contact link, **Then** the mailto includes the numeric code and a request for assistance.

---

### Edge Cases

- What happens when `userMessage` translation key exists but has no value? Falls back to generic message.
- What happens when `numericCode` is 0 or negative? Treated as valid code, included in mailto.
- What happens when both `userMessage` and existing `code` translations exist? `userMessage` takes precedence as it's more specific.
- What happens when user's email client is not configured? Standard browser behavior applies (may show error or do nothing).
- What happens when notification queue has multiple errors? Each notification displays independently with its own 15-second timer and support link.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST extract `numericCode` from `error.extensions.numericCode` when present in GraphQL error responses.
- **FR-002**: System MUST extract `userMessage` from `error.extensions.userMessage` when present in GraphQL error responses.
- **FR-003**: System MUST use `userMessage` as an i18n translation key to display localized error messages.
- **FR-004**: System MUST fall back to existing error message logic when `userMessage` is not present or translation key does not exist.
- **FR-005**: System MUST display error notifications for 15 seconds before auto-hiding (increased from current 6 seconds).
- **FR-006**: System MUST include a "Contact Support" text link below the error message in notifications.
- **FR-007**: System MUST generate a mailto link with pre-filled subject containing the error's `numericCode` when available.
- **FR-008**: System MUST generate a mailto link with pre-filled body containing a user-friendly support request template including the `numericCode`.
- **FR-009**: System MUST use the existing support email address (`support@alkem.io`) from i18n for mailto links.
- **FR-010**: Error boundary components MUST display enhanced error information including `numericCode` when available.
- **FR-011**: Error boundary support contact links MUST include `numericCode` in the mailto when available.

### Key Entities

- **GraphQL Error Extensions**: Extended error object from server containing `numericCode` (number) and `userMessage` (i18n translation key string) in the `extensions` field.
- **Error Notification**: UI element displaying error message with severity, auto-hide timer, close action, and support contact link.
- **Support Mailto**: Pre-composed email link with subject and body populated from error context.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of error notifications display for 15 seconds before auto-hiding (unless manually closed).
- **SC-002**: All error notifications include a visible "Contact Support" link.
- **SC-003**: When `userMessage` translation key exists, the localized message is displayed instead of the generic error.
- **SC-004**: When `numericCode` is present, the mailto subject and body include the code for support reference.
- **SC-005**: Users can successfully open a pre-filled support email from any error notification with one click.
- **SC-006**: Error boundary fallback pages include support mailto functionality with error code when available.

## Clarifications

### Session 2026-01-28

- Q: How should the "Contact Support" link appear within the notification UI? → A: Text link below error message (e.g., "Contact Support")

## Assumptions

- The server is already returning `numericCode` and `userMessage` in the `extensions` object of GraphQL errors.
- `userMessage` values from the server are valid i18n translation key paths (e.g., `"errors.space.membership.denied"`).
- Translation keys referenced by `userMessage` will be added to the i18n translation files as needed (this spec covers the client-side handling).
- The existing notification system architecture (XState machine, NotificationHandler) remains unchanged; only configuration and content are enhanced.
- The support email address remains `support@alkem.io` as currently defined in i18n.

## Out of Scope

- Server-side changes to error responses (already completed per user input).
- Adding new translation keys to i18n files (handled separately as translations are identified).
- Changing the visual design or position of error notifications.
- Adding retry functionality to error notifications.
- Offline error handling or error persistence.
- Analytics or tracking of error occurrences.
