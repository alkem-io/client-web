# Implementation Plan: CRD Search Dialog Migration

**Branch**: `043-crd-search-dialog` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/043-crd-search-dialog/spec.md`

## Summary

Migrate the platform search dialog from MUI to shadcn/ui + Tailwind CSS, following the same parallel design system pattern established by the `/spaces` page migration (039) and `/home` dashboard migration (041). The CRD search overlay replaces the MUI `DialogWithGrid`-based `SearchDialog` with a full-viewport animated overlay featuring 5 result categories (Spaces, Posts, Responses, Users, Organizations), scroll-tracked category sidebar, per-section filters, tag-based input, scope switching, and Cmd+K keyboard shortcut. The data layer (existing `useSearchViewState`, `useSearchTerms`, GraphQL search query) is completely untouched — data mappers in `src/main/search/` bridge GraphQL responses to CRD component props.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD feature toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: CRD search overlay opens in under 300ms via Cmd+K; search task completion under 10s
**Constraints**: Zero MUI imports in `src/crd/`; both styling systems coexist; MUI pages must not regress
**Scale/Scope**: 1 global overlay, 5 result categories, ~8 new CRD components, 5 result card types, 1 integration component, 1 context, 1 data mapper, 1 i18n namespace, 3 existing hooks reused

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational; business logic stays in existing `src/main/search/` hooks. Data mapper lives in `src/main/search/searchDataMapper.ts`. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components are pure and concurrency-safe. SearchOverlay is side-effect free. Loading states use proper aria-busy. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes. All existing generated hooks reused as-is. CRD components never import GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | New SearchContext is a minimal open/close toggle under `src/main/search/`. CRD components are side-effect free. Cmd+K listener is isolated in CrdLayoutWrapper. |
| V. Experience Quality & Safeguards | PASS | FR-047 through FR-058 specify WCAG 2.1 AA requirements. Focus trap, ARIA roles, keyboard navigation all required. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites in `src/crd/components/search/`, integration in `src/main/search/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same as 039/041: CRD introduces Tailwind as a parallel styling system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | All CRD text uses `t()` via `useTranslation('crd-search')`. Follows per-feature namespace pattern from 039/041. |
| Arch #4: Build artifacts deterministic | PASS | No build config changes. Tailwind plugin already configured from 039. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID principles | PASS | SRP: data/view separated via data mapper + presentational components. OCP: same pattern extensible. DIP: CRD components depend on plain props, not GraphQL types. ISP: each card type has its own focused props interface. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is the same intentional violation from the CRD migration tracked below.

## Project Structure

### Documentation (this feature)

```text
specs/043-crd-search-dialog/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entity definitions and mapping
├── quickstart.md        # Phase 1: setup and implementation guide
├── contracts/           # Phase 1: TypeScript interfaces
│   ├── search-components.ts
│   ├── search-context.ts
│   └── data-mapper.ts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── components/
│   │   └── search/                      # NEW: all search CRD components
│   │       ├── SearchOverlay.tsx         # Full-viewport overlay (composes all below)
│   │       ├── SearchTagInput.tsx        # Input bar + tag chips + scope dropdown + close
│   │       ├── SearchCategorySidebar.tsx # Desktop sidebar + mobile pill tabs
│   │       ├── SearchResultSection.tsx   # Section with header, filter, grid, load more
│   │       ├── PostResultCard.tsx        # Post/callout result card
│   │       ├── ResponseResultCard.tsx    # Response/contribution result card
│   │       ├── UserResultCard.tsx        # User result card
│   │       └── OrgResultCard.tsx         # Organization result card
│   ├── i18n/
│   │   └── search/                      # NEW: search translations
│   │       ├── search.en.json
│   │       ├── search.nl.json
│   │       ├── search.es.json
│   │       ├── search.bg.json
│   │       ├── search.de.json
│   │       └── search.fr.json
│   └── ...                              # EXISTING (primitives/, layouts/, etc.)
│
├── main/
│   ├── search/
│   │   ├── SearchDialog.tsx             # EXISTING: MUI dialog (unchanged)
│   │   ├── SearchContext.tsx             # NEW: open/close state context
│   │   ├── CrdSearchOverlay.tsx         # NEW: integration (hooks + data mapper + CRD)
│   │   ├── searchDataMapper.ts          # NEW: GraphQL → CRD prop transformations
│   │   └── ...                          # EXISTING: hooks, filters, GraphQL (unchanged)
│   └── ui/
│       └── layout/
│           └── CrdLayoutWrapper.tsx     # MODIFIED: add SearchContext, CrdSearchOverlay, Cmd+K
│
├── core/
│   └── i18n/
│       └── config.ts                    # MODIFIED: register crd-search namespace
```

**Structure Decision**: Follows the same pattern established by 039/041. CRD search components live in `src/crd/components/search/` as purely presentational. The integration layer in `src/main/search/` wires CRD components to the existing search hooks via a data mapper. The search overlay is a global component (not a page), so it is rendered in `CrdLayoutWrapper.tsx` rather than in `src/main/crdPages/`. A lightweight `SearchContext` manages open/close state for Cmd+K support.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Arch #2: Parallel styling system (Tailwind alongside MUI) | Same as 039/041: CRD migration's intentional purpose. Both systems must coexist during multi-month migration. | Single styling system requires Big Bang rewrite (too risky). CSS isolation via `.crd-root` scoping prevents conflicts. |

## Design Decisions

### D1: Follows 039/041 Pattern Exactly

All architectural decisions from 039 apply: parallel design system, full CRD shell per route, localStorage toggle, data mapper pattern, `href` for navigation, CSS isolation via `.crd-root`, CrdLayoutWrapper reuse. No new architectural patterns introduced except SearchContext (D2).

### D2: SearchContext for Open/Close State

A lightweight React context (`SearchContext`) manages the overlay's open/close state. This is needed because Cmd+K must open the overlay instantly without URL manipulation (which would cause React Router re-renders). URL parameters (`?search-terms=...`) still work for backward compatibility — the integration layer reads URL params on mount and opens the overlay if present. See research.md R2.

### D3: CSS Transitions Instead of Framer Motion

Overlay enter/exit animations use CSS transitions with Tailwind classes, not the `motion/react` library. The project does not currently depend on `motion`, and adding ~30KB for a single animation is not justified. CSS transitions achieve the same visual effect (scale + opacity + translate). See research.md R1.

### D4: Category Mapping — Backend to UI

Backend's 5 result sets map to 5 UI categories: Spaces = spaceResults; Posts = calloutResults + framingResults (interlaced); Responses = contributionResults; Users = actorResults USER; Organizations = actorResults ORGANIZATION. See spec.md Clarifications and research.md R3.

### D5: SpaceCard Reuse

The existing CRD `SpaceCard` component is reused for space search results without modification. No separate `SpaceResultCard` needed. See research.md R5.

### D6: Portal Rendering

The overlay is rendered via `createPortal(element, document.body)` to ensure correct z-index stacking above the header and all other content. See research.md R6.

### D7: Integration in src/main/search/ (Not crdPages/)

Search is a global overlay, not a page with its own route. The integration layer lives in `src/main/search/` alongside the existing MUI SearchDialog, not in `src/main/crdPages/`. See research.md R4.

## Implementation Phases

### Phase 1: i18n Namespace

1. Create `src/crd/i18n/search/search.en.json` with all keys (search input, categories, filters, states, accessibility labels)
2. Create `search.{nl,es,bg,de,fr}.json` — AI-assisted translations
3. Register `crd-search` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports`

### Phase 2: CRD Result Card Components

4. `PostResultCard.tsx` — banner (or type-icon placeholder), author row, title, snippet, type badge, date, space context
5. `ResponseResultCard.tsx` — author + date row, title, snippet, "Response to: [parent]" reference, type badge, space context
6. `UserResultCard.tsx` — centered avatar (initials fallback), name, role, email
7. `OrgResultCard.tsx` — logo/icon, name, type badge, tagline

### Phase 3: CRD Overlay Structure Components

8. `SearchTagInput.tsx` — Search icon, text input, tag chips, scope dropdown (conditional), close button
9. `SearchCategorySidebar.tsx` — desktop sidebar (scroll-tracked, count badges, left border accent) + mobile horizontal pill tabs
10. `SearchResultSection.tsx` — section header (icon + title + count + filter dropdown), responsive result card grid, "Load more" button
11. `SearchOverlay.tsx` — full-viewport overlay container (portal, backdrop, CSS transition animation, composes TagInput + Sidebar + ResultSections + empty/loading/no-results states)

### Phase 4: Integration Layer

12. `SearchContext.tsx` — context provider with `isOpen`, `openSearch()`, `closeSearch()`, `toggleSearch()`, `initialQuery`, `initialScope`
13. `searchDataMapper.ts` — mapping functions:
    - `mapSpaceResults()` — `SearchResultSpaceFragment` → `SpaceCardData`
    - `mapPostResults()` — calloutResults + framingResults (interlaced) → `PostResultCardData[]`
    - `mapResponseResults()` — contributionResults → `ResponseResultCardData[]`
    - `mapUserResults()` — actorResults USER → `UserResultCardData[]`
    - `mapOrgResults()` — actorResults ORGANIZATION → `OrgResultCardData[]`
    - `assembleCategories()` — maps all results + filter state + pagination → `SearchCategoryData[]`
14. `CrdSearchOverlay.tsx` — integration component:
    - Consumes `SearchContext` for open/close
    - Uses existing `useSearchViewState` and `useSearchTerms` for data
    - Calls data mapper to transform results
    - Manages local state: filter selections, visible counts, active category, input value
    - Renders `SearchOverlay` CRD component with all props
    - Handles card clicks: `closeSearch()` + `navigate(href)`

### Phase 5: Wiring

15. Add `SearchContext.Provider` wrapping content in `CrdLayoutWrapper.tsx`
16. Add `CrdSearchOverlay` render in `CrdLayoutWrapper.tsx` (conditionally, always rendered when CRD enabled)
17. Add Cmd+K / Ctrl+K global keydown listener in `CrdLayoutWrapper.tsx` that calls `openSearch()`
18. Wire CRD Header's search button to `openSearch()` (via callback prop from CrdLayoutWrapper)

### Phase 6: Verification & Polish

19. Test all 5 result categories with live data
20. Test Cmd+K / Escape / backdrop / X close
21. Test tag add/remove, max 5 tags, min 2 chars
22. Test per-section filters (Spaces, Posts, Responses)
23. Test scope switching inside a space
24. Test Load More pagination
25. Test empty / loading / no-results states
26. Test responsive: mobile pill tabs, full-screen overlay, card grid columns
27. Test CRD toggle OFF → MUI SearchDialog unchanged
28. Run `pnpm lint` and `pnpm vitest run`
29. Accessibility audit: keyboard navigation, focus trap, ARIA roles, screen reader

## Key Files Reference

### Existing MUI Components (to replicate behavior from)
- `src/main/search/SearchDialog.tsx` — MUI dialog wrapper (replaced by CrdSearchOverlay)
- `src/main/search/SearchView.tsx` — main results layout (categories, filters, pagination logic to replicate)
- `src/main/search/SearchResultSection.tsx` — generic section template
- `src/main/search/ui/SearchCategoriesMenu.tsx` — sidebar navigation
- `src/main/search/EntityFilter.tsx` — filter dropdown
- `src/core/ui/search/MultipleSelect.tsx` — search input with chips
- `src/main/search/searchResults/SearchResultPostChooser.tsx` — card type dispatcher
- `src/main/search/searchResults/SearchResultsCalloutAndFramingCard.tsx` — callout card
- `src/main/search/searchResults/useHydratedCard.tsx` — card data hydration

### Existing Hooks (reused as-is)
- `src/main/search/useSearchViewState.ts` — search state, queries, pagination
- `src/main/search/useSearchTerms.ts` — URL param extraction
- `src/main/search/Filter.ts` — filter configurations
- `src/main/search/constants.ts` — URL param names

### Existing CRD Components (to reuse)
- `src/crd/components/space/SpaceCard.tsx` — for space search results
- `src/crd/primitives/dropdown-menu.tsx` — for filter dropdowns
- `src/crd/primitives/avatar.tsx` — for user/author avatars
- `src/crd/primitives/badge.tsx` — for count badges, type badges
- `src/crd/primitives/button.tsx` — for Load More, close, scope toggle
- `src/crd/primitives/input.tsx` — for search text input
- `src/crd/primitives/skeleton.tsx` — for loading states (if needed)

### Prototype Reference (read-only)
- `prototype/src/app/components/search/SearchOverlay.tsx` — full overlay + card sub-components
- `prototype/src/app/components/search/searchData.ts` — category/filter definitions, mock data types
- `prototype/src/app/contexts/SearchContext.tsx` — context pattern
- `prototype/src/app/components/layout/Header.tsx` — Cmd+K listener

### Route Wiring
- `src/main/ui/layout/CrdLayoutWrapper.tsx` — add SearchContext + CrdSearchOverlay + Cmd+K
- `src/main/ui/layout/TopLevelLayout.tsx` — existing MUI SearchDialog (unchanged)
- `src/core/i18n/config.ts` — register crd-search namespace
