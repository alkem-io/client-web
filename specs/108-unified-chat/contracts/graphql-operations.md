# Contract: GraphQL Operations Inventory

**No GraphQL/schema changes are introduced by this feature.** All operations below already exist and are consumed via generated hooks from `src/core/apollo/generated/apollo-hooks.ts` (Constitution III). No `pnpm codegen` run is required. This inventory documents which existing operations the unified chat depends on and how they map to user actions.

## Queries

| Operation | Source `.graphql` | Used for |
|---|---|---|
| `UserConversations` | `src/main/userMessaging/graphql/UserConversations.graphql` | The unified list (guidance now included — filter removed in `useUnifiedConversations`) |
| `ConversationMessages` | `src/main/userMessaging/graphql/ConversationMessages.graphql` | Thread message history (reused as-is via `useConversationMessages`) |
| `ConversationDetails` | `src/main/userMessaging/graphql/ConversationDetails.graphql` | Group member/room detail for settings |
| `UserConversationsUnreadCount` | `src/main/userMessaging/graphql/UserConversationsUnreadCount.graphql` | Lightweight combined badge (guidance flows in automatically) |
| `PlatformGuidanceVc` | `src/main/guidance/chatWidget/PlatformGuidanceVc.graphql` | Resolve the well-known guidance VC id (`useGuidanceVcId`) — identify/pin/style only |

> `ConversationWithGuidanceVc` (`ChatWidgetQueries.graphql`) is **no longer needed for listing** (the unified list comes from `UserConversations`). It may still be referenced transitionally; the clear-context refetch set is updated to include `UserConversations` (see research D6).

## Mutations

| Operation | User action (spec FR) | Notes |
|---|---|---|
| `CreateConversation` | FR-018/019/020 | single recipient → Direct, 2+ → Group (type chosen in connector) |
| `UpdateConversation` | FR-021 | group name / avatar on Save |
| `AssignConversationMember` | FR-022 | add member (immediate) |
| `RemoveConversationMember` | FR-022/025 | remove member (immediate, confirmed) |
| `LeaveConversation` | FR-023/025 | leave group (confirmed) |
| `sendMessageToRoom` | FR-014 | send a message (DM, group, or guidance) |
| `MarkMessageAsRead` | FR-017 | clears unread on open |
| reaction mutations (via `useCommentReactionsMutations`) | FR-016 | add/remove reaction |
| `resetConversationVc` | FR-030 | clear guidance context; **refetch set extended to include `UserConversations`**; connector re-resolves ids + subscription |

## Subscriptions

| Operation | Used for |
|---|---|
| `ConversationEvents` (`useConversationEventsSubscription`) | realtime: created/updated/deleted conversation, member add/remove, message received/removed, read-receipt (FR-015) |
| room events (`useSubscribeOnRoomEvents`) | realtime message updates for the selected room (keyed off `selectedRoomId`) |

## Privilege / feature gating (not GraphQL operations, but contract-relevant)

- Guidance row visibility = `GuidenceEngine` feature flag **AND** `AccessInteractiveGuidance` privilege (mirrors `PlatformHelpButton`). Computed in the integration layer; passed into CRD as a boolean.
- Surface availability = `!!userModel?.id` (registered user), matching the current `UserMessagingProvider.isEnabled`.

## Change summary

- **Schema diff**: none.
- **Codegen**: not required.
- **Behavioral change to an existing operation's usage**: only `resetConversationVc`'s `refetchQueries` (add `UserConversations`) and removal of the client-side guidance filter in the conversations hook. No operation documents change.
