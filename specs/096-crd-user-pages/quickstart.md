# Phase 1 — Quickstart: CRD User Profile Page

A pragmatic build order, environment notes, and a smoke checklist for the public-profile-view migration. The seven settings tabs are owned by sibling spec `097-crd-user-settings`; both ship together as one user-vertical release.

---

## Prerequisites

- Node ≥ 22 (Volta-pinned to 24.14.0).
- pnpm ≥ 10.17.1.
- A running Alkemio backend at `localhost:3000` (Traefik). Without it, GraphQL calls will fail; the CRD shell still loads but every section renders an empty / error state.
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

The public profile view ships together with the seven settings tabs (sibling spec 097). The 096 portion below is self-contained — once these pieces land, `/user/<slug>` renders correctly even before 097 is wired (the Settings gear icon will navigate to `/user/<slug>/settings/profile`, which routes to MUI until 097 lands or to the CRD settings shell once 097 lands).

1. **Foundation** (shared with 097)
   - `src/crd/i18n/userPages/userPages.en.json` — add the i18n namespace skeleton with placeholder keys for hero / sidebar / resource tabs.
   - Register `crd-userPages` in `src/core/i18n/config.ts` and `@types/i18next.d.ts`.
   - `src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` and `useCanEditSettings.ts` — the shared route helpers (also consumed by 097's settings shell route guard).
   - `src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` — minimal routing skeleton. The settings subtree (`path="settings/*"`) delegates to `CrdUserAdminRoutes` (097); when 097 has not yet landed, that path resolves to a placeholder that falls back to the existing MUI route.
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdUserRoutes` and the existing `UserRoute`.

2. **Public profile** (User Story 1)
   - `src/crd/components/user/UserPageHero.tsx` (banner / avatar / name / location / Settings icon / Message Popover).
   - `src/crd/components/user/UserPageMessagePopover.tsx`.
   - `src/crd/components/user/UserResourceTabStrip.tsx` (5 tabs, horizontal-scroll on `< md`, auto-scroll active into view).
   - `src/crd/components/user/UserResourceSections.tsx` (filter logic per active tab).
   - `src/crd/components/user/UserProfileSidebar.tsx` (bio + organizations).
   - `src/crd/components/user/UserPublicProfileView.tsx` (composes the above).
   - `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx` + `publicProfileMapper.ts` + `useResourceTabs.ts` + `useSendMessageHandler.ts`.

3. **i18n completeness**
   - Translate every key into `nl / es / bg / de / fr` in the same PR (no Crowdin).
   - Add a small Vitest assertion that every language file has the same key shape.

4. **Smoke + cleanup**
   - Run the smoke checklist below.
   - Run `pnpm lint` + `pnpm vitest run`.
   - Run `pnpm analyze` and verify the user-profile chunk delta is ≤ +20 KB gzipped (SC-005).

---

## Smoke checklist (manual)

For each block below, toggle CRD on, sign in as a regular user, then sign in as a platform admin and re-run the same flows on a non-self profile.

**Public profile** (User Story 1)

- [ ] Open `/user/<self>` — hero, sidebar, sticky resource strip render.
- [ ] Tab through `All Resources / Hosted Spaces / Virtual Contributors / Leading / Member Of`. Each tab filters per data-model.md.
- [ ] Empty Hosted Spaces → section omitted; empty Leading → empty-state message.
- [ ] **No** presence dot anywhere on the hero.
- [ ] On own profile: Settings icon visible; Message button hidden.
- [ ] On someone else's profile (non-admin viewer): Settings icon hidden; Message button visible. Click Message → compose Popover opens; submit fires `useSendMessageToUsersMutation`; on success the Popover closes.
- [ ] On someone else's profile (platform admin viewer): BOTH Settings icon and Message button visible. Click Settings → navigates to `/user/<otherUser>/settings/profile` (route owned by sibling spec 097).
- [ ] Resize to a phone width: resource strip becomes horizontally scrollable; the active tab auto-scrolls into view; nothing wraps to a second line.

**Authorization** (cross-cutting)

- [ ] Sign out. Open `/user/<otherUser>` — redirected to login (NoIdentityRedirect, parity with current MUI; research §1).

**Toggle**

- [ ] With CRD off (`localStorage.removeItem('alkemio-crd-enabled')`): every URL above renders the existing MUI page unchanged.

---

## Useful commands

```bash
# Type-check + lint
pnpm lint

# Run all tests once
pnpm vitest run

# Run a specific test file
pnpm vitest run src/main/crdPages/topLevelPages/userPages/publicProfile/publicProfileMapper.test.ts --reporter=basic

# Bundle analysis
pnpm analyze            # outputs build/stats.html

# i18n key parity check (suggestion — wire in the test referenced in research §5)
pnpm vitest run src/crd/i18n/userPages/__tests__/keyParity.test.ts
```

---

## Done criteria

- The public profile reachable in CRD with parity to MUI for every action listed in the spec's Acceptance Scenarios.
- The public profile reachable in MUI when the toggle is off.
- `pnpm lint` and `pnpm vitest run` clean.
- Bundle delta on the user-profile chunk ≤ +20 KB gzipped.
- All six languages updated.
- Spec's Success Criteria SC-001 through SC-006 verified.
