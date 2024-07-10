import React, { FC, useMemo, useState } from 'react';
import AdminLayout from '../../../../domain/platform/admin/layout/toplevel/AdminLayout';
import { AdminSection } from '../../../../domain/platform/admin/layout/toplevel/constants';
import useAdminGlobalUserList from '../../../../domain/community/user/adminUsers/useAdminGlobalUserList';
import SimpleSearchableList from '../../../../domain/shared/components/SearchableList/SimpleSearchableList';
import SearchableListLayout from '../../../../domain/shared/components/SearchableList/SearchableListLayout';
import { IconButton } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AuthorizationPrivilegesForUserDialog from './AuthorizationPrivilegesForUserDialog';

const AdminUsersPage: FC = () => {
  const { userList, ...listProps } = useAdminGlobalUserList();

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  const selectedUser = useMemo(() => {
    if (!selectedUserId) {
      return undefined;
    }
    const searchableListItem = userList.find(({ id }) => id === selectedUserId);
    if (!searchableListItem) {
      return undefined;
    }
    return {
      ...searchableListItem,
      profile: {
        displayName: searchableListItem.value,
      },
    } as const;
  }, [userList, selectedUserId]);

  return (
    <AdminLayout currentTab={AdminSection.User}>
      <SearchableListLayout>
        <SimpleSearchableList
          data={userList}
          {...listProps}
          itemActions={({ id }) => (
            <IconButton
              onClick={event => {
                event.stopPropagation();
                event.preventDefault();
                setSelectedUserId(id);
              }}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          )}
        />
      </SearchableListLayout>
      <AuthorizationPrivilegesForUserDialog user={selectedUser} onClose={() => setSelectedUserId(undefined)} />
    </AdminLayout>
  );
};

export default AdminUsersPage;
