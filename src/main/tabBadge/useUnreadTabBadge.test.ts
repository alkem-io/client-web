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
// The badge must NOT read the sound settings (FR-009). This mock exists purely so the
// "muting changes nothing" tests below can set the flags off and prove the badge ignores
// them — if someone reintroduces the coupling, those tests fail.
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { settings: { notification: { sound: mockSound() } } } }),
}));
// jsdom never fires `img.onload` and has no canvas, so the real faviconBadge is a no-op
// under test — asserting on the live <link href> would pass even if the module were
// deleted. Mock it and assert on the calls instead.
vi.mock('./faviconBadge', () => ({
  setFaviconBadge: vi.fn(),
  clearFaviconBadge: vi.fn(),
}));

import { setBaseTitle, setTitlePrefix } from '@/core/routing/documentTitle';
import { clearFaviconBadge, setFaviconBadge } from './faviconBadge';
import { useUnreadTabBadge } from './useUnreadTabBadge';

describe('useUnreadTabBadge', () => {
  beforeEach(() => {
    setTitlePrefix('');
    setBaseTitle('Alkemio');
    mockConversations.mockReturnValue(0);
    mockNotifications.mockReturnValue(0);
    mockSound.mockReturnValue({ chatMessage: true, inAppNotification: true });
  });

  afterEach(() => {
    setTitlePrefix('');
    vi.clearAllMocks();
  });

  it('counts unread conversations plus unread notifications', () => {
    mockConversations.mockReturnValue(3);
    mockNotifications.mockReturnValue(2);

    renderHook(() => useUnreadTabBadge());

    expect(document.title).toBe('(5) Alkemio');
    expect(setFaviconBadge).toHaveBeenCalledWith(5);
  });

  // FR-009 — the badge is independent of the sound settings. These three are the
  // regression guard for the 2026-07-14 (final) reversal: muting an alert silences it
  // but must never remove it from the tab.
  it('is unchanged when the chat-message sound is off', () => {
    mockSound.mockReturnValue({ chatMessage: false, inAppNotification: true });
    mockConversations.mockReturnValue(3);
    mockNotifications.mockReturnValue(2);

    renderHook(() => useUnreadTabBadge());

    expect(document.title).toBe('(5) Alkemio');
  });

  it('is unchanged when the notification sound is off', () => {
    mockSound.mockReturnValue({ chatMessage: true, inAppNotification: false });
    mockConversations.mockReturnValue(3);
    mockNotifications.mockReturnValue(2);

    renderHook(() => useUnreadTabBadge());

    expect(document.title).toBe('(5) Alkemio');
  });

  it('still shows the full count when BOTH sounds are off', () => {
    mockSound.mockReturnValue({ chatMessage: false, inAppNotification: false });
    mockConversations.mockReturnValue(9);
    mockNotifications.mockReturnValue(9);

    renderHook(() => useUnreadTabBadge());

    expect(document.title).toBe('(18) Alkemio');
    expect(setFaviconBadge).toHaveBeenCalledWith(18);
  });

  it('shows the badge before the user settings have loaded', () => {
    mockSound.mockReturnValue(undefined);
    mockConversations.mockReturnValue(1);
    mockNotifications.mockReturnValue(1);

    renderHook(() => useUnreadTabBadge());

    expect(document.title).toBe('(2) Alkemio');
  });

  it('clears the prefix and the favicon badge when the count returns to 0', () => {
    mockConversations.mockReturnValue(2);
    const { rerender } = renderHook(() => useUnreadTabBadge());
    expect(document.title).toBe('(2) Alkemio');

    mockConversations.mockReturnValue(0);
    mockNotifications.mockReturnValue(0);
    rerender();

    expect(document.title).toBe('Alkemio');
    expect(clearFaviconBadge).toHaveBeenCalled();
  });

  it('shows no badge at all when there is nothing unread', () => {
    renderHook(() => useUnreadTabBadge());

    expect(document.title).toBe('Alkemio');
    expect(setFaviconBadge).not.toHaveBeenCalled();
    expect(clearFaviconBadge).toHaveBeenCalled();
  });
});
