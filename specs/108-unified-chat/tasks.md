---
description: "Task list for Unified Chat (108-unified-chat)"
---

# Tasks: Unified Chat

**Input**: Design documents from `/specs/108-unified-chat/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD was not requested. Per Constitution Principle V (tests for non-trivial logic are mandatory), focused **unit tests for pure logic** (data mappers, the adapted conversation hooks, the guidance predicate/intro/clear behavior) ARE included. Presentational components are verified via `pnpm crd:dev` + the quickstart, not unit tests.

**Organization**: Tasks are grouped by user story. The three P1 stories (US1→US2→US3) share `ChatThreadView`, the panel connector, and the view hook, so they are largely sequential; US4/US5 (P2) are more independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5 (maps to spec user stories); Setup/Foundational/Polish carry no story label

## Path Conventions

CRD presentational: `src/crd/components/chat/`. Integration glue: `src/main/crdPages/unifiedChat/`. i18n: `src/crd/i18n/chat/`. Mounting edits: `src/root.tsx`, `src/crd/layouts/Header.tsx`, `src/main/ui/layout/CrdLayoutWrapper.tsx`, `src/core/i18n/config.ts`. Reused-as-is hooks/GraphQL live under `src/main/userMessaging/` and `src/main/guidance/chatWidget/` (NOT modified except where noted).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding all stories depend on — types, i18n namespace, string migration.

- [ ] T001 [P] Create `src/crd/components/chat/types.ts` with view-model types (`ChatListItem`, `ChatMessage`, `GroupMember`, `ChatThreadHeader`) per `specs/108-unified-chat/data-model.md`
- [ ] T002 [P] Create the `crd-chat` i18n namespace files `src/crd/i18n/chat/chat.en.json`, `chat.nl.json`, `chat.es.json`, `chat.bg.json`, `chat.de.json`, `chat.fr.json` (skeletons)
- [ ] T003 Register `crd-chat` in `src/core/i18n/config.ts` (add to `crdNamespaceImports` mirroring `crd-exploreSpaces`, and to the `ns` list) — depends on T002
- [ ] T004 Migrate `components.userMessaging.*` and relevant `chatbot.*` keys (intro, clear-chat confirm, BETA, help) into `src/crd/i18n/chat/chat.*.json` with full 6-language parity — depends on T002

**Checkpoint**: Types + i18n namespace available; no behavior yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared context, the GraphQL→props seam, the conversations data hook, and the shared composite avatar. **No user story can start until this phase is complete.**

- [ ] T005 Create `src/main/crdPages/unifiedChat/UnifiedChatProvider.tsx` — context superset of `UserMessagingContext` (`isEnabled`, `isOpen`/`setIsOpen`, `selectedConversationId`, `newlyCreatedConversationId`, `totalUnreadCount`) plus guidance state (`guidanceEnabled`, `guidanceVcId`, `guidanceConversationId`); export a `useUserMessagingContext` alias so the still-mounted MUI dialog keeps compiling
- [ ] T006 [P] Create `src/main/crdPages/unifiedChat/dataMapper.ts` — `mapConversationToListItem` (sets `isGroup`, `isGuidance` via `members.some(m=>m.id===guidanceVcId) && members.length<=2`, `pinned`), `mapMessageToChatMessage` (own/other, reactions, `timestampMs`), `mapMemberToCommentAuthor` (`isVirtualContributor` from `ActorType.VirtualContributor`, never `__typename`), `mapMembersToGroupMembers`, `injectGuidanceIntro`; reuse `mapMessageSender`/`mapMessageReactions` from `src/main/userMessaging/models.ts`
- [ ] T007 Create `src/main/crdPages/unifiedChat/useUnifiedConversations.ts` — adapted from `src/main/userMessaging/useUserConversations.ts`: **remove** the guidance filter (was lines 57–64); **sort order MUST be: guidance `pinned` first → then `newlyCreatedConversationId` → then by most-recent activity (preserving the existing newly-created-first rule)**; let guidance `unreadCount` flow into `totalUnreadCount`; uses `useGuidanceVcId` + `dataMapper` (depends on T005, T006)
- [ ] T008 [P] Create `src/crd/components/chat/GroupAvatar.tsx` — up-to-4 composite avatar on the `avatar` primitive (shared by list, thread header, group settings)
- [ ] T009 [P] Unit tests `src/main/crdPages/unifiedChat/dataMapper.test.ts` and `useUnifiedConversations.test.ts` — cover mapper purity, the guidance pin predicate (incl. the 3+-member-group-is-not-guidance edge), combined-unread count, and intro-excluded-from-unread

**Checkpoint**: Provider, mapper, conversations hook, and shared avatar ready — story work can begin.

---

## Phase 3: User Story 1 - Open one chat surface and see all conversations (Priority: P1) 🎯 MVP

**Goal**: A floating button opens a floating card panel showing one conversation list (Guidance pinned on top); selecting a conversation shows its message history; the header messages icon is gone.

**Independent Test**: Sign in (CRD on), click the floating button → panel opens to the list with Guidance pinned, search filters the list, select a conversation → read its history → back to list; confirm no header messages icon.

### Implementation

- [ ] T010 [P] [US1] Create `src/crd/components/chat/FloatingChatLauncher.tsx` (60×60 fixed bottom-right button, lucide `MessageCircle`, unread `Badge` overlay; props `unreadCount?`, `isOpen`, `hidden?`, `onClick`, `ariaLabel`)
- [ ] T011 [P] [US1] Create `src/crd/components/chat/ChatPanel.tsx` (floating card shell: `fixed`, `w-[380px]`, capped height + internal scroll, sticky-header/scrollable-body/sticky-composer; `view: 'list'|'thread'` visual state; mobile expansion via `useScreenSize` from `@/crd/hooks/useMediaQuery`)
- [ ] T012 [P] [US1] Create `src/crd/components/chat/ChatMessageBubble.tsx` (display-only: own/other layout via `isOwn`, body via `MarkdownContent`, `VirtualContributorBadge` when `author.isVirtualContributor`, reactions rendered read-only)
- [ ] T013 [US1] Create `src/crd/components/chat/ChatConversationList.tsx` (local `useState` search by `displayName`; "new message" button; rows with `GroupAvatar`, preview, unread `Badge`; guidance row placeholder styling; **an empty state when there are no conversations — shows the "New message" entry, with the pinned Guidance row still present when guidance is enabled; plus a no-search-results state**) — depends on T008
- [ ] T014 [US1] Create `src/crd/components/chat/ChatThreadView.tsx` (header with name/avatar/back, scrollable message list rendering `ChatMessageBubble`, `pendingScrollRef` auto-scroll ported from `UserMessagingConversationView`; composer/reactions added in US2) — depends on T012
- [ ] T015 [US1] Create `src/main/crdPages/unifiedChat/UnifiedChatPanelConnector.tsx` — call `useUnifiedConversations` + `useConversationMessages`, map via `dataMapper`, render `ChatPanel`(list+thread); own selection state; always open to list (FR-004a) — depends on T007, T013, T014
- [ ] T016 [US1] Create `src/main/crdPages/unifiedChat/UnifiedChatLauncher.tsx` — mount `FloatingChatLauncher` + lazy `ChatPanel`/connector; hide rules (auth route + fullscreen editor; NOT mobile). **Source the launcher unread badge from the lightweight `useUnreadConversationsCount` (runs while the panel is closed); when the panel is open, the full `useUnifiedConversations.totalUnreadCount` is authoritative. Confirm guidance is included now that the filter is removed.** — depends on T010, T011, T015
- [ ] T017 [US1] Wire mounting in `src/root.tsx` — wrap tree with `UnifiedChatProvider`; behind `useCrdEnabled()` render `<UnifiedChatLauncher/>` and stop rendering `CrdGuidanceChatGate` + `<UserMessagingDialog/>` for CRD pages; keep the MUI path when the toggle is OFF — depends on T005, T016
- [ ] T018 [US1] Remove the CRD Header messages icon + `onMessagesClick`/`unreadMessagesCount` wiring in `src/crd/layouts/Header.tsx` and `src/main/ui/layout/CrdLayoutWrapper.tsx` (combined unread now lives only on the launcher badge)

**Checkpoint**: Floating button → panel → pinned-guidance list → search → select → read history → back. Header icon gone. MVP demoable.

---

## Phase 4: User Story 2 - Converse in direct and group chats (Priority: P1)

**Goal**: Send messages, see others' messages/reactions in real time, add/remove reactions, and have unread clear on open.

**Independent Test**: Open a 1:1 and a group; send messages; from another account send a message → appears live (<3s); add/remove a reaction; open an unread conversation → unread clears and badge drops.

### Implementation

- [ ] T019 [US2] Create `src/main/crdPages/unifiedChat/useUnifiedConversationView.ts` — adapted from `src/main/userMessaging/useConversationView.ts`: send via `sendMessageToRoom`, leave, reactions via `useCommentReactionsMutations`, mark-read (guidance extensions added in US3)
- [ ] T020 [US2] Add the composer to `src/crd/components/chat/ChatThreadView.tsx` using the reused `src/crd/components/comment/CommentInput.tsx` (mentions OFF — no `mentionSearch`); add `isSending`, `onSendMessage` props
- [ ] T021 [US2] Add reaction interactivity to `src/crd/components/chat/ChatMessageBubble.tsx` (reuse `CommentReactions`/`ReactionPill` + `EmojiPicker`; `canReact`, `onAddReaction`, `onRemoveReaction`)
- [ ] T022 [US2] Wire realtime in `src/main/crdPages/unifiedChat/UnifiedChatPanelConnector.tsx` — `useConversationEventsSubscription` + `useSubscribeOnRoomEvents` keyed off `selectedRoomId`, with cache updates (created/updated/deleted, member add/remove, message received/removed, read receipt). **When the member-removed event targets the current user, remove that conversation from the list in real time and, if it is the open thread, return the panel to the list view.** — depends on T019
- [ ] T023 [US2] Wire mark-as-read on conversation open + optimistic/pending send (`isPending`) in the connector + `useUnifiedConversationView`
- [ ] T024 [US2] Verify/adjust `pendingScrollRef` auto-scroll under live `cache-and-network` updates in `ChatThreadView` (no scroll jumps when network reconciles)

**Checkpoint**: Full DM + group messaging with realtime, reactions, and unread clearing.

---

## Phase 5: User Story 3 - Use the Guidance AI assistant in the unified list (Priority: P1)

**Goal**: The pinned Guidance conversation shows intro, AI styling + BETA + info, ask with loader/wait-window, and clear-context that keeps it pinned.

**Independent Test**: Open pinned Guidance → intro shows when empty → ask a question → loader + disabled input → answer appears; slow answer ends after the wait window; open info; clear context → thread resets in place, stays pinned, fresh exchange works.

### Implementation

- [ ] T025 [US3] Extend `src/main/crdPages/unifiedChat/useUnifiedConversationView.ts` with guidance: `clearGuidance` (reuse `resetConversationVc` from `useChatGuidanceCommunication.ts:127-141`, **add `UserConversations` to `refetchQueries`**) + the 45s awaiting-response timeout/intro logic (port `CHAT_LOADER_TIMEOUT_MS` from `ChatWidgetInner`)
- [ ] T026 [US3] Wire `injectGuidanceIntro` (from `dataMapper`) into the connector for the guidance conversation (synthetic intro when history empty; never sent/read/counted)
- [ ] T027 [P] [US3] Create `src/crd/components/chat/GuidanceInfoDialog.tsx` (port `ChatWidgetHelpDialog` content — what the assistant is + BETA disclaimer — as a CRD `Dialog`)
- [ ] T028 [US3] Add guidance affordances to `src/crd/components/chat/ChatThreadView.tsx` — BETA badge, info button (`onShowGuidanceInfo`), "Clear chat" action (`onClearGuidance` via `ConfirmationDialog`), loader bubble + disabled input (`isAwaitingGuidanceResponse`); hide the group menu when `isGuidance`
- [ ] T029 [US3] Add guidance row styling to `src/crd/components/chat/ChatConversationList.tsx` (BETA badge, AI accent, info affordance on the pinned row)
- [ ] T030 [US3] Compute guidance gating in `UnifiedChatProvider`/connector — `GuidenceEngine` flag + `AccessInteractiveGuidance` privilege → `guidanceEnabled`; omit the pinned row when disabled (rest of chat still works)
- [ ] T031 [US3] After clear-context, re-resolve `guidanceConversationId` and re-point `selectedConversationId`/`selectedRoomId` + the subscription in the connector (conversation/room id may change)
- [ ] T032 [P] [US3] Unit tests in `src/main/crdPages/unifiedChat/` for `injectGuidanceIntro`, the clear-context refetch set, and guidance gating

**Checkpoint**: Guidance fully functional inside the unified list, pinned and AI-styled.

---

## Phase 6: User Story 4 - Start a new direct or group conversation (Priority: P2)

**Goal**: Search people, pick one (Direct) or many (Group), create + open the conversation at the top.

**Independent Test**: New message → one person → Direct created/opened; new message → 2+ people → Group created/opened; the new conversation appears top (below guidance).

### Implementation

- [ ] T033 [P] [US4] Create `src/crd/components/chat/NewChatDialog.tsx` (CRD `Dialog`; reuse `src/crd/forms/UserSelector.tsx` for multi-select; props per contracts)
- [ ] T034 [US4] Wire creation in the connector — `useContributors` search → `searchResults`; `CreateConversation` (single→Direct, 2+→Group); cache update; set `newlyCreatedConversationId` and open it
- [ ] T035 [US4] Hook `onNewMessage` from `ChatConversationList` to open `NewChatDialog` in the connector

**Checkpoint**: Create direct and group conversations.

---

## Phase 7: User Story 5 - Manage a group conversation (Priority: P2)

**Goal**: Rename, change avatar, add/remove members, leave — with discard guard and confirmations.

**Independent Test**: Open group settings → rename + change avatar → Save applies; closing with unsaved changes prompts; add member (immediate); remove member (confirm); leave group (removed from list).

### Implementation

- [ ] T036 [P] [US5] Create `src/crd/components/chat/GroupSettingsDialog.tsx` (CRD `Dialog`, sticky header/footer; name field, `avatarUploadSlot`, member list + add via `UserSelector`/remove; discard guard via `useDialogCloseGuard`; destructive actions via `ConfirmationDialog`)
- [ ] T037 [US5] Build the integration avatar-upload slot in the connector — `useStorageConfig` + `useUploadFileMutation` + crop + `DefaultVisualTypeConstraints`, passed as `avatarUploadSlot`
- [ ] T038 [US5] Wire group settings in the connector — `UpdateConversation` (name/avatar on Save), `AssignConversationMember`/`RemoveConversationMember` (immediate), `LeaveConversation`; `useContributors` for add-member search
- [ ] T039 [US5] Open `GroupSettingsDialog` from `ChatThreadView` via `onManageGroup` (gated by `canManage`)

**Checkpoint**: Full group management; all five stories independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates across all stories.

- [ ] T040 [P] Accessibility pass across `src/crd/components/chat/*` — launcher `aria-label` + `sr-only` unread, list rows `aria-current`, bubbles distinguished by alignment+name (not color alone), loaders `role="status"`, dialog focus traps/keyboard/Esc (WCAG 2.1 AA)
- [ ] T041 [P] i18n parity audit — all `crd-chat` keys present in en/nl/es/bg/de/fr; no hardcoded strings in chat components
- [ ] T041a [P] Unit test for the realtime cache-update reducer in `src/main/crdPages/unifiedChat/` — covers message-received append, message-removed eviction, member-removed (incl. current-user self-removal), and read-receipt unread decrement, asserting `totalUnreadCount` stays correct
- [ ] T042 Regression check — set `alkemio-design-version=1` and confirm the legacy MUI guidance widget + `UserMessagingDialog` are unchanged
- [ ] T043 [P] Mobile responsiveness verification — `ChatPanel` expansion, list/thread/composer reachable on small screens
- [ ] T044 Run `specs/108-unified-chat/quickstart.md` manual verification (19 steps mapped to acceptance scenarios)
- [ ] T045 Run `pnpm lint` + `pnpm vitest run`; confirm CRD purity (no `@mui/*`/`@emotion/*`/`@apollo/*`/`@/domain/*`/`react-router-dom`/`formik` imports in `src/crd/components/chat/*`; no `@mui/*`/`@emotion/*` in `src/main/crdPages/unifiedChat/*`)

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: after Setup; **blocks all stories**.
- **US1 (Phase 3)**: after Foundational. MVP.
- **US2 (Phase 4)**: after US1 (extends `ChatThreadView`, `ChatMessageBubble`, the connector).
- **US3 (Phase 5)**: after US2 (extends `useUnifiedConversationView`, `ChatThreadView`, the connector).
- **US4 (Phase 6)**: after US1 (needs list + connector); independent of US2/US3.
- **US5 (Phase 7)**: after US1 (settings opened from `ChatThreadView`; `GroupAvatar` foundational); independent of US2/US3/US4.
- **Polish (Phase 8)**: after all targeted stories.

### Story independence notes

- The three **P1** stories share `ChatThreadView` + the connector + the view hook, so they are realistically **sequential** (US1→US2→US3).
- The two **P2** stories (US4 dialog, US5 dialog) are mostly **independent new files** that each add one connector wiring; they can be built in parallel with each other after US1, by different developers.

### Within each story

- New presentational files marked [P] can be built together (different files).
- Connector wiring tasks depend on the components + hooks they wire and are not [P].
- Unit tests (T009, T032) can run in parallel with their sibling implementation once the target module exists.

---

## Parallel Example: Foundational + US1 presentational

```bash
# Foundational, independent files:
Task: "T006 dataMapper.ts in src/main/crdPages/unifiedChat/"
Task: "T008 GroupAvatar.tsx in src/crd/components/chat/"
Task: "T009 unit tests in src/main/crdPages/unifiedChat/"

# US1 presentational atoms (after Foundational), independent files:
Task: "T010 FloatingChatLauncher.tsx"
Task: "T011 ChatPanel.tsx"
Task: "T012 ChatMessageBubble.tsx"
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3).
2. **STOP and validate**: floating button, pinned-guidance list, search, read history, header icon removed — behind the CRD toggle, legacy path intact when OFF.
3. Demo.

### Incremental delivery

1. Foundation ready → US1 (MVP) → demo.
2. US2 (messaging) → demo. 3. US3 (guidance) → demo. 4. US4 + US5 (P2) in parallel → demo.
3. Polish (Phase 8) before opening the PR. Keep MUI behind the toggle; legacy removal is a separate post-validation follow-up.

---

## Notes

- No GraphQL/schema changes; **no `pnpm codegen`**. No new runtime dependencies.
- All new strings go to `crd-chat` (6-language parity); core `translation.en.json` stays frozen.
- Guidance identity uses `ActorType.VirtualContributor` + membership, never `__typename`.
- Commit after each task or logical group; keep `src/crd` purity intact at every step.
