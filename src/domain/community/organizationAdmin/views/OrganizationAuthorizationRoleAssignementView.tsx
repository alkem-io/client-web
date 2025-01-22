import React from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import { useTranslation } from 'react-i18next';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '../../user';
import useRoleSetAdmin from '@/domain/access/RoleSet/RoleSetAdmin/useRoleSetAdmin';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';

export const OrganizationAuthorizationRoleAssignementView = ({ role }: { role: RoleName }) => {
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
    relevantRoles: [role],
    contributorTypes: [RoleSetContributorType.User],
    availableUsersForRoleSearchParams: {
      enabled: true,
      mode: 'roleSet',
      role: role,
      filter: searchTerm,
    },
  });

  const { users: availableAssociates, fetchMore, hasMore, loading: searchingUsers } = availableUsersForRole!;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t(`common.roles.${role}`)} />
      <EditMemberUsers
        members={usersByRole[role] ?? []}
        availableMembers={availableAssociates ?? []}
        updating={updating}
        executorId={user?.user?.id}
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
