import React, { FC } from 'react';
import AdminLayout from '../../../components/composite/layout/AdminLayout/AdminLayout';
import UserListPage from '../User/UserListPage';
import { PageProps } from '../../common';
import { AdminSection } from '../../../components/composite/layout/AdminLayout/constants';

const AdminUsersPage: FC<PageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.User}>
      <UserListPage paths={paths} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
