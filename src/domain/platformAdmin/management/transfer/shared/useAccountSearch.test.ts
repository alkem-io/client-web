import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import useAccountSearch from './useAccountSearch';

const mockSearchUsers = vi.fn();
const mockSearchOrgs = vi.fn();

let mockUsersData: Record<string, unknown> | undefined;
let mockOrgsData: Record<string, unknown> | undefined;

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAccountSearchUsersLazyQuery: () => [mockSearchUsers, { data: mockUsersData, loading: false }],
  useAccountSearchOrganizationsLazyQuery: () => [mockSearchOrgs, { data: mockOrgsData, loading: false }],
}));

describe('useAccountSearch', () => {
  test('returns empty results initially', () => {
    mockUsersData = undefined;
    mockOrgsData = undefined;
    const { result } = renderHook(() => useAccountSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  test('combines user and organization results', () => {
    mockUsersData = {
      platformAdmin: {
        users: {
          users: [
            {
              id: 'user-1',
              account: {
                id: 'acc-1',
                authorization: { myPrivileges: [AuthorizationPrivilege.TransferResourceAccept] },
              },
              profile: { displayName: 'Alice' },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    };
    mockOrgsData = {
      platformAdmin: {
        organizations: {
          organization: [
            {
              id: 'org-1',
              account: {
                id: 'acc-2',
                authorization: { myPrivileges: [AuthorizationPrivilege.TransferResourceAccept] },
              },
              profile: { displayName: 'Acme Corp' },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    };
    const { result } = renderHook(() => useAccountSearch());
    expect(result.current.results).toHaveLength(2);
    expect(result.current.results[0]).toEqual(expect.objectContaining({ name: 'Alice (User)', accountId: 'acc-1' }));
    expect(result.current.results[1]).toEqual(
      expect.objectContaining({ name: 'Acme Corp (Organization)', accountId: 'acc-2' })
    );
  });

  test('filters out accounts without TransferResourceAccept privilege', () => {
    mockUsersData = {
      platformAdmin: {
        users: {
          users: [
            {
              id: 'user-1',
              account: {
                id: 'acc-1',
                authorization: { myPrivileges: [AuthorizationPrivilege.Read] },
              },
              profile: { displayName: 'No-Privilege User' },
            },
            {
              id: 'user-2',
              account: {
                id: 'acc-2',
                authorization: { myPrivileges: [AuthorizationPrivilege.TransferResourceAccept] },
              },
              profile: { displayName: 'Valid User' },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      },
    };
    mockOrgsData = { platformAdmin: { organizations: { organization: [], pageInfo: { hasNextPage: false } } } };
    const { result } = renderHook(() => useAccountSearch());
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe('Valid User (User)');
  });

  test('handleSearch triggers queries for terms with 2+ characters', () => {
    mockUsersData = undefined;
    mockOrgsData = undefined;
    const { result } = renderHook(() => useAccountSearch());

    act(() => {
      result.current.handleSearch('Al');
    });

    expect(mockSearchUsers).toHaveBeenCalledWith({
      variables: { first: 20, filter: { displayName: 'Al' } },
    });
    expect(mockSearchOrgs).toHaveBeenCalledWith({
      variables: { first: 20, filter: { displayName: 'Al' } },
    });
  });

  test('handleSearch does not trigger queries for short terms', () => {
    mockUsersData = undefined;
    mockOrgsData = undefined;
    mockSearchUsers.mockClear();
    mockSearchOrgs.mockClear();
    const { result } = renderHook(() => useAccountSearch());

    act(() => {
      result.current.handleSearch('A');
    });

    expect(mockSearchUsers).not.toHaveBeenCalled();
    expect(mockSearchOrgs).not.toHaveBeenCalled();
  });

  test('handles empty results gracefully', () => {
    mockUsersData = { platformAdmin: { users: { users: [], pageInfo: { hasNextPage: false } } } };
    mockOrgsData = { platformAdmin: { organizations: { organization: [], pageInfo: { hasNextPage: false } } } };
    const { result } = renderHook(() => useAccountSearch());
    expect(result.current.results).toEqual([]);
  });
});
