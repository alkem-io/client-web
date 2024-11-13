import { useLayoutEffect } from 'react';
import { useConfig } from '@domain/platform/config/useConfig';

const IdentityLocations = [
  '/login',
  '/logout',
  '/sign_up',
  '/registration',
  '/verify',
  '/recovery',
  '/required',
  '/settings',
  '/error',
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
