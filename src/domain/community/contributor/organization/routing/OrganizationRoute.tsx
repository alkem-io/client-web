import React, { FC } from 'react';
import { Route, Routes } from 'react-router';
import { PageLayoutHolderWithOutlet } from '../../../../journey/common/EntityPageLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import OrganizationPage from '../pages/OrganizationPage';
import OrganizationAdminRoutes from '../../../../platform/admin/organization/OrganizationAdminRoutes';
import { nameOfUrl } from '@/main/routing/urlParams';
import { OrganizationProvider } from '../context/OrganizationProvider';
import { Outlet } from 'react-router-dom';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';

const OrganizationProviderWithOutlet = () => (
  <OrganizationProvider>
    <Outlet />
  </OrganizationProvider>
);

const OrganizationRoute: FC = () => {
  return (
    <Routes>
      <Route path={`:${nameOfUrl.organizationNameId}/*`} element={<OrganizationProviderWithOutlet />}>
        <Route path="" element={<PageLayoutHolderWithOutlet />}>
          <Route index element={<OrganizationPage />} />
          <Route path="settings/*" element={<OrganizationAdminRoutes />} />
        </Route>
      </Route>
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

export default OrganizationRoute;
