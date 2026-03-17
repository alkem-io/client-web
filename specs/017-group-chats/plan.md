# Implementation Plan: Group Chats

**Branch**: `017-group-chats` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-group-chats/spec.md`

## Summary

Adapt the client messaging system to the refactored unified conversation API (breaking changes), then build group chat creation, display, member management, leave functionality, and real-time subscription handling. The server is running locally — codegen can be run immediately to discover the new schema and fix errors iteratively.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Apollo Client (GraphQL), MUI (UI), react-i18next (i18n), Vite (build)
**Storage**: Apollo Client cache (normalized), server-managed persistence
**Testing**: Vitest + jsdom
**Target Platform**: Web (SPA), desktop + mobile responsive
**Project Type**: Web SPA (frontend only — server is separate)
**Performance Goals**: Group creation < 60s, real-time updates < 3s
**Constraints**: All strings via i18n, WCAG 2.1 AA, generated hooks only, no barrel exports

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                          | Status | Notes                                                                                                                                                              |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Domain-Driven Boundaries        | PASS   | New group chat logic will live in `src/main/userMessaging/` (app-specific orchestration) with domain hooks in the same directory. No business logic in components. |
| II. React 19 Concurrent UX         | PASS   | Will use `useTransition` for mutations (create group, add/remove member). Suspense boundaries for data loading. Pure rendering throughout.                         |
| III. GraphQL Contract Fidelity     | PASS   | Will run `pnpm codegen` after every `.graphql` change. Only generated hooks used. Schema diff will be documented in PR.                                            |
| IV. State & Side-Effect Isolation  | PASS   | State in Apollo cache + `UserMessagingContext`. Side effects isolated in hooks. No direct DOM manipulation.                                                        |
| V. Experience Quality & Safeguards | PASS   | Keyboard navigation for dialogs, ARIA labels, semantic HTML. Tests for mapping logic.                                                                              |
| Engineering Workflow               | PASS   | Domain-first approach: update GraphQL → update hooks → update UI.                                                                                                  |
| SOLID / DRY                        | PASS   | Shared fragments for member/message fields. Reuse `useContributors` for search. Reuse `VisualUpload` for avatar. Single management dialog for creation + editing.  |
| Import Transparency                | PASS   | No barrel exports. Direct file path imports throughout.                                                                                                            |

**Post-Phase 1 re-check**: All principles remain satisfied. The data model uses Apollo cache normalization (Principle IV), the GraphQL contracts are fully specified (Principle III), and the component architecture follows domain-first patterns (Principle I).

## Project Structure

### Documentation (this feature)

```text
specs/017-group-chats/
├── plan.md                          # This file
├── spec.md                          # Feature specification
├── research.md                      # Phase 0: research findings
├── data-model.md                    # Phase 1: entity model changes
├── quickstart.md                    # Phase 1: developer setup guide
├── contracts/
│   └── graphql-operations.md        # Phase 1: GraphQL operation contracts
└── tasks.md                         # Phase 2: implementation tasks (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/main/userMessaging/
├── graphql/
│   ├── UserConversations.graphql         # UPDATE: conversations.conversations + members
│   ├── CreateConversation.graphql        # UPDATE: memberIDs + type input
│   ├── ConversationEvents.graphql        # UPDATE: new event types + members
│   ├── ConversationMessages.graphql      # (minimal changes)
│   ├── MarkMessageAsRead.graphql         # (no changes)
│   ├── UserConversationsUnreadCount.graphql # UPDATE: conversations path
│   ├── AssignConversationMember.graphql   # NEW
│   ├── RemoveConversationMember.graphql  # NEW
│   ├── LeaveConversation.graphql         # NEW
│   └── UpdateConversation.graphql        # NEW
├── UserMessagingDialog.tsx               # UPDATE: pass group context
├── UserMessagingChatList.tsx             # UPDATE: render group + direct
├── UserMessagingConversationView.tsx     # UPDATE: group header, three-dots menu
├── UserMessagingContext.tsx              # (minimal changes)
├── NewMessageDialog.tsx                  # UPDATE: add "Start group chat" entry point
├── GroupChatManagementDialog.tsx         # NEW: combined create + manage dialog
├── useUserConversations.ts              # UPDATE: new mapping for members-based model
├── useConversationMessages.ts           # (minimal changes)
├── useConversationEventsSubscription.ts # UPDATE: handle 3 new event types
├── useUnreadConversationsCount.ts       # UPDATE: new query path
└── models.ts                            # UPDATE: add ConversationMember, refactor UserConversation

src/main/guidance/chatWidget/
├── ChatWidgetQueries.graphql            # UPDATE: new conversation lookup for VC
└── useChatGuidanceCommunication.ts      # UPDATE: new data path for VC lookup

src/core/i18n/en/
└── translation.en.json                  # UPDATE: add group chat i18n keys

src/core/apollo/generated/
├── graphql-schema.ts                    # REGENERATED via codegen
├── apollo-hooks.ts                      # REGENERATED via codegen
└── apollo-helpers.ts                    # REGENERATED via codegen
```

**Structure Decision**: All changes are within the existing `src/main/userMessaging/` directory (app-specific messaging feature) with one new component (`GroupChatManagementDialog.tsx`). The chat widget in `src/main/guidance/chatWidget/` gets a targeted fix for the VC conversation lookup. No new domain directories needed.

## Complexity Tracking

No constitution violations to justify. All changes fit within existing architectural patterns.

## Implementation Phases

### Phase A: API Adaptation (P1 — Stories 1, 3)

**Goal**: Make existing direct conversations work with the new unified API.

1. Run `pnpm codegen` to regenerate types from the new server schema
2. Fix all `.graphql` documents to match new schema (see contracts)
3. Re-run `pnpm codegen` for clean types
4. Update `useUserConversations.ts` — new mapping logic for `members`-based model
5. Update `useConversationEventsSubscription.ts` — fix `conversationCreated` handler for new shape
6. Update `UserMessagingChatList.tsx` — use `displayName`/`avatarUri` instead of `conversation.user`
7. Update `UserMessagingConversationView.tsx` — update header rendering
8. Fix `ChatWidgetQueries.graphql` + `useChatGuidanceCommunication.ts` for VC lookup
9. Fix `UserConversationsUnreadCount.graphql` for new path
10. Update `models.ts` with new types (`ConversationMember`, refactored `UserConversation`)

**Verification**: All existing tests pass. Direct conversations load and work. Chat widget works.

### Phase B: Group Chat Creation (P1 — Story 2)

**Goal**: Users can create group conversations.

1. Update `NewMessageDialog.tsx` — add "Start group chat" button
2. Create `GroupChatManagementDialog.tsx` — multi-select user search, group name input, avatar upload
3. Update `CreateConversation.graphql` — new input format
4. Wire creation flow: NewMessage → GroupChatManagementDialog → createConversation(type: GROUP) → navigate to new chat
5. Add i18n keys for group chat strings

**Verification**: Can create a group chat with 2+ members, see it in the list, send/receive messages.

### Phase C: Group Display & Differentiation (P1 — Story 3)

**Goal**: Group chats are visually distinct in the conversation list.

1. Update `UserMessagingChatList.tsx` — render group name/avatar, distinguish from direct chats
2. Update conversation list search to search by group name as well
3. Update `useUserConversations.ts` sort logic to handle both types

**Verification**: Group and direct chats display correctly side by side. Search works for both.

### Phase D: Group Management (P2 — Story 4)

**Goal**: Members can manage group details and membership.

1. Add `AssignConversationMember.graphql`, `RemoveConversationMember.graphql`, and `UpdateConversation.graphql`
2. Extend `GroupChatManagementDialog.tsx` for management mode (pre-populated members, edit name/avatar)
3. Add three-dots menu to `UserMessagingConversationView.tsx` for group chats
4. Wire "Manage group" menu option to open management dialog
5. Implement add/remove member mutations with Apollo cache updates

**Verification**: Can add/remove members from existing group. Name/avatar editing works.

### Phase E: Leave Group (P2 — Story 5)

**Goal**: Users can leave group conversations with confirmation.

1. Add `LeaveConversation.graphql`
2. Add "Leave group" option to three-dots menu
3. Implement confirmation dialog before leave action
4. Handle null return (auto-deletion) from leave mutation
5. Remove conversation from local cache on leave

**Verification**: Leaving removes chat from list. Confirmation dialog appears. Last-member-leave deletes group.

### Phase F: Real-Time Subscription Updates (P2 — Story 6)

**Goal**: All group events update the UI in real-time.

1. Update `ConversationEvents.graphql` with new event payload fields (including `conversationUpdated`, `Room.avatarUrl`)
2. Add `CONVERSATION_UPDATED` handler — update displayName/avatarUrl in cache
3. Add `CONVERSATION_DELETED` handler — remove from cache, evict
4. Add `MEMBER_ADDED` handler — update members array; if self added, add conversation to list
5. Add `MEMBER_REMOVED` handler — update members array; if self removed, remove from list
6. Test all event types with two browser windows

**Key design**: All membership/property mutations return `Boolean!` (fire-and-forget). Client must NOT read state from mutation responses — rely on subscription events for state changes.

**Verification**: Real-time updates work for all event types across connected clients.

### Phase G: Polish & Testing

1. Add/update i18n keys in `translation.en.json`
2. Ensure WCAG 2.1 AA compliance (keyboard navigation, ARIA labels, screen reader support)
3. Run `pnpm lint` and `pnpm vitest run`
4. Run `pnpm codegen` final pass to ensure generated files are committed
5. Test mobile responsive layout

## Risk Register

| Risk                                                 | Impact | Mitigation                                                                                     |
| ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Server schema differs from assumed contract          | High   | Run codegen early; iterate on `.graphql` documents. Server PR #5891 is the source of truth.    |
| Apollo cache inconsistencies with new event types    | Medium | Idempotency checks in all subscription handlers (existing pattern)                             |
| Group avatar uses `Room.avatarUrl` (mxc:// or https) | Medium | `Room.avatarUrl` is persisted server-side. Client fetches it. Upload via `updateConversation`. |
| Fire-and-forget mutation pattern                     | Medium | All membership/property mutations return `Boolean!`. State arrives via subscriptions.          |
| Chat widget VC lookup migration                      | Medium | Query all conversations and filter client-side for VC member type                              |
| Server-side date normalization / timestamp → timestamptz migration missing | Medium | Server PR must perform the timestamp → timestamptz migration and ensure subscription dates are rehydrated correctly for real-time ordering. Run migration early and validate subscription date rehydration in integration tests. |
| Performance with large member lists (no upper limit) | Low    | MUI Autocomplete handles virtualization; server handles pagination                             |
