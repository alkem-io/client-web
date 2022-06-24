import React, { FC } from 'react';
import EditMembers from '../../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../../containers/organization/OrganizationMembers';
import { useOrganization } from '../../../../hooks';
import { AuthorizationCredential } from '../../../../models/graphql-schema';
import { useOrganizationMembersQuery } from '../../../../hooks/generated/graphql';
import Loading from '../../../../components/core/Loading/Loading';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationOwnerAuthorizationView: FC = () => {
  const { organizationId } = useOrganization();
  const { t } = useTranslation();

  const { data, loading } = useOrganizationMembersQuery({ variables: { id: organizationId } });
  const orgMembers = data?.organization.members;

  if (loading) {
    return <Loading />;
  }

  return (
    <DashboardGenericSection
      headerText={t(
        `common.enums.authorization-credentials.${AuthorizationCredential.OrganizationOwner}.name` as const
      )}
    >
      <OrganizationMembers
        entities={{
          organizationId,
          parentMembers: orgMembers,
          credential: AuthorizationCredential.OrganizationOwner,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingOwner}
            removingMember={state.removingOwner}
            executor={entities.currentMember}
            onAdd={actions.handleAssignOwner}
            onRemove={actions.handleRemoveOwner}
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
            onSearchTermChange={actions.setSearchTerm}
          />
        )}
      </OrganizationMembers>
    </DashboardGenericSection>
  );
};

export default OrganizationOwnerAuthorizationView;
