import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import OrganizationPage from '../components/Organization/OrganizationPage';
import { OrganizationProvider } from '../../../community/contributor/organization/context/OrganizationProvider';
import { EditMode } from '../../../../core/ui/forms/editMode';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import OrganizationAdminRoutes from './OrganizationAdminRoutes';
import AdminOrganizationsPage from '../../../community/contributor/organization/pages/AdminOrganizationsPage';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../toplevel/AdminLayout';
import { AdminSection } from '../toplevel/constants';

const AdminOrganizationsRoutes: FC<PageProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const currentPaths = useMemo(() => [...paths, { value: url, name: 'organizations', real: true }], [paths, url]);
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<AdminOrganizationsPage paths={currentPaths} />} />
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
        />
        <Route
          path={`:${nameOfUrl.organizationNameId}/*`}
          element={
            <OrganizationProvider>
              <OrganizationAdminRoutes paths={currentPaths} />
            </OrganizationProvider>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminOrganizationsRoutes;
