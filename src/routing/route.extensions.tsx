import React, { FC } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading/Loading';
import { useAuthenticationContext } from '../hooks';
import { useUserContext } from '../hooks';
import { AuthorizationCredential } from '../models/graphql-schema';

export interface CredentialsForResource {
  credential: AuthorizationCredential;
  resourceId: string;
}

interface RestrictedRoutePros extends RouteProps {
  requiredCredentials?: AuthorizationCredential[];
  credentialForResource?: CredentialsForResource[];
}

const RestrictedRoute: FC<RestrictedRoutePros> = ({
  children,
  requiredCredentials = [],
  credentialForResource = [],
  ...rest
}) => {
  const { pathname } = useLocation();
  const { user, loading: userLoading } = useUserContext();
  const { isAuthenticated, loading: loadingAuthContext } = useAuthenticationContext();

  if (userLoading || loadingAuthContext) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Redirect to={`/identity/required?returnUrl=${encodeURI(pathname)}`} />;
  }

  if (!user || (requiredCredentials.every(x => !user.hasCredentials(x)) && requiredCredentials.length !== 0)) {
    return <Redirect to={`/restricted?origin=${encodeURI(pathname)}`} />;
  }

  if (
    !user ||
    (credentialForResource.some(({ credential, resourceId }) => !user.hasCredentials(credential, resourceId)) &&
      credentialForResource.length)
  ) {
    return <Redirect to={`/restricted?origin=${encodeURI(pathname)}`} />;
  }

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route {...rest}>{children}</Route>
  );
};

export const NotAuthenticatedRoute: FC<RouteProps> = ({ children, ...rest }) => {
  const { isAuthenticated } = useAuthenticationContext();

  if (isAuthenticated) return <Redirect to={'/'} />;

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route {...rest}>{children}</Route>
  );
};

export default RestrictedRoute;
