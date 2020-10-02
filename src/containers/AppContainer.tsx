import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { useClientConfig } from '../hooks/useClientConfig';
import App from '../components/App';
import AppNoAuth from '../components/AppNoAuth';
import { Message } from '../components/Message';

export interface IAppContainerProps {
  graphQLEndpoint: string;
  enableAuthentication: boolean;
}

const AppContainer: React.FC<IAppContainerProps> = (props): JSX.Element => {
  const { graphQLEndpoint, enableAuthentication } = props;
  const client = useClientConfig(graphQLEndpoint, enableAuthentication);
  console.log('Enable authentication: ', enableAuthentication);
  return (
    <ApolloProvider client={client}>
      {enableAuthentication ? <App /> : <AppNoAuth />}
      <Message />
    </ApolloProvider>
  );
};

export default AppContainer;
