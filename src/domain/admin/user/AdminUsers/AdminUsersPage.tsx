import React, { FC } from 'react';
import AdminLayout from '../../toplevel/AdminLayout';
import { PageProps } from '../../../../pages/common';
import { AdminSection } from '../../toplevel/constants';
import { useUpdateNavigation } from '../../../../hooks';
import useUserList from '../../../user/providers/useUserList';
import SimpleSearchableList from '../../../shared/components/SimpleSearchableList';
import SearchableListLayout from '../../../shared/components/SearchableListLayout';

const AdminUsersPage: FC<PageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  const { userList, onDelete, loading, fetchMore, hasMore, pageSize, firstPageSize, searchTerm, onSearchTermChange } =
    useUserList();

  return (
    <AdminLayout currentTab={AdminSection.User}>
      <SearchableListLayout>
        <SimpleSearchableList
          data={userList}
          onDelete={onDelete}
          loading={loading}
          fetchMore={fetchMore}
          hasMoreItems={hasMore}
          pageSize={pageSize}
          firstPageSize={firstPageSize}
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
        />
      </SearchableListLayout>
    </AdminLayout>
  );
};

export default AdminUsersPage;
