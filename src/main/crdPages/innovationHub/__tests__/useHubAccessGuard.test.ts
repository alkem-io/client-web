import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

const useInnovationHubByIdQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useInnovationHubByIdQuery: (opts: unknown) => useInnovationHubByIdQueryMock(opts),
}));

const { useHubAccessGuard } = await import('../hooks/useHubAccessGuard');

describe('useHubAccessGuard', () => {
  test('returns loading while the privilege query is in flight', () => {
    useInnovationHubByIdQueryMock.mockReturnValue({ data: undefined, loading: true });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'loading' });
  });

  test('returns loading when no hub id provided', () => {
    useInnovationHubByIdQueryMock.mockReturnValue({ data: undefined, loading: false });
    const { result } = renderHook(() => useHubAccessGuard(undefined));
    expect(result.current).toEqual({ state: 'loading' });
  });

  test('returns allowed when Update privilege present', () => {
    useInnovationHubByIdQueryMock.mockReturnValue({
      data: {
        platform: {
          innovationHub: {
            id: 'hub-1',
            nameID: 'demo',
            authorization: { myPrivileges: [AuthorizationPrivilege.Update] },
          },
        },
      },
      loading: false,
    });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'allowed' });
  });

  test('returns denied with hub home redirect when privilege missing', () => {
    useInnovationHubByIdQueryMock.mockReturnValue({
      data: {
        platform: {
          innovationHub: {
            id: 'hub-1',
            nameID: 'demo',
            authorization: { myPrivileges: [] },
          },
        },
      },
      loading: false,
    });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'denied', redirectTo: '/hub/demo' });
  });

  test('returns loading when hub data missing entirely', () => {
    useInnovationHubByIdQueryMock.mockReturnValue({
      data: { platform: { innovationHub: undefined } },
      loading: false,
    });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'loading' });
  });
});
