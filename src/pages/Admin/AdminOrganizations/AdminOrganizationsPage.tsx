import React, { FC } from 'react';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import AdminLayout from '../../../components/composite/layout/AdminLayout/AdminLayout';
import { PageProps } from '../../common';
import { AdminSection } from '../../../components/composite/layout/AdminLayout/constants';

interface AdminOrganizationsPageProps extends PageProps {}

const AdminOrganizationsPage: FC<AdminOrganizationsPageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.Organization}>
      <OrganizationList paths={paths} />
    </AdminLayout>
  );
};

export default AdminOrganizationsPage;
