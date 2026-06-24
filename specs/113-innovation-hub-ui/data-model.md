# Data Model: Innovation Hub UI (story #9910)

This feature introduces **no new persisted entities** and **no GraphQL change**. The "data model" here is the view-model and component state.

## Input prop (unchanged shape)

`spaces: SpaceCardData[]` — the hub's full, ordered, already-mapped Space cards (from `mapInnovationHubSpaces`). Each `SpaceCardData` already carries the searchable text fields:

| Field | Type | Use in this feature |
|---|---|---|
| `id` | `string` | React key |
| `name` | `string` | search match field; card title |
| `description` | `string` | search match field |
| `tags` | `string[]` | search match field (joined) |
| `href` | `string` | navigation (card is an `<a>`) |
| `parent`, `isPrivate`, `visibility`, `leads`, banners/avatars … | various | rendered by `SpaceCard` as today |

`spacesLoading: boolean` — when true and no spaces yet, show skeletons.

## Component visual state (new)

In `HubSpacesSection` (CRD presentational):

| State | Type | Initial | Notes |
|---|---|---|---|
| `searchTerms` | `string[]` | `[]` | bound to `TagsInput` value |
| `visibleCount` | `number` | `BATCH_SIZE` (12) | lazy-load cursor |

## Derived values (pure, per render)

```text
hasSearch     = searchTerms.length > 0
filtered      = hasSearch
                  ? spaces.filter(s => everyTermMatches(s, searchTerms))
                  : spaces
displayed     = filtered.slice(0, visibleCount)
hasMore       = displayed.length < filtered.length
matchedCount  = filtered.length            // for the "Showing N" counter
showSearchBox = spaces.length > 0          // hide on empty hub
showNoResults = hasSearch && filtered.length === 0
showEmptyHub  = !spacesLoading && spaces.length === 0
```

`everyTermMatches(space, terms)`:
```text
haystack = (space.name + ' ' + space.description + ' ' + space.tags.join(' ')).toLowerCase()
return terms.every(term => haystack.includes(term.trim().toLowerCase()))
```

## State transitions

| Event | Effect |
|---|---|
| User edits search terms (`onChange`) | `setSearchTerms(next)` **and** reset `setVisibleCount(BATCH_SIZE)` (FR-007) |
| User clicks "Load more" | `setVisibleCount(c => c + BATCH_SIZE)` (FR-005) |
| User clicks "Clear search" (no-results state) | `setSearchTerms([])` and `setVisibleCount(BATCH_SIZE)` |
| `spaces` prop changes (data arrives) | render derives from new prop; no manual reset needed (slice handles growth) |

## Invariants

- `displayed` ⊆ `filtered` ⊆ `spaces` — nothing outside the hub's set is ever shown (SC-003).
- Order of `spaces` is preserved through `filter` and `slice` (admin order for list hubs — SC-004).
- `hasMore` is false whenever `filtered.length ≤ visibleCount` (FR-006).
