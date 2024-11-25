import React, { FC } from 'react';
import SpaceList from './SpaceList';
import AdminLayout from '@/domain/platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platform/admin/layout/toplevel/constants';

const AdminSpacesPage: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Space}>
      <SpaceList />
    </AdminLayout>
  );
};

export default AdminSpacesPage;
