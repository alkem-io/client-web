# Feature Specification: CRD Spaces Page Migration

**Feature Branch**: `039-crd-spaces-page`
**Created**: 2026-03-26
**Status**: Draft
**Input**: Migrate the /spaces page from MUI to shadcn/ui as the first PoC for the CRD (Client Re-Design) migration strategy.

## Context

This is the **proof of concept** for the CRD migration — the systematic replacement of MUI-based UI with shadcn/ui + Tailwind CSS. The `/spaces` page was chosen because it is relatively simple (a filterable grid of cards), has a complete prototype in `prototype/src/app/pages/BrowseSpacesPage.tsx`, and exercises the full migration pipeline: primitives, composites, layout, data mapping, and route wiring.

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

**Independent Test**: Navigate to `/spaces`. Verify all spaces load, cards render with correct data (name, description, banner, tags, leads, privacy badge), and the page matches the prototype's layout structure and design language (minor spacing/shadow differences acceptable; pixel-perfection not required).

**Acceptance Scenarios**:

1. **Given** `/spaces` is wired to CRD, **When** the user navigates to `/spaces`, **Then** the page renders using shadcn/ui components from `src/crd/` with no MUI components visible
2. **Given** the spaces list loads, **When** cards are displayed, **Then** each card shows: banner image, space name, tagline, tags, lead avatars, and privacy indicator — matching the data from the existing GraphQL queries
3. **Given** the CRD page is loaded, **When** the user searches by tags, **Then** spaces are filtered using the same search logic as the MUI version
4. **Given** the CRD page is loaded, **When** the user scrolls or clicks "Load More", **Then** additional spaces load via the existing pagination mechanism

---

### User Story 2 — MUI and CRD Coexistence (Priority: P1)

The `/spaces` page renders using CRD components while all other (unmigrated) pages continue rendering with MUI. Both design systems coexist without conflicts — navigating between migrated and unmigrated pages works seamlessly.

**Why this priority**: Proving that CRD and MUI can coexist in the same app without visual or functional regressions is the foundational validation for the entire migration strategy. Every subsequent page migration depends on this.

**Independent Test**: Navigate between `/spaces` (CRD) and any other page (MUI). Verify both render correctly with no style leakage or broken layouts.

**Acceptance Scenarios**:

1. **Given** `/spaces` is wired to CRD, **When** the user navigates to `/spaces`, **Then** the page renders using shadcn/ui components with Tailwind styling
2. **Given** other pages remain MUI, **When** the user navigates from `/spaces` to another page, **Then** the MUI page renders correctly with no Tailwind style leakage
3. **Given** both systems are loaded, **When** inspecting the DOM, **Then** CRD styles are scoped within `.crd-root` and do not affect MUI components outside it
4. **Given** the CRD page is loaded, **When** checking the build output, **Then** Tailwind CSS is code-split and only loaded for CRD routes

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
- What happens when the CRD version has a rendering error? A React error boundary should catch the error and display a meaningful fallback rather than a blank page

---

## Requirements

### Functional Requirements

- **FR-001**: Migrated routes MUST render using CRD components directly — no runtime toggle. The `/spaces` route is the first to be wired to CRD. Unmigrated routes continue using MUI unchanged
- **FR-002**: The CRD `/spaces` page MUST reuse the existing data layer (`useSpaceExplorer` hook, GraphQL queries) without modification
- **FR-003**: The CRD SpaceCard component MUST render: banner image (with fallback), space name, tagline/description, tags, lead avatars, and privacy badge. Prototype features requiring data layer changes (e.g., member count) are omitted and deferred to follow-up
- **FR-004**: The CRD SpaceCard MUST accept plain TypeScript props (no GraphQL generated types) per the CRD golden rules
- **FR-005**: The CRD spaces page MUST support tag-based search with the same behavior as the MUI version
- **FR-006**: The CRD spaces page MUST support membership filtering (All, Member, Public) for authenticated users
- **FR-007**: The CRD spaces page MUST support lazy loading / "Load More" pagination
- **FR-008**: All user-visible text in CRD components MUST use `react-i18next` for translation — no hardcoded strings
- **FR-009**: CRD components MUST have zero imports from `@mui/*`, `@emotion/*`, `@/core/apollo`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, or `formik`
- **FR-010**: CRD and MUI MUST coexist without style conflicts — CRD styles scoped within `.crd-root`, MUI pages unaffected
- **FR-011**: A data mapper function MUST bridge between the GraphQL `SpaceWithParent` type and the CRD SpaceCard props interface
- **FR-012**: Required shadcn/ui primitives (Button, Input, Badge, Avatar, Select, DropdownMenu, Skeleton) MUST be ported from the prototype to `src/crd/primitives/`
- **FR-013**: CRD composite components MUST be organized under `src/crd/components/space/` following the domain-based folder structure

### Key Entities

- **SpaceCardData**: The CRD view model for a space card — plain TypeScript type with fields: id, name, description, bannerImageUrl, initials, avatarColor, isPrivate, tags, leads, href, optional parent info
- **SpaceLead**: A lead person or organization displayed on the card — name, avatarUrl, type ('person' or 'org')
- **Route Migration State**: A code-level decision per route — each route is wired to either the MUI view or the CRD view. No runtime configuration needed

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: The CRD `/spaces` page displays the same spaces data as the MUI version — 100% data parity. Visual fidelity matches prototype's layout structure and design language (minor spacing/shadow differences acceptable)
- **SC-002**: Navigating between CRD pages (`/spaces`) and MUI pages produces no console errors, no style leakage, and no broken layouts
- **SC-003**: The CRD page renders correctly across desktop, tablet, and mobile viewports with no layout overflow or broken elements
- **SC-004**: Zero MUI imports exist in any file under `src/crd/` — verifiable by grep returning no results
- **SC-005**: All CRD components pass the component checklist defined in `src/crd/CLAUDE.md` (no domain imports, plain TS props, Tailwind-only styling)
- **SC-006**: The migration pattern established here (data mapper + CRD view + route wiring) is documented and reproducible for the next page migration
- **SC-007**: Page load performance of the CRD version is equal to or better than the MUI version

---

## Clarifications

### Session 2026-03-26

- Q: Should the MUI/CRD toggle be global (all pages at once) or per-route? → A: Per-route — each migrated URL is independently switchable between MUI and CRD. Starting with `/spaces`, more routes will follow.
- Q: How does a user activate the MUI/CRD toggle? → A: No runtime toggle. Routes are simply wired to CRD or MUI at the code level. When a route is migrated, it uses the new design — no URL param, no UI toggle, no localStorage switch.
- Q: What level of visual fidelity to the prototype is required? → A: Same layout structure and design language — minor spacing/shadow differences acceptable. Pixel-perfection is not required.
- Q: Member count is in the prototype but not in the current GraphQL fragment. Include it? → A: Drop it. General rule: if a prototype feature requires data layer changes, omit it from the CRD card. Add in a follow-up.

---

## Assumptions

- The existing `useSpaceExplorer` hook and GraphQL queries provide all data needed for the CRD SpaceCard — no new queries are required
- No runtime toggle mechanism is needed — migrated routes simply use CRD views at the code level
- The prototype's `SpaceCard` and `BrowseSpacesPage` are the definitive design reference for the CRD version
- Tailwind CSS v4 and the necessary build configuration are already set up or will be set up as part of the CRD infrastructure (separate from this spec)
- The `src/crd/` folder already exists with its CLAUDE.md conventions established
- This PoC does not need to handle subspace-specific card variants (stacked parent avatars) in the first iteration — basic parent info display is sufficient
- The i18n namespace for CRD design system text is `'crd'`; domain-specific text comes via props from the container
