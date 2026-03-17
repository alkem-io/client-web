# Quickstart: Fix Group Chat Badge Counts & Member Event Handling

**Branch**: `024-fix-group-chat-badges`

## Prerequisites

- Node >= 22.0.0, pnpm >= 10.17.1
- Running Alkemio backend at `localhost:3000` (for dev) and `localhost:4000/graphql` (for codegen)
- Two or more test user accounts

## Files to Change

### 1. New file: `src/main/userMessaging/graphql/ConversationDetails.graphql`
- Copy from `specs/024-fix-group-chat-badges/contracts/ConversationDetails.graphql`
- Run `pnpm codegen` to generate hooks

### 2. Modify: `src/main/userMessaging/useConversationEventsSubscription.ts`
- **Remove**: `effectiveUnreadCount` logic in `handleConversationCreated` (lines ~102-107) — use `room.unreadCount` directly
- **Remove**: `RoomType` import if no longer used
- **Modify**: `handleMemberAdded` — add self-detection branch that:
  1. Checks `event.addedMember.id === currentUserId`
  2. Calls `client.query()` with `ConversationDetailsDocument` + `fetchPolicy: 'network-only'`
  3. Writes result to both `UserConversationsQuery` and `UserConversationsUnreadCountQuery` caches
  4. Falls through to existing member-list update for non-self events
- No changes needed to `handleMemberRemoved` — self-removal already works correctly

### 3. Regenerate: `src/core/apollo/generated/*`
- Run `pnpm codegen` after adding the new `.graphql` file

## Testing

### Manual test: Added to group with messages
1. User A creates a group chat with User B, sends 3 messages
2. User A adds User C to the group
3. **Verify**: User C sees the group in their list with unread badge
4. **Verify**: Nav bar badge increments
5. User C opens the group, reads messages
6. **Verify**: Unread count drops to 0, badge decrements

### Manual test: Added to empty group
1. User A creates a group chat with User C (no messages)
2. **Verify**: User C sees the group with 0 unread, no badge increment

### Manual test: Removed from group
1. User C is in a group with 2 unread messages (badge shows)
2. User A removes User C
3. **Verify**: Group disappears from User C's list, badge decrements

### Manual test: Someone else added/removed
1. User A is in a group, User B adds User C
2. **Verify**: User A sees User C in member list, badge unchanged

## Commands

```bash
pnpm install
pnpm codegen          # After adding new .graphql file
pnpm lint             # Verify no lint errors
pnpm vitest run       # Run tests
pnpm start            # Dev server for manual testing
```
