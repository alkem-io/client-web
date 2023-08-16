import { FC } from 'react';
import {
  useChallengeInnovationFlowQuery,
  useEventOnChallengeMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { Lifecycle } from '../../../../core/apollo/generated/graphql-schema';
import {
  ComponentOrChildrenFn,
  renderComponentOrChildrenFn,
} from '../../../../common/utils/containers/ComponentOrChildrenFn';

interface ChallengeLifecycleContainerProvided {
  lifecycle: Lifecycle | undefined;
  loading: boolean;
  onSetNewState: (innovationFlowID: string, newState: string) => void;
}

type ChallengeLifecycleContainerProps = ComponentOrChildrenFn<ChallengeLifecycleContainerProvided> & {
  spaceNameId: string;
  challengeNameId: string;
};

const ChallengeLifecycleContainer: FC<ChallengeLifecycleContainerProps> = ({
  spaceNameId,
  challengeNameId,
  ...rendered
}) => {
  const { data, loading } = useChallengeInnovationFlowQuery({
    variables: { spaceId: spaceNameId, challengeId: challengeNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const lifecycle = data?.space.challenge?.innovationFlow?.lifecycle;

  const [updateChallengeLifecycle] = useEventOnChallengeMutation({});

  const setNextState = (innovationFlowID: string, nextState: string) =>
    updateChallengeLifecycle({
      variables: {
        input: {
          innovationFlowID,
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

export default ChallengeLifecycleContainer;
