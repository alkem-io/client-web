import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@core/pages/Errors/Error404';
import VirtualContributorsPage from './VirtualContributorsPage';

const VirtualContributorsRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<VirtualContributorsPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default VirtualContributorsRoutes;
