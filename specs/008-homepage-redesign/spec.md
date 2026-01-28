# Feature Specification: Homepage Redesign

**Feature Branch**: `008-homepage-redesign`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Implement the new Homepage design according to the provided Figma design"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Homepage with Simplified Header (Priority: P1)

When a user navigates to the homepage (`/home`), they see a clean, simplified header containing only the platform menu without any banner or background visuals. This creates a more focused, distraction-free entry point to the platform.

**Why this priority**: The header is the first visual element users encounter. A simplified header is foundational to the new design language and must be implemented before other layout changes can be properly evaluated.

**Independent Test**: Can be fully tested by navigating to `/home` and verifying the header shows only the platform menu, with no banner or decorative backgrounds. Delivers immediate visual improvement and reduced cognitive load for users.

**Acceptance Scenarios**:

1. **Given** a user is on any page in the application, **When** they navigate to `/home`, **Then** the header displays only the platform menu without banner or background visuals
2. **Given** a user is on `/home`, **When** they navigate to any other route, **Then** the header on that route remains unchanged with its existing design (banner, breadcrumbs, etc.)
3. **Given** a user is viewing `/home` on mobile viewport, **When** the page loads, **Then** the simplified header renders correctly without layout issues

---

### User Story 2 - View Activity Dashboard with Spaces Section Prioritized (Priority: P2)

When a user views the homepage activity dashboard, they see the Spaces section positioned prominently above both the info column and content column. The layout uses a special grid: the first space card takes exactly the grid width of the left column (3 columns), and the remaining space cards are distributed across the content column width (3 cards at 3 columns each). On mobile, only 1 card is shown.

**Why this priority**: The Spaces section contains the user's primary navigation targets. Elevating it with proper visual alignment improves information hierarchy and reduces time to key actions. This can be independently tested after the header simplification.

**Independent Test**: Can be fully tested by loading `/home` and verifying the Spaces section renders above the info and content columns with correct grid alignment: first card matches InfoColumn width (3 columns), remaining cards fill ContentColumn (3 columns each). Delivers improved navigation efficiency and clearer visual hierarchy.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on `/home`, **When** the activity dashboard loads, **Then** the Spaces section appears above both infoColumn and contentColumn with first card using 3 columns and subsequent cards using 3 columns each
2. **Given** an authenticated user with multiple space memberships is on `/home`, **When** viewing the dashboard, **Then** the first space card aligns with the InfoColumn width and remaining visible spaces align with ContentColumn width (3 cards across 9 columns)
3. **Given** a user is on `/home` with a narrow viewport (mobile), **When** the activity dashboard renders, **Then** the Spaces section shows only 1 card at full width (4 columns on mobile grid)

---

### User Story 3 - Browse Grouped Resources in InfoColumn (Priority: P3)

When a user views the InfoColumn on the homepage, they see resources organized into clear, labeled groups: Spaces, VirtualContributors, and InnovationPacks. Each group is visually distinct and contains only its relevant resources.

**Why this priority**: Resource grouping improves scannability and reduces cognitive load, but is less critical than header simplification and dashboard layout. It can be implemented and tested independently after the structural changes.

**Independent Test**: Can be fully tested by loading `/home` and verifying the InfoColumn displays three distinct groups with proper titles and correct resource types. Delivers improved content organization and findability.

**Acceptance Scenarios**:

1. **Given** a user is on `/home`, **When** the InfoColumn loads, **Then** three distinct resource groups are displayed with titles: "Starting pages", "Spaces", "VirtualContributors", and "InnovationPacks" (shown only if any). In the same place as now under the menu.
2. **Given** a user is viewing the InfoColumn on `/home`, **When** examining each group, **Then** each group contains only resources of its designated type
3. **Given** a user has access to multiple resource types, **When** viewing the InfoColumn, **Then** resources appear in their designated groups in the order: Spaces, VirtualContributors, InnovationPacks
4. **Given** a user is on `/home` with an empty resource type, **When** viewing that group in the InfoColumn, **Then** the group either shows an appropriate empty state or is hidden entirely

---

### Edge Cases

- What happens when a user navigates directly to `/home` via URL versus using in-app navigation?
- How does the simplified header handle browser back/forward navigation between `/home` and other routes?
- What happens when a user resizes their browser window while on `/home`?
- How does the layout handle very long space names or resource titles?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST render a simplified header on the `/home` route that displays only the platform menu
- **FR-002**: System MUST remove the banner and background visuals from the header on the `/home` route
- **FR-003**: System MUST preserve existing header implementations on all routes other than `/home`
- **FR-004**: System MUST position the Spaces section above both infoColumn and contentColumn in the ActivityDashboard layout on `/home`
- **FR-005**: System MUST group resources in the InfoColumn under three distinct sections: Spaces, VirtualContributors, and InnovationPacks
- **FR-006**: System MUST display group titles for each resource section in the InfoColumn
- **FR-007**: System MUST maintain the order of resource groups: Spaces first, VirtualContributors second, InnovationPacks third
- **FR-008**: System MUST preserve existing resource item components and their behaviors unless explicitly required by the Figma design
- **FR-009**: System MUST match spacing, hierarchy, and visual grouping as specified in the Figma design reference
- **FR-010**: System MUST ensure the homepage layout changes do not cause breaking changes to shared layout components used on other routes
- **FR-011**: System MUST handle responsive behavior for all layout changes (simplified header, repositioned Spaces section, grouped resources)

### Design Reference

Figma Design: https://www.figma.com/design/urACTDAZyc5ACExQw0EhPD/Home-Space?node-id=1-7&m=dev

### Assumptions

- The platform menu component is already implemented and can be reused in the simplified header
- Existing resource item components support being grouped under section titles without modification
- The ActivityDashboard layout supports reordering of sections through composition or props
- Route-specific layout overrides can be implemented without affecting global layout components
- The Figma design has been reviewed and approved by stakeholders
- Empty resource groups should be handled by either hiding the group or showing an appropriate empty state (to be determined during implementation)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users navigating to `/home` see a visually simplified header matching the Figma design within 500ms of page load
- **SC-002**: 100% of routes other than `/home` maintain their existing header appearance with no visual regressions
- **SC-003**: The Spaces section appears above info and content columns on `/home` for all authenticated users
- **SC-004**: Resource groups in InfoColumn are visually distinct with clear section titles, improving content scannability
- **SC-005**: The homepage layout adapts correctly to mobile, tablet, and desktop viewports without breaking component boundaries
- **SC-006**: No accessibility regressions: keyboard navigation, screen readers, and ARIA labels continue to function correctly on `/home`
- **SC-007**: Page performance remains consistent: Largest Contentful Paint (LCP) on `/home` does not increase by more than 100ms compared to current implementation
- **SC-008**: Visual comparison testing confirms spacing and hierarchy match the Figma design within acceptable tolerance (±4px for spacing, exact match for layout structure)
