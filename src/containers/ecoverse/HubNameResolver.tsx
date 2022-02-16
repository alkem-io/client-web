import React, { FC } from 'react';
import { ReactNode } from 'react-markdown';
import { useEcoverseNameQuery } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';

export interface EcoverseNameResolverProps {
  hubId: string;
  children: ({ displayName: string, loading: boolean }) => ReactNode;
}

const EcoverseNameResolver: FC<EcoverseNameResolverProps> = ({ hubId, children }) => {
  const handleError = useApolloErrorHandler();
  const { data, loading } = useEcoverseNameQuery({
    variables: {
      hubId,
    },
    onError: handleError,
  });
  return <>{children({ displayName: data?.hub.displayName, loading })}</>;
};
export default EcoverseNameResolver;
