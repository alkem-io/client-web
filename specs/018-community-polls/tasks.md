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

- [x] T001 Run `pnpm codegen` to generate updated GraphQL types including Poll, PollOption, PollVote, PollSettings, PollStatus, PollResultsVisibility, PollResultsDetail, and the extended CalloutFramingType enum with POLL value (requires server with polls feature running at localhost:3000/graphql)
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
  - `poll.status.submitting` — "Submitting your vote…"
  - `poll.status.voted` — "Voted"
  - `poll.status.removeMyVote` — "remove my vote"
  - `poll.status.closed` — "Poll closed"
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
  - Note: The following keys were part of the original radio/dropdown settings form but were removed when T058 simplified the form to checkboxes. They are listed here for historical reference only:
    ~~`poll.create.resultsVisibility`, `poll.create.resultsVisibility.VISIBLE/HIDDEN/TOTAL_ONLY`, `poll.create.resultsDetail`, `poll.create.resultsDetail.FULL/COUNT/PERCENTAGE`~~
    Replaced by checkbox-based keys added in T058: `poll.create.votingOptions`, `poll.create.displayOptions`, `poll.create.allowMultipleResponses`, `poll.create.onlyShowResultsAfterVoted`, `poll.create.showVoterAvatars`, etc.
  - `poll.manage.editPoll` — "Edit Poll"

**Constraints / Validation Rules** (cross-cutting, used by Phases 5 and 12):
- `MAX_POLL_OPTIONS = 10` — hard cap on the number of poll options (defined in `PollFormFields.tsx`, enforced in the creation validation schema and in `PollView` for contributor-added options). Rationale: keeps the UI scannable, aligns with the server-side limit, and avoids performance degradation in result rendering.
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

**Goal**: Space members can see a poll callout, view its options, and vote by clicking directly. Single-choice votes emit immediately on radio click; multi-choice votes emit after a 2-second debounce. After voting, selected options are highlighted, the status bar shows "Voted", and results appear according to visibility settings.

**Independent Test**: Navigate to a space with a poll callout → click a radio option (single-choice) or check options and wait 2s (multi-choice) → verify vote is emitted, status bar shows "Voted", and results update.

### Implementation for User Story 1

- [x] T013 [P] [US1] Render "No votes yet" empty state inline in `PollView` — displays `poll.results.noVotes` i18n key via `<Caption>` when `totalVotes` is 0 and no results are shown. No separate `PollEmptyState` component was created; the empty state is a few lines directly in PollView
- [x] T014 [P] [US1] Create `PollVotingControls` component in `src/domain/collaboration/poll/PollVotingControls.tsx` — renders MUI RadioGroup when `settings.maxResponses === 1` (single-choice) or MUI Checkbox group otherwise (multi-choice). Props: options list, selected option IDs, maxResponses, minResponses, isClosed flag, onChange callback. Controls are always enabled unless `isClosed` is true. Enforces maxResponses limit by disabling unselected checkboxes when limit is reached. Shows `poll.vote.minRequired` helper text when fewer than minResponses are selected
- [x] T015 [US1] Create `usePollVote` hook in `src/domain/collaboration/poll/hooks/usePollVote.ts` — wraps the generated `useCastPollVoteMutation` and `useRemovePollVoteMutation` hooks. Accepts pollID and the current poll data (PollDetailsModel). Returns `{ castVote(selectedOptionIDs), removeVote(), loading, error }`. `castVote` is called immediately by PollView for single-choice (on radio change) and after 2s debounce for multi-choice. `removeVote` is called when the user clicks "remove my vote" in the status bar. Uses `useTransition` for concurrent safety. Provides an Apollo `optimisticResponse` that spreads the current poll data and overrides `myVote.selectedOptions` with the new selection and increments/decrements option `voteCount`/`votePercentage` locally, following the pattern in `useCalloutManager.ts` and `useSubspaceCreation.ts`. The mutation returns the full updated Poll via `...PollDetails` fragment which reconciles the cache with the server response
- [x] T016 [US1] Create `PollView` component in `src/domain/collaboration/poll/PollView.tsx` — main poll display component. Props: poll data (PollDetailsModel), canVote flag (boolean for CONTRIBUTE privilege). No buttons — voting is immediate. For single-choice: radio click triggers `castPollVote` immediately. For multi-choice: checkbox toggle starts a 2-second debounce timer; vote is auto-emitted when timer expires (suppressed if below minResponses). Uses `usePollVote` hook for mutation. Status bar (`<Caption>`) below controls shows: spinner + "Submitting your vote…" during mutation, "Voted" + "remove my vote" link after voting, "Poll closed" when CLOSED. Controls always enabled unless poll is CLOSED. When `myVote` is present, selected options are pre-checked. Shows "No votes yet" empty state inline when totalVotes is 0. Shows results inline when `canSeeDetailedResults` is true
- [x] T017 [US1] Create `CalloutFramingPoll` component in `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx` — framing display component following the same pattern as `CalloutFramingWhiteboard.tsx` and `CalloutFramingMemo.tsx`. Props: `callout: CalloutDetailsModel`. Returns null if `callout.framing.poll` is undefined. Determines `canVote` from `callout.authorization?.myPrivileges` (checks for CONTRIBUTE privilege). Renders `PollView` with the poll data and canVote flag. Note: PollView is read-only (no editable prop) — option management is done via the Edit Callout dialog
- [x] T018 [US1] Add POLL conditional rendering to `CalloutView` in `src/domain/collaboration/callout/CalloutView/CalloutView.tsx` — add `{callout.framing.type === CalloutFramingType.Poll && <CalloutFramingPoll callout={callout} />}` alongside the existing Whiteboard, Memo, Link, and MediaGallery conditionals

**Checkpoint**: At this point, users can view poll callouts and vote by clicking directly (immediate for single-choice, debounced for multi-choice). Status bar shows voting state. The core voting interaction is functional. Results display is basic (vote confirmation only — full results UI comes in US2).

---

## Phase 4: User Story 2 — Viewing Poll Results (Priority: P2)

**Goal**: After voting (or immediately for VISIBLE polls), members see ranked results with visual indicators adapted to the poll's resultsDetail setting.

**Independent Test**: View a poll where you've voted (or with VISIBLE visibility) → verify results show progress bars, counts/percentages, and voter avatars according to the detail level.

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `PollVoterAvatars` component in `src/domain/collaboration/poll/PollVoterAvatars.tsx` — renders a MUI AvatarGroup of voters for a poll option. Props: `voters: UserModel[] | null`. Returns null when voters is null. Each avatar shows the user's profile image and displayName as tooltip. Limits visible avatars to 5 with overflow indicator (+N)
- [x] T020 [P] [US2] Create `PollOptionResultRow` component in `src/domain/collaboration/poll/PollOptionResultRow.tsx` — displays a single option's result. Props: option (PollOptionModel), resultsDetail (PollResultsDetail), isSelected (boolean, highlights the user's chosen options). Renders: option text, background-fill progress bar (Box with width = percentage%, hidden when votePercentage is null), vote count text (hidden when voteCount is null), percentage text (hidden when votePercentage is null), `PollVoterAvatars` (hidden when voters is null). Uses `isSelected` to apply a visual highlight (primary color border/opacity). Note: This component is now orphaned — superseded by the inline `OptionLabel` in the unified `PollVotingControls`; to be removed
- [x] T021 [US2] Create `PollResultsDisplay` component in `src/domain/collaboration/poll/PollResultsDisplay.tsx` — renders the full results panel. Props: options (PollOptionModel[]), resultsDetail (PollResultsDetail), totalVotes (number | null), selectedOptionIds (string[], from myVote). Shows total vote count header using `poll.results.totalVotes` i18n key. Maps each option to a `PollOptionResultRow`, passing `isSelected` based on whether the option ID is in selectedOptionIds. Options are rendered in the order received (server returns sortOrder ASC)
- [x] T022 [US2] Integrate results into `PollView` in `src/domain/collaboration/poll/PollView.tsx` — when `canSeeDetailedResults` is true, pass `showResults=true` to the unified `PollVotingControls` so progress bars and counts render inline. When `canSeeDetailedResults` is false but `totalVotes` is not null, show only the total vote count. When both are falsy, show "No votes yet" inline

**Checkpoint**: Results display is fully functional across all 6 visibility combinations (HIDDEN/TOTAL_ONLY/VISIBLE × voted/not-voted) and all 3 detail levels (PERCENTAGE/COUNT/FULL).

---

## Phase 4b: Unified Voting + Results View (Design Iteration)

**Goal**: Merge the separate voting controls and results display into a single unified component. Progress bars appear as labels for radio/checkbox controls. Controls are always enabled unless the poll is CLOSED — there is no separate "results mode". Respects `canSeeDetailedResults` — hides progress bars and counts when admin has restricted results visibility.

- [x] T048 [US1+US2] Rework `PollVotingControls` in `src/domain/collaboration/poll/PollVotingControls.tsx` — add new props: `options` with full `PollOptionModel` (includes voteCount/votePercentage), `showResults` (boolean, whether to show progress bars), `resultsDetail` (PollResultsDetail), and `isClosed` (boolean, disables controls when poll is CLOSED). Controls are always enabled unless `isClosed` is true — no `readOnly` or `disabled` prop. Render each option as a FormControlLabel where the label contains the option text AND (when showResults is true) a background-fill progress bar (Box with width = percentage%) with count/percentage. Selection indicated only by the radio/checkbox checked state.
- [x] T049 [US1+US2] Update `PollView` in `src/domain/collaboration/poll/PollView.tsx` — replace the separate `PollVotingControls` + `PollResultsDisplay` rendering with the unified `PollVotingControls` that receives showResults and isClosed props. PollResultsDisplay has been removed. No buttons — voting is immediate (single-choice) or debounced (multi-choice). Status bar shows contextual state. Empty state ("No votes yet") rendered inline.

**Checkpoint**: The poll always shows the same visual layout — radio/checkbox with progress bar labels. Controls are always active (unless CLOSED). Voting is immediate or debounced with a status bar.

---

## Phase 5: User Story 3 — Creating a Poll (Priority: P3)

**Goal**: Facilitators can create a poll via the existing create callout dialog by selecting "Poll" as the framing type, entering a title, adding options, and optionally configuring advanced settings.

**Independent Test**: Open create callout dialog → select Poll type → fill title, add 3 options → submit → verify poll appears in the space.

### Implementation for User Story 3

- [x] T023 [P] [US3] Create `PollFormSettingsSection` component in `src/domain/collaboration/poll/PollFormSettingsSection.tsx` — settings button that opens a dialog with checkbox-based poll settings. Uses Formik field names prefixed with the parent path. Note: Original design used radio/dropdown controls; superseded by T058 which simplified to checkboxes (see Phase 11)
- [x] T024 [P] [US3] Create `PollFormFields` component in `src/domain/collaboration/poll/PollFormFields.tsx` — poll creation form rendered inside CalloutFormFramingSettings when type is POLL. Uses Formik context. Fields: poll title (FormikInputField, optional, max 512 chars), dynamic options list (array of FormikInputField, minimum 2, each required and max 512 chars, with "Add Option" button and remove buttons for each option beyond 2). Renders `PollFormSettingsSection` at the bottom. Manages the options array via Formik's FieldArray helper
- [x] T025 [US3] Add POLL type to the framing type radio button group in `src/domain/collaboration/callout/CalloutForm/CalloutFormFramingSettings.tsx` — add a new entry to the radio buttons array with `{ icon: BallotOutlined, value: CalloutFramingType.Poll, label: t('callout.create.framingSettings.poll.title'), tooltip: t('callout.create.framingSettings.poll.tooltip'), disabled: calloutRestrictions?.disablePolls }`. Add a `case CalloutFramingType.Poll` to the `handleFramingTypeChange` switch that initializes: `poll: { title: '', options: [{ text: '' }, { text: '' }], settings: { minResponses: 1, maxResponses: 1, resultsVisibility: PollResultsVisibility.Visible, resultsDetail: PollResultsDetail.Full } }` and clears whiteboard, memo, link, mediaGallery to undefined. Conditionally render `<PollFormFields />` when `framing.type === CalloutFramingType.Poll`
- [x] T026 [US3] Update the callout creation hook in `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreation.ts` — ensure poll form values are mapped to the `CreateCalloutFramingInput.poll` field (CreatePollInput) when framing.type is POLL. Map `PollFormValues.title` → `poll.title`, `PollFormValues.options` → `poll.options`, and `PollFormValues.settings` → `poll.settings` (PollSettingsInput)
- [x] T027 [US3] Update `src/domain/collaboration/calloutsSet/useCalloutCreation/useCalloutCreationWithPreviewImages.ts` — pass through the poll data without modification (polls have no preview images). Ensure the `separatePreviewImages` logic does not strip the poll field from the framing input
- [x] T028 [US3] Add Formik validation for poll fields — add to the existing Yup validation schema in the callout form: when framing.type is POLL, validate `framing.poll.title` is optional and max 512 chars, `framing.poll.options` has minimum 2 entries each required and max 512 chars, and `framing.poll.settings.maxResponses >= framing.poll.settings.minResponses` when maxResponses > 0. This validation logic should be added where the existing framing validation exists (likely in `CalloutForm.tsx` or a validation schema file)

**Checkpoint**: Facilitators can create poll callouts end-to-end. Combined with US1 and US2, the full create → vote → view results flow is functional.

---

## Phase 6: User Story 4 — Changing a Vote (Priority: P4)

**Goal**: Members who have already voted can change their vote at any time by simply clicking a different option. There is no separate "Change Vote" mode — controls are always interactive. The vote is replaced entirely.

**Independent Test**: Vote on a poll → click a different radio (single-choice) or toggle checkboxes and wait 2s (multi-choice) → verify the new selection replaces the old one.

### Implementation for User Story 4

- [x] T029 [US4] Vote changing is handled by the same immediate/debounced voting mechanism in `PollView` — no additional `isChangingVote` state or buttons needed. When `myVote` is present, the user's current selections are pre-checked. Clicking a different radio (single-choice) emits the new vote immediately. Toggling checkboxes (multi-choice) triggers the same 2-second debounce. The `usePollVote` hook is reused — `castPollVote` handles both initial votes and vote updates server-side (upsert). The status bar shows "Voted" with "remove my vote" link after the mutation completes.

**Checkpoint**: Vote changing is functional via direct interaction. The full vote lifecycle (cast → view results → change directly → re-view results) works end-to-end.

---

## Phase 7: User Story 5 — Managing Poll Options (Priority: P5)

**Goal**: Callout editors can add, edit, remove, and reorder poll options exclusively via the **Edit Callout dialog**. The inline poll view is read-only (voting + results only). All option management is consolidated in PollFormFields with reorder controls.

**Independent Test**: As a facilitator, open the Edit Callout dialog on a poll → add an option → edit an option's text → remove an option → reorder options via drag-and-drop → save → verify all changes persist.

### Implementation for User Story 5

- [x] T030 [P] [US5] `usePollOptionManagement` hook remains in `src/domain/collaboration/poll/hooks/usePollOptionManagement.ts` — wraps the generated mutations: `useAddPollOptionMutation`, `useUpdatePollOptionMutation`, `useRemovePollOptionMutation`, `useReorderPollOptionsMutation`. Used by the Edit Callout dialog save handler for poll option changes
- [x] T031 [US5] Replace up/down arrow reorder controls with @dnd-kit drag-and-drop in `PollFormFields` in `src/domain/collaboration/poll/PollFormFields.tsx` — each option row gets a drag handle (DragIndicatorIcon) for reordering, following the same pattern as `CalloutFramingMediaGalleryField.tsx` (DndContext, SortableContext, useSortable). Remove ArrowUpward/ArrowDownward icons and swap buttons
- [x] T031b [US3+US5] Move `PollFormSettingsSection` from inline Accordion to a separate dialog — replaced by T058 (Poll Settings Form Simplification). The settings button/dialog pattern and readOnly prop are retained; the controls were simplified from radio buttons to checkboxes in T058
- [x] T032 [US5] Map poll data correctly in `EditCalloutDialog` in `src/domain/collaboration/callout/CalloutDialogs/EditCalloutDialog.tsx` — when loading poll callout data for editing, transform the server poll data (with full PollOptionModel objects) into PollFormValues (with PollFormOptionValue[] `{ id, text }` options) so the Formik form can work correctly. Map `poll.options` sorted by `sortOrder` to `{ id, text }[]` preserving option IDs for change detection on save
- [x] T033 [US5] Remove inline edit controls from `PollView` in `src/domain/collaboration/poll/PollView.tsx` — remove `isManaging` state, the "Edit Poll" button, and the `PollOptionManager` rendering. Remove the `editable` prop from PollView (it becomes purely a voting + results component). Update `CalloutFramingPoll` to no longer pass `editable`
- [x] T033b [US5] Remove orphaned files from `src/domain/collaboration/poll/`: `PollOptionManager.tsx`, `PollOptionManagerRow.tsx` (option management moved to Edit Callout form), and `PollOptionResultRow.tsx` (superseded by inline `OptionLabel` in `PollVotingControls`)

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

- [x] T040 [P] Verify WCAG 2.1 AA compliance for all poll controls — ensure radio buttons, checkboxes, status bar (spinner live region, link semantics), progress bars, and option management controls have proper ARIA labels, keyboard navigation (Tab, Enter, Space), focus indicators, and screen reader announcements. Check in `src/domain/collaboration/poll/PollVotingControls.tsx`, `PollView.tsx`, `PollVoterAvatars.tsx`
- [x] T041 [P] Add error handling for poll mutations — in `usePollVote.ts` and `usePollOptionManagement.ts`, handle GraphQL errors gracefully: display user-friendly error messages via snackbar/toast using the `poll.error.*` i18n keys from T011, handle stale option errors (option removed while voting) by prompting the user to refresh, handle network failures with retry affordance
- [x] T042 [P] Create unit tests for `usePollVote` hook in `src/domain/collaboration/poll/hooks/usePollVote.test.ts` — test cases: (1) castVote calls the mutation with correct pollID and selectedOptionIDs, (2) optimistic response correctly updates myVote and option vote counts, (3) loading state transitions (false → true → false), (4) error state is populated on mutation failure, (5) single-choice: castVote is called immediately on radio change, (6) multi-choice debounce: castVote is NOT called until 2s elapse after last checkbox change (use `vi.useFakeTimers()`), (7) debounce reset: subsequent checkbox toggle resets the 2s timer, (8) debounce suppression: vote is NOT emitted if selection count is below minResponses when timer fires. Use Vitest with `vi.fn()` mocks for the generated mutation hook, following the patterns in existing test files like `useMessagesTree.test.ts`
- [x] T043 [P] Create unit tests for `usePollOptionManagement` hook in `src/domain/collaboration/poll/hooks/usePollOptionManagement.test.ts` — test cases: (1) addOption calls mutation with correct pollID and text, (2) updateOption calls mutation with correct optionID and text, (3) removeOption calls mutation with correct optionID, (4) reorderOptions calls mutation with full option ID list in new order, (5) loading state aggregates across all mutation loading states. Use Vitest with `vi.fn()` mocks for generated mutation hooks
- [x] T044 [P] Create unit tests for poll form validation in `src/domain/collaboration/poll/PollFormFields.test.tsx` — test cases: (1) form renders with minimum 2 option inputs, (2) "Add Option" button appends a new input, (3) remove button is hidden when only 2 options remain, (4) submit is blocked when option text is empty, (5) submit is blocked when fewer than 2 options exist, (6) drag-and-drop correctly reorders options via @dnd-kit SortableContext
- [x] T045 Run `pnpm lint` to verify no linting errors across all new and modified files
- [x] T046 Run `pnpm vitest run` to ensure all tests pass (existing + new poll tests)
- [x] T047 Run quickstart.md end-to-end validation — manually walk through all 8 steps from `specs/018-community-polls/quickstart.md` to verify the full feature works as specified

**Note**: UI/integration tests (browser-level interactions, full voting flows, multi-user scenarios) will be added to the separate Alkemio test project, not in this repository.

---

## Phase 10: User Story 7 — Real-Time Poll Updates via Subscriptions (Priority: P7)

**Purpose**: Add real-time updates so users viewing a poll see live vote count changes and option modifications without refreshing.

**Prerequisites**: Phases 1–4b complete (poll display and voting functional). Server subscriptions (`pollVoteUpdated`, `pollOptionsChanged`) deployed.

**Independent Test**: Open the same poll in two browser tabs with different users → vote in one tab → verify the other tab updates in real time. As facilitator, add/remove/edit options → verify viewers see changes.

- [x] T050 [P] [US7] Create GraphQL subscription document `src/domain/collaboration/poll/graphql/pollSubscriptions.graphql` — define two subscriptions using the server's wrapper return types:
  ```graphql
  subscription PollVoteUpdated($pollID: UUID!) {
    pollVoteUpdated(pollID: $pollID) {
      pollEventType
      poll {
        ...PollDetails
      }
    }
  }
  subscription PollOptionsChanged($pollID: UUID!) {
    pollOptionsChanged(pollID: $pollID) {
      pollEventType
      poll {
        ...PollDetails
      }
    }
  }
  ```
  Import the `PollDetails` fragment from `pollFragments.graphql`. The subscriptions return `PollVoteUpdatedSubscriptionResult` and `PollOptionsChangedSubscriptionResult` wrapper types containing `pollEventType` and `poll`.
- [x] T051 [US7] Run `pnpm codegen` to generate `usePollVoteUpdatedSubscription` and `usePollOptionsChangedSubscription` hooks (requires server with subscriptions running at localhost:3000/graphql)
- [x] T052 [US7] Create `usePollSubscriptions` hook in `src/domain/collaboration/poll/hooks/usePollSubscriptions.ts` — wraps both generated subscription hooks. Accepts `pollID: string` and `skip: boolean`. Uses `onData` callback to extract the `poll` field from the wrapper result type (`subscriptionData.data?.pollVoteUpdated.poll` / `subscriptionData.data?.pollOptionsChanged.poll`) and write it to Apollo cache via `client.cache.writeFragment` using the `PollDetails` fragment. Both subscriptions use `skip` when `pollID` is falsy or component is not visible.
- [x] T053 [US7] Integrate `usePollSubscriptions` into `CalloutFramingPoll` in `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx` — call `usePollSubscriptions({ pollID: callout.framing.poll?.id, skip: !callout.framing.poll })`. The hook activates when the component mounts and deactivates on unmount, providing automatic subscribe/unsubscribe lifecycle.
- [x] T054 [US7] Handle vote revocation in `PollView` in `src/domain/collaboration/poll/PollView.tsx` — when `myVote` transitions from non-null to null (detected via effect or ref comparison), clear local selection state and cancel any active debounce timer, returning the user to voting mode. Show the `poll.subscription.voteRevoked` message in the status bar.
- [x] T055 [US7] Handle in-progress selection preservation in `PollView` — when a subscription update arrives while the user has a pending multi-choice debounce timer, keep the user's current local selection state (selectedOptionIds) and preserve the debounce countdown, but update the available options list. If a selected option was removed by the subscription update, remove it from the local selection.
- [x] T056 [P] [US7] Add i18n key for subscription-related states to `src/core/i18n/en/translation.en.json`:
  - `poll.subscription.voteRevoked` — "Your vote was affected by a poll change. Please vote again."
- [x] T057 [US7] Run `pnpm lint` and `pnpm vitest run` to verify no regressions

**Checkpoint**: Real-time updates are functional. Users viewing a poll see live vote count changes and option modifications. Subscription lifecycle (subscribe on mount, unsubscribe on unmount) is properly managed.

---

## Phase 11: Poll Settings Form Simplification

**Purpose**: Keep advanced settings in a separate dialog, but simplify the controls to checkbox-based options. Reduce cognitive load for poll creators by mapping complex settings to intuitive binary choices while preserving full server-side capability for existing data.

**Context**: The original form exposed radio buttons for response type and dropdowns for `resultsVisibility` (VISIBLE/HIDDEN/TOTAL_ONLY) and `resultsDetail` (FULL/COUNT/PERCENTAGE). The simplified form maps settings to two checkbox sections. TOTAL_ONLY and COUNT are intentionally removed from the creation UI — the server retains full support and the client still renders them correctly for any existing polls that have those values.

- [x] T058 [US3+US5] Simplify `PollFormSettingsSection` in `src/domain/collaboration/poll/PollFormSettingsSection.tsx` — keep the settings button/dialog pattern and render simplified checkbox sections inside the dialog. **Voting options** section: (1) "Allow multiple responses per user" checkbox — unchecked sets min=1/max=1 (single choice), checked sets min=1/max=0 (unlimited multi-choice); a gear icon button (always visible, disabled in readOnly mode) toggles a Collapse revealing min/max numeric fields with +/- stepper buttons and an infinity button for unlimited max; (2) "Allow users to add new options" checkbox — always disabled, reserved for future server support. **Display options** section: (3) "Only show results after a user has voted" checkbox — checked maps to `resultsVisibility = HIDDEN`, unchecked maps to `VISIBLE`; (4) "Show avatars of voters in the results" checkbox — checked maps to `resultsDetail = FULL`, unchecked maps to `PERCENTAGE`. All checkboxes are disabled in `readOnly` mode (edit callout). The dialog Close button is disabled when validation errors exist; attempting to close shows a confirmation dialog. Additional changes: extracted callout validation schema from `CalloutForm.tsx` to `CalloutForm.validation.schema.ts` with new cross-field tests (minResponses ≤ options count, maxResponses ≤ options count, minResponses ≤ maxResponses). Created reusable `FormikFormattedInputField` component in `src/core/ui/forms/FormikInputField/` for the max responses field (displays "Any" when 0, numeric value when focused). Updated i18n keys: added `poll.create.votingOptions`, `poll.create.displayOptions`, `poll.create.allowMultipleResponses`, `poll.create.allowMultipleResponsesSettingsTooltip`, `poll.create.infiniteResponses`, `poll.create.infiniteResponsesTooltip`, `poll.create.onlyShowResultsAfterVoted`, `poll.create.showVoterAvatars`, `poll.create.fixErrorsBeforeClosingTooltip`, `poll.create.closeConfirm.*`, `poll.create.settingsDialogTitle`, and 3 cross-field validation error keys. Removed obsolete i18n keys: `poll.create.responseType`, `poll.create.singleResponse`, `poll.create.multipleResponses`, `poll.create.customResponses`, `poll.create.resultsVisibility.*`, `poll.create.resultsDetail.*`.

---

## Phase 12: User Story 8 — Contributor-Added Poll Options (Priority: P8)

**Purpose**: Allow contributors to add their own custom options to a poll and vote on them inline, when the poll setting `allowContributorsAddOptions` is enabled.

**Prerequisites**: Phases 1–4b complete (poll display, voting, results). US5 (option management hooks).

**Independent Test**: Enable `allowContributorsAddOptions` on a poll → as a contributor, click "Add a custom response..." → type option text → submit → verify option is added and vote is cast.

- [x] T059 [P] [US8] Add i18n keys to `src/core/i18n/en/translation.en.json`:
  - `poll.status.addingOption` — "Adding option…"
  - `poll.customOption.placeholder` — "Add a custom response…"
- [x] T060 [US8] Update `PollVotingControls` in `src/domain/collaboration/poll/PollVotingControls.tsx` — add a trailing "Add a custom response…" row (radio for single-choice, checkbox for multi-choice). Props added: `showAddCustomOption: boolean`, `onSubmitCustomOption: (text: string) => void`, `isAddingCustomOption: boolean` (loading state). When the control is clicked, the label transforms into a `TextField` with `InputAdornment` containing a checkmark `IconButton`. Enter triggers submit, Escape deselects and hides text field. Row hidden when `showAddCustomOption` is false.
- [x] T061 [US8] Update `PollView` in `src/domain/collaboration/poll/PollView.tsx` — wire `usePollOptionManagement` for `addOption`. Compute `showAddCustomOption` from `allowContributorsAddOptions && canVote && !isClosed && options.length < MAX_POLL_OPTIONS` (see Phase 2 Constraints). On custom option submit: call `addOption(text)` → extract new option ID from mutation result → call `castVote` immediately (single-choice: [newOptionId], multi-choice: [...selectedOptionIds, newOptionId]). Status bar shows "Adding option…" then "Submitting your vote…".
- [x] T062 [US8] Update `CalloutFramingPoll` in `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx` — pass `allowContributorsAddOptions` from poll settings down to `PollView` (already available via `poll.settings.allowContributorsAddOptions`).
- [x] T063 [US8] Update spec and data-model: add US-8 to spec.md, add 10-option max to validation rules, remove "disabled/reserved" language from FR-016.
- [x] T064 [US8] Run `pnpm lint` and `pnpm vitest run` to verify no regressions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (requires server with polls feature)
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phase 3–8)**: All depend on Phase 2 completion
  - US1 (P1): No dependencies on other stories
  - US2 (P2): Depends on US1 (builds on PollView component)
  - US3 (P3): No dependencies on US1/US2 (separate creation flow)
  - US4 (P4): Depends on US1 (uses same immediate/debounced voting mechanism in PollView)
  - US5 (P5): Depends on US1 (Edit Callout dialog uses PollFormFields which shares the poll domain)
  - US6 (P6): No dependencies on other stories (separate notification settings area)
- **Subscriptions (Phase 10)**: Depends on Phase 4b (poll display + voting). Requires server subscriptions deployed
- **Contributor Options (Phase 12)**: Depends on Phase 4b (poll display + voting) and US5 (option management hooks)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 2 (Foundational)
  ├── US1 (Viewing & Voting) ← MVP
  │   ├── US2 (Results Display) — extends PollView
  │   │   └── US7 (Subscriptions) — extends PollView + CalloutFramingPoll
  │   ├── US4 (Changing Vote) — extends PollView
  │   └── US5 (Option Management) — extends PollView
  │       └── US8 (Contributor-Added Options) — extends PollView + PollVotingControls
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
- T001 and T005 require the server polls feature running at localhost:3000/graphql — if server is not ready, start from T002 and mock the generated types
- All mutations return the full updated Poll object via `...PollDetails` fragment — this ensures the Apollo cache is automatically updated without manual cache manipulation
