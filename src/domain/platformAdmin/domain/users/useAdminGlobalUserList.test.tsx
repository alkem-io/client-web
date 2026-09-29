/**
 * @vitest-environment jsdom
 *
 * client-10: the `usersPaginated` cache eviction on delete serves the OTHER
 * readers of that root field (the Global Roles add-member search, the
 * contributor selectors) — it evicts nothing this list itself reads, so the
 * deleted row survived on screen until a manual reload. This list needs its
 * own `refetchQueries` on the delete mutation.
 */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  DeleteUserDocument,
  PlatformAdminUsersListDocument,
  PlatformLicensingPlansDocument,
} from '@/core/apollo/generated/apollo-hooks';
import useAdminGlobalUserList from './useAdminGlobalUserList';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));

const FILTER = { firstName: '', lastName: '', email: '' };
const PAGE_SIZE = 10;

const profile = (id: string, name: string) => ({
  __typename: 'Profile' as const,
  id: `${id}-profile`,
  url: `/user/${id}`,
  displayName: name,
  visual: null,
});

const user = (id: string, name: string) => ({
  __typename: 'User' as const,
  id,
  account: null,
  profile: profile(id, name),
  email: `${name.toLowerCase()}@x.io`,
});

const licensingMock: MockedResponse = {
  request: { query: PlatformLicensingPlansDocument },
  result: {
    data: {
      platform: {
        __typename: 'Platform',
        licensingFramework: {
          __typename: 'Licensing',
          id: 'licensing-1',
          authorization: { __typename: 'Authorization', id: 'auth-1', myPrivileges: [] },
          plans: [],
        },
      },
    },
  },
};

const listMock = (users: ReturnType<typeof user>[]): MockedResponse => ({
  request: { query: PlatformAdminUsersListDocument, variables: { first: PAGE_SIZE, filter: FILTER } },
  result: {
    data: {
      platformAdmin: {
        __typename: 'PlatformAdminQueryResults',
        users: {
          __typename: 'PaginatedUsers',
          total: users.length,
          users,
          pageInfo: { __typename: 'PageInfo', endCursor: null, hasNextPage: false },
        },
      },
    },
  },
});

const deleteUserMock: MockedResponse = {
  request: { query: DeleteUserDocument, variables: { input: { ID: 'user-1' } } },
  result: { data: { deleteUser: { __typename: 'User', id: 'user-1' } } },
};

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MockedProvider
    mocks={[
      licensingMock,
      listMock([user('user-1', 'Alice'), user('user-2', 'Bob')]),
      deleteUserMock,
      listMock([user('user-2', 'Bob')]),
    ]}
  >
    {children}
  </MockedProvider>
);

describe('useAdminGlobalUserList — delete refetches this list', () => {
  it('drops the deleted user from userList once the delete + refetch complete', async () => {
    const { result } = renderHook(() => useAdminGlobalUserList(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.userList).toHaveLength(2));

    await act(async () => {
      await result.current.onDelete({ id: 'user-1', value: 'Alice (alice@x.io)' } as never as Parameters<
        typeof result.current.onDelete
      >[0]);
    });

    await waitFor(() => expect(result.current.userList).toHaveLength(1));
    expect(result.current.userList[0].id).toBe('user-2');
  });
});
