# Phase 1 Data Model: Unified Chat

This feature introduces **no GraphQL/schema changes**. The "data model" here is the set of **plain-TypeScript view models** (CRD prop types) and the **mapping rules** from existing generated GraphQL types to those props. Per Constitution III and the CRD migration guide, generated GraphQL types never cross into `src/crd`; the mappers in `src/main/crdPages/unifiedChat/dataMapper.ts` are the only seam.

## View models (CRD prop types — `src/crd/components/chat/types.ts`)

### ChatListItem
A row in the unified conversation list.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Conversation id |
| `displayName` | `string` | 1:1 → other member name; group → server name or joined member names |
| `avatarUrl` | `string?` | 1:1 → other member avatar; group → composite (see `memberAvatars`) |
| `isGroup` | `boolean` | Room type is conversation-group |
| `isGuidance` | `boolean` | Guidance AI conversation (pinned, AI-styled) |
| `memberAvatars` | `{ id; name; avatarUrl? }[]?` | For `GroupAvatar` composite |
| `lastMessagePreview` | `string?` | Trimmed last message text |
| `lastMessageTimestamp` | `string?` | Relative/display timestamp |
| `unreadCount` | `number` | >0 contributes one to the combined badge |
| `pinned` | `boolean?` | True for guidance; sorts first when search is empty |

**Validation / rules**:
- Exactly one item may have `isGuidance === true` (when guidance is enabled).
- `pinned` items sort before all others **only while search is empty**; during an active search the item is filtered by `displayName` like any other (spec FR-010, clarification 2026-06-12).

### ChatMessage
One message in a thread (shape compatible with the comment system's `CommentData`).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Message id; synthetic guidance intro uses a sentinel (`__intro`) |
| `author` | `CommentAuthor?` | undefined for system/synthetic; see below |
| `content` | `string` | Markdown body rendered via `MarkdownContent` |
| `timestamp` | `string` | Display timestamp (date-fns) |
| `timestampMs` | `number` | Sort key; intro = `0` (sorts first) |
| `reactions` | `CommentReaction[]` | Reuse comment reaction shape |
| `isOwn` | `boolean` | Author id === current user id → right-aligned bubble |
| `isPending` | `boolean?` | Optimistic send, not yet confirmed |

**Rules**:
- The synthetic guidance **intro** message (`id: '__intro'`, `timestampMs: 0`, `author`: guidance VC) is injected only when the selected conversation is guidance and is shown when there is no real history. It is never sent, never marked read, never counted toward unread (spec FR-026, FR-034).
- `isOwn` is derived in the mapper from `currentUser.id`; CRD never computes identity from GraphQL.

### CommentAuthor (reused — `src/crd/components/comment/types.ts`)
`{ id; name; avatarUrl?; profileUrl?; isVirtualContributor? }`
- `isVirtualContributor` is set from `member.type === ActorType.VirtualContributor` (schema discriminator — **never `__typename`**, per Constitution III / CLAUDE.md).

### GroupMember
A member shown in `GroupSettingsDialog` / used by `GroupAvatar`.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Contributor id |
| `name` | `string` | Display name |
| `avatarUrl` | `string?` | |
| `isCurrentUser` | `boolean?` | Drives "you cannot remove yourself" affordance |

### ChatThreadHeader
Header model passed to `ChatThreadView`.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Conversation id |
| `displayName` | `string` | |
| `avatarUrl` | `string?` | |
| `isGroup` | `boolean` | |
| `isGuidance` | `boolean` | Toggles BETA/info + clear action; hides group menu |
| `memberCount` | `number?` | |
| `members` | `GroupMember[]?` | For composite avatar + settings |
| `canManage` | `boolean?` | Whether the user may open group settings |

### Recipient (reuse `ShareUser` — `src/crd/forms/UserSelector.tsx`)
`{ id; name; avatarUrl?; ...location fields }` — reused as-is for `NewChatDialog` and add-member in `GroupSettingsDialog`.

## Mapping rules (`dataMapper.ts` — GraphQL → view models)

| Mapper | Input (generated GraphQL) | Output | Key logic |
|---|---|---|---|
| `mapConversationToListItem` | `UserConversations` conversation + `{ guidanceVcId, currentUserId }` | `ChatListItem` | sets `isGroup`, `isGuidance` (predicate D2), `pinned = isGuidance`, name/avatar per 1:1-vs-group rules (ported from `useUserConversations`) |
| `mapMessageToChatMessage` | `ConversationMessage` (`models.ts`) + `currentUserId` | `ChatMessage` | `isOwn`, reactions via `mapMessageReactions`, sender via `mapMessageSender`, `timestampMs` |
| `mapMemberToCommentAuthor` | conversation member | `CommentAuthor` | `isVirtualContributor` from `ActorType.VirtualContributor` |
| `mapMembersToGroupMembers` | conversation members + `currentUserId` | `GroupMember[]` | sets `isCurrentUser` |
| `injectGuidanceIntro` | mapped messages + guidance VC author + intro text | `ChatMessage[]` | **always** prepends the synthetic intro (intro-only when history is empty); never sent/read/counted |

**Guidance identity predicate** (`isGuidanceConversation`, applied by `useUnifiedConversations` before `mapConversationToListItem`): a conversation is guidance **iff** `members.some(m => m.id === guidanceVcId) && members.length <= 2`. The `<= 2` bound excludes a 3+ member group that merely includes the VC — that stays a normal group, not the pinned guidance item. `pinned` is set equal to `isGuidance`.

## Derived state / sort

- **List order** (in `useUnifiedConversations`): `pinned` (guidance) first → then `newlyCreatedConversationId` → then by most-recent activity (`lastMessage.timestamp ?? createdDate`). Ported from `useUserConversations` sort with the pinned rule added.
- **Combined unread** (`totalUnreadCount`): `conversations.filter(c => c.unreadCount > 0).length` (guidance included; intro excluded because it is not a server message).

## State transitions

- **Panel view**: `list` ⇄ `thread(conversationId)`. Opening the panel always starts at `list` (FR-004a); selecting a row → `thread`; back → `list`.
- **Guidance ask**: `idle` → `awaitingResponse` (loader bubble + input disabled) → `idle` on (a) a non-user message arriving, (b) error, or (c) the fixed wait window elapsing (FR-027/FR-028).
- **Guidance clear**: `idle` → confirm → `resetting` (refetch `UserConversations` + messages; re-resolve guidance ids; re-point subscription) → `idle` with pinned guidance + fresh thread (FR-030).
- **Group settings**: `name`/`avatar` are pending-until-Save (discard guard); `addMember`/`removeMember`/`leave` apply immediately (FR-021–FR-025).

## Key entities (from spec) → where they live

| Spec entity | Representation |
|---|---|
| Conversation | `ChatListItem` (list) + `ChatThreadHeader` (thread); source = `UserConversations` payload |
| Message | `ChatMessage`; source = `ConversationMessages` payload |
| Reaction | `CommentReaction` (reused) |
| Participant / Member | `GroupMember` / `CommentAuthor` |
| Guidance Assistant | guidance `ChatListItem`/`ChatThreadHeader` (`isGuidance`) + synthetic intro `ChatMessage` |
| Unread Indicator | `totalUnreadCount` → launcher `Badge` |
