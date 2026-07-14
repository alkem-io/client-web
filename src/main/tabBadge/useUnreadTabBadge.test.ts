import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockConversations = vi.fn<() => number>();
const mockNotifications = vi.fn<() => number>();
const mockSound = vi.fn<() => { chatMessage: boolean; inAppNotification: boolean } | undefined>();

vi.mock('@/main/userMessaging/useUnreadConversationsCount', () => ({
  useUnreadConversationsCount: () => mockConversations(),
}));
vi.mock('@/main/inAppNotifications/useUnreadNotificationsCount', () => ({
  useUnreadNotificationsCount: () => mockNotifications(),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { settings: { notification: { sound: mockSound() } } } }),
}));

import { setBaseTitle, setTitlePrefix } from '@/core/routing/documentTitle';
import { useUnreadTabBadge } from './useUnreadTabBadge';

const faviconHref = () => document.querySelector('link[rel="icon"][sizes="32x32"]')?.getAttribute('href');

describe('useUnreadTabBadge', () => {
  beforeEach(() => {
    setTitlePrefix('');
    setBaseTitle('Alkemio');
    document.head.innerHTML = '<link rel="icon" sizes="32x32" type="image/png" href="/favicon-32x32.png" />';
    mockConversations.mockReturnValue(0);
    mockNotifications.mockReturnValue(0);
    mockSound.mockReturnValue({ chatMessage: true, inAppNotification: true });
  });

  afterEach(() => {
    setTitlePrefix('');
    vi.clearAllMocks();
  });

  it('both toggles on: count is unread conversations + unread notifications', () => {
    mockConversations.mockReturnValue(3);
    mockNotifications.mockReturnValue(2);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(5) Alkemio');
  });

  it('notification sound off: counts only unread conversations', () => {
    mockSound.mockReturnValue({ chatMessage: true, inAppNotification: false });
    mockConversations.mockReturnValue(3);
    mockNotifications.mockReturnValue(2);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(3) Alkemio');
  });

  it('chat-message sound off: counts only unread notifications', () => {
    mockSound.mockReturnValue({ chatMessage: false, inAppNotification: true });
    mockConversations.mockReturnValue(3);
    mockNotifications.mockReturnValue(2);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(2) Alkemio');
  });

  it('both toggles off: no prefix and the original favicon is restored, regardless of counts', () => {
    mockSound.mockReturnValue({ chatMessage: false, inAppNotification: false });
    mockConversations.mockReturnValue(9);
    mockNotifications.mockReturnValue(9);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('Alkemio');
    expect(faviconHref()).toBe('/favicon-32x32.png');
  });

  it('defaults both channels on when the sound settings have not loaded', () => {
    mockSound.mockReturnValue(undefined);
    mockConversations.mockReturnValue(1);
    mockNotifications.mockReturnValue(1);
    renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(2) Alkemio');
  });

  it('clears the prefix and restores the favicon when the composed count returns to 0', () => {
    mockConversations.mockReturnValue(2);
    const { rerender } = renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(2) Alkemio');

    mockConversations.mockReturnValue(0);
    mockNotifications.mockReturnValue(0);
    rerender();
    expect(document.title).toBe('Alkemio');
    expect(faviconHref()).toBe('/favicon-32x32.png');
  });
});
