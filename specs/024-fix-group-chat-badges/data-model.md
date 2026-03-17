# Data Model: Fix Group Chat Badge Counts & Member Event Handling

**Date**: 2026-03-16
**Branch**: `024-fix-group-chat-badges`

## Entities

No new entities are introduced. This feature modifies how existing entities are managed in the Apollo cache.

### Existing Entities (unchanged schema)

#### Conversation
- `id`: UUID (primary key, normalized cache ID)
- `room`: Room (1:1 relationship)
- `members`: Actor[] (1:many)

#### Room
- `id`: UUID (primary key, normalized cache ID)
- `type`: RoomType (CONVERSATION_DIRECT | CONVERSATION_GROUP)
- `displayName`: String
- `avatarUrl`: String (nullable)
- `createdDate`: DateTime
- `unreadCount`: Int (server-computed, per-user)
- `messagesCount`: Int
- `lastMessage`: Message (nullable, 1:1)

#### Actor (conversation member)
- `id`: UUID
- `type`: ActorType (USER | VIRTUAL_CONTRIBUTOR | ...)
- `profile`: Profile (displayName, url, avatar)

## Cache Topology

Two Apollo cache queries are affected:

### UserConversationsQuery (full data)
- Used by: conversation list panel
- Contains: full conversation data (room metadata, members, lastMessage)
- Cache key: `ROOT_QUERY.me.conversations`

### UserConversationsUnreadCountQuery (lightweight)
- Used by: nav bar badge via `useUnreadConversationsCount`
- Contains: conversation ID + room ID + unreadCount only
- Cache key: `ROOT_QUERY.me.conversations` (shares normalized Room entities with full query)

### Cache Update Flow

**MEMBER_ADDED (self)**:
1. Subscription event arrives with `conversation.id`
2. `client.query()` fetches `ConversationDetails` → returns full conversation data
3. Write to UserConversationsQuery cache (prepend conversation)
4. Write to UserConversationsUnreadCountQuery cache (add conversation with unreadCount)
5. Badge auto-updates (derived from unread count cache)

**MEMBER_REMOVED (self)** — already implemented:
1. Subscription event arrives with `conversation.id` + `removedMemberID`
2. Remove conversation from UserConversationsQuery cache
3. Remove conversation from UserConversationsUnreadCountQuery cache
4. Badge auto-decrements (conversation no longer in unread count cache)

## State Transitions

```
Not a member ──MEMBER_ADDED(self)──> Member (conversation in cache, unread from server)
Member ──MEMBER_REMOVED(self)──> Not a member (conversation removed from cache)
Member ──new message──> Member with unread++ (existing subscription handling)
Member with unread ──mark as read──> Member with unread=0 (existing mark-as-read handling)
```
