# Feature Specification: Platform-Admin Change User Login Email (Web Client)

**Feature Branch**: `101-change-user-email`
**Created**: 2026-05-20
**Status**: Draft
**Input**: User description: "create the web client implementation for the prd defined in ../server/specs/097-change-user-email/prd-client-email-change.md"

## Clarifications

### Session 2026-05-20

- Q: Where should the "Change login email" entry point live in the global administration users area? → A: As a per-user row action in the global administration users list — an email action control on each user's row, positioned before the existing license-plan and delete row actions. It is enabled only for administrators holding the platform-admin privilege and rendered disabled (grayed out) for other users of the admin users area. (Revised 2026-05-20: supersedes an earlier per-user-detail-page answer — the MUI per-user admin detail page is not reachable from the users list, so the list row is the practical, consistent entry point.)
- Q: How should the email-change history view be presented? → A: As a dedicated route (a separate page) linked from the change-login-email dialog via a "View change history" link.
- Q: What form does the explicit destructive-action confirmation take? → A: A typed confirmation — the admin must re-type the new email address in a separate confirmation field; submit is enabled only when the new-email and confirmation fields match (and the email is valid and different from the current one).
- Q: How should the four partial-success audit outcomes (the email change committed but a follow-up notification or session sign-out failed) be classified in the history list and inline status? → A: As success-with-warning — shown as a success variant whose label also names the follow-up step that failed, distinct from both plain success and plain failure.
- Q: Which latest-entry outcomes trigger the drift warning and Resolve action? → A: Both a newly detected drift and a failed drift-resolution attempt — a failed resolution leaves the account drifted, so the warning and Resolve action remain available for retry.
- Q: Which design system should the feature be built in, and which admin surface does it attach to? → A: The existing MUI platform-administration area (MUI + `src/core/ui/` components); the `/admin/*` route tree is not CRD-toggle-gated, so no CRD components and no CRD admin routing are introduced.
- Q: Should the global administration users list show a per-user drift indicator? → A: No. A per-row indicator would require querying each visible user's latest email-change record on every list load — there is no batch or user-level field for this server-side (A5) — a heavy cost for a rare (P3) condition. Drift is surfaced only inside the change-login-email dialog, which fetches the user's latest record on demand when the dialog is opened. (Supersedes the original FR-024 row-indicator requirement.)

### Session 2026-05-22

- Q: What governance information must the admin record when changing a login email? → A: The change dialog also captures a mandatory free-text **reason** for the change and **approver** details — the name and role of the person who authorized the change within the subject user's organization, plus an optional approver organization. Reason and approver are submitted with the change, recorded on the resulting audit entry, and shown on every history entry. The server contract (spec 097) requires both. (Reflects the implemented contract.)
- Q: How many partial-success ("committed but a follow-up step failed") outcomes exist? → A: Five — security-signal, new-address-notification, global-admin-notification, **space-admin-notification**, and session-invalidation failures — all classified success-with-warning. (The earlier draft listed four; the server enum adds a space-admin notification outcome.)
- Q: Should platform administrators be able to opt in to a notification when any user's email changes? → A: Yes. Server spec 097 adds a `userEmailChanged` platform-admin notification; the client exposes it as a toggle in the existing user notification-settings surfaces (admin and CRD), alongside the other platform-admin notification preferences.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Change a user's login email (Priority: P1)

A platform administrator has verified a user's identity out-of-band (a support call, an ID check) and needs to correct or replace the email address that user signs in with — for example because the user lost access to their mailbox, mistyped their address at registration, or moved to a new corporate domain. From the global administration users list, the admin activates the change-login-email control on the selected user's row, enters the new address, records why the change is being made and who authorized it, acknowledges that this is a destructive administrative action, and submits. The system performs the change and confirms success, and the new email is immediately reflected wherever that user is shown.

**Why this priority**: This is the core capability the feature exists to deliver. Without it, support has no in-product path to resolve lost-mailbox, typo, or domain-change cases and must continue to act out-of-band. It is a complete, demonstrable slice of value on its own.

**Independent Test**: Sign in as a platform administrator, locate a test user in the global administration users area, change their login email to a new valid address, observe the success confirmation and the updated email, then verify on a development stack that the old email can no longer sign in and the new email can.

**Acceptance Scenarios**:

1. **Given** a platform admin viewing the global administration users list, **When** the admin activates the change-login-email control on a user's row, **Then** a dialog appears showing the user's current login email as read-only, an empty new-email input, an empty confirmation input, and an empty reason-and-approval section (reason, approver name, approver role, optional approver organization).
2. **Given** the change-email dialog is open, **When** the admin has not yet entered a syntactically valid email that differs from the current one, has not re-typed a matching value into the confirmation field, or has not filled the required reason and approver fields, **Then** the submit control is disabled.
3. **Given** the change-email dialog is open, **When** the admin reviews it before submitting, **Then** the dialog plainly states that this administrative change will end the user's active sessions and that the user must sign in with the new email afterwards.
4. **Given** a valid, different new email re-typed identically into the confirmation field, **When** the admin submits, **Then** a pending indicator is shown and the submit control is disabled until the server responds.
5. **Given** a submitted change, **When** the server confirms success, **Then** a success confirmation showing the new email is displayed.
6. **Given** a successful change, **When** the admin returns to the user record or any open view of that user, **Then** the new email is shown as the current login email without a manual refresh.

---

### User Story 2 - Understand why an email change was rejected (Priority: P1)

When a change cannot be completed, the platform administrator needs to know exactly why — so they can fix a typo, choose a different address, or retry later. The administrator sees a specific, plain-English explanation of what went wrong, the dialog stays open with their input preserved, and they can correct and resubmit. When the address is already in use, the explanation is deliberately generic and never reveals who holds it.

**Why this priority**: An administrator acting on a support case must be able to act on a failure. Silent, vague, or raw technical errors would make the feature unusable, and a non-generic conflict message would leak that an address belongs to another account. This ships together with User Story 1 — the change feature is not safe to release without it.

**Independent Test**: With the change-email dialog open, drive it into each failure condition in turn (invalid format, unchanged address, address already in use, user with no usable login identity, identity service unavailable, write failed with nothing applied, partial-apply/drift) and confirm each produces its own distinct, human-readable message and that the dialog stays open for correction.

**Acceptance Scenarios**:

1. **Given** the change-email dialog, **When** the admin enters a syntactically invalid email, **Then** an inline validation message explains the address is invalid, the submit control stays disabled, and no server call is made.
2. **Given** the change-email dialog, **When** the admin enters an address identical to the current login email, **Then** an inline message explains the address is unchanged, the submit control stays disabled, and no server call is made.
3. **Given** a submitted change, **When** the server reports the address is already in use, **Then** a generic message ("This email address is already in use.") is shown that does not name or hint at the account holding it, and the dialog stays open.
4. **Given** a submitted change, **When** the server reports the user has no usable login identity, **Then** a message explains that this user cannot have their email changed.
5. **Given** a submitted change, **When** the server reports the identity service is unavailable, or that a write failed with no changes applied, **Then** a message explains the change could not be completed, that no changes were made, and that the admin can retry.
6. **Given** a submitted change, **When** the server reports a partial-apply (drift) condition, **Then** a message explains the change partially applied and directs the admin to the Resolve action.
7. **Given** any rejected change, **When** the error is shown, **Then** the dialog remains open with the admin's entered input preserved so they can correct it and resubmit.

---

### User Story 3 - Review a user's email-change history (Priority: P2)

From the change-login-email dialog, a platform administrator opens an email-change history view to see every email-change attempt for that user — for support context and forensic review. The list shows, newest first, when each attempt happened, its outcome, who initiated it, the old and new addresses, and the reason for any failure. The list is paginated so the full history is reachable.

**Why this priority**: History gives valuable support and forensic context (who changed what, when, and whether it succeeded), but it is not required to perform a change. It is follow-on capability rather than core MVP, so it ranks below the change flow itself.

**Independent Test**: For a user with several past email-change attempts, open the email-change history view and confirm entries appear newest-first with all expected fields, outcomes appear as readable labels, and requesting more entries loads the next page.

**Acceptance Scenarios**:

1. **Given** a platform admin viewing a user with past email changes, **When** the admin opens the email-change history, **Then** entries are listed newest-first.
2. **Given** the history list, **When** an entry is displayed, **Then** it shows the timestamp, the outcome, the initiator's display name, the old email, the new email, and a failure reason when one is recorded.
3. **Given** a history entry whose outcome is a machine code, **When** it is displayed, **Then** the outcome is shown as a readable label (for example, "Committed", or "Rejected — address in use").
4. **Given** a user with more history entries than fit on one page, **When** the admin requests more, **Then** the next page of entries loads.
5. **Given** a user who has never had an email change, **When** the admin opens the history, **Then** an empty-state message is shown rather than an error.
6. **Given** any history entry, **When** the initiator or subject is displayed, **Then** only a display name is shown and no internal identifier is presented as primary content.

---

### User Story 4 - Resolve a half-applied (drift) email change (Priority: P3)

In the rare case where an email change applied to one part of the system but not the other, the account is left in an inconsistent "drift" state. From the change-login-email dialog opened for that user, a platform administrator sees a drift warning and opens a Resolve action that presents exactly the two addresses recorded on the drift — the old email and the new email — and lets the admin pick the one that should be canonical. Submitting reconciles the account back to a consistent state.

**Why this priority**: Drift is a rare failure mode. The recovery flow must exist for correctness, but its low frequency means a minimal, functional UI is acceptable, so it ranks lowest.

**Independent Test**: For a user whose most recent email-change record is a drift state, open the change-login-email dialog and confirm a drift warning appears, open Resolve, confirm exactly the old and new addresses are offered with no free-text entry, pick one, submit, and confirm the warning clears.

**Acceptance Scenarios**:

1. **Given** a user whose most recent email-change record is a drift state, **When** a platform admin opens the change-login-email dialog for that user, **Then** a drift warning with a Resolve action is shown.
2. **Given** the Resolve action is opened, **When** the choices are presented, **Then** exactly two options are shown — the old email and the new email recorded on the drift entry — and no free-text address entry is offered.
3. **Given** the admin selects a canonical address and submits, **When** reconciliation succeeds, **Then** a success confirmation is shown and the drift warning is cleared.
4. **Given** a Resolve submission, **When** the server reports there is no outstanding drift to resolve, **Then** a message explains there is nothing to resolve.
5. **Given** a Resolve submission, **When** reconciliation fails, **Then** a message explains it could not be completed and the admin can retry.
6. **Given** a user with no drift state, **When** a platform admin opens the change-login-email dialog for that user, **Then** no drift warning and no Resolve action are shown.

---

### Edge Cases

- A non-administrator opens a deep link to the email-change history view — access is denied. A non-platform-admin user of the global administration users area sees the change-login-email row control rendered but disabled (grayed out) and cannot activate it; since the change dialog cannot be opened, the drift Resolve action nested within it is unreachable.
- The admin enters the user's current login email as the "new" email — this is blocked client-side before any server call; the submit control stays disabled with an inline explanation.
- The admin's re-typed confirmation email does not match the new-email field — this is blocked client-side before any server call; the submit control stays disabled with an inline mismatch explanation.
- The admin submits and the server takes several seconds (worst case under identity-service retry) — a pending indicator is shown for the whole wait and the submit control stays disabled so no duplicate change can be sent.
- The address entered is already used by another account — a generic "already in use" message is shown with no hint of the holder, and the dialog stays open.
- The identity service is unavailable, or a write fails with nothing applied — a message states the change could not be completed and that no changes were made; the admin can retry.
- A change leaves the account in a drift state — the change dialog directs the admin to Resolve.
- The admin opens the history for a user who never had an email change — an empty state is shown, not an error.
- The admin opens Resolve but the drift was already reconciled elsewhere — a message states there is no outstanding drift to resolve.
- A change succeeds while another view of the same user is open elsewhere in the app — that view updates to the new email without a manual refresh.

## Requirements *(mandatory)*

### Functional Requirements

**Authorization & entry point**

- **FR-001**: Performing a login-email change, resolving a drift, and viewing a user's email-change history MUST be usable only by administrators holding the platform-admin privilege. The change-login-email row control is rendered for every user of the global administration users area (which is itself already gated to administrators) but MUST be enabled only for platform administrators and rendered disabled (grayed out) otherwise. The email-change history view MUST deny direct navigation by non-platform-administrators. The drift Resolve action has no independently navigable route — it opens only from within the (platform-admin-gated) change-login-email dialog, so it is gated transitively.
- **FR-002**: The global administration users list MUST expose, on each user's row, a per-user action control to change that user's login email. The control MUST be positioned before the existing license-plan and delete row actions. Activating it opens the change-login-email dialog for that user.

**Change dialog**

- **FR-003**: The change action MUST open a dialog that displays the user's current login email as read-only, provides an input for the new login email, provides a separate confirmation input in which the admin re-types the new login email, and provides a reason-and-approval section: a required free-text reason input, a required approver-name input, a required approver-role input, and an optional approver-organization input.
- **FR-004**: The dialog MUST clearly state, before submission, that the change is an administrative action, that it ends the user's active sessions, and that the user must sign in with the new email afterwards.
- **FR-005**: The system MUST require an explicit destructive-action confirmation before a change is submitted; it MUST NOT be performed as a silent inline edit. The confirmation takes the form of a separate field into which the admin MUST re-type the new login email exactly.
- **FR-006**: The submit control MUST remain disabled until the entered email is syntactically valid, different from the current login email, exactly matched by the value re-typed into the confirmation field, and the required reason, approver-name, and approver-role fields are non-empty.
- **FR-007**: Invalid-format, unchanged-address, and confirmation-mismatch conditions MUST be surfaced as inline field validation and MUST be caught before any server submission.
- **FR-008**: While a change is being processed, the system MUST show a pending indicator and MUST prevent re-submission until the server responds.
- **FR-009**: The system MUST NOT update any displayed email before the server confirms success; there MUST be no optimistic update.

**Success handling**

- **FR-010**: On a successful change, the system MUST show a success confirmation that includes the new email.
- **FR-011**: On a successful change, every visible view of the affected user MUST reflect the new email without requiring a manual refresh.
- **FR-012**: On a successful change, the system SHOULD inform the admin that the user has been notified by email of the change.

**Error handling**

- **FR-013**: Every distinct server-side failure condition for a change MUST be mapped to a specific, human-readable English message; raw or technical error text MUST NOT be shown to the admin. A generic catch-all message is permitted only for unmapped, unexpected failures. The exact set of failure codes is defined by server spec 097 (assumption A5) — the client maps each documented `EMAIL_CHANGE_*` code; counts are not fixed in this spec.
- **FR-014**: The "address already in use" failure MUST be communicated with a generic message that does not reveal, name, or hint at which account holds the address. The message MUST be identical regardless of the holder.
- **FR-015**: When a change is rejected, the dialog MUST stay open with the admin's entered input preserved so the admin can correct it and retry.
- **FR-016**: When a change fails in a way that made no changes, the message MUST state that no changes were made.
- **FR-017**: When a change results in a partial-apply (drift) condition, the message MUST direct the admin to the Resolve action.

**Email-change history**

- **FR-018**: The change-login-email dialog MUST provide an entry point ("View change history") to that user's email-change history, which is presented as a dedicated route (a separate page) with entries ordered newest-first.
- **FR-019**: Each history entry MUST display the timestamp, the outcome, the initiator's display name, the old email, the new email, the reason recorded for the change, the approver details when recorded, and a failure reason when one is recorded.
- **FR-020**: Every email-change outcome MUST be rendered as a readable label, not as a raw machine code, and MUST be classified visually as a success, a success-with-warning, or a failure. Outcomes where the email change committed but a follow-up step failed — security-signal, new-address-notification, global-admin-notification, space-admin-notification, and session-invalidation failures — MUST be classified as success-with-warning: shown as a success variant whose label also names the follow-up step that failed. The exact set of outcome values is defined by server spec 097 (assumption A5); the client renders whatever the schema enumerates and falls back to a safe neutral label for any unrecognised value.
- **FR-021**: The history view MUST be paginated and MUST allow the admin to load entries beyond the first page.
- **FR-022**: When a user has no email-change history, the view MUST show an empty state rather than an error.
- **FR-023**: The history view MUST identify initiator and subject by display name only and MUST NOT present internal identifiers as primary content.
- **FR-024**: A user is in a **drift (partial-apply) state** when their most recent email-change record indicates either a newly detected drift or a failed drift-resolution attempt (a failed resolution leaves the account drifted); when the most recent record indicates no outstanding drift — including after a successful resolution — the user is not in a drift state. Drift is surfaced to administrators only within the change-login-email dialog (FR-025); the global administration users list MUST NOT display a per-row drift indicator.

**Drift resolution**

- **FR-025**: When a user is in a drift state (as defined in FR-024), the change-login-email dialog opened for that user MUST show a warning with a Resolve action; when the most recent record indicates no outstanding drift (including after a successful resolution), neither the dialog warning nor the Resolve action MUST appear.
- **FR-026**: The Resolve action MUST present exactly two choices — the old email and the new email recorded on the drift entry — and MUST NOT allow free-text entry of any other address.
- **FR-027**: On successful reconciliation, the system MUST show a success confirmation and clear the drift warning.
- **FR-028**: When reconciliation is rejected — including the case where there is no outstanding drift — the system MUST show the corresponding specific, human-readable message.

**General**

- **FR-029**: All user-facing copy introduced by this feature MUST be in English only; no localised copy is added.

**Reason & approval capture**

- **FR-030**: A change MUST capture a free-text **reason** and the **approver** who authorized it (approver name and role required, approver organization optional). The reason and approver are submitted with the change mutation, recorded on the resulting audit entry, and displayed on the corresponding history entry (FR-019). The reason and the required approver fields MUST be validated client-side (non-empty, within length limits) before submission and gate the submit control (FR-006).

**Platform-admin notification preference**

- **FR-031**: The user notification-settings surfaces MUST expose a platform-admin **"user email changed"** notification preference (in-app, email, and push channels), letting an administrator opt in or out of being notified when any user's login email changes. This preference is read and written through the existing user-settings update flow, alongside the other platform-admin notification preferences.

### Key Entities

- **Login email**: The email address a user authenticates with. It has a current value; an email change replaces it with a new value. Distinct from any display or contact information — this feature touches only the address used to sign in.
- **Email-change attempt (audit entry)**: A record of one attempt to change a user's login email. Carries a timestamp, an outcome, the initiator (the administrator who acted, shown by display name), the subject (the affected user, shown by display name), the old email, the new email, the reason recorded for the change, the approver who authorized it, and a failure reason when applicable. The collection of these entries forms the history view.
- **Outcome**: The classification of an email-change attempt — for example committed, rolled back, drift detected, drift resolved, rejected for validation, or rejected for conflict. Some outcomes are partial successes, where the change committed but a follow-up step (a notification or session sign-out) failed; these are treated as success-with-warning. There are five such partial-success follow-up steps — the security signal, the new-address notification, the global-admin notification, the space-admin notification, and session invalidation. The outcome drives the readable labels and the success / success-with-warning / failure classification in the history view and inline status, and the detection of a drift state.
- **Approval**: The governance record attached to an admin-initiated change — a free-text reason for the change plus the approver (name and role required, organization optional) who authorized it within the subject user's organization. Distinct from the initiator (the platform admin who performed the action in the product). Captured in the change dialog and preserved on the audit entry.
- **Drift state**: A condition where an email change applied to one part of the system but not the other, leaving the account inconsistent and requiring reconciliation. It records the old and new email so the admin can choose a canonical value. The account remains in this state until a reconciliation succeeds — a failed reconciliation attempt does not clear it.
- **Platform administrator**: The only actor permitted to use any part of this feature. Every entry point and action is gated on this role.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A platform administrator can change a user's login email and confirm success without leaving the global administration area, within a single guided dialog flow.
- **SC-002**: After a successful change verified on a development stack, the user can no longer sign in with the old email and can sign in with the new email.
- **SC-003**: 100% of the server's defined email-change failure conditions produce a distinct, human-readable message; no failure produces a blank, missing, or raw technical error.
- **SC-004**: The "address already in use" message is identical regardless of which account holds the address — it leaks no information about the holder.
- **SC-005**: The feature's destructive actions (performing a change, resolving a drift) and the email-change history view are not usable by non-platform-administrators; the change-login-email row control is rendered disabled for non-platform-admins, direct navigation to the history view is denied, and the Resolve action — which has no route of its own — is reachable only via the change dialog, which non-platform-admins cannot open.
- **SC-006**: A platform administrator can view a user's complete email-change history, newest-first, and page through every entry.
- **SC-007**: A drift state is surfaced to the administrator within the change-login-email dialog and can be reconciled to a consistent state entirely through the UI.
- **SC-008**: A routine email change — excluding server processing time — can be completed by an administrator in under one minute.
- **SC-009**: For a change that takes several seconds on the server, a pending indicator is visible for the entire wait and the administrator cannot submit a duplicate change.

## Assumptions

- **A1**: The change-login-email entry point is a per-user row action in the global administration users list, positioned before the existing license-plan and delete row actions, and enabled only for platform administrators (rendered disabled/grayed out for other admin-area users). The MUI per-user admin detail page (`/admin/users/:userId`) is not reachable from the users list, so the list row is the practical and consistent entry point — it mirrors the existing per-row license-plan and delete actions. (Resolved via clarification — see Clarifications, Session 2026-05-20.)
- **A2**: The email-change history is presented as a dedicated route (a separate page) linked from the change-login-email dialog via a "View change history" link, not as an inline section or a modal. (Resolved via clarification — see Clarifications, Session 2026-05-20.)
- **A3**: On a successful change, a brief note is shown that the user has been notified by email. The client itself does not send notifications — the server emits the security signal and acknowledgement. (PRD §8 open question — informed guess.)
- **A4**: "Syntactically valid email" means standard email-format validation consistent with the rest of the client; no domain allow-listing or deliverability check is performed client-side.
- **A5**: The server surface from server spec 097 (the change, drift-resolve, history, and latest-entry operations) is already deployed and stable; no server changes are in scope.
- **A6**: History pagination follows the server's paging model, and page size follows existing global-administration list conventions.
- **A7**: Display names for initiator and subject are always available from the server; no fallback identifier is shown as primary content.
- **A8**: The feature is built entirely within the existing MUI platform-administration area, using MUI and `src/core/ui/` components under `src/domain/platformAdmin/` and `src/main/admin/`. The `/admin/*` route tree is not gated by the CRD design-version toggle, so this feature introduces no CRD (`src/crd/` / `src/main/crdPages/`) components and no CRD admin routing. (Resolved via clarification — see Clarifications, Session 2026-05-20.)

## Dependencies

- Server spec 097 is merged and deployed, exposing the email-change, drift-resolve, history, and latest-entry operations the client consumes. No server work is part of this feature.
- The existing platform-administrator authorization mechanism in the client, used to gate every entry point and action.
- The existing global administration users area, which hosts the new entry point and per-user surfaces.

## Out of Scope

- Self-service email change by users for their own account — covered separately by server spec 098 and its own client work.
- Editing any other identity or profile field (display name, password, profile picture, and so on).
- Localisation or any non-English copy for this feature.
- Any server-side changes — the existing server interface is consumed as-is.
- Bulk email changes across multiple users in a single action.
- Migrating the platform-administration area or the host user page to the CRD design system — this feature builds on the existing MUI admin surface as-is.
