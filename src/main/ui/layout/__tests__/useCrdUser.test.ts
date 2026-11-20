import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useCrdUser } from '../useCrdUser';

/**
 * Regression coverage for two defects found by driving a REAL
 * `platform-roles-admin` holder through the UI on 2026-08-05 — both invisible
 * to the 2248-test suite because this hook had no tests at all.
 *
 * D1 — the admin nav entry never appeared for any of the thirteen new roles.
 *      The gate used the right privilege SET but the wrong SOURCE:
 *      `hasPlatformPrivilege` reads only `platform.authorization.myPrivileges`,
 *      while GRANT_GLOBAL_ADMINS / FEATURE_ROLE_ASSIGN live on the platform
 *      ROLE SET's policy.
 *
 * D2 — no role label rendered under the user's name for any of the thirteen;
 *      the switch knew only five legacy roles.
 */

const useAdminAccessGuardMock = vi.fn();
vi.mock('@/main/crdPages/topLevelPages/admin/useAdminAccessGuard', () => ({
  useAdminAccessGuard: () => useAdminAccessGuardMock(),
}));

const useCurrentUserContextMock = vi.fn();
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => useCurrentUserContextMock(),
}));

vi.mock('react-i18next', () => ({
  // Echo the key back so assertions pin WHICH label was chosen, not its wording.
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/crd/lib/getInitials', () => ({ getInitials: () => 'XX' }));

vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  RoleName: {
    PlatformRolesAdmin: 'PLATFORM_ROLES_ADMIN',
    PlatformContentFullAccess: 'PLATFORM_CONTENT_FULL_ACCESS',
    PlatformResourceAdmin: 'PLATFORM_RESOURCE_ADMIN',
    PlatformSettingsAdmin: 'PLATFORM_SETTINGS_ADMIN',
    PlatformOperationsAdmin: 'PLATFORM_OPERATIONS_ADMIN',
    PlatformUsersAdmin: 'PLATFORM_USERS_ADMIN',
    PlatformSupport: 'PLATFORM_SUPPORT',
    PlatformLicenseManager: 'PLATFORM_LICENSE_MANAGER',
    PlatformSpacesReader: 'PLATFORM_SPACES_READER',
    PlatformAuditReader: 'PLATFORM_AUDIT_READER',
    FeatureBetaTester: 'FEATURE_BETA_TESTER',
    FeatureVirtualAssistant: 'FEATURE_VIRTUAL_ASSISTANT',
    FeatureOrganizationCreator: 'FEATURE_ORGANIZATION_CREATOR',
    FeatureVcCampaign: 'FEATURE_VC_CAMPAIGN',
  },
}));

const arrange = ({ roles = [], isPlatformAdmin = false }: { roles?: string[]; isPlatformAdmin?: boolean }) => {
  useAdminAccessGuardMock.mockReturnValue({ isPlatformAdmin, loading: false });
  useCurrentUserContextMock.mockReturnValue({
    isAuthenticated: true,
    userModel: { profile: { displayName: 'Ada Lovelace', avatar: { uri: 'x' } } },
    platformRoles: roles,
  });
  return renderHook(() => useCrdUser()).result.current;
};

describe('useCrdUser', () => {
  describe('D1 — admin nav visibility defers to the route guard', () => {
    test('shows the nav entry when the route guard admits (new-role holder)', () => {
      // The whole point: this user holds NO platform-policy privilege. Their
      // GRANT_GLOBAL_ADMINS sits on the role set, which only the guard reads.
      expect(arrange({ roles: ['PLATFORM_ROLES_ADMIN'], isPlatformAdmin: true }).isAdmin).toBe(true);
    });

    test('hides the nav entry when the route guard denies', () => {
      expect(arrange({ roles: [], isPlatformAdmin: false }).isAdmin).toBe(false);
    });

    test('nav and route guard cannot disagree — isAdmin IS the guard verdict', () => {
      // A dead link (nav shown, route denies) and a hidden page (route admits,
      // nav absent) are both defects; deriving one from the other removes the
      // class rather than the instance.
      expect(arrange({ roles: ['GLOBAL_ADMIN'], isPlatformAdmin: false }).isAdmin).toBe(false);
      expect(arrange({ roles: [], isPlatformAdmin: true }).isAdmin).toBe(true);
    });
  });

  describe('D2 — role label covers the fourteen new roles', () => {
    test.each([
      'PLATFORM_ROLES_ADMIN',
      'PLATFORM_CONTENT_FULL_ACCESS',
      'PLATFORM_RESOURCE_ADMIN',
      'PLATFORM_SETTINGS_ADMIN',
      'PLATFORM_OPERATIONS_ADMIN',
      'PLATFORM_USERS_ADMIN',
      'PLATFORM_SUPPORT',
      'PLATFORM_LICENSE_MANAGER',
      'PLATFORM_SPACES_READER',
      'PLATFORM_AUDIT_READER',
      'FEATURE_BETA_TESTER',
      'FEATURE_VIRTUAL_ASSISTANT',
      'FEATURE_ORGANIZATION_CREATOR',
      'FEATURE_VC_CAMPAIGN',
    ])('%s renders a label', role => {
      expect(arrange({ roles: [role] }).user?.role).toBe(`common.roles.${role}`);
    });

    test('the retired legacy roles yield no label (Slice B, T013)', () => {
      expect(arrange({ roles: ['GLOBAL_ADMIN'] }).user?.role).toBeUndefined();
      expect(arrange({ roles: ['GLOBAL_SUPPORT'] }).user?.role).toBeUndefined();
    });

    test('a role with no label yields undefined rather than throwing', () => {
      expect(arrange({ roles: ['SOME_UNMAPPED_ROLE'] }).user?.role).toBeUndefined();
    });
  });

  describe('label precedence is deterministic', () => {
    test('most-privileged wins regardless of the order the API returns roles in', () => {
      // The previous form returned the FIRST match in server order, so the same
      // user could be labelled differently between two responses. Holding
      // several of the thirteen at once is now normal, so this matters.
      const forward = arrange({ roles: ['PLATFORM_AUDIT_READER', 'PLATFORM_ROLES_ADMIN'] }).user?.role;
      const reversed = arrange({ roles: ['PLATFORM_ROLES_ADMIN', 'PLATFORM_AUDIT_READER'] }).user?.role;

      expect(forward).toBe('common.roles.PLATFORM_ROLES_ADMIN');
      expect(reversed).toBe(forward);
    });

    test('the Feature VC Campaign successor is labelled on its own (its legacy twin is retired)', () => {
      expect(arrange({ roles: ['FEATURE_VC_CAMPAIGN'] }).user?.role).toBe('common.roles.FEATURE_VC_CAMPAIGN');
    });

    test('a retired legacy role never outranks a live one (Slice B, T013)', () => {
      expect(arrange({ roles: ['PLATFORM_SUPPORT', 'GLOBAL_ADMIN'] }).user?.role).toBe('common.roles.PLATFORM_SUPPORT');
    });
  });

  describe('roles — every held role, precedence-ordered', () => {
    test('lists all held roles most-privileged first, independent of API order', () => {
      const { user } = arrange({ roles: ['FEATURE_BETA_TESTER', 'PLATFORM_SUPPORT', 'PLATFORM_ROLES_ADMIN'] });

      expect(user?.roles).toEqual([
        'common.roles.PLATFORM_ROLES_ADMIN',
        'common.roles.PLATFORM_SUPPORT',
        'common.roles.FEATURE_BETA_TESTER',
      ]);
    });

    test('the single label IS the head of the list — one source of truth', () => {
      const { user } = arrange({ roles: ['PLATFORM_SUPPORT', 'PLATFORM_USERS_ADMIN'] });

      expect(user?.role).toBe(user?.roles[0]);
    });

    test('unmapped and retired roles are dropped, not rendered as raw keys', () => {
      const { user } = arrange({ roles: ['GLOBAL_ADMIN', 'SOME_UNMAPPED_ROLE', 'PLATFORM_AUDIT_READER'] });

      expect(user?.roles).toEqual(['common.roles.PLATFORM_AUDIT_READER']);
    });

    test('no held roles yields an empty list and no label', () => {
      const { user } = arrange({ roles: [] });

      expect(user?.roles).toEqual([]);
      expect(user?.role).toBeUndefined();
    });
  });

  test('no profile yields no user object', () => {
    useAdminAccessGuardMock.mockReturnValue({ isPlatformAdmin: false, loading: false });
    useCurrentUserContextMock.mockReturnValue({ isAuthenticated: false, userModel: undefined, platformRoles: [] });

    expect(renderHook(() => useCrdUser()).result.current.user).toBeUndefined();
  });
});
