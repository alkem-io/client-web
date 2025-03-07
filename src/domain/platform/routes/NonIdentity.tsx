import { PropsWithChildren, useLayoutEffect } from 'react';
import { useConfig } from '../config/useConfig';
import { Error404 } from '@/core/pages/Errors/Error404';
import Loading from '@/core/ui/loading/Loading';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import usePlatformOrigin from './usePlatformOrigin';

const NonIdentity = ({ children }: PropsWithChildren) => {
  const config = useConfig();

  const platformOrigin = usePlatformOrigin();

  const { isAuthenticated, loading: loadingAuthentication } = useAuthenticationContext();

  const identityOrigin = config.authentication?.providers[0].config.issuer;

  const isIdentityOrigin = window.location.origin === identityOrigin;

  const isLoading = config.loading || loadingAuthentication;

  const shouldRedirectToNonIdentity = !isLoading && isIdentityOrigin && isAuthenticated && !!platformOrigin;

  useLayoutEffect(() => {
    if (shouldRedirectToNonIdentity) {
      const { pathname, search } = window.location;
      window.location.replace(`${platformOrigin}${pathname}${search}`);
    }
  }, [isLoading, shouldRedirectToNonIdentity]);

  if (isLoading) {
    return <Loading />;
  }

  if (shouldRedirectToNonIdentity) {
    // When a User is logged and tries to access a non-identity route from the identity subdomain
    // we have to render something while the browser redirects to the platform domain.
    return <Loading />;
  }

  if (isIdentityOrigin) {
    return <Error404 />;
  }

  return <>{children}</>;
};

export default NonIdentity;
