import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useOrganizationProvider from '@/domain/community/organization/useOrganization/useOrganization';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useCanEditOrganizationSettings from '../organizationPages/useCanEditOrganizationSettings';
import useCanEditUserSettings from '../userPages/useCanEditUserSettings';

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: vi.fn(),
}));

vi.mock('@/domain/community/organization/useOrganization/useOrganization', () => ({
  default: vi.fn(),
}));

const mockedCurrentUser = vi.mocked(useCurrentUserContext);
const mockedOrgProvider = vi.mocked(useOrganizationProvider);

const baseUserCtx = {
  loading: false,
  loadingMe: false,
  isAuthenticated: true,
  verified: true,
  accountId: undefined,
  platformRoles: [],
  accountPrivileges: [],
  accountEntitlements: [],
};

describe('useCanEditUserSettings (User vertical)', () => {
  it('isOwner branch — current user id matches profile user id', () => {
    mockedCurrentUser.mockReturnValue({
      ...baseUserCtx,
      userModel: { id: 'user-1' },
      platformPrivilegeWrapper: { hasPlatformPrivilege: () => false },
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditUserSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(true);
    expect(result.current.isOwner).toBe(true);
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  it('isPlatformAdmin branch — viewer is admin but not owner', () => {
    mockedCurrentUser.mockReturnValue({
      ...baseUserCtx,
      userModel: { id: 'user-2' },
      platformPrivilegeWrapper: {
        hasPlatformPrivilege: p => p === AuthorizationPrivilege.PlatformAdmin,
      },
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditUserSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(true);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isPlatformAdmin).toBe(true);
  });

  it('non-admin viewer on someone else profile — denied', () => {
    mockedCurrentUser.mockReturnValue({
      ...baseUserCtx,
      userModel: { id: 'user-2' },
      platformPrivilegeWrapper: { hasPlatformPrivilege: () => false },
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditUserSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  it('anonymous viewer — denied', () => {
    mockedCurrentUser.mockReturnValue({
      ...baseUserCtx,
      isAuthenticated: false,
      userModel: undefined,
      platformPrivilegeWrapper: undefined,
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditUserSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isPlatformAdmin).toBe(false);
  });
});

describe('useCanEditOrganizationSettings (Org vertical)', () => {
  const baseProvider = {
    organization: undefined,
    references: [],
    capabilities: [],
    keywords: [],
    associates: [],
    contributions: [],
    website: undefined,
    handleSendMessage: async () => {},
  };

  it('Update privilege true → canEditSettings true', () => {
    mockedOrgProvider.mockReturnValue({
      ...baseProvider,
      permissions: { canEdit: true, canReadUsers: true },
      loading: false,
    } as unknown as ReturnType<typeof useOrganizationProvider>);

    const { result } = renderHook(() => useCanEditOrganizationSettings());
    expect(result.current.canEditSettings).toBe(true);
    expect(result.current.hasUpdatePrivilege).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('Update privilege false → canEditSettings false', () => {
    mockedOrgProvider.mockReturnValue({
      ...baseProvider,
      permissions: { canEdit: false, canReadUsers: false },
      loading: false,
    } as unknown as ReturnType<typeof useOrganizationProvider>);

    const { result } = renderHook(() => useCanEditOrganizationSettings());
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.hasUpdatePrivilege).toBe(false);
  });

  it('loading state surfaces', () => {
    mockedOrgProvider.mockReturnValue({
      ...baseProvider,
      permissions: { canEdit: false, canReadUsers: false },
      loading: true,
    } as unknown as ReturnType<typeof useOrganizationProvider>);

    const { result } = renderHook(() => useCanEditOrganizationSettings());
    expect(result.current.loading).toBe(true);
  });
});
