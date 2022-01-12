import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUpdateNavigation } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import UserMembershipPage from '../../pages/User/UserMembershipPage';
import UserNotificationsPage from '../../pages/User/UserNotificationsPage';
import UserOrganizationsPage from '../../pages/User/UserOrganizationsPage';
import UserTabs from './UserTabs';

interface UserSettingsProps extends PageProps {}

export const UserSettingsRoute: FC<UserSettingsProps> = ({ paths }) => {
  const url = '';
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'settings', real: false }], [url]);
  useUpdateNavigation({ currentPaths });

  return (
    <UserTabs>
      <Routes>
        <Route>
          <Navigate to={`${url}/profile`} />
        </Route>
        <Route path={'profile'}>
          <EditUserProfilePage paths={currentPaths} />
        </Route>
        <Route path={'membership'}>
          <UserMembershipPage paths={currentPaths} />
        </Route>
        <Route path={'organizations'}>
          <UserOrganizationsPage paths={currentPaths} />
        </Route>
        <Route path={'notifications'}>
          <UserNotificationsPage paths={currentPaths} />
        </Route>
        <Route path="*">
          <Error404 />
        </Route>
      </Routes>
    </UserTabs>
  );
};
export default UserSettingsRoute;
