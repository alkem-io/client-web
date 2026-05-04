# Implementation Plan: CRD Public Profile Pages (User, Organization, Virtual Contributor)

**Branch**: `096-crd-user-pages` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/096-crd-user-pages/spec.md`

## Summary

Migrate the three public **profile** pages — **User** (`/user/:userSlug`), **Organization** (`/organization/:orgSlug`), and **Virtual Contributor** (`/vc/:vcSlug`) — from the current MUI implementations (`src/domain/community/user/userProfilePage/*`, `src/domain/community/organization/pages/*`, `src/domain/community/virtualContributor/vcProfilePage/*`) to the CRD design system (shadcn/ui + Tailwind), following the parallel-design-system migration pattern proven by 039 (spaces), 041 (dashboard), 042 (space page), 043 (search), 045 (space settings), and 091 (subspace page). Apollo queries and mutations are completely untouched — three sibling data mappers under `src/main/crdPages/topLevelPages/{userPages,organizationPages,vcPages}/publicProfile/` bridge generated GraphQL types to plain CRD prop types. No GraphQL schema change. Gated behind the existing `alkemio-crd-enabled` localStorage toggle, dispatched from `TopLevelRoutes.tsx` via `useCrdEnabled()` — one conditional block per actor route.

The three public profile views ship together with the seven User Settings tabs (sibling spec `097-crd-user-settings`) as one user-vertical release. Organization and VC **settings/admin shells** stay in MUI under this spec — only the read-only public profile views are migrated; the gear icons on the Org and VC heroes link to the existing MUI admin URLs. When the CRD toggle is on, every public profile URL renders in CRD; when off, every URL renders in the existing MUI files (which stay in place).

**Per-actor design-source highlights:**

- **User profile** — **prototype-driven redesign** (`prototype/src/app/pages/UserProfilePage.tsx`). NOT a parity restyle of current MUI; where prototype and MUI disagree, the prototype wins.
  - Hero: banner / avatar / display name / location line. **No presence dot** (clarified — drop the prototype's mock dot).
  - **Settings (gear) icon** visible when `canEditSettings = (currentUser.id === profileUser.id) || hasPlatformPrivilege(PlatformAdmin)` (owner OR platform admin) — for admins on another user's profile it links to the target's settings, not the admin's own.
  - **Message button** visible to any signed-in non-owner viewer (admins included). Both can coexist for an admin viewing someone else's profile.
  - Sticky 5-tab resource strip per the prototype: `All Resources`, `Hosted Spaces`, `Virtual Contributors`, `Leading`, `Member of`. Default `All Resources`. Local React state only (not URL-synced). Horizontally scrollable below `md`.
  - Sidebar (`lg:col-span-4`, stacked above the right column on smaller viewports — single-column layout, sidebar is **not** hidden): bio + associated organizations. Right column (`lg:col-span-8`): tab-filtered resource sections.
  - "Spaces Leading" set computed as `useFilteredMemberships(contributions, [RoleType.Lead, RoleType.Admin])` — current MUI parity.
  - **Innovation packs and innovation hubs are intentionally omitted** (per prototype) even though `useAccountResources` returns them — see Out of Scope in spec.md.

- **Organization profile** — **parity restyle of current MUI** (`OrganizationPageView` + `AssociatesView`). No prototype exists.
  - Hero: banner / avatar / display name / location / Verified badge (when `verification.status === VerifiedManualAttestation`).
  - **Settings (gear) icon** visible when `useOrganizationProvider().permissions.canEdit` is true → links to `buildSettingsUrl(profile.url)` (existing MUI admin URL — out of scope for migration).
  - **Message button** visible to any signed-in viewer (parity with current MUI `OrganizationPageBanner.onSendMessage`); reuses the same `useSendMessageToUsersMutation` against the org as recipient.
  - Sidebar: Bio + Tagsets (Keywords + Capabilities) + References + **Associates** (parity port of MUI `AssociatesView` — paginates at `ASSOCIATE_CARDS_COUNT = 12` with "Show more (N) / Show less" toggle; when `canReadUsers === false` the section header still renders and the body shows the existing `associates-view.sign-in` CTA copy instead of the avatar grid — section is **not** hidden).
  - Right column: Account Resources (combined spaces + innovationPacks + innovationHubs — omitted when all three lists are empty; **hosted-spaces sub-list preserves the current MUI `VISIBLE_SPACE_LIMIT = 6` cap with the "Show all" button** — parity port) + Lead Spaces (filtered via `useFilteredMemberships(contributions, [RoleType.Lead])` — `[Lead]` only; omitted when empty) + All Memberships (always rendered, with empty-state caption when empty — reuses existing `pages.user-profile.communities.noMembership` translation key).

- **VC profile** — **parity restyle of current MUI** (`VCProfilePageView` + `VCProfileContentView`). No prototype exists.
  - Hero: banner / avatar / display name (no location line per FR-030). **No Message button** (parity with current MUI; VCs are AI personas).
  - **Settings (gear) icon** visible when `vc.authorization.myPrivileges` includes `Update` → links to `buildSettingsUrl(profile.url)` (existing MUI admin URL — out of scope for migration).
  - Sidebar: Description + Host (compact card showing `vc.provider.profile`) + non-social References (filtered via `isSocialNetworkSupported`; empty-state line via existing `common.no-references` key — FR-102 parity reuse) + Body of Knowledge.
  - **Body of Knowledge discriminated union** at the mapper boundary — three variants: `space` (renders SpaceCardHorizontal-equivalent CRD card; placeholder profile when `hasReadAccess === false` — `displayName` from existing `components.card.privacy.private` key, empty URL — exact MUI parity), `knowledgeBase` (description from `useKnowledgeBase().knowledgeBaseDescription`, falling back to existing `virtualContributorSpaceSettings.placeholder` key when empty — exact MUI parity; Visit button disabled with tooltip from existing `components.profile.fields.bodyOfKnowledge.privateBokTooltip` key when `hasReadAccess === false`), `external` (engine-type copy via existing `components.profile.fields.engines.externalVCDescription` interpolation — FR-102 parity reuse).
  - Right column: VC content view — model card (`aiEngine`, `prompts`, `dataPrivacy`) + social-group references rendered with `lucide-react` brand icons (`Linkedin`, `Twitter`, `Github`, `Youtube`, …; `Globe` fallback). No new CRD primitive for icons.
  - 404 → existing `Error404` rendered inside the CRD layout. Restricted view → existing `useRestrictedRedirect` runs unchanged.
  - `${KNOWLEDGE_BASE_PATH}/*` subroute is **delegated to the existing MUI `VCKnowledgeBaseRoute`** — `CrdVCRoutes` mounts it at the same path so `/vc/:slug/knowledge-base/*` keeps working when CRD is on (out of scope for CRD migration — future spec).

**Pagination is per-actor (FR-016):** User profile renders every item per prototype. Organization profile preserves the current MUI 6-cap + "Show all" affordance on Account Resources hosted spaces; Lead Spaces and All Memberships render every item. Organization Associates uses the current MUI 12-cap + "Show more / less" toggle.

**Skeleton loading** — every page renders CRD `Skeleton` placeholders sized to the eventual content while queries are in flight, replaced per-region as each query resolves (FR-009).

**Out of scope (for this spec):**

- The seven User Settings tabs (`/user/:userSlug/settings/*`) — owned by sibling spec `097-crd-user-settings`.
- The Organization settings/admin shell (`/organization/:orgSlug/settings/*`) — stays in MUI; CRD migration is a future spec.
- The VC settings/admin shell (`/vc/:vcSlug/settings/*`) — stays in MUI; CRD migration is a future spec.
- No new GraphQL types, mutations, or backend capabilities.

**Authorization (per-actor route wrappers preserved exactly — research §1):**

- `/user/*` — wrapped by existing `<NoIdentityRedirect>`. CRD preserves this; anonymous viewers on `/user/<slug>` are redirected to login. Settings/Message gating inside the hero is independent (FR-011 / FR-012).
- `/organization/*` — anonymous viewers can load the page (parity with current MUI). Settings + Message buttons gate themselves.
- `/vc/*` — anonymous viewers can load the page; `useRestrictedRedirect` enforces the `Read` privilege downstream. Settings button gates on `Update` privilege.

**Coupling with sibling spec `097-crd-user-settings`:**

- Both specs share the same `useCrdEnabled` toggle and the same `CrdLayoutWrapper`. They flip together — toggling CRD on flips both the public profile view and the settings tabs simultaneously.
- The shared User-vertical infrastructure (`useCanEditSettings`, `useUserPageRouteContext`, `CrdUserRoutes.tsx`) is used by both specs. To avoid duplication, the foundational tasks for these helpers are tracked in **this** spec (096) under Phase 2 — sibling spec 097 reuses the implementation.
- The Organization and VC verticals do NOT share a sibling settings spec — their settings shells stay in MUI.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing), `react-i18next` (existing), `react-router-dom` (existing — only the integration layer touches it). All required CRD primitives (`tabs`, `card`, `dialog`, `dropdown-menu`, `popover`, `avatar`, `badge`, `button`, `textarea`, `skeleton`, `tooltip`, `scroll-area`) already exist under `src/crd/primitives/`. **Two new shared CRD components introduced by this spec, both under `src/crd/components/common/`**: (1) `CompactContributorCard` — used by the User profile's Organizations sidebar (caption=role, secondaryCaption=member-count line per Q1 decision) and the VC profile's Host section. NOTE: the Organization profile's Associates list does **not** use `CompactContributorCard` — it renders the existing `ContributorCardSquare` shape via the parity port of MUI `AssociatesView` (FR-023). (2) `MessagePopover` — recipient-agnostic in-hero compose surface used by the User and Organization profile heroes (Q2 decision; placed in `common/` from day one rather than the User vertical so the Organization hero does not cross-import). The shared `useSendMessageHandler` integration helper lives at `src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts` (consistent with `MessagePopover`'s rationale — neither User nor Organization integration cross-imports). No new runtime dependencies.
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD toggle (existing); GraphQL data layer unchanged
**Testing**: Vitest with jsdom (`pnpm vitest run`) — unit tests for the three mappers (`publicProfileMapper`, `organizationProfileMapper`, `vcProfileMapper`), the User tab→section filter, the BoK discriminated-union resolver, and the `canEditSettings` predicate. Visual / interaction validation via `pnpm start` and the per-actor smoke checklist in `quickstart.md`.
**Target Platform**: Web SPA (Vite dev server on `localhost:3001`)
**Project Type**: Web application (frontend only — no backend changes)
**Performance Goals**:
- Page render < 5 s perceived on each actor page (SC-001), via lazy-loaded per-page chunks. **Three chunks total** (Q8 decision): one per actor's `Crd<Actor>Routes`; the per-actor page component lives inside its routes chunk, NOT as a separate `React.lazy()` boundary. Matches the precedent set by 045 / 091 / 097.
- User-profile resource tab switch < 200 ms perceived (data-driven section filtering + React 19 `useTransition`).
- Send-message round-trip < 3 s typical (User + Organization), surfaced via the Send button's spinner state and `aria-busy`.
- Combined bundle delta on the three new lazy-loaded chunks (User + Organization + VC) ≤ +35 KB gzipped over the prior build (SC-005). +15 KB more than the original 096-User-only budget, accounting for two additional pages and the two new shared CRD components (`CompactContributorCard`, `MessagePopover`) — both shipped in the small `crd-common` chunk that is already shared across CRD pages, so they do not count against the per-actor budget.
**Constraints**: Zero `@mui/*` / `@emotion/*` imports under `src/crd/components/{user,organization,virtualContributor,common}/` and under `src/main/crdPages/topLevelPages/{userPages,organizationPages,vcPages}/publicProfile/*Mapper.ts`'s consumers (the mappers themselves DO import generated GraphQL types — that is the only allowed crossing per FR-005). All six languages (en / nl / es / bg / de / fr) edited in the same PR per the manual CRD i18n workflow (no Crowdin).
**Scale/Scope**: Three public profile pages (User + Organization + VC) + three integration entry points + two new shared CRD components (`CompactContributorCard` and `MessagePopover`, both under `src/crd/components/common/`) + one shared CRD i18n namespace (`crd-profilePages`) covering all three actor pages. ~13–15 new CRD presentational components total across the three verticals, three data mappers, ~10 existing Apollo queries reused unchanged, two new shared User-vertical helpers (`useCanEditSettings`, `useUserPageRouteContext`) — these are also referenced by sibling spec 097 and are tracked here as foundational. One shared cross-actor helper (`useSendMessageHandler`) reused by User and Organization heroes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --- | --- | --- |
| I. Domain-Driven Frontend Boundaries | PASS | CRD components purely presentational. All business logic stays in existing `src/domain/community/{user,organization,virtualContributor}/*` hooks (`useUserProvider`, `useOrganizationProvider`, `useFilteredMemberships`, `useKnowledgeBase`, etc.). Data mappers live under `src/main/crdPages/topLevelPages/<vertical>/publicProfile/*Mapper.ts`. |
| II. React 19 Concurrent UX Discipline | PASS | All CRD views are pure render functions. The User and Organization send-message mutations wrap with `useTransition` in the integration layer (per Constitution Principle II). Suspense boundaries surround the lazy-loaded CRD pages. Skeleton placeholders satisfy the "explicit accessible fallback UI" requirement (FR-009). No legacy lifecycles introduced. |
| III. GraphQL Contract Fidelity | PASS | No GraphQL changes (Out of Scope). All Apollo operations go through generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. CRD components never import generated GraphQL types — only the three mappers do. |
| IV. State & Side-Effect Isolation | PASS | CRD components hold only visual state (active resource tab, popover open, scroll position). All side effects (mutations, navigation) live in the integration layer. The User profile's resource tab is local React state per FR-013 (clarification — not URL-synced). |
| V. Experience Quality & Safeguards | PASS | FR-110 / FR-111 codify WCAG 2.1 AA: semantic HTML, visible focus, accessible names on icon-only buttons (Settings, Message, BoK Visit), keyboard reachable User-profile tab strip. Tab-strip horizontal-scroll variant on `< md` keeps every tab keyboard-reachable. Skeleton placeholders prevent layout shift during loading. |
| Arch #1: Feature directories map to domain contexts | PASS | Presentational components under `src/crd/components/{user,organization,virtualContributor,common}/`. Integration under `src/main/crdPages/topLevelPages/{userPages,organizationPages,vcPages}/publicProfile/`. Domain hooks reused from `src/domain/community/{user,organization,virtualContributor}/`. |
| Arch #2: Styling standardizes on MUI theming | **JUSTIFIED VIOLATION** | Same intentional, constitution-acknowledged violation as 039 / 041 / 042 / 043 / 045 / 091 / 097. CRD is the announced successor design system. See Complexity Tracking. |
| Arch #3: i18n via react-i18next | PASS | New shared namespace `crd-profilePages` (one namespace covering all three actor pages, per research §7); English source only edited directly; the other five languages (nl / es / bg / de / fr) maintained manually in the same PR per `src/crd/CLAUDE.md` (no Crowdin). FR-102 allows reusing select existing `translation`-namespace keys to avoid duplication. No hard-coded strings. |
| Arch #4: Build artifacts deterministic | PASS | No Vite config changes. No new runtime dependencies. Existing CRD chunk-splitting strategy applies. |
| Arch #5: No barrel exports | PASS | All imports use explicit file paths. |
| Arch #6: SOLID + DRY | PASS | **SRP**: per-actor hero / sidebar / sections / view composition each in their own file. **OCP**: User tab-key driven section filter is data-driven; VC BoK rendering switches on a discriminated-union `kind` field. **LSP**: every resource section accepts `SpaceCardItem[]` or `VCCardItem[]`. **ISP**: each component's prop shape is minimal — `VCPageHeroProps` does NOT include `onSendMessage` (FR-030). **DIP**: views consume plain props injected by the per-actor mapper — never call Apollo directly. **DRY**: shared CRD `SpaceCard` reused across User and Organization resource sections; new `CompactContributorCard` primitive shared across User profile's Organizations sidebar, Org Associates list, and VC Host card (Q1 + research §6); new `MessagePopover` recipient-agnostic primitive shared between User and Org heroes (Q2 — placed under `src/crd/components/common/` from day one to avoid cross-vertical imports); single `useSendMessageHandler` helper shared by User and Organization heroes (research §5). |
| WF #5: Root Cause Analysis Before Fixes | N/A | This is a presentation-layer migration, not a bug fix. No fetch policies / retries / defensive guards introduced — Apollo queries reused exactly as today. |

**Post-Phase 1 re-check**: All gates pass. The Arch #2 violation is identical to prior CRD migrations.

## Project Structure

### Documentation (this feature)

```text
specs/096-crd-user-pages/
├── plan.md              # This file
├── spec.md              # Feature specification (3 P1 user stories — User, Org, VC)
├── research.md          # Phase 0: research findings (10 sections)
├── data-model.md        # Phase 1: entities + GraphQL → CRD prop mappings (per actor)
├── quickstart.md        # Phase 1: setup, build order (9 steps), per-actor smoke checklist
├── contracts/           # Phase 1: TypeScript interfaces for CRD components
│   ├── publicProfile.ts          # User profile view + UserPageHero contracts
│   ├── organizationProfile.ts    # Organization profile view + Org sidebar/sections contracts
│   ├── vcProfile.ts              # VC profile view + BoK discriminated-union + content view contracts
│   ├── compactContributor.ts     # Shared CompactContributorCard primitive contract (Host + Associates)
│   └── data-mapper.ts            # Cross-page mapper utility contracts (shared with 097)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── crd/
│   ├── primitives/                                 # ALL primitives already exist — no new ports needed
│   ├── components/
│   │   ├── common/                                 # NEW — cross-vertical shared components
│   │   │   ├── CompactContributorCard.tsx          # NEW shared primitive (User Orgs row + Org Associates row + VC Host card)
│   │   │   └── MessagePopover.tsx                  # NEW recipient-agnostic in-hero compose surface (User + Org heroes)
│   │   ├── user/                                   # NEW — User public-profile presentational components
│   │   │   ├── UserPageHero.tsx                    # Banner + avatar + name + location + Settings icon + Message popover (consumes MessagePopover from common/)
│   │   │   ├── UserProfileSidebar.tsx              # About + Organizations sidebar (Organizations rendered via CompactContributorCard with secondaryCaption=member-count)
│   │   │   ├── UserResourceTabStrip.tsx            # 5-tab strip; horizontal-scroll on < md
│   │   │   ├── UserResourceSections.tsx            # Conditional rendering of Resources Hosted / Spaces Leading / Member Of
│   │   │   └── UserPublicProfileView.tsx           # Top-level User public profile composition
│   │   ├── organization/                           # NEW — Organization public-profile presentational components
│   │   │   ├── OrganizationPageHero.tsx            # Banner + avatar + name + location + Verified badge + Settings icon + Message popover
│   │   │   ├── OrganizationProfileSidebar.tsx      # Bio + Tagsets + References + Associates (CompactContributorCard list)
│   │   │   ├── OrganizationResourceSections.tsx    # Account Resources + Lead Spaces + All Memberships
│   │   │   └── OrganizationPublicProfileView.tsx   # Top-level Org public profile composition
│   │   └── virtualContributor/                     # NEW — VC public-profile presentational components
│   │       ├── VCPageHero.tsx                      # Banner + avatar + name + Settings icon (NO Message button)
│   │       ├── VCProfileSidebar.tsx                # Description + Host (CompactContributorCard) + non-social References + BoK
│   │       ├── VCBodyOfKnowledgeSection.tsx        # Discriminated-union renderer: space / knowledgeBase / external
│   │       ├── VCContentView.tsx                   # Right column — model card + social references (lucide-react brand icons)
│   │       └── VCPublicProfileView.tsx             # Top-level VC public profile composition
│   ├── i18n/
│   │   └── profilePages/                           # NEW — manually managed (en / nl / es / bg / de / fr) — shared across all 3 actor pages
│   │       ├── profilePages.en.json
│   │       ├── profilePages.nl.json
│   │       ├── profilePages.es.json
│   │       ├── profilePages.bg.json
│   │       ├── profilePages.de.json
│   │       └── profilePages.fr.json
│   └── lib/
│       └── (existing — pickColorFromId already in place)
├── main/
│   ├── crdPages/
│   │   └── topLevelPages/
│   │       ├── common/                             # NEW — cross-vertical integration helpers (mirrors src/crd/components/common/)
│   │       │   └── useSendMessageHandler.ts        # Wraps useSendMessageToUsersMutation (shared by User + Org heroes; placed here for symmetry with MessagePopover under src/crd/components/common/)
│   │       ├── userPages/                          # NEW — User-vertical integration layer (shared with 097)
│   │       │   ├── CrdUserRoutes.tsx               # Route entry mirroring src/domain/community/user/routing/UserRoute.tsx — settings subtree delegated to CrdUserAdminRoutes from 097
│   │       │   ├── useUserPageRouteContext.ts     # Resolves userId/userSlug + currentUser — shared helper
│   │       │   ├── useCanEditSettings.ts           # Encapsulates the canEditSettings predicate (FR-011) — shared with 097
│   │       │   └── publicProfile/
│   │       │       ├── CrdUserProfilePage.tsx
│   │       │       ├── publicProfileMapper.ts      # GraphQL → UserPublicProfileViewProps
│   │       │       └── useResourceTabs.ts          # Active-tab state + section filter logic (local React state per FR-013)
│   │       ├── organizationPages/                  # NEW — Organization-vertical integration layer
│   │       │   ├── CrdOrganizationRoutes.tsx       # Route entry mirroring src/domain/community/organization/routing/OrganizationRoute.tsx — settings subtree falls back to existing MUI admin route
│   │       │   └── publicProfile/
│   │       │       ├── CrdOrganizationProfilePage.tsx
│   │       │       └── organizationProfileMapper.ts  # GraphQL → OrganizationPublicProfileViewProps
│   │       └── vcPages/                            # NEW — VC-vertical integration layer
│   │           ├── CrdVCRoutes.tsx                 # Route entry mirroring src/domain/community/virtualContributor/VCRoute.tsx — settings subtree falls back to existing MUI admin route; ${KNOWLEDGE_BASE_PATH}/* delegates to existing MUI VCKnowledgeBaseRoute
│   │           └── publicProfile/
│   │               ├── CrdVCProfilePage.tsx
│   │               ├── vcProfileMapper.ts          # GraphQL → VCPublicProfileViewProps (incl. BoK discriminated-union resolver)
│   │               └── useVCBodyOfKnowledge.ts     # Wraps the auxiliary BoK queries (auth privileges, about, useKnowledgeBase)
│   └── routing/
│       └── TopLevelRoutes.tsx                      # MODIFIED — adds three conditional blocks (one per actor) under useCrdEnabled() gate, each preserving the existing wrapper exactly
├── core/
│   └── i18n/
│       └── config.ts                               # MODIFIED — register `crd-profilePages` namespace
└── domain/community/                               # UNCHANGED — existing MUI files stay for toggle-off
    ├── user/userProfilePage/                       # UNCHANGED
    ├── organization/pages/                         # UNCHANGED
    └── virtualContributor/vcProfilePage/           # UNCHANGED
```

**Structure Decision**: Presentational CRD components live under `src/crd/components/{user,organization,virtualContributor,common}/`. Per-actor integration (route entries, mappers, integration hooks) lives under three sibling folders: `src/main/crdPages/topLevelPages/{userPages,organizationPages,vcPages}/`. Each vertical has its own routing skeleton (`Crd<Actor>Routes.tsx`) that mirrors the existing MUI route wrapper exactly — preserving today's per-actor authorization wrappers (research §1). The User-vertical settings subtree is delegated to sibling spec 097's `CrdUserAdminRoutes`; the Org and VC settings subtrees fall through to the existing MUI admin routes (out of scope per Out of Scope bullets in spec.md). The existing MUI files under `src/domain/community/{user,organization,virtualContributor}/` stay intact and continue to serve users when `useCrdEnabled()` returns `false`. No GraphQL changes; two new shared CRD components (`CompactContributorCard` and `MessagePopover`, both under `src/crd/components/common/`).

**TopLevelRoutes wiring** (mirrors the 045 / 091 / 097 patterns): `TopLevelRoutes.tsx` gets three conditional blocks (one per actor), each choosing between `Crd<Actor>Routes` (lazy-loaded) and the existing actor route (also lazy-loaded). Each pair is wrapped in the same wrapper its MUI counterpart uses today — the User pair wrapped in `<NoIdentityRedirect>`, the Org and VC pairs wrapped per their existing wrappers (research §1). All three pairs continue to be wrapped by `<WithApmTransaction>` exactly as today.

**`/user/me` resolution**: handled by a CRD analog of `UserMeRoute` inside `CrdUserRoutes.tsx`. Resolves the current user's id from `useCurrentUserContext()` and supplies it via `MeUserProvider` (or a CRD analog) to the same `CrdUserProfilePage` component — URL stays `/user/me`, mirroring MUI's `UserMeRoute.tsx` (no redirect; verified via Q6). No analogous shorthand exists for Organization or VC (parity with current routing, per FR-007).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Arch #2 (parallel CRD design system) | CRD is the announced successor design system; all new pages adopt it per 039 / 041 / 042 / 043 / 045 / 091 / 097 precedent | Continuing MUI-only would block the CRD migration mandate; this intentional parallel-systems phase is tracked, bounded by the localStorage toggle, and removed once every page is migrated and validated. |
