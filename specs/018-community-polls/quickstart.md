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
   - Optionally expand **Advanced Settings** to configure:
     - Min responses: 1 (default)
     - Max responses: 1 (default, single-choice) — set to 0 for unlimited multi-choice
     - Results visibility: VISIBLE (default)
     - Results detail: FULL (default)
5. Click "Post" to publish

**Verify**: The poll callout appears in the space with the ballot icon, title, prompt text, and selectable options.

---

## Step 2: Cast a Vote (as Regular Member)

1. Navigate to the space containing the poll
2. The poll displays with selectable options
3. For single-choice (maxResponses = 1): Click a radio button to select one option
4. For multi-choice: Check one or more options (up to maxResponses limit)
5. Click "Vote" to submit

**Verify**:

- The UI updates to show your vote is recorded
- Your selected option(s) are visually highlighted
- Results display according to the poll's visibility settings
- If resultsDetail = FULL: see vote counts, percentages, and voter avatars
- If resultsDetail = COUNT: see vote counts only
- If resultsDetail = PERCENTAGE: see percentage bars only

---

## Step 3: Change a Vote (as Regular Member)

1. View the poll you already voted on
2. Your current selections are highlighted
3. Click "Change Vote"
4. Modify your selections (deselect current, select new)
5. Click "Vote" to submit the updated selection

**Verify**:

- Old selections are replaced entirely
- Results update to reflect the change
- New selections are highlighted

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

### Add an Option

1. View a poll you can edit
2. Enter edit mode
3. Click "Add Option"
4. Enter text for the new option
5. Confirm

**Verify**: New option appears at the end of the list.

### Edit an Option

1. In edit mode, click edit on an existing option
2. Change the text
3. Confirm

**Verify**: If the option had votes, a confirmation dialog warns that affected votes will be deleted. After confirming, the option text is updated and affected votes are removed.

### Remove an Option

1. In edit mode, click remove on an option
2. Confirm

**Verify**: Confirmation dialog if votes exist. After confirming, option is removed. Cannot remove when only 2 options remain (button disabled).

### Reorder Options

1. In edit mode, drag options or use up/down controls
2. Confirm the new order

**Verify**: Options appear in the new order. Vote counts and results are unaffected.

---

## Step 6: Test Multi-Select Poll

1. Create a poll with:
   - minResponses: 2
   - maxResponses: 0 (unlimited)
   - At least 4 options
2. As a member, view the poll
3. Select 1 option
4. **Verify**: "Vote" button is disabled (minimum 2 required)
5. Select a second option
6. **Verify**: "Vote" button is enabled
7. Select all options
8. **Verify**: All selections are valid (unlimited max)
9. Submit vote

**Verify**: Vote recorded with all selected options.

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
