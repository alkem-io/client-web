# Research: Fix Group Chat Badge Counts & Member Event Handling

**Date**: 2026-03-16
**Branch**: `024-fix-group-chat-badges`

## R1: Does a single-conversation query with room metadata exist?

**Finding**: No. The only per-conversation query is `ConversationMessages` which fetches `room.messages` but NOT room metadata (`unreadCount`, `displayName`, `type`, `messagesCount`, `lastMessage`, `avatarUrl`, `createdDate`).

**Decision**: Create a new `ConversationDetails.graphql` query using the existing `lookup.conversation(ID:)` resolver, selecting the same room fields as `UserConversations`.

**Alternatives considered**:
- Refetch entire `UserConversations` — wasteful, fetches all conversations
- Extend `ConversationMessages` with room metadata — would change the semantics of an existing query and load messages unnecessarily

## R2: What data does MEMBER_ADDED event provide?

**Finding**: The subscription event provides:
- `conversation.id` — the conversation ID (sufficient for the follow-up query)
- `addedMember` — full Actor with `id`, `type`, `profile { displayName, url, avatar }`

The event does NOT provide room details, so a server query is required to get `unreadCount`, `lastMessage`, etc.

**Decision**: Use `conversation.id` from the event to issue `ConversationDetails` query via `client.query()`.

## R3: What data does MEMBER_REMOVED event provide?

**Finding**: The subscription event provides:
- `conversation.id` — the conversation ID
- `removedMemberID` — UUID of the removed member

**Decision**: Compare `removedMemberID` against `currentUserId` to determine self vs. other. For self-removal: existing code already removes from both caches. No changes needed.

## R4: Does handleMemberRemoved for self already work correctly?

**Finding**: YES. The current code (lines 277-310 of `useConversationEventsSubscription.ts`) already:
1. Checks `event.removedMemberID === currentUserId`
2. Removes the conversation from `UserConversationsQuery` cache
3. Removes the conversation from `UserConversationsUnreadCountQuery` cache

The badge automatically adjusts because `useUnreadConversationsCount` derives its count from the unread count cache by filtering conversations where `unreadCount > 0`.

**Decision**: No changes needed for self-removal. This was correctly implemented in commit b56086de.

## R5: What needs to change in the fake badge logic?

**Finding**: In `handleConversationCreated` (line 106-107), the code overrides:
```ts
const effectiveUnreadCount =
  room.type === RoomType.ConversationGroup ? Math.max(room.unreadCount, 1) : room.unreadCount;
```

This is used in two places:
1. Line 128: Writing to `UserConversationsQuery` cache
2. Line 167: Writing to `UserConversationsUnreadCountQuery` cache

**Decision**: Remove the `effectiveUnreadCount` variable entirely. Use `room.unreadCount` directly in both places. Remove the `RoomType` import if it becomes unused.

## R6: Apollo `client.query()` in subscription handlers

**Finding**: The current codebase does not use `client.query()` in subscription handlers — it relies on data provided by the event payload (e.g., `conversationCreated` provides full room data). However, `MEMBER_ADDED` only provides `conversation.id`, so imperative fetch is necessary.

**Decision**: Use `client.query()` with the new `ConversationDetailsDocument` and `fetchPolicy: 'network-only'`. This is a standard Apollo pattern. The async nature of `client.query()` within a `useCallback` is fine — subscription handlers are not required to be synchronous.

**Risk**: If the query fails (network error, authorization), the conversation won't appear until the next full refresh. This is acceptable per the spec's edge case handling (FR-005 idempotency, graceful degradation).
