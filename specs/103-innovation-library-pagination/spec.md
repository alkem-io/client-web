# Feature Specification: Paginated Innovation Library (Client Adoption)

**Feature Branch**: `crd-fixes-innovation-library` *(no new branch — spec name tracked via `SPECIFY_FEATURE=103-innovation-library-pagination`)*

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "read the last spec in the server (../server/specs/101-innovation-library-pagination) this will implement the client side. Don't switch to a new branch we'll use the env var to keep the spec name"

## Context

The Innovation Library page (`/innovation-library`) shows two browsable
collections: **Templates** (every template contributed by listed Innovation
Packs, paired with its pack) and **Innovation Packs** (the listed packs
themselves). Today the client loads **both collections in full** in a single
request and then narrows the templates **in the browser** by type. As the
platform's catalogue grows, this single request gets heavier, the first render
slows down, and the user's device receives and holds data it may never display.

The matching **server** feature (`server/specs/101-innovation-library-pagination`,
non-breaking and already specified) adds **cursor-paginated** ways to browse both
collections alongside the existing unpaginated lists, following the platform's
documented cursor-pagination pattern (`docs/Pagination.md`):

- `Library.templatesPaginated(first, after, filter)` → a bounded page of template
  results (`total`, `templateResults`, `pageInfo`), composing with the existing
  template-type filter.
- `Library.innovationPacksPaginated(first, after)` → a bounded page of packs
  (`total`, `innovationPacks`, `pageInfo`).

Both reuse the shared relay-style `PaginationArgs` (`first`, `after`, `last`,
`before`) where `after`/`before` are **opaque cursors** (the `startCursor` /
`endCursor` returned in `pageInfo`). Page size defaults to 25 and is capped at
100. **Both fields page in a fixed insertion order, newest-first (descending) —
there is no display-name, provider, template-count, or random ordering on the
paginated fields** (those orderings remain only on the existing unpaginated
fields, which this page stops using). Fetching the next page means passing the
previous page's `endCursor` as `after`.

This specification covers the **client** side only: adopting these cursor-paginated
fields on the CRD Innovation Library page (`src/main/crdPages/innovationLibrary/`),
replacing "load everything then filter in the browser" with "load a page at a
time, filter on the server, and let the user fetch more on demand."

## Clarifications

### Session 2026-06-02

- Q: The server's paginated fields page newest-first only (no alphabetical /
  by-template-count / sort options); the page currently shows templates
  alphabetically. How should the client handle ordering? → A: Accept newest-first
  for both sections, with no sort control. Fully adopt pagination; the current
  alphabetical template order is dropped in favour of matching the server
  contract. (Removes the earlier ordering-controls story and any default-ordering
  requirements.)
- Q: Cursor pagination can throw a stale-cursor error mid-browse if an item is
  removed (the server errors rather than returning an empty page). How should the
  page recover when "Load More" hits a stale cursor? → A: Silently reset that
  section to its first page with fresh cursors and continue; do not surface a hard
  error.
- Q: The paginated responses include a total count per collection — should the
  client surface it? → A: Yes — show the total in each section and indicate how
  many remain via the "Load More" affordance.
- Q: How should additional pages be requested — explicit control or infinite
  scroll? → A: An explicit **"Load More"** control per section, matching the
  existing CRD pattern (`crd-exploreSpaces` "Load More" / `SpaceExplorer`).
  Infinite scroll is a possible later enhancement and does not change the data
  contract.
- Q: Does the unpaginated `templates` / `innovationPacks` list stay in the client
  query? → A: No — the page migrates fully to the paginated fields and stops
  requesting the unbounded lists. The server keeps the unpaginated fields for
  other consumers.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse library templates without loading the whole catalogue (Priority: P1)

A person opening the Innovation Library sees a first batch of templates almost
immediately — the most recently added first — together with how many templates
exist in total, rather than waiting for the entire catalogue to download. When
they want to see more, they ask for the next batch and it appends to what they
are already viewing.

**Why this priority**: Templates are the largest, fastest-growing collection and
the main cause of the heavy first load today. Paginating them on the client
delivers the bulk of the performance benefit and is a viable standalone slice.

**Independent Test**: Open the page against a library with more templates than
one page. Confirm only a bounded first batch is rendered newest-first, the total
count is shown, and a "Load More" control appears. Activate it and confirm the
next distinct batch appends with no duplicates and no gaps, and that the control
disappears once the last batch is shown.

**Acceptance Scenarios**:

1. **Given** a library with more templates than one page, **When** the page
   loads, **Then** only a page-sized batch of templates is displayed, ordered
   newest-first, along with the total number of templates available.
2. **Given** a displayed batch that is not the last, **When** the user requests
   more, **Then** the next distinct batch (continuing from the previous batch's
   end cursor) is appended below the current one with no template repeated or
   skipped.
3. **Given** the user has loaded the final batch, **When** the page reflects
   this (no further pages), **Then** no "load more" affordance is offered.
4. **Given** the templates are still being fetched, **When** the first batch has
   not yet arrived, **Then** a loading placeholder is shown; subsequent batches
   show a non-blocking loading indicator without clearing the already-visible
   templates.

---

### User Story 2 - Filter templates by type with server-side paging (Priority: P1)

A person narrows the templates to a specific type (e.g. Callout, Space,
Whiteboard). The count and the batches they page through reflect **only** the
chosen type, and the filtering is applied by the server rather than hidden behind
a full in-browser download.

**Why this priority**: The page must keep its existing type-filter behaviour, and
once paging is server-driven the filter must move to the server too — otherwise
totals and "load more" would be wrong. It is inseparable from US1 for a correct
experience.

**Independent Test**: Select a template type, confirm the displayed total and the
first batch reflect only that type, page through additional batches and confirm
they stay within the filter, then clear the filter and confirm the view resets to
the first batch of the full set.

**Acceptance Scenarios**:

1. **Given** a template-type filter is selected, **When** the templates load,
   **Then** the total and every batch reflect only templates of that type.
2. **Given** the user is several batches into a filtered list, **When** they
   change or clear the filter, **Then** paging resets to the first batch of the
   newly filtered (or unfiltered) set and previously appended batches are
   discarded.
3. **Given** a filter that matches no templates, **When** it is applied, **Then**
   an empty-state message is shown, the total reads zero, and no "load more"
   affordance appears.

---

### User Story 3 - Browse innovation packs a page at a time (Priority: P2)

A person scrolling the Innovation Packs section sees a first batch of packs
(newest-first) rather than every pack at once, and can load more on demand.

**Why this priority**: Packs are fewer than templates today, so the immediate
load pressure is lower, but paginating them keeps the page consistent and
future-proofs it as the store grows. It is independent of the template work.

**Independent Test**: Open the page against a library with more packs than one
page, confirm only a bounded batch is shown with a total and a "Load More"
control, activate it, and confirm the next batch appends newest-first without
duplicates.

**Acceptance Scenarios**:

1. **Given** more packs than one page, **When** the section loads, **Then** only
   a page-sized batch is shown newest-first, with the total number of listed
   packs.
2. **Given** a displayed batch that is not the last, **When** the user requests
   more, **Then** the next batch (continuing from the previous end cursor)
   appends newest-first with no pack repeated or skipped.
3. **Given** the last batch is shown, **When** the page reflects this, **Then**
   no further "load more" affordance is offered.

---

### User Story 4 - Filter each section by a search term (Priority: P2)

A person types a word into a search box above the Innovation Packs section, or
beside the template type filter, and the section narrows to items whose name,
description, or tags contain that term — applied **on the server**, so the total,
the batches, and "Load More" all reflect the searched (and, for templates, also
type-filtered) set rather than just the pages already downloaded.

**Why this priority**: Search makes a growing catalogue navigable, but the core
pagination (US1–US3) is independently shippable first. Search is additive on top
and reuses the same server-filter + reset-paging machinery as the type filter.

**Independent Test**: Type a term in the Packs search and confirm the total and
first batch reflect only matching packs; page within the search and confirm it
stays within the term; clear it and confirm the full set returns. Repeat for the
Templates search, and confirm a term + a type filter together return only the
intersection.

**Acceptance Scenarios**:

1. **Given** a search term in a section, **When** results load, **Then** the total
   and every batch reflect only items whose title, description, or tags contain the
   term (case-insensitive substring); provider name is not matched.
2. **Given** a templates search term and an active type filter, **When** templates
   load, **Then** only the intersection (matching term AND chosen types) is shown,
   counted, and paged.
3. **Given** the user is several batches into a searched list, **When** they change
   or clear the term, **Then** paging resets to the first batch of the new query and
   previously appended batches are discarded.
4. **Given** a blank or whitespace-only term, **When** it is applied, **Then** it
   behaves as no text filter (the otherwise-filtered set is returned in full).
5. **Given** a term matching nothing, **When** it is applied, **Then** the empty
   state is shown, the total reads zero, and no "Load More" appears.

---

### Edge Cases

- **First load empty**: An empty library (or empty section) shows the existing
  empty-state message, a total of zero, and no "load more" control.
- **Last page reached**: When the loaded batches cover the whole (filtered)
  collection (`hasNextPage` is false), the "load more" control is hidden — never
  shown as a no-op.
- **Filter change mid-browse**: Changing the type filter while several batches
  are loaded discards the appended batches and restarts from the first batch of
  the new query; data is not mixed across filters.
- **Stale / invalid cursor**: If a "load more" request fails because its cursor
  no longer resolves (an item was removed mid-browse, so the server returns an
  error rather than an empty page), the affected section silently refetches from
  its first page with fresh cursors and continues — the user is not shown a hard
  error.
- **Conflicting paging direction**: The client only ever pages forward
  (`first` + `after`); it never sends forward and backward arguments together, so
  the server's mutually-exclusive-direction validation is never tripped.
- **Slow subsequent page**: While a "load more" request is in flight, the
  already-visible items remain; the control shows a busy/disabled state and does
  not trigger duplicate requests on repeated activation.
- **Preview during paging**: Selecting a template to preview continues to work
  regardless of how many batches are loaded and does not interrupt or reset
  paging.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Innovation Library page MUST load templates through the server's
  cursor-paginated templates capability, requesting a bounded first page rather
  than the entire template collection.
- **FR-002**: The page MUST provide a way to load additional pages of templates on
  demand by requesting the next page with the previous page's end cursor,
  appending each newly fetched page to the templates already shown without
  re-fetching or re-rendering the earlier ones.
- **FR-003**: The page MUST display, for each section, a progress count of the
  form **"X of T"** — the number of items currently loaded (X) out of the total in
  the currently displayed (optionally filtered) collection (T) — shown adjacent to
  the "Load More" control, so the user can see how much remains. When the last
  page is loaded (X equals T) the count still reads "T of T" while the "Load More"
  control is hidden (FR-008).
- **FR-004**: The page MUST send the selected template-type filter to the server
  as part of the paginated request, so that the total, the batches, and the "load
  more" behaviour all reflect the filtered set. In-browser type filtering of a
  fully-downloaded list MUST be removed.
- **FR-005**: The page MUST load innovation packs through the server's
  cursor-paginated packs capability, requesting a bounded first page and
  supporting load-more (next page via the previous end cursor) in the same way as
  templates.
- **FR-006**: The page MUST present both collections in the server's fixed
  newest-first order and MUST NOT offer any client-side or server-side sort
  control on the paginated sections (the paginated fields expose no ordering
  options).
- **FR-007**: Changing the template-type filter MUST reset paging to the first
  page for the templates collection and discard previously appended template
  pages.
- **FR-008**: The page MUST hide (not merely disable) the "load more" affordance
  for a collection once the last page has been loaded, based on the server's page
  information (`hasNextPage`) indicating no further pages.
- **FR-009**: The Innovation Library page MUST stop requesting the server's
  unpaginated template and innovation-pack list fields; it MUST rely solely on the
  paginated fields. (The unpaginated fields remain in the schema for other
  consumers.)
- **FR-010**: The existing template-preview-on-select behaviour MUST be preserved:
  selecting a template still opens its preview dialog and lazily fetches its
  content, irrespective of how many pages are loaded.
- **FR-011**: The page MUST show a first-load placeholder while the initial page
  is loading and a non-blocking, non-duplicating busy indicator while a subsequent
  page is loading, without clearing already-visible items.
- **FR-012**: The page MUST request bounded pages — a client page size of 15 (3
  rows of 5 cards on wide screens), never exceeding the server's maximum page size
  — rather than attempting to request the whole collection in one page.
- **FR-013**: The page MUST present empty results (no items, total zero) using the
  existing empty-state messaging for each section, with no "load more" affordance.
- **FR-014**: When a "load more" request fails because its cursor is stale or
  invalid (an item was removed mid-browse), the page MUST recover by silently
  refetching the affected section from its first page with fresh cursors, rather
  than surfacing a hard error or leaving the section stuck.
- **FR-015**: The page MUST provide a free-text search input per section — one
  above/beside the **Innovation Packs** section, one to the right of the template
  **type** filter — and MUST send the entered term to the server as part of the
  paginated request (templates: `LibraryTemplatesFilterInput.searchTerm`; packs:
  `LibraryInnovationPacksFilterInput.searchTerm`), so the total, the batches, and
  the "Load More" all reflect the searched set. No client-side filtering of a
  fully-downloaded list is introduced.
- **FR-016**: For templates the search term MUST compose with the template-type
  filter (server-side intersection): total and pages reflect items matching the
  term AND the selected types.
- **FR-017**: Changing the search term (for either section) MUST reset paging to
  the first page for that section and discard previously appended pages. A blank or
  whitespace-only term MUST be sent as "no term" (omitted), behaving as no text
  filter.
- **FR-018**: The search input MUST be debounced so a request is issued only after
  the user pauses typing, not on every keystroke; the already-visible items remain
  until the new first page arrives.

### Key Entities *(include if feature involves data)*

- **Template page (cursor connection)**: A bounded, newest-first slice of library
  template results currently displayed, plus the total count, the end cursor for
  fetching the next page, and whether more pages exist.
- **Innovation-pack page (cursor connection)**: A bounded, newest-first slice of
  listed packs currently displayed, plus the total count, the end cursor, and
  whether more pages exist.
- **Template-type filter**: The currently-selected set of template types, applied
  server-side to the template pagination.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The initial Innovation Library view renders from a bounded first
  page of each collection (at most the default page size), regardless of how many
  templates or packs exist in total.
- **SC-002**: The amount of data the page fetches and holds for its first render
  does not grow as the total number of templates or packs in the library grows.
- **SC-003**: A user can reach any template or pack in the library by loading
  successive pages, observing each item exactly once with no duplicates or
  omissions for a collection that is not changing.
- **SC-004**: When a template-type filter is active, the displayed total and the
  set reachable by paging exactly match the filtered collection — no out-of-type
  templates appear and the count is the filtered count.
- **SC-005**: The page no longer issues the unbounded library list request;
  network inspection shows only bounded cursor-paginated requests for this page.
- **SC-006**: Selecting any loaded template opens its preview with content, with
  the same success rate as before this change.

## Assumptions

- **Server feature shipped first**: The cursor-paginated server fields from
  `server/specs/101-innovation-library-pagination` are available before this
  client work is implemented. The client adopts them; it does not define the API.
- **Cursor pagination, newest-first, no sort**: The paginated fields use the
  shared relay-style `PaginationArgs` and page in a fixed newest-first order. The
  client pages forward only (`first` + `after`), accepts newest-first as the only
  order, and offers no sort control.
- **Load-more, not infinite scroll**: Additional pages are fetched via an explicit
  "Load More" control per section. Infinite scroll is a possible later enhancement
  and does not change the data contract.
- **Page size**: The client requests a page size of 15 (3 rows of 5 cards on wide
  screens) and never more than the server maximum (100).
- **Scope is the CRD page**: The page being migrated is the CRD Innovation Library
  page under `src/main/crdPages/innovationLibrary/`. The legacy MUI Innovation
  Library page is out of scope and keeps its current behaviour until it is retired.
- **No new branch**: Per the request, no new git branch is created. The current
  branch (`crd-fixes-innovation-library`) is reused and the spec is associated via
  `SPECIFY_FEATURE=103-innovation-library-pagination`.
- **Preview/pack-card behaviour unchanged**: Template preview, pack cards linking
  to pack/provider profiles, and the section layout are unchanged except for how
  their data is fetched and their newest-first ordering.

## Out of Scope

- Any server-side change (defined and delivered by
  `server/specs/101-innovation-library-pagination`).
- The legacy MUI Innovation Library page.
- Any user-facing sort control on the paginated sections — the server's paginated
  fields offer no ordering options (newest-first only); field-based ordering is a
  deferred server-side future upgrade.
- Ranked / fuzzy / typo-tolerant search and per-field search operators (the server
  offers only a plain case-insensitive substring term over title/description/tags;
  the client adopts that as-is).
- Searching by provider name (intentionally excluded by the server feature).
- Removing or altering the server's unpaginated list fields (other consumers
  still use them).
- New filtering dimensions beyond the existing template-type filter.
