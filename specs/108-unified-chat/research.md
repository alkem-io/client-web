# Phase 0 Research: Unified Chat

The technical approach was supplied in detail with the `/speckit.plan` input and grounded against the existing code. There were no open `NEEDS CLARIFICATION` items in the Technical Context; the decisions below record the resolved choices, their rationale, and the alternatives rejected.

## D1. Panel surface: floating card vs. Radix Sheet/Dialog modal

- **Decision**: A lightweight **floating card** anchored bottom-right above the launcher (`fixed`, fixed width e.g. `w-[380px]`, capped height with internal scroll), NOT a Radix `Dialog`/`Sheet` modal. On mobile it expands toward full-screen via `useScreenSize` (`@/crd/hooks/useMediaQuery`).
- **Rationale**: Matches the confirmed product decision (spec A-003) and the current guidance widget feel — a persistent, non-blocking surface with no full-screen overlay. The list↔thread swap happens *within* the card.
- **Alternatives rejected**: Radix `Sheet` side-drawer (wrong affordance for a launcher-anchored popover; adds a modal overlay that blocks the page); centered `Dialog` (modal, breaks the "floating" intent). Radix dialogs are still used for the *secondary* dialogs (NewChat, GroupSettings, GuidanceInfo) which are genuinely modal.

## D2. Guidance surfacing: remove the filter vs. query guidance separately

- **Decision**: **Remove** the guidance filter in the adapted `useUnifiedConversations` (was `useUserConversations.ts:57-64`) so the existing guidance `Conversation` from the `UserConversations` payload appears in the same list; pin it first. Keep `useGuidanceVcId` only to *identify* (and style/pin) the guidance row.
- **Rationale**: Guidance is already in the same payload — removing the filter is zero-fetch and avoids any merge/dedup. A separate `ConversationWithGuidanceVc` query risks the same conversation appearing twice and complicates sort + unread.
- **Guidance identity predicate**: `members.some(m => m.id === guidanceVcId) && members.length <= 2`. A 3+ member group that happens to include the VC stays a normal group (spec FR-032, edge case).
- **Alternatives rejected**: Separate query + client-side merge (double-listing risk, extra request, more state).

## D3. Combined unread semantics

- **Decision**: The badge counts **conversations with ≥1 unread message** (Guidance counts as one), matching the existing `totalUnreadCount` behavior (`conversations.filter(c => c.unreadCount > 0).length`). Clarified in spec (Session 2026-06-12) and FR-033.
- **Rationale**: Preserves current behavior; the lightweight `useUnreadConversationsCount` already counts the same way, and with the filter gone guidance flows in automatically. The synthetic intro message is not server-backed, so it never inflates unread (FR-034).
- **Alternatives rejected**: Sum of unread messages (behavior change, larger numbers); dot-only (loses information users have today).

## D4. Message rendering: dedicated bubble vs. reusing CommentItem

- **Decision**: New `ChatMessageBubble.tsx` laid out left/right by `isOwn`, **reusing internally** `MarkdownContent` (`src/crd/components/common/MarkdownContent.tsx`), `CommentReactions`/`ReactionPill` + `EmojiPicker` (`src/crd/components/common/EmojiPicker.tsx`), and `VirtualContributorBadge` (`src/crd/components/common/VirtualContributorBadge.tsx`, gated by `author.isVirtualContributor`).
- **Rationale**: `CommentItem` is a fixed left-aligned threaded layout; a chat surface needs own-right/other-left bubbles. A thin bubble that composes the same primitives is cleaner than bending `CommentItem` and keeps DRY at the primitive level.
- **Composer**: reuse `src/crd/components/comment/CommentInput.tsx` as-is (rich text, emoji, Enter-to-send). DM/group keep **mentions off** (pass no `mentionSearch`) to match current product (spec A-006).
- **Alternatives rejected**: Forcing `CommentItem` into a chat layout (props/styling fight); a brand-new composer (would duplicate CommentInput).

## D5. Auto-scroll under cache-and-network

- **Decision**: Reproduce the `pendingScrollRef` scroll-to-bottom logic from the MUI `UserMessagingConversationView` inside `ChatThreadView`.
- **Rationale**: The conversation list uses `cache-and-network`; naive scroll-on-render causes jumps/races when the network result reconciles. The existing logic already solves this; porting it avoids re-discovering the bug.
- **Alternatives rejected**: `scrollIntoView` on every render (janky); virtualized list (over-engineering for current message volumes, new dependency).

## D6. Clear-guidance context wiring

- **Decision**: Reuse `resetConversationVc` (logic at `useChatGuidanceCommunication.ts:127-141`) behind a "Clear chat" action in the guidance thread header, confirmed via CRD `ConfirmationDialog`. **Required change**: add `UserConversations` to the reset's `refetchQueries` (the unified list is driven by it, not `ConversationWithGuidanceVc`), and have the connector **re-resolve `guidanceConversationId` and re-point `selectedConversationId`/`selectedRoomId` + the subscription** after reset, since the conversation/room id may change. Guidance stays pinned after clearing (FR-030).
- **Rationale**: The reset recreates the VC conversation context; the open thread + list + subscription must follow the new id. Minimal, root-cause change rather than a refetch-everything hammer.
- **Alternatives rejected**: Full panel reload (loses scroll/state, jarring); leaving the old refetch set (stale list, dangling subscription on a deleted room).

## D7. Mounting & gating

- **Decision**: Behind `useCrdEnabled()`, replace `CrdGuidanceChatGate` + the MUI `<UserMessagingDialog/>` with a single `<UnifiedChatLauncher/>` in `root.tsx`. Remove the CRD Header messages icon + `onMessagesClick`/`unreadMessagesCount` wiring (`Header.tsx`, `CrdLayoutWrapper.tsx`). Keep hide rules for auth route + fullscreen editor, but **do not hide on mobile** (the unified chat is the only messaging surface). When guidance is disabled (flag/privilege off) omit the pinned row; the rest works. Keep a `useUserMessagingContext` alias so the still-mounted MUI dialog compiles while the toggle is OFF.
- **Rationale**: Single entry point per the product decision (FR-002); coexistence keeps the legacy path intact (FR-036) until validation. Gating mirrors `PlatformHelpButton` (`GuidenceEngine` flag + `AccessInteractiveGuidance` privilege).
- **Alternatives rejected**: Removing the MUI surfaces now (breaks legacy toggle users); keeping the header icon (contradicts the single-entry decision).

## D8. i18n strategy

- **Decision**: New `crd-chat` namespace at `src/crd/i18n/chat/chat.{en,nl,es,bg,de,fr}.json`, registered in `crdNamespaceImports` in `src/core/i18n/config.ts` (mirroring `crd-exploreSpaces` at config.ts:74). Migrate `components.userMessaging.*` + the relevant `chatbot.*` keys (intro, clear-chat confirm, BETA, help) into it with full 6-language parity. Do not extend core `translation.en.json`.
- **Rationale**: Constitution Arch #3 (CRD-first i18n, core frozen). Lazy-loaded per-feature namespace matches existing CRD pattern.
- **Alternatives rejected**: Reusing core keys (frozen); a shared `crd-common` (chat strings are feature-specific).

## D9. Avatar upload in group settings

- **Decision**: `GroupSettingsDialog` stays pure and receives an integration-supplied `avatarUploadSlot: ReactNode`. Crop + `useStorageConfig` + `useUploadFileMutation` + `DefaultVisualTypeConstraints` live in the integration layer.
- **Rationale**: Upload/crop/storage are domain concerns forbidden inside `src/crd`. The slot keeps the component pure while reusing existing upload infrastructure.
- **Alternatives rejected**: An `onAvatarFileSelected(file)` prop that pulls storage logic toward CRD (leaks domain concerns); a new CRD uploader (duplicates domain upload).

## Resolved unknowns

All Technical Context fields are concrete; no `NEEDS CLARIFICATION` remain. "Expected wait window" for the assistant = the existing fixed timeout (`CHAT_LOADER_TIMEOUT_MS`, 45s) ported from `ChatWidgetInner` (spec A-007).
