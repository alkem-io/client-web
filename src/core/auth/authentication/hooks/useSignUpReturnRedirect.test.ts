import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSignUpReturnRedirect } from './useSignUpReturnRedirect';

const APEX = 'https://sandbox-alkem.io';

let auth = { isAuthenticated: true, loading: false };
let returnUrl: string | undefined = `${APEX}/challenges/my-subspace`;
let armed = true;

const clearReturnUrl = vi.fn();
const clearArmed = vi.fn();
const replaceSpy = vi.fn<(url: string) => void>();

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => auth,
}));

vi.mock('@/core/auth/authentication/utils/useSignUpReturnUrl', () => ({
  useReturnUrl: () => ({ returnUrl, setReturnUrl: vi.fn(), clearReturnUrl }),
  useSignUpRoundTrip: () => ({ armed, arm: vi.fn(), clearArmed }),
}));

vi.mock('@/domain/platform/routes/usePlatformOrigin', () => ({ default: () => APEX }));

const stubLocation = (pathname: string, search = '') =>
  vi.stubGlobal('location', { origin: APEX, pathname, search, replace: replaceSpy });

describe('useSignUpReturnRedirect', () => {
  beforeEach(() => {
    auth = { isAuthenticated: true, loading: false };
    returnUrl = `${APEX}/challenges/my-subspace`;
    armed = true;
    clearReturnUrl.mockReset();
    clearArmed.mockReset();
    replaceSpy.mockReset();
    // Kratos lands the freshly-verified user here.
    stubLocation('/home');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('delivers the stored destination on the landing route and disarms', () => {
    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).toHaveBeenCalledWith(`${APEX}/challenges/my-subspace`);
    expect(clearArmed).toHaveBeenCalled();
    expect(clearReturnUrl).toHaveBeenCalled();
  });

  it('also fires on the root landing route', () => {
    stubLocation('/');

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).toHaveBeenCalledWith(`${APEX}/challenges/my-subspace`);
  });

  it('does nothing when not armed — a later click on Home must not teleport', () => {
    armed = false;

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearReturnUrl).not.toHaveBeenCalled();
  });

  it('waits while the session probes are still loading', () => {
    auth = { isAuthenticated: false, loading: true };

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearArmed).not.toHaveBeenCalled();
  });

  it('waits for the BFF session so it cannot race useOidcSessionRecovery', () => {
    // isAuthenticated = kratosAuthenticated && oidcActive; false here means the
    // recovery redirect is still in flight.
    auth = { isAuthenticated: false, loading: false };

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearArmed).not.toHaveBeenCalled();
  });

  it('consumes but does not redirect when the user already landed on a real page', () => {
    stubLocation('/challenges/other-space');

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearArmed).toHaveBeenCalled();
    expect(clearReturnUrl).toHaveBeenCalled();
  });

  it('consumes but does not redirect when the destination is off-platform', () => {
    returnUrl = 'https://evil.example.com/steal';

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearArmed).toHaveBeenCalled();
    expect(clearReturnUrl).toHaveBeenCalled();
  });

  it('does not redirect when the destination is the page we are already on', () => {
    returnUrl = `${APEX}/home`;

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearArmed).toHaveBeenCalled();
  });

  it('leaves the cookies alone on /login/success, which owns them', () => {
    // This layout effect fires before LoginSuccessPage's own effect; clearing
    // here would pull the destination out from under it.
    stubLocation('/login/success');

    renderHook(() => useSignUpReturnRedirect());

    expect(replaceSpy).not.toHaveBeenCalled();
    expect(clearArmed).not.toHaveBeenCalled();
    expect(clearReturnUrl).not.toHaveBeenCalled();
  });

  it('leaves the cookies alone on the identity screens', () => {
    stubLocation('/registration/success');

    renderHook(() => useSignUpReturnRedirect());

    expect(clearReturnUrl).not.toHaveBeenCalled();
  });

  it('is single-shot across re-renders', () => {
    const { rerender } = renderHook(() => useSignUpReturnRedirect());
    rerender();
    rerender();

    expect(replaceSpy).toHaveBeenCalledTimes(1);
  });
});
