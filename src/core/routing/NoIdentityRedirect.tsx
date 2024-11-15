import React, { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../ui/loading/Loading';
import { useAuthenticationContext } from '../auth/authentication/hooks/useAuthenticationContext';
import { AUTH_REQUIRED_PATH } from '../auth/authentication/constants/authentication.constants';
import { buildReturnUrlParam } from '@/main/routing/urlBuilders';

const NoIdentityRedirect: FC = ({ children }) => {
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
