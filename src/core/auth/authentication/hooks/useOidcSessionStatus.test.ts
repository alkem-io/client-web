import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runMatrixLogoutCleanup } from '@/core/matrix/logoutCleanup';
import { useOidcSessionStatus } from './useOidcSessionStatus';

vi.mock('@/core/matrix/logoutCleanup', () => ({ runMatrixLogoutCleanup: vi.fn() }));
vi.mock('@/core/auth/authentication/hooks/useIdTokenHintUrl', () => ({
  useIdTokenHintUrl: () => '/api/auth/oidc/id-token-hint',
}));

const probeAnswers = (respond: () => Promise<Response>) => vi.spyOn(globalThis, 'fetch').mockImplementation(respond);

const respond = (status: number, body?: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })
  );

describe('useOidcSessionStatus', () => {
  beforeEach(() => {
    vi.mocked(runMatrixLogoutCleanup).mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('runs the Matrix sign-out cleanup when the Alkemio session is gone', async () => {
    probeAnswers(() => Promise.resolve(new Response(null, { status: 401 })));

    const { result } = renderHook(() => useOidcSessionStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.active).toBe(false);
    expect(runMatrixLogoutCleanup).toHaveBeenCalledTimes(1);
  });

  it('finishes the Matrix cleanup before reporting the session gone', async () => {
    const probe = probeAnswers(() => Promise.resolve(new Response(null, { status: 401 })));
    let finishCleanup: () => void = () => {};
    vi.mocked(runMatrixLogoutCleanup).mockImplementation(
      () =>
        new Promise<void>(resolve => {
          finishCleanup = resolve;
        })
    );

    const { result } = renderHook(() => useOidcSessionStatus());

    await waitFor(() => expect(runMatrixLogoutCleanup).toHaveBeenCalledTimes(1));
    expect(probe).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);

    finishCleanup();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.active).toBe(false);
  });

  it.each([
    ['the probe request fails', () => Promise.reject(new TypeError('Failed to fetch')), false],
    ['the probe answers 500', () => Promise.resolve(new Response(null, { status: 500 })), false],
    ['the probe answers 200', () => Promise.resolve(new Response(null, { status: 200 })), true],
  ])('leaves the Matrix session alone when the probe fails for another reason (%s)', async (_case, respond, active) => {
    probeAnswers(respond);

    const { result } = renderHook(() => useOidcSessionStatus());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.active).toBe(active);
    expect(runMatrixLogoutCleanup).not.toHaveBeenCalled();
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
