import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PUSH_SUBSCRIPTION_ID_KEY, PUSH_USER_DISABLED_KEY } from '@/main/pushNotifications/constants';

const subscribeMutationMock = vi.fn();
const unsubscribeMutationMock = vi.fn();
const vapidQuery = { current: { data: { vapidPublicKey: 'BVAPIDKEY' }, loading: false } };

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSubscribeToPushNotificationsMutation: () => [subscribeMutationMock, { loading: false }] as const,
  useUnsubscribeFromPushNotificationsMutation: () => [unsubscribeMutationMock, { loading: false }] as const,
  useVapidPublicKeyQuery: () => vapidQuery.current,
}));

// Deterministic key conversion — the real impl uses atob, irrelevant to the flow under test.
vi.mock('@/main/pushNotifications/urlBase64ToUint8Array', () => ({
  urlBase64ToUint8Array: () => new Uint8Array([1, 2, 3]),
}));

const { usePushNotifications } = await import('../usePushNotifications');

// --- browser-API stubs (jsdom has none of these) ---
let notificationPermission: NotificationPermission = 'default';
const requestPermissionMock = vi.fn();
const pushSubscribeMock = vi.fn();
const pushGetSubscriptionMock = vi.fn();
const browserUnsubscribeMock = vi.fn();

const browserSubscription = {
  toJSON: () => ({ endpoint: 'https://push.example/abc', keys: { p256dh: 'p256dh-key', auth: 'auth-key' } }),
  unsubscribe: browserUnsubscribeMock,
};

const installBrowserPushApis = () => {
  vi.stubGlobal('PushManager', function PushManager() {});
  vi.stubGlobal('Notification', {
    get permission() {
      return notificationPermission;
    },
    requestPermission: requestPermissionMock,
  });
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      ready: Promise.resolve({
        pushManager: { subscribe: pushSubscribeMock, getSubscription: pushGetSubscriptionMock },
      }),
    },
  });
  Object.defineProperty(navigator, 'storage', {
    configurable: true,
    // large quota → not treated as private browsing
    value: { estimate: () => Promise.resolve({ quota: 500_000_000 }) },
  });
};

beforeEach(() => {
  localStorage.clear();
  notificationPermission = 'default';
  requestPermissionMock.mockReset().mockResolvedValue('granted');
  pushSubscribeMock.mockReset().mockResolvedValue(browserSubscription);
  pushGetSubscriptionMock.mockReset().mockResolvedValue(null); // not subscribed initially
  browserUnsubscribeMock.mockReset().mockResolvedValue(undefined);
  subscribeMutationMock
    .mockReset()
    .mockResolvedValue({ data: { subscribeToPushNotifications: { id: 'server-sub-1' } } });
  unsubscribeMutationMock.mockReset().mockResolvedValue({ data: {} });
  vapidQuery.current = { data: { vapidPublicKey: 'BVAPIDKEY' }, loading: false };
  installBrowserPushApis();
});

afterEach(() => {
  vi.unstubAllGlobals();
  // navigator.serviceWorker / .storage are re-defined by installBrowserPushApis() in each
  // beforeEach (configurable descriptors), and vitest isolates the jsdom env per file, so no
  // explicit teardown is needed here.
  vi.clearAllMocks();
});

describe('usePushNotifications — subscribe', () => {
  test('reports support when the browser push APIs are present', () => {
    const { result } = renderHook(() => usePushNotifications());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isServerEnabled).toBe(true);
  });

  test('subscribes: requests permission, registers with the server, and persists the id', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.subscribe();
    });

    expect(requestPermissionMock).toHaveBeenCalled();
    expect(pushSubscribeMock).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true }));
    expect(subscribeMutationMock).toHaveBeenCalledWith({
      variables: {
        subscriptionData: {
          endpoint: 'https://push.example/abc',
          p256dh: 'p256dh-key',
          auth: 'auth-key',
          userAgent: navigator.userAgent,
        },
      },
    });
    expect(localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)).toBe('server-sub-1');
    expect(localStorage.getItem(PUSH_USER_DISABLED_KEY)).toBeNull();
    await waitFor(() => expect(result.current.isSubscribed).toBe(true));
    expect(result.current.currentSubscriptionId).toBe('server-sub-1');
  });

  test('does nothing when the user denies the permission prompt', async () => {
    requestPermissionMock.mockResolvedValue('denied');
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.subscribe();
    });

    expect(pushSubscribeMock).not.toHaveBeenCalled();
    expect(subscribeMutationMock).not.toHaveBeenCalled();
    expect(result.current.isSubscribed).toBe(false);
    expect(localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)).toBeNull();
  });

  test('rolls back the browser subscription and rethrows when the server registration fails', async () => {
    subscribeMutationMock.mockRejectedValue(new Error('server down'));
    const { result } = renderHook(() => usePushNotifications());

    // Capture the rejection inside act() so the catch block's async rollback fully
    // settles before we assert (wrapping act() in expect().rejects races that cleanup).
    let caught: unknown;
    await act(async () => {
      try {
        await result.current.subscribe();
      } catch (e) {
        caught = e;
      }
    });

    expect((caught as Error)?.message).toContain('server down');
    // FR-014: the browser-side subscription must be unwound so we don't leave a
    // subscription the server never recorded.
    expect(browserUnsubscribeMock).toHaveBeenCalled();
    expect(localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)).toBeNull();
  });
});

describe('usePushNotifications — unsubscribe', () => {
  test('unsubscribes on server + browser, clears the id, and marks the user as opted out', async () => {
    localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, 'server-sub-1');
    pushGetSubscriptionMock.mockResolvedValue(browserSubscription);
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.unsubscribe();
    });

    expect(unsubscribeMutationMock).toHaveBeenCalledWith({
      variables: { subscriptionData: { subscriptionID: 'server-sub-1' } },
    });
    expect(browserUnsubscribeMock).toHaveBeenCalled();
    expect(localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)).toBeNull();
    expect(localStorage.getItem(PUSH_USER_DISABLED_KEY)).toBe('true');
    await waitFor(() => expect(result.current.isSubscribed).toBe(false));
    expect(result.current.currentSubscriptionId).toBeNull();
  });

  test('still removes the browser subscription when there is no cached server id', async () => {
    pushGetSubscriptionMock.mockResolvedValue(browserSubscription);
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.unsubscribe();
    });

    // No id → we cannot target the server record, but the browser subscription is still torn down.
    expect(unsubscribeMutationMock).not.toHaveBeenCalled();
    expect(browserUnsubscribeMock).toHaveBeenCalled();
    expect(localStorage.getItem(PUSH_USER_DISABLED_KEY)).toBe('true');
  });
});
