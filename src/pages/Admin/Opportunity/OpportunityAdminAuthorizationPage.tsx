import { Container } from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EditMembers from '../../../components/Admin/Community/EditMembers';
import Loading from '../../../components/core/Loading/Loading';
import OpportunityMembers from '../../../containers/opportunity/OpportunityMembers';
import { useOpportunity, useUpdateNavigation } from '../../../hooks';
import { useOpportunityMembersQuery } from '../../../hooks/generated/graphql';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import OpportunityAuthorizationPageProps from './OpportunityAuthorizationPageProps';

export const OpportunityAdminAuthorizationPage: FC<OpportunityAuthorizationPageProps> = ({ paths }) => {
  const { t } = useTranslation();

  const currentPaths = useMemo(
    () => [
      ...paths,
      {
        value: '',
        name: t(`common.enums.authorization-credentials.${AuthorizationCredential.OrganizationAdmin}.name` as const),
        real: false,
      },
    ],
    [paths]
  );

  useUpdateNavigation({ currentPaths });

  const { ecoverseId, opportunityId } = useOpportunity();

  const { data, loading } = useOpportunityMembersQuery({ variables: { ecoverseId, opportunityId } });
  const opportunityMembers = data?.ecoverse.opportunity.community?.members || [];

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="xl">
      <OpportunityMembers
        entities={{
          opportunityId,
          parentMembers: opportunityMembers,
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
            loadingMembers={state.loading}
            loadingAvailableMembers={state.loading}
          />
        )}
      </OpportunityMembers>
    </Container>
  );
};

export default OpportunityAdminAuthorizationPage;
