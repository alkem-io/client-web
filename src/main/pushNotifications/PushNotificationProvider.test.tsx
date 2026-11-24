import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ isAuthenticated: true, secondFactorRequired: false }));
const usePushNotifications = vi.hoisted(() => vi.fn());
const useSubscribeToPushNotificationsMutation = vi.hoisted(() => vi.fn((_options?: unknown) => [vi.fn()]));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ isAuthenticated: auth.isAuthenticated }),
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ secondFactorRequired: auth.secondFactorRequired }),
}));
vi.mock('@/main/pushNotifications/usePushNotifications', () => ({ usePushNotifications }));
vi.mock('@/main/pushNotifications/useNativePushRegistration', () => ({ useNativePushRegistration: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useMyPushSubscriptionsLazyQuery: () => [vi.fn().mockResolvedValue({})],
  useSubscribeToPushNotificationsMutation,
}));

import { PushNotificationProvider } from './PushNotificationProvider';

describe('PushNotificationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePushNotifications.mockReturnValue({ isSupported: false });
    auth.isAuthenticated = true;
    auth.secondFactorRequired = false;
  });

  it('reads the push state for a signed-in session', () => {
    render(<PushNotificationProvider />);

    expect(usePushNotifications).toHaveBeenCalled();
  });

  it('re-registers the subscription unasked, so it opts out of the global error handler', () => {
    render(<PushNotificationProvider />);

    expect(useSubscribeToPushNotificationsMutation).toHaveBeenCalledWith(
      expect.objectContaining({ context: { skipGlobalErrorHandler: true } })
    );
  });

  it('asks the server nothing for a session refused for a missing second factor', () => {
    auth.secondFactorRequired = true;

    render(<PushNotificationProvider />);

    expect(usePushNotifications).not.toHaveBeenCalled();
  });
});
