import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { useUpdateNavigation, useConfig } from '../../../../hooks';
import { FEATURE_SSI } from '../../../../models/constants';
import { PageProps, Error404 } from '../../../../pages';
import { EntityPageLayoutHolder } from '../../../shared/layout/PageLayout';
import EditUserProfilePage from '../pages/EditUserProfilePage';
import UserCredentialsPage from '../pages/UserCredentialsPage';
import UserMembershipPage from '../pages/UserMembershipPage';
import UserNotificationsPage from '../pages/UserNotificationsPage';
import UserOrganizationsPage from '../pages/UserOrganizationsPage';

interface UserSettingsProps extends PageProps {}

export const UserSettingsRoute: FC<UserSettingsProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'settings', real: false }], [url]);
  useUpdateNavigation({ currentPaths });

  const { isFeatureEnabled } = useConfig();

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate to={'profile'} />}></Route>
        <Route path={'profile'} element={<EditUserProfilePage paths={currentPaths} />}></Route>
        <Route path={'membership'} element={<UserMembershipPage paths={currentPaths} />}></Route>
        <Route path={'organizations'} element={<UserOrganizationsPage paths={currentPaths} />}></Route>
        <Route path={'notifications'} element={<UserNotificationsPage paths={currentPaths} />}></Route>
        {isFeatureEnabled(FEATURE_SSI) && (
          <Route path={'credentials'} element={<UserCredentialsPage paths={currentPaths} />}></Route>
        )}
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
export default UserSettingsRoute;
