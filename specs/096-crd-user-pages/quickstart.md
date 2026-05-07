# Phase 1 — Quickstart: CRD Public Profile Pages (User, Organization, VC)

A pragmatic build order, environment notes, and a smoke checklist for the three public-profile-view migrations covered by this spec. The seven User Settings tabs are owned by sibling spec `097-crd-user-settings`; both specs ship together as one user-vertical release.

---

## Prerequisites

- Node ≥ 24.0.0 (Volta-pinned to 24.14.0).
- pnpm ≥ 10.17.1.
- A running Alkemio backend at `localhost:3000` (Traefik). Without it, GraphQL calls will fail; the CRD shells still load but every section renders an empty / error state.
- The current branch is `096-crd-user-pages` (or both 096 + 097 merged into a working branch).

```bash
pnpm install
pnpm start              # http://localhost:3001
```

Once the dev server is up, enable CRD in the browser console:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To toggle off:

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

---

## Build order

The three public profile pages ship together with the seven User Settings tabs (sibling spec 097). The build order below minimizes rework — each step lands a usable demo.

1. **Foundation (User vertical, shared with 097)**
   - `src/crd/i18n/profilePages/profilePages.en.json` — add the i18n namespace skeleton with placeholder keys for all three actor pages (hero / sidebar / sections).
   - Register `crd-profilePages` in `src/core/i18n/config.ts` and `@types/i18next.d.ts`.
   - `src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` and `useCanEditSettings.ts` — the User-vertical shared route helpers (also consumed by 097's settings shell route guard).
   - `src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` — minimal routing skeleton for the User vertical. The settings subtree (`path="settings/*"`) delegates to `CrdUserAdminRoutes` (097); when 097 has not yet landed, that path resolves to a placeholder that falls back to the existing MUI route.
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdUserRoutes` and the existing `UserRoute`.

2. **New shared CRD primitive (cross-vertical)**
   - `src/crd/components/common/CompactContributorCard.tsx` — used by both the Org profile (Associates list) and the VC profile (Host card). Per the `compactContributor.ts` contract.

3. **User profile** (User Story 1) — **prototype-driven redesign per `prototype/src/app/pages/UserProfilePage.tsx`** (NOT a parity restyle of current MUI).
   - `src/crd/components/common/MessagePopover.tsx` — shared recipient-agnostic compose surface (Q2 — placed in `common/` from day one; consumed by both User and Organization heroes).
   - `src/main/crdPages/topLevelPages/common/useSendMessageHandler.ts` — shared cross-vertical integration helper (placed under `topLevelPages/common/` for symmetry with `MessagePopover`).
   - `src/crd/components/user/UserPageHero.tsx` (avatar / name / location / Settings icon / Message Popover — consumes the shared `MessagePopover` from `common/`).
   - `src/crd/components/user/UserResourceTabStrip.tsx` (5 tabs, horizontal-scroll on `< md`, auto-scroll active into view).
   - `src/crd/components/user/UserResourceSections.tsx` (filter logic per active tab; renders all items per prototype, no pagination).
   - `src/crd/components/user/UserProfileSidebar.tsx` (bio + organizations; layout `lg:col-span-3 lg:sticky lg:top-24` per FR-040 / FR-044, stacked above main column on smaller viewports — sidebar is **not** hidden).
   - `src/crd/components/user/UserPublicProfileView.tsx` (composes the above: outer `grid grid-cols-1 lg:grid-cols-12 gap-6`, sidebar `lg:col-span-3`, right column `lg:col-span-9`, hero schema per FR-041 — avatar `w-28 h-28 md:w-32 md:h-32`, padding `pt-8 pb-6`, name `text-profile-title`).
   - `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx` + `publicProfileMapper.ts` + `useResourceTabs.ts`.

4. **Organization vertical scaffold** (User Story 2 — route shell)
   - `src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` — minimal routing skeleton for the Organization vertical, mirroring the existing `OrganizationRoute`. Settings subtree (`path="settings/*"`) falls back to the existing MUI admin route — the Org admin shell migration is out of scope for this spec.
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdOrganizationRoutes` and the existing `OrganizationRoute`.

5. **Organization profile** (User Story 2) — **parity restyle of current MUI** (`OrganizationPageView` + `AssociatesView`); no prototype.
   - `src/crd/components/organization/OrganizationPageHero.tsx` (avatar / name / location / Verified badge / Settings icon / Message Popover — consumes the shared `MessagePopover` from `src/crd/components/common/`, same primitive the User hero uses; no cross-vertical import per Q2).
   - `src/crd/components/organization/OrganizationProfileSidebar.tsx` (Bio + Tagsets + References + Associates — Associates is a parity port of MUI `AssociatesView`: square avatar grid capped at 12 with "Show more / Show less" toggle; sign-in CTA when `canReadUsers === false`. Does NOT consume `CompactContributorCard`).
   - `src/crd/components/organization/OrganizationResourceSections.tsx` (Account Resources with `VISIBLE_SPACE_LIMIT = 6` + "Show all" parity, Lead Spaces, All Memberships — each as a CRD section card).
   - `src/crd/components/organization/OrganizationPublicProfileView.tsx` (composes the above).
   - `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx` + `organizationProfileMapper.ts` + reuses `useSendMessageHandler` from `src/main/crdPages/topLevelPages/common/` (with `recipientId: organization.id`).

6. **VC vertical scaffold** (User Story 3 — route shell)
   - `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx` — minimal routing skeleton for the VC vertical, mirroring the existing `src/domain/community/virtualContributor/VCRoute.tsx`. Settings subtree (`path="settings/*"`) falls back to the existing MUI `<VCSettingsRoute />` (out of scope). **`${KNOWLEDGE_BASE_PATH}/*` subtree delegates to the existing MUI `<VCKnowledgeBaseRoute />`** so `/vc/:slug/knowledge-base/*` keeps working when CRD is on (out of scope; future spec).
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdVCRoutes` and the existing `VCRoute`.

7. **VC profile** (User Story 3) — **prototype-driven redesign per `prototype/src/app/pages/VCProfilePage.tsx`** (2026-05-06; research §15). Sidebar largely parity-restyle of MUI; hero gains a "Virtual Contributor" type badge + Keywords skill-tag chip row; right column rebuilt into three card-grid sections (Functionality / AI Engine / Monitoring).
   - `src/crd/components/virtualContributor/VCPageHero.tsx` (avatar / name / **type badge** / **Keywords chip row** / Settings icon — **no banner image, no Message button**).
   - `src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx` (discriminated-union renderer per `kind`: space / knowledgeBase / external — research §4; unchanged by 2026-05-06 redesign).
   - `src/crd/components/virtualContributor/VCProfileSidebar.tsx` (Description + Host card via `CompactContributorCard` + flat References list of ALL refs + Body of Knowledge section; sticky on `lg+`).
   - **3 new presentational components for the right column** (research §15):
     - `src/crd/components/virtualContributor/VCFunctionalityGrid.tsx` — 3-column responsive `Card` grid for Capabilities / Data Access / Role Requirements. Renders `Check` / `Minus` glyphs based on the `enabled` flag of each `BulletItem`. Role Requirements `memberRequired` variant uses `<Trans>` with `<strong>` component (no `dangerouslySetInnerHTML`).
     - `src/crd/components/virtualContributor/VCAiEngineGrid.tsx` — 3×2 responsive grid wrapping a small reusable `VCTransparencyCard` sub-component. Each card supports either Yes/No, plain text, or action (link button / "Not available" caption) answer types.
     - `src/crd/components/virtualContributor/VCMonitoringSection.tsx` — `Separator` + heading + `<Trans>`-rendered paragraph with embedded `<a>` linking to `https://welcome.alkem.io/legal/#tc`.
   - `src/crd/components/virtualContributor/VCContentView.tsx` — thin composition wrapper over the three section components above.
   - `src/crd/components/virtualContributor/VCPublicProfileView.tsx` (composes the hero + sidebar + right column).
   - `src/main/crdPages/topLevelPages/vcPages/publicProfile/CrdVCProfilePage.tsx` + `vcProfileMapper.ts` + `useVCBodyOfKnowledge.ts` (wraps the auxiliary BoK queries: `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery`, `useSpaceBodyOfKnowledgeAboutQuery`, `useKnowledgeBase`).
   - `vcProfileMapper.ts` re-implements the data-extraction logic of the existing MUI hook `useTemporaryHardCodedVCProfilePageData(modelCard)` in plain TypeScript (mapping `modelCard.spaceUsage[]` entries to bullet rows, `modelCard.aiEngine.*` to transparency-card answers, deriving the engine display name from `aiPersona.engine`). The MUI hook itself is **NOT modified or imported** — it continues to power the legacy MUI page when CRD is OFF. All hard-coded English copy moves to the `crd-profilePages:vcProfile.*` i18n keys.
   - The mapper inlines a local `EMPTY_MODEL_CARD_FALLBACK` constant (mirrors `EMPTY_MODEL_CARD` from `src/domain/community/virtualContributor/model/VirtualContributorModelCardModel.ts`, but locally duplicated to comply with the CRD layer's no-domain-imports rule) so VCs with no model card data still render every section with safe defaults.

8. **i18n completeness**
   - Translate every key into `nl / es / bg / de / fr` in the same PR (no Crowdin).
   - Add a small Vitest assertion that every language file has the same key shape.

9. **Smoke + cleanup**
   - Run the smoke checklist below for all three pages.
   - Run `pnpm lint` + `pnpm vitest run`.
   - Run `pnpm analyze` and verify the combined user-profile + organization-profile + vc-profile chunk delta is ≤ +35 KB gzipped (SC-005).

---

## Smoke checklist (manual)

For each block below, toggle CRD on, sign in as a regular user, then sign in as a platform admin and re-run the same flows on a non-self profile.

**User profile** (User Story 1)

- [ ] Open `/user/<self>` — hero, sidebar, sticky resource strip render.
- [ ] Tab through `All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of`. Each tab filters per data-model.md.
- [ ] Empty Hosted Spaces → section omitted; empty Leading → empty-state message.
- [ ] **No** presence dot anywhere on the hero.
- [ ] On own profile: Settings icon visible; Message button hidden.
- [ ] On someone else's profile (non-admin viewer): Settings icon hidden; Message button visible. Click Message → compose Popover opens; submit fires `useSendMessageToUsersMutation`; on success the Popover closes.
- [ ] On someone else's profile (platform admin viewer): BOTH Settings icon and Message button visible. Click Settings → navigates to `/user/<otherUser>/settings/profile` (route owned by sibling spec 097).
- [ ] Resize to a phone width: resource strip becomes horizontally scrollable; the active tab auto-scrolls into view; nothing wraps to a second line.
- [ ] Resize to a phone width: sidebar **stacks above** the right column (single-column); sidebar is **not** hidden.
- [ ] User who hosts at least one innovation pack or innovation hub in MUI: confirm those resources are **NOT** rendered on the CRD User profile (per prototype — see Out of Scope). Only hosted spaces and hosted virtual contributors should appear.
- [ ] User with 50+ hosted spaces: every hosted space renders (no "Show all" affordance — per prototype). Compare with MUI on the same user, where hosted spaces would be capped at 6.

**Organization profile** (User Story 2)

- [ ] Open `/organization/<some-org>` — hero (avatar + name + location + Verified badge if applicable), sidebar (Bio + Tagsets + References + Associates), and right column (Account Resources + Lead Spaces + All Memberships) render.
- [ ] Verified org → green Verified badge in hero. Unverified org → no badge.
- [ ] Org with no account resources → Account Resources section is omitted.
- [ ] Org with no Lead Spaces → Lead Spaces section is omitted.
- [ ] Org with no memberships → All Memberships section renders with the empty-state caption "No memberships yet".
- [ ] Org with 7+ hosted spaces → Account Resources hosted-spaces sub-list shows the first 6 with a "Show all" button; clicking expands to the full list (parity with MUI `AccountResourcesView`).
- [ ] Org with 13+ associates → Associates sidebar shows the first 12 with a "Show more (N)" link; clicking expands; "Show less" collapses (parity with MUI `AssociatesView`).
- [ ] Viewer lacks `canReadUsers` → Associates section header is **still visible**; section body shows the existing sign-in CTA copy (`associates-view.sign-in`) instead of the avatar grid (parity — section is **not** hidden).
- [ ] Anonymous viewer → Message button is hidden; Settings icon hidden.
- [ ] Signed-in non-admin viewer → Message button visible; click it → compose Popover opens; submit fires the send-message mutation against the org as recipient.
- [ ] Org admin viewer → Settings icon visible; click → navigates to `/organization/<slug>/settings/...` (existing MUI admin shell — confirm the URL resolves and the MUI page renders).

**VC profile** (User Story 3)

- [ ] Open `/vc/<some-vc>` — hero (avatar + name + "Virtual Contributor" type badge + Keywords chip row + Settings icon when permitted, **NO banner, NO Message button**), sidebar (Description + Host card + flat References list + BoK section, sticky on `lg+`), right-column content view (Functionality + AI Engine + Monitoring sections) render.
- [ ] VC with at least one tag in its reserved `Keywords` tagset → chip row renders one outlined `Badge` per tag in tagset order.
- [ ] VC with no Keywords tagset → chip row is omitted entirely (no header, no empty caption).
- [ ] **Functionality section**: a 3-column grid renders three cards. Capabilities and Data Access cards each show three bullet rows with `Check` (foreground) or `Minus` (muted) glyphs based on the model card's flag enabled state. Role Requirements card shows the `memberRequired` text with a real `<strong>` tag (no escaped HTML, no raw asterisks) when `SpaceRoleMember.enabled === true`; otherwise shows "No special member rights required".
- [ ] **AI Engine section**: heading reads "AI Engine: Alkemio AI" / "AI Engine: External AI Assistant" / "AI Engine: External AI" depending on `aiEngine.isExternal` + `isAssistant`. Six transparency cards render in a 3×2 grid in fixed prototype order: Open Model Transparency, Data Usage Disclosure, Knowledge Restriction, Web Access, Physical Location, Technical References.
- [ ] AI Engine: Web Access card with `canAccessWebWhenAnswering === false` → renders "No" with the `Clock` glyph (NOT the default `XCircle`).
- [ ] AI Engine: Data Usage Disclosure card with `isInteractionDataUsedForTraining === null` → renders "Unknown" with the warning glyph.
- [ ] AI Engine: Technical References card with non-empty `additionalTechnicalDetails` URL → renders the SEE DOCUMENTATION outlined Button; clicking opens the URL in a new tab. With empty URL → renders italic muted "Not available" caption (the card itself is NOT hidden).
- [ ] **Monitoring section**: separator + heading + paragraph render. Click the "Terms & Conditions" link → opens `https://welcome.alkem.io/legal/#tc` in a new tab. The link is rendered via `<Trans>` (no `dangerouslySetInnerHTML` — verify with browser devtools that the DOM contains a real `<a>` element).
- [ ] **Empty model card fallback**: a VC where the GraphQL query returns no `modelCard` data → all three right-column sections still render with safe defaults (Capabilities/DataAccess with `Minus` glyphs and muted text; AI Engine with "No"/"Unknown"/"Not available" answers; Monitoring unchanged). The page maintains a stable visual rhythm.
- [ ] VC with `AlkemioSpace` BoK → sidebar BoK section shows the SpaceCardHorizontal-equivalent linking to the backing space; "Visit" interaction takes the viewer to the space.
- [ ] VC with `AlkemioSpace` BoK + viewer lacks `ReadAbout` on the backing space → "Private space" placeholder.
- [ ] VC with `AlkemioKnowledgeBase` BoK → description + Visit button. Click Visit → navigates to `${vc.profile.url}/${KNOWLEDGE_BASE_PATH}`.
- [ ] VC with `AlkemioKnowledgeBase` BoK + viewer lacks `hasReadAccess` → Visit button is disabled with tooltip "Body of knowledge is private".
- [ ] VC with `External` BoK → engine-type description renders ("Assistant" or "External" copy).
- [ ] VC with both LinkedIn and a docs URL in `vc.profile.references[]` → BOTH render as flat URL chips in the sidebar's References block (deliberate divergence from current MUI which silently hides social refs — verify by toggling CRD off; MUI sidebar shows only the docs URL).
- [ ] VC owner viewer → Settings icon visible; click → navigates to `/vc/<slug>/settings/...` (existing MUI admin shell).
- [ ] Visit an invalid VC URL → `Error404` renders inside the CRD layout.
- [ ] Viewer lacks `Read` privilege on the VC → existing `useRestrictedRedirect` redirects.
- [ ] Visit `/vc/<some-vc>/knowledge-base/...` with CRD on → existing MUI `VCKnowledgeBaseRoute` renders (delegated by `CrdVCRoutes`; out of CRD scope, but the URL must keep working).
- [ ] VC with `AlkemioKnowledgeBase` BoK whose `knowledgeBaseDescription` is empty → BoK description shows the placeholder copy from `virtualContributorSpaceSettings.placeholder` (parity with MUI fallback `knowledgeBaseDescription || t(...)`).
- [ ] **MUI parity check**: toggle CRD off and visit the same `/vc/<some-vc>` URL → existing MUI page renders unchanged with its current three hard-coded `PageContentBlock`s (Functionality / AI Engine / Monitoring with `dangerouslySetInnerHTML` calls). The MUI source files including `useTemporaryHardCodedVCProfilePageData.ts` are NOT modified by this migration.

**Authorization** (cross-cutting)

- [ ] Sign out. Open `/user/<otherUser>` — redirected to login (NoIdentityRedirect, parity with current MUI; research §1).
- [ ] Sign out. Open `/organization/<some-org>` — page loads (Org route does not require auth; parity).
- [ ] Sign out. Open `/vc/<some-vc>` — page loads if VC has public Read; otherwise redirected per `useRestrictedRedirect`.

**Toggle**

- [ ] With CRD off (`localStorage.removeItem('alkemio-crd-enabled')`): every URL above renders the existing MUI page unchanged for all three actor types.

---

## Standalone preview demo pages (no backend required)

For design-iteration without the full Alkemio backend, the standalone CRD preview app surfaces all four profile compositions with plain mock data:

```bash
pnpm crd:dev    # http://localhost:5200
```

Routes:

| URL | What it shows |
|---|---|
| `/user/me` | Self-view: Settings icon visible, Message button hidden. |
| `/user/alex-rivera` | Other-user view (mock data from the prototype): Message button visible, Settings hidden. Pressing Send waits 500 ms before resolving — exercises the `aria-busy` state. |
| `/organization/alkemio` | Org profile: Verified badge, Message popover, 14 associates (exercises 12-cap "Show more / less"), 4 spaces + 2 innovation packs + 1 hub (exercises Account Resources 6-cap "Show all"). |
| `/vc/datasynth-bot` | VC profile: hero with "Virtual Contributor" type badge + Keywords chips, NO Message button, sidebar with Body-of-Knowledge in the `space` variant, redesigned right column with Functionality / AI Engine / Monitoring card-grid sections. |

All four pages are wired in `src/crd/app/CrdApp.tsx` with mock data from `src/crd/app/data/profiles.ts`. No Apollo, no GraphQL, no backend.

---

## Useful commands

```bash
# Type-check + lint
pnpm lint

# Run all tests once
pnpm vitest run

# Run a specific test file
pnpm vitest run src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.test.ts --reporter=basic
pnpm vitest run src/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper.test.ts --reporter=basic
pnpm vitest run src/main/crdPages/topLevelPages/vcPages/publicProfile/vcProfileMapper.test.ts --reporter=basic

# Bundle analysis
pnpm analyze            # outputs build/stats.html

# Standalone preview app — design iteration on profile pages with mock data
pnpm crd:dev            # http://localhost:5200 (see "Standalone preview" section above)

# i18n key parity check (suggestion — wire in the test referenced in research §9)
pnpm vitest run src/crd/i18n/profilePages/__tests__/keyParity.test.ts
```

---

## Done criteria

- All three public profile pages reachable in CRD with parity to MUI for every action listed in the spec's Acceptance Scenarios (User Story 1, 2, 3).
- All three public profile pages reachable in MUI when the toggle is off.
- `pnpm lint` and `pnpm vitest run` clean.
- Combined bundle delta on the user-profile + organization-profile + vc-profile chunks ≤ +35 KB gzipped.
- All six languages updated.
- Spec's Success Criteria SC-001 through SC-007 verified.
