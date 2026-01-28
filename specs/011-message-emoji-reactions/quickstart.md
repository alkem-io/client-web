# Quickstart: Message Emoji Reactions for User-to-User Messaging

**Date**: 2026-01-22  
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Overview

This guide provides step-by-step implementation instructions for adding emoji reactions to user-to-user messaging.

---

## Prerequisites

- [ ] Backend Alkemio server running at `http://localhost:3000`
- [ ] Node 20+ and pnpm 10+ installed
- [ ] Repository cloned and dependencies installed (`pnpm install`)

---

## Implementation Steps

### Step 1: Update GraphQL Query

**File**: `src/main/userMessaging/graphql/UserConversations.graphql`

Add `reactions` field to the `messages` query:

```graphql
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
  reactions {           # ADD THIS BLOCK
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
```

### Step 2: Regenerate Types

Run codegen to generate updated TypeScript types:

```bash
pnpm codegen
```

Verify no errors. Commit generated files.

### Step 3: Update Message Type

**File**: `src/main/userMessaging/useUserConversations.ts`

Update the `UserConversationMessage` interface:

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
  reactions: {
    // ADD THIS
    id: string;
    emoji: string;
    sender?: {
      id: string;
      profile: { displayName: string };
    };
  }[];
}
```

Update the message mapping in `useMemo`:

```typescript
const messages: UserConversationMessage[] = (conv.room?.messages ?? []).map(msg => ({
  id: msg.id,
  message: msg.message,
  timestamp: msg.timestamp,
  sender:
    msg.sender?.__typename === 'User'
      ? {
          /* existing */
        }
      : undefined,
  reactions: msg.reactions ?? [], // ADD THIS
}));
```

### Step 4: Add Reactions to MessageBubble

**File**: `src/main/userMessaging/UserMessagingConversationView.tsx`

Import required components:

```typescript
import CommentReactions from '@/domain/communication/room/Comments/CommentReactions';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
```

Update `MessageBubble` props to include reactions:

```typescript
interface MessageBubbleProps {
  message: UserConversationMessage;
  isOwnMessage: boolean;
  canAddReaction: boolean;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
}
```

Add reactions display below the message bubble:

```tsx
const MessageBubble = ({ message, isOwnMessage, canAddReaction, onAddReaction, onRemoveReaction }) => {
  // ... existing code ...

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={isOwnMessage ? 'flex-end' : 'flex-start'}
      marginY={gutters(0.5)}
    >
      <Box
        display="flex"
        flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
        alignItems="flex-start"
        gap={gutters(0.5)}
      >
        {/* ... existing avatar and bubble code ... */}
      </Box>

      {/* Add reactions display */}
      {(message.reactions.length > 0 || canAddReaction) && (
        <Box marginLeft={isOwnMessage ? 0 : gutters(4)} marginRight={isOwnMessage ? gutters(0.5) : 0}>
          <CommentReactions
            reactions={message.reactions}
            canAddReaction={canAddReaction}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
          />
        </Box>
      )}
    </Box>
  );
};
```

### Step 5: Wire Up Mutations and Subscription

**File**: `src/main/userMessaging/UserMessagingConversationView.tsx`

Import required hooks:

```typescript
import CommentReactions from '@/domain/communication/room/Comments/CommentReactions';
import useCommentReactionsMutations from '@/domain/communication/room/Comments/useCommentReactionsMutations';
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';
```

Use the hooks in `UserMessagingConversationView`:

```typescript
export const UserMessagingConversationView = ({ conversation, /* ... */ }: Props) => {
  // ... existing code ...

  // Subscribe to room events for real-time reaction updates
  useSubscribeOnRoomEvents(conversation?.roomId);

  // Mutation hooks for adding/removing reactions
  const { addReaction, removeReaction } = useCommentReactionsMutations(conversation?.roomId);

  const handleAddReaction = (messageId: string) => (emoji: string) => {
    addReaction({ emoji, messageId });
  };

  const handleRemoveReaction = (messageId: string) => (reactionId: string) => {
    removeReaction(reactionId);
  };

  // In render:
  <MessageBubble
    key={message.id}
    message={message}
    isOwnMessage={message.sender?.id === userModel?.id}
    canAddReaction={true}
    onAddReaction={handleAddReaction(message.id)}
    onRemoveReaction={handleRemoveReaction(message.id)}
  />
};
```

---

## Verification Checklist

- [ ] Query returns reactions with emoji and sender info
- [ ] Reactions display below messages
- [ ] Clicking add reaction opens emoji picker
- [ ] Selecting emoji adds reaction to message
- [ ] Clicking own reaction chip removes it
- [ ] Reaction count updates after add/remove
- [ ] Tooltip shows sender names on hover
- [ ] Keyboard navigation works for emoji picker
- [ ] Visual styling matches comment reactions
- [ ] **Real-time**: Other user's reactions appear instantly via subscription
- [ ] Subscription reconnects after network interruption

---

## Testing Commands

```bash
# Type check
pnpm lint

# Unit tests
pnpm vitest run --reporter=basic

# Dev server (requires backend)
pnpm start
```

---

## Troubleshooting

| Issue                   | Solution                                                     |
| ----------------------- | ------------------------------------------------------------ |
| Codegen fails           | Ensure backend is running at localhost:3000                  |
| Reactions not appearing | Check Network tab for query response; verify reactions field |
| Mutations fail          | Verify roomId is passed correctly; check console for errors  |
| Styling mismatch        | Compare with CommentReactions in callout comments            |
