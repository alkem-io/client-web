import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import OrganizationPage from '../components/Organization/OrganizationPage';
import { EditMode } from '@core/ui/forms/editMode';
import { Error404 } from '@core/pages/Errors/Error404';
import AdminOrganizationsPage from '../../../community/contributor/organization/adminOrganizations/AdminOrganizationsPage';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';

const AdminOrganizationsRoutes: FC = () => {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminOrganizationsPage />} />
        <Route
          path="new"
          element={
            <AdminLayout currentTab={AdminSection.Organization}>
              <OrganizationPage title={t('pages.admin.organization.create-organization')} mode={EditMode.new} />
            </AdminLayout>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminOrganizationsRoutes;
