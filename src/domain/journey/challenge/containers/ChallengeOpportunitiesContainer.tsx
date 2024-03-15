import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useChallengeOpportunityCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { CalloutGroupName, OpportunityCardFragment } from '../../../../core/apollo/generated/graphql-schema';
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
  spaceNameId: string;
  challengeNameId: string;
}

export const ChallengeOpportunitiesContainer: FC<ChallengeOpportunitiesContainerProps> = ({
  spaceNameId,
  challengeNameId,
  children,
}) => {
  const {
    data: _challenge,
    loading,
    subscribeToMore,
  } = useChallengeOpportunityCardsQuery({
    variables: {
      spaceId: spaceNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
  });

  useOpportunityCreatedSubscription(_challenge, data => data?.space?.challenge, subscribeToMore);

  const callouts = useCallouts({
    spaceNameId,
    challengeNameId,
    groupNames: [CalloutGroupName.SubspacesLeft, CalloutGroupName.SubspacesRight],
  });

  return (
    <>
      {children(
        {
          opportunities: _challenge?.space.challenge.opportunities ?? [],
          callouts,
        },
        { loading },
        {}
      )}
    </>
  );
};

export default ChallengeOpportunitiesContainer;
