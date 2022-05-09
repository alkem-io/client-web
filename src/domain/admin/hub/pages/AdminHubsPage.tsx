import React, { FC } from 'react';
import HubList from './HubList';
import AdminLayout from '../../toplevel/AdminLayout';
import { PageProps } from '../../../../pages/common';
import { AdminSection } from '../../toplevel/constants';

interface AdminDashboardPageProps extends PageProps {}

const AdminHubsPage: FC<AdminDashboardPageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.Hub}>
      <HubList paths={paths} />
    </AdminLayout>
  );
};

export default AdminHubsPage;
