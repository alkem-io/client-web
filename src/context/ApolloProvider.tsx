import React, { FC } from 'react';
import { useGraphQLClient } from '../hooks';
import { ApolloProvider } from '@apollo/client';

interface Props {
  apiUrl: string;
  subscriptionsUrl: string;
}

const AlkemioApolloProvider: FC<Props> = ({ children, apiUrl, subscriptionsUrl }) => {
  const client = useGraphQLClient(apiUrl, subscriptionsUrl);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default AlkemioApolloProvider;
