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

type ServerRow = { id: string; type: NotificationEvent; at: string };

const toNotification = ({ id, type, at }: ServerRow) => ({
  __typename: 'InAppNotification',
  id,
  type,
  category: NotificationEventCategory.User,
  state: NotificationEventInAppState.Unread,
  triggeredAt: at,
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
    // Page sizes of the requests answered so far: 10 for the list, 50 for the all-types probe
    answered: [] as number[],
    held: [] as Array<() => void>,
    sendCount: (_count: number) => {},
    holding: false,
    release: () => {
      const held = server.held.splice(0);
      for (const deliver of held) deliver();
    },
  };
  const link = new ApolloLink(
    operation =>
      new Observable(observer => {
        // A first unread count still on the wire, answered when the test sends it
        if (operation.operationName === 'InAppNotificationsUnreadCount') {
          server.sendCount = (count: number) => {
            observer.next({ data: { me: { __typename: 'MeQueryResults', notificationsUnreadCount: count } } });
            observer.complete();
          };
          return;
        }
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
          server.answered.push(first);
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

// Rows are listed newest first; `minute` orders them in time.
const minuteAt = (minute: number) => new Date(Date.UTC(2026, 9, 1, 0, minute)).toISOString();
const mention = (id: string, minute = 0): ServerRow => ({
  id,
  type: NotificationEvent.UserMentioned,
  at: minuteAt(minute),
});
const spaceUpdate = (id: string, minute = 0): ServerRow => ({
  id,
  type: NotificationEvent.SpaceCommunicationUpdate,
  at: minuteAt(minute),
});
const ids = (prefix: string, count: number) => Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
// `count` older mentions, newest first, all before minute 100
const olderMentions = (count: number) => ids('old', count).map((id, i) => mention(id, 99 - i));

const setup = (rows: ServerRow[], { holding = false, countKnown = true } = {}) => {
  const { server, client } = createServer();
  server.rows = rows;
  server.holding = holding;
  if (countKnown) {
    client.writeQuery({
      query: InAppNotificationsUnreadCountDocument,
      data: { me: { __typename: 'MeQueryResults', notificationsUnreadCount: rows.length } },
    });
  }
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

  it('offers a new notification without changing the list the user is reading', async () => {
    const { server, client, hook, shownIds } = setup(olderMentions(25));
    await waitFor(() => expect(shownIds()).toHaveLength(10));
    await act(() => hook.result.current.fetchMore());
    await waitFor(() => expect(shownIds()).toEqual(ids('old', 20)));
    expect(hook.result.current.hasNewNotifications).toBe(false);

    server.rows = [mention('new', 200), ...server.rows];
    await pushUnreadCount(client, 26);

    await waitFor(() => expect(hook.result.current.hasNewNotifications).toBe(true));
    expect(shownIds()).toEqual(ids('old', 20));
    // Only the all-types probe went back to the server; the list was not re-read
    expect(server.answered.filter(first => first === 10)).toHaveLength(2);
  });

  it('shows the new notification at the top once the user asks for it', async () => {
    const { server, client, hook, shownIds } = setup(olderMentions(15));
    await waitFor(() => expect(shownIds()).toEqual(ids('old', 10)));

    server.rows = [mention('new', 200), ...server.rows];
    await pushUnreadCount(client, 16);
    await waitFor(() => expect(hook.result.current.hasNewNotifications).toBe(true));

    act(() => hook.result.current.showNewNotifications());

    await waitFor(() => expect(shownIds()).toEqual(['new', ...ids('old', 9)]));
    expect(hook.result.current.hasNewNotifications).toBe(false);
  });

  it('offers a notification that arrives while the opening requests are still on the wire', async () => {
    const { server, client, hook, shownIds } = setup([mention('a', 0)], { holding: true });
    await waitFor(() => expect(server.held.length).toBe(2));

    // The opening requests already read the server; then a notification arrives
    server.rows = [mention('new', 200), ...server.rows];
    await pushUnreadCount(client, 2);
    server.holding = false;
    await act(async () => server.release());

    await waitFor(() => expect(hook.result.current.hasNewNotifications).toBe(true));
    expect(shownIds()).toEqual(['a']);
  });

  it('offers a notification that arrives before the first unread count does', async () => {
    const { server, hook, shownIds } = setup([mention('a', 0)], { countKnown: false });
    await waitFor(() => expect(shownIds()).toEqual(['a']));

    server.rows = [mention('new', 200), ...server.rows];
    await act(async () => server.sendCount(2));

    await waitFor(() => expect(hook.result.current.hasNewNotifications).toBe(true));
    expect(shownIds()).toEqual(['a']);
  });

  it('offers only what belongs to the selected tab, and still lights the other tab', async () => {
    context.selectedFilter = NotificationFilterType.Space;
    const { server, client, hook, shownIds } = setup([spaceUpdate('s1', 10), mention('m1', 0)]);
    await waitFor(() => expect(shownIds()).toEqual(['s1']));
    const answeredBefore = server.answered.length;

    server.rows = [mention('m2', 200), ...server.rows];
    await pushUnreadCount(client, 3);

    await waitFor(() => expect(hook.result.current.unreadCountsByFilter[NotificationFilterType.All]).toBe(3));
    expect(hook.result.current.unreadCountsByFilter[NotificationFilterType.MessagesAndReplies]).toBe(2);
    expect(server.answered.length).toBe(answeredBefore + 1);
    expect(hook.result.current.hasNewNotifications).toBe(false);
  });

  it('offers nothing when the count rises without a newer notification (one marked unread)', async () => {
    const { server, client, hook, shownIds } = setup([mention('a', 10), mention('b', 0)]);
    await waitFor(() => expect(shownIds()).toEqual(['a', 'b']));
    const answeredBefore = server.answered.length;

    await pushUnreadCount(client, 3);

    await waitFor(() => expect(server.answered.length).toBe(answeredBefore + 1));
    expect(hook.result.current.hasNewNotifications).toBe(false);
  });
});
