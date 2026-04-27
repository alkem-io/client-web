# Implementation Plan: CRD SubSpace Page (with L0 Banner Community Refinements)

**Branch**: `091-crd-subspace-page` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/091-crd-subspace-page/spec.md`

## Summary

Migrate the L1 SubSpace page (and, by extension, L2 sub-of-sub) from MUI to the CRD design system, filling the gap left by spec 042 which only migrated L0. The feature ships as a sibling integration layer (`src/main/crdPages/subspace/`) parallel to the L0 layer, mounting under the existing CRD-toggled `:spaceNameId/*` route. While we are touching the shared banner code, we also fix two bugs in the already-migrated L0 banner: the "+N" community count is computed from `leadUsers.length` (showing 2–3 instead of true membership) and the avatar stack click handler is unwired. The same Community dialog ships for both L0 and L1.

The architecture follows the three-layer pattern established by 039/042 (CRD presentational → integration layer → route toggle) and the recipe in `docs/crd/migration-guide.md`. Visual design is taken from `prototype/src/app/pages/SubspacePage.tsx` plus 10 corrections from issue [#9568](https://github.com/alkem-io/client-web/issues/9568).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing — unchanged), `react-i18next` (existing). No new dependencies.
**Storage**: N/A (presentation-only migration; GraphQL schema and cache semantics unchanged)
**Testing**: Vitest with jsdom (existing harness)
**Target Platform**: Web SPA (Vite, localhost:3001, backend at localhost:3000)
**Project Type**: Web SPA — existing monorepo with established CRD layer
**Performance Goals**: Equal or better than the legacy MUI L1 page; no additional GraphQL round-trips beyond what the legacy page already performs (parent-banner lookup is the one new query — see research R3)
**Constraints**: Zero MUI/Emotion in `src/crd/`; WCAG 2.1 AA; React Compiler-compatible (no manual memoization); `.crd-root` CSS scoping; legacy MUI L1 page remains as the default until the toggle is removed
**Scale/Scope**: ~4 new CRD components (SubspaceHeader, SubspaceFlowTabs, SubspaceSidebar, SubspaceCommunityDialog), ~8 integration files, 1 new i18n namespace (`crd-subspace`), 6 language files, 5 dialog connectors that wrap existing components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational (props in, callbacks out). Domain logic stays in `src/domain/space/context/SubspaceContext.tsx`, `src/domain/access/.../useApplicationButton.ts`, etc. The new `useCrdSubspace` hook in `src/main/crdPages/subspace/hooks/` orchestrates domain hooks; it does not invent state shape. |
| II | React 19 Concurrent UX Discipline | PASS | Suspense boundaries reused from L0 pattern. No `useMemo`/`useCallback`/`React.memo` (React Compiler). Outlet-based lazy loading. |
| III | GraphQL Contract Fidelity | PASS | Reuse existing generated hooks (`useSubspacePageQuery`, `useSpaceAboutDetailsQuery`, `useApplicationButtonQuery`). One small addition: a new `.graphql` document selecting `roleSet.usersInRole(role: MEMBER) { id }` for the true community count, generated via `pnpm codegen`. No schema-breaking changes. |
| IV | State & Side-Effect Isolation | PASS | Visual state (active phase, dialog open/close) lives in the L1 layout; fetched data lives in Apollo cache. No DOM manipulation, no global stores added. |
| V | Experience Quality & Safeguards | PASS | WCAG 2.1 AA enforced (FR-033 to FR-035). All 6 languages required (FR-032). Accessibility audit is part of verification (SC-005). |
| Arch 1 | Feature directory taxonomy | PASS | New code lives in `src/crd/components/space/`, `src/crd/i18n/subspace/`, and `src/main/crdPages/subspace/`. Mirrors the established `src/main/crdPages/space/` layout. |
| Arch 2 | Styling standard | **VIOLATION** (intentional, inherited from 039/042) | Tailwind alongside MUI is unavoidable during the page-by-page migration. No new mitigation needed beyond what 039 already documented — `.crd-root` scoping keeps the two systems isolated. |
| Arch 3 | i18n pipeline | PASS | New namespace `crd-subspace`, EN edited directly under `src/crd/i18n/subspace/`, all 6 languages maintained manually per `src/crd/CLAUDE.md`. |
| Arch 4 | Build determinism | PASS | No Vite config changes. |
| Arch 5 | Import transparency | PASS | No barrel exports introduced; explicit file paths throughout. |
| Arch 6 | SOLID / DRY | PASS | The community dialog connector is shared between L0 and L1 (DRY). `mapMemberAvatars` is extended once, not duplicated. The flow-tab component is a fresh component (not a forced extension of `SpaceNavigationTabs`) because the prototype's pill+arrow design is structurally different — keeping them separate honours SRP. |
| Eng 5 | Root cause analysis | PASS | The L1 empty-shell bug is fixed by mounting the proper layout, not by making the bailout "less broken". (The L0 community-count bug fix proposed here was deferred — see research R1.) |

## Project Structure

### Documentation (this feature)

```text
specs/091-crd-subspace-page/
├── plan.md              # This file
├── spec.md              # Feature specification (with clarifications)
├── research.md          # Phase 0: research findings (see below)
├── data-model.md        # Phase 1: CRD prop type definitions
├── quickstart.md        # Phase 1: development setup + verification guide
└── checklists/
    └── requirements.md  # Spec quality checklist (already passes)
```

No `contracts/` folder is created. This is a presentation-only migration with no new API surface; the public contract is the CRD component props (captured in `data-model.md`) and the prop interfaces are the type-checked source of truth.

### Source Code (repository root)

```text
src/crd/
├── components/space/
│   ├── SubspaceHeader.tsx              # NEW — banner with parent-image bg, layered avatar, badge, member stack, action icons
│   ├── SubspaceFlowTabs.tsx            # NEW — sticky pill-tabs with always-on double-arrow connectors, no count badges; slots for edit-flow icon and Add Post button
│   ├── SubspaceSidebar.tsx             # NEW — fixed right sidebar: info card (no "Challenge Statement" title), About-this-Subspace button (outside card), Quick Actions, Virtual Contributor card, Updates placeholder
│   ├── SubspaceCommunityDialog.tsx     # NEW — Dialog wrapping the existing SpaceMembers component (consumed by both L0 and L1 banners)
│   └── (SpaceHeader.tsx, SpaceMembers.tsx, etc. — existing, unchanged)
└── i18n/
    └── subspace/                        # NEW namespace `crd-subspace`
        ├── subspace.en.json
        ├── subspace.nl.json
        ├── subspace.es.json
        ├── subspace.bg.json
        ├── subspace.de.json
        └── subspace.fr.json

src/main/crdPages/subspace/              # NEW directory mirroring src/main/crdPages/space/
├── layout/
│   └── CrdSubspacePageLayout.tsx       # Mirrors CrdSpacePageLayout for L1 — banner, breadcrumbs, sidebar, flow tabs, content outlet
├── routing/
│   └── CrdSubspaceRoutes.tsx           # Subspace route map (about, callouts default, settings → legacy)
├── tabs/
│   └── CrdSubspaceCalloutsPage.tsx     # Default tab — flow tabs + filtered SpaceFeed
├── dialogs/
│   ├── CrdSubspaceCommunityDialogConnector.tsx   # Wraps SubspaceCommunityDialog with useRoleSetManager — REUSED by L0
│   ├── CrdSubspaceEventsDialogConnector.tsx      # Wraps existing TimelineDialog/EventsCalendarView with subspace-scoped event data
│   ├── CrdSubspaceActivityDialogConnector.tsx    # Wraps existing ActivityFeed with subspace-scoped useLatestContributionsQuery
│   ├── CrdSubspaceIndexDialogConnector.tsx       # Composes a Dialog + flat list of subspace callouts (reuses CalloutListConnector primitives)
│   └── CrdSubspaceSubspacesDialogConnector.tsx   # Wraps existing SpaceSubspacesList in a Dialog
├── dataMappers/
│   └── subspacePageDataMapper.ts       # NEW — banner data, flow tabs data, sidebar data; depends on SubspaceContext + parent banner query
└── hooks/
    ├── useCrdSubspace.ts               # Orchestrates queries (subspace, parent banner, application button), permissions, parent data
    └── useCrdSubspaceFlow.ts           # Resolves active phase id from URL ?phase=... → currentState.id → first state

src/main/crdPages/space/                 # MODIFIED files
├── layout/
│   └── CrdSpacePageLayout.tsx          # MODIFIED — pass onMemberClick; render shared community dialog. The `if (!isLevelZero)` bailout at line ~133 STAYS (load-bearing — see D3). (True `memberCount` deferred — research R1.)
├── dataMappers/
│   └── spacePageDataMapper.ts          # UNCHANGED — `mapMemberAvatars` keeps its `MemberAvatar[]` shape (the `{ avatars, totalCount }` extension was deferred with research R1)
└── routing/
    └── CrdSpaceRoutes.tsx              # MODIFIED — swap the lazy import at line 18 from `SubspaceRoutes` (legacy MUI) to `CrdSubspaceRoutes` (new); the route nesting at lines 95–104 already exists and is reused as-is

src/core/i18n/
├── config.ts                            # MODIFIED — register `crd-subspace` namespace in crdNamespaceImports
└── ../@types/i18next.d.ts               # MODIFIED — add `crd-subspace` to the namespace type union

src/main/routing/
└── urlBuilders.ts                       # MODIFIED — add buildSubspaceSettingsUrl(subspaceUrl) thin helper (returns ${url}/settings)

# (No new GraphQL documents in this branch — `CommunityMemberCount.graphql` was deferred; see research R1.)
```

**Structure Decision**: A separate `src/main/crdPages/subspace/` directory is the cleanest split. It mirrors the legacy MUI separation (`SpacePageLayout` ≠ `SubspacePageLayout`), keeps the L0 layout focused on L0 (no level-branching inside the layout body), and follows the precedent set by 042 for `src/main/crdPages/space/`. The L1 routes are already nested inside `CrdSpaceRoutes.tsx:95-104` (with `SubspaceContextProvider` wrapping) and currently delegate to the legacy MUI `SubspaceRoutes`; the only cross-layer change is swapping that lazy import for the new `CrdSubspaceRoutes`. The `!isLevelZero` bailout in `CrdSpacePageLayout.tsx:133` stays — it is the mechanism that prevents the L0 banner from wrapping the L1 outlet.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2: Tailwind alongside MUI | Inherited from the page-by-page migration strategy. Both design systems coexist while pages are migrated incrementally. | Removing MUI requires every page to be migrated simultaneously; not feasible. |

## Design Decisions

### D1: Three-layer architecture (mirrors 039/041/042)
CRD presentational → integration layer → routing toggle. No deviation from the established pattern.

### D2: Separate `CrdSubspacePageLayout`, do not branch the L0 layout on level
The legacy code already uses `SpacePageLayout` ≠ `SubspacePageLayout`. Mirroring this in CRD keeps each layout focused, avoids growing a single component beyond ~200 lines, and gives the L1 page room to evolve independently (e.g. when L1 adds settings tabs).

### D3: Swap the L1 lazy import inside `CrdSpaceRoutes.tsx`; KEEP the `!isLevelZero` bailout in `CrdSpacePageLayout.tsx`
The route `challenges/:subspaceNameId/*` is **already nested** inside `CrdSpaceRoutes.tsx:95-104` and is wrapped by `SubspaceContextProvider`. Today it lazy-loads the legacy MUI `SubspaceRoutes`. The minimal change is to swap that import for the new `CrdSubspaceRoutes` (line 18 → 100). The bailout in `CrdSpacePageLayout.tsx:133` is **load-bearing**: it exists so the L0 banner/tabs/sidebar do NOT wrap the L1 outlet — without it, L1 pages would render the L0 banner above the L1 banner. We keep the bailout exactly as-is. No changes to `TopLevelRoutes.tsx` or `useCrdEnabled.ts`.

### D4: Always render double-arrow connectors between flow phases
Per FR-009, the connector is unconditional — rendered between every adjacent pair in `SubspaceFlowTabs.tsx`, not derived from a `linkedToNext` data flag (which the prototype had and Jeroen marked as a bug source). The component takes `phases: { id, label }[]` and renders `phases.length - 1` connectors.

### D5: Don't ship per-phase count badges
Per FR-010, the data mapper does not pass `count` to `SubspaceFlowTabs`. The component's `phases` prop type does not include a `count` field, making it structurally impossible to regress.

### D6: Shared community dialog connector
`CrdSubspaceCommunityDialogConnector` is consumed by both `CrdSpacePageLayout` (L0 banner) and `CrdSubspacePageLayout` (L1 banner). Internally it instantiates `useRoleSetManager(roleSetId)` and renders `<SubspaceCommunityDialog open onOpenChange><SpaceMembers ... /></SubspaceCommunityDialog>`. The `SpaceMembers` component is reused unchanged (existing search + filter + client-side pagination logic per Phase 0 R4).

### D7: True community count — **DEFERRED**
The original plan added `CommunityMemberCount.graphql` and extended `mapMemberAvatars` to return `{ avatars, totalCount }`. Both were dropped. The banner avatar stack now shows lead-user avatars only, with no `+N` overflow chip. See research R1 for the path forward if this is revived.

### D8: Parent banner via the existing `useSpaceAboutDetailsQuery`
The parent's banner image is loaded by calling `useSpaceAboutDetailsQuery({ spaceId: parentSpaceId, skip: !parentSpaceId })` from `useCrdSubspace`. SubspaceContext does not load the parent. We accept the second query as the simplest path; it is cached by Apollo so a return visit costs nothing. (See research R3 for alternatives considered.)

### D9: Active flow phase resolution — URL → currentState → first state
Per the spec clarification, the L1 page defaults to the subspace's currently-active innovation-flow phase. The resolver is:
1. If a `?phase=<id>` query parameter is present and matches a known phase, use it (deep-linkable, FR-011).
2. Otherwise, use `space.collaboration.innovationFlow.currentState.id` (the legacy default).
3. Otherwise, use the first phase by `sortOrder` (only when no `currentState` is defined).

The hook `useCrdSubspaceFlow(phases)` encapsulates this. Switching tabs writes the new id into the URL via `useSearchParams({ replace: true })`, matching the L0 tab pattern.

### D10: Quick Action dialogs are connector-thin
Each Quick Action dialog connector is a thin wrapper: it owns the open/close state and instantiates the existing CRD component (or a small wrapper around a hook + the existing component). No new presentational logic for Events / Recent Activity / Index / Subspaces — the domain code already exists or was migrated by spec 086 (timeline) and the dashboard work.

### D11: Settings icon links to legacy
Per FR-031, the settings icon in `SubspaceHeader`'s action row hrefs to `${subspace.about.profile.url}/settings`, which is the legacy MUI settings route. A small helper `buildSubspaceSettingsUrl` in `urlBuilders.ts` documents the convention. When L1 settings is migrated in a future spec, the helper changes destination in one place.

### D12: i18n namespace `crd-subspace`
New namespace registered in `src/core/i18n/config.ts` under `crdNamespaceImports`. All 6 languages (en, nl, es, bg, de, fr). Components use `useTranslation('crd-subspace')`. Business data (subspace name, tagline, callout content) is passed as props, never translated in CRD.

### D13: "Updates from the Lead" placeholder
A `<section>` with an `<h3>` "Updates from the Lead" heading + a small "Coming soon" helper text + a comment in the JSX referencing this spec and a follow-up issue. No data wiring. Per FR-022 and the spec's deferred-follow-up note.

## Phased Implementation

| Phase | User Stories | What Ships | Effort |
|-------|--------------|-----------|--------|
| P0 | US1 (foundation) | New CRD components: `SubspaceHeader`, `SubspaceFlowTabs`, `SubspaceSidebar`, `SubspaceCommunityDialog`. i18n namespace + EN file. Standalone preview page (`pnpm crd:dev`). | Medium |
| P1 | US1 (integration) | `src/main/crdPages/subspace/` skeleton: layout, routing, callouts tab page, data mapper, `useCrdSubspace`, `useCrdSubspaceFlow`. Drop the `!isLevelZero` bailout. Nest the route inside `CrdSpaceRoutes`. | Medium |
| P2 | US1 (dialogs) | Five dialog connectors (Community, Events, Activity, Index, Subspaces) wired to existing components/hooks. | Medium |
| P3 | US2 | Apply / join CTA wiring via existing `useApplicationButton`; visibility notice; About-this-Subspace button → `SpaceAboutDialog`. | Small |
| P4 | US3 | L0 banner refinements: pass `onMemberClick` from `CrdSpacePageLayout` and mount the shared community dialog. (True `memberCount` + `CommunityMemberCount.graphql` deferred — see research R1.) | Small |
| P5 | US4, US5 | Polish: verify connectors render correctly, accessibility audit, all 6 language files, semantic typography pass, mobile breakpoints. | Medium |

Tasks for each phase are generated by `/speckit.tasks`.

## Sub-specifications

None. The feature is small enough to ship as a single spec; sidebar dialogs and the L0 refinement are bundled because they share the same data plumbing and component reuse path.
