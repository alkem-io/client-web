import React, { FC } from 'react';
import { ReactNode } from 'react-markdown';
import { useEcoverseNameQuery } from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';

export interface EcoverseNameResolverProps {
  ecoverseId: string;
  children: ({ displayName: string, loading: boolean }) => ReactNode;
}

const EcoverseNameResolver: FC<EcoverseNameResolverProps> = ({ ecoverseId, children }) => {
  const handleError = useApolloErrorHandler();
  const { data, loading } = useEcoverseNameQuery({
    variables: {
      ecoverseId,
    },
    onError: handleError,
  });
  return <>{children({ displayName: data?.ecoverse.displayName, loading })}</>;
};
export default EcoverseNameResolver;
