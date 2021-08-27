import React, { FC } from 'react';
import { useGraphQLClient } from '../hooks';
import { ApolloProvider } from '@apollo/client';
import { env } from '../types/env';

const graphQLEndpoint = (env && env.REACT_APP_GRAPHQL_ENDPOINT) || '/graphql';

const AlkemioApolloProvider: FC = ({ children }) => {
  const client = useGraphQLClient(graphQLEndpoint);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default AlkemioApolloProvider;
