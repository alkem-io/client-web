import { renderHook } from '@testing-library/react';
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
}));

vi.mock('@/core/logging/sentry/log', () => ({
  error: vi.fn(),
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
    refetch: vi.fn(),
  }),
  useInAppNotificationsUnreadCountQuery: () => ({ data: { me: { notificationsUnreadCount: 2 } } }),
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

  it('leaves hidden unread notifications alone while a visible unread one remains', () => {
    state.rows = [row('visible', true), row('broken', false)];
    renderHook(() => useInAppNotifications());

    expect(state.updateState).not.toHaveBeenCalled();
  });
});
