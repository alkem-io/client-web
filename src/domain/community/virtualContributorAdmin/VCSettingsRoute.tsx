import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import VCMembershipPage from '../virtualContributor/vcMembershipPage/VCMembershipPage';
import VirtualContributorSettingsPage from './VirtualContributorSettingsPage/VirtualContributorSettingsPage';
import VCSettingsPage from './vcSettingsPage/VCSettingsPage';

const VCSettingsRoute = () => (
  <Routes>
    <Route index={true} element={<Navigate to={'profile'} />} />
    <Route path="profile" element={<VCSettingsPage />} />
    <Route path="membership" element={<VCMembershipPage />} />
    <Route path="settings" element={<VirtualContributorSettingsPage />} />
    <Route path="*" element={<Error404 />} />
  </Routes>
);

export default VCSettingsRoute;
