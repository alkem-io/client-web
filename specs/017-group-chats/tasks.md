# Tasks: Group Chats

**Input**: Design documents from `/specs/017-group-chats/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/graphql-operations.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted unless they cover critical mapping logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Schema Regeneration)

**Purpose**: Regenerate GraphQL types from the new server schema to discover the actual API shape

- [x] T001 Run `pnpm codegen` against the running local server to regenerate types in `src/core/apollo/generated/graphql-schema.ts`, `src/core/apollo/generated/apollo-hooks.ts`, and `src/core/apollo/generated/apollo-helpers.ts`. Note all compilation errors — these define the scope of Phase 2.

---

## Phase 2: Foundational (API Adaptation — Blocking Prerequisites)

**Purpose**: Fix all breaking changes so existing direct conversations work with the new unified API. This MUST be complete before any group chat feature work.

**CRITICAL**: No user story work (group creation, management, etc.) can begin until this phase is complete and direct messaging is verified working.

### GraphQL Document Fixes

- [x] T002 Update `src/main/userMessaging/graphql/UserConversations.graphql` — replace `me.conversations.users` with `me.conversations.conversations`, replace `user { ... }` field with `members { id type profile { id displayName url avatar: visual(type: AVATAR) { id uri } } }`, and add `room.displayName` for group name support. See `contracts/graphql-operations.md` for the full target shape.
- [x] T003 [P] Update `src/main/userMessaging/graphql/CreateConversation.graphql` — change input from `{ userID }` to `{ memberIDs, type }` (ConversationCreationType). Add `members` to the return selection set.
- [x] T004 [P] Update `src/main/userMessaging/graphql/ConversationEvents.graphql` — replace `conversation.user` with `conversation.members` in `conversationCreated` payload. Add new event payloads: `conversationDeleted { conversationID }`, `memberAdded { conversation { id members { ... } } addedMember { ... } }`, `memberRemoved { conversation { id members { ... } } removedMemberID }`.
- [x] T005 [P] Update `src/main/userMessaging/graphql/UserConversationsUnreadCount.graphql` — fix the query path from `me.conversations.users` to `me.conversations.conversations`.
- [x] T006 [P] Update `src/main/guidance/chatWidget/ChatWidgetQueries.graphql` — replace `me.conversations.virtualContributor(wellKnown: CHAT_GUIDANCE)` with the new API equivalent. If no dedicated lookup exists, query `me.conversations.conversations` with member fields and filter client-side.
- [x] T007 Run `pnpm codegen` again after all `.graphql` fixes to regenerate clean types. Verify no codegen errors remain.

### TypeScript Hook & Model Fixes

- [x] T008 Update `src/main/userMessaging/models.ts` — add `ConversationMember` interface (`id`, `type: ActorType`, `displayName`, `avatarUri?`, `url?`). This type will be used by hooks and components.
- [x] T009 Update `src/main/userMessaging/useUserConversations.ts` — refactor `UserConversation` interface: replace `user` field with `displayName`, `avatarUri`, `url`, `isGroup`, `members`, `otherMember`. Update the mapping logic to: (1) read from `data.me.conversations.conversations`, (2) for each conversation, map `members` to `ConversationMember[]`, (3) determine `isGroup` from member count or room type, (4) for direct conversations, find the other member by filtering out current user, (5) set `displayName`/`avatarUri` from other member (direct) or room name (group). Preserve existing sort logic.
- [x] T010 Update `src/main/userMessaging/useConversationEventsSubscription.ts` — fix `handleConversationCreated` to use `conversation.members` instead of `conversation.user` when writing to Apollo cache. Update cache shape in `UserConversationsDocument` to match the new query structure (`conversations.conversations` instead of `conversations.users`).
- [x] T011 [P] Update `src/main/guidance/chatWidget/useChatGuidanceCommunication.ts` — fix the data access path for the guidance VC conversation. If using filtered flat list, find the conversation where a member has type `VIRTUAL_CONTRIBUTOR` (or matches well-known VC). Update `conversationGuidanceData?.me.conversations.conversationGuidanceVc` to the new path.
- [x] T012 [P] Update `src/main/userMessaging/useUnreadConversationsCount.ts` — fix the data access path to use the new `conversations.conversations` structure.

### UI Component Fixes

- [x] T013 Update `src/main/userMessaging/UserMessagingChatList.tsx` — replace all `conversation.user.displayName` with `conversation.displayName`, `conversation.user.avatarUri` with `conversation.avatarUri`. Update search filter to use `conversation.displayName` instead of `conversation.user.displayName`.
- [x] T014 Update `src/main/userMessaging/UserMessagingConversationView.tsx` — replace `conversation.user.displayName` and `conversation.user.avatarUri` in the header with `conversation.displayName` and `conversation.avatarUri`.
- [x] T015 Update `src/main/userMessaging/NewMessageDialog.tsx` — change `createConversation` call from `{ userID: selectedUser.id }` to `{ memberIDs: [selectedUser.id], type: 'DIRECT' }` (using the `ConversationCreationType` enum value from generated types).

**Checkpoint**: Direct conversations (user-to-user and VC) load, display, send/receive messages correctly. Chat widget works. Run `pnpm lint` and `pnpm vitest run` to verify no regressions.

---

## Phase 3: User Story 1 — Adapt Conversation List to Unified API (Priority: P1) — MVP

**Goal**: Existing direct conversations work seamlessly after API restructure (FR-001 through FR-005)

**Independent Test**: Open messages screen → all direct conversations load with correct names/avatars → can send/receive messages → VC conversations display correctly → new direct conversation can be created

**Note**: The actual implementation work for US1 is done in Phase 2 (Foundational) since it's a prerequisite for everything. This phase is the verification checkpoint.

- [x] T016 [US1] Verify direct conversation list loads correctly with new API — open messaging dialog, confirm all conversations show correct display names, avatars, last message previews, and unread counts in `src/main/userMessaging/UserMessagingChatList.tsx`
- [x] T017 [US1] Verify VC conversation identification works — confirm that conversations with virtual contributors are correctly detected by inspecting `member.type` in `src/main/userMessaging/useUserConversations.ts` and display appropriately
- [x] T018 [US1] Verify new direct conversation creation works — test the "New Message" flow end-to-end: search user, select, create conversation with new `{ memberIDs, type: DIRECT }` input in `src/main/userMessaging/NewMessageDialog.tsx`
- [x] T019 [US1] Verify real-time message delivery works — send a message from another user, confirm it appears via `CONVERSATION_CREATED` and `MESSAGE_RECEIVED` subscription events handled in `src/main/userMessaging/useConversationEventsSubscription.ts`

**Checkpoint**: US1 complete — all existing messaging functionality works with the new unified API. This is the MVP.

---

## Phase 4: User Story 2 — Create a Group Chat (Priority: P1)

**Goal**: Users can create group conversations with multiple members (FR-006 through FR-012)

**Independent Test**: Tap "Start group chat" → search and select 2+ users → enter group name → optionally choose avatar → confirm → group chat created and opened → can send messages in it

### Implementation for User Story 2

- [x] T020 [US2] Add i18n keys for group chat creation in `src/core/i18n/en/translation.en.json` — add keys under `components.userMessaging` for: `startGroupChat`, `groupChatName`, `groupChatNameRequired`, `selectMembers`, `selectMembersHint`, `createGroupChat`, `editProfilePicture`, `addMembers`, `groupMembers`, `remove`, `manageGroup`, `leaveGroup`, `leaveGroupConfirmTitle`, `leaveGroupConfirmMessage`, `noMembersSelected`
- [x] T021 [US2] Create `src/main/userMessaging/GroupChatManagementDialog.tsx` in **creation mode** — build a dialog component with: (1) group avatar display with edit/upload capability (reuse `VisualUpload` pattern from `src/core/ui/upload/VisualUpload/VisualUpload.tsx` or a simpler default avatar placeholder for creation), (2) group name text input (required, with validation), (3) multi-select user search using `useContributors` from `src/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors.ts` with MUI `Autocomplete` in `multiple` mode, (4) selected members list with remove capability, (5) "Back" and "Start group convo" action buttons. Props: `open`, `onClose`, `onGroupCreated(conversationId, roomId)`, `mode: 'create' | 'manage'`. Filter out current user from search results. Require at least 1 member and non-empty name before enabling the create button.
- [x] T022 [US2] Update `src/main/userMessaging/NewMessageDialog.tsx` — add a "Start group chat" button below the existing user search. When clicked, close the NewMessageDialog and open GroupChatManagementDialog in `create` mode. Wire the `onGroupCreated` callback to call `onConversationCreated` to navigate to the new group chat.
- [x] T023 [US2] Wire group creation mutation in `src/main/userMessaging/GroupChatManagementDialog.tsx` — call `useCreateConversationMutation` with `{ memberIDs: selectedMemberIds, type: ConversationCreationType.Group }`. On success, call `onGroupCreated` with the returned `conversationId` and `roomId`. Handle errors with user-friendly feedback.

**Checkpoint**: US2 complete — can create group chats with 2+ members. Group appears in conversation list. Can send/receive messages in the group.

---

## Phase 5: User Story 3 — Display Group Conversations in the List (Priority: P1)

**Goal**: Group conversations are visually distinct alongside direct conversations (FR-013 through FR-015)

**Independent Test**: View conversation list → group chats show group name and group avatar → direct chats show other user's name and avatar → search works for both group names and user names

### Implementation for User Story 3

- [x] T024 [US3] Update `src/main/userMessaging/UserMessagingChatList.tsx` — add visual differentiation for group conversations: (1) use `conversation.isGroup` to conditionally render group-specific styling (e.g., a small group icon overlay on the avatar, or show member count), (2) ensure the group avatar and group name display correctly for group entries, (3) update the search filter to match against `conversation.displayName` which already covers both group names and direct user names.
- [x] T025 [US3] Update `src/main/userMessaging/UserMessagingConversationView.tsx` — update the conversation header to: (1) for group chats, show the group name and group avatar (instead of other user's info), (2) optionally show a member count or "X members" subtitle for group conversations.

**Checkpoint**: US3 complete — group and direct conversations display side by side with clear visual differentiation. Search works for both.

---

## Phase 6: User Story 4 — Manage Group Details and Members (Priority: P2)

**Goal**: Members can edit group name/avatar and add/remove members from a single dialog (FR-016 through FR-023)

**Independent Test**: Open group chat → click three-dots → "Manage group" → edit group name → add a member → remove a member → changes saved and reflected

### Implementation for User Story 4

- [x] T026 [P] [US4] Create `src/main/userMessaging/graphql/AddConversationMember.graphql` — mutation `addConversationMember(memberData: AddConversationMemberInput!)` returning `Conversation` with `id` and `members { id type profile { id displayName url avatar: visual(type: AVATAR) { id uri } } }`
- [x] T027 [P] [US4] Create `src/main/userMessaging/graphql/RemoveConversationMember.graphql` — mutation `removeConversationMember(memberData: RemoveConversationMemberInput!)` returning nullable `Conversation` with `id` and `members { ... }`. Handle null return (auto-deleted group).
- [x] T028 [US4] Run `pnpm codegen` to generate hooks for the new mutations (`useAddConversationMemberMutation`, `useRemoveConversationMemberMutation`)
- [x] T029 [US4] Extend `src/main/userMessaging/GroupChatManagementDialog.tsx` for **management mode** — when `mode === 'manage'`, accept additional props: `conversationId`, `currentMembers`, `groupName`, `groupAvatarUri`. Pre-populate the dialog with existing group details. Add: (1) editable group name field with save capability, (2) avatar edit option, (3) current member list with "Remove" buttons (calling `useRemoveConversationMemberMutation`), (4) "Add members" section using `useContributors` with `useAddConversationMemberMutation`, filtering out existing members from search results. Each add/remove operation calls the mutation immediately (no batch save). Update Apollo cache after each mutation to reflect changes.
- [x] T030 [US4] Add three-dots menu to `src/main/userMessaging/UserMessagingConversationView.tsx` — for group conversations (`conversation.isGroup`), add an `IconButton` with `MoreVert` icon in the conversation header. Render a `Menu` with a "Manage group" option. When clicked, open `GroupChatManagementDialog` in `manage` mode with the current conversation's data.
- [x] T031 [US4] Wire the management dialog state in `src/main/userMessaging/UserMessagingDialog.tsx` or `UserMessagingConversationView.tsx` — manage the open/close state for GroupChatManagementDialog in manage mode. Pass the currently selected conversation's members, name, and avatar.

**Checkpoint**: US4 complete — can open management dialog, edit group name, add new members (who see full history), remove members. All changes reflect immediately.

---

## Phase 7: User Story 5 — Leave a Group Chat (Priority: P2)

**Goal**: Users can leave group conversations with a confirmation dialog (FR-024 through FR-027)

**Independent Test**: Open group chat → click three-dots → "Leave group" → confirmation dialog → confirm → chat removed from list → other members still see the group

### Implementation for User Story 5

- [x] T032 [P] [US5] Create `src/main/userMessaging/graphql/LeaveConversation.graphql` — mutation `leaveConversation(leaveData: LeaveConversationInput!)` returning nullable `Conversation` with `id`. Handle null return (auto-deleted when last member leaves).
- [x] T033 [US5] Run `pnpm codegen` to generate the `useLeaveConversationMutation` hook
- [x] T034 [US5] Add "Leave group" option to the three-dots menu in `src/main/userMessaging/UserMessagingConversationView.tsx` — below "Manage group", add a "Leave group" menu item (only visible for group conversations). When clicked, show a confirmation dialog (use existing `DialogWithGrid` + `DialogHeader` pattern or MUI `Dialog`). The confirmation dialog should show a warning message (i18n key) and "Cancel" / "Leave" buttons. On confirm, call `useLeaveConversationMutation` with `{ conversationID }`. On success: (1) if mutation returns null, the group was auto-deleted, (2) remove the conversation from Apollo cache (`UserConversationsDocument`), (3) clear the selected conversation in `UserMessagingContext` to navigate back to the list.

**Checkpoint**: US5 complete — can leave group chats with confirmation. Chat disappears from list. Last-member-leave triggers auto-deletion.

---

## Phase 8: User Story 6 — Real-Time Group Updates (Priority: P2)

**Goal**: All group lifecycle events update the UI in real-time via subscriptions (FR-028 through FR-031)

**Independent Test**: Two browser windows with same user or two different group members — one performs action (add member, remove member, create group including other), the other sees update without refreshing

### Implementation for User Story 6

- [x] T035 [US6] Add `CONVERSATION_DELETED` event handler in `src/main/userMessaging/useConversationEventsSubscription.ts` — when `ConversationEventType.ConversationDeleted` fires: (1) extract `conversationID` from event payload, (2) remove the conversation from `UserConversationsDocument` cache, (3) evict the conversation from Apollo cache using `evictFromCache`. If the deleted conversation is currently selected, clear the selection in context.
- [x] T036 [US6] Add `MEMBER_ADDED` event handler in `src/main/userMessaging/useConversationEventsSubscription.ts` — when `ConversationEventType.MemberAdded` fires: (1) if the added member is the current user (self was added to a group), add the full conversation to the `UserConversationsDocument` cache list, (2) if the added member is someone else and the conversation exists in cache, update the conversation's `members` array with the new member.
- [x] T037 [US6] Add `MEMBER_REMOVED` event handler in `src/main/userMessaging/useConversationEventsSubscription.ts` — when `ConversationEventType.MemberRemoved` fires: (1) if the removed member ID matches the current user, remove the conversation from `UserConversationsDocument` cache and clear selection if it was the active conversation, (2) if the removed member is someone else and the conversation exists in cache, update the conversation's `members` array to remove that member.
- [x] T038 [US6] Update the subscription event switch statement in `src/main/userMessaging/useConversationEventsSubscription.ts` — add cases for `ConversationEventType.ConversationDeleted`, `ConversationEventType.MemberAdded`, and `ConversationEventType.MemberRemoved` that call the new handlers from T035–T037.

**Checkpoint**: US6 complete — real-time updates work for all group lifecycle events across connected clients.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all user stories

- [x] T039 Review and complete all i18n keys in `src/core/i18n/en/translation.en.json` — ensure every user-visible string in the group chat feature uses `t()` with a proper translation key. No hardcoded strings.
- [x] T040 [P] Ensure WCAG 2.1 AA compliance across all new/modified components — verify keyboard navigation in `GroupChatManagementDialog`, three-dots menu, confirmation dialog, member list. Add `aria-label` attributes to icon buttons, ensure focus management in dialogs.
- [x] T041 [P] Run `pnpm lint` and fix any linting errors across all modified files
- [x] T042 [P] Run `pnpm vitest run` and fix any failing tests
- [x] T043 Run `pnpm codegen` final pass — ensure all generated files in `src/core/apollo/generated/` are up to date and committed
- [x] T044 Test mobile responsive layout for group chat features — verify `GroupChatManagementDialog`, conversation list with groups, and group conversation view work correctly on mobile screen sizes (the existing `UserMessagingDialog` already handles desktop/mobile split)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run codegen immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 — Verify)**: Depends on Phase 2 — verification checkpoint
- **Phase 4 (US2 — Group Creation)**: Depends on Phase 2 — can start after foundation is stable
- **Phase 5 (US3 — Group Display)**: Depends on Phase 2 — benefits from Phase 4 (need groups to display) but the rendering logic is independent
- **Phase 6 (US4 — Management)**: Depends on Phases 2 + 4 (need group creation first)
- **Phase 7 (US5 — Leave)**: Depends on Phases 2 + 4 (need groups to leave)
- **Phase 8 (US6 — Real-Time)**: Depends on Phase 2 (subscription handler changes) — can be developed incrementally alongside Phases 4–7
- **Phase 9 (Polish)**: Depends on all story phases being complete

### User Story Dependencies

```
Phase 1: Setup (codegen)
    ↓
Phase 2: Foundational (API adaptation) ← BLOCKS EVERYTHING
    ↓
Phase 3: US1 Verify ← MVP checkpoint
    ↓
Phase 4: US2 (Group Creation) ←──────────────┐
    ↓                                          │
Phase 5: US3 (Group Display)                   │
    ↓                                          │
Phase 6: US4 (Management) ← depends on US2    │
    ↓                                          │
Phase 7: US5 (Leave) ← depends on US2 ────────┘
    ↓
Phase 8: US6 (Real-Time) ← can overlap with US4/US5
    ↓
Phase 9: Polish
```

### Parallel Opportunities

Within Phase 2:

- T003, T004, T005, T006 can all run in parallel (different `.graphql` files)
- T011, T012 can run in parallel (different `.ts` files)

Within Phase 6:

- T026, T027 can run in parallel (different `.graphql` files)

Within Phase 8:

- T035, T036, T037 modify the same file sequentially, but conceptually each event handler is independent

Within Phase 9:

- T040, T041, T042 can all run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Codegen
2. Complete Phase 2: Fix all breaking changes
3. Complete Phase 3: Verify US1
4. **STOP and VALIDATE**: All existing direct messaging works
5. This is the minimum viable deliverable — no regressions

### P1 Complete (Stories 1 + 2 + 3)

1. Phases 1–3 (MVP as above)
2. Phase 4: Group chat creation (US2)
3. Phase 5: Group display differentiation (US3)
4. **STOP and VALIDATE**: Can create and see group chats
5. This is the core group chat experience

### Full Feature (All Stories)

1. Phases 1–5 (P1 complete)
2. Phase 6: Group management (US4)
3. Phase 7: Leave group (US5)
4. Phase 8: Real-time updates (US6)
5. Phase 9: Polish
6. **FULL VALIDATION**: All features working end-to-end

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The Foundational phase (Phase 2) is unusually large because the API breaking changes affect nearly every file in the messaging module
- Tasks reference exact file paths from the current codebase
- The `GroupChatManagementDialog` component serves dual purpose (creation + management) per the Figma design and spec clarification
- Avatar upload for groups depends on the server exposing a `visual` on the conversation/room entity — check after codegen. If not available, use a default avatar placeholder for V1
- All mutations should use `useTransition` for React 19 concurrent UX discipline
- Stop at any checkpoint to validate independently
