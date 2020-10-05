import { ApolloProvider } from '@apollo/client';
import React from 'react';
import App from '../components/App';
import AppNoAuth from '../components/AppNoAuth';
import { useClientConfig } from '../hooks/useClientConfig';

export interface IAppContainerProps {
  graphQLEndpoint: string;
  enableAuthentication: boolean;
}

const AppContainer: React.FC<IAppContainerProps> = (props): JSX.Element => {
  const { graphQLEndpoint, enableAuthentication } = props;
  const client = useClientConfig(graphQLEndpoint, enableAuthentication);
  return <ApolloProvider client={client}>{enableAuthentication ? <App /> : <AppNoAuth />}</ApolloProvider>;
};

export default AppContainer;
