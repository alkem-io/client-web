import { buildReturnUrlParam } from '@/main/routing/urlBuilders';
import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AUTH_REQUIRED_PATH } from '../auth/authentication/constants/authentication.constants';
import { useAuthenticationContext } from '../auth/authentication/hooks/useAuthenticationContext';
import Loading from '../ui/loading/Loading';

const NoIdentityRedirect = ({ children }: PropsWithChildren) => {
  const { pathname } = useLocation();
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  if (isLoadingAuthentication) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`${AUTH_REQUIRED_PATH}${buildReturnUrlParam(pathname)}`} />;
  }

  return <>{children}</>;
};

export default NoIdentityRedirect;
