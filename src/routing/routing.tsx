import React, { FC } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { EcoverseProvider } from '../context/EcoverseProvider';
import { FourOuFour } from '../pages';
import AboutPage from '../pages/About';
import HomePage from '../pages/home/Home';
import { AuthorizationCredential } from '../models/graphql-schema';
import { Admin } from './admin/admin';
import { IdentityRoute } from './identity/identity';
import { EcoverseRoute } from './ecoverse.route';
import { Messages } from './messages';
import { Restricted } from './restricted';
import RestrictedRoute from './route.extensions';
import { SearchRoute } from './search.route';
import OrganisationRoute from './organisation.route';
import { OrganisationProvider } from '../context/OrganisationProvider';
import { UserRoute } from './user/user';
import { nameOfUrl } from './ulr-params';

export const Routing: FC = () => {
  const { pathname } = useLocation();

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
      <RestrictedRoute
        path="/admin"
        requiredCredentials={[
          AuthorizationCredential.GlobalAdmin,
          AuthorizationCredential.EcoverseAdmin,
          AuthorizationCredential.OrganisationAdmin,
          AuthorizationCredential.ChallengeAdmin,
          AuthorizationCredential.GlobalAdminCommunity,
        ]}
        strict={false}
      >
        <Admin />
      </RestrictedRoute>
      <Route path="/identity">
        <IdentityRoute />
      </Route>
      <RestrictedRoute path="/search">
        <SearchRoute />
      </RestrictedRoute>
      <RestrictedRoute path="/user">
        <UserRoute />
      </RestrictedRoute>
      <Route path={`/organization/:${nameOfUrl.opportunityId}`}>
        <OrganisationProvider>
          <OrganisationRoute paths={[]} />
        </OrganisationProvider>
      </Route>
      <RestrictedRoute exact path="/messages">
        <Messages />
      </RestrictedRoute>
      <Route exact path="/about">
        <AboutPage />
      </Route>
      <Route exact path="/restricted">
        <Restricted />
      </Route>
      <Route exact path="/">
        <HomePage />
      </Route>
      <Route path={`/:${nameOfUrl.ecoverseId}`}>
        <EcoverseProvider>
          <EcoverseRoute paths={[{ value: '/', name: 'ecoverses', real: true }]} />
        </EcoverseProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
