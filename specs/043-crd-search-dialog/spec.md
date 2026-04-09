# Feature Specification: Search Dialog CRD Migration

**Feature Branch**: `043-crd-search-dialog`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Migrate the platform Search dialog from MUI to the CRD design system (shadcn/ui + Tailwind), following the same pattern used for the /spaces page migration (039-crd-spaces-page) and the /home dashboard migration (041-crd-dashboard-page)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Overlay with Tag-Based Input (Priority: P1)

An authenticated or unauthenticated user opens the search overlay and performs a search. The overlay appears as a full-viewport animated modal with a clean search input bar, tag-based multi-term entry, and a close button. The user types a search term, presses Enter to create a tag, and results are fetched and displayed in categorized sections. Additional terms can be added as tags and removed individually, with each change triggering a new search.

**Why this priority**: The search input and results display is the core functionality. Without a working overlay and search execution, nothing else matters. This is the MVP.

**Independent Test**: Can be fully tested by enabling CRD, triggering search, typing a term, pressing Enter, and verifying results appear in categorized sections with correct data.

**Acceptance Scenarios**:

1. **Given** CRD is enabled and the user is on any page, **When** they trigger the search overlay, **Then** a full-viewport animated overlay appears with backdrop blur, a search input bar, and a close button
2. **Given** the search overlay is open with no search performed, **When** the user views the overlay body, **Then** they see a centered empty state with a Search icon and the message "Type a search term and press Enter" with a description of searchable categories
3. **Given** the overlay is open, **When** the user types a term and presses Enter, **Then** a tag chip is created, the input clears, a loading spinner appears, and results are fetched and displayed in categorized sections
4. **Given** results are displayed, **When** the user types another term and presses Enter, **Then** a second tag chip is added and search re-executes with both terms (OR logic)
5. **Given** multiple search tags are active, **When** the user clicks the X button on a tag, **Then** the tag is removed and search re-executes with the remaining terms
6. **Given** the user has 5 search tags, **When** they try to add a 6th term, **Then** the system prevents adding more terms (max 5 limit)
7. **Given** a search is in progress, **When** results are being fetched, **Then** a centered loading spinner with "Searching..." text is displayed
8. **Given** a search returned no results, **When** the overlay displays, **Then** a "No results found for [terms]" message is shown with a suggestion to "Try different keywords or broaden your search"

---

### User Story 2 - Categorized Results with Sidebar Navigation (Priority: P1)

Search results are displayed in 5 categorized sections (Spaces, Posts, Responses, Users, Organizations), each with a section header, result count badge, and appropriate result cards. A sidebar (desktop) or horizontal pill tabs (mobile) allow users to navigate between categories. The sidebar tracks the active section on scroll and highlights the current category.

**Why this priority**: Categorized results with navigation is the primary way users find content. Without this structure, the search overlay is unusable for any real discovery.

**Independent Test**: Can be tested by performing a search that returns results in multiple categories and verifying sidebar navigation, scroll tracking, category sections, and result counts.

**Acceptance Scenarios**:

1. **Given** search results are displayed, **When** the user views the results pane, **Then** each category with results is shown as a distinct section with an icon, title, result count badge, and result cards in a responsive grid
2. **Given** results span multiple categories, **When** the user views the desktop sidebar, **Then** only categories with results are listed, each showing its icon, label, and result count badge, with the currently scrolled-to section highlighted with a left border accent and bold text
3. **Given** results span multiple categories, **When** the user clicks a category in the sidebar, **Then** the results pane smoothly scrolls to that section
4. **Given** the user scrolls through the results pane, **When** they pass category section boundaries, **Then** the sidebar active indicator updates to reflect the currently visible section
5. **Given** the overlay is viewed on a mobile viewport, **When** results are displayed, **Then** the sidebar is replaced by horizontally scrollable pill tabs at the top of the results area, with the active category highlighted
6. **Given** search results are displayed, **When** a category has no results, **Then** that category is hidden from both the results area and the sidebar/pill navigation
7. **Given** results are displayed, **When** a disclaimer banner appears above the results, **Then** it informs the user that "These results may not represent the up-to-date state of the platform"

---

### User Story 3 - Result Cards Per Type (Priority: P1)

Each search result category displays dedicated card designs optimized for the result type: space cards with banner images, post cards with author and type badge, response cards with parent post reference, user cards with avatar and role, and organization cards with logo and tagline. Clicking any result card navigates to the entity and closes the overlay.

**Why this priority**: Distinct card designs provide visual clarity and help users quickly identify and navigate to the content they're looking for. This is core to the search experience.

**Independent Test**: Can be tested by performing a search that returns results of each type and verifying each card displays the correct information and navigates on click.

**Acceptance Scenarios**:

1. **Given** space results are displayed, **When** the user views a space card, **Then** it shows a banner image (or muted placeholder), space name, tagline, and member info, and clicking it navigates to the space page
2. **Given** post results are displayed, **When** the user views a post card, **Then** it shows a banner image (or placeholder with type icon), author avatar and name, title, snippet, type badge (Post/Whiteboard/Memo), date, and space context ("in: Space Name"), and clicking it navigates to the post
3. **Given** response results are displayed, **When** the user views a response card, **Then** it shows the author avatar and name, title, snippet, a "Response to: [parent post]" reference, type badge, and space context, and clicking it navigates to the response
4. **Given** user results are displayed, **When** the user views a user card, **Then** it shows a centered avatar (with initials fallback), name, role, and email, and clicking it navigates to the user's profile
5. **Given** organization results are displayed, **When** the user views an organization card, **Then** it shows a logo (or Building icon placeholder), name, type badge, and tagline, and clicking it navigates to the organization page
6. **Given** any result card is displayed, **When** the user hovers over it, **Then** a subtle elevation shadow and primary-tinted border appear as visual feedback

---

### User Story 4 - Keyboard Shortcut and Triggers (Priority: P2)

Users can open the search overlay via Cmd+K / Ctrl+K keyboard shortcut (in addition to the existing header search trigger and URL parameter mechanism). The overlay can be closed via Escape key, backdrop click, or the close button.

**Why this priority**: The keyboard shortcut is a productivity feature that power users expect. It enhances discoverability but is not required for core search functionality.

**Independent Test**: Can be tested by pressing Cmd+K on any page and verifying the overlay opens, then closing it via Escape, backdrop click, and X button.

**Acceptance Scenarios**:

1. **Given** the user is on any page with CRD enabled, **When** they press Cmd+K (Mac) or Ctrl+K (Windows/Linux), **Then** the search overlay opens with the input focused
2. **Given** the search overlay is open, **When** the user presses Escape, **Then** the overlay closes
3. **Given** the search overlay is open, **When** the user clicks the backdrop (outside the overlay panel), **Then** the overlay closes
4. **Given** the search overlay is open, **When** the user clicks the X close button, **Then** the overlay closes
5. **Given** the overlay is closed, **When** the user clicks the search icon in the header, **Then** the overlay opens (existing behavior preserved)
6. **Given** the overlay is opened via a URL parameter with pre-filled search terms, **When** the overlay renders, **Then** the terms appear as tag chips and the search executes immediately

---

### User Story 5 - Per-Section Filters (Priority: P2)

Users can filter results within individual categories using dropdown filters. Spaces can be filtered by "All / Spaces only / Subspaces only". Posts can be filtered by "All / Whiteboards / Memos". Responses can be filtered by "All / Posts / Whiteboards / Memos". Filters apply client-side without re-querying.

**Why this priority**: Filters refine results within categories but are secondary to the core search and navigation experience.

**Independent Test**: Can be tested by performing a search, opening a section's filter dropdown, selecting a filter, and verifying the displayed results update to match the filter.

**Acceptance Scenarios**:

1. **Given** the Spaces section has results, **When** the user clicks the filter dropdown, **Then** options "All", "Spaces only", and "Subspaces only" are shown
2. **Given** the Posts section has results, **When** the user selects "Whiteboards" from the filter, **Then** only whiteboard posts are shown and the filter button displays "Whiteboards" with primary-colored styling
3. **Given** a filter is active, **When** the user selects "All", **Then** all results in that section are shown again and the filter button returns to its default appearance
4. **Given** filter dropdowns are available, **When** categories without filter options (Users, Organizations) are displayed, **Then** no filter dropdown is shown for those sections

---

### User Story 6 - Scope Switching (Priority: P2)

When the user is browsing within a space and opens search, they see a scope dropdown in the search bar that lets them toggle between searching "All Spaces" (platform-wide) and the current space. Changing scope re-executes the search.

**Why this priority**: Scoped search is contextually useful when navigating within a space but is not required for general platform search.

**Independent Test**: Can be tested by navigating to a space page, opening search, toggling scope, and verifying results change to reflect the selected scope.

**Acceptance Scenarios**:

1. **Given** the user is browsing within a space and opens search, **When** the overlay renders, **Then** a scope dropdown appears in the search bar showing "All Spaces" by default
2. **Given** the scope dropdown is visible, **When** the user selects the current space name, **Then** the dropdown shows the space name with primary styling and search re-executes scoped to that space
3. **Given** the search is scoped to a space with no results, **When** the no-results state is displayed, **Then** a "Search all Spaces instead" button appears below the message
4. **Given** the user is NOT inside a space (e.g., on `/home`), **When** they open search, **Then** the scope dropdown is not visible (search is always platform-wide)

---

### User Story 7 - Load More and Pagination (Priority: P2)

Each result section initially displays up to 4 items. If more results are available, a "Load more" button appears below the section. Clicking it reveals additional results (4 more per click).

**Why this priority**: Pagination enables users to find results beyond the initial set but is secondary to the core display of initial results.

**Independent Test**: Can be tested by performing a search that returns more than 4 results in a category and clicking "Load more" to verify additional results appear.

**Acceptance Scenarios**:

1. **Given** a category has more than 4 results, **When** results are displayed, **Then** only the first 4 are shown with a "Load more" button below
2. **Given** the "Load more" button is visible, **When** the user clicks it, **Then** 4 more results appear below the existing ones
3. **Given** all results in a category are displayed, **When** the user views the section, **Then** the "Load more" button is no longer shown

---

### User Story 8 - CRD Toggle and MUI Fallback (Priority: P3)

The CRD search overlay is gated behind the existing localStorage toggle (default OFF). When CRD is disabled, the existing MUI SearchDialog renders unchanged. Both versions are lazy-loaded so only the active version's code is fetched.

**Why this priority**: The toggle mechanism enables safe rollout and follows the established pattern from the spaces and dashboard migrations.

**Independent Test**: Can be tested by toggling CRD on/off and verifying the correct search dialog version renders each time.

**Acceptance Scenarios**:

1. **Given** CRD is disabled (default), **When** the user triggers search, **Then** the existing MUI SearchDialog renders unchanged
2. **Given** CRD is enabled, **When** the user triggers search, **Then** the new CRD search overlay renders
3. **Given** CRD is toggled from enabled to disabled, **When** the page reloads and search is triggered, **Then** the MUI search dialog renders without errors

---

### User Story 9 - Responsive Layout (Priority: P3)

The search overlay adapts to different screen sizes. On mobile, the overlay fills the entire screen, the category sidebar is replaced by horizontal scrollable pill tabs, and result card grids adjust to fewer columns. On desktop, the overlay is centered with padding, a left sidebar shows categories, and result cards display in a 4-column grid.

**Why this priority**: Responsive behavior is important for mobile users but is secondary to core search functionality on desktop.

**Independent Test**: Can be tested by resizing the browser and verifying layout changes at mobile, tablet, and desktop breakpoints.

**Acceptance Scenarios**:

1. **Given** a mobile viewport, **When** the overlay opens, **Then** it fills the full screen (no outer padding) with horizontal category pills and single-column result grids
2. **Given** a tablet viewport, **When** results are displayed, **Then** result grids show 2 columns for most card types
3. **Given** a desktop viewport, **When** results are displayed, **Then** a left sidebar (2 cols) and results pane (8 cols) are shown with 4-column result grids

---

### Edge Cases

- What happens when the user enters a search term shorter than 2 characters? The system requires a minimum of 2 characters per term and does not create a tag for shorter inputs.
- What happens when the user opens search with a URL parameter containing more than 5 terms? The system enforces the max 5 terms limit, combining excess terms into the last tag (existing behavior preserved).
- What happens when a search returns results in only one category? Only that category's section and sidebar item are shown; the sidebar still renders for consistent navigation.
- What happens when the user clicks a result card that leads to a page requiring authentication and the user is not logged in? The platform's existing auth redirect handles this — the search overlay just navigates to the URL.
- What happens when the network fails during a search? An error message is displayed and the user can retry by modifying tags.
- What happens when the overlay is open and the user navigates via browser back/forward? The overlay closes gracefully.

## Requirements *(mandatory)*

### Functional Requirements

#### Overlay & Container

- **FR-001**: System MUST render a CRD search overlay when CRD toggle is enabled, replacing the MUI SearchDialog with a full-viewport animated overlay using Tailwind CSS and shadcn/ui components exclusively (no MUI imports)
- **FR-002**: System MUST render the existing MUI SearchDialog when CRD toggle is disabled (default behavior preserved)
- **FR-003**: The overlay MUST animate in with a scale (0.97 → 1) and translate-Y (10px → 0) transition with backdrop blur, and reverse on close
- **FR-004**: The overlay MUST close via Escape key, backdrop click, or close button
- **FR-005**: System MUST support opening the overlay via Cmd+K (Mac) / Ctrl+K (Windows/Linux) keyboard shortcut, in addition to existing header search trigger and URL parameters

#### Search Input & Tags

- **FR-006**: The overlay MUST display a search input bar with a Search icon, text input, optional scope dropdown, and close button
- **FR-007**: The user MUST be able to create search tags by typing a term and pressing Enter; the term appears as a removable chip below the input
- **FR-008**: Each tag chip MUST display the term text and an X button for removal
- **FR-009**: Search MUST execute automatically when tags are added or removed
- **FR-010**: System MUST enforce a maximum of 5 search tags and a minimum of 2 characters per tag
- **FR-011**: When the overlay opens with pre-filled search terms (from URL parameters or initial query), the terms MUST appear as tag chips and search MUST execute immediately

#### Results Layout & Categories

- **FR-012**: Search results MUST be displayed in 5 categorized sections: Spaces, Posts, Responses, Users, and Organizations
- **FR-013**: Each section MUST display a header with category icon, title, result count badge, and an optional filter dropdown
- **FR-014**: A category sidebar (desktop) MUST show only categories with results, each with icon, label, and count badge, with the active section highlighted via left border accent and bold text
- **FR-015**: The sidebar active indicator MUST track the currently visible section on scroll
- **FR-016**: Clicking a category in the sidebar MUST smoothly scroll the results pane to that section
- **FR-017**: On mobile viewports, the sidebar MUST be replaced by horizontally scrollable pill tabs with category label and count, active tab highlighted
- **FR-018**: Categories with no results MUST be hidden from both the results area and the navigation

#### Result Cards

- **FR-019**: Space result cards MUST display banner image (or placeholder), name, tagline, and member information
- **FR-020**: Post result cards MUST display banner image (or type-icon placeholder), author avatar and name, title (2-line clamp), snippet (2-line clamp), type badge (Post/Whiteboard/Memo), date, and space context
- **FR-021**: Response result cards MUST display author avatar and name, title (2-line clamp), snippet (2-line clamp), "Response to: [parent post title]" reference, type badge, and space context
- **FR-022**: User result cards MUST display centered avatar (with initials fallback), name, role, and email
- **FR-023**: Organization result cards MUST display logo (or Building icon placeholder), name, type badge, and tagline
- **FR-024**: All result cards MUST display a hover state with subtle elevation shadow and primary-tinted border
- **FR-025**: Clicking any result card MUST navigate to the entity's page and close the overlay

#### Filters

- **FR-026**: The Spaces section MUST offer filter options: All, Spaces only, Subspaces only
- **FR-027**: The Posts section MUST offer filter options: All, Whiteboards, Memos
- **FR-028**: The Responses section MUST offer filter options: All, Posts, Whiteboards, Memos
- **FR-029**: Users and Organizations sections MUST NOT display a filter dropdown
- **FR-030**: Filters MUST apply client-side without re-querying the backend
- **FR-031**: Active filters MUST be visually indicated on the filter button (primary color styling and active label)

#### Scope

- **FR-032**: When the user is browsing within a space, the overlay MUST display a scope dropdown with options "All Spaces" and the current space name
- **FR-033**: Changing scope MUST re-execute the search with the new scope
- **FR-034**: When scoped search returns no results, a "Search all Spaces instead" button MUST be shown
- **FR-035**: When the user is NOT inside a space, the scope dropdown MUST NOT be visible

#### States

- **FR-036**: Before any search is performed, the overlay MUST display a centered empty state with a Search icon and instructional text
- **FR-037**: During search execution, the overlay MUST display a centered loading spinner with "Searching..." text
- **FR-038**: When search returns no results, the overlay MUST display a "No results found" message with the quoted search terms and suggestion text
- **FR-039**: A disclaimer banner MUST appear above results informing users that results may not reflect the current platform state

#### Pagination

- **FR-040**: Each section MUST initially display up to 4 results
- **FR-041**: Sections with more results MUST display a "Load more" button that reveals 4 additional results per click
- **FR-042**: The "Load more" button MUST be hidden when all available results are displayed

#### CRD Architecture

- **FR-043**: All CRD search components MUST be purely presentational: no GraphQL, no routing, no auth, no business logic — all data and callbacks received as props
- **FR-044**: The CRD search overlay component MUST NOT import from `@mui/*` or `@emotion/*`
- **FR-045**: Data mapping from GraphQL search results to CRD component props MUST occur in integration layers (`src/main/crdPages/` or `src/main/search/`), never inside `src/crd/` components
- **FR-046**: All user-visible text MUST use the `crd-search` i18n namespace with translations provided in English, Dutch, Spanish, Bulgarian, German, and French

#### Accessibility (WCAG 2.1 AA)

- **FR-047**: The overlay MUST use `role="dialog"`, `aria-modal="true"`, and `aria-label="Platform Search"` for screen reader announcement
- **FR-048**: The search input MUST have a persistent `aria-label` that does not disappear when the input has a value
- **FR-049**: Search tag chips MUST be wrapped in a container with `role="list"` and `aria-label="Active search terms"`, with each chip as a `role="listitem"`, and the remove button having `aria-label="Remove search term: [term]"`
- **FR-050**: The category sidebar MUST use `<nav>` with `aria-label="Result categories"`
- **FR-051**: Each result section MUST use `<section>` with `aria-label="[Category] results"`
- **FR-052**: The results container MUST use `role="region"` with `aria-label="Search results"`
- **FR-053**: All interactive elements (cards, buttons, filter dropdowns, tags) MUST be operable via keyboard with visible `focus-visible:ring` indicators
- **FR-054**: The overlay MUST trap focus while open and return focus to the trigger element on close
- **FR-055**: Icon-only buttons (close, tag remove, filter toggle) MUST have `aria-label` describing their action
- **FR-056**: Loading states MUST use `aria-busy="true"` on their container, and empty/no-results states MUST use `role="status"`
- **FR-057**: All text content MUST meet a minimum 4.5:1 contrast ratio against its background (3:1 for large text)
- **FR-058**: Result card grids MUST use semantic `<ul>` / `<li>` structure

### Key Entities

- **SearchTag**: A user-entered search term displayed as a removable chip — text content, removable via X button
- **SearchCategory**: One of five result categories — Spaces, Posts, Responses, Users, Organizations — each with an icon, label, result count, and optional filter configuration
- **SearchScope**: The search boundary — either platform-wide ("All Spaces") or restricted to a specific space
- **SpaceResult**: A space or subspace search result — banner image, name, tagline, member info, privacy indicator, link
- **PostResult**: A content item result — banner image, author (avatar + name), title, snippet, type (Post/Whiteboard/Memo), date, parent space context
- **ResponseResult**: A threaded reply result — author, title, snippet, parent post title, type, parent space context
- **UserResult**: A platform user result — avatar (with initials fallback), name, role, email
- **OrganizationResult**: An organization result — logo, name, type, tagline

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The CRD search overlay renders correctly with all 5 result categories and their dedicated card types when CRD is enabled, with zero MUI component imports in the CRD code path
- **SC-002**: Users can perform a search, navigate results across all categories, filter within sections, and click through to entity pages — matching or exceeding the current MUI search dialog's functionality
- **SC-003**: The Cmd+K / Ctrl+K keyboard shortcut opens the search overlay from any page in under 300ms
- **SC-004**: The search overlay is fully usable on mobile viewports (360px+) with horizontal category pills and responsive card grids
- **SC-005**: Toggling CRD off renders the existing MUI SearchDialog with zero regressions — all existing search functionality preserved
- **SC-006**: All existing unit tests continue to pass and the build succeeds with zero new errors
- **SC-007**: CRD search components achieve WCAG 2.1 AA compliance: overlay has proper ARIA roles, all interactive elements are keyboard-navigable and screen-reader accessible, focus is trapped in the overlay
- **SC-008**: Users can complete a search and navigate to a result (from overlay open to result click) in under 10 seconds under normal network conditions

## Scope Boundary

### In Scope
- CRD SearchOverlay component (full-viewport animated overlay replacing MUI DialogWithGrid)
- CRD SearchContext (open/close/toggle state, initial query/scope passing)
- Cmd+K / Ctrl+K keyboard shortcut listener (global, wired into CRD header)
- CRD result cards: SpaceCard (reused from spaces migration), PostResultCard, ResponseResultCard, UserResultCard, OrgResultCard
- CRD SearchCategorySidebar with scroll tracking + mobile pill tabs
- CRD per-section filter dropdowns (DropdownMenu from shadcn/ui)
- CRD SearchTagInput (input with tag chips)
- CRD ScopeDropdown (All Spaces / current space toggle)
- Empty, loading, and no-results state components
- Data mappers in `src/main/search/` wiring existing hooks to CRD component props
- New `crd-search` i18n namespace with 6 language files
- Route/component toggle based on `useCrdEnabled`


### Out of Scope
- GraphQL layer changes — `SearchQueries.graphql`, `useSearchViewState`, `useSearchTerms` reused as-is
- Backend search changes (indexing, ranking, relevance scoring)
- SearchBar / PlatformSearch header components (existing trigger preserved; Cmd+K is additive)
- Space-scoped search page variant (separate concern)
- Changes to the MUI SearchDialog (it remains unchanged as the default)

## Design Decisions (Resolved)

- **Overlay vs Dialog**: Full-viewport overlay with backdrop blur (matching prototype), not a floating MUI dialog. The overlay is centered within a 10-col grid on desktop, full-screen on mobile.
- **Categories**: 5 UI categories mapped from the backend's 5 search result sets: **Spaces** = `spaceResults`; **Posts** = `calloutResults` + `framingResults` (interlaced, preserving the current "Collaboration Tools" merging pattern — callouts are top-level content items, framings are their embedded whiteboards/memos); **Responses** = `contributionResults` (user contributions/replies to callouts); **Users** = `actorResults` filtered to USER type; **Organizations** = `actorResults` filtered to ORGANIZATION type. The Posts filter (All/Whiteboards/Memos) applies to the framing content types within the merged set. The Responses filter (All/Posts/Whiteboards/Memos) applies to contribution types.
- **Animation**: CSS transitions with Tailwind classes for overlay entrance/exit animations (scale + opacity + translate). The project does not depend on `motion/react`; adding ~30KB for a single overlay animation is not justified when CSS transitions achieve the same visual effect.
- **Scope mechanism**: Dropdown in the search bar (matching prototype), replacing MUI chip-based scope display. Only visible when inside a space.
- **SearchContext**: New context provider for open/close/toggle state, allowing Cmd+K and header triggers to open search without URL manipulation. URL params still supported for backward compatibility.

## Clarifications

### Session 2026-04-08

- Q: How do the backend's 5 search result sets map to the 5 UI categories? → A: Posts = calloutResults + framingResults (interlaced); Responses = contributionResults; Users/Organizations = actorResults split by type.

## Assumptions

- The CRD toggle mechanism and `CrdLayoutWrapper` are already implemented and working from the spaces page migration
- All GraphQL hooks used by the current MUI search (`useSearchViewState`, `useSearchTerms`, search query, scope query) are stable and can be reused without modification
- The CRD header and footer (layout shell) are already migrated and functional
- Overlay animations use CSS transitions with Tailwind classes (no new dependencies needed)
- Prototype components in `prototype/src/app/components/search/` are usable as visual and structural references for building CRD components
- The existing `SpaceCard` CRD component from the spaces migration can be reused or adapted for space search results
- Global MUI dialogs (PendingMemberships, DirectMessage, etc.) will continue to work alongside the CRD search overlay
