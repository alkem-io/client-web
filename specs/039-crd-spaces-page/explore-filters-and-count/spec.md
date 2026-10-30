# Sub-spec: Explore Spaces — filters, batches and counter

**Parent**: [`039-crd-spaces-page`](../spec.md) — Explore Spaces (`/spaces`) and the logged-out dashboard, which
renders the same `SpaceExplorer` through the same `useSpaceExplorer` hook.
**Created**: 2026-10-29
**Branch**: `space-explorer`
**Issues**: client-web#10406, client-web#10404, alkem-io/alkemio#2130, client-web#10405 (all part of
alkem-io/alkemio#2139), client-web#9493 (filter badge and chips)

## Goal

What a visitor sees first on Explore Spaces must not mislead them. Today:

- the filters offer "Public" twice;
- the page shows a space counter that only counts the loaded spaces (87 on the first load, against 769 in total);
- "Spaces only" shows 10 cards per Load more and leaves empty grid slots, so reaching 189 spaces takes 18 clicks;
- the first cards come from only 3 spaces and their subspaces;
- a search stops at its first 10 matches.

## Root cause of the partial batches (#2130)

`spacesPaginated` pages **top-level spaces**, 10 per page. With "All", each space's subspaces are fetched and
inserted after it, so one page renders ~87 cards. Type and Privacy were filters inside the presentational component,
applied to whatever one page held: "Spaces only" dropped the subspaces and left the bare 10 (a 4-column grid then
ends on a row of 2), "Subspaces only" could add zero cards on a click, and "Private only" a handful. The "empty
cards" in the report are the empty slots of that last row. Search results had the same problem, and the Type
filter could not work on them at all: it tested `parent`, which search results never set.

## Decisions

- **One "Public" filter, under Privacy.** The Membership section's "Public" option is removed. It filtered on
  `isContentPublic` exactly like Privacy → "Public only", so results are unchanged when filtering on Public.
  Membership keeps **All** and **My Spaces**.
- **Guests do not see the Membership section.** "My Spaces" is already hidden for guests, so the section would hold
  "All" alone. Guests see Privacy and Type only.
- **All three filters show as active the same way** (#9493). Membership, Privacy and Type each add 1 to the
  Filters button's badge when not "All", and each shows a removable chip below the filters ("My Spaces", "Public
  only" / "Private only", "Spaces only" / "Subspaces only"), in menu order. Removing a chip sets that filter back to
  "All". "Clear all filters" shows whenever the badge does and resets all three.
- **No number anywhere.** The "Showing N spaces" line is removed. With a search term the line reads
  "Spaces matching “energie”" (all terms, comma-separated, quoted per language), without a count. Without a search
  term there is no line, whether or not filters are applied. A count is not shown during a search either: the
  loaded results understate it, and the server's `total` ignores the Privacy and Type filters.
- **"Spaces only" is the default Type while browsing** (#10405). It shows as the active filter (chip and badge), so
  the visitor can remove it to include subspaces. **Search ignores the default**: while a search term is set and the
  user has not chosen a Type, Type is "All", so subspaces stay findable. A Type the user picked applies to both.
  "Clear all filters" sets Type to "All".
- **Every view shows cards in batches that fill whole rows.** The grid fits as many 280px cards per row as the
  width allows (5 on a 1920px screen), so no fixed size can fill every row. `SpaceExplorer` measures how many
  columns its grid has and reports it (`onColumnsChange`); a batch is the multiple of that column count closest to
  24 (`BATCH_SIZE`): 24 with 1, 2, 3, 4 or 6 columns, 25 with 5, 21 with 7. The first load shows one batch; each
  Load more adds one. Only the last batch can leave a row part-empty. The page remembers how many batches are
  shown, not how many cards, so resizing the window re-cuts the shown cards to whole rows of the new width (loading
  more if needed). Before the first measurement, 4 columns are assumed. Cards already loaded beyond the current
  batches wait for the next Load more. This applies to every filter combination, to "My Spaces", to search, and to
  the unfiltered "All" (which used to show everything one page loaded, ~87 cards).
- **The filters run in the integration hook, and the hook loads pages until the batch is full.** Type and Privacy
  are controlled props of `SpaceExplorer` (state in `useSpaceExplorer`); the hook filters (Type by `level`, Privacy
  by `isContentPublic`) and keeps fetching server pages while fewer than `batches × batch size` cards match and the server
  has more. Load more resolves once its batch is full or the results are exhausted, so its button stays busy until
  then. A failed page stops the filling until the next Load more or the next filter/search change (each starts a
  fresh view). While more may exist, Load more stays even if no card has matched yet, and "No spaces found" is shown
  only when nothing more can be loaded — a failed page never leaves a dead-end empty state.
- **Page sizes.** "Spaces only" browses one batch of top-level spaces per page and fetches no subspaces at all, so
  one page is one batch. Other browse views keep 10 top-level spaces per page (each brings its subspaces). Search fetches 24
  results per page, by the search `cursor`; a `null` cursor means there is nothing more.
- **No reshuffling.** A top-level space is shown only once its subspaces have been fetched (or the user cannot read
  them), so subspaces never get inserted between cards that are already on screen.
- **Load more stays** (agreed on #2130). No infinite scroll.

## Functional requirements

- **FR-EX-1**: The Filters menu MUST offer "Public" once, under Privacy. Filtering on it MUST return the same spaces
  as today.
- **FR-EX-2**: The Membership section (label, options and its separator) MUST render only for signed-in users.
- **FR-EX-3**: Explore Spaces MUST NOT show a space count in any state.
- **FR-EX-4**: While at least one search term is set, the page MUST show "Spaces matching <terms>" above the results
  (`spaces.matchingTerms`, six languages). Without a search term it MUST show no results line.
- **FR-EX-5**: A search MUST be paginated by the search `cursor`.
- **FR-EX-6**: Browsing MUST default to Type = "Spaces only"; a search with no user-chosen Type MUST use "All".
- **FR-EX-7**: Every view MUST show one batch on first load and add one per Load more, a batch being the multiple of
  the grid's column count closest to 24; only the last batch may leave a row part-empty. It MUST load as many server
  pages as needed. Load more MUST remain available while more matching cards may exist.
- **FR-EX-8**: Each of the Membership, Privacy and Type filters that is not "All" MUST count 1 in the Filters
  button's badge and MUST show a chip that, when activated, sets that filter back to "All".

## Acceptance scenarios

1. **Given** a signed-in user opens Filters, **Then** Membership shows All and My Spaces, and Privacy shows All,
   Public only, Private only.
2. **Given** a guest opens Filters, **Then** there is no Membership section.
3. **Given** no search term, with or without filters, **Then** no count and no results line are shown.
4. **Given** the user searches `energie`, **Then** "Spaces matching “energie”" is shown, without a number.
5. **Given** a visitor opens Explore Spaces on a screen with 4 cards per row, **Then** "Spaces only" is active and
   24 top-level spaces are shown. **When** they press Load more, **Then** 24 more are added; with 189 spaces the
   last of 8 batches holds 21.
6. **Given** a screen with 5 cards per row, **Then** each batch is 25 cards (5 full rows).
7. **Given** a batch is shown and the window is resized to a different number of columns, **Then** the shown cards
   are re-cut to whole rows of the new width.
8. **Given** "Subspaces only" or "Private only", **When** the user presses Load more, **Then** one more batch is
   added, however many server pages that takes, unless fewer remain.
9. **Given** a search with no Type chosen, **Then** matching subspaces are listed too.
10. **Given** a signed-in user picks Membership → My Spaces, **Then** the Filters badge reads 1 and a "My Spaces"
    chip is shown. **When** they also pick Type → Subspaces only, **Then** the badge reads 2 and a "Subspaces only"
    chip is added. **When** they remove the "My Spaces" chip, **Then** Membership is "All" and the badge reads 1.

## Out of scope

- Ranking and manual weights (the rest of alkem-io/alkemio#2139).
- Showing a total count of the platform's spaces.
- Server-side Type/Privacy filters on `spacesPaginated` (would replace the client-side filling).
