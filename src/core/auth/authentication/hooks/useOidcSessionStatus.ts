import { useEffect, useState } from 'react';

// Probes the BFF for an active OIDC (alkemio_session) session by hitting
// /api/auth/oidc/id-token-hint. Status 200 implies a live session; 401 means
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
        const response = await fetch('/api/auth/oidc/id-token-hint', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!cancelled) {
          setActive(response.ok);
        }
      } catch {
        if (!cancelled) {
          setActive(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { active, loading };
};
