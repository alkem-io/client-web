import { useConfig } from '@/domain/platform/config/useConfig';
import { ApolloProvider } from '@apollo/client';
import { FC, PropsWithChildren } from 'react';
import { PlatformFeatureFlagName } from '../generated/graphql-schema';
import { useGraphQLClient } from '../hooks/useGraphQLClient';

interface Props extends PropsWithChildren {
  apiUrl: string;
}

const AlkemioApolloProvider: FC<Props> = ({ children, apiUrl }) => {
  const { isFeatureEnabled } = useConfig();
  const client = useGraphQLClient(apiUrl, isFeatureEnabled(PlatformFeatureFlagName.Subscriptions));

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default AlkemioApolloProvider;
