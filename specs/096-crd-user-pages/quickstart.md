# Phase 1 — Quickstart: CRD Public Profile Pages (User, Organization, VC)

A pragmatic build order, environment notes, and a smoke checklist for the three public-profile-view migrations covered by this spec. The seven User Settings tabs are owned by sibling spec `097-crd-user-settings`; both specs ship together as one user-vertical release.

---

## Prerequisites

- Node ≥ 22 (Volta-pinned to 24.14.0).
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

3. **User profile** (User Story 1)
   - `src/crd/components/user/UserPageHero.tsx` (banner / avatar / name / location / Settings icon / Message Popover).
   - `src/crd/components/user/UserPageMessagePopover.tsx`.
   - `src/crd/components/user/UserResourceTabStrip.tsx` (5 tabs, horizontal-scroll on `< md`, auto-scroll active into view).
   - `src/crd/components/user/UserResourceSections.tsx` (filter logic per active tab).
   - `src/crd/components/user/UserProfileSidebar.tsx` (bio + organizations).
   - `src/crd/components/user/UserPublicProfileView.tsx` (composes the above).
   - `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx` + `publicProfileMapper.ts` + `useResourceTabs.ts` + `useSendMessageHandler.ts`.

4. **Organization vertical scaffold** (User Story 2 — route shell)
   - `src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx` — minimal routing skeleton for the Organization vertical, mirroring the existing `OrganizationRoute`. Settings subtree (`path="settings/*"`) falls back to the existing MUI admin route — the Org admin shell migration is out of scope for this spec.
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdOrganizationRoutes` and the existing `OrganizationRoute`.

5. **Organization profile** (User Story 2)
   - `src/crd/components/organization/OrganizationPageHero.tsx` (banner / avatar / name / location / Verified badge / Settings icon / Message Popover — reuses the User profile's `UserPageMessagePopover` directly, OR factor a shared `MessagePopover` if visual divergence appears).
   - `src/crd/components/organization/OrganizationProfileSidebar.tsx` (Bio + Tagsets + References + Associates list — Associates renders `CompactContributorCard` instances).
   - `src/crd/components/organization/OrganizationResourceSections.tsx` (Account Resources, Lead Spaces, All Memberships — each as a CRD section card).
   - `src/crd/components/organization/OrganizationPublicProfileView.tsx` (composes the above).
   - `src/main/crdPages/topLevelPages/organizationPages/publicProfile/CrdOrganizationProfilePage.tsx` + `organizationProfileMapper.ts` + reuses the shared `useSendMessageHandler.ts` (with `recipientId: organization.id`).

6. **VC vertical scaffold** (User Story 3 — route shell)
   - `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx` — minimal routing skeleton for the VC vertical, mirroring the existing `VCRoute`. Settings subtree falls back to the existing MUI admin route (out of scope).
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdVCRoutes` and the existing `VCRoute`.

7. **VC profile** (User Story 3)
   - `src/crd/components/virtualContributor/VCPageHero.tsx` (banner / avatar / name / Settings icon — **no Message button**).
   - `src/crd/components/virtualContributor/VCBodyOfKnowledgeSection.tsx` (discriminated-union renderer per `kind`: space / knowledgeBase / external — research §4).
   - `src/crd/components/virtualContributor/VCProfileSidebar.tsx` (Description + Host card via `CompactContributorCard` + non-social References + Body of Knowledge section).
   - `src/crd/components/virtualContributor/VCContentView.tsx` (right column — model card + social references).
   - `src/crd/components/virtualContributor/VCPublicProfileView.tsx` (composes the above).
   - `src/main/crdPages/topLevelPages/vcPages/publicProfile/CrdVCProfilePage.tsx` + `vcProfileMapper.ts` + `useVCBodyOfKnowledge.ts` (wraps the auxiliary BoK queries: `useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery`, `useSpaceBodyOfKnowledgeAboutQuery`, `useKnowledgeBase`).

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

**Organization profile** (User Story 2)

- [ ] Open `/organization/<some-org>` — hero (banner + avatar + name + location + Verified badge if applicable), sidebar (Bio + Tagsets + References + Associates), and right column (Account Resources + Lead Spaces + All Memberships) render.
- [ ] Verified org → green Verified badge in hero. Unverified org → no badge.
- [ ] Org with no account resources → Account Resources section is omitted.
- [ ] Org with no Lead Spaces → Lead Spaces section is omitted.
- [ ] Org with no memberships → All Memberships section renders with the empty-state caption "No memberships yet".
- [ ] Viewer lacks `canReadUsers` (e.g., signed in as a non-admin against a private org membership) → Associates section is hidden.
- [ ] Anonymous viewer → Message button is hidden; Settings icon hidden.
- [ ] Signed-in non-admin viewer → Message button visible; click it → compose Popover opens; submit fires the send-message mutation against the org as recipient.
- [ ] Org admin viewer → Settings icon visible; click → navigates to `/organization/<slug>/settings/...` (existing MUI admin shell — confirm the URL resolves and the MUI page renders).

**VC profile** (User Story 3)

- [ ] Open `/vc/<some-vc>` — hero (banner + avatar + name, **NO Message button**), sidebar (Description + Host card + non-social References + BoK section), right-column content view (model card + social links) render.
- [ ] VC with `AlkemioSpace` BoK → BoK section shows the SpaceCardHorizontal-equivalent linking to the backing space; "Visit" interaction takes the viewer to the space.
- [ ] VC with `AlkemioSpace` BoK + viewer lacks `ReadAbout` on the backing space → "Private space" placeholder.
- [ ] VC with `AlkemioKnowledgeBase` BoK → description + Visit button. Click Visit → navigates to `${vc.profile.url}/${KNOWLEDGE_BASE_PATH}`.
- [ ] VC with `AlkemioKnowledgeBase` BoK + viewer lacks `hasReadAccess` → Visit button is disabled with tooltip "Body of knowledge is private".
- [ ] VC with `External` BoK → engine-type description renders ("Assistant" or "External" copy).
- [ ] VC owner viewer → Settings icon visible; click → navigates to `/vc/<slug>/settings/...` (existing MUI admin shell).
- [ ] Visit an invalid VC URL → `Error404` renders inside the CRD layout.
- [ ] Viewer lacks `Read` privilege on the VC → existing `useRestrictedRedirect` redirects.

**Authorization** (cross-cutting)

- [ ] Sign out. Open `/user/<otherUser>` — redirected to login (NoIdentityRedirect, parity with current MUI; research §1).
- [ ] Sign out. Open `/organization/<some-org>` — page loads (Org route does not require auth; parity).
- [ ] Sign out. Open `/vc/<some-vc>` — page loads if VC has public Read; otherwise redirected per `useRestrictedRedirect`.

**Toggle**

- [ ] With CRD off (`localStorage.removeItem('alkemio-crd-enabled')`): every URL above renders the existing MUI page unchanged for all three actor types.

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
