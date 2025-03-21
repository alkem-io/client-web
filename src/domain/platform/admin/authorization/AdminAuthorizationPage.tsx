import React from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { Box, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AdminSection } from '../layout/toplevel/constants';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { gutters } from '@/core/ui/grid/utils';
import { usePlatformRoleSetQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import useRoleSetManager, { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import { useTranslation } from 'react-i18next';
import EditMemberUsers from '../components/Community/EditMembersUsers';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';

interface AdminAuthorizationPageProps {
  selectedRole?: RoleName;
}

const MANAGED_ROLES = RELEVANT_ROLES.Platform;

const AdminAuthorizationPage = ({ selectedRole }: AdminAuthorizationPageProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const { data, loading: loadingPlatformRoleSet } = usePlatformRoleSetQuery();
  const roleSetId = data?.platform.roleSet.id;

  const {
    usersByRole,
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    loading: loadingRoleSet,
    updating,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: MANAGED_ROLES,
    contributorTypes: [RoleSetContributorType.User],
    fetchContributors: true,
  });

  const availableUsersForRole = useRoleSetAvailableUsers({
    roleSetId: roleSetId,
    skip: !selectedRole,
    mode: 'platform',
    filter: searchTerm,
    usersAlreadyInRole: selectedRole && usersByRole?.[selectedRole] ? usersByRole[selectedRole] : [],
  });

  const { users: availableMembers = [], fetchMore, hasMore } = availableUsersForRole!;

  const loading = loadingPlatformRoleSet || loadingRoleSet;

  return (
    <AdminLayout currentTab={AdminSection.Authorization}>
      {loading && <Loading />}
      {!loading && roleSetId && (
        <TabContext value={selectedRole ?? '_none'}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList sx={{ '.MuiTabs-flexContainer': { gap: gutters() } }}>
              {MANAGED_ROLES.map(tab => (
                <Tab
                  key={tab}
                  value={tab}
                  component={RouterLink}
                  to={`/admin/authorization/roles/${tab}`}
                  label={t(`common.roles.${tab}`)}
                />
              ))}
            </TabList>
          </Box>
          <TabPanel value="_none" />
          {MANAGED_ROLES.map(role => (
            <TabPanel key={role} value={role}>
              {role === selectedRole && (
                <EditMemberUsers
                  members={usersByRole[role] ?? []}
                  availableMembers={availableMembers}
                  onAdd={userId => assignPlatformRoleToUser(userId, role)}
                  onRemove={userId => removePlatformRoleFromUser(userId, role)}
                  updating={updating}
                  loadingMembers={loading}
                  loadingAvailableMembers={loading}
                  onSearchTermChange={setSearchTerm}
                  hasMore={hasMore}
                  fetchMore={fetchMore}
                />
              )}
            </TabPanel>
          ))}
        </TabContext>
      )}
    </AdminLayout>
  );
};

export default AdminAuthorizationPage;
