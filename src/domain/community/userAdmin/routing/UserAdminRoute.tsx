import { Navigate, Route, Routes } from 'react-router-dom';
import { useConfig } from '@/domain/platform/config/useConfig';
import { Error404 } from '@/core/pages/Errors/Error404';
import { PageLayoutHolderWithOutlet } from '@/domain/journey/common/EntityPageLayout';
import UserAdminProfilePage from '../tabs/UserAdminProfilePage';
import UserAdminAccountPage from '../tabs/UserAdminAccountPage';
import UserAdminCredentialsPage from '../tabs/UserAdminCredentialsPage';
import UserAdminMembershipPage from '../tabs/UserAdminMembershipPage';
import UserAdminNotificationsPage from '../tabs/UserAdminNotificationsPage';
import UserAdminOrganizationsPage from '../tabs/UserAdminOrganizationsPage';
import { PlatformFeatureFlagName } from '@/core/apollo/generated/graphql-schema';
import UserAdminSettingsPage from '../tabs/UserAdminSettingsPage';
import withUrlResolverParams from '@/main/routing/urlResolver/withUrlResolverParams';

export const UserAdminRoute = () => {
  const { isFeatureEnabled } = useConfig();

  return (
    <Routes>
      <Route path={'/'} element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path={'profile'} element={<UserAdminProfilePage />} />
        <Route path={'account'} element={<UserAdminAccountPage />} />
        <Route path={'membership'} element={<UserAdminMembershipPage />} />
        <Route path={'organizations'} element={<UserAdminOrganizationsPage />} />
        <Route path={'notifications'} element={<UserAdminNotificationsPage />} />
        <Route path={'settings'} element={<UserAdminSettingsPage />} />
        {isFeatureEnabled(PlatformFeatureFlagName.Ssi) && (
          <Route path={'credentials'} element={<UserAdminCredentialsPage />} />
        )}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default withUrlResolverParams(UserAdminRoute);
