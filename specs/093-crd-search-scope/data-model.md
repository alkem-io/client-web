# Phase 1 Data Model: CRD Search — Scope Switching

**Feature**: 093-crd-search-scope
**Date**: 2026-04-27

This feature does not introduce or modify any persisted data, GraphQL schema, or Apollo cache shape. The only "data" added is a small piece of session-local React state plus the variable that drives the existing search query. This document captures both for completeness.

---

## 1. Active Scope (component state)

**Lives in**: local `useState` inside `CrdSearchOverlay` (`src/main/crdPages/search/CrdSearchOverlay.tsx`)
**Lifecycle**: created when the overlay mounts; reset to its default value on every overlay open/close cycle
**Persistence**: none — not URL-stored, not localStorage-stored, not in Apollo cache

### Type

```ts
type ActiveScope = 'space' | 'all';
```

| Value    | Meaning                                                                                |
|----------|----------------------------------------------------------------------------------------|
| `'space'` | Search is restricted to the **level-zero Space** identified by `useUrlResolver()`'s `levelZeroSpaceId`. The Space's display name is shown in the trigger. |
| `'all'`   | Search is platform-wide. The trigger shows "Entire platform". |

### Default value rule

```ts
const initialScope: ActiveScope = levelZeroSpaceId ? 'space' : 'all';
```

- When a Space context exists at open time → default to `'space'` (FR-007).
- When no Space context exists → the dropdown is hidden entirely (FR-003 / FR-004); the conceptual scope is `'all'` but never user-selectable.

### Reset rule

The existing `useEffect` block in `CrdSearchOverlay.tsx` (the one that resets `searchTags`, `inputValue`, `sectionFilters`, `visibleCounts`, and the `canXxxLoadMore` flags when `!isOpen`) is extended to also reset `activeScope` to `initialScope` (FR-017).

### Validity

- The state has a domain of exactly two values; an exhaustive `switch` (or simple ternary) covers all cases. No defensive validation needed.

---

## 2. Current Space Context (read-only, derived from existing infra)

**Source**: `useUrlResolver()` from `@/main/routing/urlResolver/UrlResolverProvider` and `useSpaceAboutBaseQuery` from `src/core/apollo/generated/apollo-hooks.ts`

**Shape consumed by the integration**:

```ts
type CurrentSpaceContext = {
  /** Level-zero Space's UUID. Undefined when not on a Space tree route. */
  spaceId: string | undefined;
  /** Level-zero Space's user-facing display name. Empty string while loading or when not on a Space tree route. */
  displayName: string;
  /** True while either the URL resolver or the Space-about query is in flight. */
  loading: boolean;
};
```

**Derivation**:

```ts
const { levelZeroSpaceId, loading: urlResolverLoading } = useUrlResolver();
const { data: spaceAboutData, loading: spaceQueryLoading } = useSpaceAboutBaseQuery({
  variables: { spaceId: levelZeroSpaceId ?? '' },
  skip: !levelZeroSpaceId,
});

const currentSpaceContext: CurrentSpaceContext = {
  spaceId: levelZeroSpaceId,
  displayName: spaceAboutData?.lookup.space?.about.profile.displayName ?? '',
  loading: urlResolverLoading || (Boolean(levelZeroSpaceId) && spaceQueryLoading),
};
```

**Invariants**:

- `spaceId` and `displayName` are always sourced from the same `levelZeroSpaceId` (FR-002 — they cannot disagree).
- When `loading` is `true`, the scope dropdown is hidden and the search query is skipped (FR-019). Once `loading` flips to `false`:
  - If `spaceId` is truthy → dropdown becomes available, default scope is `'space'`.
  - If `spaceId` is falsy → no dropdown; scope is fixed to `'all'`.

**Lifecycle**:

- Lives for the lifetime of the `CrdSearchOverlay` component (which is itself mounted in `CrdLayoutWrapper` for the duration of the user's session).
- Re-derives whenever the URL changes (`UrlResolverProvider` listens to `history.pushState`/`popstate`), so navigating from one Space to another, or from a Space to a non-Space page, automatically updates the derived context.
- The Apollo cache makes the `useSpaceAboutBaseQuery` call a hit in the common case (the Space page itself already triggered it), so navigating onto a Space page populates the displayName synchronously after the URL resolver resolves.

---

## 3. Scope-Aware Search Variables (existing GraphQL input)

**Lives in**: the variables passed to the existing `useSearchQuery` hook (`CrdSearchOverlay.tsx:109-151`)

**No GraphQL schema change**. The relevant field on the existing `SearchInput` type:

```ts
// Already exists on the generated SearchInput type — DO NOT modify
type SearchInputVariables = {
  searchData: {
    tagsetNames: string[];
    terms: string[];
    /**
     * Optional. When provided, results are restricted to the Space with this UUID
     * and its entire Subspace tree. When undefined, results are platform-wide.
     */
    searchInSpaceFilter?: string;
    filters: SearchCategoryFilter[];
  };
};
```

**Wiring rule** (FR-011 / FR-012):

```ts
const searchInSpaceFilter: string | undefined =
  activeScope === 'space' ? currentSpaceContext.spaceId : undefined;
```

This single expression replaces the current line `searchInSpaceFilter: spaceId` (which always passed the broken-regex result, i.e. `undefined`).

**Skip rule** (FR-019):

```ts
skip: searchTags.length === 0 || currentSpaceContext.loading,
```

Replaces the current `skip: searchTags.length === 0 || resolvingSpace`. Same intent, more accurate condition (covers both URL-resolver loading and Space-about-query loading).

---

## 4. Translation Resources

**Lives in**: `src/crd/i18n/search/search.<lang>.json` for `lang ∈ { en, nl, es, bg, de, fr }`

The same JSON shape applies to all six files; only the values are translated.

```jsonc
{
  "search": {
    // VALUE CHANGED: "All Spaces" → "Entire platform"
    "scopeAll": "Entire platform",

    // VALUE CHANGED: "Search all Spaces instead" → "Search the entire platform instead"
    "searchAllSpaces": "Search the entire platform instead",

    // NEW
    "scopeTriggerLabel": "Search In: {{option}}",

    // NEW (under existing a11y subtree)
    "a11y": {
      "scopeTrigger": "Change search scope. Currently searching: {{option}}"
    }

    // ... all other existing keys preserved unchanged
  }
}
```

The interpolation tokens (`{{option}}`) are keyed (not positional) per i18next conventions.

**Validation rule** (per CRD i18n discipline, FR-023):

- Every key present in `search.en.json` must be present with a translated value in each of `search.nl.json`, `search.es.json`, `search.bg.json`, `search.de.json`, `search.fr.json` at merge time.
- The interpolation token names must match exactly across all six files.

---

## 5. State diagram

```text
┌─────────────────────┐
│ overlay closed      │ — activeScope is undefined / not in scope
└─────────┬───────────┘
          │ overlay opens
          ▼
┌─────────────────────────────────────────────┐
│ derive currentSpaceContext from useUrlResolver │
│ + useSpaceAboutBaseQuery                    │
└─────────┬───────────────────────────────────┘
          │
   loading? ────► YES ───► hide dropdown, skip search query (FR-019)
          │                  │
          │                  └─ when loading flips to false, re-evaluate ↓
          ▼
   spaceId truthy?
   ├── YES → activeScope := 'space'  (FR-007)
   │         └── show dropdown with two options (FR-003, FR-005)
   │              └── user toggles → setActiveScope('all' | 'space')  (FR-008, FR-009)
   │                   └── searchInSpaceFilter recomputes; useSearchQuery refires (FR-011/FR-012)
   │                        └── on Space-scoped no-results: show "Search the entire platform instead"
   │                             button (FR-014); click → setActiveScope('all') (FR-015)
   │
   └── NO  → no dropdown rendered (FR-004); searchInSpaceFilter is always undefined
              └── search executes platform-wide

   overlay closes ─► reset activeScope to default for next open (FR-017)
```

---

No persisted entities, no schema changes, no Apollo cache shape changes, no migrations.
