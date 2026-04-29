# Tasks: CRD Search — Scope Switching (Platform vs. Current Space)

**Input**: Design documents from `/specs/093-crd-search-scope/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/search-scope-props.md, quickstart.md

**Tests**: One automated test task (T025) covers the integration logic in `CrdSearchOverlay.tsx` — required by Constitution Principle V ("Tests covering non-trivial logic ... mandatory evidence in the PR description") and Engineering Workflow #4 ("Missing evidence blocks merge"). Manual QA tasks (T013, T014, T016, T018, T019, T020, T023) reference scenarios in `quickstart.md` and the spec's acceptance scenarios for the parts that are inherently UI-rendering or backend-shape dependent. The existing Vitest suite (`pnpm vitest run`) is also run in Polish (T022) to catch regressions in any tests that asserted the old "All Spaces" / "Search all Spaces instead" copy.

**Organization**: Tasks are grouped by user story so each can be implemented and verified independently. Because the entire feature lives in one integration file plus six translation files plus one CRD copy edit, parallelism is concentrated in Phase 2 (translations).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3, US4) — only on user-story-phase tasks

## Path Conventions

This is a single-project React 19 SPA. All paths are absolute under the repo root.

- Integration layer: `src/main/crdPages/search/`
- CRD design system: `src/crd/components/search/`
- CRD i18n: `src/crd/i18n/search/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working environment is ready. No new dependencies, no codegen.

- [ ] T001 Confirm `pnpm install` is current and `pnpm lint` + `pnpm vitest run` pass on the freshly checked-out `093-crd-search-scope` branch (baseline before changes)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the i18n key changes and the design-system trigger-format edit. All four user stories depend on these strings/labels existing before integration changes are reviewed.

**⚠️ CRITICAL**: No user story implementation work should land before Phase 2 tasks complete; otherwise the integration will reference missing translation keys and produce missing-key warnings.

**Source for new translations (FR-006a "mimic MUI 1:1")**: For the trigger prefix and the platform-option label, use the EXACT localized values that already exist in MUI's `src/core/i18n/<lang>/translation.<lang>.json` under `components.search.searchScope.full` (for the "Search In:" prefix) and `components.search.scope.platform` (for the "Entire platform" option label). This guarantees that users see identical wording in the MUI search bar and the CRD overlay. Confirmed canonical values per language:

| Lang | `searchScope.full` (prefix in MUI) | `scope.platform` (option label in MUI) |
|------|------------------------------------|----------------------------------------|
| en   | `"Search In:"`                     | `"Entire platform"`                    |
| nl   | `"Zoek in:"`                       | `"Gehele platform"`                    |
| es   | `"Buscar en:"`                     | `"Toda la plataforma"`                 |
| bg   | `"Търсене в:"`                     | `"Цялата платформа"`                   |
| de   | `"Search In:"` *(English fallback in MUI source — provide German translation in CRD: "Suchen in:")* | `"Entire platform"` *(English fallback in MUI source — provide German translation in CRD: "Gesamte Plattform")* |
| fr   | `"Search In:"` *(English fallback in MUI source — provide French translation in CRD: "Rechercher dans :")* | `"Entire platform"` *(English fallback in MUI source — provide French translation in CRD: "Toute la plateforme")* |

The recovery-button copy ("Search the entire platform instead") has no direct MUI equivalent (MUI uses an `alternativeScope` clickable card with different wording); the spec defines it as a button and we keep its CRD-only wording.

- [ ] T002 [P] Edit `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/search/search.en.json` — change the value of `search.scopeAll` from `"All Spaces"` to `"Entire platform"` (matching MUI `components.search.scope.platform`); change the value of `search.searchAllSpaces` from `"Search all Spaces instead"` to `"Search the entire platform instead"`; add new key `search.scopeTriggerLabel` with value `"Search In: {{option}}"` (the prefix matches MUI `components.search.searchScope.full`); add new key `search.a11y.scopeTrigger` with value `"Change search scope. Currently searching: {{option}}"`. Preserve every other existing key.
- [ ] T003 [P] Edit `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/search/search.nl.json` — same four key changes as T002 with Dutch translations matching MUI: `scopeAll` → `"Gehele platform"` (matches MUI's `scope.platform`); `searchAllSpaces` → `"Zoek in plaats daarvan op het gehele platform"`; `scopeTriggerLabel` → `"Zoek in: {{option}}"` (prefix matches MUI's `searchScope.full`); `a11y.scopeTrigger` → `"Zoekbereik wijzigen. Huidig zoekbereik: {{option}}"`.
- [ ] T004 [P] Edit `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/search/search.es.json` — same four key changes as T002 with Spanish translations matching MUI: `scopeAll` → `"Toda la plataforma"` (matches MUI's `scope.platform`); `searchAllSpaces` → `"Buscar en toda la plataforma"`; `scopeTriggerLabel` → `"Buscar en: {{option}}"` (prefix matches MUI's `searchScope.full`); `a11y.scopeTrigger` → `"Cambiar el ámbito de búsqueda. Buscando actualmente en: {{option}}"`.
- [ ] T005 [P] Edit `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/search/search.bg.json` — same four key changes as T002 with Bulgarian translations matching MUI: `scopeAll` → `"Цялата платформа"` (matches MUI's `scope.platform`); `searchAllSpaces` → `"Търсене в цялата платформа"`; `scopeTriggerLabel` → `"Търсене в: {{option}}"` (prefix matches MUI's `searchScope.full`); `a11y.scopeTrigger` → `"Промяна на обхвата на търсенето. Текущо търсене в: {{option}}"`.
- [ ] T006 [P] Edit `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/search/search.de.json` — same four key changes as T002 with German translations: `scopeAll` → `"Gesamte Plattform"` (proper translation; MUI source still has the English fallback "Entire platform"); `searchAllSpaces` → `"Stattdessen die gesamte Plattform durchsuchen"`; `scopeTriggerLabel` → `"Suchen in: {{option}}"`; `a11y.scopeTrigger` → `"Suchbereich ändern. Aktuelle Suche in: {{option}}"`.
- [ ] T007 [P] Edit `/Users/polibon/Projects/alkemio/client-web/src/crd/i18n/search/search.fr.json` — same four key changes as T002 with French translations: `scopeAll` → `"Toute la plateforme"` (proper translation; MUI source still has the English fallback "Entire platform"); `searchAllSpaces` → `"Rechercher dans toute la plateforme"`; `scopeTriggerLabel` → `"Rechercher dans : {{option}}"`; `a11y.scopeTrigger` → `"Modifier la portée de la recherche. Recherche actuelle dans : {{option}}"`.
- [ ] T008 Update the scope trigger button in `/Users/polibon/Projects/alkemio/client-web/src/crd/components/search/SearchTagInput.tsx`: replace the bare `<span>{scope.activeScope === 'all' ? t('search.scopeAll') : scope.currentSpaceName}</span>` with `<span>{t('search.scopeTriggerLabel', { option: scope.activeScope === 'all' ? t('search.scopeAll') : scope.currentSpaceName })}</span>` (the span is the only direct child of the trigger button, after the leading Globe icon and before the ChevronDown icon). Add `aria-label={t('search.a11y.scopeTrigger', { option: scope.activeScope === 'all' ? t('search.scopeAll') : scope.currentSpaceName })}` to the trigger `<button>` (the one inside `<DropdownMenuTrigger asChild>`). Do NOT change props, behavior, imports, or any other element.

**Checkpoint**: All six locale files contain the four updated/new keys; the scope trigger renders "Search In: …" with an accessible name. The integration layer can now reference the keys safely.

---

## Phase 3: User Story 1 — Choose Scope While Browsing a Space (Priority: P1) 🎯 MVP

**Goal**: When the user is on any Space tree URL (top-level Space or Subspace), the overlay shows a scope dropdown with the level-zero Space's display name and "Entire platform"; default scope is the current Space; switching re-fetches automatically; results truly filter to the active scope. Also implicitly delivers User Story 2 (no dropdown off-Space) since the same conditional logic governs both — see the dedicated [US2] verification task below.

**Independent Test**: With CRD enabled, navigate to a Space (e.g. `/secondspace`), open the overlay, type a term and press Enter. Verify (a) trigger reads "Search In: <Space name>", (b) results are restricted to that Space (the screenshot bug from `localhost:3000/secondspace` no longer reproduces), (c) switching the scope to "Entire platform" re-fetches and broadens results, (d) switching back narrows them again. See `quickstart.md` Tests 1, 2, 6, 10.

### Implementation for User Story 1

The following four tasks all edit the same file and are intentionally sequential (no `[P]`).

- [ ] T009 [US1] In `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/search/CrdSearchOverlay.tsx`: replace the broken Space detection. (a) Remove the `extractSpaceNameIdFromPath` function and its `useLocation()` call (the function is the one whose body matches `pathname.match(/^\/space\/([^/]+)/)` and the call site assigns to `spaceNameId`). (b) Remove the `useSpaceUrlResolverQuery` call (the one whose `variables.spaceNameId` reads from the just-removed extraction) and remove `useSpaceUrlResolverQuery` from the import line. Also drop `useLocation` from the `react-router-dom` import if no other call sites remain. (c) Add `import { useUrlResolver } from '@/main/routing/urlResolver/UrlResolverProvider';` and call `const { levelZeroSpaceId, loading: urlResolverLoading } = useUrlResolver();`. (d) Add `useSpaceAboutBaseQuery` to the existing `@/core/apollo/generated/apollo-hooks` import and call `const { data: spaceAboutData, loading: spaceQueryLoading } = useSpaceAboutBaseQuery({ variables: { spaceId: levelZeroSpaceId ?? '' }, skip: !levelZeroSpaceId });`. (e) Derive `const spaceDisplayName = spaceAboutData?.lookup.space?.about.profile.displayName ?? '';` and `const spaceContextLoading = urlResolverLoading || (Boolean(levelZeroSpaceId) && spaceQueryLoading);`. The existing local `spaceId` const (formerly assigned from `spaceIdData?.lookupByName.space?.id`) is no longer needed — every downstream reference to `spaceId` becomes `levelZeroSpaceId` instead.
- [ ] T010 [US1] In the same file, add the `activeScope` state and its default rule directly below the new derived values from T009. Use `type ActiveScope = 'space' | 'all'`; declare `const [activeScope, setActiveScope] = useState<ActiveScope>(levelZeroSpaceId ? 'space' : 'all');`. Add a `handleScopeChange` function: `const handleScopeChange = (next: 'all' | string) => setActiveScope(next === 'all' ? 'all' : 'space');` (the `next` parameter type matches the `SearchScopeData.activeScope: 'all' | string` contract from `contracts/search-scope-props.md`).
- [ ] T011 [US1] In the same file, update the variables block of the `useSearchQuery` call (the one whose `variables.searchData.terms` is `searchTags`): change `searchInSpaceFilter: spaceId` to `searchInSpaceFilter: activeScope === 'space' ? levelZeroSpaceId : undefined`. Update its `skip` from `searchTags.length === 0 || resolvingSpace` to `searchTags.length === 0 || spaceContextLoading`. Apply the same `searchInSpaceFilter` change inside the `fetchMoreResults` function (the one whose `variables.searchData.filters` is a single-element array driven by `resultsType`).
- [ ] T012 [US1] In the same file, update the `<SearchOverlay>` JSX (the only `<SearchOverlay ... />` element in the file's `return`): just before that JSX block, add: ```tsx
  const scope = (levelZeroSpaceId && !spaceContextLoading) ? { currentSpaceName: spaceDisplayName, activeScope: activeScope === 'space' ? spaceDisplayName : 'all' as const } : undefined;
  ``` Pass `scope={scope}` and `onScopeChange={scope ? handleScopeChange : undefined}` as new props on the `<SearchOverlay>` element. Remove the now-stale block comment that begins "// Scope is determined by the current route pathname. The overlay does not render a scope dropdown..." (it sits immediately above the return statement).
- [ ] T013 [US1] Manual QA per `/Users/polibon/Projects/alkemio/client-web/specs/093-crd-search-scope/quickstart.md` Tests 1, 2, 6, and 10. Plus three additional spot-checks: (a) **Race condition (FR-013, "Scope changed mid-flight")** — open Chrome DevTools Network panel, set throttling to "Slow 3G"; on a Space, type a term that takes >2s to return; while the spinner is visible, switch the scope; verify the final visible results match the **new** scope, with no flash of the old scope's results, no stale counts in the sidebar/pill nav, and no race between the two responses. (b) **Pre-filled query via URL (Edge case "Pre-filled query via URL parameter")** — navigate to a Space URL with a search-terms URL parameter that triggers the overlay open with an initial query; verify the first search executes scoped to that Space (not platform-wide), matching FR-007's default. (c) Confirm the original bug (search "wb" on `/secondspace` returning posts from Welcome Space) no longer reproduces.

**Checkpoint**: At this point, US1 is fully functional: scope dropdown visible on Space pages, default-current-Space, switchable, results truly filter, Subspace pages correctly use the level-zero Space. The original bug from the user's screenshot is fixed.

---

## Phase 4: User Story 2 — No Scope Selector Outside a Space (Priority: P1)

**Goal**: On non-Space routes (`/home`, `/spaces`, `/admin`, profile pages, etc.), the overlay shows no scope selector and the search is platform-wide. The layout is unchanged from before this feature on those routes.

**Independent Test**: Open the overlay on `/home`, `/spaces`, and an admin route. Verify no scope trigger is rendered and search returns platform-wide results. See `quickstart.md` Test 3.

**Note on implementation**: User Story 2 shares its code path with US1 — the `scope = (levelZeroSpaceId && !spaceContextLoading) ? {...} : undefined` line in T012 is the same conditional that hides the dropdown when no Space context exists. There is no separate code task for US2; T012's `undefined` branch is what implements it. Verification is independent.

- [ ] T014 [US2] Manual QA per `quickstart.md` Test 3, covering ALL routes enumerated in SC-001: `/home`, `/spaces` (the spaces explorer), at least one admin route (e.g. `/admin/space-management` or `/admin/users`), and the user's own profile (`/user/<id>`). For each: open the overlay; verify (i) the scope trigger is absent from the search bar, (ii) typing a term and pressing Enter returns platform-wide results (results from multiple Spaces appear). Also verify the cross-page transition from spec acceptance scenario US2-3: open the overlay on `/home`, click a Space result card, let the navigation complete; re-open the overlay on that Space; verify the scope trigger now appears with that Space as the default.

**Checkpoint**: US1 and US2 together prove the conditional Space-detection logic is correct in both directions.

---

## Phase 5: User Story 3 — Recover From No Results by Widening to Platform (Priority: P2)

**Goal**: When a Space-scoped search returns zero results, the no-results panel shows a "Search the entire platform instead" button. Clicking it switches the scope to "Entire platform" and re-runs the query. The button is hidden when the active scope is already "Entire platform" or when there is no Space context.

**Independent Test**: Inside a Space, search for a term that has results elsewhere on the platform but not in this Space. Verify the recovery button appears, click it, and verify the scope switches to "Entire platform" and results appear. Also verify the button is NOT shown when scope is already "Entire platform" or on non-Space pages. See `quickstart.md` Test 4.

### Implementation for User Story 3

- [ ] T015 [US3] In `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/search/CrdSearchOverlay.tsx`: pass `onSearchAll` to `<SearchOverlay>` only when the recovery button should be visible. Immediately after the `scope` derivation added in T012, add: ```tsx
  const onSearchAll = (levelZeroSpaceId && activeScope === 'space') ? () => setActiveScope('all') : undefined;
  ``` Pass `onSearchAll={onSearchAll}` as a new prop on the `<SearchOverlay>` element. The existing `SearchOverlay` already renders the button (with the updated "Search the entire platform instead" copy from T002–T007) when this callback is provided and the overlay state is `'no-results'`.
- [ ] T016 [US3] Manual QA per `quickstart.md` Test 4, using a 5-term matrix to satisfy SC-004. Pick five representative search terms in your local data such that each term has zero hits inside a chosen Space but at least one hit elsewhere on the platform (e.g. a user name, an organization name, a post title fragment unique to another Space, a whiteboard title, and a tag string). For each of the 5 terms: enter it while scoped to the Space; verify the no-results panel appears with the "Search the entire platform instead" button; click it; verify scope switches to "Entire platform" and at least one matching result appears. Also verify the four spec acceptance scenarios for US3: button shown only when scoped + zero results; click switches scope and re-runs; button hidden when already platform-wide; button hidden off-Space. Record the 5 terms used and the pass/fail outcome in the PR description as evidence for SC-004.

**Checkpoint**: US3 is functional. Users escape no-results dead-ends with one click instead of two.

---

## Phase 6: User Story 4 — Scope Selector State Resets on Overlay Close (Priority: P3)

**Goal**: Closing and re-opening the overlay returns the active scope to its default for the current page (current Space if inside one; otherwise no scope state). Previous scope choices do not leak across opens.

**Independent Test**: Inside a Space, open the overlay, switch scope to "Entire platform", close it, re-open it. Verify the scope is back to the current Space. Also verify navigation between Spaces while closed updates the default. See `quickstart.md` Test 5.

### Implementation for User Story 4

- [ ] T017 [US4] In `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/search/CrdSearchOverlay.tsx`: extend the existing reset-on-close `useEffect` (the one whose dep array is `[isOpen]` and whose `if (!isOpen)` branch resets `searchTags`, `inputValue`, `sectionFilters`, `visibleCounts`, and the `canXxxLoadMore` flags) to also reset `activeScope`. Inside the `if (!isOpen)` branch, append: `setActiveScope(levelZeroSpaceId ? 'space' : 'all');`. This ensures every overlay close resets the scope to the appropriate default for whatever Space (or non-Space) page the user is currently on, so the next open uses the correct default per FR-017 and FR-018.
- [ ] T018 [US4] Manual QA per `quickstart.md` Test 5. Verify all three spec acceptance scenarios for US4: scope reset after close+reopen on same Space; scope absent after navigating from Space to non-Space; scope reflects new Space after Space A → Space B navigation via a result click.

**Checkpoint**: US4 is functional. State lifecycle is consistent with how the rest of the overlay's state is managed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify a11y, language coverage, regressions, and the MUI fallback path. These tasks span the whole feature.

- [ ] T019 [P] Manual a11y verification per `quickstart.md` Test 8. Use only the keyboard to focus and operate the scope trigger; verify the dropdown opens with Enter/Space, navigates with arrows, closes with Escape, and announces its accessible name (the `a11y.scopeTrigger` aria-label) under VoiceOver (macOS) or NVDA (Windows). Verify FR-021 (announce scope changes) in **both** scenarios separately: (a) **Both scopes have results**: scope to current Space, type a term that returns ≥1 result; switch scope to "Entire platform"; verify the screen reader announces the updated result count from the overlay's existing `aria-live="polite"` region (e.g. "4 results found" → "23 results found"). (b) **Empty → non-empty transition**: scope to current Space with a term that returns 0 results in the Space but >0 platform-wide; verify the screen reader announces "No results found"; click the recovery button (or the dropdown); verify the screen reader announces "Searching…" then the platform-wide result count. (c) Also verify the dynamic `aria-label` change on the trigger button does not produce duplicate announcements (it should be silent for sighted users — the aria-live region carries the announcement).
- [ ] T020 [P] Manual translation parity check per `quickstart.md` Test 7. Cycle the platform language to nl, es, bg, de, and fr via the footer dropdown. On a Space page, open the overlay each time and verify (a) the trigger reads the localized "Search In: …" form, (b) the "Entire platform" option is translated, (c) the recovery button (force a no-results state) is translated, (d) the browser console has no `i18next::translator: missingKey` warnings for `search.scopeTriggerLabel`, `search.a11y.scopeTrigger`, `search.scopeAll`, or `search.searchAllSpaces`.
- [ ] T021 Run `pnpm lint` from the repo root. Fix any TypeScript or Biome/ESLint issues introduced by changes to `CrdSearchOverlay.tsx` and `SearchTagInput.tsx`.
- [ ] T022 Audit `src/main/crdPages/search/` and `src/crd/components/search/` for any existing `*.test.ts(x)` files (`find /Users/polibon/Projects/alkemio/client-web/src/main/crdPages/search /Users/polibon/Projects/alkemio/client-web/src/crd/components/search -name '*.test.ts*' 2>/dev/null`). If any exist whose expectations reference the old copy ("All Spaces", "Search all Spaces instead") or the bare-label scope trigger, update them. Then run `pnpm vitest run` from the repo root; the full suite must pass before merge.
- [ ] T023 MUI fallback regression check per `quickstart.md` Test 9. Disable CRD via `localStorage.removeItem('alkemio-crd-enabled'); location.reload();`. On a Space, open the MUI search bar and confirm its existing "Search In: <space>" / "Entire platform" dropdown still works exactly as before — no regression in the legacy path. SC-007 is the gate.
- [ ] T024 [P] Final code review pass on `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/search/CrdSearchOverlay.tsx`: confirm no `useMemo` / `useCallback` / `React.memo` were added (React Compiler rule), no `@mui/*` or `@emotion/*` imports were introduced, the file does not exceed the original surface area for unrelated changes, and no comments / docstrings were added on lines that weren't otherwise touched (per CLAUDE.md "Don't add comments to code you didn't change").
- [ ] T025 Add automated test for the integration logic at `/Users/polibon/Projects/alkemio/client-web/src/main/crdPages/search/CrdSearchOverlay.test.tsx` using **Vitest + React Testing Library** (the project's standard test stack). Mock `useUrlResolver` from `@/main/routing/urlResolver/UrlResolverProvider` and `useSpaceAboutBaseQuery` from `@/core/apollo/generated/apollo-hooks`; mock `useSearchQuery` to capture the `variables` it receives. Mock the `useSearch` context hook to return `{ isOpen: true, ... }`. Render `<CrdSearchOverlay />` and assert: (a) when `useUrlResolver` returns `levelZeroSpaceId: 'space-uuid-A'` and `useSpaceAboutBaseQuery` returns a Space whose `displayName` is `"Space A"`, the `useSearchQuery` mock receives `searchInSpaceFilter: 'space-uuid-A'` (default scope is the current Space per FR-007); (b) after a user simulates choosing the "Entire platform" option in the dropdown, the next `useSearchQuery` call receives `searchInSpaceFilter: undefined` (FR-012); (c) when `useUrlResolver` returns `levelZeroSpaceId: undefined`, no `scope` prop is passed to `<SearchOverlay>` and `searchInSpaceFilter` is `undefined` (FR-003 / FR-004); (d) when `levelZeroSpaceId` is truthy and `activeScope === 'all'`, the `onSearchAll` prop passed to `<SearchOverlay>` is `undefined` (FR-016); (e) closing the overlay (re-render with `isOpen: false`, then `isOpen: true`) restores the scope back to the current Space default (FR-017). This test is the testing evidence required by Constitution Principle V and Engineering Workflow #4. Run `pnpm vitest run src/main/crdPages/search/CrdSearchOverlay.test.tsx` and ensure it passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories. T002–T007 are parallelizable; T008 must come after T002 (English key must exist) but in practice can run in parallel since it's a different file
- **Phase 3 (US1)**: Depends on Phase 2 (translations + trigger format must exist)
- **Phase 4 (US2)**: Depends on Phase 3 (US2 is verified by the same code path that US1 implements; T014 just verifies the off-Space branch)
- **Phase 5 (US3)**: Depends on Phase 3 (T015 builds on the `setActiveScope` setter introduced in T010 and the `<SearchOverlay>` wiring from T012)
- **Phase 6 (US4)**: Depends on Phase 3 (T017 extends an effect that uses `setActiveScope` from T010)
- **Phase 7 (Polish)**: Depends on Phases 3, 5, 6 being complete. T025 (the automated test) specifically depends on Phases 3, 5, and 6, since it asserts behaviors implemented across those phases (default scope, scope switch, no-Space branch, recovery callback, reset-on-close).

### Within-File Sequencing

All of T009, T010, T011, T012, T015, T017 edit the same file: `src/main/crdPages/search/CrdSearchOverlay.tsx`. They MUST run sequentially (no `[P]`). Logical execution order:

1. T009 (replace detection)
2. T010 (state + handler)
3. T011 (search query variables)
4. T012 (SearchOverlay scope props)
5. T015 (SearchOverlay onSearchAll prop)
6. T017 (reset effect extension)

### Parallel Opportunities

- T002, T003, T004, T005, T006, T007 — all six i18n files in parallel (six different files, no shared content)
- T008 — independent file (`SearchTagInput.tsx`); can run in parallel with the i18n tasks once T002 lands the English keys
- T019, T020, T024 — all manual / read-only verifications; no file conflicts
- T025 — independent test file (`CrdSearchOverlay.test.tsx`); can be drafted alongside the implementation (US1 phase) but executed only after Phase 3 lands

### User Story Independence

- US1 (T009–T013) delivers the MVP and the core bug fix. The feature is shippable after Phase 3 if priorities slip.
- US2 (T014) has no implementation cost — it's a verification of the off-Space branch of US1's conditional. Drops out for free.
- US3 (T015–T016) is a one-line addition (`onSearchAll` prop) plus QA. Adds polish but is not gating.
- US4 (T017–T018) is a one-line addition to the existing reset effect. Adds consistency but is not gating.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch all six i18n updates together (different files, no conflicts):
Task: "Edit src/crd/i18n/search/search.en.json — rename scopeAll, rename searchAllSpaces, add scopeTriggerLabel, add a11y.scopeTrigger"
Task: "Edit src/crd/i18n/search/search.nl.json — same four key changes with Dutch translations"
Task: "Edit src/crd/i18n/search/search.es.json — same four key changes with Spanish translations"
Task: "Edit src/crd/i18n/search/search.bg.json — same four key changes with Bulgarian translations"
Task: "Edit src/crd/i18n/search/search.de.json — same four key changes with German translations"
Task: "Edit src/crd/i18n/search/search.fr.json — same four key changes with French translations"

# In parallel with the above (different file, depends only on T002 producing the English key for cross-reference):
Task: "Update SearchTagInput.tsx trigger to use scopeTriggerLabel + a11y.scopeTrigger keys"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

The MVP is the bug fix + the core scope-switching behavior:

1. Phase 1 (T001) — confirm baseline
2. Phase 2 (T002–T008) — translations + trigger format
3. Phase 3 (T009–T013) — integration changes that fix the bug and wire the dropdown
4. **STOP and validate** with quickstart Tests 1, 2, 6, 10
5. Optionally validate US2 (T014) since it's free
6. Ready to ship if priorities require

### Incremental Delivery

1. Setup + Foundational → translations and trigger format ready
2. Add US1 → bug fix lands → MVP ✅
3. Add US2 verification → confirms off-Space path → free deliverable
4. Add US3 → recovery button works → polish #1
5. Add US4 → reset-on-close works → polish #2
6. Run Polish phase → ship

### Parallel Team Strategy

This feature is not realistically parallel-developable across multiple engineers because the core logic lives in one ~600-line file. A single engineer should land Phases 2 and 3 in one PR (the MVP), then add US3 and US4 in follow-ups if desired. Translations (Phase 2) can be assigned to a translator/reviewer in parallel with the engineering work, with the integration engineer landing the English copy first as the source for translation.

---

## Notes

- All user-facing text changes go through the `crd-search` i18n namespace (manual translations, not Crowdin) per `src/crd/CLAUDE.md`.
- No new components, no new GraphQL operations, no codegen.
- The fix replaces the root cause (URL-regex Space detection) rather than patching it — Constitution V (Engineering Workflow #5: Root Cause Analysis Before Fixes) applies.
- The MUI search dialog and its scope behavior remain untouched. Both versions coexist gated by the existing `useCrdEnabled` localStorage toggle.
- React Compiler is enabled — do NOT add `useMemo` / `useCallback` / `React.memo` while editing `CrdSearchOverlay.tsx`.
