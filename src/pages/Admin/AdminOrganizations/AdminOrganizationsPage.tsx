import React, { FC } from 'react';
import OrganizationList from '../../../components/Admin/Organization/OrganizationList';
import AdminLayout from '../../../domain/admin/toplevel/AdminLayout';
import { PageProps } from '../../common';
import { AdminSection } from '../../../domain/admin/toplevel/constants';

interface AdminOrganizationsPageProps extends PageProps {}

const AdminOrganizationsPage: FC<AdminOrganizationsPageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.Organization}>
      <OrganizationList paths={paths} />
    </AdminLayout>
  );
};

export default AdminOrganizationsPage;
