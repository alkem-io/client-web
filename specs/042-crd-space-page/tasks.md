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

- [ ] T001 Create i18n translation file `src/crd/i18n/space/space.en.json` with keys for banner, tabs (dashboard, community, subspaces, knowledgeBase), callout labels (draft, expand, collapse, create, edit, delete, publish, unpublish, share, move, settings, template, sort), contribution labels, comment labels, about page labels, visibility notices, mobile actions, and accessibility labels
- [ ] T002 [P] Create translation files for remaining languages: `src/crd/i18n/space/space.bg.json`, `src/crd/i18n/space/space.de.json`, `src/crd/i18n/space/space.es.json`, `src/crd/i18n/space/space.fr.json`, `src/crd/i18n/space/space.nl.json`
- [ ] T003 Register `crd-space` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports` with lazy imports for all 6 languages; add type declaration in `@types/i18next.d.ts`
- [ ] T004 [P] Create `src/crd/components/common/MarkdownContent.tsx` — renders sanitized HTML string as formatted content, accepts `className` prop, uses Tailwind prose classes
- [ ] T005 [P] Create `src/crd/components/common/ExpandableDescription.tsx` — truncated text with expand/collapse toggle, accepts `description: string`, `maxLines?: number`, `editHref?: string`, `canEdit?: boolean`, `onEdit?: () => void`
- [ ] T006 [P] Create `src/crd/components/common/ContentBlock.tsx` — generic sidebar/content block with optional accent border, title slot, and children; used by multiple tab pages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Route wiring, page shell integration, and shared data mappers that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create `src/main/crdPages/space/dataMappers/spacePageDataMapper.ts` — maps SpaceContext data (from `useSpace()`) to `SpaceBannerData`, `SpaceVisibilityData`, and `SpaceTabActionConfig` types defined in data-model.md
- [ ] T008 Create `src/main/crdPages/space/hooks/useCrdSpaceTabs.ts` — wraps existing `useSpaceTabs()` from `src/domain/space/layout/tabbedLayout/layout/useSpaceTabs.tsx`, maps output to `SpaceTabDefinition[]` (data-model.md), replaces MUI icons with lucide-react equivalents
- [ ] T009 Create `src/crd/layouts/SpacePageShell.tsx` — CRD page shell component accepting `banner: SpaceBannerData`, `tabs: SpaceTabDefinition[]`, `tabActions: SpaceTabActionConfig`, `visibility: SpaceVisibilityData`, `breadcrumbs: { label: string; href?: string }[]`, `activeTabIndex: number`, `onTabChange: (index: number) => void`, `onAction: (action: string) => void`, plus `children` for Outlet content; renders breadcrumbs bar (space hierarchy path) + banner + tabs + content area inside `.crd-root` (FR-008)
- [ ] T010 Create `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` — integration layer connecting SpacePageShell to app data via `useSpace()`, `useCrdSpaceTabs()`, `spacePageDataMapper`; maps `spaceHierarchyPath` from URL resolver to breadcrumb props; manages MUI dialog state (Activity, VideoCall, Share) via callbacks; renders `<Outlet />` for tab content
- [ ] T011 Create `src/main/crdPages/space/routing/CrdSpaceRoutes.tsx` — mirrors `src/domain/space/routing/SpaceRoutes.tsx` structure: wraps routes in `SpaceContextProvider` (reused unchanged), uses `CrdSpacePageLayout` as layout element, defines routes for `/about`, `/` (index), `/collaboration/:calloutNameId`, `/settings/*`, `/challenges/:subspaceNameId/*`, legacy redirects
- [ ] T012 Create `src/main/crdPages/space/tabs/CrdSpaceTabbedPages.tsx` — tab content router matching `sectionIndex` to tab page components (Dashboard at 0, Community at 1, Subspaces at 2, Custom at 3+); use a section-type mapping (not hardcoded positional switch) per plan D4 for future layout setting readiness
- [ ] T013 Update `src/main/routing/TopLevelRoutes.tsx` — add CRD route toggle for `:spaceNameId/*`: when `crdEnabled`, wrap in `CrdLayoutWrapper` + `UrlResolverProvider` and route to `CrdSpaceRoutes`; when disabled, keep existing `SpaceRoutes`. Follow the same pattern as the `/spaces` CRD toggle (lines 132-165)

**Checkpoint**: Route toggle works — navigating to any Space URL with CRD enabled loads CrdSpacePageLayout (may show empty content area). MUI Space page still works with CRD disabled.

---

## Phase 3: US1 — Full CRD Space Page Shell (Priority: P0)

**Goal**: CRD banner, dynamic tab navigation, and visibility notice render correctly for any Space L0 page

**Independent Test**: Enable CRD toggle, navigate to any Space. Banner shows title/tagline/visual, tabs show Innovation Flow names (or defaults), clicking tabs changes URL and content area, visibility notice appears for non-Active spaces.

- [ ] T014 [P] [US1] Create `src/crd/components/space/SpaceBanner.tsx` — displays banner image (blurred sides or default visual), space title, tagline, and optional HomeSpace pin indicator; accepts `SpaceBannerData` props; responsive (full-width image with max-width constraint)
- [ ] T015 [P] [US1] Create `src/crd/components/space/SpaceVisibilityNotice.tsx` — notice bar for Archived/Demo/Inactive spaces with translated message and optional contact link; accepts `SpaceVisibilityData` props; renders as a colored banner below the header
- [ ] T016 [P] [US1] Create `src/crd/components/space/SpaceTabs.tsx` — dynamic tab navigation component accepting `tabs: SpaceTabDefinition[]`, `activeIndex`, `onTabChange`, `actions: SpaceTabActionConfig`, `onAction`; renders horizontal tabs on desktop (above content) with action buttons (Activity, VideoCall, Share, Settings icons); renders fixed bottom bar on mobile with overflow "More" drawer (Radix Sheet); keyboard accessible with `aria-selected`
- [ ] T017 [P] [US1] Create `src/crd/components/space/SpaceTabLayout.tsx` — two-column layout: sidebar (narrow, sticky on desktop, hidden on mobile) + main content area (wide); accepts `sidebar: ReactNode`, `children: ReactNode`; responsive via Tailwind breakpoints
- [ ] T018 [US1] Wire CrdSpacePageLayout to render SpaceBanner, SpaceVisibilityNotice, SpaceTabs, and SpaceTabLayout with data from `useSpace()` and `useCrdSpaceTabs()`; verify tabs display Innovation Flow state displayNames or translated defaults per FR-003/FR-004/FR-005; verify URL updates on tab click per FR-010

**Checkpoint**: Full CRD page shell visible for any Space L0. Tabs navigate, banner shows, no MUI layout elements. Console error-free when navigating CRD ↔ MUI.

---

## Phase 4: US2 — Dashboard Tab (Priority: P1)

**Goal**: Dashboard tab shows welcome block with leads, about trigger, navigation, calendar, updates, and callout content area

**Independent Test**: Navigate to a Space, Dashboard tab shows sidebar sections and main content area. Non-members see Join/Apply button.

- [ ] T019 [P] [US2] Create `src/crd/components/space/SpaceLeadsSection.tsx` — displays lead users and organizations as horizontal cards with avatar, name, location, and type indicator; accepts `leads: SpaceLeadData[]`; max 2 users + 2 orgs; reused in Community tab
- [ ] T020 [P] [US2] Create `src/crd/components/space/SpaceWelcomeBlock.tsx` — sidebar block with expandable tab description and embedded SpaceLeadsSection; accepts `description: string`, `leads: SpaceLeadData[]`, `aboutLabel: string`, `onAboutClick: () => void`
- [ ] T021 [P] [US2] Create `src/crd/components/space/SpaceDashboardNav.tsx` — sidebar block showing related space links as a nested list; accepts `items: SpaceDashboardNavItem[]`
- [ ] T022 [P] [US2] Create `src/crd/components/space/SpaceCalendarSection.tsx` — sidebar block showing up to 3 upcoming events with title and date; accepts `events: CalendarEventData[]`, `onViewAll?: () => void`
- [ ] T090 [P] [US2] Create `src/crd/components/space/SpaceUpdatesSection.tsx` — sidebar block showing community updates summary with a "View all" action; accepts `communityId: string` (passed as prop, not fetched internally), `shareUrl?: string`, `onViewAll?: () => void` (FR-016)
- [ ] T023 [US2] Create `src/main/crdPages/space/hooks/useCrdSpaceDashboard.ts` — composes `useSpaceTabProvider({ tabPosition: 0 })`, `useSpacePageQuery`, `useApplicationButton()`, `useSpaceDashboardNavigationChallengesQuery()`; returns mapped data for all sidebar sections (including communityId for updates) + application button state
- [ ] T024 [US2] Create `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx` — integration page using `useCrdSpaceDashboard()`; renders SpaceTabLayout with sidebar (WelcomeBlock, DashboardNav, CalendarSection, SpaceUpdatesSection) and main content area (placeholder for callouts, added in US4); triggers MUI AboutDialog, ApplicationButton, and CommunityUpdatesDialog via callbacks; conditionally shows calendar/updates based on read-users access

**Checkpoint**: Dashboard tab renders with all sidebar sections populated from real data. About button triggers dialog. Non-members see join button.

---

## Phase 5: US3 — Subspaces Tab (Priority: P1)

**Goal**: Subspaces tab shows searchable sidebar list and filterable card grid of child spaces

**Independent Test**: Navigate to a Space with subspaces, select Subspaces tab. Cards show with correct data, filtering works, create button appears for admins.

- [ ] T025 [P] [US3] Create `src/crd/components/space/SpaceSubspaceList.tsx` — sidebar component with search field (visible when >3 items) and list of subspace links; accepts `items: { name: string; href: string }[]`; search filters by name
- [ ] T026 [P] [US3] Create `src/main/crdPages/space/dataMappers/subspaceCardDataMapper.ts` — maps `SpaceSubspaceCardsQuery` results to `SubspaceCardData[]` (data-model.md); extracts banner URL (or default), tags, privacy status, membership, pin indicator, lead users/orgs
- [ ] T027 [US3] Create `src/main/crdPages/space/tabs/CrdSpaceSubspacesPage.tsx` — integration page using `useSpaceTabProvider({ tabPosition: 2 })` and `useSpaceSubspaceCardsQuery()`; renders SpaceTabLayout with sidebar (tab description + SpaceSubspaceList + create trigger) and main content area (SpaceCard grid from 039 with tag filtering); triggers MUI CreateSubspace dialog and DirectMessage dialog via callbacks

**Checkpoint**: Subspaces tab renders with real subspace data. Cards show banner, name, tags, privacy, membership. Search filters sidebar list. Create button triggers dialog for admins.

---

## Phase 6: US4 — Callout Content Blocks (Priority: P1)

**Goal**: Callouts render in CRD with all 5 framing types, lazy loading, expand/collapse, and draft badges

**Independent Test**: Navigate to any tab with callouts. All framing types render correctly. Scrolling loads more. Draft callouts show badge for admins.

- [ ] T028 [P] [US4] Create `src/crd/components/callout/CalloutHeader.tsx` — callout title, type icon (lucide-react), author name + avatar, publication date, and settings trigger button (icon-only with aria-label); accepts `title`, `author`, `publishedDate`, `framingType`, `onSettingsClick`, `draft: boolean`; shows CalloutDraftBadge when draft
- [ ] T029 [P] [US4] Create `src/crd/components/callout/CalloutFramingMemo.tsx` — renders markdown content via MarkdownContent component with expand/collapse for long content; accepts `htmlContent: string`, `onExpand?: () => void`
- [ ] T030 [P] [US4] Create `src/crd/components/callout/CalloutFramingWhiteboard.tsx` — preview thumbnail image with fallback icon placeholder and "Open" button; accepts `previewUrl?: string`, `onOpen: () => void`; clicking triggers onOpen callback (integration layer opens MUI WhiteboardDialog as portal)
- [ ] T031 [P] [US4] Create `src/crd/components/callout/CalloutFramingLink.tsx` — CTA button with link display name; validates URL for http/https; external links render with `target="_blank" rel="noopener noreferrer"`; internal links use `href`; disabled state for invalid URLs; accepts `url`, `displayName`, `isExternal`
- [ ] T032 [P] [US4] Create `src/crd/components/callout/CalloutFramingMedia.tsx` — image grid layout with sortable images; shows upload placeholder for editors when empty; accepts `images: MediaImage[]`, `canEdit: boolean`, `onAddImage?: () => void`
- [ ] T033 [P] [US4] Create `src/crd/components/callout/CalloutFramingPoll.tsx` — poll question with votable options, vote counts, percentages, and user's current selection; accepts `question`, `options: PollOption[]`, `canVote`, `onVote: (optionId: string) => void`
- [ ] T034 [US4] Create `src/crd/components/callout/CalloutBlock.tsx` — main callout container composing CalloutHeader + framing component (switch on type) + tags + references + slots for contributions and comments; accepts `CalloutBlockData` props + `contributionsSlot?: ReactNode`, `commentsSlot?: ReactNode`; supports expand/collapse for long descriptions
- [ ] T035 [US4] Create `src/crd/components/callout/CalloutList.tsx` — renders a list of CalloutBlock components with optional "Add Callout" button at top or bottom; accepts `children: ReactNode` (rendered blocks), `canCreate`, `onCreateClick`, `loading`; shows skeleton loaders during loading
- [ ] T036 [US4] Create `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` — maps `CalloutDetailsModelExtended` (from `useCalloutsSet`) to `CalloutBlockData` (data-model.md); extracts framing content per type, author info, tags, references, visibility, permissions (editable, movable, canSaveAsTemplate)
- [ ] T037 [US4] Create `src/main/crdPages/space/hooks/useCrdCalloutList.ts` — wraps `useCalloutsSet()` with `classificationTagsets` from `useSpaceTabProvider()`; handles lazy loading via IntersectionObserver pattern; returns mapped `CalloutBlockData[]` via `calloutDataMapper`
- [ ] T038 [US4] Create `src/main/crdPages/space/callout/CalloutListConnector.tsx` — renders CalloutList with CalloutBlock instances; wires `onSettingsClick` to open context menu; wires whiteboard `onOpen` to open MUI WhiteboardDialog (portal); wires memo `onExpand` to open MUI MemoDialog (portal); wires poll `onVote` to mutation
- [ ] T039 [US4] Integrate CalloutListConnector into CrdSpaceDashboardPage (replacing placeholder from T024) and CrdSpaceSubspacesPage (alongside card grid from T027)

**Checkpoint**: All 5 callout framing types render correctly on Dashboard and Subspaces tabs. Whiteboards open MUI dialog on click. Memos expand. Links navigate. Draft badges show for admins. Lazy loading works.

---

## Phase 7: US5 — Community Tab (Priority: P2)

**Goal**: Community tab shows leads, members, guidelines, invite, and virtual contributors

**Independent Test**: Navigate to Community tab. Leads shown in sidebar. Members displayed as wide cards. Contact Leads triggers dialog. Invite visible for admins.

- [ ] T040 [P] [US5] Create `src/crd/components/space/SpaceMemberCard.tsx` — wide horizontal card with avatar, name, location, tagline, and tags; accepts `SpaceMemberData` props; used for both user and organization members
- [ ] T041 [P] [US5] Create `src/crd/components/space/SpaceMemberGrid.tsx` — grid of SpaceMemberCard components; accepts `members: SpaceMemberData[]`, `showUsers: boolean` (hides user cards for unauthenticated); responsive layout
- [ ] T042 [P] [US5] Create `src/crd/components/space/SpaceGuidelinesBlock.tsx` — sidebar block displaying community guidelines text with optional link; accepts `content?: string`, `href?: string`
- [ ] T043 [US5] Create `src/main/crdPages/space/dataMappers/communityDataMapper.ts` — maps `useRoleSetManager()` output to `SpaceMemberData[]` for members and `SpaceLeadData[]` for leads; maps `VirtualContributor` data to `VirtualContributorData[]`
- [ ] T044 [US5] Create `src/main/crdPages/space/hooks/useCrdSpaceCommunity.ts` — composes `useSpaceTabProvider()`, `useRoleSetManager()`, `useSendMessageToCommunityLeads()`, `useSpace()` (entitlements); returns leads, members, VCs, guidelines, invite permission, contact callback
- [ ] T045 [US5] Create `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` — integration page rendering SpaceTabLayout with sidebar (tab description, SpaceLeadsSection, Contact Leads button, invite trigger, VCs section, SpaceGuidelinesBlock) and main content area (SpaceMemberGrid + CalloutListConnector); triggers MUI DirectMessage and InviteContributors dialogs via callbacks

**Checkpoint**: Community tab renders with real data. Leads, members, guidelines all correct. Contact/Invite trigger MUI dialogs.

---

## Phase 8: US6 — Custom Tabs / Knowledge Base (Priority: P2)

**Goal**: Custom tabs show searchable callout sidebar, tag cloud filtering, and flow-state-classified callouts

**Independent Test**: Navigate to Knowledge Base tab (or any custom tab). Tag cloud filters callouts. Sidebar list is searchable. Only callouts for this tab's flow state are shown.

- [ ] T046 [P] [US6] Create `src/crd/components/callout/CalloutSidebarList.tsx` — sidebar list of callout titles with search field; accepts `items: { id: string; title: string; type: string }[]`; search filters by title; shows type icon per item
- [ ] T047 [P] [US6] Create `src/crd/components/callout/CalloutTagCloud.tsx` — tag filtering component with selectable chips, selected tags with deselect action, results count, and clear-all link; accepts `tags: { name: string; count: number }[]`, `selectedTags: string[]`, `resultsCount: number`, `onSelectTag`, `onDeselectTag`, `onClear`
- [ ] T048 [US6] Create `src/main/crdPages/space/tabs/CrdSpaceCustomTabPage.tsx` — integration page accepting `sectionIndex: number`; uses `useSpaceTabProvider({ tabPosition: sectionIndex })` and `useCrdCalloutList()` with `tagsFilter` state; renders SpaceTabLayout with sidebar (tab description + create trigger + CalloutSidebarList) and main content area (CalloutTagCloud + CalloutListConnector); each tab shows only callouts classified under its Innovation Flow state

**Checkpoint**: Knowledge Base and any custom tabs render correctly. Tag cloud filters callouts. Each tab shows only its flow state's callouts.

---

## Phase 9: US7+US8 — Callout Creation, Editing & Management (Priority: P2)

**Goal**: Authorized users can create, edit, publish/unpublish, delete, reorder, and manage callouts via forms and context menu

**Independent Test**: As space admin, create callouts of each framing type. Edit an existing callout. Use context menu to publish/unpublish, delete, reorder. Verify validation and permission gating.

- [ ] T049 [P] [US7] Create `src/crd/forms/callout/CalloutFramingSelector.tsx` — 6-option radio group (None, Whiteboard, Memo, Link, MediaGallery, Poll) with distinctive lucide-react icons and tooltips; accepts `value`, `onChange`, `disabled`
- [ ] T050 [P] [US7] Create `src/crd/forms/callout/LinkFramingFields.tsx` — URL input + display name input; both required; URL validated for http/https; accepts `url`, `displayName`, `onUrlChange`, `onDisplayNameChange`, `urlError`, `nameError`
- [ ] T051 [P] [US7] Create `src/crd/forms/callout/PollOptionsEditor.tsx` — poll title field + 2-10 option inputs with add/remove; min/max response settings; accepts typed props for each field + validation errors
- [ ] T052 [P] [US7] Create `src/crd/forms/callout/CalloutContributionSettings.tsx` — allowed contribution type selector (None/Post/Memo/Whiteboard/Link) and comments toggle; accepts `allowedType`, `commentsEnabled`, `onChange` callbacks
- [ ] T053 [P] [US7] Create `src/crd/forms/callout/CalloutVisibilitySelector.tsx` — Draft/Published toggle with notification checkbox (enabled only when form valid); accepts `visibility`, `sendNotification`, `onChange`, `isValid`
- [ ] T054 [US7] Create `src/crd/forms/callout/CalloutFormLayout.tsx` — form shell composing all form sections: title (required), description (markdown, length-limited), tags, references, CalloutFramingSelector, type-specific editor slot, CalloutContributionSettings, CalloutVisibilitySelector, "Find Template" button, action buttons (Save Draft / Post); accepts per-field value/onChange/error props + `framingEditorSlot: ReactNode` + `onSubmit`, `onSaveDraft`, `onFindTemplate` callbacks
- [ ] T055 [US7] Create `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` — manages Formik context for callout creation/editing; maps form values to `CreateCalloutEntityInput` / `UpdateCalloutEntityInput` GraphQL mutations; handles media gallery upload, poll option diffing, and whiteboard visual upload; provides `isValid`, `isDirty`, `onSubmit`, `onSaveDraft`
- [ ] T056 [US7] Create `src/main/crdPages/space/callout/CalloutFormConnector.tsx` — renders CRD CalloutFormLayout inside Formik context from `useCrdCalloutForm`; binds each CRD form field to Formik fields; renders `FramingEditorConnector` as the type-specific editor slot
- [ ] T057 [US7] Create `src/main/crdPages/space/callout/FramingEditorConnector.tsx` — renders the appropriate editor for the selected framing type: existing Tiptap markdown editor (Memo), existing FormikWhiteboardPreview (Whiteboard), CRD LinkFramingFields (Link), existing media gallery uploader (MediaGallery), CRD PollOptionsEditor (Poll); wraps third-party editors with Formik field bindings
- [ ] T058 [US7] Create `src/main/crdPages/space/callout/CalloutEditConnector.tsx` — loads existing callout data via `useCalloutContentQuery`, pre-fills CalloutFormConnector with current values, locks framing type and contribution type selectors (read-only)
- [ ] T059 [P] [US8] Create `src/crd/components/callout/CalloutContextMenu.tsx` — Radix DropdownMenu with items: Edit, Publish/Unpublish, Delete, Sort Contributions, Save as Template, Move (sub-menu: Up/Down/Top/Bottom with disabled states at boundaries), Share; each item gated by permission props (`editable`, `movable`, `canSaveAsTemplate`); keyboard navigable with screen reader announcements
- [ ] T060 [US8] Create `src/main/crdPages/space/callout/CalloutManagementConnector.tsx` — handles context menu actions: Edit → opens CalloutEditConnector in dialog; Publish/Unpublish → `useUpdateCalloutVisibilityMutation` with notification toggle; Delete → confirmation dialog + `useDeleteCalloutMutation`; Sort → opens MUI CalloutContributionsSortDialog; Move → `useUpdateCalloutsSortOrderMutation`; Share → opens MUI ShareDialog; Save as Template → opens MUI CreateTemplateDialog
- [ ] T061 [US8] Wire CalloutContextMenu into CalloutBlock via CalloutListConnector — when settings icon clicked, render CalloutContextMenu with permission-gated items; wire each action to CalloutManagementConnector

**Checkpoint**: Full callout lifecycle works: create (all types), edit, publish/unpublish, delete, reorder, share. Form validation works. Permission gating correct.

---

## Phase 10: US9 — Tab Action Buttons (Priority: P2)

**Goal**: Activity, Video Call, Share, and Settings action buttons in tab navigation trigger correct dialogs/navigation

**Independent Test**: On Space page, Activity and Share buttons visible for all users. Video Call visible when enabled. Settings visible for admins. Each triggers correct action.

- [ ] T062 [US9] Wire tab action buttons in CrdSpacePageLayout — Activity onClick opens MUI ActivityDialog; Video Call onClick opens MUI VideoCallDialog (conditional on `space.collaboration.allowMembersToVideoCall`); Share onClick opens MUI ShareDialog; Settings navigates to `/settings`; pass action visibility flags from `spacePageDataMapper`

**Checkpoint**: All 4 action buttons work correctly with proper visibility gating.

---

## Phase 11: US10 — Callout Contributions (Priority: P2)

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
- [ ] T074 [US10] Wire ContributionGridConnector and ContributionCreateConnector into CalloutBlock via the `contributionsSlot` prop — each callout block renders its contributions grid and create button based on `allowedContributionTypes`

**Checkpoint**: All 4 contribution types render as cards. Grid expands/collapses. Create flow works for each type. Contribution preview shows on click.

---

## Phase 12: US11 — Callout Templates (Priority: P3)

**Goal**: Users can import templates during callout creation and save existing callouts as templates

**Independent Test**: Create a callout using "Find Template". Save an existing callout as template. Default template auto-loads for configured Innovation Flow states.

- [ ] T075 [US11] Create `src/main/crdPages/space/callout/TemplateImportConnector.tsx` — manages template import flow: "Find Template" click opens existing MUI ImportTemplatesDialog (portal); on template selection, maps template data via `mapCalloutTemplateToCalloutForm()` and updates Formik context; shows overwrite confirmation if form has existing data; handles default template auto-loading from Innovation Flow state's `defaultCalloutTemplate`
- [ ] T076 [US11] Wire TemplateImportConnector into CalloutFormConnector — connect the "Find Template" button in CalloutFormLayout to TemplateImportConnector; wire "Save as Template" in CalloutManagementConnector to open MUI CreateTemplateDialog with callout data pre-filled

**Checkpoint**: Template import pre-fills creation form. Save as template works from context menu. Default templates auto-load per tab configuration.

---

## Phase 13: US12 — Callout Comments & Discussions (Priority: P3)

**Goal**: Threaded comments display below callout contributions, with add/reply functionality

**Independent Test**: View a callout with comments. Add a comment. Select a post and see contribution-level comments. Comments hidden when disabled.

- [ ] T077 [P] [US12] Create `src/crd/components/callout/CalloutCommentItem.tsx` — single comment with author avatar, name, timestamp, and message content; accepts `CommentData` props; indented for replies (via `parentId` presence)
- [ ] T078 [US12] Create `src/crd/components/callout/CalloutComments.tsx` — threaded comment list composing CalloutCommentItem instances + add-comment form (text input + submit button); accepts `comments: CommentData[]`, `canComment: boolean`, `onAddComment: (text: string) => void`, `onReply: (parentId: string, text: string) => void`
- [ ] T079 [US12] Create `src/main/crdPages/space/callout/CalloutCommentsConnector.tsx` — maps callout/contribution comments data to `CommentData[]`; wires add/reply to existing comment mutations; determines whether to show callout-level or contribution-level comments based on selected contribution
- [ ] T080 [US12] Wire CalloutCommentsConnector into CalloutBlock via the `commentsSlot` prop — render comments section below contributions; hide when `commentsEnabled` is false

**Checkpoint**: Comments render threaded. Add/reply works. Comments hidden when disabled per callout settings.

---

## Phase 14: US13 — About Page (Priority: P3)

**Goal**: The About route renders a full-page CRD view with space details, accessible to non-members

**Independent Test**: Navigate to `/:spaceNameId/about`. All space details render. Page accessible without membership. Join/Apply action visible for non-members.

- [ ] T081 [P] [US13] Create `src/crd/components/space/SpaceAboutView.tsx` — full about page content layout: name, tagline, description, location, metrics, lead users/organizations, host organization, "Why" section, "Who" section, community guidelines, references; accepts `SpaceAboutData` props + `joinAction?: ReactNode`; sections that are empty are omitted
- [ ] T082 [US13] Create `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` — integration page using `useSpaceAboutDetailsQuery()`; maps data to `SpaceAboutData` (data-model.md); renders SpaceAboutView; includes reused MUI ApplicationButton for non-members; accessible without read permission (public route per FR-044)

**Checkpoint**: About page renders with real space data. All sections present when data exists. Non-members see join/apply action.

---

## Phase 15: US14 — Responsive Mobile Experience (Priority: P3)

**Goal**: Space page fully functional on mobile: bottom tabs, overflow drawer, single-column layout, adapted callout grids

**Independent Test**: Open Space page on mobile viewport. Bottom tabs appear. "More" drawer has overflow actions. Single-column content readable. Callout grids responsive.

- [ ] T083 [US14] Audit and refine SpaceTabs mobile behavior (from T016) — verify fixed bottom bar renders correctly, "More" drawer opens with Activity/VideoCall/Share/Settings, tabs are reachable, no overlap with floating action buttons; add `aria-label` for drawer toggle
- [ ] T084 [US14] Audit and refine SpaceTabLayout mobile behavior (from T017) — verify sidebar content is hidden or stacked above main content on mobile; verify callout contribution grids reflow to single column; verify forms adapt to full-width stacked layout
- [ ] T085 [US14] Audit and refine SpaceBanner mobile behavior (from T014) — verify banner adapts to viewport width without horizontal overflow; verify title/tagline truncate gracefully on narrow screens

**Checkpoint**: Full mobile experience functional. No horizontal overflow, all content reachable, bottom navigation works.

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, standalone preview app, accessibility audit, and final cleanup

- [ ] T086 [P] Create standalone preview app page `src/crd/app/pages/SpacePage.tsx` with mock data for Space page (banner, tabs, callout blocks with all 5 framing types, contribution grid); add route in `src/crd/app/CrdApp.tsx`; add mock data to `src/crd/app/data/space.ts`
- [ ] T087 [P] Accessibility audit — verify all CRD Space components pass the component checklist from `src/crd/CLAUDE.md`: keyboard navigation, `aria-selected` on tabs, `aria-label` on icon buttons, focus indicators, semantic elements, color contrast, loading states with `role="status"`
- [ ] T088 [P] Verify zero MUI imports in `src/crd/` — run grep for `@mui/`, `@emotion/`, `@apollo/client`, `@/domain/`, `@/core/apollo/`, `formik`, `react-router-dom` across all new files in `src/crd/components/space/`, `src/crd/components/callout/`, `src/crd/components/contribution/`, `src/crd/forms/`
- [ ] T089 Update `src/crd/components/index.md` component inventory with all new Space, Callout, and Contribution components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T003 for i18n) — BLOCKS all user stories
- **US1 Page Shell (Phase 3)**: Depends on Foundational (T007-T013)
- **US2 Dashboard (Phase 4)**: Depends on US1 (page shell must render)
- **US3 Subspaces (Phase 5)**: Depends on US1; can run in parallel with US2
- **US4 Callouts (Phase 6)**: Depends on US1; can run in parallel with US2/US3
- **US5 Community (Phase 7)**: Depends on US4 (needs CalloutListConnector); can run after US4
- **US6 Custom Tabs (Phase 8)**: Depends on US4 (needs CalloutListConnector)
- **US7+US8 Forms+Management (Phase 9)**: Depends on US4 (needs callout rendering working)
- **US9 Tab Actions (Phase 10)**: Depends on US1; low coupling, can be done anytime after Phase 3
- **US10 Contributions (Phase 11)**: Depends on US4 (needs CalloutBlock with contribution slot)
- **US11 Templates (Phase 12)**: Depends on US7 (needs callout creation form)
- **US12 Comments (Phase 13)**: Depends on US4 (needs CalloutBlock with comments slot)
- **US13 About (Phase 14)**: Depends on US1; independent of other stories
- **US14 Mobile (Phase 15)**: Depends on US1; refinement of existing responsive work
- **Polish (Phase 16)**: Depends on all desired stories being complete

### Parallel Opportunities After Foundational

```
Foundational complete
  ├── US1 Page Shell
  │     ├── US2 Dashboard ──────────────┐
  │     ├── US3 Subspaces (parallel) ──┤
  │     ├── US4 Callout Blocks ────────┤── US5, US6 after US4
  │     ├── US9 Tab Actions ───────────┤── independent
  │     └── US13 About ────────────────┘── independent
  │
  │     US4 complete → US7+US8 Forms + US10 Contributions + US12 Comments (parallel)
  │     US7 complete → US11 Templates
  │     All complete → US14 Mobile + Polish
```

### Within Each User Story

- CRD components (marked [P]) can be built in parallel
- Data mappers can be built in parallel with CRD components
- Hooks depend on data mappers
- Connectors/pages depend on hooks + CRD components
- Integration wiring is the final step in each story

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (i18n, shared components)
2. Complete Phase 2: Foundational (routing, page shell integration)
3. Complete Phase 3: US1 Page Shell
4. **STOP and VALIDATE**: CRD banner + tabs render for any Space. Toggle works.
5. This is the minimum viable CRD Space page — tabs show but content is placeholder

### Incremental Delivery

1. Setup + Foundational → Route toggle works
2. + US1 → Page shell visible (MVP)
3. + US2 + US3 → Dashboard and Subspaces tabs functional
4. + US4 → Callout content renders (major milestone — all tabs have content)
5. + US5 + US6 → Community and Custom tabs complete
6. + US7 + US8 → Callout creation/editing/management
7. + US9 + US10 → Tab actions and contributions
8. + US11 + US12 + US13 + US14 → Templates, comments, about, mobile polish

### Parallel Team Strategy

With 2-3 developers after Foundational:
- Dev A: US1 → US4 (page shell → callout blocks) — critical path
- Dev B: US2 + US3 (dashboard + subspaces) — parallel with US1
- Dev C: US13 + US9 (about page + tab actions) — independent

After US4 lands:
- Dev A: US7 + US8 (forms + management)
- Dev B: US5 + US6 (community + custom tabs)
- Dev C: US10 + US12 (contributions + comments)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [US#] label maps task to spec user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- CRD components MUST pass `src/crd/CLAUDE.md` component checklist
- All MUI dialogs triggered from CRD render as portals outside `.crd-root` — no CSS isolation concerns
