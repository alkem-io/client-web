import { useState } from 'react';
import { AUTH_LOGOUT_PATH, OIDC_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useIdTokenHint } from './useIdTokenHint';

type LogoutOutcome = { kind: 'redirect'; url: string } | { kind: 'cleared' };

export const useLogoutUrl = () => {
  const { fetchIdTokenHint } = useIdTokenHint();
  const [error] = useState<Error>();
  const [loading, setLoading] = useState<boolean>();
  const [outcome, setOutcome] = useState<LogoutOutcome>();

  const getLogoutUrl = async () => {
    setLoading(true);
    const postLogoutRedirectUri = `${window.location.origin}${AUTH_LOGOUT_PATH}`;
    try {
      const idToken = await fetchIdTokenHint();
      const params = new URLSearchParams({
        id_token_hint: idToken,
        post_logout_redirect_uri: postLogoutRedirectUri,
      });
      // Hintful path — full RP-initiated logout via Hydra, then back to /logout.
      setOutcome({ kind: 'redirect', url: `${OIDC_LOGOUT_PATH}?${params.toString()}` });
    } catch {
      // No hint available — session is already gone. Call BFF hintless to
      // sweep any stale cookie. We use fetch (not navigation) so the page
      // does not reload; this avoids a redirect loop when /logout itself is
      // the post-logout target.
      try {
        await fetch(OIDC_LOGOUT_PATH, {
          credentials: 'include',
          redirect: 'manual',
        });
      } catch {
        // Network error mid-cleanup is non-fatal — the cookie either got
        // cleared or there was nothing to clear in the first place.
      }
      setOutcome({ kind: 'cleared' });
    } finally {
      setLoading(false);
    }
  };

  return {
    outcome,
    error,
    loading,
    getLogoutUrl: () => getLogoutUrl(),
  };
};
