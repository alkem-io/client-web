# Implementation Plan: CRD Spaces Page Migration

**Branch**: `039-crd-spaces-page` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/039-crd-spaces-page/spec.md`

## Summary

Migrate the `/spaces` page from MUI to shadcn/ui + Tailwind CSS as the first proof-of-concept for the CRD (Client Re-Design) migration. The approach is a **parallel design system** with a **route-level layout split** — CRD routes in `TopLevelRoutes.tsx` are wrapped in `CrdLayoutWrapper`, which renders a fully CRD page shell (Header + content + Footer). MUI routes continue using `TopLevelLayout` unchanged. Inside the CRD shell, a data mapper bridges GraphQL responses to CRD component props. No runtime toggle — migrated routes simply render CRD. The data layer (`useSpaceExplorer` hook, GraphQL queries) remains completely untouched.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: N/A (GraphQL data layer unchanged)
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: CRD page LCP equal to or better than MUI version
**Constraints**: Zero MUI imports in `src/crd/`; both styling systems must coexist without conflicts; MUI pages must not regress visually or functionally
**Scale/Scope**: 1 page (/spaces), ~7 primitives to port, 3 layout components (CrdLayout, Header, Footer), 1 composite component (SpaceCard), 1 page-level composite (SpaceExplorer), 1 data mapper, 1 route-level layout split, 1 SVG logo component

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
│   ├── crd-layout.ts
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
│   │   ├── common/
│   │   │   └── AlkemioLogo.tsx       # NEW: SVG logo component (ported from prototype)
│   │   └── space/                    # Domain: space
│   │       ├── SpaceCard.tsx         # CRD SpaceCard composite
│   │       └── SpaceExplorer.tsx     # CRD page-level composite (search + grid + filters)
│   ├── layouts/                      # CRD page shells
│   │   ├── CrdLayout.tsx            # NEW: full-page CRD shell (header + main + footer)
│   │   ├── Header.tsx               # NEW: CRD header (logo, nav icons, profile dropdown)
│   │   └── Footer.tsx               # NEW: CRD footer (links, logo, language selector)
│   ├── forms/                        # Form UI components
│   │   └── tags-input.tsx           # NEW: Reusable tag-based input (type + Enter = tag chip)
│   ├── hooks/
│   │   └── useMediaQuery.ts          # Already exists
│   ├── i18n/
│   │   └── en.json                  # NEW: CRD translation strings as i18next 'crd' namespace (shared by main app + standalone)
│   ├── lib/
│   │   └── utils.ts                  # cn() — already exists
│   ├── styles/
│   │   ├── crd.css                   # Tailwind entry — already exists
│   │   └── theme.css                 # Design tokens — already exists
│   └── app/                          # NEW: Standalone preview app for designers
│       ├── index.html               # HTML entry point
│       ├── vite.config.ts           # Standalone Vite config (port 5200)
│       ├── main.tsx                 # App entry — init i18n + render CrdApp
│       ├── CrdApp.tsx               # Root component (router + layout + mock user)
│       ├── data/
│       │   └── spaces.ts            # Mock space data (from prototype)
│       └── pages/
│           └── SpacesPage.tsx       # /spaces page with mock data + client-side interactions
│
├── main/
│   ├── routing/
│   │   └── TopLevelRoutes.tsx        # MODIFIED: wrap CRD routes in CrdLayoutWrapper
│   ├── ui/
│   │   └── layout/
│   │       └── CrdLayoutWrapper.tsx  # NEW: connects CrdLayout to app data (auth, user, navigation)
│   └── topLevelPages/
│       └── topLevelSpaces/
│           ├── SpaceExplorerPage.tsx         # MODIFIED: no longer wraps in TopLevelPageLayout
│           ├── SpaceExplorerView.tsx         # KEPT: existing MUI view (no longer imported by page)
│           ├── SpaceExplorerCrdView.tsx      # NEW: CRD view wrapper — maps data → CRD SpaceExplorer
│           ├── spaceCardDataMapper.ts        # NEW: GraphQL → SpaceCardData mapper
│           └── useSpaceExplorer.ts           # UNCHANGED: data hook
```

**Structure Decision**: CRD routes get a completely separate visual shell. The layout split happens at the route level in `TopLevelRoutes.tsx`: CRD routes are wrapped in `CrdLayoutWrapper` (which connects the presentational `CrdLayout` to app data like auth state and user info), while MUI routes continue using `TopLevelLayout`. The `CrdLayout`, `Header`, and `Footer` are presentational components in `src/crd/layouts/` — they receive all data as props. The `CrdLayoutWrapper` in `src/main/ui/layout/` is the smart container that provides user info, auth state, and navigation callbacks.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --- | --- | --- |
| Arch #2: Parallel styling system (Tailwind alongside MUI) | The entire purpose of CRD is to replace MUI with shadcn/ui + Tailwind. Both systems must coexist during the multi-month migration. | Single styling system would require either Big Bang rewrite (too risky) or MUI-internal replacement (breaks prop APIs, cascading breakage across 765 files). CSS isolation via `.crd-root` scoping prevents conflicts. |

## Design Decisions

### D1: Parallel System over Inside-Out Replacement

CRD components live in `src/crd/` as a completely separate system from `src/core/ui/`. Existing MUI pages are never touched until they are individually migrated to CRD. This avoids the cascading breakage risk of replacing `src/core/ui/` internals while 765 files still depend on MUI prop types.

### D2: Full-Page CRD Shell per Route

When a route is migrated to CRD, the **entire page** renders in CRD — header, content, footer. There is no hybrid (CRD content inside MUI shell). The route-level split in `TopLevelRoutes.tsx` wraps CRD routes in `CrdLayoutWrapper` (which renders `CrdLayout` with Header + Footer), while MUI routes continue using `TopLevelLayout`. This means:
- CRD routes get a completely different visual shell from MUI routes
- The `CrdLayout` is a presentational component in `src/crd/layouts/` — no data fetching or routing
- The `CrdLayoutWrapper` in `src/main/ui/layout/` is the smart container that connects CrdLayout to app data (auth, user info, navigation)
- Future page migrations add their route under the `CrdLayoutWrapper` in `TopLevelRoutes.tsx`

### D3: Direct Route Wiring (No Runtime Toggle)

Migration is a code-level decision. No runtime toggle, no feature flags, no URL params. The old MUI view files are kept in the codebase but no longer imported. Future page migrations follow the same pattern: move the route under `CrdLayoutWrapper` and swap the view component.

### D4: Data Mapper in Page Directory

The `spaceCardDataMapper.ts` lives in `src/main/topLevelPages/topLevelSpaces/` because it is specific to this page's data shape (`SpaceWithParent` → `SpaceCardData`). If future pages need similar mapping, common utilities can be extracted to `src/domain/space/mappers/`.

### D5: `memberCount` Omitted from Initial CRD Card

The prototype's SpaceCard shows member count, but the current `SpaceExplorerSpace` GraphQL fragment doesn't include it. General rule: if a prototype feature requires data layer changes, omit it from the initial CRD card and add in a follow-up.

### D6: `href` Instead of `slug` for Navigation

The prototype constructs routes from slugs (`/space/${slug}`). Production uses full URLs from `profile.url`. The CRD SpaceCard accepts `href` (the full URL) and passes it via an `<a>` tag. This avoids coupling CRD components to routing logic.

### D7: CSS Isolation via `.crd-root` Scoping

Tailwind's base resets (preflight) are scoped to `.crd-root` in `src/crd/styles/crd.css`. The `CrdLayout` wraps the entire page in `.crd-root`. MUI components outside `.crd-root` are unaffected.

### D8: CRD Header — Visual Port with Placeholder Interactions

The CRD Header is a visual port of the prototype's Header. For this PoC:
- Navigation icons (search, messages, notifications, spaces) render as links to existing MUI pages
- Profile dropdown renders with visual-only menu items (links to existing profile/settings MUI pages)
- Search overlay, real notification feed, and unread message counts are deferred
- The Header accepts all data via props: `user` (name, avatar), `onSearch`, `onLogout`, navigation `href`s

### D9: CRD Layout Props Pattern

The `CrdLayout` component in `src/crd/layouts/` is purely presentational and receives all dynamic data via props:
- `user?: { name: string; avatarUrl?: string; initials: string }` — for the profile avatar
- `authenticated: boolean` — controls whether profile dropdown shows login vs user menu
- `navigationHrefs: { home, spaces, messages, notifications, profile, settings }` — all navigation targets
- `onLogout?: () => void` — logout callback
- `children: ReactNode` — page content

The `CrdLayoutWrapper` in `src/main/ui/layout/` reads auth state, user profile, and constructs these props.

### D10: Prototype-Matching Filter Bar (Sort + Filters Dropdowns)

The CRD SpaceExplorer uses the prototype's filter bar pattern instead of the MUI's flat buttons:
- **Sort dropdown** (Select): Most Recent, Alphabetical, Most Active — client-side sorting
- **Filters dropdown** (DropdownMenu) with 3 sections:
  - **Membership** (server-side): All, My Spaces, Public — maps to existing `onMembershipFilterChange` which drives the GraphQL query
  - **Privacy** (client-side): All, Public only, Private only — filters by `isPrivate`
  - **Type** (client-side): All types, Spaces only, Subspaces only — filters by `parent` presence
- Active filter count badge on the Filters button, removable filter chips below the bar
- The server-side membership filter and client-side filters compose: server returns the base set, client narrows it further

### D11: Default Banner Images via `getDefaultSpaceVisualUrl`

When a space has no custom `cardBanner`, the data mapper falls back to `getDefaultSpaceVisualUrl(VisualType.Card, space.id)` — the same deterministic default banner images used by the MUI SpaceCard. This ensures visual parity between MUI and CRD versions.
