import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEVICE_PUSH_TOKEN_KEY } from '@/main/pushNotifications/constants';

/**
 * SC-017 / US2-1 — the cross-user-leak control. An unbound device token keeps
 * delivering the signing-out user's notifications to a phone the next person
 * signs in on, so sign-out must unbind it, must wait for that before handing the
 * browser away, and must never be blocked by it.
 */

const unregisterDeviceToken = vi.hoisted(() => vi.fn());
const unsubscribeMutation = vi.hoisted(() => vi.fn());
const getLogoutUrl = vi.hoisted(() => vi.fn());
const logout = vi.hoisted(() => ({
  outcome: { kind: 'redirect', url: '/end-session' } as { kind: string; url?: string; returnTo?: string } | undefined,
  search: '',
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/auth/authentication/hooks/useLogoutUrl', () => ({
  useLogoutUrl: () => ({ outcome: logout.outcome, loading: false, getLogoutUrl }),
}));

vi.mock('@/core/routing/useQueryParams', () => ({ useQueryParams: () => new URLSearchParams(logout.search) }));

vi.mock('@/core/auth/authentication/utils/useSignUpReturnUrl', () => ({
  useReturnUrl: () => ({ clearReturnUrl: vi.fn() }),
  useSignUpRoundTrip: () => ({ clearArmed: vi.fn() }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUnsubscribeFromPushNotificationsMutation: () => [unsubscribeMutation],
}));

vi.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
  useMutation: () => [unregisterDeviceToken],
}));

import LogoutPage from './LogoutPage';

const replace = vi.fn();
const originalLocation = window.location;

describe('LogoutPage — native device-token unbind (SC-017)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    unsubscribeMutation.mockResolvedValue({});
    unregisterDeviceToken.mockResolvedValue({});
    logout.outcome = { kind: 'redirect', url: '/end-session' };
    logout.search = '';
    Object.defineProperty(window, 'location', { value: { ...originalLocation, replace }, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
  });

  it('unbinds the stored token and awaits it before handing the browser to the logout URL', async () => {
    localStorage.setItem(DEVICE_PUSH_TOKEN_KEY, 'fcm-token-1');
    let releaseUnbind: () => void = () => {};
    unregisterDeviceToken.mockReturnValue(
      new Promise<unknown>(resolve => {
        releaseUnbind = () => resolve({});
      })
    );

    render(<LogoutPage />);

    await waitFor(() => expect(unregisterDeviceToken).toHaveBeenCalledWith({ variables: { token: 'fcm-token-1' } }));
    expect(replace).not.toHaveBeenCalled();

    releaseUnbind();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/end-session'));
  });

  it('clears the stored token once cleanup has run', async () => {
    localStorage.setItem(DEVICE_PUSH_TOKEN_KEY, 'fcm-token-1');

    render(<LogoutPage />);

    await waitFor(() => expect(replace).toHaveBeenCalled());
    expect(localStorage.getItem(DEVICE_PUSH_TOKEN_KEY)).toBeNull();
  });

  it('sends no unbind in a browser, where the key is never written, and still redirects', async () => {
    render(<LogoutPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/end-session'));
    expect(unregisterDeviceToken).not.toHaveBeenCalled();
  });

  it('still redirects when the unbind is rejected — it can never block logout', async () => {
    localStorage.setItem(DEVICE_PUSH_TOKEN_KEY, 'fcm-token-1');
    unregisterDeviceToken.mockRejectedValue(new Error('Forbidden'));

    render(<LogoutPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/end-session'));
    expect(localStorage.getItem(DEVICE_PUSH_TOKEN_KEY)).toBeNull();
  });
});

describe('LogoutPage — landing after every session has ended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    logout.search = '';
    Object.defineProperty(window, 'location', { value: { ...originalLocation, replace }, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
  });

  it('starts the logout with the in-platform path named by ?returnTo=', () => {
    logout.outcome = undefined;
    logout.search = 'returnTo=%2Flogin';

    render(<LogoutPage />);

    expect(getLogoutUrl).toHaveBeenCalledWith('/login');
  });

  it('refuses a ?returnTo= that leaves the platform', () => {
    logout.outcome = undefined;
    logout.search = 'returnTo=%2F%2Fevil.example%2Flogin';

    render(<LogoutPage />);

    expect(getLogoutUrl).toHaveBeenCalledWith(undefined);
  });

  it('lands on the return target once cleared', async () => {
    logout.outcome = { kind: 'cleared', returnTo: '/login' };

    render(<LogoutPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
  });

  it('lands on the public home page once cleared with no return target', async () => {
    logout.outcome = { kind: 'cleared' };

    render(<LogoutPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/home'));
  });
});
