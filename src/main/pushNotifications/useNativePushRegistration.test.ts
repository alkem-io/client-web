import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEVICE_PUSH_TOKEN_KEY } from './constants';
import type { NativePushPlugin } from './nativePushPlugin';

/**
 * SC-020 — the bind half of P1 → P2: an OS device token is captured natively and
 * bound to the signed-in user.
 *
 * `requestPermissions()` is mocked resolving an **object** (`{ receive: ... }`),
 * which is what the plugin actually declares; a bare `'granted'` string does not
 * compile against `NativePushPlugin`.
 */

const isAppMode = vi.hoisted(() => vi.fn<() => boolean>());
const getNativePushPlugin = vi.hoisted(() => vi.fn<() => NativePushPlugin | undefined>());
const registerDevicePushToken = vi.hoisted(() => vi.fn());

vi.mock('@/core/appMode/isAppMode', () => ({ isAppMode }));
vi.mock('@/main/pushNotifications/nativePushPlugin', () => ({ getNativePushPlugin }));
vi.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
  useMutation: () => [registerDevicePushToken],
}));

import { useNativePushRegistration } from './useNativePushRegistration';

/** Records the order of the calls the ordering case asserts. */
let calls: string[];
let listeners: Record<string, (payload: never) => void>;
let plugin: NativePushPlugin;

const makePlugin = (receive: 'granted' | 'denied'): NativePushPlugin =>
  ({
    requestPermissions: vi.fn(async () => {
      calls.push('requestPermissions');
      return { receive };
    }),
    register: vi.fn(async () => {
      calls.push('register');
    }),
    addListener: vi.fn((eventName: string, listenerFunc: (payload: never) => void) => {
      calls.push(`addListener:${eventName}`);
      listeners[eventName] = listenerFunc;
      return { remove: vi.fn() };
    }),
    removeAllListeners: vi.fn(async () => {
      calls.push('removeAllListeners');
    }),
  }) as unknown as NativePushPlugin;

describe('useNativePushRegistration (SC-020)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calls = [];
    listeners = {};
    plugin = makePlugin('granted');
    registerDevicePushToken.mockResolvedValue({ data: { registerDevicePushToken: true } });
    localStorage.clear();
    window.Capacitor = { getPlatform: () => 'android' };
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'Capacitor');
    vi.restoreAllMocks();
  });

  it('does nothing outside app mode, and logs once without throwing when the plugin was never compiled in', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

    isAppMode.mockReturnValue(false);
    getNativePushPlugin.mockReturnValue(undefined);
    renderHook(() => useNativePushRegistration());

    expect(getNativePushPlugin).not.toHaveBeenCalled();
    expect(registerDevicePushToken).not.toHaveBeenCalled();
    expect(logged).not.toHaveBeenCalled();

    // In the app, but the bridge exposed no PushNotifications proxy — the
    // `cap sync`-skipped shape. This must be distinguishable from the browser
    // case above, and must not throw.
    isAppMode.mockReturnValue(true);
    expect(() => renderHook(() => useNativePushRegistration())).not.toThrow();

    expect(logged).toHaveBeenCalledTimes(1);
    expect(registerDevicePushToken).not.toHaveBeenCalled();
  });

  it('adds the registration listener before calling register()', async () => {
    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(plugin);

    renderHook(() => useNativePushRegistration());

    await waitFor(() => expect(calls).toContain('register'));
    expect(calls.indexOf('addListener:registration')).toBeLessThan(calls.indexOf('register'));
  });

  it('binds the token with the platform string exactly as the bridge returns it', async () => {
    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(plugin);
    window.Capacitor = { getPlatform: () => 'ios' };

    renderHook(() => useNativePushRegistration());
    await waitFor(() => expect(listeners.registration).toBeDefined());
    listeners.registration({ value: 'apns-token-1' } as never);

    expect(registerDevicePushToken).toHaveBeenCalledWith({
      variables: { token: 'apns-token-1', platform: 'ios' },
    });
  });

  it('never registers or binds when OS permission is denied', async () => {
    isAppMode.mockReturnValue(true);
    const denied = makePlugin('denied');
    getNativePushPlugin.mockReturnValue(denied);

    renderHook(() => useNativePushRegistration());

    await waitFor(() => expect(denied.requestPermissions).toHaveBeenCalled());
    expect(denied.register).not.toHaveBeenCalled();
    expect(calls).not.toContain('addListener:registration');
    expect(registerDevicePushToken).not.toHaveBeenCalled();
  });

  it('persists the token under DEVICE_PUSH_TOKEN_KEY — the handover to the sign-out unbind', async () => {
    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(plugin);

    renderHook(() => useNativePushRegistration());
    await waitFor(() => expect(listeners.registration).toBeDefined());
    listeners.registration({ value: 'fcm-token-1' } as never);

    expect(localStorage.getItem(DEVICE_PUSH_TOKEN_KEY)).toBe('fcm-token-1');
  });

  it('returns nothing and exposes no imperative API', async () => {
    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(plugin);

    const { result, unmount } = renderHook(() => useNativePushRegistration());

    expect(result.current).toBeUndefined();

    unmount();
    expect(plugin.removeAllListeners).toHaveBeenCalled();
  });
});
