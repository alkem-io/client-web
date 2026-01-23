# Feature Specification: Message Emoji Reactions for User-to-User Messaging

**Feature Branch**: `001-message-emoji-reactions`
**Created**: 2026-01-20
**Status**: Draft
**GitHub Issue**: [#9163](https://github.com/alkem-io/client-web/issues/9163)
**Input**: User description: "Emoji Reactions for User-to-User Messaging"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories are PRIORITIZED as user journeys ordered by importance.
  Each user story/journey is INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you still have a viable MVP (Minimum Viable Product) that delivers value.
-->

### User Story 1 - Add Emoji Reaction to Chat Message (Priority: P1)

As a user participating in a direct message conversation, I want to add an emoji reaction to a chat message so that I can quickly acknowledge or respond to what another user said without typing a full reply.

**Why this priority**: This is the core interaction that enables the feature. Users expect to hover over a message and click to react—this mirrors behavior in familiar messaging platforms and matches the existing comment reaction pattern on Alkemio.

**Independent Test**: Can be fully tested by opening a direct message conversation, hovering over any message, clicking the reaction trigger, selecting an emoji from the picker, and verifying the reaction appears on the message immediately.

**Acceptance Scenarios**:

1. **Given** I am viewing a direct message conversation with at least one message, **When** I hover over a message, **Then** I see a reaction trigger icon (matching the comment reaction trigger).
2. **Given** I see the reaction trigger on a message, **When** I click it, **Then** an emoji picker opens (the same picker used for comment reactions).
3. **Given** the emoji picker is open, **When** I select an emoji, **Then** the picker closes and my reaction is immediately added to the message.
4. **Given** I have added a reaction to a message, **Then** the reaction displays below the message with a count of 1 and my emoji visible.
5. **Given** a message has no reactions yet, **When** I hover (desktop) or tap (mobile) the message, **Then** the add-reaction control appears as an overlay aligned to the message without shifting the layout, and it stays visible while the picker is open.

---

### User Story 2 - Remove Own Emoji Reaction (Priority: P1)

As a user who previously reacted to a message, I want to remove my reaction so that I can undo an accidental reaction or change my response.

**Why this priority**: Reaction removal is essential for user control and error recovery. Without it, users feel locked into unintended reactions.

**Independent Test**: Can be fully tested by adding a reaction to a message, then clicking the same emoji again, and verifying the reaction is removed.

**Acceptance Scenarios**:

1. **Given** I have already reacted to a message with a specific emoji, **When** I click on that emoji in the emoji picker again, **Then** my reaction is removed from the message.
2. **Given** I have removed my reaction and I was the only user who reacted with that emoji, **Then** the emoji no longer appears on the message.
3. **Given** I have removed my reaction but other users also reacted with the same emoji, **Then** the emoji remains visible with the count reduced by 1.

---

### User Story 3 - View Aggregated Reactions with Counts (Priority: P2)

As a user viewing a conversation, I want to see all emoji reactions on a message with their counts so that I can understand the collective sentiment at a glance.

**Why this priority**: Aggregation provides social context and makes reactions meaningful in group-like settings. This follows the established comment reaction display pattern.

**Independent Test**: Can be tested by having multiple users react to the same message with various emojis and verifying the display shows each unique emoji with its correct count.

**Acceptance Scenarios**:

1. **Given** a message has reactions from multiple users, **Then** each unique emoji displays once with a count showing how many users used that emoji.
2. **Given** a message has reactions, **When** I hover over a specific emoji chip, **Then** I see a tooltip listing the names of users who reacted with that emoji.
3. **Given** multiple emojis are used on a single message, **Then** they display in a consistent order matching the comment reaction ordering rules.

---

### User Story 4 - Real-Time Reaction Updates (Priority: P2)

As a user in an active conversation, I want to see reactions appear in real time when another participant adds or removes them so that the conversation feels live and responsive.

**Why this priority**: Real-time updates are expected in modern messaging. Delayed updates would feel broken, especially in active conversations.

**Independent Test**: Can be tested by having two users open the same conversation simultaneously; when one adds a reaction, the other should see it appear without refreshing.

**Acceptance Scenarios**:

1. **Given** I am viewing a conversation, **When** another participant adds a reaction to a message, **Then** the reaction appears on my screen within 2 seconds.
2. **Given** I am viewing a conversation, **When** another participant removes their reaction, **Then** the count updates or emoji disappears on my screen within 2 seconds.
3. **Given** a network interruption occurs while adding a reaction, **When** connectivity is restored, **Then** the reaction state synchronizes correctly without duplicate or missing reactions.

---

### User Story 5 - Keyboard-Accessible Reactions (Priority: P3)

As a user who navigates with a keyboard, I want to add and remove reactions using only keyboard controls so that I can use this feature without a mouse.

**Why this priority**: Accessibility is a platform requirement; however, keyboard navigation builds on the existing emoji picker implementation.

**Independent Test**: Can be tested by focusing on the reaction trigger with Tab, pressing Enter to open the picker, navigating emojis with arrow keys, selecting with Enter, and verifying the reaction is added.

**Acceptance Scenarios**:

1. **Given** I am focused on a message, **When** I press Tab, **Then** I can focus the reaction trigger.
2. **Given** the reaction trigger is focused, **When** I press Enter, **Then** the emoji picker opens.
3. **Given** the emoji picker is open, **When** I use arrow keys, **Then** I can navigate between emojis.
4. **Given** an emoji is focused in the picker, **When** I press Enter, **Then** the emoji is selected and added as my reaction.

---

### Edge Cases

- What happens when a user tries to react to a deleted message? → Reactions should not be allowed; the reaction trigger should be hidden.
- What happens when the message author deletes a message that has reactions? → The reactions are removed along with the message.
- What happens when a user loses permission to interact with the chat? → The reaction trigger should be hidden for that user.
- What happens when a message has an extremely large number of reactions (50+ emojis)? → The display should remain readable with overflow handling if needed.
- What happens when a user reacts while offline? → The reaction should queue and sync when connectivity returns, or fail gracefully with user notification.
- What happens when two users add the same emoji simultaneously? → Both reactions should be recorded; the count should increment correctly.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a reaction trigger icon for every non-deleted message in a direct message conversation.
- **FR-002**: System MUST open the same emoji picker used for comment reactions when the reaction trigger is activated.
- **FR-003**: System MUST allow users to add an emoji reaction to a message by selecting from the emoji picker.
- **FR-004**: System MUST allow users to remove their own reaction by re-selecting the same emoji they previously added.
- **FR-005**: System MUST NOT allow users to remove reactions added by other users.
- **FR-006**: System MUST display reaction counts aggregated per emoji on each message.
- **FR-007**: System MUST display a tooltip with sender names when hovering over a reaction chip.
- **FR-008**: System MUST update reactions in real time for all participants in the conversation.
- **FR-009**: System MUST hide the reaction trigger for deleted messages.
- **FR-010**: System MUST hide the reaction trigger for users who lack permission to interact with the chat.
- **FR-011**: System MUST ensure reaction styling (size, spacing, color, hover states) matches the existing comment reaction implementation.
- **FR-012**: System MUST support keyboard navigation for all reaction controls.
- **FR-013**: System MUST provide accessible labels for screen readers on reaction controls and emoji buttons.
- **FR-014**: System MUST persist reactions correctly after page refresh or app restart.
- **FR-015**: System MUST handle graceful degradation (retry or rollback) when network latency or failure occurs during reaction operations.
- **FR-016**: System MUST render the add-reaction control for messages with zero reactions only on hover/tap as an overlay that does not shift surrounding layout and remains visible while the emoji picker is open.

### Key Entities

- **Message**: Represents a chat message in a direct message conversation; extended to include a collection of reactions.
- **Reaction**: Represents a single emoji reaction on a message, containing: emoji character, sender identity, and unique identifier.
- **Room**: The communication room for the direct message conversation; reactions are added/removed in the context of a specific room.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can add or remove a reaction in under 1 second from trigger click to visual confirmation.
- **SC-002**: Reactions appear for other participants within 2 seconds of being added (real-time synchronization).
- **SC-003**: Messages with up to 20 unique emojis and 100 total reactions remain visually readable without layout breakage.
- **SC-004**: All reaction controls pass WCAG 2.1 AA accessibility audit (keyboard navigation, screen reader labels, color contrast).
- **SC-005**: 100% visual and interaction parity with existing comment emoji reactions (verified by design sign-off).
- **SC-006**: Zero increase in chat loading time with messages containing reactions (within 10% margin).
- **SC-007**: Reaction state persists correctly across page refresh and app restart (no data loss or duplication).

## Assumptions

- The existing GraphQL mutations (`addReactionToMessageInRoom`, `removeReactionToMessageInRoom`) can be reused for direct message reactions without modification.
- The existing emoji picker component (`EmojiSelector`) and reaction display components (`CommentReactions`, `ReactionView`) can be reused directly or with minimal adaptation.
- Real-time updates will be delivered via existing subscription infrastructure used for message updates.
- Permission to add reactions will follow existing authorization patterns (e.g., `CreateMessageReaction` privilege).
- The feature will be enabled for all users with access to direct messaging; no separate feature flag is required unless requested.

## Out of Scope

- Custom emoji creation or upload
- Reaction-based notifications (unless already supported for comment reactions)
- Animated reactions or reaction effects
- Reaction analytics or reporting dashboards
- Restricting which emojis are available for reactions
