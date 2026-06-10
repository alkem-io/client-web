import { useEffect } from 'react';
import {
  OIDC_LOGIN_PATH,
  OIDC_RECOVERY_ATTEMPTED_KEY,
  OIDC_SESSION_SEEN_KEY,
} from '@/core/auth/authentication/constants/authentication.constants';

// Identity/auth screens (mirrors IdentityRoutes in IdentityRoute.tsx). On these
// a "Kratos session but no BFF session" state is normal and expected — it IS the
// login / logout / settings / recovery flow in progress — so silent recovery
// must stay out of the way or it would fight the very flow being rendered.
const AUTH_ROUTE_SEGMENTS = [
  'login',
  'logout',
  'registration',
  'sign_up',
  'verify',
  'recovery',
  'required',
  'error',
  'settings',
];

type OidcSessionRecoveryInput = {
  loading: boolean;
  kratosAuthenticated: boolean;
  oidcActive: boolean;
  pathname: string;
  sessionPreviouslySeen: boolean;
  recoveryAlreadyAttempted: boolean;
};

/**
 * Pure decision: should we silently re-establish the BFF OIDC session?
 *
 * Triggered by the post-password-change gap — Kratos refreshes its SSO session
 * but the BFF `alkemio_session` is left stale/absent, so `id-token-hint` 401s and
 * the app shows logged-out even though a silent Hydra login would succeed. Rather
 * than make the user click "Log in", re-enter the OIDC login route automatically.
 */
export function shouldRecoverOidcSession(input: OidcSessionRecoveryInput): boolean {
  // Both session probes must have resolved before we trust the mismatch.
  if (input.loading) return false;
  // Already have a live BFF session — nothing to recover.
  if (input.oidcActive) return false;
  // No live Kratos SSO to ride — a silent (credential-less) login is impossible.
  if (!input.kratosAuthenticated) return false;
  // Loop guard: one attempt per tab. If the BFF still won't mint a session after
  // a recovery redirect, fall back to the manual "Log in" button.
  if (input.recoveryAlreadyAttempted) return false;
  // Only recover for returning Alkemio users. An anonymous visitor carrying
  // another RP's Kratos SSO cookie must not be force-logged-in here.
  if (!input.sessionPreviouslySeen) return false;
  // Never fire on the auth screens themselves — that mismatch is by design.
  // Split on `/`, `?` and `#` so a stray query/hash can't sneak a route past us.
  const segment = input.pathname.replace(/^\/+/, '').split(/[/?#]/)[0];
  if (AUTH_ROUTE_SEGMENTS.includes(segment)) return false;
  return true;
}

/**
 * Closes the post-password-change gap where the Kratos SSO session is fresh but
 * the BFF OIDC session is gone, leaving the user apparently logged out until they
 * click "Log in". When the mismatch is detected on a non-auth route for a user who
 * had a BFF session here before, re-enter the apex OIDC login route — Hydra
 * completes it silently against the live Kratos SSO, with no credential prompt.
 */
export const useOidcSessionRecovery = ({
  loading,
  kratosAuthenticated,
  oidcActive,
}: {
  loading: boolean;
  kratosAuthenticated: boolean;
  oidcActive: boolean;
}): void => {
  useEffect(() => {
    if (loading) return;

    if (oidcActive) {
      // Healthy BFF session: remember it for future recovery decisions and reset
      // the per-tab loop guard so a later drop can be recovered again.
      localStorage.setItem(OIDC_SESSION_SEEN_KEY, '1');
      sessionStorage.removeItem(OIDC_RECOVERY_ATTEMPTED_KEY);
      return;
    }

    const shouldRecover = shouldRecoverOidcSession({
      loading,
      kratosAuthenticated,
      oidcActive,
      pathname: window.location.pathname,
      sessionPreviouslySeen: localStorage.getItem(OIDC_SESSION_SEEN_KEY) === '1',
      recoveryAlreadyAttempted: sessionStorage.getItem(OIDC_RECOVERY_ATTEMPTED_KEY) === '1',
    });
    if (!shouldRecover) return;

    sessionStorage.setItem(OIDC_RECOVERY_ATTEMPTED_KEY, '1');
    // Re-enter the same apex BFF login route the "Log in" button uses, returning
    // the user to where they are. Relative is correct: this only runs on apex
    // routes (auth screens — the only ones served on the identity subdomain — are
    // excluded above), and the BFF mounts same-origin on the apex.
    const returnTo = `${window.location.pathname}${window.location.search}` || '/';
    window.location.replace(`${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`);
  }, [loading, kratosAuthenticated, oidcActive]);
};
