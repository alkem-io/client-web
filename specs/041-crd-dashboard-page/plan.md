# Implementation Plan: CRD Dashboard Page Migration

**Branch**: `041-crd-dashboard-page` | **Date**: 2026-04-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/041-crd-dashboard-page/spec.md`

## Summary

Migrate the `/home` dashboard page from MUI to shadcn/ui + Tailwind CSS, following the same parallel design system pattern established by the `/spaces` page migration (039). The CRD dashboard renders inside `CrdLayoutWrapper` (reusing existing CRD Header + Footer), gated by the existing localStorage toggle. The data layer (16 GraphQL hooks) is completely untouched — data mappers in `src/main/crdPages/dashboard/` bridge GraphQL responses to CRD component props. Three conditional views (unauthenticated, without memberships, with memberships) are migrated, including sidebar navigation, two-column activity feeds, recent spaces row, dialogs, and the activity/spaces view toggle.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD feature toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: CRD dashboard LCP equal to or better than MUI version
**Constraints**: Zero MUI imports in `src/crd/`; both styling systems coexist; MUI pages must not regress
**Scale/Scope**: 1 page (/home), 3 conditional views, ~11 new CRD components, 4 page-level dialogs, 2 primitives to port, 1 i18n namespace, 4 data mappers, 16 GraphQL hooks reused

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational; business logic stays in existing `src/domain/` hooks. Data mappers live in `src/main/crdPages/dashboard/`. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components are pure and concurrency-safe. Suspense boundary wraps the route via `TopLevelRoutes.tsx`. Loading states use skeleton components. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes. All 16 existing generated hooks reused as-is. CRD components never import GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | No new state mechanism. `activityEnabled` toggle is visual state managed in integration page and passed as prop. CRD components are side-effect free. |
| V. Experience Quality & Safeguards | PASS | FR-021 through FR-034 specify WCAG 2.1 AA requirements. Radix UI primitives have built-in a11y. Responsive layout tested at all breakpoints. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites in `src/crd/components/dashboard/`, primitives in `src/crd/primitives/`. Page integration in `src/main/crdPages/dashboard/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same as 039: CRD introduces Tailwind as a parallel styling system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | All CRD text uses `t()` via `useTranslation('crd-dashboard')`. Follows per-feature namespace pattern from 039. |
| Arch #4: Build artifacts deterministic | PASS | No build config changes. Tailwind plugin already configured from 039. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID principles | PASS | SRP: data/view separated via data mappers. OCP: same pattern extensible to more pages. DIP: CRD components depend on plain props, not GraphQL types. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is the same intentional violation from the CRD migration tracked below.

## Project Structure

### Documentation (this feature)

```text
specs/041-crd-dashboard-page/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entity definitions and mapping
├── quickstart.md        # Phase 1: setup and implementation guide
├── contracts/           # Phase 1: TypeScript interfaces
│   ├── dashboard-components.ts
│   ├── activity-feed.ts
│   ├── sidebar.ts
│   └── data-mapper.ts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/
│   │   ├── switch.tsx                    # NEW: port from prototype (for Activity View toggle)
│   │   └── scroll-area.tsx              # NEW: port from prototype (for activity feed scroll)
│   ├── components/
│   │   ├── dashboard/                   # NEW: all dashboard CRD components
│   │   │   ├── DashboardLayout.tsx      # Three-zone grid: sidebar + two content columns
│   │   │   ├── RecentSpaces.tsx         # Horizontal row of compact space cards + "Explore all" link
│   │   │   ├── CompactSpaceCard.tsx     # Compact space card (banner + name + lock icon)
│   │   │   ├── HomeSpacePlaceholder.tsx # Dashed placeholder for unset home space
│   │   │   ├── DashboardSidebar.tsx     # Menu items + resource lists + Activity View toggle
│   │   │   ├── SidebarResourceItem.tsx  # Single resource item (avatar + name + link)
│   │   │   ├── ActivityFeed.tsx         # Filterable activity list with filters + "Show more"
│   │   │   ├── ActivityItem.tsx         # Single activity row (avatar + text + timestamp)
│   │   │   ├── InvitationsBlock.tsx     # Inline invitation cards (accept/decline)
│   │   │   ├── CampaignBanner.tsx       # VC campaign banner with CTA
│   │   │   ├── ReleaseNotesBanner.tsx   # Dismissible release notes banner
│   │   │   ├── DashboardSpaces.tsx      # Hierarchical space cards (activityEnabled=false view)
│   │   │   ├── SpaceHierarchyCard.tsx   # Parent space card with subspace chips
│   │   │   ├── TipsAndTricksDialog.tsx  # Tips list dialog
│   │   │   ├── ActivityDialog.tsx       # Full-screen activity feed dialog
│   │   │   └── MembershipsTreeDialog.tsx # Expandable space tree dialog
│   │   ├── common/                      # EXISTING
│   │   │   ├── AlkemioLogo.tsx
│   │   │   └── StackedAvatars.tsx
│   │   ├── notifications/               # EXISTING
│   │   └── space/                       # EXISTING (SpaceCard, SpaceExplorer)
│   ├── i18n/
│   │   └── dashboard/                   # NEW: dashboard translations
│   │       ├── dashboard.en.json
│   │       ├── dashboard.nl.json
│   │       ├── dashboard.es.json
│   │       ├── dashboard.bg.json
│   │       ├── dashboard.de.json
│   │       └── dashboard.fr.json
│   └── ...                              # EXISTING (layouts/, forms/, hooks/, lib/, styles/)
│
├── main/
│   ├── crdPages/
│   │   ├── useCrdEnabled.ts             # EXISTING: localStorage toggle hook
│   │   ├── spaces/                      # EXISTING: CRD spaces page integration
│   │   └── dashboard/                   # NEW: CRD dashboard page integration
│   │       ├── DashboardPage.tsx        # Page entry: hooks + data mapping + 3-way branching
│   │       ├── DashboardWithMemberships.tsx  # "with memberships" view orchestrator
│   │       ├── DashboardWithoutMemberships.tsx # "without memberships" view orchestrator
│   │       ├── DashboardUnauthenticated.tsx  # Unauthenticated view
│   │       ├── dashboardDataMappers.ts  # GraphQL → CRD prop mapping functions
│   │       ├── useDashboardDialogs.ts   # Dialog state management (URL param support)
│   │       └── useDashboardSidebar.ts   # Sidebar data aggregation (resources, menu items)
│   ├── topLevelPages/
│   │   └── Home/                        # EXISTING: Old MUI page (rendered when toggle is OFF)
│   │       └── HomePage.tsx
│   ├── routing/
│   │   └── TopLevelRoutes.tsx           # MODIFIED: conditional CRD/MUI routing for /home
│   └── ui/
│       └── layout/
│           └── CrdLayoutWrapper.tsx     # EXISTING: reused as-is (CRD shell already migrated)
```

**Structure Decision**: Follows the same pattern established by 039 (spaces page migration). CRD dashboard components live in `src/crd/components/dashboard/` as purely presentational. The integration layer in `src/main/crdPages/dashboard/` wires CRD components to the existing data hooks via data mappers. The page is split into three sub-pages (`DashboardWithMemberships`, `DashboardWithoutMemberships`, `DashboardUnauthenticated`) in the integration layer to keep each view focused and avoid a single 500+ line component. Route toggle in `TopLevelRoutes.tsx` follows the same conditional pattern as the spaces page.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Arch #2: Parallel styling system (Tailwind alongside MUI) | Same as 039: CRD migration's intentional purpose. Both systems must coexist during multi-month migration. | Single styling system requires Big Bang rewrite (too risky). CSS isolation via `.crd-root` scoping prevents conflicts. |

## Design Decisions

### D1: Follows 039 Pattern Exactly

All architectural decisions from 039 apply: parallel design system (D1), full-page CRD shell per route (D2), localStorage toggle (D3), data mapper in page directory (D4), `href` for navigation (D6), CSS isolation via `.crd-root` (D7/D12), CrdLayoutWrapper reuse (D9), page integration layer in `src/main/crdPages/` (D15). No new architectural patterns introduced.

### D2: CompactSpaceCard vs Existing SpaceCard

The existing CRD `SpaceCard` is the full explore-page card (banner + name + description + tags + leads). The dashboard's RecentSpaces row needs a compact variant (banner + name + lock icon only). Instead of adding a `variant` prop to `SpaceCard` (which would complicate its interface), a separate `CompactSpaceCard` component is created. It is structurally simpler (~40 lines) and doesn't share enough visual structure with the full card to justify combining them.

### D3: Integration Page Split into Sub-Views

The MUI dashboard controller (`MyDashboard.tsx`) branches into 3 view components. The CRD integration layer mirrors this structure: `DashboardPage.tsx` handles auth/membership checks and renders one of three sub-components. Each sub-view handles its own data hooks and mapping, keeping files under ~200 lines.

### D4: Activity Feed — Two Variants via Props

A single `ActivityFeed` CRD component handles both "Latest Activity in my Spaces" (with Space + Role filters) and "My Latest Activity" (with Space filter only). The `variant` prop (`'spaces' | 'personal'`) controls whether the Role filter dropdown is shown. Both variants share the same `ActivityItem` component. The integration layer uses two different GraphQL hooks (`useLatestContributionsQuery` and `useLatestContributionsGroupedQuery`) and maps their results to the same `ActivityItemData` prop type.

### D5: Sidebar — Unified Resource List Component

Instead of separate `SidebarSpaceItem` and `SidebarVCItem` components, a single `SidebarResourceItem` handles all 4 resource types (spaces, VCs, innovation hubs, innovation packs). Each item has an avatar (image or initials), a name, and an `href`. The sidebar groups them under section headers. This follows ISP — the component interface is minimal and shared.

### D6: Spaces View — RecentSpaces Only (Revised)

The original plan called for a full `DashboardSpaces` hierarchical view when the activity toggle is OFF. During implementation, this was simplified: the "spaces view" now shows only the `RecentSpaces` row (same as activity view). The activity toggle controls whether the two-column activity feeds are shown below the recent spaces. When OFF, the dashboard is clean — just recent spaces and sidebar. The `DashboardSpaces` and `SpaceHierarchyCard` components were built but are not rendered inline; they remain available for future use. Activity dialogs (My Activity, Space Activity) are accessible from the sidebar menu when the toggle is OFF.

### D7: Dialog Components — Reuse ActivityFeed Inside Dialogs

The MyActivity and MySpaceActivity dialogs are thin wrappers: they render a CRD `Dialog` containing the `ActivityFeed` component. The `TipsAndTricksDialog` renders a list of items from i18n keys. The `MembershipsTreeDialog` renders an expandable tree with `aria-expanded` support. All dialogs use the existing CRD `Dialog` primitive from `src/crd/primitives/dialog.tsx`.

### D8: i18n — Shared Keys with crd-common Where Possible

Dashboard-specific text goes in `crd-dashboard` namespace. Shared terms like "Accept", "Decline", "Loading", "Private", "Public" are already in `crd-common`. Activity feed filter labels ("All Spaces", "All roles") and sidebar menu labels ("Invitations", "Tips & Tricks", etc.) go in `crd-dashboard`. This avoids duplicating keys across namespaces.

### D9: Global Dialogs — Callback Props Pattern

PendingMembershipsDialog, DirectMessageDialog, and VirtualContributorWizard are global/MUI dialogs. The CRD dashboard invokes them via callback props passed down from the integration layer:
- `onPendingMembershipsClick` — wired to `usePendingMembershipsDialog()` context in `DashboardPage.tsx`
- `onCreateVCClick` — wired to `useVirtualContributorWizard()` in `DashboardWithMemberships.tsx` / `DashboardWithoutMemberships.tsx`
- CRD components never know about these dialogs — they just call the callback.

### D10: URL Parameter Dialog Handling

The `?dialog=invitations` URL parameter is handled in `useDashboardDialogs.ts` (integration layer). On mount, it reads the URL param and triggers the appropriate dialog callback. This follows the existing pattern in `useMyDashboardDialogs()` in the MUI version.

### D11: Responsive Sidebar — Left Drawer on Mobile (Revised)

On mobile (`< md` breakpoint), the sidebar is hidden via CSS (`hidden md:block`) and a hamburger button renders instead. Clicking it opens a custom left-side drawer (not a Radix Dialog) with CSS `translate-x` animation, backdrop overlay, focus trap, Escape-to-close, and body scroll lock. On desktop (`>= md`), the sidebar is a fixed left column (~240px). Both mobile and desktop navs are always in the DOM — CSS controls visibility, avoiding hydration mismatches between JS and CSS breakpoints.

## Implementation Phases

### Phase 1: Foundation (Primitives + i18n)

1. Port `switch.tsx` primitive from `prototype/src/app/components/ui/switch.tsx`
   - Update `cn()` import to `@/crd/lib/utils`
   - Verify zero MUI imports
2. Port `scroll-area.tsx` primitive from `prototype/src/app/components/ui/scroll-area.tsx`
   - Same pattern as switch
3. Create `src/crd/i18n/dashboard/` namespace
   - `dashboard.en.json` with all keys (sidebar menu, activity feeds, dialogs, banners, empty states)
   - `dashboard.{nl,es,bg,de,fr}.json` — AI-assisted translations
4. Register `crd-dashboard` namespace in `src/core/i18n/config.ts` under `crdNamespaceImports`
5. Add `crd-dashboard` type declarations in `@types/i18next.d.ts`

### Phase 2: Core CRD Components

6. `DashboardLayout.tsx` — three-zone grid (sidebar + two content cols), responsive breakpoints, mobile sidebar sheet
7. `CompactSpaceCard.tsx` — compact space card (banner + name + lock icon + home pin indicator)
8. `HomeSpacePlaceholder.tsx` — dashed-border placeholder card
9. `RecentSpaces.tsx` — horizontal row of CompactSpaceCard + "Explore all your Spaces" link
10. `SidebarResourceItem.tsx` — single resource item (avatar + name + href)
11. `DashboardSidebar.tsx` — menu items (icon + label + badge), resource sections, Activity View toggle (Switch)
12. `ActivityItem.tsx` — single activity row (avatar + action text + target link + timestamp)
13. `ActivityFeed.tsx` — filterable feed with title, filter dropdowns (Select), scrollable list, "Show more" link

### Phase 3: Secondary CRD Components

14. `InvitationsBlock.tsx` — invitation cards with accept/decline buttons
15. `CampaignBanner.tsx` — banner with CTA button
16. `ReleaseNotesBanner.tsx` — dismissible banner with content + close button
17. `SpaceHierarchyCard.tsx` — parent space card with subspace chips
18. `DashboardSpaces.tsx` — list of SpaceHierarchyCard components + "Load More" button

### Phase 4: Dialog Components

19. `TipsAndTricksDialog.tsx` — list of tip items inside Dialog
20. `ActivityDialog.tsx` — Dialog wrapping ActivityFeed (used for both MyActivity and MySpaceActivity)
21. `MembershipsTreeDialog.tsx` — expandable space tree with role badges, `aria-expanded` controls

### Phase 5: Integration Layer

22. `dashboardDataMappers.ts` — mapping functions:
    - `mapRecentSpacesToCompactCards()` — `SpaceWithProfile` → `CompactSpaceCardData`
    - `mapActivityToFeedItems()` — activity contributions → `ActivityItemData[]`
    - `mapResourcesToSidebarItems()` — account resources → `SidebarResourceData[]`
    - `mapMembershipsToTree()` — hierarchical memberships → `MembershipTreeNodeData[]`
    - `mapInvitationsToCards()` — pending invitations → `InvitationCardData[]`
    - `mapDashboardSpaces()` — dashboard memberships → `SpaceHierarchyCardData[]`
23. `useDashboardDialogs.ts` — dialog state management + `?dialog=invitations` URL param handling
24. `useDashboardSidebar.ts` — aggregates menu items, resource lists, pending count, create space link
25. `DashboardUnauthenticated.tsx` — renders SpaceExplorer (reuse) + Sign Up button
26. `DashboardWithoutMemberships.tsx` — renders sidebar, resources, invitations, explore spaces, CTAs, banners
27. `DashboardWithMemberships.tsx` — renders recent spaces, sidebar, activity feeds OR dashboard spaces (toggle), banners, dialogs
28. `DashboardPage.tsx` — main entry: auth/membership check, renders correct sub-view

### Phase 6: Route Wiring

29. Add CRD dashboard lazy import in `TopLevelRoutes.tsx`:
    ```typescript
    const CrdDashboardPage = lazyWithGlobalErrorHandler(
      () => import('@/main/crdPages/dashboard/DashboardPage')
    );
    ```
30. Add conditional route block for `/home`:
    ```typescript
    {crdEnabled ? (
      <Route element={<NonIdentity><CrdLayoutWrapper /></NonIdentity>}>
        <Route path="/home" element={
          <WithApmTransaction path="/home">
            <Suspense fallback={<Loading />}><CrdDashboardPage /></Suspense>
          </WithApmTransaction>
        } />
      </Route>
    ) : (
      // existing MUI route unchanged
    )}
    ```

### Phase 7: Verification & Polish

31. Test all 3 conditional views (toggle CRD on, test as: unauthenticated, authenticated no memberships, authenticated with memberships)
32. Test all sidebar menu items and dialog triggers
33. Test activity feed filters (Space, Role) and "Show more" links
34. Test Activity View toggle (activity feeds ↔ dashboard spaces)
35. Test recent spaces cards, home space card, home space placeholder
36. Test `?dialog=invitations` URL parameter
37. Test responsive layout: mobile sidebar collapse, single-column activity stacking
38. Test CRD toggle OFF — MUI dashboard renders unchanged
39. Run `pnpm lint` and `pnpm vitest run`
40. Accessibility audit: keyboard navigation, screen reader testing, focus management on dialogs

## Key Files Reference

### Existing MUI Components (to replicate behavior from)
- `src/main/topLevelPages/myDashboard/MyDashboard.tsx` — branching controller
- `src/main/topLevelPages/myDashboard/MyDashboardWithMemberships.tsx` — main view
- `src/main/topLevelPages/myDashboard/MyDashboardWithoutMemberships.tsx` — no memberships view
- `src/main/topLevelPages/myDashboard/MyDashboardUnauthenticated.tsx` — unauthenticated view
- `src/main/topLevelPages/myDashboard/recentSpaces/RecentSpacesList.tsx` — recent spaces
- `src/main/topLevelPages/myDashboard/DashboardMenu/DashboardMenu.tsx` — sidebar
- `src/main/topLevelPages/myDashboard/latestContributions/LatestContributions.tsx` — space activity feed
- `src/main/topLevelPages/myDashboard/latestContributions/myLatestContributions/MyLatestContributions.tsx` — personal activity
- `src/main/topLevelPages/myDashboard/DashboardWithMemberships/DashboardSpaces/DashboardSpaces.tsx` — hierarchical spaces
- `src/main/topLevelPages/myDashboard/myResources/MyResources.tsx` — user resources
- `src/main/topLevelPages/myDashboard/DashboardDialogs/DashboardDialogs.tsx` — dialog container
- `src/main/topLevelPages/myDashboard/myMemberships/MyMembershipsDialog.tsx` — memberships tree

### Existing CRD Components (to reuse)
- `src/crd/components/space/SpaceExplorer.tsx` — for unauthenticated + without-memberships views
- `src/crd/components/space/SpaceCard.tsx` — reference for card patterns
- `src/crd/primitives/dialog.tsx` — for all dashboard dialogs
- `src/crd/primitives/select.tsx` — for activity feed filter dropdowns
- `src/crd/primitives/avatar.tsx` — for activity items, sidebar items
- `src/crd/primitives/badge.tsx` — for invitation count, role badges
- `src/crd/primitives/skeleton.tsx` — for loading states

### Prototype Reference (read-only)
- `prototype/src/app/pages/Dashboard.tsx` — layout structure
- `prototype/src/app/components/dashboard/RecentSpaces.tsx` — recent spaces row
- `prototype/src/app/components/dashboard/ActivityFeed.tsx` — activity feed
- `prototype/src/app/components/dashboard/DashboardSidebar.tsx` — sidebar
- `prototype/src/app/components/ui/switch.tsx` — Switch primitive to port
- `prototype/specs/002-alkemio-1.5-UI-Update/pages/01-dashboard.md` — design spec

### Route Wiring
- `src/main/routing/TopLevelRoutes.tsx` — add CRD toggle for `/home`
- `src/main/ui/layout/CrdLayoutWrapper.tsx` — reuse existing CRD shell wrapper
