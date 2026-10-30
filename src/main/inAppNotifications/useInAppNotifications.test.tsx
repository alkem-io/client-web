import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { NotificationFilterType } from './notificationFilters';
import { IN_APP_NOTIFICATIONS_PAGE_SIZE, useInAppNotifications } from './useInAppNotifications';

type Row = {
  id: string;
  type: NotificationEvent;
  category: NotificationEventCategory;
  state: NotificationEventInAppState;
  triggeredAt: Date;
  triggeredBy: unknown;
  payload: { type: string };
};

const state = vi.hoisted(() => ({
  rows: [] as unknown[],
  updateState: vi.fn(),
  unreadCount: 2 as number | undefined,
  selectedFilter: 'all' as string,
  refetch: vi.fn(),
  fetchMore: vi.fn(),
}));

vi.mock('@/core/logging/sentry/log', () => ({
  error: vi.fn(),
  TagCategoryValues: { NOTIFICATIONS: 'notifications' },
}));

vi.mock('./InAppNotificationsContext', () => ({
  useInAppNotificationsContext: () => ({
    isEnabled: true,
    isOpen: true,
    selectedFilter: state.selectedFilter,
  }),
}));

const queryResult = () => ({
  me: {
    notifications: {
      inAppNotifications: state.rows,
      pageInfo: { endCursor: undefined, hasNextPage: false },
      total: state.rows.length,
    },
  },
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  // The panel page and the all-types probe both read the same fetched rows here.
  useInAppNotificationsQuery: (options: { variables: { first: number } }) => ({
    data: queryResult(),
    loading: false,
    error: undefined,
    fetchMore: state.fetchMore,
    refetch: () => Promise.resolve(state.refetch(options.variables.first)),
  }),
  useInAppNotificationsUnreadCountQuery: () => ({
    data: state.unreadCount === undefined ? undefined : { me: { notificationsUnreadCount: state.unreadCount } },
  }),
  useUpdateNotificationStateMutation: () => [state.updateState],
  useMarkNotificationsAsReadMutation: () => [vi.fn()],
}));

const row = (id: string, renderable: boolean, notificationState = NotificationEventInAppState.Unread): Row => ({
  id,
  type: NotificationEvent.UserMentioned,
  category: NotificationEventCategory.User,
  state: notificationState,
  triggeredAt: new Date('2026-10-01T00:00:00Z'),
  // A deleted triggering actor comes back as null, which the panel cannot render.
  triggeredBy: renderable
    ? { id: `actor-${id}`, profile: { id: `p-${id}`, displayName: 'Ann', url: '/user/ann', visual: { uri: '' } } }
    : null,
  payload: { type: 'USER_MENTIONED' },
});

const markedReadIds = () => state.updateState.mock.calls.map(([options]) => options.variables.ID);

describe('useInAppNotifications — unread notifications the panel cannot show', () => {
  beforeEach(() => {
    state.updateState.mockReset();
    state.updateState.mockResolvedValue({ data: { updateNotificationState: NotificationEventInAppState.Read } });
  });

  it('marks hidden unread notifications read once no visible unread one is left', () => {
    state.rows = [row('visible', true, NotificationEventInAppState.Read), row('broken', false)];
    const { result } = renderHook(() => useInAppNotifications());

    expect(result.current.notificationsInApp.map(n => n.id)).toEqual(['visible']);
    expect(markedReadIds()).toEqual(['broken']);
    expect(state.updateState.mock.calls[0][0].context).toEqual({ skipGlobalErrorHandler: true });
  });

  it('sends each hidden notification once across hook instances and re-renders', () => {
    state.rows = [row('broken-a', false), row('broken-b', false)];
    const first = renderHook(() => useInAppNotifications());
    renderHook(() => useInAppNotifications());
    // A cache write gives the query results a new identity while the requests are in flight.
    state.rows = [...state.rows];
    first.rerender();

    expect(markedReadIds()).toEqual(['broken-a', 'broken-b']);
  });

  it('leaves hidden unread notifications alone while a visible unread one remains', () => {
    state.rows = [row('visible', true), row('broken', false)];
    renderHook(() => useInAppNotifications());

    expect(state.updateState).not.toHaveBeenCalled();
  });
});

describe('useInAppNotifications — a notification arriving while the dialog is open', () => {
  beforeEach(() => {
    state.rows = [];
    state.unreadCount = 2;
    state.selectedFilter = NotificationFilterType.All;
    state.refetch.mockReset();
    state.fetchMore.mockReset();
    state.fetchMore.mockResolvedValue({});
  });

  it('refetches the per-tab probe and pulls the newest page into the list when the unread count rises', () => {
    const { rerender } = renderHook(() => useInAppNotifications());
    expect(state.refetch).not.toHaveBeenCalled();
    expect(state.fetchMore).not.toHaveBeenCalled();

    state.unreadCount = 3;
    rerender();

    expect(state.refetch.mock.calls.map(([first]) => first)).toEqual([50]);
    expect(state.fetchMore).toHaveBeenCalledTimes(1);
    expect(state.fetchMore.mock.calls[0][0].variables).toEqual(
      expect.objectContaining({ first: IN_APP_NOTIFICATIONS_PAGE_SIZE })
    );
    expect(state.fetchMore.mock.calls[0][0].variables.after).toBeUndefined();
  });

  it('keeps the pages already loaded with "load more" and their cursor when the new notification arrives', () => {
    const { rerender } = renderHook(() => useInAppNotifications());
    state.unreadCount = 3;
    rerender();

    const page = (ids: string[], endCursor: string, hasNextPage: boolean) => ({
      me: {
        notifications: {
          inAppNotifications: ids.map(id => row(id, true)),
          pageInfo: { endCursor, hasNextPage },
          total: 30,
        },
      },
    });
    // Two pages loaded; the newest page now starts with the arrived notification.
    const prev = page(['a', 'b', 'c', 'd'], 'cursor-d', true);
    const newest = page(['new', 'a', 'b'], 'cursor-b', true);

    const { updateQuery } = state.fetchMore.mock.calls[0][0];
    const merged = updateQuery(prev, { fetchMoreResult: newest });

    expect(merged.me.notifications.inAppNotifications.map((n: Row) => n.id)).toEqual(['new', 'a', 'b', 'c', 'd']);
    expect(merged.me.notifications.pageInfo).toEqual({ endCursor: 'cursor-d', hasNextPage: true });
  });

  it('does not refetch when the unread count falls or stays the same', () => {
    const { rerender } = renderHook(() => useInAppNotifications());

    rerender();
    state.unreadCount = 1;
    rerender();

    expect(state.refetch).not.toHaveBeenCalled();
  });

  it('refreshes the open dialog when the first unread count arrives after the list', () => {
    state.unreadCount = undefined;
    const { rerender } = renderHook(() => useInAppNotifications());
    expect(state.fetchMore).not.toHaveBeenCalled();

    state.unreadCount = 3;
    rerender();

    expect(state.fetchMore).toHaveBeenCalledTimes(1);
    expect(state.refetch.mock.calls.map(([first]) => first)).toEqual([50]);
  });

  it('drops a newest-page response that arrives after the user switched to another filter', () => {
    const { rerender } = renderHook(() => useInAppNotifications());
    state.unreadCount = 3;
    rerender();

    state.selectedFilter = NotificationFilterType.Space;
    rerender();

    const spaceList = {
      me: {
        notifications: {
          inAppNotifications: [row('space-1', true)],
          pageInfo: { endCursor: 'cursor-space-1', hasNextPage: false },
          total: 1,
        },
      },
    };
    const allResponse = {
      me: {
        notifications: {
          inAppNotifications: [row('mention', true)],
          pageInfo: { endCursor: 'cursor-mention', hasNextPage: true },
          total: 30,
        },
      },
    };
    const { updateQuery } = state.fetchMore.mock.calls[0][0];

    expect(updateQuery(spaceList, { fetchMoreResult: allResponse })).toBe(spaceList);
  });
});
