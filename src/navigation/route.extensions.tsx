import React, { FC } from 'react';
import { Redirect, Route, RouteProps, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useUserContext } from '../hooks/useUserContext';
import { LOCAL_STORAGE_RETURN_URL_KEY } from '../models/Constants';
import { AuthorizationCredential } from '../types/graphql-schema';

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
    localStorage.setItem(LOCAL_STORAGE_RETURN_URL_KEY, window.location.pathname);
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
