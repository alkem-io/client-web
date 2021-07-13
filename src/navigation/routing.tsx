import React, { FC } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { EcoverseProvider } from '../context/EcoverseProvider';
import { FourOuFour } from '../pages';
import AboutPage from '../pages/About';
import HomePage from '../pages/home/Home';
import { AuthorizationCredential } from '../types/graphql-schema';
import { Admin } from './admin/admin';
import { AuthRoute } from './auth/auth';
import { EcoverseRoute } from './ecoverse';
import { Messages } from './messages';
import ProfileRoute from './profile';
import { Restricted } from './restricted';
import RestrictedRoute from './route.extensions';
import { Search } from './search';

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
        ]}
        strict={false}
      >
        <Admin />
      </RestrictedRoute>
      <Route path="/auth">
        <AuthRoute />
      </Route>
      <RestrictedRoute path="/search">
        <Search />
      </RestrictedRoute>
      <RestrictedRoute path="/user">
        <div>User Page: Comming Soon!</div>
      </RestrictedRoute>
      <RestrictedRoute path="/organisation">
        <div>Organisation Page: Comming Soon!</div>
      </RestrictedRoute>
      <RestrictedRoute exact path="/messages">
        <Messages />
      </RestrictedRoute>
      <RestrictedRoute path="/profile">
        <ProfileRoute />
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
      <Route path="/:ecoverseId">
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
