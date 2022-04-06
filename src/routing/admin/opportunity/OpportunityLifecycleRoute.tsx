import React, { FC } from 'react';
import EditLifecycle from '../../../components/Admin/EditLifecycle';
import { useEventOnOpportunityMutation, useOpportunityLifecycleQuery } from '../../../hooks/generated/graphql';
import Loading from '../../../components/core/Loading/Loading';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';

const OpportunityLifecycleRoute: FC = () => {
  const handleError = useApolloErrorHandler();

  const { hubNameId = '', opportunityNameId = '' } = useUrlParams();

  const { data, loading } = useOpportunityLifecycleQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const lifecycle = data?.hub.opportunity?.lifecycle;
  const opportunityId = data?.hub.opportunity?.id || '';

  const [updateOpportunityLifecycle] = useEventOnOpportunityMutation({
    onError: handleError,
  });

  const setNextState = (id: string, nextState: string) =>
    updateOpportunityLifecycle({
      variables: {
        input: {
          ID: id,
          eventName: nextState,
        },
      },
    });

  if (loading) {
    return <Loading text="Loading" />;
  }

  return <EditLifecycle lifecycle={lifecycle} id={opportunityId} onSetNewState={setNextState} />;
};
export default OpportunityLifecycleRoute;
