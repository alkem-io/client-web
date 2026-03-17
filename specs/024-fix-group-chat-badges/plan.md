# Implementation Plan: Fix Group Chat Badge Counts & Member Event Handling

**Branch**: `024-fix-group-chat-badges` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/024-fix-group-chat-badges/spec.md`

## Summary

Remove the fake `effectiveUnreadCount` override for group conversations and implement proper `MEMBER_ADDED`/`MEMBER_REMOVED` handling for the current user. When the current user is added to a group, fetch full conversation details from the server and integrate them into both Apollo caches (full conversations + lightweight unread count). When removed, clean up both caches and ensure the nav bar badge adjusts. All other improvements from commit b56086de (immediate cache clear on read, nav bar unread sync) are preserved.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 22
**Primary Dependencies**: Apollo Client 3.x, `@apollo/client` (cache, subscriptions), React 19 hooks
**Storage**: Apollo Client normalized cache (in-memory)
**Testing**: Vitest with jsdom
**Target Platform**: Web (SPA, Vite dev server)
**Project Type**: Web application (frontend only — client-web)
**Performance Goals**: Cache updates within 2 seconds of subscription event; no unnecessary network round-trips
**Constraints**: Must use generated GraphQL hooks (`pnpm codegen`); no raw `useQuery`; no barrel exports
**Scale/Scope**: 3 files modified, 1 new GraphQL query file, codegen regeneration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | Changes are in `src/main/userMessaging/` which is the correct domain location for messaging event handling |
| II. React 19 Concurrent UX Discipline | PASS | No new components; cache updates are pure and concurrency-safe |
| III. GraphQL Contract Fidelity | PASS | New query uses generated hooks via codegen; cache updates use normalized IDs. A new `ConversationDetails.graphql` query will be added and codegen regenerated |
| IV. State & Side-Effect Isolation | PASS | All state changes go through Apollo cache; side effects are in subscription handlers (existing pattern) |
| V. Experience Quality & Safeguards | PASS | Fixes a UX bug (fake badges); no new interactive elements requiring a11y review |
| Architecture #5 (Import Transparency) | PASS | No barrel exports; all imports use explicit paths |
| Engineering #5 (Root Cause Analysis) | PASS | This feature IS the root cause fix — removing a workaround (fake unreadCount) and replacing it with proper server-driven data |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/024-fix-group-chat-badges/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (new GraphQL query)
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/main/userMessaging/
├── graphql/
│   ├── ConversationEvents.graphql          # Existing — no changes needed
│   ├── ConversationMessages.graphql        # Existing — no changes needed
│   ├── ConversationDetails.graphql         # NEW — single-conversation query with room metadata
│   ├── UserConversations.graphql           # Existing — no changes needed
│   └── UserConversationsUnreadCount.graphql # Existing — no changes needed
├── useConversationEventsSubscription.ts    # MODIFY — fix handleMemberAdded/Removed, remove fake badge
├── useUnreadConversationsCount.ts          # Existing — no changes needed (reads from cache)
├── UserMessagingConversationView.tsx       # Existing — no changes needed (mark-as-read improvements preserved)
└── useUserConversations.ts                 # Existing — no changes needed

src/core/apollo/generated/
├── apollo-helpers.ts                       # REGENERATE via codegen
├── apollo-hooks.ts                         # REGENERATE via codegen
└── graphql-schema.ts                       # REGENERATE via codegen
```

**Structure Decision**: All changes are within the existing `src/main/userMessaging/` directory. One new GraphQL file is added for the single-conversation detail query. Generated files are regenerated via `pnpm codegen`.

## Design Decisions

### D1: New `ConversationDetails` query vs refetching `UserConversations`

**Decision**: Create a new `ConversationDetails.graphql` query that fetches a single conversation by ID with the same room fields as `UserConversations`.

**Rationale**: Refetching the entire `UserConversations` list to get one new conversation is wasteful and causes unnecessary re-renders. A targeted query fetches only what's needed.

**Alternative rejected**: Using `client.refetchQueries({ include: [UserConversationsDocument] })` — simple but fetches all conversations, not just the new one.

### D2: `client.query()` for imperative fetch in subscription handler

**Decision**: Use `client.query()` with `fetchPolicy: 'network-only'` inside `handleMemberAdded` when the current user is the added member. This imperatively fetches the conversation details and then writes them to both caches.

**Rationale**: Subscription handlers are callbacks, not React components — they can't use hooks. `client.query()` is the standard Apollo pattern for imperative fetches. `network-only` ensures fresh data from server (the conversation is new to this user).

### D3: Preserve existing `handleMemberAdded` for other members

**Decision**: The existing logic (adding a member to the members array) is preserved for non-self events. The self-detection branch is added before it.

**Rationale**: The existing behavior for "someone else added to a group I'm in" is correct and tested. Only the "I was added" case needs new logic.

### D4: `handleMemberRemoved` for self — extend, don't rewrite

**Decision**: The existing self-removal logic (removes conversation from both caches) is already correct from commit b56086de. No changes needed — it already handles the unread count cache.

**Rationale**: Reviewing the current code at lines 277-310 of `useConversationEventsSubscription.ts`, the self-removal path already filters from both `UserConversationsQuery` and `UserConversationsUnreadCountQuery`. The badge computation in `useUnreadConversationsCount.ts` derives from the unread count cache, so removing the conversation automatically decrements the badge if it had unread messages.

## Complexity Tracking

> No violations to justify — Constitution Check passed cleanly.
