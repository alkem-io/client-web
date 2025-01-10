import React, { FC } from 'react';
import EditMemberUsers from '@/domain/platform/admin/components/Community/EditMembersUsers';
import OrganizationAssociates from '@/domain/access/removeMe/OrganizationAssociatesContainer/OrganizationAssociatesContainer';
import { useOrganization } from '@/domain/community/contributor/organization/hooks/useOrganization';
import DashboardGenericSection from '@/domain/shared/components/DashboardSections/DashboardGenericSection';
import { useTranslation } from 'react-i18next';
import Loading from '@/core/ui/loading/Loading';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

export const OrganizationAssociatesView: FC = () => {
  const { organizationId, loading } = useOrganization();
  const { t } = useTranslation();

  if (loading) {
    return <Loading />;
  }

  return (
    <DashboardGenericSection headerText={t('common.members')}>
      <OrganizationAssociates
        entities={{
          roleSetID: organizationId,
          role: RoleName.Associate,
        }}
      >
        {({ entities, actions, state }) => (
          <EditMemberUsers
            members={entities.allMembers}
            availableMembers={entities.availableMembers}
            updating={state.updatingRoles}
            executorId={entities.currentMember?.id}
            onAdd={actions.handleAssignAssociate}
            onRemove={actions.handleRemoveAssociate}
            fetchMore={actions.fetchMoreUsers}
            hasMore={state.hasMoreUsers}
            loadingMembers={state.loadingUsers}
            loadingAvailableMembers={state.loadingUsers}
            onSearchTermChange={actions.setSearchTerm}
          />
        )}
      </OrganizationAssociates>
    </DashboardGenericSection>
  );
};

export default OrganizationAssociatesView;
