import React, { FC } from 'react';
import EditLifecycle from '../../../components/Admin/EditLifecycle';
import { useParams } from 'react-router';
import { useEventOnOpportunityMutation, useOpportunityLifecycleQuery } from '../../../generated/graphql';
import Loading from '../../../components/core/Loading';
import { PageProps } from '../../../pages';
import { useApolloErrorHandler } from '../../../hooks/graphql/useApolloErrorHandler';

interface Params {
  ecoverseId: string;
  opportunityId: string;
}

interface Props extends PageProps {}

const OpportunityLifecycleRoute: FC<Props> = ({ paths }) => {
  const handleError = useApolloErrorHandler();

  const { ecoverseId = '', opportunityId: opportunityNameId = '' } = useParams<Params>();

  const { data, loading } = useOpportunityLifecycleQuery({
    variables: { ecoverseId: ecoverseId, opportunityId: opportunityNameId },
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
