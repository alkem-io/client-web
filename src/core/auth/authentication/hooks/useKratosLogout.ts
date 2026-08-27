import { useKratosClient } from './useKratosClient';

/**
 * Ends the Kratos SSO session (`ory_kratos_session`) for THIS browser via Kratos's
 * own session-scoped self-service logout — the same call the pre-OIDC logout used.
 *
 * RP-initiated logout (`/api/auth/oidc/logout` -> Hydra `end_session`) tears down only
 * the BFF + Hydra RP session; the Kratos SSO cookie deliberately survives so other RPs
 * keep their SSO. On a shared device that left the prior user's identity readable via
 * Kratos `/sessions/whoami` and allowed the next visitor to be silently re-authenticated
 * as them. Driving Kratos logout as the final web-app logout step closes that gap.
 *
 * No `return_to` is passed (matching the proven pre-OIDC flow): the landing page is
 * Kratos's configured `selfservice.flows.logout.after.default_browser_return_url`. This
 * avoids an `allowed_return_urls` dependency across overlays — and Kratos 400s a
 * non-allowlisted `return_to` on the logout flow, which would otherwise fail to clear
 * the session.
 *
 * Returns the Kratos `logout_url` to navigate to, or undefined when there is no live
 * Kratos session to end (already gone — nothing to do).
 */
export const useKratosLogout = () => {
  const kratosClient = useKratosClient();

  const getKratosLogoutUrl = async (): Promise<string | undefined> => {
    if (!kratosClient) {
      return undefined;
    }
    try {
      const { data } = await kratosClient.createBrowserLogoutFlow();
      return data.logout_url;
    } catch {
      // 401 -> no live Kratos session (already logged out). Non-fatal: nothing to clear.
      return undefined;
    }
  };

  /**
   * Ends the live Kratos SSO session for this browser and reports a definite
   * outcome, unlike `getKratosLogoutUrl`'s `string | undefined` (which
   * collapses "no session to end" and "could not tell" into the same
   * `undefined` — fine for a best-effort cleanup step, but not for a caller
   * that must know whether a session was actually closed).
   *
   * A security-sensitive step-up flow needs that distinction: a subsequent
   * re-auth redirect must never silently ride a Kratos SSO session this call
   * failed to confirm was closed. `'no-session'` and `'ended'` are both safe
   * to proceed on; `'failed'` is not — the caller must treat it as "session
   * state unknown" and stop rather than continue as if it were `'ended'`.
   */
  const endKratosSsoSession = async (): Promise<'no-session' | 'ended' | 'failed'> => {
    if (!kratosClient) {
      return 'failed';
    }
    let logoutUrl: string | undefined;
    try {
      const { data } = await kratosClient.createBrowserLogoutFlow();
      logoutUrl = data.logout_url;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // 401 is Kratos's own signal for "no live session" — nothing to end,
      // safe to proceed. Any other failure (network error, 5xx, ...) means
      // the session's actual state is unknown, so it must not be treated as
      // equivalent to "already gone".
      return status === 401 ? 'no-session' : 'failed';
    }
    if (!logoutUrl) {
      return 'failed';
    }
    try {
      // A credentialed fetch (not a page navigation) still applies the
      // Set-Cookie the logout response carries, so ending the session adds
      // no extra visible redirect for the user.
      const response = await fetch(logoutUrl, { credentials: 'include', redirect: 'manual' });
      // `fetch` rejects only on a network-level failure, so the response MUST
      // be inspected: a 4xx/5xx from Kratos resolves normally and would
      // otherwise be reported as a confirmed logout.
      //
      // Two shapes count as success. Kratos answers the logout URL with a
      // redirect to `default_browser_return_url`, and `redirect: 'manual'`
      // surfaces that as an opaque redirect (`type === 'opaqueredirect'`,
      // `status === 0`) — the Set-Cookie still applied. A 2xx is the other
      // legitimate answer. Anything else leaves the session state unknown,
      // which for this caller means 'failed'.
      const ended = response.type === 'opaqueredirect' || response.ok;
      return ended ? 'ended' : 'failed';
    } catch {
      return 'failed';
    }
  };

  return { getKratosLogoutUrl, endKratosSsoSession };
};
