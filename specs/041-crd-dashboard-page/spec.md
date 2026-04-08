# Feature Specification: Dashboard (/home) CRD Migration

**Feature Branch**: `041-crd-dashboard-page`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "Migrate the /home dashboard page from MUI to the CRD design system (shadcn/ui + Tailwind), following the same pattern used for the /spaces page migration."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated User with Memberships Views Dashboard (Priority: P1)

An authenticated user who belongs to one or more spaces navigates to `/home` with CRD enabled. They see a modern dashboard with a horizontal row of their recent spaces (including their pinned home space), a left sidebar with navigation menu and resource lists, and a two-column activity feed showing both space-level activity and their personal contributions. The layout, interactions, and information density match the current MUI dashboard but use the new CRD design system.

**Why this priority**: This is the primary dashboard experience used by the majority of active users. It contains the most components and complexity.

**Independent Test**: Can be fully tested by enabling CRD toggle, logging in as a user with space memberships, and verifying all dashboard sections render with correct data and interactions.

**Acceptance Scenarios**:

1. **Given** an authenticated user with space memberships and CRD enabled, **When** they navigate to `/home`, **Then** they see the CRD dashboard with RecentSpaces row, DashboardSidebar, and two-column ActivityFeeds rendered in the CRD design system (Tailwind/shadcn)
2. **Given** the CRD dashboard is displayed, **When** the user clicks a recent space card, **Then** they navigate to that space's page
3. **Given** the CRD dashboard is displayed, **When** the user clicks "Explore all your Spaces", **Then** the MyMembershipsDialog opens showing an expandable tree of all their space memberships
4. **Given** the CRD dashboard is displayed, **When** the user toggles the Activity View switch OFF, **Then** the two-column activity feeds are replaced by hierarchical DashboardSpaces cards showing parent spaces with their subspaces
5. **Given** the CRD dashboard is displayed, **When** the user changes the Space or Role filter dropdown in the activity feed, **Then** the activity feed updates to show only matching activity items
6. **Given** the CRD dashboard is displayed, **When** the user clicks "Show more" on either activity column, **Then** the corresponding activity dialog opens showing the full scrollable feed

---

### User Story 2 - Sidebar Navigation and Resource Lists (Priority: P1)

An authenticated user interacts with the dashboard sidebar. The sidebar shows a navigation menu (Invitations with badge count, Tips & Tricks, My Account, Create Space), an Activity View toggle, and lists of the user's resources organized by type: My Spaces, Virtual Contributors, Innovation Hubs, and Innovation Packs.

**Why this priority**: The sidebar is the primary navigation hub on the dashboard and is present in both the "with memberships" and "without memberships" views.

**Independent Test**: Can be tested by verifying each sidebar menu item triggers the correct action (dialog, navigation, toggle) and that resource lists display correct items with working links.

**Acceptance Scenarios**:

1. **Given** the sidebar is displayed, **When** the user clicks "Invitations", **Then** the PendingMembershipsDialog opens (handled globally)
2. **Given** the sidebar is displayed, **When** the user clicks "Tips & Tricks", **Then** the TipsAndTricksDialog opens showing a list of tips with a "Find more" link to `/forum`
3. **Given** the sidebar is displayed, **When** the user clicks "My Account", **Then** they navigate to their account settings page
4. **Given** the sidebar is displayed, **When** the user clicks "Create Space", **Then** they navigate to the space creation page
5. **Given** the user has pending invitations, **When** the sidebar loads, **Then** the Invitations menu item shows a badge with the count of pending invitations
6. **Given** the sidebar is displayed, **When** the user views the resource sections, **Then** they see their spaces, VCs, innovation hubs, and innovation packs listed with avatars and names, each linking to the respective resource page

---

### User Story 3 - Authenticated User without Memberships (Priority: P2)

An authenticated user who has no space memberships navigates to `/home` with CRD enabled. They see a compact sidebar, their resources (if any), pending invitations with accept/decline actions, an explore spaces section to discover public spaces, a "Create your own Space" call-to-action, and contextual banners (release notes, VC campaign if eligible).

**Why this priority**: This is the onboarding experience for new users. Important for user retention but affects fewer users than the main dashboard.

**Independent Test**: Can be tested by logging in as a user with no space memberships and verifying the simplified dashboard renders with explore spaces, invitations, and create space CTA.

**Acceptance Scenarios**:

1. **Given** an authenticated user with no memberships and CRD enabled, **When** they navigate to `/home`, **Then** they see the simplified dashboard with compact sidebar, ExploreSpaces, InvitationsBlock, and Create Space CTA
2. **Given** the user has pending invitations, **When** they click "Accept" on an invitation, **Then** the invitation is accepted and they navigate to the space
3. **Given** the user has pending invitations, **When** they click "Decline" on an invitation, **Then** the invitation is declined and removed from the list
4. **Given** the user is eligible for the VC campaign (has required role and entitlement), **When** the dashboard loads, **Then** the CampaignBanner is displayed with a CTA to create a Virtual Contributor

---

### User Story 4 - Unauthenticated User Views Dashboard (Priority: P2)

A visitor who is not logged in navigates to `/home` with CRD enabled. They see a public space explorer (reusing the existing CRD SpaceExplorer component) and a Sign Up button encouraging registration.

**Why this priority**: Important for discoverability and user acquisition, but simpler than authenticated views.

**Independent Test**: Can be tested by navigating to `/home` without logging in and verifying the SpaceExplorer and Sign Up button render correctly.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user with CRD enabled, **When** they navigate to `/home`, **Then** they see the CRD SpaceExplorer showing public spaces and a Sign Up button
2. **Given** the unauthenticated dashboard is displayed, **When** the user clicks "Sign Up", **Then** they are directed to the registration page

---

### User Story 5 - Dashboard Dialogs (Priority: P2)

Users can open various dialogs from the dashboard: TipsAndTricks (tips list with links), MyActivity (full personal activity feed), MySpaceActivity (full space activity feed with role filter), and MyMembershipsDialog (expandable space tree). The `?dialog=invitations` URL parameter auto-opens the PendingMembershipsDialog on page load.

**Why this priority**: Dialogs extend the dashboard's functionality but are secondary to the main dashboard rendering.

**Independent Test**: Can be tested by triggering each dialog via its sidebar menu item or "Show more" link and verifying correct content and interactions.

**Acceptance Scenarios**:

1. **Given** the dashboard is displayed, **When** the user opens the TipsAndTricks dialog, **Then** they see a list of tips with avatar, title, description, and link, plus a "Find more" link to `/forum`
2. **Given** the dashboard is displayed, **When** the user opens the MyActivity dialog, **Then** they see their full personal activity feed with space filter and scrollable activity items
3. **Given** the dashboard is displayed, **When** the user opens the MySpaceActivity dialog, **Then** they see the full space activity feed with space and role filters
4. **Given** the dashboard is displayed, **When** the user opens the MyMembershipsDialog, **Then** they see an expandable tree of spaces with role badges, expand/collapse controls, and links to each space
5. **Given** a URL with `?dialog=invitations`, **When** the page loads, **Then** the PendingMembershipsDialog opens automatically

---

### User Story 6 - CRD Toggle and MUI Fallback (Priority: P3)

The CRD dashboard is gated behind a localStorage toggle (default OFF). When CRD is disabled, the existing MUI dashboard renders unchanged. Both versions are lazy-loaded so only the active version's chunk is fetched.

**Why this priority**: The toggle mechanism is infrastructure that enables safe rollout. It follows an established pattern from the spaces page migration.

**Independent Test**: Can be tested by toggling CRD on/off and verifying the correct version renders each time without errors.

**Acceptance Scenarios**:

1. **Given** CRD is disabled (default), **When** the user navigates to `/home`, **Then** the existing MUI dashboard renders unchanged
2. **Given** CRD is enabled, **When** the user navigates to `/home`, **Then** the new CRD dashboard renders
3. **Given** CRD is toggled from enabled to disabled, **When** the page reloads, **Then** the MUI dashboard renders without errors or visual artifacts

---

### User Story 7 - Responsive Layout (Priority: P3)

The CRD dashboard adapts to different screen sizes. On mobile/small screens, the sidebar collapses to a top menu. Activity feeds stack vertically instead of side-by-side. Recent space cards scroll horizontally.

**Why this priority**: Responsive behavior is important for mobile users but is secondary to core functionality on desktop.

**Independent Test**: Can be tested by resizing the browser window and verifying layout changes at breakpoints.

**Acceptance Scenarios**:

1. **Given** a mobile-width viewport, **When** the dashboard loads, **Then** the sidebar collapses to an expandable top menu
2. **Given** a mobile-width viewport, **When** the dashboard loads, **Then** the two activity columns stack vertically
3. **Given** a tablet-width viewport, **When** the dashboard loads, **Then** the recent spaces row scrolls horizontally

---

### Edge Cases

- What happens when the user has no recent spaces but has memberships? The RecentSpaces row shows only the home space card (or placeholder if no home space is set).
- What happens when activity feeds return empty results? An empty state message is displayed within each feed column.
- What happens when the home space is set but the space no longer exists or the user lost access? The home space card gracefully handles missing data and shows a placeholder.
- What happens when pending invitations are accepted/declined while the dashboard is open? The invitation is removed from the InvitationsBlock and the badge count in the sidebar updates.
- What happens when the `?dialog=invitations` URL parameter is present but the user has no pending invitations? The dialog opens with an empty state message.
- What happens when a release notes banner is dismissed? It stays dismissed across page reloads (persisted in localStorage).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a CRD dashboard at `/home` when the CRD toggle is enabled, using Tailwind CSS and shadcn/ui components exclusively (no MUI imports)
- **FR-002**: System MUST render the existing MUI dashboard at `/home` when the CRD toggle is disabled (default behavior preserved)
- **FR-003**: Dashboard MUST display three conditional views based on authentication and membership state: unauthenticated, authenticated without memberships, and authenticated with memberships
- **FR-004**: The "with memberships" view MUST display a horizontal row of up to 4 recent space cards with the user's home space (or placeholder), each linking to the space page
- **FR-005**: The "with memberships" view MUST display an "Explore all your Spaces" link that opens the MyMembershipsDialog showing an expandable tree of all space memberships
- **FR-006**: Dashboard MUST display a sidebar with navigation menu items: Invitations (with pending count badge), Tips & Tricks, My Account, Create Space, and Activity View toggle
- **FR-007**: The sidebar MUST display the user's resources in four sections: My Spaces, Virtual Contributors, Innovation Hubs, and Innovation Packs, each with avatar and name linking to the resource page
- **FR-008**: The "with memberships" view MUST display two-column activity feeds: "Latest Activity in my Spaces" (filterable by Space and Role) and "My Latest Activity" (filterable by Space), each with "Show more" links opening full-feed dialogs
- **FR-009**: The "with memberships" view MUST support an Activity View toggle (persisted in localStorage): when ON, show RecentSpaces row plus two-column activity feeds below; when OFF, show only RecentSpaces row (clean view). Activity dialogs are accessible from the sidebar menu when the toggle is OFF
- **FR-010**: The "without memberships" view MUST display an InvitationsBlock with accept/decline actions for pending space invitations
- **FR-011**: The "without memberships" view MUST display an ExploreSpaces section (reusing the existing CRD SpaceExplorer component with responsive grid matching the dashboard layout) and pending invitations (only when invitations exist)
- **FR-012**: Dashboard MUST support four page-level dialogs: TipsAndTricksDialog, MyActivityDialog, MySpaceActivityDialog, and MyMembershipsDialog
- **FR-013**: The unauthenticated view MUST display the CRD SpaceExplorer for public spaces and a Sign Up button
- **FR-014**: Dashboard MUST display a dismissible ReleaseNotesBanner when a latest release discussion exists and has not been dismissed
- **FR-015**: Dashboard MUST display a CampaignBanner for users with the PlatformVcCampaign role and AccountVirtualContributor entitlement, with a CTA that triggers the VirtualContributorWizard (remains MUI)
- **FR-016**: Dashboard MUST handle the `?dialog=invitations` URL parameter by auto-opening the PendingMembershipsDialog on page load
- **FR-017**: All user-visible text MUST use the `crd-dashboard` i18n namespace with translations provided in English, Dutch, Spanish, Bulgarian, German, and French
- **FR-018**: The CRD dashboard page component MUST NOT import from `@mui/*` or `@emotion/*`
- **FR-019**: All CRD components MUST be purely presentational: no GraphQL, no routing, no auth, no business logic -- all data and callbacks received as props
- **FR-020**: The dashboard layout MUST be responsive: sidebar collapses on mobile, activity columns stack vertically, space cards scroll horizontally
#### Accessibility (WCAG 2.1 AA)

- **FR-021**: All interactive elements (links, buttons, toggles, filter dropdowns) MUST be operable via keyboard alone, with a visible focus indicator that meets a minimum 3:1 contrast ratio against adjacent colors
- **FR-022**: The sidebar navigation MUST use a `<nav>` landmark with an accessible label (e.g., `aria-label="Dashboard navigation"`), and menu items MUST be rendered as `<a>` or `<button>` elements -- never `<div>` with click handlers
- **FR-023**: Icon-only buttons (e.g., expand/collapse in the memberships tree, dismiss on banners) MUST have an `aria-label` describing their action (e.g., `aria-label="Expand subspaces"`, `aria-label="Dismiss banner"`)
- **FR-024**: The Activity View toggle (Switch) MUST be associated with a visible label via `id`/`htmlFor` and announce its state to screen readers (e.g., "Activity View, on/off")
- **FR-025**: Filter dropdowns in the activity feeds MUST use the shadcn `Select` primitive, which provides built-in `role="combobox"` semantics, and each MUST have a visible `<label>` or `aria-label` (e.g., "Filter by space", "Filter by role")
- **FR-026**: The RecentSpaces horizontal scroll container MUST be keyboard-navigable: users MUST be able to Tab to individual space cards, and the container MUST NOT trap focus
- **FR-027**: All dialogs (TipsAndTricks, MyActivity, MySpaceActivity, MyMemberships) MUST trap focus while open, return focus to the trigger element on close, and be dismissible via the Escape key
- **FR-028**: The expandable space tree in MyMembershipsDialog MUST use `aria-expanded` on expand/collapse controls and group child items so screen readers announce the tree structure (e.g., "Space A, expanded, 3 subspaces")
- **FR-029**: The Invitations block accept/decline buttons MUST have accessible names that include the space name (e.g., `aria-label="Accept invitation to Space X"`, `aria-label="Decline invitation to Space X"`)
- **FR-030**: The pending invitations badge count on the sidebar MUST be conveyed to screen readers (e.g., via `aria-label="Invitations, 3 pending"` or visually hidden text)
- **FR-031**: All text content MUST meet a minimum 4.5:1 contrast ratio against its background (3:1 for large text, 18px+ bold or 24px+ regular), using the CRD design system's color tokens
- **FR-032**: Activity feed items MUST convey their full content to screen readers: user name, action performed, target entity, and timestamp -- without relying solely on visual layout to group related information
- **FR-033**: The dashboard MUST define landmark regions: `<main>` for the primary content area, `<nav>` for the sidebar, and `<aside>` for supplementary sections (banners, campaigns) -- enabling screen reader users to jump between regions
- **FR-034**: Loading and empty states MUST be announced to assistive technology: skeleton loaders MUST use `aria-busy="true"` on their container, and empty state messages MUST use `role="status"` or an equivalent live region

### Key Entities

- **RecentSpace**: A space the user has recently visited -- displayed as a compact card with banner image, name, privacy indicator, and link
- **ActivityItem**: A single activity event -- user avatar, action description, target entity (space/callout), and relative timestamp
- **SidebarResource**: A user-owned resource (space, VC, hub, or pack) -- avatar/initials, display name, and URL
- **MembershipTreeNode**: A space in the user's membership hierarchy -- name, avatar, role badges, expandable child spaces
- **Invitation**: A pending community invitation -- sender info, space name, role offered, accept/decline actions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three dashboard views (unauthenticated, without memberships, with memberships) render correctly with CRD enabled, with zero MUI component imports in the CRD code path
- **SC-002**: Users can access all 26 navigation paths (space links, sidebar actions, dialog triggers, CTAs) from the CRD dashboard, matching the current MUI dashboard's functionality
- **SC-003**: All 4 page-level dialogs (TipsAndTricks, MyActivity, MySpaceActivity, MyMemberships) open correctly from their respective triggers and display appropriate content
- **SC-004**: The Activity View toggle switches between activity feeds and DashboardSpaces views without page reload
- **SC-005**: Activity feed filters (Space, Role) update the displayed items immediately upon selection
- **SC-006**: The dashboard is fully usable on mobile viewports (360px+) with sidebar collapsed to top menu and single-column activity layout
- **SC-007**: Toggling CRD off renders the existing MUI dashboard with zero regressions -- all existing functionality preserved
- **SC-008**: All existing unit tests continue to pass and the build succeeds with zero new errors
- **SC-009**: CRD components achieve WCAG 2.1 AA compliance: all interactive elements are keyboard-navigable and screen-reader accessible

## Scope Boundary

### In Scope
- `MyDashboard` branching controller and all three conditional views
- All sub-components: RecentSpaces, DashboardSidebar, ActivityFeeds (two-column), MyResources, CampaignBlock, ReleaseNotesBanner, InvitationsBlock, DashboardSpaces
- All page-level dialogs: TipsAndTricks, MyActivity, MySpaceActivity, MyMembershipsDialog
- New CRD presentational components
- Integration page, data mappers, and data hooks
- New `crd-dashboard` i18n namespace with 6 language files
- Route toggle wiring in `TopLevelRoutes.tsx`
- Primitives to port: Switch, ScrollArea (if needed)

### Out of Scope
- `InnovationHubHomePage` (separate ticket)
- `VirtualContributorWizard` (stays MUI, invoked via callback from CRD)
- `DirectMessageDialog`, `SearchDialog`, `PendingMembershipsDialog`, `CreateSpaceDialog` (global dialogs, not page-specific)
- GraphQL schema or query changes (all existing hooks reused as-is)
- Changes to the MUI dashboard (it remains unchanged as the default)

## Design Decisions (Resolved)

- **Activity View vs Spaces View toggle**: Keep both views. Migrate both the activity feed view and the hierarchical DashboardSpaces view. Toggle preserved.
- **Sidebar resources scope**: All 4 resource types. Sidebar includes spaces, VCs, innovation hubs, and innovation packs (extends beyond prototype).
- **InnovationHubHomePage**: Separate ticket. This ticket covers only the `MyDashboard` branch.

## Components Missing from Prototype

The following components have no prototype (Figma) reference and must be designed from scratch in CRD style:

- **DashboardSpaces view** (High): Hierarchical space cards with subspaces, shown when Activity View is toggled OFF
- **MyResources sidebar sections for Innovation Hubs and Packs** (Medium): Prototype only covers spaces and VCs
- **MyMembershipsDialog / ExpandableSpaceTree** (Medium): Expandable tree view with role badges and expand/collapse controls
- **CampaignBanner** (Low): Simple banner with CTA for VC creation
- **ReleaseNotesBanner** (Low): Dismissible banner with release notes content
- **HomeSpacePlaceholder** (Low): Dashed-border placeholder card for unset home space

## Assumptions

- The CRD toggle mechanism and `CrdLayoutWrapper` are already implemented and working from the spaces page migration
- All 16 GraphQL hooks used by the current MUI dashboard are stable and can be reused without modification
- The CRD header and footer (layout shell) are already migrated and functional
- The `SpaceExplorer` CRD component can be reused as-is for the unauthenticated and without-memberships views
- Global dialogs (PendingMemberships, DirectMessage, Search) will continue to work within the CRD layout wrapper
- The VirtualContributorWizard can be invoked from CRD via a callback prop without MUI dependency leaking into CRD components
- Prototype components in `prototype/src/app/components/dashboard/` are usable as visual and structural references for building CRD components
