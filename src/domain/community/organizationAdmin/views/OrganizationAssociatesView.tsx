import React, { FC } from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import DashboardGenericSection from '@/domain/shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAdmin from '@/domain/access/RoleSet/RoleSetAdmin/useRoleSetAdmin';
import { useUserContext } from '../../user';

export const OrganizationAssociatesView: FC = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const { roleSetId } = useOrganization();
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const {
    usersByRole,
    assignRoleToUser,
    removeRoleFromUser,
    availableUsersForRole,
    loading: loadingRoleSet,
    updating,
  } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: [RoleName.Associate],
    contributorTypes: ['user'],
    availableUsersForRoleSearch: {
      enabled: true,
      mode: 'platform', // Look in the entire platform, AssociateRole doesn't require an EntryRole
      role: RoleName.Associate,
      filter: searchTerm,
    },
  });

  const { users: availableAssociates, fetchMore, hasMore, loading: searchingUsers } = availableUsersForRole!;

  return (
    <DashboardGenericSection headerText={t('common.members')}>
      <EditMemberUsers
        members={usersByRole[RoleName.Associate] ?? []}
        availableMembers={availableAssociates ?? []}
        updating={updating}
        executorId={user?.user?.id}
        onAdd={userId => assignRoleToUser(userId, RoleName.Associate)}
        onRemove={userId => removeRoleFromUser(userId, RoleName.Associate)}
        fetchMore={fetchMore}
        hasMore={hasMore}
        loadingMembers={loadingRoleSet}
        loadingAvailableMembers={searchingUsers}
        onSearchTermChange={setSearchTerm}
      />
    </DashboardGenericSection>
  );
};

export default OrganizationAssociatesView;
