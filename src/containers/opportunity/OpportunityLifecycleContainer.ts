import { FC } from 'react';
import { useEventOnOpportunityMutation, useOpportunityLifecycleQuery } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { Lifecycle } from '../../models/graphql-schema';
import { ComponentOrChildrenFn, renderComponentOrChildrenFn } from '../../utils/containers/ComponentOrChildrenFn';

interface OpportunityLifecycleContainerProvided {
  lifecycle: Lifecycle | undefined;
  loading: boolean;
  onSetNewState: (id: string, newState: string) => void;
}

type OpportunityLifecycleContainerProps = ComponentOrChildrenFn<OpportunityLifecycleContainerProvided> & {
  hubNameId: string;
  opportunityNameId: string;
};

const OpportunityLifecycleContainer: FC<OpportunityLifecycleContainerProps> = ({
  hubNameId,
  opportunityNameId,
  ...rendered
}) => {
  const handleError = useApolloErrorHandler();

  const { data, loading } = useOpportunityLifecycleQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const lifecycle = data?.hub.opportunity?.lifecycle;

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

  return renderComponentOrChildrenFn(rendered, {
    lifecycle,
    loading,
    onSetNewState: setNextState,
  });
};

export default OpportunityLifecycleContainer;
