import { FC } from 'react';
import {
  useChallengeInnovationFlowQuery,
  useUpdateInnovationFlowStateMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { ComponentOrChildrenFn, renderComponentOrChildrenFn } from '../../../../core/container/ComponentOrChildrenFn';
import { InnovationFlowState } from '../../../../core/apollo/generated/graphql-schema';

interface ChallengeLifecycleContainerProvided {
  states: InnovationFlowState[] | undefined;
  loading: boolean;
  onSetNewState: (innovationFlowID: string, newState: string) => void;
}

type ChallengeLifecycleContainerProps = ComponentOrChildrenFn<ChallengeLifecycleContainerProvided> & {
  spaceNameId: string;
  challengeNameId: string;
};

const ChallengeLifecycleContainer: FC<ChallengeLifecycleContainerProps> = ({
  spaceNameId,
  challengeId,
  ...rendered
}) => {
  const { data, loading } = useChallengeInnovationFlowQuery({
    variables: { challengeId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const states = data?.lookup.challenge?.collaboration?.innovationFlow?.states;

  const [updateChallengeLifecycle] = useUpdateInnovationFlowStateMutation({});

  const setNextState = (innovationFlowID: string, nextState: string) =>
    updateChallengeLifecycle({
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

export default ChallengeLifecycleContainer;
