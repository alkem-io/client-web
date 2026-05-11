import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useCanEditSettings from '../useCanEditSettings';

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: vi.fn(),
}));

const mocked = vi.mocked(useCurrentUserContext);

const baseCtx = {
  loading: false,
  loadingMe: false,
  isAuthenticated: true,
  verified: true,
  accountId: undefined,
  platformRoles: [],
  accountPrivileges: [],
  accountEntitlements: [],
};

describe('useCanEditSettings', () => {
  it('returns true (isOwner) when current user id matches the profile user id', () => {
    mocked.mockReturnValue({
      ...baseCtx,
      userModel: { id: 'user-1' },
      platformPrivilegeWrapper: { hasPlatformPrivilege: () => false },
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(true);
    expect(result.current.isOwner).toBe(true);
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  it('returns true (isPlatformAdmin) when viewer is not owner but holds PlatformAdmin', () => {
    mocked.mockReturnValue({
      ...baseCtx,
      userModel: { id: 'user-2' },
      platformPrivilegeWrapper: {
        hasPlatformPrivilege: p => p === AuthorizationPrivilege.PlatformAdmin,
      },
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(true);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isPlatformAdmin).toBe(true);
  });

  it('returns false for a non-admin viewer on someone else profile', () => {
    mocked.mockReturnValue({
      ...baseCtx,
      userModel: { id: 'user-2' },
      platformPrivilegeWrapper: { hasPlatformPrivilege: () => false },
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  it('returns false for an anonymous viewer', () => {
    mocked.mockReturnValue({
      ...baseCtx,
      isAuthenticated: false,
      userModel: undefined,
      platformPrivilegeWrapper: undefined,
    } as unknown as ReturnType<typeof useCurrentUserContext>);

    const { result } = renderHook(() => useCanEditSettings({ profileUserId: 'user-1' }));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isPlatformAdmin).toBe(false);
  });
});
