import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import useChallengeCreatedSubscription from '../hooks/useChallengeCreatedSubscription';
import { useSpaceChallengeCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { CalloutDisplayLocation, ChallengeCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';

export interface ChallengesCardContainerEntities {
  challenges: ChallengeCardFragment[];
  callouts: UseCalloutsProvided;
}

export interface ChallengesCardContainerActions {}

export interface ChallengesCardContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface SpaceChallengesContainerProps
  extends ContainerChildProps<
    ChallengesCardContainerEntities,
    ChallengesCardContainerActions,
    ChallengesCardContainerState
  > {
  spaceId: string | undefined;
}

export const SpaceChallengesContainer: FC<SpaceChallengesContainerProps> = ({ spaceId, children }) => {
  const { data, error, loading, subscribeToMore } = useSpaceChallengeCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  useChallengeCreatedSubscription(data, data => data?.space, subscribeToMore);

  const challenges = data?.space?.challenges ?? [];

  const callouts = useCallouts({
    journeyId: spaceId,
    journeyTypeName: 'space',
    displayLocations: [CalloutDisplayLocation.ChallengesLeft, CalloutDisplayLocation.ChallengesRight],
  });

  return <>{children({ challenges, callouts }, { loading, error }, {})}</>;
};

export default SpaceChallengesContainer;
