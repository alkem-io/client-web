import React, { FC } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useAuthenticationContext } from '../hooks';
import { useUserContext } from '../hooks';
import { AuthorizationCredential } from '../models/graphql-schema';

interface RestrictedRoutePros extends RouteProps {
  requiredCredentials?: AuthorizationCredential[];
}

const RestrictedRoute: FC<RestrictedRoutePros> = ({ children, requiredCredentials = [], ...rest }) => {
  const { pathname } = useLocation();
  const { user, loading: userLoading } = useUserContext();
  const { isAuthenticated, loading: loadingAuthContext } = useAuthenticationContext();

  if (userLoading || loadingAuthContext) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Redirect to={`/auth/required?returnUrl=${encodeURI(pathname)}`} />;
  }

  if (requiredCredentials.every(x => !user || !user.hasCredentials(x)) && requiredCredentials.length !== 0) {
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
