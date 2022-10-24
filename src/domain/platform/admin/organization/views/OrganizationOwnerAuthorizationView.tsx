import React, { FC } from 'react';
import EditMemberUsers from '../../components/Community/EditMembersUsers';
import OrganizationMembers from '../../../../../containers/organization/OrganizationAssociates';
import { useOrganization } from '../../../../../hooks';
import { AuthorizationCredential } from '../../../../../models/graphql-schema';
import Loading from '../../../../../common/components/core/Loading/Loading';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { useOrganizationAssociatesQuery } from '../../../../../hooks/generated/graphql';

export const OrganizationOwnerAuthorizationView: FC = () => {
  const { organizationId } = useOrganization();
  const { t } = useTranslation();

  const { data, loading } = useOrganizationAssociatesQuery({ variables: { id: organizationId } });
  const orgAssociates = data?.organization.associates;

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
          parentAssociates: orgAssociates,
          credential: AuthorizationCredential.OrganizationOwner,
        }}
      >
        {(entities, actions, state) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            updating={state.addingOwner || state.removingOwner}
            executorId={entities.currentMember?.id}
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
