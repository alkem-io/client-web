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
import useRoleSetAdmin, { RELEVANT_ROLES } from '@/domain/access/RoleSet/RoleSetAdmin/useRoleSetAdmin';
import { useTranslation } from 'react-i18next';
import { useUserContext } from '@/domain/community/user';
import EditMemberUsers from '../components/Community/EditMembersUsers';

interface AdminAuthorizationPageProps {
  selectedRole?: RoleName;
}

const MANAGED_ROLES = RELEVANT_ROLES.Platform;

const AdminAuthorizationPage = ({ selectedRole }: AdminAuthorizationPageProps) => {
  const { t } = useTranslation();
  const { user: userMetadata } = useUserContext();
  const [seachTerm, setSearchTerm] = React.useState<string>('');
  const currentUser = userMetadata?.user;

  const { data, loading: loadingPlatformRoleSet } = usePlatformRoleSetQuery();
  const roleSetId = data?.platform.roleSet.id;

  const {
    usersByRole,
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    loading: loadingRoleSet,
    availableUsersForRole,
    updating,
  } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: MANAGED_ROLES,
    contributorTypes: [RoleSetContributorType.User],
    availableUsersForRoleSearchParams: {
      enabled: !!selectedRole,
      mode: 'platform',
      filter: seachTerm,
    },
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
                  executorId={currentUser?.id}
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
