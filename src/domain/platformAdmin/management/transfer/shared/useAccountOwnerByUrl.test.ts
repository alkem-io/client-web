import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { UrlResolverResultState } from '@/core/apollo/generated/graphql-schema';
import useAccountOwnerByUrl from './useAccountOwnerByUrl';

let mockOwnerResolveData: Record<string, unknown> | undefined;
let mockOwnerResolveLoading = false;
let mockUserData: Record<string, unknown> | undefined;
let mockUserLoading = false;
let mockOrgData: Record<string, unknown> | undefined;
let mockOrgLoading = false;

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAccountOwnerUrlResolveQuery: () => ({ data: mockOwnerResolveData, loading: mockOwnerResolveLoading }),
  useUserAccountLookupQuery: () => ({ data: mockUserData, loading: mockUserLoading }),
  useOrganizationAccountLookupQuery: () => ({ data: mockOrgData, loading: mockOrgLoading }),
}));

const resetMocks = () => {
  mockOwnerResolveData = undefined;
  mockOwnerResolveLoading = false;
  mockUserData = undefined;
  mockUserLoading = false;
  mockOrgData = undefined;
  mockOrgLoading = false;
};

describe('useAccountOwnerByUrl', () => {
  test('returns no owner and no error before a URL is submitted', () => {
    resetMocks();
    const { result } = renderHook(() => useAccountOwnerByUrl());
    expect(result.current.accountOwner).toBeUndefined();
    expect(result.current.ownerError).toBeUndefined();
    expect(result.current.ownerLoading).toBe(false);
  });

  test('submitting resolves a user owner with an accessible account', () => {
    resetMocks();
    mockOwnerResolveData = { urlResolver: { state: UrlResolverResultState.Resolved, userId: 'u1' } };
    mockUserData = {
      lookup: {
        user: { profile: { displayName: 'Alice' }, account: { id: 'acc-1', authorization: { myPrivileges: [] } } },
      },
    };
    const { result } = renderHook(() => useAccountOwnerByUrl());
    act(() => result.current.submit('https://alkemio.test/user/alice'));
    expect(result.current.accountOwner).toEqual(
      expect.objectContaining({ name: 'Alice', accountId: 'acc-1', type: 'user' })
    );
    expect(result.current.ownerError).toBeUndefined();
  });

  // client-1: the URL resolved to a real user, but that user's account is
  // not accessible (null) — distinct from "not found"/"not a user-or-org".
  test('an owner resolved with account null gives accountNotAccessible', () => {
    resetMocks();
    mockOwnerResolveData = { urlResolver: { state: UrlResolverResultState.Resolved, userId: 'u1' } };
    mockUserData = { lookup: { user: { profile: { displayName: 'Alice' }, account: null } } };
    const { result } = renderHook(() => useAccountOwnerByUrl());
    act(() => result.current.submit('https://alkemio.test/user/alice'));
    expect(result.current.ownerError).toBe('pages.admin.transferSpace.accountNotAccessible');
    expect(result.current.accountOwner?.accountId).toBeUndefined();
  });

  test('a URL that resolves to neither a user nor an organization gives urlNotUserOrOrg', () => {
    resetMocks();
    mockOwnerResolveData = { urlResolver: { state: UrlResolverResultState.Resolved } };
    const { result } = renderHook(() => useAccountOwnerByUrl());
    act(() => result.current.submit('https://alkemio.test/space/foo'));
    expect(result.current.ownerError).toBe('pages.admin.transferSpace.urlNotUserOrOrg');
  });

  test('a URL that does not resolve at all gives urlNotFound', () => {
    resetMocks();
    mockOwnerResolveData = { urlResolver: { state: UrlResolverResultState.NotFound } };
    const { result } = renderHook(() => useAccountOwnerByUrl());
    act(() => result.current.submit('https://alkemio.test/nope'));
    expect(result.current.ownerError).toBe('pages.admin.transferSpace.urlNotFound');
  });
});
