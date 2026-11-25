import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CurrentUserModel } from '@/domain/community/userCurrent/model/CurrentUserModel';
import { ALKEMIO_COOKIE_NAME, AlkemioCookieTypes } from '@/main/cookies/useAlkemioCookies';
import { useApmInit, useGetOrSetApmCookie } from './useApmInit';

// Regression test for #10123: an `accepted_cookies` consent cookie holding valid JSON that is
// NOT an array (e.g. `true`, `42`, `{"a":1}`) used to crash the whole app into its error
// boundary via `s.includes is not a function`. react-cookie JSON-parses cookie values, so a
// valid consent cookie is a string[] but a wrong-shape value comes back as a non-array with no
// `.includes`. The consent read treats anything but an array as no choice, so a bad cookie must
// degrade to "not tracked" (return undefined, no throw) while a proper array with `analysis`
// consent still provisions the apm cookie.

const APM_CLIENT_TRACK_COOKIE = 'apm';

let mockCookies: Record<string, unknown> = {};
const setCookie = vi.fn();

vi.mock('react-cookie', () => ({
  useCookies: () => [mockCookies, setCookie],
}));

const addLabels = vi.fn();
const setUserContext = vi.fn();
const setCustomContext = vi.fn();
const initApm = vi.fn(() => ({ setUserContext, setCustomContext, addLabels }));

vi.mock('@elastic/apm-rum', () => ({
  init: () => initApm(),
}));

let rumEnabled = true;

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ apm: { rumEnabled, endpoint: 'http://apm.test' }, locations: { environment: 'test' } }),
}));

beforeEach(() => {
  mockCookies = {};
  setCookie.mockReset();
});

describe('useGetOrSetApmCookie shape-guarding (#10123)', () => {
  // Precondition for all cases: no existing apm cookie, otherwise the hook early-returns it.
  it.each([
    ['a boolean true', true],
    ['a number', 42],
    ['a plain object', { a: 1 }],
    ['null', null],
    ['a bare string', 'analysis'],
  ])('returns undefined and does not throw or provision an apm cookie for %s', (_label, value) => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: value };

    const { result } = renderHook(() => useGetOrSetApmCookie());

    expect(result.current).toBeUndefined();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('returns undefined when consent is absent entirely', () => {
    mockCookies = {};

    const { result } = renderHook(() => useGetOrSetApmCookie());

    expect(result.current).toBeUndefined();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('returns undefined without provisioning when the array lacks analysis consent', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical] };

    const { result } = renderHook(() => useGetOrSetApmCookie());

    expect(result.current).toBeUndefined();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('provisions and returns an apm id when the array grants analysis consent', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical, AlkemioCookieTypes.analysis] };

    const { result } = renderHook(() => useGetOrSetApmCookie());

    expect(result.current).toMatch(/^apm-/);
    expect(setCookie).toHaveBeenCalledWith(APM_CLIENT_TRACK_COOKIE, result.current, expect.any(Object));
  });

  it('writes a new apm cookie that expires 13 months from now, not in 2038', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical, AlkemioCookieTypes.analysis] };

    renderHook(() => useGetOrSetApmCookie());

    const expected = new Date();
    expected.setMonth(expected.getMonth() + 13);
    const { expires } = setCookie.mock.calls[0][2] as { expires: Date };
    expect(Math.abs(expires.getTime() - expected.getTime())).toBeLessThan(60_000);
  });
});

describe('useGetOrSetApmCookie with an existing apm cookie', () => {
  it.each([
    ['no consent cookie', undefined],
    ['only necessary', [AlkemioCookieTypes.technical]],
    ['a malformed consent cookie', true],
  ])('never uses it for a visitor with %s', (_label, consent) => {
    mockCookies = { [APM_CLIENT_TRACK_COOKIE]: 'apm-existing', [ALKEMIO_COOKIE_NAME]: consent };

    const { result } = renderHook(() => useGetOrSetApmCookie());

    expect(result.current).toBeUndefined();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('returns it unchanged with analysis consent', () => {
    mockCookies = {
      [APM_CLIENT_TRACK_COOKIE]: 'apm-existing',
      [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical, AlkemioCookieTypes.analysis],
    };

    const { result } = renderHook(() => useGetOrSetApmCookie());

    expect(result.current).toBe('apm-existing');
    expect(setCookie).not.toHaveBeenCalled();
  });
});

describe('useApmInit app-mode labels', () => {
  beforeEach(() => {
    vi.stubEnv('MODE', 'production');
    addLabels.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Reflect.deleteProperty(window, 'Capacitor');
  });

  it('labels browser traffic as web', () => {
    const { result } = renderHook(() => useApmInit(undefined));

    result.current();

    expect(addLabels).toHaveBeenCalledWith({ app_mode: false, app_platform: 'web' });
  });

  it('labels app-shell traffic with the native platform', () => {
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios' };
    const { result } = renderHook(() => useApmInit(undefined));

    result.current();

    expect(addLabels).toHaveBeenCalledWith({ app_mode: true, app_platform: 'ios' });
  });
});

describe('useApmInit sends only the fields we analyse', () => {
  const signedIn = {
    isAuthenticated: true,
    userModel: { id: 'platform-user-id', email: 'someone@example.org' },
  } as CurrentUserModel;

  beforeEach(() => {
    vi.stubEnv('MODE', 'production');
    rumEnabled = true;
    initApm.mockClear();
    setUserContext.mockReset();
    setCustomContext.mockReset();
    mockCookies = {
      [APM_CLIENT_TRACK_COOKIE]: 'apm-existing',
      [ALKEMIO_COOKIE_NAME]: [AlkemioCookieTypes.technical, AlkemioCookieTypes.analysis],
    };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('identifies a signed-in user by the random apm id only', () => {
    const { result } = renderHook(() => useApmInit(signedIn));

    result.current();

    expect(setUserContext).toHaveBeenCalledWith({ id: 'apm-existing' });
  });

  it('sends no email domain and no location, and keeps signed-in, screen, window and language', () => {
    const { result } = renderHook(() => useApmInit(signedIn));

    result.current();

    const context = setCustomContext.mock.calls[0][0];
    expect(Object.keys(context).sort()).toEqual(['authenticated', 'language', 'screen', 'window']);
    expect(context.authenticated).toBe(true);
  });

  it('does not start the agent when RUM is off in the configuration', () => {
    rumEnabled = false;
    const { result } = renderHook(() => useApmInit(signedIn));

    expect(result.current()).toBeUndefined();
    expect(initApm).not.toHaveBeenCalled();
  });
});
