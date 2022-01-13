import { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import { useChallengeCardQuery } from '../../hooks/generated/graphql';
import { ChallengeCardProps } from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';

export interface ChallengeCardContainerEntities {
  challenge?: ChallengeCardProps['challenge'];
}

export interface ChallengeCardContainerActions {}

export interface ChallengeCardContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeCardContainerProps
  extends ContainerProps<ChallengeCardContainerEntities, ChallengeCardContainerActions, ChallengeCardContainerState> {
  ecoverseNameId: string;
  challengeNameId: string;
}

export const ChallengeCardContainer: FC<ChallengeCardContainerProps> = ({
  children,
  ecoverseNameId,
  challengeNameId,
}) => {
  const { data, loading, error } = useChallengeCardQuery({
    variables: {
      ecoverseId: ecoverseNameId,
      challengeId: challengeNameId,
    },
    skip: !ecoverseNameId || !challengeNameId,
  });
  const challenge = data?.ecoverse.challenge as ChallengeCardProps['challenge'];

  return <>{children({ challenge }, { loading, error }, {})}</>;
};
