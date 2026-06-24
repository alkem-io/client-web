# Implementation Plan: CRD Public Profile Pages (User, Organization, Virtual Contributor)

**Branch**: `096-crd-user-pages` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/096-crd-user-pages/spec.md`

## Summary

Migrate the three public profile pages — **User** (`/user/:userSlug`), **Organization** (`/organization/:orgSlug`), and **Virtual Contributor** (`/vc/:vcSlug`) — from the current MUI implementation to the CRD design system (shadcn/ui + Tailwind), gated behind the existing `useCrdEnabled` toggle. Sibling spec `097-crd-user-settings` ships in the same release and owns the seven User Settings tabs.

**Per-actor design source**:

- **User profile** — redesign per `prototype/src/app/pages/UserProfilePage.tsx` (3-tab resource strip, hero with Settings + Message affordances, prototype-driven sidebar).
- **Organization profile** — parity restyle of current MUI `OrganizationPageView` + `AssociatesView`. No prototype exists. Sidebar gets a Social sub-block (post-implementation correction F2). Right column adopts the User profile's 3-tab layout (revised vs. earlier stacked-blocks draft).
- **VC profile** — redesign per the **updated** `prototype/src/app/pages/VCProfilePage.tsx` (2026-05-06; research §15). Hero gains a "Virtual Contributor" type badge + Keywords skill-tag chip row. Right column rebuilt into three card-grid sections: **Functionality** (3 cards — Capabilities / Data Access / Role Requirements driven by `modelCard.spaceUsage[]`), **AI Engine: <name>** (6 transparency cards driven by `modelCard.aiEngine.*`), **Monitoring by Alkemio** (separator + paragraph). Sidebar largely parity-restyle with two narrow tweaks (sticky on `lg+`; flat References list of all entries instead of MUI's silent split-and-discard of social refs). The data-extraction logic of the existing MUI hook `useTemporaryHardCodedVCProfilePageData(modelCard)` is reused (re-implemented in plain TypeScript inside the CRD data mapper); all hard-coded English copy moves to `crd-profilePages` i18n keys; the MUI `dangerouslySetInnerHTML` calls are replaced by `<Trans>`. The MUI source files are NOT modified.

**Technical approach**: One CRD page integration per actor under `src/main/crdPages/topLevelPages/<vertical>/publicProfile/`, three new presentational sub-components for the VC right column under `src/crd/components/virtualContributor/`, four shared CRD components (`CompactContributorCard`, `MessagePopover`, `SocialLinks`, and `ReferencesList` — the last added 2026-06-24 to share the non-social "Links" list across the User and Org sidebars) under `src/crd/components/common/`, one new i18n namespace `crd-profilePages`, three new lazy-loaded chunks (one per actor's `Crd<Actor>Routes`). Total bundle delta budget: ≤ +35 KB gzipped (SC-005).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing), `react-i18next` (existing), `react-router-dom` (existing — only the integration layer touches it). All required CRD primitives (`tabs`, `card`, `dialog`, `dropdown-menu`, `popover`, `avatar`, `badge`, `button`, `textarea`, `skeleton`, `tooltip`, `scroll-area`, `separator`) already exist under `src/crd/primitives/`. **Two new shared CRD components introduced by this spec** (both under `src/crd/components/common/`): (1) `CompactContributorCard` — used by the User profile's Organizations sidebar and the VC profile's Host section; (2) `MessagePopover` — recipient-agnostic in-hero compose surface used by the User and Organization profile heroes. **Three new VC content-view CRD components** added by the 2026-05-06 redesign (under `src/crd/components/virtualContributor/`): `VCFunctionalityGrid`, `VCAiEngineGrid` (with reusable `VCTransparencyCard` sub-component), `VCMonitoringSection`. No new runtime dependencies.
**Storage**: localStorage (`alkemio-crd-enabled`) for CRD toggle (existing); GraphQL data layer unchanged.
**Testing**: Vitest (jsdom). Mapper unit tests per actor (`publicProfileMapper.test.ts`, `organizationProfileMapper.test.ts`, `vcProfileMapper.test.ts` — the last covers the BoK discriminated-union resolver, the VC content-view extraction logic for empty / mixed / fully-populated model cards, and the engine-display-name derivation). Render tests on the three VC right-column components for the empty-fallback, all-flags-enabled, and mixed-flags shapes. i18n key parity test across all six languages.
**Target Platform**: Modern evergreen browsers (>90% global support per `caniuse.com`); WCAG 2.1 AA compliant.
**Project Type**: Single-page app (Vite + React 19 + Apollo Client).
**Performance Goals**: Page render under 5 s perceived (SC-001); resource tab switch under 200 ms (User profile only); send-message round-trip under 3 s typical.
**Constraints**: Combined bundle delta ≤ +35 KB gzipped across the three new chunks (SC-005). Zero `@mui/*` / `@emotion/*` / `@/domain/*` imports inside CRD components. Zero new GraphQL operations. The MUI source files under `src/domain/community/virtualContributor/vcProfilePage/` (including `useTemporaryHardCodedVCProfilePageData.ts`) MUST stay untouched.
**Scale/Scope**: Three public profile pages + integration glue + 5 new CRD components (2 cross-actor commons + 3 VC-specific) + 1 new i18n namespace. ~30–40 new files across `src/crd/components/`, `src/crd/i18n/profilePages/`, and `src/main/crdPages/topLevelPages/{userPages,organizationPages,vcPages}/`. Affects 3 routes in `TopLevelRoutes.tsx` (one CRD vs. MUI conditional per actor). Sibling spec 097 owns 7 settings tabs and ships in the same release.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Per the project Constitution at `.specify/memory/constitution.md` (v1.0.6), each principle is evaluated below:

| Principle | Check | Status |
|---|---|---|
| **I — Domain-Driven Frontend Boundaries** | All business logic (data fetching, role/privilege resolution, mutation invocation, BoK variant resolution, model-card extraction logic) lives in domain hooks under `src/domain/` or in integration mappers under `src/main/crdPages/topLevelPages/<vertical>/publicProfile/`. CRD presentational components are pure — they accept plain TypeScript props (no GraphQL types) and call back via `on*` props. No ad-hoc state shape; all consumed via existing or new typed mappers. | ✅ Pass |
| **II — React 19 Concurrent UX Discipline** | Async send-message wrapped in `useTransition` to keep the popover responsive while the mutation pends; `aria-busy` on the Send button. Skeleton placeholders for hero / sidebar / right-column / BoK populate per region as queries resolve (FR-009) — no blocking of paint on the slowest query. CRD components are pure render functions (no side effects); useState only for visual state (popover open, active tab, "show more" toggle). | ✅ Pass |
| **III — GraphQL Contract Fidelity** | All data flows through generated hooks from `src/core/apollo/generated/apollo-hooks.ts`. No new GraphQL operations introduced (every mutation and query is existing). CRD prop types are explicitly declared (BulletItem, TransparencyCardData, etc.) — generated GraphQL types are NOT exported through CRD prop interfaces. The integration mappers are the ONLY place generated types meet CRD prop types (FR-005). | ✅ Pass |
| **IV — State & Side-Effect Isolation** | Persistent state stays in Apollo cache (existing). The CRD components hold only visual state (`useState` for popover open / active tab / "show more"). The `useCrdEnabled` toggle reads from localStorage in a single dedicated hook. No direct DOM manipulation; no browser API usage outside existing wrappers. | ✅ Pass |
| **V — Experience Quality & Safeguards** | WCAG 2.1 AA enforced: semantic `<nav>` / `<button>` / `<a>` elements; `aria-label` on icon-only buttons (Settings, Message, BoK Visit, Tab); `role="tablist"` + `aria-selected` + arrow-key navigation on the resource tab strip (User + Organization only); visible `focus-visible:ring`; per-region `<output role="status" aria-label="Loading…">` skeletons. Bundle delta ≤ +35 KB enforced via `pnpm analyze` post-implementation. Mapper unit tests + i18n parity test + render tests for the three new VC components. | ✅ Pass |
| **Architecture Standard 2 (CRD design system)** | All three pages use CRD primitives + Tailwind + lucide-react icons (no MUI imports anywhere in `src/crd/` or `src/main/crdPages/`). Verified by ESLint + Biome boundaries (existing in `eslint.config.mjs`). | ✅ Pass |
| **Architecture Standard 3 (i18n)** | All user-visible strings use `t()`. Three pages share one new namespace `crd-profilePages` (lazy-loaded). All six languages (en, nl, es, bg, de, fr) edited in the same PR (CRD i18n manual workflow, no Crowdin per `src/crd/CLAUDE.md`). FR-102 documents which keys are reused from the global `translation` namespace. | ✅ Pass |
| **Architecture Standard 5 (no barrel exports)** | All imports use explicit file paths. No `index.ts` barrel files introduced. | ✅ Pass |
| **Architecture Standard 6 (SOLID & DRY)** | SRP: mappers / view-components / domain-hooks each have one responsibility. ISP: discriminated unions for BoK variants and TransparencyCardData answer types (booleanAnswer / textValue / action) instead of fat optional props. DIP: views consume mapper output, never call hooks directly. DRY: shared `CompactContributorCard` + `MessagePopover` + `SocialLinks` primitives reused across pages; the three new VC content-view components encapsulate the redesigned right-column rendering rules so the integration page stays a thin composition wrapper. | ✅ Pass |
| **Engineering Workflow 5 (root-cause analysis)** | Three previously-recorded post-implementation corrections (F1 / F2 / F3) traced to root causes (incorrect mutation assumption, missing social-references rendering, stale claim of MUI parity that was never achievable due to MUI's hard-coded data) — fixes applied at the spec / contracts / mapper level, NOT as defensive guards in the views. The 2026-05-06 VC redesign explicitly chooses the i18n + `<Trans>` rewrite over a workaround for the MUI hook's `dangerouslySetInnerHTML` (Golden Rule 10 enforcement). | ✅ Pass |

**No violations.** No entries in Complexity Tracking. The spec is ready for Phase 1 detailed design (data-model.md / contracts/ / quickstart.md), all of which exist in this folder and are kept in sync with the spec.

## Project Structure

### Documentation (this feature)

```text
specs/096-crd-user-pages/
├── plan.md                  # This file (/speckit.plan command output)
├── spec.md                  # Feature specification (/speckit.specify command output)
├── research.md              # Phase 0 research (15 sections, last updated 2026-05-06 with §15)
├── data-model.md            # Entity contracts + Query → region map (updated 2026-05-06 for VC redesign)
├── quickstart.md            # Build order + manual smoke checklist (updated 2026-05-06 for VC redesign)
├── contracts/               # Per-component CRD prop contracts
│   ├── compactContributor.ts
│   ├── data-mapper.ts
│   ├── organizationProfile.ts
│   ├── publicProfile.ts
│   └── vcProfile.ts          # Updated 2026-05-06: structured Functionality / AI Engine / Monitoring shapes
├── analysis-interview.md    # Pre-spec interview with the requestor
├── checklists/
│   └── requirements.md      # Spec quality validation checklist (updated 2026-05-06)
└── tasks.md                 # Phase 2 output (/speckit.tasks command — needs regeneration after this plan)
```

### Source Code (repository root)

The source layout below shows ONLY the files this spec adds or modifies. Everything else in the repository is untouched. The seven User Settings tab files owned by sibling spec `097-crd-user-settings` are not listed here.

```text
src/crd/
├── components/
│   ├── common/
│   │   ├── CompactContributorCard.tsx       # NEW (shared: User Orgs sidebar + VC Host)
│   │   ├── MessagePopover.tsx               # NEW (shared: User + Org heroes)
│   │   ├── SocialLinks.tsx                  # NEW (shared: User + Org sidebars only — VC dropped per 2026-05-06)
│   │   └── ReferencesList.tsx               # NEW 2026-06-24 (shared non-social "Links" list: User + Org sidebars; omit-when-empty)
│   ├── user/
│   │   ├── UserPageHero.tsx                 # NEW (renders avatar + name + tagline + location — tagline added 2026-06-24)
│   │   ├── UserResourceTabStrip.tsx         # NEW
│   │   ├── UserResourceSections.tsx         # NEW
│   │   ├── UserProfileSidebar.tsx           # NEW (About + Tagsets + Links + Social + Organizations — Links via ReferencesList, added 2026-06-24)
│   │   └── UserPublicProfileView.tsx        # NEW
│   ├── organization/
│   │   ├── OrganizationPageHero.tsx         # NEW
│   │   ├── OrganizationProfileSidebar.tsx   # NEW (Bio + Tagsets + References + Social + Associates)
│   │   ├── OrganizationResourceTabStrip.tsx # NEW (3-tab strip mirroring User's)
│   │   ├── OrganizationResourceSections.tsx # NEW (Resources Hosted / Lead Spaces / All Memberships)
│   │   └── OrganizationPublicProfileView.tsx # NEW
│   └── virtualContributor/
│       ├── VCPageHero.tsx                   # NEW (avatar + name + type badge + Keywords chip row + Settings)
│       ├── VCProfileSidebar.tsx             # NEW (sticky on lg+; flat References list)
│       ├── VCBodyOfKnowledgeSection.tsx     # NEW (discriminated-union renderer per kind)
│       ├── VCFunctionalityGrid.tsx          # NEW (2026-05-06: Capabilities / Data Access / Role Requirements)
│       ├── VCAiEngineGrid.tsx               # NEW (2026-05-06: 6 transparency cards in 3×2 grid)
│       ├── VCTransparencyCard.tsx           # NEW (2026-05-06: reusable sub-component used by VCAiEngineGrid)
│       ├── VCMonitoringSection.tsx          # NEW (2026-05-06: Separator + heading + Trans paragraph)
│       ├── VCContentView.tsx                # NEW (thin wrapper composing the three section components)
│       └── VCPublicProfileView.tsx          # NEW
├── i18n/
│   └── profilePages/
│       ├── profilePages.en.json             # NEW (~80 keys total; ~30 new under vcProfile.* for the 2026-05-06 redesign)
│       ├── profilePages.nl.json             # NEW
│       ├── profilePages.es.json             # NEW
│       ├── profilePages.bg.json             # NEW
│       ├── profilePages.de.json             # NEW
│       └── profilePages.fr.json             # NEW
└── lib/                                     # (no new files — existing utils sufficient)

src/main/crdPages/topLevelPages/
├── common/
│   └── useSendMessageHandler.ts             # NEW (exports useSendMessageToUserHandler + useSendMessageToOrganizationHandler)
├── userPages/
│   ├── CrdUserRoutes.tsx                    # NEW
│   ├── useCanEditSettings.ts                # NEW (shared with sibling spec 097)
│   ├── useUserPageRouteContext.ts           # NEW (shared with sibling spec 097)
│   └── publicProfile/
│       ├── CrdUserProfilePage.tsx           # NEW
│       ├── publicProfileMapper.ts           # NEW
│       ├── publicProfileMapper.test.ts      # NEW
│       └── useResourceTabs.ts               # NEW
├── organizationPages/
│   ├── CrdOrganizationRoutes.tsx            # NEW
│   └── publicProfile/
│       ├── CrdOrganizationProfilePage.tsx   # NEW
│       ├── organizationProfileMapper.ts     # NEW
│       └── organizationProfileMapper.test.ts # NEW
└── vcPages/
    ├── CrdVCRoutes.tsx                      # NEW (delegates settings/* + knowledge-base/* to existing MUI routes — out of scope)
    └── publicProfile/
        ├── CrdVCProfilePage.tsx             # NEW
        ├── vcProfileMapper.ts               # NEW (re-implements useTemporaryHardCodedVCProfilePageData logic in plain TS — does NOT import MUI hook)
        ├── vcProfileMapper.test.ts          # NEW
        └── useVCBodyOfKnowledge.ts          # NEW (wraps the auxiliary BoK queries)

src/core/i18n/
└── config.ts                                # MODIFIED (register `crd-profilePages` namespace with lazy backend)

src/main/routing/
└── TopLevelRoutes.tsx                       # MODIFIED (3 conditional CRD-vs-MUI blocks — one per actor)

@types/
└── i18next.d.ts                             # MODIFIED (register `crd-profilePages` namespace types)

src/crd/app/
├── CrdApp.tsx                               # MODIFIED (4 new standalone preview routes under /user/me, /user/alex-rivera, /organization/alkemio, /vc/datasynth-bot)
└── data/
    └── profiles.ts                          # NEW (mock data for the 4 standalone preview profiles)

# Files explicitly NOT modified by this spec (parity-with-MUI requirement):
#   src/domain/community/user/userProfilePage/UserProfilePage.tsx              (legacy MUI page)
#   src/domain/community/organization/pages/OrganizationPage.tsx               (legacy MUI page)
#   src/domain/community/virtualContributor/vcProfilePage/VCProfilePage.tsx    (legacy MUI page)
#   src/domain/community/virtualContributor/vcProfilePage/VCProfilePageView.tsx
#   src/domain/community/virtualContributor/vcProfilePage/VCProfileContentView.tsx
#   src/domain/community/virtualContributor/vcProfilePage/useTemporaryHardCodedVCProfilePageData.ts
#   src/domain/community/virtualContributor/vcProfilePage/SettingsMotionModeIcon.tsx
# All seven files continue to render when CRD is OFF; they are deleted in the
# global cleanup pass after the useCrdEnabled toggle is removed (per
# docs/crd/migration-guide.md — "Old MUI Files Stay in the Codebase").
```

**Structure Decision**: Standard CRD migration layout per `docs/crd/migration-guide.md`. Three layers per actor: (1) presentational CRD components in `src/crd/components/<vertical>/`, (2) integration glue (page + mapper + handlers) in `src/main/crdPages/topLevelPages/<vertical>/publicProfile/`, (3) route wiring in `TopLevelRoutes.tsx`. Cross-vertical primitives live in `src/crd/components/common/`; cross-vertical integration helpers live in `src/main/crdPages/topLevelPages/common/`. The 2026-05-06 VC redesign adds three sub-components in `src/crd/components/virtualContributor/` (the right-column section grids); no new top-level structural pattern is introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is intentionally empty.
