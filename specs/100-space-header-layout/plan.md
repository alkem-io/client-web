# Implementation Plan: Space & Subspace Header Layout — Full-Width Banner with Title Below

**Branch**: `100-space-header-layout` | **Date**: 2026-05-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/100-space-header-layout/spec.md`

## Summary

Reshape the Space and Subspace headers in the CRD layer so the banner becomes full-width and fluid (`aspect-[6/1]`), and the title, subtitle, and action buttons move into a single below-banner section that sits inside the existing inner content width (`lg:col-start-2 / lg:col-span-10`). The change is presentational only — no GraphQL fields, no domain logic, no MUI changes. Member-avatar stack, Subspace level badge, and Subspace layered avatar pair are removed; Subspace uses a single ~56px avatar inline with the title.

Touchpoints: `src/crd/components/space/SpaceHeader.tsx`, `src/crd/components/space/SubspaceHeader.tsx`, and the two consumer integration layouts (`src/main/crdPages/space/layout/CrdSpacePageLayout.tsx`, `src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx`) — the latter only to stop passing now-unused props.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: `@/crd/primitives/*` (shadcn/ui + Radix), Tailwind CSS v4, `lucide-react` for icons, `react-i18next` for `crd-space` / `crd-subspace` namespaces
**Storage**: N/A — presentational change. Apollo cache untouched.
**Testing**: Vitest + React Testing Library for component-level rendering assertions; manual visual review on the standalone CRD preview app (`pnpm crd:dev`) and on the integration app (`pnpm start`).
**Target Platform**: Browser (≥90% caniuse support per project policy). All techniques used are `aspect-ratio`, CSS grid, Tailwind utilities — all well above 95% support.
**Project Type**: Single-project web SPA (Vite + React 19). `src/crd/` is the design system, `src/main/crdPages/` is the integration layer.
**Performance Goals**: No regression. The change reduces DOM (removes member-avatar stack, level badge, second avatar tile from Subspace). React Compiler handles memoization automatically.
**Constraints**:
- No `@mui/*` or `@emotion/*` imports anywhere in changed files (CRD golden rule § 1).
- No business logic, no GraphQL types in props (CRD golden rule § 2 + § 4).
- Tailwind-only styling, semantic typography tokens (CRD golden rule § 5 + § 8).
- WCAG 2.1 AA contrast (now strictly easier — text moves off photographic backgrounds).
- Inner content width (`lg:col-start-2 / lg:col-span-10`) must remain byte-identical (SC-005).
- `aspect-ratio: 6 / 1` only (no `-64px` transparent-header underlap — that's deferred to the next adjacent spec).

**Scale/Scope**: Two presentational components, two consumer integration files, two translation namespaces (six languages each). Approximately 200 lines of code net reduction (deletions exceed additions because we strip member-avatar / badge / layered-avatar markup).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principles

**I. Domain-Driven Frontend Boundaries** — ✅ **PASS**
This change touches only presentational layout in `src/crd/` and the integration layer in `src/main/crdPages/`. No domain logic is added or moved. No new business rules. No new entities. Integration code continues to consume the unchanged domain hooks under `src/domain/space/`.

**II. React 19 Concurrent UX Discipline** — ✅ **PASS**
No new effects, async, or lifecycle code is introduced. The change is pure rendering with no concurrency risk. React Compiler handles memoization automatically (FR-011, CRD § 5–§ 8).

**III. GraphQL Contract Fidelity** — ✅ **PASS** (N/A)
No GraphQL operations touched. No generated types changed. No prop type accepts a generated GraphQL type (CRD § 4 already enforced in current code).

**IV. State & Side-Effect Isolation** — ✅ **PASS**
No new state. No new effects. No DOM manipulation. Click handlers remain props passed in from consumers (CRD § 3).

**V. Experience Quality & Safeguards** — ✅ **PASS / IMPROVE**
WCAG 2.1 AA contrast strictly improves because title/subtitle leave a photographic background and move to theme-tokenised text (`text-foreground`, `text-muted-foreground`). All icon-only buttons retain `aria-label`. Decorative icons retain `aria-hidden`. Focus-visible rings unchanged. SC-004 makes this an explicit success criterion.

### Architecture Standards

1. **Feature directories** — ✅ CRD design-system code stays in `src/crd/`; integration code stays in `src/main/crdPages/`. No new directory.
2. **CRD over MUI** — ✅ Pure CRD change. No MUI imports allowed in any touched file (SC-006).
3. **i18n** — ✅ Uses existing `crd-space` and `crd-subspace` namespaces. Strings already in place may need a tiny prune (level-badge keys become unused). New strings (if any) added to all six language files per CRD § i18n.
4. **Build artifacts** — ✅ No Vite config changes.
5. **No barrel exports** — ✅ All imports already use explicit file paths.
6. **SOLID & DRY** — ✅
   - **SRP**: Each header component renders one identity; behaviour stays in props.
   - **OCP**: New layout exposes the same surface (props in, JSX out); no breaking conditionals added.
   - **LSP**: Props that survive (`title`, `tagline`, etc.) keep their contracts.
   - **ISP**: Pruning unused props (`memberAvatars`, `onMemberClick`, `badgeKind`, `parentInitials`, `parentColor`) tightens the interface — strict ISP improvement.
   - **DIP**: Already follows DIP; consumers pass mapped data.
   - **DRY**: Both headers share the same below-banner row pattern. We'll factor this into a shared sub-component if both bodies converge significantly; otherwise keep duplication minimal but acceptable.

### Engineering Workflow

1. **Planning documents domain contexts** — ✅ This plan does.
2. **`pnpm codegen`** — Not needed; no GraphQL changes.
3. **Domain-first** — N/A; presentational change.
4. **Accessibility / perf evidence** — Captured in `quickstart.md` test plan and SC-004 / SC-007.
5. **Root Cause Analysis** — Not a bug fix; new feature.

### Decision: **No constitution violations.** Phase 0 may proceed.

## Project Structure

### Documentation (this feature)

```text
specs/100-space-header-layout/
├── plan.md              # This file
├── spec.md              # Feature spec (already complete with clarifications)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (component prop shape changes)
├── quickstart.md        # Phase 1 output (manual visual + a11y test plan)
├── contracts/
│   └── headers.ts       # Phase 1 output (TS prop-type contracts)
├── checklists/
│   └── requirements.md  # From /speckit.specify
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a single-project Vite + React SPA. The change is confined to two thin slices of the source tree:

```text
src/
├── crd/
│   └── components/
│       └── space/
│           ├── SpaceHeader.tsx          # REWRITE: banner aspect-[6/1] full-width, title/buttons row below, member-avatar stack removed
│           └── SubspaceHeader.tsx       # REWRITE: same pattern, single 56px subspace avatar inline, layered avatar + level badge removed
├── main/
│   └── crdPages/
│       ├── space/
│       │   └── layout/
│       │       └── CrdSpacePageLayout.tsx     # EDIT: stop passing memberAvatars / onMemberClick to SpaceHeader
│       └── subspace/
│           └── layout/
│               └── CrdSubspacePageLayout.tsx  # EDIT: stop passing memberAvatars / onMemberClick / badgeKind / parentInitials / parentColor
└── crd/
    └── i18n/
        ├── space/         # PRUNE: remove level-badge / member-stack keys if any present (after audit)
        └── subspace/      # PRUNE: remove badge.subspace, badge.subSubspace, a11y.parentLink keys (now unused)

src/crd/app/pages/
├── SpacePage.tsx                        # Standalone preview — adjust mock data passed to SpaceHeader (drop memberAvatars, etc.)
└── SubspacePage.tsx                     # Standalone preview — same
```

**Structure Decision**: Use the existing single-project layout. No new directories. The change is isolated to two CRD components and their consumers; the `SpaceShell` layout stays unchanged (its grid is the authoritative inner-content-width token per A1).

## Complexity Tracking

> Not applicable — Constitution Check passes with no violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
