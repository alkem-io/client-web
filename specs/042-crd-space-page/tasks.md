# Tasks: CRD Space L0 Page Migration (with Callouts)

**Input**: Design documents from `/specs/042-crd-space-page/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Visual Reference**: `prototype/src/app/components/space/` — CRD components visually match the prototype's design (layout, spacing, styling). Code architecture follows CRD conventions (plain TS props, no business logic, Tailwind).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n namespace, shared primitives, and translation files

- [X] T001 [P] Create i18n translation file `src/crd/i18n/space/space.en.json` with keys for banner, tabs, callout labels, contribution labels, comment labels, about page labels, visibility notices, mobile actions, form labels, and accessibility labels
- [X] T002 [P] Create translation files for remaining languages: `src/crd/i18n/space/space.{bg,de,es,fr,nl}.json`
- [X] T003 Register `crd-space` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports` with lazy imports for all 6 languages; add type declaration in `@types/i18next.d.ts`
- [X] T004 [P] Port `card.tsx` primitive (Card, CardHeader, CardContent, CardFooter, CardTitle, CardAction, CardDescription) from `prototype/src/app/components/ui/card.tsx` to `src/crd/primitives/card.tsx`
- [X] T005 [P] Port `separator.tsx` primitive from prototype to `src/crd/primitives/separator.tsx`
- [X] T006 [P] Port `sheet.tsx` primitive (Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle) from prototype to `src/crd/primitives/sheet.tsx` — needed for mobile tab overflow drawer
- [X] T007 [P] Verify `avatar.tsx`, `badge.tsx`, `button.tsx`, `skeleton.tsx` primitives exist and match prototype versions; port any missing sub-components
- [X] T008 [P] Create `src/crd/components/common/MarkdownContent.tsx` — renders sanitized HTML string with Tailwind prose classes; accepts `content: string`, `className?`
- [X] T009 [P] Create `src/crd/components/common/ExpandableDescription.tsx` — truncated text with expand/collapse toggle; accepts `description: string`, `maxLines?: number`, `editHref?`, `canEdit?`, `onEdit?`
- [X] T010 [P] Create `src/crd/components/common/ContentBlock.tsx` — generic block with optional accent border, title, actions slot, and children

---

## Phase 2: Page Shell — Layout, Header, Tabs (US1)

**Goal**: CRD page shell visually matches prototype's SpaceShell + SpaceHeader + SpaceNavigationTabs

**Visual reference**: `prototype/.../SpaceShell.tsx` (12-col grid), `SpaceHeader.tsx` (320px hero), `SpaceNavigationTabs.tsx` (text tabs)

- [X] T011 Create `src/crd/layouts/SpaceShell.tsx` — 12-col grid layout matching prototype: `grid-cols-12 gap-6`, sidebar at `lg:col-start-2 lg:col-span-2` (hidden on mobile), content at `col-span-12 lg:col-span-8`; accepts `header: ReactNode`, `sidebar: ReactNode`, `tabs: ReactNode`, `breadcrumbs?: ReactNode` (FR-008), `children: ReactNode`
- [X] T012 Create `src/crd/components/space/SpaceHeader.tsx` — 320px hero banner matching prototype: background-image with gradient overlay, title + tagline at bottom-left with optional Home Space pin (FR-011, `isHomeSpace?` prop), member avatar stack at bottom-right, action icons (Documents, Video, Share, Settings) at top-right aligned to inner 12-col grid; accepts `title`, `tagline?`, `bannerUrl?`, `isHomeSpace?`, `memberAvatars: { url?; initials }[]`, `memberCount`, `actions: SpaceHeaderActions`, `onMemberClick?`
- [X] T013 Create `src/crd/components/space/SpaceNavigationTabs.tsx` — Desktop: text-only horizontal scroll tabs matching prototype (no icons, `border-b-2` active indicator, scroll-into-view on active); Mobile (`isSmallScreen`): fixed bottom bar with tab buttons + "More" overflow drawer using Sheet primitive (per spec FR-093); accepts `tabs: { label; index }[]`, `activeIndex`, `onTabChange`, `mobileActions?: { label; icon; onClick }[]`
- [X] T014 Create `src/crd/components/space/SpaceVisibilityNotice.tsx` — alert bar for Archived/Demo/Inactive spaces (not in prototype, required by spec FR-007); colored banner below header; accepts `status: 'active' | 'archived' | 'demo' | 'inactive'`, `contactHref?`
- [X] T015 Create `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` — maps SpaceContext data to `SpaceBannerData`, `SpaceVisibilityData`, `SpaceTabActionConfig`, `SpaceLeadData`, `SpaceDashboardNavItem`, `CalendarEventData` types
- [X] T016 Create `src/main/crdPages/space/hooks/useCrdSpaceTabs.ts` — wraps existing `useSpaceTabs()`, maps Innovation Flow states to `{ label; index }[]` tab definitions, replaces MUI icons with lucide-react equivalents
- [X] T017 Create `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` — integration: wires SpaceShell + SpaceHeader + SpaceNavigationTabs + SpaceVisibilityNotice with data from `useSpace()`, `useCrdSpaceTabs()`, `spacePageDataMapper`; maps `spaceHierarchyPath` to breadcrumbs (FR-008); passes sidebar variant based on active tab; renders `<Outlet />`
- [X] T018 Create `src/main/crdPages/space/routing/CrdSpaceRoutes.tsx` — mirrors SpaceRoutes: wraps in SpaceContextProvider, uses CrdSpacePageLayout as layout, routes for `/about`, `/` (index), `/collaboration/:calloutNameId`, `/settings/*`, `/challenges/:subspaceNameId/*`, legacy redirects
- [X] T019 Create `src/main/crdPages/space/tabs/CrdSpaceTabbedPages.tsx` — tab content router: section-type mapping (D4) — 0=Dashboard, 1=Community, 2=Subspaces, 3+=Custom; not hardcoded positional switch
- [X] T020 Update `src/main/routing/TopLevelRoutes.tsx` — CRD route toggle for `:spaceNameId/*`: when `crdEnabled`, wrap in CrdLayoutWrapper and route to CrdSpaceRoutes; when disabled, keep SpaceRoutes

**Checkpoint**: Route toggle works. CRD page shows 12-col grid, 320px hero banner, text tabs, sidebar area. MUI still works with toggle off.

---

## Phase 3: Sidebar — Variant-Based Component (US1, US2, US5)

**Goal**: Single variant-based sidebar visually matching prototype's SpaceSidebar

**Visual reference**: `prototype/.../SpaceSidebar.tsx` — InfoBlock (primary bg), SubspacesSection, EventsSection, LeadBlock, VirtualContributorsSection, CommunityGuidelinesSection, KnowledgeIndexSection

- [X] T021 [P] Create `src/crd/components/space/sidebar/InfoBlock.tsx` — primary-colored description block with "Read more"; matches prototype (bg-primary, primary-foreground, rounded-lg p-5)
- [X] T022 [P] Create `src/crd/components/space/sidebar/SubspacesSection.tsx` — avatar + name list with "Show all" link and settings icon; accepts `subspaces: { name; initials; color; href }[]`, `showAll?`, `showAllHref?`
- [X] T023 [P] Create `src/crd/components/space/sidebar/EventsSection.tsx` — collapsible events + "Show calendar" link + add button; accepts `events: { title; date }[]`, `onShowCalendar?`, `onAddEvent?`
- [X] T024 [P] Create `src/crd/components/space/sidebar/LeadBlock.tsx` — lead user card: avatar, name, MapPin location, bio; matches prototype LeadBlock (bg-card, border, rounded-lg)
- [X] T025 [P] Create `src/crd/components/space/sidebar/VirtualContributorsSection.tsx` — Bot icon header, avatar + name + description per item; matches prototype
- [X] T026 [P] Create `src/crd/components/space/sidebar/CommunityGuidelinesSection.tsx` — BookOpen header, bulleted list with ShieldCheck icons; matches prototype
- [X] T027 [P] Create `src/crd/components/space/sidebar/KnowledgeIndexSection.tsx` — FolderOpen header, scrollable entry list with FileText icons; accepts `entries: { id; title; type }[]`, `onEntryClick?`
- [X] T028 Create `src/crd/components/space/SpaceSidebar.tsx` — variant-based: `'home'` → InfoBlock + About button + SubspacesSection + EventsSection; `'community'` → InfoBlock + LeadBlock + Contact/Invite buttons + VirtualContributorsSection + CommunityGuidelinesSection; `'subspaces'` → InfoBlock + SubspacesSection(showAll); `'knowledge'` → InfoBlock + About button + KnowledgeIndexSection + EventsSection

**Checkpoint**: Each sidebar variant renders correctly matching prototype visual style (primary InfoBlock, uppercase 11px headers, hover states, avatar sizing).

---

## Phase 4: Content Components — Feed, Members, Subspaces (US2, US3, US4)

**Goal**: PostCard, SpaceFeed, SpaceMembers, and SpaceSubspacesList visually match prototype

**Visual reference**: `prototype/.../PostCard.tsx` (Card with author header, 4 content types), `SpaceFeed.tsx`, `SpaceMembers.tsx`, `SpaceSubspacesList.tsx`

- [X] T029 Create `src/crd/components/space/PostCard.tsx` — Card matching prototype: author avatar + name + role Badge + timestamp header, title (text-lg font-bold), snippet (line-clamp-3), type-specific content preview (text → nothing, whiteboard → image + "Open Whiteboard" overlay, collection → 2x2 item grid, call-for-whiteboards → thumbnail grid + "+N" overlay), comments footer with MessageSquare; accepts `PostCardData` with `type: 'text' | 'whiteboard' | 'collection' | 'call-for-whiteboards'`, `onClick?`, `onSettingsClick?`, `onExpandClick?`; uses Card/CardHeader/CardContent/CardFooter primitives
- [X] T030 Create `src/crd/components/space/SpaceFeed.tsx` — vertical PostCard list matching prototype: title header + "Add Post" button, `space-y-6` card list, "Show More" button; accepts `title`, `posts: PostCardData[]`, `canCreate?`, `onCreateClick?`, `loading?`, `onShowMore?`, `hasMore?`; skeleton loading state; reusable across all tabs
- [X] T031 Create `src/crd/components/space/SpaceMembers.tsx` — search + role filter pills + paginated grid matching prototype: search input, filter buttons (All/Host/Admin/Lead/Member/Organization), responsive grid (1/2/3 cols), UserCard and OrgCard sub-components, pagination (prev/next); accepts `members: MemberCardData[]`, `filters?`, `pageSize?`
- [X] T032 Create `src/crd/components/space/SpaceSubspacesList.tsx` — status filter + SpaceCard grid matching prototype: header + "Create Subspace" button, filter buttons (All/Active/Archived), responsive grid, empty state (dashed border + FolderOpen icon); accepts `subspaces: SubspaceListCardData[]`, `canCreate?`, `onCreateClick?`; tag-based filtering (FR-030) reuses existing SpaceCard tag mechanism from 039 — pass `selectedTags?` and `onTagSelect?` props to enable filtering by tags displayed on cards

### Callout-specific components (hybrid decision D-proto-4 — not PostCard style):

- [X] T033 [P] Create `src/crd/components/callout/CalloutWhiteboardPreview.tsx` — preview image + "Open Whiteboard" button; accepts `previewUrl?`, `onOpen`
- [X] T034 [P] Create `src/crd/components/callout/CalloutPoll.tsx` — question + votable option buttons with progress bars, counts, percentages; accepts `question`, `options: PollOption[]`, `canVote`, `onVote`
- [X] T035 [P] Create `src/crd/components/callout/CalloutMediaGallery.tsx` — image grid + upload placeholder for editors; accepts `images: MediaImage[]`, `canEdit`, `onAddImage?`
- [X] T036 [P] Create `src/crd/components/callout/CalloutLinkAction.tsx` — CTA button with URL validation; accepts `url`, `displayName`, `isExternal`

**Checkpoint**: PostCard matches prototype (Card shadow, author header, type badges). SpaceFeed renders list. SpaceMembers has search+filters+pagination. SpaceSubspacesList has filter pills + grid.

---

## Phase 5: Data Layer & Integration (US2, US3, US4)

**Purpose**: Wire prototype-guided CRD components to app data via hooks and data mappers

- [X] T037 Create `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — maps `CalloutDetailsModelExtended` to `CalloutBlockData` and `PostCardData`; maps framing types: None/Memo → `'text'` PostCard, Whiteboard → `'whiteboard'` PostCard, MediaGallery → `'collection'` PostCard, Poll/Link → custom components
- [X] T038 Create `src/main/crdPages/space/dataMappers/subspaceCardDataMapper.ts` — maps `SpaceSubspaceCardsQuery` to `SubspaceListCardData[]`
- [X] T039 Create `src/main/crdPages/space/hooks/useCrdSpaceDashboard.ts` — composes `useSpaceTabProvider(0)`, `useSpacePageQuery`, `useApplicationButton()`, `useSpaceDashboardNavigation()`, `useCalendarEvents()`; returns mapped data for sidebar + feed
- [X] T040 Create `src/main/crdPages/space/hooks/useCrdCalloutList.ts` — wraps `useCalloutsSet()` with classificationTagsets; returns mapped `PostCardData[]` via calloutDataMapper; supports lazy loading via `onVisible` callback triggering `fetchMore` from `useCalloutsSet` (FR-048, existing hook already supports this pattern)
- [X] T041 Create `src/main/crdPages/space/callout/CalloutListConnector.tsx` — renders SpaceFeed with PostCard for text/memo/whiteboard/collection callouts; renders CalloutPoll/CalloutMediaGallery/CalloutLinkAction for non-PostCard types; wires settings, expand, whiteboard open callbacks; wires poll real-time updates via existing GraphQL subscriptions (FR-058) so vote changes reflect immediately
- [X] T042 Create `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx` — renders SpaceSidebar(variant="home") in shell sidebar + SpaceFeed via CalloutListConnector in content area; maps useCrdSpaceDashboard data to component props
- [X] T043 Create `src/main/crdPages/space/tabs/CrdSpaceSubspacesPage.tsx` — renders SpaceSidebar(variant="subspaces") + SpaceSubspacesList + SpaceFeed via CalloutListConnector; maps subspace data

**Checkpoint**: Dashboard + Subspaces tabs render with prototype-styled components. Callouts display as PostCards or custom components. Type-check passes. Toggle off returns to MUI.

---

## Phase 6: US5 — Community Tab (Priority: P2)

**Goal**: Community tab with prototype-styled members grid and community sidebar

- [X] T044 Create `src/main/crdPages/space/dataMappers/communityDataMapper.ts` — maps `useRoleSetManager()` output to `MemberCardData[]` for SpaceMembers and lead/VC data for SpaceSidebar
- [X] T045 Create `src/main/crdPages/space/hooks/useCrdSpaceCommunity.ts` — composes `useSpaceTabProvider()`, `useRoleSetManager()`, `useSendMessageToCommunityLeads()`, `useSpace()`; returns leads, members, VCs, guidelines, invite permission, contact callback
- [X] T046 Create `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` — renders SpaceSidebar(variant="community") + SpaceMembers + SpaceFeed(community posts); wires DirectMessage and InviteContributors MUI dialogs via callbacks

**Checkpoint**: Community tab renders with real data. Sidebar shows lead, VCs, guidelines. Members grid has search + filters + pagination.

---

## Phase 7: US6 — Custom Tabs / Knowledge Base (Priority: P2)

**Goal**: Custom tabs with searchable callout sidebar, tag cloud filtering, knowledge index

- [X] T047 [P] Create `src/crd/components/callout/CalloutSidebarList.tsx` — sidebar list of callout titles with search; accepts `items: { id; title; type }[]`; shows type icon
- [X] T048 [P] Create `src/crd/components/callout/CalloutTagCloud.tsx` — selectable tag chips with results count and clear-all; accepts `tags: { name; count }[]`, `selectedTags`, `resultsCount`, `onSelectTag`, `onDeselectTag`, `onClear`
- [X] T049 Create `src/main/crdPages/space/tabs/CrdSpaceCustomTabPage.tsx` — renders SpaceSidebar(variant="knowledge") + CalloutSidebarList + CalloutTagCloud + CalloutListConnector; filters callouts by Innovation Flow state and tags

**Checkpoint**: Knowledge Base and custom tabs render. Tag cloud filters callouts. Each tab shows only its flow state's callouts.

---

## Phase 8: US7+US8 — Callout Creation, Editing & Management (Priority: P2)

**Goal**: Create, edit, publish/unpublish, delete, reorder callouts

**Visual reference**: `prototype/.../AddPostModal.tsx` (rich post composition dialog)

- [X] T050 [P] Create `src/crd/forms/callout/CalloutFramingSelector.tsx` — 6-option radio group with lucide-react icons and tooltips
- [X] T051 [P] Create `src/crd/forms/callout/LinkFramingFields.tsx` — URL + display name inputs with validation
- [X] T052 [P] Create `src/crd/forms/callout/PollOptionsEditor.tsx` — poll title + 2-10 option fields + min/max settings
- [X] T053 [P] Create `src/crd/forms/callout/CalloutContributionSettings.tsx` — allowed type selector + comments toggle
- [X] T054 [P] Create `src/crd/forms/callout/CalloutVisibilitySelector.tsx` — Draft/Published toggle + notification checkbox
- [X] T055 Create `src/crd/forms/callout/AddPostModal.tsx` — post composition modal matching prototype: title input, markdown editor slot, attachment buttons, collapsible settings, Save Draft / Post footer; accepts per-field props + `framingEditorSlot: ReactNode` + `onSubmit`, `onSaveDraft`, `onFindTemplate`; uses Dialog primitive
- [X] T056 Create `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` — Formik context for create/edit; maps form values to GraphQL mutations
- [X] T057 Create `src/main/crdPages/space/callout/CalloutFormConnector.tsx` — renders AddPostModal inside Formik context; binds fields; renders FramingEditorConnector as editor slot
- [X] T058 Create `src/main/crdPages/space/callout/FramingEditorConnector.tsx` — renders Tiptap (Memo), FormikWhiteboardPreview (Whiteboard), LinkFramingFields (Link), media uploader (MediaGallery), PollOptionsEditor (Poll)
- [X] T059 Create `src/main/crdPages/space/callout/CalloutEditConnector.tsx` — pre-fills form with existing data; locks framing type + contribution type
- [X] T060 [P] Create `src/crd/components/callout/CalloutContextMenu.tsx` — Radix DropdownMenu: Edit, Publish/Unpublish, Delete, Sort, Save as Template, Move (Up/Down/Top/Bottom), Share; permission-gated; keyboard accessible
- [X] T061 Create `src/main/crdPages/space/callout/CalloutManagementConnector.tsx` — wires context menu actions to mutations and MUI dialogs
- [X] T062 Wire CalloutContextMenu into PostCard via CalloutListConnector — settings icon triggers menu; each action wired to CalloutManagementConnector

**Checkpoint**: Full callout lifecycle: create (all types), edit, publish/unpublish, delete, reorder. Form validation and permission gating work.

---

## Phase 9: US9 — Tab Action Buttons (Priority: P2)

- [X] T063 Wire tab action buttons in CrdSpacePageLayout — Activity → MUI ActivityDialog; Video Call → MUI VideoCallDialog (conditional); Share → MUI ShareDialog; Settings → navigate to `/settings`

---

## Phase 10: US10 — Callout Contributions (Priority: P2)

**Goal**: Contribution cards display in expandable grids within callout blocks

- [X] T064 [P] Create `src/crd/components/contribution/ContributionPostCard.tsx` — title, author, date, description, tags, comment count; clickable
- [X] T065 [P] Create `src/crd/components/contribution/ContributionWhiteboardCard.tsx` — preview thumbnail + title; clickable
- [X] T066 [P] Create `src/crd/components/contribution/ContributionMemoCard.tsx` — markdown preview + title; clickable
- [X] T067 [P] Create `src/crd/components/contribution/ContributionLinkList.tsx` — link list with add button for authorized users
- [X] T068 Create `src/crd/components/contribution/ContributionGrid.tsx` — expandable card grid; 5/3/1 cols; 2-row collapsed + expand button
- [X] T069 [P] Create `src/crd/components/contribution/ContributionPreview.tsx` — inline preview with author, timestamp, edit/share/close, prev/next
- [X] T070 [P] Create `src/crd/components/contribution/ContributionCreateButton.tsx` — type-labeled creation trigger
- [X] T071 [P] Create `src/crd/forms/contribution/ContributionFormLayout.tsx` — Post/Memo (title+desc+tags), Whiteboard (name), Link (URL+name+desc)
- [X] T072 Create `src/main/crdPages/space/dataMappers/contributionDataMapper.ts` — maps contributions to `ContributionCardData[]`
- [X] T073 Create `src/main/crdPages/space/callout/ContributionGridConnector.tsx` — renders ContributionGrid; wires clicks to preview/detail
- [X] T074 Create `src/main/crdPages/space/callout/ContributionCreateConnector.tsx` — creation forms + mutations
- [X] T075 Wire ContributionGrid + ContributionCreate into PostCard content area (text/memo) and as section below callout-specific components (whiteboard/poll/media)

---

## Phase 11: US11 — Callout Templates (Priority: P3)

- [X] T076 Create `src/main/crdPages/space/callout/TemplateImportConnector.tsx` — "Find Template" opens MUI dialog; maps selection to Formik; overwrite confirmation; default template auto-loading
- [X] T077 Wire TemplateImportConnector into CalloutFormConnector; wire "Save as Template" in CalloutManagementConnector

---

## Phase 12: US12 — Callout Detail Dialog & Discussions (Priority: P3)

**Goal**: Build the full comments/discussion system surfaced inside a `CalloutDetailDialog` (not below the card on the feed). The dialog opens when the user clicks the callout title or the "X comments" footer button. It displays the full callout content (title, author, description, reactions bar, share button, contributions section when applicable) and a **Discussion** section at the bottom with the `CommentThread` component. The new-comment input is sticky to the bottom of the dialog. CRD presentational components live in `src/crd/components/comment/`; the dialog wrapper lives in `src/crd/components/callout/CalloutDetailDialog.tsx`.

**Visual reference**: `prototype/src/app/components/dialogs/PostDetailDialog.tsx` — sticky top header bar (title + close/share/more icons), scrollable content area (title h1, author avatar+name+timestamp, prose description, optional image, Contributions section, Discussion section), sticky bottom comment input.

**Existing MUI reference**: `src/domain/communication/room/Comments/` — `CommentsComponent.tsx`, `MessagesThread.tsx`, `MessageView.tsx`, `CommentReactions.tsx`, `FormikCommentInputField.tsx`, `CollapsibleCommentsThread.tsx`

**Deferred**: @mentions via `react-mentions` — input reserves toolbar space for a future @ button but does not implement mention functionality in this phase.

### Prerequisites

- [X] T078 [P] Port `src/crd/primitives/popover.tsx` from `prototype/src/app/components/ui/popover.tsx` — Radix Popover primitive (required by CommentEmojiPicker and CommentReactions overflow); update imports to `@/crd/lib/utils`

### i18n

- [X] T078a [P] Extend `src/crd/i18n/space/space.en.json` with `comments` keys: `title`, `showMore`, `showLess`, `sortNewest`, `sortOldest`, `reply`, `delete`, `deleted` (placeholder for deleted parent), `addComment` (placeholder text), `send`, `charCount` (with `{{count}}` / `{{max}}` interpolation), `reactions.add`, `reactions.overflow` (with `{{count}}`), `loading`, `empty` (no comments yet)
- [X] T078c [P] Extend `src/crd/i18n/space/space.en.json` with `calloutDialog` keys: `close` (sr-only close button label), `share` (share button label), `more` (more-options button label), `discussion` ("Discussion" section heading), `reactions` ("React" button label), `contributions` ("Contributions" section heading); mirror to all 5 other language files: `space.{nl,es,bg,de,fr}.json`
- [X] T078b Mirror T078a key changes to all 5 other language files: `space.{nl,es,bg,de,fr}.json`

### CRD presentational layer — comment components

- [X] T079 [P] Create `src/crd/components/comment/CommentEmojiPicker.tsx` — thin wrapper around `emoji-picker-react` (v4.4.7, `EmojiStyle.NATIVE`); renders inside a Radix `Popover` (from `@/crd/primitives/popover`); props: `onSelect: (emoji: string) => void`, `trigger: ReactNode`; positions above trigger when near viewport bottom; `aria-label` on trigger button
- [X] T080 [P] Create `src/crd/components/comment/CommentReactions.tsx` — horizontal flex of reaction pills (emoji + count); each pill is a `<button>` with `aria-pressed` reflecting `hasReacted`; active pills have highlighted border (primary); "add reaction" button (hover-visible, `Smile` icon) opens `CommentEmojiPicker`; "+N" overflow indicator when reactions exceed container width, clicking opens a Radix Popover listing remaining reactions with sender info; props: `reactions: CommentReaction[]`, `onAdd: (emoji: string) => void`, `onRemove: (emoji: string) => void`
- [X] T081 [P] Create `src/crd/components/comment/CommentInput.tsx` — user avatar (left) + auto-expanding `<textarea>` (starts 1 line, expands up to 5, then scrolls internally) + toolbar (emoji button via `CommentEmojiPicker`, disabled send button `Send` icon); emoji inserts at cursor position; Enter submits (when non-empty), Ctrl+Enter also submits; max 2000 chars with visible counter when approaching limit; placeholder via `t('comments.addComment')`; toolbar reserves space for future @ button (empty slot); props: `currentUser?: CommentAuthor`, `onSubmit: (content: string) => void`, `disabled?: boolean`, `maxLength?: number` (default 2000)
- [X] T082 [P] Create `src/crd/components/comment/CommentItem.tsx` — avatar (8x8) + author name (font-medium) + timestamp (text-xs, muted) + content (text-sm) + action row: Reply button + delete button (visible when `canDelete`); `CommentReactions` below content; clicking Reply renders an inline `CommentInput` directly below this comment (local `isReplying` visual state); `isReply` prop controls left indentation (`ml-10`); `isDeleted` renders placeholder text instead of content; props: `comment: CommentData`, `onReply: (parentId: string, content: string) => void`, `onDelete: (commentId: string) => void`, `onAddReaction: (commentId: string, emoji: string) => void`, `onRemoveReaction: (commentId: string, emoji: string) => void`, `currentUser?: CommentAuthor`
- [X] T083 [P] Create `src/crd/components/comment/CommentThread.tsx` — top-level orchestrator: header with comment count + sort toggle (newest/oldest first, default newest); groups comments into flat threads (top-level + their replies sorted chronologically); renders `CommentItem` per message with replies indented below parent; scrollable comment list area (flex-1 overflow-y-auto); does NOT include its own sticky input — the input is owned by `CalloutDetailDialog` and passed as a prop slot; supports `mode: 'full-height'` only (collapsible mode removed; was only needed in the below-card context which no longer exists); loading state shows spinner; empty state shows `t('comments.empty')`; props: `CommentsContainerData` (from data-model.md) minus `mode`
- [X] T083a [P] Update `src/crd/components/comment/CommentThread.tsx` — remove `mode` prop and `CollapsibleComments` wrapper; the component is always rendered inside the dialog's scrollable content area which controls height; the `CommentInput` sticky footer is now rendered outside `CommentThread` by `CalloutDetailDialog` (pass `canComment` + comment callbacks via the dialog instead)
- [X] T084 [P] Create `src/crd/components/comment/CollapsibleComments.tsx` — ~~wrapper component for `mode='collapsible'`~~ **this component is now unused** (collapsible-below-card mode was removed; the dialog always shows full-height); keep the file but mark it `@deprecated` with a comment until T085 clean-up
- [X] T084a [P] Delete `src/crd/components/comment/CollapsibleComments.tsx` (deprecated since T083a removed the collapsible mode); update any remaining imports

### CRD presentational layer — callout detail dialog

- [X] T085a [P] Create `src/crd/components/callout/CalloutDetailDialog.tsx` — full-screen dialog (matches `PostDetailDialog` layout from prototype) built on `src/crd/primitives/dialog.tsx`:
  - **Layout**: `flex flex-col h-[95vh] max-w-5xl overflow-hidden` — three zones: sticky header, scrollable body, sticky footer
  - **Sticky header** (`shrink-0 border-b`): close button (X, `DialogClose`), callout title (`DialogTitle`), breadcrumb subtitle (space name), share icon button, more-options icon button (MoreHorizontal)
  - **Scrollable body** (`flex-1 overflow-y-auto`):
    - Title `<h1>` (text-3xl font-bold)
    - Author row: Avatar + name + timestamp + role
    - Prose description (MarkdownContent or plain `<p>`)
    - Optional banner image (when `imageUrl` provided)
    - Reactions + share bar (`border-y`): emoji reaction stack (3 stacked circles), reaction count text, spacer, "React" button (Smile icon), "Share" button (Share2 icon)
    - **Contributions section** (when `hasContributions`): `contributionsSlot: ReactNode` prop — rendered by the connector; section heading `t('calloutDialog.contributions')` + badge count
    - **Discussion section**: `t('calloutDialog.discussion')` heading + comment count badge + `<CommentThread>` (scrolls with page body)
  - **Sticky footer** (`shrink-0 border-t bg-background`): `CommentInput` rendered only when `canComment`; hidden when `!canComment`
  - **Props**: `open: boolean`, `onOpenChange: (open: boolean) => void`, `callout: CalloutDetailDialogData`, `commentsSlot: ReactNode`, `commentInputSlot?: ReactNode`, `contributionsSlot?: ReactNode`, `hasContributions?: boolean`, `contributionsCount?: number`
  - **`CalloutDetailDialogData`** type (pure CRD, no domain imports): `{ id, title, author?: { name, avatarUrl, role? }, description?, imageUrl?, timestamp?, commentCount?, reactionCount? }`
  - Uses `Dialog`, `DialogContent`, `DialogTitle`, `DialogClose` from `@/crd/primitives/dialog`

### Delete stubs

- [X] T085 Delete `src/crd/components/callout/CalloutCommentItem.tsx` and `src/crd/components/callout/CalloutComments.tsx` — replaced by `src/crd/components/comment/` components; update any existing imports (search for `CalloutCommentItem` and `CalloutComments` in `src/`)

### Integration layer

- [X] T086 Create `src/main/crdPages/space/dataMappers/commentDataMapper.ts` — `mapRoomToCommentData(room: CommentsMessagesFragment, currentUserId: string): CommentData[]` — maps Room messages to `CommentData[]` with flat threading (parentId from threadID), derives `canDelete` from message author match or admin privilege, maps reactions from `ReactionDetails[]` to `CommentReaction[]` (groups by emoji, checks `createdBy` against currentUserId for `hasReacted`), handles deleted parent placeholders via the existing `useRestoredMessages` pattern
- [X] T086a Update `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — add `mapCalloutDetailsToDialogData(callout: CalloutDetailsModelExtended): CalloutDetailDialogData` mapper; extracts title, author, description, imageUrl (whiteboard preview or first media image), timestamp, commentCount, reactionCount
- [X] T087 Create `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx` — integration connector that:
  - Accepts `roomId: string`, `calloutId?: string`, `contributionId?: string`, `mode: 'collapsible' | 'full-height'`
  - **Remove `mode` prop** — now always full-height inside dialog
  - Lazy-loads comments via `useCalloutContributionCommentsQuery` (for contribution-level) or the callout detail Room data (for callout-level), with skip condition until in-view or dialog open
  - Maps Room data via `mapRoomToCommentData`
  - Wires `usePostMessageMutations` for `onAddComment` (sendMessageToRoom) and `onReply` (sendMessageReplyToRoom with threadID)
  - Wires `useCommentReactionsMutations` for `onAddReaction` (addReactionToMessageInRoom) and `onRemoveReaction` (removeReactionToMessageInRoom)
  - Subscribes to real-time updates via `useSubscribeOnRoomEvents` (handles Create/Delete mutations for messages and reactions, updates Apollo cache)
  - Derives `canComment` from Room authorization (`AuthorizationPrivilege.CreateMessage`)
  - Passes `currentUser` from auth context (name + avatar)
  - Renders `<CommentThread>` (thread only) + exposes `canComment`, `currentUser`, and comment callbacks so `CalloutDetailDialog` can render the sticky `CommentInput` footer
- [X] T087a Create `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx` — wraps `CalloutDetailDialog` (CRD) with all integration wiring:
  - Accepts `calloutId: string`, `calloutsSetId: string | undefined`, `open: boolean`, `onOpenChange`
  - Reuses the `callout` data already loaded by `LazyCalloutItem` (passed as prop, not re-fetched)
  - Maps to `CalloutDetailDialogData` via `mapCalloutDetailsToDialogData`
  - Renders `CalloutCommentsConnector` as `commentsSlot` (always full-height)
  - Renders `ContributionGridConnector` as `contributionsSlot` when callout has contribution type
  - Manages sticky `CommentInput` footer by receiving `canComment` + callbacks back from `CalloutCommentsConnector` via render-prop or lifted state pattern

### Wiring

- [X] T088a Revert / update `LazyCalloutItem.tsx` — **remove** the `CalloutCommentsConnector` rendered below PostCard (that was T088, now superseded); instead add a local `dialogOpen` `useState`; pass `onClick` and footer comments-button click handler both pointing to `() => setDialogOpen(true)`; render `<CalloutDetailDialogConnector>` controlled by `dialogOpen`
- [X] T088b Update `PostCard.tsx` — make the "X comments" footer `<Button>` call `onClick` when provided (currently it has no handler); add `onCommentsClick?` prop; the callout feed wires `onCommentsClick` to open the dialog (same as title click)
- [X] T089 Wire `CalloutCommentsConnector` into the contribution preview area (`ContributionGridConnector` or equivalent) — when a Post contribution is selected, render contribution-level comments in `mode='full-height'` inside the dialog; pass contribution's Room ID; hide when `commentsEnabled` is false

### Standalone preview

- [X] T090 Add mock comment data to `src/crd/app/data/space.ts` — sample `CommentData[]` with top-level comments, replies, reactions, and a deleted parent placeholder; update SpacePage preview to render `CommentThread` in both collapsible and full-height modes
- [X] T090a Update `src/crd/app/pages/SpacePage.tsx` standalone preview — replace direct `CommentThread` render with a `CalloutDetailDialog` open via a "View Callout" button; use mock `CalloutDetailDialogData` from `space.ts`

**Checkpoint**: Clicking a callout title or "X comments" button opens the `CalloutDetailDialog`. The dialog shows the full callout: sticky top header (title + close/share), scrollable body (author, description, reactions bar, Discussion section with CommentThread), sticky bottom CommentInput (when authorized). Comments are NOT visible below the callout card on the feed. Real-time updates, emoji reactions, reply threading, sort toggle, lazy loading all work inside the dialog.

---

## Phase 13: US13 — About Page (Priority: P3)

- [X] T091a [P] Create `src/crd/components/space/SpaceAboutView.tsx` — full about page: name, tagline, description, location, metrics, leads, host, Why, Who, guidelines, references; accepts `SpaceAboutData` + `joinAction?: ReactNode`
- [X] T091b Create `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` — uses `useSpaceAboutDetailsQuery()`; maps to SpaceAboutView; includes MUI ApplicationButton for non-members; public route (FR-044)

---

## Phase 14: US14 — Responsive Mobile Experience (Priority: P3)

- [X] T091c Audit and refine SpaceNavigationTabs mobile bottom bar (T013) — fixed bar, "More" drawer, no overlap with FABs
- [X] T091d Audit and refine SpaceShell mobile layout (T011) — sidebar hidden, single-column, grids reflow
- [X] T091e Audit and refine SpaceHeader mobile banner (T012) — no horizontal overflow, title/tagline truncation

---

## Phase 15: Polish & Cross-Cutting Concerns

- [X] T091f [P] Create standalone preview app page `src/crd/app/pages/SpacePage.tsx` with mock data; add route in CrdApp.tsx
- [X] T091g [P] Accessibility audit — all CRD Space components pass `src/crd/CLAUDE.md` checklist
- [X] T091h [P] Verify zero MUI imports in `src/crd/` — grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `formik`, `react-router-dom`
- [X] T091i Update `src/crd/components/index.md` component inventory

---

## Phase 16: Callout Lazy Loading (Post-MVP Enhancement)

**Goal**: Callout descriptions and content render correctly by lazy-loading full details per callout as it enters the viewport

**Background**: The list query (`CalloutsOnCalloutsSetUsingClassification`) only fetches `displayName` and `url` per callout — no description, tags, content details, or comments. The MUI app uses `useCalloutInView` (intersection observer, 500ms delay, trigger once) to fetch `CalloutDetailsQuery` per callout on scroll. CRD replicates this pattern.

**Data flow**: `useCalloutsSet` → light `callouts[]` → `CalloutListConnector` → `LazyCalloutItem` per item → `useCalloutInView` (intersection observer) → `mapCalloutDetailsToPostCard` → `PostCard` with full content

- [X] T091 [P] Extract `src/crd/components/space/PostCardSkeleton.tsx` — reusable skeleton card from SpaceFeed's loading state; used by both SpaceFeed (initial load) and LazyCalloutItem (per-item load)
- [X] T092 [P] Add `children: ReactNode` slot to `src/crd/components/space/SpaceFeed.tsx` — when provided, renders children instead of internal `posts.map()` in the content area; backwards-compatible with `posts` prop for demo app
- [X] T093 [P] Add `mapCalloutDetailsToPostCard(callout: CalloutDetailsModelExtended): PostCardData` to `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — maps full detail data including description, whiteboard preview, comments count, author; rename existing mapper to `mapCalloutLightToPostCard`
- [X] T094 [P] Update 3 hooks to return raw callouts: `useCrdCalloutList.ts`, `useCrdSpaceDashboard.ts`, `useCrdSpaceCommunity.ts` — return `callouts: CalloutModelLightExtended[]` and `calloutsSetId` instead of pre-mapped `posts: PostCardData[]`
- [X] T095 Create `src/main/crdPages/space/callout/LazyCalloutItem.tsx` — per-callout lazy loading wrapper; uses `useCalloutInView` from domain layer (`@/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView`); renders PostCardSkeleton until inView, then maps via `mapCalloutDetailsToPostCard` and renders PostCard
- [X] T096 Update `src/main/crdPages/space/callout/CalloutListConnector.tsx` — change props from `posts: PostCardData[]` to `callouts: CalloutModelLightExtended[]` + `calloutsSetId`; sort by sortOrder; render LazyCalloutItem per callout inside SpaceFeed children slot
- [X] T097 Update 4 tab pages (`CrdSpaceDashboardPage`, `CrdSpaceCommunityPage`, `CrdSpaceSubspacesPage`, `CrdSpaceCustomTabPage`) — pass `callouts`/`calloutsSetId` to CalloutListConnector; CustomTabPage derives sidebar items from light callout data instead of mapped posts

**Checkpoint**: Callout descriptions appear after scrolling into view. Skeletons show during load. All 4 tabs work. Type-check passes.

**Reused existing code (no changes needed)**:
- `useCalloutInView` at `src/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView.ts`
- `useCalloutDetails` at `src/domain/collaboration/callout/useCalloutDetails/useCalloutDetails.ts`
- `react-intersection-observer` package (already installed)
- `CalloutDetailsModelExtended` type from `src/domain/collaboration/callout/models/CalloutDetailsModel.ts`

---

## Phase 17: Community + Subspaces Top-Section Revision (Post-MVP Revision)

**Goal**: Bring the top section of the Community and Subspaces tabs to visual parity with the prototype. The initial Phase 4 build shipped minimal versions of `SpaceMembers` and `SpaceSubspacesList`; this phase revises them to match the prototype design (section header with title + descriptive subtitle + primary action button, UserCard vs OrgCard differentiation with role badges, reuse of the existing CRD `SpaceCard` for the subspaces grid, prototype-style empty states) and wires the Invite Contributors and Create Subspace MUI dialogs.

**Visual reference**: `prototype/src/app/pages/SpaceCommunity.tsx`, `SpaceSubspaces.tsx`, `prototype/src/app/components/space/SpaceMembers.tsx`, `SpaceSubspacesList.tsx`

**Scope**: Top section only. The bottom section (callouts feed rendered by `CalloutListConnector`) and the page-level composition between top and bottom (`space-y-N` spacing, any divider, top/bottom ordering) are owned by a separate callouts work item and are untouched here.

### i18n

- [X] T098 [P] Extend `src/crd/i18n/space/space.en.json` `members` keys: update `title` → `"Community"`, update `search` placeholder, add `subtitle` (with `{{users}}` and `{{organizations}}` interpolation), add `inviteMember`, add `empty.{title,description,clearFilters}`, add `role.{admin,lead,member,organization}`; drop unused `filterHost`
- [X] T099 [P] Extend `src/crd/i18n/space/space.en.json` `subspaces` keys: add `subtitle`, add `empty.{title,description,clearFilters}`; drop unused `noSubspaces` / `noSubspacesDescription` in favour of the new `empty` group
- [X] T100 [P] Mirror T098 + T099 key changes to all 5 other language files: `space.{nl,es,bg,de,fr}.json`
- [X] T101 [P] Add `pinned` key to `src/crd/i18n/common/common.en.json` and mirror to `common.{nl,es,bg,de,fr}.json` — used by SpaceCard's new pin indicator

### Data layer

- [X] T102 Extend `MemberCardData` in `src/crd/components/space/SpaceMembers.tsx` with `role?: MemberRoleKey` (`'admin' | 'lead' | 'member' | 'organization'`) and `roleType?: MemberRoleType` (`'admin' | 'moderator' | 'member'`) — drives role badge styling
- [X] T103 Extend `src/main/crdPages/space/dataMappers/communityDataMapper.ts` `mapRoleSetToMemberCards()` to derive `role` + `roleType` per user from `RoleSetMember.roles[]`: `Admin → 'admin'/'admin'`, `Lead → 'lead'/'moderator'`, default → `'member'/'member'`; organizations get `role: 'organization'` with no roleType
- [X] T104 Rewrite `src/main/crdPages/space/dataMappers/subspaceCardDataMapper.ts` to return `SpaceCardData[]` (from `@/crd/components/space/SpaceCard`) instead of the retired `SubspaceListCardData`: map `profile.displayName → name`, `tagline → description`, `cardBanner.uri || default → bannerImageUrl`, derive `initials` via `getInitials`, derive `avatarColor` via a new local `getAvatarColorFromId` helper (mirroring the explore-spaces palette), merge `leadUsers[] + leadOrganizations[] → leads: SpaceLead[]`, map `myMembershipStatus → isMember`. Accept a `sortMode?: SpaceSortMode` parameter and force `isPinned: false` unless `sortMode === SpaceSortMode.Alphabetical` (FR-031)
- [X] T105 Update `src/main/crdPages/space/hooks/useCrdSpaceCommunity.ts` to fetch the full role set (`relevantRoles: [RoleName.Admin, RoleName.Lead, RoleName.Member]`) and return the deduplicated flat `users` / `organizations` arrays from `useRoleSetManager` (each entry carrying its full `roles[]`), plus `usersCount` + `organizationsCount` for the subtitle

### CRD presentational layer

- [X] T106 Add optional `isPinned?: boolean` to `SpaceCardData` in `src/crd/components/space/SpaceCard.tsx`; render a `Pin` (lucide-react) badge inside an `<output>` next to the existing privacy badge when `isPinned` is true, with an sr-only `crd-common:pinned` label. Backwards-compatible for the explore spaces consumer
- [X] T107 Revise `src/crd/components/space/SpaceMembers.tsx` to match the prototype's `SpaceMembers`:
  - Section header: `<h2>` title (default `t('members.title')` = "Community"), subtitle `<p>` (default `t('members.subtitle', { users, organizations })`), optional "Invite Member" button (`UserPlus` icon) that only renders when both `canInvite && onInvite` are provided
  - New props: `title?`, `subtitle?`, `usersCount?`, `organizationsCount?`, `canInvite?`, `onInvite?`
  - Drop the `'host'` filter (no matching data); keep `['all', 'admin', 'lead', 'member', 'organization']`
  - Add `aria-pressed` on filter pills
  - Differentiate `UserCard` (rounded-full avatar + role badge with color by `roleType`: `admin` → `primary`, `moderator` → `chart-2`, `member` → `muted`) vs `OrganizationCard` (rounded-md avatar + "Organization" badge with `Building2` icon)
  - Replace the simple "No members found" paragraph with a prototype-style empty state: muted circular User icon, `empty.title`, `empty.description`, and a "Clear filters" link button that resets search + filter + page
  - Keep all business-logic-free constraints (no `@/domain/`, no `@/core/apollo/`, no router imports)
- [X] T108 Revise `src/crd/components/space/SpaceSubspacesList.tsx` to use the existing CRD `SpaceCard` in the grid:
  - Change prop type from `SubspaceListCardData[]` → `SpaceCardData[]`; delete the local `SubspaceListCardData` export (no other consumers in `src/`)
  - Add section header: `<h2>` title (default `t('subspaces.title')`), subtitle `<p>` (default `t('subspaces.subtitle')`), "Create Subspace" button (already present — gate on `canCreate && onCreateClick`)
  - Replace the inline subspace tile rendering with `<SpaceCard space={...} onClick={...} />` inside a `<ul>` / `<li>` list
  - Add `aria-pressed` on filter pills
  - Replace the empty state with prototype-style (dashed border, Folder icon, `empty.title`, `empty.description`, "Clear filters" link button when a filter is active)
  - Change the `onSubspaceClick` signature from `(href: string) => void` to `(space: SpaceCardData) => void` to match `SpaceCard`'s `onClick` prop shape

### Integration layer (MUI dialog wiring)

- [X] T109 Update `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx`:
  - Read the new `usersCount` / `organizationsCount` / `canInvite` from `useCrdSpaceCommunity`
  - Render the existing MUI `InviteContributorsDialog` from `@/domain/community/inviteContributors/InviteContributorsDialog` (the dialog-only variant, not the `InviteContributorsWizard` button wrapper), controlled by a local `inviteOpen` `useState`
  - Pass a shared `onInvite` callback to both `<SpaceSidebar>` and `<SpaceMembers>` so the sidebar invite button and the section-header invite button trigger the same dialog
  - Do NOT change the page's `space-y-8` wrapper, add no divider, and do NOT touch `<CalloutListConnector>` — that's owned by the separate callouts work item
- [X] T110 Update `src/main/crdPages/space/tabs/CrdSpaceSubspacesPage.tsx`:
  - Read `sortMode` from `subspacesData?.lookup.space?.settings.sortMode`
  - Sort the raw subspaces via existing `useSubspacesSorted(rawSubspaces, sortMode)` from `@/domain/space/hooks/useSubspacesSorted` BEFORE mapping
  - Pass `sortMode` into `mapSubspacesToCardDataList(sorted, sortMode)` so pin indicators only render in alphabetical mode
  - Render the existing MUI `CreateSubspace` dialog from `@/domain/space/components/CreateSpace/SubspaceCreationDialog/CreateSubspace` via a local `isCreateDialogOpen` `useState`; pass `onCreateClick={() => setIsCreateDialogOpen(true)}` to `<SpaceSubspacesList>`
  - Do NOT change the page's `space-y-8` wrapper, add no divider, and do NOT touch `<CalloutListConnector>`

### Standalone preview

- [X] T111 Update `src/crd/app/data/space.ts` `MOCK_SUBSPACES` to conform to `SpaceCardData` (rename `tagline → description`, `bannerUrl → bannerImageUrl`, add `initials` + `avatarColor`, upgrade `leads` to include `type: 'person' | 'org'`); swap import from `SubspaceListCardData` to `SpaceCardData`. Keeps the standalone preview app compiling with the new prop shape

**Checkpoint**: Community tab renders the revised members gallery with counts, Invite Member button, UserCard/OrgCard differentiation, role badges, and a clear empty state. Subspaces tab renders the revised list using `SpaceCard` (banner + privacy + stacked avatars + leads footer), Create Subspace button, and Pin indicator in alphabetical mode. Both MUI dialogs (Invite Contributors + Create Subspace) open from the section-header buttons. The callouts feed below the top section continues to render exactly as before (untouched).

**Out of scope for this phase (follow-ups)**:
- Sidebar search field for subspaces when count > 3 (FR-028)
- Real "Archived" subspace filtering (API currently doesn't expose status — filter pill is a visual affordance)
- Member dropdown menu (View Profile / Message / Remove) — requires additional MUI dialog wiring
- "Joined {date}" meta on UserCard — `joinDate` not exposed by the role set query
- Page-level composition (spacing + divider between top and bottom section) — owned by the callouts work item

---

## Phase 18: Community Sidebar + Subspace Filter Refinement (Post-MVP Revision)

**Goal**: Deliver the Community sidebar behavior end-to-end (leads block, Contact Leads → MUI DirectMessageDialog, entitlement-gated VC section) and replace the placeholder status filter on the Subspaces tab with a real search + tag-chip filter, capped via Show More, matching the MUI `SpaceFilter` behavior.

**Visual reference**: `prototype/src/app/components/space/SpaceSidebar.tsx` (community variant), `prototype/src/app/components/space/SpaceMembers.tsx`; existing MUI `SpaceCommunityPage.tsx` (for DirectMessageDialog + VC wiring) and `SubspaceView.tsx` + `SpaceFilter.tsx` (for tag-filter behavior).

### Data layer

- [X] T112 Extend `useCrdSpaceCommunity` to expose full sidebar data: pull `usersByRole[Lead]` / `organizationsByRole[Lead]` for the leads block (the richer profile payload from `useRoleSetManager` — with location, avatar, url), `virtualContributorsByRole[Member]` filtered for `SearchVisibility.Hidden` for the VC section, and the `hasVcEntitlement` flag derived from `LicenseEntitlementType.SpaceFlagVirtualContributorAccess` on the space entitlements. Add `VirtualContributor` to the `contributorTypes` arg
- [X] T113 Add `mapRoleSetMemberToSidebarLead(member, type: 'person' | 'org')` and `mapVirtualContributorToSidebar` in `src/main/crdPages/space/dataMappers/communityDataMapper.ts`, returning new exported types `SidebarLeadData` + `SidebarVirtualContributorData`
- [X] T114 Store the member's full role list on `MemberCardData`: add `roles: MemberRoleKey[]`, derive it in `mapRoleSetToMemberCards` via a new `deriveUserRolesList(roles)` helper that returns every applicable role key (Admin, Lead, Member — inclusive) rather than the single precedence role. Keep the existing `role` / `roleType` fields for the display badge

### CRD presentational layer

- [X] T115 Rewrite `src/crd/components/space/sidebar/LeadBlock.tsx` to accept `leads: LeadItem[]` (with `{ id, name, avatarUrl?, initials, location?, href?, type: 'person' | 'org' }`) and render a single card with `sidebar.spaceLead` (singular) or `sidebar.spaceLeads` (plural) heading plus one compact row per lead. Organizations use `rounded-md` avatars to mirror the members-grid treatment. Returns `null` when the array is empty — callers can render unconditionally
- [X] T116 Update `src/crd/components/space/SpaceSidebar.tsx` community variant:
  - Replace `lead?: LeadData` with `leads?: LeadItem[]` (plural)
  - Add `canContactLeads?: boolean` (default true) — hides the Contact Leads button when false
  - Add `showVirtualContributors?: boolean` (default true) — hides the VC section when the space lacks the VC entitlement even if VCs are present
  - Hide the Contact/Invite button row entirely when neither button is renderable
  - Keep `onContactLead`, `onInvite`, `canInvite` as already exposed
- [X] T117 Update `src/crd/components/space/SpaceMembers.tsx` filter logic: match the active filter pill against the full `m.roles` list (`roles?.includes(activeFilter)`) instead of `m.role === activeFilter`. Admin + Lead + Member are overlapping sets — a user who holds multiple roles MUST appear under every applicable filter
- [X] T118 Replace the `All / Active / Archived` status pills in `src/crd/components/space/SpaceSubspacesList.tsx` with:
  - A text search input (matches against `name` and `description`), styled to match the Community tab's members search
  - A wrapping row of tag chips aggregated from all subspaces via a pure `collectTags()` helper (sorted by frequency desc then alphabetically)
  - Selecting multiple tag chips filters with AND semantics (the subspace must carry every selected tag)
  - Search and tag filters compose: both apply simultaneously
  - Remove the local `SubspaceFilter` type and the `FILTERS` constant — the component no longer has a hard-coded status dimension
- [X] T119 Add Show More pagination to `SpaceSubspacesList.tsx`: add `initialVisibleCount?: number` prop (default 6), render only the first N cards, and show a centered "Show {{count}} more" button below the grid when the filtered set exceeds the initial cap. Clicking toggles `showAll` state and swaps the button to "Show less". The button container MUST carry a `pt-4` offset so it doesn't visually collide with the last row of cards

### Integration layer (MUI dialog wiring)

- [X] T120 Update `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx`:
  - Import `DirectMessageDialog` + `MessageReceiverChipData` from `@/domain/communication/messaging/DirectMessaging/DirectMessageDialog` and `useSendMessageToCommunityLeads` from `@/domain/community/CommunityLeads/useSendMessageToCommunityLeads`
  - Hold `contactOpen` state; build `messageReceivers` from `leadUsers` (lead organizations are not direct-message targets); compute `canContactLeads = leadUsers.length > 0 && Boolean(communityId)`
  - Pass `leads = [...leadUsers, ...leadOrganizations]`, `canContactLeads`, `onContactLead`, `virtualContributors`, and `showVirtualContributors={hasVcEntitlement}` into `<SpaceSidebar>`
  - Render `<DirectMessageDialog>` at the bottom of the page (inside the fragment) gated on `canContactLeads`; wire `onSendMessage={sendMessageToCommunityLeads}`
  - Keep the existing `InviteContributorsDialog` wiring untouched

### i18n

- [X] T121 [P] Add sidebar + subspace keys to `src/crd/i18n/space/space.en.json` and mirror to `nl`, `es`, `bg`, `de`, `fr`: new `sidebar.spaceLeads` (plural), updated `sidebar.contactLead` → "Contact Leads" (plural), new `subspaces.search`, `subspaces.showMore` (with `{{count}}` interpolation), `subspaces.showLess`. Drop the now-unused `subspaces.filterAll` / `filterActive` / `filterArchived` keys

### Standalone preview

- [X] T122 Update `src/crd/app/data/space.ts` `MOCK_SIDEBAR.lead` → `MOCK_SIDEBAR.leads` (array with two sample leads — one person, one organization — matching the new `LeadItem` shape). Update `src/crd/app/pages/SpacePage.tsx` to pass `leads` instead of `lead` to `<SpaceSidebar>`

### Fixes

- [X] T123 Overlapping role filter fix: selecting the "Lead" filter was previously hiding users whose derived display role was "Admin" even when they also held the Lead role. Resolved by T117 (filter against `roles[]` list instead of the precedence-derived `role`)
- [X] T124 Show-more button spacing fix: the "Show more" button under the subspace grid was visually glued to the last card row. Added explicit `pt-4` on the button's flex container inside `SpaceSubspacesList.tsx` (Tailwind `space-y-6` on the parent section composes with the extra padding)

**Checkpoint**: Community sidebar shows every lead (users + organizations) under a singular/plural heading, hides when the space has no leads; Contact Leads opens the MUI `DirectMessageDialog` seeded with lead users; VC section is hidden without the entitlement OR without any visible VCs; Subspaces tab opens with a search input, a wrapping tag chip row aggregated from subspace tags, and a 6-card initial grid with a Show more toggle; Admin + Lead filters on the Community tab overlap correctly for users holding both roles.

**Out of scope for this phase (follow-ups)**:
- Sidebar search field for subspaces when count > 3 (FR-028) — still pending
- Real "Archived" subspace filtering — the API doesn't expose status; consider dropping the status dimension entirely or surfacing it from the subspace visibility field
- Host role surfacing in the members filter — the role set doesn't distinguish Host from Admin today
- Pagination in the subspace grid beyond Show All (e.g. `+N` incremental reveal)

---

## Phase 19: Full Poll Feature Parity (US4 — FR-057a through FR-057k, FR-068a through FR-068c)

**Goal**: Replace the skeletal `CalloutPoll` and basic `PollOptionsEditor` with full-featured CRD components matching every capability of the MUI poll implementation — single/multi-choice voting, debounced submit, custom options, vote removal, results visibility/detail modes, voter avatars, poll settings dialog, drag-and-drop option reordering, open/close status management, and real-time subscription wiring.

**MUI reference files** (read these to understand every feature):
- `src/domain/collaboration/poll/PollView.tsx` — orchestrator with debounce, status messages, vote revocation
- `src/domain/collaboration/poll/PollVotingControls.tsx` — radio/checkbox rendering, option labels with progress bars, custom option row
- `src/domain/collaboration/poll/PollVoterAvatars.tsx` — stacked voter avatar row with hover expand + overflow
- `src/domain/collaboration/poll/PollFormFields.tsx` — drag-and-drop option editing, open/close toggle
- `src/domain/collaboration/poll/PollFormSettingsSection.tsx` — settings modal (single/multi, custom options, visibility, voter avatars)
- `src/domain/collaboration/poll/models/PollModels.ts` — all poll model types
- `src/domain/collaboration/poll/hooks/usePollVote.ts` — voting mutations with optimistic updates
- `src/domain/collaboration/poll/hooks/usePollSubscriptions.ts` — real-time subscription hook
- `src/domain/collaboration/poll/hooks/usePollOptionManagement.ts` — option CRUD mutations
- `src/domain/collaboration/callout/CalloutFramings/CalloutFramingPoll.tsx` — callout-to-poll bridge

### Sub-phase 19a: Primitives (no dependencies, all parallel)

- [X] T125 [P] Install Radix packages: `pnpm add @radix-ui/react-alert-dialog @radix-ui/react-tooltip @radix-ui/react-radio-group @radix-ui/react-checkbox @radix-ui/react-progress`
- [X] T126 [P] Port `src/crd/primitives/alert-dialog.tsx` from `prototype/src/app/components/ui/alert-dialog.tsx` — update import paths to `@/crd/lib/utils` and `@/crd/primitives/button`; remove `"use client"` directive; exports: `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogPortal`, `AlertDialogOverlay`
- [X] T127 [P] Port `src/crd/primitives/tooltip.tsx` from `prototype/src/app/components/ui/tooltip.tsx` — update imports; remove `"use client"`; exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- [X] T128 [P] Port `src/crd/primitives/radio-group.tsx` from `prototype/src/app/components/ui/radio-group.tsx` — update imports; remove `"use client"`; exports: `RadioGroup`, `RadioGroupItem`
- [X] T129 [P] Port `src/crd/primitives/checkbox.tsx` from `prototype/src/app/components/ui/checkbox.tsx` — update imports; remove `"use client"`; exports: `Checkbox`
- [X] T130 [P] Port `src/crd/primitives/progress.tsx` from `prototype/src/app/components/ui/progress.tsx` — update imports; remove `"use client"`; exports: `Progress`

### Sub-phase 19b: Common CRD components (depends on 19a)

- [X] T131 [P] Create `src/crd/components/dialogs/ConfirmationDialog.tsx` — generic confirmation dialog built on AlertDialog primitive; accepts `open`, `onOpenChange`, `title: string`, `description: string`, `confirmLabel: string`, `cancelLabel?: string`, `onConfirm`, `onCancel?`, `variant?: 'default' | 'destructive'` (destructive makes confirm button red), `loading?: boolean` (disables buttons + shows aria-busy); uses `useTranslation('crd-space')` for default cancel label; fully accessible (focus trapped, ESC to cancel)
- [X] T132 [P] Create `src/crd/components/common/PollVoterAvatars.tsx` — stacked voter avatar row; accepts `voters: { id: string; name: string; avatarUrl?: string }[]`, `maxVisible?: number` (default 10), `className?`; shows up to `maxVisible` Avatar primitives in a `-space-x-2` row with `hover:space-x-1` expand transition; overflow renders a `+N` circle with Tooltip showing the count; all avatars use `size-5` (20px); `aria-label` on the group ("N voters")

### Sub-phase 19c: Poll display — rewrite CalloutPoll (depends on 19a + 19b)

- [X] T133 Add i18n keys to `src/crd/i18n/space/space.en.json` under `poll.*`: `status.preparingVote`, `status.submitting`, `status.addingOption`, `status.voted`, `status.removeMyVote`, `status.closed`, `status.anonymous`, `vote.maxReached` (with `{{max}}`), `vote.minRequired` (with `{{min}}`), `results.totalVotes` (with `{{count}}`), `results.noVotes`, `results.votersMore` (with `{{count}}`), `removeVoteConfirm.title`, `removeVoteConfirm.description`, `removeVoteConfirm.confirm`, `customOption.placeholder`, `error.voteFailed`, `subscription.voteRevoked`; mirror to `space.{bg,de,es,fr,nl}.json`
- [X] T134 Rewrite `src/crd/components/callout/CalloutPoll.tsx` — full-featured poll display component. **Props** (plain TypeScript, no GraphQL types):
  ```
  PollOptionData: { id, text, sortOrder, voteCount?, votePercentage?, isSelected, voters?: { id, name, avatarUrl? }[] }
  CalloutPollProps: {
    title?: string;
    options: PollOptionData[];
    selectedOptionIds: string[];
    isSingleChoice: boolean;
    isClosed: boolean;
    canVote: boolean;
    showResults: boolean;
    showTotalOnly: boolean;
    resultsDetail: 'full' | 'count' | 'percentage';
    totalVotes?: number;
    hasVoted: boolean;
    isAnonymous: boolean;
    // Custom option
    showAddCustomOption: boolean;
    isAddingCustomOption: boolean;
    onSubmitCustomOption?: (text: string) => void;
    // Voting
    onChange: (selectedIds: string[]) => void;
    onRemoveVote?: () => void;
    // Status
    statusMessage?: string;
    statusProgress?: number; // 0-100 for debounce progress
    errorMessage?: string;
    warningMessage?: string;
    className?: string;
  }
  ```
  **Internal structure**:
  - `PollVotingControls` sub-component: renders RadioGroup (single) or Checkbox group (multi) with option labels; each option label shows text + optional results overlay (progress bar background via inline `width` style + count/percentage text + PollVoterAvatars when detail='full'); disabled states for closed polls and max-reached; min/max helper text
  - `CustomOptionRow` sub-component: inactive state shows placeholder text; active state shows text input with check/close icon buttons; Enter submits, Escape deactivates; max 512 chars
  - Footer area: status message with Progress indicator (debounce) or spinner (mutation), "Voted — Remove my vote" link (triggers `onRemoveVote`), "Closed" label, "Anonymous" label
  - All text via `useTranslation('crd-space')` with `poll.*` keys
  - Uses RadioGroup + RadioGroupItem primitives for single-choice; Checkbox primitive for multi-choice; Progress primitive for debounce indicator; Button, Avatar, Tooltip, Separator primitives as needed
  - NO business logic — all voting state management (debounce, optimistic updates) happens in the connector

### Sub-phase 19d: Poll form — rewrite PollOptionsEditor + new PollSettingsDialog (depends on 19a)

- [X] T135 Add i18n keys to `src/crd/i18n/space/space.en.json` under `pollForm.*`: `settings`, `settings.title`, `settings.votingOptions`, `settings.allowMultiple`, `settings.allowCustomOptions`, `settings.displayOptions`, `settings.hideResultsUntilVoted`, `settings.showVoterAvatars`, `settings.close`, `openPoll`, `closePoll`, `closePollConfirm.title`, `closePollConfirm.description`, `closePollConfirm.confirm`, `reopenPollConfirm.title`, `reopenPollConfirm.description`, `reopenPollConfirm.confirm`, `dragHandle` (sr-only); mirror to `space.{bg,de,es,fr,nl}.json`
- [X] T136 [P] Create `src/crd/forms/callout/PollSettingsDialog.tsx` — settings modal for poll configuration; built on Dialog primitive (not AlertDialog — this is a form, not a confirmation). **Props**:
  ```
  PollSettingsDialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allowMultiple: boolean;
    onAllowMultipleChange: (value: boolean) => void;
    allowCustomOptions: boolean;
    onAllowCustomOptionsChange: (value: boolean) => void;
    hideResultsUntilVoted: boolean;
    onHideResultsUntilVotedChange: (value: boolean) => void;
    showVoterAvatars: boolean;
    onShowVoterAvatarsChange: (value: boolean) => void;
    readOnly?: boolean;
  }
  ```
  Uses Switch primitive for each toggle; grouped into "Voting Options" and "Display Options" sections; disabled when `readOnly`; close button in header
- [X] T137 Rewrite `src/crd/forms/callout/PollOptionsEditor.tsx` — enhanced poll form with drag-and-drop reordering and settings. Replace existing basic implementation with:
  - @dnd-kit integration: `DndContext` + `SortableContext` + `useSortable` per option row; each row has a drag handle (GripVertical icon), text input, and delete button; `onDragEnd` reorders and calls `onOptionsChange`
  - Settings button opens PollSettingsDialog (via `settingsSlot: ReactNode` prop — the dialog itself is rendered by the consumer/connector to keep form state wiring outside CRD)
  - Open/Close poll toggle: renders when `pollStatus` prop is provided; shows Switch + label; triggers `onStatusChange` callback; consumer shows confirmation dialog before toggling
  - Disabled state when `isClosed` is true (all inputs + drag handles + add button disabled)
  - Existing props preserved (`question`, `onQuestionChange`, `questionError`, `options`, `onOptionsChange`); new props: `settingsSlot?: ReactNode`, `pollStatus?: 'open' | 'closed'`, `onStatusChange?: (status: 'open' | 'closed') => void`, `isClosed?: boolean`
  - Accessibility: drag handle has sr-only label, option inputs have `aria-label`, reorder announced via `@dnd-kit/accessibility`

### Sub-phase 19e: Integration — connector + data mapper (depends on 19c + 19d)

- [X] T138 Create `src/main/crdPages/space/callout/CalloutPollConnector.tsx` — wires CRD `CalloutPoll` to domain hooks. **Responsibilities**:
  - Receives `callout: CalloutDetailsModelExtended` prop
  - Extracts `poll` from `callout.framing.poll`; derives `canVote` from `AuthorizationPrivilege.Contribute`
  - Calls `usePollVote({ pollId, poll })` for `castVote` / `removeVote`
  - Calls `usePollSubscriptions({ pollId })` for real-time updates
  - Calls `usePollOptionManagement({ pollId })` for `addOption`
  - Implements `useDebouncedSubmit(2000)` hook (copy logic from MUI `PollView.tsx`) for multi-choice debounce with progress tracking
  - Manages local `selectedOptionIds` state synced with server via `useEffect` on `poll.myVote`
  - Handles custom option flow: `addOption` → find new option → `castVote` with new option included
  - Maps `PollDetailsModel` fields to `CalloutPollProps`: `isSingleChoice` from `maxResponses === 1`, `showResults` from `canSeeDetailedResults`, `resultsDetail` from settings enum → `'full' | 'count' | 'percentage'`, `isAnonymous` from `resultsDetail !== Full`, `showAddCustomOption` from settings + authorization + not closed + options < 10
  - Maps `statusMessage` from loading/debounce state
  - Renders `ConfirmationDialog` for vote removal (controlled by local `confirmRemoveOpen` state)
  - Handles subscription-driven vote revocation (myVote goes non-null → null)
- [X] T139 Update `src/main/crdPages/space/callout/LazyCalloutItem.tsx` — when `callout.framing.type === CalloutFramingType.Poll`, render `CalloutPollConnector` instead of / in addition to the PostCard content area. The poll renders inline within the callout block, below the description
- [X] T140 Update `src/main/crdPages/space/callout/FramingEditorConnector.tsx` — when `framingType === 'poll'`, render the enhanced `PollOptionsEditor` with settings slot wired to `PollSettingsDialog`; wire `onStatusChange` to show confirmation dialog before toggling; pass poll status and closed state
- [X] T141 Update `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` — add poll settings fields to form state: `pollAllowMultiple`, `pollAllowCustomOptions`, `pollHideResultsUntilVoted`, `pollShowVoterAvatars`; map these to `PollFormFieldSubmittedValues.settings` on submit
- [X] T142 Update `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — add poll data to `CalloutDetailDialogData` when framing type is Poll; map `poll.title`, `poll.options`, `poll.settings`, `poll.myVote`, `poll.totalVotes`, `poll.status`, `poll.canSeeDetailedResults`

### Sub-phase 19f: Callout detail dialog poll rendering (depends on 19e)

- [X] T143 Update `src/crd/components/callout/CalloutDetailDialog.tsx` — add optional `pollSlot?: ReactNode` prop; render it between the description and the reactions bar when provided; the slot receives the fully-wired `CalloutPollConnector` from the integration layer
- [X] T144 Update `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx` — when the callout has a poll framing, render `CalloutPollConnector` and pass it as `pollSlot` to `CalloutDetailDialog`

### Sub-phase 19g: Polish & verification (depends on all above)

- [X] T145 [P] Accessibility audit of all new poll components — verify: radio/checkbox groups have `aria-label` on the fieldset, icon-only buttons have `aria-label`, progress indicators use `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, voter avatars group has descriptive `aria-label`, custom option input has `aria-label`, confirmation dialogs trap focus, status messages use `role="status"`, drag handles have sr-only instructions
- [X] T146 [P] Verify zero MUI imports in all new/modified `src/crd/` files — grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `formik`, `react-router-dom`
- [X] T147 [P] Update `src/crd/components/index.md` component inventory with new components: `CalloutPoll` (rewritten), `PollVoterAvatars`, `ConfirmationDialog`, and new primitives
- [X] T148 [P] Update `src/crd/app/pages/SpacePage.tsx` mock data — add a poll callout with sample options, votes, and voter avatars to the standalone preview app
- [X] T149 [P] Add i18n keys for ConfirmationDialog default cancel label to `src/crd/i18n/space/space.en.json` (`dialogs.cancel`) and mirror to other languages

**Checkpoint**: Poll callouts render with full feature parity to MUI version — single/multi-choice voting, debounced multi-choice, custom options, vote removal with confirmation, results visibility/detail modes, voter avatars with hover expand, real-time subscription updates, status messages, closed poll state. Poll creation form has drag-and-drop reordering, settings dialog, and open/close toggle. All components pass CRD golden rules (no MUI, no business logic in `src/crd/`, plain TS props, Tailwind only). Standalone preview app shows a sample poll.

**Out of scope for this phase**:
- Min/max response number inputs in settings dialog (behind `SHOW_MIN_MAX_SETTINGS = false` flag in MUI — disabled for now)
- ContributorTooltip on voter avatars (hover-fetches contributor data — would require a CRD tooltip + connector with lazy GraphQL query; deferred to a future phase)
- Poll status change mutations from the form (Open/Close toggle calls a callback; the actual `updatePollStatus` mutation is wired in the connector, not in the CRD layer)

---

## Dependencies & Execution Order

```
Phase 1 (setup + primitives)
  ├── Phase 2 (shell) ─────────── BLOCKS all content phases
  │     ├── Phase 3 (sidebar)     can be parallel with Phase 4
  │     └── Phase 4 (content)     can be parallel with Phase 3
  │           └── Phase 5 (integration) ─── depends on 2+3+4
  │                 ├── Phase 6 (community)
  │                 ├── Phase 7 (custom tabs)
  │                 ├── Phase 8 (forms/management)
  │                 ├── Phase 9 (tab actions) — just needs Phase 2
  │                 ├── Phase 10 (contributions)
  │                 └── Phase 13 (about) — just needs Phase 2
  │
  Phase 8 complete → Phase 11 (templates)
  Phase 5 + Phase 16 complete → Phase 12 (comments — depends on LazyCalloutItem for wiring)
  Phase 5 complete → Phase 16 (callout lazy loading)
  Phase 6 complete → Phase 17 (community + subspaces top-section revision)
  Phase 17 complete → Phase 18 (community sidebar + subspace filter refinement)
  Phase 5 complete → Phase 19 (full poll feature parity — depends on integration layer being in place)
  All desired → Phase 14 (mobile) + Phase 15 (polish)
```

### MVP: Phases 1–5

1. Phase 1: Setup (i18n, primitives, common components)
2. Phase 2: Shell (SpaceShell + SpaceHeader + SpaceNavigationTabs + routing + toggle)
3. Phase 3: Sidebar (SpaceSidebar variant-based)
4. Phase 4: Content (PostCard + SpaceFeed + SpaceMembers + SpaceSubspacesList + callout-specific)
5. Phase 5: Integration (data mappers + hooks + connectors + tab pages)

**VALIDATE**: Dashboard + Subspaces tabs render with prototype-styled components. Toggle works.

---

## Phase 20: Callout Creation Mutation Wiring (Post-MVP)

**Goal**: Wire the callout creation form to the GraphQL mutation so clicking "Post" or "Save Draft" actually creates a callout on the server.

- [X] T150 Update `src/main/crdPages/space/callout/CalloutFormConnector.tsx` — remove `onSubmit` prop; add `calloutsSetId?: string` prop; call `useCalloutCreation({ calloutsSetId })` internally; map form values to `CalloutCreationType` (framing type, profile, poll settings, link references, tags, visibility, sendNotification); call `handleCreateCallout` on submit/save-draft; Apollo cache update is handled by `useCalloutCreation`
- [X] T151 [P] Update all 4 tab pages (`CrdSpaceDashboardPage`, `CrdSpaceCommunityPage`, `CrdSpaceSubspacesPage`, `CrdSpaceCustomTabPage`) — pass `calloutsSetId` to `<CalloutFormConnector>`
- [X] T152 [P] Update `src/main/crdPages/space/callout/CalloutEditConnector.tsx` — remove stale `onSubmit` prop; pass `calloutsSetId` through

**Checkpoint**: Clicking "Post" in the callout creation form sends the GraphQL `createCalloutOnCalloutsSet` mutation with correct field mapping. The new callout appears in the feed via Apollo cache update. "Save Draft" creates with `CalloutVisibility.Draft`.

---

## Sub-Specification Tasks

The following areas have their own task lists in dedicated sub-spec documents:

- **[Iframe Whitelist Context](./iframe-whitelist/tasks.md)** — 4 tasks (T1–T4): context provider, MarkdownContent update, main app wiring, demo app wiring
- **[CRD Markdown Editor](./markdown-editor/tasks.md)** — 16 tasks (T1–T16): converter, extensions, editor state, toolbar, link dialog, styles, main component, i18n, AddPostModal slot, connector wiring, preview, verification
- **[CRD Whiteboard Migration](./whiteboard/tasks.md)** — 25 tasks (T1–T25) across 8 phases: i18n namespace, JoinWhiteboardDialog, WhiteboardErrorState, CrdPublicWhiteboardPage, route wiring, WhiteboardEditorShell, WhiteboardDisplayName, WhiteboardCollabFooter, WhiteboardSaveFooter, CrdWhiteboardDialog (multi-user), CrdSingleUserWhiteboardDialog (single-user), CrdWhiteboardView, PreviewSettingsDialog, PreviewCropDialog, demo app page, verification

---

## Notes

- **Prototype = visual reference** — `prototype/src/app/components/space/` defines the visual design. CRD components match the look but use our own prop types and CRD conventions.
- **Hybrid callout design (D-proto-4)** — text/memo callouts render as PostCard; whiteboard/poll/media/link use custom callout components
- **12-col grid layout (D-proto-1)** — sidebar col 2 (2 wide), content col 4-11 (8 wide), matching prototype SpaceShell
- **Mobile: spec bottom bar (D-proto-3)** — not prototype's simple scroll tabs; better mobile UX
- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- CRD components MUST pass `src/crd/CLAUDE.md` component checklist
- MUI dialogs triggered from CRD render as portals outside `.crd-root`
- Inline `style` acceptable for `color-mix()`, `clamp()`, and runtime values only
