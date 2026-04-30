# Phase 1 — Quickstart: CRD User Pages

A pragmatic build order, environment notes, and a smoke checklist for verifying the migration end-to-end.

---

## Prerequisites

- Node ≥ 22 (Volta-pinned to 24.14.0).
- pnpm ≥ 10.17.1.
- A running Alkemio backend at `localhost:3000` (Traefik). Without it, GraphQL calls will fail; the CRD shell still loads but every tab renders an empty / error state.
- The current branch is `096-crd-user-pages`.

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

The eight pages ship together, but the build order below minimizes rework — each step lands a usable demo.

1. **Foundation**
   - `src/crd/i18n/userPages/userPages.en.json` — add the i18n namespace skeleton with placeholder keys for every label.
   - Register `crd-userPages` in `src/core/i18n/config.ts` and `@types/i18next.d.ts`.
   - `src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` and `useCanEditSettings.ts` — the shared route helpers.
   - `src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` and `CrdUserAdminRoutes.tsx` — minimal routing skeleton that currently renders `null` per route.
   - Wire `TopLevelRoutes.tsx` to dispatch on `useCrdEnabled()` between `CrdUserRoutes` and the existing `UserRoute`.

2. **Public profile** (User Story 1)
   - `src/crd/components/user/UserPageHero.tsx` (banner / avatar / name / location / Settings icon / Message Popover).
   - `src/crd/components/user/UserResourceTabStrip.tsx` (5 tabs, horizontal-scroll on `< md`, auto-scroll active into view).
   - `src/crd/components/user/UserResourceSections.tsx` (filter logic per active tab).
   - `src/crd/components/user/UserProfileSidebar.tsx` (bio + organizations).
   - `src/crd/components/user/UserPublicProfileView.tsx` (composes the four above).
   - `src/main/crdPages/topLevelPages/userPages/publicProfile/CrdUserProfilePage.tsx` + `publicProfileMapper.ts` + `useResourceTabs.ts` + `useSendMessageHandler.ts`.

3. **Settings shell** (User Stories 2–8)
   - `src/crd/components/user/settings/UserSettingsShell.tsx` and `UserSettingsTabStrip.tsx`. The strip uses the same horizontal-scroll responsive behaviour as the resource strip on `< md`.
   - `src/crd/components/user/settings/UserSettingsCard.tsx` (icon + title + body primitive).
   - `src/main/crdPages/topLevelPages/userPages/CrdUserAdminRoutes.tsx` — wire the seven sub-routes; redirect non-`canEditSettings` viewers to `/user/<slug>`; redirect `/security` to `/profile` when the viewer is an admin but not the owner.

4. **My Profile** (User Story 2 — the largest tab)
   - `src/crd/components/user/settings/EditableField.tsx` (state machine: idle / editing / pending / idle-saved / editing-error).
   - The five variants: `EditableTextField`, `EditableMarkdownField`, `EditableSelectField`, `EditableTagsField`, `EditableReferenceRow`.
   - `src/crd/components/user/settings/tabs/MyProfileView.tsx` and `MyProfileAvatarColumn.tsx`.
   - Integration: `CrdMyProfilePage.tsx`, `useMyProfileFields.ts`, `useReferenceCrud.ts`, `useTagsetSave.ts`, `useAvatarUpload.ts`, `myProfileMapper.ts`.

5. **Account** (User Story 3 — uses navigation, smallest behavior surface)
   - `src/crd/components/user/settings/tabs/AccountView.tsx` and `AccountResourceCard.tsx`.
   - Integration: `CrdAccountPage.tsx`, `useAccountActions.ts`, `accountMapper.ts`. `useAccountActions` wires Create / Manage / Transfer / Delete kebab actions to navigation against the existing MUI admin routes (research §3).

6. **Membership** (User Story 4)
   - Views: `MembershipView.tsx`, `HomeSpaceCard.tsx`, `MembershipsTable.tsx`, `PendingApplicationsTable.tsx`.
   - Integration: `CrdMembershipPage.tsx`, `useHomeSpace.ts`, `useLeaveMembership.ts` (wraps `useContributionProvider.leaveCommunity`), `membershipMapper.ts`.

7. **Organizations** (User Story 5)
   - Views: `OrganizationsView.tsx`, `OrganizationsTable.tsx`.
   - Integration: `CrdOrganizationsPage.tsx`, `useLeaveOrganization.ts`, `useCreateOrganization.ts`, `organizationsMapper.ts`.

8. **Notifications** (User Story 6)
   - Views: `NotificationsView.tsx`, `NotificationGroupCard.tsx`, `NotificationRow.tsx`, `PushSubscriptionsListCard.tsx`, `PushAvailabilityBanner.tsx`.
   - Integration: `CrdNotificationsPage.tsx`, `useNotificationToggle.ts` (optimistic-overrides dictionary, research §8), `usePushSubscriptionList.ts`, `notificationsMapper.ts`.

9. **Settings** (User Story 7 — small)
   - Views: `SettingsView.tsx`, `DesignSystemSwitchCard.tsx`.
   - Integration: `CrdSettingsPage.tsx`, `useDesignSystemToggle.ts`, `useAllowMessagesToggle.ts`, `settingsMapper.ts`.

10. **Security** (User Story 8 — wraps Kratos)
    - View: `SecurityView.tsx`.
    - Integration: `CrdSecurityPage.tsx`, `useKratosSettingsFlow.ts` (reuses the same Kratos flow hook used by `UserSecuritySettingsPage`).

11. **i18n completeness**
    - Translate every key into `nl / es / bg / de / fr` in the same PR (no Crowdin).
    - Add a small Vitest assertion that every language file has the same key shape.

12. **Smoke + cleanup**
    - Run the smoke checklist below.
    - Run `pnpm lint` + `pnpm vitest run`.
    - Run `pnpm analyze` and verify the user-pages chunk delta is ≤ +30 KB gzipped (SC-006).

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
- [ ] On someone else's profile (platform admin viewer): BOTH Settings icon and Message button visible. Click Settings → navigates to `/user/<otherUser>/settings/profile`.
- [ ] Resize to a phone width: resource strip becomes horizontally scrollable; the active tab auto-scrolls into view; nothing wraps to a second line.

**My Profile** (User Story 2)

- [ ] Hover any editable field — pencil glyph appears trailing the value.
- [ ] Click into First Name, edit, click Save. Field returns to idle with a transient "Saved" indicator. Refresh → new value persists.
- [ ] Edit Tagline, click ×. Field reverts to its prior value. No mutation in the network tab.
- [ ] Edit Bio, click another tab in the strip. Tab switches immediately. No confirmation dialog. Return to My Profile → Bio still shows the last server value.
- [ ] Edit First Name, hold the network panel offline, click Save. Field stays in edit mode with the typed value preserved. Inline error appears beneath the input. Re-enable network, click Save again — succeeds.
- [ ] Add a LinkedIn reference via Add Another Reference; click Save → row becomes saved. Click the trash icon → row disappears immediately, no confirmation.
- [ ] Pick a new avatar via Change Avatar — preview updates immediately.
- [ ] Country dropdown opens; type to search; pick a country; field commits.

**Account** (User Story 3)

- [ ] Four card groups render with the user's hosted spaces / VCs / packs / hubs.
- [ ] Click Create Virtual Contributor — navigates to the existing creation flow. After creation, navigate back to `/user/<self>/settings/account` — the new VC appears in the list.
- [ ] Click any kebab → Manage — navigates to the existing manage flow.
- [ ] Click Delete on a hosted resource → CRD ConfirmationDialog → Confirm → resource is removed from the list (mutation succeeds).

**Membership** (User Story 4)

- [ ] Pick a Home Space from the dropdown — spinner appears briefly; new value persists after reload.
- [ ] Tick Auto-redirect — change persists.
- [ ] Untick Auto-redirect; clear Home Space — Auto-redirect becomes disabled with the explanatory caption.
- [ ] Type "Garden" in the search input — list filters client-side; pagination resets to page 1.
- [ ] Click Leave on a row → CRD ConfirmationDialog → Confirm → row disappears.
- [ ] Cancel the Leave dialog → no mutation fires.
- [ ] Pending Applications table renders below with read-only rows (no kebab).

**Organizations** (User Story 5)

- [ ] Associated organizations render with avatar / name / city / role / verified badge.
- [ ] Search "Alkemio" — list filters client-side.
- [ ] Create Organization button visible only with `CreateOrganization` privilege.
- [ ] Leave on a row → CRD ConfirmationDialog → Confirm → row disappears.

**Notifications** (User Story 6)

- [ ] All visible groups render with one row per property and three switches (`inApp` / `email` / `push`).
- [ ] Flip an email switch — UI updates immediately (optimistic), persists after reload.
- [ ] Flip the push master toggle — browser permission prompt fires.
- [ ] In a private window: master toggle replaced by an info banner; push columns hidden across every group.
- [ ] As a non-admin user: Space Admin / Platform Admin / Organization Notifications cards are hidden.
- [ ] As a platform admin: those cards are visible.

**Settings** (User Story 7)

- [ ] Flip the messages-from-others switch — change persists after reload.
- [ ] Flip the Design System switch off — page reloads in MUI mode (URL stays the same).
- [ ] From the equivalent MUI page, flip Design System on — page reloads in CRD mode.

**Security** (User Story 8)

- [ ] On `/user/<self>/settings/security`: Kratos passkey form renders inside a CRD card shell. Add a passkey via the existing flow.
- [ ] As a platform admin: open `/user/<otherUser>/settings/security` — redirected to `/user/<otherUser>/settings/profile`.
- [ ] When the Kratos flow has no WebAuthn nodes: info banner reads "WebAuthn / Passkey is not enabled on this account".

**Authorization** (cross-cutting)

- [ ] Sign out. Open `/user/<otherUser>` — redirected to login (NoIdentityRedirect, parity with current MUI; research §1).
- [ ] Sign in as a non-admin user; visit `/user/<otherUser>/settings/profile` — redirected to `/user/<otherUser>` (the public profile).
- [ ] Sign in as a non-admin user; visit `/user/<otherUser>/settings/notifications` — redirected to `/user/<otherUser>`.

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

# i18n key parity check (suggestion — wire in the test referenced in research §14)
pnpm vitest run src/crd/i18n/userPages/__tests__/keyParity.test.ts
```

---

## Done criteria

- All eight pages reachable in CRD with parity to MUI for every action listed in the spec's Acceptance Scenarios.
- All eight pages reachable in MUI when the toggle is off.
- `pnpm lint` and `pnpm vitest run` clean.
- Bundle delta on the user-pages chunk ≤ +30 KB gzipped.
- All six languages updated.
- Spec's Success Criteria SC-001 through SC-008 verified.
