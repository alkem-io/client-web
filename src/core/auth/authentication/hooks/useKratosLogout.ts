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

  return { getKratosLogoutUrl };
};
