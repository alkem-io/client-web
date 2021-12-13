import React, { FC } from 'react';
import { ReactNode } from 'react-markdown';
import { useEcoverseNameQuery } from '../../hooks/generated/graphql';

export interface EcoverseNameResolverProps {
  ecoverseId: string;
  children: ({ displayName: string, loading: boolean }) => ReactNode;
}

const EcoverseNameResolver: FC<EcoverseNameResolverProps> = ({ ecoverseId, children }) => {
  const { data, loading } = useEcoverseNameQuery({
    variables: {
      ecoverseId,
    },
  });
  return <>{children({ displayName: data?.ecoverse.displayName, loading })}</>;
};
export default EcoverseNameResolver;
