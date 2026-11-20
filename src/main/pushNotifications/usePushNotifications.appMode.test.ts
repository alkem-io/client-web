import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * SC-004 / P4 — in app mode the page raises **no** web-push subscription, so a
 * single server-side event cannot arrive twice (once natively, once through the
 * service worker).
 *
 * The Push API is deliberately mounted as **present** on the mocked window.
 * Asserting "a WebView has no Push API" would be vacuous (unverified assumption
 * A-2) and is also false in practice — sandbox web push is configured and live.
 * The only thing standing between this window and a browser subscription is the
 * `!isAppMode()` term in `usePushNotifications`; delete it and case 2 goes red.
 */

const isAppMode = vi.hoisted(() => vi.fn<() => boolean>());
const subscribeMutation = vi.hoisted(() => vi.fn());

vi.mock('@/core/appMode/isAppMode', () => ({ isAppMode }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  // A real key: the hook feeds it through `urlBase64ToUint8Array`, so a bogus
  // one would throw before `pushManager.subscribe` and make case 2 pass for the
  // wrong reason.
  useVapidPublicKeyQuery: () => ({ data: { vapidPublicKey: 'QUJDREVG' }, loading: false }),
  useSubscribeToPushNotificationsMutation: () => [subscribeMutation],
  useUnsubscribeFromPushNotificationsMutation: () => [vi.fn()],
}));

import { usePushNotifications } from './usePushNotifications';

const pushManagerSubscribe = vi.fn();

describe('usePushNotifications — app mode (SC-004)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeMutation.mockResolvedValue({ data: { subscribeToPushNotifications: { id: 'sub-1' } } });
    pushManagerSubscribe.mockResolvedValue({
      toJSON: () => ({ endpoint: 'https://push.example/endpoint', keys: { p256dh: 'p', auth: 'a' } }),
      unsubscribe: vi.fn(),
    });

    // The full browser push capability set, present.
    Object.defineProperty(window, 'PushManager', { value: class {}, configurable: true });
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'granted', requestPermission: vi.fn().mockResolvedValue('granted') },
      configurable: true,
    });
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: { subscribe: pushManagerSubscribe, getSubscription: vi.fn().mockResolvedValue(null) },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'PushManager');
    Reflect.deleteProperty(window, 'Notification');
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('reports push as unsupported even though the browser Push API is fully present', () => {
    isAppMode.mockReturnValue(true);

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isSupported).toBe(false);
  });

  it('subscribe() raises neither a browser subscription nor the server mutation', async () => {
    isAppMode.mockReturnValue(true);

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.subscribe();
    });

    expect(pushManagerSubscribe).not.toHaveBeenCalled();
    expect(subscribeMutation).not.toHaveBeenCalled();
  });

  it('still reports push as supported on the same window outside app mode (the mirror case)', () => {
    isAppMode.mockReturnValue(false);

    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isSupported).toBe(true);
  });
});
