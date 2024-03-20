import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useConfig } from '../../../platform/config/useConfig';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { EntityPageLayoutHolder } from '../../../journey/common/EntityPageLayout';
import EditUserProfilePage from '../pages/EditUserProfilePage';
import UserCredentialsPage from '../pages/UserCredentialsPage';
import UserMembershipPage from '../pages/UserMembershipPage';
import UserNotificationsPage from '../pages/UserNotificationsPage';
import UserOrganizationsPage from '../pages/UserOrganizationsPage';
import { PlatformFeatureFlagName } from '../../../../core/apollo/generated/graphql-schema';

export const UserSettingsRoute = () => {
  const { isFeatureEnabled } = useConfig();

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path={'profile'} element={<EditUserProfilePage />} />
        <Route path={'membership'} element={<UserMembershipPage />} />
        <Route path={'organizations'} element={<UserOrganizationsPage />} />
        <Route path={'notifications'} element={<UserNotificationsPage />} />
        {isFeatureEnabled(PlatformFeatureFlagName.Ssi) && (
          <Route path={'credentials'} element={<UserCredentialsPage />} />
        )}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default UserSettingsRoute;
