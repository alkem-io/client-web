import { FC } from 'react';
import {
  useInnovationFlowQuery,
  useUpdateInnovationFlowStateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ComponentOrChildrenFn, renderComponentOrChildrenFn } from '../../../../core/container/ComponentOrChildrenFn';
import { InnovationFlowState } from '../InnovationFlow';

interface InnovationFlowContainerProvided {
  states: InnovationFlowState[] | undefined;
  currentState: string | undefined;
  loading: boolean;
  onSetNewState: (nextState: string) => Promise<unknown> | undefined;
  changingState: boolean;
}

type InnovationFlowContainerProps = ComponentOrChildrenFn<InnovationFlowContainerProvided> & {
  innovationFlowId: string | undefined;
};

const InnovationFlowContainer: FC<InnovationFlowContainerProps> = ({ innovationFlowId, ...rendered }) => {
  const { data, loading } = useInnovationFlowQuery({
    variables: { innovationFlowId: innovationFlowId! },
    fetchPolicy: 'cache-and-network', // TODO: see if this is required
    nextFetchPolicy: 'cache-first',
    skip: !innovationFlowId,
  });

  const innovationFlow = data?.lookup.innovationFlow;
  const states = innovationFlow?.states;
  const currentState = innovationFlow?.currentState.displayName;

  const [updateInnovationFlowState, { loading: changingState }] = useUpdateInnovationFlowStateMutation({});

  const onSetNewState = (selectedState: string) => {
    if (innovationFlowId) {
      return updateInnovationFlowState({
        variables: {
          innovationFlowId,
          selectedState
        },
      });
    }
  }

  return renderComponentOrChildrenFn(rendered, {
    states,
    currentState,
    loading,
    onSetNewState,
    changingState,
  });
};

export default InnovationFlowContainer;
