import React, { FC } from 'react';
import { useConfig, useGraphQLClient } from '../hooks';
import { ApolloProvider } from '@apollo/client';
import { FEATURE_COMMUNICATIONS } from '../models/constants';

interface Props {
  apiUrl: string;
}

const AlkemioApolloProvider: FC<Props> = ({ children, apiUrl }) => {
  const { isFeatureEnabled } = useConfig();
  const client = useGraphQLClient(apiUrl, isFeatureEnabled(FEATURE_COMMUNICATIONS));
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default AlkemioApolloProvider;
