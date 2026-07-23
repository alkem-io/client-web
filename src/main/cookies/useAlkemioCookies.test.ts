import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALKEMIO_COOKIE_NAME, useAlkemioCookies } from './useAlkemioCookies';

// Regression test for #9695: accepting cookies on the platform (app.alkem.io) must write
// the consent cookie at the environment apex (`.alkem.io`) so it is readable on the welcome
// site (welcome.alkem.io) — matching the direction that already works. Before the fix
// `createCookieOptions` omitted `domain`, so the browser scoped the cookie host-only and
// welcome never saw it.

const setCookie = vi.fn();

vi.mock('react-cookie', () => ({
  useCookies: () => [{}, setCookie, vi.fn()],
}));

const stubHostname = (hostname: string) => vi.stubGlobal('location', { ...window.location, hostname });

describe('useAlkemioCookies', () => {
  beforeEach(() => {
    setCookie.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const domainOf = () => setCookie.mock.calls.at(-1)?.[2]?.domain;

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

    const options = setCookie.mock.calls.at(-1)?.[2];
    expect(options.path).toBe('/');
    expect(options.expires).toBeInstanceOf(Date);
  });
});
