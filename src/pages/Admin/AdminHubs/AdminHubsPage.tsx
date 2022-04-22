import React, { FC } from 'react';
import HubList from '../Hub/HubList';
import AdminLayout from '../../../domain/admin/toplevel/AdminLayout';
import { PageProps } from '../../common';
import { AdminSection } from '../../../domain/admin/toplevel/constants';

interface AdminDashboardPageProps extends PageProps {}

const AdminHubsPage: FC<AdminDashboardPageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.Hub}>
      <HubList paths={paths} />
    </AdminLayout>
  );
};

export default AdminHubsPage;
