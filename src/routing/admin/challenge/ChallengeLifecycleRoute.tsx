import React, { FC } from 'react';
import EditLifecycle from '../../../components/Admin/EditLifecycle';
import { useChallengeLifecycleQuery, useEventOnChallengeMutation } from '../../../hooks/generated/graphql';
import Loading from '../../../components/core/Loading/Loading';
import { PageProps } from '../../../pages';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';

interface Props extends PageProps {}

export const ChallengeLifecycleRoute: FC<Props> = ({ paths }) => {
  const handleError = useApolloErrorHandler();

  const { ecoverseNameId = '', challengeNameId = '' } = useUrlParams();

  const { data, loading } = useChallengeLifecycleQuery({
    variables: { ecoverseId: ecoverseNameId, challengeId: challengeNameId },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const lifecycle = data?.ecoverse.challenge?.lifecycle;
  const challengeId = data?.ecoverse.challenge?.id || '';

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

  if (loading) {
    return <Loading text="Loading" />;
  }

  return <EditLifecycle paths={paths} data={lifecycle} id={challengeId} onSetNewState={setNextState} />;
};
