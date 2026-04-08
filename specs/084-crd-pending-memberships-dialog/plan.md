# Implementation Plan: CRD Pending Memberships Dialog

**Branch**: `084-crd-pending-memberships-dialog` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/084-crd-pending-memberships-dialog/spec.md`

## Summary

Migrate the `PendingMembershipsDialog` from MUI to the CRD design system (shadcn/ui + Tailwind). The dialog has two views: a list view (three sections — invitations, VC invitations, applications) and a detail view (space card + welcome message + accept/reject actions). All business logic hooks, GraphQL queries, mutations, and the dialog context are reused unchanged. The CRD dialog replaces the MUI version in `CrdLayoutWrapper.tsx` via a lazy-loaded integration wrapper that composes presentational CRD components with existing domain hooks.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD feature toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: CRD dialog same perceived latency as MUI version (lazy loaded, data fetched on open)
**Constraints**: Zero MUI imports in `src/crd/`; both styling systems coexist; MUI pages must not regress
**Scale/Scope**: 1 global dialog, 2 views (list + detail), 5 new CRD components, 1 primitive to port, 1 integration wrapper, 1 data mapper file, i18n keys in 6 languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational. Business logic stays in existing `src/domain/` hooks (`useInvitationActions`, `usePendingMemberships`, hydrators). Data mappers live in `src/main/crdPages/dashboard/`. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components are pure and concurrency-safe. Dialog lazy-loaded with Suspense fallback in `CrdLayoutWrapper`. Loading states use skeleton components. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes. All existing generated hooks reused. CRD components never import GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | Dialog state managed by existing `PendingMembershipsDialogContext`. Mutations isolated in `useInvitationActions`. CRD components are side-effect free. |
| V. Experience Quality & Safeguards | PASS | FR-017 through FR-031 specify WCAG 2.1 AA. Radix UI Dialog handles focus trap, Escape dismiss. Semantic HTML, aria-labels, focus indicators all required. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites in `src/crd/components/dashboard/`. Integration in `src/main/crdPages/dashboard/`. Domain hooks unchanged in `src/domain/community/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same as 039/041: CRD introduces Tailwind as parallel styling system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | All CRD text uses `t()` via `useTranslation('crd-dashboard')`. Follows per-feature namespace pattern. |
| Arch #4: Build artifacts deterministic | PASS | No build config changes. Tailwind plugin already configured. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID principles | PASS | SRP: data/view separated via mappers + hydrator wrappers. ISP: card props are minimal per component. DIP: CRD depends on plain props, not GraphQL. |

**Post-Phase 1 re-check**: All gates pass. Arch #2 violation is the same intentional violation from the CRD migration tracked below.

## Project Structure

### Documentation (this feature)

```text
specs/084-crd-pending-memberships-dialog/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entity definitions and mapping
├── quickstart.md        # Phase 1: setup and implementation guide
├── contracts/           # Phase 1: TypeScript interfaces
│   └── pending-memberships.ts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/
│   │   └── separator.tsx               # NEW: port from prototype
│   ├── components/
│   │   └── dashboard/                  # EXISTING directory, new files added
│   │       ├── PendingInvitationCard.tsx    # NEW: invitation card for list view
│   │       ├── PendingApplicationCard.tsx   # NEW: application card for list view
│   │       ├── PendingMembershipsListDialog.tsx  # NEW: list dialog shell
│   │       ├── PendingMembershipsSection.tsx     # NEW: titled section wrapper
│   │       └── InvitationDetailDialog.tsx        # NEW: detail view dialog
│   └── i18n/
│       └── dashboard/                  # EXISTING: add pendingMemberships.* keys
│           ├── dashboard.en.json       # MODIFIED
│           ├── dashboard.nl.json       # MODIFIED
│           ├── dashboard.es.json       # MODIFIED
│           ├── dashboard.bg.json       # MODIFIED
│           ├── dashboard.de.json       # MODIFIED
│           └── dashboard.fr.json       # MODIFIED
│
├── main/
│   ├── crdPages/
│   │   └── dashboard/                  # EXISTING directory, new files added
│   │       ├── pendingMembershipsDataMappers.ts  # NEW: GraphQL → CRD prop mapping
│   │       └── CrdPendingMembershipsDialog.tsx   # NEW: integration wrapper
│   └── ui/
│       └── layout/
│           └── CrdLayoutWrapper.tsx    # MODIFIED: swap MUI dialog import for CRD
│
└── domain/
    └── community/                      # EXISTING: all files reused unchanged
        ├── pendingMembership/
        │   ├── PendingMembershipsDialog.tsx        # UNCHANGED (still used by non-CRD layout)
        │   ├── PendingMembershipsDialogContext.tsx  # UNCHANGED
        │   ├── PendingMemberships.tsx              # UNCHANGED (hooks + hydrators)
        │   └── usePendingInvitationsCount.ts       # UNCHANGED
        └── invitations/
            ├── useInvitationActions.ts             # UNCHANGED
            └── InvitationDialog.tsx                # UNCHANGED
```

**Structure Decision**: Follows the same pattern as 041 (dashboard page migration). CRD presentational components in `src/crd/components/dashboard/`. Integration wrapper in `src/main/crdPages/dashboard/` wires CRD components to existing domain hooks via data mappers. No new directories created — only new files in existing directories.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Arch #2: Parallel styling system (Tailwind alongside MUI) | Same as 039/041: CRD migration's intentional purpose. Both systems coexist during multi-month migration. | Single styling system requires Big Bang rewrite (too risky). CSS isolation via `.crd-root` scoping prevents conflicts. |

## Design Decisions

### D1: Follows 041 Dashboard Pattern

All architectural decisions from 041 apply: parallel design system, data mapper pattern, callback props for global dialogs, children-based composition, per-feature i18n namespace. No new architectural patterns introduced.

### D2: Per-Item Hydration via Wrapper Components

Each invitation/application is hydrated by an individual wrapper component (`HydratedInvitationCard`, `HydratedApplicationCard`) in the integration layer. This is necessary because hydration hooks make per-item GraphQL queries. Mirrors the existing MUI pattern. See [research.md](research.md) R2.

### D3: Slot Props for MUI-Dependent Content

The detail dialog accepts `descriptionSlot`, `welcomeMessageSlot`, and `guidelinesSlot` as `ReactNode`. The integration layer renders MUI components (`WrapperMarkdown`, `DetailedActivityDescription`) into these slots. Keeps CRD component MUI-free. See [research.md](research.md) R3.

### D4: Children Pattern for List Dialog

The list dialog accepts `children` instead of typed data arrays. The integration layer renders `PendingMembershipsSection` components with hydrated cards as children. See [research.md](research.md) R4.

### D5: Stick to Existing Data

The prototype shows sender avatar in invitation cards, but the existing `useInvitationHydrator` doesn't fetch sender avatar URL (only display name). We use sender name without avatar, matching existing MUI behavior. See [research.md](research.md) R8.

## Implementation Phases

### Phase 1: Foundation (Primitive + i18n)

1. Port `separator.tsx` from `prototype/src/app/components/ui/separator.tsx` to `src/crd/primitives/separator.tsx`
   - Update `cn()` import to `@/crd/lib/utils`
   - Remove `"use client"` directive
2. Add `pendingMemberships.*` i18n keys to all 6 `dashboard.*.json` files
   - English source + AI-assisted translations for nl, es, bg, de, fr

### Phase 2: CRD Card Components

3. `PendingInvitationCard.tsx` — clickable card (`<button>`) with space avatar, sender name, welcome excerpt, time elapsed
4. `PendingApplicationCard.tsx` — clickable card (`<a>`) with space avatar, name, tagline

### Phase 3: CRD Dialog Components

5. `PendingMembershipsSection.tsx` — `<section>` + `<h3>` + `<ul role="list">`
6. `PendingMembershipsListDialog.tsx` — dialog shell: header, scrollable body (children), loading skeleton, empty state, footer
7. `InvitationDetailDialog.tsx` — detail dialog: back button, space card, slot areas, accept/decline footer

### Phase 4: Integration Layer

8. `pendingMembershipsDataMappers.ts` — mapping functions:
   - `mapHydratedInvitationToCardData()` — `InvitationWithMeta` → `PendingInvitationCardData`
   - `mapHydratedApplicationToCardData()` — `ApplicationWithMeta` → `PendingApplicationCardData`
   - `mapHydratedInvitationToDetailData()` — `InvitationWithMeta` → `InvitationDetailData`
9. `CrdPendingMembershipsDialog.tsx` — integration wrapper:
   - Reuses: `usePendingMembershipsDialog`, `usePendingMemberships`, `useInvitationHydrator`, `useApplicationHydrator`, `useInvitationActions`, `useNavigate`
   - Internal wrappers: `HydratedInvitationCard`, `HydratedApplicationCard`, `InvitationDetailContainer`
   - Renders: `PendingMembershipsListDialog` + `InvitationDetailDialog`

### Phase 5: Route Wiring

10. Modify `CrdLayoutWrapper.tsx`:
    - Change lazy import from MUI `PendingMembershipsDialog` to CRD `CrdPendingMembershipsDialog`
    - Update JSX reference

### Phase 6: Verification

11. Visual testing with CRD enabled:
    - List dialog: 3 sections, loading, empty state
    - Detail dialog: space card, slots, accept/decline
    - Mobile: 375px width — dialog responsive, buttons stack
12. Functional testing:
    - Accept invitation → navigate to space
    - Decline invitation → return to list
    - Application click → navigate to space
    - `?dialog=invitations` URL parameter
    - Header trigger on non-dashboard pages
13. Accessibility testing:
    - Keyboard navigation through dialog
    - Focus trap (Tab stays in dialog)
    - Screen reader: dialog announced, list lengths, button labels with space names
14. Regression testing:
    - `pnpm lint`
    - `pnpm vitest run`
    - CRD toggle OFF → MUI dialog still works

## Key Files Reference

### Existing MUI Components (replicate behavior from)
- `src/domain/community/pendingMembership/PendingMembershipsDialog.tsx`
- `src/domain/community/invitations/InvitationDialog.tsx`
- `src/domain/community/invitations/InvitationCardHorizontal/InvitationCardHorizontal.tsx`

### Business Logic Hooks (reuse unchanged)
- `src/domain/community/pendingMembership/PendingMemberships.tsx` — `usePendingMemberships`, `useInvitationHydrator`, `useApplicationHydrator`
- `src/domain/community/invitations/useInvitationActions.ts` — accept/reject mutations
- `src/domain/community/pendingMembership/PendingMembershipsDialogContext.tsx` — dialog state

### Existing CRD Components (patterns to follow)
- `src/crd/components/dashboard/TipsAndTricksDialog.tsx` — dialog composition pattern
- `src/crd/components/dashboard/MembershipsTreeDialog.tsx` — dialog with semantic structure
- `src/crd/components/dashboard/InvitationsBlock.tsx` — invitation card styling reference

### Prototype Reference (read-only, design reference)
- `prototype/src/app/components/dialogs/InvitationsDialog.tsx`
- `prototype/src/app/components/ui/separator.tsx` — primitive to port

### Integration Reference (wiring patterns)
- `src/main/ui/layout/CrdLayoutWrapper.tsx` — where dialog is rendered
- `src/main/crdPages/dashboard/dashboardDataMappers.ts` — existing mapper patterns
- `docs/crd/migration-guide.md` — migration conventions
