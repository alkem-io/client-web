import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../pages';
import ApplicationDetailsPage from '../../components/Community/ApplicationDetailsPage';
import { nameOfUrl } from '../../../../routing/url-params';

export const ApplicationsAdminRoutes: FC = () => {
  return (
    <Routes>
      <Route path={`:${nameOfUrl.applicationId}`} element={<ApplicationDetailsPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
