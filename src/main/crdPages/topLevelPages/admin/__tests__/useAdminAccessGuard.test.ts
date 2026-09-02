import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useAdminAccessGuard } from '../useAdminAccessGuard';

const usePlatformLevelAuthorizationQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformLevelAuthorizationQuery: () => usePlatformLevelAuthorizationQueryMock(),
}));
vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  AuthorizationPrivilege: { PlatformAdmin: 'PLATFORM_ADMIN' },
}));

const queryResult = (privileges: string[] | undefined, loading = false) => ({
  data: privileges ? { platform: { authorization: { myPrivileges: privileges } } } : undefined,
  loading,
});

describe('useAdminAccessGuard', () => {
  test('reports platform admin when the PlatformAdmin privilege is present', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult(['PLATFORM_ADMIN']));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  test('denies when the privilege is absent (parity with NonPlatformAdminRedirect)', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult(['READ']));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.isPlatformAdmin).toBe(false);
  });

  test('passes through loading and denies while privileges are unknown', () => {
    usePlatformLevelAuthorizationQueryMock.mockReturnValue(queryResult(undefined, true));
    const { result } = renderHook(() => useAdminAccessGuard());
    expect(result.current.loading).toBe(true);
    expect(result.current.isPlatformAdmin).toBe(false);
  });
});
