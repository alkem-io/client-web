import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { EditUserProfile, UserProfile } from '../components/UserProfile';
import { FourOuFour } from '../pages';
import RestrictedRoute from './route.extensions';

export const ProfileRoute: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <RestrictedRoute exact path={`${path}/edit`}>
        <EditUserProfile />
      </RestrictedRoute>
      <RestrictedRoute exact path={`${path}`}>
        <UserProfile />
      </RestrictedRoute>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
export default ProfileRoute;
