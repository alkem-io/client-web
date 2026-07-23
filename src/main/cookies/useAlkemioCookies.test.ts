import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALKEMIO_COOKIE_NAME, useAlkemioCookies, useMigrateConsentCookieToApex } from './useAlkemioCookies';

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

  it('writes the consent cookie at the apex on prod so welcome.alkem.io can read it', () => {
    stubHostname('app.alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.acceptAllCookies();

    expect(setCookie).toHaveBeenCalledWith(ALKEMIO_COOKIE_NAME, expect.any(String), expect.any(Object));
    expect(domainOf()).toBe('.alkem.io');
  });

  it('derives the acc apex', () => {
    stubHostname('app.acc-alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.acceptOnlySelected([]);

    expect(domainOf()).toBe('.acc-alkem.io');
  });

  it('derives the dev apex', () => {
    stubHostname('app.dev-alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.acceptAllCookies();

    expect(domainOf()).toBe('.dev-alkem.io');
  });

  it('does not set a domain on localhost (would be rejected and break local consent)', () => {
    stubHostname('localhost');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.acceptAllCookies();

    expect(domainOf()).toBeUndefined();
  });

  it('does not set a domain for a raw IP host', () => {
    stubHostname('127.0.0.1');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.acceptOnlySelected(['analysis']);

    expect(domainOf()).toBeUndefined();
  });

  it('still passes the persistence options (path + expiry) alongside the domain', () => {
    stubHostname('app.alkem.io');
    const { result } = renderHook(() => useAlkemioCookies());

    result.current.acceptAllCookies();

    const options = lastCall(setCookie)?.[2];
    expect(options.path).toBe('/');
    expect(options.expires).toBeInstanceOf(Date);
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
