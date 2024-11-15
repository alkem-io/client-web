import React, { FC } from 'react';
import EditMemberUsers from '../../components/Community/EditMembersUsers';
import OrganizationAssociatesContainer from '../../../../community/contributor/organization/OrganizationAssociatesContainer/OrganizationAssociatesContainer';
import { useOrganization } from '../../../../community/contributor/organization/hooks/useOrganization';
import { AuthorizationCredential } from '@/core/apollo/generated/graphql-schema';
import Loading from '@/core/ui/loading/Loading';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { useOrganizationAssociatesQuery } from '@/core/apollo/generated/apollo-hooks';

export const OrganizationOwnerAuthorizationView: FC = () => {
  const { organizationId, loading: isLoadingOrganization } = useOrganization();
  const { t } = useTranslation();

  const { data, loading: isLoadingAssociates } = useOrganizationAssociatesQuery({
    variables: { id: organizationId },
    skip: isLoadingOrganization,
  });

  if (isLoadingOrganization || isLoadingAssociates) {
    return <Loading />;
  }

  const orgAssociates = data?.organization.associates;

  return (
    <DashboardGenericSection
      headerText={t(
        `common.enums.authorization-credentials.${AuthorizationCredential.OrganizationOwner}.name` as const
      )}
    >
      <OrganizationAssociatesContainer
        entities={{
          organizationId,
          parentAssociates: orgAssociates,
          credential: AuthorizationCredential.OrganizationOwner,
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
