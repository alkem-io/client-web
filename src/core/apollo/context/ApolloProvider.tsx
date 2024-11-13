import React, { FC } from 'react';
import { useConfig } from '@domain/platform/config/useConfig';
import { ApolloProvider } from '@apollo/client';
import { useGraphQLClient } from '../hooks/useGraphQLClient';
import { PlatformFeatureFlagName } from '../generated/graphql-schema';

interface Props {
  apiUrl: string;
}

const AlkemioApolloProvider: FC<Props> = ({ children, apiUrl }) => {
  const { isFeatureEnabled } = useConfig();
  const client = useGraphQLClient(apiUrl, isFeatureEnabled(PlatformFeatureFlagName.Subscriptions));

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default AlkemioApolloProvider;
