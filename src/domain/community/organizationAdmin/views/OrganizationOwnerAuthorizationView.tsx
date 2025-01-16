import React, { FC } from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import OrganizationAssociatesContainer from '@/domain/access/removeMe/OrganizationAssociatesContainer/OrganizationAssociatesContainer';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import DashboardGenericSection from '@/domain/shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationOwnerAuthorizationView: FC = () => {
  const { roleSetId, loading: isLoadingOrganization } = useOrganization();
  const { t } = useTranslation();

  if (isLoadingOrganization) {
    return <Loading />;
  }

  return (
    <DashboardGenericSection headerText={t(`common.roles.${RoleName.Owner}` as const)}>
      <OrganizationAssociatesContainer
        entities={{
          roleSetID: roleSetId,
          role: RoleName.Owner,
        }}
      >
        {({ entities, actions, state }) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            updating={state.updatingRoles}
            executorId={entities.currentMember?.id}
            onAdd={actions.handleAssignOwner}
            onRemove={actions.handleRemoveOwner}
            loadingMembers={state.loadingUsers}
            loadingAvailableMembers={state.loadingUsers}
            onSearchTermChange={actions.setSearchTerm}
          />
        )}
      </OrganizationAssociatesContainer>
    </DashboardGenericSection>
  );
};

export default OrganizationOwnerAuthorizationView;
