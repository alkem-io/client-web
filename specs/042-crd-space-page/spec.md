# Feature Specification: CRD Space L0 Page Migration (with Callouts)

**Feature Branch**: `042-crd-space-page`
**Created**: 2026-04-07
**Status**: Draft
**Input**: Migrate Space L0 (top-level space) pages from MUI to CRD design system (shadcn/ui + Tailwind), including full callout rendering, creation/editing forms, contributions, templates, and comments. Only Space Level Zero; subspaces (L1/L2) have a different layout and will be migrated separately.

## Context

A Space is the primary organizational unit in Alkemio. Each Space L0 page is a rich, multi-tab experience with a configurable structure. The page consists of:

- A **banner** displaying the space visual, title, and tagline
- A **dynamic tab navigation** whose tab names and count are configurable per space (driven by a feature historically called "Innovation Flow" -- each flow state maps positionally to a tab, providing its display name and description)
- **Four default tabs** (Dashboard, Community, Subspaces, Knowledge Base) plus optional custom tabs beyond those four. Currently, the first three tabs (Dashboard, Community, Subspaces) have hardcoded content tied to their positional index. In a future iteration, which sections appear on which tabs should be controlled by a layout setting, making the tab-to-content mapping fully configurable rather than position-driven.
- A **two-column layout** within each tab (sidebar + main content area) on desktop, collapsing to single column on mobile
- **Callouts** -- the primary content system. Each tab displays callouts (content blocks) classified under its Innovation Flow state. Callouts have 5 framing types (Memo, Whiteboard, Link, Media Gallery, Poll), support contributions (posts, memos, whiteboards, links), and include threaded comments.
- An **About page** (separate route) showing full space details for public/non-member users

This is the most complex page migration in the CRD effort, encompassing the page shell, tab system, and the entire callout content system.

### Third-Party Integration Boundaries

Several callout framing types depend on complex third-party systems. The CRD boundary for each is defined precisely here:

**Whiteboard (Excalidraw + real-time collaboration)**
The whiteboard system is NOT just "Excalidraw in a dialog." It is a full collaborative real-time editing platform:
- **Collab class** (~577 lines): Scene synchronization, element reconciliation, mode management (read/write based on permissions, inactivity timeout at 60s, room capacity)
- **Portal class** (~303 lines): WebSocket management with binary-encoded scene updates, volatile channel for ephemeral data (emoji reactions, cursor positions, countdown timers)
- **File management pipeline**: Images embedded in whiteboards are uploaded to the server, cached, and re-downloaded by collaborators via a dedicated FileUploader/FileDownloader system with retry logic
- **Preview generation**: Auto/Custom/Fixed modes with canvas-to-PNG export, crop coordinates, and per-visual-type resizing
- **Guest access**: Session storage persistence, anonymized names for authenticated users, special auth headers on file downloads

**CRD boundary**: The WhiteboardPreview (thumbnail image + buttons) renders **inline** in callout blocks and is a simple presentational component -- rebuild in CRD. The WhiteboardDialog and everything below it (CollaborativeExcalidrawWrapper, Collab, Portal, file management, preview generation, guest session) renders as a **portal dialog** (outside `.crd-root`) -- keep as-is, opened from the integration layer. Whiteboard contribution cards (thumbnail + title) are also simple enough for CRD.

**Memo (Tiptap rich text editor)**
MemoPreview (rendered markdown display) renders **inline** -- rebuild in CRD as plain HTML rendering. MemoDialog (full editing experience with Tiptap) renders as a **portal dialog** -- keep as-is.

**Rich text descriptions (Tiptap)**
Callout descriptions and contribution descriptions use Tiptap for editing. Read-only rendering of markdown is CRD (just HTML). The Tiptap editing surface in callout creation/editing forms is wrapped by the integration layer.

**Poll (GraphQL subscriptions)**
Poll display and voting UI renders **inline** -- rebuild in CRD. Real-time vote updates use existing GraphQL subscriptions unchanged in the data layer.

### Routing Strategy

The current routing structure for Space pages is:

```
TopLevelRoutes.tsx
  └── UrlResolverProvider
        └── :spaceNameId/* → SpaceRoutes (always MUI today)

SpaceRoutes.tsx
  └── SpaceContextProvider
        └── SpacePageLayout (MUI shell: banner, tabs, footer)
              ├── /about → SpaceAboutPage
              ├── [Protected]
              │   ├── / (index) → SpaceTabbedPages (Dashboard/Community/Subspaces/Custom by sectionIndex)
              │   ├── /collaboration/:calloutNameId → SpaceCalloutPage
              │   ├── /settings/* → SpaceAdminL0Route
              │   └── /:dialog?/:calendarEventNameId? → SpaceDashboardPage (dialog routes)
              ├── /challenges/:subspaceNameId/* → SubspaceRoutes (own layout)
              └── * → LegacyRoutesRedirects
```

The CRD migration changes this to:

```
TopLevelRoutes.tsx (when crdEnabled)
  └── CrdLayoutWrapper          ← NEW: wraps :spaceNameId/* in CRD shell
        └── UrlResolverProvider
              └── :spaceNameId/* → CrdSpaceRoutes

CrdSpaceRoutes (replaces SpaceRoutes when crdEnabled)
  └── SpaceContextProvider (reused, unchanged)
        └── CrdSpacePageLayout   ← NEW: CRD banner + tabs + footer
              ├── /about → CrdSpaceAboutPage
              ├── [Protected]
              │   ├── / (index) → CrdSpaceTabbedPages (CRD tab content)
              │   ├── /collaboration/:calloutNameId → SpaceCalloutPage (MUI content inside CRD layout)
              │   ├── /settings/* → SpaceAdminL0Route (MUI content inside CRD layout)
              │   └── /:dialog?/:calendarEventNameId? → CrdSpaceDashboardPage (dialog routes)
              ├── /challenges/:subspaceNameId/* → SubspaceRoutes (own layout, unchanged)
              └── * → LegacyRoutesRedirects (unchanged)
```

Key routing decisions:
- **SpaceContextProvider is reused** -- it provides space data, permissions, and entitlements. No changes needed.
- **CrdSpacePageLayout replaces SpacePageLayout** -- CRD banner + tabs + Outlet. The layout only shows tabs for L0 (same logic as MUI version).
- **Settings and Subspace routes render inside CrdSpacePageLayout's Outlet** -- settings pages render their own admin layout below the CRD banner/breadcrumbs. Subspace routes use SubspacePageLayout internally. No conflict because the CRD elements are above (sequential, not nested).
- **Callout detail route** (`/collaboration/:calloutNameId`) renders inside CrdSpacePageLayout -- the CRD layout shows banner + breadcrumbs (no tabs for this route). The callout content itself is rendered via the integration layer.
- **Feature toggle** -- TopLevelRoutes conditionally routes to CrdSpaceRoutes (crdEnabled) or SpaceRoutes (!crdEnabled), same pattern as 039 for the /spaces page.

### Callout Data Loading Strategy

Callouts use a two-phase loading strategy that mirrors the existing MUI implementation:

**Phase 1 — Light list load** (`CalloutsOnCalloutsSetUsingClassification` query):
- Fetches all callouts for a tab in a single query
- Returns minimal data: `id`, `displayName`, `url`, `sortOrder`, `activity`, `framingType`, `visibility`, `authorization`
- Does NOT include: `description`, `tags`, `references`, whiteboard/memo/poll/media content, `comments`, `contributions`, `createdBy`
- Used to render the callout list structure (titles, sort order, draft badges) and skeleton placeholders

**Phase 2 — Detail load per callout** (`CalloutDetailsQuery`, triggered by viewport intersection):
- Each callout fetches its full details only when it scrolls into view
- Uses `useCalloutInView` hook (from `src/domain/collaboration/calloutsSet/CalloutsView/useCalloutInView.ts`) which wraps `react-intersection-observer` with `delay: 500ms` and `triggerOnce: true`
- Returns complete data: description, all framing content (whiteboard preview, memo, link, media gallery, poll), comments, contributions, author, tags, references
- Skeleton → full PostCard transition is seamless per-item

**CRD integration pattern:**
- `CalloutListConnector` receives light callout data and renders a `LazyCalloutItem` per callout
- `LazyCalloutItem` (integration layer) calls `useCalloutInView`, renders `PostCardSkeleton` while loading, then maps detail data to `PostCardData` via `mapCalloutDetailsToPostCard` and renders `PostCard`
- `SpaceFeed` (CRD component) accepts a `children` slot for lazy-rendered items, keeping it unaware of the loading mechanism
- The CRD `PostCard` component is pure — it receives complete props and renders, no loading state awareness needed

This approach avoids fetching detailed content for callouts the user never scrolls to, matching the performance characteristics of the MUI implementation.

### Prototype Reference

The prototype does not include a Space detail page. CRD components for this migration will be designed to match the aesthetic of the existing CRD components (from 039-crd-spaces-page) while reflecting the structural needs of the current MUI Space pages.

### Relationship to Previous Work

- **039-crd-spaces-page**: Migrated the `/spaces` explorer page. Established the CRD component layer, CrdLayout, SpaceCard, i18n infrastructure, feature toggle, and route wiring patterns. This spec builds on all of those.
- **041-crd-dashboard-page**: Migrated the platform dashboard. Established additional CRD layout patterns.

### Component Mapping Reference

Quick reference mapping new CRD components to their MUI and prototype counterparts.

| New CRD Component | Existing MUI Component | Prototype Reference |
|---|---|---|
| **Page Shell & Layout** | | |
| `crd/layouts/SpaceShell` | `space/layout/SpacePageLayout` | `SpaceShell` |
| `crd/components/space/SpaceHeader` | `space/layout/tabbedLayout/layout/SpacePageBanner` | `SpaceHeader` |
| `crd/components/space/SpaceNavigationTabs` | `space/layout/tabbedLayout/Tabs/SpaceTabs` | `SpaceNavigationTabs` |
| `crd/components/space/SpaceVisibilityNotice` | `space/layout/tabbedLayout/layout/SpaceVisibilityNotice` | — |
| `main/crdPages/space/routing/CrdSpaceRoutes` | `space/routing/SpaceRoutes` | — |
| `main/crdPages/space/layout/CrdSpacePageLayout` | `space/layout/tabbedLayout/layout/SpacePageLayout` | — |
| `main/crdPages/space/tabs/CrdSpaceTabbedPages` | `space/routing/SpaceRoutes` (inline switch) | — |
| **Tab Pages** | | |
| `main/crdPages/space/tabs/CrdSpaceDashboardPage` | `space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage` | `SpaceFeed` (page) |
| `main/crdPages/space/tabs/CrdSpaceCommunityPage` | `space/layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage` | `SpaceMembers` (page) |
| `main/crdPages/space/tabs/CrdSpaceSubspacesPage` | `space/layout/tabbedLayout/Tabs/SpaceSubspacesPage` | `SpaceSubspacesList` (page) |
| `main/crdPages/space/tabs/CrdSpaceCustomTabPage` | `space/layout/tabbedLayout/Tabs/SpaceCustomTabPage/SpaceCustomTabPage` | `SpaceKnowledgeFeed` (page) |
| `main/crdPages/space/about/CrdSpaceAboutPage` | `space/about/SpaceAboutPage` + `SpaceAboutDialog` | — |
| **Sidebar** | | |
| `crd/components/space/SpaceSidebar` | `space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardView` (inline sidebar) | `SpaceSidebar` |
| `crd/components/space/sidebar/InfoBlock` | `space/components/SpaceWelcomeBlock` | `SpaceSidebar` (InfoBlock section) |
| `crd/components/space/sidebar/SubspacesSection` | `space/layout/SubspaceInfoColumn` (subspace list) | `SpaceSidebar` (SubspacesSection) |
| `crd/components/space/sidebar/EventsSection` | `shared/components/DashboardSections/DashboardCalendarSection` | `SpaceSidebar` (EventsSection) |
| `crd/components/space/sidebar/LeadBlock` | `space/about/SpaceAboutDialog` (leads section) | `SpaceSidebar` (LeadBlock) |
| `crd/components/space/sidebar/VirtualContributorsSection` | `community/contributor/RoleSetVirtualContributorsBlockWide` | `SpaceSidebar` (VCs section) |
| `crd/components/space/sidebar/CommunityGuidelinesSection` | `community/invitations/InvitationDialog` (guidelines section) | `SpaceSidebar` (guidelines section) |
| `crd/components/space/sidebar/KnowledgeIndexSection` | `collaboration/callout/calloutsList/CalloutsList` | `SpaceSidebar` (KnowledgeIndex) |
| **Content Components** | | |
| `crd/components/space/PostCard` | `collaboration/callout/CalloutView/CalloutView` + `CalloutViewLayout` | `PostCard` |
| `crd/components/space/SpaceFeed` | `collaboration/calloutsSet/CalloutsView/CalloutsView` | `SpaceFeed` |
| `crd/components/space/SpaceMembers` | `space/components/ContributorsToggleDialog` + `ContributorCardSquare` | `SpaceMembers` |
| `crd/components/space/SpaceSubspacesList` | `space/layout/tabbedLayout/Tabs/SpaceSubspacesPage` (card grid) | `SpaceSubspacesList` |
| `crd/components/common/ExpandableDescription` | `space/components/SpaceWelcomeBlock` (truncation) | — |
| `crd/components/common/MarkdownContent` | Tiptap rendered output | — |
| **Callout Framing** | | |
| `crd/components/callout/CalloutWhiteboardPreview` | `collaboration/callout/CalloutFramings/CalloutFramingWhiteboard` | `PostCard` (whiteboard variant) |
| `crd/components/callout/CalloutPoll` | `collaboration/callout/CalloutFramings/CalloutFramingPoll` | — |
| `crd/components/callout/CalloutMediaGallery` | `collaboration/callout/CalloutFramings/CalloutFramingMediaGallery` | — |
| `crd/components/callout/CalloutLinkAction` | `collaboration/callout/CalloutFramings/CalloutFramingLink` | — |
| `crd/components/callout/CalloutSidebarList` | `collaboration/callout/calloutsList/CalloutsList` | — |
| `crd/components/callout/CalloutTagCloud` | `shared/components/TagsComponent/TagsComponent` | — |
| `crd/components/callout/CalloutComments` | `communication/room/Comments/CommentsComponent` | — |
| **Callout Forms** | | |
| `crd/forms/callout/AddPostModal` | `collaboration/callout/CalloutDialogs/CreateCalloutDialog` | `AddPostModal` |
| `crd/forms/callout/CalloutFramingSelector` | `collaboration/callout/CalloutForm/CalloutFormFramingSettings` | — |
| `crd/forms/callout/PollOptionsEditor` | `collaboration/callout/CalloutFramings/CalloutFramingPoll` (edit mode) | — |
| `crd/forms/callout/CalloutContributionSettings` | `collaboration/callout/CalloutForm/CalloutFormContributionSettings` | — |
| `crd/forms/callout/CalloutVisibilitySelector` | `collaboration/callout/visibilityChangeDialog/CalloutVisibilityChangeDialog` | — |
| **Integration Layer** | | |
| `main/crdPages/space/callout/CalloutListConnector` | `collaboration/calloutsSet/CalloutsInContext/CalloutsGroupView` | — |
| `main/crdPages/space/hooks/useCrdSpaceTabs` | `space/layout/tabbedLayout/layout/useSpaceTabs` | — |
| `main/crdPages/space/hooks/useCrdSpaceDashboard` | `space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage` (inline) | — |
| `main/crdPages/space/hooks/useCrdCalloutList` | `collaboration/calloutsSet/useCalloutsSet` (composed) | — |
| **Primitives** | | |
| `crd/primitives/card` | MUI `Card` / `Paper` | `ui/card` |
| `crd/primitives/separator` | MUI `Divider` | `ui/separator` |
| `crd/primitives/sheet` | MUI `Drawer` | `ui/sheet` |

## Clarifications

### Session 2026-04-09

- Q: What is the maximum threading depth for comment replies? → A: Flat threading (1 level deep) — replies always target the top-level comment; replying to a reply groups it under the same parent thread.
- Q: How does the reply input appear when a user clicks Reply? → A: Inline input — a small textarea appears directly below the target comment (already implemented this way in the current app).
- Q: What is the comment sort order? → A: Configurable — newest first (descending) by default, with a user toggle to switch to oldest first (ascending). Replies within a thread are always chronological (oldest first).
- Q: Should CRD comments support real-time updates via WebSocket subscriptions? → A: Yes — reuse existing subscription infrastructure; new comments and reactions appear in real time without page refresh.
- Q: Is the comment input visible when in collapsible mode (clipped at ~250px)? → A: Always visible — input shows at the bottom even when collapsed, within the 250px area.

## Scope

### In Scope

- Space L0 page shell: banner, dynamic tab navigation, page layout
- All default tabs: Dashboard, Community, Subspaces, Knowledge Base
- Dynamic custom tabs (positions 5+) from Innovation Flow configuration
- Tab action buttons: Activity, Video Call, Share, Settings
- **Callout content blocks**: Rendering all 5 framing types (Memo, Whiteboard, Link, Media Gallery, Poll)
- **Callout management**: Context menu (edit, publish/unpublish, delete, reorder, save as template, share)
- **Callout creation form**: Multi-field form with framing type selection, content editors, contribution settings, tags, visibility, and template import
- **Callout editing form**: Same as creation, with framing type and contribution type locked
- **Callout contributions**: Display and creation of posts, memos, whiteboards, and links within callouts
- **Callout templates**: Import templates during creation, save existing callouts as templates
- **Callout comments**: Threaded comments at callout and contribution levels
- **Tag cloud filtering**: Classification-based callout filtering in custom tabs
- **Callout lazy loading**: Scroll-based progressive rendering of callout blocks
- About page route (`/:spaceNameId/about`)
- Space visibility notice (Archived, Demo, Inactive states)
- Responsive design: desktop, tablet, mobile
- Mobile bottom navigation with overflow drawer
- Feature toggle gating (same `alkemio-crd-enabled` localStorage toggle)
- i18n for all CRD-rendered strings
- Standalone preview app support with mock data

### Out of Scope

- **Whiteboard collaboration infrastructure**: The Excalidraw engine, real-time collaboration stack (Collab, Portal, WebSocket, Y.js), file management pipeline, and preview generation stay unchanged. The whiteboard **user-facing chrome** (editor shell, public page, join dialog) is being migrated to CRD in a dedicated sub-spec — see [whiteboard/spec.md](./whiteboard/spec.md).
- **Memo editing dialog**: MemoDialog (Tiptap-based full editing experience) remains MUI, portals outside `.crd-root`. Only the inline MemoPreview (rendered markdown display) is a CRD component.
- **Rich text editor internals**: The Tiptap editor engine used for callout descriptions and contributions; the integration layer wraps it for creation/editing forms
- **Subspace pages (L1/L2)**: Different layout, migrated in a future spec
- **Space admin/settings pages** (`/:spaceNameId/settings/*`): Complex admin forms, separate migration
- **Template management** (CRUD operations on templates in admin): Part of settings pages
- **Contribution detail pages**: Full-page views of individual posts/whiteboards/memos (when clicking into a contribution) -- these are separate routes
- **Complex non-callout dialogs**: Direct Message, Application/Invitation flow, Create Subspace, Calendar dialog, Community Updates dialog, Welcome dialog -- all remain MUI, triggered via callbacks from CRD components
- **Search dialog**: Global feature, already shared
- **Innovation Hub ribbon**: Niche feature, reuse MUI
- **Drag-and-drop reordering UI**: The @dnd-kit interaction for contribution sorting uses existing behavior; CRD wraps the container

## User Scenarios & Testing

### User Story 1 - Full CRD Space Page Shell (Priority: P0)

A user navigates to a Space L0 page and sees the complete CRD page shell: the CRD header and footer (from 039), the space banner with visual/title/tagline, and the dynamic tab navigation. No MUI layout elements are visible. Tab names reflect the space's custom configuration (via Innovation Flow states) or fall back to defaults (Dashboard, Community, Subspaces, Knowledge Base). Clicking a tab switches content. The URL query parameter for tab selection is preserved.

**Why this priority**: The page shell is the foundation everything else builds on. Without it, no tab content can be rendered in CRD. This also validates that the dynamic tab naming system works correctly in the new design.

**Independent Test**: Navigate to any Space L0 page with CRD enabled. The banner, tabs, header, and footer render entirely in CRD. Tab labels match the space's Innovation Flow configuration. Clicking tabs updates the URL and switches content areas. Navigating between CRD and MUI pages produces no visual glitches or console errors.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and a user navigates to a Space L0, **When** the page loads, **Then** the full CRD shell renders (header, banner, tabs, footer) with zero MUI layout elements visible
2. **Given** a space has custom tab names configured (e.g., "Ideation" instead of "Dashboard"), **When** the page loads, **Then** the tab navigation displays the custom names
3. **Given** a space has the default Innovation Flow configuration, **When** the page loads, **Then** tabs display translated defaults: Dashboard, Community, Subspaces, Knowledge Base
4. **Given** a space has more than 4 Innovation Flow states, **When** the page loads, **Then** additional tabs appear beyond the default four with their custom names
5. **Given** a user clicks a tab, **When** the tab content loads, **Then** the URL updates with the correct tab parameter and the content area switches
6. **Given** a space is Archived/Demo/Inactive, **When** the page loads, **Then** a visibility notice banner appears below the navigation bar
7. **Given** a user navigates to a Space page via direct URL with a tab parameter, **When** the page loads, **Then** the correct tab is selected and its content displayed

---

### User Story 2 - Dashboard Tab (Priority: P1)

A user views the Dashboard tab (default first tab) of a Space L0 page. The sidebar shows a welcome block with the tab description and lead users/organizations, an "About this Space" action, dashboard navigation to related spaces, a calendar section with upcoming events, and an updates section. The main content area displays callout content blocks rendered in the CRD design system. Non-members see a Join/Apply button above the content.

**Why this priority**: The Dashboard is the default landing tab and the most commonly viewed. It's the first impression of a space and contains the most diverse content sections.

**Independent Test**: Navigate to a Space L0 page. The Dashboard tab shows the welcome block with leads, about trigger, navigation, calendar, and CRD-rendered callout blocks. Non-members see the join/apply button. All sidebar sections display correct data.

**Acceptance Scenarios**:

1. **Given** a user views the Dashboard tab, **When** the content loads, **Then** the sidebar shows the tab description, lead users (up to 2), and lead organizations (up to 2) in card format
2. **Given** a user clicks "About this Space", **When** the action triggers, **Then** the About dialog opens showing full space details (reused MUI dialog)
3. **Given** a non-member views the Dashboard, **When** the page loads, **Then** a Join/Apply button appears above the tab content (reused MUI ApplicationButton)
4. **Given** a user has read access, **When** the Dashboard loads, **Then** the calendar section shows upcoming events and the updates section is visible
5. **Given** a user does not have read-users access, **When** the Dashboard loads, **Then** the calendar and updates sections are hidden
6. **Given** the Dashboard has callouts, **When** the content loads, **Then** callout blocks render with their framing content (memo text, whiteboard preview, link button, media grid, or poll) in CRD styling

---

### User Story 3 - Subspaces Tab (Priority: P1)

A user views the Subspaces tab to browse child spaces (L1). The sidebar shows the tab description, a create-subspace trigger (if permitted), and a searchable list of subspace links. The main content area opens with a section header (title, a descriptive subtitle, and a Create Subspace action button for authorized users), a text search input, a wrapping row of selectable tag chips aggregated from the subspaces' own tags, a grid of subspace cards with banner images, names, tags, privacy indicators, membership status, and lead avatars, and a "Show more" control that keeps the grid compact when a space has many subspaces so the callouts below remain reachable.

**Why this priority**: Subspace browsing is core to space navigation and can reuse/extend the SpaceCard CRD component from 039, making it a high-value, lower-effort migration target.

**Independent Test**: Navigate to a Space with more than 6 subspaces and select the Subspaces tab. Section header, search, tag chips and an initial grid of 6 cards render. Typing in search or picking tags filters the grid live. Clicking "Show more" expands to the full list; the callouts section stays reachable without excessive scrolling.

**Acceptance Scenarios**:

1. **Given** a space has subspaces, **When** the Subspaces tab loads, **Then** the main content area shows a section header with the tab title and subtitle copy, a search input, a wrapping row of tag chips, and a grid of subspace cards displaying banner, name, tagline, tags, privacy indicator, and lead avatars
2. **Given** more than 3 subspaces exist, **When** the sidebar renders, **Then** a search field appears above the subspace link list for filtering
3. **Given** a user has create-subspace permission, **When** the tab renders, **Then** a Create Subspace button is visible in the section header and triggers the subspace creation flow (reused MUI dialog)
4. **Given** subspaces have tag metadata, **When** the main content area renders, **Then** every unique tag across the subspaces appears as a selectable chip sorted by frequency (desc) then alphabetically, and clicking a chip narrows the grid to subspaces that carry all currently-selected tags
5. **Given** a user types in the search input, **When** the query is applied, **Then** the grid filters to subspaces whose name or tagline matches the query; search and tag chips combine (a subspace must satisfy both to appear)
6. **Given** a subspace is private, **When** its card renders, **Then** a privacy/lock indicator is visible
7. **Given** a user is a member of a subspace, **When** its card renders, **Then** a membership indicator is shown
8. **Given** space sort mode is alphabetical and a subspace is pinned, **When** its card renders, **Then** a pin indicator is visible
9. **Given** a filter returns no subspaces, **When** the grid renders, **Then** an empty state appears with a "Clear filters" action that restores the default view
10. **Given** a space has more than 6 subspaces matching the current filter, **When** the grid renders, **Then** only the first 6 cards are shown followed by a "Show N more" button; clicking it reveals the rest and the button toggles to "Show less" to collapse back

---

### User Story 4 - Callout Content Blocks (Priority: P1)

A user views any tab and sees callout content blocks rendered in the CRD design system. Each callout block displays a title, description, tags, and type-specific framing content. The 5 framing types render as: rendered markdown (Memo), a clickable whiteboard preview (Whiteboard), a call-to-action button with URL (Link), an image grid (Media Gallery), and an interactive poll with voting (Poll). Callouts load progressively as the user scrolls. Draft callouts show a "Draft" badge and are only visible to authorized users.

**Why this priority**: Callouts are the primary content of every tab. Without CRD callout rendering, the page content cannot be fully migrated. This is a foundational building block.

**Independent Test**: Navigate to any Space tab with callouts. All 5 framing types render correctly in CRD. Scrolling loads more callouts. Draft callouts appear for admins with a badge. Expand/collapse works for long content.

**Acceptance Scenarios**:

1. **Given** a tab has callouts, **When** the content loads, **Then** each callout renders as a content block with title, description, tags, and type-specific framing
2. **Given** a Memo callout, **When** it renders, **Then** the markdown content displays as rendered text with click-to-expand for full view
3. **Given** a Whiteboard callout, **When** it renders, **Then** a preview thumbnail displays with click-to-open for the full whiteboard view
4. **Given** a Link callout, **When** it renders, **Then** a call-to-action button displays with the link name; clicking opens the URL (external links in a new tab with security attributes)
5. **Given** a Media Gallery callout, **When** it renders, **Then** images display in a grid; authorized users see an add-image action
6. **Given** a Poll callout, **When** it renders, **Then** poll questions and options display; members with contribute access can vote and see results
6a. **Given** a single-choice Poll, **When** a user selects an option, **Then** the vote is submitted immediately and results update in real-time
6b. **Given** a multi-choice Poll, **When** a user toggles options, **Then** a 2-second debounce with visual progress fires before submitting the vote
6c. **Given** a Poll with `resultsVisibility: HIDDEN`, **When** a user has not voted, **Then** results (counts/percentages/bars) are hidden
6d. **Given** a Poll with `resultsDetail: FULL`, **When** results are visible, **Then** voter avatars display stacked per option
6e. **Given** a user has voted, **When** they click "Remove my vote", **Then** a confirmation dialog appears; confirming removes the vote and clears the selection
6f. **Given** a Poll with `allowContributorsAddOptions`, **When** a user types a custom option and submits, **Then** the option is added and the user's vote is cast for it
6g. **Given** a Poll with `status: CLOSED`, **When** it renders, **Then** voting controls are disabled and a "Closed" label is shown
6h. **Given** a user votes in one tab, **When** another tab has the same poll open, **Then** the other tab updates in real-time via subscriptions
7. **Given** many callouts on a tab, **When** the user scrolls, **Then** additional callouts load progressively (lazy loading)
8. **Given** a callout is in Draft state, **When** an authorized user views the tab, **Then** the callout shows a "Draft" badge; unauthorized users do not see it
9. **Given** a callout has long description or content, **When** it renders, **Then** content is truncated with an expand/collapse control

---

### User Story 5 - Community Tab (Priority: P2)

A user views the Community tab to see space members, leadership, and community resources. The sidebar shows the tab description, lead users and organizations, a "Contact Leads" action, invite functionality (if permitted), virtual contributors (if entitled), and community guidelines. The main content area opens with a section header (title, a descriptive subtitle showing member and organization counts, and an Invite Member action button for authorized users), a search input and role filter row, a paginated grid of member and organization cards with visually distinct treatments, plus CRD-rendered callout blocks.

**Why this priority**: Community interaction is important but involves more specialized components (member cards, leads sections, invite wizards) that build on the simpler patterns from Dashboard and Subspaces.

**Independent Test**: Navigate to a Space and select the Community tab. Leads, members with counts, and guidelines are displayed. Contact Leads opens a dialog. Invite Member is available in both the sidebar and the section header for authorized users and opens the same flow.

**Acceptance Scenarios**:

1. **Given** a user views the Community tab and the space has at least one lead, **When** the content loads, **Then** the sidebar shows a "Space Lead" / "Space Leads" block listing each lead user and lead organization with avatar, name and location; when the space has no leads the block is hidden entirely
2. **Given** a user clicks "Contact Leads" in the sidebar, **When** the action triggers, **Then** the reused MUI direct-message dialog opens with all lead users pre-populated as message receivers; the Contact Leads button is hidden when no lead users exist
3. **Given** a user has invite privileges, **When** the tab renders, **Then** an Invite Member action is visible both in the sidebar and in the members section header; clicking either entry point opens the same invite contributors dialog (reused MUI dialog)
4. **Given** the space has the virtual-contributor entitlement AND at least one assigned VC, **When** the tab renders, **Then** a Virtual Contributors section appears in the sidebar below the leads/contact/invite row; when either condition is missing the section is hidden entirely
5. **Given** a user is authenticated, **When** the member grid renders, **Then** user and organization members are displayed with visually distinct card treatments (circular avatar + role badge for users; square avatar + organization badge for organizations), plus name and tagline
6. **Given** a user is not authenticated, **When** the member section renders, **Then** individual user cards are hidden (only organizations shown)
7. **Given** the space has community guidelines configured, **When** the tab renders, **Then** a community guidelines block appears in the sidebar
8. **Given** a user enters a search query or picks a role filter that returns no matches, **When** the grid renders, **Then** an empty state appears with a "Clear filters" action that restores the default view
9. **Given** a user holds multiple roles (e.g. Admin AND Lead), **When** the viewer selects the Lead filter, **Then** that user appears in the filtered results (the Admin and Lead filters are overlapping sets, not mutually exclusive); the user's display badge still reflects the highest-precedence role (Admin)

---

### User Story 6 - Custom Tabs / Knowledge Base (Priority: P2)

A user views a custom tab (Knowledge Base at position 4, or any additional tabs at positions 5+). The sidebar shows the tab description with a create-callout trigger (if permitted) and a searchable callout list. The main content area shows a tag cloud for filtering and CRD-rendered callout content blocks. Each custom tab displays only the callouts classified under its corresponding Innovation Flow state.

**Why this priority**: Custom tabs complete the full tab migration and validate the dynamic tab system with the tag cloud filtering and flow-state-based callout classification.

**Independent Test**: Navigate to a Space and select the Knowledge Base tab. Tag cloud filtering works. Callout list in sidebar is searchable. Create button appears for authorized users. Only callouts for this tab's flow state are shown.

**Acceptance Scenarios**:

1. **Given** a user views a custom tab, **When** the content loads, **Then** the sidebar shows the tab description and a searchable callout list
2. **Given** a user has callout creation permission, **When** the tab renders, **Then** a "Create" button is visible and triggers the callout creation form
3. **Given** callouts have tag metadata, **When** the tag cloud renders, **Then** tags are displayed as selectable chips and clicking a tag filters the visible callouts
4. **Given** multiple tags are selected, **When** a user clicks "Clear filter", **Then** all filters are removed and all callouts are visible
5. **Given** a space has 6 Innovation Flow states, **When** tabs 5 and 6 render, **Then** each shows only the callouts classified under its respective flow state

---

### User Story 7 - Callout Creation & Editing (Priority: P2)

An authorized user creates a new callout via a multi-step form. The form includes: a framing type selector (None, Whiteboard, Memo, Link, Media Gallery, Poll), type-specific content editors, a profile section (title, description, tags), contribution settings (allowed response types, comments toggle), and visibility selection (Draft or Published). The user can optionally import a template to pre-fill the form. Editing an existing callout uses the same form with the framing type and contribution type locked.

**Why this priority**: Callout creation is essential for space administrators and contributors. The form is complex but follows established patterns. It depends on the callout rendering (US4) being complete.

**Independent Test**: As a space admin, create callouts of each framing type. Edit an existing callout. Import a template. Verify all form fields, validation, and save/publish flows work correctly.

**Acceptance Scenarios**:

1. **Given** an authorized user clicks "Create", **When** the creation form opens, **Then** the form displays fields for title (required), description, tags, framing type selection, and contribution settings
2. **Given** a user selects a framing type (e.g., Memo), **When** the type is selected, **Then** the type-specific content editor appears (markdown editor for Memo)
3. **Given** a user selects "Link" framing, **When** the editor appears, **Then** both a link URL field and display name field are required; URL is validated for http/https
4. **Given** a user selects "Poll" framing, **When** the editor appears, **Then** a poll title and 2-10 option fields appear with min/max response settings
5. **Given** a user configures contribution settings, **When** selecting an allowed type (Post/Memo/Whiteboard/Link), **Then** type-specific defaults can be configured (default name, description template, whiteboard template)
6. **Given** valid form data, **When** the user clicks "Post", **Then** the callout is created with Published visibility; clicking "Save Draft" creates it as Draft
7. **Given** valid form data, **When** the user opts to send a notification, **Then** a notification checkbox is available and respected on save
8. **Given** an existing callout, **When** the user opens Edit, **Then** the form pre-fills with current data; framing type and contribution type selectors are locked
9. **Given** a user clicks "Find Template", **When** the template browser opens, **Then** available callout templates are listed; selecting one pre-fills the form with template data (with overwrite confirmation if form has existing data)

---

### User Story 8 - Callout Management (Priority: P2)

An authorized user manages callouts via a context menu on each callout block. Actions include: Edit, Publish/Unpublish (with optional notification), Delete (with confirmation), Sort Contributions, Save as Template, Move Position (up/down/top/bottom), Expand to full view, and Share. Each action is gated by the user's permissions on that callout.

**Why this priority**: Callout management is needed for space administrators to maintain content. It builds on the callout rendering (US4) and editing form (US7).

**Independent Test**: As a space admin, open the context menu on a callout. Verify all actions are present and functional. Verify permission gating (e.g., non-admins see fewer options).

**Acceptance Scenarios**:

1. **Given** an authorized user, **When** clicking the settings icon on a callout, **Then** a context menu shows available actions based on permissions
2. **Given** a draft callout, **When** selecting "Publish", **Then** a confirmation dialog with notification option appears; confirming makes the callout visible to all members
3. **Given** a published callout, **When** selecting "Unpublish", **Then** the callout returns to Draft state
4. **Given** the user selects "Delete", **When** the confirmation dialog appears, **Then** it shows the callout title; confirming permanently removes the callout
5. **Given** a callout with contributions, **When** selecting "Sort Contributions", **Then** a reorderable list of contributions appears; saving updates the sort order
6. **Given** the user selects "Move Up/Down/Top/Bottom", **When** the action completes, **Then** the callout's position changes relative to other callouts in the same tab
7. **Given** the user selects "Share", **When** the share dialog opens, **Then** the callout's URL can be copied

---

### User Story 9 - Tab Action Buttons (Priority: P2)

The tab navigation bar includes action buttons for Activity (contribution history), Video Call (if enabled), Share, and Settings (if permitted). Each action triggers its corresponding dialog or navigation.

**Why this priority**: Action buttons are part of the tab navigation but can be implemented after the core tab content is working. They rely on existing MUI dialogs.

**Independent Test**: On a Space page, verify Activity/Share buttons appear for all users. Video Call appears only when enabled. Settings appears only for admins. Each triggers the correct action.

**Acceptance Scenarios**:

1. **Given** a user views a Space page, **When** the tab bar renders, **Then** Activity and Share action buttons are visible
2. **Given** the space allows video calls, **When** the tab bar renders, **Then** a Video Call button is visible
3. **Given** the space does not allow video calls, **When** the tab bar renders, **Then** no Video Call button is shown
4. **Given** a user has update permission, **When** the tab bar renders, **Then** a Settings button/link is visible
5. **Given** a user clicks Activity, **When** the dialog opens, **Then** recent contributions and activity are displayed (reused MUI dialog)
6. **Given** a user clicks Share, **When** the dialog opens, **Then** the space URL can be copied/shared (reused MUI dialog)

---

### User Story 10 - Callout Contributions (Priority: P2)

Within a callout block, users see contribution cards displayed in an expandable grid. Contributions come in 4 types: Post (title, author, date, comment count), Whiteboard (preview thumbnail), Memo (markdown preview), and Link (URL with name). The grid shows up to 2 rows (10 cards) collapsed, with an expand button for more. Users with contribute access can create new contributions via type-specific forms. Selecting a contribution shows its preview inline or in an expanded view with navigation between contributions.

**Why this priority**: Contributions are the interactive content within callouts. Displaying and creating them completes the core callout experience.

**Independent Test**: View a callout with contributions of each type. Create a new post contribution. Expand the grid to see all contributions. Select a contribution to see its preview.

**Acceptance Scenarios**:

1. **Given** a callout with Post contributions, **When** it renders, **Then** post cards show title, author avatar, creation date, and comment count
2. **Given** a callout with Whiteboard contributions, **When** it renders, **Then** whiteboard cards show a preview thumbnail and title
3. **Given** a callout with Memo contributions, **When** it renders, **Then** memo cards show a markdown preview and title
4. **Given** a callout with Link contributions, **When** it renders, **Then** links display with name, URL, and optional description
5. **Given** more than 10 contributions, **When** the grid renders collapsed, **Then** 2 rows of cards are visible with an "Expand" button showing the total count
6. **Given** a user with contribute access, **When** clicking the create button, **Then** a type-specific creation form opens (title, description, tags for posts; name for whiteboards)
7. **Given** a user clicks a contribution card, **When** the preview loads, **Then** the contribution content displays inline with author info, creation date, and navigation controls to adjacent contributions
8. **Given** a callout allows link contributions, **When** the link section renders, **Then** a list of link contributions displays with add capability for authorized users

---

### User Story 11 - Callout Templates (Priority: P3)

During callout creation, an authorized user can import a template to pre-fill the form. Templates include pre-configured framing type, content, contribution settings, and profile data. Space admins can also save an existing callout as a template for future reuse.

**Why this priority**: Templates speed up content creation but are an enhancement on top of manual creation. They're used less frequently than direct creation.

**Independent Test**: Create a callout using a template. Save an existing callout as a template. Verify template data pre-fills the form correctly.

**Acceptance Scenarios**:

1. **Given** a user clicks "Find Template" in the creation form, **When** the template browser opens, **Then** available callout templates are displayed with name, description, and type
2. **Given** a user selects a template, **When** the form has existing data, **Then** a confirmation dialog asks whether to overwrite
3. **Given** a template is selected, **When** the form updates, **Then** all applicable fields pre-fill (framing type, content, contribution settings, profile)
4. **Given** a space admin opens a callout's context menu, **When** "Save as Template" is available, **Then** selecting it opens a form to name and save the callout configuration as a reusable template
5. **Given** an Innovation Flow state has a default template configured, **When** creating a callout in that tab, **Then** the default template is automatically loaded into the creation form

---

### User Story 12 - Callout Comments & Discussions (Priority: P3)

Below the contributions section of a callout, users see a threaded comment section. Comments appear at the callout level (general discussion) or at the contribution level (when a specific post is selected). Users can add comments and reply to existing ones. Each comment shows the author's avatar, name, timestamp, and message content. Comments support emoji reactions (add/remove) and an emoji picker in the input.

The comments component operates in two display modes: **collapsible mode** (inline within callout cards, limited to ~250px height with expand/collapse toggle when content overflows) and **full-height mode** (takes available vertical space, used in post detail dialogs or dedicated views). Comment data is lazy-loaded — not fetched with the initial callout list query but only when the comment section becomes visible or a contribution is selected.

The comment input is a multiline textarea that starts as a single line, auto-expands as the user types up to 5 visible lines, then scrolls internally. It includes an emoji picker button (opens a popover using the existing `emoji-picker-react` package with native emoji style) and a send button. Enter sends the comment; Ctrl+Enter also sends. Maximum 2000 characters. The input is designed to accommodate @mentions in a future iteration but does not implement them now.

**Why this priority**: Comments enable discussion but are a supplementary feature on top of callout content and contributions.

**Independent Test**: View a callout with comments. Add a comment. Select a post contribution and see its contribution-level comments. Reply to a comment. Add an emoji reaction. Expand/collapse the comment section. Verify lazy loading triggers when scrolling a callout into view.

**Acceptance Scenarios**:

#### Display & Threading
1. **Given** a callout with comments enabled, **When** no contribution is selected, **Then** callout-level comments display below the contributions section
2. **Given** a post contribution is selected, **When** the preview loads, **Then** contribution-level comments display for that specific post
3. **Given** a comment exists, **When** it renders, **Then** it shows author avatar, name, timestamp, and message content
4. **Given** a comment has replies, **When** the thread renders, **Then** replies display indented below the parent comment with a "Reply" action on each comment
5. **Given** comments are disabled for a callout, **When** the callout renders, **Then** no comment section appears

#### Collapsible & Full-Height Modes
6. **Given** the comment section is in collapsible mode and content exceeds ~250px, **When** it renders, **Then** a "Show more" / expand control appears and content is clipped
7. **Given** the user clicks "Show more" in collapsible mode, **When** the section expands, **Then** all comments become visible and a "Show less" / collapse control appears
8. **Given** the comment section is in full-height mode, **When** it renders, **Then** it takes the available vertical space with internal scrolling

#### Lazy Loading
9. **Given** the callout list loads, **When** comments data is not yet fetched, **Then** comments are NOT included in the initial query response
10. **Given** a callout scrolls into view (or a contribution is selected), **When** the comment section becomes visible, **Then** comment data is fetched on demand

#### Comment Input
11. **Given** a user has contribute access, **When** viewing the comments section, **Then** an add-comment textarea is visible at the bottom with the user's avatar
12. **Given** an empty input textarea, **When** the user starts typing, **Then** the textarea auto-expands line by line up to 5 visible lines, then scrolls internally
13. **Given** the user types a comment and presses Enter (or Ctrl+Enter), **When** the comment is non-empty, **Then** the comment is submitted and the input clears
14. **Given** the user has typed more than 2000 characters, **When** the limit is reached, **Then** further input is prevented or a character counter warns the user

#### Emoji Picker
15. **Given** the comment input toolbar, **When** the user clicks the emoji button, **Then** an emoji picker popover opens (native emoji style)
16. **Given** the emoji picker is open, **When** the user selects an emoji, **Then** the emoji is inserted at the cursor position in the textarea and the picker closes

#### Reactions
17. **Given** a comment has emoji reactions, **When** it renders, **Then** reaction pills display below the comment showing emoji + count
18. **Given** a user clicks a reaction pill they haven't reacted with, **When** the reaction is added, **Then** the count increments and the pill shows as "active" (the user's reaction)
19. **Given** a user clicks a reaction pill they already reacted with, **When** the reaction is removed, **Then** the count decrements and the pill returns to normal state
20. **Given** a user hovers over a comment, **When** a reaction add button appears, **Then** clicking it opens an emoji picker to add a new reaction

#### Authorization & Deletion
21. **Given** a user without contribute access, **When** viewing the comments section, **Then** no add-comment form is shown
22. **Given** the user authored a comment (or is an admin), **When** viewing that comment, **Then** a delete action is available
23. **Given** a comment is deleted that had replies, **When** the thread re-renders, **Then** replies remain visible with a placeholder for the deleted parent

---

### User Story 13 - About Page (Priority: P3)

A user navigates to the About route (`/:spaceNameId/about`) and sees a full-page view with space details: description, location, metrics, leadership (lead users/organizations, host organization), vision ("Why"), audience ("Who"), community guidelines, and external references. Non-members see a Join/Apply option.

**Why this priority**: The About page is a separate route accessed less frequently than the main tabs. It's important for public-facing content but can be built after the core tabbed experience is complete.

**Independent Test**: Navigate directly to `/:spaceNameId/about`. Full space details render correctly. The page is accessible without space membership.

**Acceptance Scenarios**:

1. **Given** any user (including non-members) navigates to the About route, **When** the page loads, **Then** space name, tagline, description, and location are displayed
2. **Given** the space has lead users and organizations, **When** the About page renders, **Then** leadership cards are shown with name, avatar, and location
3. **Given** the space has a host/provider organization, **When** the About page renders, **Then** the host section shows organization details
4. **Given** the space has "Why" and "Who" content, **When** the About page renders, **Then** both sections display their markdown content
5. **Given** a non-member views the About page, **When** the page renders, **Then** a Join/Apply action is available

---

### User Story 14 - Responsive Mobile Experience (Priority: P3)

On mobile devices, the Space page adapts: the sidebar collapses (content flows into a single column), tab navigation moves to the bottom of the screen as a fixed bottom bar, and overflow actions (Activity, Video Call, Share, Settings) are accessible via a "More" drawer. The banner adapts to smaller viewports. Callout blocks, forms, and contribution grids adapt to single-column layouts.

**Why this priority**: Mobile responsiveness is essential for accessibility but can be polished after the desktop experience is solid. The structural patterns established in P0-P2 inform the responsive breakpoints.

**Independent Test**: Open a Space page on a mobile viewport. Bottom navigation appears. All tabs are reachable. "More" drawer contains overflow actions. Callout blocks and contribution grids reflow to single-column. Content is readable without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** a mobile viewport, **When** a Space page loads, **Then** tab navigation renders as a fixed bottom bar
2. **Given** more actions than can fit in the bottom bar, **When** the "More" button is tapped, **Then** a drawer slides up with Activity, Video Call, Share, and Settings options
3. **Given** a mobile viewport, **When** any tab content renders, **Then** the sidebar content is either hidden or integrated into the single-column flow
4. **Given** a mobile viewport, **When** callout contribution grids render, **Then** cards display in a single column instead of 5-per-row
5. **Given** a mobile viewport, **When** the callout creation form opens, **Then** it adapts to full-width layout with stacked form sections

---

### Edge Cases

- What happens when the Innovation Flow has fewer than 4 states? The page shows only the available tabs (e.g., 2 states = 2 tabs)
- What happens when a space has no banner image? A default space visual is displayed
- What happens when a user navigates to a tab number beyond the available tabs? The page falls back to the first tab (Dashboard)
- What happens when the space visibility is Archived? The visibility notice appears but all content remains viewable (read-only)
- What happens when a space has zero subspaces? The Subspaces tab shows an empty state message with a create action (if permitted)
- What happens when the user has no read access to the space? They are redirected to the About page route
- What happens when navigating between a CRD Space page and an MUI page? No visual artifacts; CSS isolation prevents style bleed
- What happens when a space has no leads configured? The leads sections are omitted or show an empty state
- What happens when a tab description is very long? It displays truncated with an expand/collapse control
- What happens when a callout has no contributions? An empty state with a create-contribution action (if permitted) is shown
- What happens when a Memo callout has extremely long markdown? Content truncates with expand/collapse; full content available in expanded view
- What happens when a whiteboard preview image fails to load? A fallback placeholder icon is displayed
- What happens when a Link callout has an invalid URL? The CTA button renders in a disabled state
- What happens when a Media Gallery callout has no images? An upload placeholder is shown for editors; hidden for viewers
- What happens when a Poll has already been voted on by the user? The results are displayed with the user's vote highlighted
- What happens when a callout creation form has validation errors? Specific field-level errors display; submit buttons remain disabled
- What happens when importing a template would overwrite existing form data? A confirmation dialog asks the user before overwriting
- What happens when a callout has >50 contributions? The expandable grid paginates in batches of 10
- What happens when a callout has zero comments? The comment section shows an empty state with the input form (if authorized) but no comment list
- What happens when a comment's parent was deleted? A placeholder message appears in place of the deleted parent; replies remain visible and indented below it
- What happens when the comment section is in collapsible mode and there are only 1-2 short comments? The expand control does NOT appear since content fits within ~250px
- What happens when the emoji picker opens near the bottom of the viewport? The popover positions itself above the trigger button to remain visible
- What happens when a user adds a reaction that already has reactions from others? The count increments and the pill updates to show the user has reacted
- What happens when a comment has more reactions than fit in one row? A "+N" overflow indicator appears; clicking it reveals remaining reactions in a popover
- What happens when the textarea reaches the 2000-character limit? A character counter warns the user and further input is prevented

## Requirements

### Functional Requirements

#### Page Shell & Layout

- **FR-001**: CRD-enabled Space L0 routes MUST render the full CRD page shell (CrdLayout with header and footer) with zero MUI layout elements visible
- **FR-002**: The space banner MUST display the space's banner visual (or a default), the space title, and tagline
- **FR-003**: The tab navigation MUST display tabs derived from the space's Innovation Flow states, using each state's display name as the tab label
- **FR-004**: When an Innovation Flow state has a display name matching a default tab name (Dashboard, Community, Subspaces, Knowledge Base), the system MUST use the translated version of that default name
- **FR-005**: When an Innovation Flow state has a custom display name, the system MUST display it as-is
- **FR-006**: The tab navigation MUST support dynamic tab counts (minimum 1, up to the number of Innovation Flow states configured)
- **FR-007**: A visibility notice MUST appear when the space status is Archived, Demo, or Inactive, with appropriate messaging
- **FR-008**: Breadcrumbs MUST show the space hierarchy path in the platform navigation bar
- **FR-009**: The tab layout within each tab page MUST use a sidebar + main content area on desktop and collapse to a single column on mobile
- **FR-010**: The URL scheme for tab selection MUST be preserved (query parameter-based, 1-based indexing)
- **FR-011**: The Home Space pin indicator MUST appear on the banner when the current space is the user's configured home space

#### Dashboard Tab

- **FR-012**: The sidebar MUST show a welcome block with the tab description and up to 2 lead users and 2 lead organizations displayed as horizontal cards
- **FR-013**: The sidebar MUST include an "About this Space" action that triggers the About dialog
- **FR-014**: The sidebar MUST include a dashboard navigation section showing links to related spaces
- **FR-015**: The sidebar MUST include a calendar section showing upcoming events (conditional on read-users access)
- **FR-016**: The sidebar MUST include an updates section (conditional on read-users access)
- **FR-017**: A Join/Apply action MUST appear above the tab content for users who are not members of the space
- **FR-018**: The main content area MUST render callout content blocks in the CRD design system

#### Community Tab

- **FR-019**: The sidebar MUST display the tab description (with edit capability for authorized users)
- **FR-020**: The sidebar MUST show lead users and lead organizations in a single "Space Lead" / "Space Leads" block with compact rows (avatar + name + location); when there are zero leads the entire block MUST be hidden, and the singular/plural heading MUST reflect the actual count
- **FR-021**: The sidebar MUST include a "Contact Leads" action that triggers the reused MUI direct-message dialog with the space's lead users pre-populated as message receivers; the action MUST be hidden when the space has zero lead users or the community id is not available
- **FR-022**: The sidebar MUST show an invite-contributors action when the user has invite privileges; the same action MUST be available in the members section header and MUST open the same dialog
- **FR-023**: The sidebar MUST show a Virtual Contributors section ONLY when BOTH conditions are met: (a) the space has the virtual-contributor license entitlement AND (b) at least one visible (non-hidden) VC is assigned to the community. When either condition is false the section MUST be hidden entirely
- **FR-024**: The sidebar MUST show a Community Guidelines block when guidelines are configured
- **FR-025**: The main content area MUST open with a members section containing: a section header (title, subtitle showing "{users} members and {organizations} organizations in this space", and an Invite Member action button for users with invite privileges), a search input and role filter pills (All, Admin, Lead, Member, Organization), a paginated responsive grid of member cards differentiating users (circular avatar + color-coded role badge) from organizations (square avatar + Organization badge), and an empty state with a Clear filters action when no results match
- **FR-025a**: The Invite Member action in the members section header MUST trigger the same invite-contributors dialog as the sidebar action (FR-022); both entry points MUST be gated by the same permission flag
- **FR-025b**: User cards in the members grid MUST be hidden for unauthenticated visitors (only organization cards shown)
- **FR-025c**: Role filter pills MUST treat Admin and Lead as overlapping sets: a user who holds both roles MUST appear under both filters. The display badge MUST reflect the highest-precedence role (Admin > Lead > Member), but the filter MUST match against the user's full role list, not the display badge alone
- **FR-026**: The main content area MUST render callout content blocks in the CRD design system

#### Subspaces Tab

- **FR-027**: The sidebar MUST show the tab description and a create-subspace action (when the user has permission)
- **FR-028**: The sidebar MUST show a searchable list of subspace links (search field visible when >3 subspaces)
- **FR-029**: The main content area MUST open with a subspaces section containing, in order: a section header (title, descriptive subtitle, and a Create Subspace action button for users with permission), a text search input, a wrapping row of tag chips aggregated from the subspaces themselves, and a responsive grid of subspace cards displaying banner image, name, tagline, tags, privacy indicator, membership indicator, and lead avatars. The grid MUST reuse the existing CRD `SpaceCard` component introduced in 039 (extended with an optional pin indicator — see FR-031)
- **FR-029a**: The Create Subspace action in the subspaces section header MUST trigger the reused MUI Create Subspace dialog; the button MUST be gated by the `canCreateSubspaces` permission
- **FR-029b**: The subspaces section MUST show an empty state with a Clear filters action when the current filter yields no results
- **FR-029c**: The subspaces section MUST limit the initial render to a fixed number of cards (default 6) followed by a "Show N more" button; clicking the button MUST reveal the remainder and toggle to "Show less" to collapse back. The purpose is to keep the callouts rendered below the subspaces section reachable without excessive scrolling when a space has many subspaces
- **FR-030**: The tag chips row above the grid MUST aggregate every unique tag across the subspaces, sort them by frequency (descending) then alphabetically, and wrap onto multiple rows when they exceed the available width. Selecting multiple chips MUST combine as AND (a subspace must carry every selected tag to appear). Selecting/deselecting chips MUST compose with the text search (both filters apply simultaneously)
- **FR-031**: Subspace cards MUST show a pin indicator when the space uses alphabetical sorting and the subspace is pinned; in custom sort mode the pin indicator MUST NOT render
- **FR-032**: The main content area MUST render callout content blocks in the CRD design system

#### Custom Tabs (Knowledge Base and beyond)

- **FR-033**: The sidebar MUST show the tab description with an edit action (for authorized users) and a "Create" action (for users with callout creation permission)
- **FR-034**: The sidebar MUST show a searchable list of callouts in the current tab
- **FR-035**: The main content area MUST display a tag cloud showing classification tags, with selectable chips and a clear-all action
- **FR-036**: Selecting tags in the tag cloud MUST filter the visible callouts to only those matching the selected tags
- **FR-037**: Each custom tab MUST display only the callouts classified under its corresponding Innovation Flow state
- **FR-038**: The main content area MUST render callout content blocks in the CRD design system

#### Tab Actions

- **FR-039**: The tab navigation MUST include an Activity action that triggers the contribution history dialog
- **FR-040**: The tab navigation MUST include a Video Call action when the space has video calling enabled
- **FR-041**: The tab navigation MUST include a Share action that triggers the share dialog
- **FR-042**: The tab navigation MUST include a Settings action (visible only to users with update permission) that navigates to the space settings page

#### About Page

- **FR-043**: The About route (`/:spaceNameId/about`) MUST render a CRD page displaying: space name, tagline, description, location, metrics, lead users, lead organizations, host/provider organization, vision ("Why"), audience ("Who"), community guidelines, and external references
- **FR-044**: The About page MUST be accessible to users without space read access (public route)
- **FR-045**: The About page MUST include a Join/Apply action for non-members

#### Callout Content Rendering

- **FR-046**: Callout content blocks MUST render with a title, type indicator, and description
- **FR-047**: Callout blocks MUST support expand/collapse for content that exceeds a reasonable display height
- **FR-048**: Callouts MUST load progressively as the user scrolls (lazy loading via viewport intersection)
- **FR-049**: Draft callouts MUST display a "Draft" badge and MUST only be visible to users with update permission
- **FR-050**: The callout block MUST display tags associated with the callout
- **FR-051**: The callout block MUST display author information and publication date
- **FR-052**: External references attached to a callout MUST be displayed as clickable links

#### Callout Framing Types

- **FR-053**: Memo framing MUST render markdown content as formatted text; clicking MUST open an expanded view for full reading/editing
- **FR-054**: Whiteboard framing MUST render a CRD preview thumbnail (image + "Open" button); clicking MUST trigger a callback that the integration layer uses to open the existing WhiteboardDialog (MUI, renders as portal outside `.crd-root`). The entire collaboration system (Collab, Portal, file management, preview generation, guest sessions) is invoked by the dialog -- none of it enters `src/crd/`
- **FR-055**: Link framing MUST render as a call-to-action button with the link display name; the URL MUST be validated for http/https; external links MUST open in a new tab with `noopener, noreferrer`; internal links MUST use client navigation
- **FR-056**: Media Gallery framing MUST render images in a grid layout; authorized users MUST be able to add images; empty galleries MUST show an upload placeholder for editors
- **FR-057**: Poll framing MUST render questions with votable options; users with contribute access MUST be able to cast votes; results MUST display with vote counts and percentages
- **FR-057a**: Poll framing MUST support both single-choice (radio) and multi-choice (checkbox) voting modes, determined by `maxResponses` setting (1 = single, >1 or 0/unlimited = multi)
- **FR-057b**: Multi-choice voting MUST use a 2-second debounce with a visual progress indicator before submitting, to batch user interactions; single-choice MUST submit immediately on selection
- **FR-057c**: Poll framing MUST support three results visibility modes: HIDDEN (results shown only after user votes), TOTAL_ONLY (only total vote count before voting), VISIBLE (full results always visible)
- **FR-057d**: Poll framing MUST support three results detail modes: FULL (vote counts + voter avatar list per option), COUNT (vote counts only), PERCENTAGE (percentages only)
- **FR-057e**: When `resultsDetail` is FULL, each option MUST display voter avatars in a stacked row (max 10 visible) with a "+N" overflow indicator; avatars expand spacing on hover
- **FR-057f**: Poll framing MUST allow users to remove their vote via a "Remove my vote" link with a confirmation dialog
- **FR-057g**: Poll framing MUST support a "custom option" input when `allowContributorsAddOptions` is enabled — users can type a new option and vote for it in one action
- **FR-057h**: Poll framing MUST display appropriate status messages during async operations: "Preparing vote" (debounce), "Submitting" (mutation in flight), "Adding option" (custom option creation)
- **FR-057i**: Poll framing MUST display a "Closed" label when `status === CLOSED` and disable all voting controls
- **FR-057j**: Poll framing MUST enforce min/max response constraints with helper text ("Select at least N", "Maximum N reached") and disable additional checkboxes when max is reached
- **FR-057k**: Poll framing MUST handle subscription-driven vote revocation (another tab removes the user's vote) by clearing local selection and showing a warning message
- **FR-058**: Poll framing MUST support real-time updates (subscriptions) for vote changes

#### Callout Management

- **FR-059**: Each callout block MUST display a context menu (settings icon) for authorized users with actions gated by permissions
- **FR-060**: The context menu MUST include Edit (opens editing form), Publish/Unpublish (with notification option), Delete (with confirmation showing callout title), Sort Contributions (for callouts with contribution types), and Share (copy URL)
- **FR-061**: The context menu MUST include position controls: Move Up, Move Down, Move to Top, Move to Bottom -- each disabled when at the respective boundary
- **FR-062**: The context menu MUST include "Save as Template" for users with template creation permission
- **FR-063**: Publishing or unpublishing a callout MUST offer an optional notification toggle

#### Callout Creation & Editing Forms

- **FR-064**: The callout creation form MUST include: title (required, validated non-empty), description (markdown, with length limit), tags, and external references
- **FR-065**: The creation form MUST include a framing type selector with 6 options: None, Whiteboard, Memo, Link, Media Gallery, Poll -- each with a distinctive icon
- **FR-066**: Selecting a framing type MUST display the corresponding content editor: markdown editor (Memo), whiteboard setup (Whiteboard), URL + display name fields (Link), image upload area (Media Gallery), or question/options builder (Poll)
- **FR-067**: Link framing MUST validate that the URL is a valid http/https address and that a display name is provided
- **FR-068**: Poll framing MUST support a title, 2-10 option fields, and min/max response count settings with validation (min <= max, both <= option count)
- **FR-068a**: Poll option fields MUST support drag-and-drop reordering via @dnd-kit
- **FR-068b**: Poll creation/editing form MUST include a settings dialog with: single/multi-choice toggle, allow custom options toggle, hide results until voted toggle, show voter avatars toggle
- **FR-068c**: Poll editing form MUST include an Open/Close poll status toggle with confirmation dialog; closed polls MUST lock all editing controls
- **FR-069**: The creation form MUST include contribution settings: allowed response type (None, Post, Memo, Whiteboard, Link), comments toggle, and per-type defaults (default name, description template, whiteboard template)
- **FR-070**: The creation form MUST include a visibility selector (Published or Draft) and a "Send Notification" toggle (enabled only when form is valid)
- **FR-071**: The creation form MUST support template import via a "Find Template" action that opens a template browser
- **FR-072**: The editing form MUST pre-populate with existing callout data; the framing type selector and contribution type MUST be locked (read-only)
- **FR-073**: Form validation errors MUST display at the field level; submit actions MUST remain disabled until the form is valid

#### Callout Contributions

- **FR-074**: Contributions MUST render as cards in an expandable grid: up to 2 rows (10 cards at 5 per row on desktop) when collapsed, with an expand button showing the remaining count
- **FR-075**: Post contribution cards MUST show title, author avatar, creation date, description preview, tags, and comment count
- **FR-076**: Whiteboard contribution cards MUST show a preview thumbnail (with fallback icon if unavailable) and title
- **FR-077**: Memo contribution cards MUST show a markdown preview and title
- **FR-078**: Link contributions MUST display as a list with link name, URL, and optional description; authorized users MUST be able to add new links
- **FR-079**: Selecting a contribution card MUST display its content in a preview area with author info, timestamp, edit/share actions, and navigation controls to adjacent contributions
- **FR-080**: Authorized users MUST be able to create contributions via type-specific forms: title + description + tags (Post/Memo), name (Whiteboard), or URL + name + description (Link)
- **FR-081**: The contribution grid MUST be responsive: 5 columns on desktop, 3 on tablet, 1 on mobile

#### Callout Templates

- **FR-082**: The template browser MUST display available callout templates with name, description, and framing type
- **FR-083**: Selecting a template MUST pre-fill the creation form with the template's framing type, content, contribution settings, and profile data
- **FR-084**: If the creation form contains existing data when importing a template, a confirmation dialog MUST warn about overwriting
- **FR-085**: "Save as Template" MUST open a form where the user names the template; the callout's full configuration MUST be saved as a reusable template
- **FR-086**: When an Innovation Flow state has a default template, creating a callout in that tab MUST auto-load the default template

#### Callout Comments

##### Display & Threading
- **FR-086a**: Comments MUST be sorted newest first (descending) by default; a toggle control MUST allow users to switch to oldest first (ascending). The selected sort order applies to top-level comments; replies within a thread are always shown in chronological (ascending) order.
- **FR-087**: Callout-level comments MUST display as a threaded list below the contributions section when no contribution is selected
- **FR-088**: Contribution-level comments MUST display when a Post contribution is selected; non-Post contributions do not have contribution-level comments
- **FR-089**: Each comment MUST show author avatar, name, timestamp, and message content
- **FR-090**: Users with contribute access MUST be able to add comments and reply to existing comments
- **FR-091**: Comments MUST be hideable when disabled via callout settings (comments toggle)
- **FR-091a**: Threading is flat (1 level deep): replies MUST display indented below their parent top-level comment; replying to a reply targets the same parent thread. Each comment MUST include a "Reply" action button. Clicking Reply MUST render an inline textarea directly below the target comment (not redirect to the bottom input)
- **FR-091b**: When a parent comment is deleted, its replies MUST remain visible with a placeholder indicating the deleted parent

##### Display Modes
- **FR-091c**: The comment component MUST support two display modes: **collapsible** (constrained to ~250px max height with overflow clipping and expand/collapse toggle) and **full-height** (takes available vertical space with internal scrolling)
- **FR-091d**: In collapsible mode, when content exceeds ~250px, a "Show more" control MUST appear; clicking it expands to show all comments and changes to "Show less". The comment input MUST remain visible at the bottom even when collapsed (within the 250px area); only the comment list is clipped
- **FR-091e**: In full-height mode, the comment section MUST fill available space with the input pinned at the bottom

##### Lazy Loading & Real-Time
- **FR-091f**: Comment data MUST NOT be included in the initial callout list query; it MUST be fetched on demand when the comment section becomes visible (scroll into view) or when a contribution is selected
- **FR-091g**: While comments are loading, a loading indicator MUST be shown in place of the comment list
- **FR-091g2**: Once loaded, comments MUST receive real-time updates via the existing WebSocket subscription infrastructure (new comments, deleted comments, and reaction changes appear without page refresh)

##### Comment Input
- **FR-091h**: The comment input MUST be a multiline textarea that starts as a single line and auto-expands as the user types, up to 5 visible lines; beyond 5 lines the textarea MUST scroll internally
- **FR-091i**: The input MUST include an emoji picker button that opens a popover with native emoji style (using the existing `emoji-picker-react` package); selecting an emoji MUST insert it at the cursor position
- **FR-091j**: The input MUST include a send button (icon); pressing Enter or Ctrl+Enter MUST submit the comment when non-empty
- **FR-091k**: The input MUST enforce a maximum of 2000 characters with a visible character counter when approaching the limit
- **FR-091l**: The input MUST display the current user's avatar to the left of the textarea
- **FR-091m**: The input layout MUST be designed to accommodate @mention functionality in a future iteration (space for an @ button in the toolbar) without implementing it now

##### Reactions
- **FR-091n**: Each comment MUST support emoji reactions displayed as pill-shaped badges (emoji + count) below the comment content
- **FR-091o**: Clicking a reaction pill the user has NOT reacted with MUST add the user's reaction and increment the count; clicking one they HAVE reacted with MUST remove it and decrement the count
- **FR-091p**: A reaction pill MUST visually distinguish whether the current user has reacted (e.g., outlined/highlighted border)
- **FR-091q**: Hovering over a comment MUST reveal a "add reaction" button that opens an emoji picker to add a new reaction type
- **FR-091r**: When reactions overflow the available width, a "+N" indicator MUST appear; clicking it shows the remaining reactions in a popover

##### Authorization
- **FR-091s**: The add-comment form MUST only be visible to users with contribute access
- **FR-091t**: A delete action MUST be available on comments authored by the current user or when the user has admin/delete privileges

#### Responsive Design

- **FR-092**: On desktop (>960px), tab navigation MUST render above the content with a sidebar + content area layout
- **FR-093**: On mobile (<=600px), tab navigation MUST render as a fixed bottom bar with a "More" drawer for overflow actions
- **FR-094**: On mobile, the sidebar MUST collapse so content flows in a single column
- **FR-095**: The banner MUST adapt to viewport width without horizontal overflow
- **FR-096**: Responsive padding MUST follow CRD conventions (compact on mobile, spacious on desktop)
- **FR-097**: Callout creation/editing forms MUST adapt to mobile viewports with stacked, full-width form sections

#### Architecture & Coexistence

- **FR-098**: All CRD Space and Callout components in `src/crd/` MUST have zero MUI or Emotion imports
- **FR-099**: Data mapping from the data layer to CRD component props MUST happen in the integration layer (`src/main/crdPages/space/`)
- **FR-100**: Existing MUI dialogs (Activity, Video Call, Share, Direct Message, Application, Create Subspace, Calendar, Updates, Welcome, About) MUST be reusable from the integration layer via callbacks
- **FR-101**: The feature toggle (`alkemio-crd-enabled` in localStorage) MUST gate CRD vs MUI rendering for Space L0 routes by conditionally routing to CrdSpaceRoutes or SpaceRoutes in TopLevelRoutes
- **FR-102**: CRD and MUI versions of the Space page MUST coexist without CSS conflicts or console errors
- **FR-116**: The `:spaceNameId/*` route MUST be wrapped in CrdLayoutWrapper when CRD is enabled, following the same pattern as the /spaces route in 039
- **FR-117**: SpaceContextProvider MUST be reused unchanged inside the CRD route tree -- no duplication of space data fetching
- **FR-118**: Sub-routes that remain MUI (settings, subspaces) MUST render inside CrdSpacePageLayout's Outlet without visual conflict -- settings renders its own admin layout below the CRD banner, subspaces use their own SubspacePageLayout
- **FR-119**: The callout detail route (`/collaboration/:calloutNameId`) MUST render inside CrdSpacePageLayout with CRD banner and breadcrumbs but no tab navigation
- **FR-103**: Whiteboard and Memo dialogs (WhiteboardDialog, MemoDialog) MUST remain as MUI components, opened from the integration layer; they render as portals outside `.crd-root` and have no CSS isolation concerns. Only the inline preview components (WhiteboardPreview thumbnail, MemoPreview rendered markdown, WhiteboardCard contribution card) MUST be CRD components. The Tiptap editor used in callout creation/editing forms MUST be wrapped by the integration layer, not imported into `src/crd/`
- **FR-104**: The callout form MUST NOT import form state libraries (e.g., Formik) in `src/crd/`; form state management MUST happen in the integration layer

#### Accessibility

- **FR-105**: Tab navigation MUST be keyboard-accessible (arrow keys to navigate, Enter/Space to select)
- **FR-106**: All interactive elements MUST be semantic `<a>` or `<button>` elements
- **FR-107**: All interactive elements MUST have visible focus indicators
- **FR-108**: Icon-only action buttons (callout settings, expand, share, edit) MUST have descriptive `aria-label` attributes
- **FR-109**: The active tab MUST be indicated via `aria-selected` or equivalent accessible state
- **FR-110**: All user-visible strings MUST use the translation system (no hardcoded text)
- **FR-111**: Color contrast MUST meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- **FR-112**: Loading states MUST use appropriate ARIA attributes (`role="status"`, `aria-busy`)
- **FR-113**: Callout context menus MUST be keyboard-navigable and announce menu items to screen readers
- **FR-114**: Form validation errors MUST be announced to screen readers via `aria-describedby` or `aria-errormessage`
- **FR-115**: Poll voting controls MUST have clear labels indicating the question and each option

### Key Entities

- **SpacePageData**: Core space identity for the page shell -- name, tagline, banner visual (URL), avatar, visibility status (Active/Archived/Demo/Inactive), level (L0), whether it is the user's home space, and the user's membership status
- **SpaceTab**: A single tab in the navigation -- positional index, display label (from Innovation Flow state or default), description text, whether it is a default tab or custom, and its associated Innovation Flow state identifier
- **SpaceLead**: A lead user or organization -- name, avatar URL, type (person or organization), location (city/country)
- **SpaceMember**: A community member -- name, avatar URL, type (user or organization), role (Admin / Lead / Member for users, or Organization for organizations), location, tagline, tags. Role drives the member card's badge styling and matches the role filter pills.
- **SubspaceCardData**: Data for a subspace card -- id, name, description (from tagline), banner image URL, initials + deterministic avatar colour, tags, privacy status, membership status, pinned status (only rendered when the parent space uses alphabetical sorting), lead users/organizations, navigation href. Conforms to the same shape used by the explore-spaces `SpaceCard` component (from 039) so the same presentational component can render both.
- **SpaceAboutData**: Full space details for the About page -- description, "who" text, "why" text, location, metrics (name-value pairs), provider/host organization, lead users, lead organizations, community guidelines, external references
- **CalendarEvent**: An event in the space calendar -- title, start date, duration, whether it is a whole-day event
- **SpaceMetric**: A key-value metric about the space -- name (e.g., "members") and value
- **CalloutData**: A content block within a tab -- id, title, description, tags, framing type (None/Memo/Whiteboard/Link/MediaGallery/Poll), visibility (Draft/Published), sort order, author, publication date, contribution count, references, and type-specific framing content
- **CalloutFramingContent**: Union of type-specific content -- markdown text (Memo), whiteboard preview URL + whiteboard ID (Whiteboard), URL + display name (Link), images array with sort order (Media Gallery), poll title + options + settings + votes (Poll)
- **ContributionData**: A response within a callout -- id, type (Post/Whiteboard/Memo/Link), title, description, author, creation date, comment count, sort order, tags, and type-specific content (markdown for memos, preview URL for whiteboards, URL for links)
- **CalloutTemplate**: A reusable callout configuration -- id, name, description, framing type, default content, contribution settings, profile data
- **CommentData**: A threaded comment -- id, author (id, name, avatar), message content, timestamp, parent comment id (for replies), deletion status, emoji reactions (emoji, count, whether current user reacted), and delete permission flag
- **CommentsContainerData**: Container-level props for the reusable comments component -- comments list, contribute access flag, current user (for input avatar), loading state, display mode (collapsible or full-height), and callbacks for add/reply/delete/add-reaction/remove-reaction

## Assumptions

1. The CrdLayout (header/footer) and CRD primitives from 039 are stable and reusable
2. The feature toggle mechanism (`useCrdEnabled`) works the same way as for the Explore Spaces page
3. Innovation Flow states are always available when a space loads (the query is reliable)
4. No new backend APIs or GraphQL schema changes are needed -- all data is already available via existing queries
5. The `?tab=N` URL parameter scheme is preserved exactly (1-based indexing, same parameter name)
6. Tab positions are stable for this spec: position 0=Dashboard, 1=Community, 2=Subspaces, 3=Knowledge Base, 4+=Custom. However, the architecture MUST NOT hard-wire content to positional indices in a way that would prevent a future layout setting from controlling which sections appear on which tabs. Tab content components should be decoupled from their position so they can be re-assigned via configuration in a future iteration.
7. Subspace cards can reuse or extend the SpaceCard CRD component from 039
8. The About page is a full-page CRD view, not an overlay dialog (the SpaceAboutDialog triggered from Dashboard remains MUI)
9. Whiteboard and Memo dialogs remain MUI and render as portals (outside `.crd-root`), so there are no CSS isolation concerns. Only the inline preview thumbnails and contribution cards are CRD components. The entire whiteboard collaboration stack (Collab, Portal, file management, preview generation, guest sessions) is untouched.
10. The rich text editor (Tiptap) is wrapped by the integration layer for creation/editing forms; its internal toolbar and editing surface are not rebuilt. Read-only markdown rendering in callout blocks and contribution previews is a CRD concern (plain HTML output).
11. Form state management (currently Formik) is handled in the integration layer, not in `src/crd/` -- CRD form components are pure UI (inputs, selectors, validation display)
12. The existing MUI dialogs listed in Out of Scope can be triggered via state/callbacks from the CRD integration layer
13. Drag-and-drop for contribution sorting uses the existing @dnd-kit library wrapped in CRD-styled containers
14. Poll real-time updates use existing GraphQL subscriptions without changes

## Success Criteria

### Measurable Outcomes

- **SC-001**: The full CRD Space L0 page shell renders with zero MUI layout elements visible on any default or custom tab
- **SC-002**: 100% data parity with the MUI version -- all information visible on the MUI Space page is also visible on the CRD version
- **SC-003**: No console errors when navigating between CRD Space pages, MUI pages, and back
- **SC-004**: Custom Innovation Flow tab names render correctly for spaces with non-default configurations
- **SC-005**: All tab content (Dashboard, Community, Subspaces, Custom) renders correctly with proper sidebar/content layout
- **SC-006**: All 5 callout framing types (Memo, Whiteboard, Link, Media Gallery, Poll) render correctly with type-specific content
- **SC-007**: Callout creation form allows creating callouts of each framing type with valid data and correct validation
- **SC-008**: Callout editing form pre-fills correctly and allows updating callout content (with framing type locked)
- **SC-009**: Contribution cards display correctly for all 4 types (Post, Whiteboard, Memo, Link) with expandable grid
- **SC-010**: Template import pre-fills the creation form; save-as-template captures the full callout configuration
- **SC-011**: The page is fully functional on mobile, tablet, and desktop viewports without horizontal overflow or unreachable content
- **SC-012**: All CRD components in `src/crd/` have zero MUI or Emotion imports (verifiable via automated grep)
- **SC-013**: Every CRD component passes the component checklist from `src/crd/CLAUDE.md`
- **SC-014**: The migration pattern is documented and reproducible for future Space L1/L2 page migrations
- **SC-015**: Performance is equal to or better than the MUI version (no additional network requests, no slower initial render)

## Sub-Specifications

The following areas are complex enough to warrant their own spec/plan/tasks documents:

- **[Iframe Whitelist Context](./iframe-whitelist/spec.md)** — Delivers the iframe whitelist from the server config into the CRD `MarkdownContent` renderer via a React context, allowing embedded iframes (YouTube, Vimeo, etc.) to render in callout descriptions without violating the CRD no-domain-imports rule.
- **[CRD Markdown Editor](./markdown-editor/spec.md)** — A self-contained Tiptap-based markdown editor for `src/crd/forms/markdown/`, used as the callout description field. Fresh CRD toolbar (lucide-react + Tailwind), bundled markdown ↔ HTML conversion, no MUI. Image upload and iframe embed designed for but deferred.
