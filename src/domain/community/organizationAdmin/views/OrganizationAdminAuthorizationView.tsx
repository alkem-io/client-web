import React, { FC } from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import OrganizationAssociatesContainer from '@/domain/access/removeMe/OrganizationAssociatesContainer/OrganizationAssociatesContainer';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import Loading from '@/core/ui/loading/Loading';
import DashboardGenericSection from '@/domain/shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { useOrganizationAssociatesQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

export const OrganizationAdminAuthorizationView: FC = () => {
  const { roleSetId, loading: isLoadingOrganization } = useOrganization();
  const { t } = useTranslation();

  const { data, loading: isLoadingAssociates } = useOrganizationAssociatesQuery({
    variables: { roleSetId: roleSetId },
    skip: isLoadingOrganization,
  });

  if (isLoadingOrganization || isLoadingAssociates) {
    return <Loading />;
  }

  const orgAssociates = data?.lookup.roleSet?.associatedUsers || [];

  return (
    <DashboardGenericSection headerText={t(`organization.role.${RoleName.Admin}.name` as const)}>
      <OrganizationAssociatesContainer
        entities={{
          roleSetID: roleSetId,
          existingAssociatedUsers: orgAssociates,
          role: RoleName.Admin,
        }}
      >
        {({ entities, actions, state }) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            updating={state.updatingRoles}
            executorId={entities.currentMember?.id}
            onAdd={actions.handleAssignAdmin}
            onRemove={actions.handleRemoveAdmin}
            fetchMore={actions.fetchMoreUsers}
            hasMore={state.hasMoreUsers}
            loadingMembers={state.loadingUsers}
            loadingAvailableMembers={state.loadingUsers}
            onSearchTermChange={actions.setSearchTerm}
          />
        )}
      </OrganizationAssociatesContainer>
    </DashboardGenericSection>
  );
};

export default OrganizationAdminAuthorizationView;
