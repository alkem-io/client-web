import React from 'react';
import EditMemberUsers from '@/domain/platformAdmin/components/Community/EditMembersUsers';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import { useTranslation } from 'react-i18next';
import { ParseKeys } from 'i18next';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';

export const OrganizationAuthorizationRoleAssignementView = ({ role }: { role: RoleName }) => {
  const { t } = useTranslation();

  const { roleSetId } = useOrganizationContext();
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const refetch = async () => {
    await refetchRoleSetAssignment();
    availableUsersForRole.refetch();
  };

  const {
    usersByRole,
    assignRoleToUser,
    removeRoleFromUser,
    loading: loadingRoleSet,
    updating,
    refetchRoleSetAssignment,
  } = useRoleSetManager({
    roleSetId,
    relevantRoles: [role],
    contributorTypes: [RoleSetContributorType.User],
    fetchContributors: true,
    onChange: refetch,
    skip: !roleSetId || !role,
  });

  const availableUsersForRole = useRoleSetAvailableUsers({
    roleSetId: roleSetId,
    mode: 'roleSet',
    role: role,
    filter: searchTerm,
    skip: !roleSetId || !role || loadingRoleSet,
  });

  const { users: availableAssociates, fetchMore, hasMore, loading: searchingUsers } = availableUsersForRole!;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t(`common.roles.${role}` as ParseKeys)} />
      <EditMemberUsers
        members={usersByRole[role] ?? []}
        availableMembers={availableAssociates ?? []}
        updating={updating}
        onAdd={userId => assignRoleToUser(userId, role)}
        onRemove={userId => removeRoleFromUser(userId, role)}
        fetchMore={fetchMore}
        hasMore={hasMore}
        loadingMembers={loadingRoleSet}
        loadingAvailableMembers={searchingUsers}
        onSearchTermChange={setSearchTerm}
      />
    </PageContentBlock>
  );
};

export default OrganizationAuthorizationRoleAssignementView;
