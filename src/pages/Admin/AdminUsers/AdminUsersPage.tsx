import React, { FC } from 'react';
import AdminLayout from '../../../domain/admin/toplevel/AdminLayout';
import UserListPage from '../User/UserListPage';
import { PageProps } from '../../common';
import { AdminSection } from '../../../domain/admin/toplevel/constants';

const AdminUsersPage: FC<PageProps> = ({ paths }) => {
  return (
    <AdminLayout currentTab={AdminSection.User}>
      <UserListPage paths={paths} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
