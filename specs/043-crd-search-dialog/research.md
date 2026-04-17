# Research: Search Dialog CRD Migration

**Date**: 2026-04-08 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

## Research Topics

### R1: Animation Library for Overlay Transitions

**Decision**: Use CSS transitions and Tailwind classes for overlay enter/exit animations. Do NOT add `motion/react` (Framer Motion) as a dependency.

**Rationale**: The project does not currently depend on `motion` or `framer-motion`. Adding a new dependency for a single overlay animation is not justified when CSS transitions can achieve the same visual effect (scale + opacity + translate) with zero bundle cost. The prototype uses Framer Motion for convenience, but CRD components should use Tailwind + CSS for consistency with the existing design system.

**Alternatives considered**:
- *Add `motion/react` as a dependency*: The prototype uses it, but the main project has no existing usage. Adding ~30KB (minified) for one animation is disproportionate. Rejected for bundle impact.
- *Use Radix UI `Dialog` with CSS transitions*: The overlay is not a standard dialog (it's a full-viewport overlay). Using `Dialog` primitives would fight the full-viewport layout. Rejected — custom overlay with CSS transitions is simpler.

**Key technical details**:
- Use Tailwind `transition-all duration-200 ease-out` for scale/opacity
- Conditionally apply `opacity-0 scale-[0.97] translate-y-2.5` (closed) vs `opacity-100 scale-100 translate-y-0` (open)
- Backdrop uses `transition-opacity duration-200` with `backdrop-blur-sm`
- `AnimatePresence`-like mount/unmount can be handled with a `useState` + `onTransitionEnd` pattern or by keeping the overlay in the DOM and toggling visibility classes

---

### R2: SearchContext vs URL Parameter State Management

**Decision**: Introduce a lightweight `SearchContext` in the integration layer (`src/main/search/` or `src/main/crdPages/search/`) for open/close state. Preserve URL parameters for search terms and scope for backward compatibility and deep linking.

**Rationale**: The current MUI search dialog opens/closes based on URL parameters (`?search-terms=...`). The CRD overlay needs a faster open mechanism (Cmd+K → instant open without URL manipulation). A context handles the open/close toggle, while URL params continue to drive the actual search state.

**Alternatives considered**:
- *URL params only (current pattern)*: Works for header trigger but is too slow for Cmd+K (requires `navigate()` which triggers React Router re-render). Rejected for performance.
- *Context only, drop URL params*: Would break existing deep links and header search flow. Rejected for backward compatibility.
- *Global event bus*: Over-engineering for open/close toggle. Rejected.

**Key technical details**:
- `SearchContext` provides: `isOpen`, `openSearch(initialQuery?, initialScope?)`, `closeSearch()`, `toggleSearch()`
- Context lives in `src/main/search/SearchContext.tsx` (integration layer, not CRD)
- Cmd+K listener wired in `CrdLayoutWrapper.tsx` (calls `openSearch()`)
- Header search trigger calls `openSearch(query)` instead of `navigate()` when CRD is enabled
- URL param `?search-terms=...` still opens search (via `useEffect` in the context that checks URL on mount)
- The CRD overlay component receives `isOpen`, `onClose`, `initialQuery`, `initialScope` as props

---

### R3: Category Mapping — Backend to UI

**Decision**: Map backend's 5 result sets to 5 UI categories as follows:
- **Spaces** = `spaceResults` (SPACE, SUBSPACE types)
- **Posts** = `calloutResults` + `framingResults` (interlaced, preserving current merging pattern)
- **Responses** = `contributionResults` (POST, WHITEBOARD, MEMO types)
- **Users** = `actorResults` filtered to USER type
- **Organizations** = `actorResults` filtered to ORGANIZATION type

**Rationale**: This preserves the current interlacing logic from `SearchView.tsx` (which merges callouts and framings into a single "Collaboration Tools" section) while renaming it to "Posts". Contributions (responses to callouts) become "Responses". The Contributors section is split into two separate UI categories (Users, Organizations) for clearer navigation.

**Alternatives considered**:
- *Posts = calloutResults only, Responses = framingResults + contributionResults*: Would break the established interlacing pattern and lose the logical grouping of callouts with their framings. Rejected.
- *Keep 4 categories like current MUI*: The prototype clearly defines 5 categories for better UX. Rejected per spec.

**Key technical details**:
- The data mapper reuses `interlaceAndFilterArrays()` from `SearchView.tsx` for the Posts category
- Posts filter (All/Whiteboards/Memos) applies to framing content types within the merged set
- Responses filter (All/Posts/Whiteboards/Memos) applies to contribution types
- Users and Organizations have no filter dropdown
- `actorResults` is split client-side by checking `result.type === SearchResultType.User` vs `SearchResultType.Organization`

---

### R4: Where to Place the Search Overlay Integration

**Decision**: Place the CRD search overlay integration in `src/main/search/` alongside the existing MUI SearchDialog, not in `src/main/crdPages/search/`.

**Rationale**: The search overlay is a global component rendered in `TopLevelLayout.tsx` and `CrdLayoutWrapper.tsx`, not a page-level component. The `crdPages/` directory is for page-level integrations (routes with their own URL). The search overlay is a dialog/overlay that can open from any page. Placing it alongside the existing `SearchDialog.tsx` keeps the toggle logic simple: the layout wrapper conditionally renders `SearchDialog` (MUI) or `CrdSearchOverlay` (CRD).

**Alternatives considered**:
- *`src/main/crdPages/search/`*: Would be inconsistent — search is not a page, it's a global dialog. Rejected.
- *`src/crd/components/search/`*: Only the presentational CRD components go here. The integration (wiring hooks, context, data mapping) must be outside `src/crd/`. Rejected — split components (CRD) from integration (main/search).

**Key technical details**:
- CRD presentational components: `src/crd/components/search/` (SearchOverlay, SearchTagInput, SearchCategorySidebar, result cards)
- Integration layer: `src/main/search/CrdSearchOverlay.tsx` (wires hooks to CRD components)
- Data mapper: `src/main/search/searchDataMapper.ts` (transforms GraphQL results to CRD prop types)
- SearchContext: `src/main/search/SearchContext.tsx`
- Toggle: `CrdLayoutWrapper.tsx` renders `CrdSearchOverlay` when CRD enabled; `TopLevelLayout.tsx` continues to render MUI `SearchDialog` when CRD disabled

---

### R5: SpaceCard Reuse in Search Results

**Decision**: Reuse the existing CRD `SpaceCard` component from `src/crd/components/space/SpaceCard.tsx` for space search results. Do NOT create a separate `SpaceResultCard`.

**Rationale**: The prototype's `SearchOverlay.tsx` imports and uses the same `SpaceCard` component for search results. The CRD SpaceCard already displays banner, name, tagline, member info, and privacy indicator — matching the FR-019 requirements exactly. Creating a separate card would duplicate code without benefit.

**Alternatives considered**:
- *Separate `SpaceResultCard`*: Would duplicate SpaceCard's visual structure. The only difference would be that search results might include a score/relevance indicator, but the spec doesn't require one. Rejected for DRY.

**Key technical details**:
- `SpaceCard` props already match search result data shape
- The data mapper transforms `SearchResultSpaceFragment` to `SpaceCardData` (the existing type from the spaces migration)
- Grid layout for space cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

### R6: Overlay Rendering Strategy — Portal vs Inline

**Decision**: Render the CRD overlay using a React portal to `document.body` to ensure it sits above all other content regardless of parent z-index context.

**Rationale**: The overlay has a fixed-inset backdrop that must cover the entire viewport including the header. Rendering inline within `CrdLayoutWrapper` could cause z-index stacking issues with other fixed-position elements (header, notifications panel). A portal ensures the overlay is in the top-level stacking context.

**Alternatives considered**:
- *Inline rendering in CrdLayoutWrapper*: Simpler but risks z-index conflicts with header and other fixed elements. The MUI DialogWithGrid already uses a portal internally. Rejected for reliability.
- *Radix `Portal` primitive*: Radix provides a Portal component, but adding a Radix dependency for just a portal is unnecessary when `createPortal` is built into React. Rejected — use React's built-in `createPortal`.

**Key technical details**:
- `createPortal(overlayElement, document.body)` in the CRD overlay wrapper
- z-index: 100 for backdrop, 101 for overlay content (matching prototype)
- Focus trap managed via `FocusTrap` from Radix (already available via Dialog primitive) or manual `tabindex` management
