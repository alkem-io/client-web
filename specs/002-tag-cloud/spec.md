# Feature Specification: Tag Cloud Filter for Knowledge Base

**Feature Branch**: `002-tag-cloud-filter`
**Created**: 2025-11-04
**Status**: Draft
**Input**: User description: "Show tag cloud on top of knowledge base"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Tag Cloud on Knowledge Base (Priority: P1)

As a space member or visitor viewing the knowledge base tab in a space, I want to see a tag cloud displaying all tags used across the callouts on that page, so that I can quickly identify the topics and themes being discussed.

**Why this priority**: This is the foundational feature that enables all subsequent filtering capabilities. It provides immediate value by giving users a visual overview of knowledge base content themes.

**Independent Test**: Navigate to any space's knowledge base tab (4th tab) and verify that a tag cloud appears at the top of the page, before the callouts list, showing all tags from callouts on that page.

**Acceptance Scenarios**:

1. **Given** I am viewing a space's knowledge base tab with callouts that have tags, **When** the page loads, **Then** I see a tag cloud at the top of the page showing all unique tags used in the callouts
2. **Given** I am viewing a space's knowledge base tab with callouts that have no tags, **When** the page loads, **Then** I see an empty state or no tag cloud displayed
3. **Given** I am viewing a space's knowledge base tab, **When** I look at the tag cloud, **Then** each tag displays the correct label from the callout's assigned tags

---

### User Story 2 - Filter Callouts by Tag (Priority: P1)

As a space member or visitor viewing the knowledge base, I want to click on a tag in the tag cloud to filter the callouts list, so that I can focus on collaboration tools related to specific topics.

**Why this priority**: This is the core interaction that delivers the filtering value. Without this, the tag cloud is purely informational.

**Independent Test**: Navigate to a space's knowledge base tab, click on any tag in the tag cloud, and verify that only callouts containing that tag in their own tag assignments remain visible, and the selected tag moves to the beginning of the list with a blue background.

**Acceptance Scenarios**:

1. **Given** I am viewing the knowledge base with multiple callouts, **When** I click on a tag in the tag cloud, **Then** only callouts that have that tag assigned to them are displayed, the tag receives a blue background (primary dark), and moves to the beginning of the tag list
2. **Given** I have clicked a tag to filter callouts, **When** I click the same tag again, **Then** the filter is removed, the tag returns to its original frequency-based position, the background becomes transparent, and all callouts are displayed again
3. **Given** I have clicked a tag to filter callouts, **When** no callouts match the selected tag, **Then** I see an appropriate empty state message
4. **Given** I have one or more tags selected, **When** I view the knowledge base, **Then** I see a results summary row between the tag cloud and the first callout showing the count (e.g., "3 results") followed by a "clear filter" text action

---

### User Story 3 - Multiple Tag Selection (Priority: P2)

As a space member reviewing knowledge base content, I want to select multiple tags simultaneously to narrow down my search, so that I can find callouts that cover multiple related topics.

**Why this priority**: This enhances the filtering capability for power users who need more precise filtering, but the feature is still valuable with single-tag filtering only.

**Independent Test**: Navigate to a space's knowledge base tab, click multiple tags in sequence, and verify that the callouts list shows only items matching ALL selected tags, all selected tags appear at the beginning with blue backgrounds, and a results summary row ("X results – clear filter") appears between the tag cloud and the first callout.

**Acceptance Scenarios**:

1. **Given** I have one tag selected, **When** I click another tag, **Then** only callouts matching both tags are displayed, both tags appear at the beginning of the list with blue backgrounds, and the results summary updates with the new count
2. **Given** I have multiple tags selected, **When** I click a selected tag again, **Then** that tag is deselected, moves back to its frequency-based position with transparent background, the results summary updates with the new count, and the filter updates to show callouts matching the remaining selected tags
3. **Given** I have multiple tags selected, **When** I click the "clear filter" action in the results summary row, **Then** all filters are removed, all tags return to their frequency-based positions with transparent backgrounds, the results summary row disappears, and all callouts are displayed
4. **Given** I have no tags selected, **When** I view the knowledge base, **Then** the results summary row with "clear filter" is not visible

---

### User Story 4 - Expand/Collapse Tag Cloud (Priority: P2)

As a space member viewing the knowledge base, I want to expand the tag cloud to see all available tags when there are more than fit in two rows, so that I can access less-common tags without losing the compact initial view.

**Why this priority**: This directly supports the core filtering functionality by making all tags accessible while maintaining a clean initial presentation.

**Independent Test**: Navigate to a space's knowledge base tab with many tags, verify that only two rows are shown initially with a "+N" chip at the end, click the "+N" chip to expand all tags, and verify the chip changes to a caret-up icon.

**Acceptance Scenarios**:

1. **Given** the tag cloud has more tags than fit in two rows, **When** I view the knowledge base, **Then** I see tags filling two rows with the last position showing a "+N" chip (gray background) indicating the count of hidden tags
2. **Given** I see the "+N" chip, **When** I click it, **Then** all tags are displayed, and the "+N" chip changes to a caret-up "^" icon chip in the last position
3. **Given** the tag cloud is expanded, **When** I click the caret-up chip, **Then** the tag cloud collapses back to two rows with the "+N" chip, and my scroll position remains stable
4. **Given** the tag cloud has tags that fit within two rows, **When** I view the knowledge base, **Then** no "+N" or caret-up chip is displayed

---

### User Story 5 - Visual Tag Selection and Ordering (Priority: P2)

As a space member interacting with the tag cloud, I want selected tags to be visually distinct and appear at the beginning of the list, so that I can easily see which filters are active.

**Why this priority**: This enhances the usability of the filtering system by providing clear visual feedback, convenient access to active filters, and an at-a-glance view of how many callouts match the current selection.

**Independent Test**: Navigate to a space's knowledge base tab, select one or more tags, and verify they move to the beginning of the list with blue backgrounds, while unselected tags remain transparent.

**Acceptance Scenarios**:

1. **Given** I click a tag, **When** it becomes selected, **Then** it moves to the beginning of the tag list and displays with a blue background (primary dark color), regardless of whether the results summary row is visible
2. **Given** I have multiple selected tags, **When** they are displayed at the beginning, **Then** they maintain their relative frequency-based order among themselves
3. **Given** I deselect a tag, **When** it becomes unselected, **Then** it returns to its original position in the frequency-sorted list and displays with a transparent background
4. **Given** tags are displayed, **When** they are not selected, **Then** they show transparent backgrounds

---

### Edge Cases

- What happens when a callout has the same tag applied multiple times? (Should appear once in tag cloud, counted once for frequency)
- How does the system handle very long tag names? (Truncate with ellipsis, full text on hover)
- What happens when there are more tags than fit in two rows? (Display tags up to two rows, with the last position showing a "+N" chip indicating hidden tags count; clicking expands to show all tags)
- How should tags be ordered in the cloud when frequency is equal? (Alphabetical order as secondary sort, but selected tags always appear first regardless of frequency)
- What happens when a user navigates away from the knowledge base tab and returns? (Filter state resets to show all callouts)
- What happens when viewing a subspace (L1+) knowledge base? (Tag cloud feature only appears on space-level knowledge base, not subspaces)
- What happens when all visible tags in the two-row limit are selected? (The "+N" chip remains visible if there are hidden tags; results summary row displays total count and "clear filter")
- How should the results summary display singular vs plural counts? (e.g., "1 result" vs "2 results")
- How does tag reordering work when selecting/deselecting tags? (Selected tags move to the beginning; deselected tags return to their frequency-based position in the sorted list)

## Requirements _(mandatory)_

This feature aligns with the Alkemio Client Web Engineering Constitution as follows:

### Domain-Driven Frontend Boundaries (Principle I)

- Tag cloud logic and filtering state will reside in `src/domain/collaboration/callout` or a new `src/domain/collaboration/knowledge-base` module
- Business rules for tag extraction, deduplication, and filtering belong in domain façades, not React components
- UI components in `src/main/topLevelPages/myDashboard/SpaceKnowledgeBasePage` (or equivalent) will consume typed hooks from the domain layer

### React 19 Concurrent UX Discipline (Principle II)

- Tag cloud rendering must be pure and concurrency-safe
- Tag filtering interactions will use `useTransition` to avoid blocking paint during filter application
- Loading states must be explicit when fetching callout data with tags
- Components must handle Suspense boundaries appropriately if data fetching patterns change

### GraphQL Contract Fidelity (Principle III)

- Must query callout tags through existing GraphQL schema
- Tag fields from callout tag assignments must be fetched via fragments
- Run `pnpm run codegen` if any new GraphQL queries or fragments are added
- UI components must use generated hooks from `src/core/apollo/generated/apollo-hooks.ts`
- Prop types must be explicitly declared, not directly exported from generated GraphQL types

### State & Side-Effect Isolation (Principle IV)

- Tag filter state will be managed through React context or Apollo cache
- No direct DOM manipulation for tag cloud rendering
- Tag click handlers must funnel through domain-layer event adapters

### Experience Quality & Safeguards (Principle V)

- Tag buttons must be keyboard-navigable (tab order, Enter/Space to activate)
- ARIA labels for selected/unselected state of tag filter buttons
- Semantic HTML for tag cloud container (`<nav>` or `<section>` with appropriate aria-label)
- Empty state messaging must be accessible
- Performance: Tag cloud rendering must not block callouts list rendering
- Tests required for tag extraction logic, deduplication, and filter application

### Functional Requirements

- **FR-001**: System MUST display a tag cloud component at the top of the knowledge base tab on space-level pages (level 0 only)
- **FR-002**: System MUST extract all unique tags from callouts visible on the knowledge base page, limited to the tags directly assigned to each callout
- **FR-003**: System MUST deduplicate tags appearing multiple times across different callouts or within the same callout
- **FR-004**: System MUST render each tag as an interactive button in the tag cloud
- **FR-005**: System MUST filter the callouts list to show only callouts containing the selected tag(s) when a user clicks a tag
- **FR-006**: System MUST determine whether a callout matches the selected tag(s) based solely on the tags assigned to that callout
- **FR-007**: System MUST toggle tag selection state when a user clicks an already-selected tag, removing the filter
- **FR-008**: System MUST support multiple tag selection, filtering callouts to show only those matching ALL selected tags (AND logic)
- **FR-009**: System MUST visually indicate selected tags with a blue background (primary dark color) and unselected tags with transparent backgrounds
- **FR-010**: System MUST move selected tags to the beginning of the tag list, before any unselected tags
- **FR-011**: System MUST maintain frequency-based ordering among selected tags when multiple tags are selected
- **FR-012**: System MUST display a results summary row between the tag cloud and the first callout whenever one or more tags are selected
- **FR-013**: The results summary row MUST surface the count of matching callouts with correct singular/plural grammar (e.g., "1 result" vs "3 results")
- **FR-014**: The results summary row MUST include a "clear filter" text action positioned after the count (e.g., "3 results – clear filter")
- **FR-015**: Clicking the "clear filter" action MUST remove all tag filters, hide the results summary row, and restore tags to their frequency-based positions
- **FR-016**: System MUST limit the initial display of tags to two rows maximum
- **FR-017**: System MUST display a "+N" chip (gray background) in the last position of the two-row layout when additional tags exist, where N is the count of hidden tags
- **FR-018**: System MUST expand to show all tags when the "+N" chip is clicked
- **FR-019**: System MUST replace the "+N" chip with a caret-up "^" icon chip when the tag cloud is expanded
- **FR-020**: System MUST collapse the tag cloud back to two rows when the caret-up chip is clicked
- **FR-021**: System MUST NOT display the "+N" or caret-up chip when all tags fit within two rows
- **FR-022**: System MUST reset filter state when user navigates away from the knowledge base tab and returns
- **FR-023**: System MUST NOT display the tag cloud on subspace knowledge base pages (level 1+)
- **FR-024**: System MUST display an appropriate empty state when no callouts match the selected tag filter(s)
- **FR-025**: System MUST handle callouts with no tags gracefully (they should not appear in filtered results)
- **FR-026**: Tag cloud MUST be responsive and adapt to different screen sizes
- **FR-027**: System MUST order unselected tags by frequency (descending), with alphabetical order as secondary sort for equal frequencies

### Key Entities

- **Tag**: A label or keyword associated with a callout through its own tag assignments; key attributes include tag name/label, frequency count, selection state, and display position
- **Callout**: A collaboration tool displayed in the knowledge base; key attributes include its tag assignments and content; relationship to tags is many-to-many via direct tagging
- **Knowledge Base Page**: The 4th tab in a space-level layout; contains a list of callouts and the tag cloud filter; exists only for spaces (level 0), not subspaces
- **Tag Filter State**: The current selection of tags used to filter the callouts list; tracks which tags are selected, manages the filtering logic, and controls the display order (selected tags first, then frequency-sorted)
- **Tag Cloud Display State**: Tracks whether the tag cloud is expanded (showing all tags) or collapsed (showing two rows); manages the visibility and behavior of the "+N" chip or caret-up chip
- **Results Summary Row**: UI element rendered between the tag cloud and the callout list when filters are active; displays the count of matching callouts and exposes the "clear filter" action
- **Clear Filter Action**: Text affordance within the results summary row that, when activated, removes all active tag filters and hides the summary row
- **Expand/Collapse Chip**: A special chip displayed in the last position; shows "+N" (gray background) when collapsed with hidden tags, or a caret-up "^" icon when expanded; clicking toggles the display state

### Assumptions

- Tags already exist in the GraphQL schema as part of callout data structures
- The knowledge base page already queries and displays callouts
- Tag data is available directly on the callout's tag assignments
- The existing callouts list component can accept a filter predicate or filtered data array
- Standard web app performance expectations apply (tag cloud render < 100ms, filter application < 200ms)
- The theme provides a "primary dark" blue color for selected tag backgrounds
- Chip components with customizable backgrounds and content are available in the design system
- Two rows of tags can accommodate varying screen sizes through responsive wrapping
- The line-height and spacing of tag chips allow for consistent two-row height calculation

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view the tag cloud on space-level knowledge base pages within 200ms of page load
- **SC-002**: Users can apply a tag filter and see filtered results within 300ms of clicking a tag
- **SC-003**: Selected tags move to the beginning of the list and update their visual state within 100ms of click
- **SC-004**: Tag cloud correctly displays all unique tags from at least 100 callouts without performance degradation
- **SC-005**: 95% of tag click interactions result in correct filtering (only callouts with matching tags are shown)
- **SC-006**: Users can successfully navigate the tag cloud using only keyboard controls (tab, enter, space) including the "clear filter" action and expand/collapse chip
- **SC-007**: Tag cloud adapts to screen sizes from mobile (320px) to desktop (1920px+) without horizontal scrolling or layout breaks, maintaining the two-row limit
- **SC-008**: Filter state correctly resets when navigating away from and returning to the knowledge base tab
- **SC-009**: The "+N" chip accurately displays the count of hidden tags when the tag cloud is collapsed
- **SC-010**: Expand/collapse interaction completes within 200ms and maintains user's visual context
- **SC-011**: Zero accessibility violations (WCAG 2.1 AA) for tag cloud interactions detected by automated tools, including the results summary row, "clear filter" action, and expand/collapse controls
- **SC-012**: Selected tags remain visible and accessible even when the tag cloud is collapsed to two rows
- **SC-013**: Results summary row updates within 150ms of any tag selection change and always displays an accurate count of matching callouts
