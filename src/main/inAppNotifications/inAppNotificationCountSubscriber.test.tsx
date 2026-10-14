import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type OnData = (options: {
  client: { cache: { updateQuery: () => void } };
  data: { data?: { notificationsUnreadCount: number }; error?: Error };
}) => void;

const harness = vi.hoisted(() => ({
  onData: undefined as OnData | undefined,
  playSound: vi.fn(),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  InAppNotificationsUnreadCountDocument: {},
  useNotificationsUnreadCountSubscription: (options: { onData: OnData }) => {
    harness.onData = options.onData;
  },
}));
vi.mock('@/core/apollo/hooks/useApolloErrorHandler', () => ({ useApolloErrorHandler: () => vi.fn() }));
vi.mock('@/core/sound/soundPlayer', () => ({ playSound: harness.playSound }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));
vi.mock('@/main/inAppNotifications/InAppNotificationsContext', () => ({
  useInAppNotificationsContext: () => ({ isEnabled: true }),
}));
vi.mock('@/main/inAppNotifications/useInAppNotifications', () => ({ NOTIFICATION_EVENT_TYPES: [] }));

import { InAppNotificationCountSubscriber } from './inAppNotificationCountSubscriber';

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  document.dispatchEvent(new Event('visibilitychange'));
};

const pushCount = (count: number) =>
  act(() => {
    harness.onData?.({
      client: { cache: { updateQuery: vi.fn() } },
      data: { data: { notificationsUnreadCount: count } },
    });
  });

describe('InAppNotificationCountSubscriber sound', () => {
  beforeEach(() => {
    harness.playSound.mockClear();
    harness.onData = undefined;
    localStorage.clear();
  });

  afterEach(() => {
    setVisibility('visible');
    localStorage.clear();
  });

  it('plays once on a count increase in the tab the user saw last', () => {
    setVisibility('visible');
    render(<InAppNotificationCountSubscriber />);

    pushCount(0);
    pushCount(1);

    expect(harness.playSound).toHaveBeenCalledTimes(1);
    expect(harness.playSound).toHaveBeenCalledWith('notification');
  });

  it('keeps playing in that tab while the user is away in another application', () => {
    setVisibility('visible');
    render(<InAppNotificationCountSubscriber />);
    setVisibility('hidden');

    pushCount(0);
    pushCount(1);

    expect(harness.playSound).toHaveBeenCalledTimes(1);
  });

  it('stays silent in a tab that is not the one the user saw last', () => {
    setVisibility('visible');
    render(<InAppNotificationCountSubscriber />);
    setVisibility('hidden');
    // Another tab of the same origin became the one the user is looking at.
    localStorage.setItem('alkemio.sound.ownerTab', 'another-tab');

    pushCount(0);
    pushCount(1);

    expect(harness.playSound).not.toHaveBeenCalled();
  });

  it('stays silent in a tab opened in the background, and showing it later plays nothing', () => {
    localStorage.setItem('alkemio.sound.ownerTab', 'the-opener-tab');
    setVisibility('hidden');
    render(<InAppNotificationCountSubscriber />);

    pushCount(0);
    pushCount(1);
    setVisibility('visible');

    expect(harness.playSound).not.toHaveBeenCalled();
  });
});
