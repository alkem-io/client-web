# Quickstart: Search Dialog CRD Migration

**Branch**: `043-crd-search-dialog` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Prerequisites

- Node >= 22.0.0 + pnpm >= 10.17.1
- CRD design system already functional (from 039-crd-spaces-page)
- CRD Layout (Header + Footer) already migrated and working
- Existing search hooks (`useSearchViewState`, `useSearchTerms`) available

## Implementation Order

Follow this sequence to avoid blocked dependencies:

### Phase A: i18n Namespace

1. Create `src/crd/i18n/search/search.en.json` with all keys
2. Create translations for `{nl,es,bg,de,fr}`
3. Register `crd-search` in `src/core/i18n/config.ts` under `crdNamespaceImports`

### Phase B: CRD Presentational Components

Build in `src/crd/components/search/`. Each component is purely presentational.

4. `PostResultCard.tsx` — post/callout result card
5. `ResponseResultCard.tsx` — response/contribution result card
6. `UserResultCard.tsx` — user result card
7. `OrgResultCard.tsx` — organization result card
8. `SearchTagInput.tsx` — input bar with tag chips, scope dropdown, close button
9. `SearchCategorySidebar.tsx` — desktop sidebar + mobile pill tabs
10. `SearchResultSection.tsx` — section with header, filter, result grid, load more
11. `SearchOverlay.tsx` — top-level overlay (composes all above)

### Phase C: Integration Layer

Build in `src/main/search/`. Wires CRD components to existing hooks.

12. `SearchContext.tsx` — open/close state context
13. `searchDataMapper.ts` — GraphQL results → CRD prop types
14. `CrdSearchOverlay.tsx` — integration component (hooks + data mapping + CRD component)

### Phase D: Wiring

15. Add `SearchContext.Provider` to `CrdLayoutWrapper.tsx`
16. Render `CrdSearchOverlay` conditionally in `CrdLayoutWrapper.tsx`
17. Wire Cmd+K listener in `CrdLayoutWrapper.tsx`
18. Wire header search trigger to `SearchContext.openSearch()` when CRD enabled

### Phase E: Verification

19. Test all 5 result categories with live data
20. Test filters per section
21. Test Cmd+K / Escape / backdrop close
22. Test scope switching inside a space
23. Test Load More pagination
24. Test responsive layout (mobile pill tabs, full-screen overlay)
25. Test CRD toggle OFF → MUI SearchDialog unchanged
26. Run `pnpm lint` and `pnpm vitest run`
27. Accessibility audit: keyboard nav, focus trap, screen reader

## Key Patterns

### CRD Component Pattern

```typescript
// src/crd/components/search/PostResultCard.tsx
type PostResultCardProps = {
  post: PostResultCardData;
  onClick: () => void;
};

export function PostResultCard({ post, onClick }: PostResultCardProps) {
  return (
    <button onClick={onClick} className="group flex flex-col rounded-xl ...">
      {/* ... */}
    </button>
  );
}
```

### Data Mapper Pattern

```typescript
// src/main/search/searchDataMapper.ts
export function mapPostResults(
  calloutResults: SearchResultCalloutFragment[],
  framingResults: SearchResultFramingFragment[]
): PostResultCardData[] {
  const interlaced = interlaceAndFilterArrays(calloutResults, framingResults);
  return interlaced.map(result => ({
    id: result.id,
    title: result.framing?.profile?.displayName ?? '',
    // ...
  }));
}
```

### Integration Pattern

```typescript
// src/main/search/CrdSearchOverlay.tsx
export function CrdSearchOverlay() {
  const { isOpen, closeSearch, initialQuery } = useSearch();
  const { searchTerms, setSearchTerms } = useSearchTerms();
  const { data, loading, fetchMore } = useSearchViewState(searchTerms);
  const categories = assembleCategories(mapAllResults(data), ...);

  return (
    <SearchOverlay
      isOpen={isOpen}
      onClose={closeSearch}
      categories={categories}
      // ...
    />
  );
}
```

## i18n Keys Structure

```json
{
  "search": {
    "placeholder": "Search...",
    "emptyState": {
      "title": "Type a search term and press Enter",
      "description": "Search across Spaces, Posts, Responses, Users, and Organizations."
    },
    "noResults": {
      "title": "No results found for {{terms}}",
      "suggestion": "Try different keywords or broaden your search.",
      "searchAll": "Search all Spaces instead"
    },
    "loading": "Searching...",
    "disclaimer": "These results may not represent the up to date state of the platform. Search results are updated on an interval.",
    "loadMore": "Load more",
    "scope": {
      "all": "All Spaces"
    },
    "categories": {
      "spaces": "Spaces",
      "posts": "Posts",
      "responses": "Responses",
      "users": "Users",
      "organizations": "Organizations"
    },
    "filters": {
      "all": "All",
      "spacesOnly": "Spaces only",
      "subspacesOnly": "Subspaces only",
      "whiteboards": "Whiteboards",
      "memos": "Memos",
      "posts": "Posts"
    },
    "a11y": {
      "searchInput": "Search input",
      "closeSearch": "Close search",
      "removeTag": "Remove search term: {{term}}",
      "activeTags": "Active search terms",
      "resultCategories": "Result categories",
      "searchResults": "Search results",
      "categoryResults": "{{category}} results"
    }
  }
}
```

## Testing Checklist

- [ ] CRD ON: search overlay opens via Cmd+K / Ctrl+K
- [ ] CRD ON: search overlay opens via header search trigger
- [ ] CRD ON: tag creation (type + Enter) triggers search
- [ ] CRD ON: tag removal re-triggers search
- [ ] CRD ON: max 5 tags enforced, min 2 chars per tag
- [ ] CRD ON: 5 result categories displayed correctly
- [ ] CRD ON: sidebar scroll tracking works on desktop
- [ ] CRD ON: mobile pill tabs replace sidebar
- [ ] CRD ON: per-section filters work (Spaces, Posts, Responses)
- [ ] CRD ON: scope dropdown visible inside a space
- [ ] CRD ON: "Load more" reveals additional results
- [ ] CRD ON: empty/loading/no-results states display correctly
- [ ] CRD ON: clicking a result card navigates and closes overlay
- [ ] CRD ON: Escape / backdrop / X button close the overlay
- [ ] CRD ON: focus trapped in overlay, returned to trigger on close
- [ ] CRD OFF: MUI SearchDialog works identically to before
- [ ] `pnpm lint` passes
- [ ] `pnpm vitest run` passes

## File Checklist

```
src/crd/
├── components/search/
│   ├── SearchOverlay.tsx          # [ ]
│   ├── SearchTagInput.tsx         # [ ]
│   ├── SearchCategorySidebar.tsx  # [ ]
│   ├── SearchResultSection.tsx    # [ ]
│   ├── PostResultCard.tsx         # [ ]
│   ├── ResponseResultCard.tsx     # [ ]
│   ├── UserResultCard.tsx         # [ ]
│   └── OrgResultCard.tsx          # [ ]
├── i18n/search/
│   ├── search.en.json             # [ ]
│   ├── search.nl.json             # [ ]
│   ├── search.es.json             # [ ]
│   ├── search.bg.json             # [ ]
│   ├── search.de.json             # [ ]
│   └── search.fr.json             # [ ]

src/main/search/
├── SearchContext.tsx               # [ ]
├── CrdSearchOverlay.tsx            # [ ]
└── searchDataMapper.ts             # [ ]

src/main/ui/layout/
└── CrdLayoutWrapper.tsx            # [ ] MODIFIED: add SearchContext + CrdSearchOverlay + Cmd+K

src/core/i18n/
└── config.ts                       # [ ] MODIFIED: register crd-search namespace
```
