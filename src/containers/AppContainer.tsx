import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { useClientConfig } from '../hooks/useClientConfig';
import App from '../components/App/App';

export interface IAppContainerProps {
  graphQLEndpoint: string;
}

const AppContainer: React.FC<IAppContainerProps> = (props): JSX.Element => {
  const { graphQLEndpoint } = props;
  const client = useClientConfig(graphQLEndpoint);

  return (
    <ApolloProvider client={client}>
      <App />;
    </ApolloProvider>
  );
};

export default AppContainer;
