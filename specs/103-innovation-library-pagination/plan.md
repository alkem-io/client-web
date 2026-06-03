# Implementation Plan: Paginated Innovation Library (Client Adoption)

**Branch**: `crd-fixes-innovation-library` (no new branch — `SPECIFY_FEATURE=103-innovation-library-pagination`) | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/103-innovation-library-pagination/spec.md`

## Summary

Adopt the server's cursor-paginated Innovation Library fields
(`Library.templatesPaginated(first, after, filter)` and
`Library.innovationPacksPaginated(first, after)` — flat field args, server feature
`101-innovation-library-pagination`) on the CRD Innovation Library page
(`src/main/crdPages/innovationLibrary/`).

Today the page runs one unbounded `InnovationLibrary` query that pulls **all**
templates and **all** packs, then filters templates **in the browser**. This
plan replaces that with two forward-only cursor-paginated queries (relay
`PaginationArgs` — `first` + `after`), pushes the template-type filter to the
server, renders both collections in the server's fixed **newest-first** order,
adds a per-section **"Load More"** with totals, and recovers from a stale cursor
by silently resetting that section to its first page. The page stops requesting
the unpaginated list fields entirely.

The work reuses existing client infrastructure wholesale: the house relay merge
(`paginationFieldPolicy`), the `useSpaceExplorer`-style direct-hook + `fetchMore`
pattern, the `toGqlTemplateType` mapper, and the CRD Load-More UI
(`crd-common:loadMore`, mirrored from `SpaceExplorer`). No new runtime
dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)

**Primary Dependencies**: Apollo Client (generated hooks only, per constitution III); shadcn/ui + Tailwind v4 (CRD layer); `react-i18next`; `lucide-react`. All existing — **no new runtime dependencies**.

**Storage**: N/A (frontend SPA). Client-side: Apollo InMemoryCache relay-style field merge for the two new `Library` paginated fields.

**Testing**: Vitest 4.x + jsdom (`*.test.ts(x)`); existing `src/main/crdPages/innovationLibrary/__tests__/` updated.

**Target Platform**: Web SPA (Vite), anonymous-accessible `/innovation-library` route.

**Project Type**: Single project — frontend. CRD design-system layer (`src/crd/`) + integration layer (`src/main/crdPages/`) + Apollo data layer (`src/core/apollo/`).

**Performance Goals**: Bounded first render — first page ≤ 25 items per collection; first-render payload does not grow with catalogue size (SC-001/SC-002).

**Constraints**:
- CRD rules: `src/crd/` and `src/main/crdPages/` MUST NOT import `@mui/*` / `@emotion/*`; CRD presentational components stay props-only (no Apollo/domain/routing), data mapping happens in `crdPages`.
- GraphQL contract fidelity (constitution III): use generated hooks only; **`pnpm codegen` must run in the same PR** and the generated outputs committed.
- **Cross-repo dependency (mostly resolved)**: the server-101 fields **have already landed** in `src/core/apollo/generated/graphql-schema.ts` (`templatesPaginated`, `innovationPacksPaginated`, `PaginatedLibraryTemplateResults`, `PaginatedInnovationPacks`, `LibraryTemplatesFilterInput` are all present). The only remaining codegen step is generating the two operation **hooks** from the new `.graphql` docs (still requires a backend at `localhost:3000/graphql` exposing those fields). → tracked as a prerequisite task; no longer a schema-availability risk.
- i18n: new Load-More/count strings go in the `crd-templates` (page) / `crd-common` (shared "Load More") namespaces, manually translated for en/nl/es/bg/de/fr (CRD scope, not Crowdin).

**Scale/Scope**: Innovation Library — tens–hundreds of packs; hundreds–low thousands of templates. One page, ~3 integration files + 1 CRD view + 2 GraphQL docs + 1 cache-policy entry.

**NEEDS CLARIFICATION**: None — resolved in `/speckit.clarify` (newest-first, no sort; stale-cursor → reset section; show totals; Load More not infinite scroll; drop unpaginated fields).

## Constitution Check

*GATE: must pass before Phase 0. Re-checked after Phase 1 design.*

| Principle | Assessment |
|-----------|------------|
| **I. Domain-Driven Frontend Boundaries** | ✅ Data fetching + mapping live in `src/main/crdPages/innovationLibrary/` (integration layer); the CRD `InnovationLibraryView` stays presentational (props only). No business logic added to `src/crd/`. |
| **II. React 19 Concurrent UX Discipline** | ✅ No manual memoization (compiler). Explicit loading states: first-load skeleton vs. non-blocking "load more" busy state (FR-011). `fetchMore` appends without clearing visible items. |
| **III. GraphQL Contract Fidelity** | ✅ New `.graphql` operations → generated hooks via `pnpm codegen` (committed in-PR); no raw `useQuery`. Relay merge respects normalized IDs where present. Schema fields already generated/committed; only the two operation hooks remain (prerequisite task). |
| **IV. State & Side-Effect Isolation** | ✅ Pagination state lives in the Apollo cache (relay merge) + a thin hook; filter/preview state is local `useState`. No ad-hoc global state. |
| **V. Experience Quality & Safeguards** | ✅ WCAG: Load-More is a real `<button>` with `aria-busy`; counts have text (not colour-only); empty/last-page states explicit. Tests cover paging, filter-reset, stale-cursor recovery. |
| **Arch. std. 2 (CRD design system)** | ✅ Page is already CRD; changes stay within CRD + crdPages. |
| **Arch. std. 5 (no barrel exports)** | ✅ Explicit file-path imports. |
| **Arch. std. 6 (SOLID/DRY)** | ✅ Reuse `paginationFieldPolicy`, `toGqlTemplateType`, the `crd-common:loadMore` label, and the `SpaceExplorer` Load-More pattern rather than re-implementing. Hook (`useInnovationLibrary`) owns data; `InnovationLibraryView` owns presentation (SRP). |

**Gate result: PASS.** The only standing item is generating the two operation hooks via codegen against a server-101 backend (a sequencing constraint, not a design violation); the schema types themselves have already landed.

## Project Structure

### Documentation (this feature)
```text
specs/103-innovation-library-pagination/
├── plan.md            # This file
├── research.md        # Phase 0 output
├── data-model.md      # Phase 1 output (client view-models + query var shapes)
├── quickstart.md      # Phase 1 output (codegen + manual test)
├── contracts/         # Phase 1 output (client GraphQL operations + view prop contract)
├── spec.md
└── checklists/requirements.md
```

### Source Code (repository root)
```text
src/
├── core/apollo/
│   ├── config/typePolicies.ts                 # + Library: { fields: { templatesPaginated, innovationPacksPaginated } }
│   └── generated/                             # REGENERATED by pnpm codegen (apollo-hooks.ts, graphql-schema.ts)
├── main/crdPages/innovationLibrary/
│   ├── InnovationLibraryTemplatesPaginated.graphql   # NEW — templatesPaginated(first, after, filter)
│   ├── InnovationLibraryPacksPaginated.graphql       # NEW — innovationPacksPaginated(first, after)
│   ├── useInnovationLibrary.ts                # REWRITE — two cursor-paginated hooks, fetchMore, stale-cursor reset, server-side filter
│   ├── innovationLibraryMapper.ts             # ADJUST — map from the new paginated pack/template result shapes
│   ├── CrdInnovationLibraryPage.tsx           # ADJUST — pass totals / hasMore / onLoadMore / loadingMore through
│   └── __tests__/                             # UPDATE — paging, filter-reset, stale-cursor, totals
└── crd/components/innovationLibrary/
    └── InnovationLibraryView.tsx              # ADJUST — Load More buttons + totals per section (props-driven)

src/crd/i18n/templates/templates.<lang>.json   # + library count / load-more strings (en,nl,es,bg,de,fr) if not in crd-common
```

**Structure Decision**: Single-project frontend. Feature code is confined to the
CRD Innovation Library integration (`crdPages/innovationLibrary/`), its one CRD
presentational view, and one Apollo cache-policy entry. The legacy MUI
`src/main/topLevelPages/InnovationLibraryPage/` and its `InnovationLibrary.graphql`
are **left untouched** (out of scope) so the legacy page keeps working off the
unpaginated fields.

## Implementation phases (for /speckit.tasks)

1. **Codegen prerequisite** — confirm/obtain a backend exposing server-101's
   `templatesPaginated` / `innovationPacksPaginated`; this gates hook generation.
2. **GraphQL operations** — author the two paginated operation docs (reusing the
   existing template/pack selection sets + fragments); run `pnpm codegen`; commit
   generated `apollo-hooks.ts` / `graphql-schema.ts`.
3. **Cache policy** — register the `Library` type policy: `templatesPaginated`
   with `keyArgs: ['filter']` (separate cached list per filter ⇒ filter change
   auto-resets paging), `innovationPacksPaginated` with `keyArgs: false`.
4. **Hook rewrite** — `useInnovationLibrary`: two paginated query hooks
   (forward-only `first`/`after`), `fetchMore` per section, `hasMore` from
   `pageInfo.hasNextPage`, `total` surfaced, server-side type filter via
   `toGqlTemplateType` (`'all'` ⇒ undefined), stale-cursor recovery (catch
   fetchMore error ⇒ refetch first page), preview behaviour preserved.
5. **Mapper adjust** — map the new `templateResults[].{template,innovationPack}`
   and `innovationPacksPaginated.innovationPacks[]` shapes to the existing
   `TemplateCardData` / `InnovationPackCardData`.
6. **View + page** — add per-section Load-More + totals to `InnovationLibraryView`
   (props-driven, WCAG), thread the new props through `CrdInnovationLibraryPage`.
7. **i18n** — add count / load-more strings (reuse `crd-common:loadMore`) for all
   six languages.
8. **Tests** — update `__tests__`: first page bounded, load-more appends, filter
   reset, empty/last-page hides Load More, stale-cursor reset, totals shown.
9. **Verify** — `pnpm lint`, `pnpm vitest run`, manual quickstart; confirm network
   shows only bounded paginated requests (SC-005).

## Complexity Tracking

No constitution deviations requiring justification.

| Item | Why | Note |
|------|-----|------|
| Operation-hook codegen needs a server-101 backend | New `.graphql` docs → generated hooks require a live schema endpoint | Sequencing only; the schema **types already landed/committed**, so only the two operation hooks remain. Not a design compromise. |
| `TemplateResult` is non-normalized in the relay merge | Server returns `{ template, innovationPack }` wrappers without their own id | Merge concatenates prefix+incoming (no id-dedup); safe because `rowId`-DESC cursors guarantee no overlap. Documented in research.md. |
