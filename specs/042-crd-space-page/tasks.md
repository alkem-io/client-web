# Tasks: CRD Space L0 Page Migration (with Callouts)

**Input**: Design documents from `/specs/042-crd-space-page/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n namespace, shared CRD utility components, and translation files

- [x] T001 Create i18n translation file `src/crd/i18n/space/space.en.json` with keys for banner, tabs (dashboard, community, subspaces, knowledgeBase), callout labels (draft, expand, collapse, create, edit, delete, publish, unpublish, share, move, settings, template, sort), contribution labels, comment labels, about page labels, visibility notices, mobile actions, and accessibility labels
- [x] T002 [P] Create translation files for remaining languages: `src/crd/i18n/space/space.bg.json`, `src/crd/i18n/space/space.de.json`, `src/crd/i18n/space/space.es.json`, `src/crd/i18n/space/space.fr.json`, `src/crd/i18n/space/space.nl.json`
- [x] T003 Register `crd-space` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports` with lazy imports for all 6 languages; add type declaration in `@types/i18next.d.ts`
- [x] T004 [P] Create `src/crd/components/common/MarkdownContent.tsx` — renders sanitized HTML string as formatted content, accepts `className` prop, uses Tailwind prose classes
- [x] T005 [P] Create `src/crd/components/common/ExpandableDescription.tsx` — truncated text with expand/collapse toggle, accepts `description: string`, `maxLines?: number`, `editHref?: string`, `canEdit?: boolean`, `onEdit?: () => void`
- [x] T006 [P] Create `src/crd/components/common/ContentBlock.tsx` — generic sidebar/content block with optional accent border, title slot, and children; used by multiple tab pages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Route wiring, page shell integration, and shared data mappers that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` — maps SpaceContext data (from `useSpace()`) to `SpaceBannerData`, `SpaceVisibilityData`, and `SpaceTabActionConfig` types defined in data-model.md
- [x] T008 Create `src/main/crdPages/space/hooks/useCrdSpaceTabs.ts` — wraps existing `useSpaceTabs()` from `src/domain/space/layout/tabbedLayout/layout/useSpaceTabs.tsx`, maps output to `SpaceTabDefinition[]` (data-model.md), replaces MUI icons with lucide-react equivalents
- [x] T009 Create `src/crd/layouts/SpacePageShell.tsx` — CRD page shell component accepting `banner: SpaceBannerData`, `tabs: SpaceTabDefinition[]`, `tabActions: SpaceTabActionConfig`, `visibility: SpaceVisibilityData`, `breadcrumbs: { label: string; href?: string }[]`, `activeTabIndex: number`, `onTabChange: (index: number) => void`, `onAction: (action: string) => void`, plus `children` for Outlet content; renders breadcrumbs bar (space hierarchy path) + banner + tabs + content area inside `.crd-root` (FR-008)
- [x] T010 Create `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` — integration layer connecting SpacePageShell to app data via `useSpace()`, `useCrdSpaceTabs()`, `spacePageDataMapper`; maps `spaceHierarchyPath` from URL resolver to breadcrumb props; manages MUI dialog state (Activity, VideoCall, Share) via callbacks; renders `<Outlet />` for tab content
- [x] T011 Create `src/main/crdPages/space/routing/CrdSpaceRoutes.tsx` — mirrors `src/domain/space/routing/SpaceRoutes.tsx` structure: wraps routes in `SpaceContextProvider` (reused unchanged), uses `CrdSpacePageLayout` as layout element, defines routes for `/about`, `/` (index), `/collaboration/:calloutNameId`, `/settings/*`, `/challenges/:subspaceNameId/*`, legacy redirects
- [x] T012 Create `src/main/crdPages/space/tabs/CrdSpaceTabbedPages.tsx` — tab content router matching `sectionIndex` to tab page components (Dashboard at 0, Community at 1, Subspaces at 2, Custom at 3+); use a section-type mapping (not hardcoded positional switch) per plan D4 for future layout setting readiness
- [x] T013 Update `src/main/routing/TopLevelRoutes.tsx` — add CRD route toggle for `:spaceNameId/*`: when `crdEnabled`, wrap in `CrdLayoutWrapper` + `UrlResolverProvider` and route to `CrdSpaceRoutes`; when disabled, keep existing `SpaceRoutes`. Follow the same pattern as the `/spaces` CRD toggle (lines 132-165)

**Checkpoint**: Route toggle works — navigating to any Space URL with CRD enabled loads CrdSpacePageLayout (may show empty content area). MUI Space page still works with CRD disabled.

---

## Phase 3: Cleanup — Delete Non-Prototype-Aligned Components

**Purpose**: Remove CRD components built without prototype reference. Integration layer and data mappers are kept.

**Context**: Components in Phases 3–6 (old) were built from scratch and don't match the prototype's visual design. The prototype at `prototype/src/app/components/space/` is the visual reference for all CRD space components.

- [ ] T100 Delete old CRD space components that don't match prototype: `src/crd/components/space/SpaceBanner.tsx`, `SpaceVisibilityNotice.tsx`, `SpaceTabs.tsx`, `SpaceTabLayout.tsx`, `SpaceLeadsSection.tsx`, `SpaceWelcomeBlock.tsx`, `SpaceDashboardNav.tsx`, `SpaceCalendarSection.tsx`, `SpaceUpdatesSection.tsx`, `SpaceSubspaceList.tsx`
- [ ] T101 Delete old CRD callout components: `src/crd/components/callout/CalloutDraftBadge.tsx`, `CalloutHeader.tsx`, `CalloutBlock.tsx`, `CalloutList.tsx`, `CalloutFramingMemo.tsx`, `CalloutFramingWhiteboard.tsx`, `CalloutFramingLink.tsx`, `CalloutFramingMedia.tsx`, `CalloutFramingPoll.tsx`
- [ ] T102 Delete old CRD layout: `src/crd/layouts/SpacePageShell.tsx`

---

## Phase 4: Primitives — Port Missing shadcn/ui Components

**Purpose**: Ensure all shadcn primitives needed by prototype-style components are available

- [ ] T103 [P] Port `card.tsx` primitive (Card, CardHeader, CardContent, CardFooter) from `prototype/src/app/components/ui/card.tsx` to `src/crd/primitives/card.tsx` — update imports to use `@/crd/lib/utils`
- [ ] T104 [P] Port `separator.tsx` primitive from prototype to `src/crd/primitives/separator.tsx`
- [ ] T105 [P] Verify `avatar.tsx`, `badge.tsx`, `button.tsx` primitives exist and match prototype versions; port any missing sub-components

---

## Phase 5: Shell Components — Prototype-Guided (US1)

**Goal**: CRD page shell visually matches prototype's SpaceShell + SpaceHeader + SpaceNavigationTabs

**Visual reference**: `prototype/src/app/components/space/SpaceShell.tsx`, `SpaceHeader.tsx`, `SpaceNavigationTabs.tsx`

- [ ] T106 Create `src/crd/layouts/SpaceShell.tsx` — 12-col grid layout matching prototype: `grid-cols-12 gap-6`, sidebar at `lg:col-start-2 lg:col-span-2` (hidden on mobile), content at `col-span-12 lg:col-span-8`; accepts `header: ReactNode`, `sidebar: ReactNode`, `tabs: ReactNode`, `breadcrumbs?: ReactNode` (FR-008: rendered above header, aligned to grid), `children: ReactNode`; no business logic, no routing
- [ ] T107 Create `src/crd/components/space/SpaceHeader.tsx` — 320px hero banner matching prototype visual: background-image with gradient overlay (`linear-gradient(to top, rgba(29,56,74,0.4), rgba(102,102,102,0.08))`), title + tagline at bottom-left with optional Home Space pin indicator (FR-011: `isHomeSpace` prop renders Home icon next to title), member avatar stack at bottom-right, action icon buttons (Documents, Video, Share, Settings) at top-right; accepts `title`, `tagline?`, `bannerUrl?`, `isHomeSpace?: boolean`, `memberAvatars: { url?: string; initials: string }[]`, `memberCount: number`, `actions: SpaceHeaderActions`, `onMemberClick?`; uses 12-col inner grid for alignment; converts prototype inline styles to Tailwind where possible
- [ ] T108 Create `src/crd/components/space/SpaceNavigationTabs.tsx` — Desktop: text-only horizontal scroll tabs matching prototype (no icons, `border-b-2` active indicator, `text-sm font-medium`), scroll-into-view on active tab; Mobile (`isSmallScreen`): fixed bottom bar with tab buttons + "More" overflow drawer using Sheet primitive; accepts `tabs: { label: string; index: number }[]`, `activeIndex: number`, `onTabChange: (index: number) => void`, `mobileActions?: { label: string; icon: ReactNode; onClick: () => void }[]`
- [ ] T109 Create `src/crd/components/space/SpaceVisibilityNotice.tsx` — simple alert bar for Archived/Demo/Inactive spaces (not in prototype, but required by spec); colored banner below header; accepts `status: 'active' | 'archived' | 'demo' | 'inactive'`, `contactHref?`
- [ ] T110 Update `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` — wire SpaceShell + SpaceHeader + SpaceNavigationTabs + SpaceVisibilityNotice with data from `useSpace()`, `useCrdSpaceTabs()`, `spacePageDataMapper`; map `spaceHierarchyPath` from URL resolver to breadcrumb nav passed to SpaceShell (FR-008); render `<Outlet />` as children; pass sidebar variant based on current tab index

**Checkpoint**: CRD page shell renders with 12-col grid, 320px hero banner, text tabs, sidebar area. Matches prototype layout. Tab clicks update URL. Toggle off returns to MUI.

---

## Phase 6: Sidebar — Prototype-Guided Variant Component

**Goal**: Single variant-based sidebar matching prototype's SpaceSidebar with all sub-sections

**Visual reference**: `prototype/src/app/components/space/SpaceSidebar.tsx`

- [ ] T111 [P] Create `src/crd/components/space/sidebar/InfoBlock.tsx` — primary-colored description block with "Read more" button; matches prototype InfoBlock (bg-primary, primary-foreground text, rounded-lg padding); accepts `description: string`, `onReadMore?: () => void`
- [ ] T112 [P] Create `src/crd/components/space/sidebar/SubspacesSection.tsx` — avatar + name list with "Show all" link and settings icon; matches prototype SubspacesSection; accepts `subspaces: { name: string; initials: string; color: string; href: string }[]`, `showAll?: boolean`, `showAllHref?: string`, `onSettings?: () => void`
- [ ] T113 [P] Create `src/crd/components/space/sidebar/EventsSection.tsx` — collapsible events list with "Show calendar" link and add button; matches prototype EventsSection; accepts `events: { title: string; date: string }[]`, `onShowCalendar?: () => void`, `onAddEvent?: () => void`
- [ ] T114 [P] Create `src/crd/components/space/sidebar/LeadBlock.tsx` — lead user card with avatar, name, location (MapPin icon), bio; matches prototype LeadBlock; accepts `name: string`, `avatarUrl?`, `initials: string`, `location?`, `bio?`
- [ ] T115 [P] Create `src/crd/components/space/sidebar/VirtualContributorsSection.tsx` — AI contributor list with Bot icon header, avatar + name + description per item; matches prototype; accepts `contributors: { name: string; description: string; avatarUrl?: string; initials: string }[]`
- [ ] T116 [P] Create `src/crd/components/space/sidebar/CommunityGuidelinesSection.tsx` — bulleted guidelines with ShieldCheck icons and BookOpen header; matches prototype; accepts `guidelines: string[]`
- [ ] T117 [P] Create `src/crd/components/space/sidebar/KnowledgeIndexSection.tsx` — scrollable post index with FolderOpen header, FileText icons per entry; matches prototype; accepts `entries: { id: string; title: string; type: 'text' | 'collection' }[]`, `onEntryClick?: (id: string) => void`
- [ ] T118 Create `src/crd/components/space/SpaceSidebar.tsx` — variant-based sidebar composing sub-components: `variant='home'` shows InfoBlock + "About" button + SubspacesSection + EventsSection; `variant='community'` shows InfoBlock + LeadBlock + Contact/Invite buttons + VirtualContributorsSection + CommunityGuidelinesSection; `variant='subspaces'` shows InfoBlock + SubspacesSection(showAll); `variant='knowledge'` shows InfoBlock + "About" button + KnowledgeIndexSection + EventsSection; accepts variant + all sub-component props via typed prop groups

**Checkpoint**: Sidebar renders correctly for each variant. Visual style matches prototype (primary InfoBlock, uppercase section headers at 11px, hover states, avatar sizing).

---

## Phase 7: Content Components — Prototype-Guided (US2, US3, US4)

**Goal**: Feed, member, and subspace list components visually match prototype

**Visual reference**: `prototype/.../PostCard.tsx`, `SpaceFeed.tsx`, `SpaceMembers.tsx`, `SpaceSubspacesList.tsx`

- [ ] T119 Create `src/crd/components/space/PostCard.tsx` — Card matching prototype PostCard visual: author avatar + name + role badge + timestamp header, title (text-lg font-bold), snippet (text-sm line-clamp-3), type-specific content preview area (text → nothing extra, whiteboard → image with "Open Whiteboard" overlay, collection → 2x2 item grid, call-for-whiteboards → thumbnail grid with +N overlay), comments footer with MessageSquare icon; accepts `PostCardData` props with `type: 'text' | 'whiteboard' | 'collection' | 'call-for-whiteboards'`, `onClick?`, `onSettingsClick?`, `onExpandClick?`; uses Card/CardHeader/CardContent/CardFooter primitives
- [ ] T120 Create `src/crd/components/space/SpaceFeed.tsx` — vertical list of PostCard components matching prototype SpaceFeed: title header + "Add Post" button + space-y-6 card list + "Show More" button; accepts `title: string`, `posts: PostCardData[]`, `canCreate?`, `onCreateClick?`, `loading?`, `onShowMore?`, `hasMore?`; skeleton loading state; reusable across all tab pages
- [ ] T121 Create `src/crd/components/space/SpaceMembers.tsx` — search + role filter + paginated member grid matching prototype SpaceMembers: search input, filter pill buttons (All/Host/Admin/Lead/Member/Organization), responsive grid (1/2/3 cols), UserCard (avatar + name + role badge + bio + join date) and OrgCard (avatar + name + type badge + description + member count) sub-components, pagination controls (prev/next); accepts `members: MemberCardData[]`, `filters: string[]`, `pageSize?: number`
- [ ] T122 Create `src/crd/components/space/SpaceSubspacesList.tsx` — status filter + SpaceCard grid matching prototype: header with title + "Create Subspace" button, filter buttons (All/Active/Archived), responsive grid (1/2/3 cols) using existing SpaceCard from 039, empty state with dashed border; accepts `subspaces: SubspaceCardData[]`, `canCreate?`, `onCreateClick?`

### Callout-specific components (not PostCard style — per hybrid decision):

- [ ] T123 [P] Create `src/crd/components/callout/CalloutWhiteboardPreview.tsx` — whiteboard framing: preview image + "Open Whiteboard" button; accepts `previewUrl?`, `onOpen: () => void`
- [ ] T124 [P] Create `src/crd/components/callout/CalloutPoll.tsx` — poll framing: question text + votable option buttons with progress bars, vote counts, percentages; accepts `question`, `options: PollOption[]`, `canVote`, `onVote`
- [ ] T125 [P] Create `src/crd/components/callout/CalloutMediaGallery.tsx` — media framing: image grid with aspect-square thumbnails + upload placeholder for editors; accepts `images: MediaImage[]`, `canEdit`, `onAddImage?`
- [ ] T126 [P] Create `src/crd/components/callout/CalloutLinkAction.tsx` — link framing: CTA button with URL validation; accepts `url`, `displayName`, `isExternal`

**Checkpoint**: PostCard matches prototype visually (Card shadow, author header, type badges). SpaceFeed renders post list. SpaceMembers has search+filters+pagination. SpaceSubspacesList has filter pills + grid.

---

## Phase 8: Integration Layer Updates

**Purpose**: Wire new prototype-guided CRD components into the existing integration layer

- [ ] T127 Update `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx` — render SpaceSidebar(variant="home") in sidebar slot and SpaceFeed in content area; map useCrdSpaceDashboard data to new component props; wire About button, calendar, events, subspaces sidebar data
- [ ] T128 Update `src/main/crdPages/space/tabs/CrdSpaceSubspacesPage.tsx` — render SpaceSidebar(variant="subspaces") + SpaceSubspacesList + SpaceFeed; map subspace query data to SpaceSubspacesList props
- [ ] T129 Update `src/main/crdPages/space/callout/CalloutListConnector.tsx` — map callouts to PostCard format for text/memo types; render CalloutWhiteboardPreview/CalloutPoll/CalloutMediaGallery/CalloutLinkAction for non-text types; render via SpaceFeed component
- [ ] T130 Update `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — add mapping from CalloutFramingType to PostCard `type` field; map callout data to `PostCardData` shape for text/memo framing types

**Checkpoint**: Dashboard and Subspaces tabs render with prototype-styled components. Callouts display as PostCards (text/memo) or custom components (whiteboard/poll/media/link). Type-check passes.

---

## Phase 9: US5 — Community Tab (Priority: P2)

**Goal**: Community tab shows leads, members, guidelines, invite, and virtual contributors

**Independent Test**: Navigate to Community tab. SpaceSidebar(community) shows lead, contact/invite buttons, VCs, guidelines. SpaceMembers shows search+filters+paginated grid. CommunityFeed shows community posts.

**Note**: SpaceMembers (T121), SpaceSidebar community variant (T118), and sidebar sub-components LeadBlock (T114), VirtualContributorsSection (T115), CommunityGuidelinesSection (T116) are built in Phases 6-7. This phase wires them to data.

- [ ] T043 [US5] Create `src/main/crdPages/space/dataMappers/communityDataMapper.ts` — maps `useRoleSetManager()` output to `MemberCardData[]` for SpaceMembers and lead data for SpaceSidebar; maps `VirtualContributor` data to sidebar VC props
- [ ] T044 [US5] Create `src/main/crdPages/space/hooks/useCrdSpaceCommunity.ts` — composes `useSpaceTabProvider()`, `useRoleSetManager()`, `useSendMessageToCommunityLeads()`, `useSpace()` (entitlements); returns leads, members, VCs, guidelines, invite permission, contact callback
- [ ] T045 [US5] Create `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` — integration page rendering SpaceShell with SpaceSidebar(variant="community") and main content area (SpaceMembers + SpaceFeed as community feed); wires sidebar data (lead, VCs, guidelines) via communityDataMapper; triggers MUI DirectMessage and InviteContributors dialogs via callbacks

**Checkpoint**: Community tab renders with real data. Leads, members, guidelines all correct. Contact/Invite trigger MUI dialogs.

---

## Phase 10: US6 — Custom Tabs / Knowledge Base (Priority: P2)

**Goal**: Custom tabs show searchable callout sidebar, tag cloud filtering, and flow-state-classified callouts

**Independent Test**: Navigate to Knowledge Base tab (or any custom tab). Tag cloud filters callouts. Sidebar list is searchable. Only callouts for this tab's flow state are shown.

- [ ] T046 [P] [US6] Create `src/crd/components/callout/CalloutSidebarList.tsx` — sidebar list of callout titles with search field; accepts `items: { id: string; title: string; type: string }[]`; search filters by title; shows type icon per item
- [ ] T047 [P] [US6] Create `src/crd/components/callout/CalloutTagCloud.tsx` — tag filtering component with selectable chips, selected tags with deselect action, results count, and clear-all link; accepts `tags: { name: string; count: number }[]`, `selectedTags: string[]`, `resultsCount: number`, `onSelectTag`, `onDeselectTag`, `onClear`
- [ ] T048 [US6] Create `src/main/crdPages/space/tabs/CrdSpaceCustomTabPage.tsx` — integration page accepting `sectionIndex: number`; uses `useSpaceTabProvider({ tabPosition: sectionIndex })` and `useCrdCalloutList()` with `tagsFilter` state; renders SpaceShell with SpaceSidebar(variant="knowledge") containing tab description + create trigger + CalloutSidebarList, and main content area with CalloutTagCloud + CalloutListConnector (via SpaceFeed); each tab shows only callouts classified under its Innovation Flow state

**Checkpoint**: Knowledge Base and any custom tabs render correctly. Tag cloud filters callouts. Each tab shows only its flow state's callouts.

---

## Phase 11: US7+US8 — Callout Creation, Editing & Management (Priority: P2)

**Goal**: Authorized users can create, edit, publish/unpublish, delete, reorder, and manage callouts via forms and context menu

**Independent Test**: As space admin, create callouts of each framing type. Edit an existing callout. Use context menu to publish/unpublish, delete, reorder. Verify validation and permission gating.

- [ ] T049 [P] [US7] Create `src/crd/forms/callout/CalloutFramingSelector.tsx` — 6-option radio group (None, Whiteboard, Memo, Link, MediaGallery, Poll) with distinctive lucide-react icons and tooltips; accepts `value`, `onChange`, `disabled`
- [ ] T050 [P] [US7] Create `src/crd/forms/callout/LinkFramingFields.tsx` — URL input + display name input; both required; URL validated for http/https; accepts `url`, `displayName`, `onUrlChange`, `onDisplayNameChange`, `urlError`, `nameError`
- [ ] T051 [P] [US7] Create `src/crd/forms/callout/PollOptionsEditor.tsx` — poll title field + 2-10 option inputs with add/remove; min/max response settings; accepts typed props for each field + validation errors
- [ ] T052 [P] [US7] Create `src/crd/forms/callout/CalloutContributionSettings.tsx` — allowed contribution type selector (None/Post/Memo/Whiteboard/Link) and comments toggle; accepts `allowedType`, `commentsEnabled`, `onChange` callbacks
- [ ] T053 [P] [US7] Create `src/crd/forms/callout/CalloutVisibilitySelector.tsx` — Draft/Published toggle with notification checkbox (enabled only when form valid); accepts `visibility`, `sendNotification`, `onChange`, `isValid`
- [ ] T054 [US7] Create `src/crd/forms/callout/AddPostModal.tsx` — post composition modal matching prototype visual (`AddPostModal.tsx`): title input, markdown editor slot, attachment buttons (Whiteboard/Memo/CTA/Image), collapsible settings (tags, comments toggle, collection type selector), "Save Draft" + "Post" footer buttons; accepts per-field value/onChange/error props + `framingEditorSlot: ReactNode` + `onSubmit`, `onSaveDraft`, `onFindTemplate` callbacks; uses Dialog primitive for modal shell
- [ ] T055 [US7] Create `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` — manages Formik context for callout creation/editing; maps form values to `CreateCalloutEntityInput` / `UpdateCalloutEntityInput` GraphQL mutations; handles media gallery upload, poll option diffing, and whiteboard visual upload; provides `isValid`, `isDirty`, `onSubmit`, `onSaveDraft`
- [ ] T056 [US7] Create `src/main/crdPages/space/callout/CalloutFormConnector.tsx` — renders CRD AddPostModal inside Formik context from `useCrdCalloutForm`; binds each CRD form field to Formik fields; renders `FramingEditorConnector` as the type-specific editor slot
- [ ] T057 [US7] Create `src/main/crdPages/space/callout/FramingEditorConnector.tsx` — renders the appropriate editor for the selected framing type: existing Tiptap markdown editor (Memo), existing FormikWhiteboardPreview (Whiteboard), CRD LinkFramingFields (Link), existing media gallery uploader (MediaGallery), CRD PollOptionsEditor (Poll); wraps third-party editors with Formik field bindings
- [ ] T058 [US7] Create `src/main/crdPages/space/callout/CalloutEditConnector.tsx` — loads existing callout data via `useCalloutContentQuery`, pre-fills CalloutFormConnector with current values, locks framing type and contribution type selectors (read-only)
- [ ] T059 [P] [US8] Create `src/crd/components/callout/CalloutContextMenu.tsx` — Radix DropdownMenu with items: Edit, Publish/Unpublish, Delete, Sort Contributions, Save as Template, Move (sub-menu: Up/Down/Top/Bottom with disabled states at boundaries), Share; each item gated by permission props (`editable`, `movable`, `canSaveAsTemplate`); keyboard navigable with screen reader announcements
- [ ] T060 [US8] Create `src/main/crdPages/space/callout/CalloutManagementConnector.tsx` — handles context menu actions: Edit → opens CalloutEditConnector in dialog; Publish/Unpublish → `useUpdateCalloutVisibilityMutation` with notification toggle; Delete → confirmation dialog + `useDeleteCalloutMutation`; Sort → opens MUI CalloutContributionsSortDialog; Move → `useUpdateCalloutsSortOrderMutation`; Share → opens MUI ShareDialog; Save as Template → opens MUI CreateTemplateDialog
- [ ] T061 [US8] Wire CalloutContextMenu into PostCard via CalloutListConnector (T129) — when settings icon clicked on a PostCard, render CalloutContextMenu with permission-gated items; for callout-specific components (whiteboard/poll/media/link), add settings trigger with same menu; wire each action to CalloutManagementConnector

**Checkpoint**: Full callout lifecycle works: create (all types), edit, publish/unpublish, delete, reorder, share. Form validation works. Permission gating correct.

---

## Phase 12: US9 — Tab Action Buttons (Priority: P2)

**Goal**: Activity, Video Call, Share, and Settings action buttons in tab navigation trigger correct dialogs/navigation

**Independent Test**: On Space page, Activity and Share buttons visible for all users. Video Call visible when enabled. Settings visible for admins. Each triggers correct action.

- [ ] T062 [US9] Wire tab action buttons in CrdSpacePageLayout — Activity onClick opens MUI ActivityDialog; Video Call onClick opens MUI VideoCallDialog (conditional on `space.collaboration.allowMembersToVideoCall`); Share onClick opens MUI ShareDialog; Settings navigates to `/settings`; pass action visibility flags from `spacePageDataMapper`

**Checkpoint**: All 4 action buttons work correctly with proper visibility gating.

---

## Phase 13: US10 — Callout Contributions (Priority: P2)

**Goal**: Contribution cards (Post, Whiteboard, Memo, Link) display in expandable grids within callout blocks

**Independent Test**: View a callout with contributions of each type. Cards render correctly. Expand button shows remaining count. Create button appears for authorized users. Contribution preview shows on click.

- [ ] T063 [P] [US10] Create `src/crd/components/contribution/ContributionPostCard.tsx` — card with title, author avatar, creation date, description preview, tags, and comment count badge; accepts `ContributionCardData` props; clickable (triggers `onClick` callback)
- [ ] T064 [P] [US10] Create `src/crd/components/contribution/ContributionWhiteboardCard.tsx` — card with preview thumbnail (or fallback icon), title, author, date; accepts `ContributionCardData` props; clickable
- [ ] T065 [P] [US10] Create `src/crd/components/contribution/ContributionMemoCard.tsx` — card with markdown preview (truncated), title, author, date; accepts `ContributionCardData` props; clickable
- [ ] T066 [P] [US10] Create `src/crd/components/contribution/ContributionLinkList.tsx` — list of link contributions with name, URL, description; add-link button for authorized users; accepts `links: ContributionCardData[]`, `canCreate`, `onAddLink`
- [ ] T067 [US10] Create `src/crd/components/contribution/ContributionGrid.tsx` — expandable card grid rendering contribution cards by type; 5 columns desktop, 3 tablet, 1 mobile; collapsed shows 2 rows (10 cards max) with expand button showing remaining count; accepts `contributions: ContributionCardData[]`, `type: ContributionType`, `expanded`, `onToggleExpand`, `renderCard: (data) => ReactNode`
- [ ] T068 [P] [US10] Create `src/crd/components/contribution/ContributionPreview.tsx` — inline preview of selected contribution with author info, timestamp, edit/share/close actions, and navigation controls (prev/next) for adjacent contributions; accepts contribution data + `onEdit`, `onShare`, `onClose`, `onNavigate` callbacks
- [ ] T069 [P] [US10] Create `src/crd/components/contribution/ContributionCreateButton.tsx` — button for creating new contributions, labeled by type; accepts `type: ContributionType`, `onClick`
- [ ] T070 [P] [US10] Create `src/crd/forms/contribution/ContributionFormLayout.tsx` — creation form shell for Post/Memo (title + description + tags), Whiteboard (name), Link (URL + name + description); accepts per-field props + `onSubmit`, `onCancel`
- [ ] T071 [US10] Create `src/main/crdPages/space/dataMappers/contributionDataMapper.ts` — maps `AnyContribution` (from callout query) to `ContributionCardData[]` (data-model.md); extracts type-specific fields (comment count for posts, preview URL for whiteboards, markdown for memos)
- [ ] T072 [US10] Create `src/main/crdPages/space/callout/ContributionGridConnector.tsx` — renders ContributionGrid with mapped contribution data per type; wires card clicks to open contribution preview or navigate to detail page; manages expanded/collapsed state
- [ ] T073 [US10] Create `src/main/crdPages/space/callout/ContributionCreateConnector.tsx` — renders ContributionCreateButton + ContributionFormLayout in dialog; wires form submission to `useCreatePostOnCalloutMutation` / `useCreateWhiteboardOnCalloutMutation` / `useCreateMemoOnCalloutMutation`; navigates to created contribution on success
- [ ] T074 [US10] Wire ContributionGridConnector and ContributionCreateConnector into PostCard content preview area and callout-specific components — for PostCard (text/memo callouts): render contributions as the `contentPreview.items` array within the card; for callout-specific components (whiteboard/poll/media): render ContributionGrid below the component in SpaceFeed; each callout renders contributions and create button based on `allowedContributionTypes`

**Checkpoint**: All 4 contribution types render as cards. Grid expands/collapses. Create flow works for each type. Contribution preview shows on click.

---

## Phase 14: US11 — Callout Templates (Priority: P3)

**Goal**: Users can import templates during callout creation and save existing callouts as templates

**Independent Test**: Create a callout using "Find Template". Save an existing callout as template. Default template auto-loads for configured Innovation Flow states.

- [ ] T075 [US11] Create `src/main/crdPages/space/callout/TemplateImportConnector.tsx` — manages template import flow: "Find Template" click opens existing MUI ImportTemplatesDialog (portal); on template selection, maps template data via `mapCalloutTemplateToCalloutForm()` and updates Formik context; shows overwrite confirmation if form has existing data; handles default template auto-loading from Innovation Flow state's `defaultCalloutTemplate`
- [ ] T076 [US11] Wire TemplateImportConnector into CalloutFormConnector — connect the "Find Template" button in AddPostModal to TemplateImportConnector; wire "Save as Template" in CalloutManagementConnector to open MUI CreateTemplateDialog with callout data pre-filled

**Checkpoint**: Template import pre-fills creation form. Save as template works from context menu. Default templates auto-load per tab configuration.

---

## Phase 15: US12 — Callout Comments & Discussions (Priority: P3)

**Goal**: Threaded comments display below callout contributions, with add/reply functionality

**Independent Test**: View a callout with comments. Add a comment. Select a post and see contribution-level comments. Comments hidden when disabled.

- [ ] T077 [P] [US12] Create `src/crd/components/callout/CalloutCommentItem.tsx` — single comment with author avatar, name, timestamp, and message content; accepts `CommentData` props; indented for replies (via `parentId` presence)
- [ ] T078 [US12] Create `src/crd/components/callout/CalloutComments.tsx` — threaded comment list composing CalloutCommentItem instances + add-comment form (text input + submit button); accepts `comments: CommentData[]`, `canComment: boolean`, `onAddComment: (text: string) => void`, `onReply: (parentId: string, text: string) => void`
- [ ] T079 [US12] Create `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx` — maps callout/contribution comments data to `CommentData[]`; wires add/reply to existing comment mutations; determines whether to show callout-level or contribution-level comments based on selected contribution
- [ ] T080 [US12] Wire CalloutCommentsConnector into PostCard footer area and callout-specific components — for PostCard: render comments as expandable section below the card footer (toggled by comment count click); for callout-specific components: render CalloutComments below the component in SpaceFeed; hide when `commentsEnabled` is false

**Checkpoint**: Comments render threaded. Add/reply works. Comments hidden when disabled per callout settings.

---

## Phase 16: US13 — About Page (Priority: P3)

**Goal**: The About route renders a full-page CRD view with space details, accessible to non-members

**Independent Test**: Navigate to `/:spaceNameId/about`. All space details render. Page accessible without membership. Join/Apply action visible for non-members.

- [ ] T081 [P] [US13] Create `src/crd/components/space/SpaceAboutView.tsx` — full about page content layout: name, tagline, description, location, metrics, lead users/organizations, host organization, "Why" section, "Who" section, community guidelines, references; accepts `SpaceAboutData` props + `joinAction?: ReactNode`; sections that are empty are omitted
- [ ] T082 [US13] Create `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` — integration page using `useSpaceAboutDetailsQuery()`; maps data to `SpaceAboutData` (data-model.md); renders SpaceAboutView; includes reused MUI ApplicationButton for non-members; accessible without read permission (public route per FR-044)

**Checkpoint**: About page renders with real space data. All sections present when data exists. Non-members see join/apply action.

---

## Phase 17: US14 — Responsive Mobile Experience (Priority: P3)

**Goal**: Space page fully functional on mobile: bottom tabs, overflow drawer, single-column layout, adapted callout grids

**Independent Test**: Open Space page on mobile viewport. Bottom tabs appear. "More" drawer has overflow actions. Single-column content readable. Callout grids responsive.

- [ ] T083 [US14] Audit and refine SpaceNavigationTabs mobile behavior (from T108) — verify fixed bottom bar renders correctly, "More" drawer opens with Activity/VideoCall/Share/Settings, tabs are reachable, no overlap with floating action buttons; add `aria-label` for drawer toggle
- [ ] T084 [US14] Audit and refine SpaceShell mobile behavior (from T106) — verify sidebar content is hidden on mobile and content flows single-column; verify callout contribution grids reflow to single column; verify forms adapt to full-width stacked layout
- [ ] T085 [US14] Audit and refine SpaceHeader mobile behavior (from T107) — verify 320px banner adapts to viewport width without horizontal overflow; verify title/tagline truncate gracefully on narrow screens; verify member avatars stack cleanly

**Checkpoint**: Full mobile experience functional. No horizontal overflow, all content reachable, bottom navigation works.

---

## Phase 18: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, standalone preview app, accessibility audit, and final cleanup

- [ ] T086 [P] Create standalone preview app page `src/crd/app/pages/SpacePage.tsx` with mock data for Space page (banner, tabs, callout blocks with all 5 framing types, contribution grid); add route in `src/crd/app/CrdApp.tsx`; add mock data to `src/crd/app/data/space.ts`
- [ ] T087 [P] Accessibility audit — verify all CRD Space components pass the component checklist from `src/crd/CLAUDE.md`: keyboard navigation, `aria-selected` on tabs, `aria-label` on icon buttons, focus indicators, semantic elements, color contrast, loading states with `role="status"`
- [ ] T088 [P] Verify zero MUI imports in `src/crd/` — run grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `@/core/apollo/`, `formik`, `react-router-dom` across all new files in `src/crd/components/space/`, `src/crd/components/callout/`, `src/crd/components/contribution/`, `src/crd/forms/`
- [ ] T089 Update `src/crd/components/index.md` component inventory with all new Space, Callout, and Contribution components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete
- **Foundational (Phase 2)**: ✅ Complete
- **Cleanup (Phase 3)**: No dependencies — deletes old components
- **Primitives (Phase 4)**: No dependencies — port shadcn primitives
- **Shell (Phase 5)**: Depends on Phase 3+4 — builds SpaceShell, SpaceHeader, SpaceNavigationTabs
- **Sidebar (Phase 6)**: Depends on Phase 4 — builds SpaceSidebar + sub-components
- **Content (Phase 7)**: Depends on Phase 4 — builds PostCard, SpaceFeed, SpaceMembers, SpaceSubspacesList + callout-specific components
- **Integration (Phase 8)**: Depends on Phases 5+6+7 — wires CRD components to data
- **US5 Community (Phase 9)**: Depends on Phase 8 — adds community tab integration
- **US6 Custom Tabs (Phase 10)**: Depends on Phase 8 — adds knowledge base / custom tabs
- **US7+US8 Forms (Phase 11)**: Depends on Phase 8 — callout creation/editing
- **US9 Tab Actions (Phase 12)**: Depends on Phase 5 — action button wiring
- **US10 Contributions (Phase 13)**: Depends on Phase 8 — contribution cards
- **US11 Templates (Phase 14)**: Depends on Phase 11 — template import/save
- **US12 Comments (Phase 15)**: Depends on Phase 8 — comment threading
- **US13 About (Phase 16)**: Depends on Phase 5 — about page
- **US14 Mobile (Phase 17)**: Depends on Phase 5 — mobile polish
- **Polish (Phase 18)**: Depends on all desired phases

### Parallel Opportunities

```
Phase 3 (cleanup) + Phase 4 (primitives)
  ├── Phase 5 (shell) ──────── Phase 6 (sidebar) can be parallel
  │                             Phase 7 (content) can be parallel
  │
  └── Phase 8 (integration) ── depends on 5+6+7
        ├── Phase 9 (community)
        ├── Phase 10 (custom tabs)
        ├── Phase 11 (forms)
        ├── Phase 12 (tab actions) — independent, just needs Phase 5
        ├── Phase 13 (contributions)
        └── Phase 16 (about) — independent
```

---

## Implementation Strategy

### MVP: Phases 1–8

1. ✅ Phase 1: Setup (i18n, shared components)
2. ✅ Phase 2: Foundational (routing, data mappers)
3. Phase 3: Cleanup (delete old components)
4. Phase 4: Primitives (Card, Separator)
5. Phase 5: Shell (SpaceShell + SpaceHeader + SpaceNavigationTabs) — **VALIDATE: 12-col grid renders**
6. Phase 6: Sidebar (SpaceSidebar variant-based)
7. Phase 7: Content (PostCard + SpaceFeed + SpaceMembers + SpaceSubspacesList + callout-specific)
8. Phase 8: Integration (wire everything to data) — **VALIDATE: Dashboard + Subspaces tabs work**

### Incremental Delivery (Phases 9+)

- + Phase 9 → Community tab
- + Phase 10 → Knowledge Base / custom tabs
- + Phase 11 → Callout creation/editing
- + Phases 12-18 → remaining features and polish

---

## Notes

- **Prototype = visual reference** — `prototype/src/app/components/space/` defines the visual design. CRD components match the look but use our own prop types and CRD conventions.
- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- CRD components MUST pass `src/crd/CLAUDE.md` component checklist
- All MUI dialogs triggered from CRD render as portals outside `.crd-root`
- Inline `style` is acceptable for `color-mix()`, `clamp()`, and runtime values only — use Tailwind for everything else
