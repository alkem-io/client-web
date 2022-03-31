import React, { FC } from 'react';
import HubList from '../Hub/HubList';
import AdminLayout from '../../../components/composite/layout/AdminLayout/AdminLayout';
import { PageProps } from '../../common';
import { AdminSection } from '../../../components/composite/layout/AdminLayout/constants';

interface AdminDashboardPageProps extends PageProps {}

const AdminHubsPage: FC<AdminDashboardPageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.Hub}>
      <HubList paths={paths} />
    </AdminLayout>
  );
};

export default AdminHubsPage;
