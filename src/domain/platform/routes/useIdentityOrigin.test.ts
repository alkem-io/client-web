import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useIdentityOrigin from './useIdentityOrigin';

type AuthenticationConfig = { providers: { config: { issuer: string } }[] };

const harness = vi.hoisted(() => ({
  authentication: { value: undefined as AuthenticationConfig | undefined },
}));

vi.mock('../config/useConfig', () => ({
  useConfig: () => ({ authentication: harness.authentication.value }),
}));

describe('useIdentityOrigin', () => {
  beforeEach(() => {
    harness.authentication.value = {
      providers: [{ config: { issuer: 'https://identity.alkem.io' } }],
    };
  });

  it('is the configured provider issuer', () => {
    const { result } = renderHook(() => useIdentityOrigin());

    expect(result.current).toBe('https://identity.alkem.io');
  });

  it.each([
    ['a trailing slash', 'https://identity.alkem.io/'],
    ['a path', 'https://identity.alkem.io/ory'],
    ['a path and a query', 'https://identity.alkem.io/ory?x=1'],
  ])('reduces an issuer with %s to its bare origin', (_label, issuer) => {
    // Both call sites compare this against `window.location.origin`, which never
    // carries a path or a trailing slash. Returning the raw issuer makes the
    // comparison silently never match: the Matrix guard goes inert and
    // `NonIdentity` stops redirecting. `alkemio.yml`'s default issuer
    // (`http://alkemio-server-dev/`) has a trailing slash, so this is reachable
    // without any misconfiguration.
    harness.authentication.value = { providers: [{ config: { issuer } }] };

    const { result } = renderHook(() => useIdentityOrigin());

    expect(result.current).toBe('https://identity.alkem.io');
  });

  it('is undefined for a malformed issuer rather than throwing', () => {
    // `new URL` throws on this. The hook runs on every route via `NonIdentity`,
    // so an escaping throw is a white screen, not a missing Matrix session.
    harness.authentication.value = { providers: [{ config: { issuer: 'not-a-url' } }] };

    const { result } = renderHook(() => useIdentityOrigin());

    expect(result.current).toBeUndefined();
  });

  it('is undefined when the config carries no provider at all', () => {
    // The array can arrive empty. `providers[0]` is then undefined, and reading
    // `.config` off it threw before this case existed — in a hook `NonIdentity`
    // calls on every route, so the symptom was a white screen rather than a
    // missing Matrix session.
    harness.authentication.value = { providers: [] };

    const { result } = renderHook(() => useIdentityOrigin());

    expect(result.current).toBeUndefined();
  });

  it('is undefined while the platform config has not arrived', () => {
    // `useConfig` exposes `authentication` as optional: it is absent until the
    // config query resolves. Callers compare it against an origin, so undefined
    // must simply never match — not throw.
    harness.authentication.value = undefined;

    const { result } = renderHook(() => useIdentityOrigin());

    expect(result.current).toBeUndefined();
  });
});
