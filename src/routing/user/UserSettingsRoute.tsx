import React, { FC } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404 } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import UserMembershipPage from '../../pages/User/UserMembershipPage';
import UserNotificationsPage from '../../pages/User/UserNotificationsPage';
import UserOrganizationsPage from '../../pages/User/UserOrganizationsPage';
import UserTabs from './UserTabs';

export const UserSettingsRoute: FC = () => {
  const { path, url } = useRouteMatch();

  return (
    <UserTabs>
      <Switch>
        <Route exact path={`${path}`}>
          <Redirect to={`${url}/profile`} />
        </Route>
        <Route path={`${path}/profile`}>
          <EditUserProfilePage />
        </Route>
        <Route path={`${path}/membership`}>
          <UserMembershipPage />
        </Route>
        <Route path={`${path}/organizations`}>
          <UserOrganizationsPage />
        </Route>
        <Route path={`${path}/notifications`}>
          <UserNotificationsPage />
        </Route>
        <Route path="*">
          <Error404 />
        </Route>
      </Switch>
    </UserTabs>
  );
};
export default UserSettingsRoute;
