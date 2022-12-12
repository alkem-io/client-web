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
  hubNameId: string;
}

export const ChallengesCardContainer: FC<ChallengesCardContainerProps> = ({ hubNameId, children }) => {
  const { data, error, loading, subscribeToMore } = useChallengeCardsQuery({
    variables: { hubId: hubNameId },
    skip: !hubNameId,
  });

  useChallengeCreatedSubscription(data, data => data?.hub, subscribeToMore);

  const challenges = data?.hub?.challenges ?? [];

  return <>{children({ challenges }, { loading, error }, {})}</>;
};

export default ChallengesCardContainer;
