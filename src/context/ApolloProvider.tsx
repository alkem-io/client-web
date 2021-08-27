import React, { FC } from 'react';
import { useGraphQLClient } from '../hooks';
import { ApolloProvider } from '@apollo/client';

interface Props {
  apiUrl: string;
}

const AlkemioApolloProvider: FC<Props> = ({ children, apiUrl }) => {
  const client = useGraphQLClient(apiUrl);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
export default AlkemioApolloProvider;
