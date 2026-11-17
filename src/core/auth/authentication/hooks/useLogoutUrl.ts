import { useState } from 'react';
import {
  AUTH_LOGOUT_PATH,
  LOGOUT_SIGN_IN_AGAIN_KEY,
  OIDC_LOGOUT_PATH,
  OIDC_RECOVERY_ATTEMPTED_KEY,
} from '@/core/auth/authentication/constants/authentication.constants';
import { runMatrixLogoutCleanup } from '@/core/matrix/logoutCleanup';
import { useIdTokenHint } from './useIdTokenHint';
import { useKratosLogout } from './useKratosLogout';

type LogoutOutcome = { kind: 'redirect'; url: string } | { kind: 'cleared'; signInAgain?: boolean };

/**
 * Computes the next logout redirect. Logout spans up to two sequential legs, each
 * a separate redirect across a page reload — this hook owns deciding which is next:
 *
 *  Leg 1 (RP / Hydra): while the BFF session is alive, fetch the id_token_hint and
 *    redirect to `/api/auth/oidc/logout` -> Hydra `end_session` -> back to /logout.
 *  Leg 2 (Kratos SSO): on the return pass the BFF session is gone, so the hint
 *    fetch fails; we sweep any stale cookie, then end the Kratos SSO session for
 *    this browser (closes the shared-device whoami / silent re-login gap).
 *
 * When neither leg has anything left to end, the outcome is `cleared`.
 *
 * `signInAgain` asks to land on the sign-in once both legs are done. Leg 1 comes
 * back to a bare /logout, so the request is kept in sessionStorage until leg 2,
 * and leg 2 ends the Kratos session with a fetch rather than a navigation, whose
 * landing page is Kratos's own. Should that fetch fail, leg 2 falls back to the
 * navigation and the request is dropped: it never lands on a sign-in a live
 * session would answer.
 */
export const useLogoutUrl = () => {
  const { fetchIdTokenHint } = useIdTokenHint();
  const { getKratosLogoutUrl, endKratosSsoSession } = useKratosLogout();
  const [loading, setLoading] = useState<boolean>();
  const [outcome, setOutcome] = useState<LogoutOutcome>();

  const getLogoutUrl = async (signInAgain: boolean) => {
    setLoading(true);
    // Disarm OIDC self-recovery so logging out is never silently undone by an
    // automatic re-login. (Logout also ends the Kratos SSO session below, which
    // alone stops recovery — this clears the per-tab loop guard belt-and-suspenders.)
    sessionStorage.removeItem(OIDC_RECOVERY_ATTEMPTED_KEY);
    // Stop this tab's Matrix session if it has one, then clear every stored Matrix namespace in any case.
    await runMatrixLogoutCleanup();
    const postLogoutRedirectUri = `${window.location.origin}${AUTH_LOGOUT_PATH}`;
    try {
      const idToken = await fetchIdTokenHint();
      // A logout started without the request also clears one an abandoned logout left behind.
      if (signInAgain) {
        sessionStorage.setItem(LOGOUT_SIGN_IN_AGAIN_KEY, 'true');
      } else {
        sessionStorage.removeItem(LOGOUT_SIGN_IN_AGAIN_KEY);
      }
      const params = new URLSearchParams({
        id_token_hint: idToken,
        post_logout_redirect_uri: postLogoutRedirectUri,
      });
      // Leg 1 — RP-initiated logout via Hydra, then back to /logout for leg 2.
      setOutcome({ kind: 'redirect', url: `${OIDC_LOGOUT_PATH}?${params.toString()}` });
    } catch {
      // No hint — the BFF session is already gone (return from Hydra, or the user
      // was never OIDC-logged-in). Sweep any stale BFF cookie hintless; use fetch
      // (not navigation) so the page does not reload and loop on /logout.
      try {
        await fetch(OIDC_LOGOUT_PATH, {
          credentials: 'include',
          redirect: 'manual',
        });
      } catch {
        // Network error mid-cleanup is non-fatal — nothing to clear, or already cleared.
      }
      const isSigningInAgain = signInAgain || sessionStorage.getItem(LOGOUT_SIGN_IN_AGAIN_KEY) === 'true';
      sessionStorage.removeItem(LOGOUT_SIGN_IN_AGAIN_KEY);
      if (isSigningInAgain && (await endKratosSsoSession()) !== 'failed') {
        setOutcome({ kind: 'cleared', signInAgain: true });
        return;
      }
      // Leg 2 — end the Kratos SSO session too, if one is still live. Kratos's own
      // logout.after config decides the landing page. No live session -> cleared.
      const kratosLogoutUrl = await getKratosLogoutUrl();
      setOutcome(kratosLogoutUrl ? { kind: 'redirect', url: kratosLogoutUrl } : { kind: 'cleared' });
    } finally {
      setLoading(false);
    }
  };

  return {
    outcome,
    loading,
    getLogoutUrl: (signInAgain = false) => getLogoutUrl(signInAgain),
  };
};
