import React, { FC } from 'react';
import EditMemberUsers from '../../components/Community/EditMembersUsers';
import OrganizationMembers from '../../../../../containers/organization/OrganizationAssociates';
import { useOrganization } from '../../../../../hooks';
import { AuthorizationCredential } from '../../../../../models/graphql-schema';
import Loading from '../../../../../common/components/core/Loading/Loading';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import { useOrganizationAssociatesQuery } from '../../../../../hooks/generated/graphql';

export const OrganizationAdminAuthorizationView: FC = () => {
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
        `common.enums.authorization-credentials.${AuthorizationCredential.OrganizationAdmin}.name` as const
      )}
    >
      <OrganizationMembers
        entities={{
          organizationId,
          parentAssociates: orgAssociates,
          credential: AuthorizationCredential.OrganizationAdmin,
        }}
      >
        {(entities, actions, state) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            updating={state.addingAdmin || state.removingAdmin}
            executorId={entities.currentMember?.id}
            onAdd={actions.handleAssignAdmin}
            onRemove={actions.handleRemoveAdmin}
            fetchMore={actions.handleLoadMore}
            hasMore={state.hasMoreUsers}
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
            onSearchTermChange={actions.setSearchTerm}
          />
        )}
      </OrganizationMembers>
    </DashboardGenericSection>
  );
};

export default OrganizationAdminAuthorizationView;
