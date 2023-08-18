import React, { FC } from 'react';
import AdminLayout from '../../layout/toplevel/AdminLayout';
import { AdminSection } from '../../layout/toplevel/constants';
import useUserList from '../../../../community/user/providers/useUserList';
import SimpleSearchableList from '../../../../shared/components/SearchableList/SimpleSearchableList';
import SearchableListLayout from '../../../../shared/components/SearchableList/SearchableListLayout';
import useRelativeUrls from '../../utils/useRelativeUrls';

const AdminUsersPage: FC = () => {
  const { userList, ...listProps } = useUserList();

  const navigatableUsers = useRelativeUrls(userList);

  return (
    <AdminLayout currentTab={AdminSection.User}>
      <SearchableListLayout>
        <SimpleSearchableList data={navigatableUsers} {...listProps} />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminUsersPage;
