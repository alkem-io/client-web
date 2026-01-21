import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import UserAdminProfilePage from '../tabs/UserAdminProfilePage';
import UserAdminAccountPage from '../tabs/UserAdminAccountPage';
import UserAdminMembershipPage from '../tabs/UserAdminMembershipPage';
import UserAdminNotificationsPage from '../tabs/UserAdminNotificationsPage';
import UserAdminOrganizationsPage from '../tabs/UserAdminOrganizationsPage';
import UserAdminSettingsPage from '../tabs/UserAdminSettingsPage';
import UserSecuritySettingsPage from '../tabs/UserSecuritySettingsPage';

export const UserAdminRoute = () => {
  return (
    <Routes>
      <Route path={'/'} element={<Outlet />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path={'profile'} element={<UserAdminProfilePage />} />
        <Route path={'account'} element={<UserAdminAccountPage />} />
        <Route path={'membership'} element={<UserAdminMembershipPage />} />
        <Route path={'organizations'} element={<UserAdminOrganizationsPage />} />
        <Route path={'notifications'} element={<UserAdminNotificationsPage />} />
        <Route path={'settings'} element={<UserAdminSettingsPage />} />
        <Route path={'security'} element={<UserSecuritySettingsPage />} />
        {/*{isFeatureEnabled(PlatformFeatureFlagName.Ssi) && (*/}
        {/*  <Route path={'credentials'} element={<UserAdminCredentialsPage />} />*/}
        {/*)}*/}
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default UserAdminRoute;
