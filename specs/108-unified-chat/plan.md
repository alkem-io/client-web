# Implementation Plan: Unified Chat

**Branch**: `108-unified-chat` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/108-unified-chat/spec.md`

## Summary

Merge the two existing MUI chat surfaces — **UserMessaging** (`src/main/userMessaging/`, direct + group chats) and the **Guidance AI chat** (`src/main/guidance/chatWidget/` + `src/main/ui/helpButton/`) — into a single CRD feature surfaced as one floating button that opens a floating card panel with a single conversation list. The Guidance AI conversation is pinned at the top of that list alongside people/group chats. All existing functionality is preserved (u2u creation, group creation + settings, reactions, realtime, unread, mark-as-read, Guidance ask + clear-context).

Technical approach (per the CRD migration guide): pure presentational components in `src/crd/components/chat/`, integration glue in `src/main/crdPages/unifiedChat/`, and data mappers as the only GraphQL↔CRD seam. The key enabler is that the Guidance conversation is *already* a normal `Conversation` in the same `UserConversations` payload — so merging is mostly **removing the existing guidance filter** (`useUserConversations.ts:57-64`), pinning guidance to the top, and giving its row/thread the AI-specific behaviors (styling, BETA/info, intro, clear-context). **No GraphQL/schema changes are required.** The feature ships behind the existing `designVersion` toggle; the MUI surfaces remain intact for legacy-design users until validation completes.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: Apollo Client (generated hooks only); shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`); `lucide-react`; `react-i18next`; `class-variance-authority`; `date-fns`. **No new runtime dependencies.**
**Storage**: N/A (frontend SPA). Client state via Apollo cache + local React state. File uploads via existing `StorageConfigContextProvider` / `useUploadFileMutation`.
**Testing**: Vitest + jsdom (`pnpm vitest run`); standalone CRD preview `pnpm crd:dev` (localhost:5200) with mock data.
**Target Platform**: Modern browsers (>90% global support per caniuse); desktop + mobile/responsive.
**Project Type**: Web SPA (single frontend project). Source under `src/crd` (presentational) + `src/main/crdPages` (integration glue).
**Performance Goals**: New realtime messages/reactions visible in an open conversation within 3s (SC-005); unread state clears within 2s of opening (SC-006); AI loading state always ends within the fixed wait window (SC-008).
**Constraints**: CRD components import zero `@mui/*`/`@emotion/*`/`@apollo/*`/`@/domain/*`/`react-router`/`formik`; props are plain TS (never generated GraphQL types); Tailwind-only styling; WCAG 2.1 AA; ships behind `designVersion` toggle with the legacy path untouched.
**Scale/Scope**: ~9 new CRD presentational components + 1 i18n namespace (6 languages); ~6 integration modules (provider, launcher, connector, mapper, 2 adapted hooks); 3 mounting edits (`root.tsx`, `CrdLayoutWrapper.tsx`, `Header.tsx`). Reuses all existing GraphQL operations and ~10 existing hooks.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Standard | Status | Notes |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | ✅ Pass | Business logic stays in `src/domain` + integration hooks under `src/main/crdPages/unifiedChat/`. CRD components are pure presentational. Mappers are the only GraphQL→props seam. |
| II. React 19 Concurrent UX | ✅ Pass | No manual memoization (React Compiler). Explicit loading/empty states (FR-026/027, edge cases). `useTransition`/optimistic considered for send. No deprecated lifecycles. |
| III. GraphQL Contract Fidelity | ✅ Pass | Reuses existing generated hooks only; **no schema change, no codegen needed**. Props are plain TS, never generated types. No `__typename` branching — guidance identified via `ActorType.VirtualContributor` + membership, schema discriminators only. |
| IV. State & Side-Effect Isolation | ✅ Pass | Persistent state in Apollo cache + a context module under `src/main/crdPages/unifiedChat/`. Subscriptions/effects isolated in the connector + dedicated hooks. |
| V. Experience Quality & Safeguards | ✅ Pass | WCAG 2.1 AA for launcher/list/thread/dialogs (focus, keyboard, ARIA); destructive actions via `ConfirmationDialog`; discard guard via `useDialogCloseGuard`; Vitest coverage for mappers + adapted hooks. |
| Arch #2 — CRD-only, MUI frozen | ✅ Pass | New UI built entirely in `src/crd/`; no new `@mui/*`/`@emotion/*` imports. MUI surfaces only *removed* (later) as the toggle flips; kept compiling via a context alias during coexistence. |
| Arch #3 — i18n CRD-first, 6-language parity | ✅ Pass | New `crd-chat` namespace with en/nl/es/bg/de/fr in the same PR; core `translation.en.json` not extended. |
| Arch #5 — No barrel exports | ✅ Pass | Explicit file-path imports throughout; no `index.ts` barrels added. |
| Arch #6 — SOLID/DRY | ✅ Pass | SRP split (launcher / panel / list / thread / bubble / dialogs; connector vs mapper vs hooks). Reuse over duplication (CommentInput, MarkdownContent, reactions, UserSelector, GroupAvatar shared by 3 consumers). |

**Result**: PASS — no violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/108-unified-chat/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (view models / prop entities)
├── quickstart.md        # Phase 1 output (dev + manual verification)
├── contracts/           # Phase 1 output
│   ├── component-props.md     # CRD presentational prop contracts
│   └── graphql-operations.md  # Reused GraphQL operations inventory (no changes)
├── checklists/
│   └── requirements.md  # From /speckit.specify
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
src/crd/
├── components/
│   └── chat/                          # NEW — pure presentational
│       ├── FloatingChatLauncher.tsx
│       ├── ChatPanel.tsx
│       ├── ChatConversationList.tsx
│       ├── ChatThreadView.tsx
│       ├── ChatMessageBubble.tsx
│       ├── GroupAvatar.tsx
│       ├── NewChatDialog.tsx
│       ├── GroupSettingsDialog.tsx
│       ├── GuidanceInfoDialog.tsx
│       └── types.ts                   # ChatListItem, ChatMessage, GroupMember, etc.
├── i18n/
│   └── chat/                          # NEW — crd-chat namespace
│       ├── chat.en.json
│       ├── chat.nl.json
│       ├── chat.es.json
│       ├── chat.bg.json
│       ├── chat.de.json
│       └── chat.fr.json
└── (reused) components/comment/CommentInput.tsx, common/MarkdownContent.tsx,
    common/EmojiPicker.tsx, common/VirtualContributorBadge.tsx,
    comment/CommentReactions.tsx, comment/ReactionPill.tsx,
    forms/UserSelector.tsx, components/dialogs/ConfirmationDialog.tsx,
    components/dialogs/useDialogCloseGuard.tsx, hooks/useMediaQuery.ts,
    primitives/{button,badge,avatar,input,scroll-area,dialog,separator,tooltip,dropdown-menu}.tsx

src/main/crdPages/unifiedChat/         # NEW — integration glue
├── UnifiedChatProvider.tsx            # context (superset of UserMessagingContext) + useUserMessagingContext alias
├── UnifiedChatLauncher.tsx            # mounts FloatingChatLauncher + lazy ChatPanel
├── UnifiedChatPanelConnector.tsx      # hooks + mapping + subscriptions; renders ChatPanel
├── dataMapper.ts                      # GraphQL → CRD props (the only seam)
├── useUnifiedConversations.ts         # adapted from useUserConversations (filter removed, guidance pinned)
└── useUnifiedConversationView.ts      # adapted from useConversationView (+ guidance clear + 45s timeout)

# Mounting edits (existing files):
src/root.tsx                           # swap CrdGuidanceChatGate + UserMessagingDialog → UnifiedChatLauncher (behind useCrdEnabled)
src/main/ui/layout/CrdLayoutWrapper.tsx# remove onMessagesClick / unreadMessagesCount wiring
src/crd/layouts/Header.tsx             # remove messages icon button
src/core/i18n/config.ts                # register 'crd-chat' in crdNamespaceImports + ns list

# Reused as-is (NOT modified) from src/main/userMessaging/ and src/main/guidance/chatWidget/:
useConversationMessages.ts, useConversationEventsSubscription.ts, models.ts,
useUnreadConversationsCount.ts, useGuidanceVcId.ts, useChatGuidanceCommunication.ts (reset/intro logic referenced),
graphql/* (all operations), + domain hooks (useSubscribeOnRoomEvents, useCommentReactionsMutations, useContributors,
useStorageConfig, useUploadFileMutation)
```

**Structure Decision**: Web SPA, two-layer split mandated by Constitution Arch #2 and the CRD migration guide — pure presentational components in `src/crd/components/chat/`, integration/data in `src/main/crdPages/unifiedChat/`. The legacy MUI `userMessaging/` and `guidance/chatWidget/` trees stay in place (some hooks reused as-is, the surfaces kept mounted behind the OFF toggle) and are removed only in a post-validation follow-up.

## Complexity Tracking

> Not required — Constitution Check passed with no violations.
