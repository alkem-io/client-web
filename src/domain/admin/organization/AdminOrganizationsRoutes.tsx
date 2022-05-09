import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import OrganizationPage from '../components/Organization/OrganizationPage';
import { OrganizationProvider } from '../../organization/context/OrganizationProvider';
import { EditMode } from '../../../models/editMode';
import { Error404, PageProps } from '../../../pages';
import { nameOfUrl } from '../../../routing/url-params';
import OrganizationAdminRoutes from './OrganizationAdminRoutes';
import AdminOrganizationsPage from '../../organization/pages/AdminOrganizationsPage';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../toplevel/AdminLayout';
import { AdminSection } from '../toplevel/constants';

const AdminOrganizationsRoutes: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [paths]);
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<AdminOrganizationsPage paths={currentPaths} />}></Route>
        <Route
          path={'new'}
          element={
            <AdminLayout currentTab={AdminSection.Organization}>
              <OrganizationPage
                title={t('pages.admin.organization.create-organization')}
                mode={EditMode.new}
                paths={currentPaths}
              />
            </AdminLayout>
          }
        ></Route>
        <Route
          path={`:${nameOfUrl.organizationNameId}/*`}
          element={
            <OrganizationProvider>
              <OrganizationAdminRoutes paths={currentPaths} />
            </OrganizationProvider>
          }
        ></Route>
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};

export default AdminOrganizationsRoutes;
