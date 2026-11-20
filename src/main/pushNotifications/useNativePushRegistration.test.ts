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
const resetPushBadgeCount = vi.hoisted(() => vi.fn());
const useMutationSpy = vi.hoisted(() => vi.fn());

vi.mock('@/core/appMode/isAppMode', () => ({ isAppMode }));
vi.mock('@/main/pushNotifications/nativePushPlugin', () => ({ getNativePushPlugin }));
vi.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
  useMutation: (document: string, options?: unknown) => {
    useMutationSpy(document, options);
    return [document.includes('ResetPushBadgeCount') ? resetPushBadgeCount : registerDevicePushToken];
  },
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
    removeAllDeliveredNotifications: vi.fn(async () => {}),
    addListener: vi.fn((eventName: string, listenerFunc: (payload: never) => void) => {
      calls.push(`addListener:${eventName}`);
      listeners[eventName] = listenerFunc;
      return { remove: vi.fn() };
    }),
  }) as unknown as NativePushPlugin;

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
};

const returnToVisible = () => {
  setVisibility('visible');
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useNativePushRegistration (SC-020)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calls = [];
    listeners = {};
    plugin = makePlugin('granted');
    registerDevicePushToken.mockResolvedValue({ data: { registerDevicePushToken: true } });
    resetPushBadgeCount.mockResolvedValue({ data: { resetPushBadgeCount: true } });
    setVisibility('visible');
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

  it('adds no listener and sends no bind when the OS prompt resolves after unmount', async () => {
    // The provider unmounts the moment `isAuthenticated` turns false, which can
    // happen while the OS dialog is still open. There is no listener removal to
    // fall back on (see the hook's cleanup), so a listener added after cleanup
    // would survive to bind a token outside the session that asked for the
    // permission — `active` is what prevents it being added at all.
    isAppMode.mockReturnValue(true);
    let grantPermission: () => void = () => {};
    const late = makePlugin('granted');
    late.requestPermissions = vi.fn(
      () =>
        new Promise<{ receive: 'granted' }>(resolve => {
          grantPermission = () => resolve({ receive: 'granted' });
        })
    );
    getNativePushPlugin.mockReturnValue(late);

    const { unmount } = renderHook(() => useNativePushRegistration());
    await waitFor(() => expect(late.requestPermissions).toHaveBeenCalled());

    unmount();
    grantPermission();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(calls).not.toContain('addListener:registration');
    expect(late.register).not.toHaveBeenCalled();
    expect(registerDevicePushToken).not.toHaveBeenCalled();
  });

  it('returns nothing and exposes no imperative API', async () => {
    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(plugin);

    const { result } = renderHook(() => useNativePushRegistration());

    expect(result.current).toBeUndefined();
  });

  describe('badge clearing', () => {
    const mountOn = async (platform: string) => {
      isAppMode.mockReturnValue(true);
      getNativePushPlugin.mockReturnValue(plugin);
      window.Capacitor = { getPlatform: () => platform };
      const view = renderHook(() => useNativePushRegistration());
      await waitFor(() => expect(listeners.registration).toBeDefined());
      return view;
    };

    it('clears on registration on iOS', async () => {
      await mountOn('ios');
      listeners.registration({ value: 'apns-token-1' } as never);

      expect(registerDevicePushToken).toHaveBeenCalledTimes(1);
      expect(resetPushBadgeCount).toHaveBeenCalledTimes(1);
      expect(plugin.removeAllDeliveredNotifications).toHaveBeenCalledTimes(1);
    });

    it('clears on return to visible on iOS', async () => {
      await mountOn('ios');
      returnToVisible();

      expect(resetPushBadgeCount).toHaveBeenCalledTimes(1);
      expect(plugin.removeAllDeliveredNotifications).toHaveBeenCalledTimes(1);
    });

    it('does not clear when the document is hidden', async () => {
      await mountOn('ios');
      setVisibility('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
      listeners.registration({ value: 'apns-token-1' } as never);

      expect(resetPushBadgeCount).not.toHaveBeenCalled();
      expect(plugin.removeAllDeliveredNotifications).not.toHaveBeenCalled();
    });

    it('never clears on Android', async () => {
      await mountOn('android');
      returnToVisible();
      listeners.registration({ value: 'fcm-token-1' } as never);

      expect(registerDevicePushToken).toHaveBeenCalledTimes(1);
      expect(resetPushBadgeCount).not.toHaveBeenCalled();
      expect(plugin.removeAllDeliveredNotifications).not.toHaveBeenCalled();
    });

    it('does not listen outside app mode', () => {
      isAppMode.mockReturnValue(false);
      renderHook(() => useNativePushRegistration());
      returnToVisible();

      expect(resetPushBadgeCount).not.toHaveBeenCalled();
    });

    it('swallows a failed reset and a rejected plugin call', async () => {
      const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
      resetPushBadgeCount.mockRejectedValue(new Error('redis down'));
      vi.mocked(plugin.removeAllDeliveredNotifications).mockRejectedValue(new Error('not registered'));
      await mountOn('ios');

      expect(returnToVisible).not.toThrow();
      expect(resetPushBadgeCount).toHaveBeenCalledTimes(1);
      expect(plugin.removeAllDeliveredNotifications).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(logged).toHaveBeenCalledTimes(2));
    });

    it('opts only the reset out of the global error handler', async () => {
      await mountOn('ios');

      const optionsFor = (name: string) =>
        useMutationSpy.mock.calls.find(([document]) => String(document).includes(name))?.[1];
      expect(optionsFor('ResetPushBadgeCount')).toEqual(
        expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
      );
      expect(optionsFor('RegisterDevicePushToken')).toBeUndefined();
    });

    it('stops clearing after unmount', async () => {
      const { unmount } = await mountOn('ios');
      unmount();
      returnToVisible();

      expect(resetPushBadgeCount).not.toHaveBeenCalled();
      expect(plugin.removeAllDeliveredNotifications).not.toHaveBeenCalled();
    });
  });
});
