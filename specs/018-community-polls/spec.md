# Feature Specification: Community Polls & Voting — Client UI

**Feature Branch**: `018-community-polls`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "Client-side UI for creating, configuring, voting on, and viewing results of community polls within collaboration spaces. Based on server spec at specs/server/."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Viewing a Poll and Casting a Vote (Priority: P1)

A space member navigates to a collaboration space and sees a poll callout. The poll displays its title, the callout description as the poll prompt, and a list of selectable options. The member selects one or more options (depending on poll settings) and submits their vote. Upon voting, the UI immediately reflects their selection and shows results according to the poll's visibility and detail settings.

**Why this priority**: Voting is the core interaction of the feature. Without a way to view and vote on polls, no other functionality matters. This is the minimum viable product.

**Independent Test**: Can be fully tested by navigating to a space containing a poll callout, selecting options, and submitting a vote. Delivers the core value of community polling.

**Acceptance Scenarios**:

1. **Given** a space member views a callout with framing type POLL, **When** the poll loads, **Then** the poll title, prompt (from callout description), and all options are displayed in their defined order.
2. **Given** a single-choice poll (maxResponses = 1), **When** the member selects an option, **Then** only one option can be selected at a time (radio-button behavior).
3. **Given** a multi-choice poll (maxResponses > 1 or 0 for unlimited), **When** the member selects options, **Then** checkboxes allow multiple selections up to the configured maximum.
4. **Given** a multi-choice poll with maxResponses = 3 and the member has already selected 3 options, **When** they try to select a fourth, **Then** the UI prevents the selection and indicates the maximum has been reached.
5. **Given** minResponses = 2 and the member has selected only 1 option, **When** they attempt to submit, **Then** the submit action is disabled with a message indicating the minimum number of selections required.
6. **Given** the member submits their vote successfully, **When** the mutation completes, **Then** the UI updates to show their vote is recorded, their selected options are visually highlighted, and results are displayed according to the poll's visibility settings.
7. **Given** the member has already voted (myVote is not null), **When** they view the poll, **Then** their previously selected options are highlighted and a "Change Vote" action is available.

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
4. **Given** the user enters poll details, **When** they click the "Advanced Settings" button, **Then** a dialog opens where they can configure: response type via radio buttons ("Single response" maps to minResponses=1, maxResponses=1; "Multiple responses" maps to minResponses=1, maxResponses=0), resultsVisibility (default VISIBLE), and resultsDetail (default FULL).
5. **Given** the user is reordering poll options during creation, **When** they drag an option to a new position, **Then** the option moves to the new position via drag-and-drop (using @dnd-kit).
6. **Given** all fields are valid, **When** the user submits, **Then** the createCallout mutation is called with framing.type = POLL and framing.poll populated, and the new poll callout appears in the space.
7. **Given** the user adds options, **When** clicking "Add Option," **Then** a new empty text input is appended to the options list.
8. **Given** the options list has more than 2 entries, **When** the user clicks "Remove" on an option, **Then** that option is removed from the list (minimum 2 enforced).

---

### User Story 4 — Changing a Vote (Priority: P4)

A member who has already voted on a poll decides to change their mind. They can modify their selections and re-submit. The vote is replaced entirely (not partially modified).

**Why this priority**: Vote changing is a natural extension of voting. It improves user confidence since mistakes can be corrected.

**Independent Test**: Can be tested by voting on a poll, then changing the selection and re-submitting, verifying the new selections replace the old ones.

**Acceptance Scenarios**:

1. **Given** a member has already voted on a poll, **When** they view the poll, **Then** their current selections are highlighted and a "Change Vote" control is visible.
2. **Given** the member clicks "Change Vote," **When** the poll enters edit mode, **Then** the member can modify their selections (select/deselect options).
3. **Given** the member modifies their selections and submits, **When** the castPollVote mutation completes, **Then** the old vote is entirely replaced, results update to reflect the change, and their new selections are highlighted.
4. **Given** the member is changing their vote, **When** they decide not to change, **Then** a "Cancel" action returns to the previous state without modifying their vote.

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
6. **Given** the editor clicks "Advanced Settings" in the Edit Callout dialog for a poll, **When** the settings dialog opens, **Then** all advanced settings (response type, results visibility, results detail level) are displayed as read-only and cannot be modified.
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
8. **Given** a member is in the middle of changing their vote (selection mode), **When** a subscription update arrives, **Then** the option list updates but the member's in-progress selection is preserved where possible.

---

### Edge Cases

- What happens when the user votes on a poll but loses network connection mid-request? The UI should show an error state and allow retry without corrupting the local state.
- What happens when a poll has zero votes and the user views results? The results area should show a "No votes yet" empty state rather than empty bars or 0% everywhere.
- What happens when a facilitator removes an option while another user is in the middle of voting? The vote submission should handle the stale option gracefully (server validation error) and prompt the user to refresh and re-select.
- What happens when maxResponses = 0 (unlimited) and a user selects all options? This is a valid state and should be allowed.
- What happens when the poll callout is viewed by a user without CONTRIBUTE privilege (e.g., non-member)? The poll should be read-only — options visible but no vote controls shown.
- What happens when the poll has many options (e.g., 20)? The option list should be scrollable or expandable without breaking the layout.

## Requirements _(mandatory)_

### Functional Requirements

**Poll Display**

- **FR-001**: The client MUST render a poll callout when the callout framing type is POLL, displaying the poll title, the callout framing description as the prompt, and all options.
- **FR-002**: The client MUST display options in vote-count-descending order (as returned by the server) when showing results, and in sort-order when the user has not yet voted and results are hidden.
- **FR-003**: The client MUST use the `canSeeDetailedResults` boolean from the server to determine whether to render per-option result details (counts, percentages, voters).
- **FR-004**: The client MUST display only the total vote count when `canSeeDetailedResults` is false but `totalVotes` is not null (TOTAL_ONLY visibility for non-voters).

**Voting**

- **FR-005**: The client MUST render single-choice selection controls (radio buttons or equivalent) when maxResponses = 1.
- **FR-006**: The client MUST render multi-choice selection controls (checkboxes or equivalent) when maxResponses != 1.
- **FR-007**: The client MUST enforce the minResponses and maxResponses constraints in the UI before allowing vote submission.
- **FR-008**: The client MUST call the `castPollVote` mutation with the complete set of selected option IDs when the user submits a vote.
- **FR-009**: The client MUST highlight the user's currently selected options when `myVote` is present.
- **FR-010**: The client MUST allow users to change their vote by re-entering selection mode and submitting a new complete selection set.

**Results Display**

- **FR-011**: When resultsDetail = PERCENTAGE, the client MUST show percentage bars/values per option and MUST NOT show absolute vote counts or voter lists.
- **FR-012**: When resultsDetail = COUNT, the client MUST show vote counts per option and MUST NOT show percentages or voter lists.
- **FR-013**: When resultsDetail = FULL, the client MUST show vote counts, percentages, and a voter list (avatar + name) per option.
- **FR-014**: The client MUST show an empty state ("No votes yet") when totalVotes = 0 or null.

**Poll Creation**

- **FR-015**: The client MUST add "Poll" as a selectable framing type in the create callout dialog.
- **FR-016**: The client MUST provide a form for poll creation with fields: title, options (dynamic list with drag-and-drop reordering, minimum 2), and an "Advanced Settings" button that opens a dialog with: response type radio buttons ("Single response" = min 1 / max 1, "Multiple responses" = min 1 / max 0), resultsVisibility, and resultsDetail. Advanced settings MUST be read-only when editing an existing callout.
- **FR-017**: The client MUST validate that at least 2 options are provided and option text is not empty before submission.
- **FR-018**: The client MUST send the poll data via the existing createCallout mutation with framing.type = POLL and framing.poll populated.

**Option Management**

- **FR-019**: The client MUST provide UI controls in the Edit Callout dialog for callout editors to add, edit, remove, and reorder poll options. The inline poll view in the callout MUST NOT contain option management controls.
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
- **FR-033**: When a subscription update arrives while the user is in vote-change mode, the client MUST update the option list and results but MUST preserve the user's in-progress selection state where possible.

**Authorization**

- **FR-025**: The client MUST hide vote controls for users without CONTRIBUTE privilege on the poll.
- **FR-026**: The client MUST hide option management controls for users without UPDATE privilege on the parent callout.

### Key Entities

- **Poll**: A community voting element attached to a callout framing. Contains a title, status (OPEN/CLOSED), immutable settings (minResponses, maxResponses, resultsVisibility, resultsDetail), a list of options, total vote count, and the current user's vote.
- **PollOption**: A selectable choice within a poll. Has display text, a sort order, and (when results are visible) vote count, vote percentage, and voter list.
- **PollVote**: The current user's vote on a poll. Contains the list of selected options.
- **PollSettings**: Configuration for a poll. Defines response count limits and results visibility/detail level. Immutable after creation.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A facilitator can create a poll callout with title, description, and options in under 2 minutes.
- **SC-002**: A space member can view a poll and cast a vote in under 30 seconds.
- **SC-003**: 100% of votes cast through the UI are accurately reflected in the results display after mutation completion.
- **SC-004**: Results display correctly adapts to all 6 combinations of resultsVisibility (HIDDEN, TOTAL_ONLY, VISIBLE) and voted/not-voted states.
- **SC-005**: Results display correctly adapts to all 3 resultsDetail levels (PERCENTAGE, COUNT, FULL).
- **SC-006**: A facilitator can add, edit, remove, and reorder poll options via the Edit Callout dialog, with confirmation dialogs shown when votes would be affected.
- **SC-007**: 90% of first-time users successfully cast a vote without needing help or documentation.
- **SC-008**: All poll UI elements meet WCAG 2.1 AA accessibility requirements, including keyboard navigation and screen reader support.

## Assumptions

- The server API follows the GraphQL contract defined in `specs/server/contracts/schema.graphql`.
- Poll creation follows the existing createCallout pattern (same as Whiteboard, Link, Memo).
- The `canSeeDetailedResults` boolean from the server is the single source of truth for whether to render per-option details; the client does not need to replicate the visibility matrix logic.
- Options are returned pre-sorted by the server (by vote count descending, ties by sortOrder); the client renders them in the order received.
- Vote changes use the same `castPollVote` mutation as initial votes (server handles upsert).
- Notification preferences follow the existing user settings pattern already implemented for other notification types.
- Real-time updates are delivered via two GraphQL subscriptions (`pollVoteUpdated` and `pollOptionsChanged`). The server handles visibility filtering at the field-resolver level — the client trusts the data it receives without replicating the visibility matrix.
- The poll's `status` field (OPEN/CLOSED) is always OPEN in this iteration; CLOSED behavior is deferred.
- The `deadline` field is always null in this iteration; deadline-based auto-close is deferred.
