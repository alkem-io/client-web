import React, { FC } from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { useTranslation } from 'react-i18next';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';

export const OrganizationAssociatesView: FC = () => {
  const { t } = useTranslation();

  const { roleSetId } = useOrganizationContext();
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const {
    usersByRole,
    assignRoleToUser,
    removeRoleFromUser,
    loading: loadingRoleSet,
    updating,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Associate],
    contributorTypes: [RoleSetContributorType.User],
    fetchContributors: true,
  });

  const availableUsersForRole = useRoleSetAvailableUsers({
    roleSetId: roleSetId,
    mode: 'platform', // Look in the entire platform, AssociateRole doesn't require an EntryRole
    role: RoleName.Associate,
    filter: searchTerm,
    usersAlreadyInRole: usersByRole?.[RoleName.Associate],
  });

  const { users: availableAssociates, fetchMore, hasMore, loading: searchingUsers } = availableUsersForRole!;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('common.members')} />
      <EditMemberUsers
        members={usersByRole[RoleName.Associate] ?? []}
        availableMembers={availableAssociates ?? []}
        updating={updating}
        onAdd={userId => assignRoleToUser(userId, RoleName.Associate)}
        onRemove={userId => removeRoleFromUser(userId, RoleName.Associate)}
        fetchMore={fetchMore}
        hasMore={hasMore}
        loadingMembers={loadingRoleSet}
        loadingAvailableMembers={searchingUsers}
        onSearchTermChange={setSearchTerm}
      />
    </PageContentBlock>
  );
};

export default OrganizationAssociatesView;
