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

**Decision**: Use MUI LinearProgress bars for per-option results, with text labels showing percentage and/or count based on `resultsDetail`. Voter avatars (when `resultsDetail = FULL`) render as an AvatarGroup below the progress bar.

**Rationale**: Progress bars are a standard, accessible way to represent proportional data. MUI's LinearProgress supports `determinate` variant with a value prop (0-100), which maps directly to `votePercentage`. This approach requires no additional dependencies.

**Alternatives considered**:

- Chart.js or Recharts pie/bar charts — rejected as overkill for simple option-to-percentage mapping; adds a dependency for minimal gain.
- Custom SVG bars — rejected because MUI LinearProgress already provides theming, accessibility, and animation support.

---

## Decision 4: Vote Submission UX Pattern

**Decision**: Use a two-state pattern: "selection mode" (user selects options) and "submitted mode" (user sees their vote highlighted with results). A "Vote" button submits. After voting, a "Change Vote" button re-enters selection mode. Use `useTransition` for the mutation to keep UI responsive during submission.

**Rationale**: This matches the `castPollVote` mutation contract — votes are always submitted as a complete selection set (no partial modifications). The two-state approach keeps the UI clear about what the user is doing. `useTransition` follows the React 19 concurrent discipline from the constitution.

**Alternatives considered**:

- Instant-vote on click (no explicit submit button) — rejected because multi-choice polls need a "submit" action, and single-choice polls benefit from the ability to review before committing.
- Modal/dialog for vote changing — rejected as unnecessary friction; inline re-selection is simpler.

---

## Decision 5: Poll Creation Form Integration

**Decision**: Extend the existing `CalloutFormFramingSettings.tsx` switch statement with a `CalloutFramingType.Poll` case. The poll form fields render inline in the framing settings area, following the same pattern as Whiteboard/Memo/Link. Fields: poll title (text input), options (dynamic list of text inputs with add/remove), and an expandable "Advanced Settings" section for minResponses, maxResponses, resultsVisibility, and resultsDetail.

**Rationale**: This follows the established pattern exactly. The form model (`CalloutFormSubmittedValues`) gains a `poll` field on the `framing` object, matching how `whiteboard`, `memo`, `link`, and `mediaGallery` work. The `CreateCalloutFramingInput` already accepts a `poll` field per the server contract.

**Alternatives considered**:

- Separate "Create Poll" dialog — rejected because it breaks the unified callout creation flow and would require duplicate logic for settings/contributions/visibility.
- Multi-step wizard — rejected as over-engineering for a form that has ~4 fields plus optional settings.

---

## Decision 6: Option Management UI

**Decision**: When a callout editor views a poll they can edit, show an "Edit Poll" action that opens an inline editing mode. In edit mode, options display with text edit fields, delete buttons, and drag handles for reordering. Uses `@dnd-kit/sortable` if already available, otherwise MUI-native up/down buttons. Each mutation (add/edit/remove/reorder) fires independently.

**Rationale**: Inline editing keeps the user in context. Independent mutations match the server API (separate mutations for each action). Confirmation dialogs for destructive actions (edit text, remove option) are shown when the option has votes, following FR-020.

**Alternatives considered**:

- Batch editing with a single "Save" button — rejected because the server API has separate mutations and batch mode would add complex state tracking for no benefit.
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

## Decision 10: Real-time Updates

**Decision**: No real-time updates in this iteration. Poll results update when: (a) the page loads, (b) the user submits their own vote (mutation response), or (c) the user manually refreshes. The Apollo cache is updated via the mutation response which returns the full updated Poll object.

**Rationale**: The server spec explicitly defers real-time push. The `castPollVote` mutation returns the full updated `Poll` object, so the voting user sees immediate results. Other users see updated results on their next page load. This is consistent with how other callout types work.

**Alternatives considered**:

- Polling interval — rejected as premature optimization; adds network overhead for marginal UX benefit.
- WebSocket subscription — explicitly deferred in the server spec.
