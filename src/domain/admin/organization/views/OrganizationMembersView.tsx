import React, { FC } from 'react';
import EditMemberUsers from '../../../../components/Admin/Community/EditMembersUsers';
import OrganizationMembers from '../../../../containers/organization/OrganizationMembers';
import { useOrganization } from '../../../../hooks';
import { AuthorizationCredential } from '../../../../models/graphql-schema';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationMembersView: FC = () => {
  const { organizationId } = useOrganization();
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('common.members')}>
      <OrganizationMembers
        entities={{
          organizationId,
          credential: AuthorizationCredential.OrganizationMember,
        }}
      >
        {(entities, actions, state) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            addingMember={state.addingUser}
            removingMember={state.removingUser}
            executorId={entities.currentMember?.id}
            onAdd={actions.handleAssignMember}
            onRemove={actions.handleRemoveMember}
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

export default OrganizationMembersView;
