# Feature Specification: CRD Spaces Page Migration

**Feature Branch**: `039-crd-spaces-page`
**Created**: 2026-03-26
**Status**: Draft
**Input**: Migrate the /spaces page from MUI to shadcn/ui as the first PoC for the CRD (Client Re-Design) migration strategy.

## Context

This is the **proof of concept** for the CRD migration — the systematic replacement of MUI-based UI with shadcn/ui + Tailwind CSS. The `/spaces` page was chosen because it is relatively simple (a filterable grid of cards), has a complete prototype in `prototype/src/app/pages/BrowseSpacesPage.tsx`, and exercises the full migration pipeline: primitives, composites, layout, data mapping, and routing toggle.

### Prototype-to-Production Mapping

The prototype (`prototype/`) is auto-generated from Figma Make. Key differences from production:
- Prototype uses hardcoded mock data; production uses GraphQL via Apollo
- Prototype has no i18n; production uses `react-i18next`
- Prototype uses `react-router` `<Link>`; CRD components receive `href`/`onClick` props instead
- Prototype components live in `prototype/src/app/components/`; production CRD components go to `src/crd/`

| Prototype Component | CRD Target | Purpose |
| --- | --- | --- |
| `prototype/src/app/components/space/SpaceCard.tsx` | `src/crd/components/space/SpaceCard.tsx` | Individual space card |
| `prototype/src/app/pages/BrowseSpacesPage.tsx` | `src/crd/components/space/SpaceExplorer.tsx` | Spaces listing with search/filter |
| `prototype/src/app/components/ui/*` | `src/crd/primitives/*` | shadcn/ui atoms (Button, Badge, Avatar, Input, Select, etc.) |

### Current Production Architecture

The existing `/spaces` page follows this data flow:
1. **Route**: `TopLevelRoutes.tsx` → `/spaces` → `SpaceExplorerPage`
2. **Page**: `SpaceExplorerPage.tsx` → wraps in `TopLevelPageLayout` + calls `useSpaceExplorer()` hook
3. **Hook**: `useSpaceExplorer.ts` → orchestrates multiple GraphQL queries (all spaces, member spaces, search, subspaces)
4. **View**: `SpaceExplorerView.tsx` → renders search input, filter buttons, card grid with lazy loading
5. **Card**: `SpaceCard.tsx` → renders individual space card (MUI Paper, Box, Typography, etc.)

The data layer (steps 1-3) remains untouched. Only the view layer (steps 4-5) gets a CRD alternative.

---

## User Scenarios & Testing

### User Story 1 — Browse Spaces with New Design (Priority: P1)

A user navigates to `/spaces` and sees the spaces listing rendered with the new shadcn/ui design system instead of MUI. The page shows the same data, same functionality (search, filter, pagination), but with the new visual design from the prototype.

**Why this priority**: This is the core deliverable — proving that a CRD page can replace an MUI page while reusing the existing data layer.

**Independent Test**: Navigate to `/spaces` with CRD mode enabled. Verify all spaces load, cards render with correct data (name, description, banner, tags, leads, privacy badge, member count), and the page is visually consistent with the prototype.

**Acceptance Scenarios**:

1. **Given** the user has CRD mode enabled, **When** they navigate to `/spaces`, **Then** the page renders using shadcn/ui components from `src/crd/` with no MUI components visible
2. **Given** the spaces list loads, **When** cards are displayed, **Then** each card shows: banner image, space name, tagline, tags, member count, lead avatars, and privacy indicator — matching the data from the existing GraphQL queries
3. **Given** the CRD page is loaded, **When** the user searches by tags, **Then** spaces are filtered using the same search logic as the MUI version
4. **Given** the CRD page is loaded, **When** the user scrolls or clicks "Load More", **Then** additional spaces load via the existing pagination mechanism

---

### User Story 2 — Toggle Between MUI and CRD Modes (Priority: P1)

A developer or tester can switch between the MUI (current) and CRD (new) rendering of the `/spaces` page without code changes, to compare behavior and validate parity.

**Why this priority**: The toggle mechanism is foundational infrastructure for the entire CRD migration — every subsequent page migration will reuse it. It must be in place before any CRD page can ship.

**Independent Test**: Toggle between MUI and CRD modes. Verify both modes render the `/spaces` page correctly with the same data.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the user activates the CRD toggle, **Then** the `/spaces` page re-renders using CRD components without a full page reload
2. **Given** CRD mode is active, **When** the user deactivates it, **Then** the page reverts to the MUI version
3. **Given** a fresh session with no toggle state, **When** the user visits `/spaces`, **Then** the MUI version is shown (MUI is the default)
4. **Given** the toggle state is set, **When** the user navigates away and returns to `/spaces`, **Then** the selected mode persists within the session

---

### User Story 3 — Responsive Space Cards (Priority: P2)

The CRD spaces page adapts to different screen sizes, displaying the card grid responsively — more columns on wide screens, fewer on narrow screens, with cards that maintain readability at all sizes.

**Why this priority**: The prototype already defines responsive behavior via CSS Grid with `auto-fill` columns. Matching this in production ensures the CRD page is usable across devices.

**Independent Test**: Resize the browser window from mobile to desktop widths. Verify the card grid reflows correctly and cards remain readable at all breakpoints.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (>1200px), **When** spaces load, **Then** the grid displays 3-4 cards per row
2. **Given** a tablet viewport (768-1200px), **When** spaces load, **Then** the grid displays 2-3 cards per row
3. **Given** a mobile viewport (<768px), **When** spaces load, **Then** cards stack in a single column
4. **Given** any viewport size, **When** a card is displayed, **Then** the banner image, name, and tagline are fully visible without horizontal overflow

---

### User Story 4 — Loading and Empty States (Priority: P2)

The CRD spaces page shows appropriate skeleton loading states while data is being fetched and a meaningful empty state when no spaces match the current filters.

**Why this priority**: Loading and empty states are essential for perceived performance and usability, preventing confusion when the page appears blank.

**Independent Test**: Throttle the network to observe loading states. Apply filters that return no results to observe the empty state.

**Acceptance Scenarios**:

1. **Given** spaces data is loading, **When** the page renders, **Then** skeleton cards are shown matching the card layout
2. **Given** a search returns no results, **When** the empty state renders, **Then** a descriptive message and icon are displayed (matching the prototype's empty state)
3. **Given** the user clears filters, **When** results become available again, **Then** the empty state is replaced with actual cards

---

### Edge Cases

- What happens when a space has no banner image? Show a fallback with initials/avatar color, as defined in the prototype's SpaceCard
- What happens when a space has no leads? Show the card without the leads section
- What happens when a space has more than 4 leads? Show first 4 with a "+N" overflow indicator
- What happens when the user is not authenticated? Hide lead avatars and the "Member" filter option, consistent with current behavior
- What happens when CRD primitives are not yet ported for a sub-component? The migration is incremental — missing primitives must be ported from `prototype/src/app/components/ui/` before use
- What happens when the toggle mechanism is set to CRD but the CRD version has a rendering error? The system should fall back gracefully (error boundary) and allow switching back to MUI

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide a toggle mechanism to switch between MUI and CRD rendering for the `/spaces` page
- **FR-002**: The CRD `/spaces` page MUST reuse the existing data layer (`useSpaceExplorer` hook, GraphQL queries) without modification
- **FR-003**: The CRD SpaceCard component MUST render: banner image (with fallback), space name, tagline/description, tags, member count, lead avatars, and privacy badge
- **FR-004**: The CRD SpaceCard MUST accept plain TypeScript props (no GraphQL generated types) per the CRD golden rules
- **FR-005**: The CRD spaces page MUST support tag-based search with the same behavior as the MUI version
- **FR-006**: The CRD spaces page MUST support membership filtering (All, Member, Public) for authenticated users
- **FR-007**: The CRD spaces page MUST support lazy loading / "Load More" pagination
- **FR-008**: All user-visible text in CRD components MUST use `react-i18next` for translation — no hardcoded strings
- **FR-009**: CRD components MUST have zero imports from `@mui/*`, `@emotion/*`, `@/core/apollo`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, or `react-router-dom`
- **FR-010**: The MUI version MUST remain the default; CRD mode is opt-in
- **FR-011**: A data mapper function MUST bridge between the GraphQL `SpaceWithParent` type and the CRD SpaceCard props interface
- **FR-012**: Required shadcn/ui primitives (Button, Input, Badge, Avatar, Select, DropdownMenu, Skeleton) MUST be ported from the prototype to `src/crd/primitives/`
- **FR-013**: CRD composite components MUST be organized under `src/crd/components/space/` following the domain-based folder structure

### Key Entities

- **SpaceCardData**: The CRD view model for a space card — plain TypeScript type with fields: id, name, description, bannerImageUrl, initials, avatarColor, isPrivate, tags, memberCount, leads, href, optional parent info
- **SpaceLead**: A lead person or organization displayed on the card — name, avatarUrl, type ('person' or 'org')
- **CRD Mode Toggle**: Configuration state that determines which rendering path (MUI or CRD) is active for a given route

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: The CRD `/spaces` page displays the same spaces data as the MUI version — 100% data parity verified by visual comparison
- **SC-002**: Users can switch between MUI and CRD modes and both render correctly with no errors in the browser console
- **SC-003**: The CRD page renders correctly across desktop, tablet, and mobile viewports with no layout overflow or broken elements
- **SC-004**: Zero MUI imports exist in any file under `src/crd/` — verifiable by grep returning no results
- **SC-005**: All CRD components pass the component checklist defined in `src/crd/CLAUDE.md` (no domain imports, plain TS props, Tailwind-only styling)
- **SC-006**: The migration pattern established here (data mapper + CRD view + toggle) is documented and reproducible for the next page migration
- **SC-007**: Page load performance of the CRD version is equal to or better than the MUI version

---

## Assumptions

- The existing `useSpaceExplorer` hook and GraphQL queries provide all data needed for the CRD SpaceCard — no new queries are required
- The toggle mechanism implementation details (feature flag, URL param, React context, localStorage, etc.) are left to the implementer — the spec only requires that the toggle exists and defaults to MUI
- The prototype's `SpaceCard` and `BrowseSpacesPage` are the definitive design reference for the CRD version
- Tailwind CSS v4 and the necessary build configuration are already set up or will be set up as part of the CRD infrastructure (separate from this spec)
- The `src/crd/` folder already exists with its CLAUDE.md conventions established
- This PoC does not need to handle subspace-specific card variants (stacked parent avatars) in the first iteration — basic parent info display is sufficient
- The i18n namespace for CRD design system text is `'crd'`; domain-specific text comes via props from the container
