import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { AdminPage } from '../components/Admin/AdminPage';
import App from '../components/App';
import { ChallengePage } from '../components/ChallengePage';
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
      <AppProvider enableAuthentication={enableAuthentication}>
        <Router>
          <Switch>
            <Route exact path="/404" component={FourOuFour} />
            {/* <Route path="/admin">
              <AdminLayout>
                <Switch>
                  <Route path="/admin" exact component={AdminPage} />
                  <Route path="/admin/user/:id" children={<AdminPage />} />
                  <Route path="/admin/users" exact component={AdminPage} />
                  <Route path="/*">
                    <Redirect to="/404" />
                  </Route>
                </Switch>
              </AdminLayout>
            </Route> */}
            <Route path="/admin">
              <AdminPage />
            </Route>
            <Route>
              <Layout>
                <Switch>
                  <Route exact path="/">
                    <App />
                  </Route>
                  <Route exact path="/challenge/:id" children={<ChallengePage />} />
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
                    <Redirect to="/404" />
                  </Route>
                </Switch>
              </Layout>
            </Route>
          </Switch>
        </Router>
      </AppProvider>
    </ApolloProvider>
  );
};

export default AppContainer;
