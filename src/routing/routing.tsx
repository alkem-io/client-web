import React, { FC } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { EcoverseProvider } from '../context/EcoverseProvider';
import { FourOuFour } from '../pages';
import AboutPage from '../pages/About';
import HomePage from '../pages/home/Home';
import { AuthorizationCredential } from '../models/graphql-schema';
import { AdminRoute } from './admin/admin.route';
import { IdentityRoute } from './identity/identity';
import { EcoverseRoute } from './ecoverse.route';
import { Messages } from './messages';
import { Restricted } from './restricted';
import RestrictedRoute from './route.extensions';
import { SearchRoute } from './search.route';
import OrganizationRoute from './organization.route';
import { UserRoute } from './user/user';
import ProfilePage from '../pages/ProfilePage';
import { OrganizationProvider } from '../context/OrganizationProvider';
import { nameOfUrl } from './url-params';
import { useTranslation } from 'react-i18next';

export const Routing: FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
      <RestrictedRoute
        path="/admin"
        requiredCredentials={[
          AuthorizationCredential.GlobalAdmin,
          AuthorizationCredential.EcoverseAdmin,
          AuthorizationCredential.OrganizationAdmin,
          AuthorizationCredential.ChallengeAdmin,
          AuthorizationCredential.GlobalAdminCommunity,
        ]}
        strict={false}
      >
        <AdminRoute />
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
      <Route path={`/organization/:${nameOfUrl.organizationNameId}`}>
        <OrganizationProvider>
          <OrganizationRoute paths={[]} />
        </OrganizationProvider>
      </Route>
      <RestrictedRoute exact path="/messages">
        <Messages />
      </RestrictedRoute>
      <Route exact path="/about">
        <AboutPage />
      </Route>
      <Route exact path="/profile">
        <ProfilePage />
      </Route>
      <Route exact path="/restricted">
        <Restricted />
      </Route>
      <Route exact path="/">
        <HomePage />
      </Route>
      <Route path={`/:${nameOfUrl.ecoverseNameId}`}>
        <EcoverseProvider>
          <EcoverseRoute paths={[{ value: '/', name: t('common.ecoverses'), real: true }]} />
        </EcoverseProvider>
      </Route>
      <Route path="*">
        <FourOuFour />
      </Route>
    </Switch>
  );
};
