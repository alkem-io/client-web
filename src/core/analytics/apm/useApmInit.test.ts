import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALKEMIO_COOKIE_NAME, AlkemioCookieTypes } from '@/main/cookies/useAlkemioCookies';
import { useApmInit, useGetOrSetApmCookie } from './useApmInit';

// Regression test for #10123: an `accepted_cookies` consent cookie holding valid JSON that is
// NOT an array (e.g. `true`, `42`, `{"a":1}`) used to crash the whole app into its error
// boundary via `s.includes is not a function`. react-cookie JSON-parses cookie values, so a
// valid consent cookie is a string[] but a wrong-shape value comes back as a non-array with no
// `.includes`. `useGetOrSetApmCookie` now shape-guards with `Array.isArray` before calling
// `.includes`, so a bad cookie must degrade to "not tracked" (return undefined, no throw) while
// a proper array with `analysis` consent still provisions the apm cookie exactly as before.

const APM_CLIENT_TRACK_COOKIE = 'apm';

let mockCookies: Record<string, unknown> = {};
const setCookie = vi.fn();

vi.mock('react-cookie', () => ({
  useCookies: () => [mockCookies, setCookie],
}));

const addLabels = vi.fn();

vi.mock('@elastic/apm-rum', () => ({
  init: () => ({ setUserContext: vi.fn(), setCustomContext: vi.fn(), addLabels }),
}));

vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ apm: { rumEnabled: true, endpoint: 'http://apm.test' }, locations: { environment: 'test' } }),
}));

vi.mock('@/core/analytics/geo', () => ({
  useUserGeo: () => ({ data: undefined, loading: true, error: undefined }),
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

  it('early-returns an already-provisioned apm cookie without touching consent', () => {
    mockCookies = { [APM_CLIENT_TRACK_COOKIE]: 'apm-existing', [ALKEMIO_COOKIE_NAME]: true };

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
