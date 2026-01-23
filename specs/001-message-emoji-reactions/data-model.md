# Data Model: Message Emoji Reactions for User-to-User Messaging

**Date**: 2026-01-22  
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Overview

This feature extends the existing user messaging data model to include reaction data. No new entities are created; existing GraphQL types are leveraged.

---

## Entities

### 1. UserConversationMessage (Extended)

**Location**: `src/main/userMessaging/useUserConversations.ts`

**Current Definition**:

```typescript
export interface UserConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: {
    id: string;
    displayName: string;
    avatarUri?: string;
  };
}
```

**Extended Definition**:

```typescript
export interface UserConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: {
    id: string;
    displayName: string;
    avatarUri?: string;
  };
  reactions: MessageReaction[]; // NEW FIELD
}

// NEW TYPE (aligns with CommentReactionsReaction)
export interface MessageReaction {
  id: string;
  emoji: string;
  sender?: {
    id: string;
    profile: {
      displayName: string;
    };
  };
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✓ | Unique reaction identifier |
| emoji | string | ✓ | Emoji character (e.g., "👍", "❤️") |
| sender | object | ✗ | User who added reaction; may be null if user deleted |
| sender.id | string | ✓ | User's unique identifier |
| sender.profile.displayName | string | ✓ | Display name for tooltips |

**Validation Rules**:

- `emoji` must be a valid emoji character (enforced by GraphQL Emoji scalar)
- `id` must be unique per message (enforced by backend)

---

### 2. Reaction (GraphQL Schema - Existing)

**Location**: `src/core/apollo/generated/graphql-schema.ts`

**Definition** (read-only, generated):

```typescript
export type Reaction = {
  __typename?: 'Reaction';
  emoji: Scalars['Emoji']['output'];
  id: Scalars['MessageID']['output'];
  sender?: Maybe<User>;
  timestamp: Scalars['Float']['output'];
};
```

**Note**: This is the backend type returned by GraphQL. Frontend types transform this for UI consumption.

---

## Relationships

```
UserConversation (1) ──────────────────────────▶ (N) UserConversationMessage
                                                         │
                                                         │ (1:N)
                                                         ▼
                                                    MessageReaction
                                                         │
                                                         │ (N:1)
                                                         ▼
                                                       User (sender)
```

- One conversation has many messages
- One message can have many reactions
- Each reaction is linked to one sender (user)
- Multiple users can react with the same emoji (aggregated for display)

---

## State Transitions

Reactions have two states:

```
[Not Exists] ──(addReaction)──▶ [Exists] ──(removeReaction)──▶ [Not Exists]
```

**State: Not Exists**

- No reaction record for this user + message + emoji combination
- User can add a reaction

**State: Exists**

- Reaction record exists
- Same user clicking same emoji triggers removal
- Different user clicking same emoji creates new reaction (count increments)

---

## Aggregation Logic

Reactions are aggregated by emoji for display (handled by `CommentReactions` component):

**Input** (from API):

```typescript
[
  { id: 'r1', emoji: '👍', sender: { id: 'u1', profile: { displayName: 'Alice' } } },
  { id: 'r2', emoji: '👍', sender: { id: 'u2', profile: { displayName: 'Bob' } } },
  { id: 'r3', emoji: '❤️', sender: { id: 'u1', profile: { displayName: 'Alice' } } },
];
```

**Output** (aggregated for display):

```typescript
[
  { emoji: '👍', count: 2, senders: ['Alice', 'Bob'], ownReactionId: 'r1' }, // if current user is Alice
  { emoji: '❤️', count: 1, senders: ['Alice'], ownReactionId: 'r3' },
];
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Action                                  │
│                    (Click emoji to add)                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    useCommentReactionsMutations                      │
│                         addReaction()                                │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GraphQL Mutation                                 │
│                addReactionToMessageInRoom                            │
│           (roomId, messageId, emoji) → Reaction                      │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Apollo Cache Update                             │
│                 (polling refreshes conversation)                     │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       UI Re-render                                   │
│               CommentReactions displays updated state                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Cache Considerations

- **Optimistic Updates**: Not implemented initially; rely on polling for consistency
- **Cache Normalization**: Reactions are nested in messages; updates require parent refetch
- **Stale Data**: 5s polling interval means reactions may be stale up to 5s for other users
