import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../core/pages/Errors/Error404';
import { PageLayoutHolderWithOutlet } from '../../journey/common/EntityPageLayout';
import VCEditProfilePage from './vcSettingsPage/VCEditProfilePage';

const VCSettingsRoute = () => {
  return (
    <Routes>
      <Route path={'/'} element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<Navigate to={'profile'} />} />
        <Route path={'profile'} element={<VCEditProfilePage />} />
        <Route path={'membership'} element={<div>Membership</div>} />
        <Route path={'settings'} element={<div>Settings</div>} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default VCSettingsRoute;
