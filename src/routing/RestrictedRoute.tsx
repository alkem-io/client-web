import React, { FC } from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading/Loading';
import { useAuthenticationContext, useUserContext } from '../hooks';
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

const RestrictedRoute: FC<RestrictedRoutePros> = ({ children, requiredCredentials = [], ...rest }) => {
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
    return <Route {...rest}>{children}</Route>;
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

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route {...rest}>{children}</Route>
  );
};

export default RestrictedRoute;
