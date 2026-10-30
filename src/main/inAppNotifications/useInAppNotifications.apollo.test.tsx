import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { typePolicies } from '@/core/apollo/config/typePolicies';
import { InAppNotificationsUnreadCountDocument } from '@/core/apollo/generated/apollo-hooks';
import {
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { NotificationFilterType } from './notificationFilters';
import { useInAppNotifications } from './useInAppNotifications';

const context = vi.hoisted(() => ({ selectedFilter: 'ALL' as string }));

vi.mock('@/core/logging/sentry/log', () => ({
  error: vi.fn(),
  TagCategoryValues: { NOTIFICATIONS: 'notifications' },
}));

vi.mock('./InAppNotificationsContext', () => ({
  useInAppNotificationsContext: () => ({ isEnabled: true, isOpen: true, selectedFilter: context.selectedFilter }),
}));

type ServerRow = { id: string; type: NotificationEvent };

const toNotification = ({ id, type }: ServerRow) => ({
  __typename: 'InAppNotification',
  id,
  type,
  category: NotificationEventCategory.User,
  state: NotificationEventInAppState.Unread,
  triggeredAt: '2026-10-01T00:00:00Z',
  triggeredBy: {
    __typename: 'Actor',
    id: `actor-${id}`,
    profile: {
      __typename: 'Profile',
      id: `profile-${id}`,
      displayName: 'Ann',
      url: '/user/ann',
      visual: { __typename: 'Visual', id: `visual-${id}`, uri: '', name: 'AVATAR', alternativeText: null },
    },
  },
  payload: { __typename: 'InAppNotificationPayload', type: 'USER_MENTIONED' },
});

// A server holding notifications newest first. Each request reads the rows when it is
// sent and answers only once released, like a response that is still on the wire.
const createServer = () => {
  const server = {
    rows: [] as ServerRow[],
    held: [] as Array<() => void>,
    holding: false,
    release: () => {
      const held = server.held.splice(0);
      for (const deliver of held) deliver();
    },
  };
  const link = new ApolloLink(
    operation =>
      new Observable(observer => {
        const { types, first, after } = operation.variables as {
          types?: NotificationEvent[];
          first: number;
          after?: string;
        };
        const matching = server.rows.filter(({ type }) => !types?.length || types.includes(type));
        const start = after ? matching.findIndex(({ id }) => id === after) + 1 : 0;
        const page = matching.slice(start, start + first);
        const data = {
          me: {
            __typename: 'MeQueryResults',
            notifications: {
              __typename: 'PaginatedInAppNotifications',
              inAppNotifications: page.map(toNotification),
              pageInfo: {
                __typename: 'PageInfo',
                endCursor: page.length ? page[page.length - 1].id : null,
                hasNextPage: start + first < matching.length,
              },
              total: matching.length,
            },
          },
        };
        const deliver = () => {
          observer.next({ data });
          observer.complete();
        };
        if (server.holding) server.held.push(deliver);
        else setTimeout(deliver);
      })
  );
  const client = new ApolloClient({ cache: new InMemoryCache({ typePolicies }), link });
  return { server, client };
};

// What the count subscriber does when the server reports a new unread count
const pushUnreadCount = (client: ApolloClient<unknown>, count: number) =>
  act(() => {
    client.writeQuery({
      query: InAppNotificationsUnreadCountDocument,
      data: { me: { __typename: 'MeQueryResults', notificationsUnreadCount: count } },
    });
  });

const mention = (id: string): ServerRow => ({ id, type: NotificationEvent.UserMentioned });
const spaceUpdate = (id: string): ServerRow => ({ id, type: NotificationEvent.SpaceCommunicationUpdate });
const ids = (prefix: string, count: number) => Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);

const setup = (rows: ServerRow[], { holding = false } = {}) => {
  const { server, client } = createServer();
  server.rows = rows;
  server.holding = holding;
  client.writeQuery({
    query: InAppNotificationsUnreadCountDocument,
    data: { me: { __typename: 'MeQueryResults', notificationsUnreadCount: rows.length } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  const hook = renderHook(() => useInAppNotifications(), { wrapper });
  const shownIds = () => hook.result.current.notificationsInApp.map(({ id }) => id);
  return { server, client, hook, shownIds };
};

describe('useInAppNotifications — notifications arriving while the dialog is open (real Apollo client)', () => {
  beforeEach(() => {
    context.selectedFilter = NotificationFilterType.All;
  });

  it('shows a notification that arrives while the opening request is still on the wire', async () => {
    const { server, client, shownIds } = setup([mention('a')], { holding: true });
    await waitFor(() => expect(server.held.length).toBe(2));

    // The opening requests already read the server; then a notification arrives
    server.rows = [mention('new'), ...server.rows];
    await pushUnreadCount(client, 2);
    server.holding = false;
    await act(async () => server.release());

    await waitFor(() => expect(shownIds()).toEqual(['new', 'a']));
  });

  it('shows a notification for the tab the user switched to while an earlier refresh was still pending', async () => {
    const { server, client, hook, shownIds } = setup([mention('m1'), spaceUpdate('s1')]);
    await waitFor(() => expect(shownIds()).toEqual(['m1', 's1']));

    // A notification arrives; its refresh of the All tab stays on the wire
    server.holding = true;
    server.rows = [mention('m2'), ...server.rows];
    await pushUnreadCount(client, 3);
    await waitFor(() => expect(server.held.length).toBe(2));

    // The user moves to the Space tab, which loads; then a Space notification arrives
    server.holding = false;
    context.selectedFilter = NotificationFilterType.Space;
    hook.rerender();
    await waitFor(() => expect(shownIds()).toEqual(['s1']));
    server.rows = [spaceUpdate('s2'), ...server.rows];
    await pushUnreadCount(client, 4);

    await act(async () => server.release());
    await waitFor(() => expect(shownIds()).toEqual(['s2', 's1']));
  });

  it('leaves no gap when more notifications arrive than fit in one page', async () => {
    const { server, client, hook, shownIds } = setup(ids('old', 15).map(mention));
    await waitFor(() => expect(shownIds()).toEqual(ids('old', 10)));

    server.rows = [...ids('new', 12).map(mention), ...server.rows];
    await pushUnreadCount(client, 27);
    await waitFor(() => expect(shownIds()).toEqual(ids('new', 10)));

    await act(() => hook.result.current.fetchMore());
    await waitFor(() => expect(shownIds()).toEqual([...ids('new', 12), ...ids('old', 8)]));
  });

  it('keeps every loaded page when a notification arrives after "load more"', async () => {
    const { server, client, hook, shownIds } = setup(ids('old', 25).map(mention));
    await waitFor(() => expect(shownIds()).toHaveLength(10));
    await act(() => hook.result.current.fetchMore());
    await waitFor(() => expect(shownIds()).toEqual(ids('old', 20)));

    server.rows = [mention('new'), ...server.rows];
    await pushUnreadCount(client, 26);
    await waitFor(() => expect(shownIds()).toEqual(['new', ...ids('old', 20)]));

    await act(() => hook.result.current.fetchMore());
    await waitFor(() => expect(shownIds()).toEqual(['new', ...ids('old', 25)]));
    expect(hook.result.current.hasMore).toBe(false);
  });
});
