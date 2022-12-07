import React, { FC } from 'react';
import EditMemberUsers from '../../components/Community/EditMembersUsers';
import OrganizationAssociates from '../../../../community/contributor/organization/OrganizationAssociatesContainer/OrganizationAssociatesContainer';
import { useOrganization } from '../../../../community/contributor/organization/hooks/useOrganization';
import { AuthorizationCredential } from '../../../../../core/apollo/generated/graphql-schema';
import DashboardGenericSection from '../../../../shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';

export const OrganizationAssociatesView: FC = () => {
  const { organizationId } = useOrganization();
  const { t } = useTranslation();

  return (
    <DashboardGenericSection headerText={t('common.members')}>
      <OrganizationAssociates
        entities={{
          organizationId,
          credential: AuthorizationCredential.OrganizationAssociate,
        }}
      >
        {(entities, actions, state) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            updating={state.addingUser || state.removingUser}
            executorId={entities.currentMember?.id}
            onAdd={actions.handleAssignAssociate}
            onRemove={actions.handleRemoveAssociate}
            fetchMore={actions.handleLoadMore}
            hasMore={state.hasMoreUsers}
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
            onSearchTermChange={actions.setSearchTerm}
          />
        )}
      </OrganizationAssociates>
    </DashboardGenericSection>
  );
};

export default OrganizationAssociatesView;
