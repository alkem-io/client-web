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
  spaceNameId: string;
  challengeNameId: string;
}

export const OpportunityCardsContainer: FC<OpportunityCardsContainerProps> = ({
  spaceNameId,
  challengeNameId,
  children,
}) => {
  const {
    data: _challenge,
    loading,
    subscribeToMore,
  } = useOpportunityCardsQuery({
    variables: {
      spaceId: spaceNameId,
      challengeId: challengeNameId,
    },
    errorPolicy: 'all',
  });

  useOpportunityCreatedSubscription(_challenge, data => data?.space?.challenge, subscribeToMore);

  return (
    <>
      {children(
        {
          opportunities: _challenge?.space.challenge.opportunities ?? [],
        },
        { loading },
        {}
      )}
    </>
  );
};

export default OpportunityCardsContainer;
