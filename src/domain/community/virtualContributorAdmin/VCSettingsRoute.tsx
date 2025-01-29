import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import VCEditProfilePage from './vcSettingsPage/VCEditProfilePage';
import VCMembershipPage from '../virtualContributor/vcMembershipPage/VCMembershipPage';
import VCAccessibilitySettingsPage from './VCAccessibilitySettings/VCAccessibilitySettingsPage';

const VCSettingsRoute = () => (
  <Routes>
    <Route index element={<Navigate to={'profile'} />} />
    <Route path="profile" element={<VCEditProfilePage />} />
    <Route path="membership" element={<VCMembershipPage />} />
    <Route path="settings" element={<VCAccessibilitySettingsPage />} />
    <Route path="*" element={<Error404 />} />
  </Routes>
);

export default VCSettingsRoute;
