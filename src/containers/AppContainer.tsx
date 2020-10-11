import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from '../components/App';
import AppNoAuth from '../components/AppNoAuth';
import { Challenge } from '../components/Challenge';
import { Layout } from '../components/Layout';
import { AppProvider } from '../context/AppProvider';
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
      <AppProvider>
        <Layout>
          <Router>
            <Switch>
              <Route exact path="/">
                {enableAuthentication ? <App /> : <AppNoAuth />}
              </Route>
              <Route exact path="/challenge/:id" children={<Challenge />} />
              <Route exact path="/connect">
                <div>Connect Page</div>
              </Route>
              <Route exact path="/messages">
                <div>Messages Page</div>
              </Route>
              <Route exact path="/login">
                <div>Login Page</div>
              </Route>
              <Route exact path="/explore">
                <div>Explore Page</div>
              </Route>
              <Route path="*">
                <FourOuFour />
              </Route>
            </Switch>
          </Router>
        </Layout>
      </AppProvider>
    </ApolloProvider>
  );
};

export default AppContainer;
