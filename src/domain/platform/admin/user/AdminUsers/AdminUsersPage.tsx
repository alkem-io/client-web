import React, { FC } from 'react';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import useAdminGlobalUserList from '../../../../community/user/adminUsers/useAdminGlobalUserList';
import SimpleSearchableList from '../../../../shared/components/SearchableList/SimpleSearchableList';
import SearchableListLayout from '../../../../shared/components/SearchableList/SearchableListLayout';

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
