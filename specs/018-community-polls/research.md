# Research: Community Polls & Voting — Client UI

**Branch**: `018-community-polls` | **Date**: 2026-03-03

## Research Summary

All NEEDS CLARIFICATION items from the technical context have been resolved through codebase exploration. No external research was required — the existing callout framing pattern provides a well-established blueprint for integrating the POLL type.

---

## Decision 1: Poll Domain Code Location

**Decision**: Create `src/domain/collaboration/poll/` as a peer directory to `whiteboard/`, `memo/`, and `post/`.

**Rationale**: Every existing framing type follows this pattern — a domain directory at `src/domain/collaboration/<type>/` containing models, hooks, components, and GraphQL documents. The framing display component itself lives in `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx`, consistent with `CalloutFramingWhiteboard.tsx`, `CalloutFramingMemo.tsx`, etc.

**Alternatives considered**:

- Placing all poll code inside `callout/` — rejected because it violates the existing domain separation pattern and would bloat the callout directory.
- Creating `src/domain/poll/` at the top level — rejected because polls are part of the collaboration domain, not a standalone domain context.

---

## Decision 2: Single vs Multi-Select UI Controls

**Decision**: Use MUI RadioGroup for single-choice polls (maxResponses = 1) and MUI Checkbox group for multi-choice polls (maxResponses != 1). The `maxResponses` setting from PollSettings determines which control renders.

**Rationale**: Radio buttons enforce mutual exclusivity natively, which exactly matches single-choice behavior. Checkboxes allow independent selection, which matches multi-choice. The maxResponses constraint (enforced in the UI by disabling additional selections when the limit is reached) maps cleanly to this split.

**Alternatives considered**:

- Custom toggle/chip UI — rejected because radio/checkbox are universally understood patterns that meet WCAG 2.1 AA requirements with minimal effort.
- Always using checkboxes with limit enforcement — rejected because radio buttons provide clearer affordance for single-choice polls.

---

## Decision 3: Results Visualization Approach

**Decision**: Use the option container itself as the progress indicator — the vote percentage fills the background of the entire option row as a colored bar, with a subtle gray background behind unfilled portions. Each option has a thin border. Text labels show percentage and/or count based on `resultsDetail`. Voter avatars (when `resultsDetail = FULL`) render as an AvatarGroup within the option row, using ContributorTooltip for rich user card popups on hover, with a spread animation on hover for the overlapping avatar group.

**Rationale**: Using the full option rectangle as the progress bar creates a cleaner, more integrated visual design compared to a separate thin progress bar element. The background fill approach is widely used in modern polling UIs (e.g., Twitter/X polls) and reduces visual clutter.

**Alternatives considered**:

- MUI LinearProgress bars as separate elements — **rejected and migrated away from** because the background fill approach is visually cleaner and more modern.
- Chart.js or Recharts pie/bar charts — rejected as overkill for simple option-to-percentage mapping.
- Custom SVG bars — rejected as unnecessary complexity.

---

## Decision 4: Vote Submission UX Pattern

**Decision**: ~~(Superseded — see below)~~ Originally used a two-state button pattern. **Updated 2026-03-18** to immediate voting with no buttons:

- **Single-choice (radio)**: clicking a radio emits `castPollVote` immediately.
- **Multi-choice (checkbox)**: each checkbox toggle starts a 5-second debounce timer. When the timer expires without further changes, the vote is emitted. If the selection count is below `minResponses`, the vote is NOT emitted.
- **Status bar**: a `<Caption>` replaces all buttons — shows spinner + "Submitting your vote…" during mutation, "Voted" + "remove my vote" link after, or "Poll closed" when closed.
- **Controls always active**: radios/checkboxes are never disabled except when the poll is CLOSED. No separate "Change Vote" mode — users click directly to change.

**Rationale**: Immediate voting removes friction for the most common case (single-choice). The 5-second debounce for multi-choice gives users time to make multiple selections without firing a mutation per click. This approach aligns with modern polling UIs (e.g., Slack polls) where interaction is instant.

**Alternatives considered**:

- Explicit "Vote" button with two-state pattern (original design) — **rejected and migrated away from** because the extra button click adds unnecessary friction, especially for single-choice polls where the user's intent is clear on radio click.
- Modal/dialog for vote changing — rejected as unnecessary friction; direct click is simpler.

---

## Decision 5: Poll Creation Form Integration

**Decision**: Extend the existing `CalloutFormFramingSettings.tsx` switch statement with a `CalloutFramingType.Poll` case. The poll form fields render inline in the framing settings area, following the same pattern as Whiteboard/Memo/Link. Fields: poll title (text input), options (dynamic list of text inputs with add/remove), and an expandable "Advanced Settings" section for minResponses, maxResponses, resultsVisibility, and resultsDetail.

**Rationale**: This follows the established pattern exactly. The form model (`CalloutFormSubmittedValues`) gains a `poll` field on the `framing` object, matching how `whiteboard`, `memo`, `link`, and `mediaGallery` work. The `CreateCalloutFramingInput` already accepts a `poll` field per the server contract.

**Alternatives considered**:

- Separate "Create Poll" dialog — rejected because it breaks the unified callout creation flow and would require duplicate logic for settings/contributions/visibility.
- Multi-step wizard — rejected as over-engineering for a form that has ~4 fields plus optional settings.

---

## Decision 6: Option Management UI

**Decision**: All poll option management (add, edit text, remove, reorder) happens exclusively in the **Edit Callout dialog** (Formik form). The inline PollView in the callout is read-only — voting and results only, no "Edit Poll" button or inline option editing. When editing, the PollFormFields component renders options with text fields, remove buttons, and up/down arrow buttons for reordering, consistent with the creation form but enhanced with reorder controls.

**Rationale**: Consolidating all editing in the Edit Callout dialog provides a single, consistent editing experience. It follows the same pattern used for editing other framing types (whiteboard, memo, link, media gallery) — none of those have inline editing in the callout view. This simplifies PollView (pure voting/results component), eliminates the need for the PollOptionManager/PollOptionManagerRow components in the callout view, and keeps the `usePollOptionManagement` hook mutations only for the save action in the dialog. The edit callout dialog already has a well-established UX pattern with save/cancel, which provides a safer editing experience than immediate-fire mutations.

**Alternatives considered**:

- Inline editing via PollOptionManager in the callout view (original design) — **rejected and migrated away from** because it was inconsistent with how all other framing types handle editing, and it mixed editing concerns into the read-only poll display.
- Batch editing with a single "Save" button in inline mode — rejected because the Edit Callout dialog already provides this UX naturally.
- Full-page option management view — rejected as overkill; polls have at most ~20 options.

---

## Decision 7: Visibility Matrix Delegation

**Decision**: The client delegates all visibility logic to the server. The `canSeeDetailedResults` boolean and the null/non-null state of `totalVotes`, `voteCount`, `votePercentage`, and `voters` fields drive the UI rendering directly. No client-side visibility matrix replication.

**Rationale**: The server already computes the 6-cell visibility matrix (resultsVisibility × hasVoted) and returns appropriately filtered data. The client only needs to check: (a) is `canSeeDetailedResults` true? → render per-option details. (b) is `totalVotes` non-null? → show total. (c) are individual fields null? → hide them. This is simpler, less error-prone, and maintains a single source of truth.

**Alternatives considered**:

- Client-side matrix logic — rejected because it would duplicate server logic, create a maintenance burden, and risk inconsistencies.

---

## Decision 8: Notification Preferences Pattern

**Decision**: Add 4 new notification preference entries to `CombinedSpaceNotificationsSettings.tsx` following the existing `DualSwitchSettingsGroup` pattern. The 4 preferences map to the server's notification event types: `collaborationPollVoteCastOnOwnPoll`, `collaborationPollVoteCastOnPollIVotedOn`, `collaborationPollModifiedOnPollIVotedOn`, `collaborationPollVoteAffectedByOptionChange`.

**Rationale**: This follows the exact same pattern as existing space collaboration notification preferences (e.g., `collaborationCalloutPublished`, `collaborationCalloutContributionCreated`). No new components needed — just new entries in the options object and new i18n keys.

**Alternatives considered**:

- Separate "Poll Notifications" section — rejected because poll notifications are space-level collaboration notifications and belong in the existing space notification group.

---

## Decision 9: Poll Icon

**Decision**: Use MUI's `BallotOutlined` icon for the POLL framing type, added to the `calloutFramingIcons` record in `calloutIcons.ts`.

**Rationale**: `BallotOutlined` (a ballot/checkbox-list icon) clearly communicates "voting/polling" and is already available in the MUI icon set used throughout the project. No custom icon design needed.

**Alternatives considered**:

- `HowToVoteOutlined` — also good but less recognizable at small sizes.
- `PollOutlined` — actually a bar chart icon, which could be confused with analytics.
- Custom SVG — rejected as unnecessary when a suitable MUI icon exists.

---

## Decision 10: Real-time Updates via Subscriptions

**Decision**: Use two GraphQL subscriptions (`pollVoteUpdated` and `pollOptionsChanged`) to deliver real-time updates to users viewing a poll. The subscriptions are activated when the poll callout component mounts and deactivated on unmount. The server handles visibility filtering at the field-resolver level — the client trusts and renders whatever data it receives.

**Rationale**: Real-time updates enhance engagement by showing live vote counts and option changes. The server already implements the two subscriptions with full visibility matrix filtering (resultsVisibility × resultsDetail × voted status), so the client implementation is simple: subscribe, receive data, write to Apollo cache. This follows the established patterns from InAppNotifications and ConversationEvents subscriptions.

**Key implementation choices**:

- **Cache update strategy**: Use `client.cache.writeFragment` with the `PollDetails` fragment in the `onData` callback. Since subscription payloads return the full Poll shape, this directly replaces the cached poll data and all consuming components re-render automatically.
- **Subscription placement**: Hook called in `CalloutFramingPoll` (the framing display component), not in `PollView`, to ensure proper mount/unmount lifecycle tied to callout visibility.
- **Vote revocation handling**: When `myVote` becomes null in a subscription update, PollView resets to voting mode.
- **In-progress selection**: When the user is changing their vote and a subscription update arrives, the option list updates but the user's local selection state is preserved (removing any selections for deleted options).

**Alternatives considered**:

- Polling interval — rejected because subscriptions provide true real-time with less network overhead.
- Single combined subscription — rejected because vote updates are high-frequency and option changes are low-frequency; separate subscriptions let the server suppress vote events for HIDDEN+not-voted scenarios without suppressing option changes.
- Client-side visibility filtering — rejected because the server already handles this at the field-resolver level; duplicating the logic would be error-prone.
