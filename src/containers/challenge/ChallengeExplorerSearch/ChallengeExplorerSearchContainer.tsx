import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../../models/container';
import { useChallengeExplorerSearchQuery } from '../../../hooks/generated/graphql';
import { ChallengeExplorerSearchResultFragment } from '../../../models/graphql-schema';

export interface ChallengeSearchResultContainerEntities {
  challenges: ChallengeExplorerSearchResultFragment[];
}

export interface ChallengeSearchResultContainerActions {}

export interface ChallengeSearchResultContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeSearchResultContainerProps
  extends ContainerProps<
    ChallengeSearchResultContainerEntities,
    ChallengeSearchResultContainerActions,
    ChallengeSearchResultContainerState
  > {
  terms: string[];
}

const ChallengeExplorerSearchContainer: FC<ChallengeSearchResultContainerProps> = ({ terms, children }) => {
  const { data, loading ,error } = useChallengeExplorerSearchQuery({
    variables: {
      searchData: {
        terms,
        tagsetNames: ['skills', 'keywords'],
        typesFilter: ['challenge'],
      },
    },
    fetchPolicy: 'no-cache',
    skip: !terms.length,
  });

  const challenges = (data?.search ?? [])
    .map(x => x.result as ChallengeExplorerSearchResultFragment);
  
  return (
    <>
      {children(
        { challenges },
        { loading, error },
        {}
      )}
    </>
  );
};
export default ChallengeExplorerSearchContainer;
