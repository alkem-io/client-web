import React, { FC } from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import { useTranslation } from 'react-i18next';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import useRoleSetAdmin from '@/domain/access/RoleSet/RoleSetAdmin/useRoleSetAdmin';
import { useUserContext } from '../../user';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';

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
    contributorTypes: [RoleSetContributorType.User],
    availableUsersForRoleSearchParams: {
      enabled: true,
      mode: 'platform', // Look in the entire platform, AssociateRole doesn't require an EntryRole
      role: RoleName.Associate,
      filter: searchTerm,
    },
  });

  const { users: availableAssociates, fetchMore, hasMore, loading: searchingUsers } = availableUsersForRole!;

  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('common.members')} />
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
    </PageContentBlock>
  );
};

export default OrganizationAssociatesView;
