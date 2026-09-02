import { useEffect } from 'react';
import {
  OIDC_LOGIN_PATH,
  OIDC_RECOVERY_ATTEMPTED_KEY,
} from '@/core/auth/authentication/constants/authentication.constants';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { resolveInternalReturnPath } from '@/core/utils/links';
import { clearAllGuestSessionData } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { useReturnUrl } from '../utils/useSignUpReturnUrl';

export type LoginSuccessAction = 'wait' | 'navigate' | 'oidc-reentry';

/**
 * Pure decision: what should the post-login success terminal do once the
 * session probes and the profile query have had their say?
 *
 * The normal path waits for the user profile (whose first fetch also triggers
 * profile creation) and then navigates to the stored return destination. But
 * this page is also where a *Kratos-native* login completes — most notably the
 * OIDC account-linking flow, where signing in with a password links the
 * provider identity. That login mints a Kratos session while the BFF OIDC
 * session (`alkemio_session`) — the sole gate for `isAuthenticated` and hence
 * for the profile query — does not yet exist, so waiting here would never end
 * (the blank-screen defect). `useOidcSessionRecovery` deliberately stays off
 * auth routes, so this terminal must do its own re-entry: ride the live
 * Kratos session through the BFF login route, which Hydra completes silently.
 * The shared per-tab marker caps that at one attempt, mirroring the recovery
 * hook; past it — or with no session at all — navigating on is strictly
 * better than a dead page.
 */
export function resolveLoginSuccessAction(input: {
  loading: boolean;
  hasUserModel: boolean;
  oidcActive: boolean;
  hasKratosSession: boolean;
  reentryAlreadyAttempted: boolean;
}): LoginSuccessAction {
  if (input.loading) return 'wait';
  if (input.hasUserModel) return 'navigate';
  if (!input.oidcActive && input.hasKratosSession && !input.reentryAlreadyAttempted) return 'oidc-reentry';
  return 'navigate';
}

export const LoginSuccessPage = () => {
  const { returnUrl, clearReturnUrl } = useReturnUrl();
  const platformOrigin = usePlatformOrigin();
  const { session, isAuthenticated, loading: authLoading } = useAuthenticationContext();

  // We don't really need to use user info here on every login,
  // but user profile creation is triggered the first time the user logs in,
  // and this way we ensure the profile is created before the user is redirected to the returnUrl.
  // Probably this won't be needed once we refactor UserProvider
  // We could maybe do a lighter query here to check if the user has profile or not, and trigger the creation if needed.
  const { userModel, loading } = useCurrentUserContext();

  useEffect(() => {
    const action = resolveLoginSuccessAction({
      loading: loading || authLoading,
      hasUserModel: Boolean(userModel),
      oidcActive: isAuthenticated,
      hasKratosSession: Boolean(session),
      reentryAlreadyAttempted: sessionStorage.getItem(OIDC_RECOVERY_ATTEMPTED_KEY) === '1',
    });
    if (action === 'wait') {
      return;
    }
    // The cookie is base-domain scoped, so any subdomain can plant a value in
    // it — resolve it to an in-platform path before navigating, and prefix the
    // apex ourselves. This route is apex-only, so a relative navigation is the
    // correct fallback when the platform origin is not yet known.
    const path = resolveInternalReturnPath(returnUrl, platformOrigin) ?? ROUTE_HOME;
    // Clear all guest session data (name, whiteboard URL) on successful authentication
    clearAllGuestSessionData();
    // Single-shot: the destination has been reached (or is encoded into the
    // re-entry's returnTo below), so it must not survive to hijack a later
    // navigation.
    clearReturnUrl();
    if (action === 'oidc-reentry') {
      // A Kratos-native login (e.g. OIDC account linking) ended here without a
      // BFF session. Enter the same apex BFF login route the "Log in" button
      // uses — Hydra completes it silently against the live Kratos session —
      // and land directly on the destination, skipping this terminal.
      sessionStorage.setItem(OIDC_RECOVERY_ATTEMPTED_KEY, '1');
      globalThis.location.replace(`${platformOrigin ?? ''}${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent(path)}`);
      return;
    }
    globalThis.location.replace(`${platformOrigin ?? ''}${path}`);
  }, [returnUrl, userModel, loading, platformOrigin, session, isAuthenticated, authLoading]);

  return null;
};

export default LoginSuccessPage;
