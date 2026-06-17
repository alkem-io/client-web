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
 */
// Some CRD tabs eagerly import MUI creation dialogs as a TEMP fallback
// (`CrdUserAccountTab` / `CrdOrgAccountTab`, spec 097, T033a–T033f), so their
// module-load graph pulls in @mui/material + emotion and needs a larger
// per-test timeout buffer when the suite runs in parallel under jsdom.
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
