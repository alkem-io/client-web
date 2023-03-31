import React, { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../../common/components/core/Loading/Loading';
import { useAuthenticationContext } from '../auth/authentication/hooks/useAuthenticationContext';

const NoIdentityRedirect: FC = ({ children }) => {
  const { pathname } = useLocation();
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  if (isLoadingAuthentication) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/identity/required?returnUrl=${encodeURI(pathname)}`} />;
  }

  return <>{children}</>;
};

export default NoIdentityRedirect;
