import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from '../components/App';
import AppNoAuth from '../components/AppNoAuth';
import { Layout } from '../components/Layout';
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
      <Layout>
        <Router>
          <Switch>
            <Route exact path="/">
              {enableAuthentication ? <App /> : <AppNoAuth />}
            </Route>
            <Route exact path="/challenge">
              <div>Challenge Page</div>
            </Route>
            <Route exact path="/connect">
              <div>Connect Page</div>
            </Route>
            <Route exact path="/messages">
              <div>Messages Page</div>
            </Route>
            <Route exact path="/login">
              <div>Login Page</div>
            </Route>
            <Route path="*">
              <FourOuFour />
            </Route>
          </Switch>
        </Router>
      </Layout>
    </ApolloProvider>
  );
};

export default AppContainer;
