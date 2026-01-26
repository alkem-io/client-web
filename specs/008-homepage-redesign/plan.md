# Implementation Plan: Homepage Redesign

**Branch**: `001-homepage-redesign` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-homepage-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a new visual design for the homepage (`/home` route) featuring a simplified header with only the platform menu (no banner), repositioned Spaces section above dashboard columns, and grouped resources in the InfoColumn under clear category titles (Spaces, VirtualContributors, InnovationPacks). The redesign is route-specific and must not affect other pages. Implementation follows the Figma design reference with measurable success criteria for visual fidelity, performance, and accessibility.

## Technical Context

**Language/Version**: TypeScript 5.x (React 19)
**Primary Dependencies**: React 19, MUI (design system), Emotion (styling), React Router (routing), Apollo Client (data)
**Storage**: N/A (client-side UI changes, data fetched via existing GraphQL endpoints)
**Testing**: Vitest (unit tests), manual visual testing against Figma
**Target Platform**: Web (modern browsers), responsive design (mobile/tablet/desktop)
**Project Type**: Web frontend (single-page application)
**Performance Goals**: LCP < 2.5s, no increase >100ms from baseline on `/home`
**Constraints**: Route-specific changes only, no breaking changes to shared components, maintain accessibility (WCAG 2.1 AA)
**Scale/Scope**: 3 user stories, affects 3-5 components (header, layout, info column), ~400 LOC estimated

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Domain-Driven Frontend Boundaries ✅

**Status**: PASS

- Changes are UI presentation layer only (layout, styling, component composition)
- No new domain logic or business rules introduced
- Existing domain services (`useDashboardSpaces`, space membership queries) remain unchanged
- Components orchestrate existing domain façades without bypass

**Justification**: This is a visual redesign affecting layout and styling; domain boundaries remain intact.

### II. React 19 Concurrent UX Discipline ✅

**Status**: PASS

- All new components will treat rendering as pure
- Existing data fetching already uses Apollo hooks (concurrent-safe)
- No blocking operations introduced
- Responsive layout changes use standard MUI responsive patterns (concurrent-safe)

**Justification**: Layout changes don't introduce new async patterns or concurrency risks.

### III. GraphQL Contract Fidelity ✅

**Status**: PASS

- No GraphQL schema changes required
- Uses existing generated hooks (`useDashboardWithMembershipsLazyQuery`, etc.)
- No new queries or mutations needed
- Cache reads remain unchanged

**Justification**: This feature only reorganizes how existing data is displayed; no API changes needed.

### IV. State & Side-Effect Isolation ✅

**Status**: PASS

- No new persistent state introduced
- Side effects limited to React hooks in existing components
- Layout changes use composition (route-specific overrides)
- No direct DOM manipulation required

**Justification**: Changes are purely presentational composition; no new state management needed.

### V. Experience Quality & Safeguards ✅

**Status**: PASS (with monitoring)

- Accessibility: Will maintain semantic HTML, keyboard navigation, ARIA labels
- Performance: LCP target defined (<100ms regression)
- Testing: Manual visual testing against Figma + existing Vitest tests
- Observability: Not required (UI-only change)

**Action Items**:

- Verify accessibility after implementation (keyboard nav, screen reader)
- Measure LCP before/after on `/home` route
- Visual regression testing against Figma

### VI. Architecture Standards ✅

**Status**: PASS

- Changes contained in `src/main/topLevelPages/Home/` (already feature-mapped)
- Uses existing MUI theme (no design system additions)
- All user-visible strings use i18next
- No build config changes required
- No barrel exports introduced (direct imports maintained)
- SOLID principles maintained through composition

**Justification**: Work fits existing architecture; route-specific overrides follow established patterns.

## Project Structure

### Documentation (this feature)

```text
specs/008-homepage-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── checklists/
│   └── requirements.md  # Specification quality checklist (complete)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

Note: `data-model.md` and `contracts/` are omitted—no data model or API contract changes for this UI-only feature.

### Source Code (repository root)

```text
src/main/topLevelPages/
├── Home/
│   ├── HomePageLayout.tsx         # [MODIFY] Add route-specific header variant
│   └── HomePage.tsx               # [VERIFY] Ensure uses HomePageLayout
│
└── myDashboard/
    ├── DashboardWithMemberships/
    │   ├── DashboardActivity.tsx  # [MODIFY] Reorder Spaces section above columns
    │   └── DashboardSpaces/       # [VERIFY] Existing spaces component
    │
    ├── ExploreSpaces/
    │   └── ExploreSpaces.tsx      # [VERIFY] Unauthenticated view (unchanged)
    │
    └── MyDashboardUnauthenticated.tsx  # [VERIFY] Uses ExploreSpaces

src/main/ui/
├── platformNavigation/
│   └── PlatformNavigationBar.tsx  # [VERIFY] Platform menu component (reuse for simplified header)
│
└── layout/topLevelPageLayout/
    └── TopLevelPageBanner.tsx     # [MODIFY] Conditional rendering (hide on /home)

src/core/ui/
└── content/
    ├── PageContentBlock.tsx       # [VERIFY] Layout primitive (unchanged)
    └── PageContentColumn.tsx      # [VERIFY] Layout primitive (unchanged)

tests/
└── [TBD during implementation]   # Add visual regression tests if tooling supports
```

**Structure Decision**: Web application frontend (React SPA). Changes are localized to `src/main/topLevelPages/Home` and `src/main/topLevelPages/myDashboard` with minimal touch points in shared layout components. No backend changes required. This follows the existing structure where homepage logic lives under `src/main/topLevelPages/` and reuses components from `src/main/ui/` and `src/core/ui/`.

## Complexity Tracking

No constitution violations. This section is not applicable.

## Implementation Readiness

**Status**: Ready for implementation (/speckit.tasks)

**Phase 0 - Research**: ✅ Complete

- All unknowns resolved
- Architecture patterns documented
- Implementation strategies defined

**Phase 1 - Design**: ✅ Complete

- quickstart.md created with step-by-step guide
- Agent context updated with technical stack
- No data model or contracts needed (UI-only)

**Constitution Re-Check**: ✅ All gates pass

- No new violations introduced
- Architecture standards maintained
- Quality safeguards defined

**Next Steps**:

1. Run `/speckit.tasks` to generate task breakdown
2. Begin implementation following quickstart.md phases
3. Test each phase independently before proceeding

**Estimated Effort**: 6-8 hours (P1: 2-3h, P2: 2-3h, P3: 1-2h, Testing: 1h)

**Risk Level**: Low (isolated changes, no domain/API impact)
