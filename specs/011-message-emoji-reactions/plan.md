# Implementation Plan: Message Emoji Reactions for User-to-User Messaging

**Branch**: `001-message-emoji-reactions` | **Date**: 2026-01-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/011-message-emoji-reactions/spec.md`

## Summary

Port emoji reaction functionality from the existing `CommentsComponent` implementation to the `UserMessagingDialog`. The existing GraphQL mutations (`addReactionToMessageInRoom`, `removeReactionToMessageInRoom`), UI components (`CommentReactions`, `ReactionView`, `EmojiSelector`), and reaction hook (`useCommentReactionsMutations`) can be reused with minimal adaptation for the direct messaging context. Refinement: for messages with zero reactions, the add-reaction control should appear as an overlay on hover/tap to avoid layout shifts and remain visible while the picker is open.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Apollo Client, MUI, emoji-picker-react, lodash
**Storage**: GraphQL API (Apollo cache)
**Testing**: Vitest
**Target Platform**: Web (Vite SPA)
**Project Type**: Web application (React SPA)
**Performance Goals**: < 1s reaction latency from user action to visual confirmation; < 2s real-time sync for other participants
**Constraints**: Visual/interaction parity with comment reactions; WCAG 2.1 AA accessibility compliance
**Scale/Scope**: All users with direct messaging access; messages with up to 20 unique emojis and 100 total reactions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                    | Status  | Evidence/Mitigation                                                                                             |
| -------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries         | ✅ PASS | Reusing existing domain facade in `src/domain/communication/room/Comments/`. No new ad-hoc state in components. |
| II. React 19 Concurrent UX Discipline        | ✅ PASS | Apollo mutations handle async; UI updates via cache. No blocking render patterns.                               |
| III. GraphQL Contract Fidelity               | ✅ PASS | Using generated hooks (`useAddReactionMutation`, `useRemoveReactionMutation`). No raw queries.                  |
| IV. State & Side-Effect Isolation            | ✅ PASS | State in Apollo cache; mutations via dedicated hook. No direct DOM manipulation.                                |
| V. Experience Quality & Safeguards           | ✅ PASS | Reusing accessible EmojiSelector; keyboard navigation inherited; parity with existing comments.                 |
| Architecture Standard 5: Import transparency | ✅ PASS | Direct module imports, no barrel exports.                                                                       |
| Architecture Standard 6: SOLID/DRY           | ✅ PASS | Reusing existing components; extracting shared types where needed.                                              |

**Gate Status**: ✅ PASS - No violations requiring mitigation.

## Project Structure

### Documentation (this feature)

```text
specs/011-message-emoji-reactions/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── graphql-updates.md
└── checklists/
    └── requirements.md  # Existing
```

### Source Code (files to modify/create)

```text
src/
├── main/
│   └── userMessaging/
│       ├── UserMessagingConversationView.tsx  # MODIFY: Add reactions to MessageBubble, add subscription
│       ├── useUserConversations.ts            # MODIFY: Include reactions in message type
│       └── graphql/
│           └── UserConversations.graphql      # MODIFY: Add reactions field to messages query
├── domain/
│   ├── collaboration/
│   │   └── callout/
│   │       └── useSubscribeOnRoomEvents.ts    # REUSE: Existing subscription hook (handles reactions)
│   └── communication/
│       └── room/
│           ├── graphql/
│           │   └── roomSubscriptions.graphql  # REUSE: Existing subscription (includes reaction events)
│           └── Comments/
│               ├── CommentReactions.tsx       # REUSE: As-is
│               ├── ReactionView.tsx           # REUSE: As-is
│               ├── useCommentReactionsMutations.ts  # REUSE: As-is
│               ├── AddReactionMutation.graphql      # REUSE: Already exists
│               └── RemoveReactionMutation.graphql   # REUSE: Already exists
└── core/
    └── ui/
        └── forms/
            └── emoji/
                └── EmojiSelector.tsx          # REUSE: As-is
```

**Structure Decision**: Minimal changes to existing architecture. Reuse established patterns from comment reactions domain. Only modify user messaging files to integrate existing components.

## Complexity Tracking

> No violations requiring justification.

---

## Implementation Phases

### Phase 1: GraphQL Query Updates

**Objective**: Include reaction data in user conversations query.

**Tasks**:

1. Update `UserConversations.graphql` to include `reactions` field on messages
2. Run `pnpm codegen` to regenerate types
3. Update `UserConversationMessage` interface in `useUserConversations.ts` to include reactions

**Exit Criteria**: Query returns reaction data; types compile successfully.

### Phase 2: UI Integration

**Objective**: Display reactions and enable add/remove interactions.

**Tasks**:

1. Update `MessageBubble` component in `UserMessagingConversationView.tsx`:
   - Add reaction display below message bubble
   - Add reaction trigger (add reaction button) with overlay-on-hover behavior when there are zero reactions to prevent layout jumps
   - Integrate `CommentReactions` component
2. Wire up `useCommentReactionsMutations` hook with conversation roomId
3. Handle permissions (`canAddReaction` based on room participation)

**Exit Criteria**: Users can see, add, and remove reactions on messages.

### Phase 3: Real-Time Updates via Subscription

**Objective**: Enable instant real-time sync using existing room subscription.

**Tasks**:

1. Import `useSubscribeOnRoomEvents` hook in `UserMessagingConversationView.tsx`
2. Call subscription with `conversation.roomId` when conversation is selected
3. Subscription automatically updates Apollo cache for reaction create/delete events
4. Remove or reduce polling interval (subscription handles real-time, polling as fallback)

**Exit Criteria**: Reactions sync instantly (< 1s) between participants via subscription.

### Phase 4: Polish & Testing

**Objective**: Ensure visual parity and accessibility.

**Tasks**:

1. Test reaction display styling matches comment reactions
2. Validate keyboard accessibility
3. Handle edge cases (deleted messages, permission changes)
4. Verify subscription reconnects after network interruption

**Exit Criteria**: All acceptance scenarios from spec pass; visual parity confirmed.

---

## Risk Assessment

| Risk                                                | Likelihood | Impact | Mitigation                                                             |
| --------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| Subscription disconnects silently                   | Low        | Medium | Existing polling (5s) serves as fallback; subscription auto-reconnects |
| Layout breakage with many reactions on chat bubbles | Low        | Medium | Test with 20+ emojis; add overflow handling if needed                  |
| Type mismatches after codegen                       | Low        | Low    | Run lint and type-check after each change                              |

---

## Dependencies

- Existing GraphQL mutations: `addReactionToMessageInRoom`, `removeReactionToMessageInRoom` ✅
- Existing UI components: `CommentReactions`, `ReactionView`, `EmojiSelector` ✅
- Existing hook: `useCommentReactionsMutations` ✅
- Existing subscription: `useSubscribeOnRoomEvents` with `roomEvents` GraphQL subscription ✅
- Subscription handles: message create/delete, reaction create/delete, cache updates ✅

---

## Estimation

| Phase                     | Estimated Effort | Confidence |
| ------------------------- | ---------------- | ---------- |
| Phase 1: GraphQL Updates  | ~30 min          | High       |
| Phase 2: UI Integration   | ~2 hours         | High       |
| Phase 3: Polish & Testing | ~1 hour          | Medium     |
| **Total**                 | **~3.5 hours**   | High       |

Confidence is high due to strong existing implementation to port from.
