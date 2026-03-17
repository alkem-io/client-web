# Feature Specification: Fix Group Chat Badge Counts & Member Event Handling

**Feature Branch**: `024-fix-group-chat-badges`
**Created**: 2026-03-16
**Status**: Draft
**Input**: User description: "Remove fake unread badge logic for group conversations; add proper MEMBER_ADDED/MEMBER_REMOVED handling so that being added to or removed from a group chat correctly integrates the conversation into (or removes it from) the user's conversation model, including accurate unread counts and badge updates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - I Am Added to a Group Chat With Existing Messages (Priority: P1)

I am added to a group conversation that already has messages. The conversation appears in my conversation list with the correct unread count (the server returns all existing messages as unread for me since I've never read them). The platform nav bar badge increments to reflect this conversation has unread content.

From this point on, the conversation behaves identically to one loaded during the initial `me.conversations` query — new messages increment unread, read receipts clear it, all real-time events work normally.

**Why this priority**: This is the most common and impactful case. Users need to see new group conversations with accurate unread counts and have them fully participate in the subscription model.

**Independent Test**: User B adds User A to a group with 5 messages. User A sees the group in their list with unreadCount from server, badge increments by 1. User A opens it, reads messages, badge decrements. Another member sends a message — unread increments again.

**Acceptance Scenarios**:

1. **Given** I am not a member of group "Project Alpha" which has 5 messages, **When** another user adds me, **Then** the conversation appears in my list with the server-provided unread count and the nav bar badge increments.
2. **Given** I was just added to "Project Alpha", **When** I open and read the conversation, **Then** unread count drops to 0 and the badge decrements.
3. **Given** I was just added to "Project Alpha", **When** another member sends a new message while I'm not viewing it, **Then** the unread count increments and the badge updates — identical to conversations from initial load.

---

### User Story 2 - I Am Removed From a Group Chat (Priority: P1)

I am removed from a group conversation. The conversation disappears from my list entirely. If it had unread messages contributing to the nav bar badge, the badge decrements. The conversation is fully cleaned up from cache — as if it was never part of `me.conversations`.

**Why this priority**: Equally critical — removal must cleanly undo all traces of the conversation, including badge counts, to avoid stale data and phantom badges.

**Independent Test**: User A is a member of a group with 3 unread messages. User B removes User A. The conversation vanishes from User A's list and badge decrements by 1.

**Acceptance Scenarios**:

1. **Given** I am a member of "Project Alpha" which has 3 unread messages for me, **When** I am removed, **Then** the conversation disappears from my list and the nav bar badge decrements by 1.
2. **Given** I am a member of "Project Alpha" with 0 unread messages, **When** I am removed, **Then** the conversation disappears and the badge does not change.
3. **Given** I am currently viewing "Project Alpha", **When** I am removed, **Then** the conversation is closed/removed from view and disappears from my list.

---

### User Story 3 - I Am Added to an Empty Group Chat (Priority: P2)

I am added to a group conversation with no messages. The conversation appears in my list with 0 unread. No badge increment — there is nothing actionable. No fake "1 unread" indicator.

**Why this priority**: Important for correctness. The previous fake badge logic created confusion by showing unread indicators when there was nothing to read. The correct behavior: no messages = no badge.

**Independent Test**: Create a group with User A and User B, send no messages. User B sees the conversation with 0 unread, no badge change.

**Acceptance Scenarios**:

1. **Given** a group is created with me as a member but no messages exist, **When** the conversation appears in my list, **Then** unread count is 0 and the nav bar badge does not increment.
2. **Given** I am added to an existing group with 0 messages, **When** the conversation appears in my list, **Then** unread count is 0 and the nav bar badge does not increment.

---

### User Story 4 - Someone Else Is Added to or Removed From a Group I'm In (Priority: P2)

When another user is added to or removed from a group I am already a member of, the member list updates in real time. My unread counts and badge are unaffected — this is purely a member roster change.

**Why this priority**: Maintains accurate group membership display. Lower priority because it doesn't affect the badge/unread logic, which is the core fix.

**Independent Test**: User C is added to a group where User A is a member. User A sees User C appear in the member list. User A's badge and unread counts remain unchanged.

**Acceptance Scenarios**:

1. **Given** I am a member of "Project Alpha", **When** User C is added to the group, **Then** User C appears in the member list and my unread count/badge are unchanged.
2. **Given** I am a member of "Project Alpha", **When** User C is removed from the group, **Then** User C disappears from the member list and my unread count/badge are unchanged.

---

### Edge Cases

- What happens if I am added and immediately removed before the client processes the add event? The removal should take precedence; if the conversation was already added to cache, it should be cleaned up. If not yet added, the add should be a no-op since the subsequent remove will find nothing.
- What happens if I receive a MEMBER_ADDED event for myself for a conversation already in my list (idempotency)? No duplicate entries; existing conversation remains unchanged.
- What happens if the fetch for conversation details fails after MEMBER_ADDED? The conversation should not appear with partial data. The system should handle this gracefully (the conversation will appear on next full refresh).
- What happens if I am removed from a group while the messaging panel is closed? On next open, the conversation should not be in the list (it was already removed from cache by the subscription handler).
- What happens if a MEMBER_REMOVED event for me arrives for a conversation not in my cache? It should be a no-op.
- What happens if I leave a group myself (not removed by someone else)? The existing MEMBER_REMOVED handling for self should cover this identically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST remove the fake unread count override (`Math.max(room.unreadCount, 1)` for group conversations) from the ConversationCreated handler. The actual server-provided `unreadCount` MUST be used for all conversation types.
- **FR-002**: When the current user receives a MEMBER_ADDED event where they are the added member, the system MUST fetch full conversation data from the server (room details, unread count, last message, members) and add it to both the full conversations cache and the lightweight unread count cache.
- **FR-003**: After MEMBER_ADDED processing for the current user, the newly added conversation MUST participate in all existing real-time event handling (messages, deletions, read receipts, member changes) identically to conversations from the initial `me.conversations` query.
- **FR-004**: When the current user receives a MEMBER_REMOVED event where they are the removed member, the system MUST remove the conversation from both the full conversations cache and the lightweight unread count cache, ensuring the nav bar badge decrements if that conversation had unread messages.
- **FR-005**: MEMBER_ADDED/MEMBER_REMOVED handling for the current user MUST be idempotent — duplicate events MUST NOT create duplicates or cause errors.
- **FR-006**: MEMBER_ADDED events where the added member is NOT the current user MUST continue to update only the member list of the relevant conversation (existing behavior preserved).
- **FR-007**: MEMBER_REMOVED events where the removed member is NOT the current user MUST continue to update only the member list of the relevant conversation (existing behavior preserved).
- **FR-008**: The nav bar badge MUST accurately reflect the count of conversations with unread messages at all times — no fake counts, no stale counts after add/remove operations.
- **FR-009**: The other improvements from commit b56086de (immediate cache clearing on mark-as-read, syncing the lightweight unread count cache in ConversationCreated/Deleted handlers) MUST be preserved — only the fake `effectiveUnreadCount` logic is removed.

### Key Entities

- **Conversation**: A messaging thread (direct or group) containing a room, members, and metadata. Key attributes: id, room, members.
- **Room**: The container for messages within a conversation. Key attributes: id, type (direct/group), unreadCount, messagesCount, lastMessage, displayName.
- **Nav Bar Badge**: A UI indicator showing the count of conversations that have unread messages (not total unread messages). Derived by counting conversations where unreadCount > 0.
- **MEMBER_ADDED Event**: Dual-purpose subscription event — indicates either (a) someone was added to a group I'm in, or (b) I was added to a group. Distinguished by comparing the added member's ID to the current user's ID.
- **MEMBER_REMOVED Event**: Dual-purpose subscription event — indicates either (a) someone was removed from a group I'm in, or (b) I was removed from a group. Distinguished by comparing the removed member's ID to the current user's ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a user is added to a group chat, the conversation appears in their list within 2 seconds with an accurate unread count matching server data.
- **SC-002**: When a user is removed from a group chat, the conversation disappears from their list within 2 seconds and the badge count is accurate.
- **SC-003**: No false unread badges — conversations with 0 unread messages never contribute to the nav bar badge count.
- **SC-004**: After being added to a group dynamically, 100% of subsequent real-time events (new messages, deletions, read receipts) are handled identically to conversations from the initial load.
- **SC-005**: All MEMBER_ADDED and MEMBER_REMOVED operations are idempotent — duplicate events produce no side effects.

## Assumptions

- The server returns accurate `unreadCount` for a room when queried — including when a user is newly added and all existing messages count as unread for them.
- The MEMBER_ADDED subscription event contains enough data (conversation ID, room ID) to issue a follow-up query for full conversation details.
- An existing query (e.g., a single-conversation lookup or `me.conversations`) can be used to fetch data for a newly joined conversation.
- The existing `handleMemberRemoved` for `self` already removes the conversation from both the full cache and the unread count cache (implemented in commit b56086de). No changes needed for self-removal.
