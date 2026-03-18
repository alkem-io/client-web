# Quickstart: Community Polls & Voting — Client UI

**Branch**: `018-community-polls` | **Date**: 2026-03-03

## Prerequisites

- Backend server running at `localhost:3000` with the Community Polls feature deployed (server branch `038-community-polls`)
- Client dev server running at `localhost:3001` (`pnpm start`)
- GraphQL codegen completed after server deployment (`pnpm codegen`)
- A test Space with at least 2 members (one facilitator, one regular member)

---

## Step 1: Create a Poll (as Facilitator)

1. Navigate to a Space's collaboration area
2. Click "Create Callout" (or equivalent action)
3. In the create callout dialog:
   - Set the **display name** (callout title, e.g., "Team Lunch Venue")
   - Set the **description** (poll prompt, e.g., "Where should we go for the team lunch?")
   - Select **Poll** as the framing type
4. In the poll form:
   - Enter a **poll title** (e.g., "Vote for your preferred venue")
   - Add at least 2 options (e.g., "Italian Restaurant", "Sushi Bar", "Burger Joint")
   - Optionally click the **Settings** button to configure:
     - "Allow multiple responses per user" checkbox (unchecked = single-choice, checked = multi-choice; gear icon reveals min/max fields)
     - "Only show results after a user has voted" checkbox (unchecked = VISIBLE, checked = HIDDEN)
     - "Show avatars of voters in the results" checkbox (checked = FULL, unchecked = PERCENTAGE)
5. Click "Post" to publish

**Verify**: The poll callout appears in the space with the ballot icon, title, prompt text, and selectable options.

---

## Step 2: Cast a Vote (as Regular Member)

1. Navigate to the space containing the poll
2. The poll displays with selectable options
3. For single-choice (maxResponses = 1): Click a radio button — the vote is emitted immediately
4. For multi-choice: Check one or more options (up to maxResponses limit) — the vote is emitted automatically after 5 seconds of no further changes

**Verify**:

- Single-choice: vote is submitted instantly on radio click
- Multi-choice: status bar shows "Submitting your vote…" with a spinner after the 5s debounce
- After mutation completes, status bar shows "Voted" with a "remove my vote" link
- Your selected option(s) are visually highlighted (checked state)
- Results display according to the poll's visibility settings
- If resultsDetail = FULL: see vote counts, percentages, and voter avatars
- If resultsDetail = COUNT: see vote counts only
- If resultsDetail = PERCENTAGE: see percentage bars only

---

## Step 3: Change a Vote (as Regular Member)

1. View the poll you already voted on
2. Your current selections are checked/highlighted
3. For single-choice: Click a different radio option — the new vote is emitted immediately
4. For multi-choice: Toggle checkboxes to change selections — the updated vote is emitted after 5 seconds of no further changes

**Verify**:

- Old selections are replaced entirely by the new selection set
- Results update to reflect the change
- Status bar shows "Voted" with "remove my vote" link after mutation completes

---

## Step 4: View Results with Different Visibility Settings

### Test VISIBLE (default)

1. Create a poll with resultsVisibility = VISIBLE
2. As a non-voter, view the poll
3. **Verify**: Full results are visible before voting

### Test HIDDEN

1. Create a poll with resultsVisibility = HIDDEN
2. As a non-voter, view the poll
3. **Verify**: No results shown — no counts, percentages, or totals
4. Vote on the poll
5. **Verify**: After voting, full results are now visible

### Test TOTAL_ONLY

1. Create a poll with resultsVisibility = TOTAL_ONLY
2. As a non-voter, view the poll
3. **Verify**: Only total vote count shown (e.g., "5 votes"), no per-option breakdown
4. Vote on the poll
5. **Verify**: After voting, full per-option results are visible

---

## Step 5: Manage Poll Options (as Facilitator)

All option management is done via the **Edit Callout dialog** — the inline poll view is read-only (voting and results only).

### Add an Option

1. View a poll you can edit
2. Open the callout settings menu (three-dot menu) → click "Edit"
3. In the Edit Callout dialog, click "Add Option"
4. Enter text for the new option
5. Save the dialog

**Verify**: New option appears at the end of the list.

### Edit an Option

1. In the Edit Callout dialog, change the text of an existing option
2. Save the dialog

**Verify**: If the option had votes, a confirmation dialog warns that affected votes will be deleted. After confirming, the option text is updated and affected votes are removed.

### Remove an Option

1. In the Edit Callout dialog, click the remove button on an option
2. Save the dialog

**Verify**: Confirmation dialog if votes exist. After confirming, option is removed. Cannot remove when only 2 options remain (button disabled).

### Reorder Options

1. In the Edit Callout dialog, drag options using the drag handles to reorder
2. Save the dialog

**Verify**: Options appear in the new order. Vote counts and results are unaffected.

---

## Step 6: Test Multi-Select Poll

1. Create a poll with:
   - minResponses: 2
   - maxResponses: 0 (unlimited)
   - At least 4 options
2. As a member, view the poll
3. Select 1 checkbox
4. Wait 5 seconds
5. **Verify**: Vote is NOT emitted (below minResponses); helper text indicates minimum 2 required
6. Select a second checkbox
7. Wait 5 seconds
8. **Verify**: Vote IS emitted after 5s debounce (meets minResponses); status bar shows "Voted"
9. Select all remaining options, waiting 5s after the last click
10. **Verify**: All selections are valid (unlimited max); vote emitted with all selected options

---

## Step 7: Test Notification Preferences

1. Navigate to User Settings > Notifications
2. Scroll to Space notification settings
3. **Verify**: Four new poll preferences are visible:
   - "Someone votes on a poll I created"
   - "Someone votes on a poll I also voted on"
   - "A poll I voted on is modified"
   - "My vote is affected by a poll option change"
4. Toggle each preference on/off (both in-app and email)
5. **Verify**: Preferences persist after page reload

---

## Step 8: Test Edge Cases

### Read-Only Poll (Non-Member)

1. View a poll as a user without CONTRIBUTE privilege
2. **Verify**: Options are visible but no vote controls are shown

### Empty Poll

1. View a poll with no votes
2. **Verify**: "No votes yet" empty state is shown

### Maximum Options Selection

1. In a poll with maxResponses = 3 and 5 options
2. Select 3 options
3. Try to select a 4th
4. **Verify**: 4th selection is prevented; UI indicates the limit

### Validation Errors

1. Create a poll with only 1 option
2. **Verify**: Form validation prevents submission
3. Create a poll with maxResponses = 1 and minResponses = 2
4. **Verify**: Form validation prevents submission (maxResponses < minResponses)

---

## Error Scenarios

| Scenario                                     | Expected Behavior                              |
| -------------------------------------------- | ---------------------------------------------- |
| Network failure during vote submission       | Error message displayed, user can retry        |
| Stale option (removed by admin while voting) | Server validation error, prompt to refresh     |
| Concurrent vote and option removal           | Vote mutation fails gracefully, poll refreshes |
| Empty option text in creation form           | Form validation prevents submission            |
| Poll title exceeds 512 characters            | Form validation prevents submission            |
