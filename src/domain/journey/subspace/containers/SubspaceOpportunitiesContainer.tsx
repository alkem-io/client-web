import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { ContainerChildProps } from '../../../../core/container/container';
import { CalloutGroupName, SubspaceCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import useOpportunityCreatedSubscription from '../hooks/useOpportunityCreatedSubscription';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';
import { useSubspaceCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';

export interface OpportunityCardsContainerEntities {
  subsubspaces: SubspaceCardFragment[];
  callouts: UseCalloutsProvided;
}

export interface OpportunityCardsContainerActions {}

export interface OpportunityCardsContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeOpportunitiesContainerProps
  extends ContainerChildProps<
    OpportunityCardsContainerEntities,
    OpportunityCardsContainerActions,
    OpportunityCardsContainerState
  > {
  challengeId: string | undefined;
}

export const ChallengeOpportunitiesContainer: FC<ChallengeOpportunitiesContainerProps> = ({
  challengeId,
  children,
}) => {
  const {
    data: _challenge,
    loading,
    subscribeToMore,
  } = useSubspaceCardsQuery({
    variables: {
      spaceId: challengeId!,
    },
    skip: !challengeId,
    errorPolicy: 'all',
  });

  useOpportunityCreatedSubscription(_challenge, data => data?.space, subscribeToMore);

  const callouts = useCallouts({
    journeyId: _challenge?.space?.id,
    journeyTypeName: 'subspace',
    groupNames: [CalloutGroupName.Subspaces_1, CalloutGroupName.Subspaces_2],
  });

  return (
    <>
      {children(
        {
          subsubspaces: _challenge?.space?.subspaces ?? [],
          callouts,
        },
        { loading },
        {}
      )}
    </>
  );
};

export default ChallengeOpportunitiesContainer;
