import { useEffect } from 'react';
import {
  OIDC_LOGIN_PATH,
  OIDC_RECOVERY_ATTEMPTED_KEY,
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
  recoveryAlreadyAttempted: boolean;
};

/**
 * Pure decision: should we silently re-establish the BFF OIDC session?
 *
 * Triggered by the post-password-change gap — Kratos refreshes its SSO session
 * but the BFF `alkemio_session` is left stale/absent, so `id-token-hint` 401s and
 * the app shows logged-out even though a silent Hydra login would succeed. The
 * live Kratos SSO session (`kratosAuthenticated`, i.e. whoami === 200) is the
 * signal that the silent, credential-less re-login is possible — it is exactly
 * what makes the manual "Log in" click work without a password — so rather than
 * make the user click, re-enter the OIDC login route automatically.
 */
export function shouldRecoverOidcSession(input: OidcSessionRecoveryInput): boolean {
  // Both session probes must have resolved before we trust the mismatch.
  if (input.loading) return false;
  // Already have a live BFF session — nothing to recover.
  if (input.oidcActive) return false;
  // No live Kratos SSO to ride — a silent (credential-less) login is impossible,
  // and redirecting would just bounce an anonymous visitor to the login form.
  if (!input.kratosAuthenticated) return false;
  // Loop guard: one attempt per tab. If the BFF still won't mint a session after
  // a recovery redirect, fall back to the manual "Log in" button.
  if (input.recoveryAlreadyAttempted) return false;
  // Never fire on the auth screens themselves — that mismatch is by design.
  // Split on `/`, `?` and `#` so a stray query/hash can't sneak a route past us.
  const segment = input.pathname.replace(/^\/+/, '').split(/[/?#]/)[0];
  if (AUTH_ROUTE_SEGMENTS.includes(segment)) return false;
  return true;
}

/**
 * Closes the post-password-change gap where the Kratos SSO session is fresh but
 * the BFF OIDC session is gone, leaving the user apparently logged out until they
 * click "Log in". When the mismatch is detected on a non-auth route with a live
 * Kratos SSO session, re-enter the apex OIDC login route — Hydra completes it
 * silently against that session, with no credential prompt.
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
      // Healthy BFF session: reset the per-tab loop guard so a later drop (e.g. a
      // second password change in this tab) can be recovered again.
      sessionStorage.removeItem(OIDC_RECOVERY_ATTEMPTED_KEY);
      return;
    }

    const shouldRecover = shouldRecoverOidcSession({
      loading,
      kratosAuthenticated,
      oidcActive,
      pathname: window.location.pathname,
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
