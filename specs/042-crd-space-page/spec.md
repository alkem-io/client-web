# Feature Specification: CRD Space L0 Page Migration

**Feature Branch**: `042-crd-space-page`
**Created**: 2026-04-07
**Status**: Draft
**Input**: Migrate Space L0 (top-level space) pages from MUI to CRD design system (shadcn/ui + Tailwind). Only Space Level Zero; subspaces (L1/L2) have a different layout and will be migrated separately.

## Context

A Space is the primary organizational unit in Alkemio. Each Space L0 page is a rich, multi-tab experience with a configurable structure. The page consists of:

- A **banner** displaying the space visual, title, and tagline
- A **dynamic tab navigation** whose tab names and count are configurable per space (driven by a feature historically called "Innovation Flow" -- each flow state maps positionally to a tab, providing its display name and description)
- **Four default tabs** (Dashboard, Community, Subspaces, Knowledge Base) plus optional custom tabs beyond those four
- A **two-column layout** within each tab (sidebar + main content area) on desktop, collapsing to single column on mobile
- An **About page** (separate route) showing full space details for public/non-member users

This is the most complex page migration in the CRD effort. The strategy is to migrate the Space-specific UI (page shell, tab navigation, structural layout, sidebar sections, space-specific cards) while reusing existing callout rendering components via composition slots. Callout migration (CalloutsGroupView, CalloutView, and all 5 framing types) is explicitly deferred to a future spec due to its complexity and cross-cutting nature.

### Prototype Reference

The prototype does not include a Space detail page. CRD components for this migration will be designed to match the aesthetic of the existing CRD components (from 039-crd-spaces-page) while reflecting the structural needs of the current MUI Space pages.

### Relationship to Previous Work

- **039-crd-spaces-page**: Migrated the `/spaces` explorer page (list of all spaces). Established the CRD component layer, CrdLayout, SpaceCard, i18n infrastructure, feature toggle, and route wiring patterns. This spec builds on all of those.
- **041-crd-dashboard-page**: Migrated the platform dashboard. Established additional CRD layout patterns.

## Scope

### In Scope

- Space L0 page shell: banner, dynamic tab navigation, page layout
- All default tabs: Dashboard, Community, Subspaces, Knowledge Base
- Dynamic custom tabs (positions 5+) from Innovation Flow configuration
- Tab action buttons: Activity, Video Call, Share, Settings
- About page route (`/:spaceNameId/about`)
- Space visibility notice (Archived, Demo, Inactive states)
- Responsive design: desktop, tablet, mobile
- Mobile bottom navigation with overflow drawer
- Feature toggle gating (same `alkemio-crd-enabled` localStorage toggle)
- i18n for all CRD-rendered strings
- Standalone preview app support with mock data

### Out of Scope

- **Callout rendering**: CalloutsGroupView, CalloutView, and all framing types (memo, whiteboard, link, media gallery, poll) remain MUI -- rendered via composition slots in the integration layer
- **Callout creation/editing dialogs**: Remain MUI
- **Subspace pages (L1/L2)**: Different layout, migrated in a future spec
- **Space admin/settings pages** (`/:spaceNameId/settings/*`): Complex admin forms, separate migration
- **Complex dialogs**: Direct Message, Application/Invitation flow, Create Subspace, Calendar dialog, Community Updates dialog, Welcome dialog -- all remain MUI, triggered via callbacks from CRD components
- **Search dialog**: Global feature, already shared
- **Innovation Hub ribbon**: Niche feature, reuse MUI

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

A user views the Dashboard tab (default first tab) of a Space L0 page. The sidebar shows a welcome block with the tab description and lead users/organizations, an "About this Space" action, dashboard navigation to related spaces, a calendar section with upcoming events, and an updates section. The main content area displays callouts (rendered via existing callout components). Non-members see a Join/Apply button above the content.

**Why this priority**: The Dashboard is the default landing tab and the most commonly viewed. It's the first impression of a space and contains the most diverse content sections.

**Independent Test**: Navigate to a Space L0 page. The Dashboard tab shows the welcome block with leads, about trigger, navigation, calendar, and callouts. Non-members see the join/apply button. All sidebar sections display correct data.

**Acceptance Scenarios**:

1. **Given** a user views the Dashboard tab, **When** the content loads, **Then** the sidebar shows the tab description, lead users (up to 2), and lead organizations (up to 2) in card format
2. **Given** a user clicks "About this Space", **When** the action triggers, **Then** the About dialog opens showing full space details (reused MUI dialog)
3. **Given** a non-member views the Dashboard, **When** the page loads, **Then** a Join/Apply button appears above the tab content (reused MUI ApplicationButton)
4. **Given** a user has read access, **When** the Dashboard loads, **Then** the calendar section shows upcoming events and the updates section is visible
5. **Given** a user does not have read-users access, **When** the Dashboard loads, **Then** the calendar and updates sections are hidden

---

### User Story 3 - Subspaces Tab (Priority: P1)

A user views the Subspaces tab to browse child spaces (L1). The sidebar shows the tab description, a create-subspace trigger (if permitted), and a searchable list of subspace links. The main content area shows a filterable grid of subspace cards with banner images, names, tags, privacy indicators, membership status, and lead avatars.

**Why this priority**: Subspace browsing is core to space navigation and can reuse/extend the SpaceCard CRD component from 039, making it a high-value, lower-effort migration target.

**Independent Test**: Navigate to a Space with subspaces and select the Subspaces tab. Cards render in a grid with correct data. Filtering by tags works. Create button appears for authorized users.

**Acceptance Scenarios**:

1. **Given** a space has subspaces, **When** the Subspaces tab loads, **Then** a grid of subspace cards displays with banner, name, tagline, tags, privacy indicator, and lead avatars
2. **Given** more than 3 subspaces exist, **When** the sidebar renders, **Then** a search field appears above the subspace link list for filtering
3. **Given** a user has create-subspace permission, **When** the tab renders, **Then** a create button is visible and triggers the subspace creation flow (reused MUI dialog)
4. **Given** subspaces have tag metadata, **When** a user selects a tag filter, **Then** only matching subspace cards are shown
5. **Given** a subspace is private, **When** its card renders, **Then** a privacy/lock indicator is visible
6. **Given** a user is a member of a subspace, **When** its card renders, **Then** a membership indicator is shown
7. **Given** space sort mode is alphabetical and a subspace is pinned, **When** its card renders, **Then** a pin indicator is visible

---

### User Story 4 - Community Tab (Priority: P2)

A user views the Community tab to see space members, leadership, and community resources. The sidebar shows the tab description, lead users and organizations, a "Contact Leads" action, invite functionality (if permitted), virtual contributors (if entitled), and community guidelines. The main content area shows member and organization cards in a wide format, plus callouts.

**Why this priority**: Community interaction is important but involves more specialized components (member cards, leads sections, invite wizards) that build on the simpler patterns from Dashboard and Subspaces.

**Independent Test**: Navigate to a Space and select the Community tab. Leads, members, and guidelines are displayed. Contact Leads opens a dialog. Invite functionality appears for authorized users.

**Acceptance Scenarios**:

1. **Given** a user views the Community tab, **When** the content loads, **Then** the sidebar shows lead users and lead organizations with avatar, name, and location
2. **Given** a user clicks "Contact Leads", **When** the action triggers, **Then** the direct message dialog opens (reused MUI dialog)
3. **Given** a user has invite privileges, **When** the tab renders, **Then** an invite contributors action is available
4. **Given** the space has virtual contributor entitlements and VCs assigned, **When** the tab renders, **Then** a Virtual Contributors section appears
5. **Given** a user is authenticated, **When** the member cards render, **Then** user and organization members are displayed in wide card format with avatar, name, location, and tagline
6. **Given** a user is not authenticated, **When** the member section renders, **Then** individual user cards are hidden (only organizations shown)
7. **Given** the space has community guidelines configured, **When** the tab renders, **Then** a community guidelines block appears in the sidebar

---

### User Story 5 - Custom Tabs / Knowledge Base (Priority: P2)

A user views a custom tab (Knowledge Base at position 4, or any additional tabs at positions 5+). The sidebar shows the tab description with a create-callout trigger (if permitted) and a searchable callout list. The main content area shows a tag cloud for filtering and callout content. Each custom tab displays callouts classified under its corresponding Innovation Flow state.

**Why this priority**: Custom tabs complete the full tab migration and validate the dynamic tab system. They follow a consistent pattern that's simpler than Dashboard or Community.

**Independent Test**: Navigate to a Space and select the Knowledge Base tab (or any custom tab). Tag cloud filtering works. Callout list in sidebar is searchable. Create button appears for authorized users.

**Acceptance Scenarios**:

1. **Given** a user views a custom tab, **When** the content loads, **Then** the sidebar shows the tab description and a searchable callout list
2. **Given** a user has callout creation permission, **When** the tab renders, **Then** a "Create" button is visible and triggers the callout creation dialog (reused MUI dialog)
3. **Given** callouts have tag metadata, **When** the tag cloud renders, **Then** tags are displayed as selectable chips and clicking a tag filters the visible callouts
4. **Given** multiple tags are selected, **When** a user clicks "Clear filter", **Then** all filters are removed and all callouts are visible
5. **Given** a space has 6 Innovation Flow states, **When** tabs 5 and 6 render, **Then** each shows only the callouts classified under its respective flow state

---

### User Story 6 - Tab Action Buttons (Priority: P2)

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

### User Story 7 - About Page (Priority: P3)

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

### User Story 8 - Responsive Mobile Experience (Priority: P3)

On mobile devices, the Space page adapts: the sidebar collapses (content flows into a single column), tab navigation moves to the bottom of the screen as a fixed bottom bar, and overflow actions (Activity, Video Call, Share, Settings) are accessible via a "More" drawer. The banner adapts to smaller viewports.

**Why this priority**: Mobile responsiveness is essential for accessibility but can be polished after the desktop experience is solid. The structural patterns established in P0-P2 inform the responsive breakpoints.

**Independent Test**: Open a Space page on a mobile viewport. Bottom navigation appears. All tabs are reachable. "More" drawer contains overflow actions. Content is readable without horizontal scrolling.

**Acceptance Scenarios**:

1. **Given** a mobile viewport, **When** a Space page loads, **Then** tab navigation renders as a fixed bottom bar
2. **Given** more actions than can fit in the bottom bar, **When** the "More" button is tapped, **Then** a drawer slides up with Activity, Video Call, Share, and Settings options
3. **Given** a mobile viewport, **When** any tab content renders, **Then** the sidebar content is either hidden or integrated into the single-column flow
4. **Given** a mobile viewport, **When** the banner renders, **Then** it adapts to the screen width without horizontal overflow
5. **Given** a mobile viewport, **When** the floating action buttons render, **Then** they do not overlap with the bottom navigation

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
- **FR-018**: The main content area MUST render callouts via composition (reusing existing callout rendering components)

#### Community Tab

- **FR-019**: The sidebar MUST display the tab description (with edit capability for authorized users)
- **FR-020**: The sidebar MUST show lead users and lead organizations with name, avatar, and location
- **FR-021**: The sidebar MUST include a "Contact Leads" action that triggers a messaging dialog
- **FR-022**: The sidebar MUST show an invite-contributors action when the user has invite privileges
- **FR-023**: The sidebar MUST show a Virtual Contributors section when the space has the VC entitlement and either has VCs assigned or the user can invite VCs
- **FR-024**: The sidebar MUST show a Community Guidelines block when guidelines are configured
- **FR-025**: The main content area MUST display member users and organizations in a wide card format (user cards hidden for unauthenticated visitors)
- **FR-026**: The main content area MUST render callouts via composition (reusing existing callout components)

#### Subspaces Tab

- **FR-027**: The sidebar MUST show the tab description and a create-subspace action (when the user has permission)
- **FR-028**: The sidebar MUST show a searchable list of subspace links (search field visible when >3 subspaces)
- **FR-029**: The main content area MUST display subspace cards in a grid layout with: banner image, name, tagline, tags, privacy indicator, membership indicator, and lead avatars
- **FR-030**: The subspace card grid MUST support tag-based filtering
- **FR-031**: Subspace cards MUST show a pin indicator when the space uses alphabetical sorting and the subspace is pinned
- **FR-032**: The main content area MUST render callouts via composition (reusing existing callout components)

#### Custom Tabs (Knowledge Base and beyond)

- **FR-033**: The sidebar MUST show the tab description with an edit action (for authorized users) and a "Create" action (for users with callout creation permission)
- **FR-034**: The sidebar MUST show a searchable list of callouts in the current tab
- **FR-035**: The main content area MUST display a tag cloud showing classification tags, with selectable chips and a clear-all action
- **FR-036**: Selecting tags in the tag cloud MUST filter the visible callouts to only those matching the selected tags
- **FR-037**: Each custom tab MUST display only the callouts classified under its corresponding Innovation Flow state
- **FR-038**: The main content area MUST render callouts via composition (reusing existing callout components)

#### Tab Actions

- **FR-039**: The tab navigation MUST include an Activity action that triggers the contribution history dialog
- **FR-040**: The tab navigation MUST include a Video Call action when the space has video calling enabled
- **FR-041**: The tab navigation MUST include a Share action that triggers the share dialog
- **FR-042**: The tab navigation MUST include a Settings action (visible only to users with update permission) that navigates to the space settings page

#### About Page

- **FR-043**: The About route (`/:spaceNameId/about`) MUST render a CRD page displaying: space name, tagline, description, location, metrics, lead users, lead organizations, host/provider organization, vision ("Why"), audience ("Who"), community guidelines, and external references
- **FR-044**: The About page MUST be accessible to users without space read access (public route)
- **FR-045**: The About page MUST include a Join/Apply action for non-members

#### Responsive Design

- **FR-046**: On desktop (>960px), tab navigation MUST render above the content with a sidebar + content area layout
- **FR-047**: On mobile (<=600px), tab navigation MUST render as a fixed bottom bar with a "More" drawer for overflow actions
- **FR-048**: On mobile, the sidebar MUST collapse so content flows in a single column
- **FR-049**: The banner MUST adapt to viewport width without horizontal overflow
- **FR-050**: Responsive padding MUST follow CRD conventions (compact on mobile, spacious on desktop)

#### Architecture & Coexistence

- **FR-051**: All CRD Space components in `src/crd/` MUST have zero MUI or Emotion imports
- **FR-052**: Data mapping from the data layer to CRD component props MUST happen in the integration layer (`src/main/crdPages/space/`)
- **FR-053**: Existing MUI callout rendering components MUST be usable via composition slots in the integration layer (not imported into `src/crd/`)
- **FR-054**: Existing MUI dialogs (Activity, Video Call, Share, Direct Message, Application, Create Subspace, Calendar, Updates, Welcome, About) MUST be reusable from the integration layer via callbacks
- **FR-055**: The feature toggle (`alkemio-crd-enabled` in localStorage) MUST gate CRD vs MUI rendering for Space L0 routes
- **FR-056**: CRD and MUI versions of the Space page MUST coexist without CSS conflicts or console errors

#### Accessibility

- **FR-057**: Tab navigation MUST be keyboard-accessible (arrow keys to navigate, Enter/Space to select)
- **FR-058**: All interactive elements MUST be semantic `<a>` or `<button>` elements
- **FR-059**: All interactive elements MUST have visible focus indicators
- **FR-060**: Icon-only action buttons MUST have descriptive `aria-label` attributes
- **FR-061**: The active tab MUST be indicated via `aria-selected` or equivalent accessible state
- **FR-062**: All user-visible strings MUST use the translation system (no hardcoded text)
- **FR-063**: Color contrast MUST meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- **FR-064**: Loading states MUST use appropriate ARIA attributes (`role="status"`, `aria-busy`)

### Key Entities

- **SpacePageData**: Core space identity for the page shell -- name, tagline, banner visual (URL), avatar, visibility status (Active/Archived/Demo/Inactive), level (L0), whether it is the user's home space, and the user's membership status
- **SpaceTab**: A single tab in the navigation -- positional index, display label (from Innovation Flow state or default), description text, whether it is a default tab or custom, and its associated Innovation Flow state identifier
- **SpaceLead**: A lead user or organization -- name, avatar URL, type (person or organization), location (city/country)
- **SpaceMember**: A community member -- name, avatar URL, type (user or organization), location, tagline, tags
- **SubspaceCardData**: Data for a subspace card -- id, name, tagline, banner image URL, tags, privacy status, membership status, pinned status, lead users/organizations, navigation href
- **SpaceAboutData**: Full space details for the About page -- description, "who" text, "why" text, location, metrics (name-value pairs), provider/host organization, lead users, lead organizations, community guidelines, external references
- **CalendarEvent**: An event in the space calendar -- title, start date, duration, whether it is a whole-day event
- **SpaceMetric**: A key-value metric about the space -- name (e.g., "members") and value

## Assumptions

1. The CrdLayout (header/footer) and CRD primitives from 039 are stable and reusable
2. The feature toggle mechanism (`useCrdEnabled`) works the same way as for the Explore Spaces page
3. Innovation Flow states are always available when a space loads (the query is reliable)
4. The existing callout rendering components (CalloutsGroupView, CalloutView) can be rendered inside the CRD page layout via composition without CSS conflicts
5. The existing MUI dialogs can be triggered via state/callbacks from the CRD integration layer
6. Subspace cards can reuse or extend the SpaceCard CRD component from 039
7. The About page is a full-page CRD view, not an overlay dialog (the SpaceAboutDialog triggered from Dashboard remains MUI)
8. No new backend APIs or GraphQL schema changes are needed -- all data is already available via existing queries
9. The `?tab=N` URL parameter scheme is preserved exactly (1-based indexing, same parameter name)
10. Tab positions are stable: position 0=Dashboard, 1=Community, 2=Subspaces, 3=Knowledge Base, 4+=Custom

## Success Criteria

### Measurable Outcomes

- **SC-001**: The full CRD Space L0 page shell renders with zero MUI layout elements visible on any default or custom tab
- **SC-002**: 100% data parity with the MUI version -- all information visible on the MUI Space page is also visible on the CRD version
- **SC-003**: No console errors when navigating between CRD Space pages, MUI pages, and back
- **SC-004**: Custom Innovation Flow tab names render correctly for spaces with non-default configurations
- **SC-005**: All tab content (Dashboard, Community, Subspaces, Custom) renders correctly with proper sidebar/content layout
- **SC-006**: The page is fully functional on mobile, tablet, and desktop viewports without horizontal overflow or unreachable content
- **SC-007**: All CRD components in `src/crd/` have zero MUI or Emotion imports (verifiable via automated grep)
- **SC-008**: Every CRD component passes the component checklist from `src/crd/CLAUDE.md`
- **SC-009**: The migration pattern is documented and reproducible for future Space L1/L2 page migrations
- **SC-010**: Performance is equal to or better than the MUI version (no additional network requests, no slower initial render)
