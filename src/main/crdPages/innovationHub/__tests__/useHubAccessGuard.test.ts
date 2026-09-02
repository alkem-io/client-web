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
            nameID: 'demo-name-id',
            subdomain: 'demo',
            authorization: { myPrivileges: [AuthorizationPrivilege.Update] },
          },
        },
      },
      loading: false,
    });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'allowed' });
  });

  test('returns denied with hub home redirect using nameID (NOT subdomain)', () => {
    useInnovationHubByIdQueryMock.mockReturnValue({
      data: {
        platform: {
          innovationHub: {
            id: 'hub-1',
            // Intentional mismatch: `nameID` and `subdomain` can diverge for
            // hubs whose display-name slug differs from the chosen subdomain.
            // The path-based redirect URL must use `nameID` — the route is
            // `/hub/:innovationHubNameId`, resolved server-side by nameID.
            nameID: 'demo-name-id',
            subdomain: 'demo',
            authorization: { myPrivileges: [] },
          },
        },
      },
      loading: false,
    });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'denied', redirectTo: '/hub/demo-name-id' });
  });

  test('returns denied with platform-home redirect when hub data is missing after loading', () => {
    // Query has finished (loading=false) but the hub came back undefined — the
    // hub is gone, the id is wrong, or the viewer can't see it exists. We have
    // no hub slug to redirect to, so the guard must terminate at `/` rather
    // than report `loading` forever.
    useInnovationHubByIdQueryMock.mockReturnValue({
      data: { platform: { innovationHub: undefined } },
      loading: false,
    });
    const { result } = renderHook(() => useHubAccessGuard('hub-1'));
    expect(result.current).toEqual({ state: 'denied', redirectTo: '/' });
  });
});
