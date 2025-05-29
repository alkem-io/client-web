import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import OrganizationPage from '../components/Organization/OrganizationPage';
import { EditMode } from '@/core/ui/forms/editMode';
import { Error404 } from '@/core/pages/Errors/Error404';
import AdminOrganizationsPage from '@/domain/platform/admin/organizations/AdminOrganizationsPage';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';

const AdminOrganizationsRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AdminOrganizationsPage />} />
        <Route
          path="new"
          element={
            <AdminLayout currentTab={AdminSection.Organization}>
              <OrganizationPage mode={EditMode.new} />
            </AdminLayout>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AdminOrganizationsRoutes;
