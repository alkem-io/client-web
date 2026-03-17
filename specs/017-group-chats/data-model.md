# Data Model: Group Chats

**Feature**: 017-group-chats
**Date**: 2026-03-06

## Entities

### Conversation (updated)

The `Conversation` entity is refactored from a 1-on-1 model to a unified model supporting both direct and group conversations.

| Field         | Type        | Notes                                                               |
| ------------- | ----------- | ------------------------------------------------------------------- |
| `id`          | UUID        | Unique identifier                                                   |
| `members`     | `[Actor!]!` | **NEW** — All participants (replaces `user` / `virtualContributor`) |
| `room`        | `Room`      | Contains messages, unread count, avatarUrl, etc. (updated)          |
| `messaging`   | `Messaging` | Authorization and metadata (unchanged)                              |
| `createdDate` | DateTime    | (unchanged)                                                         |
| `updatedDate` | DateTime    | (unchanged)                                                         |

**Removed fields:**

- `type: CommunicationConversationType` — replaced by member inspection
- `user: User` — replaced by `members`
- `virtualContributor: VirtualContributor` — replaced by `members`

**Conversation kind** is determined by:

- Room type: `conversation_direct` vs `conversation_group` (on the Room entity)
- Or member count: 2 members = direct, 3+ = group

**Group-specific fields** (on Room):

- `displayName` — group name
- `avatarUrl` — group avatar URL (mxc:// or https://), persisted server-side

### Actor / Member

Represents a participant in a conversation.

| Field         | Type           | Notes                                                   |
| ------------- | -------------- | ------------------------------------------------------- |
| `id`          | UUID           | Unique identifier                                       |
| `type`        | `ActorType`    | USER, VIRTUAL_CONTRIBUTOR, ORGANIZATION, SPACE, ACCOUNT |
| `profile`     | `Profile`      | Display name, avatar, URL                               |
| `credentials` | `[Credential]` | Optional                                                |

### MeConversationsResult (updated)

| Field           | Type               | Notes                                    |
| --------------- | ------------------ | ---------------------------------------- |
| `conversations` | `[Conversation!]!` | **NEW** — Flat list of all conversations |

**Removed fields:**

- `users: [Conversation!]!`
- `virtualContributors: [Conversation!]!`
- `virtualContributor(wellKnown:): Conversation`

### CreateConversationInput (updated)

| Field         | Type                        | Notes                                                                 |
| ------------- | --------------------------- | --------------------------------------------------------------------- |
| `memberIDs`   | `[UUID!]!`                  | **NEW** — For DIRECT: 1 ID. For GROUP: 1+ IDs. Creator auto-included. |
| `type`        | `ConversationCreationType!` | **NEW** — DIRECT or GROUP                                             |
| `displayName` | `String`                    | **NEW** — Optional, GROUP only                                        |
| `avatarUrl`   | `String`                    | **NEW** — Optional, GROUP only                                        |

**Removed fields:**

- `userID: UUID!`
- `virtualContributorID?: UUID`
- `wellKnownVirtualContributor?: VirtualContributorWellKnown`

### ConversationEventSubscriptionResult (updated)

| Event Type             | Payload                                | New?     |
| ---------------------- | -------------------------------------- | -------- |
| `CONVERSATION_CREATED` | `{ conversation, message }`            | Existing |
| `CONVERSATION_UPDATED` | `{ conversation }`                     | **NEW**  |
| `CONVERSATION_DELETED` | `{ conversationID }`                   | **NEW**  |
| `MEMBER_ADDED`         | `{ conversation, addedMember: Actor }` | **NEW**  |
| `MEMBER_REMOVED`       | `{ conversation, removedMemberID }`    | **NEW**  |
| `MESSAGE_RECEIVED`     | `{ roomId, message }`                  | Existing |
| `MESSAGE_REMOVED`      | `{ roomId, messageId }`                | Existing |
| `READ_RECEIPT_UPDATED` | `{ roomId, lastReadEventId }`          | Existing |

### New Mutations

All membership/property mutations return `Boolean!` (fire-and-forget). The mutation sends an RPC and returns `true` immediately. Actual state changes arrive via subscription events.

| Mutation                   | Input                                                                  | Returns    |
| -------------------------- | ---------------------------------------------------------------------- | ---------- |
| `assignConversationMember` | `AssignConversationMemberInput { conversationID, memberID }`           | `Boolean!` |
| `removeConversationMember` | `RemoveConversationMemberInput { conversationID, memberID }`           | `Boolean!` |
| `leaveConversation`        | `LeaveConversationInput { conversationID }`                            | `Boolean!` |
| `updateConversation`       | `UpdateConversationInput { conversationID, displayName?, avatarUrl? }` | `Boolean!` |

## Client-Side Models

### UserConversation (refactored)

```typescript
interface UserConversation {
  id: string;
  roomId: string;
  unreadCount: number;
  messagesCount: number;
  lastMessage?: ConversationMessage;
  // Unified display
  displayName: string;
  avatarUri?: string;
  url?: string;
  // Type
  isGroup: boolean;
  // Members
  members: ConversationMember[];
  otherMember?: ConversationMember; // Direct conversations only
}
```

### ConversationMember (new)

```typescript
interface ConversationMember {
  id: string;
  type: ActorType;
  displayName: string;
  avatarUri?: string;
  url?: string;
}
```

## State Transitions

### Conversation Lifecycle

```
[Not Exists] → createConversation(type: GROUP) → [Active]
[Active] → assignConversationMember → [Active] (member count increases, via MEMBER_ADDED event)
[Active] → removeConversationMember → [Active] (member count decreases, via MEMBER_REMOVED event)
[Active] → removeConversationMember (last member) → [Deleted] (via CONVERSATION_DELETED event)
[Active] → leaveConversation → [Active for others] / [Deleted if last] (via events)
[Active] → updateConversation → [Active] (name/avatar updated, via CONVERSATION_UPDATED event)
```

### Client Cache Transitions

```
Subscription: CONVERSATION_CREATED → Add to conversation list cache
Subscription: CONVERSATION_UPDATED → Update displayName/avatarUrl in conversation cache
Subscription: CONVERSATION_DELETED → Remove from conversation list cache; evict
Subscription: MEMBER_ADDED (self) → Add conversation to list
Subscription: MEMBER_ADDED (other) → Update members in conversation cache
Subscription: MEMBER_REMOVED (self) → Remove conversation from list
Subscription: MEMBER_REMOVED (other) → Update members in conversation cache
```
