import React, { FC, useContext } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { AdminPage } from '../components/Admin/AdminPage';
import App from '../components/App';
import { ChallengePage } from '../components/ChallengePage';
import { Layout } from '../components/Layout';
import Loading from '../components/Loading';
import { appContext } from '../context/AppProvider';
import { configContext } from '../context/ConfigProvider';
import { FourOuFour } from '../pages/FourOuFour';
import UserProfile from '../components/UserProfile/UserProfile';

const AppContainer: FC = () => {
  const appCtx = useContext(appContext);
  const configCtx = useContext(configContext);
  if (appCtx.loading || configCtx.loading) return <Loading />;

  return (
    <Router>
      <Switch>
        <Route exact path="/404" component={FourOuFour} />
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
              <Route exact path="/me">
                <UserProfile />
              </Route>
              <Route path="*">
                <Redirect to="/404" />
              </Route>
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
};

export default AppContainer;
