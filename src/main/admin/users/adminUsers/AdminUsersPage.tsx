import React, { FC } from 'react';
import AdminLayout from '../../../../domain/platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../../../domain/platform/admin/layout/toplevel/constants';
import useAdminGlobalUserList from '../../../../domain/community/user/adminUsers/useAdminGlobalUserList';
import SimpleSearchableList from '../../../../domain/shared/components/SearchableList/SimpleSearchableList';
import SearchableListLayout from '../../../../domain/shared/components/SearchableList/SearchableListLayout';

const AdminUsersPage: FC = () => {
  const { userList, ...listProps } = useAdminGlobalUserList();

  return (
    <AdminLayout currentTab={AdminSection.User}>
      <SearchableListLayout>
        <SimpleSearchableList data={userList} {...listProps} />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminUsersPage;
