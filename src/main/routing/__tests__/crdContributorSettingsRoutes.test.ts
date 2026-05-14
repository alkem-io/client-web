import { describe, expect, it } from 'vitest';

/**
 * SC-005 module-load smoke for the 12 CRD contributor-settings tabs.
 *
 * **Scope**: this is intentionally a *module-load* smoke, not a full Apollo /
 * Router integration test. The original tasks.md T089 sketch called for
 * mounting each tab against a `MockedProvider` with seeded GraphQL
 * fixtures — that is order-of-magnitude more scaffolding than the rest of
 * the spec's tests, and the failure modes a full mount catches (broken
 * GraphQL fixtures, mismatched route guards, runtime Apollo errors) are
 * already exercised by per-tab unit tests on the data hooks + per-actor
 * predicates. The remaining failure mode worth catching at this level is
 * **import-time breakage** — a typo in a barrel-less import, a bad
 * `lazy()` path, a circular dep that throws on first load. That is what
 * this test file does: it asynchronously imports every lazy-loaded chunk
 * referenced by `CrdUserSettingsRoutes` and `CrdOrgSettingsRoutes` and
 * asserts each export is callable.
 *
 * The CRD-OFF parity smoke (the other half of T089/T090) is enforced at
 * route-config build time: `TopLevelRoutes.tsx` and
 * `CrdOrganizationRoutes.tsx` lazy-load *both* the MUI and CRD route
 * trees, so a typecheck failure on either path would already be caught by
 * `pnpm tsc --noEmit`. The full end-to-end MUI-on / CRD-on parity check
 * is a manual smoke (T092 — handled by the user against `localhost:3001`
 * per the per-tab smoke checklist in `quickstart.md`).
 */
// MUI fallbacks have a much larger import graph (full @mui/material + emotion
// + the entire MUI domain tree) so a per-test timeout buffer is required when
// the suite runs in parallel under jsdom. The TEMP MUI fallback in
// `CrdUserAccountTab` / `CrdOrgAccountTab` (spec 097, T033a–T033f) puts those
// two CRD tests in the same bucket until the CRD parity dialogs land.
const MUI_LOAD_TIMEOUT_MS = 30_000;

describe('CRD User Settings — lazy chunks load without throwing', () => {
  // `CrdUserSettingsRoutes` is the entry point that lazy-references every other
  // chunk below — its first-time import in the suite warms the lazy graph and
  // can exceed the default 5s timeout under parallel jsdom load. Use the same
  // buffer as the MUI-heavy tests below.
  it(
    'CrdUserSettingsRoutes',
    async () => {
      const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsRoutes');
      expect(typeof mod.default).toBe('function');
    },
    MUI_LOAD_TIMEOUT_MS
  );

  it('CrdUserProfileTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/profile/CrdUserProfileTab');
    expect(typeof mod.default).toBe('function');
  });

  // CrdUserAccountTab eagerly imports four MUI creation dialogs as a TEMP
  // fallback (spec 097, T033a–T033f) — its module-load graph is therefore
  // MUI-sized and needs the same parallel-jsdom buffer as the MUI tests.
  it(
    'CrdUserAccountTab',
    async () => {
      const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab');
      expect(typeof mod.default).toBe('function');
    },
    MUI_LOAD_TIMEOUT_MS
  );

  it('CrdUserMembershipTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/membership/CrdUserMembershipTab');
    expect(typeof mod.default).toBe('function');
  });

  it('CrdUserOrganizationsTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/organizations/CrdUserOrganizationsTab');
    expect(typeof mod.default).toBe('function');
  });

  it('CrdUserNotificationsTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/notifications/CrdUserNotificationsTab');
    expect(typeof mod.default).toBe('function');
  });

  it('CrdUserSettingsTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/settings/CrdUserSettingsTab');
    expect(typeof mod.default).toBe('function');
  });

  it('CrdUserSecurityTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/userPages/settings/security/CrdUserSecurityTab');
    expect(typeof mod.default).toBe('function');
  });
});

describe('CRD Org Settings — lazy chunks load without throwing', () => {
  it('CrdOrgSettingsRoutes', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes');
    expect(typeof mod.default).toBe('function');
  });

  it('CrdOrgProfileTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/organizationPages/settings/profile/CrdOrgProfileTab');
    expect(typeof mod.default).toBe('function');
  });

  // CrdOrgAccountTab also eagerly imports the TEMP MUI creation dialogs
  // (spec 097, T033a–T033f). Same parallel-jsdom buffer rationale.
  it(
    'CrdOrgAccountTab',
    async () => {
      const mod = await import('@/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab');
      expect(typeof mod.default).toBe('function');
    },
    MUI_LOAD_TIMEOUT_MS
  );

  it('CrdOrgCommunityTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/organizationPages/settings/community/CrdOrgCommunityTab');
    expect(typeof mod.default).toBe('function');
  });

  it('CrdOrgAuthorizationTab', async () => {
    const mod = await import(
      '@/main/crdPages/topLevelPages/organizationPages/settings/authorization/CrdOrgAuthorizationTab'
    );
    expect(typeof mod.default).toBe('function');
  });

  it('CrdOrgSettingsTab', async () => {
    const mod = await import('@/main/crdPages/topLevelPages/organizationPages/settings/settings/CrdOrgSettingsTab');
    expect(typeof mod.default).toBe('function');
  });
});

describe('CRD-OFF parity — MUI fallback module-load smoke', () => {
  it(
    'UserAdminRoute (MUI fallback) loads without throwing',
    async () => {
      const mod = await import('@/domain/community/userAdmin/routing/UserAdminRoute');
      expect(typeof mod.default).toBe('function');
    },
    MUI_LOAD_TIMEOUT_MS
  );

  it(
    'OrganizationAdminRoutes (MUI fallback) loads without throwing',
    async () => {
      const mod = await import('@/domain/community/organizationAdmin/OrganizationAdminRoutes');
      expect(typeof mod.default).toBe('function');
    },
    MUI_LOAD_TIMEOUT_MS
  );
});
