import React, { FC } from 'react';
import SpaceList from './SpaceList';
import AdminLayout from '@/domain/platformAdmin/layout/toplevel/AdminLayout';
import { AdminSection } from '@/domain/platformAdmin/layout/toplevel/constants';

const AdminSpacesPage: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Space}>
      <SpaceList />
    </AdminLayout>
  );
};

export default AdminSpacesPage;
