import { useEffect, useState } from 'react';
import { useIdTokenHintUrl } from '@/core/auth/authentication/hooks/useIdTokenHintUrl';
import { runMatrixLogoutCleanup } from '@/core/matrix/logoutCleanup';

// Probes the BFF for an active OIDC (alkemio_session) session by hitting
// the id-token-hint endpoint. Status 200 implies a live session; 401 means
// the BFF cookie/session is gone, regardless of whether Kratos SSO is still
// alive in parallel. Used to gate `isAuthenticated` on the OIDC layer rather
// than the upstream Kratos session, so post-logout state is consistent.
// `secondFactorRequired` is the server's refusal of that session: a rule
// requires a second factor this sign-in did not use.
export const useOidcSessionStatus = () => {
  const [active, setActive] = useState<boolean>(false);
  const [secondFactorRequired, setSecondFactorRequired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const idTokenHintUrl = useIdTokenHintUrl();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(idTokenHintUrl, {
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        // The Alkemio session is gone, so the Matrix device ends with it before anything can navigate away.
        if (response.status === 401) await runMatrixLogoutCleanup();
        const body: { second_factor_required?: boolean } | undefined = response.ok
          ? await response.json().catch(() => undefined)
          : undefined;
        if (!cancelled) {
          setActive(response.ok);
          setSecondFactorRequired(body?.second_factor_required === true);
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
  }, [idTokenHintUrl]);

  return { active, loading, secondFactorRequired };
};
