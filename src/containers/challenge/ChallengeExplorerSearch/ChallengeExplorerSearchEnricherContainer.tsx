import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ChallengeExplorerSearchResultFragment } from '../../../models/graphql-schema';
import { useChallengeExplorerSearchEnricherQuery } from '../../../hooks/generated/graphql';
import { ContainerProps } from '../../../models/container';

type EnrichInfo = {
  hubNameId?: string;
  hubDisplayName?: string;
}

type EnrichedChallenge = ChallengeExplorerSearchResultFragment & EnrichInfo;

export interface ChallengeExplorerSearchEnricherContainerEntities {
  challenge: EnrichedChallenge;
}

export interface ChallengeExplorerSearchEnricherContainerActions {}

export interface ChallengeExplorerSearchEnricherContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface ChallengeExplorerSearchEnricherContainerProps
  extends ContainerProps<
    ChallengeExplorerSearchEnricherContainerEntities,
    ChallengeExplorerSearchEnricherContainerActions,
    ChallengeExplorerSearchEnricherContainerState
  > {
  challenge: ChallengeExplorerSearchResultFragment;
}

const ChallengeExplorerSearchEnricherContainer: FC<ChallengeExplorerSearchEnricherContainerProps> = ({ challenge, children }) => {
  const { data, loading, error } = useChallengeExplorerSearchEnricherQuery({
    variables: {
      ecoverseId: challenge.ecoverseID,
    },
  });

  const hub = data?.ecoverse;
  const enrichedChallenge: EnrichedChallenge = {
    ...challenge,
    hubNameId: hub?.nameID,
    hubDisplayName: hub?.displayName
  };

  return (
    <>
      {children(
        { challenge: enrichedChallenge },
        { loading, error },
        {}
      )}
    </>
  );
};
export default ChallengeExplorerSearchEnricherContainer;
