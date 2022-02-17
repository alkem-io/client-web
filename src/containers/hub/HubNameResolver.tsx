import React, { FC } from 'react';
import { ReactNode } from 'react-markdown';
import { useHubNameQuery } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';

export interface HubNameResolverProps {
  hubId: string;
  children: ({ displayName: string, loading: boolean }) => ReactNode;
}

const HubNameResolver: FC<HubNameResolverProps> = ({ hubId, children }) => {
  const handleError = useApolloErrorHandler();
  const { data, loading } = useHubNameQuery({
    variables: {
      hubId,
    },
    onError: handleError,
  });
  return <>{children({ displayName: data?.hub.displayName, loading })}</>;
};
export default HubNameResolver;
