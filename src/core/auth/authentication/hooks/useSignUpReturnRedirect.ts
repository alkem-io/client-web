import { useLayoutEffect, useRef } from 'react';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { isAuthRoutePathname } from '@/core/auth/authentication/utils/isAuthRoutePathname';
import { useReturnUrl, useSignUpRoundTrip } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { resolveInternalReturnPath } from '@/core/utils/links';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';

// Where Kratos drops a user after it has verified their email server-side. Only
// on one of these does a stored destination still make sense; anywhere else the
// user has already arrived somewhere real.
const LANDING_ROUTES = ['/', ROUTE_HOME];

/**
 * Delivers the destination a user was owed when they started signing up.
 *
 * The normal path carries it in the OIDC `returnTo`, but Kratos's verification
 * email link is a server-side GET that verifies and redirects straight to its
 * configured landing page — the SPA never renders `/verify` and that OIDC
 * request is abandoned. The `returnUrl` cookie survives; nothing used to read
 * it. This does.
 *
 * Fires only while `useSignUpRoundTrip` is armed, and disarms on the first
 * authenticated render either way, so it can never hijack a later navigation to
 * home. `isAuthenticated` (Kratos AND the BFF session) is what keeps it from
 * racing `useOidcSessionRecovery`, which is mid-redirect precisely while the
 * BFF session is missing.
 */
export const useSignUpReturnRedirect = (): void => {
  const { isAuthenticated, loading } = useAuthenticationContext();
  const { returnUrl, clearReturnUrl } = useReturnUrl();
  const { armed, clearArmed } = useSignUpRoundTrip();
  const platformOrigin = usePlatformOrigin();
  const consumed = useRef(false);

  useLayoutEffect(() => {
    if (consumed.current || loading || !isAuthenticated || !armed) {
      return;
    }
    const { pathname, search } = window.location;
    // The auth screens own these cookies while a flow is running, and this
    // layout effect fires before their own effects — clearing here would pull
    // the destination out from under `LoginSuccessPage`.
    if (isAuthRoutePathname(pathname)) {
      return;
    }
    consumed.current = true;

    // The round-trip is over however it ended. Consume unconditionally, so a
    // user who was already delivered by the OIDC returnTo cannot be teleported
    // by a stale cookie the next time they visit home. Clearing before
    // navigating is also what makes this single-shot and loop-proof.
    clearArmed();
    clearReturnUrl();

    if (!LANDING_ROUTES.includes(pathname)) {
      return;
    }

    const path = resolveInternalReturnPath(returnUrl, platformOrigin);
    if (path && path !== `${pathname}${search}`) {
      globalThis.location.replace(`${platformOrigin ?? ''}${path}`);
    }
  }, [loading, isAuthenticated, armed, returnUrl, platformOrigin]);
};
