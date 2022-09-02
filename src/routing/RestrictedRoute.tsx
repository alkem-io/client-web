import React, { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '../common/components/core/Loading/Loading';
import { useAuthenticationContext } from '../core/auth/authentication/hooks/useAuthenticationContext';
import { useUserContext } from '../hooks';
import { AuthorizationCredential } from '../models/graphql-schema';

// those roles have unconditional access to every restricted resource
const adminCredentials = [AuthorizationCredential.GlobalAdmin, AuthorizationCredential.GlobalAdminCommunity];

export interface CredentialForResource {
  credential: AuthorizationCredential;
  resourceId?: string;
}

type RequiredCredential = AuthorizationCredential | CredentialForResource;

interface RestrictedRoutePros {
  requiredCredentials?: RequiredCredential[];
}

const RestrictedRoute: FC<RestrictedRoutePros> = ({ children, requiredCredentials = [] }) => {
  const { pathname } = useLocation();
  const { user, loading: userLoading } = useUserContext();
  const { isAuthenticated, loading: loadingAuthContext } = useAuthenticationContext();

  if (userLoading || loadingAuthContext) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/identity/required?returnUrl=${encodeURI(pathname)}`} />;
  }

  // if the user has any of the credentials - get him through
  if (!user || adminCredentials.some(x => user.hasCredentials(x))) {
    return <>{children}</>;
  }

  const toCredentialForResource = (x: RequiredCredential): CredentialForResource =>
    typeof x === 'string' ? { credential: x } : x;

  if (
    !user ||
    (requiredCredentials.map(toCredentialForResource).every(x => !user.hasCredentials(x.credential, x.resourceId)) &&
      requiredCredentials.length !== 0)
  ) {
    return <Navigate to={`/restricted?origin=${encodeURI(pathname)}`} />;
  }

  return <>{children}</>;
};

export default RestrictedRoute;
