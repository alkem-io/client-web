import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useAdminAccessGuard } from '../useAdminAccessGuard';

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLevelAuthorizationQuery: () => usePlatformLevelAuthorizationQueryMock(),
}));
const usePlatformLevelAuthorizationQueryMock = vi.fn();

/**
 * Mirrors the real PlatformLevelAuthorization shape: the admitting privileges are
 * split across TWO policies. PLATFORM_ADMIN / PLATFORM_USERS_ADMIN /
 * PLATFORM_CONTENT_FULL_ACCESS are on `platform.authorization`;
 * GRANT_GLOBAL_ADMINS / FEATURE_ROLE_ASSIGN / the holder-read privileges are on
 * `platform.roleSet.authorization` (verified against a running server). A fixture
 * that models only the platform policy makes a guard that reads only that policy
 * look correct — which is exactly how the original defect survived its own test.
 *
 * The guard no longer keeps its own admitting list: it asks `adminSectionAccess`
 * whether the viewer has at least one usable section, which is the same question
 * the nav filter asks. These tests therefore double as the assertion that the two
 * cannot drift apart.
 */
const queryResult = (
  { platform = [], roleSet = [], myRoles = [] }: { platform?: string[]; roleSet?: string[]; myRoles?: string[] },
  loading = false,
  present = true
) => ({
  data: present
    ? {
        platform: {
          authorization: { myPrivileges: platform },
          roleSet: { myRoles, authorization: { myPrivileges: roleSet } },
        },
      }
    : undefined,
  loading,
});

const guard = (fixture: Parameters<typeof queryResult>[0], loading?: boolean, present?: boolean) => {
  usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult(fixture, loading, present));
  return renderHook(() => useAdminAccessGuard()).result.current;
};

describe('useAdminAccessGuard', () => {
  test('reports platform admin when the legacy PlatformAdmin privilege is present', () => {
    const result = guard({ platform: ['PLATFORM_ADMIN'] });
    expect(result.isPlatformAdmin).toBe(true);
    expect(result.loading).toBe(false);
  });

  // FR-012 regression. PLATFORM_ADMIN is granted only to the legacy global-admin /
  // global-support / global-license-manager credentials, so before this the seeded
  // break-glass Platform Roles Admin — the one assigner FR-013 guarantees exists
  // after deploy — was redirected away from the admin UI it must use to re-grant
  // every role. If this fails, the admin area is unreachable for exactly the
  // operators this feature creates.
  test('admits Platform Roles Admin via GrantGlobalAdmins (FR-012)', () => {
    expect(guard({ roleSet: ['GRANT_GLOBAL_ADMINS'] }).isPlatformAdmin).toBe(true);
  });

  test('admits Platform Users Admin via FeatureRoleAssign (FR-012)', () => {
    expect(guard({ roleSet: ['FEATURE_ROLE_ASSIGN'] }).isPlatformAdmin).toBe(true);
  });

  // Both were previously redirected to /restricted despite the server serving
  // them their sections: Content Full Access owns five `platformAdmin` resource
  // lists (F6's fix), and Audit Reader reads every holder list.
  test('admits Platform Content Full Access, which owns five resource sections', () => {
    expect(guard({ platform: ['PLATFORM_CONTENT_FULL_ACCESS'] }).isPlatformAdmin).toBe(true);
  });

  test('admits Platform Audit Reader for its view-only holder lists', () => {
    expect(guard({ platform: ['PLATFORM_AUDIT_READ'], roleSet: ['PLATFORM_ROLE_HOLDERS_READ'] }).isPlatformAdmin).toBe(
      true
    );
  });

  // Finding F1 (live-assertion-run.md). A PLATFORM_RESOURCE_ADMIN holder reports
  // an EMPTY myPrivileges on both platform policies, because TRANSFER_RESOURCE_*
  // is anchored on account policies. Without the role check the operator is
  // redirected off /admin/transfer, the only section it exists to run.
  test('admits Platform Resource Admin by role, holding NO platform-level privilege (F1)', () => {
    expect(guard({ myRoles: ['PLATFORM_RESOURCE_ADMIN'] }).isPlatformAdmin).toBe(true);
  });

  test('denies an ordinary registered user', () => {
    expect(guard({ platform: ['READ'], roleSet: ['READ'] }).isPlatformAdmin).toBe(false);
  });

  /**
   * The roles with no usable section stay OUT of the shell. Admitting them would
   * open an empty admin area — or, worse, one whose every section 403s. Each of
   * these is a recorded server-side gap; when a gap closes, the fix belongs in
   * `ROLE_ADMIN_SECTIONS` and this expectation flips there, not here.
   */
  test.each([
    ['Platform Support', { platform: ['CREATE_ORGANIZATION', 'PLATFORM_FORUM_MANAGE'], myRoles: ['PLATFORM_SUPPORT'] }],
    ['Platform Operations Admin', { platform: ['AUTHORIZATION_RESET', 'PLATFORM_OPERATIONS_ADMIN'] }],
    ['Platform Settings Admin', { platform: ['PLATFORM_SETTINGS_ADMIN'] }],
    ['Platform License Manager + Beta Tester', { myRoles: ['PLATFORM_LICENSE_MANAGER', 'FEATURE_BETA_TESTER'] }],
  ])('denies %s — no usable section', (_role, fixture) => {
    expect(guard(fixture).isPlatformAdmin).toBe(false);
  });

  test('passes through loading and denies while privileges are unknown', () => {
    const result = guard({}, true, false);
    expect(result.loading).toBe(true);
    expect(result.isPlatformAdmin).toBe(false);
  });

  /**
   * `canChangeUserEmail` is a capability, not admin standing. `adminUserEmailChange`
   * is gated on PLATFORM_USERS_ADMIN at its own resolver, so every other role that
   * reaches the shell must NOT get the Change Email button — finding F8's defect
   * shape (an editor offered to a role that can edit none).
   */
  describe('canChangeUserEmail', () => {
    test('granted to Platform Users Admin', () => {
      expect(guard({ platform: ['PLATFORM_USERS_ADMIN'] }).canChangeUserEmail).toBe(true);
    });

    test('granted to the legacy catch-all', () => {
      expect(guard({ platform: ['PLATFORM_ADMIN'] }).canChangeUserEmail).toBe(true);
    });

    test('withheld from other admin-area roles that cannot perform it', () => {
      expect(guard({ roleSet: ['GRANT_GLOBAL_ADMINS'] }).canChangeUserEmail).toBe(false);
      expect(guard({ platform: ['PLATFORM_CONTENT_FULL_ACCESS'] }).canChangeUserEmail).toBe(false);
    });
  });
});
