import React, { FC } from 'react';
import EditLifecycle from '../../../components/Admin/EditLifecycle';
import { useEventOnOpportunityMutation, useOpportunityLifecycleQuery } from '../../../hooks/generated/graphql';
import Loading from '../../../components/core/Loading/Loading';
import { PageProps } from '../../../pages';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

const OpportunityLifecycleRoute: FC<Props> = ({ paths }) => {
  const handleError = useApolloErrorHandler();

  const { ecoverseId = '', opportunityId: opportunityNameId = '' } = useUrlParams();

  const { data, loading } = useOpportunityLifecycleQuery({
    variables: { ecoverseId: ecoverseId, opportunityId: opportunityNameId },
    fetchPolicy: 'cache-and-network',
  });

  const lifecycle = data?.ecoverse.opportunity?.lifecycle;
  const opportunityId = data?.ecoverse.opportunity?.id || '';

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

  return <EditLifecycle paths={paths} data={lifecycle} id={opportunityId} onSetNewState={setNextState} />;
};
export default OpportunityLifecycleRoute;
