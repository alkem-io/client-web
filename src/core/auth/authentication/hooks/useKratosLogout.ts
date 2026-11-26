import { useKratosClient } from './useKratosClient';

type KratosLogoutFlow = { kind: 'redirect'; url: string } | { kind: 'no-session' } | { kind: 'failed' };

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
 * No `return_to` is added: browser navigation uses the provider's configured
 * destination. Step-up callers can instead confirm the strict fetch outcome.
 */
export const useKratosLogout = () => {
  const kratosClient = useKratosClient();

  const getKratosLogoutUrl = async (): Promise<KratosLogoutFlow> => {
    if (!kratosClient) return { kind: 'failed' };
    try {
      const { data } = await kratosClient.createBrowserLogoutFlow();
      return data.logout_url ? { kind: 'redirect', url: data.logout_url } : { kind: 'failed' };
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      return { kind: status === 401 ? 'no-session' : 'failed' };
    }
  };

  /**
   * Ends the live Kratos SSO session for this browser and reports a definite
   * outcome, keeping "no session" distinct from an unknown result.
   *
   * A security-sensitive step-up flow needs that distinction: a subsequent
   * re-auth redirect must never silently ride a Kratos SSO session this call
   * failed to confirm was closed. `'no-session'` and `'ended'` are both safe
   * to proceed on; `'failed'` is not — the caller must treat it as "session
   * state unknown" and stop rather than continue as if it were `'ended'`.
   */
  const endKratosSsoSession = async (): Promise<'no-session' | 'ended' | 'failed'> => {
    const flow = await getKratosLogoutUrl();
    if (flow.kind !== 'redirect') return flow.kind;
    try {
      // A credentialed fetch (not a page navigation) still applies the
      // Set-Cookie the logout response carries, so ending the session adds
      // no extra visible redirect for the user.
      const response = await fetch(flow.url, { credentials: 'include', redirect: 'manual' });
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
