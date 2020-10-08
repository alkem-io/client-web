import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from '../components/App';
import AppNoAuth from '../components/AppNoAuth';
import { useGraphQLClient } from '../hooks/useGraphQLClient';
import { FourOuFour } from '../pages/FourOuFour';

export interface AppContainerProps {
  graphQLEndpoint: string;
  enableAuthentication: boolean;
}

const AppContainer: React.FC<AppContainerProps> = props => {
  const { graphQLEndpoint, enableAuthentication } = props;
  const client = useGraphQLClient(graphQLEndpoint, enableAuthentication);
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route exact path="/">
            {enableAuthentication ? <App /> : <AppNoAuth />}
          </Route>
          <Route path="*">
            <FourOuFour />
          </Route>
        </Switch>
      </Router>
    </ApolloProvider>
  );
};

export default AppContainer;
