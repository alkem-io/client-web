import React, { FC } from 'react';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { ApolloProvider } from '@apollo/client';
import { FEATURE_SUBSCRIPTIONS } from '../../../domain/platform/config/features.constants';
import { useGraphQLClient } from '../hooks/useGraphQLClient';

interface Props {
  apiUrl: string;
}

const AlkemioApolloProvider: FC<Props> = ({ children, apiUrl }) => {
  const { isFeatureEnabled } = useConfig();
  const client = useGraphQLClient(apiUrl, isFeatureEnabled(FEATURE_SUBSCRIPTIONS));

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default AlkemioApolloProvider;
