import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ALKEMIO_COOKIE_NAME,
  APM_COOKIE_NAME,
  useAlkemioCookies,
  useCleanUpApmCookie,
  useMigrateConsentCookieToApex,
} from './useAlkemioCookies';

// Regression test for #9695: accepting cookies on the platform (app.alkem.io) must write
// the consent cookie at the environment apex (`.alkem.io`) so it is readable on the welcome
// site (welcome.alkem.io) — matching the direction that already works. Before the fix
// `createCookieOptions` omitted `domain`, so the browser scoped the cookie host-only and
// welcome never saw it.

let mockCookies: Record<string, unknown> = {};
const setCookie = vi.fn();
const removeCookie = vi.fn();

vi.mock('react-cookie', () => ({
  useCookies: () => [mockCookies, setCookie, removeCookie],
}));

const stubHostname = (hostname: string) => vi.stubGlobal('location', { ...window.location, hostname });
const lastCall = (mock: typeof setCookie) => mock.mock.calls[mock.mock.calls.length - 1];

beforeEach(() => {
  mockCookies = {};
  setCookie.mockReset();
  removeCookie.mockReset();
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useAlkemioCookies', () => {
  const domainOf = () => lastCall(setCookie)?.[2]?.domain;
  const storedCategories = () => JSON.parse(lastCall(setCookie)?.[1] as string) as string[];
  // What the browser holds: the hook must trust this, not react-cookie's in-memory copy.
  let browserCookies = '';
  const holdInBrowser = (value: string) => {
    browserCookies = `other=1; ${ALKEMIO_COOKIE_NAME}=${encodeURIComponent(value)}`;
  };

  beforeEach(() => {
    browserCookies = '';
    vi.spyOn(document, 'cookie', 'get').mockImplementation(() => browserCookies);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes the consent cookie at the apex on prod so welcome.alkem.io can read it', () => {
    stubHostname('app.alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    expect(setCookie).toHaveBeenCalledWith(ALKEMIO_COOKIE_NAME, expect.any(String), expect.any(Object));
    expect(domainOf()).toBe('.alkem.io');
  });

  it('derives the acc apex', () => {
    stubHostname('app.acc-alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(false);

    expect(domainOf()).toBe('.acc-alkem.io');
  });

  it('derives the dev apex', () => {
    stubHostname('app.dev-alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    expect(domainOf()).toBe('.dev-alkem.io');
  });

  it('does not set a domain on localhost (would be rejected and break local consent)', () => {
    stubHostname('localhost');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    expect(domainOf()).toBeUndefined();
  });

  it('does not set a domain for a raw IP host', () => {
    stubHostname('127.0.0.1');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    expect(domainOf()).toBeUndefined();
  });

  it('still passes the persistence options (path + 150-day expiry) alongside the domain', () => {
    stubHostname('app.alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    const options = lastCall(setCookie)?.[2];
    expect(options.path).toBe('/');
    const days = Math.round((options.expires.getTime() - Date.now()) / 86_400_000);
    expect(days).toBe(150);
  });

  it('Only necessary stores ["technical"]', () => {
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(false);

    expect(storedCategories()).toEqual(['technical']);
  });

  it('Accept all stores ["technical","analysis"]', () => {
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    expect(storedCategories()).toEqual(['technical', 'analysis']);
  });

  it('Only necessary removes the persistent APM tracking id', () => {
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(false);

    expect(removeCookie).toHaveBeenCalledWith(APM_COOKIE_NAME, { path: '/' });
  });

  it('Accept all keeps the APM tracking id', () => {
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.saveConsent(true);

    expect(removeCookie).not.toHaveBeenCalled();
  });

  it('reports success when the browser kept the cookie', () => {
    setCookie.mockImplementation((_name: string, value: string) => holdInBrowser(value));
    const { result } = renderHook(() => useAlkemioCookies());

    expect(result.current.saveConsent(false)).toBe(true);
  });

  it('reports failure when the write did not land in the browser', () => {
    const { result } = renderHook(() => useAlkemioCookies());

    expect(result.current.saveConsent(true)).toBe(false);
  });

  it('reports failure when the browser holds a different choice than the one just saved', () => {
    holdInBrowser('["technical"]');
    const { result } = renderHook(() => useAlkemioCookies());

    expect(result.current.saveConsent(true)).toBe(false);
  });

  it('reads no stored choice as undecided with Analytics off', () => {
    const { result } = renderHook(() => useAlkemioCookies());

    expect(result.current.consent).toEqual({ decided: false, analysis: false });
  });

  it('reads a malformed cookie as undecided', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: 'not-a-list' };
    const { result } = renderHook(() => useAlkemioCookies());

    expect(result.current.consent).toEqual({ decided: false, analysis: false });
  });

  it('reads the stored choice', () => {
    mockCookies = { [ALKEMIO_COOKIE_NAME]: ['technical'] };
    const { result, rerender } = renderHook(() => useAlkemioCookies());
    expect(result.current.consent).toEqual({ decided: true, analysis: false });

    mockCookies = { [ALKEMIO_COOKIE_NAME]: ['technical', 'analysis'] };
    rerender();
    expect(result.current.consent).toEqual({ decided: true, analysis: true });
  });
});

// Regression test for the #9695 migration gap: users who accepted BEFORE the apex fix hold a
// host-only cookie and never see the banner again (App.tsx only renders it while consent is
// absent), so they would never self-heal. On first load the migration must delete the
// host-only duplicate and re-write the value at the apex — once, and never on localhost/IP.
describe('useMigrateConsentCookieToApex', () => {
  it('re-writes an existing host-only consent at the apex and deletes the host-only copy', () => {
    stubHostname('app.alkem.io');
    mockCookies = { [ALKEMIO_COOKIE_NAME]: ['technical', 'analysis'] };

    renderHook(() => useMigrateConsentCookieToApex());

    expect(removeCookie).toHaveBeenCalledWith(ALKEMIO_COOKIE_NAME, { path: '/' });
    expect(setCookie).toHaveBeenCalledWith(ALKEMIO_COOKIE_NAME, ['technical', 'analysis'], expect.any(Object));
    expect(lastCall(setCookie)?.[2]?.domain).toBe('.alkem.io');
    expect(window.localStorage.getItem('alkemio.consentCookieApexMigrated')).toBe('1');
  });

  it('is a no-op when there is no consent cookie yet', () => {
    stubHostname('app.alkem.io');
    mockCookies = {};

    renderHook(() => useMigrateConsentCookieToApex());

    expect(removeCookie).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('is a no-op on localhost (no shared parent domain to migrate to)', () => {
    stubHostname('localhost');
    mockCookies = { [ALKEMIO_COOKIE_NAME]: ['technical'] };

    renderHook(() => useMigrateConsentCookieToApex());

    expect(removeCookie).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('does not run again once the migration marker is set', () => {
    stubHostname('app.alkem.io');
    mockCookies = { [ALKEMIO_COOKIE_NAME]: ['technical'] };
    window.localStorage.setItem('alkemio.consentCookieApexMigrated', '1');

    renderHook(() => useMigrateConsentCookieToApex());

    expect(removeCookie).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });
});

describe('useCleanUpApmCookie', () => {
  const ACCEPTED = ['technical', 'analysis'];

  it.each([
    ['no consent cookie', undefined],
    ['only necessary', ['technical']],
    ['a malformed consent cookie', 'not-a-list'],
  ])('removes an existing apm cookie with %s', (_label, consent) => {
    mockCookies = { [APM_COOKIE_NAME]: 'apm-existing', [ALKEMIO_COOKIE_NAME]: consent };

    renderHook(() => useCleanUpApmCookie());

    expect(removeCookie).toHaveBeenCalledWith(APM_COOKIE_NAME, { path: '/' });
    expect(setCookie).not.toHaveBeenCalled();
  });

  it('rewrites the same id with a 13-month expiry with analysis consent', () => {
    mockCookies = { [APM_COOKIE_NAME]: 'apm-existing', [ALKEMIO_COOKIE_NAME]: ACCEPTED };

    renderHook(() => useCleanUpApmCookie());

    expect(setCookie).toHaveBeenCalledWith(APM_COOKIE_NAME, 'apm-existing', expect.any(Object));
    const expected = new Date();
    expected.setMonth(expected.getMonth() + 13);
    const { expires } = lastCall(setCookie)?.[2] as { expires: Date };
    expect(Math.abs(expires.getTime() - expected.getTime())).toBeLessThan(60_000);
    expect(removeCookie).not.toHaveBeenCalled();
  });

  it('runs once per browser', () => {
    mockCookies = { [APM_COOKIE_NAME]: 'apm-existing', [ALKEMIO_COOKIE_NAME]: ACCEPTED };
    renderHook(() => useCleanUpApmCookie());
    setCookie.mockReset();

    mockCookies = { [APM_COOKIE_NAME]: 'apm-existing' };
    renderHook(() => useCleanUpApmCookie());

    expect(setCookie).not.toHaveBeenCalled();
    expect(removeCookie).not.toHaveBeenCalled();
  });

  it('marks the browser done when there is no apm cookie to clean', () => {
    renderHook(() => useCleanUpApmCookie());

    expect(removeCookie).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('alkemio.apmCookieCleaned')).toBe('1');
  });
});
