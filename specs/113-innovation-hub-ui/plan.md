# Implementation Plan: Innovation Hub UI — searchable, lazy-loaded, smaller Space cards

**Branch**: `story/9910-innovation-hub-ui` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/113-innovation-hub-ui/spec.md`

## Summary

Refine the Innovation Hub home Spaces section so a hub with many Spaces (the story's example is 25) "looks nice": render the **compact** explore-spaces `SpaceCard` in a denser auto-fill grid, add a **search** input scoped to the hub's own Spaces, and add **lazy "Load more"** batching. The hub's full configured Space set is already resolved in memory by the existing integration hook, so search and batching are done **client-side** in the CRD presentational component over the `SpaceCardData[]` prop, with visual-only `useState` for search terms and the visible-batch cursor. No new GraphQL, no server pagination, no new card component. The integration layer continues to own data fetching/mapping only. New strings go into the existing `crd-innovationHub` namespace (reusing `crd-common:loadMore`) across all six locales with key parity.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: shadcn/ui + Tailwind CSS v4 + Radix UI (`@/crd/*`), `lucide-react`, `react-i18next`, Apollo Client (generated hooks only — already wired, unchanged this story)
**Storage**: N/A — Apollo normalized cache via the existing `useDashboardSpacesQuery`; no new persistence
**Testing**: Vitest + Testing Library (jsdom). New unit tests for the client-side search/slice logic and the Spaces-section rendering states.
**Target Platform**: Browser SPA (Vite), >90% global browser support per repo policy
**Project Type**: Web (single client-web SPA); CRD presentational + `crdPages` integration split
**Performance Goals**: Initial hub render shows ≤ 1 batch (12) of cards regardless of hub size; search/filter is O(n) over a bounded curated set (no perceptible lag for typical hubs of tens of Spaces)
**Constraints**: CRD purity (no MUI/Emotion, no GraphQL/domain/auth/routing in `src/crd/`, plain-TS props, callbacks, Tailwind + semantic tokens); WCAG 2.1 AA; i18n key parity across en/nl/es/bg/de/fr
**Scale/Scope**: One presentational component refactor (`InnovationHubHome` Spaces section), zero or one new sub-component, new i18n keys in one namespace × 6 locales, unit tests. No routing, schema, or data-fetching change.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **I. Domain-Driven Frontend Boundaries** — PASS. No business rules move into components. Data resolution stays in `src/main/crdPages/innovationHub/` (the existing hook + mappers). The CRD component only renders and manages visual state.
- **II. React 19 Concurrent UX Discipline** — PASS. Pure rendering; visual state via plain `useState`; no manual memoization (compiler handles it); skeleton/empty/busy fallback states are explicit and accessible.
- **III. GraphQL Contract Fidelity** — PASS. No schema change, no new query. Reuses the existing generated `useDashboardSpacesQuery`. No `codegen` needed (will run/verify regardless to be safe). No generated types leak into CRD props (`SpaceCardData` is a plain type).
- **IV. State & Side-Effect Isolation** — PASS. Search/batch state is visual-only and local; no new global state, no new effects beyond what the prototype pattern requires (a reset of `visibleCount` when terms change, which is pure derivation / a controlled effect-free reset).
- **V. Experience Quality & Safeguards** — PASS. WCAG 2.1 AA controls; new unit tests for the search/slice logic and render states; PR description records accessibility + verification evidence.
- **Architecture Standards #2 (CRD-only)** — PASS. Built in `src/crd/` + `src/main/crdPages/`; zero `@mui/*`/`@emotion/*`.
- **Architecture Standards #3 (i18n)** — PASS. New strings in `crd-innovationHub` across all six locales with parity; reuse `crd-common:loadMore`.
- **Architecture Standards #5 (no barrels)** — PASS. Explicit file-path imports only.
- **Architecture Standards #6 (SOLID/DRY)** — PASS. The Spaces section is a single-responsibility presentational unit; search/slice derivation is one place; reuses `SpaceCard`/`SpaceCardSkeleton`/`TagsInput`/`Button` rather than duplicating.

No violations. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/113-innovation-hub-ui/
├── plan.md              # This file
├── research.md          # Phase 0 — reuse map, decisions, alternatives
├── data-model.md        # Phase 1 — view-model shapes & state
├── quickstart.md        # Phase 1 — how to run/verify
├── contracts/
│   └── innovation-hub-home.md   # Phase 1 — CRD component prop contract
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md             # from /speckit-tasks
```

### Source Code (repository root)

```text
src/crd/components/innovationHub/
├── InnovationHubHome.tsx          # MODIFIED — Spaces section gains search + load-more + compact grid
└── HubSpacesSection.tsx           # NEW (optional extraction) — search input + counter + grid + load-more,
                                   #   visual-state-only; keeps InnovationHubHome readable (<150 lines rule)

src/crd/components/innovationHub/
└── HubSpacesSection.test.tsx      # NEW — unit tests: batching, search filter, empty/no-match, a11y labels

src/crd/i18n/innovationHub/
├── innovationHub.en.json          # MODIFIED — new home.spacesSection.* keys
├── innovationHub.nl.json          # MODIFIED
├── innovationHub.es.json          # MODIFIED
├── innovationHub.bg.json          # MODIFIED
├── innovationHub.de.json          # MODIFIED
└── innovationHub.fr.json          # MODIFIED

src/main/crdPages/innovationHub/
└── CrdInnovationHubHomePage.tsx   # UNCHANGED (passes spaces/spacesLoading as today)
    hooks/useInnovationHubHomeData.ts   # UNCHANGED (already resolves the full ordered set)
    dataMappers/mapInnovationHubToHomeData.ts  # UNCHANGED
```

**Structure decision**: Keep the integration layer untouched — it already resolves exactly the hub's ordered `SpaceCardData[]` and the `spacesLoading` flag. All change is presentational, inside `src/crd/components/innovationHub/`. Extract a `HubSpacesSection` sub-component because adding search + counter + load-more to `InnovationHubHome` would push it past the ~150-line CRD extraction threshold and the Spaces section is a self-contained visual unit. The sub-component holds the visual search/batch state; `InnovationHubHome` passes through `spaces` and `spacesLoading`.

## Phase 0 — Research

See [research.md](./research.md). Key decisions (all from Clarifications): client-side search+slice over the resolved set; extract/adapt the explore-spaces patterns rather than mount `SpaceExplorer`; visual state in the CRD component; search-only (no filter dropdown); `crd-innovationHub` namespace + `crd-common:loadMore`; batch size 12; match on name/description/tags (AND across terms, case-insensitive); suppress search box on empty hub.

## Phase 1 — Design & Contracts

- **Data model** ([data-model.md](./data-model.md)): the `SpaceCardData` prop array (unchanged shape), plus the component's visual state (`searchTerms: string[]`, `visibleCount: number`) and derived values (`filtered`, `displayed`, `hasMore`, `matchedCount`).
- **Contract** ([contracts/innovation-hub-home.md](./contracts/innovation-hub-home.md)): the updated `InnovationHubHome` / new `HubSpacesSection` prop contract. Props remain plain TS; behavior (navigation via `SpaceCard` `href`) stays prop/href-driven.
- **Quickstart** ([quickstart.md](./quickstart.md)): how to run the app/standalone preview and the local gates.
- **Agent context**: update the repo's agent context file (`CLAUDE.md` Active Technologies / Recent Changes) via the SpecKit update script — no new runtime dependencies.

## Complexity Tracking

No constitution deviations. Table intentionally empty.
