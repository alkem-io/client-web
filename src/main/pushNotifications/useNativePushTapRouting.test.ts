import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NativePushPlugin } from './nativePushPlugin';

/**
 * The tap half of 088: a tapped native notification opens its target.
 *
 * The harness is `useNativePushRegistration.test.ts`'s — a hoisted `isAppMode` /
 * `getNativePushPlugin` pair plus a `listeners` map the test fires events into.
 * Two additions: `useNavigate` is mocked (the hook lives under `BrowserRouter`
 * in `root.tsx`, and the assertion is about the path it is handed), and the mock
 * plugin **really implements** the plugin-global `removeAllListeners()` by
 * emptying that map — so the sign-out case below goes red if anything ever
 * re-introduces that call into the registration hook's cleanup.
 */

const isAppMode = vi.hoisted(() => vi.fn<() => boolean>());
const getNativePushPlugin = vi.hoisted(() => vi.fn<() => NativePushPlugin | undefined>());
const navigate = vi.hoisted(() => vi.fn());
const registerDevicePushToken = vi.hoisted(() => vi.fn());

vi.mock('@/core/appMode/isAppMode', () => ({ isAppMode }));
vi.mock('@/main/pushNotifications/nativePushPlugin', () => ({ getNativePushPlugin }));
// A **fresh identity per render**, which is what react-router really does:
// `useNavigate()` under `<BrowserRouter>` re-memoizes on every location change.
vi.mock('react-router-dom', () => ({ useNavigate: () => (to: string) => navigate(to) }));
vi.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
  useMutation: () => [registerDevicePushToken],
}));

import { useNativePushRegistration } from './useNativePushRegistration';
import { useNativePushTapRouting } from './useNativePushTapRouting';

const ORIGIN = window.location.origin;

let listeners: Record<string, (payload: never) => void>;
let plugin: NativePushPlugin;

const makePlugin = (): NativePushPlugin =>
  ({
    requestPermissions: vi.fn(async () => ({ receive: 'granted' })),
    register: vi.fn(async () => {}),
    addListener: vi.fn((eventName: string, listenerFunc: (payload: never) => void) => {
      listeners[eventName] = listenerFunc;
      return { remove: vi.fn() };
    }),
    // Not declared on `NativePushPlugin` — deliberately, see that file. Mocked
    // here with its real plugin-global semantics so the sign-out case is a
    // genuine RED rather than a restatement of the mock.
    removeAllListeners: vi.fn(async () => {
      listeners = {};
    }),
  }) as unknown as NativePushPlugin;

/** The shape the server emits: an absolute URL rooted at the serving origin. */
const tap = (url: unknown) => listeners.pushNotificationActionPerformed({ notification: { data: { url } } } as never);

describe('useNativePushTapRouting (088)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listeners = {};
    plugin = makePlugin();
    registerDevicePushToken.mockResolvedValue({ data: { registerDevicePushToken: true } });
    localStorage.clear();
    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(plugin);
    window.Capacitor = { getPlatform: () => 'android' };
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'Capacitor');
    vi.restoreAllMocks();
  });

  it('listens to nothing outside app mode, and does not throw when the plugin was never compiled in', () => {
    isAppMode.mockReturnValue(false);
    renderHook(() => useNativePushTapRouting());
    expect(getNativePushPlugin).not.toHaveBeenCalled();

    isAppMode.mockReturnValue(true);
    getNativePushPlugin.mockReturnValue(undefined);
    expect(() => renderHook(() => useNativePushTapRouting())).not.toThrow();

    expect(listeners.pushNotificationActionPerformed).toBeUndefined();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('AC1 — a warm tap routes to the absolute target path, search and hash included', () => {
    renderHook(() => useNativePushTapRouting());

    tap(`${ORIGIN}/spaces/my-space?tab=2#members`);

    expect(navigate).toHaveBeenCalledWith('/spaces/my-space?tab=2#members');
  });

  it("AC2 — the bare home link routes to '/'", () => {
    renderHook(() => useNativePushTapRouting());

    tap('/');

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('AC3/AC4 — a cold-start tap with no session routes immediately, stashing nothing', () => {
    // No `useNativePushRegistration` mounted: that hook only exists while
    // authenticated, so "signed out" is exactly this render. The event fires on
    // the first render because the platform retains a cold-start tap until JS
    // consumes it.
    renderHook(() => useNativePushTapRouting());

    tap(`${ORIGIN}/spaces/my-space`);

    expect(navigate).toHaveBeenCalledWith('/spaces/my-space');
    // No stash, no new persisted shape, no cross-session state.
    expect(localStorage.length).toBe(0);
  });

  it('AC6 — a cross-origin target leaves the app on its start route', () => {
    renderHook(() => useNativePushTapRouting());

    tap('https://evil.example/spaces/my-space');

    expect(navigate).not.toHaveBeenCalled();
  });

  it('AC7 — reads data.url by name, so a payload without it is a no-op', () => {
    renderHook(() => useNativePushTapRouting());

    listeners.pushNotificationActionPerformed({ notification: {} } as never);
    tap(undefined);

    expect(navigate).not.toHaveBeenCalled();
  });

  it('AC8 — a tap after sign-out still routes', async () => {
    renderHook(() => useNativePushTapRouting());
    const registration = renderHook(() => useNativePushRegistration());
    await waitFor(() => expect(listeners.registration).toBeDefined());

    // Sign-out: `PushNotificationProvider` short-circuits and the registration
    // hook unmounts. Its cleanup must not take the tap listener with it.
    registration.unmount();

    tap(`${ORIGIN}/spaces/my-space`);

    expect(navigate).toHaveBeenCalledWith('/spaces/my-space');
  });

  it('registers exactly once across navigations', () => {
    // `useNavigate()` under `<BrowserRouter>` re-memoizes on every location
    // change. There is no way to remove a single listener, so a dependency on
    // its identity would accumulate listeners and fire one navigation per past
    // route.
    const { rerender } = renderHook(() => useNativePushTapRouting());
    rerender();

    expect(plugin.addListener).toHaveBeenCalledTimes(1);
  });
});
