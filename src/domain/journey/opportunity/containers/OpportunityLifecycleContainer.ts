import { FC } from 'react';
import {
  useOpportunityInnovationFlowQuery,
  useUpdateInnovationFlowStateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ComponentOrChildrenFn, renderComponentOrChildrenFn } from '../../../../core/container/ComponentOrChildrenFn';
import { InnovationFlowState } from '../../../../core/apollo/generated/graphql-schema';

interface OpportunityLifecycleContainerProvided {
  states: InnovationFlowState[] | undefined;
  loading: boolean;
  onSetNewState: (innovationFlowId: string, nextState: string) => void;
}

type OpportunityLifecycleContainerProps = ComponentOrChildrenFn<OpportunityLifecycleContainerProvided> & {
  opportunityId: string;
};

const OpportunityLifecycleContainer: FC<OpportunityLifecycleContainerProps> = ({ opportunityId, ...rendered }) => {
  const { data, loading } = useOpportunityInnovationFlowQuery({
    variables: { opportunityId: opportunityId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const innovationFlow = data?.lookup.opportunity?.innovationFlow;
  const states = innovationFlow?.states;

  const [updateOpportunityLifecycle] = useUpdateInnovationFlowStateMutation({});

  const setNextState = (innovationFlowID: string, nextState: string) =>
    updateOpportunityLifecycle({
      variables: {
        input: {
          innovationFlowID,
          selectedState: nextState,
        },
      },
    });

  return renderComponentOrChildrenFn(rendered, {
    states,
    loading,
    onSetNewState: setNextState,
  });
};

export default OpportunityLifecycleContainer;
