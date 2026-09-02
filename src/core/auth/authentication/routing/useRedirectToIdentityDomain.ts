import { useLayoutEffect } from 'react';
import { useConfig } from '@/domain/platform/config/useConfig';

// `/login` and `/logout` removed: with the OIDC BFF on the apex
// (`/api/auth/oidc/*` routes to alkemio-server only on `sandbox-alkem.io`),
// the login/logout UI must stay on the apex. Bouncing to the identity
// subdomain caused LoginPage's relative `window.location.replace`
// (`/api/auth/oidc/login`) to 404 there.
const IdentityLocations = [
  '/sign_up',
  '/registration',
  '/verify',
  '/recovery',
  '/required',
  '/settings',
  '/error',
  '/ory',
];

const useRedirectToIdentityDomain = () => {
  const config = useConfig();

  // Kratos config for development setup is quite specific, we can't rely on it locally.
  const identityOrigin =
    import.meta.env.MODE === 'development' ? undefined : config.authentication?.providers[0].config.issuer;

  const isOnIdentityOrigin = window.location.origin === identityOrigin;

  useLayoutEffect(() => {
    if (identityOrigin && !isOnIdentityOrigin) {
      const { pathname, search } = window.location;
      if (IdentityLocations.some(location => pathname.startsWith(location))) {
        window.location.replace(`${identityOrigin}${pathname}${search}`);
      }
    }
  }, [isOnIdentityOrigin]);
};

export default useRedirectToIdentityDomain;
