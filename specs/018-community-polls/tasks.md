# Tasks: Community Polls & Voting — Client UI

**Input**: Design documents from `/specs/018-community-polls/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests for domain hooks are included in Phase 9. UI/integration tests will be added to the separate test project (not in this repository).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Generate types from updated server schema and create the poll domain directory structure.

- [x] T001 Run `pnpm codegen` to generate updated GraphQL types including Poll, PollOption, PollVote, PollSettings, PollStatus, PollResultsVisibility, PollResultsDetail, and the extended CalloutFramingType enum with POLL value (requires server with polls feature running at localhost:4000/graphql)
- [x] T002 Create poll domain directory structure: `src/domain/collaboration/poll/`, `src/domain/collaboration/poll/models/`, `src/domain/collaboration/poll/hooks/`, `src/domain/collaboration/poll/graphql/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, fragments, icons, and i18n keys that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create poll GraphQL fragments (PollSettingsFields, PollOptionFields, PollVoteFields, PollDetails) in `src/domain/collaboration/poll/graphql/pollFragments.graphql` — use the fragment definitions from `specs/018-community-polls/contracts/graphql-operations.graphql`
- [x] T004 Add poll field with `...PollDetails` fragment spread to the framing section of the callout content query in `src/domain/collaboration/callout/graphql/CalloutContent.graphql` — add `poll { ...PollDetails }` alongside existing whiteboard, memo, link, and mediaGallery fields
- [x] T005 Run `pnpm codegen` to regenerate hooks after adding the new fragments and query changes
- [x] T006 [P] Create client view model types (PollDetailsModel, PollSettingsModel, PollOptionModel, PollVoteModel, PollFormValues, PollSettingsFormValues) in `src/domain/collaboration/poll/models/PollModels.ts` — follow the type definitions from `specs/018-community-polls/data-model.md`
- [x] T007 [P] Add optional `poll?: PollDetailsModel` field to the `framing` type in `src/domain/collaboration/callout/models/CalloutDetailsModel.ts` — follows the same pattern as existing `whiteboard?`, `memo?`, `link?`, `mediaGallery?` fields
- [x] T008 [P] Add optional `poll?: PollFormValues` field to the `framing` type in `src/domain/collaboration/callout/CalloutForm/CalloutFormModel.ts` — add alongside existing whiteboard, memo, link, mediaGallery fields in `CalloutFormSubmittedValues`
- [x] T009 [P] Add `BallotOutlined` icon mapping for `CalloutFramingType.Poll` to the `calloutFramingIcons` record in `src/domain/collaboration/callout/icons/calloutIcons.ts` — import `BallotOutlined` from `@mui/icons-material` and add entry; also update `getCalloutIconLabelKey()` to handle POLL type
- [x] T010 [P] Add `disablePolls?: boolean` to the `CalloutRestrictions` interface in `src/domain/collaboration/callout/CalloutRestrictionsTypes.ts`
- [x] T011 [P] Add poll-related i18n keys to `src/core/i18n/en/translation.en.json`:
  - `callout.create.framingSettings.poll.title` — "Poll"
  - `callout.create.framingSettings.poll.tooltip` — "Create a poll for community voting"
  - `common.calloutType.POLL` — "Poll"
  - `poll.vote.button` — "Vote"
  - `poll.vote.changeButton` — "Change Vote"
  - `poll.vote.cancelButton` — "Cancel"
  - `poll.vote.submitted` — "Your vote has been recorded"
  - `poll.vote.minRequired` — "Select at least {{min}} option(s)"
  - `poll.vote.maxReached` — "Maximum {{max}} selections allowed"
  - `poll.results.noVotes` — "No votes yet"
  - `poll.results.totalVotes` — "{{count}} vote(s)"
  - `poll.results.voters` — "Voters"
  - `poll.options.add` — "Add Option"
  - `poll.options.remove` — "Remove Option"
  - `poll.options.edit` — "Edit Option"
  - `poll.options.reorder` — "Reorder Options"
  - `poll.options.minRequired` — "At least 2 options are required"
  - `poll.options.confirmEdit` — "Editing this option will delete all votes for it. Continue?"
  - `poll.options.confirmRemove` — "Removing this option will delete all votes for it. Continue?"
  - `poll.create.title` — "Poll Title"
  - `poll.create.options` — "Options"
  - `poll.create.settings` — "Advanced Settings"
  - `poll.create.minResponses` — "Minimum selections"
  - `poll.create.maxResponses` — "Maximum selections"
  - `poll.create.maxResponsesUnlimited` — "0 = unlimited"
  - `poll.create.resultsVisibility` — "Results visibility"
  - `poll.create.resultsVisibility.VISIBLE` — "Always visible"
  - `poll.create.resultsVisibility.HIDDEN` — "Hidden until voted"
  - `poll.create.resultsVisibility.TOTAL_ONLY` — "Total count only until voted"
  - `poll.create.resultsDetail` — "Results detail level"
  - `poll.create.resultsDetail.FULL` — "Full (counts, percentages, and voters)"
  - `poll.create.resultsDetail.COUNT` — "Counts only"
  - `poll.create.resultsDetail.PERCENTAGE` — "Percentages only"
  - `poll.manage.editPoll` — "Edit Poll"
  - `poll.manage.done` — "Done"
  - `poll.error.voteFailed` — "Failed to submit your vote. Please try again."
  - `poll.error.staleOption` — "This poll has been updated. Please refresh and try again."
  - `poll.error.networkError` — "Network error. Please check your connection and try again."
  - `poll.error.optionActionFailed` — "Failed to update poll options. Please try again."
  - Notification preferences (under `pages.userNotificationsSettings.space.settings`):
    - `collaborationPollVoteCastOnOwnPoll` — "Someone votes on a poll I created"
    - `collaborationPollVoteCastOnPollIVotedOn` — "Someone votes on a poll I also voted on"
    - `collaborationPollModifiedOnPollIVotedOn` — "A poll I voted on is modified"
    - `collaborationPollVoteAffectedByOptionChange` — "My vote is affected by a poll option change"
- [x] T012 Add poll type handling to the callout template-to-form mapping function in `src/domain/collaboration/callout/models/mappings.ts` — add a case for `CalloutFramingType.Poll` that maps server poll data to form values, following the pattern used for Whiteboard/Memo/Link/MediaGallery

**Checkpoint**: Foundation ready — all types, fragments, icons, and i18n keys in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Viewing a Poll and Casting a Vote (Priority: P1) 🎯 MVP

**Goal**: Space members can see a poll callout, view its options, select one or more, and submit their vote. After voting, selected options are highlighted and results appear according to visibility settings.

**Independent Test**: Navigate to a space with a poll callout → select options → submit vote → verify selections are highlighted and results update.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create `PollEmptyState` component in `src/domain/collaboration/poll/PollEmptyState.tsx` — displays "No votes yet" message using MUI Typography with the `poll.results.noVotes` i18n key, rendered when `totalVotes` is 0 or null
- [x] T014 [P] [US1] Create `PollVotingControls` component in `src/domain/collaboration/poll/PollVotingControls.tsx` — renders MUI RadioGroup when `settings.maxResponses === 1` (single-choice) or MUI Checkbox group otherwise (multi-choice). Props: options list, selected option IDs, maxResponses, minResponses, disabled flag, onChange callback. Enforces maxResponses limit by disabling unselected options when limit is reached. Shows `poll.vote.minRequired` message when fewer than minResponses are selected
- [x] T015 [US1] Create `usePollVote` hook in `src/domain/collaboration/poll/hooks/usePollVote.ts` — wraps the generated `useCastPollVoteMutation` hook. Accepts pollID and the current poll data (PollDetailsModel). Returns `{ castVote(selectedOptionIDs), loading, error }`. Uses `useTransition` for concurrent safety. Provides an Apollo `optimisticResponse` that spreads the current poll data and overrides `myVote.selectedOptions` with the new selection and increments/decrements option `voteCount`/`votePercentage` locally, following the pattern in `useCalloutManager.ts` and `useSubspaceCreation.ts`. The mutation returns the full updated Poll via `...PollDetails` fragment which reconciles the cache with the server response
- [x] T016 [US1] Create `PollView` component in `src/domain/collaboration/poll/PollView.tsx` — main poll display component. Props: poll data (PollDetailsModel), editable flag (boolean for option management access), canVote flag (boolean for CONTRIBUTE privilege). Manages two UI states: "voting" (selection mode with vote button) and "voted" (shows highlighted selections). Uses `usePollVote` hook for vote submission. When `myVote` is present, enters "voted" state showing selected options highlighted. Renders `PollVotingControls` in voting state. Renders `PollEmptyState` when no votes. Shows "Vote" button (disabled when selection count < minResponses). Shows results inline when `canSeeDetailedResults` is true (results component will be added in US2; for now, just show the vote confirmation)
- [x] T017 [US1] Create `CalloutFramingPoll` component in `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx` — framing display component following the same pattern as `CalloutFramingWhiteboard.tsx` and `CalloutFramingMemo.tsx`. Props: `callout: CalloutDetailsModel`. Returns null if `callout.framing.poll` is undefined. Determines `canVote` from `callout.authorization?.myPrivileges` (checks for CONTRIBUTE privilege). Renders `PollView` with the poll data and canVote flag. Note: PollView is read-only (no editable prop) — option management is done via the Edit Callout dialog
- [x] T018 [US1] Add POLL conditional rendering to `CalloutView` in `src/domain/collaboration/callout/CalloutView/CalloutView.tsx` — add `{callout.framing.type === CalloutFramingType.Poll && <CalloutFramingPoll callout={callout} />}` alongside the existing Whiteboard, Memo, Link, and MediaGallery conditionals

**Checkpoint**: At this point, users can view poll callouts, select options, and cast votes. The core voting interaction is functional. Results display is basic (vote confirmation only — full results UI comes in US2).

---

## Phase 4: User Story 2 — Viewing Poll Results (Priority: P2)

**Goal**: After voting (or immediately for VISIBLE polls), members see ranked results with visual indicators adapted to the poll's resultsDetail setting.

**Independent Test**: View a poll where you've voted (or with VISIBLE visibility) → verify results show progress bars, counts/percentages, and voter avatars according to the detail level.

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `PollVoterAvatars` component in `src/domain/collaboration/poll/PollVoterAvatars.tsx` — renders a MUI AvatarGroup of voters for a poll option. Props: `voters: UserModel[] | null`. Returns null when voters is null. Each avatar shows the user's profile image and displayName as tooltip. Limits visible avatars to 5 with overflow indicator (+N)
- [x] T020 [P] [US2] Create `PollOptionResultRow` component in `src/domain/collaboration/poll/PollOptionResultRow.tsx` — displays a single option's result. Props: option (PollOptionModel), resultsDetail (PollResultsDetail), isSelected (boolean, highlights the user's chosen options). Renders: option text, MUI LinearProgress bar (determinate, value from votePercentage, hidden when votePercentage is null), vote count text (hidden when voteCount is null), percentage text (hidden when votePercentage is null), `PollVoterAvatars` (hidden when voters is null). Uses `isSelected` to apply a visual highlight (e.g., primary color border or background tint)
- [x] T021 [US2] Create `PollResultsDisplay` component in `src/domain/collaboration/poll/PollResultsDisplay.tsx` — renders the full results panel. Props: options (PollOptionModel[]), resultsDetail (PollResultsDetail), totalVotes (number | null), selectedOptionIds (string[], from myVote). Shows total vote count header using `poll.results.totalVotes` i18n key. Maps each option to a `PollOptionResultRow`, passing `isSelected` based on whether the option ID is in selectedOptionIds. Options are rendered in the order received (server pre-sorts by vote count descending)
- [x] T022 [US2] Integrate `PollResultsDisplay` into `PollView` in `src/domain/collaboration/poll/PollView.tsx` — when `canSeeDetailedResults` is true, render `PollResultsDisplay` below the voting controls (or in place of them if user has voted and is not in change-vote mode). When `canSeeDetailedResults` is false but `totalVotes` is not null, show only the total vote count. When both are falsy, show `PollEmptyState` or nothing depending on poll state

**Checkpoint**: Results display is fully functional across all 6 visibility combinations (HIDDEN/TOTAL_ONLY/VISIBLE × voted/not-voted) and all 3 detail levels (PERCENTAGE/COUNT/FULL).

---

## Phase 4b: Unified Voting + Results View (Design Iteration)

**Goal**: Merge the separate voting controls and results display into a single unified component. Progress bars appear as labels for radio/checkbox controls. In voting mode controls are enabled; in results mode they are disabled with the user's vote pre-selected. Respects `canSeeDetailedResults` — hides progress bars and counts when admin has restricted results visibility.

- [x] T048 [US1+US2] Rework `PollVotingControls` in `src/domain/collaboration/poll/PollVotingControls.tsx` — add new props: `options` with full `PollOptionModel` (includes voteCount/votePercentage), `showResults` (boolean, whether to show progress bars), `resultsDetail` (PollResultsDetail), and an optional `readOnly` flag to disable controls for results-only mode. Render each option as a FormControlLabel where the label contains the option text AND (when showResults is true) a LinearProgress bar with count/percentage. Remove the blueish background highlight for selected options — selection indicated only by the radio/checkbox checked state.
- [x] T049 [US1+US2] Update `PollView` in `src/domain/collaboration/poll/PollView.tsx` — replace the separate `PollVotingControls` + `PollResultsDisplay` rendering with the unified `PollVotingControls` that receives showResults and readOnly props. Keep PollResultsDisplay import but don't render it (deprecated, will be removed later). Move "Change Vote" button below the unified controls.

**Checkpoint**: The poll always shows the same visual layout — radio/checkbox with progress bar labels. Toggling between voting and viewing is seamless.

---

## Phase 5: User Story 3 — Creating a Poll (Priority: P3)

**Goal**: Facilitators can create a poll via the existing create callout dialog by selecting "Poll" as the framing type, entering a title, adding options, and optionally configuring advanced settings.

**Independent Test**: Open create callout dialog → select Poll type → fill title, add 3 options → submit → verify poll appears in the space.

### Implementation for User Story 3

- [x] T023 [P] [US3] Create `PollFormSettingsSection` component in `src/domain/collaboration/poll/PollFormSettingsSection.tsx` — expandable section (MUI Accordion or Collapse) for optional poll settings. Uses Formik field names prefixed with the parent path. Fields: minResponses (number input, default 1, min 1), maxResponses (number input, default 1, min 0, with helper text for "0 = unlimited"), resultsVisibility (select/radio with 3 options: VISIBLE/HIDDEN/TOTAL_ONLY using i18n labels), resultsDetail (select/radio with 3 options: FULL/COUNT/PERCENTAGE using i18n labels). Validates: maxResponses >= minResponses when maxResponses > 0
- [x] T024 [P] [US3] Create `PollFormFields` component in `src/domain/collaboration/poll/PollFormFields.tsx` — poll creation form rendered inside CalloutFormFramingSettings when type is POLL. Uses Formik context. Fields: poll title (FormikInputField, required, max 512 chars), dynamic options list (array of FormikInputField, minimum 2, each required and max 512 chars, with "Add Option" button and remove buttons for each option beyond 2). Renders `PollFormSettingsSection` at the bottom. Manages the options array via Formik's FieldArray helper
- [x] T025 [US3] Add POLL type to the framing type radio button group in `src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx` — add a new entry to the radio buttons array with `{ icon: BallotOutlined, value: CalloutFramingType.Poll, label: t('callout.create.framingSettings.poll.title'), tooltip: t('callout.create.framingSettings.poll.tooltip'), disabled: calloutRestrictions?.disablePolls }`. Add a `case CalloutFramingType.Poll` to the `handleFramingTypeChange` switch that initializes: `poll: { title: '', options: ['', ''], settings: { minResponses: 1, maxResponses: 1, resultsVisibility: PollResultsVisibility.Visible, resultsDetail: PollResultsDetail.Full } }` and clears whiteboard, memo, link, mediaGallery to undefined. Conditionally render `<PollFormFields />` when `framing.type === CalloutFramingType.Poll`
- [x] T026 [US3] Update the callout creation hook in `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation.ts` — ensure poll form values are mapped to the `CreateCalloutFramingInput.poll` field (CreatePollInput) when framing.type is POLL. Map `PollFormValues.title` → `poll.title`, `PollFormValues.options` → `poll.options`, and `PollFormValues.settings` → `poll.settings` (PollSettingsInput)
- [x] T027 [US3] Update `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages.ts` — pass through the poll data without modification (polls have no preview images). Ensure the `separatePreviewImages` logic does not strip the poll field from the framing input
- [x] T028 [US3] Add Formik validation for poll fields — add to the existing Yup validation schema in the callout form: when framing.type is POLL, validate `framing.poll.title` is required and max 512 chars, `framing.poll.options` has minimum 2 entries each required and max 512 chars, and `framing.poll.settings.maxResponses >= framing.poll.settings.minResponses` when maxResponses > 0. This validation logic should be added where the existing framing validation exists (likely in `CalloutForm.tsx` or a validation schema file)

**Checkpoint**: Facilitators can create poll callouts end-to-end. Combined with US1 and US2, the full create → vote → view results flow is functional.

---

## Phase 6: User Story 4 — Changing a Vote (Priority: P4)

**Goal**: Members who have already voted can modify their selections and re-submit. The vote is replaced entirely.

**Independent Test**: Vote on a poll → click "Change Vote" → modify selections → re-submit → verify new selections are reflected.

### Implementation for User Story 4

- [x] T029 [US4] Add vote change mode to `PollView` in `src/domain/collaboration/poll/PollView.tsx` — add a `isChangingVote` local state (boolean, default false). When `myVote` is present and `isChangingVote` is false, show a "Change Vote" button (`poll.vote.changeButton`). Clicking it sets `isChangingVote` to true, which re-renders `PollVotingControls` with the current selections pre-filled and enables editing. Show a "Cancel" button (`poll.vote.cancelButton`) that resets `isChangingVote` to false. On vote submission, reset `isChangingVote` to false after the mutation completes. The `usePollVote` hook is reused — `castPollVote` handles both initial votes and vote updates server-side

**Checkpoint**: Vote changing is functional. The full vote lifecycle (cast → view results → change → re-view results) works end-to-end.

---

## Phase 7: User Story 5 — Managing Poll Options (Priority: P5)

**Goal**: Callout editors can add, edit, remove, and reorder poll options exclusively via the **Edit Callout dialog**. The inline poll view is read-only (voting + results only). All option management is consolidated in PollFormFields with reorder controls.

**Independent Test**: As a facilitator, open the Edit Callout dialog on a poll → add an option → edit an option's text → remove an option → reorder options via up/down arrows → save → verify all changes persist.

### Implementation for User Story 5

- [x] T030 [P] [US5] `usePollOptionManagement` hook remains in `src/domain/collaboration/poll/hooks/usePollOptionManagement.ts` — wraps the generated mutations: `useAddPollOptionMutation`, `useUpdatePollOptionMutation`, `useRemovePollOptionMutation`, `useReorderPollOptionsMutation`. Used by the Edit Callout dialog save handler for poll option changes
- [ ] T031 [US5] Replace up/down arrow reorder controls with @dnd-kit drag-and-drop in `PollFormFields` in `src/domain/collaboration/poll/PollFormFields.tsx` — each option row gets a drag handle (DragIndicatorIcon) for reordering, following the same pattern as `CalloutFramingMediaGalleryField.tsx` (DndContext, SortableContext, useSortable). Remove ArrowUpward/ArrowDownward icons and swap buttons
- [ ] T031b [US3+US5] Move `PollFormSettingsSection` from inline Accordion to a separate dialog — replace the expandable Accordion in PollFormFields with a Button that opens a Dialog containing the settings fields. Replace minResponses/maxResponses number inputs with a radio button group: "Single response" (min=1, max=1) and "Multiple responses" (min=1, max=0). Accept a `readOnly` prop that makes all fields display-only when true (used in Edit Callout dialog)
- [ ] T032 [US5] Map poll data correctly in `EditCalloutDialog` in `src/domain/collaboration/callout/CalloutDialogs/EditCalloutDialog.tsx` — when loading poll callout data for editing, transform the server poll data (with full PollOptionModel objects) into PollFormValues (with simple string[] options) so the Formik form can work correctly. Map `poll.options` sorted by `sortOrder` to `string[]` of option texts
- [ ] T033 [US5] Remove inline edit controls from `PollView` in `src/domain/collaboration/poll/PollView.tsx` — remove `isManaging` state, the "Edit Poll" button, and the `PollOptionManager` rendering. Remove the `editable` prop from PollView (it becomes purely a voting + results component). Update `CalloutFramingPoll` to no longer pass `editable`
- [ ] T033b [US5] Remove `PollOptionManager.tsx` and `PollOptionManagerRow.tsx` from `src/domain/collaboration/poll/` — these components are no longer needed since option management moved to the edit callout form

**Checkpoint**: Option management is fully functional via the Edit Callout dialog. The PollView is a clean, read-only voting + results component. Facilitators use the same Edit Callout dialog (settings menu → Edit) to manage poll options, consistent with how all other framing types are edited.

---

## Phase 8: User Story 6 — Poll Notification Preferences (Priority: P6)

**Goal**: Users can toggle 4 new poll-related notification preferences in their notification settings.

**Independent Test**: Navigate to User Settings > Notifications → verify 4 new poll preferences are visible → toggle them → reload → verify persistence.

### Implementation for User Story 6

- [x] T034 [P] [US6] Add 4 new poll notification fields to the space notification settings fragment in `src/domain/community/userAdmin/graphql/userSettingsFragment.graphql` — add `collaborationPollVoteCastOnOwnPoll { email inApp }`, `collaborationPollVoteCastOnPollIVotedOn { email inApp }`, `collaborationPollModifiedOnPollIVotedOn { email inApp }`, `collaborationPollVoteAffectedByOptionChange { email inApp }` inside the space notification settings block
- [x] T035 [P] [US6] Add 4 new poll notification fields to the update mutation input in `src/domain/community/userAdmin/graphql/updateUserSettings.graphql` — add the same 4 fields to the space notification settings input section of the mutation
- [x] T036 Run `pnpm codegen` to regenerate types after adding the new notification GraphQL fields
- [x] T037 [US6] Add 4 new poll notification channel types to `SpaceNotificationSettings` interface in `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` — add `collaborationPollVoteCastOnOwnPoll?: NotificationChannels`, `collaborationPollVoteCastOnPollIVotedOn?: NotificationChannels`, `collaborationPollModifiedOnPollIVotedOn?: NotificationChannels`, `collaborationPollVoteAffectedByOptionChange?: NotificationChannels`
- [x] T038 [US6] Add 4 new poll notification option entries to the options object in `src/domain/community/userAdmin/tabs/components/CombinedSpaceNotificationsSettings.tsx` — follow the existing pattern with `DualSwitchSettingsGroup`, using the 4 new i18n keys from T011 as labels, reading checked state from `currentSpaceSettings.collaborationPoll*`
- [x] T039 [US6] Add poll notification settings handling to the update handler in `src/domain/community/userAdmin/tabs/UserAdminNotificationsPage.tsx` — extend the `buildSpaceSettings` function (or equivalent) to include the 4 new poll notification fields, preserving other settings when updating one field

**Checkpoint**: All 4 poll notification preferences are visible, toggleable, and persist correctly.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, edge cases, and final validation across all user stories.

- [x] T040 [P] Verify WCAG 2.1 AA compliance for all poll controls — ensure radio buttons, checkboxes, vote/change-vote buttons, progress bars, and option management controls have proper ARIA labels, keyboard navigation (Tab, Enter, Space), focus indicators, and screen reader announcements. Check in `src/domain/collaboration/poll/PollVotingControls.tsx`, `PollResultsDisplay.tsx`, `PollOptionManager.tsx`
- [x] T041 [P] Add error handling for poll mutations — in `usePollVote.ts` and `usePollOptionManagement.ts`, handle GraphQL errors gracefully: display user-friendly error messages via snackbar/toast using the `poll.error.*` i18n keys from T011, handle stale option errors (option removed while voting) by prompting the user to refresh, handle network failures with retry affordance
- [x] T042 [P] Create unit tests for `usePollVote` hook in `src/domain/collaboration/poll/hooks/usePollVote.test.ts` — test cases: (1) castVote calls the mutation with correct pollID and selectedOptionIDs, (2) optimistic response correctly updates myVote and option vote counts, (3) loading state transitions (false → true → false), (4) error state is populated on mutation failure. Use Vitest with `vi.fn()` mocks for the generated mutation hook, following the patterns in existing test files like `useMessagesTree.test.ts`
- [x] T043 [P] Create unit tests for `usePollOptionManagement` hook in `src/domain/collaboration/poll/hooks/usePollOptionManagement.test.ts` — test cases: (1) addOption calls mutation with correct pollID and text, (2) updateOption calls mutation with correct optionID and text, (3) removeOption calls mutation with correct optionID, (4) reorderOptions calls mutation with full option ID list in new order, (5) loading state aggregates across all mutation loading states. Use Vitest with `vi.fn()` mocks for generated mutation hooks
- [x] T044 [P] Create unit tests for poll form validation in `src/domain/collaboration/poll/PollFormFields.test.tsx` — test cases: (1) form renders with minimum 2 option inputs, (2) "Add Option" button appends a new input, (3) remove button is hidden when only 2 options remain, (4) submit is blocked when option text is empty, (5) submit is blocked when fewer than 2 options exist, (6) up/down arrow buttons correctly reorder options via FieldArray swap
- [x] T045 Run `pnpm lint` to verify no linting errors across all new and modified files
- [x] T046 Run `pnpm vitest run` to ensure all tests pass (existing + new poll tests)
- [x] T047 Run quickstart.md end-to-end validation — manually walk through all 8 steps from `specs/018-community-polls/quickstart.md` to verify the full feature works as specified

**Note**: UI/integration tests (browser-level interactions, full voting flows, multi-user scenarios) will be added to the separate Alkemio test project, not in this repository.

---

## Phase 10: User Story 7 — Real-Time Poll Updates via Subscriptions (Priority: P7)

**Purpose**: Add real-time updates so users viewing a poll see live vote count changes and option modifications without refreshing.

**Prerequisites**: Phases 1–4b complete (poll display and voting functional). Server subscriptions (`pollVoteUpdated`, `pollOptionsChanged`) deployed.

**Independent Test**: Open the same poll in two browser tabs with different users → vote in one tab → verify the other tab updates in real time. As facilitator, add/remove/edit options → verify viewers see changes.

- [ ] T050 [P] [US7] Create GraphQL subscription document `src/domain/collaboration/poll/graphql/pollSubscriptions.graphql` — define two subscriptions:
  ```graphql
  subscription PollVoteUpdated($pollID: UUID!) {
    pollVoteUpdated(pollID: $pollID) {
      ...PollDetails
    }
  }
  subscription PollOptionsChanged($pollID: UUID!) {
    pollOptionsChanged(pollID: $pollID) {
      ...PollDetails
    }
  }
  ```
  Import the `PollDetails` fragment from `pollFragments.graphql`.
- [ ] T051 [US7] Run `pnpm codegen` to generate `usePollVoteUpdatedSubscription` and `usePollOptionsChangedSubscription` hooks (requires server with subscriptions running at localhost:4000/graphql)
- [ ] T052 [US7] Create `usePollSubscriptions` hook in `src/domain/collaboration/poll/hooks/usePollSubscriptions.ts` — wraps both generated subscription hooks. Accepts `pollID: string` and `skip: boolean`. Uses `onData` callback to write updated poll data to Apollo cache via `client.cache.writeFragment` using the `PollDetails` fragment. Returns `{ voteUpdateLoading, optionsChangeLoading }` for optional UI indicators. Both subscriptions use `skip` when `pollID` is falsy or component is not visible.
- [ ] T053 [US7] Integrate `usePollSubscriptions` into `CalloutFramingPoll` in `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx` — call `usePollSubscriptions({ pollID: callout.framing.poll?.id, skip: !callout.framing.poll })`. The hook activates when the component mounts and deactivates on unmount, providing automatic subscribe/unsubscribe lifecycle.
- [ ] T054 [US7] Handle vote revocation in `PollView` in `src/domain/collaboration/poll/PollView.tsx` — when `myVote` transitions from non-null to null (detected via effect or render), reset `isChangingVote` to false and clear local selection state, returning the user to voting mode.
- [ ] T055 [US7] Handle in-progress selection preservation in `PollView` — when a subscription update arrives while `isChangingVote` is true, keep the user's current selection state (selectedOptionIds) but update the available options list. If a selected option was removed, remove it from the local selection.
- [ ] T056 [P] [US7] Add i18n key for subscription-related states to `src/core/i18n/en/translation.en.json`:
  - `poll.subscription.voteRevoked` — "Your vote was affected by a poll change. Please vote again."
- [ ] T057 [US7] Run `pnpm lint` and `pnpm vitest run` to verify no regressions

**Checkpoint**: Real-time updates are functional. Users viewing a poll see live vote count changes and option modifications. Subscription lifecycle (subscribe on mount, unsubscribe on unmount) is properly managed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (requires server with polls feature)
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phase 3–8)**: All depend on Phase 2 completion
  - US1 (P1): No dependencies on other stories
  - US2 (P2): Depends on US1 (builds on PollView component)
  - US3 (P3): No dependencies on US1/US2 (separate creation flow)
  - US4 (P4): Depends on US1 (extends PollView with change-vote mode)
  - US5 (P5): Depends on US1 (extends PollView with management mode)
  - US6 (P6): No dependencies on other stories (separate notification settings area)
- **Subscriptions (Phase 10)**: Depends on Phase 4b (poll display + voting). Requires server subscriptions deployed
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
  ├── US1 (Viewing & Voting) ← MVP
  │   ├── US2 (Results Display) — extends PollView
  │   │   └── US7 (Subscriptions) — extends PollView + CalloutFramingPoll
  │   ├── US4 (Changing Vote) — extends PollView
  │   └── US5 (Option Management) — extends PollView
  ├── US3 (Creating a Poll) — independent (callout form)
  └── US6 (Notification Prefs) — independent (user settings)
```

### Within Each User Story

- Models/types before hooks
- Hooks before components that consume them
- Leaf components before parent components
- Integration (wiring into existing code) last

### Parallel Opportunities

- All foundational tasks T006–T012 marked [P] can run in parallel
- US1: T013, T014 can run in parallel (leaf components)
- US2: T019, T020 can run in parallel (leaf components)
- US3: T023, T024 can run in parallel (form sub-components)
- US5: T030, T031 can run in parallel (hook + form enhancement)
- US6: T034, T035 can run in parallel (GraphQL files)
- US3 and US6 can run in parallel with each other (and with US1) after Phase 2
- Polish tasks T040, T041 can run in parallel
- Unit test tasks T042, T043, T044 can run in parallel (different test files)

---

## Parallel Example: Phase 2 (Foundational)

```
# After T005 (codegen), launch all foundational tasks together:
T006: Create PollModels.ts (new file)
T007: Update CalloutDetailsModel.ts (different file)
T008: Update CalloutFormModel.ts (different file)
T009: Update calloutIcons.ts (different file)
T010: Update CalloutRestrictionsTypes.ts (different file)
T011: Update translation.en.json (different file)
T012: Update mappings.ts (different file)
```

## Parallel Example: User Story 1

```
# Launch leaf components together:
T013: Create PollEmptyState.tsx (new file)
T014: Create PollVotingControls.tsx (new file)

# Then sequentially:
T015: Create usePollVote.ts (depends on fragments from Phase 2)
T016: Create PollView.tsx (depends on T013, T014, T015)
T017: Create CalloutFramingPoll.tsx (depends on T016)
T018: Wire into CalloutView.tsx (depends on T017)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (codegen)
2. Complete Phase 2: Foundational (types, fragments, icons, i18n)
3. Complete Phase 3: US1 — Viewing & Voting
4. Complete Phase 4: US2 — Results Display
5. **STOP and VALIDATE**: Polls can be viewed, voted on, and results are displayed correctly
6. Deploy/demo if ready — polls can be created via API for initial testing

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Test voting independently → MVP (with API-created polls)
3. US2 → Test results display → Enhanced MVP
4. US3 → Test poll creation → Full creation-to-vote flow
5. US4 → Test vote changing → Complete voting lifecycle
6. US5 → Test option management → Full admin capabilities
7. US6 → Test notification preferences → Complete feature
8. Polish → Accessibility audit, error handling, validation

### Parallel Team Strategy

With multiple developers after Phase 2:

- **Developer A**: US1 → US2 → US4 (voting flow chain)
- **Developer B**: US3 (creation flow, independent)
- **Developer C**: US6 → US5 (settings + management)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- T001 and T005 require the server polls feature running at localhost:4000/graphql — if server is not ready, start from T002 and mock the generated types
- All mutations return the full updated Poll object via `...PollDetails` fragment — this ensures the Apollo cache is automatically updated without manual cache manipulation
