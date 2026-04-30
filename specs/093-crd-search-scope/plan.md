# Implementation Plan: CRD Search — Scope Switching (Platform vs. Current Space)

**Branch**: `093-crd-search-scope` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/093-crd-search-scope/spec.md`

## Summary

Wire the existing-but-unwired scope dropdown in the CRD search overlay so that when a user is browsing inside a Space tree (top-level Space or any Subspace), the search bar shows a "Search In: …" selector with two options — the level-zero Space's display name and "Entire platform" — defaulting to the current Space. Also fix the latent bug where the integration layer's URL-regex Space detection never matches real Alkemio routes (`/<spaceNameId>` rather than `/space/<id>`), causing on-Space searches to silently return platform-wide results.

**Technical approach**: Replace the broken `extractSpaceNameIdFromPath` regex with `useUrlResolver()` (which exposes `levelZeroSpaceId` globally on Space routes) plus the existing `useSpaceAboutBaseQuery` to fetch the Space's `displayName`. Add a local `activeScope` state in `CrdSearchOverlay`, default-on-open to "current Space" when a Space context exists, drive the `searchInSpaceFilter` GraphQL variable from it, and feed the `scope` / `onScopeChange` / `onSearchAll` props that already exist on `SearchOverlay` and `SearchTagInput`. Rename the existing `search.scopeAll` translation value from "All Spaces" to "Entire platform" across all six languages, add a new `search.scopeTriggerLabel` for the "Search In: {{option}}" trigger format, and update the `searchAllSpaces` recovery copy to match MUI.

No new components, no new GraphQL operations, no schema changes.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (with React Compiler)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind v4), Apollo Client (existing — unchanged), `react-i18next` (existing), `lucide-react`, `@/crd/primitives/dropdown-menu` (Radix UI)
**Storage**: N/A (presentation + GraphQL query parameter wiring; no persistence; no schema changes)
**Testing**: Vitest + jsdom for unit tests; manual QA via the running dev server (`pnpm start` against the local backend) for end-to-end behavior; existing search test files under `src/main/crdPages/search/` and `src/crd/components/search/` (if present) for regression
**Target Platform**: Modern browsers (>90% global support per project rule); WCAG 2.1 AA accessibility
**Project Type**: Single-project React 19 SPA (existing structure)
**Performance Goals**: A scope switch fires exactly one new search query — same network cost as adding/removing a search tag; no extra round-trip
**Constraints**:
- CRD design system rules (`src/crd/CLAUDE.md`): no MUI / Apollo / domain / routing imports inside `src/crd/`
- Integration layer (`src/main/crdPages/search/`) MAY import from `@/domain/*` and `@/core/apollo/*`
- All new translation strings provided in en/nl/es/bg/de/fr (no Crowdin — manual per CRD i18n rules)
- React Compiler enabled — no manual `useMemo` / `useCallback` / `React.memo`
- `searchInSpaceFilter` accepts a level-zero Space UUID (per existing search query contract); Subspace IDs MUST NOT be passed
- Constitution III (GraphQL Contract Fidelity): use only generated hooks from `src/core/apollo/generated/apollo-hooks.ts`
**Scale/Scope**: One integration file (`CrdSearchOverlay.tsx`), one CRD presentational tweak (`SearchTagInput.tsx`), six i18n files, zero new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Domain-Driven Frontend Boundaries** | ✅ PASS | Space detection logic lives in `src/main/crdPages/search/CrdSearchOverlay.tsx` (the integration layer), which is the correct surface per the project's DDD layering. The presentational dropdown stays in `src/crd/`. No business logic added to the design system. The integration imports `useUrlResolver` from `@/main/routing/urlResolver/UrlResolverProvider` and `useSpaceAboutBaseQuery` from generated Apollo hooks — both already used by `SpaceContextProvider`. No new domain abstractions. |
| **II. React 19 Concurrent UX Discipline** | ✅ PASS | All new code is pure render + `useState` for local visual state. No legacy lifecycle methods. The scope-switch causes a re-render that triggers the existing `useSearchQuery` (concurrent-safe via Apollo's React 19 integration). Loading state already wraps the existing search via the existing `SearchOverlay` `state` prop. No `useMemo` / `useCallback` / `React.memo` added (React Compiler covers it). |
| **III. GraphQL Contract Fidelity** | ✅ PASS | Reuses two existing generated hooks: `useSearchQuery` (already in `CrdSearchOverlay`) and `useSpaceAboutBaseQuery` (already used by `SpaceContextProvider`). No raw `useQuery`. No schema changes. No new fragments. The `searchInSpaceFilter` field on the existing `SearchInput` GraphQL type is already optional and already drives the desired backend behavior — only its **value** changes per active scope. |
| **IV. State & Side-Effect Isolation** | ✅ PASS | All new state (`activeScope`) is local to `CrdSearchOverlay`. The existing `SearchProvider` (open/close + initial query) stays unchanged. No new global state, no direct DOM, no new browser API usage. The existing `UrlResolverProvider` and Apollo cache provide the cross-cutting infrastructure. |
| **V. Experience Quality & Safeguards (a11y, perf, tests)** | ✅ PASS | **Accessibility (WCAG 2.1 AA)**: The existing `SearchTagInput` scope dropdown is built on `@/crd/primitives/dropdown-menu` (Radix UI), which already implements WCAG 2.1 AA keyboard interaction (Enter/Space to open, arrow nav, Escape to close, focus management). Plan adds: `aria-label` on the trigger announcing the active scope (FR-020), `aria-live` announcement on scope change via existing status region in `SearchOverlay` (FR-021), the recovery `<button>` already exists with shadcn focus ring (FR-022). **Performance**: scope switch fires exactly one new search query — same network cost as adding/removing a search tag (per Performance Goals); no perf regression possible. **Tests for non-trivial logic**: the integration introduces non-trivial logic (`searchInSpaceFilter` value derivation from `activeScope`, conditional `scope` / `onSearchAll` props, reset-on-close extension). Task T025 in `tasks.md` adds a Vitest + React Testing Library unit test for `CrdSearchOverlay` covering: (a) `searchInSpaceFilter` is `levelZeroSpaceId` when `activeScope === 'space'` and `undefined` when `'all'`; (b) `scope` prop is `undefined` when no `levelZeroSpaceId`; (c) `onSearchAll` is `undefined` when scope is already `'all'` or no Space context; (d) reset-on-close restores the default scope. The test mocks `useUrlResolver` and `useSpaceAboutBaseQuery`. This is the testing evidence required for merge per Engineering Workflow #4. **Observability**: the feature has no new high-risk interactions warranting structured logging beyond what `useSearchQuery` already emits; no new instrumentation required. |

**Architecture Standards check**:
- (1) File placement: `src/main/crdPages/search/` for integration, `src/crd/components/search/` for presentational, `src/crd/i18n/search/*.json` for copy → ✅
- (2) CRD design system: `SearchTagInput` change is a copy edit (using a new translation key) + no MUI imports → ✅
- (3) i18n: new keys land only in `src/crd/i18n/search/*.json` (manually maintained, all 6 languages) — NOT in `src/core/i18n/en/translation.en.json` → ✅
- (4) Vite config untouched → ✅
- (5) No barrel exports added → ✅
- (6) SOLID: SRP — `useUrlResolver` already isolates URL resolution from search rendering; OCP — the `SearchOverlay` API already accepts `scope` / `onScopeChange` / `onSearchAll` (open for extension); DIP — integration layer depends on the abstract `SearchOverlayProps` contract, not on the dropdown's internals → ✅

**Engineering Workflow check**:
- Planning documents domain contexts (Space, Search), React 19 features (none new), GraphQL operations touched (`useSearchQuery` variable change; `useSpaceAboutBaseQuery` reuse) → ✅
- No new schema; `pnpm run codegen` not required → ✅
- Domain-first: no domain façade change needed; the existing `useUrlResolver` + `useSpaceAboutBaseQuery` are already domain-grade → ✅
- Root Cause Analysis (Engineering Workflow #5): the regex `extractSpaceNameIdFromPath` is identified as the root cause. The fix replaces detection at the source (use the same `UrlResolverProvider` the rest of the app uses) rather than patching the regex or adding fallback logic → ✅

**Result**: All gates PASS. No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/093-crd-search-scope/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── search-scope-props.md   # TypeScript prop / state contracts at the integration ↔ CRD boundary
├── checklists/
│   └── requirements.md  # Already exists (from /speckit.specify)
└── tasks.md             # /speckit.tasks output (NOT created by /speckit.plan)
```

### Source Code (repository root)

Files touched by this feature, mapped to the project's existing layout:

```text
# Integration layer — ALL business logic lives here
src/main/crdPages/search/
├── CrdSearchOverlay.tsx         # MODIFIED — replace URL-regex detection with useUrlResolver,
│                                #   add useSpaceAboutBaseQuery for displayName, add activeScope state,
│                                #   pass scope / onScopeChange / onSearchAll to <SearchOverlay>,
│                                #   drive searchInSpaceFilter from activeScope, reset state on close
└── searchDataMapper.ts          # UNCHANGED — result mapping unaffected by scope

# Presentational layer — design system
src/crd/components/search/
├── SearchTagInput.tsx           # MODIFIED — small copy edit: trigger now renders
│                                #   "Search In: {{option}}" via new translation key
│                                #   (no behavioral change; props contract unchanged)
├── SearchOverlay.tsx            # UNCHANGED — already accepts scope, onScopeChange, onSearchAll props

# i18n — manually maintained per CRD rules
src/crd/i18n/search/
├── search.en.json               # MODIFIED — rename scopeAll value + add new keys (see below)
├── search.nl.json               # MODIFIED — same
├── search.es.json               # MODIFIED — same
├── search.bg.json               # MODIFIED — same
├── search.de.json               # MODIFIED — same
└── search.fr.json               # MODIFIED — same

# UNCHANGED — verified above gates
src/main/ui/platformSearch/PlatformSearch.tsx  # MUI fallback path; untouched
src/main/ui/layout/CrdLayoutWrapper.tsx        # Mount point for <CrdSearchOverlay />; untouched
src/main/routing/TopLevelRoutes.tsx            # Route tree (Space routes wrap UrlResolverProvider); untouched
src/domain/space/context/SpaceContext.tsx      # Source-of-truth pattern we replicate; untouched
src/core/apollo/generated/                     # No codegen needed
```

**Structure Decision**: Standard project layout — `src/main/crdPages/<feature>/` for integration, `src/crd/components/<feature>/` for presentational, `src/crd/i18n/<feature>/` for translations. This matches existing patterns from migrations 039/041/042/043. No new directories.

### i18n key changes (across all six language files)

```jsonc
// In src/crd/i18n/search/search.en.json (and equivalents in nl/es/bg/de/fr)
"search": {
  // Existing key — VALUE CHANGED ("All Spaces" → "Entire platform" per Q2 clarification)
  "scopeAll": "Entire platform",

  // Existing key — VALUE CHANGED to match MUI exactly ("Search all Spaces instead" → "Search the entire platform instead")
  "searchAllSpaces": "Search the entire platform instead",

  // NEW key — trigger label format with interpolated active option
  "scopeTriggerLabel": "Search In: {{option}}",

  // NEW a11y key — full accessible name for the trigger button
  "a11y": {
    "scopeTrigger": "Change search scope. Currently searching: {{option}}"
  }
}
```

The interpolation token in `scopeTriggerLabel` lets translators reorder for languages where "Search In:" might naturally suffix (none of our six need that, but the pattern is robust).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. No complexity to track.
