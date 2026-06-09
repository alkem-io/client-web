import { useEffect, useState } from 'react';
import { OIDC_ID_TOKEN_HINT_PATH } from '@/core/auth/authentication/constants/authentication.constants';

// Probes the BFF for an active OIDC (alkemio_session) session by hitting
// the id-token-hint endpoint. Status 200 implies a live session; 401 means
// the BFF cookie/session is gone, regardless of whether Kratos SSO is still
// alive in parallel. Used to gate `isAuthenticated` on the OIDC layer rather
// than the upstream Kratos session, so post-logout state is consistent.
export const useOidcSessionStatus = () => {
  const [active, setActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(OIDC_ID_TOKEN_HINT_PATH, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!cancelled) {
          setActive(response.ok);
          window.alert(`Success: OIDC session response ok: ${response.ok}`);
        }
      } catch {
        if (!cancelled) {
          setActive(false);
          window.alert(`Catch: OIDC session response: ${false}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          window.alert(`Finally: OIDC session response: ${false}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { active, loading };
};
