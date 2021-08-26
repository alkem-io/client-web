import React, { FC } from 'react';
import EditLifecycle from '../../../components/Admin/EditLifecycle';
import { useParams } from 'react-router';
import { useChallengeLifecycleQuery, useEventOnChallengeMutation } from '../../../hooks/generated/graphql';
import Loading from '../../../components/core/Loading/Loading';
import { PageProps } from '../../../pages';
import { useApolloErrorHandler } from '../../../hooks';

interface Params {
  ecoverseId: string;
  challengeId: string;
}

interface Props extends PageProps {}

export const ChallengeLifecycleRoute: FC<Props> = ({ paths }) => {
  const handleError = useApolloErrorHandler();

  const { ecoverseId = '', challengeId: challengeNameId = '' } = useParams<Params>();

  const { data, loading } = useChallengeLifecycleQuery({
    variables: { ecoverseId: ecoverseId, challengeId: challengeNameId },
    fetchPolicy: 'cache-and-network',
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
