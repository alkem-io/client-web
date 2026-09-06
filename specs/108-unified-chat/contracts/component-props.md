# Contract: CRD Presentational Component Props

These are the public prop contracts for the new `src/crd/components/chat/` components. All are **pure presentational**: props in, callbacks out, Tailwind only, no MUI/Apollo/domain/router/formik, plain-TS props (no generated GraphQL types). Event handlers are props; components never navigate, fetch, or mutate. (Constitution Arch #2, ISP/DIP.)

Types referenced below are defined in `src/crd/components/chat/types.ts` (see data-model.md) or reused from `src/crd/components/comment/types.ts` / `src/crd/forms/UserSelector.tsx`.

## FloatingChatLauncher
```ts
type FloatingChatLauncherProps = {
  unreadCount?: number;     // 0/undefined → no badge
  isOpen: boolean;          // toggles open/close icon state
  hidden?: boolean;         // suppressed on auth route / fullscreen editor (consumer also passes isSmallScreen && isOpen)
  onClick: () => void;
  ariaLabel: string;        // i18n-provided by consumer
};
```
- Fixed bottom-right circular button (`size-12`, `bottom-20 right-4` / `lg:bottom-4`; lucide `MessageCircle`), unread `Badge` overlay. No internal routing/state beyond hover. **Since 2026-08-21 the button is `hidden sm:flex` — it does not render below 640px; on phones chat opens from the header messages icon.**

## ChatPanel
```ts
type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
  // content: the connector passes the list + thread; panel owns only which pane is visible
  view: 'list' | 'thread';
  onBackToList: () => void;
  listSlot: ReactNode;      // <ChatConversationList/>
  threadSlot: ReactNode;    // <ChatThreadView/>
};
```
- Floating card (`fixed`, `w-[380px]`, capped height, internal scroll); mobile expands toward full-screen via `useScreenSize` (reached from the header messages icon there — the launcher is hidden < 640px). Sticky-header / scrollable-body / sticky-composer layout. NOT a modal overlay.

## ChatConversationList
```ts
type ChatConversationListProps = {
  conversations: ChatListItem[];        // pre-sorted: guidance pinned first
  selectedConversationId?: string;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  onNewMessage: () => void;
};
```
- Search is **local `useState`** filtering `conversations` by `displayName`. During an active search, pinned guidance is filtered like any row (clarification). Reuses `avatar`, `input`, `badge`, `scroll-area`, `GroupAvatar`. Guidance row shows BETA badge + info affordance + AI accent.

## ChatThreadView
```ts
type ChatThreadViewProps = {
  conversation?: ChatThreadHeader;
  messages: ChatMessage[];
  messagesLoading: boolean;
  currentUser?: CommentAuthor;
  isSending?: boolean;
  canReact: boolean;
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, reactionId: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  // group actions (only when conversation.isGroup && canManage)
  onManageGroup?: () => void;
  onLeaveGroup?: () => void;
  // guidance actions (only when conversation.isGuidance)
  onClearGuidance?: () => void;
  onShowGuidanceInfo?: () => void;
  isAwaitingGuidanceResponse?: boolean; // loader bubble + disabled input
};
```
- Composer = reused `CommentInput` (mentions OFF for DM/group), rendered with `refocusAfterSubmit` so focus returns to the input once the composer re-enables after a send (FR-014a) — covers both the Enter path (the in-flight `disabled` blurs the textarea) and the send-button path (focus lands on the button, which then disables). Auto-scroll reproduces `pendingScrollRef` logic. Renders `ChatMessageBubble` per message.

## ChatMessageBubble
```ts
type ChatMessageBubbleProps = {
  message: ChatMessage;
  canReact: boolean;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
};
```
- Left/right by `message.isOwn`. Reuses `MarkdownContent`, `CommentReactions`/`ReactionPill` + `EmojiPicker`, `VirtualContributorBadge` (when `message.author?.isVirtualContributor`).
- `canReact` MUST be false for the synthetic Guidance intro message and for optimistic/pending messages (`message.isPending`), per spec FR-016a.

## GroupAvatar
```ts
type GroupAvatarProps = {
  members: { id: string; name: string; avatarUrl?: string }[]; // up to 4 rendered
  size?: 'sm' | 'md' | 'lg';
};
```

## NewChatDialog
```ts
type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchResults: ShareUser[];
  selected: ShareUser[];
  loading?: boolean;
  creating?: boolean;
  onSearchChange: (query: string) => void;
  onSelectionChange: (users: ShareUser[]) => void;
  onCreate: () => void;   // single → Direct, 2+ → Group (decided by connector)
};
```
- Reuses `UserSelector`. CRD `Dialog`.

## GroupSettingsDialog
```ts
type GroupSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  members: GroupMember[];
  currentUserId: string;
  avatarUploadSlot: ReactNode;            // integration-supplied (crop + storage)
  memberSearchResults: ShareUser[];
  onMemberSearchChange: (query: string) => void;
  onAddMember: (userId: string) => void;     // immediate
  onRemoveMember: (userId: string) => void;   // immediate, confirmed
  onSave: () => void;                          // name/avatar pending-until-save
  onLeaveGroup: () => void;                    // confirmed
  saving?: boolean;
};
```
- Discard guard via `useDialogCloseGuard`; destructive actions via `ConfirmationDialog`.

## GuidanceInfoDialog
```ts
type GuidanceInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // body content is i18n (crd-chat); BETA disclaimer + what-the-assistant-is
};
```

## Invariants (apply to every component above)
- No import from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo`, `@/domain/*`, `react-router-dom`, `formik`.
- No generated GraphQL types in props.
- All `on*` are required behavior seams; the component performs no side effects beyond visual `useState`.
- Strings via `useTranslation('crd-chat')`; no hardcoded copy.
