import React, { FC, useMemo } from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { Error404, PageProps } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import UserMembershipPage from '../../pages/User/UserMembershipPage';
import UserNotificationsPage from '../../pages/User/UserNotificationsPage';
import UserOrganizationsPage from '../../pages/User/UserOrganizationsPage';
import UserTabs from './UserTabs';
import { useUpdateNavigation } from '../../hooks';

interface UserSettingsProps extends PageProps {}

export const UserSettingsRoute: FC<UserSettingsProps> = ({ paths }) => {
  const { path, url } = useRouteMatch();
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'user settings', real: false }], [url]);
  useUpdateNavigation({ currentPaths });

  return (
    <UserTabs>
      <Switch>
        <Route exact path={`${path}`}>
          <Redirect to={`${url}/profile`} />
        </Route>
        <Route path={`${path}/profile`}>
          <EditUserProfilePage paths={currentPaths} />
        </Route>
        <Route path={`${path}/membership`}>
          <UserMembershipPage paths={currentPaths} />
        </Route>
        <Route path={`${path}/organizations`}>
          <UserOrganizationsPage paths={currentPaths} />
        </Route>
        <Route path={`${path}/notifications`}>
          <UserNotificationsPage paths={currentPaths} />
        </Route>
        <Route path="*">
          <Error404 />
        </Route>
      </Switch>
    </UserTabs>
  );
};
export default UserSettingsRoute;
