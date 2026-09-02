import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useVirtualContributorQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useCanEditVcSettings from '../useCanEditVcSettings';

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorQuery: vi.fn(),
}));

const mocked = vi.mocked(useVirtualContributorQuery);

const buildResult = (myPrivileges: AuthorizationPrivilege[] | undefined, loading = false) =>
  ({
    loading,
    data: myPrivileges
      ? {
          lookup: {
            virtualContributor: {
              id: 'vc-1',
              authorization: { id: 'auth-1', myPrivileges },
            },
          },
        }
      : undefined,
  }) as unknown as ReturnType<typeof useVirtualContributorQuery>;

describe('useCanEditVcSettings', () => {
  it('returns true when the viewer holds the Update privilege', () => {
    mocked.mockReturnValue(buildResult([AuthorizationPrivilege.Update, AuthorizationPrivilege.Read]));

    const { result } = renderHook(() => useCanEditVcSettings('vc-1'));
    expect(result.current.canEditSettings).toBe(true);
    expect(result.current.hasUpdatePrivilege).toBe(true);
  });

  it('returns false when the viewer lacks the Update privilege', () => {
    mocked.mockReturnValue(buildResult([AuthorizationPrivilege.Read]));

    const { result } = renderHook(() => useCanEditVcSettings('vc-1'));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.hasUpdatePrivilege).toBe(false);
  });

  it('returns false for an anonymous viewer (no privileges)', () => {
    mocked.mockReturnValue(buildResult([]));

    const { result } = renderHook(() => useCanEditVcSettings('vc-1'));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.hasUpdatePrivilege).toBe(false);
  });

  it('propagates the loading state from the underlying query', () => {
    mocked.mockReturnValue(buildResult(undefined, true));

    const { result } = renderHook(() => useCanEditVcSettings('vc-1'));
    expect(result.current.loading).toBe(true);
    expect(result.current.canEditSettings).toBe(false);
  });

  it('skips the query and returns false when vcId is undefined', () => {
    mocked.mockReturnValue(buildResult(undefined, false));

    const { result } = renderHook(() => useCanEditVcSettings(undefined));
    expect(result.current.canEditSettings).toBe(false);
    expect(result.current.hasUpdatePrivilege).toBe(false);
    // The hook still called useVirtualContributorQuery, but with skip: true.
    expect(mocked).toHaveBeenCalled();
    const lastCallArgs = mocked.mock.calls[mocked.mock.calls.length - 1]?.[0];
    expect(lastCallArgs?.skip).toBe(true);
  });
});
