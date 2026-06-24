# Feature Specification: Innovation Hub UI — searchable, lazy-loaded, smaller Space cards

**Feature Branch**: `story/9910-innovation-hub-ui`
**Created**: 2026-06-24
**Status**: Clarified (clarify loop: 2 iterations, 0 remaining ambiguities)
**Input**: GitHub story alkem-io/client-web#9910 "Innovation Hub UI" — "As a VNG Lead, I want my innovation hub with 25 Spaces to look nice." Acceptance criteria: smaller Space cards; apply filtering and/or search. Design ported from `client-web-prototype` Innovation Hub demo (route `/innovation-hub/:slug`, demo slug `vng-innovation-hub`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse a large hub without an overwhelming wall of cards (Priority: P1)

A VNG Lead (or any visitor) opens an Innovation Hub home page that lists 25 curated Spaces. Instead of every card rendering at once in a heavy three-column grid, the page shows a compact, denser grid of the smaller explore-spaces Space cards, with only an initial batch rendered and a "Load more" control to reveal the rest progressively.

**Why this priority**: This is the headline complaint in the story ("with 25 Spaces to look nice") and the first acceptance criterion ("Smaller Space cards"). It delivers value on its own: even with no search, a hub of 25 Spaces immediately looks tidier and loads lighter.

**Independent Test**: Open a hub with > 12 Spaces. Verify the Spaces render as the compact explore-spaces card in a denser auto-fill grid, that only the first batch is shown, that a "Load more" control appears, and that clicking it appends the next batch until all Spaces are visible (at which point the control disappears).

**Acceptance Scenarios**:

1. **Given** a hub with 25 Spaces, **When** the page loads, **Then** the first batch (12) of Spaces renders as compact cards and a "Load more" control is shown.
2. **Given** the first batch is visible, **When** the user clicks "Load more", **Then** the next batch is appended below the existing cards (no scroll jump to top) and the running count reflects the now-visible total.
3. **Given** all Spaces are visible, **When** there are no more to load, **Then** the "Load more" control is not rendered.
4. **Given** a hub with ≤ 12 Spaces, **When** the page loads, **Then** all Spaces render and no "Load more" control is shown.

---

### User Story 2 - Find a specific Space within the hub by searching (Priority: P2)

The VNG Lead wants to locate one Space among the hub's 25 without scrolling. They type into a search field at the top of the Spaces section; the grid narrows to Spaces whose name (and other indexed text) matches the terms, and a results counter shows how many of the total match.

**Why this priority**: This is the second acceptance criterion ("Apply filtering and/or search?"). It is layered on top of P1 — searching only makes sense once the compact, batched grid exists — but is independently valuable and independently testable.

**Independent Test**: Open a hub with multiple Spaces. Type a term matching a subset; verify the grid narrows to matching Spaces, the counter updates, the lazy-load batch resets to the first batch of the filtered set, and clearing the search restores the full list.

**Acceptance Scenarios**:

1. **Given** a hub showing all its Spaces, **When** the user types a search term matching a subset of Space names, **Then** only matching Spaces are shown and the results counter reflects the matched count.
2. **Given** an active search, **When** the user clears the search terms, **Then** the full hub Space list is restored with the lazy-load batch reset to the first batch.
3. **Given** a search term that matches no Spaces, **When** results resolve, **Then** an empty state is shown (with the option to clear the search) instead of an empty grid.
4. **Given** a search that returns more than one batch of matches, **When** results render, **Then** only the first batch shows and "Load more" pages through the matched set.

---

### User Story 3 - Hub admin curation and ordering are preserved (Priority: P3)

A hub admin has curated and ordered a specific set of Spaces (a "list" hub), or configured the hub to show every Space of a given visibility (a "visibility" hub). The new searchable, batched UI must continue to honor exactly that configured set and, for list hubs, the admin's chosen order — search and lazy-loading operate only within the hub's own Spaces, never the whole platform.

**Why this priority**: This is a correctness guardrail rather than a new user-facing capability, so it is lower priority — but it must not regress. The hub must never leak non-hub Spaces into search or "Load more".

**Independent Test**: For a list hub, verify the rendered order matches the admin order and only curated Spaces appear (before and during search). For a visibility hub, verify only Spaces of the configured visibility appear. In both, verify search and "Load more" never surface a Space outside the hub set.

**Acceptance Scenarios**:

1. **Given** a "list" hub with a curated, ordered set, **When** the page loads, **Then** Spaces appear in the admin-defined order and no non-curated Space is shown.
2. **Given** a "visibility" hub, **When** the page loads, **Then** only Spaces matching the hub's configured visibility filter are shown.
3. **Given** any hub, **When** the user searches or clicks "Load more", **Then** results are drawn only from the hub's own Space set, never the platform-wide Spaces explorer.

---

### Edge Cases

- **Empty hub**: A hub with zero configured Spaces shows the existing empty state ("No Spaces have been added to this hub yet."), not a search box over an empty grid. The search affordance is hidden when the hub has no Spaces at all.
- **Hub with exactly the batch size**: A hub with exactly 12 Spaces shows all of them and no "Load more".
- **Search narrows below the batch size**: When a search reduces matches below one batch, all matches show and "Load more" is hidden.
- **Spaces still loading**: While the hub's Spaces query is in flight, the Spaces section shows skeleton cards (existing behavior) rather than an empty state or a search over nothing.
- **Whitespace-only / no search terms**: Treated as "no active search" — the full hub list is shown.
- **Search input with multiple terms**: Multiple tag-style terms are combined (a Space matches if it satisfies the combined-terms semantics used by the explore-spaces search input — a Space matches when every entered term is found in its searchable text).
- **Curated Space removed/inaccessible**: A curated id that no longer resolves to a Space is silently dropped (existing mapper behavior); it never appears as a broken card.
- **Very long Space / hub names**: Card and counter text truncate/wrap per the existing compact card styling; no layout overflow.
- **Keyboard-only and screen-reader users**: Search input, results counter, and "Load more" are reachable, labeled, and announce state changes per WCAG 2.1 AA.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Innovation Hub home page MUST render the hub's Spaces using the compact ("smaller") explore-spaces Space card (`SpaceCard` / `SpaceCardData`), replacing the current static three-column grid.
- **FR-002**: The Spaces section MUST present the Spaces in a denser, responsive auto-fill grid consistent with the explore-spaces grid treatment, rather than the current fixed 1/2/3-column grid.
- **FR-003**: The Spaces section MUST provide a search input that filters the hub's Spaces by case-insensitive substring match against each Space's `name`, `description`, and `tags`, AND-combining multiple entered terms. The search input is shown only when the hub has at least one Space.
- **FR-004**: Search MUST be scoped exclusively to the hub's own configured Space set — never the platform-wide Spaces explorer.
- **FR-005**: The Spaces section MUST render only an initial batch of Spaces and provide a "Load more" control that appends the next batch on activation, until all (filtered) Spaces are shown.
- **FR-006**: The "Load more" control MUST be hidden when there are no further Spaces to reveal (initial set ≤ batch size, or all batches already shown).
- **FR-007**: Activating a new search (changing the search terms) MUST reset the visible batch to the first batch of the filtered results.
- **FR-008**: The Spaces section MUST display a results counter indicating how many Spaces are currently shown/matched relative to the hub's set, consistent with the explore-spaces "Showing N" treatment.
- **FR-009**: When a search matches no Spaces, the Spaces section MUST show an empty state (with an affordance to clear the search), not an empty grid.
- **FR-010**: While the hub's Spaces are loading, the Spaces section MUST show skeleton cards (preserving the existing `spacesLoading` behavior); the hub banner/header/description MUST render immediately and independently of the Spaces query.
- **FR-011**: For a "list" hub, the rendered Space order MUST match the admin-curated order; for a "visibility" hub, only Spaces matching the configured visibility filter MUST be shown — both before and during search/lazy-load.
- **FR-012**: All new user-visible strings (search placeholder, results counter, "Load more", empty-search state, accessibility labels) MUST be added to the CRD i18n layer with key parity across all six supported locales (en, nl, es, bg, de, fr); existing explore-spaces / common keys MUST be reused where an equivalent label already exists rather than duplicated.
- **FR-013**: The presentational Spaces-section UI MUST be a CRD component: no MUI/Emotion, no GraphQL/domain/auth/routing imports, plain-TypeScript props, behavior delivered via callback props, styling via Tailwind + semantic typography tokens only.
- **FR-014**: All business logic — resolving the hub's Space set, mapping to card data, and any state that depends on data — MUST live in the integration layer under `src/main/crdPages/innovationHub/`, not in the CRD component.
- **FR-015**: The search/lazy-load affordances, the results counter, and the "Load more" control MUST meet WCAG 2.1 AA: labeled controls, keyboard operability, visible focus, busy/loading state announcements.
- **FR-016**: Existing hub home behaviors not in scope of this story (banner, full-width toggle, settings link, "Browse all Spaces" CTA, banner overlay, page title, breadcrumb) MUST be preserved unchanged.

### Key Entities *(include if feature involves data)*

- **Innovation Hub**: The branded container being viewed. Has a type — "visibility" (shows all Spaces of a configured `spaceVisibilityFilter`) or "list" (shows a curated, ordered `spaceListFilter` of Space ids). Carries header data (name, tagline, description, banner) already mapped by the existing header mapper.
- **Hub Space (Space card)**: A Space belonging to the hub, presented as compact card data (`SpaceCardData`: id, name, href, banner/avatar visuals, parent, privacy, etc.). The set is the hub's configured Spaces only.
- **Spaces-section view state**: Visual/interaction state of the Spaces section — current search terms and the visible batch count (lazy-load cursor), plus derived counters. Per CRD discipline these are visual state local to the presentational component; the data (the full ordered `SpaceCardData[]`) flows in as a prop.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a hub with 25 Spaces, the initial render shows at most one batch (12) of compact Space cards plus a "Load more" control — not all 25 at once.
- **SC-002**: A user can find a specific Space in a 25-Space hub by typing part of its name and seeing the grid narrow to matching Spaces, in a single interaction (no page reload, no navigation away).
- **SC-003**: 100% of Spaces shown — initially, via search, and via "Load more" — belong to the hub's configured Space set; zero non-hub Spaces ever appear.
- **SC-004**: For a list hub, the displayed order of curated Spaces exactly matches the admin-configured order on first render.
- **SC-005**: The new Spaces-section UI passes the repo's full local gate (tests, production build, lint/format/typecheck) with zero failures and zero forbidden imports in `src/crd/`.
- **SC-006**: All new strings exist in all six locale files for the relevant CRD namespace(s) with full key parity (no key present in one locale and missing in another).
- **SC-007**: Search, results counter, and "Load more" are operable by keyboard alone and expose appropriate accessible names and state (verified against WCAG 2.1 AA criteria).

## Assumptions

- **A-001**: The hub's full Space set is already resolved in memory by the existing integration hook (`useInnovationHubHomeData` → `useDashboardSpacesQuery` + `mapInnovationHubSpaces`); there is no server-side pagination for hub Spaces. Therefore search + batching are performed **client-side** over the already-mapped `SpaceCardData[]`, for both hub types. (Confirmed by reading the existing hooks/mappers; recorded as a decision in Clarifications.)
- **A-002**: The batch size of 12 from the prototype (`BATCH_SIZE = 12`) is adopted as the initial/load-more increment.
- **A-003**: The compact `SpaceCard` already in `src/crd/components/space/SpaceCard.tsx` is the "smaller" card the story asks for; no new card component is needed.
- **A-004**: The Innovation Hub home is reachable in this repo via the `/hub/<slug>` path route and hub subdomains (rendered by `CrdInnovationHubHomePage`). The prototype's `/innovation-hub/:slug` route is the design reference, not a routing change to make here. (The `/innovation-hubs/*` listing route was product-dropped per repo CLAUDE.md and is out of scope.)
- **A-005**: "Filtering and/or search" in the acceptance criteria is satisfied by **search** (primary). A full membership/privacy/type filter dropdown is out of scope for a single curated hub set; the decision is recorded in Clarifications.
- **A-006**: Reuse over reinvention: the existing `SpaceExplorer` component and its sub-patterns (TagsInput search, results counter, "Load more") are the canonical source; the hub Spaces section adapts/extracts from them rather than hand-rolling new search/load-more UI.

## Clarifications

### Session 2026-06-24

- **Q: Should search & pagination be client-side or server-side for hub Spaces?** → **A: Client-side**, over the already-resolved `SpaceCardData[]`. Rationale: the existing `useInnovationHubHomeData` hook already fetches the hub's entire configured Space set in one `useDashboardSpacesQuery` and the mapper resolves it to a complete ordered list in memory — there is no cursor/pageInfo to page through. A hub is a bounded, curated set (the story's example is 25), so client-side `slice`-based batching and substring/term matching are sufficient, simpler, and avoid a new server query. This differs intentionally from `useSpaceExplorer` (which is server-paginated because the platform-wide Spaces set is unbounded).

- **Q: Reuse `SpaceExplorer` verbatim, or extract its search/load-more sub-pattern?** → **A: Extract/adapt, do not mount `SpaceExplorer` verbatim.** `SpaceExplorer` bakes in a page header (`spaces.title` / `spaces.subtitle`), a 3-section filter dropdown (membership/privacy/type), and `crd-exploreSpaces` page-level copy that do not belong on a hub home. The hub Spaces section reuses the *patterns and visual treatment* (TagsInput search with search icon, "Showing N" counter, auto-fill grid, "Load more" with `crd-common:loadMore`, dashed empty state) inside the existing `InnovationHubHome` Spaces section, driven by props/visual-state — keeping CRD purity. Shared, presentation-only sub-pieces already exist as primitives (`TagsInput`, `Button`, `SpaceCard`, `SpaceCardSkeleton`); they are composed directly rather than duplicating `SpaceExplorer`.

- **Q: Where does the batch/search visual state live (component vs. container)?** → **A: In the CRD presentational component as visual-only `useState`** (`searchTerms`, `visibleCount`), mirroring the prototype. The component receives the full ordered `SpaceCardData[]` as a prop and derives the filtered+sliced view internally. This is permitted CRD visual state (it does not fetch, mutate, or know about GraphQL/routing) and avoids threading callbacks for what is purely client-side display paging. The integration container continues to own data fetching/mapping only.

- **Q: Do filters (membership/privacy/type) ship in this story?** → **A: No.** The story asks for "filtering and/or search"; search satisfies it. A curated single-hub set does not benefit from membership/privacy/type filters the way the platform explorer does, and adding the dropdown would pull in `crd-exploreSpaces` filter copy and server-side membership semantics that don't apply to a hub. Search-only keeps scope tight and the UI clean. (Recorded so `/speckit-analyze` does not flag the dropped second acceptance-criterion option.)

- **Q: Which i18n namespace gets the new strings?** → **A: `crd-innovationHub`** (the hub's existing namespace) for hub-specific labels, reusing `crd-common:loadMore` for the load-more button and reusing existing `crd-exploreSpaces` *semantics* only where a key is genuinely identical in meaning. New keys go under `home.spacesSection.*` to sit alongside the existing `title`/`empty`/`loading` keys. All six locales (en, nl, es, bg, de, fr) get the new keys in the same change with key parity.

- **Q: What batch size?** → **A: 12**, matching the prototype's `BATCH_SIZE`. Defined as a single named constant in the integration/component so it is not magic-numbered.

- **Q: What fields does client-side search match against?** → **A: `name`, `description`, and `tags`** of each `SpaceCardData` — a case-insensitive substring match, requiring that *every* entered term match at least one of those fields (combined-AND across terms). Rationale: `SpaceCardData` carries exactly `name`, `description`, `tags[]` as searchable text; the prototype's hub demo searches name + description + tags; AND-combining multiple tag-style terms matches the explore-spaces search input mental model. No server `search` query is involved (per A-001).

- **Q: Is the search input shown when the hub has zero Spaces?** → **A: No.** When the hub's configured set is empty, only the existing empty state ("No Spaces have been added to this hub yet.") is shown — the search box is suppressed (nothing to search). The search input renders only when the hub has at least one Space. The *no-match* empty state (search active, hub non-empty, zero matches) is distinct: it keeps the search box and shows a "no results / clear search" empty state (FR-009).

- **Q: Which "Load more" label is used?** → **A: `crd-common:loadMore`** ("Load More"), the existing shared key already used by `SpaceExplorer`. No new load-more label key is created.
