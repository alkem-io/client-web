# Implementation Plan: CRD Spaces Page Migration

**Branch**: `039-crd-spaces-page` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/039-crd-spaces-page/spec.md`

## Summary

Migrate the `/spaces` page from MUI to shadcn/ui + Tailwind CSS as the first proof-of-concept for the CRD (Client Re-Design) migration. The approach is a **parallel design system** with a **route-level layout split** — CRD routes in `TopLevelRoutes.tsx` are wrapped in `CrdLayoutWrapper`, which renders a fully CRD page shell (Header + content + Footer). MUI routes continue using `TopLevelLayout` unchanged. Inside the CRD shell, a data mapper bridges GraphQL responses to CRD component props. A **localStorage toggle** (`alkemio-crd-enabled`, default OFF) gates CRD routes so the branch can be merged to develop without affecting end users — developers and QA opt in locally. The data layer (`useSpaceExplorer` hook, GraphQL queries) remains completely untouched.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), class-variance-authority, lucide-react, Apollo Client (existing, unchanged)
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD feature toggle; GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`)
**Target Platform**: Web SPA (Vite dev server on localhost:3001)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: CRD page LCP equal to or better than MUI version
**Constraints**: Zero MUI imports in `src/crd/`; both styling systems must coexist without conflicts; MUI pages must not regress visually or functionally
**Scale/Scope**: 1 page (/spaces), ~7 primitives to port, 3 layout components (CrdLayout, Header, Footer w/ responsive wrapping), 2 layout building blocks (UserMenu, PlatformNavigationMenu), 1 composite component (SpaceCard), 1 page-level composite (SpaceExplorer), 1 data mapper, 1 route-level layout split, 1 SVG logo component, lazy-loaded HelpDialog

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components are purely presentational; business logic stays in `src/domain/` hooks. Data mapper lives in `src/main/crdPages/spaces/` alongside the page. |
| II. React 19 Concurrent UX Discipline | PASS | CRD components are pure and concurrency-safe. Suspense boundary already wraps the route. Loading states use skeleton components. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes. Existing generated hooks reused as-is. CRD components never import GraphQL types. |
| IV. State & Side-Effect Isolation | PASS | No new state mechanism needed — route wiring is a code-level decision. CRD components are side-effect free. |
| V. Experience Quality & Safeguards | PASS | Prototype follows accessible patterns (Radix UI has built-in a11y). Keyboard navigation verified per Radix component. Responsive grid tested at all breakpoints. |
| Arch #1: Feature directories map to domain contexts | PASS | CRD composites in `src/crd/components/space/`, primitives in `src/crd/primitives/`. CRD view wrapper in `src/main/crdPages/spaces/`. |
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
│   │   ├── types.ts                 # NEW: shared types (CrdUserInfo, CrdNavigationHrefs, CrdLanguageOption, CrdPlatformNavigationItem)
│   │   ├── CrdLayout.tsx            # NEW: full-page CRD shell (header + main + footer), passes all props through
│   │   ├── Header.tsx               # NEW: CRD header (logo, nav icons, composes UserMenu + PlatformNavigationMenu)
│   │   ├── Footer.tsx               # NEW: CRD footer (links, logo, language selector, responsive wrapping)
│   │   └── components/              # Layout building blocks (extracted from Header/Footer)
│   │       ├── UserMenu.tsx         # Profile dropdown menu (extracted from Header)
│   │       └── PlatformNavigationMenu.tsx  # Platform nav dropdown (Innovation Library, Forum, Spaces, Docs)
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
│   ├── crdPages/                     # CRD page integrations (wires CRD components to data)
│   │   ├── useCrdEnabled.ts                 # NEW: localStorage toggle hook (default OFF)
│   │   └── spaces/
│   │       ├── SpaceExplorerPage.tsx         # Page entry — hook + data mapping + CRD SpaceExplorer
│   │       ├── SpaceExplorerQueries.graphql  # GraphQL queries for the spaces page
│   │       ├── spaceCardDataMapper.ts        # GraphQL → SpaceCardData mapper
│   │       └── useSpaceExplorer.ts           # Data hook
│   ├── topLevelPages/
│   │   └── topLevelSpaces/                  # RESTORED: Old MUI page (rendered when toggle is OFF)
│   │       ├── SpaceExplorerPage.tsx
│   │       ├── SpaceExplorerView.tsx
│   │       ├── useSpaceExplorer.ts
│   │       └── useSpaceExplorerViewState.ts
│   ├── routing/
│   │   └── TopLevelRoutes.tsx        # MODIFIED: conditional CRD/MUI routing based on useCrdEnabled()
│   └── ui/
│       └── layout/
│           └── CrdLayoutWrapper.tsx  # Connects CrdLayout to app data (auth, user, roles, navigation, pending memberships, lazy HelpDialog)
```

**Structure Decision**: CRD routes get a completely separate visual shell. The layout split happens at the route level in `TopLevelRoutes.tsx`: CRD routes are wrapped in `CrdLayoutWrapper` (which connects the presentational `CrdLayout` to app data like auth state and user info), while MUI routes continue using `TopLevelLayout`. Page-level integration (data hooks, CRD views, data mappers) lives in `src/main/crdPages/<pageName>/` — the dedicated integration layer for CRD-migrated pages. The `CrdLayout`, `Header`, and `Footer` are presentational components in `src/crd/layouts/` — they receive all data as props. The `CrdLayoutWrapper` in `src/main/ui/layout/` is the app-level smart container that provides user info, auth state, and navigation callbacks. Files in `src/main/crdPages/` MUST NOT import from `@mui/*`.

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

### D3: localStorage Feature Toggle (Safe Merge Strategy)

During migration, CRD routes are gated behind a localStorage toggle so the branch can be merged to develop without affecting end users. The toggle defaults to OFF — deployed environments render the old MUI page. Developers and QA opt in via `localStorage.setItem('alkemio-crd-enabled', 'true')` + page refresh.

**Implementation:**
- `src/main/crdPages/useCrdEnabled.ts` — reads `alkemio-crd-enabled` from localStorage (default `false`)
- `TopLevelRoutes.tsx` — conditionally routes `/spaces` to either `CrdSpaceExplorerPage` (with `CrdLayoutWrapper`) or `MuiSpaceExplorerPage` (with `TopLevelLayout`)
- Old MUI page files are restored at `src/main/topLevelPages/topLevelSpaces/` alongside the CRD alternatives in `src/main/crdPages/spaces/`
- Both versions are lazy-loaded — the unused chunk is never fetched, so there is no bundle penalty

**Why localStorage over env var:** No Docker/CI config changes needed. QA can test on staging without a redeploy. No dev server restart to toggle. Easiest to remove when migration is complete.

**Removal:** When all pages are migrated and validated, delete `useCrdEnabled.ts`, remove conditional routing, delete old MUI page files. CRD routes become the only routes.

### D4: Data Mapper in Page Directory

The `spaceCardDataMapper.ts` lives in `src/main/crdPages/spaces/` because it is specific to this page's data shape (`SpaceWithParent` → `SpaceCardData`). `src/main/crdPages/` is the dedicated integration layer for CRD-migrated pages, keeping them separate from the MUI page containers that remain in `src/main/topLevelPages/`. If future pages need similar mapping, common utilities can be extracted to `src/domain/space/mappers/`.

### D5: `memberCount` Omitted from Initial CRD Card

The prototype's SpaceCard shows member count, but the current `SpaceExplorerSpace` GraphQL fragment doesn't include it. General rule: if a prototype feature requires data layer changes, omit it from the initial CRD card and add in a follow-up.

### D6: `href` Instead of `slug` for Navigation

The prototype constructs routes from slugs (`/space/${slug}`). Production uses full URLs from `profile.url`. The CRD SpaceCard accepts `href` (the full URL) and passes it via an `<a>` tag. This avoids coupling CRD components to routing logic.

### D7: CSS Isolation via `.crd-root` Scoping

Tailwind's base resets (preflight) are scoped to `.crd-root` in `src/crd/styles/crd.css`. The `CrdLayout` wraps the entire page in `.crd-root`. MUI components outside `.crd-root` are unaffected.

### D8: CRD Header — Full User Menu via Callbacks

The CRD Header mirrors the MUI `PlatformNavigationUserMenu` while staying purely presentational. The profile dropdown renders the same menu items as the MUI version:

**Menu items (authenticated):**
1. **User identity** — name + role badge (role resolved from `platformRoles` in CrdLayoutWrapper)
2. **Dashboard** → `navigationHrefs.home` (wired to `ROUTE_HOME`)
3. **Profile** → `navigationHrefs.profile` (wired to `ROUTE_USER_ME`)
4. **My Account** → `navigationHrefs.account` (wired to `buildUserAccountUrl(ROUTE_USER_ME)`)
5. **Pending Memberships** → `onPendingMembershipsClick` callback (opens MUI `PendingMembershipsDialog` via context). Shows invitation count badge.
6. **Administration** → `navigationHrefs.admin` (wired to `/admin`). Only shown when `isAdmin` prop is true (resolved from `AuthorizationPrivilege.PlatformAdmin`).
7. **Language sub-menu** ��� reuses `languages`/`currentLanguage`/`onLanguageChange` props (same as Footer). Shows checkmark on active language.
8. **Get Help** → `onHelpClick` callback (opens lazy-loaded `HelpDialog` in CrdLayoutWrapper)
9. **Log out** → `onLogout` callback (destructive style)

**Route reuse:** All navigation hrefs in `CrdLayoutWrapper` use existing route constants (`ROUTE_HOME`, `ROUTE_USER_ME`, `TopLevelRoutePath`, `buildUserAccountUrl`) — no paths are hardcoded. This ensures CRD navigation stays in sync with the routing system.

**Icon bar** (left to right): Search, Messages, Notifications, PlatformNavigation — each accepts an optional callback that takes priority over `<a href>` fallbacks. When callbacks are not provided (standalone app), buttons fall back to `<a href>` links from `navigationHrefs`. The PlatformNavigation icon opens a dropdown menu with platform-level navigation items (see D16).

Real notification feed and unread message counts are deferred.

### D9: CRD Layout Props Pattern

The `CrdLayout` component in `src/crd/layouts/` is purely presentational and receives all dynamic data via props:
- `user?: { name: string; avatarUrl?: string; initials: string; role?: string }` — for the profile avatar and role display
- `authenticated: boolean` — controls whether profile dropdown shows login vs user menu
- `navigationHrefs: { home, spaces, messages, notifications, profile, account, admin, login }` — all navigation targets
- `isAdmin?: boolean` — controls Administration menu item visibility
- `pendingInvitationsCount?: number` — shown as badge on Pending Memberships item
- `languages: { code: string; label: string }[]` — available languages for footer and header language sub-menu
- `currentLanguage: string` — active language code
- `onLanguageChange: (code: string) => void` — language switch callback (wired to both header and footer)
- `onLogout?: () => void` — logout callback
- `onMessagesClick?: () => void` — messages button callback (falls back to `<a>` link if not provided)
- `onNotificationsClick?: () => void` — notifications button callback (falls back to `<a>` link if not provided)
- `onSearchClick?: () => void` — search button callback
- `onPendingMembershipsClick?: () => void` — opens pending memberships dialog
- `onHelpClick?: () => void` — opens help dialog
- `children: ReactNode` — page content

Shared types (`CrdUserInfo`, `CrdNavigationHrefs`, `CrdLanguageOption`) are defined once in `src/crd/layouts/types.ts` and imported by Header, Footer, and CrdLayout.

The `CrdLayoutWrapper` in `src/main/ui/layout/`:
- Reads auth state, user profile, platform roles, platform privileges from `useCurrentUserContext()`
- Reads pending invitation count from `usePendingInvitationsCount()`
- Wires Messages/Notifications callbacks to existing dialog context providers
- Wires Pending Memberships callback to `usePendingMembershipsDialog()` context
- Lazy-loads `HelpDialog` via `lazyWithGlobalErrorHandler()`
- Resolves navigation hrefs from `ROUTE_HOME`, `ROUTE_USER_ME`, `buildUserAccountUrl()`, `TopLevelRoutePath`
- Resolves platform role display name from `platformRoles` (same logic as MUI `PlatformNavigationUserMenu`)

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

### D12: CSS Loaded Globally, Scoped via `.crd-root`

Tailwind CSS is imported in `src/index.tsx` and applies to all pages. True CSS code-splitting is not feasible with Vite + Tailwind v4 (CSS is bundled at build time regardless of import location). The `.crd-root` class scopes Tailwind preflight to CRD pages only. MUI's `ThemeProvider` wraps the full app but is unused by CRD components — they never call `useTheme()`. Moving ThemeProvider below non-CRD routes would require significant `root.tsx` restructuring with no functional benefit. This is the simplest working approach.

### D13: Mobile-First Responsive Layout

The CRD layout uses responsive padding and overflow protection to ensure mobile compatibility:

- **Responsive padding**: `px-4 sm:px-6` on Header, Footer, and SpaceExplorer container — 16px on mobile (< 640px), 24px on tablet+. Critical because the grid's `minmax(280px, 1fr)` needs at least 280px available width; on a 320px screen, `px-6` (48px total) leaves only 272px, causing overflow.
- **Footer wrapping**: Footer nav uses `flex-wrap` with `gap-x-4 gap-y-2 sm:gap-x-6` and `justify-center` so links flow to additional lines on narrow screens. The decorative Alkemio logo is hidden on mobile (`hidden sm:block`).
- **Overflow safety net**: `.crd-root` has `overflow-x: hidden` in `crd.css` to prevent any child from creating a horizontal scrollbar.
- **Width alignment**: Footer and SpaceExplorer both use `max-w-[1600px]` for visual consistency on large screens.
- **Grid**: CSS Grid with `repeat(auto-fill, minmax(280px, 1fr))` handles responsive column counts without explicit breakpoints.

### D14: Lazy Loading & Performance Strategy

The CRD system follows the project's established lazy loading patterns to minimize initial bundle impact:

**Eager (loaded with the route):**
- `CrdLayoutWrapper` — must be available immediately to wrap nested routes
- `CrdLayout`, `Header`, `Footer` — the page shell renders before content loads
- CRD primitives (Button, Avatar, Badge, etc.) — small, tree-shaken, no separate chunk needed
- CRD CSS (`crd.css`) — imported globally in `index.tsx`, scoped via `.crd-root`

**Lazy (loaded on demand):**
- **Page components** (e.g., `SpaceExplorerPage`) — lazy-loaded via `lazyWithGlobalErrorHandler()` in `TopLevelRoutes.tsx`, wrapped in `<Suspense fallback={<Loading />}>`. Each page creates its own chunk.
- **HelpDialog** — lazy-loaded in `CrdLayoutWrapper` via `lazyWithGlobalErrorHandler()`, only loaded when user clicks "Get Help"
- **PendingMembershipsDialog** — already lazy-loaded at the root level, triggered via context provider
- **Messages/Notifications dialogs** — already lazy-loaded in `root.tsx`, reused via context providers

**Bundle chunking** (from `vite.config.mjs` `manualChunks`):
- CRD components are NOT in a separate vendor chunk — Radix UI deps are small compared to MUI and don't warrant a dedicated chunk
- MUI is already split into `vendor-mui-core`, `vendor-mui-icons`, `vendor-mui-extended`
- Route-level code splitting handles the rest — each lazy route creates its own chunk

**Why `CrdLayoutWrapper` is eager**: It renders the page shell (Header + Footer) immediately when navigating to a CRD route. Lazy-loading it would show a blank page or loading spinner before the shell appears, degrading perceived performance. The wrapper itself is lightweight — heavy dependencies (HelpDialog, pending memberships query) are lazy-loaded internally.

### D15: `src/main/crdPages/` as the Page Integration Layer

CRD-migrated page components live in `src/main/crdPages/<pageName>/` rather than modifying existing files in `src/main/topLevelPages/`. This keeps MUI and CRD page implementations cleanly separated — the original MUI pages in `src/main/topLevelPages/` remain in the codebase and are rendered by default (toggle OFF). They can be removed once migration is complete and the toggle is deleted. `src/main/crdPages/` may import from `@/crd/`, `@/domain/`, and `@/core/`, but MUST NOT import from `@mui/*`. The `CrdLayoutWrapper` remains in `src/main/ui/layout/` because it is an app-level concern, not page-specific.

### D16: PlatformNavigation Menu & Layout Building Blocks

The CRD Header's `LayoutGrid` icon currently links directly to `/spaces`. In the MUI layout, the equivalent icon (`PlatformNavigationMenuButton`) opens a popup menu with 4 platform-level navigation items: Innovation Library, Forum, Spaces, and Documentation (defined in `src/main/ui/platformNavigation/platformNavigationMenu/menuItems.ts`).

**CRD implementation:**
- The PlatformNavigation menu is a `DropdownMenu` (Radix UI) rendered in a new `PlatformNavigationMenu` component at `src/crd/layouts/components/PlatformNavigationMenu.tsx`
- Menu items are received as props (`items: CrdPlatformNavigationItem[]`) — each item has an `icon` (React node), `label` (string), and `href` (string). The component never hardcodes routes
- The `CrdPlatformNavigationItem` type is defined in `src/crd/layouts/types.ts`
- `CrdLayoutWrapper` builds the items list from the same routes as the MUI version (`TopLevelRoutePath`) and passes them through `CrdLayout` → `Header` → `PlatformNavigationMenu`
- Icons use lucide-react equivalents of the MUI icons used in `menuItems.ts`

**Layout building blocks pattern:**
As part of this work, the existing user profile dropdown (~120 lines) is extracted from `Header.tsx` into `src/crd/layouts/components/UserMenu.tsx`. This establishes the `layouts/components/` directory for sub-components of layout shells — building blocks that are structural parts of the page shell, not independently reusable feature-area composites. The extraction keeps `Header.tsx` focused on the icon bar layout and makes each menu independently readable.

**Standalone app:** `CrdApp.tsx` provides mock platform navigation items so the menu works in the preview app without a backend.

**i18n:** Menu item labels are passed as translated strings from the consumer (via `CrdLayoutWrapper` using the main `translation` namespace). The PlatformNavigationMenu component itself does not call `useTranslation` for item labels — they arrive as props. Any structural UI text (e.g., a menu heading) uses the `crd-layout` namespace.
