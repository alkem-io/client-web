# Feature Specification: Community Polls & Voting — Client UI

**Feature Branch**: `018-community-polls`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "Client-side UI for creating, configuring, voting on, and viewing results of community polls within collaboration spaces. Based on server spec at specs/038-community-polls/."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Viewing a Poll and Casting a Vote (Priority: P1)

A space member navigates to a collaboration space and sees a poll callout. The poll displays its title, the callout description as the poll prompt, and a list of selectable options. Voting is immediate — there is no explicit "Vote" button. For single-choice polls (radio buttons), clicking an option emits the vote immediately. For multi-choice polls (checkboxes), clicking a checkbox starts a 2-second countdown; if no further changes are made within 2 seconds the vote is emitted automatically. If another checkbox is toggled before the countdown expires, the timer resets. A status bar (`<Caption>`) below the controls replaces the former vote button, showing contextual state: a loading spinner with "Submitting your vote…" during submission, "Voted" with a "remove my vote" link after voting, or "Poll closed" when the poll is closed. Poll controls (radios/checkboxes) are **never disabled** unless the poll is closed — the user can always click to change their vote directly.

**Why this priority**: Voting is the core interaction of the feature. Without a way to view and vote on polls, no other functionality matters. This is the minimum viable product.

**Independent Test**: Can be fully tested by navigating to a space containing a poll callout, selecting an option, and verifying the vote is emitted (immediately for single-choice, after 2s for multi-choice).

**Acceptance Scenarios**:

1. **Given** a space member views a callout with framing type POLL, **When** the poll loads, **Then** the poll title, prompt (from callout description), and all options are displayed in their defined order.
2. **Given** a single-choice poll (maxResponses = 1), **When** the member clicks a radio option, **Then** only one option can be selected at a time and the vote is emitted immediately (no button needed).
3. **Given** a multi-choice poll (maxResponses > 1 or 0 for unlimited), **When** the member clicks a checkbox, **Then** a 2-second countdown starts. If no further checkbox changes occur within 2 seconds, the vote is emitted automatically.
4. **Given** a multi-choice poll, **When** the member clicks another checkbox before the 2-second countdown expires, **Then** the countdown resets to 2 seconds.
5. **Given** a multi-choice poll with maxResponses = 3 and the member has already selected 3 options, **When** they try to select a fourth, **Then** the UI prevents the selection and indicates the maximum has been reached.
6. **Given** minResponses = 2 and the member has selected only 1 checkbox, **When** the 2-second countdown triggers, **Then** the vote is NOT emitted and a helper message indicates the minimum number of selections required.
7. **Given** the vote is being submitted, **When** the mutation is in flight, **Then** the status bar shows a small loading spinner with "Submitting your vote…".
8. **Given** the member has voted successfully, **When** the mutation completes, **Then** the status bar shows "Voted" followed by a "remove my vote" link, and their selected options are visually highlighted.
9. **Given** the member has already voted (myVote is not null), **When** they view the poll, **Then** their previously selected options are checked/selected and they can directly click any radio or checkbox to change their vote (no separate "Change Vote" mode).
10. **Given** the poll is closed (status = CLOSED), **When** the member views the poll, **Then** all controls are disabled and the status bar shows "Poll closed".

---

### User Story 2 — Viewing Poll Results (Priority: P2)

After voting (or immediately for polls with VISIBLE results), a space member can see how the community has voted. Results show options in their original defined order, with visual indicators (background fill, percentages, or counts) based on the poll's resultsDetail setting. The level of information varies depending on whether the member has voted and the resultsVisibility setting.

**Why this priority**: Seeing results is the primary feedback loop that makes polls valuable. Without visible results, there is no incentive to participate.

**Independent Test**: Can be tested by viewing a poll where the member has already voted (or a poll with VISIBLE visibility), verifying results display matches the configured detail level.

**Acceptance Scenarios**:

1. **Given** resultsVisibility = VISIBLE, **When** any member (voted or not) views the poll, **Then** full results are shown based on the resultsDetail setting.
2. **Given** resultsVisibility = HIDDEN and the member has NOT voted, **When** they view the poll, **Then** no results information is shown — no counts, percentages, or voter lists.
3. **Given** resultsVisibility = HIDDEN and the member HAS voted, **When** they view the poll, **Then** full results are shown based on the resultsDetail setting.
4. **Given** resultsVisibility = TOTAL_ONLY and the member has NOT voted, **When** they view the poll, **Then** only the total vote count is displayed (no per-option breakdown).
5. **Given** resultsVisibility = TOTAL_ONLY and the member HAS voted, **When** they view the poll, **Then** full results are shown based on the resultsDetail setting.
6. **Given** resultsDetail = PERCENTAGE, **When** results are visible, **Then** each option shows a percentage bar but no absolute vote count or voter list.
7. **Given** resultsDetail = COUNT, **When** results are visible, **Then** each option shows its vote count but no percentages or voter list.
8. **Given** resultsDetail = FULL, **When** results are visible, **Then** each option shows vote count, percentage, and a list of voters (with user avatars/names).
9. **Given** options are displayed in results, **When** rendering, **Then** options maintain the same order as defined by the poll creator (sorted by sortOrder), regardless of vote counts.
10. **Given** canSeeDetailedResults is false, **When** rendering, **Then** per-option results (counts, percentages, voters) are not displayed.

---

### User Story 3 — Creating a Poll (Priority: P3)

A space facilitator (user with callout creation rights) creates a new poll within a collaboration space. They use the existing "create callout" flow, selecting "Poll" as the callout type. The creation form collects the poll title, prompt text (via the callout framing profile description), at least two options, and optional settings for response limits and results visibility.

**Why this priority**: Creation is essential for the full lifecycle but has a smaller user base (facilitators only). Polls can be seeded via API/backend for initial testing of voting and results.

**Independent Test**: Can be tested by opening the create callout dialog, selecting Poll type, filling in the form, and verifying the poll appears in the space.

**Acceptance Scenarios**:

1. **Given** a user with callout creation rights opens the create callout dialog, **When** they select the framing type, **Then** "Poll" appears as an option alongside existing types (Whiteboard, Link, Memo, etc.).
2. **Given** the user selects Poll type, **When** the form renders, **Then** it shows fields for: poll title, callout description (serves as prompt), and a dynamic list of option text inputs (minimum 2).
3. **Given** the user has entered a title and fewer than 2 options, **When** they attempt to submit, **Then** validation prevents submission with a message indicating at least 2 options are required.
4. **Given** the user enters poll details, **When** they click the "Settings" button, **Then** a dialog opens with two sections: **Voting options** with checkboxes — "Allow multiple responses per user" (unchecked = single choice min=1/max=1, checked = unlimited multi-choice min=1/max=0) with a gear icon button that reveals detailed min/max numeric fields (with +/- stepper buttons and an infinity button for unlimited max), and "Allow users to add new options" checkbox — when checked, sets allowContributorsAddOptions to true; and **Display options** with checkboxes — "Only show results after a user has voted" (checked = resultsVisibility HIDDEN, unchecked = VISIBLE; TOTAL_ONLY is not exposed in the creation UI) and "Show avatars of voters in the results" (checked = resultsDetail FULL, unchecked = PERCENTAGE; COUNT is not exposed in the creation UI). The dialog's Close button is disabled when validation errors exist in the settings; attempting to close shows a confirmation dialog warning that saving the callout will be blocked.
5. **Given** the user is reordering poll options during creation, **When** they drag an option to a new position, **Then** the option moves to the new position via drag-and-drop (using @dnd-kit).
6. **Given** all fields are valid, **When** the user submits, **Then** the createCallout mutation is called with framing.type = POLL and framing.poll populated, and the new poll callout appears in the space.
7. **Given** the user adds options, **When** clicking "Add Option," **Then** a new empty text input is appended to the options list.
8. **Given** the options list has more than 2 entries, **When** the user clicks "Remove" on an option, **Then** that option is removed from the list (minimum 2 enforced).

---

### User Story 4 — Changing a Vote (Priority: P4)

A member who has already voted on a poll can change their vote at any time by simply clicking a different option. There is no separate "Change Vote" mode or button — the controls are always interactive (unless the poll is closed). For single-choice polls, clicking a different radio emits the new vote immediately. For multi-choice polls, toggling any checkbox resets the 2-second debounce timer before the updated selection set is submitted. The vote is replaced entirely (not partially modified).

**Why this priority**: Vote changing is a natural extension of voting. It improves user confidence since mistakes can be corrected.

**Independent Test**: Can be tested by voting on a poll, then clicking a different option and verifying the new selection replaces the old one.

**Acceptance Scenarios**:

1. **Given** a member has already voted on a single-choice poll, **When** they click a different radio option, **Then** the new vote is emitted immediately and the old vote is entirely replaced.
2. **Given** a member has already voted on a multi-choice poll, **When** they toggle a checkbox, **Then** a 2-second debounce timer starts (or resets) before the full updated selection set is submitted.
3. **Given** the member changes their vote, **When** the castPollVote mutation completes, **Then** the results update to reflect the change, and the status bar shows "Voted" with the "remove my vote" link.
4. **Given** the poll is closed, **When** the member views their past vote, **Then** controls are disabled and no vote change is possible.

---

### User Story 5 — Managing Poll Options (Priority: P5)

A callout editor (facilitator/admin) can manage the options of an existing poll through the **Edit Callout dialog**: add new options, edit option text, remove options, and reorder options. All option management is consolidated in the edit callout form — the inline callout view is read-only (voting + results only, no edit controls). Editing or removing an option that has received votes triggers vote cleanup and notifies affected voters.

**Why this priority**: Option management is needed for poll maintenance but is an administrative action. Polls can function without post-creation edits.

**Independent Test**: Can be tested by opening the Edit Callout dialog on a poll, adding/removing/reordering options via the form, saving, and verifying the poll updates correctly.

**Acceptance Scenarios**:

1. **Given** a callout editor opens the Edit Callout dialog for a poll, **When** the dialog loads, **Then** the poll form shows the current options with text fields, remove buttons, drag-and-drop reorder handles, and an "Add Option" button.
2. **Given** the editor clicks "Add Option" in the edit form, **When** they enter text, **Then** a new option input is appended to the options list.
3. **Given** the editor edits an option's text in the form, **When** they save the callout, **Then** the updatePollOption mutation is called. If the option had votes, a confirmation dialog warns that affected votes will be deleted.
4. **Given** the editor removes an option in the form, **When** they save the callout, **Then** the removePollOption mutation is called. If the option had votes, a confirmation dialog warns that affected votes will be deleted. At least 2 options must remain.
5. **Given** the editor reorders options via drag-and-drop in the form, **When** they save the callout, **Then** the reorderPollOptions mutation is called with the full set of option IDs in the new order.
6. **Given** the editor clicks "Settings" in the Edit Callout dialog for a poll, **When** the settings dialog opens, **Then** all settings checkboxes ("Allow multiple responses per user", "Allow users to add new options", "Only show results after a user has voted", "Show avatars of voters in the results") and the gear icon button are shown in a disabled read-only state. The gear icon is always present (not conditional on custom values); clicking it in read-only mode is a no-op.
7. **Given** only 2 options remain in the form, **When** the editor tries to remove one, **Then** the remove button is disabled/hidden (minimum 2 enforced).
8. **Given** a callout editor views a poll in the callout view, **When** they look at the poll, **Then** NO inline edit controls are shown — the poll view is read-only (voting and results only). Editing is only available through the Edit Callout dialog accessed via the callout settings menu.

---

### User Story 6 — Poll Notification Preferences (Priority: P6)

Users can manage their notification preferences for poll-related events. Four new notification types are available in the user settings: vote cast on own poll, vote cast on a poll I voted on, poll modified on a poll I voted on, and vote affected by option change.

**Why this priority**: Notifications are a secondary engagement feature. The core poll functionality works without them, and they depend on the server notification infrastructure being in place.

**Independent Test**: Can be tested by navigating to user notification settings and toggling poll notification preferences on/off.

**Acceptance Scenarios**:

1. **Given** a user opens their notification settings, **When** the settings load, **Then** four new poll-related preferences are displayed with descriptive labels.
2. **Given** the user toggles a poll notification preference, **When** they save, **Then** the preference is persisted and reflected on next load.

---

### User Story 7 — Real-Time Poll Updates via Subscriptions (Priority: P7)

A space member is viewing a poll callout. When another user casts a vote or a facilitator modifies poll options, the viewing member's UI updates in real time without requiring a page refresh. The subscription is active while the callout is visible and respects the poll's visibility and detail settings — the server filters the payload so the client only receives data appropriate for the viewer.

**Why this priority**: Real-time updates enhance engagement but the core poll functionality (voting, results, creation) works without them. Subscriptions are an incremental improvement on top of a complete feature.

**Independent Test**: Open a poll in two browser tabs (different users) → vote in one tab → verify the other tab updates in real time. Modify options as facilitator → verify viewers see changes.

**Acceptance Scenarios**:

1. **Given** a member is viewing a poll callout, **When** another user casts a vote, **Then** the poll results update in real time (vote counts, percentages, voter lists as applicable) without requiring a page refresh.
2. **Given** a member is viewing a poll callout, **When** a facilitator adds, removes, edits, or reorders poll options, **Then** the poll options update in real time.
3. **Given** a member has voted and is viewing results, **When** another user votes, **Then** the results display updates smoothly with new counts/percentages.
4. **Given** a poll with resultsVisibility = HIDDEN and the member has NOT voted, **When** another user votes, **Then** the subscription event is suppressed — no data is received and the UI remains unchanged.
5. **Given** a poll with resultsVisibility = TOTAL_ONLY and the member has NOT voted, **When** another user votes, **Then** only the total vote count updates; no per-option details are shown.
6. **Given** a member has voted on a poll, **When** a facilitator removes an option the member voted for, **Then** the member's `myVote` becomes null (vote revoked) and the UI returns to voting mode.
7. **Given** a member navigates away from the poll callout, **When** the callout is no longer visible, **Then** the subscription is unsubscribed to avoid unnecessary network traffic.
8. **Given** a member is in the middle of a multi-choice debounce countdown, **When** a subscription update arrives, **Then** the option list updates but the member's in-progress selection and countdown timer are preserved where possible.

---

### User Story 8 — Contributor-Added Poll Options (Priority: P8)

When `allowContributorsAddOptions` is enabled in poll settings, users with CONTRIBUTE privilege can add their own custom option to the poll and immediately vote on it. A special row appears at the bottom of the poll options (radio for single-choice, checkbox for multi-choice) labeled "Add a custom response...". Clicking it transforms into a text field with a checkmark submit button. Submitting adds the option via mutation and immediately casts a vote. Escape dismisses. Max 10 options enforced.

**Why this priority**: Contributor-added options increase engagement by allowing the community to shape the poll collaboratively. This builds on the existing voting and option management infrastructure.

**Independent Test**: Enable allowContributorsAddOptions on a poll → as a contributor, click the custom option row → type a new option → submit → verify the option is added and a vote is cast.

**Acceptance Scenarios**:

1. **Given** allowContributorsAddOptions is true and the poll is OPEN and has fewer than 10 options, **When** a user with CONTRIBUTE privilege views the poll, **Then** a special "Add a custom response..." row appears after the last option (radio for single-choice, checkbox for multi-choice).
2. **Given** the user clicks the "Add a custom response..." radio/checkbox, **When** clicked, **Then** the label transforms into a TextField with InputAdornment containing a checkmark IconButton, and the text field is focused.
3. **Given** the text field is visible, **When** the user types a valid option (non-empty, max 512 chars) and clicks the checkmark or presses Enter, **Then** the addPollOption mutation is called, followed immediately by castPollVote with the new option selected (single-choice: just the new option; multi-choice: all currently selected options plus the new one).
4. **Given** the add+vote operation is in progress, **When** the status bar updates, **Then** it shows "Adding option..." during addPollOption, then "Submitting your vote..." during castPollVote.
5. **Given** the text field is visible, **When** the user presses Escape, **Then** the text field disappears, the special radio/checkbox is deselected, and the row returns to its "Add a custom response..." label state.
6. **Given** the poll already has 10 options, **When** the user views the poll, **Then** the "Add a custom response..." row does NOT appear.
7. **Given** allowContributorsAddOptions is false, **When** any user views the poll, **Then** the "Add a custom response..." row does NOT appear.
8. **Given** the poll is CLOSED, **When** the user views the poll, **Then** the "Add a custom response..." row does NOT appear.
9. **Given** the user added a custom option and voted on it, **When** they later remove their vote, **Then** the option remains as a normal poll option.
10. **Given** the user successfully adds a custom option and votes, **When** the mutations complete and the poll re-renders, **Then** the new option appears as a normal option in the list, and a new "Add a custom response..." row appears at the bottom (if still under 10 options).

---

### User Story 9 — Closing and Reopening a Poll (Priority: P9)

A callout editor (facilitator/admin) can close or reopen a poll from the Edit Callout dialog. When editing a poll, a "Close poll" button appears (or "Reopen poll" if the poll is already closed). Clicking the button shows a confirmation dialog. On confirmation, the `updatePollStatus` mutation is called. A loading state disables the button during the mutation, and a toast notification confirms success or reports failure.

**Why this priority**: Closing/reopening polls is an administrative action that controls the poll lifecycle. The core voting flow works without it, but facilitators need to be able to end voting when appropriate.

**Independent Test**: As a facilitator, open the Edit Callout dialog on an open poll → click "Close poll" → confirm → verify the poll status changes and a success toast appears. Open the dialog again → click "Reopen poll" → confirm → verify the poll reopens.

**Acceptance Scenarios**:

1. **Given** a callout editor opens the Edit Callout dialog for a poll that is OPEN, **When** the dialog loads, **Then** a "Close poll" button is visible in the poll form.
2. **Given** a callout editor opens the Edit Callout dialog for a poll that is CLOSED, **When** the dialog loads, **Then** a "Reopen poll" button is visible in the poll form.
3. **Given** the editor is creating a new poll (not editing), **When** the form renders, **Then** no close/reopen button is shown.
4. **Given** the editor clicks "Close poll", **When** the confirmation dialog appears, **Then** it warns that users will no longer be able to vote.
5. **Given** the editor clicks "Reopen poll", **When** the confirmation dialog appears, **Then** it explains that users will be able to vote again.
6. **Given** the editor confirms the action, **When** the mutation is in flight, **Then** the confirm button shows a loading state and the close/reopen button in the form is disabled.
7. **Given** the mutation completes successfully, **When** the UI updates, **Then** a success toast notification is shown ("Poll closed successfully" or "Poll reopened successfully").
8. **Given** the mutation fails, **When** the error occurs, **Then** an error toast notification is shown ("Failed to update poll status. Please try again.").

---

### Edge Cases

- What happens when the user votes on a poll but loses network connection mid-request? The UI should show an error state and allow retry without corrupting the local state.
- What happens when a poll has zero votes and the user views results? The results area should show a "No votes yet" empty state rather than empty bars or 0% everywhere.
- What happens when a facilitator removes an option while another user is in the middle of voting? The vote submission should handle the stale option gracefully (server validation error) and prompt the user to refresh and re-select.
- What happens when maxResponses = 0 (unlimited) and a user selects all options? This is a valid state and should be allowed.
- What happens when the poll callout is viewed by a user without CONTRIBUTE privilege (e.g., non-member)? The poll should be read-only — options visible but no vote controls shown.
- What happens when the poll has many options (e.g., 20)? The option list should be scrollable or expandable without breaking the layout.
- What happens when the poll has 10 options and allowContributorsAddOptions is true? The "Add a custom response..." row is hidden; the maximum of 10 options is a hard cap.

## Requirements _(mandatory)_

### Functional Requirements

**Poll Display**

- **FR-001**: The client MUST render a poll callout when the callout framing type is POLL, displaying the poll title, the callout framing description as the prompt, and all options.
- **FR-002**: The client MUST display options in `sortOrder ASC` (the order defined by the poll creator), as returned by the server. The server always returns options in `sortOrder ASC` regardless of vote counts or visibility state.
- **FR-003**: The client MUST use the `canSeeDetailedResults` boolean from the server to determine whether to render per-option result details (counts, percentages, voters).
- **FR-004**: The client MUST display only the total vote count when `canSeeDetailedResults` is false but `totalVotes` is not null (TOTAL_ONLY visibility for non-voters).

**Voting**

- **FR-005**: The client MUST render single-choice selection controls (radio buttons or equivalent) when maxResponses = 1.
- **FR-006**: The client MUST render multi-choice selection controls (checkboxes or equivalent) when maxResponses != 1.
- **FR-007**: The client MUST enforce the minResponses and maxResponses constraints in the UI before allowing vote submission.
- **FR-008**: For single-choice polls (maxResponses = 1), the client MUST call the `castPollVote` mutation immediately when the user clicks a radio option. For multi-choice polls, the client MUST start a 2-second debounce timer on each checkbox change and emit the vote automatically when the timer expires. The timer MUST reset on each subsequent checkbox change.
- **FR-008b**: The client MUST NOT emit a debounced multi-choice vote if the current selection count is below `minResponses`.
- **FR-009**: The client MUST highlight the user's currently selected options when `myVote` is present.
- **FR-010**: The client MUST allow users to change their vote directly by clicking controls — no separate "Change Vote" mode or button is used. Controls are always interactive unless the poll is closed.
- **FR-010b**: The client MUST display a status bar (`<Caption>`) below the poll controls showing contextual state: (a) a `CircularProgress` spinner with "Submitting your vote…" while a vote mutation is in flight, (b) "Voted" with a "remove my vote" text link when the user has voted, (c) "Poll closed" when `poll.status === CLOSED`. The status bar replaces the former Vote / Change Vote / Cancel buttons. Clicking "remove my vote" calls the `removePollVote` mutation, clears `myVote`, and returns the user to the unvoted state.
- **FR-010c**: The client MUST NOT render a "Vote" button, "Change My Vote" button, or "Cancel" button. All voting interaction happens via direct control clicks.

**Results Display**

- **FR-011**: When resultsDetail = PERCENTAGE, the client MUST show percentage bars/values per option and MUST NOT show absolute vote counts or voter lists.
- **FR-012**: When resultsDetail = COUNT, the client MUST show vote counts per option and MUST NOT show percentages or voter lists.
- **FR-013**: When resultsDetail = FULL, the client MUST show vote counts, percentages, and a voter list (avatar + name) per option.
- **FR-014**: The client MUST show an empty state ("No votes yet") when totalVotes = 0 or null.

**Poll Creation**

- **FR-015**: The client MUST add "Poll" as a selectable framing type in the create callout dialog.
- **FR-016**: The client MUST provide a form for poll creation with fields: title (optional), options (dynamic list with drag-and-drop reordering, minimum 2), and a "Settings" button that opens a dialog with two sections: **Voting options** ("Allow multiple responses per user" checkbox: unchecked = single choice min=1/max=1, checked = unlimited multi-choice min=1/max=0; a gear icon button next to it that reveals detailed min/max numeric fields with +/- stepper buttons and an infinity button for unlimited max; "Allow users to add new options" checkbox — when checked, contributors can add their own options to the poll (see FR-034–FR-037)) and **Display options** ("Only show results after a user has voted" checkbox: checked = resultsVisibility HIDDEN, unchecked = VISIBLE; "Show avatars of voters in the results" checkbox: checked = resultsDetail FULL, unchecked = PERCENTAGE). The TOTAL_ONLY resultsVisibility value and COUNT resultsDetail value are intentionally not exposed in the creation UI — the server retains full support and renders them correctly on existing polls. The settings dialog Close button MUST be disabled when validation errors exist; attempting to close with errors shows a confirmation dialog. All settings MUST be disabled/read-only when editing an existing callout.
- **FR-017**: The client MUST validate that at least 2 options are provided, option text is not empty, and a maximum of 10 options are allowed before submission. Additionally, the validation schema MUST enforce: (1) minResponses ≤ number of options, (2) maxResponses ≤ number of options (when maxResponses > 0), and (3) minResponses ≤ maxResponses (when maxResponses > 0). Validation errors on these cross-field rules are shown on the corresponding settings field and prevent closing the settings dialog.
- **FR-018**: The client MUST send the poll data via the existing createCallout mutation with framing.type = POLL and framing.poll populated.

**Option Management**

- **FR-019**: The client MUST provide UI controls in the Edit Callout dialog for callout editors to add, edit, remove, and reorder poll options. The inline poll view in the callout MUST NOT contain option management controls. The "Add Option" control MUST be disabled when the poll already has 10 options (the same `MAX_POLL_OPTIONS` limit enforced by FR-017 for creation and FR-037 for contributor additions applies globally to facilitator edits).
- **FR-020**: The client MUST show a confirmation dialog before editing or removing an option that has votes, warning the user that affected votes will be deleted.
- **FR-021**: The client MUST prevent removing options when only 2 remain.
- **FR-022**: The client MUST call the appropriate mutations (addPollOption, updatePollOption, removePollOption, reorderPollOptions) for each management action.

**Notification Preferences**

- **FR-023**: The client MUST display four new poll notification preferences in the user notification settings area.
- **FR-024**: The client MUST allow users to toggle each poll notification preference independently.

**Real-Time Subscriptions**

- **FR-027**: The client MUST subscribe to `pollVoteUpdated` and `pollOptionsChanged` GraphQL subscriptions when a poll callout is visible, passing the poll ID as argument.
- **FR-028**: The client MUST unsubscribe from both subscriptions when the poll callout is no longer visible (component unmount or navigation away).
- **FR-029**: When a `pollVoteUpdated` event is received, the client MUST update the Apollo cache with the new poll data (vote counts, percentages, voter lists, totalVotes, myVote) as returned by the server.
- **FR-030**: When a `pollOptionsChanged` event is received, the client MUST update the Apollo cache with the new options list and any updated vote data as returned by the server.
- **FR-031**: The client MUST NOT replicate visibility filtering logic — the server's field resolvers handle filtering based on resultsVisibility, resultsDetail, and the viewer's voted status. The client renders whatever data it receives.
- **FR-032**: When a subscription update sets `myVote` to null (vote revoked due to option change), the client MUST transition the UI back to voting mode.
- **FR-033**: When a subscription update arrives while the user is in the middle of a multi-choice debounce countdown, the client MUST update the option list and results but MUST preserve the user's in-progress selection and countdown timer where possible.

**Authorization**

- **FR-025**: The client MUST hide vote controls for users without CONTRIBUTE privilege on the poll.
- **FR-026**: The client MUST hide option management controls for users without UPDATE privilege on the parent callout.

**Contributor-Added Options**

- **FR-034**: When `allowContributorsAddOptions` is true, the poll is OPEN, the user has CONTRIBUTE privilege, and fewer than 10 options exist, the client MUST render a special "Add a custom response..." row at the bottom of the poll options list — a radio button for single-choice polls or a checkbox for multi-choice polls.
- **FR-035**: When the user activates the "Add a custom response..." control, the client MUST replace the label with a TextField containing an InputAdornment with a checkmark IconButton for submission and a close IconButton for dismissal. The TextField MUST be auto-focused. Pressing Enter MUST trigger submission. Pressing Escape or clicking the close button MUST dismiss the text field and deselect the control.
- **FR-036**: On submission, the client MUST call addPollOption followed by castPollVote. For single-choice polls, the vote selects only the new option. For multi-choice polls, the vote includes all currently selected options plus the new option. The status bar MUST show "Adding option..." during addPollOption and "Submitting your vote..." during castPollVote.
- **FR-037**: The client MUST enforce a hard maximum of 10 poll options. The "Add a custom response..." row MUST NOT appear when 10 options already exist. This limit is independent of minResponses and maxResponses.

**Poll Status Management**

- **FR-038**: The client MUST display a "Close poll" button in the Edit Callout dialog when the poll status is OPEN, and a "Reopen poll" button when the poll status is CLOSED. The button MUST NOT be shown during poll creation (only when editing).
- **FR-039**: The client MUST show a confirmation dialog before changing poll status, with context-appropriate messaging (closing warns voting will stop, reopening explains voting will resume).
- **FR-040**: The client MUST call the `updatePollStatus` mutation with the poll ID and the new status (CLOSED or OPEN) when the user confirms the action.
- **FR-041**: The client MUST show a loading state on the button while the mutation is in flight and disable it to prevent duplicate submissions.
- **FR-042**: The client MUST show a success toast notification when the status change completes and an error toast notification when it fails.

### Key Entities

- **Poll**: A community voting element attached to a callout framing. Contains a title, status (OPEN/CLOSED), immutable settings (minResponses, maxResponses, resultsVisibility, resultsDetail), a list of options, total vote count, and the current user's vote.
- **PollOption**: A selectable choice within a poll. Has display text, a sort order, and (when results are visible) vote count, vote percentage, and voter list.
- **PollVote**: The current user's vote on a poll. Contains the list of selected options.
- **PollSettings**: Configuration for a poll. Defines response count limits, results visibility/detail level, and whether contributors can add their own options. Polls have a hard maximum of 10 options. Immutable after creation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A facilitator can create a poll callout with title, description, and options in under 2 minutes.
- **SC-002**: A space member can view a poll and cast a vote in under 30 seconds.
- **SC-003**: 100% of votes cast through the UI are accurately reflected in the results display after mutation completion.
- **SC-004**: Results display correctly adapts to all three visibility states (HIDDEN, TOTAL_ONLY, VISIBLE) and voted/not-voted states. Note: TOTAL_ONLY is not exposed in the poll creation UI but the client renders it correctly when encountered.
- **SC-005**: Results display correctly adapts to all three resultsDetail levels (PERCENTAGE, COUNT, FULL). Note: COUNT is not exposed in the poll creation UI but the client renders it correctly when encountered.
- **SC-006**: A facilitator can add, edit, remove, and reorder poll options via the Edit Callout dialog, with confirmation dialogs shown when votes would be affected.
- **SC-007**: 90% of first-time users successfully cast a vote without needing help or documentation.
- **SC-008**: All poll UI elements meet WCAG 2.1 AA accessibility requirements, including keyboard navigation and screen reader support.

## Known Limitations

- **Poll templates not supported**: Poll callouts cannot be saved as templates and the Poll framing type is disabled in the callout template creation form. This is a temporary limitation until poll template support is implemented.

## Assumptions

- The server API follows the GraphQL contract defined in `specs/038-community-polls/`.
- Poll creation follows the existing createCallout pattern (same as Whiteboard, Link, Memo).
- The `canSeeDetailedResults` boolean from the server is the single source of truth for whether to render per-option details; the client does not need to replicate the visibility matrix logic.
- Options are returned pre-sorted by the server in `sortOrder ASC` (configured option order); the client renders them in the order received.
- Vote changes use the same `castPollVote` mutation as initial votes (server handles upsert).
- Notification preferences follow the existing user settings pattern already implemented for other notification types.
- Real-time updates are delivered via two GraphQL subscriptions (`pollVoteUpdated` and `pollOptionsChanged`). The server handles visibility filtering at the field-resolver level — the client trusts the data it receives without replicating the visibility matrix.
- The poll's `status` field (OPEN/CLOSED) can be changed by callout editors via the `updatePollStatus` mutation (FR-038–FR-042). The client renders CLOSED state correctly: all controls disabled and status bar shows "Poll closed" (FR-010b).
- The `deadline` field is always null in this iteration; deadline-based auto-close is deferred.
