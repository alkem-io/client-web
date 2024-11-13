import React, { FC } from 'react';
import EditMemberUsers from '../../components/Community/EditMembersUsers';
import OrganizationAssociatesContainer from '../../../../community/contributor/organization/OrganizationAssociatesContainer/OrganizationAssociatesContainer';
import { useOrganization } from '../../../../community/contributor/organization/hooks/useOrganization';
import { AuthorizationCredential } from '@core/apollo/generated/graphql-schema';
import Loading from '@core/ui/loading/Loading';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { useOrganizationAssociatesQuery } from '@core/apollo/generated/apollo-hooks';

export const OrganizationAdminAuthorizationView: FC = () => {
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
        `common.enums.authorization-credentials.${AuthorizationCredential.OrganizationAdmin}.name` as const
      )}
    >
      <OrganizationAssociatesContainer
        entities={{
          organizationId,
          parentAssociates: orgAssociates,
          credential: AuthorizationCredential.OrganizationAdmin,
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
