# Tasks: Innovation Hub UI — searchable, lazy-loaded, smaller Space cards (story #9910)

**Input**: Design documents from `specs/113-innovation-hub-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/innovation-hub-home.md

**Tests**: Included — the feature has non-trivial pure logic (search match + slice + state transitions) that the constitution requires testing (Principle V).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency)
- **[Story]**: US1 (smaller cards + lazy-load), US2 (search), US3 (curation/order preserved), or SETUP/POLISH

## Path Conventions

CRD presentational: `src/crd/components/innovationHub/`; i18n: `src/crd/i18n/innovationHub/`; integration (read-only this story): `src/main/crdPages/innovationHub/`.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 [SETUP] Confirm baseline gates are green before any change: run `pnpm install`, `pnpm vitest run`, `pnpm lint` in the worktree root and record the pre-change state. **Acceptance**: all three succeed (or known-baseline failures noted) so post-change failures are attributable.
- [X] T002 [SETUP] Re-read the reuse sources to anchor implementation: `src/crd/components/space/SpaceExplorer.tsx` (search/counter/grid/load-more patterns), `src/crd/forms/tags-input.tsx` (TagsInput props), `src/crd/components/space/SpaceCard.tsx` (`SpaceCardData`, `SpaceCardSkeleton`). **Acceptance**: prop shapes and the auto-fill grid class confirmed against contracts/innovation-hub-home.md.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: i18n keys must exist before the component references them (lint/typecheck-safe).

- [X] T003 [P] [US2] Add the new `home.spacesSection.*` search/results keys to `src/crd/i18n/innovationHub/innovationHub.en.json` (`searchPlaceholder`, `searchAria`, `showing`, `spacesLabel`, `noResultsTitle`, `noResultsMessage`, `clearSearch`). Reuse existing `home.spacesSection.title|empty|loading` and `crd-common:loadMore`. **Acceptance**: keys present in EN; values match research.md copy.
- [X] T004 [P] [US2] Mirror the same keys (translated) into `innovationHub.nl.json`, `innovationHub.es.json`, `innovationHub.bg.json`, `innovationHub.de.json`, `innovationHub.fr.json` — honoring the do-not-translate glossary (keep "Space/Spaces" in NL). **Acceptance**: all six files have identical key sets (parity) under `home.spacesSection.*`.
- [X] T005 [US2] Verify key parity across the six locale files programmatically (compare sorted key paths). **Acceptance**: zero key present in one locale and missing in another (SC-006).

---

## Phase 3: User Story 1 — Smaller cards + lazy-load (Priority: P1) 🎯 MVP

**Goal**: Compact `SpaceCard` in a denser auto-fill grid, initial batch + "Load more".
**Independent test**: hub with > 12 Spaces shows 12 compact cards + "Load more"; clicking appends a batch; control hides when exhausted; ≤ 12 shows all, no control.

- [X] T006 [US1] Create `src/crd/components/innovationHub/HubSpacesSection.tsx` per contracts/innovation-hub-home.md: props `{ spaces, hubName, spacesLoading? }`; visual state `searchTerms`, `visibleCount` (= `BATCH_SIZE` const = 12); derive `filtered`/`displayed`/`hasMore`/`matchedCount` (data-model.md). Render: section title, skeleton grid while loading-empty, empty-hub state, compact `SpaceCard` auto-fill grid (`grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`), and "Load more" (`crd-common:loadMore`) when `hasMore`. CRD-pure: no forbidden imports, Tailwind + semantic tokens, `<ul role="list">`/`<li>`, `<output>` loading, decorative icons `aria-hidden`. **Acceptance**: FR-001, FR-002, FR-005, FR-006, FR-010; lint/typecheck clean.
- [X] T007 [US1] Wire `HubSpacesSection` into `src/crd/components/innovationHub/InnovationHubHome.tsx`: replace the inline static Spaces `<section>` (skeleton/empty/static `<ul>`) with `<HubSpacesSection spaces={spaces} hubName={data.name} spacesLoading={spacesLoading} />`; keep all other sections (banner/header/description/all-spaces CTA) unchanged; drop now-unused imports (`SpaceCard`, `SpaceCardSkeleton`) from `InnovationHubHome` if no longer referenced. **Acceptance**: FR-016 (other behaviors preserved); InnovationHubHome props unchanged; lint clean.

**Checkpoint**: US1 independently demoable — a large hub renders compact, batched cards.

---

## Phase 4: User Story 2 — Search within the hub (Priority: P2)

**Goal**: Search input filtering the hub's Spaces; counter; reset-on-search; no-results state.
**Independent test**: typing narrows the grid, counter updates, batch resets, clearing restores, no-match shows empty state.

- [X] T008 [US2] In `HubSpacesSection.tsx`, add the `TagsInput` search (icon, `searchPlaceholder`, persistent `searchAria`) shown only when `spaces.length > 0`; bind to `searchTerms`; on change reset `visibleCount` to `BATCH_SIZE`. Implement `everyTermMatches` (case-insensitive substring over `name`+`description`+`tags`, AND across terms) per data-model.md. **Acceptance**: FR-003, FR-004, FR-007; search box hidden on empty hub.
- [X] T009 [US2] Add the "Showing N Spaces" results counter (`showing` + `matchedCount` + `spacesLabel`) shown when there are displayed Spaces, mirroring `SpaceExplorer`'s counter treatment. **Acceptance**: FR-008.
- [X] T010 [US2] Add the no-results empty state (search active, zero matches): dashed `FolderOpen` card with `noResultsTitle`/`noResultsMessage` and a "Clear search" button that resets `searchTerms` and `visibleCount`. Keep this distinct from the empty-hub state. **Acceptance**: FR-009; edge cases "no-match" and "empty hub" render different states.

**Checkpoint**: US1 + US2 — large hub is searchable and batched.

---

## Phase 5: User Story 3 — Curation & order preserved (Priority: P3)

**Goal**: Guardrail — only hub Spaces, list order preserved, through search/load-more.
**Independent test**: list hub order matches admin order; visibility hub shows only its visibility; search/load-more never surface non-hub Spaces.

- [X] T011 [US3] Confirm (no code change expected) the integration layer still feeds exactly the hub's ordered set: re-read `src/main/crdPages/innovationHub/hooks/useInnovationHubHomeData.ts` and `dataMappers/mapInnovationHubToHomeData.ts`; verify `HubSpacesSection` only ever derives from the `spaces` prop (never re-fetches). **Acceptance**: FR-011, SC-003, SC-004 — order preserved by `filter`+`slice`; no platform query introduced.

---

## Phase 6: Tests

- [X] T012 [P] [US1] `src/crd/components/innovationHub/HubSpacesSection.test.tsx`: render with 25 mock `SpaceCardData` → 12 cards + "Load more"; click → 24; click → 25 and no "Load more". Render with 12 → all, no "Load more". Render `spacesLoading` empty → skeletons. Render empty hub → empty-hub state, no search box. **Acceptance**: covers FR-005/006/010 + edge cases.
- [X] T013 [P] [US2] Extend the test: type a term matching a subset → grid narrows + counter; multi-term AND; clear → restored + batch reset; search resets `visibleCount`; no-match → no-results state + Clear search restores. **Acceptance**: covers FR-003/007/008/009 + search edge cases.
- [X] T014 [P] [US3] Test order preservation: a list-style mock array stays in input order through filter+slice; nothing outside the input array ever renders. **Acceptance**: SC-003/SC-004.

---

## Phase 7: Polish & Exit Gates

- [X] T015 [POLISH] Accessibility pass on `HubSpacesSection`: persistent `searchAria` on TagsInput, `<output>`/`role=status` loading label, `<ul role=list>`/`<li>`, visible `focus-visible:ring` on search/load-more/clear, decorative icons `aria-hidden`, no color-only signaling. **Acceptance**: FR-015, SC-007.
- [X] T016 [POLISH] Forbidden-import scan on the two CRD files (grep for `@mui/`,`@emotion/`,`@apollo/client`,`@/core/apollo`,`@/domain/`,`react-router-dom`,`formik`) → zero hits; confirm semantic typography tokens used (no raw `text-sm font-semibold` combos). **Acceptance**: SC-005, FR-013.
- [X] T017 [POLISH] Run the full local gate: `pnpm vitest run` → `pnpm build` → `pnpm lint`. Fix any failure and restart the gate from the top. **Acceptance**: all three green (SC-005).
- [X] T018 [POLISH] Commit in logical slices (i18n, component, wiring, tests) with signed commits; ensure no stray `.py` or `prototype/` files staged. **Acceptance**: clean `git status`, gates green.

---

## Dependencies & Execution Order

- Setup (T001–T002) → Foundational i18n (T003–T005) → US1 (T006–T007) → US2 (T008–T010) → US3 (T011) → Tests (T012–T014) → Polish (T015–T018).
- T003 and T004 are [P] (different files). T012/T013/T014 are [P] (same new test file authored once — run/extend sequentially if literally one file; treat the three as one authoring pass).
- US1 is the MVP and is independently shippable; US2 builds on the same component; US3 is a verification guardrail with no expected code change.

## Implementation Strategy

MVP-first: land T006–T007 (compact cards + lazy-load) green, then layer T008–T010 (search), then verify T011, then tests + polish. Keep the working tree green between phases.
