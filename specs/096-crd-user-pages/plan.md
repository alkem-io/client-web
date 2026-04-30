# Implementation Plan: CRD User Profile Page

**Branch**: `096-crd-user-pages` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/096-crd-user-pages/spec.md`

## Summary

Migrate the public **User Profile** page (`/user/:userSlug`) from the current MUI implementation (`src/domain/community/user/userProfilePage/*`) to the CRD design system (shadcn/ui + Tailwind), following the parallel-design-system migration pattern proven by 039 (spaces), 041 (dashboard), 042 (space page), 043 (search), 045 (space settings), and 091 (subspace page). Apollo queries and mutations are completely untouched — data mappers under `src/main/crdPages/topLevelPages/userPages/publicProfile/` bridge generated GraphQL types to plain CRD prop types. No GraphQL schema change. Gated behind the existing `alkemio-crd-enabled` localStorage toggle, dispatched from `TopLevelRoutes.tsx` via `useCrdEnabled()`.

The public profile view ships together with the seven settings tabs (sibling spec `097-crd-user-settings`) as one user-vertical release — when CRD is enabled the entire user vertical renders in CRD; when disabled the entire vertical renders in the existing MUI files (which stay in place). The single user story (P1) is independently testable, but production rollout waits for both specs to ship together.

**Public profile parity highlights:**

- Hero: banner / avatar / display name / location line. **No presence dot** (clarified — drop the prototype's mock dot). **Settings (gear) icon** visible when `canEditSettings` (owner OR platform admin) — for admins on another user's profile it links to the target's settings, not the admin's own. **Message button** visible to any signed-in non-owner viewer (admins included). Both can coexist for an admin viewing someone else's profile.
- Sidebar: bio + associated organizations. Right column: sticky 5-tab resource strip (`All Resources`, `Hosted Spaces`, `Virtual Contributors`, `Leading`, `Member Of`) — horizontally scrollable below `md` (matches the prototype's `overflow-x-auto`).
- No pagination — every section renders every item, parity with current MUI `TilesContributionsView`.

**Authorization:**

- Public profile (`/user/:userSlug`) — wrapped in the existing `NoIdentityRedirect` (matches current MUI behavior, see research §1).
- The Settings (gear) icon links to `/user/:userSlug/settings/profile` (the destination route is owned by sibling spec `097-crd-user-settings`, which evaluates the same `canEditSettings` predicate at the settings-shell route boundary).

**Coupling with sibling spec `097-crd-user-settings`:**

- Both specs share the same `useCrdEnabled` toggle and the same `CrdLayoutWrapper`. They are gated together — toggling CRD on flips both the public profile view and the settings tabs simultaneously.
- The shared infrastructure (`useCanEditSettings`, `useUserPageRouteContext`, `CrdUserRoutes.tsx`) is used by both specs. To avoid duplication, the foundational tasks for these helpers are tracked in **this** spec (096) under Phase 2 — sibling spec 097 reuses the implementation.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing), `react-i18next` (existing), `react-router-dom` (existing — only the integration layer touches it). All required CRD primitives (`tabs`, `card`, `dialog`, `dropdown-menu`, `popover`, `avatar`, `badge`, `button`, `textarea`, `skeleton`, `tooltip`, `scroll-area`) already exist under `src/crd/primitives/`. No new runtime dependencies.
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`) — unit tests for the public profile mapper, the tab→section filter, and the `canEditSettings` predicate. Visual / interaction validation via `pnpm start` and manual smoke.
**Target Platform**: Web SPA (Vite dev server on `localhost:3001`)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**: Tab switch < 200ms; bundle delta on the user-profile chunk ≤ +20 KB gzipped over the prior build (SC-005).
**Constraints**: Zero `@mui/*` / `@emotion/*` imports under `src/crd/` and `src/main/crdPages/topLevelPages/userPages/publicProfile/`. Generated GraphQL types only crossable inside `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts` (FR-005). All six languages (en / nl / es / bg / de / fr) edited in the same PR per the manual CRD i18n workflow.
**Scale/Scope**: 1 public profile + 1 hero + 1 sidebar + 1 resource tab strip + sections renderer. 1 new CRD i18n namespace (`crd-userPages`). ~7 new CRD presentational components, 1 data mapper, ~4 existing Apollo queries reused unchanged, ~2 new shared helpers (`useCanEditSettings`, `useUserPageRouteContext`) — these are also referenced by sibling spec 097 and are tracked here as foundational. No new primitives required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components purely presentational. All business logic stays in existing `src/domain/community/user/*` hooks (`useUserProvider`, `useFilteredMemberships`). Data mappers live under `src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.ts`. |
| II. React 19 Concurrent UX Discipline | PASS | All CRD views are pure render functions. The hero's send-message mutation wraps with `useTransition` in the integration layer (per Constitution Principle II). Suspense boundaries surround the lazy-loaded CRD page. No legacy lifecycles introduced. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes (FR-005 + Out of Scope). All Apollo operations go through generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. CRD components never import generated GraphQL types — only the mapper does. |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (active resource tab, popover open, scroll position). All side effects (mutations, navigation) live in the integration layer. |
| V. Experience Quality & Safeguards | PASS | FR-110 / FR-111 codify WCAG 2.1 AA: semantic HTML, visible focus, accessible names on icon-only buttons, keyboard reachable tab strip. Tab-strip horizontal-scroll variant on `< md` keeps every tab keyboard-reachable. |
| Arch #1: Feature directories map to domain contexts | PASS | Presentational components under `src/crd/components/user/`. Integration under `src/main/crdPages/topLevelPages/userPages/publicProfile/`. Domain hooks reused from `src/domain/community/user/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039 / 041 / 042 / 043 / 045 / 091. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New namespace `crd-userPages`; English source only edited directly; the other five languages (nl / es / bg / de / fr) maintained manually in the same PR per `src/crd/CLAUDE.md` (no Crowdin). No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies. Existing CRD chunk-splitting strategy applies. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | **SRP**: hero / sidebar / tab strip / sections / view composition each in their own file. **OCP**: tab-key driven section filter is data-driven. **LSP**: every resource section accepts `SpaceCardItem[]` or `VCCardItem[]`. **ISP**: each component's prop shape is minimal. **DIP**: views consume plain props injected by the mapper — never call Apollo directly. **DRY**: shared CRD `SpaceCard` reused across the three resource sections. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is identical to prior CRD migrations.

## Project Structure

### Documentation (this feature)

```text
specs/096-crd-user-pages/
├── plan.md              # This file
├── spec.md              # Feature specification (1 P1 user story)
├── research.md          # Phase 0: research findings
├── data-model.md        # Phase 1: entities + GraphQL → CRD prop mappings
├── quickstart.md        # Phase 1: setup, build order, smoke checklist
├── contracts/           # Phase 1: TypeScript interfaces for CRD components
│   ├── publicProfile.ts          # Public profile view + UserPageHero contracts
│   └── data-mapper.ts             # Cross-page mapper utility contracts (shared with 097)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                                 # ALL primitives already exist — no new ports needed
│   ├── components/
│   │   └── user/                                   # NEW — public-profile presentational components
│   │       ├── UserPageHero.tsx                    # Banner + avatar + name + location + Settings icon + Message popover
│   │       ├── UserPageMessagePopover.tsx          # In-hero compose surface (Popover + Textarea + Send)
│   │       ├── UserProfileSidebar.tsx              # About + Organizations sidebar (left col on lg+)
│   │       ├── UserResourceTabStrip.tsx            # 5-tab strip (`All Resources` → `Member Of`); horizontal-scroll on < md
│   │       ├── UserResourceSections.tsx            # Conditional rendering of Resources Hosted / Spaces Leading / Member Of
│   │       └── UserPublicProfileView.tsx           # Top-level public profile composition
│   ├── i18n/
│   │   └── userPages/                              # NEW — manually managed (en / nl / es / bg / de / fr)
│   │       ├── userPages.en.json
│   │       ├── userPages.nl.json
│   │       ├── userPages.es.json
│   │       ├── userPages.bg.json
│   │       ├── userPages.de.json
│   │       └── userPages.fr.json
│   └── lib/
│       └── (existing — pickColorFromId already in place)
├── main/
│   ├── crdPages/
│   │   └── topLevelPages/
│   │       └── userPages/                          # NEW — integration layer
│   │           ├── CrdUserRoutes.tsx               # Route entry mirroring src/domain/community/user/routing/UserRoute.tsx — shared with 097 (settings subtree delegated to CrdUserAdminRoutes from 097)
│   │           ├── useUserPageRouteContext.ts     # Resolves userId/userSlug + currentUser — shared helper
│   │           ├── useCanEditSettings.ts           # Encapsulates the canEditSettings predicate (FR-008a / FR-011) — shared helper
│   │           └── publicProfile/
│   │               ├── CrdUserProfilePage.tsx
│   │               ├── publicProfileMapper.ts      # GraphQL → UserPublicProfileViewProps
│   │               ├── useResourceTabs.ts          # Active-tab state + section filter logic
│   │               └── useSendMessageHandler.ts    # Wraps useSendMessageToUsersMutation
│   └── routing/
│       └── TopLevelRoutes.tsx                      # MODIFIED (jointly with 097) — adds the conditional CrdUserRoutes vs. UserRoute branch under `useCrdEnabled()` gate
├── core/
│   └── i18n/
│       └── config.ts                               # MODIFIED — register `crd-userPages` namespace
└── domain/community/user/                          # UNCHANGED — existing MUI files stay for toggle-off
```

**Structure Decision**: Presentational CRD components live under `src/crd/components/user/`. The route entry, mapper, route helpers, and integration hooks live under `src/main/crdPages/topLevelPages/userPages/`. The existing MUI files under `src/domain/community/user/userProfilePage/` and `src/domain/community/user/routing/` stay intact and continue to serve users when `useCrdEnabled()` returns `false`. No GraphQL changes; no new primitives.

**TopLevelRoutes wiring** (mirrors the 045 / 091 patterns): the conditional branch in `TopLevelRoutes.tsx` chooses between `CrdUserRoutes` (lazy-loaded) and the existing `UserRoute` (also lazy-loaded). Both are wrapped in the existing `NoIdentityRedirect` and `WithApmTransaction` — identical to today's wiring (research §1).

**`/user/me` resolution**: handled by a CRD analog of `UserMeRoute` inside `CrdUserRoutes.tsx`. Resolves the current user's nameID from `useCurrentUserContext()` and replaces `me` with the slug, then renders the same `CrdUserProfilePage`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039 / 041 / 042 / 043 / 045 / 091 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked, bounded by the localStorage toggle, and removed once every page is migrated and validated. |
