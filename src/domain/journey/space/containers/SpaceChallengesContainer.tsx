import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import useChallengeCreatedSubscription from '../hooks/useChallengeCreatedSubscription';
import { useSpaceSubspaceCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { CalloutGroupName, SubspaceCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';

export interface ChallengesCardContainerEntities {
  subspaces: SubspaceCardFragment[];
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
  const { data, error, loading, subscribeToMore } = useSpaceSubspaceCardsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  useChallengeCreatedSubscription(data, data => data?.space, subscribeToMore);

  const subspaces = data?.space?.subspaces ?? [];

  const callouts = useCallouts({
    journeyId: spaceId,
    journeyTypeName: 'space',
    groupNames: [CalloutGroupName.Subspaces],
  });

  return <>{children({ subspaces, callouts }, { loading, error }, {})}</>;
};

export default SpaceChallengesContainer;
