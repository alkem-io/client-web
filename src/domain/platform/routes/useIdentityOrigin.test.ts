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

  it('is undefined while the platform config has not arrived', () => {
    // `useConfig` exposes `authentication` as optional: it is absent until the
    // config query resolves. Callers compare it against an origin, so undefined
    // must simply never match — not throw.
    harness.authentication.value = undefined;

    const { result } = renderHook(() => useIdentityOrigin());

    expect(result.current).toBeUndefined();
  });
});
