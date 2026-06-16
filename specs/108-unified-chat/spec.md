# Feature Specification: Unified Chat

**Feature Branch**: `108-unified-chat`  
**Created**: 2026-06-12  
**Status**: Draft  
**Input**: User description: "Migrate and merge UserMessaging (direct + group chats) and the Guidance AI chat into a single floating chat surface. One floating button opens a card panel with a single conversation list; the Guidance AI conversation is pinned at the top alongside people and group chats. Preserve all existing functionality. Remove the header messages icon. A single combined unread badge includes Guidance unread."

## Overview

Today the product exposes two unrelated chat experiences: a people-and-groups messaging area reached from a header icon, and an AI "Guidance" assistant reached from a floating button at the bottom-right of every page. They look different, live in different places, and the AI assistant is deliberately hidden from the messaging list.

This feature unifies them into **one chat surface**. A single floating button opens a card panel containing one conversation list. The Guidance AI assistant appears as the top, always-available conversation, above the user's people and group conversations. Everything users can do today is preserved; it is simply consolidated into one consistent place with one unread indicator.

## Design References

Suggested visual designs for the unified chat (reference mockups):

- **Floating button (launcher)**: [`prototype/public/crd-chat-1.png`](../../prototype/public/crd-chat-1.png) — the circular floating chat button anchored at the bottom-right of any page.
- **Conversation list**: [`prototype/public/crd-chat-2.png`](../../prototype/public/crd-chat-2.png) — the floating "Messages" card anchored above the launcher: header with unread count, a search field ("Search conversations…"), and a scrollable list of conversations with avatars, last-message previews, and unread badges.
- **Conversation detail (thread)**: [`prototype/public/crd-chat-3.png`](../../prototype/public/crd-chat-3.png) — the message thread shown inside the same card: a back affordance + contact header, left/right message bubbles, a day divider with timestamps, and a message composer pinned at the bottom.

**Design caveats**:

- **Filter chips are out of scope for now.** The conversation list mockup (crd-chat-2) shows category filter chips (e.g., Direct / Groups / Spaces); these are deliberately **disregarded** for this feature. Only the single searchable list (with Guidance pinned per FR-008) is in scope.
- **Guidance has no mockup.** The pinned Guidance conversation and all Guidance-specific behaviors (AI identity styling, "beta" indicator, info affordance, introduction, ask/answer loading + wait window, and clear-context) are **not represented** in these designs. They MUST be implemented **without a strict design**, reusing the unified chat's visual language (list row, thread, bubbles) and preserving the current Guidance functionality. Visual treatment for the AI assistant row/thread is at implementation discretion, consistent with the rest of the surface.

## Clarifications

### Session 2026-06-12

- Q: When the user types in the conversation-list search, what happens to the pinned Guidance item? → A: Guidance is filtered like any other row — it is shown only while it matches the search text (it loses its pinned position during an active search and reappears, pinned, when the search is cleared).
- Q: When the user opens the panel (clicks the floating button), what should it show? → A: Always open to the conversation list (the list is the default/home view; opening the panel never auto-selects a conversation).
- Q: What should the combined unread badge number represent? → A: The number of conversations that have at least one unread message (Guidance, when unread, counts as one), matching the existing messaging badge behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open one chat surface and see all conversations (Priority: P1)

A signed-in user clicks the floating chat button in the bottom-right corner. A card panel opens showing a single, searchable list of conversations. The Guidance AI assistant is pinned at the top of the list; below it are the user's direct (1:1) and group conversations, ordered by most recent activity. Selecting any conversation opens its message thread within the same card; a back affordance returns to the list.

**Why this priority**: This is the core consolidation. Without one entry point and one combined list, the feature does not exist. It delivers immediate value even before the secondary management flows are reworked.

**Independent Test**: Sign in, click the floating button, confirm the panel opens with Guidance pinned on top and existing conversations listed below, open a conversation, read its history, and return to the list.

**Acceptance Scenarios**:

1. **Given** a signed-in user with existing conversations, **When** they click the floating chat button, **Then** a card panel opens showing the conversation list with the Guidance assistant pinned at the top.
2. **Given** the panel is open on the list, **When** the user selects a conversation, **Then** that conversation's message thread is shown within the same panel with a way to go back to the list.
3. **Given** the list is shown, **When** the user types in the search field, **Then** the list filters to matching conversations, including the Guidance item (Guidance is shown only when it matches the search text and loses its pinned position during an active search); **When** the search is cleared, **Then** Guidance reappears pinned at the top.
4. **Given** the user previously used the separate messages header icon, **When** the unified chat is active, **Then** the header messages icon is no longer present and the floating button is the only entry point.

---

### User Story 2 - Converse in direct and group chats (Priority: P1)

Within a selected people/group conversation, the user reads messages, sends new messages, and reacts to messages. New messages and reactions from other participants appear in real time without a manual refresh. Opening a conversation marks its messages as read and clears that conversation's unread state.

**Why this priority**: Messaging is the primary day-to-day value of the surface. It must reach full parity with today's behavior, including realtime and read tracking.

**Independent Test**: Open a 1:1 and a group conversation, send messages, add and remove a reaction, and confirm a message sent from another account appears live and that unread state clears on open.

**Acceptance Scenarios**:

1. **Given** an open conversation, **When** the user sends a message, **Then** it appears in the thread and is delivered to other participants.
2. **Given** an open conversation, **When** another participant sends a message, **Then** it appears in the thread in real time.
3. **Given** an open conversation, **When** the user adds or removes a reaction on a message, **Then** the reaction updates for all participants.
4. **Given** a conversation with unread messages, **When** the user opens it, **Then** its messages are marked read and its unread indicator clears.

---

### User Story 3 - Use the Guidance AI assistant in the unified list (Priority: P1)

The user selects the pinned Guidance conversation at the top of the list. They see the assistant's introduction and any prior exchange, ask a question, and receive an AI answer. While awaiting an answer, a loading indicator is shown and input is temporarily disabled; if no answer arrives within the expected wait window, the loading state ends gracefully. The Guidance conversation is visually distinguishable as an AI assistant (assistant identity styling plus a "beta" indicator) and offers an information affordance explaining what the assistant is. The user can clear the Guidance conversation's context to start fresh; after clearing, the Guidance conversation remains pinned at the top and ready for a new exchange.

**Why this priority**: Guidance is a first-class part of the merged surface and has unique behaviors (AI identity, beta/info, clear-context) that must be preserved when it moves into the shared list.

**Independent Test**: Open the pinned Guidance conversation, send a question and receive a reply, open the info affordance, then clear the context and confirm the conversation resets and stays pinned.

**Acceptance Scenarios**:

1. **Given** the Guidance conversation has no prior messages, **When** it is opened, **Then** an assistant introduction is shown.
2. **Given** the Guidance conversation is open, **When** the user sends a question, **Then** a loading indicator appears, input is disabled, and the assistant's answer appears when received.
3. **Given** the assistant does not answer within the expected wait window, **When** the wait window elapses, **Then** the loading state ends and the user can send another message.
4. **Given** the Guidance conversation is open, **When** the user chooses to clear the context and confirms, **Then** the prior exchange is cleared, the conversation remains pinned at the top, and a fresh exchange can begin.
5. **Given** the Guidance assistant is shown in the list, **When** the user views the row and the thread, **Then** it is identifiable as an AI assistant with a "beta" indicator and an information affordance.

---

### User Story 4 - Start a new direct or group conversation (Priority: P2)

From the conversation list the user starts a new message, searches for one or more people, and selects recipients. Selecting a single recipient starts a direct (1:1) conversation; selecting multiple recipients starts a group conversation. The newly created conversation opens and appears at the top of the list (below the pinned Guidance item).

**Why this priority**: Creating conversations is essential but secondary to consuming existing ones; the surface is still valuable for existing threads without it.

**Independent Test**: Start a new message, pick one person and confirm a 1:1 is created and opened; repeat picking multiple people and confirm a group is created.

**Acceptance Scenarios**:

1. **Given** the conversation list is open, **When** the user starts a new message and selects a single recipient, **Then** a direct conversation is created and opened.
2. **Given** the new-message flow, **When** the user selects two or more recipients, **Then** a group conversation is created and opened.
3. **Given** a conversation was just created, **When** the list is shown, **Then** the new conversation appears at the top of the user/group conversations, below the pinned Guidance item.

---

### User Story 5 - Manage a group conversation (Priority: P2)

In a group conversation the user opens its settings to rename the group, change its avatar, add members, remove members, or leave the group. Adding and removing members takes effect immediately; name and avatar changes are applied when saved. Leaving a group removes the conversation from the user's list. Unsaved name/avatar changes prompt the user before being discarded.

**Why this priority**: Group management is required for parity but applies only to group conversations and is used less frequently than reading/sending messages.

**Independent Test**: Open a group's settings, rename it and change the avatar then save, add and remove a member, and leave the group — confirming each effect.

**Acceptance Scenarios**:

1. **Given** a group conversation, **When** the user adds or removes a member, **Then** the change takes effect immediately and is reflected for participants.
2. **Given** a group conversation, **When** the user edits the name and/or avatar and saves, **Then** the changes are applied; **When** they attempt to close with unsaved changes, **Then** they are prompted before discarding.
3. **Given** a group conversation, **When** the user leaves the group, **Then** the conversation is removed from their list.

---

### Edge Cases

- **Guidance disabled**: When the Guidance assistant is not available to the user (feature unavailable or the user lacks the required permission), the floating button and the people/group chat list still work, and no Guidance row appears.
- **Group that includes the assistant**: A multi-person group that happens to include the AI assistant alongside other people is treated as a normal group conversation, not as the pinned Guidance item.
- **No conversations yet**: A user with no conversations still sees the floating button and can start a new message; the empty list shows an appropriate empty state (with Guidance pinned on top when available).
- **Not signed in / not a registered user**: The unified chat surface is not offered to users who cannot have conversations.
- **Removed from a group remotely**: If the user is removed from a group by someone else while the panel is open, that conversation is removed from their list in real time.
- **Combined unread accuracy**: The single unread badge reflects unread across all conversations including Guidance; the assistant's introductory message (shown when there is no real history) must not, by itself, register as unread.
- **Clearing Guidance while open**: Clearing the Guidance context while its thread is open resets the thread in place and keeps the conversation pinned and usable without requiring the user to reopen the panel.
- **Mobile**: The surface must be fully usable on small screens, where the panel expands to accommodate the list and thread and the composer remains reachable.
- **Long wait for AI**: If the assistant is slow, the loading state must not trap the user; the input becomes usable again after the expected wait window.

## Requirements *(mandatory)*

### Functional Requirements

#### Entry point & panel
- **FR-001**: The system MUST present a single floating chat button in the bottom-right corner of the application for signed-in users who can have conversations.
- **FR-002**: The system MUST remove the separate header messages icon; the floating button MUST be the only entry point to chat.
- **FR-003**: Clicking the floating button MUST open a card panel anchored near the button; clicking again or dismissing it MUST close the panel.
- **FR-004**: The panel MUST show, in one place, a conversation list and a selected conversation's thread, swapping between list and thread within the same panel with a way to return to the list.
- **FR-004a**: Opening the panel MUST always show the conversation list as the default view; it MUST NOT auto-select or restore a previously open conversation.
- **FR-005**: The surface MUST be fully usable on small/mobile screens, including reading the list, reading a thread, and sending messages.
- **FR-006**: The floating button MUST be suppressed in contexts where chat should not appear today (e.g., authentication screens and full-screen editing contexts) while remaining available on mobile within normal app pages.

#### Unified conversation list
- **FR-007**: The conversation list MUST include the user's direct (1:1) and group conversations and the Guidance AI conversation together in one list.
- **FR-008**: The Guidance AI conversation MUST be pinned at the top of the list and remain present whenever Guidance is available to the user.
- **FR-009**: Below the pinned Guidance item, conversations MUST be ordered by most recent activity, with a newly created conversation surfaced at the top of that group.
- **FR-010**: The list MUST be searchable/filterable by conversation name. During an active search, the Guidance item MUST be subject to the same filter (shown only when it matches the search text) and MUST lose its pinned position; when the search is cleared, Guidance MUST return to its pinned position at the top.
- **FR-011**: Each list item MUST display its name, an avatar (a composite avatar for groups), a preview/most-recent indicator where available, and its unread state.
- **FR-012**: The Guidance list item MUST be visually identifiable as an AI assistant and carry a "beta" indicator.

#### Messaging (direct & group)
- **FR-013**: Users MUST be able to read a conversation's message history.
- **FR-014**: Users MUST be able to send messages in a conversation.
- **FR-015**: New messages and member/conversation changes from others MUST appear in real time without a manual refresh.
- **FR-016**: Users MUST be able to add and remove reactions on messages, with changes reflected to all participants.
- **FR-016a**: Reactions MUST be available on real, delivered messages only; they MUST NOT be offered on the synthetic Guidance introduction message or on optimistic/pending messages not yet confirmed.
- **FR-017**: Opening a conversation MUST mark its messages as read and clear that conversation's unread state.

#### New conversations
- **FR-018**: Users MUST be able to start a new conversation by searching for and selecting one or more people.
- **FR-019**: Selecting exactly one recipient MUST create a direct (1:1) conversation; selecting two or more MUST create a group conversation.
- **FR-020**: A newly created conversation MUST open and appear at the top of the user/group conversations (below the pinned Guidance item).

#### Group management
- **FR-021**: Users MUST be able to rename a group and change its avatar, with these changes applied on save.
- **FR-022**: Users MUST be able to add and remove group members, taking effect immediately.
- **FR-023**: Users MUST be able to leave a group, which removes the conversation from their list.
- **FR-024**: The system MUST prompt the user before discarding unsaved group name/avatar changes.
- **FR-025**: Destructive actions (leaving a group, removing a member) MUST require explicit confirmation.

#### Guidance assistant
- **FR-026**: When the Guidance conversation has no real message history, the system MUST show an assistant introduction.
- **FR-027**: When the user sends a message to the assistant, the system MUST show a loading state and disable input until an answer arrives or the expected wait window elapses.
- **FR-028**: If no answer arrives within the expected wait window, the system MUST end the loading state and allow the user to send again.
- **FR-029**: The system MUST provide an information affordance for the Guidance conversation explaining what the assistant is.
- **FR-030**: Users MUST be able to clear the Guidance conversation's context after explicit confirmation; after clearing, the Guidance conversation MUST remain pinned at the top and be ready for a fresh exchange, and the open thread MUST reset in place.
- **FR-031**: The Guidance conversation MUST only appear when the assistant is available to the user (feature available and required permission held); otherwise the rest of the chat MUST continue to function.
- **FR-032**: A multi-person group that includes the assistant alongside other people MUST be treated as a normal group, not as the pinned Guidance item.

#### Unread indicator
- **FR-033**: The system MUST show a single combined unread badge on the floating button whose number is the count of conversations that have at least one unread message, across all conversations including Guidance (an unread Guidance conversation counts as one). This matches the existing messaging badge behavior.
- **FR-034**: The assistant's introductory message (shown when there is no real history) MUST NOT by itself count toward unread.

#### Preservation & rollout
- **FR-035**: The unified chat MUST preserve all capabilities currently available in the two separate surfaces (direct & group messaging, reactions, realtime, unread, mark-as-read, new conversation creation, group settings, and Guidance ask/clear-context).
- **FR-036**: The change MUST be introduced behind the existing design-version mechanism so the prior experience remains intact for users on the legacy design until the unified chat is validated.

### Key Entities

- **Conversation**: A thread between participants. May be a direct (1:1) conversation, a group conversation, or the Guidance AI conversation. Attributes relevant to users: name, avatar, participants, unread state, most-recent activity, and whether it is the pinned AI assistant.
- **Message**: An entry in a conversation with an author, content, timestamp, read state, and reactions.
- **Reaction**: An emoji response to a message, attributed to a participant.
- **Participant / Member**: A person (or the AI assistant) in a conversation; groups have multiple members who can be added or removed.
- **Guidance Assistant**: The AI participant that anchors the pinned Guidance conversation; supports an introduction, ask/answer with a wait window, an informational explanation, and context clearing.
- **Unread Indicator**: A single combined count of conversations with unread messages, surfaced on the floating button.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of capabilities available in the two prior surfaces (direct & group messaging, reactions, realtime, unread, mark-as-read, new conversation creation, group settings, Guidance ask and clear-context) are available in the unified chat.
- **SC-002**: There is exactly one chat entry point (the floating button) and exactly one unread badge for chat across the application; the separate header messages icon is absent.
- **SC-003**: The Guidance assistant appears as the top item of the conversation list 100% of the time it is available to the user, and is never shown when it is unavailable.
- **SC-004**: From clicking the floating button, a user can reach any existing conversation's history in no more than two interactions (open panel, select conversation).
- **SC-005**: Messages and reactions sent by another participant appear in an open conversation within 3 seconds without any manual refresh.
- **SC-006**: Opening a conversation clears its unread state, and the combined badge updates accordingly, in at least 95% of opens within 2 seconds.
- **SC-007**: A user can start a new direct conversation in no more than three interactions (start new message, select one person, confirm) and a group by selecting multiple people in the same flow.
- **SC-008**: When the assistant does not respond, the loading state always ends within the expected wait window so the user is never blocked from sending another message.
- **SC-009**: The unified chat is fully operable on small/mobile screens for listing, reading, and sending.
- **SC-010**: Users on the legacy design experience no change to their existing chat behavior until the unified chat is enabled for them.

## Assumptions

- **A-001**: The Guidance AI conversation is already represented as a normal conversation alongside people/group conversations; surfacing it in the unified list does not require new conversation data, only ceasing to hide it and pinning it.
- **A-002**: No backend/schema changes are required; all needed operations (listing conversations, messages, reactions, realtime, creating conversations, group membership/name/avatar changes, marking read, and clearing the assistant's context) already exist.
- **A-003**: The single floating-card panel (anchored near the launcher), with list and thread swapping inside it, is the chosen surface — not a full-height side drawer.
- **A-004**: Removing the header messages icon is intended; the floating button fully replaces it as the entry point.
- **A-005**: The combined unread badge intentionally includes Guidance unread; the standalone Guidance badge is retired.
- **A-006**: Mentions in direct/group messages remain disabled (matching current behavior) unless explicitly requested otherwise.
- **A-007**: "Expected wait window" for the assistant matches the current Guidance behavior (a fixed timeout after which the loading state ends).
- **A-008**: The feature ships behind the existing design-version toggle; the legacy surfaces remain available to users on the legacy design until validation completes, after which the legacy surfaces can be retired in a follow-up.
- **A-009**: Visual designs exist for the launcher, conversation list, and conversation detail (see Design References). The category filter chips in the list mockup are out of scope. No design exists for the pinned Guidance conversation or any Guidance-specific behavior; these are implemented without a strict design, reusing the unified chat's visual language and preserving current Guidance functionality.

## Out of Scope

- Removing/deleting the legacy messaging and Guidance implementations (handled as a follow-up cleanup after validation).
- New messaging capabilities not present today (e.g., message editing/threading/attachments in direct chats, mentions in direct chats, read-receipt avatars beyond current behavior).
- Any change to who the Guidance assistant is, how it generates answers, or its underlying availability rules beyond surfacing it in the unified list.
- Backend, schema, or API changes.
