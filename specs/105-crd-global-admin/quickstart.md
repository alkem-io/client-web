# Quickstart: Building & Verifying the CRD Global Admin

This guide shows how to stand up the shell and migrate one section end-to-end. Every other section follows the same recipe.

## Prerequisites

- Backend running at `localhost:3000`; dev server `pnpm start` (`localhost:3001`).
- Seed the CRD design version in the browser console:
  ```js
  localStorage.setItem('alkemio-design-version', '2');
  location.reload();
  ```
- Sign in as a platform admin (holds `AuthorizationPrivilege.PlatformAdmin`).

## Step 1 — Shell & wiring (US1, do this first)

1. **i18n namespace**: create `src/crd/i18n/admin/admin.en.json` (+ `nl/es/bg/de/fr`). Register `'crd-admin'` in `src/core/i18n/config.ts` (`crdNamespaceImports`) and in `@types/i18next.d.ts`. Apply the do-not-translate glossary for `nl`.
2. **Section descriptors**: `src/main/crdPages/topLevelPages/admin/adminSections.ts` — the CRD twin of MUI `adminTabs` (same order/paths), with `lucide-react` icons.
3. **Shell**: `src/crd/components/admin/AdminShell.tsx` — page title + `SettingsTabStrip` (reused) + body slot. Pure, props per `contracts/admin-shell.contract.ts`.
4. **Access guard**: `src/main/crdPages/topLevelPages/admin/useAdminAccessGuard.ts` — reuse `usePlatformLevelAuthorizationQuery` + `PlatformAdmin`; deny → `/restricted` (parity with `NonPlatformAdminRedirect`).
5. **Routes**: `CrdAdminRoutes.tsx` + `CrdAdminShellPage.tsx` (derive active section from URL via `useResolvedPath`/`useLocation`, navigate on tab change via builder).
6. **Toggle**: in `src/main/routing/TopLevelRoutes.tsx` at `/admin/*`, dispatch `crdEnabled ? <CrdAdminRoutes/> : <PlatformAdminRoute/>`; wrap the CRD branch in `CrdLayoutWrapper`.
7. **Verify**: open `/admin` on CRD → CRD shell + all 10 section tabs render; non-admin → restricted; MUI-version user → unchanged MUI admin.

## Step 2 — Migrate one list section (worked example: Users)

1. **Data hook**: reuse `usePlatformAdminUsersListQuery` (server pagination + search) from `src/domain/platformAdmin/`.
2. **Mapper**: `users/userListMapper.ts` → `AdminUserRow[]` (plain TS; `canChangeEmail` from authorization fields). No GraphQL types cross into CRD.
3. **Page**: `users/CrdAdminUsersPage.tsx` — calls hook, maps, renders `AdminSearchableTable<AdminUserRow>` (server mode) with Email column + `rowActions` (change-email when allowed, license-plans settings, open-detail link). Delete via the table's built-in confirm.
4. **Sub-routes**: `CrdAdminUserPage.tsx` (detail/edit via `UserEditForm` + `useUpdateUserMutation`), `CrdAdminUserEmailHistoryPage.tsx` (`EmailChangeHistoryView`). Register under the shell route, deep-linkable.
5. **Refetch**: pass the existing `refetchPlatformAdminUsersListQuery` to mutations so the list refreshes (parity).

## Step 3 — Tests (per section)

```bash
pnpm vitest run src/main/crdPages/topLevelPages/admin/users --reporter=basic
pnpm vitest run src/crd/components/admin --reporter=basic
```
Cover, per section: list renders with correct columns/data; search filters; pagination ("show more" or server) works at boundaries; each row action fires; **delete shows ConfirmationDialog and only mutates on confirm**; role-gated actions hidden for non-admins; post-mutation refetch. Mock the generated hooks.

## Step 4 — Lint & parity gates

```bash
pnpm lint            # zero @mui/* or @emotion/* in src/crd & src/main/crdPages
pnpm vitest run      # full suite green
```

## Definition of done (per section)

- [ ] CRD page at the same `/admin/...` URL as MUI, behind the toggle.
- [ ] Same data/columns/ordering, same search & pagination behavior.
- [ ] Same actions with same server effects; same per-action gating.
- [ ] Every destructive action confirmed; cancel = no mutation.
- [ ] All strings in `crd-admin` (6 langs), no hardcoded text.
- [ ] No MUI/Emotion imports; WCAG 2.1 AA; React Compiler (no manual memo).
- [ ] Parity tests pass; MUI admin still works for MUI-version users.

## Reference map (MUI source of truth)

- Shell/nav/sections: `src/domain/platformAdmin/layout/toplevel/{AdminLayout.tsx,constants.ts}`
- Generic table: `src/domain/platformAdmin/components/{AdminSearchableTable.tsx,AdminListItemLayout.tsx}`
- Access gate: `src/main/admin/NonPlatformAdminRedirect.tsx`
- Per-section pages/hooks: see `contracts/reused-graphql-operations.md` and spec §User Stories.
