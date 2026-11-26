import { useState } from 'react';
import { AUTH_LOGOUT_PATH, OIDC_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useKratosLogout } from './useKratosLogout';

type LogoutOutcome = { kind: 'redirect'; url: string } | { kind: 'cleared' } | { kind: 'unknown' };

/**
 * Completes RP/Hydra logout through the registered return, then Kratos SSO logout:
 *
 *  Leg 1 (RP / Hydra): a live BFF session redirects through its logout endpoint
 *    and Hydra `end_session` back to the registered /logout route.
 *  Leg 2 (Kratos SSO): on the return pass the shared foundation reports no
 *    authenticated requester session. Confirm BFF cleanup before asking Kratos
 *    for its browser logout flow.
 *
 * When neither leg has anything left to end, the outcome is `cleared`.
 */
export const useLogoutUrl = () => {
  const { getKratosLogoutUrl } = useKratosLogout();
  const [outcome, setOutcome] = useState<LogoutOutcome>();
  const [error, setError] = useState<Error>();

  const getLogoutUrl = async (session: boolean | 'invalid-session'): Promise<LogoutOutcome | undefined> => {
    if (outcome?.kind === 'unknown') return outcome;
    setError(undefined);
    setOutcome(undefined);
    try {
      const params = new URLSearchParams({
        post_logout_redirect_uri: `${window.location.origin}${AUTH_LOGOUT_PATH}`,
      });
      const bffLogoutUrl = `${OIDC_LOGOUT_PATH}?${params.toString()}`;
      if (session === true) {
        const next = { kind: 'redirect', url: bffLogoutUrl } as const;
        setOutcome(next);
        return next;
      }
      const cleanup = await fetch(bffLogoutUrl, { credentials: 'include', redirect: 'manual' });
      if (cleanup.type === 'opaqueredirect' || (cleanup.status >= 300 && cleanup.status < 400)) {
        const next = { kind: 'unknown' } as const;
        setOutcome(next);
        return next;
      }
      if (cleanup.status !== 204) throw new Error('BFF logout outcome unavailable');
      if (session === 'invalid-session') {
        const next = { kind: 'redirect', url: AUTH_LOGOUT_PATH } as const;
        setOutcome(next);
        return next;
      }
      const kratosOutcome = await getKratosLogoutUrl();
      if (kratosOutcome.kind === 'failed') throw new Error('Kratos logout outcome unavailable');
      const next = kratosOutcome.kind === 'redirect' ? kratosOutcome : ({ kind: 'cleared' } as const);
      setOutcome(next);
      return next;
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('Logout unavailable'));
    }
  };

  return {
    outcome,
    error,
    getLogoutUrl,
  };
};
