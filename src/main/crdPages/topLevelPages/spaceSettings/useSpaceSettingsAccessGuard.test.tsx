import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----

const useSpacePrivilegesQueryMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpacePrivilegesQuery: (args: unknown) => useSpacePrivilegesQueryMock(args),
}));

const useRestrictedRedirectMock = vi.fn();
vi.mock('@/core/routing/useRestrictedRedirect', () => ({
  default: (...args: unknown[]) => useRestrictedRedirectMock(...args),
}));

import { useSpaceSettingsAccessGuard } from './useSpaceSettingsAccessGuard';

describe('useSpaceSettingsAccessGuard', () => {
  beforeEach(() => {
    useSpacePrivilegesQueryMock.mockReset();
    useRestrictedRedirectMock.mockReset();
    useSpacePrivilegesQueryMock.mockReturnValue({ data: undefined, error: undefined });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('skips the privileges query when spaceId is empty', () => {
    renderHook(() => useSpaceSettingsAccessGuard('', true));

    expect(useSpacePrivilegesQueryMock).toHaveBeenCalledWith({
      variables: { spaceId: '' },
      skip: true,
    });
  });

  test('runs the privileges query when spaceId is provided', () => {
    renderHook(() => useSpaceSettingsAccessGuard('space-1', false));

    expect(useSpacePrivilegesQueryMock).toHaveBeenCalledWith({
      variables: { spaceId: 'space-1' },
      skip: false,
    });
  });

  test('calls useRestrictedRedirect with skip=true while scope is loading', () => {
    renderHook(() => useSpaceSettingsAccessGuard('space-1', true));

    expect(useRestrictedRedirectMock).toHaveBeenCalledTimes(1);
    const [queryState] = useRestrictedRedirectMock.mock.calls[0];
    expect(queryState).toEqual({ data: undefined, error: undefined, skip: true });
  });

  test('calls useRestrictedRedirect with skip=true while spaceId is empty (even after scope resolves)', () => {
    renderHook(() => useSpaceSettingsAccessGuard('', false));

    const [queryState] = useRestrictedRedirectMock.mock.calls[0];
    expect(queryState.skip).toBe(true);
  });

  test('calls useRestrictedRedirect with skip=false once spaceId resolves and scope is settled', () => {
    renderHook(() => useSpaceSettingsAccessGuard('space-1', false));

    const [queryState] = useRestrictedRedirectMock.mock.calls[0];
    expect(queryState.skip).toBe(false);
  });

  test('passes data + error from the privileges query through to useRestrictedRedirect', () => {
    const error = new Error('FORBIDDEN_POLICY');
    useSpacePrivilegesQueryMock.mockReturnValue({ data: undefined, error });

    renderHook(() => useSpaceSettingsAccessGuard('space-1', false));

    const [queryState] = useRestrictedRedirectMock.mock.calls[0];
    expect(queryState.error).toBe(error);
  });

  test('configures useRestrictedRedirect with Update as the required privilege', () => {
    renderHook(() => useSpaceSettingsAccessGuard('space-1', false));

    const [, , options] = useRestrictedRedirectMock.mock.calls[0];
    expect(options).toEqual({ requiredPrivilege: AuthorizationPrivilege.Update });
  });

  test('reads myPrivileges from data.lookup.space.authorization.myPrivileges', () => {
    renderHook(() => useSpaceSettingsAccessGuard('space-1', false));

    const [, readPrivileges] = useRestrictedRedirectMock.mock.calls[0];
    const fakeData = {
      lookup: {
        space: {
          authorization: {
            myPrivileges: [AuthorizationPrivilege.Read, AuthorizationPrivilege.Update],
          },
        },
      },
    };

    expect(readPrivileges(fakeData)).toEqual([AuthorizationPrivilege.Read, AuthorizationPrivilege.Update]);
  });

  test("reader returns undefined when data.lookup.space is null (not the user's space)", () => {
    renderHook(() => useSpaceSettingsAccessGuard('space-1', false));

    const [, readPrivileges] = useRestrictedRedirectMock.mock.calls[0];
    expect(readPrivileges({ lookup: { space: null } })).toBeUndefined();
  });
});
