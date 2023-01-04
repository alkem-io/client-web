import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useOpportunityCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '../../../../core/container/container';
import { OpportunityCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import useOpportunityCreatedSubscription from '../hooks/useOpportunityCreatedSubscription';

export interface OpportunityCardsContainerEntities {
  opportunities: OpportunityCardFragment[];
}

export interface OpportunityCardsContainerActions {}

export interface OpportunityCardsContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityCardsContainerProps
  extends ContainerChildProps<
    OpportunityCardsContainerEntities,
    OpportunityCardsContainerActions,
    OpportunityCardsContainerState
  > {
  hubNameId: string;
  challengeNameId: string;
}

export const OpportunityCardsContainer: FC<OpportunityCardsContainerProps> = ({
  hubNameId,
  challengeNameId,
  children,
}) => {
  const {
    data: _challenge,
    loading,
    subscribeToMore,
  } = useOpportunityCardsQuery({
    variables: {
      hubId: hubNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
  });

  useOpportunityCreatedSubscription(_challenge, data => data?.hub?.challenge, subscribeToMore);

  return (
    <>
      {children(
        {
          opportunities: _challenge?.hub.challenge.opportunities ?? [],
        },
        { loading },
        {}
      )}
    </>
  );
};

export default OpportunityCardsContainer;
