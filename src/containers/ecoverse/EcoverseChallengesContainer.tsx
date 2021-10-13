import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useChallengeCardsQuery } from '../../hooks/generated/graphql';
import { Container } from '../../models/container';
import { Challenge } from '../../models/graphql-schema';

export interface EcoverseChallengesContainerEntities {
  challenges: Challenge[];
}

export interface EcoverseChallengesContainerActions {}

export interface EcoverseChallengesContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface EcoverseChallengesContainerProps
  extends Container<
    EcoverseChallengesContainerEntities,
    EcoverseChallengesContainerActions,
    EcoverseChallengesContainerState
  > {
  entities: {
    ecoverseNameId: string;
  };
}

export const EcoverseChallengesContainer: FC<EcoverseChallengesContainerProps> = ({ entities, children }) => {
  const {
    data: _challenges,
    error: challengesError,
    loading: loadingChallenges,
  } = useChallengeCardsQuery({
    variables: { ecoverseId: entities.ecoverseNameId },
  });

  return (
    <>
      {children(
        {
          challenges: (_challenges?.ecoverse?.challenges || []) as Challenge[],
        },
        {
          loading: loadingChallenges,
          error: challengesError,
        },
        {}
      )}
    </>
  );
};
export default EcoverseChallengesContainer;
