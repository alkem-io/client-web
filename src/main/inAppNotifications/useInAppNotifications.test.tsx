import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  NotificationEvent,
  NotificationEventCategory,
  NotificationEventInAppState,
} from '@/core/apollo/generated/graphql-schema';
import { useInAppNotifications } from './useInAppNotifications';

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
  markAsRead: vi.fn(),
  refetch: vi.fn(),
  logError: vi.fn(),
}));

vi.mock('@/core/logging/sentry/log', () => ({
  error: state.logError,
  TagCategoryValues: { NOTIFICATIONS: 'notifications' },
}));

vi.mock('./InAppNotificationsContext', async () => {
  const { NotificationFilterType } = await import('./notificationFilters');
  return {
    useInAppNotificationsContext: () => ({
      isEnabled: true,
      isOpen: true,
      selectedFilter: NotificationFilterType.All,
    }),
  };
});

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
  useInAppNotificationsQuery: () => ({
    data: queryResult(),
    loading: false,
    error: undefined,
    fetchMore: vi.fn(),
    refetch: state.refetch,
  }),
  useInAppNotificationsUnreadCountQuery: () => ({ data: { me: { notificationsUnreadCount: 2 } } }),
  useUpdateNotificationStateMutation: () => [state.updateState],
  useMarkNotificationsAsReadMutation: () => [state.markAsRead],
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

const markedReadIds = () =>
  state.updateState.mock.calls
    .map(([options]) => options.variables)
    .filter(variables => variables.state === NotificationEventInAppState.Read)
    .map(variables => variables.ID);

describe('useInAppNotifications — unread notifications the panel cannot show', () => {
  beforeEach(() => {
    state.updateState.mockReset();
    state.markAsRead.mockReset();
    state.refetch.mockReset();
    state.logError.mockReset();
    state.updateState.mockImplementation(async (options: { variables: { state: NotificationEventInAppState } }) => ({
      data: { updateNotificationState: options.variables.state },
    }));
  });

  it('marks the hidden unread notification read once the last visible unread one is read', async () => {
    state.rows = [row('visible', true), row('broken', false)];
    const { result } = renderHook(() => useInAppNotifications());

    expect(result.current.notificationsInApp.map(n => n.id)).toEqual(['visible']);

    await act(() => result.current.updateNotificationState('visible', NotificationEventInAppState.Read));

    expect(markedReadIds()).toEqual(['visible', 'broken']);
    const hiddenCall = state.updateState.mock.calls[1][0];
    expect(hiddenCall.context).toEqual({ skipGlobalErrorHandler: true });
  });

  it('leaves the hidden unread notification alone while a visible unread one remains', async () => {
    state.rows = [row('visible-1', true), row('visible-2', true), row('broken', false)];
    const { result } = renderHook(() => useInAppNotifications());

    await act(() => result.current.updateNotificationState('visible-1', NotificationEventInAppState.Read));

    expect(markedReadIds()).toEqual(['visible-1']);
  });

  it('does not mark anything extra when a notification is marked unread', async () => {
    state.rows = [row('visible', true, NotificationEventInAppState.Read), row('broken', false)];
    const { result } = renderHook(() => useInAppNotifications());

    await act(() => result.current.updateNotificationState('visible', NotificationEventInAppState.Unread));

    expect(state.updateState).toHaveBeenCalledTimes(1);
  });

  it('does not mark anything extra when the user action itself fails', async () => {
    state.rows = [row('visible', true), row('broken', false)];
    state.updateState.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useInAppNotifications());

    await act(() => result.current.updateNotificationState('visible', NotificationEventInAppState.Read));

    expect(state.updateState).toHaveBeenCalledTimes(1);
  });

  it('logs, without throwing, when marking the hidden notification fails', async () => {
    state.rows = [row('visible', true), row('broken', false)];
    state.updateState
      .mockResolvedValueOnce({ data: { updateNotificationState: NotificationEventInAppState.Read } })
      .mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useInAppNotifications());

    await act(() => result.current.updateNotificationState('visible', NotificationEventInAppState.Read));

    expect(markedReadIds()).toEqual(['visible', 'broken']);
    expect(state.logError).toHaveBeenCalledWith(
      'Failed to mark hidden InAppNotifications as read',
      expect.objectContaining({ label: 'ids=broken' })
    );
  });

  it('after mark-all, marks hidden unread rows the refetched lists still report', async () => {
    state.rows = [row('visible', true), row('broken', false)];
    state.markAsRead.mockResolvedValue({ data: { markNotificationsAsRead: true } });
    // Refetch resolves only after a delay, so the check must wait for it rather
    // than read the rows from before the mark.
    state.refetch.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => {
            state.rows = [row('visible', true, NotificationEventInAppState.Read), row('broken', false)];
            resolve({ data: queryResult() });
          }, 20)
        )
    );
    const { result } = renderHook(() => useInAppNotifications());

    await act(() => result.current.markNotificationsAsRead());

    expect(state.refetch).toHaveBeenCalledTimes(2);
    expect(markedReadIds()).toEqual(['broken']);
  });
});
