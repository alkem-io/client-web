import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import { ChallengeCardProps } from '../../components/composite/entities/Ecoverse/ChallengeCard';
import { FC, useMemo } from 'react';
import { useChallengeCardQuery } from '../../hooks/generated/graphql';
import { useUserContext } from '../../hooks';
import { buildChallengeUrl } from '../../utils/urlBuilders';

export interface ChallengeCardContainerEntities {
  cardProps?: ChallengeCardProps;
}

export interface ChallengeCardContainerActions {}

export interface ChallengeCardContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeCardContainerProps
  extends ContainerProps<
    ChallengeCardContainerEntities,
    ChallengeCardContainerActions,
    ChallengeCardContainerState
    > {
  ecoverseNameId: string;
  challengeNameId: string;
}

export const ChallengeCardContainer: FC<ChallengeCardContainerProps> = ({ children, ecoverseNameId, challengeNameId }) => {
  const { user: userMetadata, loading: userLoading } = useUserContext();

  const { data, loading: challengeLoading, error } = useChallengeCardQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      challengeId: challengeNameId,
    },
    skip: !ecoverseNameId || !challengeNameId,
  });
  const ecoverse = data?.ecoverse;
  const challenge = data?.ecoverse.challenge;

  const cardProps = useMemo(() => {
    if (!challenge) {
      return undefined;
    }

    return {
      id: challenge?.id,
      displayName: challenge?.displayName,
      context: challenge?.context,
      isMember: userMetadata?.ofChallenge(challenge?.id) ?? false,
      activity: challenge?.activity,
      tags: challenge?.tagset?.tags,
      url: (ecoverse && challenge && buildChallengeUrl(ecoverse?.nameID, challenge.nameID)) ?? '',
    } as ChallengeCardProps;
  }, [challenge]);

  const loading = userLoading || challengeLoading;

  return (
    <>
      {children(
        { cardProps },
        { loading, error },
        {},
      )}
    </>
  )
};
