import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { PageLayoutHolderWithOutlet } from '../../journey/common/EntityPageLayout';
import VCEditProfilePage from './vcSettingsPage/VCEditProfilePage';
import VCMembershipPage from './vcMembershipPage/VCMembershipPage';
import VCAccessibilitySettingsPage from './VCAccessibilitySettings/VCAccessibilitySettingsPage';

const VCSettingsRoute = () => {
  return (
    <Routes>
      <Route path={'/'} element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path="profile" element={<VCEditProfilePage />} />
        <Route path="membership" element={<VCMembershipPage />} />
        <Route path="settings" element={<VCAccessibilitySettingsPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default VCSettingsRoute;
