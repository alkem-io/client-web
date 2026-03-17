# Tasks: Fix Group Chat Badge Counts & Member Event Handling

**Input**: Design documents from `/specs/024-fix-group-chat-badges/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the new GraphQL query and regenerate codegen

- [x] T001 Copy `specs/024-fix-group-chat-badges/contracts/ConversationDetails.graphql` to `src/main/userMessaging/graphql/ConversationDetails.graphql`
- [x] T002 Run `pnpm codegen` to generate `useConversationDetailsQuery` hook and types in `src/core/apollo/generated/`

**Checkpoint**: New `ConversationDetailsDocument` and `useConversationDetailsQuery` are available in generated hooks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove the fake badge logic — this unblocks correct behavior for all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Remove the `effectiveUnreadCount` variable and its computation from `handleConversationCreated` in `src/main/userMessaging/useConversationEventsSubscription.ts`. Replace both usages (line ~128 in `UserConversationsQuery` cache write and line ~167 in `UserConversationsUnreadCountQuery` cache write) with `room.unreadCount` directly.
- [x] T004 Remove the `RoomType` import from `src/main/userMessaging/useConversationEventsSubscription.ts` if it is no longer used after T003.
- [x] T005 Run `pnpm lint` and `pnpm vitest run` to verify no regressions from T003-T004. (Biome passes clean; pre-existing lodash-es and vitest config errors unrelated to our changes.)

**Checkpoint**: `ConversationCreated` handler uses server-provided `unreadCount` for all conversation types. No fake badge counts.

---

## Phase 3: User Story 1 - I Am Added to a Group Chat (Priority: P1) 🎯 MVP

**Goal**: When the current user is added to a group conversation via `MEMBER_ADDED` event, fetch full conversation details from the server and integrate them into both Apollo caches so the conversation appears in the list with accurate unread count and the nav bar badge updates.

**Independent Test**: User B adds User A to a group with 5 messages. User A sees the group appear in their list with server-provided unread count. Badge increments. Opening the conversation clears unread. New messages from other members increment unread normally.

### Implementation for User Story 1

- [x] T006 [US1] Add `ConversationDetailsDocument` import and `ConversationDetailsQuery` type import to `src/main/userMessaging/useConversationEventsSubscription.ts` from `src/core/apollo/generated/apollo-hooks` and `src/core/apollo/generated/graphql-schema` respectively.
- [x] T007 [US1] In `handleMemberAdded` in `src/main/userMessaging/useConversationEventsSubscription.ts`, add a self-detection branch at the top: if `event.addedMember.id === currentUserId`, execute the new logic (T008-T011) and return early. Otherwise, fall through to the existing member-list-update logic.
- [x] T008 [US1] In the self-detection branch of `handleMemberAdded` in `src/main/userMessaging/useConversationEventsSubscription.ts`, use `client.query()` with `ConversationDetailsDocument` (from generated hooks), passing `variables: { conversationId: event.conversation.id }` and `fetchPolicy: 'network-only'` to fetch full conversation data from the server. Wrap the call in try/catch — on failure, log the error and return without writing to cache (the conversation will appear on next full refresh).
- [x] T009 [US1] After the query resolves in `handleMemberAdded` in `src/main/userMessaging/useConversationEventsSubscription.ts`, write the conversation to the `UserConversationsQuery` cache using `client.cache.updateQuery()` — prepend the new conversation object (with room metadata, members, unreadCount from query result). Include idempotency check (skip if conversation already exists in cache). Note: this idempotency check also guards against the race condition where a MEMBER_REMOVED event was processed while the query was in-flight — if the conversation was removed during that window, re-adding it would be incorrect, so always check current cache state before writing.
- [x] T010 [US1] After the query resolves in `handleMemberAdded` in `src/main/userMessaging/useConversationEventsSubscription.ts`, write the conversation to the `UserConversationsUnreadCountQuery` cache using `client.cache.updateQuery()` — add entry with conversation ID, room ID, and unreadCount from query result. Include idempotency check (same race condition guard as T009).
- [x] T011 [US1] Run `pnpm lint` and `pnpm vitest run` to verify no regressions.

**Checkpoint**: Being added to a group fetches real data from the server, shows accurate unread count, and updates the nav bar badge. The conversation participates in all subsequent subscription events (messages, read receipts, etc.) because it exists in the normalized cache. Verify FR-003: after adding a conversation via MEMBER_ADDED, send a new message from another member and confirm unreadCount increments and badge updates — identical to conversations from initial load.

---

## Phase 4: User Story 2 - I Am Removed From a Group Chat (Priority: P1)

**Goal**: When the current user is removed from a group conversation, the conversation disappears from their list and the badge adjusts correctly.

**Independent Test**: User A is a member of a group with 3 unread messages. User B removes User A. The conversation vanishes from User A's list and badge decrements by 1.

### Implementation for User Story 2

- [x] T012 [US2] Review existing `handleMemberRemoved` self-removal logic (lines 277-310) in `src/main/userMessaging/useConversationEventsSubscription.ts` — verify it removes from both `UserConversationsQuery` and `UserConversationsUnreadCountQuery` caches. Also verify idempotency: a duplicate MEMBER_REMOVED event for a conversation already removed from cache must be a no-op (the `.filter()` pattern handles this naturally, but confirm). Document findings (this was implemented in commit b56086de and should already be correct).
- [x] T013 [US2] If T012 reveals any gaps (e.g., cache eviction of Room/Conversation entities, handling of "currently viewing" state), address them in `src/main/userMessaging/useConversationEventsSubscription.ts`. If no gaps found, mark this task complete with no changes.

**Checkpoint**: Removal from a group cleanly removes the conversation from both caches. Badge decrements if conversation had unread messages.

---

## Phase 5: User Story 3 - I Am Added to an Empty Group Chat (Priority: P2)

**Goal**: Being added to a group with 0 messages shows the conversation with 0 unread and no badge increment. No fake "1 unread" badge.

**Independent Test**: Create a group with no messages, add a user. They see 0 unread, badge unchanged.

### Implementation for User Story 3

- [x] T014 [US3] Verify that the implementation from Phase 2 (T003 — removal of `effectiveUnreadCount`) combined with Phase 3 (T007 — server query returning `unreadCount: 0` for empty groups) correctly handles this case. No additional code changes expected — this is a validation task. If server returns non-zero for empty group, investigate root cause.

**Checkpoint**: Empty groups show 0 unread, no fake badge.

---

## Phase 6: User Story 4 - Someone Else Added/Removed (Priority: P2)

**Goal**: When another user is added to or removed from a group I'm in, only the member list updates. My badge and unread counts are unaffected.

**Independent Test**: User C is added to a group where User A is a member. User A sees User C in the member list. Badge and unread are unchanged.

### Implementation for User Story 4

- [x] T015 [US4] Verify existing `handleMemberAdded` non-self branch in `src/main/userMessaging/useConversationEventsSubscription.ts` still works correctly after T006 refactoring. The existing logic (lines 250-275 — adding member to members array) should be preserved as the else branch. No new code expected.
- [x] T016 [US4] Verify existing `handleMemberRemoved` non-self branch in `src/main/userMessaging/useConversationEventsSubscription.ts` still works correctly. The existing logic (lines 312-331 — removing member from members array) should be unaffected. No new code expected.

**Checkpoint**: Other members being added/removed updates the member list only. No badge side effects.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [x] T017 Run full `pnpm lint` to verify code quality in `src/main/userMessaging/useConversationEventsSubscription.ts` (skip if no code changes since T011)
- [x] T018 Run `pnpm vitest run` to verify all existing tests pass (skip if no code changes since T011)
- [ ] T019 Run manual (PENDING — requires running backend) quickstart.md validation scenarios (all 4 test cases) against a running backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (codegen must complete first)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (fake badge removal must happen first)
- **User Story 2 (Phase 4)**: Depends on Phase 2 only (independent of US1)
- **User Story 3 (Phase 5)**: Depends on Phase 2 + Phase 3 (validation of combined behavior)
- **User Story 4 (Phase 6)**: Depends on Phase 3 (must verify after handleMemberAdded refactoring)
- **Polish (Phase 7)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational phase. This is the primary implementation work.
- **User Story 2 (P1)**: Depends on Foundational phase. Largely a verification task (existing code).
- **User Story 3 (P2)**: Depends on US1 completion (needs server query behavior to validate).
- **User Story 4 (P2)**: Depends on US1 completion (needs to verify refactored handleMemberAdded).

### Within Each User Story

- Import changes before logic changes
- Cache writes after query call
- Lint/test after implementation

### Parallel Opportunities

- T003 and T004 can run in parallel (different logical changes in same file, but T004 depends on T003 outcome — sequential recommended)
- T008 and T009 operate on different cache queries but are in the same function — sequential recommended
- T012 and T015 are independent verification tasks — can run in parallel
- T013 and T016 are independent — can run in parallel

---

## Parallel Example: User Story 1

```bash
# T006-T011 are sequential (building up the handleMemberAdded self-detection branch):
Task: T006 "Add imports for ConversationDetailsDocument"
Task: T007 "Add self-detection branch in handleMemberAdded"
Task: T008 "Add client.query() call with error handling"
Task: T009 "Write to UserConversationsQuery cache (with idempotency + race guard)"
Task: T010 "Write to UserConversationsUnreadCountQuery cache (with idempotency + race guard)"
Task: T011 "Lint and test"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Remove fake badge (T003-T005)
3. Complete Phase 3: User Story 1 — handleMemberAdded for self (T006-T011)
4. **STOP and VALIDATE**: Test with two users — add one to a group, verify badge and conversation list
5. This delivers the core fix

### Incremental Delivery

1. Setup + Foundational → Fake badge removed ✓
2. Add User Story 1 → Self-add works with real data → Core fix delivered (MVP!)
3. Add User Story 2 → Verify self-removal still works → Full add/remove coverage
4. Add User Story 3 + 4 → Edge case validation → Complete feature
5. Polish → Final lint, test, manual validation

---

## Notes

- The bulk of the work is in Phase 3 (US1) — modifying `handleMemberAdded` to use `client.query()` for self-adds
- Phase 4 (US2) is largely verification — existing code from commit b56086de already handles self-removal correctly
- Phases 5-6 (US3-US4) are validation tasks ensuring the refactoring doesn't break existing behavior
- Total new code: ~40-50 lines in `useConversationEventsSubscription.ts` + 1 new `.graphql` file
- Total removed code: ~5 lines (effectiveUnreadCount logic)
