import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import useChallengeCreatedSubscription from '../hooks/useChallengeCreatedSubscription';
import { useChallengeCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { ChallengeCardFragment } from '../../../../core/apollo/generated/graphql-schema';

export interface ChallengesCardContainerEntities {
  challenges: ChallengeCardFragment[];
}

export interface ChallengesCardContainerActions {}

export interface ChallengesCardContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengesCardContainerProps
  extends ContainerChildProps<
    ChallengesCardContainerEntities,
    ChallengesCardContainerActions,
    ChallengesCardContainerState
  > {
  spaceNameId: string;
}

export const ChallengesCardContainer: FC<ChallengesCardContainerProps> = ({ spaceNameId, children }) => {
  const { data, error, loading, subscribeToMore } = useChallengeCardsQuery({
    variables: { spaceId: spaceNameId },
    skip: !spaceNameId,
  });

  useChallengeCreatedSubscription(data, data => data?.space, subscribeToMore);

  const challenges = data?.space?.challenges ?? [];

  return <>{children({ challenges }, { loading, error }, {})}</>;
};

export default ChallengesCardContainer;
