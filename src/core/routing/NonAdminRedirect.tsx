import React, { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../../common/components/core/Loading/Loading';
import { useAuthenticationContext } from '../auth/authentication/hooks/useAuthenticationContext';
import { AuthorizationPrivilege } from '../apollo/generated/graphql-schema';
import useHasPlatformLevelPrivilege from '../../domain/community/contributor/user/PlatformLevelAuthorization/useHasPlatformLevelPrivilege';

const NonAdminRedirect: FC = ({ children }) => {
  const { pathname } = useLocation();
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const [isAdmin, { loading: isLoadingPrivileges }] = useHasPlatformLevelPrivilege(AuthorizationPrivilege.Admin);

  if (isLoadingPrivileges || isLoadingAuthentication) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/identity/required?returnUrl=${encodeURI(pathname)}`} />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
};

export default NonAdminRedirect;
