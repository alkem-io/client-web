# Phase 1 — Quickstart: CRD User Settings

A pragmatic build order, environment notes, and a smoke checklist for verifying the migration end-to-end. The public-profile-view migration lives in sibling spec `096-crd-user-pages`; both ship together as one user-vertical release.

---

## Prerequisites

- Node ≥ 22 (Volta-pinned to 24.14.0).
- pnpm ≥ 10.17.1.
- A running Alkemio backend at `localhost:3000` (Traefik). Without it, GraphQL calls will fail; the CRD shell still loads but every tab renders an empty / error state.
- The current branch is `097-crd-user-settings` (or both 096 + 097 merged into a working branch).
- Sibling spec `096-crd-user-pages` provides the foundational pieces (`CrdUserRoutes.tsx`, `useUserPageRouteContext`, `useCanEditSettings`). When developing 097 standalone, those need to land first or be coordinated via the same feature branch.

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

The seven settings tabs ship together with the public profile view (sibling spec 096), but the build order below minimizes rework — each step lands a usable demo.

1. **Foundation** (shared with 096; if 096 has already landed these in a feature branch, skip)
   - `src/main/crdPages/topLevelPages/userPages/useUserPageRouteContext.ts` and `useCanEditSettings.ts` — the shared route helpers.
   - `src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx` — top-level route shell. Settings subtree delegates to `CrdUserAdminRoutes` (this spec).

2. **Settings shell + i18n setup**
   - `src/crd/i18n/userSettings/userSettings.en.json` — add the i18n namespace skeleton with placeholder keys for every tab's labels.
   - Register `crd-userSettings` in `src/core/i18n/config.ts` and `@types/i18next.d.ts`.
   - `src/crd/components/user/settings/UserSettingsShell.tsx` and `UserSettingsTabStrip.tsx`. The strip uses the same horizontal-scroll responsive behaviour as the resource strip (096) on `< md`.
   - `src/crd/components/user/settings/UserSettingsCard.tsx` (icon + title + body primitive).
   - `src/main/crdPages/topLevelPages/userPages/settings/CrdUserAdminRoutes.tsx` — wire the seven sub-routes; redirect non-`canEditSettings` viewers to `/user/<slug>` (the public profile, owned by 096); redirect `/security` to `/profile` when the viewer is an admin but not the owner.

3. **My Profile** (User Story 1 — the largest tab)
   - `src/crd/components/user/settings/EditableField.tsx` (state machine: idle / editing / pending / idle-saved / editing-error).
   - The five variants: `EditableTextField`, `EditableMarkdownField`, `EditableSelectField`, `EditableTagsField`, `EditableReferenceRow`.
   - `src/crd/components/user/settings/tabs/MyProfileView.tsx` and `MyProfileAvatarColumn.tsx`.
   - Integration: `CrdMyProfilePage.tsx`, `useMyProfileFields.ts`, `useReferenceCrud.ts`, `useTagsetSave.ts`, `useAvatarUpload.ts`, `myProfileMapper.ts`.

4. **Account** (User Story 2 — uses navigation, smallest behavior surface)
   - `src/crd/components/user/settings/tabs/AccountView.tsx` and `AccountResourceCard.tsx`.
   - Integration: `CrdAccountPage.tsx`, `useAccountActions.ts`, `accountMapper.ts`. `useAccountActions` wires Create / Manage / Transfer / Delete kebab actions to navigation against the existing MUI admin routes (research §2).

5. **Membership** (User Story 3)
   - Views: `MembershipView.tsx`, `HomeSpaceCard.tsx`, `MembershipsTable.tsx`, `PendingApplicationsTable.tsx`.
   - Integration: `CrdMembershipPage.tsx`, `useHomeSpace.ts`, `useLeaveMembership.ts` (wraps `useContributionProvider.leaveCommunity`), `membershipMapper.ts`.

6. **Organizations** (User Story 4)
   - Views: `OrganizationsView.tsx`, `OrganizationsTable.tsx`.
   - Integration: `CrdOrganizationsPage.tsx`, `useLeaveOrganization.ts`, `useCreateOrganization.ts`, `organizationsMapper.ts`.

7. **Notifications** (User Story 5)
   - Views: `NotificationsView.tsx`, `NotificationGroupCard.tsx`, `NotificationRow.tsx`, `PushSubscriptionsListCard.tsx`, `PushAvailabilityBanner.tsx`.
   - Integration: `CrdNotificationsPage.tsx`, `useNotificationToggle.ts` (optimistic-overrides dictionary, research §7), `usePushSubscriptionList.ts`, `notificationsMapper.ts`.

8. **Settings** (User Story 6 — small)
   - Views: `SettingsView.tsx`, `DesignSystemSwitchCard.tsx`.
   - Integration: `CrdSettingsPage.tsx`, `useDesignSystemToggle.ts`, `useAllowMessagesToggle.ts`, `settingsMapper.ts`.

9. **Security** (User Story 7 — wraps Kratos)
   - View: `SecurityView.tsx`.
   - Integration: `CrdSecurityPage.tsx`, `useKratosSettingsFlow.ts` (reuses the same Kratos flow hook used by `UserSecuritySettingsPage`).

10. **i18n completeness**
    - Translate every key into `nl / es / bg / de / fr` in the same PR (no Crowdin).
    - Add a small Vitest assertion that every language file has the same key shape.

11. **Smoke + cleanup**
    - Run the smoke checklist below.
    - Run `pnpm lint` + `pnpm vitest run`.
    - Run `pnpm analyze` and verify the user-settings chunk delta is ≤ +25 KB gzipped (SC-006).

---

## Smoke checklist (manual)

For each block below, toggle CRD on, sign in as a regular user, then sign in as a platform admin and re-run the same flows on a non-self profile.

**My Profile** (User Story 1)

- [ ] Hover any editable field — pencil glyph appears trailing the value.
- [ ] Click into First Name, edit, click Save. Field returns to idle with a transient "Saved" indicator. Refresh → new value persists.
- [ ] Edit Tagline, click ×. Field reverts to its prior value. No mutation in the network tab.
- [ ] Edit Bio, click another tab in the strip. Tab switches immediately. No confirmation dialog. Return to My Profile → Bio still shows the last server value.
- [ ] Edit First Name, hold the network panel offline, click Save. Field stays in edit mode with the typed value preserved. Inline error appears beneath the input. Re-enable network, click Save again — succeeds.
- [ ] Add a LinkedIn reference via Add Another Reference; click Save → row becomes saved. Click the trash icon → row disappears immediately, no confirmation.
- [ ] Pick a new avatar via Change Avatar — preview updates immediately.
- [ ] Country dropdown opens; type to search; pick a country; field commits.

**Account** (User Story 2)

- [ ] Four card groups render with the user's hosted spaces / VCs / packs / hubs.
- [ ] Click Create Virtual Contributor — navigates to the existing creation flow. After creation, navigate back to `/user/<self>/settings/account` — the new VC appears in the list.
- [ ] Click any kebab → Manage — navigates to the existing manage flow.
- [ ] Click Delete on a hosted resource → CRD ConfirmationDialog → Confirm → resource is removed from the list (mutation succeeds).

**Membership** (User Story 3)

- [ ] Pick a Home Space from the dropdown — spinner appears briefly; new value persists after reload.
- [ ] Tick Auto-redirect — change persists.
- [ ] Untick Auto-redirect; clear Home Space — Auto-redirect becomes disabled with the explanatory caption.
- [ ] Type "Garden" in the search input — list filters client-side; pagination resets to page 1.
- [ ] Click Leave on a row → CRD ConfirmationDialog → Confirm → row disappears.
- [ ] Cancel the Leave dialog → no mutation fires.
- [ ] Pending Applications table renders below with read-only rows (no kebab).

**Organizations** (User Story 4)

- [ ] Associated organizations render with avatar / name / city / role / verified badge.
- [ ] Search "Alkemio" — list filters client-side.
- [ ] Create Organization button visible only with `CreateOrganization` privilege.
- [ ] Leave on a row → CRD ConfirmationDialog → Confirm → row disappears.

**Notifications** (User Story 5)

- [ ] All visible groups render with one row per property and three switches (`inApp` / `email` / `push`).
- [ ] Flip an email switch — UI updates immediately (optimistic), persists after reload.
- [ ] Flip the push master toggle — browser permission prompt fires.
- [ ] In a private window: master toggle replaced by an info banner; push columns hidden across every group.
- [ ] As a non-admin user: Space Admin / Platform Admin / Organization Notifications cards are hidden.
- [ ] As a platform admin: those cards are visible.

**Settings** (User Story 6)

- [ ] Flip the messages-from-others switch — change persists after reload.
- [ ] Flip the Design System switch off — page reloads in MUI mode (URL stays the same).
- [ ] From the equivalent MUI page, flip Design System on — page reloads in CRD mode.

**Security** (User Story 7)

- [ ] On `/user/<self>/settings/security`: Kratos passkey form renders inside a CRD card shell. Add a passkey via the existing flow.
- [ ] As a platform admin: open `/user/<otherUser>/settings/security` — redirected to `/user/<otherUser>/settings/profile`.
- [ ] When the Kratos flow has no WebAuthn nodes: info banner reads "WebAuthn / Passkey is not enabled on this account".

**Authorization** (cross-cutting)

- [ ] Sign out. Open `/user/<otherUser>/settings/profile` — redirected to login (NoIdentityRedirect, parity with current MUI; research §1).
- [ ] Sign in as a non-admin user; visit `/user/<otherUser>/settings/profile` — redirected to `/user/<otherUser>` (the public profile, owned by sibling spec 096).
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
pnpm vitest run src/main/crdPages/topLevelPages/userPages/settings/myProfile/myProfileMapper.test.ts --reporter=basic

# Bundle analysis
pnpm analyze            # outputs build/stats.html

# i18n key parity check (suggestion — wire in the test referenced in research §13)
pnpm vitest run src/crd/i18n/userSettings/__tests__/keyParity.test.ts
```

---

## Done criteria

- All seven settings tabs reachable in CRD with parity to MUI for every action listed in the spec's Acceptance Scenarios.
- All seven tabs reachable in MUI when the toggle is off.
- `pnpm lint` and `pnpm vitest run` clean.
- Bundle delta on the user-settings chunk ≤ +25 KB gzipped.
- All six languages updated.
- Spec's Success Criteria SC-001 through SC-007 verified.
