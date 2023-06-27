import { FC } from 'react';
import {
  useEventOnOpportunityMutation,
  useOpportunityLifecycleQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Lifecycle } from '../../../../core/apollo/generated/graphql-schema';
import {
  ComponentOrChildrenFn,
  renderComponentOrChildrenFn,
} from '../../../../common/utils/containers/ComponentOrChildrenFn';

interface OpportunityLifecycleContainerProvided {
  lifecycle: Lifecycle | undefined;
  loading: boolean;
  onSetNewState: (opportunityId: string, nextState: string) => void;
}

type OpportunityLifecycleContainerProps = ComponentOrChildrenFn<OpportunityLifecycleContainerProvided> & {
  spaceNameId: string;
  opportunityNameId: string;
};

const OpportunityLifecycleContainer: FC<OpportunityLifecycleContainerProps> = ({
  spaceNameId,
  opportunityNameId,
  ...rendered
}) => {
  const { data, loading } = useOpportunityLifecycleQuery({
    variables: { spaceId: spaceNameId, opportunityId: opportunityNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const lifecycle = data?.space.opportunity?.lifecycle;

  const [updateOpportunityLifecycle] = useEventOnOpportunityMutation({});

  const setNextState = (opportunityId: string, nextState: string) =>
    updateOpportunityLifecycle({
      variables: {
        opportunityId,
        eventName: nextState,
      },
    });

  return renderComponentOrChildrenFn(rendered, {
    lifecycle,
    loading,
    onSetNewState: setNextState,
  });
};

export default OpportunityLifecycleContainer;
