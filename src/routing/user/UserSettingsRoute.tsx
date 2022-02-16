import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { useUpdateNavigation } from '../../hooks';
import { Error404, PageProps } from '../../pages';
import EditUserProfilePage from '../../pages/User/EditUserProfilePage';
import UserMembershipPage from '../../pages/User/UserMembershipPage';
import UserNotificationsPage from '../../pages/User/UserNotificationsPage';
import UserOrganizationsPage from '../../pages/User/UserOrganizationsPage';
import UserCredentialsPage from '../../pages/User/UserCredentialsPage';
import UserTabs from './UserTabs';

interface UserSettingsProps extends PageProps {}

export const UserSettingsRoute: FC<UserSettingsProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'settings', real: false }], [url]);
  useUpdateNavigation({ currentPaths });

  return (
    <UserTabs>
      <Routes>
        <Route path={'/'}>
          <Route index element={<Navigate to={'profile'} />}></Route>
          <Route path={'profile'} element={<EditUserProfilePage paths={currentPaths} />}></Route>
          <Route path={'membership'} element={<UserMembershipPage paths={currentPaths} />}></Route>
          <Route path={'organizations'} element={<UserOrganizationsPage paths={currentPaths} />}></Route>
          <Route path={'notifications'} element={<UserNotificationsPage paths={currentPaths} />}></Route>
          <Route path={'credentials'} element={<UserCredentialsPage paths={currentPaths} />}></Route>
          <Route path="*" element={<Error404 />}></Route>
        </Route>
      </Routes>
    </UserTabs>
  );
};
export default UserSettingsRoute;
