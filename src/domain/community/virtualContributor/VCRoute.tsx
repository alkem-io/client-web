import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import VCProfilePage from './vcProfilePage/VCProfilePage';
import { PageLayoutHolderWithOutlet } from '../../journey/common/EntityPageLayout';
import TopLevelLayout from '../../../main/ui/layout/TopLevelLayout';
import { Error404 } from '../../../core/pages/Errors/Error404';
import VCSettingsPage from './vcSettingsPage/VCSettingsPage';

export const VCRoute: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PageLayoutHolderWithOutlet />}>
        <Route index element={<VCProfilePage />} />
      </Route>
      <Route path={'settings/*'} element={<VCSettingsPage />} />
      <Route
        path="*"
        element={
          <TopLevelLayout>
            <Error404 />
          </TopLevelLayout>
        }
      />
    </Routes>
  );
};

export default VCRoute;
