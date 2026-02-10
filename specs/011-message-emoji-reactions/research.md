# Research: Message Emoji Reactions for User-to-User Messaging

**Date**: 2026-01-22  
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

## Research Summary

All technical questions resolved. The existing comment reactions implementation provides a complete reference for porting to user messaging.

---

## Decision 1: Reaction Component Reuse Strategy

**Question**: Can existing reaction components be reused as-is for user messaging?

**Decision**: Yes - Reuse `CommentReactions`, `ReactionView`, and `EmojiSelector` without modification.

**Rationale**:

- `CommentReactions` accepts a generic `reactions` array with `id`, `emoji`, and `sender` properties
- `ReactionView` displays individual emoji chips with counts and tooltips
- `EmojiSelector` is a standalone emoji picker unaware of message context
- All components operate on props, making them context-agnostic

**Alternatives Considered**:

- Creating duplicate components for user messaging → Rejected (DRY violation)
- Abstracting into shared library → Rejected (over-engineering for same codebase)

---

## Decision 2: Hook Reuse for Mutations

**Question**: Can `useCommentReactionsMutations` be reused for user messaging?

**Decision**: Yes - Reuse as-is. The hook accepts a `roomId` parameter which is available in user conversations.

**Rationale**:

- Hook wraps `useAddReactionMutation` and `useRemoveReactionMutation`
- Both mutations operate on `roomId`, which maps 1:1 with conversation rooms
- No comment-specific logic in the hook

**Evidence**: From `useCommentReactionsMutations.ts`:

```typescript
const handleAddReaction = ({ emoji, messageId }: { emoji: string; messageId: string }) => {
  const requiredRoomId = ensurePresence(roomId, 'roomId');
  return addReaction({ variables: { emoji, messageId, roomId: requiredRoomId } });
};
```

---

## Decision 3: GraphQL Query Extension

**Question**: What changes are needed to fetch reactions for user messages?

**Decision**: Add `reactions` field to `messages` in `UserConversations.graphql`.

**Rationale**:

- The `Message` type in GraphQL schema already includes `reactions: Array<Reaction>`
- The `Reaction` type contains `id`, `emoji`, `sender`, and `timestamp`
- Simply extending the query fragment will surface reaction data

**Required Query Change**:

```graphql
messages {
  id
  message
  timestamp
  sender { ... }
  reactions {  # ADD THIS
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

---

## Decision 4: Real-Time Update Mechanism

**Question**: How will reactions sync in real-time for other participants?

**Decision**: Use existing `useSubscribeOnRoomEvents` subscription hook.

**Rationale**:

- `roomEvents` GraphQL subscription already includes reaction events (`reaction { type, messageID, data }`)
- `useSubscribeOnRoomEvents` hook handles cache updates for reaction create/delete
- Same pattern used by comments, discussions, calendar events
- Provides instant updates (< 1s) vs polling (5s delay)

**Evidence** (from `useSubscribeOnRoomEvents.ts`):

```typescript
if (reaction) {
  const { messageID, data, type } = reaction;
  switch (type) {
    case MutationType.Create:
      // Adds reaction to message's reactions array in cache
      client.cache.modify({ id: messageRefId, fields: { reactions(...) } });
      break;
    case MutationType.Delete:
      // Removes reaction from cache
      break;
  }
}
```

**Integration**:

```typescript
// In UserMessagingConversationView.tsx
import useSubscribeOnRoomEvents from '@/domain/collaboration/callout/useSubscribeOnRoomEvents';

// Call when conversation is selected
useSubscribeOnRoomEvents(conversation?.roomId);
```

**Alternatives Considered**:

- Polling (5s interval) → Rejected for reactions (too slow for expected UX; kept as fallback)
- Custom subscription → Rejected (existing hook covers reaction events)

---

## Decision 5: Permission Model

**Question**: How should `canAddReaction` be determined for user messages?

**Decision**: Default to `true` for all users with access to the conversation.

**Rationale**:

- If a user can read/send messages in a conversation, they should be able to react
- No separate permission exists for reactions in user messaging context
- Mirrors comment reactions where presence in room grants reaction rights

**Edge Case Handling**:

- Deleted messages: `canAddReaction` = `false` (check message state)
- User no longer in conversation: Query won't return conversation (natural gate)

---

## Decision 6: UI Placement

**Question**: Where should reactions display in the chat bubble layout?

**Decision**: Below the message bubble, aligned with the bubble's edge (left for received, right for sent).

**Rationale**:

- Matches common messaging app patterns (Slack, Discord, WhatsApp)
- Keeps reactions associated with their message without cluttering content
- The add reaction trigger appears on hover (same as comment messages)

**Visual Reference** (from `MessageView.tsx` pattern):

```tsx
<MessageActionsContainer>
  <CommentReactions
    reactions={message.reactions}
    canAddReaction={canAddReaction}
    onAddReaction={handleAddReaction}
    onRemoveReaction={handleRemoveReaction}
  />
</MessageActionsContainer>
```

---

## Unresolved Questions

None. All technical decisions resolved.
