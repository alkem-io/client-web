import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import ApplicationDetailsPage from '@/domain/platform/admin/components/Community/ApplicationDetailsPage';
import { nameOfUrl } from '@/main/routing/urlParams';

export const ApplicationsAdminRoutes: FC = () => {
  return (
    <Routes>
      <Route path={`:${nameOfUrl.applicationId}`} element={<ApplicationDetailsPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
