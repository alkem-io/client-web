import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { useConfig } from '../../../platform/config/useConfig';
import { FEATURE_SSI } from '../../../platform/config/features.constants';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { EntityPageLayoutHolder } from '../../../journey/common/EntityPageLayout';
import EditUserProfilePage from '../pages/EditUserProfilePage';
import UserCredentialsPage from '../pages/UserCredentialsPage';
import UserMembershipPage from '../pages/UserMembershipPage';
import UserNotificationsPage from '../pages/UserNotificationsPage';
import UserOrganizationsPage from '../pages/UserOrganizationsPage';

interface UserSettingsProps extends PageProps {}

export const UserSettingsRoute: FC<UserSettingsProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'settings', real: false }], [paths, url]);
  const { isFeatureEnabled } = useConfig();

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path={'profile'} element={<EditUserProfilePage />} />
        <Route path={'membership'} element={<UserMembershipPage />} />
        <Route path={'organizations'} element={<UserOrganizationsPage paths={currentPaths} />} />
        <Route path={'notifications'} element={<UserNotificationsPage paths={currentPaths} />} />
        {isFeatureEnabled(FEATURE_SSI) && (
          <Route path={'credentials'} element={<UserCredentialsPage paths={currentPaths} />} />
        )}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default UserSettingsRoute;
