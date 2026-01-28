# GraphQL Contract Updates: Message Emoji Reactions

**Date**: 2026-01-22  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)

## Overview

This document specifies the GraphQL query changes required to support emoji reactions in user messaging. No new mutations are needed as existing mutations suffice.

---

## Query Changes

### UserConversations.graphql

**File**: `src/main/userMessaging/graphql/UserConversations.graphql`

**Current**:

```graphql
query UserConversations {
  me {
    conversations {
      users {
        id
        room {
          id
          messages {
            id
            message
            timestamp
            sender {
              ... on User {
                id
                profile {
                  id
                  displayName
                  avatar: visual(type: AVATAR) {
                    id
                    uri
                  }
                }
              }
            }
          }
          messagesCount
        }
        user {
          id
          profile {
            id
            displayName
            avatar: visual(type: AVATAR) {
              id
              uri
            }
            url
          }
        }
      }
    }
  }
}
```

**Updated** (add `reactions` field):

```graphql
query UserConversations {
  me {
    conversations {
      users {
        id
        room {
          id
          messages {
            id
            message
            timestamp
            sender {
              ... on User {
                id
                profile {
                  id
                  displayName
                  avatar: visual(type: AVATAR) {
                    id
                    uri
                  }
                }
              }
            }
            reactions {
              # NEW FIELD
              id
              emoji
              sender {
                id
                profile {
                  id
                  displayName
                }
              }
            }
          }
          messagesCount
        }
        user {
          id
          profile {
            id
            displayName
            avatar: visual(type: AVATAR) {
              id
              uri
            }
            url
          }
        }
      }
    }
  }
}
```

---

## Existing Mutations (Reused)

### AddReaction

**File**: `src/domain/communication/room/Comments/AddReactionMutation.graphql`

```graphql
mutation AddReaction($roomId: UUID!, $messageId: MessageID!, $emoji: Emoji!) {
  addReactionToMessageInRoom(reactionData: { emoji: $emoji, messageID: $messageId, roomID: $roomId }) {
    id
    emoji
    sender {
      id
      firstName
      lastName
    }
  }
}
```

**Usage**: Called with `roomId` from `UserConversation.roomId`, `messageId` from message, `emoji` from picker.

---

### RemoveReaction

**File**: `src/domain/communication/room/Comments/RemoveReactionMutation.graphql`

```graphql
mutation RemoveReaction($roomId: UUID!, $reactionId: MessageID!) {
  removeReactionToMessageInRoom(reactionData: { reactionID: $reactionId, roomID: $roomId })
}
```

**Usage**: Called with `roomId` from `UserConversation.roomId`, `reactionId` from user's own reaction.

---

## Existing Subscription (Reused)

### roomEvents

**File**: `src/domain/communication/room/graphql/roomSubscriptions.graphql`

```graphql
subscription roomEvents($roomID: UUID!) {
  roomEvents(roomID: $roomID) {
    roomID
    room {
      vcInteractions {
        ...VcInteractionsDetails
      }
    }
    message {
      type
      data {
        ...MessageDetails
      }
    }
    reaction {
      type
      messageID
      data {
        ...ReactionDetails
      }
    }
  }
}
```

**Hook**: `useSubscribeOnRoomEvents` from `src/domain/collaboration/callout/useSubscribeOnRoomEvents.ts`

**Usage**:

```typescript
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';

// In UserMessagingConversationView
useSubscribeOnRoomEvents(conversation?.roomId);
```

**Cache Updates** (handled automatically by hook):

- `MutationType.Create`: Adds new reaction to message's `reactions` array
- `MutationType.Delete`: Removes reaction from cache

---

## Type Mapping

After running `pnpm codegen`, the following types will be updated:

| GraphQL Type             | Generated TypeScript           | Usage                 |
| ------------------------ | ------------------------------ | --------------------- |
| `Reaction`               | `Reaction`                     | Backend response type |
| `UserConversationsQuery` | Updated to include `reactions` | Query result          |

**Transformer** (`useUserConversations.ts`):

```typescript
// Map GraphQL reaction to UI-friendly format
const mapReaction = (r: Reaction): MessageReaction => ({
  id: r.id,
  emoji: r.emoji,
  sender: r.sender
    ? {
        id: r.sender.id,
        profile: {
          displayName: r.sender.profile?.displayName ?? '',
        },
      }
    : undefined,
});
```

---

## Contract Validation

| Aspect                     | Status | Notes                                                          |
| -------------------------- | ------ | -------------------------------------------------------------- |
| Schema compatibility       | ✅     | `reactions` field exists on `Message` type                     |
| Mutation compatibility     | ✅     | `addReactionToMessageInRoom` accepts `roomId`                  |
| Subscription compatibility | ✅     | `roomEvents` includes `reaction` events with `ReactionDetails` |
| Type safety                | ✅     | Generated types via codegen                                    |
| Backwards compatibility    | ✅     | Adding field only; no breaking changes                         |
