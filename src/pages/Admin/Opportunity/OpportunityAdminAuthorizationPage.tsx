import { Container } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import OpportunityMembers from '../../../containers/opportunity/OpportunityMembers';
import { useOpportunity, useUpdateNavigation } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import OpportunityAuthorizationPageProps from './OpportunityAuthorizationPageProps';

export const OpportunityAdminAuthorizationPage: FC<OpportunityAuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();

  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: '',
        name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OpportunityAdmin}.name` as const),
        real: false,
      },
    ],
    [paths]
  );

  useUpdateNavigation({ currentPaths });

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
      </OpportunityMembers>
    </Container>
  );
};

export default OpportunityAdminAuthorizationPage;
