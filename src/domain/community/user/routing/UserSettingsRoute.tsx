import { Navigate, Route, Routes } from 'react-router-dom';
import { useConfig } from '@/domain/platform/config/useConfig';
import { Error404 } from '@/core/pages/Errors/Error404';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import UserProfilePage from '../pages/UserProfilePage';
import UserAccountPage from '../pages/UserAccountPage';
import UserCredentialsPage from '../pages/UserCredentialsPage';
import UserMembershipPage from '../pages/UserMembershipPage';
import UserNotificationsPage from '../pages/UserNotificationsPage';
import UserOrganizationsPage from '../pages/UserOrganizationsPage';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';

export const UserSettingsRoute = () => {
  const { isFeatureEnabled } = useConfig();

  return (
    <Routes>
      <Route path={'/'} element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path={'profile'} element={<UserProfilePage />} />
        <Route path={'account'} element={<UserAccountPage />} />
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
