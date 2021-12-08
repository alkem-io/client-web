import React, { FC } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import { UserProfilePage } from '../../pages/User/UserProfilePage';
import { nameOfUrl } from '../url-params';
import UserSettingsRoute from './UserSettingsRoute';

export const UserRoute: FC = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/:${nameOfUrl.userId}`}>
        <UserProfilePage />
      </Route>
      <Route exact path={`${path}/:${nameOfUrl.userId}/edit`}>
        <EditUserProfilePage />
      </Route>
      <Route path={`${path}/:${nameOfUrl.userId}/settings`}>
        <UserSettingsRoute />
      </Route>
      <Route path="*">
        <Error404 />
      </Route>
    </Switch>
  );
};
export default UserRoute;
