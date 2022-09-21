import { Container } from '@mui/material';
import React, { FC } from 'react';
import EditMemberUsers from '../../../components/Community/EditMembersUsers';
import OpportunityMembers from '../../../../../../containers/opportunity/OpportunityMembers';
import { useOpportunity } from '../../../../../../hooks';
import { AuthorizationCredential } from '../../../../../../models/graphql-schema';

export const OpportunityAdminAuthorizationView: FC = () => {
  const { opportunityId, opportunity } = useOpportunity();

  return (
    <Container maxWidth="xl">
      <OpportunityMembers
        entities={{
          opportunityId,
          communityId: opportunity?.community?.id,
          credential: AuthorizationCredential.OpportunityAdmin,
        }}
      >
        {(entities, actions, state) => (
          <EditMemberUsers
            title="Opportunity Admins"
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
      </OpportunityMembers>
    </Container>
  );
};

export default OpportunityAdminAuthorizationView;
