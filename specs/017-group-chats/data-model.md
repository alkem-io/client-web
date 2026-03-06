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
| `room`        | `Room`      | Contains messages, unread count, etc. (unchanged)                   |
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

**Group-specific fields** (on Room or Conversation, TBD from codegen):

- `displayName` — group name
- `visual` — group avatar

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

| Field       | Type                        | Notes                                                                 |
| ----------- | --------------------------- | --------------------------------------------------------------------- |
| `memberIDs` | `[UUID!]!`                  | **NEW** — For DIRECT: 1 ID. For GROUP: 1+ IDs. Creator auto-included. |
| `type`      | `ConversationCreationType!` | **NEW** — DIRECT or GROUP                                             |

**Removed fields:**

- `userID: UUID!`
- `virtualContributorID?: UUID`
- `wellKnownVirtualContributor?: VirtualContributorWellKnown`

### ConversationEventSubscriptionResult (updated)

| Event Type             | Payload                                | New?     |
| ---------------------- | -------------------------------------- | -------- |
| `CONVERSATION_CREATED` | `{ conversation, message }`            | Existing |
| `CONVERSATION_DELETED` | `{ conversationID }`                   | **NEW**  |
| `MEMBER_ADDED`         | `{ conversation, addedMember: Actor }` | **NEW**  |
| `MEMBER_REMOVED`       | `{ conversation, removedMemberID }`    | **NEW**  |
| `MESSAGE_RECEIVED`     | `{ roomId, message }`                  | Existing |
| `MESSAGE_REMOVED`      | `{ roomId, messageId }`                | Existing |
| `READ_RECEIPT_UPDATED` | `{ roomId, lastReadEventId }`          | Existing |

### New Mutations

| Mutation                   | Input                                                        | Returns                                          |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `addConversationMember`    | `AddConversationMemberInput { conversationID, memberID }`    | `Conversation!`                                  |
| `removeConversationMember` | `RemoveConversationMemberInput { conversationID, memberID }` | `Conversation` (nullable — null if auto-deleted) |
| `leaveConversation`        | `LeaveConversationInput { conversationID }`                  | `Conversation` (nullable — null if auto-deleted) |

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
[Active] → addConversationMember → [Active] (member count increases)
[Active] → removeConversationMember → [Active] (member count decreases)
[Active] → removeConversationMember (last member) → [Deleted] (returns null)
[Active] → leaveConversation → [Active for others] / [Deleted if last]
```

### Client Cache Transitions

```
Subscription: CONVERSATION_CREATED → Add to conversation list cache
Subscription: CONVERSATION_DELETED → Remove from conversation list cache; evict
Subscription: MEMBER_ADDED (self) → Add conversation to list
Subscription: MEMBER_ADDED (other) → Update members in conversation cache
Subscription: MEMBER_REMOVED (self) → Remove conversation from list
Subscription: MEMBER_REMOVED (other) → Update members in conversation cache
```
