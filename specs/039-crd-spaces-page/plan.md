# Implementation Plan: CRD Spaces Page Migration

**Branch**: `039-crd-spaces-page` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/039-crd-spaces-page/spec.md`

## Summary

Migrate the `/spaces` page from MUI to shadcn/ui + Tailwind CSS as the first proof-of-concept for the CRD (Client Re-Design) migration. The approach is a **parallel design system** — build CRD components in `src/crd/` alongside the existing MUI components, wire the `/spaces` route directly to the CRD view via a mapper function. No runtime toggle — migrated routes simply render CRD, unmigrated routes stay MUI. The data layer (`useSpaceExplorer` hook, GraphQL queries) remains completely untouched.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: N/A (GraphQL data layer unchanged)
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: CRD page LCP equal to or better than MUI version
**Constraints**: Zero MUI imports in `src/crd/`; both styling systems must coexist without conflicts; MUI pages must not regress visually or functionally
**Scale/Scope**: 1 page (/spaces), ~7 primitives to port, 1 composite component (SpaceCard), 1 page-level composite (SpaceExplorer), 1 data mapper, 1 route wiring change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational; business logic stays in `src/domain/` hooks. Data mapper lives in `src/main/topLevelPages/` alongside the page. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components are pure and concurrency-safe. Suspense boundary already wraps the route. Loading states use skeleton components. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes. Existing generated hooks reused as-is. CRD components never import GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | No new state mechanism needed — route wiring is a code-level decision. CRD components are side-effect free. |
| V. Experience Quality & Safeguards | PASS | Prototype follows accessible patterns (Radix UI has built-in a11y). Keyboard navigation verified per Radix component. Responsive grid tested at all breakpoints. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites in `src/crd/components/space/`, primitives in `src/crd/primitives/`. CRD view wrapper in `src/main/topLevelPages/topLevelSpaces/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | CRD introduces Tailwind as a parallel styling system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | All CRD user-visible text uses `t()`. Design system text uses `'crd'` namespace. |
| Arch #4: Build artifacts deterministic | PASS | Tailwind plugin addition is documented. No chunking changes expected. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID principles | PASS | SRP: data/view separated. OCP: pattern extensible to more pages by wiring new routes. DIP: CRD components depend on plain props, not concrete GraphQL types. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is the intentional purpose of the CRD migration and is tracked below.

## Project Structure

### Documentation (this feature)

```text
specs/039-crd-spaces-page/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entity definitions and mapping
├── quickstart.md        # Phase 1: setup and implementation guide
├── contracts/           # Phase 1: TypeScript interfaces
│   ├── crd-space-card.ts
│   └── data-mapper.ts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── crd/                              # NEW UI layer (shadcn/ui + Tailwind)
│   ├── primitives/                   # shadcn/ui atoms ported from prototype
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── skeleton.tsx
│   ├── components/
│   │   └── space/                    # Domain: space
│   │       ├── SpaceCard.tsx         # CRD SpaceCard composite
│   │       └── SpaceExplorer.tsx     # CRD page-level composite (search + grid + filters)
│   ├── layouts/                      # (empty for now — /spaces uses inline Tailwind grid)
│   ├── forms/                        # (empty for now)
│   ├── hooks/
│   │   └── useMediaQuery.ts          # Already exists
│   ├── lib/
│   │   └── utils.ts                  # cn() — already exists
│   └── styles/
│       ├── crd.css                   # Tailwind entry — already exists
│       └── theme.css                 # Design tokens — already exists
│
├── main/
│   └── topLevelPages/
│       └── topLevelSpaces/
│           ├── SpaceExplorerPage.tsx         # MODIFIED: import CRD view instead of MUI view
│           ├── SpaceExplorerView.tsx         # KEPT: existing MUI view (no longer imported by page)
│           ├── SpaceExplorerCrdView.tsx      # NEW: CRD view wrapper with .crd-root scoping
│           ├── spaceCardDataMapper.ts        # NEW: GraphQL → SpaceCardData mapper
│           └── useSpaceExplorer.ts           # UNCHANGED: data hook
```

**Structure Decision**: This is a frontend-only change within the existing SPA. New CRD components go in `src/crd/` (parallel design system). The CRD view wrapper and data mapper go alongside the existing page in `src/main/topLevelPages/topLevelSpaces/` since they are page-specific glue code. No new infrastructure directories needed — route wiring is a simple import change in `SpaceExplorerPage.tsx`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Arch #2: Parallel styling system (Tailwind alongside MUI) | The entire purpose of CRD is to replace MUI with shadcn/ui + Tailwind. Both systems must coexist during the multi-month migration. | Single styling system would require either Big Bang rewrite (too risky) or MUI-internal replacement (breaks prop APIs, cascading breakage across 765 files). CSS isolation via `.crd-root` scoping prevents conflicts. |

## Design Decisions

### D1: Parallel System over Inside-Out Replacement

CRD components live in `src/crd/` as a completely separate system from `src/core/ui/`. Existing MUI pages are never touched until they are individually migrated to CRD. This avoids the cascading breakage risk of replacing `src/core/ui/` internals while 765 files still depend on MUI prop types.

### D2: Direct Route Wiring (No Runtime Toggle)

Migration is a code-level decision: `SpaceExplorerPage.tsx` imports the CRD view instead of the MUI view. No runtime toggle, no feature flags, no URL params. This means:
- Same URL, same data hook, same layout wrapper
- Only the view component changes (CRD replaces MUI)
- The old MUI view file is kept in the codebase but no longer imported
- Future page migrations follow the same pattern: swap the view import

### D3: Data Mapper in Page Directory

The `spaceCardDataMapper.ts` lives in `src/main/topLevelPages/topLevelSpaces/` because it is specific to this page's data shape (`SpaceWithParent` → `SpaceCardData`). If future pages need similar mapping, common utilities can be extracted to `src/domain/space/mappers/`.

### D4: `memberCount` Omitted from Initial CRD Card

The prototype's SpaceCard shows member count, but the current `SpaceExplorerSpace` GraphQL fragment doesn't include it. General rule: if a prototype feature requires data layer changes, omit it from the initial CRD card and add in a follow-up.

### D5: `href` Instead of `slug` for Navigation

The prototype constructs routes from slugs (`/space/${slug}`). Production uses full URLs from `profile.url`. The CRD SpaceCard accepts `href` (the full URL) and passes it via an `<a>` tag. This avoids coupling CRD components to routing logic.

### D6: CSS Isolation via `.crd-root` Scoping

Tailwind's base resets (preflight) are scoped to `.crd-root` in `src/crd/styles/crd.css`. The CRD view wrapper must apply this class to its root element. MUI components outside `.crd-root` are unaffected.
