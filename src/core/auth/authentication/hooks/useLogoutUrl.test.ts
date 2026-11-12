import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOGOUT_SIGN_IN_AGAIN_KEY } from '@/core/auth/authentication/constants/authentication.constants';
import { useLogoutUrl } from './useLogoutUrl';

const fetchIdTokenHint = vi.hoisted(() => vi.fn());
const getKratosLogoutUrl = vi.hoisted(() => vi.fn());
const endKratosSsoSession = vi.hoisted(() => vi.fn());

vi.mock('./useIdTokenHint', () => ({ useIdTokenHint: () => ({ fetchIdTokenHint }) }));
vi.mock('./useKratosLogout', () => ({ useKratosLogout: () => ({ getKratosLogoutUrl, endKratosSsoSession }) }));
vi.mock('@/core/matrix/logoutCleanup', () => ({ runMatrixLogoutCleanup: vi.fn().mockResolvedValue(undefined) }));

const KRATOS_LOGOUT_URL = 'https://identity.test/self-service/logout?token=1';

const runLogout = async (signInAgain?: boolean) => {
  const { result } = renderHook(() => useLogoutUrl());
  await act(() => result.current.getLogoutUrl(signInAgain));
  return result.current.outcome;
};

describe('useLogoutUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }));
    getKratosLogoutUrl.mockResolvedValue(KRATOS_LOGOUT_URL);
    endKratosSsoSession.mockResolvedValue('ended');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('without signing in again, leaves for the Kratos logout as before', async () => {
    fetchIdTokenHint.mockRejectedValue(new Error('no BFF session'));

    expect(await runLogout()).toEqual({ kind: 'redirect', url: KRATOS_LOGOUT_URL });
    expect(endKratosSsoSession).not.toHaveBeenCalled();
  });

  it('keeps the sign-in-again request across the identity-provider leg, which comes back to a bare /logout', async () => {
    fetchIdTokenHint.mockResolvedValue('id-token');

    const leg1 = await runLogout(true);
    expect(leg1).toMatchObject({ kind: 'redirect' });
    expect(sessionStorage.getItem(LOGOUT_SIGN_IN_AGAIN_KEY)).toBe('true');

    fetchIdTokenHint.mockRejectedValue(new Error('BFF session ended by leg 1'));
    const leg2 = await runLogout();

    expect(leg2).toEqual({ kind: 'cleared', signInAgain: true });
    expect(endKratosSsoSession).toHaveBeenCalled();
    expect(getKratosLogoutUrl).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(LOGOUT_SIGN_IN_AGAIN_KEY)).toBeNull();
  });

  it('lands on the sign-in when there was no Kratos session to end', async () => {
    fetchIdTokenHint.mockRejectedValue(new Error('no BFF session'));
    endKratosSsoSession.mockResolvedValue('no-session');

    expect(await runLogout(true)).toEqual({ kind: 'cleared', signInAgain: true });
  });

  it('forgets the request of an abandoned logout when the next one starts without it', async () => {
    fetchIdTokenHint.mockResolvedValue('id-token');
    await runLogout(true);

    await runLogout();
    expect(sessionStorage.getItem(LOGOUT_SIGN_IN_AGAIN_KEY)).toBeNull();

    fetchIdTokenHint.mockRejectedValue(new Error('BFF session ended by leg 1'));
    expect(await runLogout()).toEqual({ kind: 'redirect', url: KRATOS_LOGOUT_URL });
  });

  it('drops the sign-in-again request when the Kratos session could not be confirmed ended', async () => {
    fetchIdTokenHint.mockRejectedValue(new Error('no BFF session'));
    endKratosSsoSession.mockResolvedValue('failed');

    expect(await runLogout(true)).toEqual({ kind: 'redirect', url: KRATOS_LOGOUT_URL });
    expect(sessionStorage.getItem(LOGOUT_SIGN_IN_AGAIN_KEY)).toBeNull();
  });
});
