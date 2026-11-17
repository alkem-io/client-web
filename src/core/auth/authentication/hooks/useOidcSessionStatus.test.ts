import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOidcSessionStatus } from './useOidcSessionStatus';

vi.mock('@/core/auth/authentication/hooks/useIdTokenHintUrl', () => ({
  useIdTokenHintUrl: () => '/api/auth/oidc/id-token-hint',
}));

const respond = (status: number, body?: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })
  );

describe('useOidcSessionStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads second_factor_required from the id-token-hint answer', async () => {
    respond(200, { id_token: 'jwt', second_factor_required: true });

    const { result } = renderHook(() => useOidcSessionStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ active: true, loading: false, secondFactorRequired: true });
  });

  it('is not refused when the flag is false or absent', async () => {
    respond(200, { id_token: 'jwt' });

    const { result } = renderHook(() => useOidcSessionStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.secondFactorRequired).toBe(false);
  });

  it('is neither active nor refused without a session', async () => {
    respond(401);

    const { result } = renderHook(() => useOidcSessionStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toEqual({ active: false, loading: false, secondFactorRequired: false });
  });
});
