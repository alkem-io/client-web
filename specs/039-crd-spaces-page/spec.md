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
| `prototype/src/app/layouts/MainLayout.tsx` | `src/crd/layouts/CrdLayout.tsx` | Full-page CRD shell (header + content + footer) |
| `prototype/src/app/components/layout/Header.tsx` | `src/crd/layouts/Header.tsx` | CRD header with nav icons and profile menu |
| `prototype/src/app/components/layout/Footer.tsx` | `src/crd/layouts/Footer.tsx` | CRD footer with links and language selector |
| `prototype/src/app/components/space/SpaceCard.tsx` | `src/crd/components/space/SpaceCard.tsx` | Individual space card |
| `prototype/src/app/pages/BrowseSpacesPage.tsx` | `src/crd/components/space/SpaceExplorer.tsx` | Spaces listing with search/filter |
| `prototype/src/app/components/ui/*` | `src/crd/primitives/*` | shadcn/ui atoms (Button, Badge, Avatar, Input, Select, etc.) |

### Current Production Architecture

The existing `/spaces` page follows this data flow:
1. **Route**: `TopLevelRoutes.tsx` → `/spaces` → `SpaceExplorerPage`
2. **Page**: `SpaceExplorerPage.tsx` → wraps in `TopLevelPageLayout` (MUI header/banner/footer via `TopLevelLayout`) + calls `useSpaceExplorer()` hook
3. **Hook**: `useSpaceExplorer.ts` → orchestrates multiple GraphQL queries (all spaces, member spaces, search, subspaces)
4. **View**: `SpaceExplorerView.tsx` → renders search input, filter buttons, card grid with lazy loading
5. **Card**: `SpaceCard.tsx` → renders individual space card (MUI Paper, Box, Typography, etc.)

The data layer (step 3) remains untouched. The **entire page shell** (steps 1-2, 4-5) gets a CRD alternative — CRD routes render with a completely new layout (header, footer, content wrapper) instead of the MUI `TopLevelPageLayout`/`TopLevelLayout`.

### CRD Full-Page Architecture

When a route is migrated to CRD, the entire page renders in the CRD design system:
1. **Route**: `TopLevelRoutes.tsx` → `/spaces` → `CrdLayoutWrapper` → `SpaceExplorerPage`
2. **Layout**: `CrdLayout` renders CRD Header + `<main>` + CRD Footer (all Tailwind, no MUI)
3. **Page**: `SpaceExplorerPage` (in `src/new-ui/topLevelPages/spaces/`) calls `useSpaceExplorer()` hook, maps data via `mapSpacesToCardDataList`, and renders CRD `SpaceExplorer` component
5. **Card**: CRD `SpaceCard` → renders individual space card (Tailwind, Radix UI)

Page-level integration files live in `src/new-ui/topLevelPages/spaces/` — the dedicated integration layer for CRD-migrated pages. MUI routes continue using `TopLevelLayout` unchanged. The split happens at the route level in `TopLevelRoutes.tsx`.

---

## User Scenarios & Testing

### User Story 1 — Full CRD Page Shell (Priority: P0)

A user navigates to `/spaces` and sees an **entirely new page** — CRD header, CRD content area, CRD footer. No MUI components are visible anywhere on the page. The header shows the Alkemio logo, navigation icons (search, messages, notifications, spaces, profile), and the footer shows links and a language selector — all matching the prototype's `MainLayout`.

**Why this priority**: The CRD layout shell must exist before any page content can be built. It proves the fundamental architecture: CRD routes get a completely separate visual shell from MUI routes.

**Independent Test**: Navigate to `/spaces`. Verify the entire page (header, content area, footer) renders with the new CRD design. Navigate to any other page — it should still render with the MUI layout.

**Acceptance Scenarios**:

1. **Given** `/spaces` is a CRD route, **When** the user navigates to `/spaces`, **Then** the page renders with the CRD Header (sticky, logo, nav icons) and CRD Footer (links, language selector) — no MUI `TopLevelLayout` visible
2. **Given** the CRD layout renders, **When** inspecting the DOM, **Then** the entire page is wrapped in `.crd-root` and uses only Tailwind styling
3. **Given** the CRD header renders, **When** the user sees the navigation icons, **Then** the header shows: Alkemio logo (links home), search icon, messages icon, notifications bell, spaces grid icon, and profile avatar with dropdown. Interactive functionality (search overlay, real notifications, real messages) is deferred — icons link to existing MUI pages or show placeholder dropdowns
4. **Given** the CRD footer renders, **When** the user sees the footer, **Then** it shows: copyright, Terms/Privacy/Security/Support/About links, Alkemio logo, and language selector

---

### User Story 2 — Browse Spaces with New Design (Priority: P1)

A user navigates to `/spaces` and sees the spaces listing rendered with the new shadcn/ui design system inside the CRD layout shell. The page shows the same data, same functionality (search, filter, pagination), but with the new visual design from the prototype.

**Why this priority**: This is the core content deliverable — proving that a CRD page can render real data while reusing the existing data layer.

**Independent Test**: Navigate to `/spaces`. Verify all spaces load, cards render with correct data (name, description, banner, tags, leads, privacy badge), and the page matches the prototype's layout structure and design language (minor spacing/shadow differences acceptable; pixel-perfection not required).

**Acceptance Scenarios**:

1. **Given** `/spaces` is wired to CRD, **When** the user navigates to `/spaces`, **Then** the page renders using shadcn/ui components from `src/crd/` with no MUI components visible
2. **Given** the spaces list loads, **When** cards are displayed, **Then** each card shows: banner image, space name, tagline, tags, lead avatars, and privacy indicator — matching the data from the existing GraphQL queries
3. **Given** the CRD page is loaded, **When** the user searches by tags, **Then** spaces are filtered using the same search logic as the MUI version
4. **Given** the CRD page is loaded, **When** the user scrolls or clicks "Load More", **Then** additional spaces load via the existing pagination mechanism

---

### User Story 3 — MUI and CRD Coexistence (Priority: P1)

The `/spaces` page renders with a completely CRD page shell (header, content, footer) while all other (unmigrated) pages continue rendering with the MUI `TopLevelLayout`. Both design systems coexist without conflicts — navigating between migrated and unmigrated pages works seamlessly, switching between entirely different layout shells.

**Why this priority**: Proving that CRD and MUI can coexist at the **layout level** (not just the content level) in the same app without visual or functional regressions is the foundational validation for the entire migration strategy.

**Independent Test**: Navigate between `/spaces` (full CRD page) and any other page (full MUI page). Verify both render correctly with no style leakage, no broken layouts, and no console errors during transitions.

**Acceptance Scenarios**:

1. **Given** `/spaces` uses CRD layout, **When** the user navigates to `/spaces`, **Then** the entire page (header, content, footer) renders using CRD components — no MUI `TopLevelLayout` elements visible
2. **Given** other pages use MUI layout, **When** the user navigates from `/spaces` to another page, **Then** the MUI page renders with its own header/nav/footer correctly, with no Tailwind style leakage
3. **Given** both layout systems are loaded, **When** inspecting the DOM, **Then** CRD styles are scoped within `.crd-root` and do not affect MUI components outside it
4. **Given** the user clicks a navigation link in the CRD header, **When** the link targets an MUI page, **Then** the navigation succeeds and the MUI layout loads correctly

---

### User Story 4 — Responsive Space Cards (Priority: P2)

The CRD spaces page adapts to different screen sizes, displaying the card grid responsively — more columns on wide screens, fewer on narrow screens, with cards that maintain readability at all sizes.

**Why this priority**: The prototype already defines responsive behavior via CSS Grid with `auto-fill` columns. Matching this in production ensures the CRD page is usable across devices.

**Independent Test**: Resize the browser window from mobile to desktop widths. Verify the card grid reflows correctly and cards remain readable at all breakpoints.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (>1200px), **When** spaces load, **Then** the grid displays 3-4 cards per row
2. **Given** a tablet viewport (768-1200px), **When** spaces load, **Then** the grid displays 2-3 cards per row
3. **Given** a mobile viewport (<768px), **When** spaces load, **Then** cards stack in a single column
4. **Given** any viewport size, **When** a card is displayed, **Then** the banner image, name, and tagline are fully visible without horizontal overflow

---

### User Story 5 — Loading and Empty States (Priority: P2)

The CRD spaces page shows appropriate skeleton loading states while data is being fetched and a meaningful empty state when no spaces match the current filters.

**Why this priority**: Loading and empty states are essential for perceived performance and usability, preventing confusion when the page appears blank.

**Independent Test**: Throttle the network to observe loading states. Apply filters that return no results to observe the empty state.

**Acceptance Scenarios**:

1. **Given** spaces data is loading, **When** the page renders, **Then** skeleton cards are shown matching the card layout
2. **Given** a search returns no results, **When** the empty state renders, **Then** a descriptive message and icon are displayed (matching the prototype's empty state)
3. **Given** the user clears filters, **When** results become available again, **Then** the empty state is replaced with actual cards

---

### User Story 6 — Standalone CRD Preview App for Designers (Priority: P2)

A designer runs `pnpm crd:dev` and sees a standalone web application at `http://localhost:5200` that renders CRD components with mock data — no backend, no full Alkemio app needed. The `/spaces` page shows space cards with realistic mock data (reused from the prototype), the full CRD layout (header, footer), and all interactions (search, filter, sort, pagination) working locally.

**Why this priority**: Designers need to iterate on CRD components without running the full Alkemio stack. Having a standalone preview app with mock data enables rapid design iteration and component validation outside the production codebase. It also validates that CRD components are truly independent of the Alkemio data layer.

**Independent Test**: Run `pnpm crd:dev`. Navigate to `http://localhost:5200/spaces`. Verify the page renders with mock space cards, header, footer, search, filters, and sorting — all functional with no backend.

**Acceptance Scenarios**:

1. **Given** the designer runs `pnpm crd:dev`, **When** the dev server starts, **Then** it serves the CRD standalone app at port 5200 with no errors
2. **Given** the standalone app is running, **When** navigating to `/spaces`, **Then** the page renders with mock data in the CRD SpaceExplorer with full layout (header + footer)
3. **Given** the standalone app uses mock data, **When** interacting with search/filter/sort, **Then** all interactions work client-side with the mock data set
4. **Given** the standalone app is running, **When** the main app is also run (`pnpm start`), **Then** both apps work independently without conflicts
5. **Given** CRD components are shared, **When** a component is modified in `src/crd/`, **Then** both the standalone app and the main app reflect the change

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

#### Layout & Shell
- **FR-001**: CRD routes MUST render with a fully CRD page shell — CRD Header, CRD content area, CRD Footer. No MUI `TopLevelLayout` or `TopLevelPageLayout` wraps CRD routes
- **FR-002**: The CRD layout shell (`CrdLayout`) MUST be a presentational component in `src/crd/layouts/` — it receives navigation props (links, user info, callbacks) and renders them. No data fetching or routing logic inside `src/crd/`
- **FR-003**: The CRD Header MUST render: Alkemio logo (home link), search icon, messages icon, notifications bell, spaces grid icon, profile avatar with dropdown menu. For this PoC, interactive features (search overlay, real notifications) are deferred — icons render as links to existing pages or show visual-only dropdowns
- **FR-004**: The CRD Footer MUST render: copyright text, Terms/Privacy/Security/Support/About links, Alkemio logo, and language selector dropdown
- **FR-005**: CRD and MUI layouts MUST coexist — navigating from a CRD route to an MUI route (and vice versa) MUST work seamlessly with no style leakage, layout conflicts, or console errors

#### Content (Spaces Page)
- **FR-006**: The CRD `/spaces` page MUST reuse the existing data layer (`useSpaceExplorer` hook, GraphQL queries) without modification
- **FR-007**: The CRD SpaceCard component MUST render: banner image (with fallback), space name, tagline/description, tags, lead avatars, and privacy badge. Prototype features requiring data layer changes (e.g., member count) are omitted and deferred to follow-up
- **FR-008**: The CRD SpaceCard MUST accept plain TypeScript props (no GraphQL generated types) per the CRD golden rules
- **FR-009**: The CRD spaces page MUST support tag-based search, membership filtering (All, Member, Public), and lazy loading / "Load More" pagination — same behavior as the MUI version
- **FR-010**: All user-visible text in CRD components MUST use `react-i18next` for translation — no hardcoded strings

#### Architecture
- **FR-011**: CRD components in `src/crd/` MUST have zero imports from `@mui/*`, `@emotion/*`, `@/core/apollo`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, or `formik`
- **FR-012**: A data mapper function in `src/new-ui/topLevelPages/spaces/spaceCardDataMapper.ts` MUST bridge between the GraphQL `SpaceWithParent` type and the CRD SpaceCard props interface
- **FR-013**: Required shadcn/ui primitives (Button, Input, Badge, Avatar, Select, DropdownMenu, Skeleton) MUST be ported from the prototype to `src/crd/primitives/`
- **FR-014**: CRD composite components MUST be organized under `src/crd/components/space/` and layout components under `src/crd/layouts/`
- **FR-015**: The route-level split between CRD and MUI MUST happen in `TopLevelRoutes.tsx` — CRD routes are wrapped in `CrdLayoutWrapper`, MUI routes continue using `TopLevelLayout` unchanged. CRD page components live in `src/new-ui/topLevelPages/` and MUST NOT import from `@mui/*`

#### Accessibility (WCAG 2.1 AA)
- **FR-019**: All interactive elements (buttons, links, form inputs) MUST have visible focus indicators — `focus-visible:ring-2` or equivalent. The `outline-none` class MUST NOT be used without a replacement focus indicator
- **FR-020**: Icon-only buttons MUST have `aria-label` (not just `title`) for screen reader support. Decorative icons adjacent to text MUST have `aria-hidden="true"`
- **FR-021**: The card grid MUST use `role="list"` and `role="listitem"` for proper screen reader navigation. Each card MUST use `<article>` semantics
- **FR-022**: Loading states MUST be announced to assistive technology via `role="status"` with an `aria-label`
- **FR-023**: Interactive elements inside cards (e.g., parent link) MUST use semantic `<button>` elements, not clickable `<span>` elements, ensuring keyboard operability
- **FR-024**: The header navigation icons MUST be wrapped in a `<nav>` landmark with `aria-label`. Footer links MUST be in a `<nav>` landmark
- **FR-025**: Form inputs (TagsInput search) MUST have an `aria-label` that persists regardless of placeholder visibility
- **FR-026**: Filter chip dismiss actions MUST use `<button>` elements with screen reader text indicating the dismiss action

#### Standalone Preview App
- **FR-016**: CRD components MUST be runnable as a standalone application via `pnpm crd:dev` — no Alkemio backend required. The standalone app uses mock data and its own i18n initialization
- **FR-017**: CRD translations MUST live in a dedicated JSON file (`src/crd/i18n/en.json`) loaded as the `'crd'` i18next namespace. Both the main app and the standalone app load the same JSON file — the main app registers it as an additional namespace, the standalone app uses it as its default namespace
- **FR-018**: The standalone app MUST reuse the exact same CRD components (`src/crd/components/`, `src/crd/layouts/`, `src/crd/primitives/`, `src/crd/forms/`) — no duplication of component code

### Key Entities

- **SpaceCardData**: The CRD view model for a space card — plain TypeScript type with fields: id, name, description, bannerImageUrl, initials, avatarColor, isPrivate, tags, leads, href, optional parent info
- **SpaceLead**: A lead person or organization displayed on the card — name, avatarUrl, type ('person' or 'org')
- **Route Migration State**: A code-level decision per route — each route is assigned to either the CRD layout group (`CrdLayoutWrapper`) or the MUI layout group (`TopLevelLayout`) in `TopLevelRoutes.tsx`. No runtime configuration needed

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: The CRD `/spaces` page renders with a **full CRD shell** — CRD Header, content area, CRD Footer — with zero MUI layout components (`TopLevelLayout`, `TopLevelPageLayout`) visible
- **SC-002**: The CRD `/spaces` page displays the same spaces data as the MUI version — 100% data parity. Visual fidelity matches prototype's layout structure and design language (minor spacing/shadow differences acceptable)
- **SC-003**: Navigating between CRD pages (`/spaces`) and MUI pages produces no console errors, no style leakage, and no broken layouts — each renders with its own complete layout shell
- **SC-004**: The CRD page renders correctly across desktop, tablet, and mobile viewports with no layout overflow or broken elements
- **SC-005**: Zero MUI imports exist in any file under `src/crd/` — verifiable by grep returning no results
- **SC-006**: All CRD components pass the component checklist defined in `src/crd/CLAUDE.md` (no domain imports, plain TS props, Tailwind-only styling)
- **SC-007**: The migration pattern established here (CRD layout shell + data mapper + CRD view + route wiring) is documented and reproducible for the next page migration
- **SC-008**: Page load performance of the CRD version is equal to or better than the MUI version

---

## Clarifications

### Session 2026-03-26

- Q: Should the MUI/CRD toggle be global (all pages at once) or per-route? → A: Per-route — each migrated URL is independently switchable between MUI and CRD. Starting with `/spaces`, more routes will follow.
- Q: How does a user activate the MUI/CRD toggle? → A: No runtime toggle. Routes are simply wired to CRD or MUI at the code level. When a route is migrated, it uses the new design — no URL param, no UI toggle, no localStorage switch.
- Q: What level of visual fidelity to the prototype is required? → A: Same layout structure and design language — minor spacing/shadow differences acceptable. Pixel-perfection is not required.
- Q: Member count is in the prototype but not in the current GraphQL fragment. Include it? → A: Drop it. General rule: if a prototype feature requires data layer changes, omit it from the CRD card. Add in a follow-up.
- Q: Should only the inner content area be CRD, or the entire page including header/footer? → A: **The entire page.** When a route is CRD, the complete page shell (header, content, footer) renders in CRD. No MUI layout wraps CRD routes. This is a full visual replacement per route.
- Q: Should the CRD Header be fully functional (real search, notifications, messages) for the PoC? → A: Visual port with placeholder interactions. Header icons link to existing MUI pages. Real search overlay, notification feed, and message counts are deferred to follow-up tasks.

---

## Assumptions

- The existing `useSpaceExplorer` hook and GraphQL queries provide all data needed for the CRD SpaceCard — no new queries are required
- No runtime toggle mechanism is needed — migrated routes simply use CRD views at the code level
- The prototype's `SpaceCard` and `BrowseSpacesPage` are the definitive design reference for the CRD version
- Tailwind CSS v4 and the necessary build configuration have been set up as Phase 1 of this spec (T001-T005, completed)
- The `src/crd/` folder already exists with its CLAUDE.md conventions established
- This PoC does not need to handle subspace-specific card variants (stacked parent avatars) in the first iteration — basic parent info display is sufficient
- The i18n namespace for CRD design system text is `'crd'`; domain-specific text comes via props from the container
