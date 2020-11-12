import React, { FC } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import Loading from '../components/core/Loading';
import { useUserContext } from '../hooks/useUserContext';

interface RestrictedRoutePros extends Record<string, unknown> {
  allowedGroups?: string[];
  strict?: boolean;
}

const RestrictedRoute: FC<RestrictedRoutePros> = ({ children, allowedGroups = [], strict = false, ...rest }) => {
  const { pathname } = useLocation();
  const { user, loading } = useUserContext();

  if (loading) {
    return <Loading text="Loading user configuration" />;
  }

  if (!user) {
    return <Redirect to={`/signin?redirect=${encodeURI(pathname)}`} />;
  }

  if (allowedGroups.every(x => !user.ofGroup(x, strict))) {
    return <Redirect to={`/restricted?origin=${encodeURI(pathname)}`} />;
  }

  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Route {...rest}>{children}</Route>
  );
};

export default RestrictedRoute;
