import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useChallengeOpportunityCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { CalloutDisplayLocation, OpportunityCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import useOpportunityCreatedSubscription from '../hooks/useOpportunityCreatedSubscription';
import useCallouts, { UseCalloutsProvided } from '../../../collaboration/callout/useCallouts/useCallouts';

export interface OpportunityCardsContainerEntities {
  opportunities: OpportunityCardFragment[];
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
  } = useChallengeOpportunityCardsQuery({
    variables: {
      challengeId: challengeId!,
    },
    skip: !challengeId,
    errorPolicy: 'all',
  });

  useOpportunityCreatedSubscription(_challenge, data => data?.lookup.challenge, subscribeToMore);

  const callouts = useCallouts({
    journeyId: _challenge?.lookup.challenge?.id,
    journeyTypeName: 'challenge',
    displayLocations: [CalloutDisplayLocation.OpportunitiesLeft, CalloutDisplayLocation.OpportunitiesRight],
  });

  return (
    <>
      {children(
        {
          opportunities: _challenge?.lookup.challenge?.opportunities ?? [],
          callouts,
        },
        { loading },
        {}
      )}
    </>
  );
};

export default ChallengeOpportunitiesContainer;
