# Phase 0 Research: CRD Search — Scope Switching

**Feature**: 093-crd-search-scope
**Date**: 2026-04-27

## Outline of unknowns from Technical Context

Going into Phase 0 the spec already had no `[NEEDS CLARIFICATION]` markers (resolved in `/speckit.specify` and `/speckit.clarify`), but four implementation-level questions still needed concrete answers before tasks could be generated:

1. Which hook does the integration layer call to get the level-zero Space's id, given that `CrdSearchOverlay` is mounted **above** `SpaceContextProvider` and cannot use `useSpace()`?
2. How does the integration layer obtain the level-zero Space's user-facing display name, since `useUrlResolver()` returns only ids?
3. Does the existing `searchInSpaceFilter` GraphQL variable accept a level-zero Space UUID, and does the backend already return everything in that Space's tree (parent + Subspaces)?
4. Where is the recovery "Search the entire platform instead" button rendered today, and what callback does it expect?

Each is resolved below.

---

## Decision 1 — Source for the current level-zero Space's ID

**Decision**: Use `useUrlResolver()` from `@/main/routing/urlResolver/UrlResolverProvider`. The integration reads `levelZeroSpaceId` (and the resolver's `loading` flag) directly.

**Rationale**:
- `UrlResolverProvider` wraps every Space route in `TopLevelRoutes.tsx:197` (`<Route path=":spaceNameId/*">` → `<UrlResolverProvider>` → `<CrdLayoutWrapper>` → `<CrdSearchOverlay>`), so on every Space URL the overlay sits inside the resolver's scope.
- The resolver listens to `history.pushState` / `popstate` and runs `useUrlResolverQuery` against the backend, which **resolves the URL string into entity ids** (returning `space.levelZeroSpaceID`). It works for both top-level Space URLs (`/secondspace`) and Subspace URLs (`/secondspace/challenges/foo`) because the backend does the parsing — the client never has to know the URL grammar.
- This is the **same source `SpaceContextProvider` itself uses** (`SpaceContext.tsx:69`: `const { levelZeroSpaceId } = useUrlResolver();`). So calling `useUrlResolver()` directly from the integration layer is "the same Space-context source the rest of the app relies on" (FR-001) without needing the `SpaceContextProvider` wrapper.
- On non-Space pages, `levelZeroSpaceId` is `undefined`; this is the natural signal that no scope dropdown should be shown (FR-003 / FR-004).

**Alternatives considered**:
- **`useSpace()` (the MUI version's mechanism)** — rejected: requires `SpaceContextProvider`, which wraps Space-page route content but **not** the layout-level overlay. `CrdSearchOverlay` is rendered at `CrdLayoutWrapper.tsx:106`, above the `<Outlet>` where `SpaceContextProvider` mounts, so the hook would throw "useContext returned undefined".
- **Patching the existing `extractSpaceNameIdFromPath` regex** — rejected: brittle (would need to handle `/spaceNameId`, `/spaceNameId/challenges/...`, query params, hash fragments, redirects). The backend already does this parsing reliably via `useUrlResolverQuery`. Per Constitution V (Engineering Workflow #5: Root Cause Analysis), the regex is the root cause and must be removed, not patched.
- **Watching `useLocation().pathname` and inferring** — rejected for the same reason as above.

---

## Decision 2 — Source for the level-zero Space's display name

**Decision**: Use the existing generated `useSpaceAboutBaseQuery` hook with `variables: { spaceId: levelZeroSpaceId }` and `skip: !levelZeroSpaceId`. Read `data.lookup.space.about.profile.displayName`.

**Rationale**:
- This is the exact pattern `SpaceContextProvider` already uses (`SpaceContext.tsx:72-76, 116`). The query is in the Apollo cache after the user landed on the Space page, so calling it from the integration layer is normally a cache hit (no extra round-trip in the common case).
- `useSpaceAboutBaseQuery` is a generated hook from `src/core/apollo/generated/apollo-hooks.ts`, satisfying Constitution III (no raw `useQuery`).
- Tying the **display name lookup** to the same `levelZeroSpaceId` that drives the **search filter** guarantees they cannot disagree (FR-002).

**Alternatives considered**:
- **Add `displayName` to the `useUrlResolverQuery` payload** — rejected: would require a schema/document change, which Constitution III treats as a meaningful event. The cached `useSpaceAboutBaseQuery` is already the canonical source.
- **Render the dropdown without a display name until the query resolves, then pop it in** — rejected: causes layout shift and a brief "name flicker". Per FR-019 we hide the selector while the Space is still resolving, then show it with the real name once available.
- **Use `space.nameID`** — rejected: that's a URL slug (e.g. `secondspace`), not a human-readable display name. FR-024 explicitly forbids this.

---

## Decision 3 — `searchInSpaceFilter` semantics

**Decision**: Pass `levelZeroSpaceId` (the level-zero Space's UUID) as `searchInSpaceFilter` when the active scope is the current Space; pass `undefined` when the active scope is "Entire platform". No change to the GraphQL document or the backend.

**Rationale**:
- The MUI implementation (`PlatformSearch.tsx` → `useSearchViewState` line 137) already calls `useSearchQuery` with `searchInSpaceFilter: spaceId` resolved from a level-zero Space, and the existing CRD `CrdSearchOverlay.tsx:114` already passes `searchInSpaceFilter: spaceId` (same field). The backend semantics — "scope to this Space's tree, including Subspaces" — match FR-011 exactly.
- The field is already optional on the existing `SearchInput` GraphQL type; omitting it (`undefined`) produces the platform-wide query the user expects from "Entire platform".
- This makes the scope toggle a one-line change: `searchInSpaceFilter: activeScope === 'space' ? levelZeroSpaceId : undefined`.

**Alternatives considered**:
- **A new `searchAcrossPlatform: boolean` flag** — rejected: redundant with the existing optional `searchInSpaceFilter` (presence/absence already conveys the intent), would require a schema change and a backend change.
- **Always pass `searchInSpaceFilter` and let the backend handle a sentinel value** — rejected: ill-specified, and the existing field is already nullable — no new convention needed.

---

## Decision 4 — Recovery button wiring

**Decision**: The "Search the entire platform instead" recovery button is **already rendered** by `SearchOverlay.tsx:266-270` when `onSearchAll` is provided and the overlay is in the `no-results` state. The integration layer passes `onSearchAll={() => setActiveScope('all')}` when (a) the user is on a Space page AND (b) the active scope is currently the current Space; otherwise it passes `undefined` so the button is hidden.

**Rationale**:
- The button is already in `SearchOverlay`, behind an `onSearchAll` prop. No new component is needed; the integration just supplies the callback at the right times (FR-014, FR-016).
- The current copy `search.searchAllSpaces` is "Search all Spaces instead" — close to the MUI "Search the entire platform instead" but not identical. Per the Q2 clarification ("mimic MUI 1:1"), we update the value to "Search the entire platform instead" across all six language files.
- This keeps the design system component contract unchanged and concentrates the conditional logic in the integration layer where it belongs (Constitution I).

**Alternatives considered**:
- **Always-show the button when no results, regardless of scope** — rejected: per FR-016, on a non-Space page or when scope is already "Entire platform", the button is meaningless and would confuse users.
- **A separate "widen scope" component** — rejected: SRP-violating; the existing button is a one-liner and already works.

---

## Decision 5 — Trigger label "Search In: …" formatting

**Decision**: Add a new translation key `search.scopeTriggerLabel` with interpolation: `"Search In: {{option}}"`. The `SearchTagInput` renders the trigger as `t('search.scopeTriggerLabel', { option: activeOptionLabel })`. The interpolation token is keyed (not positional) so future locales can reorder if needed.

**Rationale**:
- Per Q2 clarification ("mimic MUI 1:1"), the production MUI screenshot shows the trigger as "Search In: Entire platform" or "Search In: <Space name>". Matching the exact format is the user's stated goal.
- Keyed interpolation (`{{option}}`) is the i18next idiom and travels cleanly through the lazy-loaded `crd-search` namespace (per CRD i18n rules).
- The change to `SearchTagInput.tsx` is one line in the trigger-button content; no prop or behavior change. Constitution: no business logic crosses into the design system.

**Alternatives considered**:
- **Concatenate two strings (`"Search In: " + label`)** — rejected: doesn't translate cleanly. Some locales need the colon to be a different glyph (e.g. fullwidth in some Asian scripts) or rephrase. Single-key interpolation handles this.
- **Hard-coding "Search In:" in the JSX** — rejected: violates the rule that all user-visible strings come from `t()`.

---

## Other items considered, no decision needed

- **Reset behavior**: the existing `useEffect` on `!isOpen` (`CrdSearchOverlay.tsx:180-204`) already resets all overlay state. We extend it to also reset `activeScope` to its default (matching FR-017). One added line in the existing effect.
- **Initial query default**: when the overlay opens with `initialQuery` from the SearchContext (URL parameter pre-fill), the active scope is already set to default (current Space if present), so the initial search runs scoped — matching the "Pre-filled query" edge case in the spec.
- **Race conditions on scope change mid-flight**: Apollo's `useQuery` already supersedes in-flight queries when variables change. The existing pattern (`fetchPolicy: 'no-cache'` at `CrdSearchOverlay.tsx:149`) means each new variable set triggers a fresh fetch, and the old result is discarded. No additional coordination needed for FR-013 / "Scope changed mid-flight" edge case.
- **Subspace-id corner case**: covered in Decision 1 — `useUrlResolverQuery` returns the level-zero Space id whether the URL is a top-level Space or a Subspace, so the scope dropdown always shows the level-zero Space (matching the Q1 clarification).

---

## Summary of resolved unknowns

| Unknown | Resolution |
|---------|------------|
| Hook for level-zero Space id | `useUrlResolver()` → `levelZeroSpaceId` |
| Hook for level-zero Space display name | `useSpaceAboutBaseQuery({ spaceId, skip: !spaceId })` → `data.lookup.space.about.profile.displayName` |
| Search filter wiring | `searchInSpaceFilter: activeScope === 'space' ? levelZeroSpaceId : undefined` |
| Recovery button | Already in `SearchOverlay`; pass `onSearchAll` callback from integration |
| Trigger label format | New key `search.scopeTriggerLabel` with `{{option}}` interpolation |

Phase 0 complete. No `[NEEDS CLARIFICATION]` remains.
