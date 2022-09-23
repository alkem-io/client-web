import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ChallengeExplorerSearchResultFragment } from '../../../../../models/graphql-schema';
import { useChallengeExplorerSearchEnricherQuery } from '../../../../../hooks/generated/graphql';
import { ContainerChildProps } from '../../../../../models/container';
import { useApolloErrorHandler } from '../../../../../hooks';

type EnrichInfo = {
  hubNameId?: string;
  hubDisplayName?: string;
};

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
  extends ContainerChildProps<
    ChallengeExplorerSearchEnricherContainerEntities,
    ChallengeExplorerSearchEnricherContainerActions,
    ChallengeExplorerSearchEnricherContainerState
  > {
  challenge: ChallengeExplorerSearchResultFragment;
}

const ChallengeExplorerSearchEnricherContainer: FC<ChallengeExplorerSearchEnricherContainerProps> = ({
  challenge,
  children,
}) => {
  const handleError = useApolloErrorHandler();
  const { data, loading, error } = useChallengeExplorerSearchEnricherQuery({
    variables: {
      hubId: challenge.hubID,
    },
    onError: handleError,
  });

  const hub = data?.hub;
  const enrichedChallenge: EnrichedChallenge = {
    ...challenge,
    hubNameId: hub?.nameID,
    hubDisplayName: hub?.displayName,
  };

  return <>{children({ challenge: enrichedChallenge }, { loading, error }, {})}</>;
};
export default ChallengeExplorerSearchEnricherContainer;
