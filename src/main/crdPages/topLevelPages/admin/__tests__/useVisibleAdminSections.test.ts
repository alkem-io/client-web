import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useVisibleAdminSections } from '../useVisibleAdminSections';

/**
 * Found live 2026-08-05: a real `platform-roles-admin` holder reached the admin
 * area (correctly) and was shown all nine sections, eight of which they cannot
 * operate — and was landed on `spaces` by the fixed index redirect.
 *
 * The privileges below mirror what a running server actually reports, verified
 * against the stored credential rules: the assignment privileges are on the
 * platform ROLE SET, not on the platform entity.
 */
const usePlatformLevelAuthorizationQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLevelAuthorizationQuery: () => usePlatformLevelAuthorizationQueryMock(),
}));

const arrange = ({ platform = [], roleSet = [] }: { platform?: string[]; roleSet?: string[] }) => {
  usePlatformLevelAuthorizationQueryMock.mockReturnValue({
    data: {
      platform: {
        authorization: { myPrivileges: platform },
        roleSet: { authorization: { myPrivileges: roleSet } },
      },
    },
    loading: false,
  });
  return renderHook(() => useVisibleAdminSections()).result.current.sections.map(s => s.id);
};

describe('useVisibleAdminSections', () => {
  test('a Platform Roles Admin sees ONLY the authorization section', () => {
    // Exactly what the server grants this role, nothing added:
    // SET_SERVICE_PROFILE on the platform, the three assignment/read
    // privileges on the role set.
    const visible = arrange({
      platform: ['SET_SERVICE_PROFILE'],
      roleSet: ['GRANT_GLOBAL_ADMINS', 'FEATURE_ROLE_ASSIGN', 'PLATFORM_ROLE_HOLDERS_READ'],
    });

    expect(visible).toEqual(['authorization']);
  });

  test('the legacy global admin keeps seeing every section (Slice A is additive)', () => {
    const visible = arrange({ platform: ['PLATFORM_ADMIN'] });

    expect(visible).toHaveLength(9);
    expect(visible).toContain('spaces');
    expect(visible).toContain('transfer');
  });

  test.each([
    ['PLATFORM_USERS_ADMIN', 'users'],
    ['AUTHORIZATION_RESET', 'authorization-policies'],
    ['PLATFORM_SUPPORT_ORG_RESOURCES', 'organizations'],
    ['TRANSFER_RESOURCE_OFFER', 'transfer'],
    ['PLATFORM_CONTENT_FULL_ACCESS', 'spaces'],
  ])('%s admits %s', (privilege, section) => {
    expect(arrange({ platform: [privilege] })).toContain(section);
  });

  test('Platform Support sees the org-owned resource sections and nothing else', () => {
    const visible = arrange({ platform: ['PLATFORM_SUPPORT_ORG_RESOURCES', 'DELETE_ORGANIZATION'] });

    expect(visible.sort()).toEqual(['innovation-hubs', 'innovation-packs', 'organizations']);
  });

  test('a user with no admin privileges sees no sections', () => {
    expect(arrange({})).toEqual([]);
  });

  test('the assignment privileges are read from the ROLE SET, not the platform', () => {
    // The exact defect class that hid the nav entry: reading only the platform
    // policy makes every one of the thirteen roles look unprivileged.
    expect(arrange({ platform: ['GRANT_GLOBAL_ADMINS'], roleSet: [] })).toEqual(['authorization']);
    expect(arrange({ platform: [], roleSet: ['GRANT_GLOBAL_ADMINS'] })).toEqual(['authorization']);
  });

  test('reports loading so the index redirect does not land on a stale default', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue({ data: undefined, loading: true });

    expect(renderHook(() => useVisibleAdminSections()).result.current.loading).toBe(true);
  });
});
