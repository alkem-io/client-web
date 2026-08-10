import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useAdminAccessGuard } from '../useAdminAccessGuard';

const usePlatformLevelAuthorizationQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLevelAuthorizationQuery: () => usePlatformLevelAuthorizationQueryMock(),
}));
vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  AuthorizationPrivilege: {
    PlatformAdmin: 'PLATFORM_ADMIN',
    GrantGlobalAdmins: 'GRANT_GLOBAL_ADMINS',
    FeatureRoleAssign: 'FEATURE_ROLE_ASSIGN',
  },
  RoleName: {
    PlatformResourceAdmin: 'PLATFORM_RESOURCE_ADMIN',
    PlatformAuditReader: 'PLATFORM_AUDIT_READER',
    PlatformLicenseManager: 'PLATFORM_LICENSE_MANAGER',
  },
}));

/**
 * Mirrors the real PlatformLevelAuthorization shape: the admitting privileges are
 * split across TWO policies. PLATFORM_ADMIN is on `platform.authorization`;
 * GRANT_GLOBAL_ADMINS / FEATURE_ROLE_ASSIGN are on `platform.roleSet.authorization`
 * (verified against a running server). A fixture that models only the platform
 * policy makes a guard that reads only that policy look correct — which is exactly
 * how the original defect survived its own test.
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

describe('useAdminAccessGuard', () => {
  test('reports platform admin when the legacy PlatformAdmin privilege is present', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult({ platform: ['PLATFORM_ADMIN'] }));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  // FR-012 regression. PLATFORM_ADMIN is granted only to the legacy global-admin /
  // global-support / global-license-manager credentials, so before this the seeded
  // break-glass Platform Roles Admin — the one assigner FR-013 guarantees exists
  // after deploy — was redirected away from the admin UI it must use to re-grant
  // every role. Live-verified against the platform policy: the new roles hold no
  // PLATFORM_ADMIN. If this test fails, the admin area is unreachable for exactly
  // the operators this feature creates.
  test('admits Platform Roles Admin via GrantGlobalAdmins (FR-012)', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult({ roleSet: ['GRANT_GLOBAL_ADMINS'] }));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(true);
  });

  test('admits Platform Users Admin via FeatureRoleAssign (FR-012)', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult({ roleSet: ['FEATURE_ROLE_ASSIGN'] }));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(true);
  });

  test('denies when no admitting privilege is present (parity with NonPlatformAdminRedirect)', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult({ platform: ['READ'], roleSet: ['READ'] }));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  // A decomposed role that carries no assignment capability must NOT gain the admin
  // shell as a side effect of this fix — the widening is deliberately limited to the
  // two privileges FR-012 names.
  test('denies a platform role that holds no assignment capability', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(
      queryResult({ platform: ['PLATFORM_AUDIT_READ'], roleSet: ['PLATFORM_ROLE_HOLDERS_READ'] })
    );
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  // Finding F1 (live-assertion-run.md). Verified against a running server: a
  // PLATFORM_RESOURCE_ADMIN holder reports an EMPTY myPrivileges on both platform
  // policies, because TRANSFER_RESOURCE_* is anchored on account policies. The
  // fixture therefore carries no privileges at all — anything else would test a
  // server that does not exist. Without the role check the operator is redirected
  // off /admin/transfer, the only section it exists to run.
  test('admits Platform Resource Admin by role, holding NO platform-level privilege (F1)', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult({ myRoles: ['PLATFORM_RESOURCE_ADMIN'] }));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(true);
  });

  // The role exception is exactly one role wide. License Manager is equally
  // invisible at platform level, but no admin section serves it — admitting it
  // would open an empty shell.
  test('does NOT admit the other privilege-invisible roles', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(
      queryResult({ myRoles: ['PLATFORM_LICENSE_MANAGER', 'FEATURE_BETA_TESTER'] })
    );
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  test('passes through loading and denies while privileges are unknown', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult({}, true, false));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.loading).toBe(true);
    expect(result.current.isPlatformAdmin).toBe(false);
  });
});
