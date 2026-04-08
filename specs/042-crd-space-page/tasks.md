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

## Phase 12: US12 — Callout Comments (Priority: P3)

- [X] T078 [P] Create `src/crd/components/callout/CalloutCommentItem.tsx` — author avatar, name, timestamp, content; indented for replies
- [X] T079 Create `src/crd/components/callout/CalloutComments.tsx` — threaded list + add-comment form; accepts `comments`, `canComment`, `onAddComment`, `onReply`
- [X] T080 Create `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx` — maps comment data + mutations
- [X] T081 Wire comments into PostCard footer (expandable) and below callout-specific components; hide when `commentsEnabled` is false

---

## Phase 13: US13 — About Page (Priority: P3)

- [X] T082 [P] Create `src/crd/components/space/SpaceAboutView.tsx` — full about page: name, tagline, description, location, metrics, leads, host, Why, Who, guidelines, references; accepts `SpaceAboutData` + `joinAction?: ReactNode`
- [X] T083 Create `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` — uses `useSpaceAboutDetailsQuery()`; maps to SpaceAboutView; includes MUI ApplicationButton for non-members; public route (FR-044)

---

## Phase 14: US14 — Responsive Mobile Experience (Priority: P3)

- [X] T084 Audit and refine SpaceNavigationTabs mobile bottom bar (T013) — fixed bar, "More" drawer, no overlap with FABs
- [X] T085 Audit and refine SpaceShell mobile layout (T011) — sidebar hidden, single-column, grids reflow
- [X] T086 Audit and refine SpaceHeader mobile banner (T012) — no horizontal overflow, title/tagline truncation

---

## Phase 15: Polish & Cross-Cutting Concerns

- [X] T087 [P] Create standalone preview app page `src/crd/app/pages/SpacePage.tsx` with mock data; add route in CrdApp.tsx
- [X] T088 [P] Accessibility audit — all CRD Space components pass `src/crd/CLAUDE.md` checklist
- [X] T089 [P] Verify zero MUI imports in `src/crd/` — grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `formik`, `react-router-dom`
- [X] T090 Update `src/crd/components/index.md` component inventory

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
  Phase 5 complete → Phase 12 (comments)
  Phase 5 complete → Phase 16 (callout lazy loading)
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

## Notes

- **Prototype = visual reference** — `prototype/src/app/components/space/` defines the visual design. CRD components match the look but use our own prop types and CRD conventions.
- **Hybrid callout design (D-proto-4)** — text/memo callouts render as PostCard; whiteboard/poll/media/link use custom callout components
- **12-col grid layout (D-proto-1)** — sidebar col 2 (2 wide), content col 4-11 (8 wide), matching prototype SpaceShell
- **Mobile: spec bottom bar (D-proto-3)** — not prototype's simple scroll tabs; better mobile UX
- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- CRD components MUST pass `src/crd/CLAUDE.md` component checklist
- MUI dialogs triggered from CRD render as portals outside `.crd-root`
- Inline `style` acceptable for `color-mix()`, `clamp()`, and runtime values only
