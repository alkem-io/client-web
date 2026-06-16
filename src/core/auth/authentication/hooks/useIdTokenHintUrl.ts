import { OIDC_ID_TOKEN_HINT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useConfig } from '@/domain/platform/config/useConfig';

// The id-token-hint BFF endpoint is served by the IdP on the identity
// subdomain, so the request must target the identity origin (the issuer)
// rather than the apex where the SPA runs. In development the Kratos config
// is unreliable, so we fall back to the relative same-origin path.
export const useIdTokenHintUrl = (): string => {
  const config = useConfig();

  const issuer =
    import.meta.env.MODE === 'development' ? undefined : config.authentication?.providers?.[0]?.config?.issuer;

  let identityOrigin: string | undefined;
  if (issuer) {
    try {
      identityOrigin = new URL(issuer).origin;
    } catch {
      identityOrigin = undefined;
    }
  }

  return identityOrigin ? `${identityOrigin}${OIDC_ID_TOKEN_HINT_PATH}` : OIDC_ID_TOKEN_HINT_PATH;
};
