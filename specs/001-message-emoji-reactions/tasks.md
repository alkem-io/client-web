# Tasks: Message Emoji Reactions for User-to-User Messaging

**Input**: Design documents from `/specs/001-message-emoji-reactions/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in the feature specification. Test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app root**: `src/` at repository root
- **User messaging**: `src/main/userMessaging/`
- **Domain communication**: `src/domain/communication/room/`
- **Domain collaboration**: `src/domain/collaboration/callout/`

---

## Phase 1: Setup (GraphQL & Type Infrastructure)

**Purpose**: Update GraphQL query to include reactions and regenerate types

- [x] T001 Add `reactions` field to messages query in src/main/userMessaging/graphql/UserConversations.graphql
- [x] T002 Run `pnpm codegen` to regenerate TypeScript types from updated GraphQL schema
- [x] T003 Update `UserConversationMessage` interface to include `reactions` array in src/main/userMessaging/useUserConversations.ts
- [x] T004 Update message mapping in `useMemo` to include `reactions` field in src/main/userMessaging/useUserConversations.ts

**Checkpoint**: Query returns reaction data; types compile successfully (`pnpm lint:prod`)

---

## Phase 2: User Story 1 - Add Emoji Reaction to Chat Message (Priority: P1) 🎯 MVP

**Goal**: Enable users to add emoji reactions to messages in direct message conversations

**Independent Test**: Open a direct message conversation, hover over any message, click the reaction trigger, select an emoji from the picker, and verify the reaction appears on the message immediately.

### Implementation for User Story 1

- [x] T005 [US1] Import `CommentReactions` component in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T006 [US1] Import `useCommentReactionsMutations` hook in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T007 [US1] Initialize `useCommentReactionsMutations` with `conversation?.roomId` in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T008 [US1] Create `handleAddReaction` callback function that calls `addReaction({ emoji, messageId })` in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T009 [US1] Update `MessageBubble` props interface to accept `canAddReaction`, `onAddReaction`, and `reactions` in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T010 [US1] Add `CommentReactions` component below message bubble with reaction trigger in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T011 [US1] Pass reaction props to `MessageBubble` component in message list render in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T010a [US1] Add overlay-on-hover reaction trigger for messages with zero reactions to avoid layout shifts and keep the trigger visible while the picker is open in src/main/userMessaging/UserMessagingConversationView.tsx

**Checkpoint**: Users can add emoji reactions to messages. Reactions display with count of 1.

---

## Phase 3: User Story 2 - Remove Own Emoji Reaction (Priority: P1)

**Goal**: Enable users to remove their own reactions from messages

**Independent Test**: Add a reaction to a message, then click the same emoji again, and verify the reaction is removed.

### Implementation for User Story 2

- [x] T012 [US2] Create `handleRemoveReaction` callback function that calls `removeReaction(reactionId)` in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T013 [US2] Update `MessageBubble` props interface to accept `onRemoveReaction` callback in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T014 [US2] Pass `onRemoveReaction` prop to `CommentReactions` component in src/main/userMessaging/UserMessagingConversationView.tsx

**Checkpoint**: Users can remove their own reactions. Count updates correctly when removed.

---

## Phase 4: User Story 3 - View Aggregated Reactions with Counts (Priority: P2)

**Goal**: Display all emoji reactions with counts and user tooltips

**Independent Test**: Have multiple users react to the same message with various emojis and verify the display shows each unique emoji with its correct count and tooltip with user names.

### Implementation for User Story 3

- [ ] T015 [US3] Verify `CommentReactions` component displays aggregated counts per emoji (inherits from existing implementation) - no code changes expected
- [ ] T016 [US3] Verify reaction tooltips show sender names on hover (inherits from existing `ReactionView` component) - no code changes expected
- [ ] T017 [US3] Test emoji ordering consistency matches comment reaction ordering rules

**Checkpoint**: Aggregated reactions display correctly with counts and tooltips.

---

## Phase 5: User Story 4 - Real-Time Reaction Updates (Priority: P2)

**Goal**: Enable instant real-time sync of reactions between participants via subscription

**Independent Test**: Have two users open the same conversation simultaneously; when one adds a reaction, the other should see it appear within 2 seconds without refreshing.

### Implementation for User Story 4

- [x] T018 [US4] Import `useSubscribeOnRoomEvents` hook in src/main/userMessaging/UserMessagingConversationView.tsx
- [x] T019 [US4] Call `useSubscribeOnRoomEvents(conversation?.roomId)` when conversation is selected in src/main/userMessaging/UserMessagingConversationView.tsx
- [ ] T020 [US4] Verify subscription automatically updates Apollo cache for reaction create/delete events

**Checkpoint**: Reactions sync instantly (< 2s) between participants via subscription.

---

## Phase 6: User Story 5 - Keyboard-Accessible Reactions (Priority: P3)

**Goal**: Ensure full keyboard accessibility for reaction controls

**Independent Test**: Navigate to reaction trigger with Tab, open picker with Enter, navigate emojis with arrow keys, select with Enter, and verify reaction is added.

### Implementation for User Story 5

- [ ] T021 [US5] Verify reaction trigger is focusable via Tab key navigation (inherits from `EmojiSelector` component) - no code changes expected
- [ ] T022 [US5] Verify emoji picker opens on Enter/Space key (inherits from existing implementation) - no code changes expected
- [ ] T023 [US5] Verify arrow key navigation works in emoji picker (inherits from `emoji-picker-react`) - no code changes expected
- [x] T024 [US5] Add `aria-label` to reaction trigger button if missing for screen reader support in src/main/userMessaging/UserMessagingConversationView.tsx

**Checkpoint**: All reaction controls pass keyboard accessibility test.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, visual parity, and final validation

- [ ] T025 [P] Verify reaction styling (size, spacing, color, hover states) matches comment reactions in src/main/userMessaging/UserMessagingConversationView.tsx
- [ ] T026 [P] Handle edge case: hide reaction trigger for deleted messages in src/main/userMessaging/UserMessagingConversationView.tsx
- [ ] T027 [P] Handle edge case: verify users without conversation access cannot add reactions (natural gate via query)
- [ ] T028 Test with 20+ unique emojis to verify layout doesn't break (overflow handling)
- [ ] T029 Verify subscription reconnects after network interruption (inherits from existing subscription infrastructure)
- [ ] T030 Run `pnpm lint:prod` to verify no type errors or lint issues
- [ ] T031 Run quickstart.md validation scenarios

**Checkpoint**: All acceptance scenarios from spec pass; visual parity confirmed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup (Phase 1) - GraphQL types must be available
- **User Story 2 (Phase 3)**: Depends on User Story 1 - needs reaction mutation infrastructure
- **User Story 3 (Phase 4)**: Depends on User Story 1 - needs reactions to be displayed first
- **User Story 4 (Phase 5)**: Depends on User Story 1 - needs basic reaction display first
- **User Story 5 (Phase 6)**: Depends on User Story 1 - needs reaction UI to test accessibility
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

| Story                    | Depends On | Can Start After  |
| ------------------------ | ---------- | ---------------- |
| US1 (Add Reaction)       | Setup      | Phase 1 complete |
| US2 (Remove Reaction)    | US1        | Phase 2 complete |
| US3 (Aggregated Display) | US1        | Phase 2 complete |
| US4 (Real-Time Updates)  | US1        | Phase 2 complete |
| US5 (Keyboard Access)    | US1        | Phase 2 complete |

### Within Each User Story

- Tasks within a story should be completed sequentially unless marked [P]
- Complete story before marking as done
- Verify story checkpoint before moving to next phase

### Parallel Opportunities

- T001 and T003/T004 cannot run in parallel (T003/T004 depend on codegen output from T002)
- T005, T006 can run in parallel (different imports, same file)
- US3, US4, US5 can start in parallel after US1 completes (different concerns, minimal file overlap)
- T025, T026, T027 can run in parallel (different edge cases)

---

## Parallel Example: User Story 1

```bash
# Sequential (required order):
T001 → T002 → T003 → T004

# Then US1 implementation:
T005 + T006 (parallel - imports)
T007 → T008 → T009 → T010 → T011 (sequential - building on each other)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: User Story 1 - Add Reactions (T005-T011)
3. Complete Phase 3: User Story 2 - Remove Reactions (T012-T014)
4. **STOP and VALIDATE**: Test adding and removing reactions
5. Deploy/demo if ready - this is a viable MVP!

### Incremental Delivery

1. Setup → Types ready
2. Add US1 (Add Reaction) → Test → Core feature works
3. Add US2 (Remove Reaction) → Test → **MVP Complete** 🎯
4. Add US4 (Real-Time) → Test → Better UX
5. Add US3 (Aggregated Display) → Test → Full visual parity
6. Add US5 (Keyboard Access) → Test → Accessibility complete
7. Polish → Final validation

### Estimated Effort (from plan.md)

| Phase                      | Estimated Effort |
| -------------------------- | ---------------- |
| Phase 1: Setup             | ~30 min          |
| Phase 2-3: US1 + US2 (MVP) | ~1.5 hours       |
| Phase 4-6: US3 + US4 + US5 | ~1 hour          |
| Phase 7: Polish            | ~30 min          |
| **Total**                  | **~3.5 hours**   |

---

## Notes

- [P] tasks = different files or concerns, no dependencies
- [Story] label maps task to specific user story for traceability
- Most UI components are reused from existing comment reactions - minimal new code
- Subscription hook handles cache updates automatically
- Verify `pnpm lint:prod` passes after each phase
- Commit after each task or logical group
