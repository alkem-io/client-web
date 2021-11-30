import React, { FC } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import UserTabs from './UserTabs';

export const UserSettingsRoute: FC = () => {
  const { path, url } = useRouteMatch();

  return (
    <UserTabs>
      <Switch>
        <Route exact path={`${path}`}>
          <Redirect to={`${url}/profile`} />
        </Route>
        <Route path={`${path}`}>
          <EditUserProfilePage />
        </Route>

        <Route path="*">
          <Error404 />
        </Route>
      </Switch>
    </UserTabs>
  );
};
export default UserSettingsRoute;
