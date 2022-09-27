import React, { FC, ReactNode } from 'react';
import { useChallengeExplorerHubDataQuery } from '../../../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../../../hooks';

interface Provided {
  displayName?: string;
  tagline?: string;
  hubNameId?: string;
  loading: boolean;
}
export interface ChallengeExplorerHubDataResolverProps {
  hubId: string;
  children: (data: Provided) => ReactNode;
}

const ChallengeExplorerHubDataResolver: FC<ChallengeExplorerHubDataResolverProps> = ({ hubId, children }) => {
  const handleError = useApolloErrorHandler();
  const { data, loading } = useChallengeExplorerHubDataQuery({
    variables: {
      hubId,
    },
    onError: handleError,
  });
  return (
    <>
      {children({
        displayName: data?.hub.displayName,
        tagline: data?.hub.context?.tagline,
        hubNameId: data?.hub.nameID,
        loading,
      })}
    </>
  );
};
export default ChallengeExplorerHubDataResolver;
