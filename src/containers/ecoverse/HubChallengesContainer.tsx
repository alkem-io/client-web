import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useChallengeCardsQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Challenge } from '../../models/graphql-schema';

export interface HubChallengesContainerEntities {
  challenges: Challenge[];
}

export interface HubChallengesContainerActions {}

export interface HubChallengesContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface HubChallengesContainerProps
  extends ContainerProps<HubChallengesContainerEntities, HubChallengesContainerActions, HubChallengesContainerState> {
  entities: {
    hubNameId: string;
  };
}

export const HubChallengesContainer: FC<HubChallengesContainerProps> = ({ entities, children }) => {
  const {
    data: _challenges,
    error: challengesError,
    loading: loadingChallenges,
  } = useChallengeCardsQuery({
    variables: { hubId: entities.hubNameId },
    skip: !entities.hubNameId,
  });

  return (
    <>
      {children(
        {
          challenges: (_challenges?.hub?.challenges || []) as Challenge[],
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
export default HubChallengesContainer;
