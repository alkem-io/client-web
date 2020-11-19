import React, { FC } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useUserContext } from '../hooks/useUserContext';

interface RestrictedRoutePros extends Record<string, unknown> {
  allowedGroups?: string[];
  strict?: boolean;
}

const RestrictedRoute: FC<RestrictedRoutePros> = ({ children, allowedGroups = [], strict = false, ...rest }) => {
  const { pathname } = useLocation();
  const { user, loading: userLoading } = useUserContext();
  const { status } = useAuthenticate();

  const loading = userLoading || status === 'authenticating' || status === 'refreshing';

  if (loading) {
    return <Loading text="Loading user configuration" />;
  }

  if (status === 'notauthenticated') {
    return <Redirect to={`/signin?redirect=${encodeURI(pathname)}`} />;
  }

  if (allowedGroups.every(x => !user || !user.ofGroup(x, strict)) && allowedGroups.length !== 0) {
    return <Redirect to={`/restricted?origin=${encodeURI(pathname)}`} />;
  }

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route {...rest}>{children}</Route>
  );
};

export default RestrictedRoute;
