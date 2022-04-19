import React, { FC } from 'react';
import EditMembers from '../../../../components/Admin/Community/EditMembers';
import OrganizationMembers from '../../../../containers/organization/OrganizationMembers';
import { useOrganization } from '../../../../hooks';
import { AuthorizationCredential } from '../../../../models/graphql-schema';
import { useOrganizationMembersQuery } from '../../../../hooks/generated/graphql';
import Loading from '../../../../components/core/Loading/Loading';
import DashboardGenericSection from '../../../../components/composite/common/sections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationAdminAuthorizationView: FC = () => {
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
        `common.enums.authorization-credentials.${AuthorizationCredential.OrganizationAdmin}.name` as const
      )}
    >
      <OrganizationMembers
        entities={{
          organizationId,
          parentMembers: orgMembers,
          credential: AuthorizationCredential.OrganizationAdmin,
        }}
      >
        {(entities, actions, state) => (
          <EditMembers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingAdmin}
            removingMember={state.removingAdmin}
            executor={entities.currentMember}
            onAdd={actions.handleAssignAdmin}
            onRemove={actions.handleRemoveAdmin}
            onLoadMore={actions.handleLoadMore}
            lastMembersPage={state.isLastAvailableUserPage}
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
          />
        )}
      </OrganizationMembers>
    </DashboardGenericSection>
  );
};

export default OrganizationAdminAuthorizationView;
