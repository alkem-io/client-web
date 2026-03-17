# Research: Group Chats

**Feature**: 017-group-chats
**Date**: 2026-03-06

## 1. Current Conversation Architecture

### Decision: The messaging system lives in `src/main/userMessaging/`

**Current structure:**

| File                                   | Purpose                                                         |
| -------------------------------------- | --------------------------------------------------------------- |
| `UserMessagingDialog.tsx`              | Main dialog (split-view desktop, full-screen mobile)            |
| `UserMessagingChatList.tsx`            | Conversation list with search, badges, last message preview     |
| `UserMessagingConversationView.tsx`    | Chat view with messages, input, reactions                       |
| `NewMessageDialog.tsx`                 | New conversation dialog (single user search + create)           |
| `UserMessagingButton.tsx`              | Nav bar icon button with unread badge                           |
| `UserMessagingContext.tsx`             | Global context: open/close, selected conversation, unread count |
| `useUserConversations.ts`              | Hook: fetches + maps conversations to `UserConversation[]`      |
| `useConversationMessages.ts`           | Hook: fetches messages for a conversation                       |
| `useConversationEventsSubscription.ts` | Subscription handler for real-time events                       |
| `useUnreadConversationsCount.ts`       | Lightweight unread count query                                  |
| `models.ts`                            | Shared types: `MessageSender`, `ConversationMessage`, mappers   |

**GraphQL documents in `src/main/userMessaging/graphql/`:**

| File                                   | Type         | Key fields affected by API changes                                    |
| -------------------------------------- | ------------ | --------------------------------------------------------------------- |
| `UserConversations.graphql`            | Query        | Uses `me.conversations.users[].user`, `me.conversations.users[].room` |
| `CreateConversation.graphql`           | Mutation     | Uses `CreateConversationInput { userID }`                             |
| `ConversationEvents.graphql`           | Subscription | Uses `conversation.user` in `conversationCreated`                     |
| `ConversationMessages.graphql`         | Query        | No breaking changes (uses `room.messages`)                            |
| `MarkMessageAsRead.graphql`            | Mutation     | No breaking changes                                                   |
| `UserConversationsUnreadCount.graphql` | Query        | Likely uses `me.conversations.users`                                  |

**Chat widget (guidance VC):**

| File                                                           | Impact                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/main/guidance/chatWidget/ChatWidgetQueries.graphql`       | Uses `me.conversations.virtualContributor(wellKnown: CHAT_GUIDANCE)` — REMOVED |
| `src/main/guidance/chatWidget/useChatGuidanceCommunication.ts` | Accesses `data.me.conversations.conversationGuidanceVc`                        |

### Rationale

Understanding every file that touches the current conversation model is essential before making API adaptation changes. Every file listed above needs modification.

### Alternatives Considered

N/A — this is a factual mapping, not a decision.

---

## 2. API Adaptation Strategy

### Decision: Adapt all GraphQL documents and hooks to the new unified API in one pass

The server is running locally with the new API. Running `pnpm codegen` will regenerate types but cause TypeScript errors in all files that reference removed fields. The strategy is:

1. **Run codegen** to regenerate types from the new server schema.
2. **Fix GraphQL documents** — update all `.graphql` files to match the new schema.
3. **Re-run codegen** to regenerate clean types.
4. **Fix TypeScript files** — update hooks, mappers, and components that consume the changed types.

**Specific migrations:**

| Old API                                           | New API                                                      | Files affected                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `me.conversations.users`                          | `me.conversations.conversations`                             | `UserConversations.graphql`, `useUserConversations.ts`, `useConversationEventsSubscription.ts` |
| `me.conversations.virtualContributors`            | Filter from `conversations` by member type                   | (was not used in userMessaging)                                                                |
| `me.conversations.virtualContributor(wellKnown:)` | Filter from `conversations` by member matching well-known VC | `ChatWidgetQueries.graphql`, `useChatGuidanceCommunication.ts`                                 |
| `conversation.type` (USER_USER/USER_VC)           | Inspect `conversation.members[].type`                        | `useUserConversations.ts`                                                                      |
| `conversation.user`                               | `conversation.members` (filter out self)                     | `UserConversations.graphql`, `ConversationEvents.graphql`, all UI components                   |
| `conversation.virtualContributor`                 | `conversation.members` (find VC type)                        | Chat widget                                                                                    |
| `CreateConversationInput { userID }`              | `CreateConversationInput { memberIDs, type: DIRECT }`        | `CreateConversation.graphql`, `NewMessageDialog.tsx`                                           |

### Rationale

Doing the adaptation in one pass avoids an intermediate broken state. Since the server is running locally, we can iterate on codegen until all documents are correct.

### Alternatives Considered

- **Two-phase approach** (adapt first, add group features second): Rejected because the user explicitly said the server changes are running locally and both should happen together.

---

## 3. Conversation Model Refactoring

### Decision: Extend `UserConversation` interface to support both direct and group conversations

**Current model:**

```typescript
interface UserConversation {
  id: string;
  roomId: string;
  unreadCount: number;
  messagesCount: number;
  lastMessage?: ConversationMessage;
  user: { id; displayName; avatarUri?; url? };
}
```

**New model:**

```typescript
interface UserConversation {
  id: string;
  roomId: string;
  unreadCount: number;
  messagesCount: number;
  lastMessage?: ConversationMessage;
  // Unified display fields (work for both direct and group)
  displayName: string;
  avatarUri?: string;
  url?: string; // Profile URL for direct conversations (null for groups)
  // Type discrimination
  isGroup: boolean;
  // Group-specific
  members?: ConversationMember[];
  // Direct-specific (the "other" participant)
  otherMember?: ConversationMember;
}

interface ConversationMember {
  id: string;
  type: ActorType;
  displayName: string;
  avatarUri?: string;
}
```

### Rationale

- `displayName` + `avatarUri` at the top level provide a single interface for the chat list to render both conversation types without branching.
- `isGroup` allows conditional rendering (group management UI, member list, etc.).
- `otherMember` preserves the direct-conversation pattern (profile link, VC detection).
- `members` is populated for group conversations for the management dialog.

### Alternatives Considered

- **Discriminated union** (`type DirectConversation | GroupConversation`): More type-safe but forces every consumer to handle both variants with switch/if, adding boilerplate. The simpler flat model with `isGroup` flag is sufficient and keeps rendering code cleaner.

---

## 4. Subscription Event Handling Extension

### Decision: Extend the existing subscription handler to process new event types

The current `useConversationEventsSubscription` handles 4 events: `CONVERSATION_CREATED`, `MESSAGE_RECEIVED`, `MESSAGE_REMOVED`, `READ_RECEIPT_UPDATED`.

The new API adds 3 more events: `CONVERSATION_DELETED`, `MEMBER_ADDED`, `MEMBER_REMOVED`.

**Handlers needed:**

| Event                  | Cache action                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `CONVERSATION_DELETED` | Remove conversation from `UserConversationsQuery` cache; evict from cache                        |
| `MEMBER_ADDED`         | Update `members` array in conversation cache; if self was added, add conversation to list        |
| `MEMBER_REMOVED`       | Update `members` array in conversation cache; if self was removed, remove conversation from list |

### Rationale

Extending the existing handler keeps the subscription management centralized. The pattern (switch on event type, update Apollo cache) is already established.

### Alternatives Considered

- **Separate subscription for group events**: Would complicate lifecycle management and duplicate the subscription setup logic.

---

## 5. Group Management Dialog Design

### Decision: Create a single combined dialog for group creation and group management

Based on the Figma screenshot, the dialog shows:

1. Group avatar (editable)
2. Group name (editable text field)
3. "Add members" action
4. Member list with "Remove" actions

This same dialog layout serves **both** group creation (initial flow) **and** group management (from three-dots menu). The only differences:

- **Creation mode**: "Start group convo" button, no existing members
- **Management mode**: Members pre-populated, changes applied immediately

### Rationale

Reusing the same dialog for creation and management reduces component count and provides a consistent UX. The Figma design shows the same layout for both use cases.

### Alternatives Considered

- **Separate creation wizard and management dialog**: More screens to build and maintain. The unified dialog is simpler.

---

## 6. User Search for Member Selection

### Decision: Reuse `useContributors` hook with multi-select Autocomplete

The existing `NewMessageDialog` uses `useContributors` with single-select `Autocomplete`. For group chats, we need multi-select. MUI's `Autocomplete` supports `multiple` prop natively.

**Reuse path:**

- `useContributors` hook from `src/domain/community/inviteContributors/` — already supports platform-wide user search with pagination
- MUI `Autocomplete` with `multiple={true}` for member chips
- Filter out current user and already-selected/existing members

### Rationale

Proven patterns already exist in the codebase. No need to build custom search infrastructure.

### Alternatives Considered

- **Custom search component**: Unnecessary given MUI Autocomplete capabilities.

---

## 7. Avatar Upload for Group Chats

### Decision: Reuse `VisualUpload` component from `src/core/ui/upload/VisualUpload/`

The existing `VisualUpload` component supports:

- File selection
- Image cropping dialog
- Upload via `uploadImageOnVisual` mutation
- Error/success feedback

For group chats, the server needs to expose a `visual` on the group conversation entity for the avatar upload to target.

### Rationale

The component is already production-proven across user profiles, VC avatars, and other upload scenarios.

### Alternatives Considered

- **Simple file input without crop**: Cropping is a nice UX for avatars and the component already exists.

---

## 8. Chat Widget (Guidance VC) Migration

### Decision: Migrate `ConversationWithGuidanceVc` query to filter from flat conversations list

**Old:**

```graphql
me.conversations.virtualContributor(wellKnown: CHAT_GUIDANCE) { ... }
```

**New approach:** Query all conversations, then filter client-side for the conversation where a member matches the well-known CHAT_GUIDANCE VC. This may require knowing the well-known VC's actor ID, or the server may provide a dedicated query/field.

**Alternative:** If the server provides a `wellKnownVirtualContributor` lookup on the new `conversations` field, use that. This needs to be checked during codegen.

### Rationale

The old query path is removed. The simplest replacement depends on what the new server schema exposes. If no dedicated lookup exists, client-side filtering is the fallback.

### Alternatives Considered

- **Separate query for VC conversations**: Would add a new API endpoint; better to adapt to the unified model.
