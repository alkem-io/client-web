# Contracts: CRD Search — Scope Switching

**Feature**: 093-crd-search-scope
**Date**: 2026-04-27

This feature has **no GraphQL or REST contract changes**. The only contracts that matter are the TypeScript prop interfaces at the seam between the integration layer and the design system. They already exist and are largely unchanged; this document records what each side must respect.

---

## 1. `SearchScopeData` (already defined)

**Source**: `src/crd/components/search/SearchTagInput.tsx:12-15`

```ts
export type SearchScopeData = {
  /** Display name of the level-zero Space — shown as the "current Space" option in the dropdown */
  currentSpaceName: string;
  /** The currently active scope. 'all' means platform-wide; any other string means the current Space is active. */
  activeScope: 'all' | string;
};
```

**Producer**: integration layer (`CrdSearchOverlay`)
**Consumer**: presentational `SearchTagInput` (via `SearchOverlay`)

**Producer rules**:
- `currentSpaceName` MUST be the level-zero Space's `displayName`, never its `nameID` (FR-024).
- `activeScope` MUST be `'all'` when the user has chosen "Entire platform", and MUST equal the same string passed as `currentSpaceName` when scoped to the Space (so the consumer can do the equality check that drives the active styling).
- The integration MUST pass `scope: undefined` (omit the prop) when no level-zero Space is detected — this is what hides the dropdown (FR-003 / FR-004).

**Consumer rules** (already implemented in `SearchTagInput.tsx`):
- Render the dropdown only when `scope` is provided AND `onScopeChange` is provided.
- The trigger button shows the active option's label.
- The trigger uses the "scoped" visual treatment (`bg-primary text-primary-foreground`) when `activeScope !== 'all'`.

**Change in this feature**: the trigger's text content goes from a bare label to the prefixed form `t('search.scopeTriggerLabel', { option: ... })` — see Trigger Label Format below.

---

## 2. `onScopeChange` callback (already defined)

**Source**: `SearchTagInput.tsx:26` and `SearchOverlay.tsx:39`

```ts
type OnScopeChange = (scope: 'all' | string) => void;
```

**Contract**:
- The dropdown invokes the callback with `'all'` when the user picks the "Entire platform" item.
- It invokes the callback with the current Space's `currentSpaceName` (string) when the user picks the Space item.
- The integration's handler maps these back to its internal `ActiveScope` (`'all'` | `'space'`) and calls `setActiveScope`.

**Integration handler shape**:

```ts
const handleScopeChange = (next: 'all' | string) => {
  setActiveScope(next === 'all' ? 'all' : 'space');
};
```

(This mapping is necessary because the consumer doesn't know our internal enum; it only knows the labels.)

---

## 3. `onSearchAll` callback (already defined, currently unused by integration)

**Source**: `SearchOverlay.tsx:45`

```ts
type OnSearchAll = (() => void) | undefined;
```

**Contract**:
- When `onSearchAll` is provided AND the overlay is in the `'no-results'` state, the recovery button is rendered (`SearchOverlay.tsx:266-270`).
- The button click invokes the callback. The consumer (overlay) does not navigate or re-fetch; it only signals the intent.

**Integration's handler**:

```ts
const handleSearchAll = () => {
  setActiveScope('all'); // triggers a re-fetch via the variable change
};
```

**Visibility rule** (FR-014, FR-016):

```ts
const onSearchAll: (() => void) | undefined =
  currentSpaceContext.spaceId && activeScope === 'space' ? handleSearchAll : undefined;
```

When the user is not on a Space page, OR the active scope is already `'all'`, the integration passes `undefined` so the button stays hidden.

---

## 4. `useSearchQuery` variables (existing GraphQL contract — unchanged)

**Source**: generated hook in `src/core/apollo/generated/apollo-hooks.ts`

The integration changes only the **value** of the existing `searchInSpaceFilter` field. The GraphQL schema is unchanged. Per Constitution III, this is a value-level change, not a contract change, and does not require codegen.

Variable wiring (final form):

```ts
useSearchQuery({
  variables: {
    searchData: {
      tagsetNames,
      terms: searchTags,
      searchInSpaceFilter: activeScope === 'space' ? currentSpaceContext.spaceId : undefined,
      filters: [/* unchanged */],
    },
  },
  fetchPolicy: 'no-cache',
  skip: searchTags.length === 0 || currentSpaceContext.loading,
});
```

**Existing contract guarantees we rely on**:
- `searchInSpaceFilter` is optional (`Maybe<Scalars['UUID']['input']>`).
- When provided with a level-zero Space UUID, the backend restricts results to that Space and its Subspace tree (this is the exact behavior the MUI version already depends on).
- When omitted, the backend returns platform-wide results.
- Variable changes trigger a fresh query via Apollo's standard re-execution (no manual refetch needed).

---

## 5. Trigger label format (i18n contract)

**New translation key contract**:

```jsonc
"search.scopeTriggerLabel": "Search In: {{option}}"
```

| Token | Type | Source | Example value |
|-------|------|--------|---------------|
| `option` | `string` | `t('search.scopeAll')` when active scope is `'all'`, else `currentSpaceContext.displayName` | "Entire platform", "second space" |

**Consumer (`SearchTagInput`) usage**:

```tsx
<span>
  {t('search.scopeTriggerLabel', {
    option: scope.activeScope === 'all' ? t('search.scopeAll') : scope.currentSpaceName,
  })}
</span>
```

**Translator constraint**: every locale file MUST keep the `{{option}}` token verbatim.

---

## 6. A11y contract additions

| Element | Required attribute | Source |
|---------|--------------------|--------|
| Scope trigger button | `aria-label={t('search.a11y.scopeTrigger', { option })}` | New i18n key in `a11y` subtree |
| `SearchOverlay` status region | Existing `aria-live="polite"` div at `SearchOverlay.tsx:231` | Already announces state changes; covers FR-021 since `state` flips through `'loading'` → `'results'` / `'no-results'` on each scope switch |
| Recovery button | Already a `<Button variant="outline">` in `SearchOverlay.tsx:267` | Has shadcn `focus-visible:ring`; covers FR-022 |

No new ARIA roles or properties needed beyond the new `aria-label` on the scope trigger.

---

## 7. What does NOT change

For clarity to implementers and reviewers, these contracts are explicitly preserved:

- `SearchOverlayProps` shape — the existing `scope`, `onScopeChange`, `onSearchAll` props are already declared. We are populating them, not changing them.
- `SearchTagInput` props — the existing `scope` and `onScopeChange` props are already declared and already render the dropdown.
- `SearchProvider` / `useSearch()` — open/close + `initialQuery` API stays as-is.
- All other existing search-related types (`SearchOverlayCategory`, `SidebarCategory`, `SearchFilterOption`, etc.) — untouched.
- The MUI `PlatformSearch` and `SearchDialog` and their search-view-state hooks — untouched.

---

## Acceptance test against contracts

A passing implementation MUST satisfy:

1. The integration layer's `useSearchQuery` call sets `searchInSpaceFilter` to a non-empty string when and only when `activeScope === 'space'` AND `currentSpaceContext.spaceId` is truthy.
2. The integration passes `scope` to `<SearchOverlay>` if and only if `currentSpaceContext.spaceId` is truthy AND `currentSpaceContext.loading` is false.
3. The integration passes `onSearchAll` to `<SearchOverlay>` if and only if both (a) a Space context exists and (b) `activeScope === 'space'`.
4. The trigger button in `SearchTagInput` renders text matching the regex `/^Search In: .+$/` (in English) — i.e. the prefix is present.
5. All six `search.<lang>.json` files contain the keys `search.scopeAll` (with localized "Entire platform"), `search.searchAllSpaces` (with localized "Search the entire platform instead"), `search.scopeTriggerLabel` (with `{{option}}`), and `search.a11y.scopeTrigger` (with `{{option}}`).
