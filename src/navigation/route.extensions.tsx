import React, { FC } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useUserContext } from '../hooks/useUserContext';
import { AuthorizationCredential } from '../types/graphql-schema';

interface RestrictedRoutePros extends RouteProps {
  requiredCredentials?: AuthorizationCredential[];
}

interface AuthenticatedRoutePros extends RouteProps {}

const RestrictedRoute: FC<RestrictedRoutePros> = ({ children, requiredCredentials = [], ...rest }) => {
  const { pathname } = useLocation();
  const { user, loading: userLoading } = useUserContext();
  const { isAuthenticated, loading: loadingAuthContext } = useAuthenticationContext();

  if (userLoading || loadingAuthContext) {
    return <Loading text="Loading user configuration" />;
  }

  if (!isAuthenticated) {
    return <Redirect to={`/auth/login?redirect=${encodeURI(pathname)}`} />;
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

export const AuthenticatedRoute: FC<AuthenticatedRoutePros> = ({ children, ...rest }) => {
  const { status } = useAuthenticate();

  if (status === 'userRegistration') return <Redirect to={'/profile/create'} />;

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route {...rest}>{children}</Route>
  );
};

export default RestrictedRoute;
