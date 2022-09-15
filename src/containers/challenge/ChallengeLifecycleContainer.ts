import { FC } from 'react';
import { useChallengeLifecycleQuery, useEventOnChallengeMutation } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { Lifecycle } from '../../models/graphql-schema';
import {
  ComponentOrChildrenFn,
  renderComponentOrChildrenFn,
} from '../../common/utils/containers/ComponentOrChildrenFn';

interface ChallengeLifecycleContainerProvided {
  lifecycle: Lifecycle | undefined;
  loading: boolean;
  onSetNewState: (id: string, newState: string) => void;
}

type ChallengeLifecycleContainerProps = ComponentOrChildrenFn<ChallengeLifecycleContainerProvided> & {
  hubNameId: string;
  challengeNameId: string;
};

const ChallengeLifecycleContainer: FC<ChallengeLifecycleContainerProps> = ({
  hubNameId,
  challengeNameId,
  ...rendered
}) => {
  const handleError = useApolloErrorHandler();

  const { data, loading } = useChallengeLifecycleQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const lifecycle = data?.hub.challenge?.lifecycle;

  const [updateChallengeLifecycle] = useEventOnChallengeMutation({
    onError: handleError,
  });

  const setNextState = (id: string, nextState: string) =>
    updateChallengeLifecycle({
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

export default ChallengeLifecycleContainer;
