import React, { FC } from 'react';
import HubList from './HubList';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';

const AdminHubsPage: FC = () => {
  return (
    <AdminLayout currentTab={AdminSection.Hub}>
      <HubList />
    </AdminLayout>
  );
};

export default AdminHubsPage;
